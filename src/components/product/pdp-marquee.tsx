'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PDPMarqueeProps {
  text: string;
  enabled?: boolean;
  backgroundColor?: string | null;
  textColor?: string | null;
  className?: string;
}

export function PDPMarquee({
  text,
  enabled = true,
  backgroundColor = '#1a1a1a',
  textColor = '#ffffff',
  className,
}: PDPMarqueeProps) {
  if (!enabled || !text) return null;

  // Create seamless repeating pattern: TEXT • TEXT • TEXT • ...
  // Small consistent gaps for continuous flow
  const marqueeContent = (
    <span className="inline-flex items-center whitespace-nowrap">
      {[...Array(8)].map((_, i) => (
        <span key={i} className="inline-flex items-center">
          <span className="mx-3">{text}</span>
          <span className="mx-3 opacity-40">•</span>
        </span>
      ))}
    </span>
  );

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'h-[38px] lg:h-[44px] flex items-center', // 38px mobile, 44px desktop
        className
      )}
      style={{
        backgroundColor: backgroundColor || '#1a1a1a',
        color: textColor || '#ffffff',
      }}
    >
      {/* Marquee track */}
      <div className="flex animate-marquee-slow w-full">
        <div className="flex shrink-0 items-center">
          <span
            className="text-[9.5px] lg:text-[10.5px] font-medium uppercase tracking-[0.03em]"
            style={{ color: textColor || '#ffffff' }}
          >
            {marqueeContent}
          </span>
        </div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          <span
            className="text-[9.5px] lg:text-[10.5px] font-medium uppercase tracking-[0.03em]"
            style={{ color: textColor || '#ffffff' }}
          >
            {marqueeContent}
          </span>
        </div>
      </div>
    </div>
  );
}
