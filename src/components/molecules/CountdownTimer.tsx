'use client';

import { useState, useEffect } from 'react';
import { formatTimeRemaining } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  endTime: string;
  onExpired?: () => void;
  className?: string;
}

export function CountdownTimer({ endTime, onExpired, className }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => formatTimeRemaining(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = formatTimeRemaining(endTime);
      setTimeRemaining(remaining);

      if (remaining.isExpired) {
        clearInterval(interval);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpired]);

  const isLow = timeRemaining.hours === 0 && timeRemaining.minutes < 10;
  const isCritical = timeRemaining.hours === 0 && timeRemaining.minutes < 5;

  return (
    <div className={cn('text-center', className)}>
      <div
        className={cn(
          'font-mono text-5xl md:text-6xl font-bold tracking-wider',
          'transition-colors duration-300',
          timeRemaining.isExpired && 'text-red-500',
          isCritical && !timeRemaining.isExpired && 'text-red-500 animate-pulse',
          isLow && !isCritical && !timeRemaining.isExpired && 'text-yellow-500',
          !isLow && !timeRemaining.isExpired && 'text-orange-500'
        )}
      >
        {timeRemaining.formatted}
      </div>
      <p className="text-gray-500 mt-2 text-sm">
        {timeRemaining.isExpired ? 'Tiempo finalizado' : 'Tiempo restante'}
      </p>
    </div>
  );
}
