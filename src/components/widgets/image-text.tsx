'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type ImagePosition = 'left' | 'right';
type CtaType = 'external' | 'anchor' | 'page';
type CtaTarget = '_self' | '_blank';

interface ImageTextProps {
  // Image
  imageUrl: string;
  imageAlt?: string;
  imagePosition?: ImagePosition;

  // Content
  eyebrow?: string;
  title: string;
  body?: string;

  // CTA (optional)
  showCta?: boolean;
  ctaText?: string;
  ctaType?: CtaType;
  ctaUrl?: string;
  ctaTarget?: CtaTarget;
  anchorWidgetId?: string; // For jumping to a widget on the same page
  anchorPage?: string; // For jumping to a widget on a different page (e.g., "/products/eye-drops#benefits")

  // Styling
  backgroundColor?: string;
  className?: string;
}

export function ImageText({
  imageUrl,
  imageAlt = '',
  imagePosition = 'left',

  eyebrow,
  title,
  body,

  showCta = false,
  ctaText = 'Learn More',
  ctaType = 'external',
  ctaUrl = '#',
  ctaTarget = '_self',
  anchorWidgetId,
  anchorPage,

  backgroundColor,
  className,
}: ImageTextProps) {
  // Determine the final URL based on CTA type
  const getFinalUrl = () => {
    if (ctaType === 'anchor' && anchorWidgetId) {
      return `#${anchorWidgetId}`;
    }
    if (ctaType === 'page' && anchorPage) {
      return anchorPage; // This can include anchor like "/products/eye-drops#benefits"
    }
    return ctaUrl;
  };

  const handleClick = (e: React.MouseEvent) => {
    // For anchor links on the same page, smooth scroll
    if (ctaType === 'anchor' && anchorWidgetId) {
      e.preventDefault();
      const element = document.getElementById(anchorWidgetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const imageSection = (
    <div className={cn(
      "relative aspect-[4/3] lg:aspect-auto lg:h-full min-h-[300px] lg:min-h-[500px] rounded-2xl lg:rounded-3xl overflow-hidden",
      imagePosition === 'right' && "lg:order-last"
    )}>
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </div>
  );

  const textSection = (
    <div className="flex flex-col justify-center py-8 lg:py-16">
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-[var(--muted-foreground)] mb-4">
          <span className="w-8 h-px bg-[var(--foreground)]/30" />
          {eyebrow}
        </span>
      )}

      <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 leading-tight">
        {title}
      </h2>

      {body && (
        <div
          className="text-lg text-[var(--muted-foreground)] leading-relaxed mb-8 prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      )}

      {showCta && (
        <div>
          <Link
            href={getFinalUrl()}
            target={ctaType === 'external' && ctaTarget === '_blank' ? '_blank' : undefined}
            rel={ctaType === 'external' && ctaTarget === '_blank' ? 'noopener noreferrer' : undefined}
            onClick={handleClick}
            className="group flex md:inline-flex items-center justify-center gap-3 w-full md:w-auto px-8 py-4 bg-[var(--foreground)] text-white text-sm font-semibold uppercase tracking-[0.1em] hover:bg-[var(--primary)] hover:text-[var(--foreground)] transition-all duration-300"
          >
            {ctaText}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <section
      className={cn('py-16 md:py-24', className)}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image always first in DOM (on top for mobile), uses lg:order-last when position='right' */}
          {imageSection}
          {textSection}
        </div>
      </div>
    </section>
  );
}

// Export types for admin usage
export type { ImagePosition, CtaType, CtaTarget, ImageTextProps };
