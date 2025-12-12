'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Download, Play } from 'lucide-react';
import { usePopup } from './popup-provider';
import { PhoneInput } from './phone-input';
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
  ctaType?: 'email' | 'sms' | 'download' | 'none';
  downloadFileUrl?: string | null;
  downloadFileName?: string | null;
  successTitle?: string;
  successMessage?: string;
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
  downloadFileUrl,
  downloadFileName,
  successTitle = "You're In!",
  successMessage,
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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showVideo, setShowVideo] = useState(false);
  const [exitDetectionEnabled, setExitDetectionEnabled] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [welcomeDelayComplete, setWelcomeDelayComplete] = useState(!welcomeEnabled);

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    const success = await submitEmail(email, null, 'exit');

    if (success) {
      setStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setActivePopup(null);
      }, 2000);
    } else {
      setStatus('error');
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setStatus('loading');
    const success = await submitPhone(phone, null, 'exit');

    if (success) {
      setStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setActivePopup(null);
      }, 2000);
    } else {
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (downloadFileUrl) {
      setPopupSubmitted();

      const link = document.createElement('a');
      link.href = downloadFileUrl;
      link.download = downloadFileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setIsOpen(false);
        setActivePopup(null);
      }, 500);
    }
  };

  if (!enabled) return null;

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

          {/* Modal - Bigger on desktop, compact on mobile, attention-grabbing border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92%] max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 border-[var(--primary)]">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors border border-[var(--border)]"
                aria-label="Close popup"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Video or Image - Taller on desktop */}
              {videoUrl && showVideo ? (
                <div className="relative aspect-video bg-black">
                  <VideoPlayer url={videoUrl} autoPlay />
                </div>
              ) : (
                <div className="relative h-40 md:h-56 bg-gradient-to-br from-orange-100 via-[var(--cream)] to-orange-200">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Special Offer"
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
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                        </div>
                      </button>
                    </>
                  ) : videoUrl ? (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute inset-0 flex items-center justify-center hover:bg-black/10 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                      </div>
                    </button>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">👋</span>
                        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--foreground)]/60">
                          Wait!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Content - More padding on desktop */}
              <div className="p-6 md:p-10">
                {status === 'success' ? (
                  <div className="py-4 md:py-8">
                    <div className="flex items-center justify-center gap-3 mb-4 md:mb-6">
                      <div className="w-11 h-11 md:w-14 md:h-14 bg-[#bbdae9] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 md:w-7 md:h-7 text-[#1a1a1a]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-2xl md:text-4xl font-normal tracking-tight">{successTitle}</h3>
                    </div>
                    <p className="text-[var(--muted-foreground)] text-center text-base md:text-lg leading-relaxed">
                      {successMessage || (
                        <>
                          {ctaType === 'email' && 'Check your email for your special discount.'}
                          {ctaType === 'sms' && 'Check your phone for your special discount.'}
                          {ctaType === 'download' && 'Your download should start automatically.'}
                          {ctaType === 'none' && 'Thank you for staying!'}
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl md:text-4xl font-normal mb-3 md:mb-4 tracking-tight text-center">
                      {title}
                    </h3>
                    <p className="text-[var(--muted-foreground)] mb-6 md:mb-10 text-center text-base md:text-lg leading-relaxed">
                      {subtitle}
                    </p>

                    {/* Email CTA */}
                    {ctaType === 'email' && (
                      <form onSubmit={handleEmailSubmit} className="space-y-3 md:space-y-4">
                        <input
                          type="email"
                          placeholder="Your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full px-5 py-3.5 md:py-5 text-base md:text-lg bg-[var(--cream)] border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
                        />
                        {status === 'error' && (
                          <p className="text-sm text-red-500 text-center">
                            Something went wrong. Please try again.
                          </p>
                        )}
                        <button
                          type="submit"
                          disabled={status === 'loading'}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 md:py-5 bg-[var(--primary)] text-white rounded-full font-medium text-sm md:text-base hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
                        >
                          {status === 'loading' ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              {buttonText}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* SMS CTA */}
                    {ctaType === 'sms' && (
                      <form onSubmit={handlePhoneSubmit} className="space-y-3 md:space-y-4">
                        <PhoneInput
                          value={phone}
                          onChange={setPhone}
                          placeholder="Your phone number"
                        />
                        {status === 'error' && (
                          <p className="text-sm text-red-500 text-center">
                            Something went wrong. Please try again.
                          </p>
                        )}
                        <button
                          type="submit"
                          disabled={status === 'loading'}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 md:py-5 bg-[var(--primary)] text-white rounded-full font-medium text-sm md:text-base hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
                        >
                          {status === 'loading' ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              {buttonText}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                        <p className="text-xs text-[var(--muted-foreground)] text-center">
                          By signing up, you agree to receive SMS messages. Message and data rates may apply.
                        </p>
                      </form>
                    )}

                    {/* Download CTA */}
                    {ctaType === 'download' && downloadFileUrl && (
                      <div className="space-y-3 md:space-y-4">
                        <button
                          onClick={handleDownload}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 md:py-5 bg-[var(--primary)] text-white rounded-full font-medium text-sm md:text-base hover:bg-[var(--primary)]/90 transition-colors"
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
                          className="px-8 py-3 md:py-4 text-sm md:text-base font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                          Continue browsing
                        </button>
                      </div>
                    )}

                    {(ctaType === 'email' || ctaType === 'sms') && (
                      <p className="text-xs md:text-sm text-[var(--muted-foreground)] mt-4 md:mt-6 text-center">
                        No spam, ever. Unsubscribe anytime.
                      </p>
                    )}

                    {/* No thanks link */}
                    <button
                      onClick={handleClose}
                      className="w-full mt-3 md:mt-4 text-center text-sm md:text-base text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      No thanks, I&apos;ll pay full price
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
