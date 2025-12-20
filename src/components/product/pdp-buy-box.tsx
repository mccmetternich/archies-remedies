'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, ArrowRight, Clock, Check, Mail, Phone, ChevronDown, Loader2 } from 'lucide-react';
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
  audioQuote?: string | null;
  // Signup Section
  signupSectionEnabled?: boolean;
  signupSectionTitle?: string | null;
  signupSectionSubtitle?: string | null;
  signupSectionButtonText?: string | null;
  signupSectionSuccessMessage?: string | null;
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
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signupContactType, setSignupContactType] = useState<'email' | 'phone'>('email');
  const [signupContactValue, setSignupContactValue] = useState('');
  const [signupDropdownOpen, setSignupDropdownOpen] = useState(false);
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

  // Phone formatting
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 10);
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
  };

  // Validation functions
  const validatePhone = (value: string): string | null => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return null;
    if (digits.length !== 10) return 'Please enter a valid phone number';
    return null;
  };

  const validateEmailAddress = (value: string): string | null => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email';
    return null;
  };

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
    setSignupDropdownOpen(false);
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
          setShowSignupForm(false);
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
    <div className="lg:sticky lg:top-28 space-y-4">
      {/* Title & Subtitle - tight leading, unified typography */}
      <div className="space-y-0">
        <h1
          className="uppercase leading-tight"
          style={{
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '25px',
            fontWeight: 700,
            letterSpacing: '0.01em'
          }}
        >
          {product.name}
        </h1>
        {product.subtitle && (
          <p className="text-[13px] md:text-[14px] font-bold uppercase text-[#1a1a1a] tracking-[0.04em]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            {product.subtitle}
          </p>
        )}
      </div>

      {/* Reviews - 10px gap from subtitle on desktop */}
      <ReviewsDisplay className="-mt-1 lg:mt-[10px]" />

      {/* Horizontal Rule - 5px extra gap above on desktop */}
      <div className="h-px bg-[#bbdae9] lg:mt-[5px]" />

      {/* Short Description - 5px extra gap above on desktop */}
      {product.shortDescription && (
        <p className="text-[13px] md:text-base text-[#1a1a1a] leading-relaxed max-w-[95%] md:max-w-[85%] lg:mt-[5px]">
          {product.shortDescription}
        </p>
      )}

      {/* Bullet Points - 15% smaller on mobile, dark gray checkmarks */}
      {validBulletPoints.length > 0 && (
        <ul className="space-y-1.5 md:space-y-2 -mt-1 lg:mb-[20px]">
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
        <div className="lg:mt-[15px]">
          <span className="block text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-[#1a1a1a]">
            Choose Size
          </span>
          <div className={cn('grid gap-2 md:gap-3 mt-3 md:mt-[15px] lg:mt-[20px]', getVariantGridCols())}>
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
                    className="block font-medium text-[11px] md:text-sm text-[#1a1a1a] uppercase tracking-wide lg:tracking-wider"
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
        className="pdp-cta-button group flex items-center justify-center gap-2 md:gap-3 w-full py-[28px] md:py-5 text-[11px] md:text-[13px] font-medium uppercase tracking-[0.04em] lg:mt-[25px]"
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
                className="px-4 md:px-5 py-2 md:py-2.5 bg-[#1a1a1a] text-white text-xs md:text-sm font-medium hover:bg-[#bbdae9] hover:text-[#1a1a1a] transition-colors disabled:opacity-50"
              >
                {emailStatus === 'loading' ? '...' : emailStatus === 'success' ? <Check className="w-4 h-4" /> : 'Join'}
              </button>
            </motion.form>
          )}
        </div>
      )}

      {/* Accordion Drawers - wider on mobile (10px from edges) */}
      <div className="pt-4 md:pt-6 space-y-0 -mx-[6px] md:mx-0">
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

      {/* Email/SMS Signup Section */}
      {signupSectionEnabled && (
      <div className="pt-6 md:pt-8 lg:pt-[22px]">
        <AnimatePresence mode="wait">
          {signupStatus === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#bbdae9]/20 border border-[#bbdae9]/40 rounded-full">
                <Check className="w-4 h-4 text-[#1a1a1a]" />
                <span className="text-[12px] text-[#1a1a1a]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  {signupSectionSuccessMessage} Check your {signupContactType === 'phone' ? 'phone' : 'inbox'}.
                </span>
              </div>
            </motion.div>
          ) : !showSignupForm ? (
            <motion.div
              key="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-4"
            >
              {/* Left: Title and Subtitle - tight, left-aligned */}
              <div className="flex-1 min-w-0">
                <span
                  className="block text-[11px] md:text-[12px] font-semibold text-[#1a1a1a] uppercase leading-tight"
                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '0.02em' }}
                >
                  {signupSectionTitle}
                </span>
                <span
                  className="block text-[10px] md:text-[11px] text-[#666666] leading-tight mt-0.5"
                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '0.01em' }}
                >
                  {signupSectionSubtitle}
                </span>
              </div>
              {/* Right: Wide button */}
              <button
                onClick={() => setShowSignupForm(true)}
                className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-[#f5f5f0] border border-[#e0e0e0] font-semibold text-[#1a1a1a] uppercase hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontSize: '11px', letterSpacing: '0.04em' }}
              >
                <Mail className="w-3.5 h-3.5" />
                {signupSectionButtonText}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <form onSubmit={handleSignupSubmit} className="space-y-3">
                {/* Input with dropdown */}
                <div className="relative">
                  {/* Dropdown selector */}
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10">
                    <button
                      type="button"
                      onClick={() => setSignupDropdownOpen(!signupDropdownOpen)}
                      className="flex items-center gap-1 px-2 py-1.5 text-gray-500 hover:text-gray-700 transition-colors rounded hover:bg-gray-100"
                    >
                      {signupContactType === 'email' ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <Phone className="w-4 h-4" />
                      )}
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>

                    <AnimatePresence>
                      {signupDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px] z-20"
                        >
                          <button
                            type="button"
                            onClick={() => toggleSignupContactType('email')}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 text-[11px] text-left hover:bg-gray-50 transition-colors',
                              signupContactType === 'email' ? 'text-[#1a1a1a] font-medium' : 'text-gray-600'
                            )}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Email
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSignupContactType('phone')}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 text-[11px] text-left hover:bg-gray-50 transition-colors',
                              signupContactType === 'phone' ? 'text-[#1a1a1a] font-medium' : 'text-gray-600'
                            )}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Phone
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Input field */}
                  <input
                    type={signupContactType === 'email' ? 'email' : 'tel'}
                    inputMode={signupContactType === 'email' ? 'email' : 'tel'}
                    value={signupContactValue}
                    onChange={handleSignupInputChange}
                    placeholder={signupContactType === 'email' ? 'Enter your email' : 'Enter phone #'}
                    autoComplete={signupContactType === 'email' ? 'email' : 'tel'}
                    className={cn(
                      'w-full pl-16 pr-4 py-3 text-[12px] bg-[#f5f5f0] border focus:outline-none focus:ring-2 focus:ring-[#bbdae9] focus:border-[#bbdae9] placeholder:text-gray-400',
                      signupValidationError ? 'border-[#bbdae9]' : 'border-gray-300'
                    )}
                  />
                </div>

                {/* Validation error */}
                <AnimatePresence>
                  {(signupValidationError || signupStatus === 'error') && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[10px] text-center text-[#666666]"
                    >
                      {signupValidationError || 'Something went wrong. Please try again.'}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={signupStatus === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] text-white text-[11px] font-medium uppercase tracking-[0.04em] hover:bg-[#bbdae9] hover:text-[#1a1a1a] transition-colors disabled:opacity-50"
                >
                  {signupStatus === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Cancel link */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSignupForm(false);
                    setSignupContactValue('');
                    setSignupValidationError('');
                  }}
                  className="w-full text-[10px] text-[#666666] hover:text-[#1a1a1a] transition-colors"
                >
                  Cancel
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click outside to close dropdown */}
        {signupDropdownOpen && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setSignupDropdownOpen(false)}
          />
        )}
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
      "border-b border-[#bbdae9]",
      isFirst && "border-t border-t-[#bbdae9]"
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 md:py-2.5 text-left px-[6px] md:px-0"
      >
        <span className="font-medium text-[11px] md:text-[13px] uppercase tracking-[0.04em]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>{title}</span>
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
              className="pb-2 md:pb-3 px-[6px] md:px-0 text-[10px] md:text-[12px] text-[var(--muted-foreground)] leading-relaxed tracking-[0.02em]"
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
