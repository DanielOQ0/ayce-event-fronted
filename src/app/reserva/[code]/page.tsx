'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, Spinner, Badge } from '@/components/atoms';
import { CountdownTimer, UserInfoCard } from '@/components/molecules';
import { MobileLayout } from '@/components/organisms';
import { usersApi } from '@/lib/api';
import { Calendar, UtensilsCrossed, AlertCircle } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  restaurant: { name: string };
  status: string;
  start_time: string | null;
  end_time: string | null;
  qr_code: string;
}

export default function ClientReservationPage() {
  const params = useParams();
  const qrCode = params.code as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const users = await usersApi.getByQRCode(qrCode);
        
        if (users.length === 0) {
          setError('Reserva no encontrada');
          return;
        }

        const userData = users[0];
        
        // Manejar restaurant como string o como objeto
        let restaurantName = 'Sin asignar';
        if (userData.restaurant) {
          if (typeof userData.restaurant === 'string') {
            restaurantName = userData.restaurant;
          } else if (typeof userData.restaurant === 'object') {
            restaurantName = userData.restaurant.name || 'Sin asignar';
          }
        }
        
        setUser({
          id: userData.id,
          name: userData.name,
          restaurant: { name: restaurantName },
          status: userData.status,
          start_time: userData.start_time,
          end_time: userData.end_time,
          qr_code: userData.qr_code,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la reserva');
      } finally {
        setLoading(false);
      }
    };

    if (qrCode) {
      fetchUser();
    }
  }, [qrCode]);

  if (loading) {
    return (
      <MobileLayout className="flex items-center justify-center p-6">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando tu reserva...</p>
        </div>
      </MobileLayout>
    );
  }

  if (error || !user) {
    return (
      <MobileLayout className="flex items-center justify-center p-6">
        <Card variant="elevated" className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Oops!</h2>
          <p className="text-gray-600">{error || 'Reserva no encontrada'}</p>
        </Card>
      </MobileLayout>
    );
  }

  const isActive = user.status === 'active' && user.end_time;
  const isFinished = user.status === 'finished';
  const isRegistered = user.status === 'registered';

  return (
    <MobileLayout className="p-4">
      {/* Header con logo del evento */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl mb-3 shadow-lg">
          <UtensilsCrossed className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">AYCE Event</h1>
        <p className="text-gray-500">All You Can Eat Experience</p>
      </div>

      {/* Información del usuario */}
      <UserInfoCard
        name={user.name}
        restaurant={user.restaurant.name}
        status={user.status as 'registered' | 'active' | 'finished'}
        qrCode={user.qr_code}
        className="mb-6"
      />

      {/* Timer o estado */}
      <Card variant="elevated" className="mb-6">
        {isActive && user.end_time && (
          <div className="py-4">
            <h3 className="text-center text-gray-600 font-medium mb-4">
              Tiempo Restante
            </h3>
            <CountdownTimer
              endTime={user.end_time}
              onExpired={() => setUser({ ...user, status: 'finished' })}
            />
          </div>
        )}

        {isRegistered && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ¡Estás registrado!
            </h3>
            <p className="text-gray-600 mb-4">
              Tu tiempo comenzará cuando el restaurante registre tu primera orden.
            </p>
            <Badge variant="info">Esperando inicio</Badge>
          </div>
        )}

        {isFinished && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ¡Experiencia Finalizada!
            </h3>
            <p className="text-gray-600 mb-4">
              Gracias por participar en el evento AYCE. ¡Esperamos que hayas disfrutado!
            </p>
            <Badge variant="default">Completado</Badge>
          </div>
        )}
      </Card>

      {/* Información adicional */}
      <Card variant="bordered">
        <h4 className="font-medium text-gray-900 mb-3">Información del Evento</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Duración: 90 minutos desde tu primera orden</li>
          <li>• Pedidos ilimitados durante tu tiempo activo</li>
          <li>• Muestra este código QR para cada pedido</li>
        </ul>
      </Card>
    </MobileLayout>
  );
}
