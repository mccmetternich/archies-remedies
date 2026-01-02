'use client';

/**
 * Shared Widget Configuration Panel
 *
 * This is the SINGLE SOURCE OF TRUTH for widget configuration UI.
 * Used by both page admin and blog admin to ensure consistency.
 *
 * All widget config options should be defined here - never duplicate
 * widget config UI in individual admin pages.
 */

import React from 'react';
import Link from 'next/link';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { MediaCarouselConfig } from '@/components/admin/widget-configs/media-carousel-config';
import type { MediaCarouselItem } from '@/components/admin/widget-configs/media-carousel-config';
import { ReviewsConfig } from '@/components/admin/widget-configs/reviews-config';

interface PageWidget {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  config?: Record<string, unknown>;
  isVisible?: boolean;
  visible?: boolean;
}

interface WidgetConfigPanelProps {
  widget: PageWidget;
  onUpdate: (updates: Partial<PageWidget>) => void;
}

/**
 * Generic Widget Config Panel
 *
 * Renders appropriate configuration fields based on widget type.
 * Global widgets (testimonials, instagram, etc.) show links to their admin pages.
 * Page-specific widgets (marquee, text, etc.) show inline config fields.
 */
export function WidgetConfigPanel({ widget, onUpdate }: WidgetConfigPanelProps) {
  const config = (widget.config || {}) as Record<string, unknown>;

  return (
    <div className="space-y-4">
      {/* Title & Subtitle - Common for most widgets */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Title
          </label>
          <input
            value={widget.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Widget title"
            className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Subtitle
          </label>
          <input
            value={widget.subtitle || ''}
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            placeholder="Widget subtitle"
            className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
      </div>

      {/* Text/Quote/Mission content */}
      {(widget.type === 'text' || widget.type === 'quote' || widget.type === 'mission') && (
        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Content
          </label>
          <textarea
            value={widget.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter content..."
            rows={4}
            className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
          />
        </div>
      )}

      {/* Image widgets */}
      {(widget.type === 'image' || widget.type === 'hero' || widget.type === 'image_text') && (
        <MediaPickerButton
          label="Widget Image"
          value={(config.imageUrl as string) || null}
          onChange={(url) =>
            onUpdate({
              config: { ...config, imageUrl: url || '' },
            })
          }
          helpText="Image for this widget"
          folder="widgets"
        />
      )}

      {/* Video widget */}
      {widget.type === 'video' && (
        <MediaPickerButton
          label="Video"
          value={(config.videoUrl as string) || null}
          onChange={(url) =>
            onUpdate({
              config: { ...config, videoUrl: url || '' },
            })
          }
          helpText="Upload MP4/WebM or paste a Vimeo/YouTube URL"
          folder="widgets"
          acceptVideo={true}
        />
      )}

      {/* Media Carousel widget */}
      {widget.type === 'media_carousel' && (
        <MediaCarouselConfig
          items={(config.items as MediaCarouselItem[]) || []}
          onItemsChange={(items) =>
            onUpdate({
              config: { ...config, items },
            })
          }
        />
      )}

      {/* Reviews widget */}
      {widget.type === 'reviews' && (
        <ReviewsConfig
          productId={(config.productId as string | null) || null}
          collectionName={(config.collectionName as string | null) || null}
          title={(config.title as string) || 'What People Are Saying'}
          subtitle={(config.subtitle as string) || ''}
          showKeywordFilters={(config.showKeywordFilters as boolean) ?? true}
          initialCount={(config.initialCount as number) || 6}
          backgroundColor={(config.backgroundColor as string) || 'cream'}
          showVerifiedBadge={(config.showVerifiedBadge as boolean) ?? true}
          showRatingHeader={(config.showRatingHeader as boolean) ?? true}
          excludedTags={(config.excludedTags as string[]) || []}
          onProductIdChange={(productId) =>
            onUpdate({
              config: { ...config, productId },
            })
          }
          onCollectionNameChange={(collectionName) =>
            onUpdate({
              config: { ...config, collectionName },
            })
          }
          onTitleChange={(title) =>
            onUpdate({
              config: { ...config, title },
            })
          }
          onSubtitleChange={(subtitle) =>
            onUpdate({
              config: { ...config, subtitle },
            })
          }
          onShowKeywordFiltersChange={(showKeywordFilters) =>
            onUpdate({
              config: { ...config, showKeywordFilters },
            })
          }
          onInitialCountChange={(initialCount) =>
            onUpdate({
              config: { ...config, initialCount },
            })
          }
          onBackgroundColorChange={(backgroundColor) =>
            onUpdate({
              config: { ...config, backgroundColor },
            })
          }
          onShowVerifiedBadgeChange={(showVerifiedBadge) =>
            onUpdate({
              config: { ...config, showVerifiedBadge },
            })
          }
          onShowRatingHeaderChange={(showRatingHeader) =>
            onUpdate({
              config: { ...config, showRatingHeader },
            })
          }
          onExcludedTagsChange={(excludedTags) =>
            onUpdate({
              config: { ...config, excludedTags },
            })
          }
        />
      )}

      {/* CTA / Newsletter widgets */}
      {(widget.type === 'cta' || widget.type === 'newsletter') && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Button Text
            </label>
            <input
              value={(config.buttonText as string) || ''}
              onChange={(e) =>
                onUpdate({
                  config: { ...config, buttonText: e.target.value },
                })
              }
              placeholder="Shop Now"
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Button URL
            </label>
            <input
              value={(config.buttonUrl as string) || ''}
              onChange={(e) =>
                onUpdate({
                  config: { ...config, buttonUrl: e.target.value },
                })
              }
              placeholder="/products"
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
        </div>
      )}

      {/* Image + Text layout */}
      {widget.type === 'image_text' && (
        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Layout
          </label>
          <select
            value={(config.layout as string) || 'image-left'}
            onChange={(e) =>
              onUpdate({
                config: { ...config, layout: e.target.value },
              })
            }
            className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          >
            <option value="image-left">Image Left</option>
            <option value="image-right">Image Right</option>
          </select>
        </div>
      )}

      {/* Marquee widget - THE CANONICAL CONFIG */}
      {widget.type === 'marquee' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Marquee Text
            </label>
            <input
              value={(config.text as string) || ''}
              onChange={(e) =>
                onUpdate({
                  config: { ...config, text: e.target.value },
                })
              }
              placeholder="Free shipping on orders $50+ ★"
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Speed
              </label>
              <select
                value={(config.speed as string) || 'slow'}
                onChange={(e) =>
                  onUpdate({
                    config: { ...config, speed: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)]"
              >
                <option value="slow">Slow (120s)</option>
                <option value="medium">Medium (60s)</option>
                <option value="fast">Fast (30s)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Size
              </label>
              <select
                value={(config.size as string) || 'xxl'}
                onChange={(e) =>
                  onUpdate({
                    config: { ...config, size: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)]"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="xl">XL</option>
                <option value="xxl">XXL (Gigantic)</option>
                <option value="xxl2">XXL2 (Ultra)</option>
                <option value="xxxl">XXXL (Massive)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Theme
              </label>
              <select
                value={(config.style as string) || (config.theme as string) || 'dark'}
                onChange={(e) =>
                  onUpdate({
                    config: { ...config, style: e.target.value, theme: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)]"
              >
                <option value="dark">Dark (Black BG)</option>
                <option value="light">Light (White BG)</option>
                <option value="baby-blue">Baby Blue</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          GLOBAL WIDGETS - These are managed in dedicated admin sections
          ───────────────────────────────────────────────────────────────────── */}

      {/* Testimonials */}
      {widget.type === 'testimonials' && (
        <div className="p-4 bg-[var(--admin-input)] rounded-lg">
          <p className="text-sm text-[var(--admin-text-secondary)]">
            Testimonials are managed globally. Configure display options above.
          </p>
          <Link href="/admin/testimonials" className="text-sm text-[var(--primary)] hover:underline mt-1 inline-block">
            Manage Testimonials →
          </Link>
        </div>
      )}

      {/* Video Testimonials */}
      {widget.type === 'video_testimonials' && (
        <div className="p-4 bg-[var(--admin-input)] rounded-lg">
          <p className="text-sm text-[var(--admin-text-secondary)]">
            Video testimonials are managed globally.
          </p>
          <Link href="/admin/video-testimonials" className="text-sm text-[var(--primary)] hover:underline mt-1 inline-block">
            Manage Video Testimonials →
          </Link>
        </div>
      )}

      {/* FAQs */}
      {widget.type === 'faqs' && (
        <div className="p-4 bg-[var(--admin-input)] rounded-lg">
          <p className="text-sm text-[var(--admin-text-secondary)]">
            FAQs are managed globally.
          </p>
          <Link href="/admin/faqs" className="text-sm text-[var(--primary)] hover:underline mt-1 inline-block">
            Manage FAQs →
          </Link>
        </div>
      )}

      {/* Instagram */}
      {widget.type === 'instagram' && (
        <div className="p-4 bg-[var(--admin-input)] rounded-lg">
          <p className="text-sm text-[var(--admin-text-secondary)]">
            Instagram feed uses posts from the global Instagram admin section.
          </p>
          <Link href="/admin/instagram" className="text-sm text-[var(--primary)] hover:underline mt-1 inline-block">
            Manage Instagram Posts →
          </Link>
        </div>
      )}

      {/* Product Grid */}
      {widget.type === 'product_grid' && (
        <div className="p-4 bg-[var(--admin-input)] rounded-lg">
          <p className="text-sm text-[var(--admin-text-secondary)]">
            Product grid displays all active products.
          </p>
          <Link href="/admin/products" className="text-sm text-[var(--primary)] hover:underline mt-1 inline-block">
            Manage Products →
          </Link>
        </div>
      )}

      {/* Hero Carousel - Note: This has its own dedicated config component */}
      {widget.type === 'hero_carousel' && (
        <div className="p-4 bg-[var(--admin-input)] rounded-lg">
          <p className="text-sm text-[var(--admin-text-secondary)]">
            Hero carousel slides are managed globally.
          </p>
          <Link href="/admin/hero-slides" className="text-sm text-[var(--primary)] hover:underline mt-1 inline-block">
            Manage Hero Slides →
          </Link>
        </div>
      )}
    </div>
  );
}
