'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { InternalLinkSelector } from '@/components/admin/internal-link-selector';
import { Plus, Trash2 } from 'lucide-react';
import type {
  TwoColumnFeatureTheme,
  MediaPosition,
  TextMode,
  TextAlignment,
  MediaMode,
} from '@/components/widgets/two-column-feature';

// ============================================
// TYPES
// ============================================

interface TwoColumnFeatureConfigProps {
  // Theme & Layout
  theme: TwoColumnFeatureTheme;
  mediaPosition: MediaPosition;

  // Media settings
  mediaMode: MediaMode;
  mediaUrl: string;
  mediaIsVideo: boolean;
  beforeMediaUrl: string;
  beforeMediaIsVideo: boolean;
  beforeLabel: string;
  afterMediaUrl: string;
  afterMediaIsVideo: boolean;
  afterLabel: string;

  // Text content
  textMode: TextMode;
  textAlignment: TextAlignment;
  showStars: boolean;
  starCount: number;
  title: string;
  body: string;
  bulletPoints: string[];

  // CTA
  ctaText: string;
  ctaUrl: string;

  // Change handlers
  onThemeChange: (theme: TwoColumnFeatureTheme) => void;
  onMediaPositionChange: (position: MediaPosition) => void;
  onMediaModeChange: (mode: MediaMode) => void;
  onMediaUrlChange: (url: string) => void;
  onMediaIsVideoChange: (isVideo: boolean) => void;
  onBeforeMediaUrlChange: (url: string) => void;
  onBeforeMediaIsVideoChange: (isVideo: boolean) => void;
  onBeforeLabelChange: (label: string) => void;
  onAfterMediaUrlChange: (url: string) => void;
  onAfterMediaIsVideoChange: (isVideo: boolean) => void;
  onAfterLabelChange: (label: string) => void;
  onTextModeChange: (mode: TextMode) => void;
  onTextAlignmentChange: (alignment: TextAlignment) => void;
  onShowStarsChange: (show: boolean) => void;
  onStarCountChange: (count: number) => void;
  onTitleChange: (title: string) => void;
  onBodyChange: (body: string) => void;
  onBulletPointsChange: (points: string[]) => void;
  onCtaTextChange: (text: string) => void;
  onCtaUrlChange: (url: string) => void;
}

// ============================================
// OPTION CONFIGURATIONS
// ============================================

const themeOptions: { value: TwoColumnFeatureTheme; label: string }[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'dark', label: 'Dark' },
  { value: 'cream', label: 'Cream' },
];

const mediaPositionOptions: { value: MediaPosition; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const mediaModeOptions: { value: MediaMode; label: string; description: string }[] = [
  { value: 'single', label: 'Single Media', description: 'One image or video' },
  { value: 'before_after', label: 'Before & After', description: 'Side-by-side comparison' },
];

const textModeOptions: { value: TextMode; label: string; description: string }[] = [
  { value: 'title_body', label: 'Title + Body', description: 'Large title with body text' },
  { value: 'bullet_points', label: 'Bullet Points', description: 'Large bold text items' },
];

const alignmentOptions: { value: TextAlignment; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

// ============================================
// HELPER: Check if URL is video
// ============================================

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  // Check for video file extensions (with or without query params)
  if (url.match(/\.(mp4|webm|mov)(\?|$)/i)) return true;
  // Check for Cloudinary video URLs
  if (url.includes('/video/upload/')) return true;
  // Check for video/ in Cloudinary resource type
  if (url.includes('res.cloudinary.com') && url.includes('/video/')) return true;
  return false;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TwoColumnFeatureConfig({
  theme,
  mediaPosition,
  mediaMode,
  mediaUrl,
  mediaIsVideo,
  beforeMediaUrl,
  beforeMediaIsVideo,
  beforeLabel,
  afterMediaUrl,
  afterMediaIsVideo,
  afterLabel,
  textMode,
  textAlignment,
  showStars,
  starCount,
  title,
  body,
  bulletPoints,
  ctaText,
  ctaUrl,
  onThemeChange,
  onMediaPositionChange,
  onMediaModeChange,
  onMediaUrlChange,
  onMediaIsVideoChange,
  onBeforeMediaUrlChange,
  onBeforeMediaIsVideoChange,
  onBeforeLabelChange,
  onAfterMediaUrlChange,
  onAfterMediaIsVideoChange,
  onAfterLabelChange,
  onTextModeChange,
  onTextAlignmentChange,
  onShowStarsChange,
  onStarCountChange,
  onTitleChange,
  onBodyChange,
  onBulletPointsChange,
  onCtaTextChange,
  onCtaUrlChange,
}: TwoColumnFeatureConfigProps) {
  // Ensure bullet points array has at least one item
  const normalizedBulletPoints = bulletPoints.length > 0 ? bulletPoints : [''];

  const addBulletPoint = () => {
    if (bulletPoints.length < 6) {
      onBulletPointsChange([...bulletPoints, '']);
    }
  };

  const removeBulletPoint = (index: number) => {
    const newPoints = bulletPoints.filter((_, i) => i !== index);
    onBulletPointsChange(newPoints.length > 0 ? newPoints : ['']);
  };

  const updateBulletPoint = (index: number, value: string) => {
    const newPoints = [...bulletPoints];
    newPoints[index] = value;
    onBulletPointsChange(newPoints);
  };

  // Handle media URL changes and auto-detect video
  const handleMediaUrlChange = (url: string | null) => {
    onMediaUrlChange(url || '');
    onMediaIsVideoChange(isVideoUrl(url || ''));
  };

  const handleBeforeMediaUrlChange = (url: string | null) => {
    onBeforeMediaUrlChange(url || '');
    onBeforeMediaIsVideoChange(isVideoUrl(url || ''));
  };

  const handleAfterMediaUrlChange = (url: string | null) => {
    onAfterMediaUrlChange(url || '');
    onAfterMediaIsVideoChange(isVideoUrl(url || ''));
  };

  return (
    <div className="space-y-6">
      {/* Theme & Layout Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-[var(--admin-text-primary)]">Theme & Layout</h4>

        {/* Theme Selector */}
        <div>
          <label className="block text-xs text-[var(--admin-text-muted)] mb-2">
            Color Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onThemeChange(option.value)}
                className={cn(
                  'flex flex-col items-center p-3 rounded-xl border transition-all',
                  theme === option.value
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--admin-border)] hover:border-[var(--admin-border-light)] bg-[var(--admin-input)]'
                )}
              >
                <div
                  className="w-full h-5 rounded-md mb-1.5"
                  style={{
                    backgroundColor:
                      option.value === 'blue'
                        ? '#bbdae9'
                        : option.value === 'dark'
                          ? '#1a1a1a'
                          : '#f5f1eb',
                    border: option.value === 'cream' ? '1px solid #e5e5e5' : undefined,
                  }}
                />
                <span className="text-xs font-medium text-[var(--admin-text-primary)]">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Media Position */}
        <div>
          <label className="block text-xs text-[var(--admin-text-muted)] mb-2">
            Media Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            {mediaPositionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onMediaPositionChange(option.value)}
                className={cn(
                  'px-4 py-2.5 rounded-lg border text-sm font-medium transition-all',
                  mediaPosition === option.value
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'border-[var(--admin-border)] bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:border-[var(--admin-border-light)]'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Media Section */}
      <div className="space-y-4 pt-4 border-t border-[var(--admin-border)]">
        <h4 className="text-sm font-medium text-[var(--admin-text-primary)]">Media</h4>

        {/* Media Mode Toggle */}
        <div className="space-y-2">
          {mediaModeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onMediaModeChange(option.value)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                mediaMode === option.value
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                  : 'border-[var(--admin-border)] bg-[var(--admin-input)] hover:border-[var(--admin-border-light)]'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0',
                  mediaMode === option.value
                    ? 'border-[var(--primary)] bg-[var(--primary)]'
                    : 'border-[var(--admin-border)]'
                )}
              />
              <div>
                <span className="block text-sm font-medium text-[var(--admin-text-primary)]">
                  {option.label}
                </span>
                <span className="block text-xs text-[var(--admin-text-muted)]">
                  {option.description}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Single Media Upload */}
        {mediaMode === 'single' && (
          <MediaPickerButton
            label="Media"
            value={mediaUrl || null}
            onChange={handleMediaUrlChange}
            helpText="Image or video (auto-detected)"
            folder="widgets"
            acceptVideo
          />
        )}

        {/* Before/After Media Uploads */}
        {mediaMode === 'before_after' && (
          <div className="space-y-4">
            {/* Before Media */}
            <div className="p-4 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl space-y-3">
              <span className="text-sm font-medium text-[var(--admin-text-primary)]">Before</span>
              <MediaPickerButton
                label="Media"
                value={beforeMediaUrl || null}
                onChange={handleBeforeMediaUrlChange}
                helpText="Image or video"
                folder="widgets"
                acceptVideo
              />
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">
                  Label
                </label>
                <input
                  type="text"
                  value={beforeLabel}
                  onChange={(e) => onBeforeLabelChange(e.target.value)}
                  placeholder="BEFORE"
                  className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            {/* After Media */}
            <div className="p-4 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl space-y-3">
              <span className="text-sm font-medium text-[var(--admin-text-primary)]">After</span>
              <MediaPickerButton
                label="Media"
                value={afterMediaUrl || null}
                onChange={handleAfterMediaUrlChange}
                helpText="Image or video"
                folder="widgets"
                acceptVideo
              />
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">
                  Label
                </label>
                <input
                  type="text"
                  value={afterLabel}
                  onChange={(e) => onAfterLabelChange(e.target.value)}
                  placeholder="AFTER"
                  className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Text Content Section */}
      <div className="space-y-4 pt-4 border-t border-[var(--admin-border)]">
        <h4 className="text-sm font-medium text-[var(--admin-text-primary)]">Text Content</h4>

        {/* Text Mode Toggle */}
        <div className="space-y-2">
          {textModeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onTextModeChange(option.value)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                textMode === option.value
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                  : 'border-[var(--admin-border)] bg-[var(--admin-input)] hover:border-[var(--admin-border-light)]'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0',
                  textMode === option.value
                    ? 'border-[var(--primary)] bg-[var(--primary)]'
                    : 'border-[var(--admin-border)]'
                )}
              />
              <div>
                <span className="block text-sm font-medium text-[var(--admin-text-primary)]">
                  {option.label}
                </span>
                <span className="block text-xs text-[var(--admin-text-muted)]">
                  {option.description}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Text Alignment */}
        <div>
          <label className="block text-xs text-[var(--admin-text-muted)] mb-2">
            Text Alignment
          </label>
          <div className="grid grid-cols-3 gap-2">
            {alignmentOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onTextAlignmentChange(option.value)}
                className={cn(
                  'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                  textAlignment === option.value
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'border-[var(--admin-border)] bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:border-[var(--admin-border-light)]'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Social Proof Stars */}
        <div className="flex items-center justify-between p-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl">
          <div>
            <span className="block text-sm font-medium text-[var(--admin-text-primary)]">
              Show Stars
            </span>
            <span className="block text-xs text-[var(--admin-text-muted)]">
              Social proof rating stars
            </span>
          </div>
          <button
            type="button"
            onClick={() => onShowStarsChange(!showStars)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              showStars ? 'bg-green-500' : 'bg-[var(--admin-hover)]'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                showStars ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {showStars && (
          <div>
            <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">
              Number of Stars
            </label>
            <select
              value={starCount}
              onChange={(e) => onStarCountChange(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} Star{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title + Body Mode Fields */}
        {textMode === 'title_body' && (
          <>
            <div>
              <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Your headline here"
                className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">
                Body
              </label>
              <textarea
                value={body}
                onChange={(e) => onBodyChange(e.target.value)}
                placeholder="Supporting text goes here..."
                rows={4}
                className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            </div>
          </>
        )}

        {/* Bullet Points Mode Fields */}
        {textMode === 'bullet_points' && (
          <div className="space-y-3">
            <label className="block text-xs text-[var(--admin-text-muted)]">
              Bullet Points (max 6)
            </label>
            {normalizedBulletPoints.map((point, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => updateBulletPoint(index, e.target.value)}
                  placeholder={`Point ${index + 1}`}
                  className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
                {bulletPoints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBulletPoint(index)}
                    className="p-2 text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {bulletPoints.length < 6 && (
              <button
                type="button"
                onClick={addBulletPoint}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-[var(--admin-border)] rounded-lg text-sm font-medium text-[var(--admin-text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Point
              </button>
            )}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="space-y-4 pt-4 border-t border-[var(--admin-border)]">
        <h4 className="text-sm font-medium text-[var(--admin-text-primary)]">
          Call to Action <span className="text-[var(--admin-text-muted)] font-normal">(optional)</span>
        </h4>
        <div>
          <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">
            Button Text
          </label>
          <input
            type="text"
            value={ctaText}
            onChange={(e) => onCtaTextChange(e.target.value)}
            placeholder="Shop Now"
            className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
        <InternalLinkSelector
          label="Button URL"
          value={ctaUrl}
          onChange={onCtaUrlChange}
          placeholder="Select page or enter URL"
        />
      </div>
    </div>
  );
}
