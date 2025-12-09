'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
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

export function Header({ logo, products = [] }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        )}
      >
        <nav className="container">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              {logo ? (
                <Image
                  src={logo}
                  alt="Archie's Remedies"
                  width={160}
                  height={40}
                  className="h-10 w-auto"
                />
              ) : (
                <span className="text-xl font-medium tracking-tight">
                  Archie&apos;s Remedies
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {/* Shop Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShopOpen(true)}
                onMouseLeave={() => setShopOpen(false)}
              >
                <button
                  className={cn(
                    'flex items-center gap-1 text-sm font-medium tracking-wide uppercase transition-colors',
                    'hover:text-[var(--primary-dark)]'
                  )}
                >
                  Shop
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      shopOpen && 'rotate-180'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {shopOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                    >
                      <div className="bg-white rounded-2xl shadow-xl border border-[var(--border-light)] p-6 min-w-[500px]">
                        <div className="grid grid-cols-2 gap-4">
                          {products.length > 0 ? (
                            products.map((product) => (
                              <Link
                                key={product.id}
                                href={`/products/${product.slug}`}
                                className="group flex flex-col rounded-xl overflow-hidden border border-[var(--border-light)] hover:border-[var(--primary)] transition-all duration-200 hover:shadow-md"
                              >
                                <div className="aspect-square bg-[var(--muted)] relative overflow-hidden">
                                  {product.heroImageUrl ? (
                                    <Image
                                      src={product.heroImageUrl}
                                      alt={product.name}
                                      fill
                                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)]">
                                      No image
                                    </div>
                                  )}
                                </div>
                                <div className="p-4">
                                  <h3 className="font-medium text-sm">{product.name}</h3>
                                  {product.shortDescription && (
                                    <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">
                                      {product.shortDescription}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            ))
                          ) : (
                            <>
                              <Link
                                href="/products/eye-drops"
                                className="group flex flex-col rounded-xl overflow-hidden border border-[var(--border-light)] hover:border-[var(--primary)] transition-all duration-200 hover:shadow-md"
                              >
                                <div className="aspect-square bg-[var(--primary-light)] relative overflow-hidden flex items-center justify-center">
                                  <span className="text-4xl">💧</span>
                                </div>
                                <div className="p-4">
                                  <h3 className="font-medium text-sm">Eye Drops</h3>
                                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                    Preservative-free relief
                                  </p>
                                </div>
                              </Link>
                              <Link
                                href="/products/eye-wipes"
                                className="group flex flex-col rounded-xl overflow-hidden border border-[var(--border-light)] hover:border-[var(--primary)] transition-all duration-200 hover:shadow-md"
                              >
                                <div className="aspect-square bg-[var(--secondary)] relative overflow-hidden flex items-center justify-center">
                                  <span className="text-4xl">🧴</span>
                                </div>
                                <div className="p-4">
                                  <h3 className="font-medium text-sm">Eye Wipes</h3>
                                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                    Gentle daily cleansing
                                  </p>
                                </div>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/about"
                className="text-sm font-medium tracking-wide uppercase hover:text-[var(--primary-dark)] transition-colors"
              >
                About
              </Link>

              <Link
                href="/contact"
                className="text-sm font-medium tracking-wide uppercase hover:text-[var(--primary-dark)] transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-full hover:bg-[var(--muted)] transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-xl"
            >
              <div className="p-6 pt-24">
                <nav className="space-y-6">
                  <div>
                    <h3 className="text-xs font-medium tracking-widest uppercase text-[var(--muted-foreground)] mb-4">
                      Shop
                    </h3>
                    <div className="space-y-3">
                      <Link
                        href="/products/eye-drops"
                        onClick={() => setIsOpen(false)}
                        className="block text-lg font-medium hover:text-[var(--primary-dark)] transition-colors"
                      >
                        Eye Drops
                      </Link>
                      <Link
                        href="/products/eye-wipes"
                        onClick={() => setIsOpen(false)}
                        className="block text-lg font-medium hover:text-[var(--primary-dark)] transition-colors"
                      >
                        Eye Wipes
                      </Link>
                    </div>
                  </div>

                  <div className="h-px bg-[var(--border)]" />

                  <Link
                    href="/about"
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-medium hover:text-[var(--primary-dark)] transition-colors"
                  >
                    About Us
                  </Link>

                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-medium hover:text-[var(--primary-dark)] transition-colors"
                  >
                    Contact
                  </Link>

                  <Link
                    href="/faq"
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-medium hover:text-[var(--primary-dark)] transition-colors"
                  >
                    FAQ
                  </Link>
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
}
