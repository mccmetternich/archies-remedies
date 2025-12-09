'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

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

export function ProductTiles({ products, title, subtitle }: ProductTilesProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="section bg-white relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--cream)] to-transparent opacity-60" />

      <div className="container relative">
        {/* Section header - Editorial style */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20">
          <div className="max-w-xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-6"
            >
              <span className="w-12 h-px bg-[var(--foreground)]" />
              Our Products
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-balance"
            >
              {title || 'Clean Formulas for Sensitive Eyes'}
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[var(--muted-foreground)] max-w-md lg:text-right leading-relaxed"
          >
            {subtitle || 'Preservative-free eye care, crafted without the questionable ingredients.'}
          </motion.p>
        </div>

        {/* Products Grid - Magazine layout */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {products.map((product, index) => {
            const isEyeWipes = product.slug === 'eye-wipes';

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={`/products/${product.slug}`} className="group block">
                  {/* Image Container - Editorial aspect ratio */}
                  <div className="relative overflow-hidden rounded-2xl bg-[var(--cream)] aspect-[4/5] mb-8">
                    {/* Product Image */}
                    {product.heroImageUrl ? (
                      <Image
                        src={product.heroImageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--primary-light)] to-[var(--cream)]">
                        <div className="w-40 h-40 rounded-full bg-white/50" />
                      </div>
                    )}

                    {/* Minimal badge */}
                    <div className="absolute top-6 left-6">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium tracking-wide">
                        {isEyeWipes ? (
                          <>
                            <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full" />
                            New Arrival
                          </>
                        ) : (
                          <>
                            <Star className="w-3 h-3 fill-[var(--foreground)]" />
                            Bestseller
                          </>
                        )}
                      </span>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                    {/* Quick view */}
                    <div className="absolute bottom-8 left-8 right-8 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      <span className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[var(--foreground)] rounded-full text-sm font-medium shadow-2xl">
                        View Product
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Product Info - Clean & minimal */}
                  <div className="space-y-4">
                    {/* Rating */}
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[var(--foreground)] text-[var(--foreground)]" />
                        ))}
                      </div>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        4.9 ({isEyeWipes ? '847' : '1,247'})
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-normal tracking-tight group-hover:text-[var(--muted-foreground)] transition-colors duration-300">
                      {product.name}
                    </h3>

                    {/* Description */}
                    {product.shortDescription && (
                      <p className="text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-3 pt-2">
                      {product.price && (
                        <span className="text-xl font-medium">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                      {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
                        <span className="text-sm text-[var(--muted-foreground)] line-through">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Clean badge */}
                    <div className="flex items-center gap-2 pt-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span className="text-sm text-[var(--muted-foreground)]">Preservative Free</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom accent - Editorial style divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent"
        />

        {/* Trust stats - Minimal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 flex flex-wrap justify-center gap-16 text-center"
        >
          <div>
            <p className="text-4xl font-normal tracking-tight">2,500+</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">Happy Customers</p>
          </div>
          <div>
            <p className="text-4xl font-normal tracking-tight">4.9</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">Average Rating</p>
          </div>
          <div>
            <p className="text-4xl font-normal tracking-tight">98%</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">Would Recommend</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
