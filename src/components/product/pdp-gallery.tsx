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
  const [showTopArrow, setShowTopArrow] = useState(false);
  const [showBottomArrow, setShowBottomArrow] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

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

  // Check if thumbnails overflow viewport
  useEffect(() => {
    const checkOverflow = () => {
      if (!thumbnailContainerRef.current) return;
      const container = thumbnailContainerRef.current;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Show top arrow if first thumbnail is above viewport
      setShowTopArrow(rect.top < 80); // 80px accounts for header

      // Show bottom arrow if last thumbnail is below viewport
      setShowBottomArrow(rect.bottom > viewportHeight - 25);
    };

    checkOverflow();
    window.addEventListener('scroll', checkOverflow);
    window.addEventListener('resize', checkOverflow);
    return () => {
      window.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [allImages.length]);

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

  // Navigate thumbnails
  const scrollToThumbnail = (direction: 'up' | 'down') => {
    const newIndex = direction === 'up'
      ? Math.max(0, activeIndex - 1)
      : Math.min(allImages.length - 1, activeIndex + 1);
    setDirection(direction === 'up' ? -1 : 1);
    setActiveIndex(newIndex);
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
      {/* Desktop Layout */}
      <div className="hidden md:block relative overflow-visible">
        {/* Main Hero Image - scales with container width, maintains aspect ratio */}
        <div
          className="relative bg-gradient-to-br from-[var(--primary-light)] to-[var(--cream)] overflow-hidden w-full"
          style={{
            aspectRatio: '1 / 1',
            maxHeight: 'calc(100vh - 120px)',
            minHeight: '300px',
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

        {/* Thumbnail Strip - Fixed right, aligned to top, outside hero */}
        {allImages.length > 1 && (
          <div className="absolute -right-[6rem] xl:-right-[7rem] 2xl:-right-[8rem] top-0 flex flex-col items-center z-30">
            {/* Up Arrow - always visible, cycles to last image */}
            <button
              onClick={() => {
                const newIndex = activeIndex === 0 ? allImages.length - 1 : activeIndex - 1;
                setDirection(-1);
                setActiveIndex(newIndex);
              }}
              className="w-20 xl:w-24 h-8 flex items-center justify-center bg-[#1a1a1a] text-white mb-2"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            {/* Thumbnails */}
            <div
              ref={thumbnailContainerRef}
              className="flex flex-col gap-2"
            >
              {allImages.slice(0, 5).map((image, index) => (
                <button
                  key={image.id}
                  onMouseEnter={() => handleThumbnailHover(index)}
                  className={cn(
                    'relative w-20 xl:w-24 aspect-square overflow-hidden transition-all duration-200 bg-white flex-shrink-0',
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

            {/* Down Arrow - always visible, cycles to first image */}
            <button
              onClick={() => {
                const newIndex = activeIndex === allImages.length - 1 ? 0 : activeIndex + 1;
                setDirection(1);
                setActiveIndex(newIndex);
              }}
              className="w-20 xl:w-24 h-8 flex items-center justify-center bg-[#1a1a1a] text-white mt-2"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Layout - Edge to edge, touches nav */}
      <div className="md:hidden">
        {/* Hero + Thumbnail tray row */}
        <div className="flex">
          {/* Hero Image - fills remaining space */}
          <div
            className="relative bg-gradient-to-br from-[var(--primary-light)] to-[var(--cream)] overflow-hidden flex-1"
            style={{ aspectRatio: '1 / 1' }}
          >
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

          {/* Hex blue divider line between hero and thumbnails */}
          <div className="w-[3px] bg-[#bbdae9]" />

          {/* Thumbnail Tray - hex blue background */}
          {allImages.length > 1 && (
            <div className="flex flex-col w-[76px] bg-[#bbdae9]">
              {/* Up Arrow */}
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
                className={cn(
                  'w-full h-6 flex items-center justify-center bg-[#bbdae9] text-[#1a1a1a]',
                  !canScrollUp && activeIndex === 0 && 'opacity-40'
                )}
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              {/* Visible Thumbnails with spacing */}
              <div className="flex-1 flex flex-col gap-[3px] px-[3px]">
                {allImages
                  .slice(mobileScrollIndex, mobileScrollIndex + visibleMobileThumbnails)
                  .map((image, idx) => {
                    const actualIndex = mobileScrollIndex + idx;
                    return (
                      <button
                        key={image.id}
                        onClick={() => {
                          if (image.isVideo && image.videoUrl) {
                            handleVideoClick(image.videoUrl);
                          } else {
                            setDirection(actualIndex > activeIndex ? 1 : -1);
                            setActiveIndex(actualIndex);
                          }
                        }}
                        className={cn(
                          'relative flex-1 min-h-0 overflow-hidden transition-all duration-200 bg-white',
                          actualIndex === activeIndex && 'ring-2 ring-white ring-inset'
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
                            sizes="70px"
                          />
                        ) : null}
                      </button>
                    );
                  })}
              </div>

              {/* Down Arrow */}
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
                  'w-full h-6 flex items-center justify-center bg-[#bbdae9] text-[#1a1a1a]',
                  !canScrollDown && activeIndex === allImages.length - 1 && 'opacity-40'
                )}
              >
                <ChevronDown className="w-4 h-4" />
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
