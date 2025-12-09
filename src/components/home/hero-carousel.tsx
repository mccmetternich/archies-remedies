'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  imageUrl: string;
  testimonialText: string | null;
  testimonialAuthor: string | null;
  testimonialAvatarUrl: string | null;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

// Avatar images from Unsplash
const AVATAR_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
];

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance with slower timing
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered, slides.length]);

  if (!slides || slides.length === 0) {
    return (
      <section className="relative min-h-[90vh] bg-gradient-to-br from-[var(--primary-light)] via-white to-[var(--secondary)] flex items-center">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] mb-6">
              Safe, Effective<br />Eye Relief
            </h1>
            <p className="text-xl text-[var(--muted-foreground)] mb-8">
              Made clean without the questionable ingredients
            </p>
          </div>
        </div>
      </section>
    );
  }

  const slide = slides[currentIndex];

  return (
    <section
      className="relative min-h-[90vh] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background with smooth crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
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
              {/* Elegant gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-light)] via-white to-[var(--secondary)]" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container relative min-h-[90vh] flex items-center py-32">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentIndex}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Social Proof - Real avatars */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex -space-x-3">
                  {AVATAR_IMAGES.slice(0, 4).map((src, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-[3px] border-white overflow-hidden shadow-md"
                    >
                      <Image
                        src={src}
                        alt="Customer"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-2 text-sm font-semibold">4.9</span>
                  </div>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    2,500+ verified reviews
                  </span>
                </div>
              </div>

              {/* Title - Large & Elegant */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.05] mb-6 tracking-tight">
                {slide.title || 'Safe, Effective Eye Relief'}
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-[var(--muted-foreground)] mb-10 max-w-xl leading-relaxed">
                {slide.subtitle || 'Made clean without the questionable ingredients'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-12">
                {slide.buttonUrl && (
                  <Link href={slide.buttonUrl}>
                    <Button size="lg" className="min-w-[200px] text-sm">
                      {slide.buttonText || 'Shop Now'}
                    </Button>
                  </Link>
                )}
                <Link href="/about">
                  <Button variant="outline" size="lg" className="min-w-[160px] text-sm">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--muted-foreground)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[var(--primary-dark)]" />
                  <span>Preservative Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[var(--primary-dark)]" />
                  <span>Ophthalmologist Tested</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[var(--primary-dark)]" />
                  <span>Clean Formula</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Testimonial Card */}
          {slide.testimonialText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-12 p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg max-w-md border border-white/50"
            >
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[var(--foreground)] leading-relaxed mb-4">
                &ldquo;{slide.testimonialText}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--primary-light)]">
                  {slide.testimonialAvatarUrl ? (
                    <Image
                      src={slide.testimonialAvatarUrl}
                      alt={slide.testimonialAuthor || 'Customer'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={AVATAR_IMAGES[0]}
                      alt="Customer"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{slide.testimonialAuthor || 'Verified Buyer'}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Verified Purchase</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation - Elegant arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[var(--foreground)] shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/50"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[var(--foreground)] shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/50"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Progress Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-500',
                index === currentIndex
                  ? 'w-10 bg-[var(--foreground)]'
                  : 'w-2 bg-[var(--foreground)]/25 hover:bg-[var(--foreground)]/40'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
