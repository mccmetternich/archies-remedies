'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Star, Sparkles, Shield, Droplets } from 'lucide-react';

interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  heroImageUrl: string | null;
  price: number | null;
  compareAtPrice: number | null;
}

interface ProductTilesProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

// Placeholder images for products
const PLACEHOLDER_IMAGES: Record<string, string> = {
  'eye-drops': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop',
  'eye-wipes': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop',
};

export function ProductTiles({ products, title, subtitle }: ProductTilesProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container">
        {/* Section Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--primary-dark)] mb-4 block">
              Our Products
            </span>
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">{title}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {products.map((product, index) => {
            const isEyeWipes = product.slug === 'eye-wipes';

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--primary-light)] to-[var(--secondary)] aspect-[4/3] mb-8">
                    {/* NEW Badge for Eye Wipes */}
                    {isEyeWipes && (
                      <div className="absolute top-6 left-6 z-20">
                        <span className="badge badge-new px-4 py-2 text-sm shadow-lg">
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          NEW
                        </span>
                      </div>
                    )}

                    {/* Bestseller Badge for Eye Drops */}
                    {!isEyeWipes && (
                      <div className="absolute top-6 left-6 z-20">
                        <span className="badge badge-bestseller px-4 py-2 text-sm shadow-lg">
                          <Star className="w-3.5 h-3.5 mr-1" />
                          Bestseller
                        </span>
                      </div>
                    )}

                    {/* Product Image */}
                    {(product.heroImageUrl || PLACEHOLDER_IMAGES[product.slug]) ? (
                      <Image
                        src={product.heroImageUrl || PLACEHOLDER_IMAGES[product.slug]}
                        alt={product.name}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-[10rem] opacity-30">
                          {product.slug === 'eye-drops' ? '💧' : '🧴'}
                        </div>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Quick View Button */}
                    <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <div className="flex items-center justify-center gap-2 py-4 bg-white/95 backdrop-blur-sm rounded-2xl font-medium shadow-xl">
                        View Product
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="px-2">
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-sm font-medium">4.9</span>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        ({isEyeWipes ? '847' : '1,247'} reviews)
                      </span>
                    </div>

                    {/* Title & Price */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-2xl font-light group-hover:text-[var(--primary-dark)] transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex flex-col items-end shrink-0">
                        {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
                          <span className="text-sm text-[var(--muted-foreground)] line-through">
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                        {product.price && (
                          <span className="text-xl font-medium">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {product.shortDescription && (
                      <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
                        {product.shortDescription}
                      </p>
                    )}

                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                        <Shield className="w-4 h-4 text-[var(--primary-dark)]" />
                        Preservative-Free
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                        <Droplets className="w-4 h-4 text-[var(--primary-dark)]" />
                        Clean Formula
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 p-8 bg-[var(--primary-light)] rounded-3xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Clean Eye Care Promise</h3>
                <p className="text-sm text-[var(--muted-foreground)]">No preservatives, phthalates, parabens, or sulfates</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-light">2,500+</p>
                <p className="text-xs text-[var(--muted-foreground)]">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-light">4.9★</p>
                <p className="text-xs text-[var(--muted-foreground)]">Average Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-light">98%</p>
                <p className="text-xs text-[var(--muted-foreground)]">Would Recommend</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
