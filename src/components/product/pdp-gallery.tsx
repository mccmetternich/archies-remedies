'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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

  // Check if heroImage is a video (common video extensions)
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

  const handleVideoClick = (videoUrl: string) => {
    setActiveVideoUrl(videoUrl);
    setVideoModalOpen(true);
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
      <div className="relative overflow-visible">
        {/* Main Image Container */}
        <div className="relative">
          <div
            className="relative bg-gradient-to-br from-[var(--primary-light)] to-[var(--cream)] overflow-hidden"
            style={{
              height: 'min(calc(100vh - 150px), 100%)',
              width: 'min(calc(100vh - 150px), 100%)',
              aspectRatio: '1 / 1',
            }}
          >
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
              <div className="absolute bottom-6 right-6 z-20 w-24 h-24 md:w-28 md:h-28">
                <Image
                  src={rotatingSealImageUrl}
                  alt="Product seal"
                  width={112}
                  height={112}
                  className="w-full h-full animate-spin-slow"
                />
              </div>
            )}

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
                    sizes="(max-width: 768px) 100vw, 66vw"
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
        </div>

        {/* Vertical Thumbnail Strip - Aligned to top of hero */}
        {allImages.length > 1 && (
          <div className="hidden lg:flex flex-col gap-2 xl:gap-3 absolute -right-[5.5rem] xl:-right-[6.5rem] 2xl:-right-[7.5rem] top-0 z-30">
            {allImages.slice(0, 5).map((image, index) => (
              <button
                key={image.id}
                onMouseEnter={() => handleThumbnailHover(index)}
                className={cn(
                  'relative w-16 lg:w-[4.5rem] xl:w-20 2xl:w-24 aspect-square overflow-hidden transition-all duration-200 shadow-lg bg-white',
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
        )}
      </div>

      {/* Mobile Horizontal Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex md:hidden gap-3 mt-4 overflow-x-auto scrollbar-hide pb-2">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                if (image.isVideo && image.videoUrl) {
                  handleVideoClick(image.videoUrl);
                } else {
                  setDirection(index > activeIndex ? 1 : -1);
                  setActiveIndex(index);
                }
              }}
              className={cn(
                'relative flex-shrink-0 w-20 aspect-square overflow-hidden transition-all duration-200',
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
                  sizes="80px"
                />
              ) : null}
            </button>
          ))}
        </div>
      )}

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
