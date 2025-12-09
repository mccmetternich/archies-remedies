'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
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
}

export function ProductHero({ images, heroImage, productName }: ProductHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Combine hero image with additional images
  const allImages: ProductImage[] = heroImage
    ? [{ id: 'hero', imageUrl: heroImage, altText: productName, isVideo: false, videoUrl: null }, ...images]
    : images.length > 0
    ? images
    : [{ id: 'placeholder', imageUrl: '', altText: productName, isVideo: false, videoUrl: null }];

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
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square bg-[var(--secondary)] rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {activeImage.imageUrl ? (
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.altText || productName}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--primary-light)] to-[var(--secondary)]">
                  <span className="text-9xl">
                    {productName.toLowerCase().includes('drop') ? '💧' : '🧴'}
                  </span>
                </div>
              )}

              {/* Video play button */}
              {activeImage.isVideo && activeImage.videoUrl && (
                <button
                  onClick={() => handleVideoClick(activeImage.videoUrl!)}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                >
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-[var(--foreground)] ml-1" fill="currentColor" />
                  </div>
                </button>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {allImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200',
                  index === activeIndex
                    ? 'border-[var(--foreground)]'
                    : 'border-transparent hover:border-[var(--primary)]'
                )}
              >
                {image.imageUrl ? (
                  <Image
                    src={image.imageUrl}
                    alt={image.altText || `${productName} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center">
                    <span className="text-2xl">
                      {productName.toLowerCase().includes('drop') ? '💧' : '🧴'}
                    </span>
                  </div>
                )}
                {image.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-6 h-6 text-white" fill="white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
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
