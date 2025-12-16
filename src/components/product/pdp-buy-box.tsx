'use client';

import React, { useState } from 'react';
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
  // New customization props
  bulletPoints?: (string | null)[];
  ctaButtonText?: string;
  ctaExternalUrl?: string | null;
  showDiscountSignup?: boolean;
  discountSignupText?: string;
}

type AccordionSection = 'ritual' | 'ingredients' | 'shipping' | null;

export function PDPBuyBox({
  product,
  variants,
  reviewCount,
  averageRating,
  onReviewsClick,
  bulletPoints,
  ctaButtonText = 'Buy Now on Amazon',
  ctaExternalUrl,
  showDiscountSignup = true,
  discountSignupText = 'Get 10% off your first order',
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

  // Determine which variant to show "Best Value" badge
  const bestValueVariant = variants.length > 1
    ? variants.reduce((best, v) => {
        if (!v.price || !best.price) return best;
        return v.price > best.price ? v : best;
      }, variants[0])
    : null;

  return (
    <div className="lg:sticky lg:top-28 space-y-6">
      {/* Reviews Summary - Click anchors to reviews section */}
      <button
        onClick={onReviewsClick}
        className="flex items-center gap-3 group"
      >
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={cn(
                'w-4 h-4',
                i <= Math.round(averageRating)
                  ? 'fill-[var(--foreground)] text-[var(--foreground)]'
                  : 'fill-transparent text-[var(--foreground)]/30'
              )}
            />
          ))}
        </div>
        <span className="text-sm text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
          {averageRating.toFixed(1)} ({reviewCount.toLocaleString()} verified reviews)
        </span>
      </button>

      {/* Editorial Title + Subtitle */}
      <div>
        <h1 className="text-3xl md:text-4xl font-normal tracking-tight leading-[1.15] mb-2">
          {product.name}
        </h1>
        {product.subtitle && (
          <p className="text-lg text-[var(--muted-foreground)]">
            {product.subtitle}
          </p>
        )}
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          {product.shortDescription}
        </p>
      )}

      {/* Bullet Points / Key Benefits */}
      {validBulletPoints.length > 0 && (
        <ul className="space-y-2">
          {validBulletPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-[var(--muted-foreground)]">{point}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Price */}
      {displayPrice && (
        <p className="text-2xl font-medium tracking-tight">
          ${displayPrice.toFixed(2)}
        </p>
      )}

      {/* Variant Tiles - Only show if more than 1 variant */}
      {variants.length > 1 && (
        <div className="space-y-3">
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[var(--muted-foreground)]">
            Select Size
          </span>
          <div className="grid grid-cols-2 gap-3">
            {variants.map((variant) => {
              const isBestValue = bestValueVariant?.id === variant.id;
              const isSelected = selectedVariant?.id === variant.id;

              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={cn(
                    'relative px-5 py-4 rounded-xl border-2 transition-all duration-200 text-left',
                    isSelected
                      ? 'border-[var(--foreground)] bg-[var(--foreground)] text-white'
                      : 'border-[var(--border)] hover:border-[var(--foreground)] bg-white'
                  )}
                >
                  {isBestValue && (
                    <span
                      className={cn(
                        'absolute -top-2.5 left-4 text-[10px] font-semibold px-2 py-0.5 rounded-full',
                        isSelected
                          ? 'bg-[var(--primary)] text-[var(--foreground)]'
                          : 'bg-[var(--primary)] text-[var(--foreground)]'
                      )}
                    >
                      Best Value
                    </span>
                  )}
                  <span className="block font-medium">{variant.name}</span>
                  {variant.price && (
                    <span
                      className={cn(
                        'text-sm',
                        isSelected ? 'text-white/70' : 'text-[var(--muted-foreground)]'
                      )}
                    >
                      ${variant.price.toFixed(2)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary CTA - Full-width */}
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
        className="group flex items-center justify-center gap-3 w-full py-4 bg-[#1a1a1a] text-white font-medium hover:bg-[#bbdae9] hover:text-[#1a1a1a] transition-all duration-300"
      >
        {ctaButtonText}
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
