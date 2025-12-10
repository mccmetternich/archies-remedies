'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Download, Play } from 'lucide-react';
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
  ctaType?: 'email' | 'sms' | 'download' | 'none';
  downloadFileUrl?: string | null;
  downloadFileName?: string | null;
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
  ctaType = 'email',
  downloadFileUrl,
  downloadFileName,
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
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      if (canShowWelcomePopup(dismissDays)) {
        setIsOpen(true);
        setActivePopup('welcome');
        trackPopupView(null, 'welcome');
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, delay, dismissDays, canShowWelcomePopup, setActivePopup, trackPopupView]);

  const handleClose = () => {
    setIsOpen(false);
    setActivePopup(null);
    dismissWelcomePopup();
    trackPopupDismiss(null, 'welcome');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    const success = await submitEmail(email, null, 'welcome');

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
    const success = await submitPhone(phone, null, 'welcome');

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
      // Mark as submitted (counts as conversion)
      setPopupSubmitted();

      // Trigger download
      const link = document.createElement('a');
      link.href = downloadFileUrl;
      link.download = downloadFileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close popup after short delay
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
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92%] max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors border border-[var(--border)]"
                aria-label="Close popup"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Video or Image */}
              {videoUrl && showVideo ? (
                <div className="relative aspect-video bg-black">
                  <VideoPlayer url={videoUrl} autoPlay />
                </div>
              ) : (
                <div className="relative h-48 bg-gradient-to-br from-[var(--primary-light)] via-[var(--cream)] to-[var(--primary)]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Archie's Remedies"
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
                        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--foreground)]/60">
                          Archie&apos;s Remedies
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                {status === 'success' ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h3 className="text-2xl font-normal mb-2 tracking-tight">Welcome!</h3>
                    <p className="text-[var(--muted-foreground)]">
                      {ctaType === 'email' && 'Check your email for your discount code.'}
                      {ctaType === 'sms' && 'Check your phone for your discount code.'}
                      {ctaType === 'download' && 'Your download should start automatically.'}
                      {ctaType === 'none' && 'Thank you!'}
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl md:text-3xl font-normal mb-3 tracking-tight text-center">
                      {title}
                    </h3>
                    <p className="text-[var(--muted-foreground)] mb-8 text-center leading-relaxed">
                      {subtitle}
                    </p>

                    {/* Email CTA */}
                    {ctaType === 'email' && (
                      <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <input
                          type="email"
                          placeholder="Your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full px-5 py-4 text-base bg-[var(--cream)] border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
                        />
                        {status === 'error' && (
                          <p className="text-sm text-red-500 text-center">
                            Something went wrong. Please try again.
                          </p>
                        )}
                        <button
                          type="submit"
                          disabled={status === 'loading'}
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--foreground)] text-white rounded-full font-medium text-sm hover:bg-black transition-colors disabled:opacity-50"
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
                      <form onSubmit={handlePhoneSubmit} className="space-y-4">
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
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--foreground)] text-white rounded-full font-medium text-sm hover:bg-black transition-colors disabled:opacity-50"
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
                      <div className="space-y-4">
                        <button
                          onClick={handleDownload}
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--foreground)] text-white rounded-full font-medium text-sm hover:bg-black transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          {buttonText || 'Download Now'}
                        </button>
                      </div>
                    )}

                    {/* No CTA - just content/video */}
                    {ctaType === 'none' && (
                      <div className="text-center">
                        <button
                          onClick={handleClose}
                          className="px-8 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                          Continue browsing
                        </button>
                      </div>
                    )}

                    {(ctaType === 'email' || ctaType === 'sms') && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-6 text-center">
                        No spam, ever. Unsubscribe anytime.
                      </p>
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
