'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type StoryHeroHeight = 'short' | 'medium' | 'tall';

export interface StoryHeroConfig {
  mediaUrl?: string;
  headline?: string;
  subheadline?: string;
  overlayOpacity?: number; // 0-100, default 40
  height?: StoryHeroHeight;
}

interface StoryHeroProps extends StoryHeroConfig {
  className?: string;
}

// ============================================
// HEIGHT CONFIGURATIONS
// ============================================

const heightStyles: Record<StoryHeroHeight, { desktop: string; mobile: string }> = {
  short: { desktop: 'lg:h-[33vh]', mobile: 'h-[35vh]' },
  medium: { desktop: 'lg:h-[50vh]', mobile: 'h-[40vh]' },
  tall: { desktop: 'lg:h-[66vh]', mobile: 'h-[50vh]' },
};

// ============================================
// HELPER: Detect video
// ============================================

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.mov', '.m4v'];
  const lowerUrl = url.toLowerCase();
  if (videoExtensions.some((ext) => lowerUrl.includes(ext))) return true;
  if (lowerUrl.includes('/video/upload/')) return true; // Cloudinary
  return false;
}

// ============================================
// COMPONENT
// ============================================

export function StoryHero({
  mediaUrl,
  headline,
  subheadline,
  overlayOpacity = 40,
  height = 'short',
  className,
}: StoryHeroProps) {
  const isVideo = mediaUrl ? isVideoUrl(mediaUrl) : false;
  const heightConfig = heightStyles[height];

  // Don't render if no content
  if (!mediaUrl && !headline && !subheadline) {
    return null;
  }

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden -mt-1',
        heightConfig.mobile,
        heightConfig.desktop,
        className
      )}
    >
      {/* Background Media */}
      {mediaUrl && (
        <div className="absolute inset-0">
          {isVideo ? (
            <video
              src={mediaUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl}
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
            />
          )}

          {/* Dark overlay for text legibility */}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity / 100 }}
          />
        </div>
      )}

      {/* Text Content - Centered */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          {headline && (
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white leading-tight mb-4 lg:mb-6">
              {headline}
            </h1>
          )}
          {subheadline && (
            <p className="text-base md:text-lg lg:text-xl text-white/85 leading-relaxed max-w-3xl mx-auto">
              {subheadline}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
