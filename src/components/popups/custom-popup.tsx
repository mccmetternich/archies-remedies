'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Download, Play } from 'lucide-react';
import { usePopup } from './popup-provider';
import { PhoneInput } from './phone-input';
import { VideoPlayer } from './video-player';

interface CustomPopupData {
  id: string;
  name: string;
  title: string | null;
  body: string | null;
  videoUrl: string | null;
  videoThumbnailUrl: string | null;
  imageUrl: string | null;
  ctaType: 'email' | 'sms' | 'download' | 'none';
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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showVideo, setShowVideo] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    const success = await submitEmail(email, popup.id, 'custom');

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
    const success = await submitPhone(phone, popup.id, 'custom');

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
    if (popup.downloadFileUrl) {
      setPopupSubmitted();

      const link = document.createElement('a');
      link.href = popup.downloadFileUrl;
      link.download = popup.downloadFileName || 'download';
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
              {popup.videoUrl && showVideo ? (
                <div className="relative aspect-video bg-black">
                  <VideoPlayer url={popup.videoUrl} autoPlay />
                </div>
              ) : popup.imageUrl || popup.videoUrl || popup.videoThumbnailUrl ? (
                <div className="relative h-48 bg-gradient-to-br from-[var(--primary-light)] via-[var(--cream)] to-[var(--primary)]">
                  {popup.imageUrl ? (
                    <Image
                      src={popup.imageUrl}
                      alt={popup.title || 'Popup image'}
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
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                        </div>
                      </button>
                    </>
                  ) : popup.videoUrl ? (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute inset-0 flex items-center justify-center hover:bg-black/10 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                      </div>
                    </button>
                  ) : null}
                </div>
              ) : null}

              {/* Content */}
              <div className="p-8">
                {status === 'success' ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h3 className="text-2xl font-normal mb-2 tracking-tight">Thank You!</h3>
                    <p className="text-[var(--muted-foreground)]">
                      {popup.ctaType === 'email' && 'Check your email for more information.'}
                      {popup.ctaType === 'sms' && 'Check your phone for more information.'}
                      {popup.ctaType === 'download' && 'Your download should start automatically.'}
                      {popup.ctaType === 'none' && 'Thank you!'}
                    </p>
                  </div>
                ) : (
                  <>
                    {popup.title && (
                      <h3 className="text-2xl md:text-3xl font-normal mb-3 tracking-tight text-center">
                        {popup.title}
                      </h3>
                    )}
                    {popup.body && (
                      <p className="text-[var(--muted-foreground)] mb-8 text-center leading-relaxed">
                        {popup.body}
                      </p>
                    )}

                    {/* Email CTA */}
                    {popup.ctaType === 'email' && (
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
                              {popup.ctaButtonText || 'Subscribe'}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* SMS CTA */}
                    {popup.ctaType === 'sms' && (
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
                              {popup.ctaButtonText || 'Subscribe'}
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
                    {popup.ctaType === 'download' && popup.downloadFileUrl && (
                      <div className="space-y-4">
                        <button
                          onClick={handleDownload}
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--foreground)] text-white rounded-full font-medium text-sm hover:bg-black transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          {popup.ctaButtonText || 'Download Now'}
                        </button>
                      </div>
                    )}

                    {/* No CTA */}
                    {popup.ctaType === 'none' && (
                      <div className="text-center">
                        <button
                          onClick={handleClose}
                          className="px-8 py-3 text-sm font-medium bg-[var(--foreground)] text-white rounded-full hover:bg-black transition-colors"
                        >
                          {popup.ctaButtonText || 'Got it'}
                        </button>
                      </div>
                    )}

                    {(popup.ctaType === 'email' || popup.ctaType === 'sms') && (
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
