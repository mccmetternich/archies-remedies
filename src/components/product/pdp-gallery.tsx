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
}

export function PDPGallery({
  images,
  heroImage,
  productName,
  badge,
  badgeEmoji,
  rotatingSealEnabled,
  rotatingSealImageUrl,
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

  return (
    <>
      {/* Unified Layout - Single responsive component */}
      <div className="flex items-start lg:h-[calc(100vh-80px)]">
        {/* Hero Container - square on desktop, taller on mobile */}
        <div
          className={cn(
            'relative overflow-hidden bg-[var(--cream)]',
            'flex-1 min-w-0',
            'aspect-[1/1.18] lg:aspect-square lg:max-h-[calc(100vh-20px)] lg:w-auto'
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

          {/* Animated Image/Video */}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              {activeImage?.isVideo && activeImage?.videoUrl ? (
                <video
                  src={activeImage.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : activeImage?.imageUrl ? (
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.altText || productName}
                  fill
                  className="object-cover"
                  priority={activeIndex === 0}
                  sizes="(max-width: 1024px) 80vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl lg:text-8xl opacity-20">
                    {productName.toLowerCase().includes('drop') ? '💧' : '🧴'}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Blue Hex Separator - 5px mobile, 2px desktop */}
        {allImages.length > 1 && (
          <div className="w-[5px] lg:w-[2px] bg-[#bbdae9] self-stretch" />
        )}

        {/* Thumbnails - Saie-style vertical tray */}
        {allImages.length > 1 && (
          <div
            className={cn(
              'flex flex-col self-stretch',
              'bg-[#bbdae9] lg:bg-[#f8f8f8]',
              'w-[115px] lg:w-[200px]',
              'lg:ml-10 lg:flex-shrink-0 lg:h-full lg:sticky lg:top-[80px] lg:pt-12'
            )}
          >
            {/* Up Arrow - mobile only */}
            <button
              onClick={() => {
                setDirection(-1);
                setActiveIndex(activeIndex === 0 ? allImages.length - 1 : activeIndex - 1);
              }}
              disabled={activeIndex === 0}
              className={cn(
                'w-full h-5 flex items-center justify-center lg:hidden',
                'bg-[#bbdae9]',
                'text-[#1a1a1a]'
              )}
            >
              {activeIndex > 0 && <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            {/* Thumbnail buttons */}
            <div className="flex-1 lg:flex-none flex flex-col gap-[5px] lg:gap-3 lg:px-4">
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

            {/* Down Arrow - mobile only */}
            <button
              onClick={() => {
                setDirection(1);
                setActiveIndex(activeIndex === allImages.length - 1 ? 0 : activeIndex + 1);
              }}
              className={cn(
                'w-full h-5 flex items-center justify-center lg:hidden',
                'bg-[#bbdae9]',
                'text-[#1a1a1a]',
                activeIndex === allImages.length - 1 && 'opacity-40'
              )}
            >
              <ChevronDown className="w-3.5 h-3.5" />
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
