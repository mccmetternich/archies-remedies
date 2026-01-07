'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type ScaleCarouselAspectRatio = '3:4' | '9:16';

export interface ScaleCarouselItem {
  id: string;
  mediaUrl: string;
  label?: string;
  isVideo?: boolean;
}

export interface ScaleCarouselConfig {
  items: ScaleCarouselItem[];
  aspectRatio?: ScaleCarouselAspectRatio;
  scaleIntensity?: number; // default 1.2
  autoPlayCenter?: boolean; // auto-play video when centered
}

interface ScaleCarouselProps extends ScaleCarouselConfig {
  className?: string;
}

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

function MediaItem({
  item,
  isCentered,
  autoPlayCenter,
  aspectRatio,
}: {
  item: ScaleCarouselItem;
  isCentered: boolean;
  autoPlayCenter: boolean;
  aspectRatio: ScaleCarouselAspectRatio;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldUseVideo = item.isVideo || isVideoUrl(item.mediaUrl);

  // Handle video autoplay based on center position
  useEffect(() => {
    if (!videoRef.current || !shouldUseVideo) return;

    if (isCentered && autoPlayCenter) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked by browser
      });
    } else {
      videoRef.current.pause();
    }
  }, [isCentered, autoPlayCenter, shouldUseVideo]);

  const aspectClass = aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[3/4]';

  return (
    <div className={cn('relative w-full overflow-hidden rounded-xl bg-gray-100', aspectClass)}>
      {shouldUseVideo ? (
        <video
          ref={videoRef}
          src={item.mediaUrl}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
        />
      ) : (
        <Image
          src={item.mediaUrl}
          alt={item.label || ''}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 80vw, 300px"
        />
      )}

      {/* Label Overlay */}
      {item.label && (
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white text-sm md:text-base font-medium leading-snug">
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
  items,
  aspectRatio = '3:4',
  scaleIntensity = 1.2,
  autoPlayCenter = true,
  className,
}: ScaleCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [centerIndex, setCenterIndex] = useState(Math.floor(items.length / 2));
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Calculate which item is centered
  const updateCenterIndex = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const children = Array.from(container.children) as HTMLElement[];

    let closestIndex = 0;
    let closestDistance = Infinity;

    children.forEach((child, index) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setCenterIndex(closestIndex);
  }, []);

  // Scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!isDragging) {
        updateCenterIndex();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [updateCenterIndex, isDragging]);

  // Initial centering - scroll to center item
  useEffect(() => {
    const container = containerRef.current;
    if (!container || items.length === 0) return;

    // Wait for layout
    requestAnimationFrame(() => {
      const children = Array.from(container.children) as HTMLElement[];
      const middleIndex = Math.floor(items.length / 2);
      const middleChild = children[middleIndex];

      if (middleChild) {
        const scrollPosition =
          middleChild.offsetLeft -
          container.clientWidth / 2 +
          middleChild.offsetWidth / 2;
        container.scrollLeft = scrollPosition;
        updateCenterIndex();
      }
    });
  }, [items.length, updateCenterIndex]);

  // Mouse/touch drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;

    setIsDragging(true);
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    setStartX(pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;

    e.preventDefault();
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const x = pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    container.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    updateCenterIndex();
  };

  if (!items || items.length === 0) {
    return null;
  }

  // Calculate scale based on distance from center
  const getScale = (index: number) => {
    const distance = Math.abs(index - centerIndex);
    if (distance === 0) return scaleIntensity;
    if (distance === 1) return 1 + (scaleIntensity - 1) * 0.3;
    return 1;
  };

  const getOpacity = (index: number) => {
    const distance = Math.abs(index - centerIndex);
    if (distance === 0) return 1;
    if (distance === 1) return 0.7;
    return 0.5;
  };

  return (
    <section className={cn('py-12 md:py-16 lg:py-20 overflow-hidden', className)}>
      {/* Desktop: Multiple visible items with center scaling */}
      <div className="hidden md:block">
        <div
          ref={containerRef}
          className="flex items-center gap-6 lg:gap-8 px-[20%] overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory',
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex-shrink-0 transition-all duration-300 ease-out scroll-snap-align-center"
              style={{
                width: aspectRatio === '9:16' ? '200px' : '280px',
                transform: `scale(${getScale(index)})`,
                opacity: getOpacity(index),
                scrollSnapAlign: 'center',
              }}
            >
              <MediaItem
                item={item}
                isCentered={index === centerIndex}
                autoPlayCenter={autoPlayCenter}
                aspectRatio={aspectRatio}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Single focused item with peek */}
      <div className="md:hidden">
        <div
          ref={containerRef}
          className="flex items-center gap-4 px-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex-shrink-0 snap-center"
              style={{ width: '80vw', maxWidth: '320px' }}
            >
              <MediaItem
                item={item}
                isCentered={index === centerIndex}
                autoPlayCenter={autoPlayCenter}
                aspectRatio={aspectRatio}
              />
            </div>
          ))}
          {/* Spacer for last item peek */}
          <div className="flex-shrink-0 w-[10vw]" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
