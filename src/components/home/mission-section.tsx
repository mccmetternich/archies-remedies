'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Droplets, Heart, Leaf } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Preservative-Free',
    description: 'Single-use vials eliminate the need for irritating preservatives',
  },
  {
    icon: Leaf,
    title: 'Clean Ingredients',
    description: 'No phthalates, parabens, or sulfates in any of our formulas',
  },
  {
    icon: Droplets,
    title: 'Instant Relief',
    description: 'Ultra-lubricating formula provides comfort for up to 8 hours',
  },
  {
    icon: Heart,
    title: 'Safe for All',
    description: 'Gentle enough for the whole family, from kids to adults',
  },
];

interface MissionSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export function MissionSection({
  title = 'Why Archie\'s?',
  subtitle = 'Eye Care You Can Trust',
  description = 'After the alarming eye drop recalls, we knew there had to be a better way. We created products that prioritize safety without compromising on effectiveness.',
}: MissionSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="section bg-white overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="badge mb-4"
            >
              Our Mission
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-light mb-4"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-[var(--muted-foreground)] mb-8"
            >
              {description}
            </motion.p>

            {/* Values Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center shrink-0">
                    <value.icon className="w-6 h-6 text-[var(--foreground)]" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{value.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-[var(--primary-light)] via-[var(--primary)] to-[var(--secondary)] p-1">
              <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-7xl mb-6">👁️</div>
                  <h3 className="text-2xl font-light mb-2">Safe, Clean, Effective</h3>
                  <p className="text-[var(--muted-foreground)]">
                    The home for dry eye relief that works
                  </p>

                  {/* Floating badges */}
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    <span className="px-3 py-1 text-xs rounded-full bg-[var(--secondary)] text-[var(--foreground)]">
                      Preservative-Free
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full bg-[var(--secondary)] text-[var(--foreground)]">
                      Paraben-Free
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full bg-[var(--secondary)] text-[var(--foreground)]">
                      Phthalate-Free
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full bg-[var(--secondary)] text-[var(--foreground)]">
                      Sulfate-Free
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[var(--primary-light)] rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[var(--secondary)] rounded-full blur-3xl opacity-50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
