'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Check, Truck, Shield, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackClick } from '@/lib/tracking';

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
  slug: string;
  name: string;
  shortDescription: string | null;
  price: number | null;
  compareAtPrice: number | null;
}

interface ProductInfoProps {
  product: Product;
  variants: ProductVariant[];
}

// Avatar images for social proof
const AVATAR_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face',
];

const BENEFITS = [
  'Preservative-free single-use vials',
  'Safe for all ages & contact lens wearers',
  'Instant, long-lasting comfort',
  'No phthalates, parabens, or sulfates',
];

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
    <div className="py-8 lg:py-16">
      {/* Rating & Reviews */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-4 h-4 fill-[var(--foreground)] text-[var(--foreground)]" />
          ))}
        </div>
        <span className="text-sm text-[var(--muted-foreground)]">4.9 (1,247 reviews)</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-normal mb-6 tracking-tight leading-[1.1]">
        {product.name}
      </h1>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-lg text-[var(--muted-foreground)] mb-10 leading-relaxed max-w-lg">
          {product.shortDescription}
        </p>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-4 mb-8">
        {displayPrice && (
          <span className="text-4xl font-normal tracking-tight">${displayPrice.toFixed(2)}</span>
        )}
        {displayComparePrice && displayPrice && displayComparePrice > displayPrice && (
          <>
            <span className="text-lg text-[var(--muted-foreground)] line-through">
              ${displayComparePrice.toFixed(2)}
            </span>
            <span className="px-3 py-1 bg-[var(--foreground)] text-white rounded-full text-xs font-medium">
              Save {savings}%
            </span>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--border)] mb-8" />

      {/* Variants */}
      {variants.length > 1 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)]">
              Select Size
            </span>
            <span className="text-sm">{selectedVariant?.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={cn(
                  'relative px-6 py-5 rounded-2xl border-2 transition-all duration-300 text-left',
                  selectedVariant?.id === variant.id
                    ? 'border-[var(--foreground)] bg-[var(--foreground)] text-white'
                    : 'border-[var(--border)] hover:border-[var(--foreground)] bg-white'
                )}
              >
                {variant.isDefault && (
                  <span className={cn(
                    "absolute top-0 right-0 text-[10px] font-semibold px-3 py-1 rounded-bl-xl rounded-tr-xl",
                    selectedVariant?.id === variant.id
                      ? "bg-[var(--primary)] text-[var(--foreground)]"
                      : "bg-[var(--cream)] text-[var(--foreground)]"
                  )}>
                    Popular
                  </span>
                )}
                <span className="block font-medium text-lg">{variant.name}</span>
                {variant.price && (
                  <span className={cn(
                    "text-sm mt-1 block",
                    selectedVariant?.id === variant.id ? "text-white/70" : "text-[var(--muted-foreground)]"
                  )}>
                    ${variant.price.toFixed(2)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Single variant display */}
      {variants.length === 1 && (
        <div className="mb-10">
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-[var(--cream)] rounded-full">
            <Check className="w-4 h-4 text-[var(--foreground)]" />
            <span className="text-sm font-medium">{variants[0].name}</span>
            <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]" />
            <span className="text-sm text-[var(--muted-foreground)]">In Stock</span>
          </div>
        </div>
      )}

      {/* Buy Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            // Track the click
            trackClick({
              destinationUrl: amazonUrl,
              productId: product.id,
              productSlug: product.slug,
            });
            // Open in new tab after small delay to ensure tracking
            setTimeout(() => {
              window.open(amazonUrl, '_blank', 'noopener,noreferrer');
            }, 100);
          }}
          className="group flex items-center justify-center gap-3 w-full py-5 bg-[var(--foreground)] text-white rounded-full font-medium hover:bg-black transition-all duration-300"
        >
          Buy Now on Amazon
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </a>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-[var(--muted-foreground)]">
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Secure
          </span>
          <span className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Free Prime Shipping
          </span>
        </div>
      </motion.div>

      {/* Benefits List - Clean */}
      <div className="space-y-3 mb-10">
        {BENEFITS.map((benefit, index) => (
          <motion.div
            key={benefit}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-center gap-3"
          >
            <span className="w-5 h-5 rounded-full bg-[var(--primary-light)] flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[var(--foreground)]" />
            </span>
            <span className="text-sm text-[var(--muted-foreground)]">{benefit}</span>
          </motion.div>
        ))}
      </div>

      {/* Trust Strip */}
      <div className="flex items-center gap-8 py-6 border-t border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--cream)] flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Free Shipping</p>
            <p className="text-xs text-[var(--muted-foreground)]">With Prime</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--cream)] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium">8hr Relief</p>
            <p className="text-xs text-[var(--muted-foreground)]">Long-lasting</p>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="mt-8 flex items-center gap-4">
        <div className="flex -space-x-2">
          {AVATAR_IMAGES.map((src, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full border-2 border-white overflow-hidden"
            >
              <Image
                src={src}
                alt="Customer"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          Trusted by <span className="font-medium text-[var(--foreground)]">2,500+</span> customers
        </p>
      </div>

      {/* Mini Testimonial */}
      <div className="mt-8 p-6 bg-[var(--cream)] rounded-2xl">
        <div className="flex gap-0.5 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-[var(--foreground)] text-[var(--foreground)]" />
          ))}
        </div>
        <p className="text-[var(--foreground)] leading-relaxed mb-4">
          &ldquo;Finally found eye drops that actually work without any irritation. I use them every day and my dry eyes have never felt better!&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={AVATAR_IMAGES[0]}
              alt="Customer"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-medium">Sarah M.</p>
            <p className="text-xs text-[var(--muted-foreground)]">Verified Purchase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
