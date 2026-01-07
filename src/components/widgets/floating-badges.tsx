'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface FloatingBadge {
  id: string;
  imageUrl: string;
  // Desktop positioning (% from top-left)
  desktopX: number;
  desktopY: number;
  // Mobile positioning (also governs tablet)
  mobileX: number;
  mobileY: number;
  // Size in pixels
  desktopSize: number;
  mobileSize: number;
  // Rotation speed
  speed: 'slow' | 'medium' | 'fast';
  // Layer control
  layer: 'above' | 'below';
}

export interface FloatingBadgesProps {
  badges: FloatingBadge[];
}

// Speed to duration mapping
const SPEED_DURATION: Record<string, number> = {
  slow: 20,
  medium: 12,
  fast: 6,
};

// Layer to z-index mapping
const LAYER_ZINDEX: Record<string, string> = {
  above: 'z-50',
  below: 'z-0',
};

/**
 * FloatingBadges Widget
 *
 * Renders rotating badge overlays with full positioning control.
 * - Separate desktop/mobile positioning (mobile governs tablet)
 * - Size control per breakpoint
 * - Speed control for rotation
 * - Layer control (above or below page content)
 * - Supports unlimited badges per widget instance
 */
export function FloatingBadges({ badges }: FloatingBadgesProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <>
      {badges.map((badge) => {
        if (!badge.imageUrl) return null;

        const duration = SPEED_DURATION[badge.speed] || 12;
        const zIndexClass = LAYER_ZINDEX[badge.layer] || 'z-0';

        return (
          <div
            key={badge.id}
            className={cn(
              'fixed pointer-events-none',
              zIndexClass
            )}
            style={{
              // Mobile positioning (default, also applies to tablet)
              left: `${badge.mobileX}%`,
              top: `${badge.mobileY}%`,
              width: badge.mobileSize,
              height: badge.mobileSize,
            }}
          >
            {/* Mobile/Tablet badge */}
            <div
              className="lg:hidden w-full h-full animate-spin-slow"
              style={{
                animationDuration: `${duration}s`,
              }}
            >
              <Image
                src={badge.imageUrl}
                alt=""
                fill
                className="object-contain"
                sizes={`${badge.mobileSize}px`}
              />
            </div>

            {/* Desktop badge - different positioning and size */}
            <div
              className="hidden lg:block absolute animate-spin-slow"
              style={{
                // Override position for desktop
                left: `calc(${badge.desktopX}vw - ${badge.mobileX}%)`,
                top: `calc(${badge.desktopY}vh - ${badge.mobileY}%)`,
                width: badge.desktopSize,
                height: badge.desktopSize,
                animationDuration: `${duration}s`,
              }}
            >
              <Image
                src={badge.imageUrl}
                alt=""
                width={badge.desktopSize}
                height={badge.desktopSize}
                className="object-contain"
              />
            </div>
          </div>
        );
      })}

      {/* CSS for spin animation */}
      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow linear infinite;
        }
      `}</style>
    </>
  );
}

/**
 * Alternative implementation using viewport-relative positioning
 * This version positions badges relative to the viewport rather than parent
 */
export function FloatingBadgesViewport({ badges }: FloatingBadgesProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {badges.map((badge) => {
        if (!badge.imageUrl) return null;

        const duration = SPEED_DURATION[badge.speed] || 12;
        const zIndexClass = LAYER_ZINDEX[badge.layer] || 'z-0';

        return (
          <React.Fragment key={badge.id}>
            {/* Mobile/Tablet version */}
            <div
              className={cn('lg:hidden absolute', zIndexClass)}
              style={{
                left: `${badge.mobileX}%`,
                top: `${badge.mobileY}%`,
                width: badge.mobileSize,
                height: badge.mobileSize,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className="w-full h-full animate-spin-slow"
                style={{ animationDuration: `${duration}s` }}
              >
                <Image
                  src={badge.imageUrl}
                  alt=""
                  fill
                  className="object-contain"
                  sizes={`${badge.mobileSize}px`}
                />
              </div>
            </div>

            {/* Desktop version */}
            <div
              className={cn('hidden lg:block absolute', zIndexClass)}
              style={{
                left: `${badge.desktopX}%`,
                top: `${badge.desktopY}%`,
                width: badge.desktopSize,
                height: badge.desktopSize,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className="w-full h-full animate-spin-slow"
                style={{ animationDuration: `${duration}s` }}
              >
                <Image
                  src={badge.imageUrl}
                  alt=""
                  fill
                  className="object-contain"
                  sizes={`${badge.desktopSize}px`}
                />
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default FloatingBadgesViewport;
