'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnnouncementBar } from './announcement-bar';

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  heroImageUrl: string | null;
}

interface BumperSettings {
  bumperEnabled?: boolean | null;
  bumperText?: string | null;
  bumperLinkUrl?: string | null;
  bumperLinkText?: string | null;
  bumperTheme?: 'light' | 'dark' | null;
}

interface SocialStats {
  totalReviews?: number | null;
  totalCustomers?: number | null;
  instagramFollowers?: number | null;
  facebookFollowers?: number | null;
}

interface GlobalNavSettings {
  logoPosition?: string | null;
  logoPositionMobile?: string | null;
  ctaEnabled?: boolean | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  tile1ProductId?: string | null;
  tile1Title?: string | null;
  tile1Subtitle?: string | null;
  tile1Badge?: string | null;
  tile1BadgeEmoji?: string | null;
  tile1ImageUrl?: string | null;
  tile1HoverImageUrl?: string | null;
  tile2ProductId?: string | null;
  tile2Title?: string | null;
  tile2Subtitle?: string | null;
  tile2Badge?: string | null;
  tile2BadgeEmoji?: string | null;
  tile2ImageUrl?: string | null;
  tile2HoverImageUrl?: string | null;
  // Marketing tile (uses both new and legacy field names)
  marketingTileTitle?: string | null;
  marketingTileDescription?: string | null;
  marketingTileBadge1?: string | null;
  marketingTileBadge2?: string | null;
  marketingTileBadge3?: string | null;
  marketingTileCtaEnabled?: boolean | null;
  marketingTileCtaText?: string | null;
  marketingTileCtaUrl?: string | null;
  marketingTileRotatingBadgeEnabled?: boolean | null;
  marketingTileRotatingBadgeUrl?: string | null;
  // Legacy aliases
  cleanFormulasTitle?: string | null;
  cleanFormulasDescription?: string | null;
  cleanFormulasCtaEnabled?: boolean | null;
  cleanFormulasCtaText?: string | null;
  cleanFormulasCtaUrl?: string | null;
  cleanFormulasBadgeEnabled?: boolean | null;
  cleanFormulasBadgeUrl?: string | null;
}

interface NavPage {
  id: string;
  slug: string;
  title: string;
  showInNav: boolean | null;
  navOrder: number | null;
}

interface HeaderProps {
  logo?: string | null;
  products?: Product[];
  bumper?: BumperSettings | null;
  socialStats?: SocialStats | null;
  globalNav?: GlobalNavSettings | null;
  navPages?: NavPage[];
}

// Product images for mega nav
const PRODUCT_IMAGES = {
  'eye-drops': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
  'eye-wipes': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
};

// Default avatars for social proof
const SOCIAL_PROOF_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face',
];

export function Header({ logo, products = [], bumper, socialStats, globalNav, navPages = [] }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const showBumper = bumper?.bumperEnabled && bumper?.bumperText;

  // Get products for tiles
  const tile1Product = globalNav?.tile1ProductId
    ? products.find(p => p.id === globalNav.tile1ProductId)
    : products.find(p => p.slug === 'eye-drops');
  const tile2Product = globalNav?.tile2ProductId
    ? products.find(p => p.id === globalNav.tile2ProductId)
    : products.find(p => p.slug === 'eye-wipes');

  // Get nav pages sorted by order
  const activeNavPages = navPages
    .filter(p => p.showInNav)
    .sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // CTA settings
  const ctaEnabled = globalNav?.ctaEnabled ?? true;
  const ctaText = globalNav?.ctaText || 'Shop Now';
  const ctaUrl = globalNav?.ctaUrl || '/products/eye-drops';

  // Logo position settings
  const logoPosition = globalNav?.logoPosition || 'left';
  const logoPositionMobile = globalNav?.logoPositionMobile || 'left';

  // Clean formulas settings
  const cleanFormulasTitle = globalNav?.cleanFormulasTitle || 'Clean Formulas';
  const cleanFormulasDescription = globalNav?.cleanFormulasDescription || 'No preservatives, phthalates, parabens, or sulfates.';

  return (
    <>
      {/* Announcement Bumper Bar - flush with header, no gap */}
      {showBumper && (
        <div className="lg:fixed lg:top-0 lg:left-0 lg:right-0 z-[51]">
          <AnnouncementBar
            text={bumper.bumperText!}
            linkUrl={bumper.bumperLinkUrl}
            linkText={bumper.bumperLinkText}
            theme={bumper.bumperTheme || 'light'}
          />
        </div>
      )}

      <header
        className={cn(
          'lg:fixed left-0 right-0 lg:z-50 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-5',
          showBumper ? 'lg:top-[44px]' : 'lg:top-0'
        )}
      >
        <nav className="container">
          {/* Nav row - lg:z-[70] ensures nav items float above the dropdown (z-50) on desktop only */}
          <div className={cn(
            "flex items-center relative lg:z-[70]",
            logoPosition === 'center' ? 'lg:justify-between' : 'justify-between'
          )}>
            {/* Mobile Menu Button - Always on right for mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 -mr-2 rounded-full hover:bg-[var(--sand)] transition-colors order-last"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className={cn(
                "flex items-center lg:relative lg:z-10",
                // Mobile positioning - when centered, use flex-1 to take up space and center content
                logoPositionMobile === 'center' ? 'flex-1 justify-center lg:flex-none lg:justify-start order-1' : 'order-first',
                // Desktop positioning
                logoPosition === 'center' ? 'lg:absolute lg:left-1/2 lg:-translate-x-1/2' : ''
              )}
            >
              {logo ? (
                <Image
                  src={logo}
                  alt="Archie's Remedies"
                  width={180}
                  height={45}
                  className="h-9 w-auto"
                  priority
                />
              ) : (
                <span className="text-lg font-medium tracking-tight">
                  Archie&apos;s Remedies
                </span>
              )}
            </Link>

            {/* Spacer for mobile when logo is centered - balances the hamburger on right */}
            {logoPositionMobile === 'center' && (
              <div className="lg:hidden w-9 order-first" />
            )}

            {/* Desktop Navigation - Shop on left */}
            <div className={cn(
              "hidden lg:flex items-center gap-10",
              logoPosition === 'center' ? '' : 'ml-12'
            )}>
              {/* Shop Dropdown - CSS hover based (no React state) */}
              <div className="relative group/shop inline-flex">
                <button
                  className="flex items-center gap-2 text-base font-medium tracking-wide transition-colors py-3 text-[#1a1a1a] group-hover/shop:text-[#737373]"
                >
                  Shop
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-300 group-hover/shop:rotate-180"
                  />
                </button>

                {/* Hover bridge - narrow zone below button that connects to dropdown */}
                <div
                  className="absolute top-full left-0 right-0"
                  style={{
                    height: showBumper ? '95px' : '51px',
                    background: 'transparent'
                  }}
                />

                {/* Mega Nav Dropdown - CSS transitions, z-40 to sit below nav bar (z-50) */}
                <div
                  className="hidden lg:block fixed left-0 right-0 z-40 opacity-0 invisible translate-y-2 group-hover/shop:opacity-100 group-hover/shop:visible group-hover/shop:translate-y-0 transition-all duration-300 ease-out pointer-events-none group-hover/shop:pointer-events-auto"
                  style={{ top: showBumper ? '131px' : '87px' }}
                >

                  <div className="relative z-50 w-full bg-white shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
                    {/* Shelf container with generous padding - pb-[30px] for whitespace below tiles */}
                    <div className="container pt-8 pb-[30px]">
                      {/* Content grid - bottom aligned so Clean Formulas aligns with product tiles */}
                      <div className="grid lg:grid-cols-12 gap-8 items-end">
                        {/* Product tiles - 2 columns */}
                        <div className="lg:col-span-8">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Product Tile 1 - pl-0 to align with container edge */}
                            {tile1Product && (
                              <Link
                                href={`/products/${tile1Product.slug}`}
                                className="group/tile block p-5 pl-0 rounded-2xl bg-white hover:shadow-md hover:bg-[var(--cream)] transition-all duration-300"
                              >
                                <div className="relative mb-4">
                                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-[var(--cream)] relative">
                                    {/* Primary Media - video or image, visible by default */}
                                    {(() => {
                                      const primaryUrl = globalNav?.tile1ImageUrl || tile1Product.heroImageUrl || PRODUCT_IMAGES['eye-drops'];
                                      const isVideo = primaryUrl?.match(/\.(mp4|webm|mov)$/i);

                                      return isVideo ? (
                                        <video
                                          src={primaryUrl}
                                          autoPlay
                                          loop
                                          muted
                                          playsInline
                                          className={cn(
                                            "w-full h-full object-cover transition-opacity duration-300",
                                            globalNav?.tile1HoverImageUrl ? "group-hover/tile:opacity-0" : ""
                                          )}
                                        />
                                      ) : (
                                        <Image
                                          src={primaryUrl}
                                          alt={globalNav?.tile1Title || tile1Product.name}
                                          width={400}
                                          height={400}
                                          className={cn(
                                            "w-full h-full object-cover transition-opacity duration-300",
                                            globalNav?.tile1HoverImageUrl ? "group-hover/tile:opacity-0" : "group-hover/tile:scale-105"
                                          )}
                                        />
                                      );
                                    })()}
                                    {/* Hover Media - video or image, shown on hover */}
                                    {globalNav?.tile1HoverImageUrl && (
                                      globalNav.tile1HoverImageUrl.match(/\.(mp4|webm|mov)$/i) ? (
                                        <video
                                          src={globalNav.tile1HoverImageUrl}
                                          autoPlay
                                          loop
                                          muted
                                          playsInline
                                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile:opacity-100 transition-opacity duration-300"
                                        />
                                      ) : (
                                        <Image
                                          src={globalNav.tile1HoverImageUrl}
                                          alt=""
                                          width={400}
                                          height={400}
                                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile:opacity-100 transition-opacity duration-300"
                                        />
                                      )
                                    )}
                                  </div>
                                  {(globalNav?.tile1Badge || globalNav?.tile1BadgeEmoji) && (
                                    <span className="absolute top-3 right-3 text-xs px-2.5 py-1 bg-[var(--foreground)] text-white rounded-full font-medium flex items-center gap-1">
                                      {globalNav.tile1BadgeEmoji} {globalNav.tile1Badge}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-sm text-[var(--foreground)] font-medium">2,900+</span>
                                  <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(i => (
                                      <Star key={i} className="w-3.5 h-3.5 fill-[var(--primary)] text-[var(--primary)]" />
                                    ))}
                                  </div>
                                  <span className="text-xs text-[var(--muted-foreground)] font-semibold">Verified Reviews</span>
                                </div>
                                <h4 className="text-lg font-medium mb-1 group-hover/tile:text-[var(--muted-foreground)] transition-colors">
                                  {globalNav?.tile1Title || tile1Product.name}
                                </h4>
                                <p className="text-sm text-[var(--muted-foreground)]">
                                  {globalNav?.tile1Subtitle || tile1Product.shortDescription || 'Instant, lasting relief'}
                                </p>
                              </Link>
                            )}

                            {/* Product Tile 2 - same padding structure as Tile 1 for consistent sizing */}
                            {tile2Product && (
                              <Link
                                href={`/products/${tile2Product.slug}`}
                                className="group/tile block p-5 pl-0 rounded-2xl bg-white hover:shadow-md hover:bg-[var(--cream)] transition-all duration-300"
                              >
                                <div className="relative mb-4">
                                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-[var(--cream)] relative">
                                    {/* Primary Media - video or image, visible by default */}
                                    {(() => {
                                      const primaryUrl = globalNav?.tile2ImageUrl || tile2Product.heroImageUrl || PRODUCT_IMAGES['eye-wipes'];
                                      const isVideo = primaryUrl?.match(/\.(mp4|webm|mov)$/i);

                                      return isVideo ? (
                                        <video
                                          src={primaryUrl}
                                          autoPlay
                                          loop
                                          muted
                                          playsInline
                                          className={cn(
                                            "w-full h-full object-cover transition-opacity duration-300",
                                            globalNav?.tile2HoverImageUrl ? "group-hover/tile:opacity-0" : ""
                                          )}
                                        />
                                      ) : (
                                        <Image
                                          src={primaryUrl}
                                          alt={globalNav?.tile2Title || tile2Product.name}
                                          width={400}
                                          height={400}
                                          className={cn(
                                            "w-full h-full object-cover transition-opacity duration-300",
                                            globalNav?.tile2HoverImageUrl ? "group-hover/tile:opacity-0" : "group-hover/tile:scale-105"
                                          )}
                                        />
                                      );
                                    })()}
                                    {/* Hover Media - video or image, shown on hover */}
                                    {globalNav?.tile2HoverImageUrl && (
                                      globalNav.tile2HoverImageUrl.match(/\.(mp4|webm|mov)$/i) ? (
                                        <video
                                          src={globalNav.tile2HoverImageUrl}
                                          autoPlay
                                          loop
                                          muted
                                          playsInline
                                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile:opacity-100 transition-opacity duration-300"
                                        />
                                      ) : (
                                        <Image
                                          src={globalNav.tile2HoverImageUrl}
                                          alt=""
                                          width={400}
                                          height={400}
                                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile:opacity-100 transition-opacity duration-300"
                                        />
                                      )
                                    )}
                                  </div>
                                  {(globalNav?.tile2Badge || globalNav?.tile2BadgeEmoji) && (
                                    <span className="absolute top-3 right-3 text-xs px-2.5 py-1 bg-[var(--primary)] text-[var(--foreground)] rounded-full font-medium flex items-center gap-1">
                                      {globalNav.tile2BadgeEmoji} {globalNav.tile2Badge}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-sm text-[var(--foreground)] font-medium">2,900+</span>
                                  <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(i => (
                                      <Star key={i} className="w-3.5 h-3.5 fill-[var(--primary)] text-[var(--primary)]" />
                                    ))}
                                  </div>
                                  <span className="text-xs text-[var(--muted-foreground)] font-semibold">Verified Reviews</span>
                                </div>
                                <h4 className="text-lg font-medium mb-1 group-hover/tile:text-[var(--muted-foreground)] transition-colors">
                                  {globalNav?.tile2Title || tile2Product.name}
                                </h4>
                                <p className="text-sm text-[var(--muted-foreground)]">
                                  {globalNav?.tile2Subtitle || tile2Product.shortDescription || 'Daily cleansing wipes'}
                                </p>
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Marketing Tile (Clean Formulas) - Compact tile, moved up 60px from bottom */}
                        <div className="lg:col-span-4 relative mb-[60px]">
                          {/* Rotating Badge */}
                          {(globalNav?.marketingTileRotatingBadgeEnabled || globalNav?.cleanFormulasBadgeEnabled) &&
                           (globalNav?.marketingTileRotatingBadgeUrl || globalNav?.cleanFormulasBadgeUrl) && (
                            <div className="absolute -top-4 -right-4 w-20 h-20 z-10">
                              <Image
                                src={globalNav.marketingTileRotatingBadgeUrl || globalNav.cleanFormulasBadgeUrl || ''}
                                alt=""
                                width={80}
                                height={80}
                                className="w-full h-full object-contain animate-spin-slow"
                              />
                            </div>
                          )}
                          <div className="p-6 pr-0 rounded-2xl rounded-r-none bg-[var(--primary-light)]">
                            <p className="text-lg font-medium mb-2">{globalNav?.marketingTileTitle || cleanFormulasTitle}</p>
                            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4">
                              {globalNav?.marketingTileDescription || cleanFormulasDescription}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              <span className="text-xs px-2.5 py-1 bg-white rounded-full">{globalNav?.marketingTileBadge1 || 'Preservative-Free'}</span>
                              <span className="text-xs px-2.5 py-1 bg-white rounded-full">{globalNav?.marketingTileBadge2 || 'Paraben-Free'}</span>
                              <span className="text-xs px-2.5 py-1 bg-white rounded-full">{globalNav?.marketingTileBadge3 || 'Sulfate-Free'}</span>
                            </div>

                            {/* CTA Button for Marketing Tile */}
                            {(globalNav?.marketingTileCtaEnabled || globalNav?.cleanFormulasCtaEnabled) &&
                             (globalNav?.marketingTileCtaText || globalNav?.cleanFormulasCtaText) &&
                             (globalNav?.marketingTileCtaUrl || globalNav?.cleanFormulasCtaUrl) && (
                              <Link
                                href={globalNav.marketingTileCtaUrl || globalNav.cleanFormulasCtaUrl || ''}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-white rounded-full text-sm font-medium hover:bg-black transition-colors mb-4"
                              >
                                {globalNav.marketingTileCtaText || globalNav.cleanFormulasCtaText}
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            )}

                            {/* Social Validation */}
                            <div className="flex items-center gap-3 pt-4 border-t border-[var(--foreground)]/10">
                              <div className="flex -space-x-2">
                                {SOCIAL_PROOF_AVATARS.slice(0, 3).map((avatar, idx) => (
                                  <Image
                                    key={idx}
                                    src={avatar}
                                    alt=""
                                    width={28}
                                    height={28}
                                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover"
                                  />
                                ))}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-[var(--foreground)] font-medium">
                                  {socialStats?.totalReviews?.toLocaleString() || '2,900'}+
                                </span>
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-3 h-3 fill-[var(--primary)] text-[var(--primary)]" />
                                  ))}
                                </div>
                                <span className="text-[10px] text-[var(--foreground)] font-semibold uppercase tracking-wide">
                                  Verified Reviews
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spacer to push right items */}
            <div className="hidden lg:block flex-1" />

            {/* Page Links - from admin settings */}
            <div className="hidden lg:flex items-center gap-8">
              {activeNavPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/${page.slug}`}
                  className="text-base font-medium tracking-wide text-[#1a1a1a] hover:text-[#737373] transition-colors py-3"
                >
                  {page.title}
                </Link>
              ))}

              {/* Fallback "Our Story" if no pages configured */}
              {activeNavPages.length === 0 && (
                <Link
                  href="/our-story"
                  className="text-base font-medium tracking-wide text-[#1a1a1a] hover:text-[#737373] transition-colors py-3"
                >
                  Our Story
                </Link>
              )}

              {/* CTA Button - Uses definitive CSS class to avoid Tailwind v4 color issues */}
              {ctaEnabled && (
                <Link
                  href={ctaUrl}
                  className="cta-button-primary group"
                >
                  {ctaText}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>

          </div>
        </nav>

      </header>

      {/* Mobile Menu - Full screen overlay to cover header */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-white lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Close button - top right */}
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-[var(--sand)] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-auto px-6 pb-6">
                <nav className="space-y-6">
                  {/* Products */}
                  <div>
                    <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-4">
                      Shop
                    </h3>
                    <div className="space-y-3">
                      {tile1Product && (
                        <Link
                          href={`/products/${tile1Product.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 p-4 rounded-xl bg-[var(--cream)] hover:bg-[var(--sand)] transition-colors"
                        >
                          <div className="w-14 h-14 rounded-lg bg-white overflow-hidden">
                            <Image
                              src={tile1Product.heroImageUrl || PRODUCT_IMAGES['eye-drops']}
                              alt={tile1Product.name}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{globalNav?.tile1Title || tile1Product.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">{globalNav?.tile1Subtitle || 'Preservative-free relief'}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                        </Link>
                      )}
                      {tile2Product && (
                        <Link
                          href={`/products/${tile2Product.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 p-4 rounded-xl bg-[var(--cream)] hover:bg-[var(--sand)] transition-colors"
                        >
                          <div className="w-14 h-14 rounded-lg bg-white overflow-hidden">
                            <Image
                              src={tile2Product.heroImageUrl || PRODUCT_IMAGES['eye-wipes']}
                              alt={tile2Product.name}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{globalNav?.tile2Title || tile2Product.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">{globalNav?.tile2Subtitle || 'Gentle daily cleansing'}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Page Links - same as desktop nav */}
                  {activeNavPages.length > 0 && (
                    <div className="space-y-1">
                      {activeNavPages.map((page) => (
                        <Link
                          key={page.id}
                          href={`/${page.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between py-4 border-b border-[var(--border-light)] hover:text-[var(--muted-foreground)] transition-colors"
                        >
                          <span className="text-lg">{page.title}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Mobile Clean Formulas Module - Compact */}
                  <div className="p-4 rounded-xl bg-[var(--primary-light)]">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">{cleanFormulasTitle}</p>
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                          {cleanFormulasDescription}
                        </p>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-3 h-3 fill-[var(--primary)] text-[var(--primary)]" />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="text-[10px] px-2 py-0.5 bg-white rounded-full">Preservative-Free</span>
                      <span className="text-[10px] px-2 py-0.5 bg-white rounded-full">Paraben-Free</span>
                      <span className="text-[10px] px-2 py-0.5 bg-white rounded-full">Sulfate-Free</span>
                    </div>
                    {globalNav?.cleanFormulasCtaEnabled && globalNav?.cleanFormulasCtaText && globalNav?.cleanFormulasCtaUrl && (
                      <Link
                        href={globalNav.cleanFormulasCtaUrl}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-[var(--foreground)] hover:text-[var(--muted-foreground)] transition-colors"
                      >
                        {globalNav.cleanFormulasCtaText}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </nav>
              </div>

              {/* Bottom CTA */}
              {ctaEnabled && (
                <div className="p-6 border-t border-[var(--border-light)] bg-[var(--cream)]">
                  <Link
                    href={ctaUrl}
                    onClick={() => setIsOpen(false)}
                    className="cta-button-primary w-full justify-center"
                  >
                    {ctaText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header + bumper - only on desktop */}
      <div className={cn(
        'hidden lg:block',
        showBumper ? 'h-[135px]' : 'h-[95px]'
      )} />
    </>
  );
}
