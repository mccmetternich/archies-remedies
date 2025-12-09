'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Shield, Droplets, Heart, Leaf, ArrowRight, Sparkles, BadgeCheck } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Preservative-Free',
    description: 'Single-use vials eliminate the need for irritating preservatives',
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Leaf,
    title: 'Clean Ingredients',
    description: 'No phthalates, parabens, or sulfates in any of our formulas',
    color: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: Droplets,
    title: 'Instant Relief',
    description: 'Ultra-lubricating formula provides comfort for up to 8 hours',
    color: 'bg-[var(--primary-light)]',
    iconColor: 'text-[var(--primary-dark)]',
  },
  {
    icon: Heart,
    title: 'Safe for All',
    description: 'Gentle enough for the whole family, from kids to adults',
    color: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
];

// Avatar images
const AVATAR_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
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
    <section ref={ref} className="py-20 md:py-32 bg-[var(--secondary)] overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[var(--primary-dark)] mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Our Mission
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-light mb-4"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-[var(--muted-foreground)] mb-10 leading-relaxed"
            >
              {description}
            </motion.p>

            {/* Values Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="group flex gap-4 p-4 bg-white rounded-2xl hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${value.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <value.icon className={`w-6 h-6 ${value.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{value.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[var(--foreground)] font-medium hover:gap-3 transition-all duration-300"
              >
                Learn Our Story
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            {/* Main Image Card */}
            <div className="relative aspect-square rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=800&fit=crop"
                alt="Clean eye care"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/40 via-transparent to-transparent" />

              {/* Floating Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex -space-x-2">
                      {AVATAR_IMAGES.map((src, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
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
                    <div>
                      <p className="text-sm font-medium">Join 2,500+ customers</p>
                      <p className="text-xs text-[var(--muted-foreground)]">who made the switch</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--primary-light)] rounded-full">
                      <BadgeCheck className="w-3.5 h-3.5 text-[var(--primary-dark)]" />
                      Ophthalmologist Tested
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--secondary)] rounded-full">
                      <Shield className="w-3.5 h-3.5 text-green-600" />
                      FDA Compliant
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--secondary)] rounded-full">
                      <Leaf className="w-3.5 h-3.5 text-green-600" />
                      Made in USA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[var(--primary)] rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[var(--primary-light)] rounded-full blur-3xl opacity-50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
