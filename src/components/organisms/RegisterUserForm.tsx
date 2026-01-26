'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUserSchema, RegisterUserFormData } from '@/lib/validations';
import { Input, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { QRScanner } from '@/components/molecules';
import { User, Phone, QrCode, Check } from 'lucide-react';
import { useState } from 'react';
import { extractQRCode } from '@/lib/utils';

interface RegisterUserFormProps {
  onSubmit: (data: RegisterUserFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  onSuccess?: () => void;
}

export function RegisterUserForm({ onSubmit, isLoading, error, onSuccess }: RegisterUserFormProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegisterUserFormData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      name: '',
      phone: '',
      qrCode: '',
    },
  });

  const handleQRScan = (code: string) => {
    const extractedCode = extractQRCode(code);
    setScannedCode(extractedCode);
    setValue('qrCode', extractedCode, { shouldValidate: true });
    setShowScanner(false);
  };

  const resetForm = () => {
    reset();
    setScannedCode(null);
    setShowScanner(false);
  };

  const onFormSubmit = async (data: RegisterUserFormData) => {
    try {
      await onSubmit(data);
      // Si llegamos aquí sin error, limpiar el formulario
      resetForm();
      onSuccess?.();
    } catch (err) {
      console.error('Error al registrar usuario:', err);
    }
  };

  return (
    <Card variant="elevated" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Registrar Nuevo Usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* QR Scanner Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Código QR
            </label>
            
            {scannedCode ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">QR Escaneado</p>
                    <p className="text-sm text-green-600">{scannedCode}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setScannedCode(null);
                    setValue('qrCode', '');
                  }}
                >
                  Cambiar
                </Button>
              </div>
            ) : showScanner ? (
              <QRScanner
                onScan={handleQRScan}
                onError={(err) => console.error(err)}
              />
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowScanner(true)}
                className="w-full"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Escanear QR del Usuario
              </Button>
            )}
            
            <input type="hidden" {...register('qrCode')} />
            {errors.qrCode && (
              <p className="text-sm text-red-500">{errors.qrCode.message}</p>
            )}
          </div>

          <Input
            {...register('name')}
            label="Nombre Completo"
            placeholder="Nombre del cliente"
            icon={<User className="w-5 h-5" />}
            error={errors.name?.message}
          />

          <Input
            {...register('phone')}
            type="tel"
            label="Teléfono (opcional)"
            placeholder="3001234567"
            icon={<Phone className="w-5 h-5" />}
            error={errors.phone?.message}
            maxLength={10}
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Mostrar errores de validación generales */}
          {Object.keys(errors).length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-700 text-sm text-center">
                Por favor completa todos los campos requeridos
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            isLoading={isLoading} 
            className="w-full"
          >
            Registrar Usuario
          </Button>

          {!scannedCode && (
            <p className="text-sm text-gray-500 text-center">
              Primero escanea el código QR del usuario
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
