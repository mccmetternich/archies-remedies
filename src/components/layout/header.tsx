'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ChevronDown, Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnnouncementBar } from './announcement-bar';
import { MobileMenu } from '@/components/header/mobile-menu';
import {
  Product,
  BumperSettings,
  SocialStats,
  GlobalNavSettings,
  NavPage,
  PRODUCT_IMAGES,
  SOCIAL_PROOF_AVATARS,
} from '@/components/header/types';

interface HeaderProps {
  logo?: string | null;
  products?: Product[];
  bumper?: BumperSettings | null;
  socialStats?: SocialStats | null;
  globalNav?: GlobalNavSettings | null;
  navPages?: NavPage[];
}

export function Header({ logo, products = [], bumper, socialStats, globalNav, navPages = [] }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const showBumper = bumper?.bumperEnabled && bumper?.bumperText;
  // Note: --pdp-header-height is now set via CSS :has(.announcement-bar-landscape)
  // This prevents layout shift by avoiding hydration mismatch

  // Get products for tiles
  const tile1Product = globalNav?.tile1ProductId
    ? products.find(p => p.id === globalNav.tile1ProductId)
    : products.find(p => p.slug === 'eye-drops');
  const tile2Product = globalNav?.tile2ProductId
    ? products.find(p => p.id === globalNav.tile2ProductId)
    : products.find(p => p.slug === 'eye-wipes');

  // Get nav pages sorted by order - separate lists for desktop and mobile
  const desktopNavPages = navPages
    .filter(p => p.showInNav && p.navShowOnDesktop !== false)
    .sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0));

  const mobileNavPages = navPages
    .filter(p => p.showInNav && p.navShowOnMobile !== false)
    .sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0));

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
          'lg:fixed left-0 right-0 lg:z-50 bg-[var(--background)] shadow-[0_2px_8px_rgba(0,0,0,0.18)] py-2 md:py-3',
          showBumper ? 'lg:top-[33px]' : 'lg:top-0'
        )}
      >
        <nav className="w-full px-6 lg:px-[var(--nav-left-padding)] lg:pr-[var(--nav-right-padding)] landscape-full-width">
          {/* Nav row - lg:z-[70] ensures nav items float above the dropdown (z-50) on desktop only */}
          <div className={cn(
            "flex items-center relative lg:z-[70]",
            logoPosition === 'center' ? 'lg:justify-between' : 'justify-between'
          )}>
            {/* Mobile Menu Button - Far right, bigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-1 rounded-full hover:bg-[var(--sand)] transition-colors order-last ml-auto"
              aria-label="Toggle menu"
            >
              <Menu className="w-7 h-7" />
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
                  width={200}
                  height={50}
                  className="h-7 md:h-8 w-auto"
                  priority
                />
              ) : (
                <span className="text-base md:text-lg font-medium tracking-tight">
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
              <div className="relative group/shop inline-flex items-center">
                <button
                  className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.04em] transition-colors text-[var(--foreground)] group-hover/shop:text-[var(--muted-foreground)]"
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
                    height: showBumper ? '95px' : '50px',
                    background: 'transparent'
                  }}
                />

                {/* Mega Nav Dropdown - CSS transitions, z-40 to sit below nav bar (z-50) */}
                <div
                  className="hidden lg:block fixed left-0 right-0 z-40 opacity-0 invisible translate-y-2 group-hover/shop:opacity-100 group-hover/shop:visible group-hover/shop:translate-y-0 transition-all duration-300 ease-out pointer-events-none group-hover/shop:pointer-events-auto"
                  style={{ top: showBumper ? '100px' : '64px' }}
                >

                  <div className="relative z-50 w-full bg-[var(--background)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.12)] overflow-visible">
                    {/* Shelf container with generous padding - pb-[30px] for whitespace below tiles */}
                    <div className="container pt-8 pb-[30px] overflow-visible">
                      {/* Content grid - spacer between product tiles and marketing tile grows with viewport */}
                      <div className="grid lg:grid-cols-[1fr_auto_max-content] gap-8 items-center overflow-visible">
                        {/* Product tiles - flexible width */}
                        <div>
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Product Tile 1 - pl-0 to align with container edge */}
                            {tile1Product && (
                              <Link
                                href={`/products/${tile1Product.slug}`}
                                className="group/tile block p-5 pl-0 rounded-2xl bg-transparent transition-all duration-300"
                              >
                                <div className="relative mb-4">
                                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-[var(--cream)] relative group-hover/tile:scale-[1.03] transition-transform duration-300">
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
                                            globalNav?.tile1HoverImageUrl ? "group-hover/tile:opacity-0" : ""
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
                                    <span
                                      className="absolute top-3 right-3 text-sm px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5"
                                      style={{
                                        backgroundColor: globalNav?.tile1BadgeBgColor || 'var(--foreground)',
                                        color: globalNav?.tile1BadgeTextColor || '#ffffff'
                                      }}
                                    >
                                      {globalNav.tile1BadgeEmoji} {globalNav.tile1Badge}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-sm text-[var(--foreground)] font-medium">{(tile1Product.reviewCount || 2900).toLocaleString()}+</span>
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
                                className="group/tile block p-5 pl-0 rounded-2xl bg-transparent transition-all duration-300"
                              >
                                <div className="relative mb-4">
                                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-[var(--cream)] relative group-hover/tile:scale-[1.03] transition-transform duration-300">
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
                                            globalNav?.tile2HoverImageUrl ? "group-hover/tile:opacity-0" : ""
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
                                    <span
                                      className="absolute top-3 right-3 text-sm px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5"
                                      style={{
                                        backgroundColor: globalNav?.tile2BadgeBgColor || 'var(--primary)',
                                        color: globalNav?.tile2BadgeTextColor || 'var(--foreground)'
                                      }}
                                    >
                                      {globalNav.tile2BadgeEmoji} {globalNav.tile2Badge}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-sm text-[var(--foreground)] font-medium">{(tile2Product.reviewCount || 2900).toLocaleString()}+</span>
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

                        {/* Spacer - grows with container width */}
                        <div className="hidden lg:block w-8 xl:w-16 2xl:w-24" />

                        {/* Marketing Tile (Clean Formulas) - Fixed max-width, centered vertically */}
                        <div className="relative overflow-visible max-w-[434px]">
                          <div className="p-6 rounded-2xl bg-[var(--primary-light)] relative">
                            {/* Rotating Badge - Desktop only (respects desktop toggle) */}
                            {globalNav?.marketingTileRotatingBadgeEnabled &&
                             (globalNav?.marketingTileRotatingBadgeEnabledDesktop !== false) &&
                             globalNav?.marketingTileRotatingBadgeUrl && (
                              <div className="absolute -top-8 -right-4 w-20 h-20 z-[100]">
                                <Image
                                  src={globalNav.marketingTileRotatingBadgeUrl}
                                  alt=""
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-contain animate-spin-slow"
                                />
                              </div>
                            )}
                            <p className="text-lg font-medium mb-2">{globalNav?.marketingTileTitle || cleanFormulasTitle}</p>
                            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4">
                              {globalNav?.marketingTileDescription || cleanFormulasDescription}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              <span className="text-xs px-2.5 py-1 bg-white rounded-full">{globalNav?.marketingTileBadge1 || 'Preservative-Free'}</span>
                              <span className="text-xs px-2.5 py-1 bg-white rounded-full">{globalNav?.marketingTileBadge2 || 'Paraben-Free'}</span>
                              <span className="text-xs px-2.5 py-1 bg-white rounded-full">{globalNav?.marketingTileBadge3 || 'Sulfate-Free'}</span>
                            </div>

                            {/* CTA Button for Marketing Tile - Desktop only (respects desktop toggle) */}
                            {globalNav?.marketingTileCtaEnabled &&
                             (globalNav?.marketingTileCtaEnabledDesktop !== false) &&
                             globalNav?.marketingTileCtaText && (
                              <Link
                                href={globalNav.marketingTileCtaUrl || '/about'}
                                className="cta-button-primary w-full justify-center mb-4 group"
                              >
                                {globalNav.marketingTileCtaText}
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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

            {/* Page Links - from admin settings (desktop only) */}
            <div className="hidden lg:flex items-center gap-8">
              {desktopNavPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/${page.slug}`}
                  className="text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--foreground)] hover:text-[var(--muted-foreground)] transition-colors"
                >
                  {page.title}
                </Link>
              ))}

              {/* Fallback "Our Story" if no pages configured */}
              {desktopNavPages.length === 0 && (
                <Link
                  href="/our-story"
                  className="text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--foreground)] hover:text-[var(--muted-foreground)] transition-colors"
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

      {/* Mobile Menu - Slide-out drawer from right */}
      <MobileMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tile1Product={tile1Product}
        tile2Product={tile2Product}
        mobileNavPages={mobileNavPages}
        globalNav={globalNav}
        ctaEnabled={ctaEnabled}
        ctaText={ctaText}
        ctaUrl={ctaUrl}
        cleanFormulasTitle={cleanFormulasTitle}
        cleanFormulasDescription={cleanFormulasDescription}
      />

      {/* Spacer for fixed header + bumper - only on desktop */}
      <div className={cn(
        'hidden lg:block',
        showBumper ? 'h-[113px]' : 'h-[80px]'
      )} />
    </>
  );
}
