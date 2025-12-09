'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Quote, AlertTriangle, Sparkles, Heart } from 'lucide-react';

export function AboutStory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-32 bg-white overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Story Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--primary-dark)] mb-6 block">
              The Beginning
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-8 leading-tight">
              Born from a Crisis,<br />
              Built for Trust
            </h2>

            {/* Crisis Alert Card */}
            <div className="p-6 bg-red-50 rounded-2xl mb-8 border border-red-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-red-900 mb-2">The 2023 Eye Drop Recalls</h3>
                  <p className="text-sm text-red-700 leading-relaxed">
                    When major brands were recalled for bacterial contamination that caused blindness and even death,
                    we knew the industry needed a new standard of safety.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 text-[var(--muted-foreground)] leading-relaxed">
              <p>
                The headlines were alarming. Eye drops—something we all use without a second thought—were suddenly dangerous.
                People were losing their vision. Some lost their lives. And the products responsible sat on the shelves of every major retailer.
              </p>
              <p>
                We founded Archie&apos;s Remedies with a simple mission: <strong className="text-[var(--foreground)]">create eye care products
                you can trust without question.</strong> Every ingredient vetted. Every formula tested. Every promise kept.
              </p>
              <p>
                Named after our founder&apos;s grandfather Archie—a man who believed in doing things the right way, not the easy way—we&apos;re
                committed to bringing back trust to an industry that desperately needs it.
              </p>
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Main Image */}
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=1000&fit=crop"
                alt="Clean eye care products"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/30 to-transparent" />
            </div>

            {/* Floating Quote Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -bottom-8 -left-8 md:-left-12 max-w-sm p-6 bg-white rounded-2xl shadow-xl border border-[var(--border-light)]"
            >
              <Quote className="w-10 h-10 text-[var(--primary)] mb-4 opacity-50" />
              <p className="text-[var(--foreground)] leading-relaxed mb-4 italic">
                &ldquo;Do it right, or don&apos;t do it at all. There are no shortcuts when it comes to people&apos;s health.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[var(--primary-dark)]" />
                </div>
                <div>
                  <p className="font-medium text-sm">Grandpa Archie</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Our Inspiration</p>
                </div>
              </div>
            </motion.div>

            {/* Decorative Element */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-[var(--primary-light)] rounded-full blur-3xl opacity-50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
