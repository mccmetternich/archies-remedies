'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type TeamCardsTheme = 'light' | 'dark';

export interface TeamCard {
  id: string;
  imageUrl: string;
  name: string;
  title: string;
  bio: string;
  signatureUrl?: string;
}

export interface TeamCardsConfig {
  title?: string;
  subtitle?: string;
  cards: TeamCard[];
  theme?: TeamCardsTheme;
}

interface TeamCardsProps extends TeamCardsConfig {
  className?: string;
}

// ============================================
// THEME CONFIGURATIONS
// ============================================

const themeStyles: Record<
  TeamCardsTheme,
  {
    bg: string;
    cardBg: string;
    cardBorder: string;
    sectionTitleColor: string;
    sectionSubtitleColor: string;
    nameColor: string;
    titleColor: string;
    bioColor: string;
  }
> = {
  light: {
    bg: 'bg-white',
    cardBg: 'bg-[#f5f1eb]',
    cardBorder: 'border-[#e5e0d8]',
    sectionTitleColor: 'text-[var(--foreground)]',
    sectionSubtitleColor: 'text-[#555]',
    nameColor: 'text-[var(--foreground)]',
    titleColor: 'text-[var(--foreground)]',
    bioColor: 'text-[#555]',
  },
  dark: {
    bg: 'bg-[var(--foreground)]',
    cardBg: 'bg-[#1a1a1a]',
    cardBorder: 'border-[#333]',
    sectionTitleColor: 'text-white',
    sectionSubtitleColor: 'text-white/70',
    nameColor: 'text-white',
    titleColor: 'text-white/90',
    bioColor: 'text-white/70',
  },
};

// ============================================
// SINGLE CARD COMPONENT
// ============================================

function Card({
  card,
  theme,
}: {
  card: TeamCard;
  theme: TeamCardsTheme;
}) {
  const styles = themeStyles[theme];

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl overflow-hidden border',
        styles.cardBg,
        styles.cardBorder
      )}
    >
      {/* Portrait Image - 4:5 aspect ratio */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={card.imageUrl}
          alt={card.name}
          fill
          className="object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
          sizes="(max-width: 768px) 85vw, 400px"
        />
      </div>

      {/* Text Content */}
      <div className="p-5 md:p-6">
        <p
          className={cn(
            'text-[10px] md:text-[11px] font-bold uppercase tracking-[0.1em] mb-2',
            styles.titleColor
          )}
        >
          {card.title}
        </p>
        <h3 className={cn('text-lg md:text-xl font-medium mb-3', styles.nameColor)}>
          {card.name}
        </h3>
        <p className={cn('text-sm leading-relaxed', styles.bioColor)}>
          {card.bio}
        </p>

        {/* Optional Signature Image */}
        {card.signatureUrl && (
          <div className="mt-4 relative h-10 md:h-12 w-32 md:w-40">
            <Image
              src={card.signatureUrl}
              alt={`${card.name} signature`}
              fill
              className="object-contain object-left"
              sizes="160px"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TeamCards({ title, subtitle, cards, theme = 'light', className }: TeamCardsProps) {
  const styles = themeStyles[theme];

  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <section className={cn('py-16 md:py-20 lg:py-24', styles.bg, className)}>
      {/* Section Header */}
      {(title || subtitle) && (
        <div className="container px-6 lg:px-12 mb-10 md:mb-12 lg:mb-16 text-center">
          {title && (
            <h2 className={cn('text-3xl md:text-4xl lg:text-5xl font-medium mb-4', styles.sectionTitleColor)}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={cn('text-base md:text-lg max-w-2xl mx-auto', styles.sectionSubtitleColor)}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Desktop: Side by side with generous gap */}
      <div className="hidden md:block">
        <div className="container px-6 lg:px-12">
          <div className="grid grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
            {cards.map((card) => (
              <Card key={card.id} card={card} theme={theme} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Horizontal scroll with peek */}
      <div className="md:hidden">
        <div
          className="flex gap-4 px-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex-shrink-0 w-[85vw] snap-center"
            >
              <Card card={card} theme={theme} />
            </div>
          ))}
          {/* Spacer for last card peek */}
          <div className="flex-shrink-0 w-[15vw]" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
