'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
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

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (!slides || slides.length === 0) {
    return (
      <div className="relative h-[80vh] min-h-[600px] bg-gradient-to-br from-[var(--primary-light)] to-[var(--secondary)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-light mb-4">Safe, Dry Eye Relief</h1>
          <p className="text-lg text-[var(--muted-foreground)]">Made clean without the questionable ingredients</p>
        </div>
      </div>
    );
  }

  const slide = slides[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="relative h-[80vh] min-h-[600px] overflow-hidden bg-[var(--secondary)]">
      {/* Background Image */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          {slide.imageUrl ? (
            <Image
              src={slide.imageUrl}
              alt={slide.title || 'Hero image'}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-light)] to-[var(--secondary)]" />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container relative h-full flex items-center">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Social Proof Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-[var(--primary)] border-2 border-white flex items-center justify-center text-xs font-medium"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-[var(--muted-foreground)]">
                  2,500+ verified reviews
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-4">
                {slide.title || 'Safe, Dry Eye Relief'}
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-[var(--muted-foreground)] mb-8 max-w-lg">
                {slide.subtitle || 'Made clean without the questionable ingredients'}
              </p>

              {/* CTA Button */}
              {slide.buttonUrl && (
                <Link href={slide.buttonUrl}>
                  <Button size="lg" className="min-w-[200px]">
                    {slide.buttonText || 'Shop Now'}
                  </Button>
                </Link>
              )}

              {/* Testimonial */}
              {slide.testimonialText && (
                <div className="mt-10 p-6 bg-white/80 backdrop-blur-sm rounded-2xl max-w-md">
                  <p className="text-[var(--foreground)] italic mb-3">
                    {slide.testimonialText}
                  </p>
                  <div className="flex items-center gap-3">
                    {slide.testimonialAvatarUrl ? (
                      <Image
                        src={slide.testimonialAvatarUrl}
                        alt={slide.testimonialAuthor || 'Customer'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-sm font-medium">
                        {slide.testimonialAuthor?.charAt(0) || 'C'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{slide.testimonialAuthor}</p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[var(--foreground)] hover:bg-white transition-all duration-200 hover:scale-105"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[var(--foreground)] hover:bg-white transition-all duration-200 hover:scale-105"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'w-8 bg-[var(--foreground)]'
                  : 'bg-[var(--foreground)]/30 hover:bg-[var(--foreground)]/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
