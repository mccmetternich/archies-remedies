'use client';

import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DeviceType = 'desktop' | 'mobile';

interface DevicePreviewToggleProps {
  device: DeviceType;
  onChange: (device: DeviceType) => void;
  className?: string;
}

/**
 * Desktop/Mobile toggle for previewing content on different devices.
 * Matches the pattern used in the popup admin.
 */
export function DevicePreviewToggle({ device, onChange, className }: DevicePreviewToggleProps) {
  return (
    <div className={cn('flex bg-[var(--admin-hover)] rounded-lg p-1', className)}>
      <button
        type="button"
        onClick={() => onChange('desktop')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          device === 'desktop'
            ? 'bg-white text-[var(--admin-text-primary)] shadow-sm'
            : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]'
        )}
      >
        <Monitor className="w-4 h-4" />
        <span className="hidden sm:inline">Desktop</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('mobile')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          device === 'mobile'
            ? 'bg-white text-[var(--admin-text-primary)] shadow-sm'
            : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]'
        )}
      >
        <Smartphone className="w-4 h-4" />
        <span className="hidden sm:inline">Mobile</span>
      </button>
    </div>
  );
}
