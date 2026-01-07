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
  onClick: () => void;
}

function MediaItem({
  item,
  isSelected,
  aspectRatio,
  theme,
  onVideoEnd,
  onClick,
}: MediaItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldUseVideo = item.isVideo || isVideoUrl(item.mediaUrl);
  const styles = themeStyles[theme];

  // Handle video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldUseVideo) return;

    // All videos play continuously
    video.play().catch(() => {
      // Autoplay blocked
    });

    // Mute/unmute based on selection
    video.muted = !isSelected;

    // Restart video when selected
    if (isSelected) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, [isSelected, shouldUseVideo]);

  // Handle video end for auto-advance
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldUseVideo || !isSelected) return;

    const handleEnded = () => {
      onVideoEnd?.();
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [isSelected, shouldUseVideo, onVideoEnd]);

  const aspectClass = aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[3/4]';

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-xl cursor-pointer transition-all duration-300',
        aspectClass
      )}
      onClick={onClick}
    >
      {shouldUseVideo ? (
        <video
          ref={videoRef}
          src={item.mediaUrl}
          className="w-full h-full object-cover"
          loop={!isSelected} // Only loop when not selected (for background play)
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

  // Handle video end - advance to next
  const handleVideoEnd = useCallback(() => {
    advanceToNext();
  }, [advanceToNext]);

  // Auto-advance for images
  useEffect(() => {
    if (!items || items.length === 0) return;

    const currentItem = items[selectedIndex];
    const isVideo = currentItem?.isVideo || isVideoUrl(currentItem?.mediaUrl || '');

    // Only auto-advance for images (videos advance on end)
    if (!isVideo) {
      clearAutoAdvance();
      autoAdvanceTimerRef.current = setTimeout(() => {
        advanceToNext();
      }, imageDuration * 1000);
    }

    return clearAutoAdvance;
  }, [selectedIndex, items, imageDuration, advanceToNext, clearAutoAdvance]);

  if (!items || items.length === 0) {
    return null;
  }

  // Calculate dimensions for selected vs non-selected items
  const selectedWidth = aspectRatio === '9:16' ? 280 : 360;
  const selectedHeight = aspectRatio === '9:16' ? 500 : 480;
  const thumbnailWidth = aspectRatio === '9:16' ? 140 : 180;
  const thumbnailHeight = aspectRatio === '9:16' ? 250 : 240;

  return (
    <section className={cn('py-12 md:py-16 lg:py-20', styles.bg, className)}>
      {/* Section Header */}
      {(title || subtitle) && (
        <div className="container px-6 lg:px-12 mb-10 md:mb-12 text-center">
          {title && (
            <h2 className={cn('text-3xl md:text-4xl lg:text-5xl font-medium mb-4', styles.titleColor)}>
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

      {/* Desktop: Center-focused layout */}
      <div className="hidden md:block">
        <div className="flex items-center justify-center gap-6 lg:gap-8 px-6">
          {items.map((item, index) => {
            const isSelected = index === selectedIndex;

            return (
              <div
                key={item.id}
                className="flex-shrink-0 transition-all duration-500 ease-out"
                style={{
                  width: isSelected ? selectedWidth : thumbnailWidth,
                  height: isSelected ? selectedHeight : thumbnailHeight,
                }}
              >
                <MediaItem
                  item={item}
                  isSelected={isSelected}
                  aspectRatio={aspectRatio}
                  theme={theme}
                  onVideoEnd={isSelected ? handleVideoEnd : undefined}
                  onClick={() => handleSelect(index)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: Horizontal scroll */}
      <div className="md:hidden">
        <div
          className="flex items-center gap-4 px-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {items.map((item, index) => {
            const isSelected = index === selectedIndex;

            return (
              <div
                key={item.id}
                className="flex-shrink-0 snap-center transition-all duration-300"
                style={{
                  width: isSelected ? '80vw' : '60vw',
                  maxWidth: isSelected ? 320 : 240,
                }}
              >
                <MediaItem
                  item={item}
                  isSelected={isSelected}
                  aspectRatio={aspectRatio}
                  theme={theme}
                  onVideoEnd={isSelected ? handleVideoEnd : undefined}
                  onClick={() => handleSelect(index)}
                />
              </div>
            );
          })}
          {/* Spacer for last item */}
          <div className="flex-shrink-0 w-4" aria-hidden="true" />
        </div>
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleSelect(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === selectedIndex
                  ? 'w-6 bg-[var(--foreground)]'
                  : 'bg-[var(--foreground)]/30 hover:bg-[var(--foreground)]/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
