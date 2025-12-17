'use client';

import React, { useState } from 'react';
import { PDPBuyBox } from './pdp-buy-box';
import { PDPGallery } from './pdp-gallery';

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
}: PDPHeroSectionProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.find((v) => v.isDefault) || variants[0] || null
  );

  // Determine which hero image to use - variant's image takes precedence
  const activeHeroImage = selectedVariant?.heroImageUrl || product.heroImageUrl;

  // Parse variant carousel images if available
  let activeCarouselImages: ProductImage[] = [];
  if (selectedVariant?.heroCarouselImages) {
    try {
      const parsed = JSON.parse(selectedVariant.heroCarouselImages);
      activeCarouselImages = parsed.map((url: string, idx: number) => ({
        id: `variant-carousel-${idx}`,
        imageUrl: url,
        altText: `${product.name} - ${selectedVariant.name} view ${idx + 1}`,
        isVideo: false,
        videoUrl: null,
      }));
    } catch {
      // Fall back to product images if parsing fails
    }
  }

  // Use variant carousel images if available, otherwise fall back to product images
  const activeImages = activeCarouselImages.length > 0 ? activeCarouselImages : images;

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12">
      {/* Left: Buy Box - expands with container, absorbs extra width */}
      <div className="order-1">
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
          onVariantChange={handleVariantChange}
        />
      </div>

      {/* Right: Gallery - fixed max-width, hero stays consistent size */}
      <div className="order-2 lg:w-[550px] xl:w-[650px]">
        <PDPGallery
          images={activeImages}
          heroImage={activeHeroImage}
          productName={product.name}
          badge={product.badge}
          badgeEmoji={product.badgeEmoji}
          rotatingSealEnabled={product.rotatingSealEnabled || false}
          rotatingSealImageUrl={product.rotatingSealImageUrl}
        />
      </div>
    </div>
  );
}
