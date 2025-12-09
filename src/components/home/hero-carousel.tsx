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

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Auto-advance - pause when hovered OR when parent says paused
  useEffect(() => {
    if (isHovered || isPaused || slides.length <= 1) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered, isPaused, slides.length]);

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

  // Listen for custom event from header when nav dropdown opens/closes
  useEffect(() => {
    const handleNavOpen = () => setIsHovered(true);
    const handleNavClose = () => setIsHovered(false);

    window.addEventListener('nav-dropdown-open', handleNavOpen);
    window.addEventListener('nav-dropdown-close', handleNavClose);

    return () => {
      window.removeEventListener('nav-dropdown-open', handleNavOpen);
      window.removeEventListener('nav-dropdown-close', handleNavClose);
    };
  }, []);

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background - Full bleed editorial image with clickable overlay */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {slide.imageUrl ? (
            <>
              <Image
                src={slide.imageUrl}
                alt={slide.title || 'Hero image'}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              {/* Sophisticated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40" />
            </>
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

      {/* Content - Above the clickable overlay */}
      <div className="container relative z-20 min-h-screen flex items-center pointer-events-none">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-32 lg:py-40 pointer-events-auto">
          {/* Left - Text content */}
          <div className="max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentIndex}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
                      <Star key={i} className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)]">4.9</span>
                  <span className="text-sm text-[var(--muted-foreground)]">2,500+ Verified Reviews</span>
                </motion.div>

                {/* Title - Editorial typography */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-[clamp(2.5rem,5vw,4.5rem)] font-normal leading-[1.05] tracking-[-0.03em] mb-6"
                >
                  {slide.title || 'Instant Relief,\nClean Formula'}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-lg md:text-xl text-[var(--muted-foreground)] mb-10 leading-relaxed max-w-md"
                >
                  {slide.subtitle || 'Preservative-free eye drops crafted for sensitive eyes. Feel the difference of truly clean ingredients.'}
                </motion.p>

                {/* CTA - Primary big, secondary smaller */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex flex-wrap items-center gap-4"
                >
                  {slide.buttonUrl && (
                    <Link
                      href={slide.buttonUrl}
                      className="group inline-flex items-center gap-3 px-10 py-5 bg-[var(--primary)] text-[var(--foreground)] rounded-full text-lg font-semibold hover:bg-[var(--primary-dark)] transition-all duration-300 hover:gap-4 shadow-lg hover:shadow-xl"
                    >
                      {slide.buttonText || 'Shop Now'}
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                  <Link
                    href={slide.secondaryButtonUrl || '/about'}
                    className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[var(--foreground)] hover:text-[var(--muted-foreground)] transition-colors border border-[var(--foreground)]/20 hover:border-[var(--foreground)]/40 rounded-full"
                  >
                    {slide.secondaryButtonText || 'Learn More'}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right - Featured testimonial card - Synced with content animation */}
          <AnimatePresence mode="wait">
            {slide.testimonialText && (
              <motion.div
                key={`testimonial-${currentIndex}`}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="hidden lg:block"
              >
                <div className="relative">
                  {/* Decorative element */}
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-[var(--primary)] rounded-full opacity-40 blur-3xl" />

                  <div className="relative bg-white p-10 rounded-3xl shadow-xl border border-[var(--border-light)]">
                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-5 h-5 fill-[var(--foreground)] text-[var(--foreground)]" />
                      ))}
                    </div>
                    <blockquote className="text-xl leading-relaxed mb-8 text-[var(--foreground)]">
                      &ldquo;{slide.testimonialText}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--sand)]">
                        <Image
                          src={slide.testimonialAvatarUrl || DEFAULT_AVATAR}
                          alt={slide.testimonialAuthor || 'Customer'}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{slide.testimonialAuthor || 'Verified Buyer'}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">Verified Purchase</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
