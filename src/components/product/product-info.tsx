'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Check, Truck, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductVariant {
  id: string;
  name: string;
  price: number | null;
  compareAtPrice: number | null;
  amazonUrl: string;
  isDefault: boolean | null;
}

interface Product {
  id: string;
  name: string;
  shortDescription: string | null;
  price: number | null;
  compareAtPrice: number | null;
}

interface ProductInfoProps {
  product: Product;
  variants: ProductVariant[];
}

export function ProductInfo({ product, variants }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.find((v) => v.isDefault) || variants[0] || null
  );

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayComparePrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const amazonUrl = selectedVariant?.amazonUrl || '#';

  const savings = displayComparePrice && displayPrice
    ? ((displayComparePrice - displayPrice) / displayComparePrice * 100).toFixed(0)
    : null;

  return (
    <div className="py-4 lg:py-8">
      {/* Badge */}
      <div className="flex items-center gap-3 mb-4">
        <span className="badge">Bestseller</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-sm text-[var(--muted-foreground)] ml-1">
            4.8 (1,200+ reviews)
          </span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-light mb-4">{product.name}</h1>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-lg text-[var(--muted-foreground)] mb-6">
          {product.shortDescription}
        </p>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-6">
        {displayPrice && (
          <span className="text-3xl font-medium">${displayPrice.toFixed(2)}</span>
        )}
        {displayComparePrice && displayPrice && displayComparePrice > displayPrice && (
          <>
            <span className="text-xl text-[var(--muted-foreground)] line-through">
              ${displayComparePrice.toFixed(2)}
            </span>
            <span className="badge bg-green-100 text-green-800">
              Save {savings}%
            </span>
          </>
        )}
      </div>

      {/* Variants */}
      {variants.length > 1 && (
        <div className="mb-8">
          <label className="block text-sm font-medium mb-3">Select Size</label>
          <div className="flex flex-wrap gap-3">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={cn(
                  'px-6 py-3 rounded-xl border-2 transition-all duration-200 text-left',
                  selectedVariant?.id === variant.id
                    ? 'border-[var(--foreground)] bg-[var(--foreground)] text-white'
                    : 'border-[var(--border)] hover:border-[var(--primary)]'
                )}
              >
                <span className="block font-medium">{variant.name}</span>
                {variant.price && (
                  <span className="text-sm opacity-80">${variant.price.toFixed(2)}</span>
                )}
                {variant.isDefault && (
                  <span className="ml-2 text-xs bg-[var(--primary)] text-[var(--foreground)] px-2 py-0.5 rounded-full">
                    Best Value
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Single variant display */}
      {variants.length === 1 && (
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--muted)] rounded-lg">
            <Check className="w-4 h-4 text-green-600" />
            <span className="font-medium">{variants[0].name}</span>
          </div>
        </div>
      )}

      {/* Buy Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button size="xl" className="w-full">
            Buy Now on Amazon
          </Button>
        </a>
        <p className="text-center text-sm text-[var(--muted-foreground)] mt-3">
          Opens in a new tab • Secure checkout on Amazon
        </p>
      </motion.div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-[var(--border)]">
        <div className="text-center">
          <Truck className="w-6 h-6 mx-auto mb-2 text-[var(--primary-dark)]" />
          <p className="text-xs text-[var(--muted-foreground)]">Free Prime Shipping</p>
        </div>
        <div className="text-center">
          <Shield className="w-6 h-6 mx-auto mb-2 text-[var(--primary-dark)]" />
          <p className="text-xs text-[var(--muted-foreground)]">100% Clean Formula</p>
        </div>
        <div className="text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-[var(--primary-dark)]" />
          <p className="text-xs text-[var(--muted-foreground)]">8 Hour Relief</p>
        </div>
      </div>

      {/* Quick benefits list */}
      <div className="mt-8 space-y-3">
        {[
          'Preservative-free single-use vials',
          'Safe for all ages',
          'Instant, long-lasting comfort',
          'No phthalates, parabens, or sulfates',
        ].map((benefit) => (
          <div key={benefit} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-[var(--primary-light)] flex items-center justify-center shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <span className="text-sm">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
