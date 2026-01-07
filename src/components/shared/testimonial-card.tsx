'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TestimonialCardProps {
  avatarUrl: string;
  author: string;
  text: string;
  /**
   * 'desktop' - larger text, primary color stars, motion animation
   * 'mobile' - smaller text, light blue stars, no animation
   */
  variant?: 'desktop' | 'mobile';
  className?: string;
}

/**
 * Shared testimonial card component used in hero carousel.
 *
 * Desktop variant: Uses motion animation, primary color stars, larger sizing
 * Mobile variant: No animation, light blue (#bbdae9) stars, smaller text
 */
export const TestimonialCard = memo(function TestimonialCard({
  avatarUrl,
  author,
  text,
  variant = 'desktop',
  className,
}: TestimonialCardProps) {
  const isMobile = variant === 'mobile';

  const cardContent = (
    <div
      className={cn(
        'bg-white/95 backdrop-blur-sm shadow-xl border',
        isMobile
          ? 'inline-flex px-5 py-3 shadow-lg border-black/5'
          : 'px-5 py-4 border-white/20 max-w-md'
      )}
    >
      <div className={cn('flex items-center', isMobile ? 'gap-3' : 'gap-4')}>
        {/* Avatar */}
        <div
          className={cn(
            'rounded-full overflow-hidden bg-[var(--sand)] flex-shrink-0',
            'w-14 h-14'
          )}
        >
          <Image
            src={avatarUrl}
            alt={author || 'Customer'}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className={cn(isMobile ? 'min-w-0' : 'flex-1 min-w-0')}>
          {/* Author + Stars row */}
          <div
            className={cn(
              'flex items-center gap-2',
              isMobile ? 'mb-0.5' : 'mb-1'
            )}
          >
            <span
              className={cn(
                'font-semibold',
                isMobile
                  ? 'text-sm text-[var(--foreground)]'
                  : 'text-base text-[var(--foreground)]'
              )}
            >
              {author || 'Verified Buyer'}
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    isMobile
                      ? 'fill-[var(--primary)] text-[var(--primary)]'
                      : 'fill-[var(--primary)] text-[var(--primary)]'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Testimonial text */}
          <p
            className={cn(
              'leading-snug line-clamp-2',
              isMobile
                ? 'text-[13px] text-[var(--foreground)]/70'
                : 'text-base text-[var(--muted-foreground)]'
            )}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  );

  // Mobile variant - no animation wrapper
  if (isMobile) {
    return <div className={className}>{cardContent}</div>;
  }

  // Desktop variant - with motion animation
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className={className}
    >
      {cardContent}
    </motion.div>
  );
});

/**
 * Wrapper for mobile testimonial cards that provides centered positioning.
 * Used for overlapping testimonials at the bottom of media sections.
 */
export function MobileTestimonialWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'lg:hidden absolute bottom-4 left-0 right-0 z-30 flex justify-center px-4',
        className
      )}
    >
      {children}
    </div>
  );
}
