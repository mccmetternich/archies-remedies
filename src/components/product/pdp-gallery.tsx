'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isVideoUrl } from '@/lib/media-utils';

interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isVideo: boolean | null;
  videoUrl: string | null;
}

interface PDPGalleryProps {
  images: ProductImage[];
  heroImage: string | null;
  productName: string;
  badge?: string | null;
  badgeEmoji?: string | null;
  rotatingSealEnabled?: boolean;
  rotatingSealImageUrl?: string | null;
  rotatingSealPosition?: string;
  rotatingSealSize?: number;
  rotatingSealSpeed?: number;
  marqueeEnabled?: boolean;
}

// Hook to detect mobile/tablet (< 1024px)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export function PDPGallery({
  images,
  heroImage,
  productName,
  badge,
  badgeEmoji,
  rotatingSealEnabled,
  rotatingSealImageUrl,
  rotatingSealPosition = 'bottom-right',
  rotatingSealSize = 112,
  rotatingSealSpeed = 20,
  marqueeEnabled = false,
}: PDPGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Mobile batch scrolling state (Saie-style: 3 thumbnails at a time)
  const [batchIndex, setBatchIndex] = useState(0);
  const isMobile = useIsMobile();
  const BATCH_SIZE = 3;

  // isVideoUrl imported from @/lib/media-utils

  // Check if heroImage is a video
  const isHeroVideo = isVideoUrl(heroImage);

  // Combine hero image with additional images
  const allImages: ProductImage[] = heroImage
    ? [
        {
          id: 'hero',
          imageUrl: heroImage,
          altText: productName,
          isVideo: isHeroVideo || false,
          videoUrl: isHeroVideo ? heroImage : null,
        },
        ...images,
      ]
    : images;

  const activeImage = allImages[activeIndex];

  // Thumbnail tray scroll detection
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  // Detect overflow and scroll position using ResizeObserver for stable measurement
  useEffect(() => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    const updateScrollState = () => {
      if (isMobile) {
        // Mobile: based on batch availability
        const maxBatch = Math.floor((allImages.length - 1) / BATCH_SIZE);
        setCanScrollUp(batchIndex > 0);
        setCanScrollDown(batchIndex < maxBatch);
      } else {
        // Desktop: based on actual scroll position
        const { scrollTop, scrollHeight, clientHeight } = container;
        const hasOverflow = scrollHeight > clientHeight + 1; // 1px buffer for sub-pixel rounding
        const atTop = scrollTop <= 1;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

        setCanScrollUp(hasOverflow && !atTop);
        setCanScrollDown(hasOverflow && !atBottom);
      }
    };

    // ResizeObserver ensures measurement happens after layout is stable
    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    resizeObserver.observe(container);
    container.addEventListener('scroll', updateScrollState);

    // Initial measurement
    updateScrollState();

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('scroll', updateScrollState);
    };
  }, [allImages.length, isMobile, batchIndex]);

  // Calculate which batch an image belongs to
  const getBatchForIndex = useCallback((index: number) => {
    return Math.floor(index / BATCH_SIZE);
  }, []);

  // Get visible thumbnail indices for current batch (mobile only)
  const getVisibleThumbnailRange = useCallback(() => {
    const start = batchIndex * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE - 1, allImages.length - 1);
    return { start, end };
  }, [batchIndex, allImages.length]);

  // Scroll to a specific batch (mobile only) - scrolls container, not page
  const scrollToBatch = useCallback((newBatchIndex: number) => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    const maxBatch = Math.floor((allImages.length - 1) / BATCH_SIZE);
    const clampedBatch = Math.max(0, Math.min(newBatchIndex, maxBatch));

    // Always update batch index and scroll (allows repeated clicks during scroll)
    setBatchIndex(clampedBatch);

    // Calculate scroll position based on thumbnail heights
    const thumbnailButtons = container.querySelectorAll('button');
    const targetIndex = clampedBatch * BATCH_SIZE;
    const targetThumbnail = thumbnailButtons[targetIndex] as HTMLElement;

    if (targetThumbnail) {
      // Get the offset of the target thumbnail relative to the container
      const containerTop = container.getBoundingClientRect().top;
      const thumbnailTop = targetThumbnail.getBoundingClientRect().top;
      const currentScrollTop = container.scrollTop;
      const scrollTarget = currentScrollTop + (thumbnailTop - containerTop);

      // Use instant scroll on mobile for immediate feedback, smooth on desktop
      container.scrollTo({
        top: scrollTarget,
        behavior: 'auto',
      });
    }
  }, [allImages.length]);

  // Update batch when active index crosses batch boundaries (mobile)
  // Debounced to avoid conflicts with swipe animation
  useEffect(() => {
    if (!isMobile) return;

    const newBatch = getBatchForIndex(activeIndex);
    if (newBatch !== batchIndex) {
      // Small delay to let swipe animation settle before batch scroll
      const timer = setTimeout(() => {
        scrollToBatch(newBatch);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, isMobile, batchIndex, getBatchForIndex, scrollToBatch]);

  // Auto-scroll thumbnail container to keep active thumbnail visible (DESKTOP ONLY)
  useEffect(() => {
    // Skip on mobile - batch scrolling handles it
    if (isMobile) return;

    const container = thumbnailContainerRef.current;
    if (!container) return;

    // Find the active thumbnail button
    const thumbnailButtons = container.querySelectorAll('button');
    const activeThumbnail = thumbnailButtons[activeIndex];
    if (!activeThumbnail) return;

    // Scroll the active thumbnail into view
    activeThumbnail.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [activeIndex, isMobile]);

  // Scroll thumbnail container (batch on mobile, single thumbnail on desktop)
  const scrollThumbnails = (scrollDirection: 'up' | 'down') => {
    if (isMobile) {
      // Mobile: scroll by batch
      const newBatch = scrollDirection === 'up' ? batchIndex - 1 : batchIndex + 1;
      scrollToBatch(newBatch);
      return;
    }

    // Desktop: scroll by one thumbnail
    const container = thumbnailContainerRef.current;
    if (!container) return;

    // Get actual thumbnail height from first button
    const firstThumb = container.querySelector('button');
    const thumbHeight = firstThumb ? firstThumb.offsetHeight : 75;
    const gap = 5; // --pdp-gap
    const scrollAmount = thumbHeight + gap;

    container.scrollBy({
      top: scrollDirection === 'up' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Handle thumbnail hover - just change active image (desktop behavior)
  const handleThumbnailHover = (index: number) => {
    if (index !== activeIndex) {
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
    }
  };

  // Handle thumbnail click - change active image (batch scrolling handles thumbnail scroll on mobile)
  const handleThumbnailClick = (index: number) => {
    if (index !== activeIndex) {
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
    }

    // On mobile, batch scrolling effect handles thumbnail navigation
    if (isMobile) return;

    // Desktop: Check if clicked thumbnail is at edge and scroll to reveal more
    const container = thumbnailContainerRef.current;
    if (!container) return;

    const thumbnailButtons = container.querySelectorAll('button');
    const clickedThumbnail = thumbnailButtons[index] as HTMLElement;
    if (!clickedThumbnail) return;

    const containerRect = container.getBoundingClientRect();
    const thumbRect = clickedThumbnail.getBoundingClientRect();

    // Dynamic thumbnail height based on actual size
    const thumbHeight = clickedThumbnail.offsetHeight;
    const gap = 5; // --pdp-gap
    const scrollAmount = thumbHeight + gap;

    // If thumbnail is near the bottom edge and there are more below, scroll down
    if (thumbRect.bottom > containerRect.bottom - 40 && index < allImages.length - 1) {
      container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
    // If thumbnail is near the top edge and there are more above, scroll up
    else if (thumbRect.top < containerRect.top + 40 && index > 0) {
      container.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
    }
  };

  // Navigate to previous/next
  const goToPrevious = () => {
    setDirection(-1);
    setActiveIndex(activeIndex === 0 ? allImages.length - 1 : activeIndex - 1);
  };

  const goToNext = () => {
    setDirection(1);
    setActiveIndex(activeIndex === allImages.length - 1 ? 0 : activeIndex + 1);
  };

  // Slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
    }),
    center: {
      x: 0,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
    }),
  };

  // CSS-only height calculations using CSS variables - GLOBAL (no lg: prefix)
  // Hero max-height: 100vh - header - marquee - buffer - 40px stagger margin
  // Gallery height: 100vh - header - marquee (extends to marquee floor)
  // Desktop-only height constraints (mobile flows naturally)
  const heroMaxHeight = marqueeEnabled
    ? 'lg:max-h-[calc(100vh-var(--pdp-header-height)-var(--pdp-marquee-height)-var(--pdp-fold-buffer)-40px)]'
    : 'lg:max-h-[calc(100vh-var(--pdp-header-height)-var(--pdp-fold-buffer)-40px)]';

  // Gallery height: full Media Lane minus marquee (so content doesn't hide behind marquee)
  const galleryHeight = marqueeEnabled
    ? 'lg:h-[calc(100vh-var(--pdp-header-height)-var(--pdp-marquee-height))]'
    : 'lg:h-[calc(100vh-var(--pdp-header-height))]';

  return (
    <>
      {/* Unified Layout - CSS-only vertical rhythm, no JS dependencies */}
      <div
        className={cn(
          'flex items-stretch w-full max-w-full overflow-hidden', // Hero stays at top
          'gap-0 lg:gap-[var(--pdp-gutter)]', // No gap on mobile, gutter on desktop
          'min-[2571px]:justify-start', // Keep hero left-aligned at ultra-wide
          galleryHeight
        )}
      >
        {/* Hero Container - unified geometry across all breakpoints */}
        <div
          className={cn(
            'relative',
            'flex-[1_1_0%] lg:min-w-[var(--pdp-hero-min-width)]', // Grow to fill, 520px floor on desktop
            'min-[2571px]:max-w-[var(--pdp-hero-max-width)]', // Cap at max on ultra-wide only
            'aspect-square', // Square on ALL breakpoints
            heroMaxHeight,
            'lg:min-h-[400px]', // Floor only on desktop - mobile scales naturally
            'lg:mt-[var(--pdp-hero-stagger)]', // Editorial Stagger: fluid 40px → 28px
            'mb-0 lg:mb-[var(--pdp-hero-bottom-margin)]', // Fluid 80px → 40px
            'lg:self-start', // Anchor hero to top (vertical)
            'bg-[#f2f2f2]', // Match image background to prevent white gaps during transitions
            allImages.length > 1 && 'cursor-grab active:cursor-grabbing'
          )}
        >
          {/* Badge - desktop only */}
          {badge && (
            <div className="absolute top-5 left-5 z-20 hidden lg:block">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--foreground)] text-white rounded-full text-sm font-medium shadow-lg">
                {badgeEmoji && <span>{badgeEmoji}</span>}
                {badge}
              </span>
            </div>
          )}

          {/* Rotating Seal - responsive with configurable position/size/speed */}
          {rotatingSealEnabled && rotatingSealImageUrl && (() => {
            // Position classes based on rotatingSealPosition
            const positionClasses = {
              'top-left': 'top-4 left-4 lg:top-6 lg:left-6',
              'top-right': 'top-4 right-4 lg:top-6 lg:right-6',
              'bottom-left': 'bottom-4 left-4 lg:bottom-6 lg:left-6',
              'bottom-right': 'bottom-4 right-4 lg:bottom-6 lg:right-6',
            }[rotatingSealPosition] || 'bottom-6 right-6';

            // Mobile size is 75% of configured size
            const mobileSize = Math.round(rotatingSealSize * 0.75);

            return (
              <div
                className={cn('absolute z-20', positionClasses)}
                style={{
                  width: isMobile ? mobileSize : rotatingSealSize,
                  height: isMobile ? mobileSize : rotatingSealSize,
                }}
              >
                <Image
                  src={rotatingSealImageUrl}
                  alt="Product seal"
                  width={rotatingSealSize}
                  height={rotatingSealSize}
                  className="w-full h-full"
                  style={{
                    animation: `spin ${rotatingSealSpeed}s linear infinite`,
                  }}
                />
              </div>
            );
          })()}

          {/* Animated Image/Video with drag/swipe support */}
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 touch-pan-y overflow-hidden will-change-transform"
              style={{ transform: 'translateZ(0)' }}
              drag={allImages.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const swipeThreshold = 50;
                const velocityThreshold = 400;

                if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
                  goToNext();
                } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
                  goToPrevious();
                }
              }}
            >
              {/* Detect video from isVideo flag OR from URL pattern (Cloudinary path or extension) */}
              {(activeImage?.isVideo && activeImage?.videoUrl) || isVideoUrl(activeImage?.imageUrl) ? (
                <video
                  src={activeImage?.videoUrl || activeImage?.imageUrl || ''}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover lg:object-contain pointer-events-none select-none bg-[var(--background)]"
                  draggable={false}
                />
              ) : activeImage?.imageUrl ? (
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.altText || productName}
                  fill
                  className="object-cover lg:object-contain lg:object-left pointer-events-none select-none"
                  style={{ backgroundColor: '#f2f2f2' }}
                  priority={activeIndex === 0}
                  sizes="(max-width: 1024px) 80vw, 50vw"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
                  <span className="text-4xl lg:text-8xl opacity-20">
                    {productName.toLowerCase().includes('drop') ? '💧' : '🧴'}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thumbnails - Vertical tray, scales to show 3 large thumbnails */}
        {allImages.length >= 1 && ( // Show tray even with 1 image for testing
          <div
            className={cn(
              'relative flex flex-col',
              // Tray width ~24% of viewport to fit exactly 3 large square thumbnails
              // Height matches hero (viewport - tray width since hero is square)
              'w-[24vw] lg:w-[var(--pdp-tray-width)]',
              'h-[calc(100vw-24vw)] lg:h-auto lg:self-stretch',
              'bg-[var(--foreground)]', // Dark background for thumbnail tray
              'flex-none flex-shrink-0',
              'lg:ml-auto', // Push tray to right edge on desktop (gutter expands)
              'overflow-hidden' // Strict clipping - nothing escapes to marquee
            )}
          >
            {/* Top Gradient Fade - click-through overlay */}
            <div
              className={cn(
                'absolute top-0 left-0 right-0 z-30',
                'h-16', // Same height globally
                'bg-gradient-to-b from-[var(--foreground)] to-transparent', // Dark gradient globally
                'pointer-events-none',
                'transition-opacity duration-200',
                !canScrollUp && 'opacity-0' // Hide when can't scroll up
              )}
            />

            {/* Up Arrow - unified styling */}
            <button
              onClick={() => scrollThumbnails('up')}
              className={cn(
                'absolute top-1 left-0 right-0 z-40',
                'flex items-center justify-center',
                'h-10', // Same height globally
                'text-white/70 hover:text-white', // White on dark globally
                'transition-opacity duration-200',
                !canScrollUp && 'opacity-0 pointer-events-none' // Hide when can't scroll
              )}
            >
              <ChevronUp className="w-6 h-6" />
            </button>

            {/* Thumbnail buttons - scrollable container */}
            <div
              ref={thumbnailContainerRef}
              className={cn(
                'flex-1 flex flex-col items-stretch', // Thumbnails fill width
                'gap-[var(--pdp-gap)] lg:gap-[var(--pdp-tray-padding)]', // 5px mobile, fluid 10px → 8px desktop
                'pt-0 pl-[5px] pr-[5px] lg:px-[var(--pdp-tray-padding)] pb-[var(--pdp-tray-padding)]', // 5px mobile, fluid padding desktop
                'overflow-y-auto overflow-x-hidden'
              )}
            >
              {allImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => handleThumbnailClick(index)}
                  onMouseEnter={() => handleThumbnailHover(index)}
                  className={cn(
                    'relative overflow-hidden bg-white',
                    // Explicit width: tray (24vw) minus padding (10px) = thumbnail size
                    'flex-none aspect-square w-[calc(24vw-10px)] lg:w-full',
                    index === 0 && 'mt-[20px] lg:mt-[var(--pdp-tray-padding)]', // First thumbnail: 20px mobile, fluid desktop
                    'transition-shadow duration-200', // Only animate the ring, not size
                    index === activeIndex && 'ring-2 ring-[var(--primary)]'
                  )}
                >
                  {/* Detect video from isVideo flag OR from URL pattern */}
                  {(image.isVideo && image.videoUrl) || isVideoUrl(image.imageUrl) ? (
                    <video
                      src={image.videoUrl || image.imageUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : image.imageUrl ? (
                    <Image
                      src={image.imageUrl}
                      alt={image.altText || `${productName} view ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 20vw, 160px"
                    />
                  ) : null}
                </button>
              ))}
            </div>

            {/* Bottom Gradient Fade - click-through overlay */}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 z-30',
                'h-16', // Same height globally
                'bg-gradient-to-t from-[var(--foreground)] to-transparent', // Dark gradient globally
                'pointer-events-none',
                'transition-opacity duration-200',
                !canScrollDown && 'opacity-0' // Hide when can't scroll down
              )}
            />

            {/* Down Arrow - unified styling */}
            <button
              onClick={() => scrollThumbnails('down')}
              className={cn(
                'absolute bottom-1 left-0 right-0 z-40',
                'flex items-center justify-center',
                'h-10', // Same height globally
                'text-white/70 hover:text-white', // White on dark globally
                'transition-opacity duration-200',
                !canScrollDown && 'opacity-0 pointer-events-none' // Hide when can't scroll
              )}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* 0.5px dark gray line at bottom of media console - mobile/tablet only */}
      <div className="block lg:hidden w-full h-[0.5px] bg-[#666666]" />
    </>
  );
}
