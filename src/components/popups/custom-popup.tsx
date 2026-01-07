'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Download, Play, Check, Loader2, Mail, Phone, ChevronDown } from 'lucide-react';
import { usePopup } from './popup-provider';
import { VideoPlayer } from './video-player';
import { usePopupForm } from '@/hooks/use-popup-form';
import { isVideoUrl } from '@/lib/media-utils';

interface CustomPopupData {
  id: string;
  name: string;
  title: string | null;
  body: string | null;
  videoUrl: string | null;
  videoThumbnailUrl: string | null;
  imageUrl: string | null;
  ctaType: 'email' | 'sms' | 'both' | 'download' | 'none';
  ctaButtonText: string;
  downloadFileUrl: string | null;
  downloadFileName: string | null;
  triggerType: 'timer' | 'exit' | 'scroll';
  triggerDelay: number;
  triggerScrollPercent: number;
  dismissDays: number;
}

interface CustomPopupProps {
  popup: CustomPopupData;
  enabled?: boolean;
}

export function CustomPopup({ popup, enabled = true }: CustomPopupProps) {
  const {
    canShowCustomPopup,
    dismissCustomPopup,
    setActivePopup,
    trackPopupView,
    trackPopupDismiss,
    submitEmail,
    submitPhone,
    setPopupSubmitted,
    hasSubmittedPopup,
  } = usePopup();

  const [isOpen, setIsOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

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
    ctaType: popup.ctaType,
    downloadEnabled: popup.ctaType === 'download',
    downloadFileUrl: popup.downloadFileUrl,
    downloadFileName: popup.downloadFileName,
    popupType: 'custom',
    popupId: popup.id,
    submitEmail,
    submitPhone,
    setPopupSubmitted,
    onClose: handlePopupClose,
  });

  // Timer trigger
  useEffect(() => {
    if (!enabled || popup.triggerType !== 'timer') return;
    if (hasTriggered || !canShowCustomPopup(popup.id, popup.dismissDays)) return;

    const timer = setTimeout(() => {
      setHasTriggered(true);
      setIsOpen(true);
      setActivePopup(popup.id);
      trackPopupView(popup.id, 'custom');
    }, popup.triggerDelay * 1000);

    return () => clearTimeout(timer);
  }, [enabled, popup, hasTriggered, canShowCustomPopup, setActivePopup, trackPopupView]);

  // Scroll trigger
  useEffect(() => {
    if (!enabled || popup.triggerType !== 'scroll') return;
    if (hasTriggered || !canShowCustomPopup(popup.id, popup.dismissDays)) return;

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      if (scrollPercent >= popup.triggerScrollPercent) {
        setHasTriggered(true);
        setIsOpen(true);
        setActivePopup(popup.id);
        trackPopupView(popup.id, 'custom');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, popup, hasTriggered, canShowCustomPopup, setActivePopup, trackPopupView]);

  // Exit trigger
  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (e.clientY > 20) return;
      if (!enabled || popup.triggerType !== 'exit') return;
      if (hasTriggered || hasSubmittedPopup) return;
      if (!canShowCustomPopup(popup.id, popup.dismissDays)) return;

      setHasTriggered(true);
      setIsOpen(true);
      setActivePopup(popup.id);
      trackPopupView(popup.id, 'custom');
    },
    [enabled, popup, hasTriggered, hasSubmittedPopup, canShowCustomPopup, setActivePopup, trackPopupView]
  );

  useEffect(() => {
    if (!enabled || popup.triggerType !== 'exit') return;

    // Delay exit detection for 5 seconds
    const enableTimer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(enableTimer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, popup.triggerType, handleMouseLeave]);

  const handleClose = () => {
    setIsOpen(false);
    setActivePopup(null);
    dismissCustomPopup(popup.id);
    trackPopupDismiss(popup.id, 'custom');
  };

  if (!enabled) return null;

  // Check if media is video (using shared utility)
  const hasVideo = isVideoUrl(popup.videoUrl);

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
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[94%] max-w-md md:max-w-4xl max-h-[90vh] overflow-y-auto md:overflow-hidden"
          >
            <div className="bg-[var(--background)] overflow-hidden shadow-2xl md:flex md:min-h-[480px]">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors border border-gray-200/50 shadow-sm"
                aria-label="Close popup"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              {/* Media Section - Left side on desktop, top on mobile */}
              <div className="relative md:w-1/2 md:min-h-full">
                {popup.videoUrl && showVideo ? (
                  <div className="relative aspect-video md:aspect-auto md:absolute md:inset-0 bg-black">
                    <VideoPlayer url={popup.videoUrl} autoPlay />
                  </div>
                ) : (
                  <div className="relative aspect-video md:aspect-auto md:absolute md:inset-0 w-full bg-gradient-to-br from-[#f5f0eb] via-white to-[var(--primary)]/30">
                    {popup.imageUrl ? (
                      <Image
                        src={popup.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : popup.videoThumbnailUrl ? (
                      <>
                        <Image
                          src={popup.videoThumbnailUrl}
                          alt="Video thumbnail"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => setShowVideo(true)}
                          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 text-[var(--foreground)] ml-1" fill="currentColor" />
                          </div>
                        </button>
                      </>
                    ) : hasVideo ? (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="absolute inset-0 flex items-center justify-center hover:bg-black/10 transition-colors"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-[var(--foreground)] ml-1" fill="currentColor" />
                        </div>
                      </button>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400">
                          Archie&apos;s Remedies
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Content Section - Right side on desktop, bottom on mobile */}
              <div className="p-6 md:p-8 md:w-1/2 md:flex md:flex-col md:justify-center">
                {status === 'success' ? (
                  <div className="py-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-6 h-6 text-[var(--foreground)]" strokeWidth={3} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-normal tracking-tight text-[var(--foreground)]">
                        Thank You!
                      </h3>
                    </div>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {popup.ctaType === 'email' && 'Check your email for more information.'}
                      {popup.ctaType === 'sms' && 'Check your phone for more information.'}
                      {popup.ctaType === 'both' && (contactType === 'phone' ? 'Check your phone for more information.' : 'Check your email for more information.')}
                      {popup.ctaType === 'download' && 'Your download should start automatically.'}
                      {popup.ctaType === 'none' && 'Thank you!'}
                    </p>
                  </div>
                ) : (
                  <>
                    {popup.title && (
                      <h3 className="text-2xl md:text-3xl font-normal mb-3 tracking-tight text-center text-[var(--foreground)]">
                        {popup.title}
                      </h3>
                    )}
                    {popup.body && (
                      <p className="text-gray-600 mb-4 text-center text-base leading-relaxed">
                        {popup.body}
                      </p>
                    )}

                    {/* Form based on CTA type */}
                    {popup.ctaType !== 'none' && popup.ctaType !== 'download' && (
                      <form onSubmit={handleFormSubmit} className="space-y-3">
                        {/* Both: Dropdown toggle between phone/email */}
                        {popup.ctaType === 'both' && (
                          <div className="relative">
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
                                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                                        contactType === 'phone' ? 'text-[var(--foreground)] font-medium' : 'text-gray-600'
                                      }`}
                                    >
                                      <Phone className="w-4 h-4" />
                                      Phone
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => toggleContactType('email')}
                                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
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
                        {popup.ctaType === 'email' && (
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
                        {popup.ctaType === 'sms' && (
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

                        {/* Validation/Error message */}
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
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--foreground)] text-white font-medium text-sm uppercase tracking-wider hover:bg-[var(--primary)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
                        >
                          {status === 'loading' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              {popup.ctaButtonText || 'Subscribe'}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        <p className="text-xs text-gray-500 text-center pt-2">
                          No spam, ever. Unsubscribe anytime.
                        </p>
                      </form>
                    )}

                    {/* Download CTA (no form) */}
                    {popup.ctaType === 'download' && popup.downloadFileUrl && (
                      <div className="space-y-3">
                        <button
                          onClick={handleDownloadOnly}
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--foreground)] text-white font-medium text-base hover:bg-[var(--primary)] hover:text-[var(--foreground)] transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          {popup.ctaButtonText || 'Download Now'}
                        </button>
                      </div>
                    )}

                    {/* No CTA - just content */}
                    {popup.ctaType === 'none' && (
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
