'use client';

import React, { createContext, useContext, useState, useCallback, useSyncExternalStore } from 'react';
import { authApi } from '@/lib/api';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  restaurantId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper para leer localStorage de forma segura con SSR
function getStorageValue(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Usar useSyncExternalStore para leer localStorage sin causar renders en cascada
  const savedToken = useSyncExternalStore(
    subscribeToStorage,
    () => getStorageValue('auth_token'),
    () => null
  );
  const savedRefreshToken = useSyncExternalStore(
    subscribeToStorage,
    () => getStorageValue('refresh_token'),
    () => null
  );
  const savedRestaurantId = useSyncExternalStore(
    subscribeToStorage,
    () => getStorageValue('restaurant_id'),
    () => null
  );

  const [token, setToken] = useState<string | null>(savedToken);
  const [refreshToken, setRefreshToken] = useState<string | null>(savedRefreshToken);
  const [restaurantId, setRestaurantId] = useState<string | null>(savedRestaurantId);
  const [isLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const { access_token, refresh_token } = response;

      // Obtener información del usuario incluyendo restaurant
      const user = await authApi.me(access_token);

      setToken(access_token);
      setRefreshToken(refresh_token);
      
      // El restaurant puede venir como string (ID) o como objeto {id: ...}
      let userRestaurantId = '';
      if (user.restaurant) {
        if (typeof user.restaurant === 'string') {
          userRestaurantId = user.restaurant;
        } else if (typeof user.restaurant === 'object' && user.restaurant !== null) {
          userRestaurantId = (user.restaurant as { id: string }).id || '';
        }
      }
      
      setRestaurantId(userRestaurantId);

      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('restaurant_id', userRestaurantId);
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }

    setToken(null);
    setRefreshToken(null);
    setRestaurantId(null);

    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('restaurant_id');
  }, [refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoading,
        restaurantId,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
