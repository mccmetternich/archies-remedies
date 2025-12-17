'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  heroImageUrl: string | null;
  secondaryImageUrl?: string | null;
  price: number | null;
  compareAtPrice: number | null;
  badge?: string | null;
  badgeEmoji?: string | null;
  rotatingBadgeEnabled?: boolean | null;
  rotatingBadgeText?: string | null;
}

interface ProductTilesProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

// Rotating badge component
function RotatingBadge({ text }: { text: string }) {
  const repeatedText = Array(8).fill(text).join(' • ');

  return (
    <div className="absolute -top-3 -right-3 w-24 h-24 z-20">
      <div className="relative w-full h-full">
        {/* Circle background */}
        <div className="absolute inset-0 bg-[var(--primary)] rounded-full" />

        {/* Rotating text */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full animate-spin-slow"
        >
          <defs>
            <path
              id="circlePath"
              d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
            />
          </defs>
          <text
            className="text-[10px] font-bold uppercase tracking-[0.15em] fill-[var(--foreground)]"
          >
            <textPath href="#circlePath" startOffset="0%">
              {repeatedText}
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
}

export function ProductTiles({ products, title, subtitle }: ProductTilesProps) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  return (
    <section className="section bg-white relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--cream)] to-transparent opacity-60" />

      <div className="container relative">
        {/* Section header - Editorial style */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-6">
              <span className="w-12 h-px bg-[var(--foreground)]" />
              Our Products
            </span>
            <h2 className="text-balance">
              {title || 'Clean Formulas for Sensitive Eyes'}
            </h2>
          </div>
          <p className="text-lg text-[var(--muted-foreground)] max-w-md lg:text-right leading-relaxed">
            {subtitle || 'Preservative-free eye care, crafted without the questionable ingredients.'}
          </p>
        </div>

        {/* Products Grid - Magazine layout */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {products.map((product) => {
            const isHovered = hoveredProduct === product.id;
            const showSecondaryImage = isHovered && product.secondaryImageUrl;

            return (
              <div key={product.id}>
                <Link
                  href={`/products/${product.slug}`}
                  className="group block"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Image Container - Editorial aspect ratio */}
                  <div className="relative overflow-hidden bg-[var(--cream)] aspect-[4/5] mb-8">
                    {/* Main Product Image */}
                    {product.heroImageUrl && (
                      <Image
                        src={product.heroImageUrl}
                        alt={product.name}
                        fill
                        className={`object-cover transition-all duration-500 ease-out ${
                          showSecondaryImage ? 'opacity-0 scale-105' : 'opacity-100 group-hover:scale-[1.03]'
                        }`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    )}

                    {/* Secondary (Rollover) Image */}
                    {product.secondaryImageUrl && (
                      <Image
                        src={product.secondaryImageUrl}
                        alt={`${product.name} - alternate view`}
                        fill
                        className={`object-cover transition-all duration-500 ease-out ${
                          showSecondaryImage ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    )}

                    {/* Fallback if no image */}
                    {!product.heroImageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--primary-light)] to-[var(--cream)]">
                        <div className="w-40 h-40 rounded-full bg-white/50" />
                      </div>
                    )}

                    {/* Badge - 2x bigger */}
                    {product.badge && (
                      <div className="absolute top-6 left-6 z-10">
                        <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-sm text-sm font-semibold tracking-wide shadow-lg">
                          {product.badgeEmoji && <span className="text-base">{product.badgeEmoji}</span>}
                          {product.badge}
                        </span>
                      </div>
                    )}

                    {/* Rotating "NEW" badge */}
                    {product.rotatingBadgeEnabled && product.rotatingBadgeText && (
                      <RotatingBadge text={product.rotatingBadgeText} />
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Quick view */}
                    <div className="absolute bottom-8 left-8 right-8 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <span className="inline-flex items-center gap-3 px-7 py-4 bg-white text-[var(--foreground)] text-sm font-medium uppercase tracking-wider shadow-2xl">
                        View Product
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Product Info - Clean & minimal */}
                  <div className="space-y-4">
                    {/* Rating - Now above title, bigger stars, blue color */}
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-5 h-5 fill-[var(--primary)] text-[var(--primary)]" />
                        ))}
                      </div>
                      <span className="text-base font-medium text-[var(--foreground)]">
                        4.9 ({product.slug === 'eye-wipes' ? '847' : '2,100'} reviews)
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

                    {/* Shop Now Button */}
                    <div className="pt-4">
                      <span className="inline-flex items-center gap-3 px-7 py-4 bg-[var(--foreground)] text-white text-sm font-medium uppercase tracking-wider hover:bg-[var(--primary)] hover:text-[var(--foreground)] transition-all duration-300 shadow-md group-hover:shadow-lg">
                        Shop Now
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bottom accent - Editorial style divider */}
        <div className="mt-24 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

        {/* Trust stats - Minimal */}
        <div className="mt-16 flex flex-wrap justify-center gap-16 text-center">
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
        </div>
      </div>
    </section>
  );
}
