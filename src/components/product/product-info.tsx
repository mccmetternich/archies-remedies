'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Check, Truck, Shield, Clock, Heart, Sparkles, BadgeCheck, Droplets, Eye, Users, RefreshCw } from 'lucide-react';
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

// Avatar images for social proof
const AVATAR_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face',
];

const BENEFITS = [
  {
    icon: Droplets,
    text: 'Preservative-free single-use vials',
  },
  {
    icon: Users,
    text: 'Safe for all ages',
  },
  {
    icon: Clock,
    text: 'Instant, long-lasting comfort',
  },
  {
    icon: Shield,
    text: 'No phthalates, parabens, or sulfates',
  },
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
    <div className="py-6 lg:py-12">
      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="badge badge-bestseller">
          <Sparkles className="w-3 h-3" />
          Bestseller
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-sm font-medium">4.9</span>
          <span className="text-sm text-[var(--muted-foreground)]">(1,247 reviews)</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 tracking-tight">{product.name}</h1>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-lg md:text-xl text-[var(--muted-foreground)] mb-8 leading-relaxed">
          {product.shortDescription}
        </p>
      )}

      {/* Social Proof */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-[var(--primary-light)] rounded-2xl">
        <div className="flex -space-x-3">
          {AVATAR_IMAGES.map((src, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full border-3 border-white overflow-hidden ring-2 ring-[var(--primary-light)]"
            >
              <Image
                src={src}
                alt="Customer"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm font-medium">Join 2,500+ happy customers</p>
          <p className="text-xs text-[var(--muted-foreground)]">who trust Archie&apos;s for their eye care</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--border)] mb-8" />

      {/* Price */}
      <div className="flex items-baseline gap-4 mb-8">
        {displayPrice && (
          <span className="text-4xl md:text-5xl font-light">${displayPrice.toFixed(2)}</span>
        )}
        {displayComparePrice && displayPrice && displayComparePrice > displayPrice && (
          <div className="flex items-center gap-3">
            <span className="text-xl text-[var(--muted-foreground)] line-through">
              ${displayComparePrice.toFixed(2)}
            </span>
            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              Save {savings}%
            </span>
          </div>
        )}
      </div>

      {/* Variants */}
      {variants.length > 1 && (
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-medium mb-4">
            <span>Select Size</span>
            <span className="text-[var(--muted-foreground)]">—</span>
            <span className="text-[var(--primary-dark)]">{selectedVariant?.name}</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={cn(
                  'relative px-6 py-4 rounded-2xl border-2 transition-all duration-300 text-left group overflow-hidden',
                  selectedVariant?.id === variant.id
                    ? 'border-[var(--foreground)] bg-[var(--foreground)] text-white shadow-lg'
                    : 'border-[var(--border)] hover:border-[var(--primary)] bg-white'
                )}
              >
                {variant.isDefault && (
                  <span className={cn(
                    "absolute top-0 right-0 text-[10px] font-semibold px-2 py-0.5 rounded-bl-lg",
                    selectedVariant?.id === variant.id
                      ? "bg-[var(--primary)] text-[var(--foreground)]"
                      : "bg-[var(--primary-light)] text-[var(--foreground)]"
                  )}>
                    BEST VALUE
                  </span>
                )}
                <span className="block font-medium text-lg">{variant.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  {variant.price && (
                    <span className={cn(
                      "text-sm",
                      selectedVariant?.id === variant.id ? "text-white/80" : "text-[var(--muted-foreground)]"
                    )}>
                      ${variant.price.toFixed(2)}
                    </span>
                  )}
                  {variant.isDefault && (
                    <span className={cn(
                      "text-xs",
                      selectedVariant?.id === variant.id ? "text-[var(--primary)]" : "text-[var(--primary-dark)]"
                    )}>
                      • Most Popular
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Single variant display */}
      {variants.length === 1 && (
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-[var(--muted)] rounded-xl">
            <Check className="w-5 h-5 text-green-600" />
            <span className="font-medium">{variants[0].name}</span>
            <span className="text-[var(--muted-foreground)]">•</span>
            <span className="text-[var(--muted-foreground)]">In Stock</span>
          </div>
        </div>
      )}

      {/* Buy Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button size="xl" className="w-full text-base py-6">
            Buy Now on Amazon
          </Button>
        </a>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            Secure checkout
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4" />
            Free Prime shipping
          </span>
        </div>
      </motion.div>

      {/* Trust Badges - Horizontal */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-[var(--secondary)] rounded-2xl mb-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Truck className="w-6 h-6 text-[var(--primary-dark)]" />
          </div>
          <p className="text-sm font-medium">Free Shipping</p>
          <p className="text-xs text-[var(--muted-foreground)]">With Prime</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Shield className="w-6 h-6 text-[var(--primary-dark)]" />
          </div>
          <p className="text-sm font-medium">Clean Formula</p>
          <p className="text-xs text-[var(--muted-foreground)]">100% Safe</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Clock className="w-6 h-6 text-[var(--primary-dark)]" />
          </div>
          <p className="text-sm font-medium">8 Hour Relief</p>
          <p className="text-xs text-[var(--muted-foreground)]">Long-lasting</p>
        </div>
      </div>

      {/* Benefits List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Why You&apos;ll Love It
        </h3>
        {BENEFITS.map((benefit, index) => (
          <motion.div
            key={benefit.text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[var(--border-light)] hover:border-[var(--primary)] hover:shadow-sm transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center shrink-0">
              <benefit.icon className="w-5 h-5 text-[var(--primary-dark)]" />
            </div>
            <span className="text-[15px]">{benefit.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Mini Testimonial */}
      <div className="mt-8 p-6 bg-[var(--muted)] rounded-2xl">
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-[15px] text-[var(--foreground)] mb-4 italic">
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
            <p className="text-sm font-medium flex items-center gap-1.5">
              Sarah M.
              <BadgeCheck className="w-4 h-4 text-[var(--primary-dark)]" />
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">Verified Purchase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
