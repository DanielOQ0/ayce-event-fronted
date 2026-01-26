'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/atoms';
import { Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QRScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const SCANNER_ID = 'qr-scanner-element';

export function QRScanner({ onScan, onError, className }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING state
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setIsStarting(false);
  }, []);

  // Iniciar el escaneo cuando isStarting cambia a true y el elemento existe
  useEffect(() => {
    if (!isStarting) return;

    const initScanner = async () => {
      const scannerElement = document.getElementById(SCANNER_ID);
      if (!scannerElement) {
        console.error('Scanner element not found');
        setIsStarting(false);
        return;
      }

      try {
        scannerRef.current = new Html5Qrcode(SCANNER_ID);

        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText);
            stopScanning();
          },
          () => {
            // Ignorar errores de escaneo continuo
          }
        );
        
        setIsScanning(true);
        setIsStarting(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al acceder a la cámara';
        setError(errorMessage);
        onError?.(errorMessage);
        setIsStarting(false);
        setIsScanning(false);
      }
    };

    // Pequeño delay para asegurar que el DOM está listo
    const timer = setTimeout(initScanner, 100);
    return () => clearTimeout(timer);
  }, [isStarting, onScan, onError, stopScanning]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  const handleStartClick = () => {
    setError(null);
    setIsStarting(true);
  };

  // Mostrar el contenedor del scanner cuando está iniciando o escaneando
  const showScanner = isStarting || isScanning;

  return (
    <div className={cn('w-full', className)}>
      {!showScanner ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full aspect-square max-w-xs bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
            <Camera className="w-16 h-16 text-gray-400" />
          </div>
          <Button onClick={handleStartClick} className="w-full max-w-xs">
            <Camera className="w-5 h-5 mr-2" />
            Escanear QR
          </Button>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div
            id={SCANNER_ID}
            className="w-full aspect-square max-w-xs rounded-2xl overflow-hidden bg-black"
          />
          <Button variant="outline" onClick={stopScanning} className="w-full max-w-xs">
            <X className="w-5 h-5 mr-2" />
            Cancelar
          </Button>
          {isStarting && (
            <p className="text-gray-500 text-sm">Iniciando cámara...</p>
          )}
        </div>
      )}
    </div>
  );
}
