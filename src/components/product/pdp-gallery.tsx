'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  marqueeEnabled?: boolean;
}

export function PDPGallery({
  images,
  heroImage,
  productName,
  badge,
  badgeEmoji,
  rotatingSealEnabled,
  rotatingSealImageUrl,
  marqueeEnabled = false,
}: PDPGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Helper to detect if a URL is a video (by extension or Cloudinary path)
  const isVideoUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    // Check file extension
    if (/\.(mp4|webm|mov|ogg)(\?|$)/i.test(url)) return true;
    // Check Cloudinary video path
    if (url.includes('/video/upload/')) return true;
    return false;
  };

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
      const { scrollTop, scrollHeight, clientHeight } = container;
      const hasOverflow = scrollHeight > clientHeight + 1; // 1px buffer for sub-pixel rounding
      const atTop = scrollTop <= 1;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      setCanScrollUp(hasOverflow && !atTop);
      setCanScrollDown(hasOverflow && !atBottom);
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
  }, [allImages.length]);

  // Auto-scroll thumbnail container to keep active thumbnail visible
  useEffect(() => {
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
  }, [activeIndex]);

  // Scroll thumbnail container by one thumbnail (dynamic based on actual size)
  const scrollThumbnails = (direction: 'up' | 'down') => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    // Get actual thumbnail height from first button
    const firstThumb = container.querySelector('button');
    const thumbHeight = firstThumb ? firstThumb.offsetHeight : 75;
    const gap = 5; // --pdp-gap
    const scrollAmount = thumbHeight + gap;

    container.scrollBy({
      top: direction === 'up' ? -scrollAmount : scrollAmount,
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

  // Handle thumbnail click - change active image AND scroll if at edge
  const handleThumbnailClick = (index: number) => {
    if (index !== activeIndex) {
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
    }

    // Check if clicked thumbnail is at edge and scroll to reveal more
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

          {/* Rotating Seal - desktop only */}
          {rotatingSealEnabled && rotatingSealImageUrl && (
            <div className="absolute bottom-6 right-6 z-20 w-28 h-28 hidden lg:block">
              <Image
                src={rotatingSealImageUrl}
                alt="Product seal"
                width={112}
                height={112}
                className="w-full h-full animate-spin-slow"
              />
            </div>
          )}

          {/* Animated Image/Video with drag/swipe support */}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute inset-0 touch-pan-y overflow-hidden"
              drag={allImages.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const swipeThreshold = 40;
                const velocityThreshold = 300;

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
                  className="w-full h-full object-contain pointer-events-none select-none bg-white"
                  draggable={false}
                />
              ) : activeImage?.imageUrl ? (
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.altText || productName}
                  fill
                  className="object-contain pointer-events-none select-none"
                  style={{ backgroundColor: '#ffffff' }}
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
              'w-[24vw] lg:w-[var(--pdp-tray-width)]', // 24% scaling on mobile/tablet, fluid 100px → 80px desktop
              'h-[calc(100vw-24vw)] lg:h-auto lg:self-stretch', // Height = hero width = viewport - tray
              'bg-[#1a1a1a]', // Dark background for thumbnail tray
              'flex-none flex-shrink-0',
              'min-[2571px]:ml-auto', // Push tray to right edge at ultra-wide (gutter expands)
              'overflow-hidden' // Strict clipping - nothing escapes to marquee
            )}
          >
            {/* Top Gradient Fade - click-through overlay */}
            <div
              className={cn(
                'absolute top-0 left-0 right-0 z-30',
                'h-16', // Same height globally
                'bg-gradient-to-b from-[#1a1a1a] to-transparent', // Dark gradient globally
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
                    index === activeIndex && 'ring-2 ring-[#bbdae9]'
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
                'bg-gradient-to-t from-[#1a1a1a] to-transparent', // Dark gradient globally
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

      {/* Video Modal */}
      {videoModalOpen && activeVideoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setVideoModalOpen(false)}
        >
          <button
            onClick={() => setVideoModalOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={activeVideoUrl}
              controls
              autoPlay
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </>
  );
}
