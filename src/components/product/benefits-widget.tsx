'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, X, Sparkles, ShieldAlert, Droplets, Leaf, Heart, Ban, AlertTriangle, Skull } from 'lucide-react';

interface Benefit {
  id: string;
  title: string;
  description: string | null;
  iconName: string | null;
}

interface BenefitsWidgetProps {
  positiveBenefits: Benefit[];
  negativeBenefits: Benefit[];
}

// Icon mapping for positive benefits
const positiveIcons: Record<string, React.ElementType> = {
  droplets: Droplets,
  leaf: Leaf,
  heart: Heart,
  sparkles: Sparkles,
  default: Check,
};

// Icon mapping for negative benefits
const negativeIcons: Record<string, React.ElementType> = {
  ban: Ban,
  alert: AlertTriangle,
  skull: Skull,
  default: X,
};

export function BenefitsWidget({ positiveBenefits, negativeBenefits }: BenefitsWidgetProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="py-8">
      {/* Section Header */}
      <div className="text-center mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-[var(--primary-dark)] mb-4 block">
          Clean Ingredients
        </span>
        <h2 className="text-3xl md:text-4xl font-light mb-4">
          What&apos;s In &amp; What&apos;s Not
        </h2>
        <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
          We believe in complete transparency. Here&apos;s exactly what goes into our products—and what we&apos;ll never use.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* What's In - Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-light)] via-white to-[var(--primary-light)]/50 rounded-3xl" />

          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--primary)] rounded-full opacity-10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--primary-dark)] rounded-full opacity-10 blur-2xl" />

          <div className="relative p-8 md:p-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center shadow-lg">
                <Check className="w-7 h-7 text-white" strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-2xl font-light">What&apos;s In</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Good stuff only</p>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="space-y-4">
              {positiveBenefits.map((benefit, index) => {
                const IconComponent = positiveIcons[benefit.iconName || 'default'] || positiveIcons.default;

                return (
                  <motion.div
                    key={benefit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    className="group flex items-start gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-[var(--primary)]/20 hover:border-[var(--primary)] hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center shrink-0 group-hover:bg-[var(--primary)] group-hover:scale-110 transition-all duration-300">
                      <IconComponent className="w-5 h-5 text-[var(--primary-dark)] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--foreground)]">{benefit.title}</p>
                      {benefit.description && (
                        <p className="text-sm text-[var(--muted-foreground)] mt-1 leading-relaxed">
                          {benefit.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* What's Not - Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)] via-white to-[var(--secondary-dark)]/50 rounded-3xl" />

          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500 rounded-full opacity-5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500 rounded-full opacity-5 blur-2xl" />

          <div className="relative p-8 md:p-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--foreground)]/80 to-[var(--foreground)] flex items-center justify-center shadow-lg">
                <X className="w-7 h-7 text-white" strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-2xl font-light">What&apos;s Not</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Never, ever</p>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="space-y-4">
              {negativeBenefits.map((benefit, index) => {
                const IconComponent = negativeIcons[benefit.iconName || 'default'] || negativeIcons.default;

                return (
                  <motion.div
                    key={benefit.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="group flex items-start gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-[var(--border)] hover:border-[var(--foreground)]/30 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center shrink-0 group-hover:bg-[var(--foreground)] group-hover:scale-110 transition-all duration-300">
                      <IconComponent className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--foreground)] line-through decoration-[var(--foreground)]/30">
                        {benefit.title}
                      </p>
                      {benefit.description && (
                        <p className="text-sm text-[var(--muted-foreground)] mt-1 leading-relaxed">
                          {benefit.description}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
                        <X className="w-3.5 h-3.5" strokeWidth={3} />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trust Statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-[var(--primary-light)] rounded-full">
          <ShieldAlert className="w-5 h-5 text-[var(--primary-dark)]" />
          <span className="text-sm font-medium">
            Ophthalmologist tested • FDA compliant • Made in USA
          </span>
        </div>
      </motion.div>
    </div>
  );
}
