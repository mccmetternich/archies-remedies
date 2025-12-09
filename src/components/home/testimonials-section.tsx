'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  avatarUrl: string | null;
  rating: number | null;
  text: string;
  isVerified: boolean | null;
  isFeatured: boolean | null;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
}

// Avatar images for fallback
const AVATAR_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
];

export function TestimonialsSection({
  testimonials,
  title = 'What Our Customers Say',
  subtitle = 'Real stories from people who made the switch to clean eye care.',
}: TestimonialsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 420;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="section bg-[var(--cream)] overflow-hidden">
      <div className="container">
        {/* Header - Editorial Style */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-6">
              <span className="w-12 h-px bg-[var(--foreground)]" />
              Reviews
            </span>
            <h2 className="text-balance">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <p className="text-lg text-[var(--muted-foreground)] max-w-sm leading-relaxed hidden md:block">
              {subtitle}
            </p>

            {/* Navigation - Minimal */}
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-white hover:border-transparent transition-all duration-300"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-white hover:border-transparent transition-all duration-300"
                aria-label="Next testimonials"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll - Full bleed */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-[max(1.5rem,calc((100vw-1440px)/2+5rem))]"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={cn(
              'flex-shrink-0 w-[360px] md:w-[400px] bg-white rounded-2xl p-8 relative',
              'shadow-sm hover:shadow-lg transition-shadow duration-300',
              testimonial.isFeatured && 'ring-2 ring-[var(--primary)]'
            )}
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* Stars - Black */}
            <div className="flex gap-1 mb-6">
              {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[var(--foreground)] text-[var(--foreground)]" />
              ))}
            </div>

            {/* Review Text */}
            <p className="text-[var(--foreground)] leading-relaxed mb-8 text-lg">
              &ldquo;{testimonial.text}&rdquo;
            </p>

            {/* Author - Clean design */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--sand)] shrink-0">
                <Image
                  src={testimonial.avatarUrl || AVATAR_IMAGES[index % AVATAR_IMAGES.length]}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--foreground)]">{testimonial.name}</p>
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  {testimonial.location && (
                    <span>{testimonial.location}</span>
                  )}
                  {testimonial.isVerified && testimonial.location && (
                    <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]" />
                  )}
                  {testimonial.isVerified && (
                    <span className="text-[var(--primary-dark)]">Verified</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* CTA Card - Editorial style */}
        <div
          className="flex-shrink-0 w-[360px] md:w-[400px] bg-[var(--foreground)] rounded-2xl p-8 flex flex-col justify-center"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="flex gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 fill-white text-white" />
            ))}
          </div>
          <p className="text-4xl font-normal text-white mb-2 tracking-tight">4.9</p>
          <p className="text-white/60 mb-8">Average rating from 2,500+ customers</p>
          <Link
            href="/products/eye-drops"
            className="group inline-flex items-center gap-3 text-sm font-medium text-white hover:text-[var(--primary)] transition-colors"
          >
            Join Them
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>
      </div>

      {/* Bottom Stats - Minimal */}
      <div className="container mt-20">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent mb-12" />
        <div className="flex flex-wrap justify-center gap-12 md:gap-20">
          <div className="text-center">
            <p className="text-4xl font-normal tracking-tight">2,500+</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">Happy Customers</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-normal tracking-tight">98%</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">Would Recommend</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-normal tracking-tight">24hr</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">Avg. Relief Time</p>
          </div>
        </div>
      </div>
    </section>
  );
}
