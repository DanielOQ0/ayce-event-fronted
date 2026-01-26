'use client';

import { ReactNode } from 'react';
import { ChevronLeft, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  showLogout?: boolean;
  onBack?: () => void;
  onLogout?: () => void;
  footer?: ReactNode;
  className?: string;
}

export function MobileLayout({
  children,
  title,
  showBackButton,
  showLogout,
  onBack,
  onLogout,
  footer,
  className,
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      {(title || showBackButton || showLogout) && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <button
                  onClick={onBack}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
              )}
              {title && (
                <h1 className="text-lg font-bold text-gray-900">{title}</h1>
              )}
            </div>
            {showLogout && (
              <button
                onClick={onLogout}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn('flex-1 overflow-auto', className)}>
        {children}
      </main>

      {/* Footer/Navigation */}
      {footer && (
        <footer className="sticky bottom-0 z-10">
          {footer}
        </footer>
      )}
    </div>
  );
}
