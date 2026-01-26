// Tipos principales de la aplicación AYCE Event

export interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  isActive: boolean;
}

export interface User {
  id: string;
  qrCode: string;
  name: string;
  phone?: string;
  restaurantId: string;
  restaurant?: Restaurant;
  startTime?: string;
  endTime?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  items: string;
  notes?: string;
  orderNumber: number;
  createdAt: string;
}

export enum UserStatus {
  REGISTERED = 'registered',
  ACTIVE = 'active',
  FINISHED = 'finished',
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expires: number;
}

export interface ApiError {
  message: string;
  code?: string;
}

// Configuración del evento
export const EVENT_CONFIG = {
  DURATION_MINUTES: 90, // Duración del AYCE en minutos
  EVENT_NAME: 'AYCE Event',
  EVENT_DATE: '2026-02-15',
};
