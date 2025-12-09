'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type Size = 'small' | 'medium' | 'large' | 'xl' | 'xxl';
type Speed = 'slow' | 'normal' | 'fast';
type Direction = 'left' | 'right';

interface ScrollingTextBarProps {
  text: string;
  size?: Size;
  speed?: Speed;
  direction?: Direction;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  separator?: string;
}

const sizeStyles: Record<Size, string> = {
  small: 'py-2 text-xs',
  medium: 'py-3 text-sm',
  large: 'py-4 text-base',
  xl: 'py-5 text-lg',
  xxl: 'py-6 text-xl md:text-2xl',
};

const speedStyles: Record<Speed, string> = {
  slow: '60s',
  normal: '30s',
  fast: '15s',
};

export function ScrollingTextBar({
  text,
  size = 'medium',
  speed = 'normal',
  direction = 'left',
  className,
  backgroundColor = 'var(--primary)',
  textColor = 'var(--foreground)',
  separator = '•',
}: ScrollingTextBarProps) {
  // Duplicate text for seamless infinite scroll
  const repeatedText = Array(10).fill(`${text} ${separator}`).join(' ');

  const animationStyle = {
    '--scroll-duration': speedStyles[speed],
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        'overflow-hidden whitespace-nowrap font-medium tracking-wide',
        sizeStyles[size],
        className
      )}
      style={{ backgroundColor, color: textColor }}
    >
      <div
        className={cn(
          'inline-block',
          direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'
        )}
        style={animationStyle}
      >
        <span className="inline-block pr-4">{repeatedText}</span>
        <span className="inline-block pr-4">{repeatedText}</span>
      </div>
    </div>
  );
}
