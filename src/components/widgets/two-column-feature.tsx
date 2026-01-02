'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type TwoColumnFeatureTheme = 'blue' | 'dark' | 'cream';
export type MediaPosition = 'left' | 'right';
export type TextMode = 'title_body' | 'bullet_points';
export type TextAlignment = 'left' | 'center' | 'right';
export type MediaMode = 'single' | 'before_after';

export interface TwoColumnFeatureConfig {
  // Theme & Layout
  theme: TwoColumnFeatureTheme;
  mediaPosition: MediaPosition;

  // Media settings
  mediaMode: MediaMode;

  // Single media
  mediaUrl?: string;
  mediaIsVideo?: boolean;

  // Before/After media
  beforeMediaUrl?: string;
  beforeMediaIsVideo?: boolean;
  beforeLabel?: string;
  afterMediaUrl?: string;
  afterMediaIsVideo?: boolean;
  afterLabel?: string;

  // Text content settings
  textMode: TextMode;
  textAlignment: TextAlignment;

  // Social proof (optional)
  showStars?: boolean;
  starCount?: number;

  // Title + Body mode
  title?: string;
  body?: string;

  // Bullet points mode
  bulletPoints?: string[];

  // CTA (optional)
  ctaText?: string;
  ctaUrl?: string;
}

interface TwoColumnFeatureProps extends TwoColumnFeatureConfig {
  className?: string;
}

// ============================================
// THEME CONFIGURATIONS
// ============================================

const themeStyles: Record<
  TwoColumnFeatureTheme,
  {
    bg: string;
    titleColor: string;
    textColor: string;
    labelBg: string;
    labelText: string;
    ctaBg: string;
    ctaText: string;
    ctaHoverBg: string;
    starColor: string;
  }
> = {
  blue: {
    bg: 'bg-[#bbdae9]',
    titleColor: '#1a1a1a',
    textColor: '#1a1a1a',
    labelBg: '#bbdae9',
    labelText: '#1a1a1a',
    ctaBg: '#1a1a1a',
    ctaText: '#ffffff',
    ctaHoverBg: '#333333',
    starColor: '#1a1a1a',
  },
  dark: {
    bg: 'bg-[#1a1a1a]',
    titleColor: '#ffffff',
    textColor: 'rgba(255,255,255,0.85)',
    labelBg: '#bbdae9',
    labelText: '#1a1a1a',
    ctaBg: '#ffffff',
    ctaText: '#1a1a1a',
    ctaHoverBg: '#f0f0f0',
    starColor: '#ffffff',
  },
  cream: {
    bg: 'bg-[#f5f1eb]',
    titleColor: '#1a1a1a',
    textColor: '#333333',
    labelBg: '#bbdae9',
    labelText: '#1a1a1a',
    ctaBg: '#1a1a1a',
    ctaText: '#ffffff',
    ctaHoverBg: '#333333',
    starColor: '#1a1a1a',
  },
};

// ============================================
// VIDEO PLAYER COMPONENT (Loop, no controls, muted)
// ============================================

function AutoPlayVideo({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay failed, likely due to browser policy
      });
    }
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      loop
      muted
      playsInline
      autoPlay
    />
  );
}

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
// MEDIA ITEM COMPONENT
// ============================================

function MediaItem({
  url,
  isVideo,
  alt,
  className,
}: {
  url: string;
  isVideo?: boolean;
  alt: string;
  className?: string;
}) {
  if (!url) return null;

  // Use provided isVideo flag OR auto-detect from URL
  const shouldUseVideo = isVideo || isVideoUrl(url);

  if (shouldUseVideo) {
    return (
      <AutoPlayVideo
        src={url}
        className={cn('w-full h-full object-cover', className)}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      className={cn('object-cover', className)}
      sizes="(max-width: 768px) 100vw, 50vw"
      loading="lazy"
    />
  );
}

// ============================================
// BEFORE/AFTER MEDIA COMPONENT
// ============================================

function BeforeAfterMedia({
  beforeUrl,
  beforeIsVideo,
  beforeLabel = 'BEFORE',
  afterUrl,
  afterIsVideo,
  afterLabel = 'AFTER',
  labelBg,
  labelText,
}: {
  beforeUrl?: string;
  beforeIsVideo?: boolean;
  beforeLabel?: string;
  afterUrl?: string;
  afterIsVideo?: boolean;
  afterLabel?: string;
  labelBg: string;
  labelText: string;
}) {
  return (
    <div className="flex gap-[17px] md:gap-[26px] lg:gap-[34px] h-full">
      {/* Before Column */}
      <div className="flex-1 flex flex-col">
        <div className="relative flex-1 rounded-lg overflow-hidden">
          {beforeUrl && (
            <MediaItem url={beforeUrl} isVideo={beforeIsVideo} alt="Before" />
          )}
        </div>
        <div
          className="mt-2 md:mt-3 py-2 md:py-3 text-center rounded-lg"
          style={{ backgroundColor: labelBg }}
        >
          <span
            className="text-[11px] md:text-[13px] font-bold uppercase tracking-[0.04em]"
            style={{ color: labelText, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            {beforeLabel}
          </span>
        </div>
      </div>

      {/* After Column */}
      <div className="flex-1 flex flex-col">
        <div className="relative flex-1 rounded-lg overflow-hidden">
          {afterUrl && (
            <MediaItem url={afterUrl} isVideo={afterIsVideo} alt="After" />
          )}
        </div>
        <div
          className="mt-2 md:mt-3 py-2 md:py-3 text-center rounded-lg"
          style={{ backgroundColor: labelBg }}
        >
          <span
            className="text-[11px] md:text-[13px] font-bold uppercase tracking-[0.04em]"
            style={{ color: labelText, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            {afterLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TwoColumnFeature({
  theme = 'blue',
  mediaPosition = 'left',
  mediaMode = 'single',
  mediaUrl,
  mediaIsVideo,
  beforeMediaUrl,
  beforeMediaIsVideo,
  beforeLabel = 'BEFORE',
  afterMediaUrl,
  afterMediaIsVideo,
  afterLabel = 'AFTER',
  textMode = 'title_body',
  textAlignment = 'left',
  showStars,
  starCount = 5,
  title,
  body,
  bulletPoints = [],
  ctaText,
  ctaUrl,
  className,
}: TwoColumnFeatureProps) {
  const styles = themeStyles[theme];
  const isMediaRight = mediaPosition === 'right';

  // Handle CTA click - supports both regular links and #top action
  const handleCtaClick = useCallback((e: React.MouseEvent) => {
    if (ctaUrl === '#top') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [ctaUrl]);

  // Check if CTA is a scroll action
  const isScrollAction = ctaUrl === '#top';

  // Filter out empty bullet points
  const validBulletPoints = bulletPoints.filter((bp) => bp && bp.trim());

  // Check if we have any media
  const hasMedia =
    mediaMode === 'single'
      ? !!mediaUrl
      : !!(beforeMediaUrl || afterMediaUrl);

  // Check if we have text content
  const hasTextContent =
    textMode === 'title_body'
      ? !!(title || body)
      : validBulletPoints.length > 0;

  if (!hasMedia && !hasTextContent) {
    return null;
  }

  const textAlignClass =
    textAlignment === 'center'
      ? 'text-center'
      : textAlignment === 'right'
        ? 'text-right'
        : 'text-left';

  return (
    <section className={cn('w-full', styles.bg, className)}>
      {/* Desktop & Tablet: Two columns side by side - Full bleed */}
      <div className="hidden md:flex min-h-[80vh] lg:min-h-screen">
        {/* Media Column - Full bleed, no padding, no rounded corners */}
        <div
          className={cn(
            'w-1/2 relative',
            isMediaRight ? 'order-2' : 'order-1'
          )}
        >
          <div className="absolute inset-0">
            {mediaMode === 'single' ? (
              <div className="relative w-full h-full overflow-hidden">
                {mediaUrl && (
                  <MediaItem
                    url={mediaUrl}
                    isVideo={mediaIsVideo}
                    alt={title || 'Feature media'}
                  />
                )}
              </div>
            ) : (
              <BeforeAfterMedia
                beforeUrl={beforeMediaUrl}
                beforeIsVideo={beforeMediaIsVideo}
                beforeLabel={beforeLabel}
                afterUrl={afterMediaUrl}
                afterIsVideo={afterMediaIsVideo}
                afterLabel={afterLabel}
                labelBg={styles.labelBg}
                labelText={styles.labelText}
              />
            )}
          </div>
        </div>

        {/* Text Column */}
        <div
          className={cn(
            'w-1/2 flex items-center',
            isMediaRight ? 'order-1' : 'order-2'
          )}
        >
          <div className={cn('px-8 lg:px-16 py-12 lg:py-20 w-full', textAlignClass)}>
            {/* Stars */}
            {showStars && (
              <div
                className={cn(
                  'flex gap-1 mb-4',
                  textAlignment === 'center' && 'justify-center',
                  textAlignment === 'right' && 'justify-end'
                )}
              >
                {Array.from({ length: starCount }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 lg:w-6 lg:h-6 fill-current"
                    style={{ color: styles.starColor }}
                  />
                ))}
              </div>
            )}

            {/* Title + Body Mode */}
            {textMode === 'title_body' && (
              <>
                {title && (
                  <h2
                    className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium leading-[1.1] mb-6"
                    style={{
                      color: styles.titleColor,
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {title}
                  </h2>
                )}
                {body && (
                  <p
                    className="text-base lg:text-lg leading-relaxed max-w-lg"
                    style={{
                      color: styles.textColor,
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                      marginLeft: textAlignment === 'center' ? 'auto' : undefined,
                      marginRight: textAlignment === 'center' || textAlignment === 'left' ? 'auto' : undefined,
                    }}
                  >
                    {body}
                  </p>
                )}
              </>
            )}

            {/* Bullet Points Mode */}
            {textMode === 'bullet_points' && validBulletPoints.length > 0 && (
              <div className="space-y-4 lg:space-y-6">
                {validBulletPoints.map((point, index) => (
                  <p
                    key={index}
                    className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
                    style={{
                      color: styles.titleColor,
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {point}
                  </p>
                ))}
              </div>
            )}

            {/* CTA Button */}
            {ctaText && ctaUrl && (
              <div
                className={cn(
                  'mt-8 lg:mt-10',
                  textAlignment === 'center' && 'flex justify-center',
                  textAlignment === 'right' && 'flex justify-end'
                )}
              >
                <Link
                  href={isScrollAction ? '#' : ctaUrl}
                  onClick={handleCtaClick}
                  className="inline-flex items-center px-6 py-3 lg:px-8 lg:py-4 rounded-full text-sm lg:text-base font-medium transition-colors"
                  style={{
                    backgroundColor: styles.ctaBg,
                    color: styles.ctaText,
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.ctaHoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.ctaBg)}
                >
                  {ctaText}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Stacked layout - Media first (70%), then text (30%) */}
      <div className="md:hidden min-h-screen flex flex-col">
        {/* Media - 70% of viewport - Full bleed */}
        <div className="h-[70vh] relative">
          {mediaMode === 'single' ? (
            <div className="relative w-full h-full overflow-hidden">
              {mediaUrl && (
                <MediaItem
                  url={mediaUrl}
                  isVideo={mediaIsVideo}
                  alt={title || 'Feature media'}
                />
              )}
            </div>
          ) : (
            <BeforeAfterMedia
              beforeUrl={beforeMediaUrl}
              beforeIsVideo={beforeMediaIsVideo}
              beforeLabel={beforeLabel}
              afterUrl={afterMediaUrl}
              afterIsVideo={afterMediaIsVideo}
              afterLabel={afterLabel}
              labelBg={styles.labelBg}
              labelText={styles.labelText}
            />
          )}
        </div>

        {/* Text - 30% of viewport */}
        <div className={cn('flex-1 flex items-center px-6 py-8', textAlignClass)}>
          <div className="w-full">
            {/* Stars */}
            {showStars && (
              <div
                className={cn(
                  'flex gap-1 mb-3',
                  textAlignment === 'center' && 'justify-center',
                  textAlignment === 'right' && 'justify-end'
                )}
              >
                {Array.from({ length: starCount }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-current"
                    style={{ color: styles.starColor }}
                  />
                ))}
              </div>
            )}

            {/* Title + Body Mode */}
            {textMode === 'title_body' && (
              <>
                {title && (
                  <h2
                    className="text-2xl font-medium leading-tight mb-3"
                    style={{
                      color: styles.titleColor,
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {title}
                  </h2>
                )}
                {body && (
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: styles.textColor,
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {body}
                  </p>
                )}
              </>
            )}

            {/* Bullet Points Mode */}
            {textMode === 'bullet_points' && validBulletPoints.length > 0 && (
              <div className="space-y-2">
                {validBulletPoints.map((point, index) => (
                  <p
                    key={index}
                    className="text-xl font-bold leading-tight"
                    style={{
                      color: styles.titleColor,
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {point}
                  </p>
                ))}
              </div>
            )}

            {/* CTA Button */}
            {ctaText && ctaUrl && (
              <div
                className={cn(
                  'mt-5',
                  textAlignment === 'center' && 'flex justify-center',
                  textAlignment === 'right' && 'flex justify-end'
                )}
              >
                <Link
                  href={isScrollAction ? '#' : ctaUrl}
                  onClick={handleCtaClick}
                  className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: styles.ctaBg,
                    color: styles.ctaText,
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {ctaText}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
