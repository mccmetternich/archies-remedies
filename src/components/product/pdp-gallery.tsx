'use client';

import React, { useState } from 'react';
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
          'flex items-stretch',
          'gap-[var(--pdp-gap)] lg:gap-[var(--pdp-gutter)]', // Gap shrinks before hero
          'pt-[40px] lg:pt-[40px]', // Static top padding
          galleryHeight
        )}
      >
        {/* Hero Container - true scaling, not cropping */}
        <div
          className={cn(
            'relative bg-[var(--cream)]',
            'flex-[1_1_auto] min-w-0', // Hero can shrink but prefers natural size
            'aspect-[1/1.18] lg:aspect-square',
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
                  className="w-full h-full object-contain pointer-events-none select-none bg-[var(--cream)]"
                  draggable={false}
                />
              ) : activeImage?.imageUrl ? (
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.altText || productName}
                  fill
                  className="object-contain pointer-events-none select-none"
                  style={{ backgroundColor: 'var(--cream)' }}
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
              'flex flex-col self-stretch',
              'bg-[#bbdae9] lg:bg-[#1a1a1a]',
              'w-[115px] lg:w-[200px]',
              'flex-shrink-0' // Tray never shrinks
            )}
          >
            {/* Up Arrow - always visible, navigates images */}
            <button
              onClick={goToPrevious}
              className={cn(
                'flex items-center justify-center transition-opacity',
                'h-6 lg:h-8',
                'bg-[#bbdae9] lg:bg-transparent',
                'text-[#1a1a1a] lg:text-white/60 lg:hover:text-white',
                activeIndex === 0 && 'opacity-30'
              )}
            >
              <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>

            {/* Thumbnail buttons - equal gaps for puzzle effect */}
            <div
              className={cn(
                'flex-1 flex flex-col',
                'gap-[var(--pdp-gap)]', // 5px gaps everywhere
                'p-[var(--pdp-gap)] lg:p-[20px]',
                'overflow-hidden'
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

            {/* Down Arrow - always visible, navigates images */}
            <button
              onClick={goToNext}
              className={cn(
                'flex items-center justify-center transition-opacity',
                'h-6 lg:h-8',
                'bg-[#bbdae9] lg:bg-transparent',
                'text-[#1a1a1a] lg:text-white/60 lg:hover:text-white',
                activeIndex === allImages.length - 1 && 'opacity-30'
              )}
            >
              <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5" />
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
