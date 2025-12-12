'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Download, Play, Check, Loader2 } from 'lucide-react';
import { usePopup } from './popup-provider';
import { PhoneInput } from './phone-input';
import { VideoPlayer } from './video-player';

interface WelcomePopupProps {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  videoThumbnailUrl?: string | null;
  delay?: number;
  dismissDays?: number;
  sessionOnly?: boolean;
  sessionExpiryHours?: number;
  ctaType?: 'email' | 'sms' | 'both' | 'download' | 'none';
  downloadEnabled?: boolean;
  downloadFileUrl?: string | null;
  downloadFileName?: string | null;
  successTitle?: string;
  successMessage?: string;
  noSpamText?: string;
}

export function WelcomePopup({
  enabled = true,
  title = 'Join the Clean Eye Care Movement',
  subtitle = 'Get 10% off your first order plus exclusive access to new products and wellness tips.',
  buttonText = 'Get My 10% Off',
  imageUrl,
  videoUrl,
  videoThumbnailUrl,
  delay = 3000,
  dismissDays = 7,
  sessionOnly = true,
  sessionExpiryHours = 24,
  ctaType = 'email',
  downloadEnabled = false,
  downloadFileUrl,
  downloadFileName,
  successTitle = "You're In!",
  successMessage,
  noSpamText = 'No spam, ever. Unsubscribe anytime.',
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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'downloading' | 'downloaded' | 'error'>('idle');
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      if (canShowWelcomePopup({ sessionOnly, sessionExpiryHours, dismissDays })) {
        setIsOpen(true);
        setActivePopup('welcome');
        trackPopupView(null, 'welcome');
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, delay, dismissDays, sessionOnly, sessionExpiryHours, canShowWelcomePopup, setActivePopup, trackPopupView]);

  const handleClose = () => {
    setIsOpen(false);
    setActivePopup(null);
    dismissWelcomePopup();
    trackPopupDismiss(null, 'welcome');
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
      success = await submitEmail(email, null, 'welcome');
    } else if (ctaType === 'sms') {
      success = await submitPhone(phone, null, 'welcome');
    } else if (ctaType === 'both') {
      // Submit phone first (primary), then email if provided
      success = await submitPhone(phone, null, 'welcome');
      if (success && email) {
        await submitEmail(email, null, 'welcome');
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
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal - Coming Soon aesthetic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[94%] max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
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
                      <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400">
                        Archie&apos;s Remedies
                      </span>
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
                          {ctaType === 'email' && 'Check your email for your discount code.'}
                          {ctaType === 'sms' && 'Check your phone for your discount code.'}
                          {ctaType === 'both' && 'Check your phone for your discount code.'}
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

                    {/* No CTA - just content */}
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
