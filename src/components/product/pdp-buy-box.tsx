'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, ArrowRight, Mail, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackClick } from '@/lib/tracking';
import { AudioPlayer } from './audio-player';

interface ProductVariant {
  id: string;
  name: string;
  price: number | null;
  compareAtPrice: number | null;
  amazonUrl: string;
  isDefault: boolean | null;
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
  bulletPoints?: (string | null)[];
  ctaButtonText?: string;
  ctaExternalUrl?: string | null;
  showDiscountSignup?: boolean;
  discountSignupText?: string;
  reviewBadge?: string | null;
  reviewBadgeEmoji?: string | null;
  reviewBadgeBgColor?: string | null;
  reviewBadgeTextColor?: string | null;
  audioUrl?: string | null;
  audioAvatarUrl?: string | null;
  audioTitle?: string | null;
}

type AccordionSection = 'ritual' | 'ingredients' | 'shipping' | null;

export function PDPBuyBox({
  product,
  variants,
  reviewCount,
  averageRating,
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
  audioUrl,
  audioAvatarUrl,
  audioTitle,
}: PDPBuyBoxProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.find((v) => v.isDefault) || variants[0] || null
  );
  const [openAccordion, setOpenAccordion] = useState<AccordionSection>(null);
  const [showNewsletterInput, setShowNewsletterInput] = useState(false);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const displayPrice = selectedVariant?.price ?? product.price;
  const amazonUrl = ctaExternalUrl || selectedVariant?.amazonUrl || '#';
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

  const getVariantGridCols = () => {
    if (variants.length === 4) return 'grid-cols-2';
    if (variants.length <= 3) return 'grid-cols-3';
    return 'grid-cols-3';
  };

  // Scroll to reviews/testimonials section
  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews') || document.getElementById('testimonials');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reviews component - reusable for different positions
  const ReviewsDisplay = ({ className = '' }: { className?: string }) => (
    <button
      onClick={scrollToReviews}
      className={cn('flex items-center gap-2 md:gap-3 group flex-wrap', className)}
    >
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              'w-3 h-3 md:w-4 md:h-4',
              i <= Math.round(averageRating)
                ? 'fill-[#bbdae9] text-[#bbdae9]'
                : 'fill-transparent text-[#bbdae9]/30'
            )}
          />
        ))}
      </div>
      <span className="text-[11px] md:text-sm text-[#1a1a1a] font-normal transition-colors">
        {reviewCount.toLocaleString()} Verified Reviews
      </span>
      {reviewBadge && (
        <span
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
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
  );

  return (
    <div className="lg:sticky lg:top-28 space-y-4 md:space-y-5 px-[15px] md:px-0">
      {/* Desktop: Reviews first */}
      <div className="hidden md:block">
        <ReviewsDisplay />
      </div>

      {/* Title - same font weight as subline, tight gap between */}
      <div className="md:space-y-1" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h1
          className="font-semibold uppercase leading-tight"
          style={{ letterSpacing: '-0.01em' }}
        >
          <span className="md:hidden" style={{ fontSize: '21px' }}>{product.name}</span>
          <span className="hidden md:inline text-xs">{product.name}</span>
        </h1>
        {product.subtitle && (
          <p
            className="font-semibold uppercase text-[#1a1a1a]"
            style={{ letterSpacing: '-0.01em' }}
          >
            <span className="md:hidden text-xs">{product.subtitle}</span>
            <span className="hidden md:inline text-xs">{product.subtitle}</span>
          </p>
        )}
      </div>

      {/* Mobile: Reviews under title */}
      <div className="md:hidden">
        <ReviewsDisplay />
      </div>

      {/* Mobile: Hex separator after reviews - edge-to-edge */}
      <div className="md:hidden h-px bg-[#bbdae9] -mx-[15px]" />

      {/* Short Description - 15% smaller on mobile */}
      {product.shortDescription && (
        <p className="text-[13px] md:text-base text-[#1a1a1a] leading-relaxed max-w-[95%] md:max-w-[85%]">
          {product.shortDescription}
        </p>
      )}

      {/* Bullet Points - 15% smaller on mobile, dark gray checkmarks */}
      {validBulletPoints.length > 0 && (
        <ul className="space-y-1.5 md:space-y-2 -mt-1">
          {validBulletPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 md:gap-3">
              <Check className="w-4 h-4 md:w-5 md:h-5 text-[#666666] mt-0.5 flex-shrink-0 stroke-[2.5]" />
              <span className="text-[13px] md:text-base text-[#1a1a1a]">{point}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Variant Tiles - radio buttons, dark gray borders, all caps CTA font */}
      {variants.length > 0 && (
        <div className="space-y-3 md:space-y-[15px]">
          <span className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-[#1a1a1a]">
            Choose Size
          </span>
          <div className={cn('grid gap-2 md:gap-3', getVariantGridCols())}>
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;

              return (
                <button
                  key={variant.id}
                  onClick={() => handleVariantSelect(variant)}
                  className="relative flex flex-col items-center justify-center p-3 md:p-4 transition-all duration-200 text-center bg-white border border-[#d0d0d0]"
                >
                  {/* Radio Button - top left */}
                  <div className="absolute top-2 left-2 w-4 h-4 rounded-full border border-[#999999] flex items-center justify-center">
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#bbdae9]" />
                    )}
                  </div>

                  {/* Variant Badge */}
                  {variant.badge && (
                    <span
                      className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        backgroundColor: variant.badgeBgColor || '#bbdae9',
                        color: variant.badgeTextColor || '#1a1a1a',
                      }}
                    >
                      {variant.badge}
                    </span>
                  )}

                  {/* Variant Thumbnail */}
                  {variant.thumbnailUrl && (
                    <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 relative mb-1 md:mb-2">
                      <Image
                        src={variant.thumbnailUrl}
                        alt={variant.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Variant Name - All caps, CTA font style */}
                  <span
                    className="block font-medium text-[11px] md:text-sm text-[#1a1a1a] uppercase tracking-wider"
                  >
                    {variant.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary CTA - edge-to-edge and taller on mobile */}
      <a
        href={amazonUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          trackClick({
            destinationUrl: amazonUrl,
            productId: product.id,
            productSlug: product.slug,
          });
          setTimeout(() => {
            window.open(amazonUrl, '_blank', 'noopener,noreferrer');
          }, 100);
        }}
        className="pdp-cta-button group flex items-center justify-center gap-2 md:gap-3 w-[calc(100%+30px)] md:w-full -mx-[15px] md:mx-0 py-4 md:py-4 text-xs md:text-sm font-medium uppercase tracking-wider transition-all duration-300"
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
        <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
      </a>

      {/* Newsletter */}
      {showDiscountSignup && (
        <div className="text-center">
          {!showNewsletterInput ? (
            <button
              onClick={() => setShowNewsletterInput(true)}
              className="text-[11px] md:text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
                className="flex-1 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
                required
              />
              <button
                type="submit"
                disabled={emailStatus === 'loading'}
                className="px-4 md:px-5 py-2 md:py-2.5 bg-[#1a1a1a] text-white text-xs md:text-sm font-medium hover:bg-[#bbdae9] hover:text-[#1a1a1a] transition-colors disabled:opacity-50"
              >
                {emailStatus === 'loading' ? '...' : emailStatus === 'success' ? <Check className="w-4 h-4" /> : 'Join'}
              </button>
            </motion.form>
          )}
        </div>
      )}

      {/* Audio Player */}
      {audioUrl && (
        <div className="pt-2">
          <AudioPlayer
            audioUrl={audioUrl}
            avatarUrl={audioAvatarUrl}
            title={audioTitle}
          />
        </div>
      )}

      {/* Accordion Drawers - edge-to-edge on mobile */}
      <div className="pt-4 md:pt-6 space-y-0 -mx-[15px] md:mx-0">
        {product.ritualContent && (
          <AccordionItem
            title={product.ritualTitle || 'The Ritual'}
            content={product.ritualContent}
            isOpen={openAccordion === 'ritual'}
            onToggle={() => toggleAccordion('ritual')}
            isFirst
          />
        )}

        {product.ingredientsContent && (
          <AccordionItem
            title={product.ingredientsTitle || 'Ingredients'}
            content={product.ingredientsContent}
            isOpen={openAccordion === 'ingredients'}
            onToggle={() => toggleAccordion('ingredients')}
          />
        )}

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
  isFirst?: boolean;
}

function AccordionItem({ title, content, isOpen, onToggle, isFirst }: AccordionItemProps) {
  return (
    <div className={cn(
      "border-b border-[#bbdae9]",
      isFirst && "border-t border-t-[#bbdae9]"
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 md:py-5 text-left px-[15px] md:px-0"
      >
        <span className="font-semibold text-xs md:text-sm uppercase tracking-wider">{title}</span>
        <ChevronRight
          className={cn(
            'w-4 h-4 md:w-5 md:h-5 text-[#4a4a4a] stroke-[2.5] transition-transform duration-300',
            isOpen && 'rotate-90'
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
              className="pb-4 md:pb-6 px-[15px] md:px-0 text-xs md:text-sm text-[var(--muted-foreground)] leading-relaxed prose prose-sm"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
