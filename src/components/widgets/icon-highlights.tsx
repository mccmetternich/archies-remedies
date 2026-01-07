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
    // Using hex values for inline styles (avoids Tailwind override issues)
    linkColorHex: string;
    linkHoverHex: string;
  }
> = {
  blue: {
    bg: 'bg-[var(--primary)]',
    titleColor: 'var(--foreground)',
    textColor: 'var(--foreground)',
    mutedColor: '#333333',
    linkColorHex: 'var(--foreground)',
    linkHoverHex: '#333333',
  },
  dark: {
    bg: 'bg-[var(--foreground)]',
    titleColor: '#ffffff',
    textColor: '#ffffff',
    mutedColor: 'rgba(255,255,255,0.85)',
    linkColorHex: '#ffffff',
    linkHoverHex: 'rgba(255,255,255,0.8)',
  },
  cream: {
    bg: 'bg-[#f5f1eb]',
    titleColor: 'var(--foreground)',
    textColor: 'var(--foreground)',
    mutedColor: '#333333',
    linkColorHex: 'var(--foreground)',
    linkHoverHex: '#333333',
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
        {/* Section Title - matches PDP subtitle styling exactly */}
        {title && (
          <h2
            className="text-center uppercase mb-10 md:mb-12"
            style={{
              
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: styles.titleColor,
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

              {/* Column Title - matches PDP subtitle styling, slightly smaller */}
              {column.title && (
                <h3
                  className="uppercase mb-2"
                  style={{
                    
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: styles.textColor,
                  }}
                >
                  {column.title}
                </h3>
              )}

              {/* Column Description */}
              {column.description && (
                <p
                  className="text-[13px] md:text-sm leading-relaxed max-w-[260px]"
                  style={{
                    
                    color: styles.mutedColor,
                  }}
                >
                  {column.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Learn More Link - using inline styles to avoid Tailwind override issues */}
        {linkText && linkUrl && (
          <div className="flex justify-center mt-10 md:mt-12">
            <Link
              href={linkUrl}
              className="group inline-flex items-center gap-2 uppercase transition-colors"
              style={{
                
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: styles.linkColorHex,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = styles.linkHoverHex)}
              onMouseLeave={(e) => (e.currentTarget.style.color = styles.linkColorHex)}
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
