'use client';

import React from 'react';
import Image from 'next/image';

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

// Layer to z-index mapping - actual z-index values for proper stacking
// "below" should be behind page content but above background
// "above" should be above all page content
const LAYER_ZINDEX: Record<string, number> = {
  above: 9999, // Above everything including modals
  below: -1,   // Behind page content
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
 *
 * NOTE: Uses position: fixed to stay in place during scroll.
 */
export function FloatingBadges({ badges }: FloatingBadgesProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <>
      {badges.map((badge) => {
        if (!badge.imageUrl) return null;

        const duration = SPEED_DURATION[badge.speed] || 12;
        const zIndex = LAYER_ZINDEX[badge.layer] ?? 0;

        return (
          <React.Fragment key={badge.id}>
            {/* Mobile/Tablet badge */}
            <div
              className="lg:hidden fixed pointer-events-none"
              style={{
                left: `${badge.mobileX}%`,
                top: `${badge.mobileY}%`,
                width: badge.mobileSize,
                height: badge.mobileSize,
                transform: 'translate(-50%, -50%)',
                zIndex,
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

            {/* Desktop badge */}
            <div
              className="hidden lg:block fixed pointer-events-none"
              style={{
                left: `${badge.desktopX}%`,
                top: `${badge.desktopY}%`,
                width: badge.desktopSize,
                height: badge.desktopSize,
                transform: 'translate(-50%, -50%)',
                zIndex,
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
 * This version positions badges relative to the viewport rather than parent.
 *
 * Uses position: fixed to ensure badges stay in place during scroll.
 * Each badge has its own z-index based on layer setting:
 * - "above": z-index 9999 (above all content)
 * - "below": z-index -1 (behind page content, creates subtle depth)
 */
export function FloatingBadgesViewport({ badges }: FloatingBadgesProps) {
  if (!badges || badges.length === 0) return null;

  // Separate badges by layer for proper stacking
  const belowBadges = badges.filter((b) => b.layer === 'below');
  const aboveBadges = badges.filter((b) => b.layer === 'above');

  const renderBadge = (badge: FloatingBadge) => {
    if (!badge.imageUrl) return null;

    const duration = SPEED_DURATION[badge.speed] || 12;
    const zIndex = LAYER_ZINDEX[badge.layer] ?? 0;

    return (
      <React.Fragment key={badge.id}>
        {/* Mobile/Tablet version */}
        <div
          className="lg:hidden fixed pointer-events-none"
          style={{
            left: `${badge.mobileX}%`,
            top: `${badge.mobileY}%`,
            width: badge.mobileSize,
            height: badge.mobileSize,
            transform: 'translate(-50%, -50%)',
            zIndex,
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
          className="hidden lg:block fixed pointer-events-none"
          style={{
            left: `${badge.desktopX}%`,
            top: `${badge.desktopY}%`,
            width: badge.desktopSize,
            height: badge.desktopSize,
            transform: 'translate(-50%, -50%)',
            zIndex,
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
  };

  return (
    <>
      {/* Render "below" badges first (they'll be behind content with z-index: -1) */}
      {belowBadges.map(renderBadge)}
      {/* Render "above" badges (they'll be above content with z-index: 9999) */}
      {aboveBadges.map(renderBadge)}
    </>
  );
}

export default FloatingBadgesViewport;
