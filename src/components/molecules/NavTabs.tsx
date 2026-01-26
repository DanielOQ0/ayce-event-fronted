'use client';

import { cn } from '@/lib/utils';

interface NavTabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function NavTabs({ tabs, activeTab, onTabChange, className }: NavTabsProps) {
  return (
    <nav className={cn('bg-white border-t border-gray-200', className)}>
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex flex-col items-center py-3 px-4 flex-1 transition-colors',
              activeTab === tab.id
                ? 'text-orange-500 border-t-2 border-orange-500 -mt-[2px]'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.icon && <span className="mb-1">{tab.icon}</span>}
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
