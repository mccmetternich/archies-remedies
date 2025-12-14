'use client';

import Image from 'next/image';
import React, { memo } from 'react';

interface PopupRotatingBadgeProps {
  badgeUrl: string | null | undefined;
  className?: string;
}

/**
 * Shared rotating badge component for popups.
 * Desktop only (hidden on mobile via CSS).
 * Used in welcome popup, exit popup, and admin preview.
 * Wrapped with React.memo to prevent unnecessary re-renders.
 */
export const PopupRotatingBadge = memo(function PopupRotatingBadge({ badgeUrl, className = '' }: PopupRotatingBadgeProps) {
  if (!badgeUrl) return null;

  return (
    <div className={`hidden md:block absolute -top-6 -left-6 w-[105px] h-[105px] z-10 animate-spin-slow ${className}`}>
      <Image
        src={badgeUrl}
        alt="Badge"
        width={105}
        height={105}
        className="w-full h-full object-contain"
      />
    </div>
  );
});
