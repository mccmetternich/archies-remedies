'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
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
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Combine hero image with additional images
  const allImages: ProductImage[] = heroImage
    ? [{ id: 'hero', imageUrl: heroImage, altText: productName, isVideo: false, videoUrl: null }, ...images]
    : images;

  const activeImage = allImages[activeIndex];

  const handleThumbnailHover = (index: number) => {
    setActiveIndex(index);
  };

  const handleVideoClick = (videoUrl: string) => {
    setActiveVideoUrl(videoUrl);
    setVideoModalOpen(true);
  };

  return (
    <>
      <div className="relative flex gap-4">
        {/* Main Image - 4:5 aspect ratio */}
        <div className="flex-1 relative">
          <div className="relative aspect-[4/5] bg-gradient-to-br from-[var(--primary-light)] to-[var(--cream)] rounded-2xl overflow-hidden">
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

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                {activeImage?.isVideo && activeImage?.videoUrl ? (
                  // Video with autoplay
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
                    sizes="(max-width: 768px) 100vw, 50vw"
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

        {/* Vertical Thumbnail Strip - Right edge */}
        {allImages.length > 1 && (
          <div className="hidden md:flex flex-col gap-3 w-20">
            {allImages.slice(0, 5).map((image, index) => (
              <button
                key={image.id}
                onMouseEnter={() => handleThumbnailHover(index)}
                onClick={() => {
                  if (image.isVideo && image.videoUrl) {
                    handleVideoClick(image.videoUrl);
                  } else {
                    setActiveIndex(index);
                  }
                }}
                className={cn(
                  'relative aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all duration-200',
                  index === activeIndex
                    ? 'border-[var(--foreground)] shadow-md'
                    : 'border-transparent hover:border-[var(--primary)]'
                )}
              >
                {image.imageUrl && (
                  <Image
                    src={image.imageUrl}
                    alt={image.altText || `${productName} view ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                )}
                {image.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="w-5 h-5 text-white" fill="white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Horizontal Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex md:hidden gap-2 mt-4 overflow-x-auto scrollbar-hide pb-2">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                if (image.isVideo && image.videoUrl) {
                  handleVideoClick(image.videoUrl);
                } else {
                  setActiveIndex(index);
                }
              }}
              className={cn(
                'relative flex-shrink-0 w-16 aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200',
                index === activeIndex
                  ? 'border-[var(--foreground)]'
                  : 'border-transparent'
              )}
            >
              {image.imageUrl && (
                <Image
                  src={image.imageUrl}
                  alt={image.altText || `${productName} view ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
              {image.isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="w-4 h-4 text-white" fill="white" />
                </div>
              )}
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
