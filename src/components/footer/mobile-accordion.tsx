'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MobileAccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  isDark?: boolean;
  children: React.ReactNode;
}

export function MobileAccordion({
  title,
  isOpen,
  onToggle,
  isDark = true,
  children
}: MobileAccordionProps) {
  return (
    <div className={cn('border-t', isDark ? 'border-white/10' : 'border-gray-200')}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className={cn('text-xs font-bold tracking-[0.15em] uppercase', isDark ? 'text-white' : 'text-gray-900')}>
          {title}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isDark ? 'text-white/60' : 'text-gray-500',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {children}
      </div>
    </div>
  );
}
