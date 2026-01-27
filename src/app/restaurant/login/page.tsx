'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { LoginForm } from '@/components/organisms';
import { MobileLayout } from '@/components/organisms';
import { useAuth } from '@/context/AuthContext';
import { UtensilsCrossed, Shield } from 'lucide-react';
import { LoginFormData } from '@/lib/validations';

export default function RestaurantLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/restaurant/dashboard');
    }
  }, [isAuthenticated, router]);

  // Mostrar nada mientras redirige
  if (isAuthenticated) {
    return null;
  }

  const handleLogin = async (data: LoginFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      await login(data.username, data.password);
      router.push('/restaurant/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileLayout className="flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">NOMBRE DEL EVENTO</h1>
          <p className="text-gray-500">Portal de Restaurantes</p>
        </div>

        {/* Login Card */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <CardTitle>Acceso Restaurante</CardTitle>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Ingresa tus credenciales para gestionar usuarios
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error || undefined}
            />
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Problemas de acceso? Contacta al organizador del evento
        </p>
      </div>
    </MobileLayout>
  );
}
