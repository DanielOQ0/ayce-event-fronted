'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newOrderSchema, NewOrderFormData } from '@/lib/validations';
import { Input, Button, Textarea, Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { ShoppingBag, FileText } from 'lucide-react';

interface NewOrderFormProps {
  onSubmit: (data: NewOrderFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  userName?: string;
  orderNumber?: number;
}

export function NewOrderForm({ onSubmit, isLoading, error, userName, orderNumber }: NewOrderFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewOrderFormData>({
    resolver: zodResolver(newOrderSchema),
  });

  const handleFormSubmit = async (data: NewOrderFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Card variant="elevated" className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Nueva Orden</CardTitle>
          {orderNumber && (
            <span className="text-sm text-gray-500">#{orderNumber}</span>
          )}
        </div>
        {userName && (
          <p className="text-sm text-gray-600 mt-1">Para: {userName}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            {...register('items')}
            label="Items del pedido"
            placeholder="Ej: 2x Sushi Roll, 1x Ramen"
            icon={<ShoppingBag className="w-5 h-5" />}
            error={errors.items?.message}
          />

          <Textarea
            {...register('notes')}
            label="Notas (opcional)"
            placeholder="Instrucciones especiales, alergias, etc."
            rows={3}
            error={errors.notes?.message}
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full">
            <FileText className="w-5 h-5 mr-2" />
            Registrar Orden
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
