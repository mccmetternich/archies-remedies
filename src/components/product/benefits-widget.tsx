'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, X } from 'lucide-react';

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

export function BenefitsWidget({ positiveBenefits, negativeBenefits }: BenefitsWidgetProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="grid md:grid-cols-2 gap-8">
      {/* What's In */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="bg-green-50 rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-medium">What&apos;s In</h3>
        </div>

        <div className="space-y-4">
          {positiveBenefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{benefit.title}</p>
                {benefit.description && (
                  <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                    {benefit.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* What's Not */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-red-50 rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-medium">What&apos;s Not</h3>
        </div>

        <div className="space-y-4">
          {negativeBenefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.1 * (index + positiveBenefits.length) }}
              className="flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div>
                <p className="font-medium">{benefit.title}</p>
                {benefit.description && (
                  <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                    {benefit.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
