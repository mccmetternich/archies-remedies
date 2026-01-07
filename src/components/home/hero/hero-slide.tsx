'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TestimonialCard } from '@/components/shared/testimonial-card';
import { HeroTextContent, MobileTextContent } from './hero-text-content';
import {
  HeroBackgroundDesktop,
  HeroBackgroundMobile,
  TwoColumnMedia,
} from './hero-background';

export interface HeroSlideData {
  id: string;
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  secondaryButtonText: string | null;
  secondaryButtonUrl: string | null;
  secondaryButtonType: string | null;
  secondaryAnchorTarget: string | null;
  imageUrl: string;
  videoUrl?: string | null;
  mobileImageUrl?: string | null;
  mobileVideoUrl?: string | null;
  testimonialText: string | null;
  testimonialAuthor: string | null;
  testimonialAvatarUrl: string | null;
  layout?: string | null;
  textColor?: string | null;
}

export interface HeroSlideProps {
  slide: HeroSlideData;
  currentIndex: number;
}

/**
 * Full-width layout slide component.
 * Desktop: Overlay text content on full background.
 * Mobile: Stacked layout with media on top, content below.
 */
export function FullWidthSlide({ slide, currentIndex }: HeroSlideProps) {
  const isLightText = slide.textColor === 'light';

  return (
    <>
      {/* Background for full-width layout - DESKTOP ONLY (mobile has stacked layout below) */}
      <HeroBackgroundDesktop
        currentIndex={currentIndex}
        imageUrl={slide.imageUrl}
        videoUrl={slide.videoUrl}
        title={slide.title}
        buttonUrl={slide.buttonUrl}
        buttonText={slide.buttonText}
        testimonialText={slide.testimonialText}
        testimonialAuthor={slide.testimonialAuthor}
        testimonialAvatarUrl={slide.testimonialAvatarUrl}
      />

      {/* Desktop: Original overlay layout */}
      <div className="hidden lg:flex container relative z-20 h-full items-center pointer-events-none">
        <div className="pointer-events-auto w-full">
          <div className="max-w-xl">
            <HeroTextContent
              currentIndex={currentIndex}
              title={slide.title}
              subtitle={slide.subtitle}
              buttonText={slide.buttonText}
              buttonUrl={slide.buttonUrl}
              secondaryButtonText={slide.secondaryButtonText}
              secondaryButtonUrl={slide.secondaryButtonUrl}
              isLightText={isLightText}
            />
          </div>
        </div>
      </div>

      {/* Mobile: Stacked layout - media on top, content below */}
      <div className="lg:hidden relative z-20 flex flex-col">
        {/* Full-bleed media - 35vh */}
        <HeroBackgroundMobile
          currentIndex={currentIndex}
          imageUrl={slide.imageUrl}
          videoUrl={slide.videoUrl}
          mobileImageUrl={slide.mobileImageUrl}
          mobileVideoUrl={slide.mobileVideoUrl}
          title={slide.title}
          testimonialText={slide.testimonialText}
          testimonialAuthor={slide.testimonialAuthor}
          testimonialAvatarUrl={slide.testimonialAvatarUrl}
        />

        {/* Content below media - min-height accommodates 3-4 lines of body copy */}
        <div className="bg-[var(--background)] px-4 pt-6 pb-6 min-h-[280px]">
          <MobileTextContent
            title={slide.title}
            subtitle={slide.subtitle}
            buttonText={slide.buttonText}
            buttonUrl={slide.buttonUrl}
          />
        </div>
      </div>
    </>
  );
}

/**
 * Two-column layout slide component.
 * Supports normal and reversed column order.
 */
export function TwoColumnSlide({ slide, currentIndex }: HeroSlideProps) {
  const isLightText = slide.textColor === 'light';
  const isReversed = slide.layout === 'two-column-reversed';

  return (
    <>
      {/* Two-column layout background (cream/light background) */}
      <div className="absolute inset-0 bg-[var(--cream)]" />

      {/* Content */}
      <div className="relative z-20 h-full">
        <div
          className={cn(
            'flex flex-col lg:grid lg:grid-cols-2 h-full items-stretch',
            isReversed &&
              "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
          )}
        >
          {/* Text column - split into two compartments */}
          <div className="relative h-auto lg:h-full px-4 lg:px-12 order-2 lg:order-none bg-[var(--background)] lg:bg-transparent hero-text-column">
            {/* Mobile: Compact content - min-height accommodates 3-4 lines of body copy */}
            <div className="lg:hidden pt-6 pb-6 min-h-[280px]">
              <MobileTextContent
                title={slide.title}
                subtitle={slide.subtitle}
                buttonText={slide.buttonText}
                buttonUrl={slide.buttonUrl}
              />
            </div>
            {/* Desktop: Original centered content */}
            <div className="hidden lg:flex items-center justify-center h-full py-16">
              <div className="w-full max-w-xl">
                <HeroTextContent
                  currentIndex={currentIndex}
                  title={slide.title}
                  subtitle={slide.subtitle}
                  buttonText={slide.buttonText}
                  buttonUrl={slide.buttonUrl}
                  secondaryButtonText={slide.secondaryButtonText}
                  secondaryButtonUrl={slide.secondaryButtonUrl}
                  isLightText={isLightText}
                />
              </div>
            </div>

            {/* COMPARTMENT 2: Testimonial card - DESKTOP ONLY (mobile has its own overlapping the media) */}
            {/* Uses same centering calculation: left-1/2 -translate-x-1/2 then offset to align with max-w-xl start */}
            {slide.testimonialText && slide.testimonialAvatarUrl && (
              <TestimonialCard
                avatarUrl={slide.testimonialAvatarUrl}
                author={slide.testimonialAuthor || ''}
                text={slide.testimonialText}
                variant="desktop"
                className="hidden lg:block absolute bottom-16 lg:bottom-[79px] left-1/2 -translate-x-1/2 w-full max-w-xl px-6 lg:px-0 pointer-events-auto"
              />
            )}
          </div>

          {/* Media - Full width of column, full height */}
          <TwoColumnMedia
            currentIndex={currentIndex}
            imageUrl={slide.imageUrl}
            videoUrl={slide.videoUrl}
            title={slide.title}
            buttonUrl={slide.buttonUrl}
            buttonText={slide.buttonText}
            testimonialText={slide.testimonialText}
            testimonialAuthor={slide.testimonialAuthor}
            testimonialAvatarUrl={slide.testimonialAvatarUrl}
          />
        </div>
      </div>
    </>
  );
}

/**
 * Main HeroSlide component that delegates to the appropriate layout.
 */
export function HeroSlide({ slide, currentIndex }: HeroSlideProps) {
  const layout = slide.layout || 'full-width';
  const isTwoColumn =
    layout === 'two-column' || layout === 'two-column-reversed';

  if (isTwoColumn) {
    return <TwoColumnSlide slide={slide} currentIndex={currentIndex} />;
  }

  return <FullWidthSlide slide={slide} currentIndex={currentIndex} />;
}
