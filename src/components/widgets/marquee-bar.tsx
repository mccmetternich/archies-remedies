'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type MarqueeSize = 'small' | 'medium' | 'large' | 'xl' | 'xxl' | 'xxl2' | 'xxxl';
export type MarqueeSpeed = 'slow' | 'medium' | 'fast';
export type MarqueeTheme = 'light' | 'dark' | 'baby-blue';

interface MarqueeBarProps {
  text: string;
  speed?: MarqueeSpeed;
  size?: MarqueeSize;
  theme?: MarqueeTheme;
  separator?: string;
  className?: string;
}

// Speed durations - slow is VERY slow for dramatic effect
const speedDurations: Record<MarqueeSpeed, string> = {
  slow: '120s',    // Extremely slow - dramatic scrolling
  medium: '60s',
  fast: '30s',
};

// Size classes with responsive mobile sizing
// Desktop sizes are large, mobile scales down appropriately
const sizeClasses: Record<MarqueeSize, string> = {
  small: 'py-2 text-xs md:text-sm',
  medium: 'py-3 text-sm md:text-base',
  large: 'py-4 text-base md:text-lg',
  xl: 'py-5 text-lg md:text-2xl',
  xxl: 'py-6 md:py-8 text-2xl md:text-4xl lg:text-5xl',  // GIGANTIC on desktop, reasonable on mobile
  xxl2: 'py-7 md:py-10 text-3xl md:text-5xl lg:text-6xl xl:text-7xl',  // ULTRA - between Gigantic and Massive
  xxxl: 'py-8 md:py-12 text-4xl md:text-6xl lg:text-8xl xl:text-9xl',  // MASSIVE - double XXL
};

// Theme presets
const themeStyles: Record<MarqueeTheme, { bg: string; text: string }> = {
  dark: { bg: '#000000', text: '#ffffff' },
  light: { bg: '#ffffff', text: 'var(--foreground)' },
  'baby-blue': { bg: 'var(--primary)', text: 'var(--foreground)' },
};

export function MarqueeBar({
  text,
  speed = 'medium',
  size = 'medium',
  theme = 'dark',
  separator = '✦',
  className = '',
}: MarqueeBarProps) {
  // Create enough repetitions to fill the screen seamlessly
  const repetitions = 12;
  const items = Array(repetitions).fill(text);

  const colors = themeStyles[theme];

  return (
    <div
      className={cn(
        'overflow-hidden',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: colors.bg,
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        className="flex whitespace-nowrap animate-scroll-left"
        style={{
          '--scroll-duration': speedDurations[speed],
        } as React.CSSProperties}
      >
        {/* First set */}
        {items.map((item, i) => (
          <span
            key={`a-${i}`}
            className="flex items-center gap-4 md:gap-8 px-4 md:px-8 font-medium tracking-wide uppercase"
            style={{ color: colors.text }}
          >
            <span>{item}</span>
            <span className="opacity-40">{separator}</span>
          </span>
        ))}
        {/* Duplicate set for seamless loop */}
        {items.map((item, i) => (
          <span
            key={`b-${i}`}
            className="flex items-center gap-4 md:gap-8 px-4 md:px-8 font-medium tracking-wide uppercase"
            style={{ color: colors.text }}
          >
            <span>{item}</span>
            <span className="opacity-40">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
