'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  avatarUrl: string | null;
  rating: number | null;
  text: string;
  isVerified: boolean | null;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
}

export function TestimonialsSection({ testimonials, title, subtitle }: TestimonialsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="section bg-[var(--secondary)]">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          {title && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-light mb-4"
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Overall Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-4 mt-6"
          >
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-medium">4.8 out of 5</span>
            <span className="text-[var(--muted-foreground)]">|</span>
            <span className="text-[var(--muted-foreground)]">2,500+ reviews</span>
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-[var(--primary)] mb-4" />

              {/* Rating */}
              <div className="flex mb-3">
                {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-[var(--foreground)] mb-4 leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-light)]">
                {testimonial.avatarUrl ? (
                  <img
                    src={testimonial.avatarUrl}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-sm font-medium">
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  {testimonial.location && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {testimonial.location}
                    </p>
                  )}
                </div>
                {testimonial.isVerified && (
                  <span className="ml-auto badge text-[10px]">Verified</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
