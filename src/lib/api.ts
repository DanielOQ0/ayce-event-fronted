// Configuración de la API de Directus
const API_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

// Traducciones de errores comunes de Directus
const ERROR_TRANSLATIONS: Record<string, string> = {
  'Value is required': 'El valor es requerido',
  'Validation failed': 'Error de validación',
  'Invalid credentials': 'Credenciales inválidas',
  'You don\'t have permission': 'No tienes permisos',
  'Token expired': 'La sesión ha expirado',
  'Invalid token': 'Token inválido',
  'Record not found': 'Registro no encontrado',
  'Field validation failed': 'Error de validación del campo',
  'or it does not exist': 'o no existe',
  'or they do not exist': 'o no existen',
  'Queried in root': '',
  'to access': 'para acceder al',
  'to access fields': 'para acceder a los campos',
  'in collection': 'en la colección',
};

const FIELD_TRANSLATIONS: Record<string, string> = {
  'restaurant': 'restaurante',
  'name': 'nombre',
  'email': 'correo electrónico',
  'phone': 'teléfono',
  'qr_code': 'código QR',
  'items': 'items',
  'user': 'usuario',
  'password': 'contraseña',
  'field': 'campo',
  'event_users': 'usuarios del evento',
  'orders': 'órdenes',
  'restaurants': 'restaurantes',
};

function translateError(message: string): string {
  let translated = message;
  
  // Traducir errores comunes
  for (const [en, es] of Object.entries(ERROR_TRANSLATIONS)) {
    translated = translated.replace(new RegExp(en, 'gi'), es);
  }
  
  // Traducir nombres de campos y colecciones
  for (const [en, es] of Object.entries(FIELD_TRANSLATIONS)) {
    const regex = new RegExp(`"${en}"`, 'gi');
    translated = translated.replace(regex, `"${es}"`);
  }
  
  // Patrones específicos
  translated = translated.replace(/Validation failed for field/gi, 'Error de validación en el campo');
  translated = translated.replace(/for field/gi, 'en el campo');
  
  // Limpiar espacios dobles
  translated = translated.replace(/\s+/g, ' ').trim();
  
  return translated;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de conexión' }));
    const errorMessage = error.errors?.[0]?.message || error.message || 'Error desconocido';
    throw new Error(translateError(errorMessage));
  }

  // Manejar respuestas vacías (204 No Content)
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    const data = JSON.parse(text);
    return data.data || data;
  } catch {
    return {} as T;
  }
}

// Autenticación
export const authApi = {
  login: async (email: string, password: string) => {
    return request<{ access_token: string; refresh_token: string; expires: number }>(
      '/auth/login',
      {
        method: 'POST',
        body: { email, password },
      }
    );
  },

  refresh: async (refreshToken: string) => {
    return request<{ access_token: string; refresh_token: string; expires: number }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: { refresh_token: refreshToken },
      }
    );
  },

  logout: async (refreshToken: string) => {
    return request('/auth/logout', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    });
  },

  me: async (token: string) => {
    return request<{ id: string; email: string; first_name: string; restaurant?: string }>(
      '/users/me?fields=id,email,first_name,restaurant', 
      { token }
    );
  },
};

// Usuarios (clientes del evento)
export const usersApi = {
  getByQRCode: async (qrCode: string, token?: string) => {
    return request<{
      id: string;
      qr_code: string;
      name: string;
      phone: string;
      restaurant: string | { id: string; name: string };
      start_time: string | null;
      end_time: string | null;
      status: string;
    }[]>(`/items/event_users?filter[qr_code][_eq]=${encodeURIComponent(qrCode)}&fields=id,qr_code,name,phone,restaurant.id,restaurant.name,start_time,end_time,status`, { token });
  },

  create: async (
    data: {
      qr_code: string;
      name: string;
      phone?: string;
      restaurant?: string;
    },
    token: string
  ) => {
    return request<{ id: string }>('/items/event_users', {
      method: 'POST',
      body: data,
      token,
    });
  },

  update: async (id: string, data: Partial<{ start_time: string; end_time: string; status: string }>, token: string) => {
    return request(`/items/event_users/${id}`, {
      method: 'PATCH',
      body: data,
      token,
    });
  },

  startTimer: async (id: string, durationMinutes: number, token: string) => {
    // Redondear al segundo completo (sin milisegundos)
    const now = new Date();
    now.setMilliseconds(0);
    
    const startTime = now.toISOString();
    const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();
    
    return request(`/items/event_users/${id}`, {
      method: 'PATCH',
      body: {
        start_time: startTime,
        end_time: endTime,
        status: 'active',
      },
      token,
    });
  },
};

// Órdenes
export const ordersApi = {
  getByUserId: async (userId: string, token: string) => {
    return request<{
      id: string;
      user: string;
      items: string;
      notes: string;
      order_number: number;
      date_created: string;
    }[]>(`/items/orders?filter[user][_eq]=${userId}&sort=-date_created`, { token });
  },

  create: async (
    data: {
      user: string;
      items: string;
      notes?: string;
      order_number: number;
    },
    token: string
  ) => {
    return request<{ id: string }>('/items/orders', {
      method: 'POST',
      body: data,
      token,
    });
  },

  getCountByUser: async (userId: string, token: string) => {
    const orders = await request<{ id: string }[]>(
      `/items/orders?filter[user][_eq]=${userId}&aggregate[count]=id`,
      { token }
    );
    return orders.length;
  },
};

// Restaurantes
export const restaurantsApi = {
  getAll: async (token: string) => {
    return request<{
      id: string;
      name: string;
      logo: string;
      description: string;
      is_active: boolean;
    }[]>('/items/restaurants?filter[is_active][_eq]=true', { token });
  },

  getById: async (id: string, token?: string) => {
    return request<{
      id: string;
      name: string;
      logo: string;
      description: string;
    }>(`/items/restaurants/${id}`, { token });
  },
};

export { API_URL };
