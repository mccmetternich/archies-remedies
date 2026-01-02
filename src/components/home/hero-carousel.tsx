'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { HeroSlide, type HeroSlideData } from './hero/hero-slide';

interface HeroCarouselProps {
  slides: HeroSlideData[];
  isPaused?: boolean; // Allow parent to pause carousel (e.g., when nav is open)
  autoAdvanceInterval?: number; // Seconds between slides (default 5)
}

export function HeroCarousel({
  slides,
  isPaused = false,
  autoAdvanceInterval = 5,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isHoveredRef = useRef(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Auto-advance - pause when parent says paused OR when user hovers
  // Using ref for hover state to avoid re-renders that trigger animations
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      if (!isHoveredRef.current) {
        nextSlide();
      }
    }, autoAdvanceInterval * 1000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, slides.length, autoAdvanceInterval]);

  // Empty state fallback
  if (!slides || slides.length === 0) {
    return (
      <section className="relative min-h-screen bg-[var(--cream)] flex items-center">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="mb-6">
              Clean Eye Care,
              <br />
              Instant Relief
            </h1>
            <p className="text-xl text-[var(--muted-foreground)] mb-10">
              Preservative-free formulas for lasting comfort
            </p>
          </div>
        </div>
      </section>
    );
  }

  const slide = slides[currentIndex];

  return (
    <section
      className="relative overflow-hidden h-auto lg:h-[85vh] lg:min-h-[600px] lg:max-h-[850px]"
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
    >
      {/* Render the current slide */}
      <HeroSlide slide={slide} currentIndex={currentIndex} />

      {/* Minimal progress indicator - desktop only */}
      {slides.length > 1 && (
        <div className="hidden lg:flex absolute bottom-12 left-1/2 -translate-x-1/2 gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-1 transition-all duration-500',
                index === currentIndex
                  ? 'w-12 bg-[var(--foreground)]'
                  : 'w-1 bg-[var(--foreground)]/20 hover:bg-[var(--foreground)]/40'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-12 right-12 hidden lg:flex flex-col items-center gap-2"
      >
        <span className="text-xs tracking-widest uppercase text-[var(--muted-foreground)] [writing-mode:vertical-rl]">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-px h-12 bg-gradient-to-b from-[var(--foreground)] to-transparent"
        />
      </motion.div>
    </section>
  );
}

// Re-export the HeroSlideData type for consumers
export type { HeroSlideData as HeroSlide } from './hero/hero-slide';
