'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type Size = 'small' | 'medium' | 'large' | 'xl' | 'xxl';
export type Speed = 'slow' | 'normal' | 'fast';
export type Direction = 'left' | 'right';
export type StylePreset = 'baby-blue' | 'dark' | 'light';

interface ScrollingTextBarProps {
  text: string;
  size?: Size;
  speed?: Speed;
  direction?: Direction;
  stylePreset?: StylePreset;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  separator?: string;
}

// Style presets: baby blue with dark gray text, dark gray with white text, white with off-black text
const stylePresets: Record<StylePreset, { backgroundColor: string; textColor: string }> = {
  'baby-blue': { backgroundColor: 'var(--primary)', textColor: '#374151' }, // Baby blue with dark gray text
  'dark': { backgroundColor: '#1f2937', textColor: '#ffffff' }, // Dark gray/off-black with white text
  'light': { backgroundColor: '#ffffff', textColor: '#1f2937' }, // White with off-black text
};

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
  stylePreset,
  className,
  backgroundColor,
  textColor,
  separator = '•',
}: ScrollingTextBarProps) {
  // Duplicate text for seamless infinite scroll
  const repeatedText = Array(10).fill(`${text} ${separator}`).join(' ');

  const animationStyle = {
    '--scroll-duration': speedStyles[speed],
  } as React.CSSProperties;

  // Use style preset if provided, otherwise fallback to explicit colors or defaults
  const colors = stylePreset
    ? stylePresets[stylePreset]
    : {
        backgroundColor: backgroundColor || 'var(--primary)',
        textColor: textColor || 'var(--foreground)',
      };

  return (
    <div
      className={cn(
        'overflow-hidden whitespace-nowrap font-medium tracking-wide',
        sizeStyles[size],
        className
      )}
      style={{ backgroundColor: colors.backgroundColor, color: colors.textColor }}
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
