'use client';

import { Card, Badge } from '@/components/atoms';
import { User, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserInfoCardProps {
  name: string;
  restaurant: string;
  status: 'registered' | 'active' | 'finished';
  qrCode?: string;
  className?: string;
}

export function UserInfoCard({ name, restaurant, status, qrCode, className }: UserInfoCardProps) {
  const statusConfig = {
    registered: { label: 'Registrado', variant: 'info' as const },
    active: { label: 'En curso', variant: 'success' as const },
    finished: { label: 'Finalizado', variant: 'default' as const },
  };

  const currentStatus = statusConfig[status] || statusConfig.registered;

  return (
    <Card variant="elevated" className={cn('', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{name}</h3>
            {qrCode && (
              <p className="text-sm text-gray-500">#{qrCode.slice(-6).toUpperCase()}</p>
            )}
          </div>
        </div>
        <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-gray-600">
          <MapPin className="w-5 h-5 text-orange-500" />
          <span>{restaurant}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <Clock className="w-5 h-5 text-orange-500" />
          <span>90 minutos de experiencia AYCE</span>
        </div>
      </div>
    </Card>
  );
}
