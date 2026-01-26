'use client';

import { Card } from '@/components/atoms';
import { Clock, Hash } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface OrderCardProps {
  orderNumber: number;
  items: string;
  notes?: string;
  createdAt: string;
}

export function OrderCard({ orderNumber, items, notes, createdAt }: OrderCardProps) {
  return (
    <Card variant="bordered" className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-orange-500" />
          <span className="font-bold text-gray-900">Orden #{orderNumber}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{formatDate(createdAt)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-700">Items:</p>
          <p className="text-gray-600">{items}</p>
        </div>
        {notes && (
          <div>
            <p className="text-sm font-medium text-gray-700">Notas:</p>
            <p className="text-gray-500 text-sm">{notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
