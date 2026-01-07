'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, ArrowRight, Clock, Check, Mail, Phone, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackClick } from '@/lib/tracking';
import { AudioPlayer } from './audio-player';
import { formatPhoneNumber, validatePhone, validateEmail } from '@/lib/form-utils';

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
  benefitDrawers?: string | null;
}

interface BenefitDrawer {
  id: string;
  title: string;
  content: string;
  order: number;
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
  audioQuote?: string | null;
  // Signup Section
  signupSectionEnabled?: boolean;
  signupSectionTitle?: string | null;
  signupSectionSubtitle?: string | null;
  signupSectionButtonText?: string | null;
  signupSectionSuccessMessage?: string | null;
}

// Open accordion section - can be drawer ID or null
type AccordionSection = string | null;

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
  reviewBadgeBgColor,
  reviewBadgeTextColor,
  audioUrl,
  audioAvatarUrl,
  audioTitle,
  audioQuote,
  signupSectionEnabled = true,
  signupSectionTitle = 'Stay in the Loop',
  signupSectionSubtitle = 'Get exclusive offers and wellness tips',
  signupSectionButtonText = 'Sign Up',
  signupSectionSuccessMessage = "You're all set!",
}: PDPBuyBoxProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.find((v) => v.isDefault) || variants[0] || null
  );
  const [openAccordion, setOpenAccordion] = useState<AccordionSection>(null);
  const [showNewsletterInput, setShowNewsletterInput] = useState(false);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Bottom signup form state
  const [signupContactType, setSignupContactType] = useState<'email' | 'phone'>('email');
  const [signupContactValue, setSignupContactValue] = useState('');
  const [signupStatus, setSignupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [signupValidationError, setSignupValidationError] = useState('');

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

  // Phone/email validation functions imported from @/lib/form-utils
  // Note: using validateEmail as validateEmailAddress for consistency
  const validateEmailAddress = validateEmail;

  // Signup form handlers
  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (signupContactType === 'phone') {
      setSignupContactValue(formatPhoneNumber(value));
    } else {
      setSignupContactValue(value);
    }
    setSignupValidationError('');
    if (signupStatus === 'error') setSignupStatus('idle');
  };

  const toggleSignupContactType = (type: 'email' | 'phone') => {
    setSignupContactType(type);
    setSignupContactValue('');
    setSignupValidationError('');
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on type
    if (signupContactType === 'phone') {
      const error = validatePhone(signupContactValue);
      if (error || !signupContactValue) {
        setSignupValidationError(error || 'Phone number is required');
        return;
      }
    } else {
      const error = validateEmailAddress(signupContactValue);
      if (error || !signupContactValue) {
        setSignupValidationError(error || 'Email is required');
        return;
      }
    }

    setSignupStatus('loading');

    try {
      // Use unified contacts API for CRM integration
      const body = signupContactType === 'phone'
        ? { phone: signupContactValue.replace(/\D/g, ''), source: 'product_page' }
        : { email: signupContactValue, source: 'product_page' };

      const res = await fetch('/api/contacts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSignupStatus('success');
        setSignupContactValue('');
        setTimeout(() => {
          setSignupStatus('idle');
        }, 3000);
      } else {
        setSignupStatus('error');
      }
    } catch {
      setSignupStatus('error');
    }
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
              'w-4 h-4',
              i <= Math.round(averageRating)
                ? 'fill-[var(--primary)] text-[var(--primary)]'
                : 'fill-transparent text-[var(--primary)]/30'
            )}
          />
        ))}
      </div>
      <span className="text-[11px] md:text-sm text-[var(--foreground)] font-medium transition-colors">
        {reviewCount.toLocaleString()} Verified Reviews
      </span>
      {reviewBadge && (
        <span
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
          style={{
            backgroundColor: reviewBadgeBgColor || 'var(--primary)',
            color: reviewBadgeTextColor || 'var(--foreground)',
          }}
        >
          {reviewBadgeEmoji && <span>{reviewBadgeEmoji}</span>}
          {reviewBadge}
        </span>
      )}
    </button>
  );

  return (
    <div className="lg:sticky lg:top-28 space-y-4">
      {/* Title & Subtitle - tight leading, unified typography */}
      <div className="space-y-0">
        <h1
          className="uppercase leading-tight !text-[32px] md:!text-[33px] !font-bold !tracking-[-0.01em]"
        >
          {product.name}
        </h1>
        {product.subtitle && (
          <p className="text-[16px] md:text-[17px] font-medium uppercase text-[var(--foreground)] tracking-[-0.01em]">
            {product.subtitle}
          </p>
        )}
      </div>

      {/* Reviews - 10px gap from subtitle on desktop */}
      <ReviewsDisplay className="-mt-1 lg:mt-[10px]" />

      {/* Horizontal Rule - 5px extra gap above on desktop */}
      <div className="h-px bg-[var(--primary)] lg:mt-[5px]" />

      {/* Short Description - 5px extra gap above on desktop */}
      {product.shortDescription && (
        <p className="text-[13px] md:text-base text-[var(--foreground)] leading-relaxed max-w-[95%] md:max-w-[85%] lg:mt-[5px]">
          {product.shortDescription}
        </p>
      )}

      {/* Bullet Points - 15% smaller on mobile, dark gray checkmarks */}
      {validBulletPoints.length > 0 && (
        <ul className="space-y-1.5 md:space-y-2 -mt-1 lg:mb-[20px]">
          {validBulletPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 md:gap-3">
              <Check className="w-4 h-4 md:w-5 md:h-5 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0 stroke-[2.5]" />
              <span className="text-[13px] md:text-base text-[var(--foreground)]">{point}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Variant Tiles - radio buttons, dark gray borders, all caps CTA font */}
      {variants.length > 0 && (
        <div className="lg:mt-[15px]">
          <span className="block text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-[var(--foreground)]">
            Choose Size
          </span>
          <div className={cn('grid gap-2 md:gap-3 mt-3 md:mt-[15px] lg:mt-[20px]', getVariantGridCols())}>
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;

              return (
                <button
                  key={variant.id}
                  onClick={() => handleVariantSelect(variant)}
                  className="relative flex flex-col items-center justify-center p-3 md:p-4 transition-all duration-200 text-center bg-white border border-[var(--border)]"
                >
                  {/* Radio Button - top left */}
                  <div className="absolute top-2 left-2 w-4 h-4 rounded-full border border-[var(--muted-foreground)] flex items-center justify-center">
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                    )}
                  </div>

                  {/* Variant Badge */}
                  {variant.badge && (
                    <span
                      className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        backgroundColor: variant.badgeBgColor || 'var(--primary)',
                        color: variant.badgeTextColor || 'var(--foreground)',
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
                    className="block font-medium text-[11px] md:text-sm text-[var(--foreground)] uppercase tracking-wide lg:tracking-wider"
                  >
                    {variant.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary CTA - 10px extra gap above on desktop */}
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
        className="pdp-cta-button group flex items-center justify-center gap-2 md:gap-3 w-full py-4 md:py-5 text-[11px] md:text-[13px] font-medium uppercase tracking-[0.04em] lg:mt-[25px]"
      >
        {ctaButtonText}
        {displayPrice && (
          <span className="font-semibold">- ${Math.round(displayPrice)}</span>
        )}
        <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
      </a>

      {/* Audio Player - between CTA and newsletter */}
      {audioUrl && (
        <div className="pt-3">
          <AudioPlayer
            audioUrl={audioUrl}
            avatarUrl={audioAvatarUrl}
            title={audioTitle}
            quote={audioQuote}
          />
        </div>
      )}

      {/* Newsletter */}
      {showDiscountSignup && (
        <div className="text-center">
          {!showNewsletterInput ? (
            <button
              onClick={() => setShowNewsletterInput(true)}
              className="text-[8px] md:text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-2"
            >
              <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
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
                className="pdp-cta-button px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium transition-colors disabled:opacity-50"
              >
                {emailStatus === 'loading' ? '...' : emailStatus === 'success' ? <Check className="w-4 h-4" /> : 'Join'}
              </button>
            </motion.form>
          )}
        </div>
      )}

      {/* Accordion Drawers - wider on mobile (10px from edges) */}
      <div className="pt-4 md:pt-6 space-y-0 -mx-[6px] md:mx-0">
        {(() => {
          // Try to use new benefitDrawers JSON format
          let drawers: BenefitDrawer[] = [];

          if (product.benefitDrawers) {
            try {
              drawers = JSON.parse(product.benefitDrawers);
            } catch {
              drawers = [];
            }
          }

          // If no drawers from JSON, fall back to legacy fields
          if (drawers.length === 0) {
            const legacyDrawers: BenefitDrawer[] = [];
            if (product.ritualContent) {
              legacyDrawers.push({
                id: 'ritual',
                title: product.ritualTitle || 'The Ritual',
                content: product.ritualContent,
                order: 0,
              });
            }
            if (product.ingredientsContent) {
              legacyDrawers.push({
                id: 'ingredients',
                title: product.ingredientsTitle || 'Ingredients',
                content: product.ingredientsContent,
                order: 1,
              });
            }
            if (product.shippingContent) {
              legacyDrawers.push({
                id: 'shipping',
                title: product.shippingTitle || 'Good to Know',
                content: product.shippingContent,
                order: 2,
              });
            }
            drawers = legacyDrawers;
          }

          // Filter out drawers with no content and sort by order
          const validDrawers = drawers
            .filter((d) => d.content && d.content.trim())
            .sort((a, b) => a.order - b.order);

          return validDrawers.map((drawer, index) => (
            <AccordionItem
              key={drawer.id}
              title={drawer.title || `Drawer ${index + 1}`}
              content={drawer.content}
              isOpen={openAccordion === drawer.id}
              onToggle={() => toggleAccordion(drawer.id)}
              isFirst={index === 0}
            />
          ));
        })()}
      </div>

      {/* Email/SMS Signup Section - Inline toggle + input + submit */}
      {signupSectionEnabled && (
      <div className="pt-6 md:pt-8 lg:pt-[22px]">
        {/* Title and Subtitle */}
        <div className="mb-3">
          <span className="block text-[11px] md:text-[12px] font-semibold text-[var(--foreground)] uppercase leading-tight tracking-[0.02em]">
            {signupSectionTitle}
          </span>
          <span className="block text-[10px] md:text-[11px] text-[var(--muted-foreground)] leading-tight mt-0.5 tracking-[0.01em]">
            {signupSectionSubtitle}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {signupStatus === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[44px] bg-[var(--primary)]/20 border border-[var(--primary)]/40 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-[var(--foreground)]" />
              <span className="text-[11px] text-[var(--foreground)] font-medium uppercase tracking-wide">
                {signupSectionSuccessMessage}
              </span>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSignupSubmit}
              className="flex items-stretch h-[44px] border border-[var(--border)]"
            >
              {/* Toggle: Email/Phone - blue when selected */}
              <div className="flex">
                <button
                  type="button"
                  onClick={() => toggleSignupContactType('email')}
                  className={cn(
                    'px-3 flex items-center justify-center transition-colors',
                    signupContactType === 'email'
                      ? 'bg-[var(--primary)] text-[var(--foreground)]'
                      : 'bg-[var(--cream)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--stone)]'
                  )}
                  title="Email"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleSignupContactType('phone')}
                  className={cn(
                    'px-3 flex items-center justify-center transition-colors border-r border-[var(--border)]',
                    signupContactType === 'phone'
                      ? 'bg-[var(--primary)] text-[var(--foreground)]'
                      : 'bg-[var(--cream)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--stone)]'
                  )}
                  title="Phone"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
              {/* Input */}
              <input
                type={signupContactType === 'email' ? 'email' : 'tel'}
                inputMode={signupContactType === 'email' ? 'email' : 'tel'}
                value={signupContactValue}
                onChange={handleSignupInputChange}
                placeholder={signupContactType === 'email' ? 'Enter your email' : 'Enter phone #'}
                autoComplete={signupContactType === 'email' ? 'email' : 'tel'}
                className="flex-1 min-w-0 bg-[var(--cream)] text-[var(--foreground)] px-4 text-[12px] focus:outline-none placeholder:text-gray-400"
              />
              {/* Submit - blue hover */}
              <button
                type="submit"
                disabled={signupStatus === 'loading'}
                className="pdp-cta-button px-5 font-medium text-[11px] uppercase tracking-[0.04em] transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
              >
                {signupStatus === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Submit
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Validation error */}
        <AnimatePresence>
          {(signupValidationError || signupStatus === 'error') && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[10px] text-center text-[var(--muted-foreground)] mt-2"
            >
              {signupValidationError || 'Something went wrong. Please try again.'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      )}
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
      "border-b border-[var(--primary)]",
      isFirst && "border-t border-t-[var(--primary)]"
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 md:py-2.5 text-left px-[6px] md:px-0"
      >
        <span className="font-medium text-[11px] md:text-[13px] uppercase tracking-[0.04em]">{title}</span>
        <ChevronRight
          className={cn(
            'w-4 h-4 md:w-5 md:h-5 text-[var(--muted-foreground)] stroke-[2.5] transition-transform duration-300',
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
              className="pb-2 md:pb-3 px-[6px] md:px-0 text-[10px] md:text-[12px] text-[var(--muted-foreground)] leading-relaxed tracking-[0.02em]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
