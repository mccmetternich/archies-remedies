'use client';

import React from 'react';
import { Droplet, Eye, Flag, Leaf, Sparkles, Plus } from 'lucide-react';

export interface Certification {
  icon: 'droplet' | 'eye' | 'flag' | 'leaf' | 'sparkle' | 'cross';
  title: string;
  description?: string;
}

interface CertificationTrioProps {
  certifications: Certification[];
  className?: string;
}

const iconMap = {
  droplet: Droplet,
  eye: Eye,
  flag: Flag,
  leaf: Leaf,
  sparkle: Sparkles,
  cross: Plus,
};

export function CertificationTrio({ certifications, className = '' }: CertificationTrioProps) {
  return (
    <section className={`py-16 md:py-20 bg-[var(--cream)] ${className}`}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {certifications.slice(0, 3).map((cert, index) => {
            const IconComponent = iconMap[cert.icon] || Droplet;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center mb-6">
                  <IconComponent className="w-7 h-7 text-[var(--foreground)]" />
                </div>
                <h3 className="text-lg font-medium tracking-tight mb-2">
                  {cert.title}
                </h3>
                {cert.description && (
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xs">
                    {cert.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
