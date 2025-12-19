'use client';

import React, { useState } from 'react';
import { PDPBuyBox } from './pdp-buy-box';
import { PDPGallery } from './pdp-gallery';
import { PDPMarquee } from './pdp-marquee';

interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isVideo: boolean | null;
  videoUrl: string | null;
}

interface ProductVariant {
  id: string;
  name: string;
  price: number | null;
  compareAtPrice: number | null;
  amazonUrl: string;
  isDefault: boolean | null;
  thumbnailUrl?: string | null;
  badge?: string | null;
  badgeBgColor?: string | null;
  badgeTextColor?: string | null;
  // Variant-specific media
  heroImageUrl?: string | null;
  secondaryImageUrl?: string | null;
  heroCarouselImages?: string | null;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  shortDescription: string | null;
  price: number | null;
  compareAtPrice: number | null;
  heroImageUrl: string | null;
  ritualTitle: string | null;
  ritualContent: string | null;
  ingredientsTitle: string | null;
  ingredientsContent: string | null;
  shippingTitle: string | null;
  shippingContent: string | null;
  badge: string | null;
  badgeEmoji: string | null;
  rotatingSealEnabled: boolean | null;
  rotatingSealImageUrl: string | null;
}

interface PDPHeroSectionProps {
  product: Product;
  variants: ProductVariant[];
  images: ProductImage[];
  reviewCount: number;
  averageRating: number;
  bulletPoints: (string | null)[];
  ctaButtonText?: string;
  ctaExternalUrl?: string | null;
  showDiscountSignup?: boolean;
  discountSignupText?: string;
  reviewBadge?: string | null;
  reviewBadgeEmoji?: string | null;
  reviewBadgeBgColor?: string | null;
  reviewBadgeTextColor?: string | null;
  // Audio player
  audioUrl?: string | null;
  audioAvatarUrl?: string | null;
  audioTitle?: string | null;
  audioQuote?: string | null;
  // Marquee
  marqueeEnabled?: boolean;
  marqueeText?: string | null;
  marqueeBackgroundColor?: string | null;
  marqueeTextColor?: string | null;
}

export function PDPHeroSection({
  product,
  variants,
  images,
  reviewCount,
  averageRating,
  bulletPoints,
  ctaButtonText,
  ctaExternalUrl,
  showDiscountSignup,
  discountSignupText,
  reviewBadge,
  reviewBadgeEmoji,
  reviewBadgeBgColor,
  reviewBadgeTextColor,
  audioUrl,
  audioAvatarUrl,
  audioTitle,
  audioQuote,
  marqueeEnabled,
  marqueeText,
  marqueeBackgroundColor,
  marqueeTextColor,
}: PDPHeroSectionProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.find((v) => v.isDefault) || variants[0] || null
  );

  // Get first variant as fallback source for images
  const firstVariant = variants[0];

  // Parse carousel images for a given variant
  const parseCarouselImages = (variant: ProductVariant | null, fallbackName: string): ProductImage[] => {
    if (!variant?.heroCarouselImages) return [];
    try {
      const parsed = JSON.parse(variant.heroCarouselImages);
      return parsed.map((url: string, idx: number) => ({
        id: `variant-carousel-${idx}`,
        imageUrl: url,
        altText: `${product.name} - ${fallbackName} view ${idx + 1}`,
        isVideo: false,
        videoUrl: null,
      }));
    } catch {
      return [];
    }
  };

  // Get selected variant's carousel images
  const selectedCarouselImages = parseCarouselImages(selectedVariant, selectedVariant?.name || '');

  // Get first variant's carousel images as fallback
  const firstVariantCarouselImages = parseCarouselImages(firstVariant, firstVariant?.name || '');

  // Determine which hero image to use:
  // 1. Selected variant's image if it exists
  // 2. First variant's image if it exists
  // 3. Product's hero image as last resort
  const activeHeroImage = selectedVariant?.heroImageUrl || firstVariant?.heroImageUrl || product.heroImageUrl;

  // Use selected variant images if available, otherwise use first variant's images, then product images
  const activeImages = selectedCarouselImages.length > 0
    ? selectedCarouselImages
    : firstVariantCarouselImages.length > 0
      ? firstVariantCarouselImages
      : images;

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-full px-4 lg:pr-0 lg:pl-[390px]">
      {/* Buy Box - RIGID column, scrolls freely, editorial stagger, fixed 192px gap */}
      <div className="order-2 lg:order-1 w-full lg:w-[450px] lg:flex-shrink-0 lg:self-start mt-8 lg:mt-0 lg:pt-[68px] lg:mr-[192px] lg:relative lg:z-20">
        <PDPBuyBox
          product={product}
          variants={variants}
          reviewCount={reviewCount}
          averageRating={averageRating}
          bulletPoints={bulletPoints}
          ctaButtonText={ctaButtonText}
          ctaExternalUrl={ctaExternalUrl}
          showDiscountSignup={showDiscountSignup}
          discountSignupText={discountSignupText}
          reviewBadge={reviewBadge}
          reviewBadgeEmoji={reviewBadgeEmoji}
          reviewBadgeBgColor={reviewBadgeBgColor}
          reviewBadgeTextColor={reviewBadgeTextColor}
          audioUrl={audioUrl}
          audioAvatarUrl={audioAvatarUrl}
          audioTitle={audioTitle}
          audioQuote={audioQuote}
          onVariantChange={handleVariantChange}
        />
      </div>

      {/* Media Lane - Pinned console: Gallery + Marquee locked to viewport */}
      <div className="order-1 lg:order-2 w-full lg:flex-1 lg:min-w-0 flex flex-col lg:sticky lg:top-[var(--pdp-header-height)] lg:h-[calc(100vh-var(--pdp-header-height))] lg:overflow-hidden lg:isolate lg:z-10">
        <PDPGallery
          images={activeImages}
          heroImage={activeHeroImage}
          productName={product.name}
          badge={product.badge}
          badgeEmoji={product.badgeEmoji}
          rotatingSealEnabled={product.rotatingSealEnabled || false}
          rotatingSealImageUrl={product.rotatingSealImageUrl}
          marqueeEnabled={marqueeEnabled}
        />

        {/* Marquee - INSIDE Media Lane, flexbox floor via mt-auto */}
        <PDPMarquee
          text={marqueeText || ''}
          enabled={marqueeEnabled}
          backgroundColor={marqueeBackgroundColor}
          textColor={marqueeTextColor}
          className="w-full lg:mt-auto"
        />
      </div>
    </div>
  );
}
