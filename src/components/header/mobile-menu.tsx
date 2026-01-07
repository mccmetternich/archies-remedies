'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Star } from 'lucide-react';
import { Product, NavPage, GlobalNavSettings, PRODUCT_IMAGES } from './types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  tile1Product: Product | undefined;
  tile2Product: Product | undefined;
  mobileNavPages: NavPage[];
  globalNav: GlobalNavSettings | null | undefined;
  ctaEnabled: boolean;
  ctaText: string;
  ctaUrl: string;
  cleanFormulasTitle: string;
  cleanFormulasDescription: string;
}

export const MobileMenu = memo(function MobileMenu({
  isOpen,
  onClose,
  tile1Product,
  tile2Product,
  mobileNavPages,
  globalNav,
  ctaEnabled,
  ctaText,
  ctaUrl,
  cleanFormulasTitle,
  cleanFormulasDescription,
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[85vw] max-w-[400px] z-[61] bg-[var(--background)] shadow-2xl lg:hidden"
           
          >
            <div className="flex flex-col h-full">
              {/* Close button - aligned with content edge */}
              <button
                onClick={onClose}
                className="absolute top-3 right-5 z-10 p-2 rounded-full hover:bg-[var(--sand)] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex-1 overflow-auto px-5 pt-4 pb-6">
                <nav className="space-y-4">
                  {/* Shop Section Header - Inter font, dark gray */}
                  <h3
                    className="font-semibold tracking-[0.15em] uppercase text-[var(--muted-foreground)]"
                    style={{ fontSize: '22px' }}
                  >
                    Shop
                  </h3>

                  {/* Best Sellers label - left aligned, tighter gap to line */}
                  <div className="pt-1 pb-1">
                    <span className="text-[8px] font-medium tracking-[0.15em] uppercase text-[var(--muted-foreground)]">Best Sellers</span>
                    <div className="h-[0.5px] bg-black/30 mt-1" />
                  </div>

                  {/* Product Tiles */}
                  <div className="space-y-3">
                    {tile1Product && (
                      <MobileProductTile
                        product={tile1Product}
                        imageUrl={globalNav?.tile1ImageUrl}
                        title={globalNav?.tile1Title}
                        subtitle={globalNav?.tile1Subtitle}
                        fallbackImage={PRODUCT_IMAGES['eye-drops']}
                        defaultSubtitle="Preservative-free relief"
                        onClose={onClose}
                      />
                    )}
                    {tile2Product && (
                      <MobileProductTile
                        product={tile2Product}
                        imageUrl={globalNav?.tile2ImageUrl}
                        title={globalNav?.tile2Title}
                        subtitle={globalNav?.tile2Subtitle}
                        fallbackImage={PRODUCT_IMAGES['eye-wipes']}
                        defaultSubtitle="Gentle daily cleansing"
                        onClose={onClose}
                      />
                    )}
                  </div>

                  {/* Page Links - each framed with lines like THE RITUAL */}
                  {mobileNavPages.length > 0 && (
                    <div className="pt-4 space-y-0">
                      {mobileNavPages.map((page) => (
                        <div key={page.id}>
                          {/* Top border */}
                          <div className="h-[0.5px] bg-black/30" />
                          <Link
                            href={`/${page.slug}`}
                            onClick={onClose}
                            className="flex items-center justify-between py-3 px-3 hover:text-[var(--muted-foreground)] transition-colors"
                          >
                            <span className="text-[14px] font-medium uppercase tracking-tight">{page.title}</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          {/* Bottom border */}
                          <div className="h-[0.5px] bg-black/30" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mobile Marketing Tile - respects hide on mobile setting, increased gap from Our Story */}
                  {!globalNav?.marketingTileHideOnMobile && (
                    <MobileMarketingTile
                      globalNav={globalNav}
                      cleanFormulasTitle={cleanFormulasTitle}
                      cleanFormulasDescription={cleanFormulasDescription}
                      onClose={onClose}
                    />
                  )}
                </nav>
              </div>

              {/* Bottom CTA */}
              {ctaEnabled && (
                <div className="p-6 border-t border-[var(--border-light)] bg-[var(--cream)]">
                  <Link
                    href={ctaUrl}
                    onClick={onClose}
                    className="cta-button-primary w-full justify-center"
                  >
                    {ctaText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// Mobile Product Tile sub-component
interface MobileProductTileProps {
  product: Product;
  imageUrl: string | null | undefined;
  title: string | null | undefined;
  subtitle: string | null | undefined;
  fallbackImage: string;
  defaultSubtitle: string;
  onClose: () => void;
}

function MobileProductTile({
  product,
  imageUrl,
  title,
  subtitle,
  fallbackImage,
  defaultSubtitle,
  onClose,
}: MobileProductTileProps) {
  const mediaUrl = imageUrl || product.heroImageUrl || fallbackImage;
  const isVideo = mediaUrl?.match(/\.(mp4|webm|mov)$/i);

  return (
    <Link
      href={`/products/${product.slug}`}
      onClick={onClose}
      className="flex items-start gap-5 py-3 px-3 rounded-2xl bg-[#f8f8f8] hover:bg-[#e8f4f9] transition-colors"
    >
      <div className="w-[90px] h-[90px] rounded-xl bg-white overflow-hidden relative flex-shrink-0">
        {isVideo ? (
          <video
            src={mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={mediaUrl}
            alt={product.name}
            width={90}
            height={90}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="font-medium text-[14px] uppercase tracking-tight">{title || product.name}</p>
        <p className="text-sm text-[var(--muted-foreground)]">{subtitle || defaultSubtitle}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)] flex-shrink-0 mt-0.5" />
    </Link>
  );
}

// Mobile Marketing Tile sub-component
interface MobileMarketingTileProps {
  globalNav: GlobalNavSettings | null | undefined;
  cleanFormulasTitle: string;
  cleanFormulasDescription: string;
  onClose: () => void;
}

function MobileMarketingTile({
  globalNav,
  cleanFormulasTitle,
  cleanFormulasDescription,
  onClose,
}: MobileMarketingTileProps) {
  return (
    <div className="relative rounded-xl bg-[var(--primary-light)] overflow-visible mt-[30px]" style={{ padding: '12px' }}>
      {/* Rotating Badge - Mobile only (respects mobile toggle) */}
      {globalNav?.marketingTileRotatingBadgeEnabled &&
       (globalNav?.marketingTileRotatingBadgeEnabledMobile !== false) &&
       globalNav?.marketingTileRotatingBadgeUrl && (
        <div className="absolute -top-5 -right-2 w-14 h-14 z-10">
          <Image
            src={globalNav.marketingTileRotatingBadgeUrl}
            alt=""
            width={56}
            height={56}
            className="w-full h-full object-contain animate-spin-slow"
          />
        </div>
      )}
      <div className="mb-2">
        <p className="font-medium text-sm uppercase tracking-wide">{globalNav?.marketingTileTitle || cleanFormulasTitle}</p>
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mt-1">
          {globalNav?.marketingTileDescription || cleanFormulasDescription}
        </p>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-3 h-3 fill-[var(--primary)] text-[var(--primary)]" />
          ))}
        </div>
        <span className="text-[10px] text-[var(--muted-foreground)]">2,900+ Reviews</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] px-2 py-0.5 bg-white rounded-full">{globalNav?.marketingTileBadge1 || 'Preservative-Free'}</span>
        <span className="text-[10px] px-2 py-0.5 bg-white rounded-full">{globalNav?.marketingTileBadge2 || 'Paraben-Free'}</span>
        <span className="text-[10px] px-2 py-0.5 bg-white rounded-full">{globalNav?.marketingTileBadge3 || 'Sulfate-Free'}</span>
      </div>
      {/* Mobile CTA Button - respects mobile toggle */}
      {globalNav?.marketingTileCtaEnabled &&
       (globalNav?.marketingTileCtaEnabledMobile !== false) &&
       globalNav?.marketingTileCtaText && (
        <Link
          href={globalNav.marketingTileCtaUrl || '/about'}
          onClick={onClose}
          className="cta-button-primary w-full justify-center mt-4 text-sm py-3"
        >
          {globalNav.marketingTileCtaText}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
