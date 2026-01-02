'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type IconHighlightsTheme = 'blue' | 'dark' | 'cream';

export interface IconHighlightColumn {
  iconUrl: string;
  title: string;
  description: string;
}

export interface IconHighlightsProps {
  title?: string;
  theme?: IconHighlightsTheme;
  columns: IconHighlightColumn[];
  linkText?: string;
  linkUrl?: string;
  className?: string;
}

// ============================================
// THEME CONFIGURATIONS
// Using explicit hex colors to match PDP styling
// ============================================

const themeStyles: Record<
  IconHighlightsTheme,
  {
    bg: string;
    titleColor: string;
    textColor: string;
    mutedColor: string;
    linkColor: string;
    linkHoverColor: string;
  }
> = {
  blue: {
    bg: 'bg-[#bbdae9]',
    titleColor: 'text-[#1a1a1a]',
    textColor: 'text-[#1a1a1a]',
    mutedColor: 'text-[#333333]',
    linkColor: 'text-[#1a1a1a]',
    linkHoverColor: 'hover:text-[#333333]',
  },
  dark: {
    bg: 'bg-[#1a1a1a]',
    titleColor: 'text-white',
    textColor: 'text-white',
    mutedColor: 'text-white/85',
    linkColor: 'text-white',
    linkHoverColor: 'hover:text-white/80',
  },
  cream: {
    bg: 'bg-[#f5f1eb]',
    titleColor: 'text-[#1a1a1a]',
    textColor: 'text-[#1a1a1a]',
    mutedColor: 'text-[#333333]',
    linkColor: 'text-[#1a1a1a]',
    linkHoverColor: 'hover:text-[#333333]',
  },
};

// ============================================
// COMPONENT
// ============================================

export function IconHighlights({
  title,
  theme = 'blue',
  columns,
  linkText,
  linkUrl,
  className,
}: IconHighlightsProps) {
  const styles = themeStyles[theme];

  // Filter out empty columns
  const validColumns = columns.filter(
    (col) => col.iconUrl || col.title || col.description
  );

  if (validColumns.length === 0 && !title) {
    return null;
  }

  return (
    <section className={cn('py-12 md:py-16 lg:py-20', styles.bg, className)}>
      <div className="container">
        {/* Section Title - matches PDP styling */}
        {title && (
          <h2
            className={cn(
              'text-center text-lg md:text-xl lg:text-2xl font-bold uppercase mb-10 md:mb-12',
              styles.titleColor
            )}
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              letterSpacing: '0.08em',
            }}
          >
            {title}
          </h2>
        )}

        {/* Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 lg:gap-10">
          {validColumns.map((column, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {/* Icon */}
              {column.iconUrl && (
                <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 mb-4 md:mb-5 relative flex-shrink-0">
                  <Image
                    src={column.iconUrl}
                    alt={column.title || `Feature ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              {/* Column Title - matches PDP subtitle styling */}
              {column.title && (
                <h3
                  className={cn(
                    'text-[11px] md:text-xs lg:text-sm font-bold uppercase mb-2',
                    styles.textColor
                  )}
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    letterSpacing: '0.1em',
                  }}
                >
                  {column.title}
                </h3>
              )}

              {/* Column Description */}
              {column.description && (
                <p
                  className={cn(
                    'text-[13px] md:text-sm leading-relaxed max-w-[260px]',
                    styles.mutedColor
                  )}
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {column.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Learn More Link */}
        {linkText && linkUrl && (
          <div className="flex justify-center mt-10 md:mt-12">
            <Link
              href={linkUrl}
              className={cn(
                'group inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase transition-colors',
                styles.linkColor,
                styles.linkHoverColor
              )}
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                letterSpacing: '0.12em',
              }}
            >
              {linkText}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
