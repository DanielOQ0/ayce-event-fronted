import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Extraer código QR de una URL o string
export function extractQRCode(input: string): string {
  // Si es una URL, extraer la última parte del path
  try {
    const url = new URL(input);
    const pathParts = url.pathname.split('/').filter(Boolean);
    return pathParts[pathParts.length - 1] || input;
  } catch {
    // Si no es una URL válida, buscar el último segmento después de /
    const parts = input.split('/').filter(Boolean);
    return parts[parts.length - 1] || input;
  }
}

// Formatear tiempo restante
export function formatTimeRemaining(endTime: string): {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
} {
  const now = Date.now();
  
  // Asegurar que la fecha se interprete correctamente
  // Si no tiene Z al final y no tiene offset, asumir que es UTC
  let endTimeStr = endTime;
  if (!endTime.includes('Z') && !endTime.includes('+') && !endTime.includes('-', 10)) {
    endTimeStr = endTime + 'Z';
  }
  
  const end = new Date(endTimeStr).getTime();
  const diff = end - now;

  // Limitar a máximo 90 minutos (o la duración configurada)
  const maxDiff = 90 * 60 * 1000; // 90 minutos en milisegundos
  const clampedDiff = Math.min(diff, maxDiff);

  if (clampedDiff <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formatted: '00:00:00',
    };
  }

  const hours = Math.floor(clampedDiff / (1000 * 60 * 60));
  const minutes = Math.floor((clampedDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((clampedDiff % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    isExpired: false,
    formatted: `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
  };
}

// Calcular tiempo de finalización
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return end.toISOString();
}

// Formatear fecha
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
