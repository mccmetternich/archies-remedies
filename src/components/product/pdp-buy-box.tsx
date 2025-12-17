'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronDown, ArrowRight, Mail, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackClick } from '@/lib/tracking';

interface ProductVariant {
  id: string;
  name: string;
  price: number | null;
  compareAtPrice: number | null;
  amazonUrl: string;
  isDefault: boolean | null;
  // Variant thumbnail and badge
  thumbnailUrl?: string | null;
  badge?: string | null;
  badgeBgColor?: string | null;
  badgeTextColor?: string | null;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  shortDescription: string | null;
  price: number | null;
  compareAtPrice: number | null;
  ritualTitle: string | null;
  ritualContent: string | null;
  ingredientsTitle: string | null;
  ingredientsContent: string | null;
  shippingTitle: string | null;
  shippingContent: string | null;
}

interface PDPBuyBoxProps {
  product: Product;
  variants: ProductVariant[];
  reviewCount: number;
  averageRating: number;
  onReviewsClick?: () => void;
  onVariantChange?: (variant: ProductVariant) => void;
  // Customization props
  bulletPoints?: (string | null)[];
  ctaButtonText?: string;
  ctaExternalUrl?: string | null;
  showDiscountSignup?: boolean;
  discountSignupText?: string;
  // Review badge props
  reviewBadge?: string | null;
  reviewBadgeEmoji?: string | null;
  reviewBadgeBgColor?: string | null;
  reviewBadgeTextColor?: string | null;
}

type AccordionSection = 'ritual' | 'ingredients' | 'shipping' | null;

export function PDPBuyBox({
  product,
  variants,
  reviewCount,
  averageRating,
  onReviewsClick,
  onVariantChange,
  bulletPoints,
  ctaButtonText = 'Buy Now on Amazon',
  ctaExternalUrl,
  showDiscountSignup = true,
  discountSignupText = 'Get 10% off your first order',
  reviewBadge,
  reviewBadgeEmoji,
  reviewBadgeBgColor = '#bbdae9',
  reviewBadgeTextColor = '#1a1a1a',
}: PDPBuyBoxProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.find((v) => v.isDefault) || variants[0] || null
  );
  const [openAccordion, setOpenAccordion] = useState<AccordionSection>(null);
  const [showNewsletterInput, setShowNewsletterInput] = useState(false);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const displayPrice = selectedVariant?.price ?? product.price;
  // Use ctaExternalUrl if provided, otherwise fall back to variant's amazon URL
  const amazonUrl = ctaExternalUrl || selectedVariant?.amazonUrl || '#';

  // Filter bullet points to only non-null/non-empty values
  const validBulletPoints = bulletPoints?.filter((bp): bp is string => Boolean(bp)) || [];

  const toggleAccordion = (section: AccordionSection) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    onVariantChange?.(variant);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setEmailStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'pdp' }),
      });
      if (res.ok) {
        setEmailStatus('success');
        setEmail('');
        setTimeout(() => {
          setEmailStatus('idle');
          setShowNewsletterInput(false);
        }, 3000);
      }
    } catch {
      setEmailStatus('idle');
    }
  };

  // Determine grid layout for variants
  const getVariantGridCols = () => {
    if (variants.length === 4) return 'grid-cols-2'; // 2x2 for 4 variants
    if (variants.length <= 3) return 'grid-cols-3'; // 3 per row for 1-3
    return 'grid-cols-3'; // Default to 3 per row
  };

  return (
    <div className="lg:sticky lg:top-28 space-y-5">
      {/* Reviews Summary - Blue stars, bold rating, dot separator, badge */}
      <button
        onClick={onReviewsClick}
        className="flex items-center gap-3 group flex-wrap"
      >
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={cn(
                'w-4 h-4',
                i <= Math.round(averageRating)
                  ? 'fill-[#bbdae9] text-[#bbdae9]'
                  : 'fill-transparent text-[#bbdae9]/30'
              )}
            />
          ))}
        </div>
        <span className="text-sm text-[#1a1a1a] transition-colors">
          <span className="font-semibold">{averageRating.toFixed(1)}</span>
          <span className="mx-2 text-[#1a1a1a] text-base font-bold">•</span>
          <span className="font-semibold">{reviewCount.toLocaleString()} verified reviews</span>
        </span>
        {reviewBadge && (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
            style={{
              backgroundColor: reviewBadgeBgColor || '#bbdae9',
              color: reviewBadgeTextColor || '#1a1a1a',
            }}
          >
            {reviewBadgeEmoji && <span>{reviewBadgeEmoji}</span>}
            {reviewBadge}
          </span>
        )}
      </button>

      {/* Editorial Title - Reduced by ~30% */}
      <div>
        <h1 className="text-2xl md:text-[28px] font-normal tracking-tight leading-[1.15]">
          {product.name}
        </h1>
      </div>

      {/* Short Description - Same size as bullets, black text */}
      {product.shortDescription && (
        <p className="text-base text-[#1a1a1a] leading-relaxed max-w-[85%]">
          {product.shortDescription}
        </p>
      )}

      {/* Bullet Points / Key Benefits - Same size as description, black text */}
      {validBulletPoints.length > 0 && (
        <ul className="space-y-2 -mt-1">
          {validBulletPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#bbdae9] mt-0.5 flex-shrink-0 stroke-[2.5]" />
              <span className="text-base text-[#1a1a1a]">{point}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Variant Tiles - Show if variants exist */}
      {variants.length > 0 && (
        <div className="space-y-[15px]">
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#1a1a1a]">
            Choose Size
          </span>
          <div className={cn('grid gap-3', getVariantGridCols())}>
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;

              return (
                <button
                  key={variant.id}
                  onClick={() => handleVariantSelect(variant)}
                  className={cn(
                    'relative flex flex-col items-center justify-center p-4 transition-all duration-200 text-center bg-white',
                    isSelected
                      ? 'border-[3px] border-[#bbdae9]'
                      : 'border-2 border-[#d1d5db] hover:border-[#bbdae9]'
                  )}
                >
                  {/* Variant Badge */}
                  {variant.badge && (
                    <span
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        backgroundColor: variant.badgeBgColor || '#bbdae9',
                        color: variant.badgeTextColor || '#1a1a1a',
                      }}
                    >
                      {variant.badge}
                    </span>
                  )}

                  {/* Variant Thumbnail - 2x size */}
                  {variant.thumbnailUrl && (
                    <div className="w-32 h-32 md:w-40 md:h-40 relative mb-2">
                      <Image
                        src={variant.thumbnailUrl}
                        alt={variant.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Variant Name - Bold */}
                  <span className="block font-bold text-sm text-[#1a1a1a]">{variant.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary CTA - White text with inline styles to prevent overrides */}
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
        className="pdp-cta-button group flex items-center justify-center gap-3 w-full py-4 font-medium transition-all duration-300"
        style={{
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#bbdae9';
          e.currentTarget.style.color = '#1a1a1a';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1a1a1a';
          e.currentTarget.style.color = '#ffffff';
        }}
      >
        {ctaButtonText}
        {displayPrice && (
          <span className="font-semibold">- ${displayPrice.toFixed(2)}</span>
        )}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </a>

      {/* Newsletter Injection - Only show if enabled */}
      {showDiscountSignup && (
        <div className="text-center">
          {!showNewsletterInput ? (
            <button
              onClick={() => setShowNewsletterInput(true)}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {discountSignupText}
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleNewsletterSubmit}
              className="flex gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 text-sm border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
                required
              />
              <button
                type="submit"
                disabled={emailStatus === 'loading'}
                className="px-5 py-2.5 bg-[#1a1a1a] text-white text-sm font-medium hover:bg-[#bbdae9] hover:text-[#1a1a1a] transition-colors disabled:opacity-50"
              >
                {emailStatus === 'loading' ? '...' : emailStatus === 'success' ? <Check className="w-4 h-4" /> : 'Join'}
              </button>
            </motion.form>
          )}
        </div>
      )}

      {/* Accordion Drawers */}
      <div className="border-t border-[var(--border)] pt-6 space-y-0">
        {/* The Ritual */}
        {product.ritualContent && (
          <AccordionItem
            title={product.ritualTitle || 'The Ritual'}
            content={product.ritualContent}
            isOpen={openAccordion === 'ritual'}
            onToggle={() => toggleAccordion('ritual')}
          />
        )}

        {/* Ingredients */}
        {product.ingredientsContent && (
          <AccordionItem
            title={product.ingredientsTitle || 'Ingredients'}
            content={product.ingredientsContent}
            isOpen={openAccordion === 'ingredients'}
            onToggle={() => toggleAccordion('ingredients')}
          />
        )}

        {/* Good to Know */}
        {product.shippingContent && (
          <AccordionItem
            title={product.shippingTitle || 'Good to Know'}
            content={product.shippingContent}
            isOpen={openAccordion === 'shipping'}
            onToggle={() => toggleAccordion('shipping')}
          />
        )}
      </div>
    </div>
  );
}

interface AccordionItemProps {
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ title, content, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-[var(--border)]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-[var(--muted-foreground)] transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div
              className="pb-6 text-sm text-[var(--muted-foreground)] leading-relaxed prose prose-sm"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
