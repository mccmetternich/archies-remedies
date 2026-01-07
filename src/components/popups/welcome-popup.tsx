'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Download, Check, Loader2, Mail, Phone, ChevronDown, Star } from 'lucide-react';
import { usePopup } from './popup-provider';
import { PopupRotatingBadge } from './shared/popup-rotating-badge';
import { usePopupForm } from '@/hooks/use-popup-form';
import { getEffectivePopupMedia } from '@/lib/popup-utils';

interface WelcomePopupProps {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  imageUrl?: string | null; // Legacy
  videoUrl?: string | null; // Legacy
  videoThumbnailUrl?: string | null;
  // Form state media (desktop/mobile)
  formDesktopImageUrl?: string | null;
  formDesktopVideoUrl?: string | null;
  formMobileImageUrl?: string | null;
  formMobileVideoUrl?: string | null;
  // Success state media (desktop/mobile)
  successDesktopImageUrl?: string | null;
  successDesktopVideoUrl?: string | null;
  successMobileImageUrl?: string | null;
  successMobileVideoUrl?: string | null;
  delay?: number;
  dismissDays?: number;
  sessionOnly?: boolean;
  sessionExpiryHours?: number;
  ctaType?: 'email' | 'sms' | 'both' | 'download' | 'none';
  downloadEnabled?: boolean;
  downloadFileUrl?: string | null;
  downloadFileName?: string | null;
  downloadText?: string | null;
  successTitle?: string;
  successMessage?: string;
  noSpamText?: string;
  // Testimonial bubble
  testimonialEnabled?: boolean;
  testimonialEnabledDesktop?: boolean;
  testimonialEnabledMobile?: boolean;
  testimonialQuote?: string | null;
  testimonialAuthor?: string | null;
  testimonialAvatarUrl?: string | null;
  testimonialStars?: number;
  // Success view links
  successLink1Text?: string | null;
  successLink1Url?: string | null;
  successLink2Text?: string | null;
  successLink2Url?: string | null;
  // Rotating badges (desktop only)
  formBadgeUrl?: string | null;
  successBadgeUrl?: string | null;
}

export function WelcomePopup({
  enabled = true,
  title = 'Join the Clean Eye Care Movement',
  subtitle = 'Get 10% off your first order plus exclusive access to new products and wellness tips.',
  buttonText = 'Get My 10% Off',
  imageUrl,
  videoUrl,
  videoThumbnailUrl,
  // Form state media (desktop/mobile)
  formDesktopImageUrl,
  formDesktopVideoUrl,
  formMobileImageUrl,
  formMobileVideoUrl,
  // Success state media (desktop/mobile)
  successDesktopImageUrl,
  successDesktopVideoUrl,
  successMobileImageUrl,
  successMobileVideoUrl,
  delay = 3000,
  dismissDays = 7,
  sessionOnly = true,
  sessionExpiryHours = 24,
  ctaType = 'email',
  downloadEnabled = false,
  downloadFileUrl,
  downloadFileName,
  downloadText = 'Download starts on submission',
  successTitle = "You're In!",
  successMessage,
  noSpamText = 'No spam, ever. Unsubscribe anytime.',
  // Testimonial bubble
  testimonialEnabled = false,
  testimonialEnabledDesktop = true,
  testimonialEnabledMobile = true,
  testimonialQuote,
  testimonialAuthor,
  testimonialAvatarUrl,
  testimonialStars = 5,
  // Success view links
  successLink1Text,
  successLink1Url,
  successLink2Text,
  successLink2Url,
  // Rotating badges (desktop only)
  formBadgeUrl,
  successBadgeUrl,
}: WelcomePopupProps) {
  const {
    canShowWelcomePopup,
    dismissWelcomePopup,
    setActivePopup,
    trackPopupView,
    trackPopupDismiss,
    submitEmail,
    submitPhone,
    setPopupSubmitted,
  } = usePopup();

  const [isOpen, setIsOpen] = useState(false);

  // Close handler for the form hook
  const handlePopupClose = useCallback(() => {
    setIsOpen(false);
    setActivePopup(null);
  }, [setActivePopup]);

  // Use shared popup form hook for all form logic
  const {
    contactValue,
    contactType,
    showDropdown,
    validationError,
    status,
    isSuccessState,
    handleInputChange,
    handleBlur,
    toggleContactType,
    setShowDropdown,
    handleFormSubmit,
    handleDownloadOnly,
  } = usePopupForm({
    ctaType: ctaType || 'email',
    downloadEnabled,
    downloadFileUrl,
    downloadFileName,
    popupType: 'welcome',
    popupId: null,
    submitEmail,
    submitPhone,
    setPopupSubmitted,
    onClose: handlePopupClose,
  });

  // Track if we've already attempted to show the popup this session
  const [hasAttemptedShow, setHasAttemptedShow] = useState(false);

  useEffect(() => {
    if (!enabled || hasAttemptedShow) return;

    const timer = setTimeout(() => {
      if (canShowWelcomePopup({ sessionOnly, sessionExpiryHours, dismissDays })) {
        setIsOpen(true);
        setActivePopup('welcome');
        trackPopupView(null, 'welcome');
      }
      setHasAttemptedShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, delay, dismissDays, sessionOnly, sessionExpiryHours, canShowWelcomePopup, setActivePopup, trackPopupView, hasAttemptedShow]);

  const handleClose = () => {
    setIsOpen(false);
    setActivePopup(null);
    dismissWelcomePopup();
    trackPopupDismiss(null, 'welcome');
  };

  if (!enabled) return null;

  // Calculate effective media URLs based on state using shared utility
  const {
    desktopVideoUrl: effectiveDesktopVideoUrl,
    desktopImageUrl: effectiveDesktopImageUrl,
    mobileVideoUrl: effectiveMobileVideoUrl,
    mobileImageUrl: effectiveMobileImageUrl,
    hasDesktopVideo,
    hasMobileVideo,
  } = getEffectivePopupMedia({
    imageUrl,
    videoUrl,
    formDesktopImageUrl,
    formDesktopVideoUrl,
    formMobileImageUrl,
    formMobileVideoUrl,
    successDesktopImageUrl,
    successDesktopVideoUrl,
    successMobileImageUrl,
    successMobileVideoUrl,
  }, isSuccessState);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal - Desktop: side-by-side, Mobile: stacked */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'opacity, transform' }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[94%] max-w-md md:max-w-4xl max-h-[90vh] overflow-y-auto md:overflow-hidden"
          >
            <div className="bg-[var(--background)] overflow-hidden shadow-2xl md:flex md:h-[480px]">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors border border-gray-200/50 shadow-sm"
                aria-label="Close popup"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              {/* Media Section - Left side on desktop, top on mobile */}
              <div className="relative md:w-1/2 md:h-full md:flex-1">
                <div className="relative aspect-[4/3] md:aspect-auto md:h-full w-full bg-gradient-to-br from-[#f5f0eb] via-white to-[var(--primary)]/30 overflow-hidden">
                  {/* Desktop Media */}
                  <div className="hidden md:block absolute inset-0">
                    {hasDesktopVideo && effectiveDesktopVideoUrl ? (
                      <video
                        src={effectiveDesktopVideoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover object-center"
                      />
                    ) : effectiveDesktopImageUrl ? (
                      <Image
                        src={effectiveDesktopImageUrl}
                        alt=""
                        fill
                        className="object-cover object-center"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400">
                          Archie&apos;s Remedies
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mobile Media */}
                  <div className="md:hidden absolute inset-0">
                    {hasMobileVideo && effectiveMobileVideoUrl ? (
                      <video
                        src={effectiveMobileVideoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover object-center"
                      />
                    ) : effectiveMobileImageUrl ? (
                      <Image
                        src={effectiveMobileImageUrl}
                        alt=""
                        fill
                        className="object-cover object-center"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400">
                          Archie&apos;s Remedies
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Testimonial Bubble */}
                    {testimonialEnabled && testimonialQuote && (
                      <>
                        {/* Desktop testimonial - only show if desktop enabled */}
                        {testimonialEnabledDesktop && (
                          <div className="hidden md:flex absolute bottom-4 left-4 right-4 justify-center">
                            <div className="inline-flex bg-white/98 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg ring-1 ring-black/[0.03] max-w-full">
                              <div className="flex items-center gap-3.5">
                                {testimonialAvatarUrl ? (
                                  <Image
                                    src={testimonialAvatarUrl}
                                    alt={testimonialAuthor || 'Reviewer'}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)]/40 to-[var(--primary)]/20 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm">
                                    <span className="text-base font-semibold text-[var(--foreground)]">
                                      {(testimonialAuthor || 'A')[0]}
                                    </span>
                                  </div>
                                )}
                                <div className="min-w-0">
                                  {/* Author name + stars on same row */}
                                  <div className="flex items-center gap-2 mb-1">
                                    {testimonialAuthor && (
                                      <span className="text-sm font-semibold text-[var(--foreground)]">{testimonialAuthor}</span>
                                    )}
                                    <div className="flex items-center gap-0.5">
                                      {[...Array(testimonialStars)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-[var(--primary)] text-[var(--primary)]" />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-[13px] text-gray-600 leading-snug">
                                    {testimonialQuote}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Mobile testimonial - only show if mobile enabled (sized up ~25%) */}
                        {testimonialEnabledMobile && (
                          <div className="md:hidden absolute bottom-2 left-0 right-0 flex justify-center px-3">
                            <div className="inline-flex bg-white/98 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg ring-1 ring-black/[0.03] max-w-full">
                              <div className="flex items-center gap-2">
                                {testimonialAvatarUrl ? (
                                  <Image
                                    src={testimonialAvatarUrl}
                                    alt={testimonialAuthor || 'Reviewer'}
                                    width={36}
                                    height={36}
                                    className="rounded-full object-cover flex-shrink-0 ring-1 ring-white shadow-sm w-9 h-9"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)]/40 to-[var(--primary)]/20 flex items-center justify-center flex-shrink-0 ring-1 ring-white shadow-sm">
                                    <span className="text-xs font-semibold text-[var(--foreground)]">
                                      {(testimonialAuthor || 'A')[0]}
                                    </span>
                                  </div>
                                )}
                                <div className="min-w-0">
                                  {/* Author name + stars on same row */}
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    {testimonialAuthor && (
                                      <span className="text-xs font-semibold text-[var(--foreground)]">{testimonialAuthor}</span>
                                    )}
                                    <div className="flex items-center gap-0.5">
                                      {[...Array(testimonialStars)].map((_, i) => (
                                        <Star key={i} className="w-2.5 h-2.5 fill-[var(--primary)] text-[var(--primary)]" />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-[13px] text-gray-600 leading-snug line-clamp-2">
                                    {testimonialQuote}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                </div>
              </div>

              {/* Content Section - Right side on desktop, bottom on mobile */}
              <div className="relative p-6 md:p-8 md:w-1/2 md:flex md:flex-col md:justify-center">
                {/* Rotating Badge - Desktop only */}
                <PopupRotatingBadge
                  badgeUrl={isSuccessState ? successBadgeUrl : formBadgeUrl}
                />

                {isSuccessState ? (
                  <div className="py-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-6 h-6 text-[var(--foreground)]" strokeWidth={3} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-normal tracking-tight text-[var(--foreground)]">
                        {successTitle}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-base leading-relaxed mb-4">
                      {successMessage || (
                        <>
                          {ctaType === 'email' && 'Check your email for your discount code.'}
                          {ctaType === 'sms' && 'Check your phone for your discount code.'}
                          {ctaType === 'both' && (contactType === 'phone' ? 'Check your phone for your discount code.' : 'Check your email for your discount code.')}
                          {ctaType === 'download' && 'Your download should start automatically.'}
                          {ctaType === 'none' && 'Thank you!'}
                        </>
                      )}
                    </p>

                    {/* Download status indicator */}
                    {downloadEnabled && downloadFileUrl && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        {status === 'downloading' ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
                            <span className="text-sm text-gray-600">Downloading...</span>
                          </>
                        ) : status === 'downloaded' ? (
                          <>
                            <div className="w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-sm text-gray-600">Download complete!</span>
                          </>
                        ) : null}
                      </div>
                    )}

                    {/* Success Links */}
                    {(successLink1Text || successLink2Text) && (
                      <div className="mt-6 space-y-2 max-w-xs mx-auto">
                        {successLink1Text && successLink1Url && (
                          <a
                            href={successLink1Url}
                            className="block text-center px-5 py-2.5 bg-[var(--foreground)] text-white font-medium text-sm hover:bg-[var(--primary)] hover:text-[var(--foreground)] transition-colors"
                          >
                            {successLink1Text}
                          </a>
                        )}
                        {successLink2Text && successLink2Url && (
                          <a
                            href={successLink2Url}
                            className="block text-center px-5 py-2.5 border border-gray-300 text-gray-700 font-medium text-sm hover:border-[var(--foreground)] hover:text-[var(--foreground)] transition-colors"
                          >
                            {successLink2Text}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl md:text-3xl font-normal mb-3 tracking-tight text-center text-[var(--foreground)]">
                      {title}
                    </h3>
                    <p className="text-gray-600 mb-4 md:mb-6 text-center text-base leading-relaxed">
                      {subtitle}
                    </p>

                    {/* Form based on CTA type */}
                    {ctaType !== 'none' && ctaType !== 'download' && (
                      <form onSubmit={handleFormSubmit} className="space-y-3">
                        {/* Both: Dropdown toggle between phone/email (Coming Soon style) */}
                        {ctaType === 'both' && (
                          <div className="relative">
                            {/* Dropdown selector */}
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                              <button
                                type="button"
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-1 px-2 py-2 text-gray-500 active:text-gray-700 hover:text-gray-700 transition-colors rounded-lg active:bg-gray-200 hover:bg-gray-200"
                              >
                                {contactType === 'email' ? (
                                  <Mail className="w-5 h-5" />
                                ) : (
                                  <Phone className="w-5 h-5" />
                                )}
                                <ChevronDown className="w-3 h-3" />
                              </button>

                              <AnimatePresence>
                                {showDropdown && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[130px] z-20"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => toggleContactType('phone')}
                                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left active:bg-gray-50 hover:bg-gray-50 transition-colors ${
                                        contactType === 'phone' ? 'text-[var(--foreground)] font-medium' : 'text-gray-600'
                                      }`}
                                    >
                                      <Phone className="w-4 h-4" />
                                      Phone
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => toggleContactType('email')}
                                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left active:bg-gray-50 hover:bg-gray-50 transition-colors ${
                                        contactType === 'email' ? 'text-[var(--foreground)] font-medium' : 'text-gray-600'
                                      }`}
                                    >
                                      <Mail className="w-4 h-4" />
                                      Email
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Input field */}
                            <input
                              type={contactType === 'email' ? 'email' : 'tel'}
                              inputMode={contactType === 'email' ? 'email' : 'tel'}
                              value={contactValue}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              placeholder={contactType === 'email' ? 'Enter your email' : 'Enter Phone #'}
                              autoComplete={contactType === 'email' ? 'email' : 'tel'}
                              className={`w-full pl-20 pr-5 py-4 text-base bg-[var(--cream)] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] placeholder:text-gray-400 ${
                                validationError ? 'ring-2 ring-[var(--primary)] border-[var(--primary)]' : ''
                              }`}
                              style={{ fontSize: '16px' }}
                            />
                          </div>
                        )}

                        {/* Email only */}
                        {ctaType === 'email' && (
                          <input
                            type="email"
                            placeholder="Your email address"
                            value={contactValue}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`w-full px-5 py-4 text-base bg-[var(--cream)] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] placeholder:text-gray-400 ${
                              validationError ? 'ring-2 ring-[var(--primary)] border-[var(--primary)]' : ''
                            }`}
                            style={{ fontSize: '16px' }}
                          />
                        )}

                        {/* SMS only */}
                        {ctaType === 'sms' && (
                          <input
                            type="tel"
                            inputMode="tel"
                            placeholder="Your phone number"
                            value={contactValue}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            autoComplete="tel"
                            className={`w-full px-5 py-4 text-base bg-[var(--cream)] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] placeholder:text-gray-400 ${
                              validationError ? 'ring-2 ring-[var(--primary)] border-[var(--primary)]' : ''
                            }`}
                            style={{ fontSize: '16px' }}
                          />
                        )}

                        {/* Validation/Error message - Coming Soon style bubble */}
                        <AnimatePresence mode="wait">
                          {(validationError || status === 'error') && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className="flex justify-center"
                            >
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/20 border border-[var(--primary)]/40 rounded-full">
                                <svg className="w-4 h-4 text-[#7ab8d4] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-gray-600">
                                  {validationError || 'Something went wrong. Please try again.'}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          type="submit"
                          disabled={status === 'loading'}
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--foreground)] text-white font-medium text-base hover:bg-[var(--primary)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
                        >
                          {status === 'loading' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              {buttonText}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        {/* Download badge */}
                        {downloadEnabled && downloadFileUrl && (
                          <div className="flex justify-center pt-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)]/20 border border-[var(--primary)]/40 rounded-full">
                              <Download className="w-3.5 h-3.5 text-[#7ab8d4]" />
                              <span className="text-xs text-gray-600">{downloadText}</span>
                            </div>
                          </div>
                        )}

                        {/* No spam text */}
                        {noSpamText && (
                          <p className="text-xs text-gray-500 text-center pt-2">
                            {noSpamText}
                          </p>
                        )}
                      </form>
                    )}

                    {/* Download CTA (no form) */}
                    {ctaType === 'download' && downloadFileUrl && (
                      <div className="space-y-3">
                        <button
                          onClick={handleDownloadOnly}
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--foreground)] text-white font-medium text-base hover:bg-[var(--primary)] hover:text-[var(--foreground)] transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          {buttonText || 'Download Now'}
                        </button>
                      </div>
                    )}

                    {/* No CTA - just content */}
                    {ctaType === 'none' && (
                      <div className="text-center">
                        <button
                          onClick={handleClose}
                          className="px-8 py-3 text-base font-medium text-gray-500 hover:text-[var(--foreground)] transition-colors"
                        >
                          Continue browsing
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Click outside to close dropdown */}
            {showDropdown && (
              <div
                className="fixed inset-0 z-0"
                onClick={() => setShowDropdown(false)}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
