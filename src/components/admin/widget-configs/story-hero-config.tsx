'use client';

import React from 'react';
import { MediaPickerButton } from '@/components/admin/media-picker';
import type { StoryHeroHeight } from '@/components/widgets/story-hero';

// ============================================
// TYPES
// ============================================

interface StoryHeroConfigProps {
  mediaUrl: string;
  headline: string;
  subheadline: string;
  overlayOpacity: number;
  height: StoryHeroHeight;
  onMediaUrlChange: (url: string) => void;
  onHeadlineChange: (headline: string) => void;
  onSubheadlineChange: (subheadline: string) => void;
  onOverlayOpacityChange: (opacity: number) => void;
  onHeightChange: (height: StoryHeroHeight) => void;
}

// ============================================
// HEIGHT OPTIONS
// ============================================

const heightOptions: { value: StoryHeroHeight; label: string; description: string }[] = [
  { value: 'short', label: 'Short', description: '33vh desktop, 50vh mobile' },
  { value: 'medium', label: 'Medium', description: '50vh desktop, 60vh mobile' },
  { value: 'tall', label: 'Tall', description: '66vh desktop, 75vh mobile' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function StoryHeroConfig({
  mediaUrl,
  headline,
  subheadline,
  overlayOpacity,
  height,
  onMediaUrlChange,
  onHeadlineChange,
  onSubheadlineChange,
  onOverlayOpacityChange,
  onHeightChange,
}: StoryHeroConfigProps) {
  return (
    <div className="space-y-6">
      {/* Background Media */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Background Media
        </label>
        <MediaPickerButton
          label="Choose Image or Video"
          value={mediaUrl}
          onChange={onMediaUrlChange}
          acceptVideo={true}
        />
        <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
          Supports images and videos. Video will autoplay muted.
        </p>
      </div>

      {/* Height */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Height
        </label>
        <div className="grid grid-cols-3 gap-2">
          {heightOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onHeightChange(option.value)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                height === option.value
                  ? 'bg-[var(--primary)] text-[var(--foreground)] border-2 border-[var(--primary)]'
                  : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] border border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overlay Opacity */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Overlay Opacity: {overlayOpacity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={overlayOpacity}
          onChange={(e) => onOverlayOpacityChange(Number(e.target.value))}
          className="w-full h-2 bg-[var(--admin-border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
        />
        <div className="flex justify-between text-xs text-[var(--admin-text-muted)] mt-1">
          <span>No overlay</span>
          <span>Full dark</span>
        </div>
      </div>

      {/* Headline */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Headline
        </label>
        <input
          type="text"
          value={headline}
          onChange={(e) => onHeadlineChange(e.target.value)}
          placeholder="The Architecture of Resilience."
          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      {/* Subheadline */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Subheadline
        </label>
        <textarea
          value={subheadline}
          onChange={(e) => onSubheadlineChange(e.target.value)}
          placeholder="Longer description text..."
          rows={4}
          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
        />
      </div>
    </div>
  );
}
