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
  testimonialText: string | null;
  testimonialAuthor: string | null;
  testimonialAvatarUrl: string | null;
  layout?: string | null; // 'full-width', 'two-column', 'two-column-reversed'
  textColor?: string | null; // 'dark', 'light'
}

// Default avatar if none provided
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face';

interface HeroCarouselProps {
  slides: HeroSlide[];
  isPaused?: boolean; // Allow parent to pause carousel (e.g., when nav is open)
}

export function HeroCarousel({ slides, isPaused = false }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [debouncedHovered, setDebouncedHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Debounce hover state to prevent flickering when mouse briefly leaves
  useEffect(() => {
    if (isHovered) {
      setDebouncedHovered(true);
    } else {
      // Small delay before resuming auto-advance
      const timer = setTimeout(() => setDebouncedHovered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  // Auto-advance - pause when hovered OR when parent says paused
  useEffect(() => {
    if (debouncedHovered || isPaused || slides.length <= 1) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [nextSlide, debouncedHovered, isPaused, slides.length]);

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

  // Text content component (shared between layouts)
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
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={cn(
                "w-4 h-4",
                isLightText ? "fill-white text-white" : "fill-[var(--primary)] text-[var(--primary)]"
              )} />
            ))}
          </div>
          <span className={cn("text-sm font-medium", isLightText ? "text-white" : "text-[var(--foreground)]")}>4.9</span>
          <span className={cn("text-sm", isLightText ? "text-white/80" : "text-[var(--muted-foreground)]")}>2,500+ Verified Reviews</span>
        </motion.div>

        {/* Title - Editorial typography */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className={cn(
            "text-[clamp(2.5rem,5vw,4.5rem)] font-normal leading-[1.05] tracking-[-0.03em] mb-6",
            isLightText ? "text-white" : "text-[var(--foreground)]"
          )}
        >
          {slide.title || 'Instant Relief,\nClean Formula'}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={cn(
            "text-lg md:text-xl mb-10 leading-relaxed max-w-md",
            isLightText ? "text-white/90" : "text-[var(--muted-foreground)]"
          )}
        >
          {slide.subtitle || 'Preservative-free eye drops crafted for sensitive eyes. Feel the difference of truly clean ingredients.'}
        </motion.p>

        {/* CTA - Buttons with hover states */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-wrap items-center gap-4"
        >
          {/* Primary button */}
          {slide.buttonUrl && (
            <Link
              href={slide.buttonUrl}
              className={cn(
                "group inline-flex items-center gap-3 px-6 py-4 rounded-full text-base font-semibold transition-all duration-300",
                isLightText
                  ? "bg-white text-[#1a1a1a] hover:bg-white/90"
                  : "cta-button-primary cta-button-primary-lg"
              )}
            >
              {slide.buttonText || 'Shop Now'}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
          {/* Secondary button - hidden on mobile */}
          <Link
            href={slide.secondaryButtonUrl || '/about'}
            className={cn(
              "hidden md:inline-flex group items-center gap-3 px-6 py-4 rounded-full text-base font-semibold border-2 transition-all duration-300",
              isLightText
                ? "border-white/40 text-white hover:bg-white/10 hover:border-white/60"
                : "border-[#1a1a1a]/20 bg-white text-[#1a1a1a] hover:bg-[#f5f5f5] hover:border-[#1a1a1a]/40"
            )}
          >
            {slide.secondaryButtonText || 'Learn More'}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        isTwoColumn
          ? "min-h-[600px] lg:min-h-[700px]"
          : "h-[90vh] min-h-[700px] max-h-[950px]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            {slide.imageUrl ? (
              <Image
                src={slide.imageUrl}
                alt={slide.title || 'Hero image'}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--cream)] via-white to-[var(--primary-light)]" />
            )}

            {/* Clickable overlay - links entire hero to primary button URL */}
            {slide.buttonUrl && (
              <Link
                href={slide.buttonUrl}
                className="absolute inset-0 z-10"
                aria-label={slide.buttonText || 'Shop Now'}
              />
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
        // Two-column layout
        <div className="container relative z-20 h-full">
          <div className={cn(
            "grid lg:grid-cols-2 gap-8 lg:gap-16 h-full items-center py-12 lg:py-0",
            isReversed && "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
          )}>
            {/* Text content */}
            <div className="max-w-xl py-8 lg:py-16">
              <TextContent />
            </div>

            {/* Image */}
            <AnimatePresence mode="sync">
              <motion.div
                key={`image-${currentIndex}`}
                initial={{ opacity: 0, x: isReversed ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isReversed ? 30 : -30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-[400px] lg:h-[600px] rounded-2xl overflow-hidden"
              >
                {slide.imageUrl ? (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title || 'Hero image'}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)]" />
                )}

                {/* Clickable overlay for two-column */}
                {slide.buttonUrl && (
                  <Link
                    href={slide.buttonUrl}
                    className="absolute inset-0 z-10"
                    aria-label={slide.buttonText || 'Shop Now'}
                  />
                )}

                {/* Testimonial card - centered at bottom of media column (two-column layout) */}
                {slide.testimonialText && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-sm pointer-events-auto"
                  >
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-xl border border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--sand)] flex-shrink-0">
                          <Image
                            src={slide.testimonialAvatarUrl || DEFAULT_AVATAR}
                            alt={slide.testimonialAuthor || 'Customer'}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-sm text-[var(--foreground)]">{slide.testimonialAuthor || 'Verified Buyer'}</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className="w-3 h-3 fill-[var(--primary)] text-[var(--primary)]" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-[var(--muted-foreground)] leading-snug line-clamp-2">
                            &ldquo;{slide.testimonialText}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
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

      {/* Featured testimonial card - For full-width layout only (two-column has it inside image) */}
      {!isTwoColumn && (
        <AnimatePresence mode="wait">
          {slide.testimonialText && (
            <motion.div
              key={`testimonial-${currentIndex}`}
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 10, x: 10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              style={{ willChange: 'opacity, transform' }}
              className="hidden lg:block absolute bottom-24 right-8 xl:right-16 z-30 pointer-events-auto"
            >
              <div className="relative max-w-sm">
                {/* Decorative element */}
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-[var(--primary)] rounded-full opacity-30 blur-2xl" />

                <div className="relative bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-[var(--border-light)]">
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-[var(--foreground)] text-[var(--foreground)]" />
                    ))}
                  </div>
                  <blockquote className="text-base leading-relaxed mb-4 text-[var(--foreground)]">
                    &ldquo;{slide.testimonialText}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--sand)]">
                      <Image
                        src={slide.testimonialAvatarUrl || DEFAULT_AVATAR}
                        alt={slide.testimonialAuthor || 'Customer'}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{slide.testimonialAuthor || 'Verified Buyer'}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">Verified Purchase</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
