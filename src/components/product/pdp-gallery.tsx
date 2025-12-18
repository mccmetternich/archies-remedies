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

  // Desktop: Dynamic header height detection (95px without bumper, 135px with bumper)
  const [headerHeight, setHeaderHeight] = useState(95);
  // Desktop: Track hero container dimensions for thumbnail panel sizing
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const [heroHeight, setHeroHeight] = useState(0);
  const [heroTop, setHeroTop] = useState(0); // Track hero's top position relative to viewport
  // Desktop: Track hero visibility to hide thumbnails on scroll
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  // Detect header height based on bumper bar presence
  useEffect(() => {
    const detectHeaderHeight = () => {
      // Look for the header spacer div that indicates bumper presence
      const spacer135 = document.querySelector('[class*="h-\\[135px\\]"]');
      const spacer95 = document.querySelector('[class*="h-\\[95px\\]"]');
      if (spacer135) {
        setHeaderHeight(135);
      } else if (spacer95) {
        setHeaderHeight(95);
      }
    };
    detectHeaderHeight();
    // Re-check on resize in case bumper visibility changes
    window.addEventListener('resize', detectHeaderHeight);
    return () => window.removeEventListener('resize', detectHeaderHeight);
  }, []);

  // Track hero container dimensions with ResizeObserver + scroll position
  useEffect(() => {
    const hero = heroContainerRef.current;
    if (!hero) return;

    const updateHeroPosition = () => {
      const rect = hero.getBoundingClientRect();
      setHeroHeight(rect.height);
      setHeroTop(rect.top);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateHeroPosition();
    });

    resizeObserver.observe(hero);
    // Also update on scroll to keep thumbnail panel aligned
    window.addEventListener('scroll', updateHeroPosition);
    // Initial position
    updateHeroPosition();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateHeroPosition);
    };
  }, []);

  // Track hero visibility with IntersectionObserver (hide thumbnails when scrolled past)
  useEffect(() => {
    const hero = heroContainerRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

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

  // Calculate thumbnail size based on image count
  // Max height available: calc(100vh - 25px) minus arrows (2 * 40px = 80px) minus gaps
  const imageCount = Math.min(allImages.length, 5);

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* Hero Image Container - square, accounts for header height */}
        <div
          ref={heroContainerRef}
          className="relative bg-[var(--cream)] overflow-hidden aspect-square"
          style={{
            maxHeight: `calc(100vh - ${headerHeight}px)`,
            maxWidth: `calc(100vh - ${headerHeight}px)`
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
            <div className="absolute bottom-6 right-6 z-20 w-24 h-24 lg:w-28 lg:h-28">
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
                  sizes="(max-width: 1024px) 100vw, 50vw"
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

      {/* Thumbnail Strip - FIXED to viewport right, aligned with hero top/bottom, hides on scroll */}
      {allImages.length > 1 && isHeroVisible && (() => {
        // Calculate square thumbnail size based on available height and image count
        // Increased max from 140 to 180 (~30% larger)
        const arrowsHeight = 80; // 2 × 40px
        const paddingHeight = 16; // py-2 = 8px × 2
        const gapsHeight = (imageCount - 1) * 8; // gap-2 = 8px per gap
        const panelHeight = heroHeight > 0 ? heroHeight : (typeof window !== 'undefined' ? window.innerHeight - headerHeight - 25 : 600);
        const availableHeight = panelHeight - arrowsHeight - paddingHeight - gapsHeight;
        const squareSize = Math.floor(Math.max(60, Math.min(180, availableHeight / imageCount)));

        // Use hero's actual top position (tracks with scroll) or fallback to header height
        const panelTop = heroTop > 0 ? heroTop : headerHeight;

        return (
          <div
            className="hidden lg:flex fixed right-6 flex-col items-start z-30 transition-opacity duration-200"
            style={{
              top: `${panelTop}px`,
              height: heroHeight > 0 ? `${heroHeight}px` : `calc(100vh - ${headerHeight}px - 25px)`,
            }}
          >
            {/* Up Arrow */}
            <button
              onClick={() => {
                const newIndex = activeIndex === 0 ? allImages.length - 1 : activeIndex - 1;
                setDirection(-1);
                setActiveIndex(newIndex);
              }}
              className="h-10 flex items-center justify-center bg-[#1a1a1a] text-white flex-shrink-0"
              style={{ width: `${squareSize}px` }}
            >
              <ChevronUp className="w-6 h-6" />
            </button>

            {/* Thumbnails - square, top-aligned, scale based on available height */}
            <div
              ref={thumbnailContainerRef}
              className="flex flex-col gap-2 py-2 min-h-0 items-center justify-start"
            >
              {allImages.slice(0, 5).map((image, index) => (
                <button
                  key={image.id}
                  onMouseEnter={() => handleThumbnailHover(index)}
                  className={cn(
                    'relative overflow-hidden transition-all duration-200 bg-white flex-shrink-0',
                    index === activeIndex && 'ring-2 ring-[#bbdae9]'
                  )}
                  style={{
                    width: `${squareSize}px`,
                    height: `${squareSize}px`,
                  }}
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
                      sizes={`${squareSize}px`}
                    />
                  ) : null}
                </button>
              ))}
            </div>

            {/* Down Arrow */}
            <button
              onClick={() => {
                const newIndex = activeIndex === allImages.length - 1 ? 0 : activeIndex + 1;
                setDirection(1);
                setActiveIndex(newIndex);
              }}
              className="h-10 flex items-center justify-center bg-[#1a1a1a] text-white flex-shrink-0"
              style={{ width: `${squareSize}px` }}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        );
      })()}

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
