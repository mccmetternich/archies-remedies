'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export interface MediaCarouselItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  alt?: string;
}

interface MediaCarouselProps {
  items: MediaCarouselItem[];
  className?: string;
}

// ============================================
// HELPERS
// ============================================

function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.m4v', '.ogv', '.ogg'];
  return videoExtensions.some(ext => lowerUrl.includes(ext)) || lowerUrl.includes('/video/upload/');
}

// ============================================
// COMPONENT
// ============================================

export function MediaCarousel({ items, className }: MediaCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const [containerWidth, setContainerWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [tile1Paused, setTile1Paused] = useState(false);

  // Breakpoint: 941px
  const BREAKPOINT = 941;
  const FIXED_TILE_WIDTH = 235;
  const TILES_VISIBLE = 4;

  // Calculate tile width based on viewport
  const isDesktop = containerWidth >= BREAKPOINT;
  const tileWidth = isDesktop ? containerWidth / TILES_VISIBLE : FIXED_TILE_WIDTH;

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Get first visible item (tile 1)
  const getFirstVisibleIndex = useCallback(() => {
    if (!scrollRef.current || tileWidth === 0) return 0;
    const scrollLeft = scrollRef.current.scrollLeft;
    return Math.round(scrollLeft / tileWidth);
  }, [tileWidth]);

  // Handle scroll to update current index
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const newIndex = getFirstVisibleIndex();
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [currentIndex, getFirstVisibleIndex]);

  // Auto-play tile 1 when it changes
  useEffect(() => {
    if (items.length === 0) return;

    const firstItem = items[currentIndex];
    if (!firstItem) return;

    const isFirstVideo = firstItem.type === 'video' || isVideoUrl(firstItem.url);

    // Stop all other videos
    videoRefs.current.forEach((video, id) => {
      if (id !== firstItem.id) {
        video.pause();
      }
    });

    // Auto-play first tile if it's a video and not paused by user
    if (isFirstVideo && !tile1Paused) {
      const video = videoRefs.current.get(firstItem.id);
      if (video) {
        video.play().then(() => {
          setPlayingVideoId(firstItem.id);
        }).catch(() => {});
      }
    } else {
      // Defer state update to avoid cascading renders
      queueMicrotask(() => setPlayingVideoId(null));
    }
  }, [currentIndex, items, tile1Paused]);

  // Navigate to specific index
  const navigateTo = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const targetScroll = index * tileWidth;
    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
    setTile1Paused(false); // Reset pause state on navigation
  }, [tileWidth]);

  // Navigation handlers
  const goNext = () => {
    if (currentIndex < items.length - 1) {
      navigateTo(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      navigateTo(currentIndex - 1);
    }
  };

  // Toggle pause for tile 1
  const toggleTile1Pause = () => {
    const firstItem = items[currentIndex];
    if (!firstItem) return;

    const video = videoRefs.current.get(firstItem.id);
    if (!video) return;

    if (tile1Paused) {
      video.play().catch(() => {});
      setPlayingVideoId(firstItem.id);
      setTile1Paused(false);
    } else {
      video.pause();
      setPlayingVideoId(null);
      setTile1Paused(true);
    }
  };

  // Play a specific video (stops others)
  const playVideo = (itemId: string) => {
    // Stop all videos first
    videoRefs.current.forEach((video, id) => {
      if (id !== itemId) {
        video.pause();
      }
    });

    // Play the selected video
    const video = videoRefs.current.get(itemId);
    if (video) {
      video.play().catch(() => {});
      setPlayingVideoId(itemId);
    }
  };

  // Register video ref
  const setVideoRef = (id: string, el: HTMLVideoElement | null) => {
    if (el) {
      videoRefs.current.set(id, el);
    } else {
      videoRefs.current.delete(id);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const canGoNext = currentIndex < items.length - TILES_VISIBLE;
  const canGoPrev = currentIndex > 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        // Full-bleed: break out of container
        'w-screen relative left-1/2 -translate-x-1/2',
        'overflow-hidden',
        className
      )}
    >
      {/* Scrollable carousel container */}
      <div
        ref={scrollRef}
        className={cn(
          'flex overflow-x-auto scrollbar-hide',
          'snap-x snap-mandatory',
          // Hide scrollbar
          '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
        )}
        style={{
          scrollSnapType: 'x mandatory',
        }}
      >
        {items.map((item, index) => {
          const isVideo = item.type === 'video' || isVideoUrl(item.url);
          const isFirstTile = index === currentIndex;
          const isPlaying = playingVideoId === item.id;

          // Handler for clicking anywhere on a video tile
          const handleTileClick = () => {
            if (!isVideo) return;

            if (isFirstTile) {
              // For tile 1, toggle pause state
              toggleTile1Pause();
            } else if (isPlaying) {
              // For other tiles that are playing, pause them
              const video = videoRefs.current.get(item.id);
              if (video) {
                video.pause();
                setPlayingVideoId(null);
              }
            } else {
              // For other tiles that are not playing, play them
              playVideo(item.id);
            }
          };

          return (
            <div
              key={item.id}
              className={cn(
                "flex-shrink-0 relative snap-start",
                isVideo && "cursor-pointer"
              )}
              style={{
                width: tileWidth,
                aspectRatio: '4 / 5',
              }}
              onClick={handleTileClick}
            >
              {/* Media */}
              {isVideo ? (
                <video
                  ref={(el) => setVideoRef(item.id, el)}
                  src={item.url}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={item.url}
                  alt={item.alt || `Media ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes={`${Math.ceil(tileWidth)}px`}
                  // Eagerly load first 6 images to prevent gray boxes on mobile scroll
                  // This ensures images are loaded before user swipes to them
                  loading={index < 6 ? 'eager' : 'lazy'}
                  priority={index < 2}
                />
              )}

              {/* Play/Pause button for tile 1 (videos only) */}
              {isVideo && isFirstTile && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleTile1Pause(); }}
                  className={cn(
                    'absolute bottom-4 right-4 z-10',
                    'w-10 h-10 rounded-full',
                    'border-2 border-white',
                    'flex items-center justify-center',
                    'bg-transparent hover:bg-white/10',
                    'transition-colors duration-200'
                  )}
                  aria-label={tile1Paused ? 'Play' : 'Pause'}
                >
                  {tile1Paused ? (
                    <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                  ) : (
                    <Pause className="w-4 h-4 text-white" fill="white" />
                  )}
                </button>
              )}

              {/* Play button for other video tiles */}
              {isVideo && !isFirstTile && !isPlaying && (
                <button
                  onClick={(e) => { e.stopPropagation(); playVideo(item.id); }}
                  className={cn(
                    'absolute bottom-4 right-4 z-10',
                    'w-10 h-10 rounded-full',
                    'border-2 border-white',
                    'flex items-center justify-center',
                    'bg-transparent hover:bg-white/10',
                    'transition-colors duration-200'
                  )}
                  aria-label="Play"
                >
                  <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                </button>
              )}

              {/* Pause button for playing non-first tiles */}
              {isVideo && !isFirstTile && isPlaying && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const video = videoRefs.current.get(item.id);
                    if (video) {
                      video.pause();
                      setPlayingVideoId(null);
                    }
                  }}
                  className={cn(
                    'absolute bottom-4 right-4 z-10',
                    'w-10 h-10 rounded-full',
                    'border-2 border-white',
                    'flex items-center justify-center',
                    'bg-transparent hover:bg-white/10',
                    'transition-colors duration-200'
                  )}
                  aria-label="Pause"
                >
                  <Pause className="w-4 h-4 text-white" fill="white" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation buttons - only on desktop (941px+) */}
      {isDesktop && items.length > TILES_VISIBLE && (
        <>
          {/* Previous button */}
          {canGoPrev && (
            <button
              onClick={goPrev}
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 z-20',
                'w-12 h-12 rounded-full',
                'bg-[var(--primary)] hover:bg-[#a8cdd9]',
                'flex items-center justify-center',
                'transition-colors duration-200',
                'shadow-lg'
              )}
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 text-[var(--foreground)]" />
            </button>
          )}

          {/* Next button - positioned on right edge of 4th tile */}
          {canGoNext && (
            <button
              onClick={goNext}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 z-20',
                'w-12 h-12 rounded-full',
                'bg-[var(--primary)] hover:bg-[#a8cdd9]',
                'flex items-center justify-center',
                'transition-colors duration-200',
                'shadow-lg'
              )}
              style={{
                right: 0,
              }}
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 text-[var(--foreground)]" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
