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

  // Handle thumbnail hover - slides to that image
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

  // Mobile scroll state
  const [mobileScrollIndex, setMobileScrollIndex] = useState(0);
  const visibleMobileThumbnails = 3;
  const canScrollUp = mobileScrollIndex > 0;
  const canScrollDown = mobileScrollIndex + visibleMobileThumbnails < allImages.length;

  return (
    <>
      {/* Desktop Layout - Pure CSS, no JavaScript sizing */}
      <div className="hidden lg:flex gap-4 items-start">
        {/* Hero Media - viewport height constrained */}
        <div className="relative flex-1 min-w-0 bg-[var(--cream)] overflow-hidden h-[calc(100vh-20px)] w-auto max-w-full">
          {/* Product Badge */}
          {badge && (
            <div className="absolute top-5 left-5 z-20">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--foreground)] text-white rounded-full text-sm font-medium shadow-lg">
                {badgeEmoji && <span>{badgeEmoji}</span>}
                {badge}
              </span>
            </div>
          )}

          {/* Rotating Seal */}
          {rotatingSealEnabled && rotatingSealImageUrl && (
            <div className="absolute bottom-6 right-6 z-20 w-28 h-28">
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
                  sizes="50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl opacity-20">
                    {productName.toLowerCase().includes('drop') ? '💧' : '🧴'}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thumbnails - Pure CSS w-24 aspect-square */}
        {allImages.length > 1 && (
          <div className="sticky top-24 self-start flex-shrink-0 flex flex-col items-center">
            {/* Up Arrow */}
            <button
              onClick={() => {
                setDirection(-1);
                setActiveIndex(activeIndex === 0 ? allImages.length - 1 : activeIndex - 1);
              }}
              className="w-24 h-10 flex items-center justify-center bg-[#1a1a1a] text-white"
            >
              <ChevronUp className="w-6 h-6" />
            </button>

            {/* Thumbnail buttons */}
            <div className="flex flex-col gap-2 py-2">
              {allImages.slice(0, 5).map((image, index) => (
                <button
                  key={image.id}
                  onMouseEnter={() => handleThumbnailHover(index)}
                  className={cn(
                    'w-24 aspect-square flex-shrink-0 relative overflow-hidden bg-white transition-all duration-200',
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
                      sizes="96px"
                    />
                  ) : null}
                </button>
              ))}
            </div>

            {/* Down Arrow */}
            <button
              onClick={() => {
                setDirection(1);
                setActiveIndex(activeIndex === allImages.length - 1 ? 0 : activeIndex + 1);
              }}
              className="w-24 h-10 flex items-center justify-center bg-[#1a1a1a] text-white"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Layout - Edge to edge, no gaps */}
      <div className="lg:hidden overflow-x-hidden">
        {/* Hero + Thumbnail row - no gap */}
        <div className="flex">
          {/* Hero Image - fills remaining space, 18% taller */}
          <div
            className="relative bg-gradient-to-br from-[var(--primary-light)] to-[var(--cream)] overflow-hidden flex-1"
            style={{ aspectRatio: '1 / 1.18' }}
          >
            {/* Badges hidden on mobile */}

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
                    sizes="80vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl opacity-20">
                      {productName.toLowerCase().includes('drop') ? '💧' : '🧴'}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Blue hex separator between hero and thumbnails */}
          {allImages.length > 1 && (
            <div className="w-[5px] bg-[#bbdae9]" />
          )}

          {/* Thumbnail Strip - hex blue tray with thumbnails on top */}
          {allImages.length > 1 && (
            <div className="flex flex-col w-[115px] bg-[#bbdae9]">
              {/* Up Arrow - thin sliver, hex blue, hide icon on first image */}
              <button
                onClick={() => {
                  if (canScrollUp) {
                    setMobileScrollIndex(mobileScrollIndex - 1);
                  }
                  if (activeIndex > 0) {
                    setDirection(-1);
                    setActiveIndex(activeIndex - 1);
                  }
                }}
                disabled={activeIndex === 0}
                className="w-full h-5 flex items-center justify-center bg-[#bbdae9] text-[#1a1a1a]"
              >
                {activeIndex > 0 && <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              {/* Visible Thumbnails - with gaps */}
              <div className="flex-1 flex flex-col gap-[5px]">
                {allImages
                  .slice(mobileScrollIndex, mobileScrollIndex + visibleMobileThumbnails)
                  .map((image, idx) => {
                    const actualIndex = mobileScrollIndex + idx;
                    return (
                      <button
                        key={image.id}
                        onClick={() => {
                          // Play video in hero instead of opening modal
                          setDirection(actualIndex > activeIndex ? 1 : -1);
                          setActiveIndex(actualIndex);
                        }}
                        className={cn(
                          'relative flex-1 min-h-0 overflow-hidden transition-all duration-200 bg-white',
                          actualIndex === activeIndex && 'ring-2 ring-[#bbdae9] ring-inset'
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
                            alt={image.altText || `${productName} view ${actualIndex + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : null}
                      </button>
                    );
                  })}
              </div>

              {/* Down Arrow - thin sliver, hex blue */}
              <button
                onClick={() => {
                  if (canScrollDown) {
                    setMobileScrollIndex(mobileScrollIndex + 1);
                  }
                  if (activeIndex < allImages.length - 1) {
                    setDirection(1);
                    setActiveIndex(activeIndex + 1);
                  }
                }}
                className={cn(
                  'w-full h-5 flex items-center justify-center bg-[#bbdae9] text-[#1a1a1a]',
                  !canScrollDown && activeIndex === allImages.length - 1 && 'opacity-40'
                )}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
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
