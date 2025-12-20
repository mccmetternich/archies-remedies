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
import { ProductTiles } from '@/components/home/product-tiles';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { VideoTestimonials } from '@/components/home/video-testimonials';
import { InstagramFeed } from '@/components/home/instagram-feed';
import { MissionSection } from '@/components/home/mission-section';
import { MarqueeBar } from '@/components/widgets/marquee-bar';
import type { MarqueeSize, MarqueeSpeed, MarqueeTheme } from '@/components/widgets/marquee-bar';
import { MediaCarousel } from '@/components/widgets/media-carousel';
import type { MediaCarouselItem } from '@/components/widgets/media-carousel';
import { FAQAccordion } from '@/components/faq/faq-accordion';
import { ContactForm } from '@/components/contact/contact-form';

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
}

/**
 * Render a single widget based on its type
 */
function renderWidget(widget: PageWidget, data: WidgetRendererProps['data']): React.ReactNode {
  if (!widget.isVisible) return null;

  const config = widget.config || {};

  switch (widget.type) {
    // ─────────────────────────────────────────
    // HERO
    // ─────────────────────────────────────────
    case 'hero_carousel':
      if (!data.heroSlides || data.heroSlides.length === 0) return null;
      return <HeroCarousel key={widget.id} slides={data.heroSlides} />;

    // ─────────────────────────────────────────
    // CONTENT
    // ─────────────────────────────────────────
    case 'text':
      return (
        <section key={widget.id} className="section">
          <div className="container">
            <div
              className={`prose prose-lg max-w-${(config.maxWidth as string) || 'prose'} mx-auto`}
              style={{ textAlign: (config.alignment as 'left' | 'center' | 'right') || 'left' }}
            >
              {widget.title && <h2>{widget.title}</h2>}
              {widget.content && (
                <div dangerouslySetInnerHTML={{ __html: widget.content }} />
              )}
            </div>
          </div>
        </section>
      );

    case 'image_text':
      const imagePosition = (config.imagePosition as string) || (config.layout as string) || 'left';
      const isImageRight = imagePosition === 'right' || imagePosition === 'image-right';
      return (
        <section key={widget.id} className="section">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image - always first in DOM (top on mobile), uses lg:order-last when right */}
              <div className={`aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--sand)] ${isImageRight ? 'lg:order-last' : ''}`}>
                {(config.imageUrl as string) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={config.imageUrl as string}
                    alt={widget.title || ''}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {/* Content */}
              <div>
                {widget.title && (
                  <h2 className="text-3xl md:text-4xl font-light mb-6">{widget.title}</h2>
                )}
                {widget.content && (
                  <div
                    className="prose prose-lg text-[var(--muted-foreground)]"
                    dangerouslySetInnerHTML={{ __html: widget.content }}
                  />
                )}
                {(config.ctaText as string) && (config.ctaUrl as string) && (
                  <a
                    href={config.ctaUrl as string}
                    className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[var(--primary)] text-[var(--foreground)] rounded-full font-medium hover:bg-[var(--primary-dark)] transition-colors"
                  >
                    {config.ctaText as string}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      );

    case 'video':
      const videoUrl = (config.videoUrl as string) || '';
      if (!videoUrl) return null;
      return (
        <section key={widget.id} className="section">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              {widget.title && (
                <h2 className="text-3xl md:text-4xl font-light mb-8 text-center">{widget.title}</h2>
              )}
              <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                <video
                  src={videoUrl}
                  controls
                  autoPlay={!!config.autoplay}
                  muted={config.muted !== false}
                  loop={!!config.loop}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      );

    case 'media_carousel':
      const carouselItems = (config.items as MediaCarouselItem[]) || [];
      if (carouselItems.length === 0) return null;
      return <MediaCarousel key={widget.id} items={carouselItems} />;

    case 'quote':
      return (
        <section key={widget.id} className="section bg-[var(--secondary)]">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <blockquote className="text-2xl md:text-3xl font-light italic mb-8">
                &ldquo;{(config.text as string) || widget.content}&rdquo;
              </blockquote>
              {((config.author as string) || (config.avatarUrl as string)) && (
                <div className="flex items-center justify-center gap-4">
                  {(config.avatarUrl as string) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={config.avatarUrl as string}
                      alt={config.author as string}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="text-left">
                    {(config.author as string) && (
                      <p className="font-medium">{config.author as string}</p>
                    )}
                    {(config.authorTitle as string) && (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {config.authorTitle as string}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      );

    case 'mission':
      return <MissionSection key={widget.id} />;

    // ─────────────────────────────────────────
    // SOCIAL PROOF
    // ─────────────────────────────────────────
    case 'testimonials':
      if (!data.testimonials || data.testimonials.length === 0) return null;
      return (
        <TestimonialsSection
          key={widget.id}
          testimonials={data.testimonials}
          title={(config.title as string) || widget.title || 'What Our Customers Say'}
          subtitle={(config.subtitle as string) || widget.subtitle || 'Join thousands of happy customers who trust Archie\'s for their eye care needs.'}
        />
      );

    case 'video_testimonials':
      if (!data.videos || data.videos.length === 0) return null;
      return (
        <VideoTestimonials
          key={widget.id}
          videos={data.videos}
          title={(config.title as string) || widget.title || 'Real Stories, Real Results'}
          subtitle={(config.subtitle as string) || widget.subtitle || 'Hear from our community'}
        />
      );

    case 'instagram':
      // Always render - InstagramFeed has placeholder images when no posts exist
      return (
        <InstagramFeed
          key={widget.id}
          posts={data.instagramPosts || []}
          instagramUrl={data.instagramUrl}
        />
      );

    case 'press':
      // TODO: Implement press/media logos widget
      return null;

    // ─────────────────────────────────────────
    // PRODUCT
    // ─────────────────────────────────────────
    case 'product_grid':
      if (!data.products || data.products.length === 0) return null;
      return (
        <ProductTiles
          key={widget.id}
          products={data.products}
          title={(config.title as string) || widget.title || 'Shop Our Collection'}
          subtitle={(config.subtitle as string) || widget.subtitle || 'Clean, effective eye care made without the questionable ingredients.'}
        />
      );

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
    case 'faqs':
      if (!data.faqs || data.faqs.length === 0) return null;
      // Group FAQs by category
      const categories = data.faqs.reduce((acc, faq) => {
        const category = faq.category || 'General';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(faq);
        return acc;
      }, {} as Record<string, typeof data.faqs>);

      return (
        <section key={widget.id} className="section">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              {widget.title && (
                <h2 className="text-3xl md:text-4xl font-light mb-8 text-center">
                  {widget.title}
                </h2>
              )}
              <div className="space-y-12">
                {Object.entries(categories).map(([category, faqItems]) => (
                  <div key={category}>
                    {Object.keys(categories).length > 1 && (
                      <h3 className="text-2xl font-medium mb-6">{category}</h3>
                    )}
                    <FAQAccordion faqs={faqItems} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      );

    case 'cta':
      return (
        <section
          key={widget.id}
          className="py-20 md:py-28"
          style={{ backgroundColor: (config.backgroundColor as string) || 'var(--primary)' }}
        >
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              {((config.title as string) || widget.title) && (
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6">
                  {(config.title as string) || widget.title}
                </h2>
              )}
              {((config.subtitle as string) || widget.subtitle) && (
                <p className="text-lg text-[var(--foreground)]/80 mb-10 max-w-xl mx-auto">
                  {(config.subtitle as string) || widget.subtitle}
                </p>
              )}
              {(config.buttonUrl as string) && (
                <a
                  href={config.buttonUrl as string}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--foreground)] text-white rounded-full font-medium hover:bg-[var(--foreground)]/90 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
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

    case 'newsletter':
      return (
        <section key={widget.id} className="section bg-[var(--secondary)]">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              {((config.title as string) || widget.title) && (
                <h2 className="text-3xl md:text-4xl font-light mb-4">
                  {(config.title as string) || widget.title}
                </h2>
              )}
              {((config.subtitle as string) || widget.subtitle) && (
                <p className="text-lg text-[var(--muted-foreground)] mb-8">
                  {(config.subtitle as string) || widget.subtitle}
                </p>
              )}
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-full border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[var(--foreground)] text-white rounded-full font-medium hover:bg-[var(--foreground)]/90 transition-colors"
                >
                  {(config.buttonText as string) || 'Subscribe'}
                </button>
              </form>
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
export function WidgetRenderer({ widgets, data }: WidgetRendererProps) {
  if (!widgets || widgets.length === 0) {
    return null;
  }

  return (
    <>
      {widgets.map((widget) => renderWidget(widget, data))}
    </>
  );
}
