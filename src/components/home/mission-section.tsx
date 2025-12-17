'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const values = [
  {
    number: '01',
    title: 'Preservative-Free',
    description: 'Single-use vials eliminate the need for irritating preservatives that can damage your eyes over time.',
  },
  {
    number: '02',
    title: 'Clean Formulas',
    description: 'No phthalates, parabens, or sulfates. Just effective, gentle ingredients your eyes deserve.',
  },
  {
    number: '03',
    title: 'Instant Relief',
    description: 'Ultra-lubricating formula that provides lasting comfort throughout your day.',
  },
  {
    number: '04',
    title: 'Safe for Everyone',
    description: 'Gentle enough for the whole family, from sensitive kids to contact lens wearers.',
  },
];

interface MissionSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export function MissionSection({
  title = 'Why We Exist',
  description = 'After the alarming eye drop recalls of 2023, we knew there had to be a better way. We set out to create eye care products that prioritize safety without compromising on effectiveness.',
}: MissionSectionProps) {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-[var(--cream)] relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-white to-transparent" />

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 xl:gap-48 items-center">
          {/* Left: Editorial Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative">
              {/* Main Image */}
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=1000&fit=crop"
                  alt="Clean eye care"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Floating stat card */}
              <div className="absolute -bottom-8 -right-8 lg:right-8 bg-white p-8 rounded-2xl shadow-2xl max-w-xs">
                <p className="text-5xl font-normal tracking-tight mb-2">2,500+</p>
                <p className="text-[var(--muted-foreground)]">customers who made the switch to clean eye care</p>
              </div>

              {/* Decorative element */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-[var(--primary)] rounded-full opacity-30 blur-3xl" />
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-8">
              <span className="w-12 h-px bg-[var(--foreground)]" />
              Our Mission
            </span>

            <h2 className="mb-8">
              {title}
            </h2>

            <p className="text-lg text-[var(--muted-foreground)] mb-12 leading-relaxed max-w-lg">
              {description}
            </p>

            {/* Values - Editorial numbered list */}
            <div className="space-y-8 mb-12">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="flex gap-6"
                >
                  <span className="text-4xl font-light text-[var(--primary)] shrink-0 w-12">
                    {value.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium mb-2">{value.title}</h3>
                    <p className="text-[var(--muted-foreground)] leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div>
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 text-sm font-medium text-[var(--foreground)] hover:text-[var(--muted-foreground)] transition-colors"
              >
                Read Our Full Story
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
