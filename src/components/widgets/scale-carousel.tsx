'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type ScaleCarouselAspectRatio = '3:4' | '9:16';
export type ScaleCarouselTheme = 'light' | 'dark' | 'cream';

export interface ScaleCarouselItem {
  id: string;
  mediaUrl: string;
  label?: string;
  isVideo?: boolean;
}

export interface ScaleCarouselConfig {
  title?: string;
  subtitle?: string;
  items: ScaleCarouselItem[];
  aspectRatio?: ScaleCarouselAspectRatio;
  theme?: ScaleCarouselTheme;
  imageDuration?: number; // seconds before auto-advancing for images (default 5)
}

interface ScaleCarouselProps extends ScaleCarouselConfig {
  className?: string;
}

// ============================================
// THEME CONFIGURATIONS
// ============================================

const themeStyles: Record<
  ScaleCarouselTheme,
  {
    bg: string;
    titleColor: string;
    subtitleColor: string;
    labelBg: string;
    labelColor: string;
  }
> = {
  light: {
    bg: 'bg-white',
    titleColor: 'text-[var(--foreground)]',
    subtitleColor: 'text-[#555]',
    labelBg: 'bg-black/60',
    labelColor: 'text-white',
  },
  dark: {
    bg: 'bg-[var(--foreground)]',
    titleColor: 'text-white',
    subtitleColor: 'text-white/70',
    labelBg: 'bg-white/20',
    labelColor: 'text-white',
  },
  cream: {
    bg: 'bg-[#f5f1eb]',
    titleColor: 'text-[var(--foreground)]',
    subtitleColor: 'text-[#555]',
    labelBg: 'bg-black/60',
    labelColor: 'text-white',
  },
};

// ============================================
// HELPER: Check if URL is video
// ============================================

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (url.match(/\.(mp4|webm|mov)(\?|$)/i)) return true;
  if (url.includes('/video/upload/')) return true;
  if (url.includes('res.cloudinary.com') && url.includes('/video/')) return true;
  return false;
}

// ============================================
// MEDIA ITEM COMPONENT
// ============================================

interface MediaItemProps {
  item: ScaleCarouselItem;
  isSelected: boolean;
  aspectRatio: ScaleCarouselAspectRatio;
  theme: ScaleCarouselTheme;
  onVideoEnd?: () => void;
}

function MediaItem({
  item,
  isSelected,
  aspectRatio,
  theme,
  onVideoEnd,
}: MediaItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldUseVideo = item.isVideo || isVideoUrl(item.mediaUrl);
  const styles = themeStyles[theme];
  const wasSelectedRef = useRef(isSelected);

  // Handle video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldUseVideo) return;

    // Mute/unmute based on selection
    video.muted = !isSelected;

    // When becoming selected, restart video
    if (isSelected && !wasSelectedRef.current) {
      video.currentTime = 0;
      video.loop = false; // Don't loop when selected - we want to advance on end
      video.play().catch(() => {});
    }

    // When becoming unselected, enable looping for background play
    if (!isSelected && wasSelectedRef.current) {
      video.loop = true;
      video.play().catch(() => {});
    }

    // Initial play for all videos
    if (!wasSelectedRef.current && !isSelected) {
      video.loop = true;
      video.play().catch(() => {});
    }

    wasSelectedRef.current = isSelected;
  }, [isSelected, shouldUseVideo]);

  // Handle video end for auto-advance (only when selected)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldUseVideo || !isSelected) return;

    const handleEnded = () => {
      // Only trigger if video is actually at/near the end (within 0.5s)
      if (video.duration && video.currentTime >= video.duration - 0.5) {
        if (onVideoEnd) {
          onVideoEnd();
        }
      }
    };

    // Also use timeupdate as backup for videos that don't fire 'ended' properly
    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.1 && !video.loop) {
        if (onVideoEnd) {
          onVideoEnd();
        }
      }
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isSelected, shouldUseVideo, onVideoEnd]);

  const aspectClass = aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[3/4]';

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden rounded-xl transition-all duration-300',
        aspectClass
      )}
    >
      {shouldUseVideo ? (
        <video
          ref={videoRef}
          src={item.mediaUrl}
          className="w-full h-full object-cover"
          loop={!isSelected}
          muted={!isSelected}
          playsInline
          autoPlay
        />
      ) : (
        <Image
          src={item.mediaUrl}
          alt={item.label || ''}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 80vw, 400px"
        />
      )}

      {/* Label Overlay - only show on selected item */}
      {item.label && isSelected && (
        <div className={cn('absolute inset-x-0 bottom-0 p-4', styles.labelBg)}>
          <p className={cn('text-sm md:text-base font-medium leading-snug', styles.labelColor)}>
            {item.label}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ScaleCarousel({
  title,
  subtitle,
  items,
  aspectRatio = '3:4',
  theme = 'light',
  imageDuration = 5,
  className,
}: ScaleCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const styles = themeStyles[theme];

  // Clear auto-advance timer
  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  // Advance to next item
  const advanceToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  // Handle item selection
  const handleSelect = useCallback((index: number) => {
    clearAutoAdvance();
    setSelectedIndex(index);
  }, [clearAutoAdvance]);

  // Handle video end - advance to next (with guard to prevent double-firing)
  const isAdvancingRef = useRef(false);
  const handleVideoEnd = useCallback(() => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    // Small delay to ensure clean transition
    setTimeout(() => {
      setSelectedIndex((prev) => (prev + 1) % items.length);
      isAdvancingRef.current = false;
    }, 100);
  }, [items.length]);

  // Auto-advance for images ONLY (not videos)
  useEffect(() => {
    if (!items || items.length === 0) return;

    const currentItem = items[selectedIndex];
    const isVideo = currentItem?.isVideo || isVideoUrl(currentItem?.mediaUrl || '');

    // Clear any existing timer first
    clearAutoAdvance();

    // Only set timer for images - videos advance on their 'ended' event
    if (!isVideo) {
      autoAdvanceTimerRef.current = setTimeout(() => {
        setSelectedIndex((prev) => (prev + 1) % items.length);
      }, imageDuration * 1000);
    }

    return clearAutoAdvance;
  }, [selectedIndex, items, imageDuration, clearAutoAdvance]);

  if (!items || items.length === 0) {
    return null;
  }

  // Sizing: Selected stays as is, unselected is 80% of selected (20% smaller)
  const selectedWidth = aspectRatio === '9:16' ? 280 : 360;
  const selectedHeight = aspectRatio === '9:16' ? 500 : 480;
  const unselectedWidth = Math.round(selectedWidth * 0.8);
  const unselectedHeight = Math.round(selectedHeight * 0.8);

  return (
    <section className={cn('py-12 md:py-16 lg:py-20', styles.bg, className)}>
      {/* Section Header */}
      {(title || subtitle) && (
        <div className="container px-6 lg:px-12 mb-10 md:mb-12 text-center">
          {title && (
            <h2 className={cn('text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight mb-4', styles.titleColor)}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={cn('text-base md:text-lg max-w-2xl mx-auto', styles.subtitleColor)}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Desktop: Center-focused layout with fixed height container */}
      <div className="hidden md:block">
        <div
          className="flex items-center justify-center gap-4 lg:gap-6 px-6"
          style={{ height: selectedHeight }}
        >
          {items.map((item, index) => {
            const isSelected = index === selectedIndex;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(index)}
                className="flex-shrink-0 transition-all duration-500 ease-out focus:outline-none"
                style={{
                  width: isSelected ? selectedWidth : unselectedWidth,
                  height: isSelected ? selectedHeight : unselectedHeight,
                }}
              >
                <MediaItem
                  item={item}
                  isSelected={isSelected}
                  aspectRatio={aspectRatio}
                  theme={theme}
                  onVideoEnd={isSelected ? handleVideoEnd : undefined}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: Horizontal scroll with fixed height container */}
      <div className="md:hidden">
        <div
          className="flex items-center gap-3 px-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            minHeight: aspectRatio === '9:16' ? 400 : 360,
          }}
        >
          {items.map((item, index) => {
            const isSelected = index === selectedIndex;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(index)}
                className="flex-shrink-0 snap-center transition-all duration-300 focus:outline-none"
                style={{
                  width: isSelected ? '75vw' : '60vw',
                  maxWidth: isSelected ? 300 : 240,
                }}
              >
                <MediaItem
                  item={item}
                  isSelected={isSelected}
                  aspectRatio={aspectRatio}
                  theme={theme}
                  onVideoEnd={isSelected ? handleVideoEnd : undefined}
                />
              </button>
            );
          })}
          {/* Spacer for last item */}
          <div className="flex-shrink-0 w-4" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
