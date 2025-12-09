'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type Layout = 'single' | 'two' | 'three';

interface MegaImageProps {
  layout?: Layout;
  images: {
    url: string;
    alt?: string;
  }[];
  gap?: boolean; // Whether to show gap between images (for two layout)
  className?: string;
}

export function MegaImage({
  layout = 'single',
  images,
  gap = true,
  className,
}: MegaImageProps) {
  // Filter out empty images
  const validImages = images.filter(img => img.url);

  if (validImages.length === 0) {
    return null;
  }

  // Single massive full-width image
  if (layout === 'single' || validImages.length === 1) {
    return (
      <div className={cn('w-full', className)}>
        <div className="relative w-full aspect-[21/9] md:aspect-[3/1]">
          <Image
            src={validImages[0].url}
            alt={validImages[0].alt || ''}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>
    );
  }

  // Two images with optional spacing
  if (layout === 'two') {
    return (
      <div className={cn('w-full', className)}>
        <div className={cn('grid grid-cols-2', gap ? 'gap-4 md:gap-8 container' : 'gap-0')}>
          {validImages.slice(0, 2).map((image, index) => (
            <div key={index} className="relative aspect-square md:aspect-[4/3]">
              <Image
                src={image.url}
                alt={image.alt || ''}
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Three large images, no gaps, full width
  if (layout === 'three') {
    return (
      <div className={cn('w-full', className)}>
        <div className="grid grid-cols-3 gap-0">
          {validImages.slice(0, 3).map((image, index) => (
            <div key={index} className="relative aspect-square md:aspect-[4/3]">
              <Image
                src={image.url}
                alt={image.alt || ''}
                fill
                className="object-cover"
                sizes="33vw"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// Export types for admin usage
export type { Layout as MegaImageLayout, MegaImageProps };
