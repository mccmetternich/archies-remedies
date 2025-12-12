'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Download, Play, Check, Loader2, Mail, Phone, ChevronDown } from 'lucide-react';
import { usePopup } from './popup-provider';
import { VideoPlayer } from './video-player';

interface ExitPopupProps {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  videoThumbnailUrl?: string | null;
  dismissDays?: number;
  ctaType?: 'email' | 'sms' | 'both' | 'download' | 'none';
  downloadEnabled?: boolean;
  downloadFileUrl?: string | null;
  downloadFileName?: string | null;
  successTitle?: string;
  successMessage?: string;
  noSpamText?: string;
  // Exit intent sensitivity
  sensitivity?: number; // Pixels from top of viewport to trigger
  delayBeforeEnabled?: number; // MS before exit intent detection starts
  // Delay after welcome popup (in seconds)
  delayAfterWelcome?: number;
  welcomeEnabled?: boolean;
}

export function ExitPopup({
  enabled = true,
  title = "Wait! Don't Leave Empty-Handed",
  subtitle = "Get 15% off your first order when you sign up now.",
  buttonText = "Claim My 15% Off",
  imageUrl,
  videoUrl,
  videoThumbnailUrl,
  dismissDays = 7,
  ctaType = 'email',
  downloadEnabled = false,
  downloadFileUrl,
  downloadFileName,
  successTitle = "You're In!",
  successMessage,
  noSpamText = 'No spam, ever. Unsubscribe anytime.',
  sensitivity = 20,
  delayBeforeEnabled = 5000,
  delayAfterWelcome = 30,
  welcomeEnabled = false,
}: ExitPopupProps) {
  const {
    canShowExitPopup,
    dismissExitPopup,
    setActivePopup,
    trackPopupView,
    trackPopupDismiss,
    submitEmail,
    submitPhone,
    setPopupSubmitted,
    hasSubmittedPopup,
  } = usePopup();

  const [isOpen, setIsOpen] = useState(false);
  const [contactValue, setContactValue] = useState('');
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone'); // Phone is default for "both" mode
  const [showDropdown, setShowDropdown] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'downloading' | 'downloaded' | 'error'>('idle');
  const [showVideo, setShowVideo] = useState(false);
  const [exitDetectionEnabled, setExitDetectionEnabled] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [welcomeDelayComplete, setWelcomeDelayComplete] = useState(!welcomeEnabled);

  // Format phone number as user types (XXX-XXX-XXXX)
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 10);
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
  };

  // Validate phone number (must be exactly 10 digits)
  const validatePhone = (value: string): string | null => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return null;
    if (digits.length !== 10) return 'Whoops. Please enter a valid #';
    return null;
  };

  // Validate email with proper TLD
  const validateEmail = (value: string): string | null => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) return 'Whoops. Please enter a valid email.';
    return null;
  };

  // Handle input change with formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (contactType === 'phone') {
      setContactValue(formatPhoneNumber(value));
    } else {
      setContactValue(value);
    }
    setValidationError('');
    if (status === 'error') setStatus('idle');
  };

  // Validate on blur
  const handleBlur = () => {
    if (contactType === 'phone') {
      const error = validatePhone(contactValue);
      setValidationError(error || '');
    } else {
      const error = validateEmail(contactValue);
      setValidationError(error || '');
    }
  };

  // Toggle contact type (for "both" mode dropdown)
  const toggleContactType = (type: 'email' | 'phone') => {
    setContactType(type);
    setContactValue('');
    setValidationError('');
    setShowDropdown(false);
    if (status === 'error') setStatus('idle');
  };

  // Check if we need to wait after welcome popup
  useEffect(() => {
    if (!welcomeEnabled || !enabled) {
      setWelcomeDelayComplete(true);
      return;
    }

    // Get welcome dismissed timestamp
    const welcomeDismissedAt = localStorage.getItem('archies-welcome-dismissed-at');
    if (!welcomeDismissedAt) {
      // Welcome hasn't been dismissed yet, wait for it
      const checkInterval = setInterval(() => {
        const dismissed = localStorage.getItem('archies-welcome-dismissed-at');
        if (dismissed) {
          const elapsed = (Date.now() - parseInt(dismissed, 10)) / 1000;
          if (elapsed >= delayAfterWelcome) {
            setWelcomeDelayComplete(true);
            clearInterval(checkInterval);
          }
        }
      }, 1000);
      return () => clearInterval(checkInterval);
    }

    // Welcome was already dismissed, check if enough time has passed
    const elapsed = (Date.now() - parseInt(welcomeDismissedAt, 10)) / 1000;
    if (elapsed >= delayAfterWelcome) {
      setWelcomeDelayComplete(true);
    } else {
      // Wait for remaining time
      const remainingMs = (delayAfterWelcome - elapsed) * 1000;
      const timer = setTimeout(() => {
        setWelcomeDelayComplete(true);
      }, remainingMs);
      return () => clearTimeout(timer);
    }
  }, [welcomeEnabled, delayAfterWelcome, enabled]);

  // Enable exit detection after delay (only if welcome delay is complete)
  useEffect(() => {
    if (!enabled || !welcomeDelayComplete) return;

    const timer = setTimeout(() => {
      setExitDetectionEnabled(true);
    }, delayBeforeEnabled);

    return () => clearTimeout(timer);
  }, [enabled, delayBeforeEnabled, welcomeDelayComplete]);

  // Exit intent detection
  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      // Only trigger if mouse leaves through top of viewport
      if (e.clientY > sensitivity) return;

      // Check if we should show the popup
      if (!exitDetectionEnabled || hasTriggered || hasSubmittedPopup) return;
      if (!canShowExitPopup(dismissDays)) return;

      setHasTriggered(true);
      setIsOpen(true);
      setActivePopup('exit');
      trackPopupView(null, 'exit');
    },
    [
      exitDetectionEnabled,
      hasTriggered,
      hasSubmittedPopup,
      canShowExitPopup,
      dismissDays,
      sensitivity,
      setActivePopup,
      trackPopupView,
    ]
  );

  // Mobile: detect back button or tab switching
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      // User is leaving the tab
      if (!exitDetectionEnabled || hasTriggered || hasSubmittedPopup) return;
      if (!canShowExitPopup(dismissDays)) return;

      // Don't show on visibility change for mobile - too aggressive
      // Only track potential exit
    }
  }, [exitDetectionEnabled, hasTriggered, hasSubmittedPopup, canShowExitPopup, dismissDays]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, handleMouseLeave, handleVisibilityChange]);

  const handleClose = () => {
    setIsOpen(false);
    setActivePopup(null);
    dismissExitPopup();
    trackPopupDismiss(null, 'exit');
  };

  const triggerDownload = () => {
    if (downloadFileUrl) {
      setStatus('downloading');
      const link = document.createElement('a');
      link.href = downloadFileUrl;
      link.download = downloadFileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Simulate download completion
      setTimeout(() => {
        setStatus('downloaded');
      }, 1500);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on CTA type
    if (ctaType === 'email') {
      const error = validateEmail(contactValue);
      if (error || !contactValue) {
        setValidationError(error || 'Email is required');
        return;
      }
    } else if (ctaType === 'sms') {
      const error = validatePhone(contactValue);
      if (error || !contactValue) {
        setValidationError(error || 'Phone number is required');
        return;
      }
    } else if (ctaType === 'both') {
      // "Both" uses dropdown - validate based on selected type
      if (contactType === 'phone') {
        const error = validatePhone(contactValue);
        if (error || !contactValue) {
          setValidationError(error || 'Phone number is required');
          return;
        }
      } else {
        const error = validateEmail(contactValue);
        if (error || !contactValue) {
          setValidationError(error || 'Email is required');
          return;
        }
      }
    }

    setValidationError('');
    setStatus('loading');

    let success = false;

    // Build download info if download is enabled
    const downloadInfo = downloadEnabled && downloadFileUrl ? {
      fileUrl: downloadFileUrl,
      fileName: downloadFileName || 'download',
    } : undefined;

    if (ctaType === 'email') {
      success = await submitEmail(contactValue, null, 'exit', downloadInfo);
    } else if (ctaType === 'sms') {
      const phoneDigits = contactValue.replace(/\D/g, '');
      success = await submitPhone(phoneDigits, null, 'exit', downloadInfo);
    } else if (ctaType === 'both') {
      // Submit based on selected type in dropdown
      if (contactType === 'phone') {
        const phoneDigits = contactValue.replace(/\D/g, '');
        success = await submitPhone(phoneDigits, null, 'exit', downloadInfo);
      } else {
        success = await submitEmail(contactValue, null, 'exit', downloadInfo);
      }
    }

    if (success) {
      setStatus('success');

      // If download is enabled, trigger it after success
      if (downloadEnabled && downloadFileUrl) {
        setTimeout(() => {
          triggerDownload();
        }, 500);
      } else {
        setTimeout(() => {
          setIsOpen(false);
          setActivePopup(null);
        }, 2500);
      }
    } else {
      setStatus('error');
    }
  };

  const handleDownloadOnly = () => {
    // For download-only CTA (no form)
    setPopupSubmitted();
    triggerDownload();

    setTimeout(() => {
      setIsOpen(false);
      setActivePopup(null);
    }, 2500);
  };

  if (!enabled) return null;

  // Check if media is video
  const hasVideo = videoUrl && videoUrl.match(/\.(mp4|webm|mov)$/i);

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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal - Desktop: side-by-side, Mobile: stacked (with attention-grabbing border) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[94%] max-w-md md:max-w-4xl max-h-[90vh] overflow-y-auto md:overflow-hidden"
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#bbdae9] md:flex md:min-h-[480px]">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors border border-gray-200/50 shadow-sm"
                aria-label="Close popup"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              {/* Media Section - Left side on desktop, top on mobile */}
              <div className="relative md:w-1/2 md:min-h-full">
                {videoUrl && showVideo ? (
                  <div className="relative aspect-video md:aspect-auto md:absolute md:inset-0 bg-black">
                    <VideoPlayer url={videoUrl} autoPlay />
                  </div>
                ) : (
                  <div className="relative aspect-video md:aspect-auto md:absolute md:inset-0 w-full bg-gradient-to-br from-[#f5f0eb] via-white to-[#bbdae9]/30">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : videoThumbnailUrl ? (
                      <>
                        <Image
                          src={videoThumbnailUrl}
                          alt="Video thumbnail"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => setShowVideo(true)}
                          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 text-[#1a1a1a] ml-1" fill="currentColor" />
                          </div>
                        </button>
                      </>
                    ) : hasVideo ? (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="absolute inset-0 flex items-center justify-center hover:bg-black/10 transition-colors"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-[#1a1a1a] ml-1" fill="currentColor" />
                        </div>
                      </button>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-4xl mb-2 block">👋</span>
                          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400">
                            Wait!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Content Section - Right side on desktop, bottom on mobile */}
              <div className="p-6 md:p-8 md:w-1/2 md:flex md:flex-col md:justify-center">
                {status === 'success' || status === 'downloading' || status === 'downloaded' ? (
                  <div className="py-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[#bbdae9] rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-6 h-6 text-[#1a1a1a]" strokeWidth={3} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-normal tracking-tight text-[#1a1a1a]">
                        {successTitle}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-base leading-relaxed mb-4">
                      {successMessage || (
                        <>
                          {ctaType === 'email' && 'Check your email for your special discount.'}
                          {ctaType === 'sms' && 'Check your phone for your special discount.'}
                          {ctaType === 'both' && (contactType === 'phone' ? 'Check your phone for your special discount.' : 'Check your email for your special discount.')}
                          {ctaType === 'download' && 'Your download should start automatically.'}
                          {ctaType === 'none' && 'Thank you for staying!'}
                        </>
                      )}
                    </p>

                    {/* Download status indicator */}
                    {downloadEnabled && downloadFileUrl && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        {status === 'downloading' ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-[#bbdae9]" />
                            <span className="text-sm text-gray-600">Downloading...</span>
                          </>
                        ) : status === 'downloaded' ? (
                          <>
                            <div className="w-6 h-6 bg-[#bbdae9] rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-sm text-gray-600">Download complete!</span>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl md:text-3xl font-normal mb-3 tracking-tight text-center text-[#1a1a1a]">
                      {title}
                    </h3>
                    <p className="text-gray-600 mb-6 text-center text-base leading-relaxed">
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
                                        contactType === 'phone' ? 'text-[#1a1a1a] font-medium' : 'text-gray-600'
                                      }`}
                                    >
                                      <Phone className="w-4 h-4" />
                                      Phone
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => toggleContactType('email')}
                                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left active:bg-gray-50 hover:bg-gray-50 transition-colors ${
                                        contactType === 'email' ? 'text-[#1a1a1a] font-medium' : 'text-gray-600'
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
                              className={`w-full pl-14 pr-5 py-4 text-base bg-[#f5f5f0] rounded-full focus:outline-none focus:ring-2 focus:ring-[#bbdae9] placeholder:text-gray-400 ${
                                validationError ? 'ring-2 ring-[#bbdae9]' : ''
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
                            onChange={(e) => {
                              setContactValue(e.target.value);
                              setValidationError('');
                            }}
                            onBlur={() => {
                              const error = validateEmail(contactValue);
                              setValidationError(error || '');
                            }}
                            className={`w-full px-5 py-4 text-base bg-[#f5f5f0] border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#bbdae9] placeholder:text-gray-400 ${
                              validationError ? 'ring-2 ring-[#bbdae9]' : ''
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
                            onChange={(e) => {
                              setContactValue(formatPhoneNumber(e.target.value));
                              setValidationError('');
                            }}
                            onBlur={() => {
                              const error = validatePhone(contactValue);
                              setValidationError(error || '');
                            }}
                            autoComplete="tel"
                            className={`w-full px-5 py-4 text-base bg-[#f5f5f0] border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#bbdae9] placeholder:text-gray-400 ${
                              validationError ? 'ring-2 ring-[#bbdae9]' : ''
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
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#bbdae9]/20 border border-[#bbdae9]/40 rounded-full">
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
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1a1a1a] text-white rounded-full font-medium text-base hover:bg-[#bbdae9] hover:text-[#1a1a1a] transition-colors disabled:opacity-50"
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
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#bbdae9]/20 border border-[#bbdae9]/40 rounded-full">
                              <Download className="w-3.5 h-3.5 text-[#7ab8d4]" />
                              <span className="text-xs text-gray-600">Download starts on submission</span>
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
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1a1a1a] text-white rounded-full font-medium text-base hover:bg-[#bbdae9] hover:text-[#1a1a1a] transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          {buttonText || 'Download Now'}
                        </button>
                      </div>
                    )}

                    {/* No CTA */}
                    {ctaType === 'none' && (
                      <div className="text-center">
                        <button
                          onClick={handleClose}
                          className="px-8 py-3 text-base font-medium text-gray-500 hover:text-[#1a1a1a] transition-colors"
                        >
                          Continue browsing
                        </button>
                      </div>
                    )}

                    {/* No thanks link */}
                    <button
                      onClick={handleClose}
                      className="w-full mt-4 text-center text-sm text-gray-500 hover:text-[#1a1a1a] transition-colors"
                    >
                      No thanks, I&apos;ll pay full price
                    </button>
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
