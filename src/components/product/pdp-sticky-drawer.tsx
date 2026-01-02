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

  // Scroll to top and hide drawer
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        // Fallback: show after 100px scroll if no marquee found (triggers faster)
        const scrollY = window.scrollY ?? window.pageYOffset ?? 0;
        setIsVisible(scrollY > 100);
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
        {/* Thumbnail (if provided) - clickable to scroll to top */}
        {thumbnailUrl && (
          <button
            type="button"
            onClick={handleScrollToTop}
            className="flex-shrink-0 w-14 h-14 relative bg-[#f2f2f2] flex items-center justify-center cursor-pointer"
            style={{ borderTop: '0.25px solid #999999' }}
            aria-label="Scroll to top"
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
          </button>
        )}

        {/* Product info column - clickable to scroll to top */}
        <button
          type="button"
          onClick={handleScrollToTop}
          className="flex-[4] flex flex-col justify-center px-4 py-3 bg-[#f2f2f2] cursor-pointer text-left"
          style={{ borderTop: '0.25px solid #999999' }}
        >
          {/* Title + Price on same line */}
          <div className="flex items-center justify-between w-full">
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
        </button>

        {/* CTA button column */}
        <Link
          href={ctaUrl}
          target={ctaNewTab ? '_blank' : '_self'}
          rel={ctaNewTab ? 'noopener noreferrer' : undefined}
          className={cn(
            'flex-1 flex items-center justify-center px-3 py-3',
            'bg-[#1a1a1a]',
            'hover:bg-[#bbdae9]',
            'transition-colors duration-200',
            'group/cta'
          )}
          style={{ borderTop: '0.25px solid #999999', borderRight: '0.25px solid #999999' }}
        >
          <span
            className="text-[11px] font-medium uppercase tracking-[0.04em] text-center group-hover/cta:text-[#1a1a1a]"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              color: '#ffffff',
            }}
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
        {/* Left side - Thumbnail + Product info - clickable to scroll to top */}
        <button
          type="button"
          onClick={handleScrollToTop}
          className="flex items-center gap-4 min-w-0 cursor-pointer text-left"
        >
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
        </button>

        {/* CTA Button with price - right side - taller on desktop */}
        <Link
          href={ctaUrl}
          target={ctaNewTab ? '_blank' : '_self'}
          rel={ctaNewTab ? 'noopener noreferrer' : undefined}
          className={cn(
            'flex items-center justify-center px-8 py-4',
            'bg-[#1a1a1a]',
            'hover:bg-[#bbdae9]',
            'transition-colors duration-200',
            'group/cta'
          )}
        >
          <span
            className="text-[13px] font-medium uppercase tracking-[0.04em] group-hover/cta:text-[#1a1a1a]"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              color: '#ffffff',
            }}
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
            type: 'tween',
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1], // Smooth ease-out curve
          }}
          className="fixed bottom-0 left-0 right-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
        >
          <DrawerContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
