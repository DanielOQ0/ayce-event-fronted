import { z } from 'zod';

// Schema para login de restaurante
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(50, 'El usuario no puede tener más de 50 caracteres'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede tener más de 100 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema para registro de usuario
export const registerUserSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  phone: z
    .string()
    .min(10, 'El teléfono debe tener 10 dígitos')
    .max(10, 'El teléfono debe tener 10 dígitos')
    .regex(/^\d{10}$/, 'Ingresa solo los 10 dígitos del número')
    .optional()
    .or(z.literal('')),
  qrCode: z
    .string()
    .min(1, 'El código QR es requerido'),
});

export type RegisterUserFormData = z.infer<typeof registerUserSchema>;

// Schema para nueva orden
export const newOrderSchema = z.object({
  items: z
    .string()
    .min(1, 'Debe ingresar al menos un item'),
  notes: z
    .string()
    .max(500, 'Las notas no pueden tener más de 500 caracteres')
    .optional(),
});

export type NewOrderFormData = z.infer<typeof newOrderSchema>;

// Schema para código QR
export const qrCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'El código QR es requerido'),
});

export type QRCodeFormData = z.infer<typeof qrCodeSchema>;
