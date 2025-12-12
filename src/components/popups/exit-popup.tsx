'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Download, Play, Check, Loader2 } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'downloading' | 'downloaded' | 'error'>('idle');
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

    // For "both" type, phone is required, email optional
    // For "email" type, email is required
    // For "sms" type, phone is required
    if (ctaType === 'email' && !email) return;
    if (ctaType === 'sms' && !phone) return;
    if (ctaType === 'both' && !phone) return;

    setStatus('loading');

    let success = false;

    if (ctaType === 'email') {
      success = await submitEmail(email, null, 'exit');
    } else if (ctaType === 'sms') {
      success = await submitPhone(phone, null, 'exit');
    } else if (ctaType === 'both') {
      // Submit phone first (primary), then email if provided
      success = await submitPhone(phone, null, 'exit');
      if (success && email) {
        await submitEmail(email, null, 'exit');
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

          {/* Modal - Coming Soon aesthetic with attention-grabbing border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[94%] max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#bbdae9]">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors border border-gray-200/50 shadow-sm"
                aria-label="Close popup"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              {/* Media - Full width, aspect-video */}
              {videoUrl && showVideo ? (
                <div className="relative aspect-video bg-black">
                  <VideoPlayer url={videoUrl} autoPlay />
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-gradient-to-br from-[#f5f0eb] via-white to-[#bbdae9]/30">
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

              {/* Content */}
              <div className="p-6 md:p-8">
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
                          {ctaType === 'both' && 'Check your phone for your special discount.'}
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
                        {/* Both: Phone + Email (phone as primary, stacked on mobile, side-by-side on desktop) */}
                        {ctaType === 'both' && (
                          <div className="space-y-3 md:space-y-0 md:flex md:gap-3">
                            <div className="flex-1">
                              <PhoneInput
                                value={phone}
                                onChange={setPhone}
                                placeholder="Phone number"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="email"
                                placeholder="Email (optional)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 text-base bg-[#f5f5f0] border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#bbdae9] placeholder:text-gray-400"
                              />
                            </div>
                          </div>
                        )}

                        {/* Email only */}
                        {ctaType === 'email' && (
                          <input
                            type="email"
                            placeholder="Your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-5 py-4 text-base bg-[#f5f5f0] border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#bbdae9] placeholder:text-gray-400"
                          />
                        )}

                        {/* SMS only */}
                        {ctaType === 'sms' && (
                          <PhoneInput
                            value={phone}
                            onChange={setPhone}
                            placeholder="Your phone number"
                          />
                        )}

                        {status === 'error' && (
                          <p className="text-sm text-red-500 text-center">
                            Something went wrong. Please try again.
                          </p>
                        )}

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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
