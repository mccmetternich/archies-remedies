'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Droplets, Heart, Leaf, Eye, Users, Award, FlaskConical } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Every product is ophthalmologist tested and FDA compliant. We never cut corners on safety.',
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Droplets,
    title: 'Preservative-Free',
    description: 'Single-use vials mean no preservatives needed. Pure relief, every single time.',
    color: 'bg-[var(--primary-light)]',
    iconColor: 'text-[var(--primary-dark)]',
  },
  {
    icon: Leaf,
    title: 'Clean Formula',
    description: 'No phthalates, parabens, or sulfates. Just clean ingredients that work.',
    color: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'We treat every bottle as if it were going to our own family. Because it might be.',
    color: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
  {
    icon: FlaskConical,
    title: 'Science-Backed',
    description: 'Formulated with proven ingredients that deliver real results, not empty promises.',
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: Users,
    title: 'For Everyone',
    description: 'Gentle enough for the whole family, from kids to adults. Eye care without compromise.',
    color: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

export function AboutValues() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-32 bg-[var(--secondary)]">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-[var(--primary-dark)] mb-4 block">
            What We Believe
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6">
            Our Core Values
          </h2>
          <p className="text-lg text-[var(--muted-foreground)]">
            These principles guide everything we do—from formula development to customer service.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="group bg-white rounded-3xl p-8 hover:shadow-xl transition-all duration-500 border border-[var(--border-light)] hover:border-[var(--primary)]"
            >
              <div className={`w-16 h-16 rounded-2xl ${value.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <value.icon className={`w-8 h-8 ${value.iconColor}`} />
              </div>
              <h3 className="text-xl font-medium mb-3">{value.title}</h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-white rounded-full shadow-lg border border-[var(--border-light)]">
            <Award className="w-6 h-6 text-[var(--primary-dark)]" />
            <span className="font-medium">Trusted by over 2,500 customers nationwide</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
