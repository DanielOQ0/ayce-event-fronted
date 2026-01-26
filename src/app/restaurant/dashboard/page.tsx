'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MobileLayout } from '@/components/organisms';
import { RegisterUserForm, NewOrderForm } from '@/components/organisms';
import { NavTabs, QRScanner, UserInfoCard, OrderCard, CountdownTimer } from '@/components/molecules';
import { Card, Button, Spinner, Badge } from '@/components/atoms';
import { useAuth } from '@/context/AuthContext';
import { usersApi, ordersApi } from '@/lib/api';
import { extractQRCode } from '@/lib/utils';
import { EVENT_CONFIG } from '@/types';
import { 
  UserPlus, 
  ClipboardList, 
  QrCode, 
  AlertCircle,
  CheckCircle,
  Play
} from 'lucide-react';

type TabType = 'register' | 'current';

interface CurrentUser {
  id: string;
  name: string;
  qr_code: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  restaurant: { name: string };
}

interface Order {
  id: string;
  items: string;
  notes: string;
  order_number: number;
  date_created: string;
}

export default function RestaurantDashboardPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading, logout, restaurantId } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('register');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/restaurant/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Limpiar mensajes después de 3 segundos
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Manejar cambio de pestaña
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/restaurant/login');
  };

  // Registrar nuevo usuario
  const handleRegisterUser = async (data: { name: string; phone?: string; qrCode: string }) => {
    if (!token) {
      setError('No hay token de autenticación');
      throw new Error('No hay token de autenticación');
    }

    try {
      setLoading(true);
      setError(null);

      await usersApi.create(
        {
          qr_code: data.qrCode,
          name: data.name,
          phone: data.phone || undefined,
          restaurant: restaurantId || undefined,
        },
        token
      );

      setSuccess('¡Usuario registrado exitosamente!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar usuario';
      setError(errorMessage);
      throw err; // Re-lanzar para que el formulario sepa que falló
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuario por QR
  const handleScanUser = useCallback(async (scannedCode: string) => {
    if (!token) return;

    const code = extractQRCode(scannedCode);

    try {
      setLoading(true);
      setError(null);
      setShowScanner(false);

      const users = await usersApi.getByQRCode(code, token);
      
      if (users.length === 0) {
        setError('Usuario no encontrado. ¿Necesitas registrarlo primero?');
        setCurrentUser(null);
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
      
      setCurrentUser({
        id: userData.id,
        name: userData.name,
        qr_code: userData.qr_code,
        status: userData.status,
        start_time: userData.start_time,
        end_time: userData.end_time,
        restaurant: { name: restaurantName },
      });

      // Cargar órdenes del usuario
      const userOrders = await ordersApi.getByUserId(userData.id, token);
      setOrders(userOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar usuario');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Crear nueva orden
  const handleNewOrder = async (data: { items: string; notes?: string }) => {
    if (!token || !currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const orderNumber = orders.length + 1;

      // Si es la primera orden, iniciar el timer
      if (orders.length === 0 && currentUser.status === 'registered') {
        await usersApi.startTimer(currentUser.id, EVENT_CONFIG.DURATION_MINUTES, token);
        
        // Actualizar el usuario local
        const now = new Date();
        const endTime = new Date(now.getTime() + EVENT_CONFIG.DURATION_MINUTES * 60 * 1000);
        setCurrentUser({
          ...currentUser,
          status: 'active',
          start_time: now.toISOString(),
          end_time: endTime.toISOString(),
        });
      }

      await ordersApi.create(
        {
          user: currentUser.id,
          items: data.items,
          notes: data.notes,
          order_number: orderNumber,
        },
        token
      );

      // Recargar órdenes
      const updatedOrders = await ordersApi.getByUserId(currentUser.id, token);
      setOrders(updatedOrders);

      setSuccess('¡Orden registrada!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear orden');
    } finally {
      setLoading(false);
    }
  };

  // Tabs de navegación
  const tabs = [
    { id: 'register', label: 'Registrar', icon: <UserPlus className="w-5 h-5" /> },
    { id: 'current', label: 'Usuario Actual', icon: <ClipboardList className="w-5 h-5" /> },
  ];

  if (authLoading) {
    return (
      <MobileLayout className="flex items-center justify-center">
        <Spinner size="lg" />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Dashboard"
      showLogout
      onLogout={handleLogout}
      footer={
        <NavTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tab) => handleTabChange(tab as TabType)}
        />
      }
    >
      <div className="p-4">
        {/* Mensajes de éxito/error */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tab: Registrar nuevo usuario */}
        {activeTab === 'register' && (
          <RegisterUserForm
            onSubmit={handleRegisterUser}
            isLoading={loading}
            error={error || undefined}
          />
        )}

        {/* Tab: Usuario actual */}
        {activeTab === 'current' && (
          <div className="space-y-4">
            {/* Scanner para buscar usuario */}
            {!currentUser && (
              <Card variant="elevated">
                <div className="text-center py-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    Buscar Usuario
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Escanea el QR del cliente para ver su información
                  </p>

                  {showScanner ? (
                    <QRScanner
                      onScan={handleScanUser}
                      onError={(err) => setError(err)}
                    />
                  ) : (
                    <Button onClick={() => setShowScanner(true)}>
                      <QrCode className="w-5 h-5 mr-2" />
                      Escanear QR
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Info del usuario actual */}
            {currentUser && (
              <>
                <UserInfoCard
                  name={currentUser.name}
                  restaurant={currentUser.restaurant.name}
                  status={currentUser.status as 'registered' | 'active' | 'finished'}
                  qrCode={currentUser.qr_code}
                />

                {/* Timer si está activo */}
                {currentUser.status === 'active' && currentUser.end_time && (
                  <Card variant="elevated">
                    <h4 className="font-medium text-gray-700 text-center mb-3">
                      Tiempo Restante
                    </h4>
                    <CountdownTimer endTime={currentUser.end_time} />
                  </Card>
                )}

                {/* Mensaje si está registrado pero no activo */}
                {currentUser.status === 'registered' && (
                  <Card variant="bordered" className="bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-3">
                      <Play className="w-5 h-5 text-blue-500" />
                      <p className="text-blue-700">
                        El tiempo comenzará al registrar la primera orden
                      </p>
                    </div>
                  </Card>
                )}

                {/* Mensaje si finalizó */}
                {currentUser.status === 'finished' && (
                  <Card variant="bordered" className="bg-gray-100 border-gray-300">
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="default">Tiempo finalizado</Badge>
                    </div>
                  </Card>
                )}

                {/* Formulario de nueva orden (solo si no ha finalizado) */}
                {currentUser.status !== 'finished' && (
                  <NewOrderForm
                    onSubmit={handleNewOrder}
                    isLoading={loading}
                    userName={currentUser.name}
                    orderNumber={orders.length + 1}
                  />
                )}

                {/* Lista de órdenes */}
                {orders.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">
                      Órdenes ({orders.length})
                    </h4>
                    <div className="space-y-3">
                      {orders.map((order, index) => (
                        <OrderCard
                          key={order.id || `order-${index}`}
                          orderNumber={order.order_number}
                          items={order.items}
                          notes={order.notes}
                          createdAt={order.date_created}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón para buscar otro usuario */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentUser(null);
                    setOrders([]);
                    setShowScanner(false);
                  }}
                  className="w-full"
                >
                  Buscar otro usuario
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
