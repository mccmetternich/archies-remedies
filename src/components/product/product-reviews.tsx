'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote, ThumbsUp, CheckCircle2 } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  avatarUrl: string | null;
  rating: number | null;
  text: string;
  isVerified: boolean | null;
}

interface ProductReviewsProps {
  testimonials: Testimonial[];
}

export function ProductReviews({ testimonials }: ProductReviewsProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="section bg-white">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-light mb-4"
          >
            Customer Reviews
          </motion.h2>

          {/* Rating Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex flex-col items-center bg-[var(--secondary)] rounded-2xl px-8 py-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl font-light">4.8</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-[var(--muted-foreground)]">Based on 2,500+ verified reviews</p>
          </motion.div>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-[var(--muted)] rounded-2xl p-6 hover:shadow-md transition-shadow duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
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
                </div>
                {testimonial.isVerified && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex mb-3">
                {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-[var(--foreground)] leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Helpful */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border-light)]">
                <button className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Helpful
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-10"
        >
          <a
            href="https://www.amazon.com/Archies-Remedies-Lubricating-Preservative-Free-Single-Use/dp/B0CN7HBR5D"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[var(--foreground)] font-medium hover:text-[var(--primary-dark)] transition-colors"
          >
            See all reviews on Amazon
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
