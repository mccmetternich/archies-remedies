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
}

interface SocialStats {
  totalReviews?: number | null;
  totalCustomers?: number | null;
  instagramFollowers?: number | null;
  facebookFollowers?: number | null;
}

interface HeaderProps {
  logo?: string | null;
  products?: Product[];
  bumper?: BumperSettings | null;
  socialStats?: SocialStats | null;
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

export function Header({ logo, products = [], bumper, socialStats }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  const showBumper = bumper?.bumperEnabled && bumper?.bumperText;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mega nav when scrolling
  useEffect(() => {
    if (shopOpen) {
      const handleScroll = () => setShopOpen(false);
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [shopOpen]);

  return (
    <>
      {/* Announcement Bumper Bar */}
      {showBumper && (
        <div className="fixed top-0 left-0 right-0 z-[51]">
          <AnnouncementBar
            text={bumper.bumperText!}
            linkUrl={bumper.bumperLinkUrl}
            linkText={bumper.bumperLinkText}
          />
        </div>
      )}

      <header
        className={cn(
          'fixed left-0 right-0 z-50 transition-all duration-700',
          showBumper ? 'top-[52px]' : 'top-0',
          isScrolled
            ? 'bg-white/98 backdrop-blur-xl shadow-sm py-4'
            : 'bg-transparent py-6'
        )}
      >
        <nav className="container">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center relative z-10">
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

            {/* Desktop Navigation - Closer to logo on the left */}
            <div className="hidden lg:flex items-center gap-10 ml-12">
              {/* Shop Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShopOpen(true)}
                onMouseLeave={() => setShopOpen(false)}
              >
                <button
                  className={cn(
                    'flex items-center gap-2 text-base font-medium tracking-wide transition-colors py-3',
                    shopOpen ? 'text-[var(--muted-foreground)]' : 'hover:text-[var(--muted-foreground)]'
                  )}
                >
                  Shop
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform duration-300',
                      shopOpen && 'rotate-180'
                    )}
                  />
                </button>
              </div>

              <Link
                href="/about"
                className="text-base font-medium tracking-wide hover:text-[var(--muted-foreground)] transition-colors py-3"
              >
                Our Mission
              </Link>
            </div>

            {/* Spacer to push CTA to right */}
            <div className="hidden lg:block flex-1" />

            {/* CTA Button - Bigger with blue background */}
            <div className="hidden lg:block">
              <Link
                href="/products/eye-drops"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-[var(--primary)] text-[var(--foreground)] rounded-full text-base font-semibold hover:bg-[var(--primary-dark)] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Shop Now
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 -mr-2 rounded-full hover:bg-[var(--sand)] transition-colors relative z-10"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mega Nav Dropdown - Chunky and Beautiful */}
        <AnimatePresence>
          {shopOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 right-0 bg-white border-t border-[var(--border-light)] shadow-2xl"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <div className="container py-16 pb-24">
                <div className="grid lg:grid-cols-12 gap-16">
                  {/* Products Section - Bigger tiles */}
                  <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-10">
                      <span className="text-sm font-semibold tracking-[0.15em] uppercase text-[var(--muted-foreground)]">
                        Our Products
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      {/* Eye Drops - Stars above title, blue */}
                      <Link
                        href="/products/eye-drops"
                        className="group block p-6 rounded-3xl bg-[var(--cream)] hover:bg-[var(--sand)] transition-all duration-500"
                      >
                        {/* Badge */}
                        <div className="relative mb-5">
                          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white">
                            <Image
                              src={products.find(p => p.slug === 'eye-drops')?.heroImageUrl || PRODUCT_IMAGES['eye-drops']}
                              alt="Eye Drops"
                              width={400}
                              height={400}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <span className="absolute top-4 right-4 text-xs px-3 py-1.5 bg-[var(--foreground)] text-white rounded-full font-medium flex items-center gap-1.5">
                            🔥 Bestseller
                          </span>
                        </div>
                        {/* Stars above title - Blue */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]" />
                            ))}
                          </div>
                          <span className="text-sm text-[var(--foreground)] font-medium">4.9</span>
                          <span className="text-sm text-[var(--muted-foreground)]">(2,100+)</span>
                        </div>
                        <h4 className="text-xl font-medium mb-2 group-hover:text-[var(--muted-foreground)] transition-colors">
                          Preservative-Free Eye Drops
                        </h4>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Ultra-lubricating formula for instant, lasting relief
                        </p>
                      </Link>

                      {/* Eye Wipes - Stars above title, blue */}
                      <Link
                        href="/products/eye-wipes"
                        className="group block p-6 rounded-3xl bg-[var(--cream)] hover:bg-[var(--sand)] transition-all duration-500"
                      >
                        {/* Badge */}
                        <div className="relative mb-5">
                          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white">
                            <Image
                              src={products.find(p => p.slug === 'eye-wipes')?.heroImageUrl || PRODUCT_IMAGES['eye-wipes']}
                              alt="Eye Wipes"
                              width={400}
                              height={400}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <span className="absolute top-4 right-4 text-xs px-3 py-1.5 bg-[var(--primary)] text-[var(--foreground)] rounded-full font-medium flex items-center gap-1.5">
                            ✨ Just Launched
                          </span>
                        </div>
                        {/* Stars above title - Blue */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]" />
                            ))}
                          </div>
                          <span className="text-sm text-[var(--foreground)] font-medium">4.9</span>
                          <span className="text-sm text-[var(--muted-foreground)]">(850+)</span>
                        </div>
                        <h4 className="text-xl font-medium mb-2 group-hover:text-[var(--muted-foreground)] transition-colors">
                          Gentle Lid & Lash Wipes
                        </h4>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Daily cleansing wipes for lids, lashes & brows
                        </p>
                      </Link>
                    </div>
                  </div>

                  {/* Clean Formulas + Social Proof - Combined into one tile */}
                  <div className="lg:col-span-4">
                    <div className="w-full h-full p-8 rounded-3xl bg-[var(--primary-light)] flex flex-col">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-[var(--foreground)]/60 mb-4">
                        <span className="w-8 h-px bg-[var(--foreground)]/30" />
                        Our Promise
                      </span>
                      <p className="text-2xl font-normal mb-4">Clean Formulas</p>
                      <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">
                        No preservatives, phthalates, parabens, or sulfates. Just effective, gentle ingredients your eyes deserve.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-8">
                        <span className="text-xs px-3 py-1.5 bg-white rounded-full">Preservative-Free</span>
                        <span className="text-xs px-3 py-1.5 bg-white rounded-full">Paraben-Free</span>
                        <span className="text-xs px-3 py-1.5 bg-white rounded-full">Sulfate-Free</span>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-[var(--foreground)]/10 my-auto" />

                      {/* Social Validation - Same tile */}
                      <div className="pt-6 mt-auto">
                        <div className="flex items-center gap-4">
                          {/* Stacked Avatars */}
                          <div className="flex -space-x-3">
                            {SOCIAL_PROOF_AVATARS.map((avatar, idx) => (
                              <Image
                                key={idx}
                                src={avatar}
                                alt=""
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                              />
                            ))}
                          </div>
                          {/* Stars and Text */}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]"
                                />
                              ))}
                            </div>
                            <span className="text-sm text-[var(--foreground)] font-medium">
                              {socialStats?.totalReviews?.toLocaleString() || '2,900'}+ verified reviews
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl lg:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-light)]">
                  <span className="text-sm font-semibold tracking-[0.1em] uppercase text-[var(--muted-foreground)]">Menu</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 -mr-2 rounded-full hover:bg-[var(--sand)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                  <nav className="space-y-8">
                    {/* Products */}
                    <div>
                      <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-4">
                        Shop
                      </h3>
                      <div className="space-y-3">
                        <Link
                          href="/products/eye-drops"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 p-4 rounded-xl bg-[var(--cream)] hover:bg-[var(--sand)] transition-colors"
                        >
                          <div className="w-14 h-14 rounded-lg bg-white overflow-hidden">
                            <Image
                              src={PRODUCT_IMAGES['eye-drops']}
                              alt="Eye Drops"
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Eye Drops</p>
                            <p className="text-xs text-[var(--muted-foreground)]">Preservative-free relief</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                        </Link>
                        <Link
                          href="/products/eye-wipes"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 p-4 rounded-xl bg-[var(--cream)] hover:bg-[var(--sand)] transition-colors"
                        >
                          <div className="w-14 h-14 rounded-lg bg-white overflow-hidden">
                            <Image
                              src={PRODUCT_IMAGES['eye-wipes']}
                              alt="Eye Wipes"
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Eye Wipes</p>
                            <p className="text-xs text-[var(--muted-foreground)]">Gentle daily cleansing</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                        </Link>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-1">
                      <Link
                        href="/about"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between py-4 border-b border-[var(--border-light)] hover:text-[var(--muted-foreground)] transition-colors"
                      >
                        <span className="text-lg">About Us</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/faq"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between py-4 border-b border-[var(--border-light)] hover:text-[var(--muted-foreground)] transition-colors"
                      >
                        <span className="text-lg">FAQ</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between py-4 border-b border-[var(--border-light)] hover:text-[var(--muted-foreground)] transition-colors"
                      >
                        <span className="text-lg">Contact</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </nav>
                </div>

                {/* Bottom CTA */}
                <div className="p-6 border-t border-[var(--border-light)] bg-[var(--cream)]">
                  <Link
                    href="/products/eye-drops"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--foreground)] text-white rounded-full font-medium hover:bg-black transition-colors"
                  >
                    Shop Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header + bumper */}
      <div className={cn(
        'transition-all duration-500',
        showBumper
          ? (isScrolled ? 'h-[124px]' : 'h-[140px]')
          : (isScrolled ? 'h-[72px]' : 'h-[88px]')
      )} />
    </>
  );
}
