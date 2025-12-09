'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Star, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  heroImageUrl: string | null;
}

interface HeaderProps {
  logo?: string | null;
  products?: Product[];
}

// Product images for mega nav
const PRODUCT_IMAGES = {
  'eye-drops': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
  'eye-wipes': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
};

export function Header({ logo, products = [] }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

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
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm py-3'
            : 'bg-transparent py-5'
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
                  className="h-10 w-auto"
                  priority
                />
              ) : (
                <span className="text-xl font-medium tracking-tight">
                  Archie&apos;s Remedies
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {/* Shop Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShopOpen(true)}
                onMouseLeave={() => setShopOpen(false)}
              >
                <button
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-medium tracking-wide transition-colors py-2',
                    shopOpen ? 'text-[var(--primary-dark)]' : 'hover:text-[var(--muted-foreground)]'
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
                className="text-sm font-medium tracking-wide hover:text-[var(--muted-foreground)] transition-colors py-2"
              >
                About
              </Link>

              <Link
                href="/faq"
                className="text-sm font-medium tracking-wide hover:text-[var(--muted-foreground)] transition-colors py-2"
              >
                FAQ
              </Link>

              <Link
                href="/contact"
                className="text-sm font-medium tracking-wide hover:text-[var(--muted-foreground)] transition-colors py-2"
              >
                Contact
              </Link>
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <Link href="/products/eye-drops">
                <Button size="sm" className="px-6">
                  Shop Now
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 -mr-2 rounded-full hover:bg-[var(--muted)] transition-colors relative z-10"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mega Nav Dropdown */}
        <AnimatePresence>
          {shopOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 right-0 bg-white border-t border-[var(--border-light)] shadow-xl"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <div className="container py-10">
                <div className="grid lg:grid-cols-12 gap-10">
                  {/* Products Section */}
                  <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)]">
                        Our Products
                      </h3>
                      <Link
                        href="/products"
                        className="text-xs font-medium text-[var(--primary-dark)] hover:underline flex items-center gap-1"
                      >
                        View All <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Eye Drops */}
                      <Link
                        href="/products/eye-drops"
                        className="group relative bg-gradient-to-br from-[var(--primary-light)] to-[var(--secondary)] rounded-2xl p-6 overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        <div className="absolute top-4 left-4">
                          <span className="badge badge-bestseller text-[10px]">Bestseller</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="w-32 h-32 rounded-xl overflow-hidden bg-white/50 shrink-0 shadow-md">
                            <Image
                              src={products.find(p => p.slug === 'eye-drops')?.heroImageUrl || PRODUCT_IMAGES['eye-drops']}
                              alt="Eye Drops"
                              width={128}
                              height={128}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-medium mb-2 group-hover:text-[var(--primary-dark)] transition-colors">
                              Preservative-Free Eye Drops
                            </h4>
                            <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                              Gentle, effective relief for dry, tired eyes. Available in 30 and 60 count vials.
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(i => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                              <span className="text-xs text-[var(--muted-foreground)]">2,100+ reviews</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] group-hover:translate-x-1 transition-all" />
                      </Link>

                      {/* Eye Wipes */}
                      <Link
                        href="/products/eye-wipes"
                        className="group relative bg-gradient-to-br from-[var(--secondary)] to-[var(--primary-light)] rounded-2xl p-6 overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        <div className="absolute top-4 left-4">
                          <span className="badge badge-new text-[10px]">New</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="w-32 h-32 rounded-xl overflow-hidden bg-white/50 shrink-0 shadow-md">
                            <Image
                              src={products.find(p => p.slug === 'eye-wipes')?.heroImageUrl || PRODUCT_IMAGES['eye-wipes']}
                              alt="Eye Wipes"
                              width={128}
                              height={128}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-medium mb-2 group-hover:text-[var(--primary-dark)] transition-colors">
                              Gentle Lid & Lash Wipes
                            </h4>
                            <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                              Daily cleansing wipes for sensitive eyes. Removes debris, makeup, and irritants.
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(i => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                              <span className="text-xs text-[var(--muted-foreground)]">850+ reviews</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] group-hover:translate-x-1 transition-all" />
                      </Link>
                    </div>
                  </div>

                  {/* Quick Links & Promo */}
                  <div className="lg:col-span-4 space-y-8">
                    {/* Quick Links */}
                    <div>
                      <h3 className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)] mb-4">
                        Quick Links
                      </h3>
                      <ul className="space-y-3">
                        <li>
                          <Link href="/about" className="text-sm hover:text-[var(--primary-dark)] transition-colors flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                            Our Story
                          </Link>
                        </li>
                        <li>
                          <Link href="/faq" className="text-sm hover:text-[var(--primary-dark)] transition-colors flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                            Common Questions
                          </Link>
                        </li>
                        <li>
                          <Link href="/contact" className="text-sm hover:text-[var(--primary-dark)] transition-colors flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                            Get in Touch
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Promo Card */}
                    <div className="bg-[var(--primary)] rounded-2xl p-6">
                      <Sparkles className="w-8 h-8 mb-4 text-[var(--primary-dark)]" />
                      <h4 className="font-medium mb-2">Clean Eye Care</h4>
                      <p className="text-sm text-[var(--foreground)]/70 mb-4">
                        Free from preservatives, phthalates, parabens, and sulfates.
                      </p>
                      <Link href="/about" className="text-sm font-medium underline underline-offset-4 hover:no-underline">
                        Learn Why It Matters →
                      </Link>
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
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
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
                  <span className="text-lg font-medium">Menu</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 -mr-2 rounded-full hover:bg-[var(--muted)] transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                  <nav className="space-y-8">
                    {/* Products */}
                    <div>
                      <h3 className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)] mb-4">
                        Shop
                      </h3>
                      <div className="space-y-2">
                        <Link
                          href="/products/eye-drops"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 p-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--primary-light)] transition-colors"
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
                          <div>
                            <p className="font-medium">Eye Drops</p>
                            <p className="text-xs text-[var(--muted-foreground)]">Preservative-free relief</p>
                          </div>
                        </Link>
                        <Link
                          href="/products/eye-wipes"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 p-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--primary-light)] transition-colors"
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
                          <div>
                            <p className="font-medium">Eye Wipes</p>
                            <p className="text-xs text-[var(--muted-foreground)]">Gentle daily cleansing</p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-1">
                      <Link
                        href="/about"
                        onClick={() => setIsOpen(false)}
                        className="block py-3 text-lg font-medium hover:text-[var(--primary-dark)] transition-colors"
                      >
                        About Us
                      </Link>
                      <Link
                        href="/faq"
                        onClick={() => setIsOpen(false)}
                        className="block py-3 text-lg font-medium hover:text-[var(--primary-dark)] transition-colors"
                      >
                        FAQ
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setIsOpen(false)}
                        className="block py-3 text-lg font-medium hover:text-[var(--primary-dark)] transition-colors"
                      >
                        Contact
                      </Link>
                    </div>
                  </nav>
                </div>

                {/* Bottom CTA */}
                <div className="p-6 border-t border-[var(--border-light)] bg-[var(--muted)]">
                  <Link href="/products/eye-drops" onClick={() => setIsOpen(false)}>
                    <Button className="w-full" size="lg">
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className={cn('transition-all duration-500', isScrolled ? 'h-[72px]' : 'h-[88px]')} />
    </>
  );
}
