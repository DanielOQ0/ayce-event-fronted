# Configuración de Directus para NOMBRE DEL EVENTO

## 1. Colecciones a Crear

### 1.1 Colección: `restaurants`

| Campo | Tipo | Configuración |
|-------|------|---------------|
| id | UUID | PK, Auto-generado |
| name | String | Requerido, max 100 |
| logo | Image | Opcional |
| description | Text | Opcional |
| is_active | Boolean | Default: true |

### 1.2 Colección: `event_users`

| Campo | Tipo | Configuración |
|-------|------|---------------|
| id | UUID | PK, Auto-generado |
| qr_code | String | Requerido, Único, Indexado |
| name | String | Requerido, max 100 |
| phone | String | Opcional |
| restaurant | M2O → restaurants | Requerido |
| start_time | DateTime | Nullable |
| end_time | DateTime | Nullable |
| status | String (Dropdown) | Values: `registered`, `active`, `finished`. Default: `registered` |
| date_created | DateTime | Auto |
| date_updated | DateTime | Auto |

### 1.3 Colección: `orders`

| Campo | Tipo | Configuración |
|-------|------|---------------|
| id | UUID | PK, Auto-generado |
| user | M2O → event_users | Requerido |
| items | Text | Requerido |
| notes | Text | Opcional |
| order_number | Integer | Requerido |
| date_created | DateTime | Auto |

---

## 2. Crear Rol `Restaurant Staff` (PRIMERO)

**Importante:** Crea el rol ANTES de agregar el campo `restaurant` a los usuarios.

1. Ve a **Settings → Roles & Permissions**
2. Click en **Create Role**
3. Nombre: `Restaurant Staff`
4. **NO** marques "App Access" ni "Admin Access" (solo API)

### Permisos del rol:

#### `restaurants` - Solo lectura de su restaurante
| Acción | Permiso | Filtro |
|--------|---------|--------|
| Read | ✅ Custom | `{ "id": { "_eq": "$CURRENT_USER.restaurant" } }` |

#### `event_users` - CRUD filtrado por restaurante
| Acción | Permiso | Filtro |
|--------|---------|--------|
| Create | ✅ All | — |
| Read | ✅ Custom | `{ "restaurant": { "_eq": "$CURRENT_USER.restaurant" } }` |
| Update | ✅ Custom | `{ "restaurant": { "_eq": "$CURRENT_USER.restaurant" } }` |

#### `orders` - Crear y leer filtrado
| Acción | Permiso | Filtro |
|--------|---------|--------|
| Create | ✅ All | — |
| Read | ✅ Custom | `{ "user": { "restaurant": { "_eq": "$CURRENT_USER.restaurant" } } }` |

---

## 3. Campo `restaurant` SOLO para rol Restaurant Staff

En lugar de modificar `directus_users` globalmente, el campo `restaurant` será visible **solo para usuarios del rol `Restaurant Staff`**.

### Opción A: Campo en directus_users con condición de rol

1. Ve a **Settings → Data Model → directus_users**
2. Click en **Create Field**
3. Configura:
   - Key: `restaurant`
   - Type: **Many to One (M2O)**
   - Related Collection: `restaurants`
   - Display Template: `{{name}}`

---

## 4. Crear Usuarios Staff (Solo para AYCE)

Por cada restaurante participante:

1. Ve a **Settings → Users**
2. Click en **Create User**
3. Llena:
   - Email: `staff-restaurante1@tudominio.com`
   - Password: (contraseña segura)
   - **Role: `Restaurant Staff`** ← Importante
   - **Restaurant:** (selecciona el restaurante correspondiente)

**Nota:** Tus otros usuarios de otras apps mantendrán sus roles actuales y no verán las colecciones de AYCE porque no tienen permisos configurados.

---

## 5. Permisos Públicos (rol Public)

Para que los clientes puedan ver su reserva sin autenticación:

1. Ve a **Settings → Roles & Permissions → Public**

#### `restaurants`
| Acción | Permiso |
|--------|---------|
| Read | ✅ All |

#### `event_users`
| Acción | Permiso | Campos permitidos |
|--------|---------|-------------------|
| Read | ✅ All | `id, qr_code, name, restaurant, start_time, end_time, status` |

---

## 6. Variable de Entorno del Frontend

Crear archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_DIRECTUS_URL=https://tu-directus.com
```

---

## 7. Endpoints que usa la App

| Endpoint | Método | Uso | Auth |
|----------|--------|-----|------|
| `/auth/login` | POST | Login restaurante | No |
| `/auth/logout` | POST | Logout | Sí |
| `/users/me` | GET | Info usuario actual | Sí |
| `/items/event_users?filter[qr_code][_eq]=XXX` | GET | Buscar usuario por QR | Público |
| `/items/event_users` | POST | Registrar nuevo usuario | Sí |
| `/items/event_users/:id` | PATCH | Actualizar (iniciar timer) | Sí |
| `/items/orders?filter[user][_eq]=XXX` | GET | Listar órdenes | Sí |
| `/items/orders` | POST | Crear orden | Sí |
| `/items/restaurants` | GET | Listar restaurantes | Sí |

---

## 8. Formato del Código QR

El QR debe contener la URL completa:
```
https://tu-app.com/reserva/CODIGO_UNICO
```

Ejemplos de códigos:
- `AYCE-001`
- `AYCE-002`
- UUID: `550e8400-e29b-41d4-a716-446655440000`

La app extrae automáticamente la última parte de la URL como código.

---

## Checklist

- [ ] Colección `restaurants` creada
- [ ] Colección `event_users` creada  
- [ ] Colección `orders` creada
- [ ] Campo `restaurant` agregado a `directus_users`
- [ ] Rol `Restaurant Staff` creado con permisos
- [ ] Permisos públicos configurados
- [ ] Usuarios staff creados y asignados
- [ ] Variable `NEXT_PUBLIC_DIRECTUS_URL` configurada
- [ ] CORS habilitado en Directus
