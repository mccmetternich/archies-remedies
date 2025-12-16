'use client';

import { useState } from 'react';
import { isVideoUrl } from '@/lib/media-utils';

interface BlogHeroCarouselProps {
  featuredMediaUrl: string | null;
  title: string;
  heroCarouselImages: string[];
}

export function BlogHeroCarousel({ featuredMediaUrl, title, heroCarouselImages }: BlogHeroCarouselProps) {
  // Media 1 (featuredMediaUrl) should ALWAYS be first in the carousel
  // heroCarouselImages contains Media 2, 3, 4
  // Build array: [Media 1, Media 2, Media 3, Media 4] - filtering out empty values
  const allMedia: string[] = [];
  if (featuredMediaUrl) {
    allMedia.push(featuredMediaUrl);
  }
  // Add carousel images (Media 2-4)
  heroCarouselImages.filter(Boolean).forEach(url => {
    // Don't add duplicates if featuredMediaUrl happens to be in carousel array
    if (url && url !== featuredMediaUrl) {
      allMedia.push(url);
    }
  });
  const [activeIndex, setActiveIndex] = useState(0);

  const currentMedia = allMedia[activeIndex] || featuredMediaUrl;
  const isVideo = isVideoUrl(currentMedia);
  const hasMedia = !!currentMedia;

  return (
    <div className="relative h-[50vh] lg:h-full overflow-hidden bg-[#f5f5f5]">
      {/* Main Media Display */}
      {hasMedia ? (
        isVideo ? (
          <video
            key={currentMedia}
            src={currentMedia!}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            key={currentMedia}
            src={currentMedia!}
            alt={title}
            className="w-full h-full object-cover"
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="blog-header text-[20vw] text-[#e0e0e0]">
            {title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Floating Carousel Thumbnails - dynamic size based on count */}
      {allMedia.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
          {allMedia.slice(0, 5).map((mediaUrl, index) => {
            const thumbIsVideo = isVideoUrl(mediaUrl);
            const isActive = index === activeIndex;

            // Dynamic sizing: XL for 2, L for 3, M for 4+
            const sizeClass = allMedia.length === 2
              ? 'w-40 h-40 lg:w-56 lg:h-56'  // XL: 160px / 224px
              : allMedia.length === 3
              ? 'w-32 h-32 lg:w-44 lg:h-44'  // L: 128px / 176px
              : 'w-24 h-24 lg:w-32 lg:h-32'; // M: 96px / 128px

            return (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`${sizeClass} overflow-hidden shadow-lg transition-all duration-300 ${
                  isActive
                    ? 'ring-[4px] ring-white scale-105'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ background: 'transparent' }}
              >
                {thumbIsVideo ? (
                  <video
                    src={mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
