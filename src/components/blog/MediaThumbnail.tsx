'use client';

import { useState } from 'react';
import { isVideoUrl } from '@/lib/media-utils';
import { cn } from '@/lib/utils';

interface MediaThumbnailProps {
  url: string | null;
  alt: string;
  aspectRatio?: '4-5' | '16-9' | 'square';
  className?: string;
  priority?: boolean;
}

export function MediaThumbnail({
  url,
  alt,
  aspectRatio = '4-5',
  className,
  priority = false,
}: MediaThumbnailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const isVideo = isVideoUrl(url);

  const aspectClasses = {
    '4-5': 'aspect-[4/5]',
    '16-9': 'aspect-[16/9]',
    'square': 'aspect-square',
  };

  // Placeholder when no media
  if (!url) {
    return (
      <div className={cn(
        aspectClasses[aspectRatio],
        'bg-[#f5f5f5] flex items-center justify-center',
        className
      )}>
        <span className="blog-header text-6xl text-[#e0e0e0]">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      'relative overflow-hidden bg-[#f5f5f5]',
      aspectClasses[aspectRatio],
      className
    )}>
      {/* Skeleton loader with shimmer */}
      {isLoading && (
        <div className="absolute inset-0 blog-skeleton" />
      )}

      {isVideo ? (
        <video
          src={url}
          autoPlay
          muted
          loop
          playsInline
          className={cn(
            'w-full h-full object-cover',
            'transition-opacity duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoadedData={() => setIsLoading(false)}
        />
      ) : (
        <img
          src={url}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          className={cn(
            'w-full h-full object-cover',
            'transition-opacity duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setIsLoading(false)}
        />
      )}
    </div>
  );
}
