'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Heart, Sparkles } from 'lucide-react';

// Avatar images
const AVATAR_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
];

export function AboutHero() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&h=1080&fit=crop"
          alt="Clean eye care"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative min-h-[85vh] flex items-center py-32">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[var(--primary-dark)] mb-6">
              <Heart className="w-4 h-4" />
              Our Story
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.05] mb-6 tracking-tight">
              Eye Care,<br />
              <span className="text-[var(--primary-dark)]">Reimagined</span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--muted-foreground)] mb-10 leading-relaxed max-w-xl">
              After the alarming eye drop recalls that shook the industry, we knew there had to be a better way.
              We created Archie&apos;s Remedies to prove that safe, clean ingredients and effective results aren&apos;t mutually exclusive.
            </p>

            {/* Social Proof */}
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {AVATAR_IMAGES.map((src, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-3 border-white overflow-hidden shadow-lg"
                  >
                    <Image
                      src={src}
                      alt="Customer"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-sm font-semibold">4.9</span>
                </div>
                <span className="text-sm text-[var(--muted-foreground)]">
                  Trusted by 2,500+ customers
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Stats */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute bottom-0 left-0 right-0"
      >
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/90 backdrop-blur-sm rounded-t-3xl p-8 shadow-xl border border-white/50">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-light text-[var(--foreground)] mb-1">100%</p>
              <p className="text-sm text-[var(--muted-foreground)]">Preservative-Free</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-light text-[var(--foreground)] mb-1">0</p>
              <p className="text-sm text-[var(--muted-foreground)]">Harmful Chemicals</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-light text-[var(--foreground)] mb-1">8hr</p>
              <p className="text-sm text-[var(--muted-foreground)]">Lasting Relief</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-light text-[var(--foreground)] mb-1">FDA</p>
              <p className="text-sm text-[var(--muted-foreground)]">Compliant</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
