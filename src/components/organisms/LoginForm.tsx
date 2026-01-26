'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations';
import { Input, Button } from '@/components/atoms';
import { User, Lock } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        {...register('username')}
        label="Usuario"
        placeholder="Ingresa tu usuario"
        icon={<User className="w-5 h-5" />}
        error={errors.username?.message}
      />

      <Input
        {...register('password')}
        type="password"
        label="Contraseña"
        placeholder="Ingresa tu contraseña"
        icon={<Lock className="w-5 h-5" />}
        error={errors.password?.message}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Iniciar Sesión
      </Button>
    </form>
  );
}
