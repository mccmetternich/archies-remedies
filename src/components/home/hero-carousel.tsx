'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { HeroSlide, type HeroSlideData } from './hero/hero-slide';

interface HeroCarouselProps {
  slides: HeroSlideData[];
  isPaused?: boolean; // Allow parent to pause carousel (e.g., when nav is open)
  autoAdvanceInterval?: number; // Seconds between slides (default 5)
  showTextGradient?: boolean; // Show white gradient overlay for text legibility on full-width
}

export function HeroCarousel({
  slides,
  isPaused = false,
  autoAdvanceInterval = 5,
  showTextGradient = false,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const isHoveredRef = useRef(false);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);

  // Detect mobile viewport for device-based filtering
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter slides based on device visibility settings
  const filteredSlides = slides.filter((slide) => {
    if (isMobile) {
      // On mobile, show slides where showOnMobile is true or undefined (default visible)
      return slide.showOnMobile !== false;
    } else {
      // On desktop, show slides where showOnDesktop is true or undefined (default visible)
      return slide.showOnDesktop !== false;
    }
  });

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % filteredSlides.length);
  }, [filteredSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + filteredSlides.length) % filteredSlides.length);
  }, [filteredSlides.length]);

  // Handle touch swipe for mobile navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
    touchEndRef.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const diff = touchStartRef.current - touchEndRef.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swiped left - go to next
        nextSlide();
      } else {
        // Swiped right - go to previous
        prevSlide();
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [nextSlide, prevSlide]);

  // Auto-advance - pause when parent says paused OR when user hovers
  // Using ref for hover state to avoid re-renders that trigger animations
  useEffect(() => {
    if (isPaused || filteredSlides.length <= 1) return;
    const timer = setInterval(() => {
      if (!isHoveredRef.current) {
        nextSlide();
      }
    }, autoAdvanceInterval * 1000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, filteredSlides.length, autoAdvanceInterval]);

  // Reset currentIndex if it's out of bounds after filtering
  useEffect(() => {
    if (currentIndex >= filteredSlides.length && filteredSlides.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, filteredSlides.length]);

  // Empty state fallback
  if (!filteredSlides || filteredSlides.length === 0) {
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

  const slide = filteredSlides[currentIndex];

  return (
    <section
      className="relative overflow-hidden h-auto lg:h-[calc(100vh-var(--pdp-header-height)-var(--homepage-marquee-height,100px))] lg:min-h-[500px] hero-flush-nav"
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Render the current slide */}
      <HeroSlide slide={slide} currentIndex={currentIndex} showTextGradient={showTextGradient} />

      {/* Mobile progress dots - positioned at bottom of content area */}
      {filteredSlides.length > 1 && (
        <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {filteredSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'bg-[var(--foreground)] w-5'
                  : 'bg-[var(--foreground)]/30'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Desktop progress indicator */}
      {filteredSlides.length > 1 && (
        <div className="hidden lg:flex absolute bottom-12 left-1/2 -translate-x-1/2 gap-3">
          {filteredSlides.map((_, index) => (
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
