'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, Quote, BadgeCheck } from 'lucide-react';
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
  title = 'Loved by Thousands',
  subtitle = 'Real reviews from real customers who trust Archie\'s for their eye care.',
}: TestimonialsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
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
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--primary-dark)] mb-4 block">
              Customer Reviews
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
              {title}
            </h2>
            <p className="text-[var(--muted-foreground)] text-lg">
              {subtitle}
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--muted)] hover:border-transparent transition-all duration-300"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--muted)] hover:border-transparent transition-all duration-300"
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-[max(1.5rem,calc((100vw-1400px)/2+4rem))]"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={cn(
              'flex-shrink-0 w-[350px] md:w-[400px] bg-[var(--muted)] rounded-2xl p-8 relative',
              'hover:shadow-lg transition-all duration-300',
              testimonial.isFeatured && 'bg-gradient-to-br from-[var(--primary-light)] to-[var(--secondary)]'
            )}
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* Quote Icon */}
            <Quote className="w-10 h-10 text-[var(--primary)] mb-6 opacity-50" />

            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Review Text */}
            <p className="text-[var(--foreground)] leading-relaxed mb-8 text-[15px]">
              &ldquo;{testimonial.text}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-[var(--primary)] shrink-0 ring-4 ring-white">
                <Image
                  src={testimonial.avatarUrl || AVATAR_IMAGES[index % AVATAR_IMAGES.length]}
                  alt={testimonial.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{testimonial.name}</p>
                  {testimonial.isVerified && (
                    <BadgeCheck className="w-4 h-4 text-[var(--primary-dark)] shrink-0" />
                  )}
                </div>
                {testimonial.location && (
                  <p className="text-sm text-[var(--muted-foreground)]">{testimonial.location}</p>
                )}
                {testimonial.isVerified && (
                  <p className="text-xs text-[var(--success)] mt-0.5">Verified Purchase</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* CTA Card */}
        <div
          className="flex-shrink-0 w-[350px] md:w-[400px] bg-[var(--foreground)] rounded-2xl p-8 flex flex-col justify-center items-center text-center"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center mb-6">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Join 2,500+ Happy Customers</h3>
          <p className="text-white/60 mb-6">Experience the difference of clean eye care.</p>
          <a
            href="/products/eye-drops"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-[var(--foreground)] rounded-full font-medium text-sm hover:bg-[var(--primary-dark)] transition-colors"
          >
            Shop Now
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="container mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-[var(--muted)] rounded-2xl">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-light text-[var(--foreground)] mb-1">4.9</p>
            <p className="text-sm text-[var(--muted-foreground)]">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-light text-[var(--foreground)] mb-1">2,500+</p>
            <p className="text-sm text-[var(--muted-foreground)]">Verified Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-light text-[var(--foreground)] mb-1">98%</p>
            <p className="text-sm text-[var(--muted-foreground)]">Would Recommend</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-light text-[var(--foreground)] mb-1">24hr</p>
            <p className="text-sm text-[var(--muted-foreground)]">Avg. Relief Time</p>
          </div>
        </div>
      </div>
    </section>
  );
}
