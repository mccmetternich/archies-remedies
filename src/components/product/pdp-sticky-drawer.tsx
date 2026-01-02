'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductVariant {
  id: string;
  name: string;
  price: number | null;
  amazonUrl?: string | null;
}

interface PDPStickyDrawerProps {
  productName: string;
  selectedVariant: ProductVariant | null;
  ctaButtonText?: string;
  ctaExternalUrl?: string | null;
  ctaNewTab?: boolean;
  thumbnailUrl?: string | null;
}

export function PDPStickyDrawer({
  productName,
  selectedVariant,
  ctaButtonText = 'Buy Now',
  ctaExternalUrl,
  ctaNewTab = false,
  thumbnailUrl,
}: PDPStickyDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Get the price from selected variant or default
  const price = selectedVariant?.price || 0;
  const formattedPrice = price > 0 ? `$${price.toFixed(2)}` : '';

  // Get the CTA URL
  const ctaUrl = ctaExternalUrl || selectedVariant?.amazonUrl || '#';

  // Variant name display
  const variantName = selectedVariant?.name || '';

  useEffect(() => {
    // Find the marquee element once on mount
    const findMarquee = () => {
      return document.querySelector('[class*="animate-marquee"]')?.closest('div[class*="overflow-hidden"]') ||
             document.querySelector('[class*="marquee"]');
    };

    const handleScroll = () => {
      const marquee = findMarquee();

      if (marquee) {
        // Show when marquee's bottom edge is above the viewport (scrolled out)
        const marqueeRect = marquee.getBoundingClientRect();
        setIsVisible(marqueeRect.bottom < 0);
      } else {
        // Fallback: show after 200px scroll if no marquee found
        const scrollY = window.scrollY ?? window.pageYOffset ?? 0;
        setIsVisible(scrollY > 200);
      }
    };

    // Call immediately to handle already-scrolled state
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const DrawerContent = () => (
    <>
      {/* Mobile/Tablet Layout: Thumbnail + Info + CTA */}
      <div className="lg:hidden flex w-full">
        {/* Thumbnail (if provided) */}
        {thumbnailUrl && (
          <div
            className="flex-shrink-0 w-14 h-14 relative bg-[#f2f2f2] flex items-center justify-center"
            style={{ borderTop: '0.25px solid #999999' }}
          >
            <div className="w-11 h-11 relative rounded-md overflow-hidden">
              <Image
                src={thumbnailUrl}
                alt={productName}
                fill
                className="object-cover"
                sizes="44px"
              />
            </div>
          </div>
        )}

        {/* Product info column */}
        <div
          className="flex-[4] flex flex-col justify-center px-4 py-3 bg-[#f2f2f2]"
          style={{ borderTop: '0.25px solid #999999' }}
        >
          {/* Title + Price on same line */}
          <div className="flex items-center justify-between">
            <span
              className="text-[15px] font-medium uppercase tracking-[0.02em] text-[#1a1a1a] truncate leading-tight"
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              {productName}
            </span>
            {formattedPrice && (
              <span
                className="text-[12px] font-medium text-[#1a1a1a]/70 ml-3 flex-shrink-0"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                {formattedPrice}
              </span>
            )}
          </div>
          {/* Variant info below */}
          {variantName && (
            <span
              className="text-[13px] uppercase tracking-[0.02em] text-[#1a1a1a] leading-tight mt-0.5"
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              {variantName}
            </span>
          )}
        </div>

        {/* CTA button column */}
        <Link
          href={ctaUrl}
          target={ctaNewTab ? '_blank' : '_self'}
          rel={ctaNewTab ? 'noopener noreferrer' : undefined}
          className={cn(
            'flex-1 flex items-center justify-center px-3 py-3',
            'bg-[#1a1a1a] text-white',
            'hover:bg-[#bbdae9] hover:text-[#1a1a1a]',
            'transition-colors duration-200'
          )}
          style={{ borderTop: '0.25px solid #999999', borderRight: '0.25px solid #999999' }}
        >
          <span
            className="text-[11px] font-medium uppercase tracking-[0.04em] text-center"
            style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            {ctaButtonText}
          </span>
        </Link>
      </div>

      {/* Desktop Layout: Thumbnail + Info + CTA */}
      <div
        className="hidden lg:flex w-full items-center justify-between px-6 py-4 bg-[#f2f2f2]"
        style={{ borderTop: '0.25px solid #999999' }}
      >
        {/* Left side - Thumbnail + Product info */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Thumbnail */}
          {thumbnailUrl && (
            <div className="w-14 h-14 relative flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={thumbnailUrl}
                alt={productName}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          )}

          {/* Product info */}
          <div className="flex flex-col min-w-0">
            {/* Product Title */}
            <span
              className="text-[19px] font-medium uppercase tracking-[0.02em] text-[#1a1a1a] truncate leading-tight"
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              {productName}
            </span>
            {/* Variant info */}
            {variantName && (
              <span
                className="text-[16px] uppercase tracking-[0.02em] text-[#1a1a1a] leading-tight mt-0.5"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                {variantName}
              </span>
            )}
          </div>
        </div>

        {/* CTA Button with price - right side */}
        <Link
          href={ctaUrl}
          target={ctaNewTab ? '_blank' : '_self'}
          rel={ctaNewTab ? 'noopener noreferrer' : undefined}
          className={cn(
            'flex items-center justify-center px-6 py-2.5',
            'bg-[#1a1a1a] text-white',
            'hover:bg-[#bbdae9] hover:text-[#1a1a1a]',
            'transition-colors duration-200'
          )}
        >
          <span
            className="text-[12px] font-medium uppercase tracking-[0.04em]"
            style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            {ctaButtonText} {formattedPrice && `- ${formattedPrice}`}
          </span>
        </Link>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{
            type: 'spring',
            damping: 30,
            stiffness: 300,
          }}
          className="fixed bottom-0 left-0 right-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
        >
          <DrawerContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
