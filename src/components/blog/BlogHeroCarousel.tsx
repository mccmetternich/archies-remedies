'use client';

import { useState } from 'react';
import { isVideoUrl } from '@/lib/media-utils';

interface BlogHeroCarouselProps {
  featuredMediaUrl: string | null;
  title: string;
  heroCarouselImages: string[];
}

export function BlogHeroCarousel({ featuredMediaUrl, title, heroCarouselImages }: BlogHeroCarouselProps) {
  // Use heroCarouselImages as the source of truth for all carousel media
  // If heroCarouselImages is empty, fall back to just the featuredMediaUrl
  // This prevents duplicate images when featuredImage is also in the carousel array
  const allMedia = heroCarouselImages.length > 0
    ? heroCarouselImages.filter(Boolean) as string[]
    : (featuredMediaUrl ? [featuredMediaUrl] : []);
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

      {/* Floating Carousel Thumbnails - 8x original (doubled again) */}
      {allMedia.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
          {allMedia.slice(0, 5).map((mediaUrl, index) => {
            const thumbIsVideo = isVideoUrl(mediaUrl);
            const isActive = index === activeIndex;

            return (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-72 h-72 lg:w-80 lg:h-80 overflow-hidden shadow-lg transition-all duration-300 ${
                  isActive
                    ? 'ring-4 ring-white scale-105'
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
