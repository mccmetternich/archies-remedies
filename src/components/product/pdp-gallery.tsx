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

  // Check if heroImage is a video
  const isHeroVideo = heroImage && /\.(mp4|webm|mov|ogg)$/i.test(heroImage);

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

  // Scroll thumbnail container
  const scrollThumbnails = (direction: 'up' | 'down') => {
    const container = thumbnailContainerRef.current;
    if (!container) return;
    const scrollAmount = 200;
    container.scrollBy({
      top: direction === 'up' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Handle thumbnail interaction
  const handleThumbnailClick = (index: number) => {
    if (index !== activeIndex) {
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
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

  // CSS-only height calculations using CSS variables
  // Hero max-height: 100vh - header - marquee - 80px buffer
  // Gallery height: 100vh - header - marquee (extends to marquee floor)
  const heroMaxHeight = marqueeEnabled
    ? 'lg:max-h-[calc(100vh-var(--pdp-header-height)-var(--pdp-marquee-height)-var(--pdp-fold-buffer))]'
    : 'lg:max-h-[calc(100vh-var(--pdp-header-height)-var(--pdp-fold-buffer))]';

  const galleryHeight = marqueeEnabled
    ? 'lg:h-[calc(100vh-var(--pdp-header-height)-var(--pdp-marquee-height))]'
    : 'lg:h-[calc(100vh-var(--pdp-header-height))]';

  return (
    <>
      {/* Unified Layout - CSS-only vertical rhythm, no JS dependencies */}
      <div
        className={cn(
          'flex items-start', // items-start allows max-height to create visible whitespace
          'gap-[var(--pdp-gap)] lg:gap-[var(--pdp-gutter)]', // Gap shrinks before hero
          'pt-0 lg:pt-0', // No additional top padding - header spacer handles clearance
          galleryHeight
        )}
      >
        {/* Hero Container - true scaling, repelling margin from marquee */}
        <div
          className={cn(
            'relative bg-white',
            'flex-[1_1_auto] lg:flex-[1_1_0%] min-w-0', // Flex-basis 0% ensures gap shrinks first
            'aspect-[1/1.18] lg:aspect-square',
            heroMaxHeight,
            'mb-[40px] lg:mb-[80px]', // Physical margin creates breathing gap above marquee
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
              {activeImage?.isVideo && activeImage?.videoUrl ? (
                <video
                  src={activeImage.videoUrl}
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

        {/* Thumbnails - Vertical tray for ALL screen widths (puzzle layout) */}
        {allImages.length > 1 && (
          <div
            className={cn(
              'relative flex flex-col self-stretch',
              'bg-[#bbdae9] lg:bg-[#1a1a1a]',
              'w-[115px] lg:flex-none lg:w-[200px]',
              'flex-shrink-0',
              'overflow-hidden' // Contain the gradient overlays
            )}
          >
            {/* Top Gradient Overlay + Up Arrow - separate div for fade effect */}
            <div
              className={cn(
                'absolute top-0 left-0 right-0 z-40',
                'h-16 lg:h-20',
                'bg-gradient-to-b from-[#bbdae9] via-[#bbdae9]/60 to-transparent',
                'lg:from-[#1a1a1a] lg:via-[#1a1a1a]/60 lg:to-transparent',
                'flex items-start justify-center pt-2',
                'transition-opacity duration-200',
                'pointer-events-none',
                // Mobile: hide when at first image
                activeIndex === 0 && 'opacity-0 lg:opacity-100',
                // Desktop: hide when can't scroll up
                !canScrollUp && 'lg:opacity-0'
              )}
            >
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    goToPrevious();
                  } else {
                    scrollThumbnails('up');
                  }
                }}
                className={cn(
                  'pointer-events-auto',
                  'w-8 h-8 lg:w-10 lg:h-10 rounded-full',
                  'flex items-center justify-center',
                  'bg-white/20 lg:bg-white/10 hover:bg-white/30',
                  'text-[#1a1a1a] lg:text-white',
                  'transition-colors duration-200'
                )}
              >
                <ChevronUp className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>

            {/* Thumbnail buttons - scrollable container, flush edges */}
            <div
              ref={thumbnailContainerRef}
              className={cn(
                'flex-1 flex flex-col',
                'gap-[var(--pdp-gap)]', // 5px gaps
                'p-[var(--pdp-gap)] lg:p-[20px]', // Flush with tray edges
                'overflow-y-auto overflow-x-hidden'
              )}
            >
              {allImages.slice(0, 5).map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => handleThumbnailClick(index)}
                  onMouseEnter={() => handleThumbnailClick(index)}
                  className={cn(
                    'relative overflow-hidden bg-white transition-all duration-200',
                    'flex-1 min-h-0', // Fill available space equally (puzzle)
                    'lg:flex-none lg:aspect-square', // Desktop: fixed squares
                    index === activeIndex && 'ring-2 ring-[#bbdae9]'
                  )}
                >
                  {image.isVideo && image.videoUrl ? (
                    <video
                      src={image.videoUrl}
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
                      sizes="(max-width: 1024px) 80px, 200px"
                    />
                  ) : null}
                </button>
              ))}
            </div>

            {/* Bottom Gradient Overlay + Down Arrow - separate div for fade effect */}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 z-40',
                'h-16 lg:h-20',
                'bg-gradient-to-t from-[#bbdae9] via-[#bbdae9]/60 to-transparent',
                'lg:from-[#1a1a1a] lg:via-[#1a1a1a]/60 lg:to-transparent',
                'flex items-end justify-center pb-2',
                'transition-opacity duration-200',
                'pointer-events-none',
                // Mobile: hide when at last image
                activeIndex === allImages.length - 1 && 'opacity-0 lg:opacity-100',
                // Desktop: hide when can't scroll down
                !canScrollDown && 'lg:opacity-0'
              )}
            >
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    goToNext();
                  } else {
                    scrollThumbnails('down');
                  }
                }}
                className={cn(
                  'pointer-events-auto',
                  'w-8 h-8 lg:w-10 lg:h-10 rounded-full',
                  'flex items-center justify-center',
                  'bg-white/20 lg:bg-white/10 hover:bg-white/30',
                  'text-[#1a1a1a] lg:text-white',
                  'transition-colors duration-200'
                )}
              >
                <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
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
