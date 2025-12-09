'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
          'fixed top-0 left-0 right-0 z-50 transition-all duration-700',
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

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center gap-12">
              {/* Shop Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShopOpen(true)}
                onMouseLeave={() => setShopOpen(false)}
              >
                <button
                  className={cn(
                    'flex items-center gap-1.5 text-sm tracking-wide transition-colors py-2',
                    shopOpen ? 'text-[var(--muted-foreground)]' : 'hover:text-[var(--muted-foreground)]'
                  )}
                >
                  Shop
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-300',
                      shopOpen && 'rotate-180'
                    )}
                  />
                </button>
              </div>

              <Link
                href="/about"
                className="text-sm tracking-wide hover:text-[var(--muted-foreground)] transition-colors py-2"
              >
                About
              </Link>

              <Link
                href="/faq"
                className="text-sm tracking-wide hover:text-[var(--muted-foreground)] transition-colors py-2"
              >
                FAQ
              </Link>

              <Link
                href="/contact"
                className="text-sm tracking-wide hover:text-[var(--muted-foreground)] transition-colors py-2"
              >
                Contact
              </Link>
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <Link
                href="/products/eye-drops"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-[var(--foreground)] text-white rounded-full text-sm font-medium hover:bg-black transition-all duration-300"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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

        {/* Mega Nav Dropdown */}
        <AnimatePresence>
          {shopOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 right-0 bg-white border-t border-[var(--border-light)] shadow-lg"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <div className="container py-12">
                <div className="grid lg:grid-cols-12 gap-12">
                  {/* Products Section */}
                  <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)]">
                        Our Products
                      </span>
                      <Link
                        href="/products"
                        className="text-xs font-medium text-[var(--foreground)] hover:text-[var(--muted-foreground)] flex items-center gap-1 transition-colors"
                      >
                        View All <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Eye Drops */}
                      <Link
                        href="/products/eye-drops"
                        className="group flex items-center gap-6 p-6 rounded-2xl bg-[var(--cream)] hover:bg-[var(--sand)] transition-all duration-500"
                      >
                        <div className="w-28 h-28 rounded-xl overflow-hidden bg-white shrink-0">
                          <Image
                            src={products.find(p => p.slug === 'eye-drops')?.heroImageUrl || PRODUCT_IMAGES['eye-drops']}
                            alt="Eye Drops"
                            width={112}
                            height={112}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-white rounded-full">Bestseller</span>
                          </div>
                          <h4 className="text-lg font-medium mb-2 group-hover:text-[var(--muted-foreground)] transition-colors">
                            Preservative-Free Eye Drops
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} className="w-3 h-3 fill-[var(--foreground)] text-[var(--foreground)]" />
                              ))}
                            </div>
                            <span className="text-xs text-[var(--muted-foreground)]">2,100+ reviews</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)] group-hover:translate-x-1 transition-transform" />
                      </Link>

                      {/* Eye Wipes */}
                      <Link
                        href="/products/eye-wipes"
                        className="group flex items-center gap-6 p-6 rounded-2xl bg-[var(--cream)] hover:bg-[var(--sand)] transition-all duration-500"
                      >
                        <div className="w-28 h-28 rounded-xl overflow-hidden bg-white shrink-0">
                          <Image
                            src={products.find(p => p.slug === 'eye-wipes')?.heroImageUrl || PRODUCT_IMAGES['eye-wipes']}
                            alt="Eye Wipes"
                            width={112}
                            height={112}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-white rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full" />
                              New
                            </span>
                          </div>
                          <h4 className="text-lg font-medium mb-2 group-hover:text-[var(--muted-foreground)] transition-colors">
                            Gentle Lid & Lash Wipes
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} className="w-3 h-3 fill-[var(--foreground)] text-[var(--foreground)]" />
                              ))}
                            </div>
                            <span className="text-xs text-[var(--muted-foreground)]">850+ reviews</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="lg:col-span-4">
                    <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-8 block">
                      Learn More
                    </span>
                    <ul className="space-y-4">
                      <li>
                        <Link href="/about" className="text-sm hover:text-[var(--muted-foreground)] transition-colors flex items-center gap-3">
                          <span className="w-8 h-px bg-[var(--border)]" />
                          Our Story
                        </Link>
                      </li>
                      <li>
                        <Link href="/faq" className="text-sm hover:text-[var(--muted-foreground)] transition-colors flex items-center gap-3">
                          <span className="w-8 h-px bg-[var(--border)]" />
                          Common Questions
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact" className="text-sm hover:text-[var(--muted-foreground)] transition-colors flex items-center gap-3">
                          <span className="w-8 h-px bg-[var(--border)]" />
                          Get in Touch
                        </Link>
                      </li>
                    </ul>

                    {/* Trust Badge */}
                    <div className="mt-10 p-6 rounded-2xl bg-[var(--primary-light)]">
                      <p className="text-sm font-medium mb-2">Clean Formulas</p>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                        No preservatives, phthalates, parabens, or sulfates.
                      </p>
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

      {/* Spacer for fixed header */}
      <div className={cn('transition-all duration-500', isScrolled ? 'h-[72px]' : 'h-[88px]')} />
    </>
  );
}
