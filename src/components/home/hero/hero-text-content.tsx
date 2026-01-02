'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeroTextContentProps {
  currentIndex: number;
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  secondaryButtonText: string | null;
  secondaryButtonUrl: string | null;
  isLightText: boolean;
}

/**
 * Desktop text content component for the hero carousel.
 * Includes animated title, subtitle, star ratings, and CTA buttons.
 */
export function HeroTextContent({
  currentIndex,
  title,
  subtitle,
  buttonText,
  buttonUrl,
  secondaryButtonText,
  secondaryButtonUrl,
  isLightText,
}: HeroTextContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`content-${currentIndex}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: 'opacity, transform' }}
      >
        {/* Stars and Verified Reviews - Above title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  'w-6 h-6',
                  isLightText
                    ? 'fill-white text-white'
                    : 'fill-[var(--primary)] text-[var(--primary)]'
                )}
              />
            ))}
          </div>
          <span
            className={cn(
              'text-lg font-semibold',
              isLightText ? 'text-white' : 'text-[var(--foreground)]'
            )}
          >
            4.9
          </span>
          <span
            className={cn(
              'text-lg',
              isLightText ? 'text-white/80' : 'text-[var(--muted-foreground)]'
            )}
          >
            2,500+ Verified Reviews
          </span>
        </motion.div>

        {/* Title - Editorial typography (scaled down 15%) */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className={cn(
            'text-[clamp(3rem,7vw,6.5rem)] font-normal leading-[1.02] tracking-[-0.03em] mb-8 max-w-3xl',
            isLightText ? 'text-white' : 'text-[var(--foreground)]'
          )}
        >
          {title || 'Instant Relief,\nClean Formula'}
        </motion.h1>

        {/* Subtitle (scaled down 15%) */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={cn(
            'text-xl md:text-2xl mb-10 leading-relaxed max-w-xl',
            isLightText ? 'text-white/90' : 'text-[var(--muted-foreground)]'
          )}
        >
          {subtitle ||
            'Preservative-free eye drops crafted for sensitive eyes. Feel the difference of truly clean ingredients.'}
        </motion.p>

        {/* CTA - Buttons with hover states (both same size, proper styling) */}
        {/* Using guaranteed CSS classes from globals.css to prevent Tailwind v4 issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-wrap items-center gap-4"
        >
          {/* Primary button - uses hero-btn-dark/light classes for guaranteed styling */}
          {buttonUrl && (
            <Link
              href={buttonUrl}
              className={cn(
                'group inline-flex items-center justify-center gap-3 px-7 py-4 text-sm font-medium uppercase tracking-wider transition-all duration-300',
                isLightText ? 'hero-btn-light' : 'hero-btn-dark'
              )}
            >
              {buttonText || 'Shop Now'}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
          {/* Secondary button - uses hero-btn-outline-dark/light classes */}
          <Link
            href={secondaryButtonUrl || '/about'}
            className={cn(
              'hidden md:inline-flex group items-center justify-center gap-3 px-7 py-4 text-sm font-medium uppercase tracking-wider border-2 transition-all duration-300',
              isLightText ? 'hero-btn-outline-light' : 'hero-btn-outline-dark'
            )}
          >
            {secondaryButtonText || 'Learn More'}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export interface MobileTextContentProps {
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
}

/**
 * Mobile-specific text content component for the hero carousel.
 * Fixed gaps, container grows with content.
 */
export function MobileTextContent({
  title,
  subtitle,
  buttonText,
  buttonUrl,
}: MobileTextContentProps) {
  return (
    <div className="flex flex-col">
      {/* Title */}
      <h1 className="!text-[24px] !font-bold uppercase leading-tight tracking-tight text-[#1a1a1a]">
        {title || 'Instant Relief, Clean Formula'}
      </h1>

      {/* Reviews */}
      <div className="flex items-center gap-2 mt-3">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-5 h-5 fill-[#bbdae9] text-[#bbdae9]" />
          ))}
        </div>
        <span className="text-[13px] text-[#1a1a1a] font-normal inline-flex items-center gap-1">
          2,500+
          <span className="w-4 h-4 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
          </span>
          Verified Reviews
        </span>
      </div>

      {/* Body copy - natural height */}
      <p className="text-[15px] text-[#1a1a1a]/70 leading-relaxed mt-3">
        {subtitle || 'Preservative-free eye drops crafted for sensitive eyes.'}
      </p>

      {/* CTA - fixed 20px gap from body copy */}
      {buttonUrl && (
        <Link
          href={buttonUrl}
          className="group flex items-center justify-center gap-2 w-full py-[18px] mt-5 text-xs font-medium uppercase tracking-wide transition-all duration-300"
          style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}
        >
          {buttonText || 'Shop Now'}
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
