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

  // Overflow detection for arrow visibility
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const [showUpArrow, setShowUpArrow] = useState(false);
  const [showDownArrow, setShowDownArrow] = useState(false);

  // Detect overflow and scroll position for arrow visibility
  useEffect(() => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    const checkOverflow = () => {
      const hasOverflow = container.scrollHeight > container.clientHeight;
      const atTop = container.scrollTop <= 5;
      const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 5;

      setShowUpArrow(hasOverflow && !atTop);
      setShowDownArrow(hasOverflow && !atBottom);
    };

    checkOverflow();
    container.addEventListener('scroll', checkOverflow);
    window.addEventListener('resize', checkOverflow);

    return () => {
      container.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [allImages.length]);

  const activeImage = allImages[activeIndex];

  // Handle thumbnail interaction
  const handleThumbnailHover = (index: number) => {
    if (index !== activeIndex) {
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
    }
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

  // Dynamic heights based on marquee state
  // Nav: 80px, Marquee: 44px, Buffer/Gap: 50px
  // Hero max-height creates 50px gap above marquee
  const heroMaxHeight = marqueeEnabled
    ? 'lg:max-h-[calc(100vh-174px)]' // 80 + 44 + 50 = 174px reserved
    : 'lg:max-h-[calc(100vh-130px)]'; // 80 + 50 = 130px reserved

  // Gallery container height - extends to marquee floor
  const galleryHeight = marqueeEnabled
    ? 'lg:h-[calc(100vh-124px)]' // 80 + 44 = 124px (nav + marquee)
    : 'lg:h-[calc(100vh-80px)]'; // just nav

  return (
    <>
      {/* Unified Layout - Single responsive component */}
      <div className={cn('flex items-start', galleryHeight)}>
        {/* Hero Container - square on desktop, taller on mobile */}
        <div
          className={cn(
            'relative overflow-hidden bg-[var(--cream)]',
            'flex-1 min-w-0',
            'aspect-[1/1.18] lg:aspect-square lg:w-auto',
            heroMaxHeight,
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
              className="absolute inset-0 touch-pan-y"
              drag={allImages.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const swipeThreshold = 40;
                const velocityThreshold = 300;

                // Determine swipe direction based on velocity or distance
                if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
                  // Swiped left - go to next
                  setDirection(1);
                  setActiveIndex(activeIndex === allImages.length - 1 ? 0 : activeIndex + 1);
                } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
                  // Swiped right - go to previous
                  setDirection(-1);
                  setActiveIndex(activeIndex === 0 ? allImages.length - 1 : activeIndex - 1);
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
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                />
              ) : activeImage?.imageUrl ? (
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.altText || productName}
                  fill
                  className="object-cover pointer-events-none select-none"
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

        {/* Blue Hex Separator - mobile only */}
        {allImages.length > 1 && (
          <div className="w-[5px] bg-[#bbdae9] self-stretch lg:hidden" />
        )}

        {/* Thumbnails - Saie-style vertical tray with CSS variable gutter */}
        {allImages.length > 1 && (
          <div
            className={cn(
              'flex flex-col self-stretch',
              'bg-[#bbdae9] lg:bg-[#1a1a1a]',
              'w-[115px] lg:w-[200px]',
              'lg:ml-[var(--pdp-gutter)] lg:flex-shrink-0 lg:h-full lg:sticky lg:top-[80px]'
            )}
          >
            {/* Up Arrow - mobile: always visible when not at start, desktop: inside 20px grid, overflow-aware */}
            <button
              onClick={() => {
                // Mobile: navigate to previous
                if (window.innerWidth < 1024) {
                  setDirection(-1);
                  setActiveIndex(activeIndex === 0 ? allImages.length - 1 : activeIndex - 1);
                } else {
                  // Desktop: scroll up
                  thumbnailContainerRef.current?.scrollBy({ top: -180, behavior: 'smooth' });
                }
              }}
              className={cn(
                'flex items-center justify-center transition-opacity',
                // Mobile styling
                'h-5 lg:h-auto',
                'bg-[#bbdae9] lg:bg-transparent',
                'text-[#1a1a1a] lg:text-white/60 lg:hover:text-white',
                // Desktop: inside 20px padding, hide when no overflow
                'lg:mx-[20px] lg:mt-[20px] lg:mb-2',
                // Visibility
                activeIndex === 0 && 'lg:hidden',
                !showUpArrow && 'lg:opacity-0 lg:pointer-events-none'
              )}
            >
              <ChevronUp className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
            </button>

            {/* Thumbnail buttons - scrollable container with 20px padding */}
            <div
              ref={thumbnailContainerRef}
              className={cn(
                'flex-1 flex flex-col gap-[5px] lg:gap-[20px]',
                'lg:px-[20px] lg:overflow-y-auto lg:scrollbar-hide'
              )}
            >
              {allImages.slice(0, 5).map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => handleThumbnailHover(index)}
                  onMouseEnter={() => handleThumbnailHover(index)}
                  className={cn(
                    'relative overflow-hidden bg-white transition-all duration-200',
                    'flex-1 min-h-0 lg:flex-none lg:w-full lg:aspect-square lg:flex-shrink-0',
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

            {/* Down Arrow - mobile: always visible when not at end, desktop: inside 20px grid, overflow-aware */}
            <button
              onClick={() => {
                // Mobile: navigate to next
                if (window.innerWidth < 1024) {
                  setDirection(1);
                  setActiveIndex(activeIndex === allImages.length - 1 ? 0 : activeIndex + 1);
                } else {
                  // Desktop: scroll down
                  thumbnailContainerRef.current?.scrollBy({ top: 180, behavior: 'smooth' });
                }
              }}
              className={cn(
                'flex items-center justify-center transition-opacity',
                // Mobile styling
                'h-5 lg:h-auto',
                'bg-[#bbdae9] lg:bg-transparent',
                'text-[#1a1a1a] lg:text-white/60 lg:hover:text-white',
                // Desktop: inside 20px padding, hide when no overflow
                'lg:mx-[20px] lg:mb-[20px] lg:mt-2',
                // Visibility
                activeIndex === allImages.length - 1 && 'opacity-40 lg:opacity-100',
                !showDownArrow && 'lg:opacity-0 lg:pointer-events-none'
              )}
            >
              <ChevronDown className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
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
