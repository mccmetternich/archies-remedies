'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Star,
  Check,
  ExternalLink,
  Play,
  Image as ImageIcon,
  Quote,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';
import type { DeviceType } from '../widget-editor/device-preview';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  rating: number | null;
  reviewCount: number | null;
}

interface HeroSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  bodyText: string | null;
  productId: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  secondaryButtonText: string | null;
  secondaryButtonUrl: string | null;
  secondaryButtonType: string;
  secondaryAnchorTarget: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  videoUrl: string | null;
  mobileVideoUrl: string | null;
  testimonialText: string | null;
  testimonialAuthor: string | null;
  testimonialAvatarUrl: string | null;
  testimonialVerifiedText: string | null;
  testimonialShowCheckmark: boolean;
  ratingOverride: number | null;
  reviewCountOverride: number | null;
  isActive: boolean;
  showOnDesktop: boolean;
  showOnMobile: boolean;
  sortOrder: number;
  layout: string | null;
  textColor: string | null;
}

interface HeroCarouselConfigProps {
  slides: HeroSlide[];
  onSlidesChange: (slides: HeroSlide[]) => void;
  products: Product[];
  previewDevice: DeviceType;
  maxSlides?: number;
  autoAdvanceInterval?: number;
  onAutoAdvanceIntervalChange?: (interval: number) => void;
}

/**
 * Hero Carousel configuration panel.
 * Allows editing hero slides with product association, media, testimonials, and visibility controls.
 */
export function HeroCarouselConfig({
  slides,
  onSlidesChange,
  products,
  previewDevice,
  maxSlides = 3,
  autoAdvanceInterval = 5,
  onAutoAdvanceIntervalChange,
}: HeroCarouselConfigProps) {
  const [expandedSlide, setExpandedSlide] = useState<string | null>(
    slides.length === 1 ? slides[0]?.id : null
  );

  const canAddSlide = slides.length < maxSlides;

  // ─────────────────────────────────────────
  // Slide Operations
  // ─────────────────────────────────────────

  const addSlide = () => {
    if (!canAddSlide) return;

    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      title: 'New Hero Slide',
      subtitle: null,
      bodyText: null,
      productId: null,
      buttonText: 'Shop Now',
      buttonUrl: '/products',
      secondaryButtonText: null,
      secondaryButtonUrl: null,
      secondaryButtonType: 'page',
      secondaryAnchorTarget: null,
      imageUrl: '',
      mobileImageUrl: null,
      videoUrl: null,
      mobileVideoUrl: null,
      testimonialText: null,
      testimonialAuthor: null,
      testimonialAvatarUrl: null,
      testimonialVerifiedText: 'Verified Purchase',
      testimonialShowCheckmark: true,
      ratingOverride: null,
      reviewCountOverride: null,
      isActive: true,
      showOnDesktop: true,
      showOnMobile: true,
      sortOrder: slides.length,
      layout: 'full-width',
      textColor: 'dark',
    };

    onSlidesChange([...slides, newSlide]);
    setExpandedSlide(newSlide.id);
  };

  const updateSlide = (id: string, updates: Partial<HeroSlide>) => {
    onSlidesChange(
      slides.map((slide) => (slide.id === id ? { ...slide, ...updates } : slide))
    );
  };

  const deleteSlide = (id: string) => {
    onSlidesChange(slides.filter((slide) => slide.id !== id));
    if (expandedSlide === id) {
      setExpandedSlide(null);
    }
  };

  const reorderSlides = (newOrder: HeroSlide[]) => {
    const reorderedSlides = newOrder.map((slide, index) => ({
      ...slide,
      sortOrder: index,
    }));
    onSlidesChange(reorderedSlides);
  };

  // Get product for a slide
  const getProductForSlide = (productId: string | null): Product | null => {
    if (!productId) return null;
    return products.find((p) => p.id === productId) ?? null;
  };

  return (
    <div className="space-y-4">
      {/* Slide Timing Control - at top of widget config */}
      {slides.length > 1 && onAutoAdvanceIntervalChange && (
        <div className="bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-[var(--admin-text-primary)]">Auto-Advance Timing</h4>
              <p className="text-xs text-[var(--admin-text-muted)]">Time before switching to next slide</p>
            </div>
            <div className="flex items-center gap-2">
              {[3, 4, 5, 6].map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => onAutoAdvanceIntervalChange(seconds)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    autoAdvanceInterval === seconds
                      ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                      : 'bg-[var(--admin-hover)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                  )}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slide List */}
      <Reorder.Group axis="y" values={slides} onReorder={reorderSlides} className="space-y-3">
        {slides.map((slide, index) => {
          const product = getProductForSlide(slide.productId);
          const isExpanded = expandedSlide === slide.id;

          return (
            <Reorder.Item key={slide.id} value={slide} className="list-none">
              <SlideCard
                slide={slide}
                index={index}
                product={product}
                isExpanded={isExpanded}
                onToggleExpand={() => setExpandedSlide(isExpanded ? null : slide.id)}
                onUpdate={(updates) => updateSlide(slide.id, updates)}
                onDelete={() => deleteSlide(slide.id)}
                products={products}
                previewDevice={previewDevice}
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* Add Slide Button */}
      {canAddSlide && (
        <button
          type="button"
          onClick={addSlide}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-[var(--admin-border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 text-[var(--admin-text-muted)] hover:text-[var(--primary)] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Slide</span>
          <span className="text-sm">({slides.length}/{maxSlides})</span>
        </button>
      )}

      {/* Info about single slide behavior */}
      {slides.length === 1 && (
        <p className="text-sm text-[var(--admin-text-muted)] text-center">
          With only 1 slide, the carousel will display as a static hero without navigation.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Slide Card Component
// ─────────────────────────────────────────

interface SlideCardProps {
  slide: HeroSlide;
  index: number;
  product: Product | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<HeroSlide>) => void;
  onDelete: () => void;
  products: Product[];
  previewDevice: DeviceType;
}

function SlideCard({
  slide,
  index,
  product,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  products,
  previewDevice,
}: SlideCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get effective rating/reviews (from product or override)
  const effectiveRating = slide.ratingOverride ?? product?.rating ?? null;
  const effectiveReviewCount = slide.reviewCountOverride ?? product?.reviewCount ?? null;

  // When product changes, auto-update the primary button URL
  const handleProductChange = (productId: string | null) => {
    const selectedProduct = productId ? products.find((p) => p.id === productId) : null;
    const updates: Partial<HeroSlide> = {
      productId,
      // Auto-populate button URL from product
      buttonUrl: selectedProduct ? `/products/${selectedProduct.slug}` : slide.buttonUrl,
    };
    onUpdate(updates);
  };

  return (
    <div
      className={cn(
        'bg-[var(--admin-input)] border rounded-xl overflow-hidden transition-all',
        isExpanded ? 'border-[var(--primary)]' : 'border-[var(--admin-border)]',
        !slide.isActive && 'opacity-60'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--admin-hover)] transition-colors',
          isExpanded && 'border-b border-[var(--admin-border)]'
        )}
        onClick={onToggleExpand}
      >
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-[var(--admin-text-muted)]">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Thumbnail - prioritize video indicator if video is set */}
        <div className="w-16 h-10 rounded-lg overflow-hidden bg-[var(--admin-hover)] flex-shrink-0">
          {slide.videoUrl ? (
            <div className="w-full h-full flex items-center justify-center bg-[var(--admin-input)]">
              <Play className="w-5 h-5 text-[var(--primary)]" />
            </div>
          ) : slide.imageUrl ? (
            <Image
              src={slide.imageUrl}
              alt={slide.title || 'Slide'}
              width={64}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-[var(--admin-text-muted)]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--admin-text-primary)] truncate">
              {slide.title || `Slide ${index + 1}`}
            </span>
            {product && (
              <span className="text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full truncate">
                {product.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
            {effectiveRating && (
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {effectiveRating.toFixed(1)}
              </span>
            )}
            {effectiveReviewCount && <span>({effectiveReviewCount.toLocaleString()} reviews)</span>}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          {/* Desktop visibility */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ showOnDesktop: !slide.showOnDesktop });
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              slide.showOnDesktop
                ? 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]'
                : 'text-amber-500 bg-amber-50'
            )}
            title={slide.showOnDesktop ? 'Visible on desktop' : 'Hidden on desktop'}
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Mobile visibility */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ showOnMobile: !slide.showOnMobile });
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              slide.showOnMobile
                ? 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]'
                : 'text-amber-500 bg-amber-50'
            )}
            title={slide.showOnMobile ? 'Visible on mobile' : 'Hidden on mobile'}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Active toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ isActive: !slide.isActive });
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              slide.isActive
                ? 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]'
                : 'text-amber-500 bg-amber-50'
            )}
            title={slide.isActive ? 'Active' : 'Inactive'}
          >
            {slide.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (showDeleteConfirm) {
                onDelete();
              } else {
                setShowDeleteConfirm(true);
                setTimeout(() => setShowDeleteConfirm(false), 3000);
              }
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showDeleteConfirm
                ? 'text-white bg-red-500'
                : 'text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-50'
            )}
            title={showDeleteConfirm ? 'Click again to confirm' : 'Delete slide'}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Expand indicator */}
          <div className="p-1.5 text-[var(--admin-text-muted)]">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-6 bg-[var(--admin-bg)]">
              {/* Product Association */}
              <section>
                <h4 className="text-sm font-medium text-[var(--admin-text-primary)] mb-3 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Product Association
                </h4>
                <select
                  value={slide.productId || ''}
                  onChange={(e) => handleProductChange(e.target.value || null)}
                  className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="">No product (manual configuration)</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {product && (
                  <p className="mt-2 text-xs text-[var(--admin-text-muted)]">
                    Auto-populated: Rating ({product.rating?.toFixed(1) || 'N/A'}), Reviews (
                    {product.reviewCount?.toLocaleString() || 'N/A'}), Primary button links to /products/
                    {product.slug}
                  </p>
                )}
              </section>

              {/* Layout Options */}
              <section>
                <h4 className="text-sm font-medium text-[var(--admin-text-primary)] mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Layout & Style
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Layout</label>
                    <select
                      value={slide.layout || 'full-width'}
                      onChange={(e) => onUpdate({ layout: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option value="full-width">Full Width (image background)</option>
                      <option value="two-column">Two Column (image right)</option>
                      <option value="two-column-reversed">Two Column (image left)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Text Color</label>
                    <select
                      value={slide.textColor || 'dark'}
                      onChange={(e) => onUpdate({ textColor: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option value="dark">Dark (for light backgrounds)</option>
                      <option value="light">Light (for dark backgrounds)</option>
                    </select>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--admin-text-muted)]">
                  Full width uses image as background. Two-column shows text and image side by side.
                </p>
              </section>

              {/* Title & Subtitle */}
              <section>
                <h4 className="text-sm font-medium text-[var(--admin-text-primary)] mb-3">Content</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Title</label>
                    <input
                      type="text"
                      value={slide.title || ''}
                      onChange={(e) => onUpdate({ title: e.target.value || null })}
                      placeholder="Hero headline..."
                      className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={slide.subtitle || ''}
                      onChange={(e) => onUpdate({ subtitle: e.target.value || null })}
                      placeholder="Optional subtitle..."
                      className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
              </section>

              {/* Media */}
              <section>
                <h4 className="text-sm font-medium text-[var(--admin-text-primary)] mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Media
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Desktop Media */}
                  <div className="space-y-2">
                    <label className="text-xs text-[var(--admin-text-muted)] flex items-center gap-1">
                      <Monitor className="w-3 h-3" /> Desktop
                    </label>
                    <MediaPickerButton
                      value={slide.videoUrl || slide.imageUrl}
                      onChange={(url) => {
                        if (url?.includes('.mp4') || url?.includes('.webm')) {
                          onUpdate({ videoUrl: url, imageUrl: slide.imageUrl || '' });
                        } else {
                          onUpdate({ imageUrl: url || '', videoUrl: null });
                        }
                      }}
                      label="Image or Video"
                      acceptVideo={true}
                    />
                    {slide.videoUrl && (
                      <p className="text-xs text-[var(--admin-text-muted)]">Video: {slide.videoUrl.split('/').pop()}</p>
                    )}
                  </div>

                  {/* Mobile Media */}
                  <div className="space-y-2">
                    <label className="text-xs text-[var(--admin-text-muted)] flex items-center gap-1">
                      <Smartphone className="w-3 h-3" /> Mobile
                    </label>
                    <MediaPickerButton
                      value={slide.mobileVideoUrl || slide.mobileImageUrl}
                      onChange={(url) => {
                        if (url?.includes('.mp4') || url?.includes('.webm')) {
                          onUpdate({ mobileVideoUrl: url });
                        } else {
                          onUpdate({ mobileImageUrl: url || null, mobileVideoUrl: null });
                        }
                      }}
                      label="Image or Video"
                      acceptVideo={true}
                    />
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      Optional - uses desktop if not set
                    </p>
                  </div>
                </div>
              </section>

              {/* Buttons */}
              <section>
                <h4 className="text-sm font-medium text-[var(--admin-text-primary)] mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Buttons
                </h4>
                <div className="space-y-4">
                  {/* Primary Button */}
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-2">Primary Button</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={slide.buttonText || ''}
                        onChange={(e) => onUpdate({ buttonText: e.target.value || null })}
                        placeholder="Button text"
                        className="px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                      />
                      <input
                        type="text"
                        value={slide.buttonUrl || ''}
                        onChange={(e) => onUpdate({ buttonUrl: e.target.value || null })}
                        placeholder="URL"
                        className="px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    {product && (
                      <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                        Auto-linked to product page when product is selected
                      </p>
                    )}
                  </div>

                  {/* Secondary Button */}
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-2">
                      Secondary Button (Learn More)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={slide.secondaryButtonText || ''}
                        onChange={(e) => onUpdate({ secondaryButtonText: e.target.value || null })}
                        placeholder="Learn More"
                        className="px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                      />
                      <input
                        type="text"
                        value={slide.secondaryAnchorTarget || ''}
                        onChange={(e) => onUpdate({ secondaryAnchorTarget: e.target.value || null })}
                        placeholder="/products/eye-drops#benefits"
                        className="px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                      Use anchor (#benefits) to link to a specific widget on the product page
                    </p>
                  </div>
                </div>
              </section>

              {/* Testimonial Overlay */}
              <section>
                <h4 className="text-sm font-medium text-[var(--admin-text-primary)] mb-3 flex items-center gap-2">
                  <Quote className="w-4 h-4" />
                  Testimonial Overlay
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Quote</label>
                    <textarea
                      value={slide.testimonialText || ''}
                      onChange={(e) => onUpdate({ testimonialText: e.target.value || null })}
                      placeholder="Customer testimonial quote..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Avatar</label>
                      <MediaPickerButton
                        value={slide.testimonialAvatarUrl}
                        onChange={(url) => onUpdate({ testimonialAvatarUrl: url || null })}
                        label="Avatar"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Name</label>
                      <input
                        type="text"
                        value={slide.testimonialAuthor || ''}
                        onChange={(e) => onUpdate({ testimonialAuthor: e.target.value || null })}
                        placeholder="Sarah M."
                        className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Verified Text</label>
                      <input
                        type="text"
                        value={slide.testimonialVerifiedText || ''}
                        onChange={(e) => onUpdate({ testimonialVerifiedText: e.target.value || null })}
                        placeholder="Verified Purchase"
                        className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slide.testimonialShowCheckmark}
                      onChange={(e) => onUpdate({ testimonialShowCheckmark: e.target.checked })}
                      className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span className="text-sm text-[var(--admin-text-secondary)]">Show checkmark icon</span>
                  </label>
                </div>
              </section>

              {/* Rating Override */}
              {product && (
                <section>
                  <h4 className="text-sm font-medium text-[var(--admin-text-primary)] mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Rating Override
                  </h4>
                  <p className="text-xs text-[var(--admin-text-muted)] mb-3">
                    Leave empty to use product&apos;s rating ({product.rating?.toFixed(1) || 'N/A'} stars,{' '}
                    {product.reviewCount?.toLocaleString() || 'N/A'} reviews)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Rating (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={slide.ratingOverride || ''}
                        onChange={(e) =>
                          onUpdate({ ratingOverride: e.target.value ? parseFloat(e.target.value) : null })
                        }
                        placeholder={product.rating?.toString() || 'Auto'}
                        className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Review Count</label>
                      <input
                        type="number"
                        min="0"
                        value={slide.reviewCountOverride || ''}
                        onChange={(e) =>
                          onUpdate({ reviewCountOverride: e.target.value ? parseInt(e.target.value) : null })
                        }
                        placeholder={product.reviewCount?.toString() || 'Auto'}
                        className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Visibility Summary */}
              <section className="pt-4 border-t border-[var(--admin-border)]">
                <h4 className="text-sm font-medium text-[var(--admin-text-primary)] mb-3">Visibility</h4>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slide.showOnDesktop}
                      onChange={(e) => onUpdate({ showOnDesktop: e.target.checked })}
                      className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <Monitor className="w-4 h-4 text-[var(--admin-text-muted)]" />
                    <span className="text-sm text-[var(--admin-text-secondary)]">Desktop</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slide.showOnMobile}
                      onChange={(e) => onUpdate({ showOnMobile: e.target.checked })}
                      className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <Smartphone className="w-4 h-4 text-[var(--admin-text-muted)]" />
                    <span className="text-sm text-[var(--admin-text-secondary)]">Mobile</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slide.isActive}
                      onChange={(e) => onUpdate({ isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <Eye className="w-4 h-4 text-[var(--admin-text-muted)]" />
                    <span className="text-sm text-[var(--admin-text-secondary)]">Active</span>
                  </label>
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
