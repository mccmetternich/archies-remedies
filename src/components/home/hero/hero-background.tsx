'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { isVideoUrl } from '@/lib/media-utils';
import {
  TestimonialCard,
  MobileTestimonialWrapper,
} from '@/components/shared/testimonial-card';

export interface HeroBackgroundProps {
  currentIndex: number;
  imageUrl: string;
  videoUrl?: string | null;
  mobileImageUrl?: string | null;
  mobileVideoUrl?: string | null;
  title?: string | null;
  buttonUrl?: string | null;
  buttonText?: string | null;
  testimonialText?: string | null;
  testimonialAuthor?: string | null;
  testimonialAvatarUrl?: string | null;
  showTextGradient?: boolean | null;
}

/**
 * Full-width background component for desktop hero.
 * Handles both video and image backgrounds with animated transitions.
 */
export function HeroBackgroundDesktop({
  currentIndex,
  imageUrl,
  videoUrl,
  title,
  buttonUrl,
  buttonText,
  testimonialText,
  testimonialAuthor,
  testimonialAvatarUrl,
  showTextGradient,
}: HeroBackgroundProps) {
  const hasVideo = videoUrl || isVideoUrl(imageUrl);

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:block absolute inset-0"
        style={{ willChange: 'opacity' }}
      >
        {/* Video or Image background */}
        {/* Full-width layout: image covers entire hero section */}
        {/* Recommended: 2400x1350px (16:9) or 2400x1600px for full-width hero */}
        {/* Check videoUrl first, then detect if imageUrl contains a video */}
        {hasVideo ? (
          <video
            src={videoUrl || imageUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={title || 'Hero image'}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        ) : null}

        {/* White gradient overlay for text legibility (optional) */}
        {showTextGradient && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 25%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0) 60%)',
            }}
          />
        )}

        {/* Clickable overlay - links entire hero to primary button URL */}
        {buttonUrl && (
          <Link
            href={buttonUrl}
            className="absolute inset-0 z-10"
            aria-label={buttonText || 'Shop Now'}
          />
        )}

        {/* Testimonial card - positioned in bottom-center of right virtual column (full-width layout) */}
        {testimonialText && testimonialAvatarUrl && (
          <TestimonialCard
            avatarUrl={testimonialAvatarUrl}
            author={testimonialAuthor || ''}
            text={testimonialText}
            variant="desktop"
            className="hidden lg:flex absolute bottom-24 right-[12.5%] z-20 w-full max-w-md justify-center pointer-events-auto"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Mobile stacked layout background (media on top).
 * Used for full-width layout on mobile devices.
 */
export function HeroBackgroundMobile({
  currentIndex,
  imageUrl,
  videoUrl,
  mobileImageUrl,
  mobileVideoUrl,
  title,
  testimonialText,
  testimonialAuthor,
  testimonialAvatarUrl,
}: HeroBackgroundProps) {
  const hasVideo =
    mobileVideoUrl ||
    videoUrl ||
    isVideoUrl(mobileImageUrl) ||
    isVideoUrl(imageUrl);
  const mediaSrc =
    mobileVideoUrl || videoUrl || mobileImageUrl || imageUrl;
  const imageSrc = mobileImageUrl || imageUrl;

  return (
    <div className="relative h-[42vh] min-h-[245px] w-full">
      <AnimatePresence mode="sync">
        <motion.div
          key={`mobile-media-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          {hasVideo ? (
            <video
              src={mediaSrc}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : imageSrc ? (
            <Image
              src={imageSrc}
              alt={title || 'Hero image'}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Mobile testimonial - hidden on mobile as media area is too small */}
      {/* Keeping the code commented for potential future use
      {testimonialText && testimonialAvatarUrl && (
        <MobileTestimonialWrapper className="lg:flex">
          <TestimonialCard
            avatarUrl={testimonialAvatarUrl}
            author={testimonialAuthor || ''}
            text={testimonialText}
            variant="mobile"
          />
        </MobileTestimonialWrapper>
      )}
      */}
    </div>
  );
}

export interface TwoColumnMediaProps {
  currentIndex: number;
  imageUrl: string;
  videoUrl?: string | null;
  title?: string | null;
  buttonUrl?: string | null;
  buttonText?: string | null;
  testimonialText?: string | null;
  testimonialAuthor?: string | null;
  testimonialAvatarUrl?: string | null;
}

/**
 * Two-column layout media section.
 * Full width of column, full height with testimonial overlay.
 */
export function TwoColumnMedia({
  currentIndex,
  imageUrl,
  videoUrl,
  title,
  buttonUrl,
  buttonText,
  testimonialText,
  testimonialAuthor,
  testimonialAvatarUrl,
}: TwoColumnMediaProps) {
  const hasVideo = videoUrl || isVideoUrl(imageUrl);

  return (
    <div className="relative w-full h-[42vh] lg:h-full min-h-[245px] lg:min-h-full order-1 lg:order-none">
      <AnimatePresence mode="sync">
        <motion.div
          key={`image-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 overflow-hidden"
        >
          {/* Video or Image - full width of column */}
          {/* object-cover: scales to fill container, crops overflow */}
          {/* object-position: center centers the subject (default behavior) */}
          {/* Check videoUrl first, then detect if imageUrl contains a video */}
          {hasVideo ? (
            <video
              src={videoUrl || imageUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover object-center"
            />
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt={title || 'Hero image'}
              fill
              className="object-cover object-center"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : null}

          {/* Clickable overlay for two-column */}
          {buttonUrl && (
            <Link
              href={buttonUrl}
              className="absolute inset-0 z-10"
              aria-label={buttonText || 'Shop Now'}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Mobile testimonial - hidden on mobile as media area is too small */}
      {/* Keeping the code commented for potential future use
      {testimonialText && testimonialAvatarUrl && (
        <MobileTestimonialWrapper>
          <TestimonialCard
            avatarUrl={testimonialAvatarUrl}
            author={testimonialAuthor || ''}
            text={testimonialText}
            variant="mobile"
          />
        </MobileTestimonialWrapper>
      )}
      */}

      {/* Desktop testimonial - positioned at bottom of media column */}
      {testimonialText && testimonialAvatarUrl && (
        <TestimonialCard
          avatarUrl={testimonialAvatarUrl}
          author={testimonialAuthor || ''}
          text={testimonialText}
          variant="desktop"
          className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-md justify-center pointer-events-auto"
        />
      )}
    </div>
  );
}
