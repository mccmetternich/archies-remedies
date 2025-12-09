'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, ZoomIn, Expand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isVideo: boolean | null;
  videoUrl: string | null;
}

interface ProductHeroProps {
  images: ProductImage[];
  heroImage: string | null;
  productName: string;
  isNew?: boolean;
  badge?: string | null;
  badgeEmoji?: string | null;
}

// Placeholder product images for demo
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=800&fit=crop',
];

export function ProductHero({ images, heroImage, productName, isNew, badge, badgeEmoji }: ProductHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Combine hero image with additional images
  const allImages: ProductImage[] = heroImage
    ? [{ id: 'hero', imageUrl: heroImage, altText: productName, isVideo: false, videoUrl: null }, ...images]
    : images.length > 0
    ? images
    : PLACEHOLDER_IMAGES.map((url, i) => ({
        id: `placeholder-${i}`,
        imageUrl: url,
        altText: `${productName} view ${i + 1}`,
        isVideo: false,
        videoUrl: null
      }));

  const activeImage = allImages[activeIndex];

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % allImages.length);
  };

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleVideoClick = (videoUrl: string) => {
    setActiveVideo(videoUrl);
    setVideoOpen(true);
  };

  return (
    <>
      <div className="space-y-4 lg:sticky lg:top-24">
        {/* Main Image - Extra Large */}
        <div
          className="relative aspect-square lg:aspect-[4/5] bg-gradient-to-br from-[var(--primary-light)] to-[var(--secondary)] rounded-3xl overflow-hidden group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Product Badge - Editable from admin */}
          {badge && (
            <div className="absolute top-6 right-6 z-20">
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[var(--foreground)] text-white rounded-full text-sm font-medium shadow-lg">
                {badgeEmoji && <span>{badgeEmoji}</span>}
                {badge}
              </span>
            </div>
          )}

          {/* Legacy NEW Badge */}
          {isNew && !badge && (
            <div className="absolute top-6 left-6 z-20">
              <span className="badge badge-new px-4 py-2 text-sm shadow-lg">
                NEW
              </span>
            </div>
          )}

          {/* Zoom Button */}
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg"
            aria-label="Zoom image"
          >
            <Expand className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              {activeImage.imageUrl ? (
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.altText || productName}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-700",
                    isHovered && "scale-105"
                  )}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--primary-light)] to-[var(--secondary)]">
                  <span className="text-[12rem] opacity-30">
                    {productName.toLowerCase().includes('drop') ? '💧' : '🧴'}
                  </span>
                </div>
              )}

              {/* Video play button */}
              {activeImage.isVideo && activeImage.videoUrl && (
                <button
                  onClick={() => handleVideoClick(activeImage.videoUrl!)}
                  className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
                >
                  <div className="w-24 h-24 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform shadow-2xl">
                    <Play className="w-10 h-10 text-[var(--foreground)] ml-1.5" fill="currentColor" />
                  </div>
                </button>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows - Premium style */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Progress indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    index === activeIndex
                      ? 'w-8 bg-[var(--foreground)]'
                      : 'w-2 bg-[var(--foreground)]/30 hover:bg-[var(--foreground)]/50'
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Grid */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {allImages.slice(0, 4).map((image, index) => (
              <button
                key={image.id}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 group/thumb',
                  index === activeIndex
                    ? 'border-[var(--foreground)] ring-2 ring-[var(--primary-light)] ring-offset-2'
                    : 'border-transparent hover:border-[var(--primary)]'
                )}
              >
                {image.imageUrl ? (
                  <Image
                    src={image.imageUrl}
                    alt={image.altText || `${productName} thumbnail ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                    sizes="100px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--secondary)] flex items-center justify-center">
                    <span className="text-3xl opacity-50">
                      {productName.toLowerCase().includes('drop') ? '💧' : '🧴'}
                    </span>
                  </div>
                )}
                {image.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-8 h-8 text-white" fill="white" />
                  </div>
                )}
                {/* Hover overlay */}
                <div className={cn(
                  "absolute inset-0 bg-[var(--primary)]/10 opacity-0 transition-opacity duration-300",
                  index !== activeIndex && "group-hover/thumb:opacity-100"
                )} />
              </button>
            ))}
          </div>
        )}

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-4 px-6 bg-[var(--muted)] rounded-2xl">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <span>Ophthalmologist Tested</span>
          </div>
          <div className="w-px h-6 bg-[var(--border)]" />
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span>Preservative Free</span>
          </div>
          <div className="w-px h-6 bg-[var(--border)]" />
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span>Clean Formula</span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black border-none rounded-3xl overflow-hidden">
          <div className="relative aspect-square">
            {activeImage.imageUrl && (
              <Image
                src={activeImage.imageUrl}
                alt={activeImage.altText || productName}
                fill
                className="object-contain"
                sizes="100vw"
              />
            )}

            {/* Navigation in lightbox */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip in lightbox */}
          {allImages.length > 1 && (
            <div className="flex gap-2 p-4 bg-black justify-center">
              {allImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    index === activeIndex
                      ? 'border-white'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  )}
                >
                  {image.imageUrl && (
                    <Image
                      src={image.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none rounded-3xl overflow-hidden">
          {activeVideo && (
            <div className="aspect-video">
              {activeVideo.includes('vimeo') ? (
                <iframe
                  src={`${activeVideo}?autoplay=1`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeVideo}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
