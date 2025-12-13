'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  secondaryButtonText: string | null;
  secondaryButtonUrl: string | null;
  secondaryButtonType: string | null; // 'page', 'anchor', 'external'
  secondaryAnchorTarget: string | null;
  imageUrl: string;
  videoUrl?: string | null;
  mobileImageUrl?: string | null;
  mobileVideoUrl?: string | null;
  testimonialText: string | null;
  testimonialAuthor: string | null;
  testimonialAvatarUrl: string | null;
  layout?: string | null; // 'full-width', 'two-column', 'two-column-reversed'
  textColor?: string | null; // 'dark', 'light'
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  isPaused?: boolean; // Allow parent to pause carousel (e.g., when nav is open)
  autoAdvanceInterval?: number; // Seconds between slides (default 5)
}

export function HeroCarousel({ slides, isPaused = false, autoAdvanceInterval = 5 }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Auto-advance - only pause when parent says paused (e.g., nav open)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(nextSlide, autoAdvanceInterval * 1000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, slides.length, autoAdvanceInterval]);

  if (!slides || slides.length === 0) {
    return (
      <section className="relative min-h-screen bg-[var(--cream)] flex items-center">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="mb-6">
              Clean Eye Care,<br />Instant Relief
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
  const layout = slide.layout || 'full-width';
  const textColor = slide.textColor || 'dark';
  const isLightText = textColor === 'light';
  const isTwoColumn = layout === 'two-column' || layout === 'two-column-reversed';
  const isReversed = layout === 'two-column-reversed';

  // Text content component (shared between layouts) - scaled down 15% from previous
  const TextContent = () => (
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
              <Star key={i} className={cn(
                "w-6 h-6",
                isLightText ? "fill-white text-white" : "fill-[var(--primary)] text-[var(--primary)]"
              )} />
            ))}
          </div>
          <span className={cn("text-lg font-semibold", isLightText ? "text-white" : "text-[var(--foreground)]")}>4.9</span>
          <span className={cn("text-lg", isLightText ? "text-white/80" : "text-[var(--muted-foreground)]")}>2,500+ Verified Reviews</span>
        </motion.div>

        {/* Title - Editorial typography (scaled down 15%) */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className={cn(
            "text-[clamp(3rem,7vw,6.5rem)] font-normal leading-[1.02] tracking-[-0.03em] mb-8 max-w-3xl",
            isLightText ? "text-white" : "text-[var(--foreground)]"
          )}
        >
          {slide.title || 'Instant Relief,\nClean Formula'}
        </motion.h1>

        {/* Subtitle (scaled down 15%) */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={cn(
            "text-xl md:text-2xl mb-10 leading-relaxed max-w-xl",
            isLightText ? "text-white/90" : "text-[var(--muted-foreground)]"
          )}
        >
          {slide.subtitle || 'Preservative-free eye drops crafted for sensitive eyes. Feel the difference of truly clean ingredients.'}
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
          {slide.buttonUrl && (
            <Link
              href={slide.buttonUrl}
              className={cn(
                "group inline-flex items-center justify-center gap-3 px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300 min-h-[60px]",
                isLightText ? "hero-btn-light" : "hero-btn-dark"
              )}
            >
              {slide.buttonText || 'Shop Now'}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
          {/* Secondary button - uses hero-btn-outline-dark/light classes */}
          <Link
            href={slide.secondaryButtonUrl || '/about'}
            className={cn(
              "hidden md:inline-flex group items-center justify-center gap-3 px-8 py-5 rounded-full text-lg font-semibold border-2 transition-all duration-300 min-h-[60px]",
              isLightText ? "hero-btn-outline-light" : "hero-btn-outline-dark"
            )}
          >
            {slide.secondaryButtonText || 'Learn More'}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Use consistent height for all layouts to prevent jumping
  return (
    <section
      className="relative overflow-hidden h-[85vh] min-h-[600px] max-h-[850px]"
    >
      {/* Background for full-width layout */}
      {!isTwoColumn && (
        <AnimatePresence mode="sync">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
            style={{ willChange: 'opacity' }}
          >
            {/* Video or Image background */}
            {/* Full-width layout: image covers entire hero section */}
            {/* Recommended: 2400x1350px (16:9) or 2400x1600px for full-width hero */}
            {slide.videoUrl ? (
              <video
                src={slide.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            ) : slide.imageUrl ? (
              <Image
                src={slide.imageUrl}
                alt={slide.title || 'Hero image'}
                fill
                className="object-cover object-center"
                priority
                sizes="100vw"
              />
            ) : null}

            {/* Clickable overlay - links entire hero to primary button URL */}
            {slide.buttonUrl && (
              <Link
                href={slide.buttonUrl}
                className="absolute inset-0 z-10"
                aria-label={slide.buttonText || 'Shop Now'}
              />
            )}

            {/* Testimonial card - positioned in bottom-center of right virtual column (full-width layout) */}
            {slide.testimonialText && slide.testimonialAvatarUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="hidden lg:flex absolute bottom-24 right-[12.5%] z-20 w-full max-w-md justify-center pointer-events-auto"
              >
                <div className="bg-white/95 backdrop-blur-sm px-5 py-4 rounded-2xl shadow-xl border border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-[var(--sand)] flex-shrink-0">
                      <Image
                        src={slide.testimonialAvatarUrl}
                        alt={slide.testimonialAuthor || 'Customer'}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-base text-[var(--foreground)]">{slide.testimonialAuthor || 'Verified Buyer'}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]" />
                          ))}
                        </div>
                      </div>
                      <p className="text-base text-[var(--muted-foreground)] leading-snug line-clamp-2">
                        {slide.testimonialText}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Two-column layout background (cream/light background) */}
      {isTwoColumn && (
        <div className="absolute inset-0 bg-[var(--cream)]" />
      )}

      {/* Content */}
      {isTwoColumn ? (
        // Two-column layout - wide gap, full-width media
        <div className="relative z-20 h-full">
          <div className={cn(
            "grid lg:grid-cols-2 h-full items-stretch",
            isReversed && "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
          )}>
            {/* Text content with testimonial at bottom - centered in column */}
            <div className="flex flex-col justify-center items-center h-full py-12 lg:py-16 px-6">
              <div className="w-full max-w-xl">
                <TextContent />
              </div>

              {/* Testimonial card - at bottom of content column (two-column layout) */}
              {slide.testimonialText && slide.testimonialAvatarUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                  className="mt-10 w-full max-w-md pointer-events-auto"
                >
                  <div className="bg-white/95 backdrop-blur-sm px-5 py-4 rounded-2xl shadow-xl border border-black/5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-[var(--sand)] flex-shrink-0">
                        <Image
                          src={slide.testimonialAvatarUrl}
                          alt={slide.testimonialAuthor || 'Customer'}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-base text-[var(--foreground)]">{slide.testimonialAuthor || 'Verified Buyer'}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star key={i} className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]" />
                            ))}
                          </div>
                        </div>
                        <p className="text-base text-[var(--muted-foreground)] leading-snug line-clamp-2">
                          {slide.testimonialText}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Media - Full width of column, full height */}
            {/* Image sizing convention: object-cover fills container, object-position centers by default */}
            {/* For product shots, use object-position: center to keep subject centered */}
            {/* Recommended: Upload images at 1200x1600px (3:4 portrait) or 1600x1200px (4:3 landscape) */}
            <AnimatePresence mode="sync">
              <motion.div
                key={`image-${currentIndex}`}
                initial={{ opacity: 0, x: isReversed ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isReversed ? 30 : -30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full min-h-[400px] lg:min-h-full overflow-hidden"
              >
                {/* Video or Image - full width of column */}
                {/* object-cover: scales to fill container, crops overflow */}
                {/* object-position: center centers the subject (default behavior) */}
                {slide.videoUrl ? (
                  <video
                    src={slide.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover object-center"
                  />
                ) : slide.imageUrl ? (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title || 'Hero image'}
                    fill
                    className="object-cover object-center"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : null}

                {/* Clickable overlay for two-column */}
                {slide.buttonUrl && (
                  <Link
                    href={slide.buttonUrl}
                    className="absolute inset-0 z-10"
                    aria-label={slide.buttonText || 'Shop Now'}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        // Full-width layout (original)
        <div className="container relative z-20 h-full flex items-center pointer-events-none">
          <div className="pointer-events-auto w-full">
            <div className="max-w-xl">
              <TextContent />
            </div>
          </div>
        </div>
      )}


      {/* Minimal progress indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-1 rounded-full transition-all duration-500',
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
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-[var(--foreground)] to-transparent"
        />
      </motion.div>
    </section>
  );
}
