/**
 * Universal Widget Renderer
 *
 * THE SINGLE SOURCE OF TRUTH for widget rendering behavior.
 * Renders widgets from page.widgets JSON in the order they appear.
 * Used by ALL pages: homepage, dynamic pages, product pages, blog posts.
 *
 * PHILOSOPHY:
 * - Widget behavior should be IDENTICAL regardless of which page it's on
 * - Components should handle their own empty/placeholder states
 * - Never hardcode widget fallbacks in individual pages - use this renderer
 * - If a widget needs data, fetch it via getWidgetData() based on widget types
 */

import React from 'react';
import type { WidgetData } from '@/lib/get-widget-data';

// Widget Components
import { HeroCarousel } from '@/components/home/hero-carousel';
import { MarqueeBar } from '@/components/widgets/marquee-bar';
import type { MarqueeSize, MarqueeSpeed, MarqueeTheme } from '@/components/widgets/marquee-bar';
import { MediaCarousel } from '@/components/widgets/media-carousel';
import type { MediaCarouselItem } from '@/components/widgets/media-carousel';
import { ContactForm } from '@/components/contact/contact-form';
import { PDPReviews } from '@/components/product/pdp-reviews';
import { IconHighlights } from '@/components/widgets/icon-highlights';
import type { IconHighlightColumn, IconHighlightsTheme } from '@/components/widgets/icon-highlights';
import { TwoColumnFeature } from '@/components/widgets/two-column-feature';
import type {
  TwoColumnFeatureTheme,
  MediaPosition,
  TextMode,
  TextAlignment,
  MediaMode,
} from '@/components/widgets/two-column-feature';
import { FAQDrawer } from '@/components/widgets/faq-drawer';
import type { FAQDrawerTheme, FAQItem } from '@/components/widgets/faq-drawer';
import { FloatingBadges } from '@/components/widgets/floating-badges';
import type { FloatingBadge } from '@/components/widgets/floating-badges';
import { StoryHero } from '@/components/widgets/story-hero';
import type { StoryHeroHeight } from '@/components/widgets/story-hero';
import { TeamCards } from '@/components/widgets/team-cards';
import type { TeamCard, TeamCardsTheme } from '@/components/widgets/team-cards';
import { ScaleCarousel } from '@/components/widgets/scale-carousel';
import type { ScaleCarouselItem, ScaleCarouselAspectRatio } from '@/components/widgets/scale-carousel';

// Widget interface matching pages.widgets JSON structure
export interface PageWidget {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  config?: Record<string, unknown>;
  isVisible: boolean;
}

interface WidgetRendererProps {
  widgets: PageWidget[];
  data: WidgetData & {
    instagramUrl?: string | null;
  };
  /** When true, first widget gets header-clearing padding instead of normal section padding */
  isWidgetOnlyPage?: boolean;
}

/**
 * Render a single widget based on its type
 * @param isFirstOnWidgetOnlyPage - When true, widget should have header-clearing top padding
 */
function renderWidget(
  widget: PageWidget,
  data: WidgetRendererProps['data'],
  isFirstOnWidgetOnlyPage: boolean = false
): React.ReactNode {
  if (!widget.isVisible) return null;

  const config = widget.config || {};

  switch (widget.type) {
    // ─────────────────────────────────────────
    // HERO
    // ─────────────────────────────────────────
    case 'hero_carousel':
      if (!data.heroSlides || data.heroSlides.length === 0) return null;
      return (
        <HeroCarousel
          key={widget.id}
          slides={data.heroSlides}
          showTextGradient={config.showTextGradient as boolean}
        />
      );

    case 'story_hero':
      return (
        <StoryHero
          key={widget.id}
          mediaUrl={(config.mediaUrl as string) || ''}
          headline={(config.headline as string) || ''}
          subheadline={(config.subheadline as string) || ''}
          overlayOpacity={(config.overlayOpacity as number) ?? 40}
          height={(config.height as StoryHeroHeight) || 'short'}
        />
      );

    // ─────────────────────────────────────────
    // CONTENT
    // ─────────────────────────────────────────
    case 'team_cards':
      const teamCards = (config.cards as TeamCard[]) || [];
      if (teamCards.length === 0) return null;
      return (
        <TeamCards
          key={widget.id}
          title={(config.title as string) || ''}
          subtitle={(config.subtitle as string) || ''}
          cards={teamCards}
          theme={(config.theme as TeamCardsTheme) || 'light'}
        />
      );

    case 'scale_carousel':
      const scaleItems = (config.items as ScaleCarouselItem[]) || [];
      if (scaleItems.length === 0) return null;
      return (
        <ScaleCarousel
          key={widget.id}
          title={(config.title as string) || ''}
          subtitle={(config.subtitle as string) || ''}
          items={scaleItems}
          aspectRatio={(config.aspectRatio as ScaleCarouselAspectRatio) || '3:4'}
          theme={(config.theme as 'light' | 'dark' | 'cream') || 'light'}
          imageDuration={(config.imageDuration as number) || 5}
        />
      );

    case 'text':
      // Map maxWidth config to Tailwind max-width classes
      const textMaxWidth = {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-3xl',
        xl: 'max-w-4xl',
        full: 'max-w-none',
      }[(config.maxWidth as string) || 'lg'] || 'max-w-3xl';

      // Theme-based styling
      const textTheme = (config.theme as 'light' | 'dark' | 'cream' | 'blue') || 'light';
      const textThemeStyles = {
        light: {
          bg: 'bg-white',
          prose: 'prose-headings:text-[var(--foreground)] prose-p:text-[#333] prose-strong:text-[var(--foreground)] prose-ul:text-[#333] prose-ol:text-[#333] prose-a:text-[#4a90a4]',
        },
        blue: {
          bg: 'bg-[#bbdae9]',
          prose: 'prose-headings:text-[var(--foreground)] prose-p:text-[#333] prose-strong:text-[var(--foreground)] prose-ul:text-[#333] prose-ol:text-[#333] prose-a:text-[#2a6a84]',
        },
        dark: {
          bg: 'bg-[#1a1a1a]',
          prose: 'prose-headings:text-white prose-p:text-white/80 prose-strong:text-white prose-ul:text-white/80 prose-ol:text-white/80 prose-a:text-[#7bb8cc]',
        },
        cream: {
          bg: 'bg-[#f5f1eb]',
          prose: 'prose-headings:text-[var(--foreground)] prose-p:text-[#333] prose-strong:text-[var(--foreground)] prose-ul:text-[#333] prose-ol:text-[#333] prose-a:text-[#4a90a4]',
        },
      }[textTheme];

      // First widget on widget-only page: use header-clearing padding
      // Normal: generous section padding for luxurious feel
      const textPadding = isFirstOnWidgetOnlyPage
        ? 'pt-24 md:pt-28 pb-12 md:pb-16 lg:pb-24' // 96-112px top clears header
        : 'py-16 md:py-20 lg:py-28 xl:py-32';

      return (
        <section key={widget.id} className={`${textPadding} ${textThemeStyles.bg}`}>
          <div className={`${textMaxWidth} mx-auto px-6`}>
            <div
              className={`prose prose-lg max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-a:underline prose-li:my-1 ${textThemeStyles.prose}`}
            >
              {widget.content && (
                <div dangerouslySetInnerHTML={{ __html: widget.content }} />
              )}
            </div>
          </div>
        </section>
      );

    case 'media_carousel':
      const carouselItems = (config.items as MediaCarouselItem[]) || [];
      if (carouselItems.length === 0) return null;
      return <MediaCarousel key={widget.id} items={carouselItems} />;

    case 'icon_highlights':
      return (
        <IconHighlights
          key={widget.id}
          title={(config.title as string) || ''}
          theme={(config.theme as IconHighlightsTheme) || 'blue'}
          columns={(config.columns as IconHighlightColumn[]) || []}
          linkText={(config.linkText as string) || ''}
          linkUrl={(config.linkUrl as string) || ''}
        />
      );

    case 'two_column_feature':
      return (
        <TwoColumnFeature
          key={widget.id}
          theme={(config.theme as TwoColumnFeatureTheme) || 'blue'}
          mediaPosition={(config.mediaPosition as MediaPosition) || 'left'}
          mediaMode={(config.mediaMode as MediaMode) || 'single'}
          mediaUrl={(config.mediaUrl as string) || ''}
          mediaIsVideo={(config.mediaIsVideo as boolean) || false}
          beforeMediaUrl={(config.beforeMediaUrl as string) || ''}
          beforeMediaIsVideo={(config.beforeMediaIsVideo as boolean) || false}
          beforeLabel={(config.beforeLabel as string) || 'BEFORE'}
          afterMediaUrl={(config.afterMediaUrl as string) || ''}
          afterMediaIsVideo={(config.afterMediaIsVideo as boolean) || false}
          afterLabel={(config.afterLabel as string) || 'AFTER'}
          textMode={(config.textMode as TextMode) || 'title_body'}
          textAlignment={(config.textAlignment as TextAlignment) || 'left'}
          showStars={(config.showStars as boolean) || false}
          starCount={(config.starCount as number) || 5}
          title={(config.title as string) || ''}
          body={(config.body as string) || ''}
          bulletPoints={(config.bulletPoints as string[]) || []}
          ctaText={(config.ctaText as string) || ''}
          ctaUrl={(config.ctaUrl as string) || ''}
        />
      );

    case 'faq_drawer':
      return (
        <FAQDrawer
          key={widget.id}
          theme={(config.theme as FAQDrawerTheme) || 'blue'}
          items={(config.items as FAQItem[]) || []}
        />
      );

    // ─────────────────────────────────────────
    // SOCIAL PROOF
    // ─────────────────────────────────────────
    case 'reviews':
      if (!data.reviews || data.reviews.length === 0) return null;
      // Filter by productId or collectionName if specified in config
      const productId = config.productId as string | null;
      const collectionName = config.collectionName as string | null;
      let filteredReviews = data.reviews;
      let filteredKeywords = data.reviewKeywords || [];

      if (productId) {
        filteredReviews = data.reviews.filter((r) => r.productId === productId);
        filteredKeywords = filteredKeywords.filter((k) => k.productId === productId);
      } else if (collectionName) {
        filteredReviews = data.reviews.filter((r) => r.collectionName === collectionName);
        filteredKeywords = filteredKeywords.filter((k) => k.collectionName === collectionName);
      }

      if (filteredReviews.length === 0) return null;

      return (
        <PDPReviews
          key={widget.id}
          reviews={filteredReviews}
          keywords={filteredKeywords}
          title={(config.title as string) || widget.title || 'What People Are Saying'}
          subtitle={(config.subtitle as string) || widget.subtitle}
          showKeywordFilters={(config.showKeywordFilters as boolean) ?? true}
          initialCount={(config.initialCount as number) || 6}
          backgroundColor={(config.backgroundColor as 'cream' | 'white' | 'transparent') || 'cream'}
          showVerifiedBadge={(config.showVerifiedBadge as boolean) ?? true}
          showRatingHeader={(config.showRatingHeader as boolean) ?? true}
          excludedTags={(config.excludedTags as string[]) || []}
          ratingOverride={(config.ratingOverride as number | null) ?? null}
        />
      );

    case 'press':
      // TODO: Implement press/media logos widget
      return null;

    case 'benefits':
      // TODO: Implement standalone benefits widget
      return null;

    case 'ingredients':
      // TODO: Implement ingredients widget
      return null;

    case 'comparison':
      // TODO: Implement comparison widget
      return null;

    case 'certifications':
      // TODO: Implement certifications widget
      return null;

    // ─────────────────────────────────────────
    // ENGAGEMENT
    // ─────────────────────────────────────────
    case 'cta':
      // Height classes
      const ctaHeight = (config.height as string) || 'medium';
      const ctaHeightClasses = {
        short: 'py-12 md:py-16',
        medium: 'py-20 md:py-28',
        tall: 'py-28 md:py-40',
      }[ctaHeight] || 'py-20 md:py-28';

      // Background type
      const ctaBgType = (config.backgroundType as string) || 'color';
      const ctaBgColor = (config.backgroundColor as string) || '#bbdae9';
      const ctaBgImageUrl = (config.backgroundImageUrl as string) || '';
      const ctaBgVideoUrl = (config.backgroundVideoUrl as string) || '';

      // Text theme
      const ctaTextTheme = (config.textTheme as string) || 'dark';
      const ctaTextClasses = ctaTextTheme === 'light'
        ? 'text-white'
        : 'text-[var(--foreground)]';
      const ctaSubtitleClasses = ctaTextTheme === 'light'
        ? 'text-white/80'
        : 'text-[var(--foreground)]/80';

      // Button size
      const ctaButtonSize = (config.buttonSize as string) || 'medium';
      const ctaButtonClasses = {
        small: 'px-6 py-3 text-sm',
        medium: 'px-8 py-4 text-base',
        large: 'px-10 py-5 text-lg',
      }[ctaButtonSize] || 'px-8 py-4 text-base';

      // Button styling based on text theme
      const ctaButtonStyle = ctaTextTheme === 'light'
        ? 'bg-white text-[var(--foreground)] hover:bg-white/90'
        : 'bg-[var(--foreground)] text-white hover:bg-[var(--foreground)]/90';

      // Social proof
      const ctaShowSocialProof = (config.showSocialProof as boolean) || false;
      const ctaReviewCount = (config.reviewCount as number) || 0;
      const ctaAvatarUrls = (config.avatarUrls as string[]) || [];

      return (
        <section
          key={widget.id}
          className={`relative overflow-hidden ${ctaHeightClasses}`}
          style={ctaBgType === 'color' ? { backgroundColor: ctaBgColor } : undefined}
        >
          {/* Background Image */}
          {ctaBgType === 'image' && ctaBgImageUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ctaBgImageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
            </>
          )}

          {/* Background Video */}
          {ctaBgType === 'video' && ctaBgVideoUrl && (
            <>
              <video
                src={ctaBgVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}

          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              {/* Social Proof */}
              {ctaShowSocialProof && (ctaReviewCount > 0 || ctaAvatarUrls.length > 0) && (
                <div className="flex items-center justify-center gap-4 mb-6">
                  {/* Avatar Stack */}
                  {ctaAvatarUrls.length > 0 && (
                    <div className="flex -space-x-2">
                      {ctaAvatarUrls.slice(0, 3).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                    </div>
                  )}
                  {/* Stars & Count */}
                  <div className={`flex items-center gap-2 ${ctaTextClasses}`}>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    {ctaReviewCount > 0 && (
                      <span className="text-sm font-medium">
                        {ctaReviewCount.toLocaleString()}+ Verified Reviews
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Title */}
              {((config.title as string) || widget.title) && (
                <h2 className={`text-3xl md:text-4xl lg:text-5xl font-light mb-6 ${ctaTextClasses}`}>
                  {(config.title as string) || widget.title}
                </h2>
              )}

              {/* Subtitle */}
              {((config.subtitle as string) || widget.subtitle) && (
                <p className={`text-lg mb-10 max-w-xl mx-auto ${ctaSubtitleClasses}`}>
                  {(config.subtitle as string) || widget.subtitle}
                </p>
              )}

              {/* Button */}
              {(config.buttonUrl as string) && (
                <a
                  href={config.buttonUrl as string}
                  className={`inline-flex items-center gap-2 rounded-full font-medium transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${ctaButtonClasses} ${ctaButtonStyle}`}
                >
                  {(config.buttonText as string) || 'Shop Now'}
                </a>
              )}
            </div>
          </div>
        </section>
      );

    case 'contact_form':
      return (
        <section key={widget.id} className="section">
          <div className="container">
            <div className="max-w-2xl mx-auto">
              {((config.title as string) || widget.title) && (
                <h2 className="text-3xl md:text-4xl font-light mb-4 text-center">
                  {(config.title as string) || widget.title}
                </h2>
              )}
              {((config.subtitle as string) || widget.subtitle) && (
                <p className="text-lg text-[var(--muted-foreground)] mb-8 text-center">
                  {(config.subtitle as string) || widget.subtitle}
                </p>
              )}
              <ContactForm />
            </div>
          </div>
        </section>
      );

    case 'marquee':
      const marqueeText = (config.text as string) || '';
      if (!marqueeText) return null;
      return (
        <MarqueeBar
          key={widget.id}
          text={marqueeText}
          size={(config.size as MarqueeSize) || 'xxl'}
          speed={(config.speed as MarqueeSpeed) || 'slow'}
          theme={(config.theme as MarqueeTheme) || (config.style as MarqueeTheme) || 'dark'}
          separator={(config.separator as string) || '✦'}
        />
      );

    case 'floating_badges':
      const floatingBadges = (config.badges as FloatingBadge[]) || [];
      if (floatingBadges.length === 0) return null;
      // Filter out badges without images
      const validBadges = floatingBadges.filter((b) => b.imageUrl);
      if (validBadges.length === 0) return null;
      return <FloatingBadges key={widget.id} badges={validBadges} />;

    default:
      // Unknown widget type - skip
      console.warn(`Unknown widget type: ${widget.type}`);
      return null;
  }
}

/**
 * WidgetRenderer Component
 *
 * Renders an array of widgets in order.
 * Filters out invisible widgets and handles data passing.
 */
export function WidgetRenderer({ widgets, data, isWidgetOnlyPage = false }: WidgetRendererProps) {
  if (!widgets || widgets.length === 0) {
    return null;
  }

  // Find the first visible widget index
  const firstVisibleIndex = widgets.findIndex(widget => widget.isVisible);

  return (
    <>
      {widgets.map((widget, index) => {
        if (!widget.isVisible) return null;

        // Check if this is the first visible widget on a widget-only page
        const isFirstOnWidgetOnlyPage = isWidgetOnlyPage && index === firstVisibleIndex;

        return renderWidget(widget, data, isFirstOnWidgetOnlyPage);
      })}
    </>
  );
}
