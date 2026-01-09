'use client';

import React from 'react';
import { MediaPickerButton } from '@/components/admin/media-picker';

export type CTAHeight = 'short' | 'medium' | 'tall';
export type CTABackgroundType = 'color' | 'image' | 'video';
export type CTATheme = 'light' | 'dark';
export type CTAButtonSize = 'small' | 'medium' | 'large';

export interface CTAConfig {
  // Content
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  buttonSize: CTAButtonSize;

  // Layout
  height: CTAHeight;

  // Background
  backgroundType: CTABackgroundType;
  backgroundColor: string; // For color type
  backgroundImageUrl: string; // For image type
  backgroundVideoUrl: string; // For video type

  // Text styling
  textTheme: CTATheme; // light or dark text

  // Social proof
  showSocialProof: boolean;
  reviewCount: number;
  avatarUrls: string[]; // Up to 3 avatar URLs
}

interface CTAConfigProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  buttonSize: CTAButtonSize;
  height: CTAHeight;
  backgroundType: CTABackgroundType;
  backgroundColor: string;
  backgroundImageUrl: string;
  backgroundVideoUrl: string;
  textTheme: CTATheme;
  showSocialProof: boolean;
  reviewCount: number;
  avatarUrls: string[];

  onTitleChange: (title: string) => void;
  onSubtitleChange: (subtitle: string) => void;
  onButtonTextChange: (buttonText: string) => void;
  onButtonUrlChange: (buttonUrl: string) => void;
  onButtonSizeChange: (buttonSize: CTAButtonSize) => void;
  onHeightChange: (height: CTAHeight) => void;
  onBackgroundTypeChange: (backgroundType: CTABackgroundType) => void;
  onBackgroundColorChange: (backgroundColor: string) => void;
  onBackgroundImageUrlChange: (backgroundImageUrl: string) => void;
  onBackgroundVideoUrlChange: (backgroundVideoUrl: string) => void;
  onTextThemeChange: (textTheme: CTATheme) => void;
  onShowSocialProofChange: (showSocialProof: boolean) => void;
  onReviewCountChange: (reviewCount: number) => void;
  onAvatarUrlsChange: (avatarUrls: string[]) => void;
}

const HEIGHT_OPTIONS = [
  { value: 'short', label: 'Short', description: 'Compact CTA section' },
  { value: 'medium', label: 'Medium', description: 'Standard size' },
  { value: 'tall', label: 'Tall', description: 'Full-height impact' },
] as const;

const BACKGROUND_TYPE_OPTIONS = [
  { value: 'color', label: 'Solid Color' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
] as const;

const COLOR_OPTIONS = [
  { value: '#bbdae9', label: 'Baby Blue', preview: 'bg-[#bbdae9]' },
  { value: '#f5f1eb', label: 'Cream', preview: 'bg-[#f5f1eb]' },
  { value: '#1a1a1a', label: 'Dark', preview: 'bg-[#1a1a1a]' },
] as const;

const BUTTON_SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
] as const;

export function CTAConfigPanel({
  title,
  subtitle,
  buttonText,
  buttonUrl,
  buttonSize,
  height,
  backgroundType,
  backgroundColor,
  backgroundImageUrl,
  backgroundVideoUrl,
  textTheme,
  showSocialProof,
  reviewCount,
  avatarUrls,
  onTitleChange,
  onSubtitleChange,
  onButtonTextChange,
  onButtonUrlChange,
  onButtonSizeChange,
  onHeightChange,
  onBackgroundTypeChange,
  onBackgroundColorChange,
  onBackgroundImageUrlChange,
  onBackgroundVideoUrlChange,
  onTextThemeChange,
  onShowSocialProofChange,
  onReviewCountChange,
  onAvatarUrlsChange,
}: CTAConfigProps) {
  return (
    <div className="space-y-6">
      {/* Content Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-[var(--admin-text-primary)] uppercase tracking-wide">
          Content
        </h4>

        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Headline
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Ready to Transform Your Eye Care?"
            className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Body Text
          </label>
          <textarea
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
            placeholder="Join thousands of happy customers..."
            rows={2}
            className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => onButtonTextChange(e.target.value)}
              placeholder="Shop Now"
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Button URL
            </label>
            <input
              type="text"
              value={buttonUrl}
              onChange={(e) => onButtonUrlChange(e.target.value)}
              placeholder="/products"
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Button Size
          </label>
          <div className="flex gap-2">
            {BUTTON_SIZE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onButtonSizeChange(option.value)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  buttonSize === option.value
                    ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                    : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] border border-[var(--admin-border)] hover:border-[var(--primary)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Section */}
      <div className="space-y-4 pt-4 border-t border-[var(--admin-border)]">
        <h4 className="text-sm font-medium text-[var(--admin-text-primary)] uppercase tracking-wide">
          Layout
        </h4>

        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Section Height
          </label>
          <div className="grid grid-cols-3 gap-2">
            {HEIGHT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onHeightChange(option.value)}
                className={`px-4 py-3 rounded-lg text-left transition-all ${
                  height === option.value
                    ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                    : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] border border-[var(--admin-border)] hover:border-[var(--primary)]'
                }`}
              >
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs opacity-70">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Background Section */}
      <div className="space-y-4 pt-4 border-t border-[var(--admin-border)]">
        <h4 className="text-sm font-medium text-[var(--admin-text-primary)] uppercase tracking-wide">
          Background
        </h4>

        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Background Type
          </label>
          <div className="flex gap-2">
            {BACKGROUND_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onBackgroundTypeChange(option.value)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  backgroundType === option.value
                    ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                    : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] border border-[var(--admin-border)] hover:border-[var(--primary)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        {backgroundType === 'color' && (
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Background Color
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onBackgroundColorChange(option.value)}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    backgroundColor === option.value
                      ? 'border-[var(--primary)]'
                      : 'border-transparent hover:border-[var(--admin-border)]'
                  }`}
                >
                  <div className={`w-full h-8 rounded ${option.preview} mb-2`} />
                  <div className="text-xs text-[var(--admin-text-secondary)]">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image picker */}
        {backgroundType === 'image' && (
          <MediaPickerButton
            label="Background Image"
            value={backgroundImageUrl || null}
            onChange={(url) => onBackgroundImageUrlChange(url || '')}
            helpText="Upload a background image"
            folder="widgets"
          />
        )}

        {/* Video picker */}
        {backgroundType === 'video' && (
          <MediaPickerButton
            label="Background Video"
            value={backgroundVideoUrl || null}
            onChange={(url) => onBackgroundVideoUrlChange(url || '')}
            helpText="Upload a looping background video (MP4/WebM)"
            folder="widgets"
            acceptVideo={true}
          />
        )}

        {/* Text theme */}
        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Text Color
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onTextThemeChange('dark')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                textTheme === 'dark'
                  ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                  : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] border border-[var(--admin-border)] hover:border-[var(--primary)]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#1a1a1a] border border-white/20" />
              Dark Text
            </button>
            <button
              type="button"
              onClick={() => onTextThemeChange('light')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                textTheme === 'light'
                  ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                  : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] border border-[var(--admin-border)] hover:border-[var(--primary)]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white border border-black/20" />
              Light Text
            </button>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="space-y-4 pt-4 border-t border-[var(--admin-border)]">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-[var(--admin-text-primary)] uppercase tracking-wide">
            Social Proof
          </h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSocialProof}
              onChange={(e) => onShowSocialProofChange(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <span className="text-sm text-[var(--admin-text-secondary)]">Show</span>
          </label>
        </div>

        {showSocialProof && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Review Count
              </label>
              <input
                type="number"
                value={reviewCount}
                onChange={(e) => onReviewCountChange(parseInt(e.target.value) || 0)}
                placeholder="1000"
                min={0}
                className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                Displays as &quot;X+ Verified Reviews&quot;
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Avatar Stack (up to 3)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((index) => (
                  <MediaPickerButton
                    key={index}
                    label={`Avatar ${index + 1}`}
                    value={avatarUrls[index] || null}
                    onChange={(url) => {
                      const newUrls = [...avatarUrls];
                      newUrls[index] = url || '';
                      onAvatarUrlsChange(newUrls.filter(Boolean));
                    }}
                    compact
                    folder="avatars"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
