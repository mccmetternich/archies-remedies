'use client';

import React from 'react';

interface MarqueeBarProps {
  text: string;
  speed?: 'slow' | 'medium' | 'fast';
  backgroundColor?: string;
  textColor?: string;
  separator?: string;
  className?: string;
}

export function MarqueeBar({
  text,
  speed = 'medium',
  backgroundColor = 'var(--primary)',
  textColor = 'var(--foreground)',
  separator = '✦',
  className = '',
}: MarqueeBarProps) {
  const speedDuration = {
    slow: '60s',
    medium: '40s',
    fast: '25s',
  };

  // Create enough repetitions to fill the screen seamlessly
  const repetitions = 12;
  const items = Array(repetitions).fill(text);

  return (
    <div
      className={`overflow-hidden py-4 ${className}`}
      style={{ backgroundColor }}
    >
      <div
        className="flex whitespace-nowrap animate-scroll-left"
        style={{
          '--scroll-duration': speedDuration[speed],
        } as React.CSSProperties}
      >
        {/* First set */}
        {items.map((item, i) => (
          <span
            key={`a-${i}`}
            className="flex items-center gap-6 px-6 text-sm font-medium tracking-wide uppercase"
            style={{ color: textColor }}
          >
            <span>{item}</span>
            <span className="text-xs opacity-60">{separator}</span>
          </span>
        ))}
        {/* Duplicate set for seamless loop */}
        {items.map((item, i) => (
          <span
            key={`b-${i}`}
            className="flex items-center gap-6 px-6 text-sm font-medium tracking-wide uppercase"
            style={{ color: textColor }}
          >
            <span>{item}</span>
            <span className="text-xs opacity-60">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
