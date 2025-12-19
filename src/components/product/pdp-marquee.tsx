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

  // Duplicate text for seamless loop
  const marqueeContent = (
    <span className="inline-flex items-center whitespace-nowrap">
      <span className="mx-8">{text}</span>
      <span className="mx-8 opacity-40">•</span>
      <span className="mx-8">{text}</span>
      <span className="mx-8 opacity-40">•</span>
      <span className="mx-8">{text}</span>
      <span className="mx-8 opacity-40">•</span>
      <span className="mx-8">{text}</span>
      <span className="mx-8 opacity-40">•</span>
    </span>
  );

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'py-4 lg:py-5',
        className
      )}
      style={{
        backgroundColor: backgroundColor || '#1a1a1a',
        color: textColor || '#ffffff',
      }}
    >
      {/* Marquee track */}
      <div className="flex animate-marquee-slow">
        <div className="flex shrink-0 items-center">
          <span
            className="text-[11px] lg:text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: textColor || '#ffffff' }}
          >
            {marqueeContent}
          </span>
        </div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          <span
            className="text-[11px] lg:text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: textColor || '#ffffff' }}
          >
            {marqueeContent}
          </span>
        </div>
      </div>
    </div>
  );
}
