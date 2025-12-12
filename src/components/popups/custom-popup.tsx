'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Download, Play, Check, Loader2, Mail, Phone, ChevronDown } from 'lucide-react';
import { usePopup } from './popup-provider';
import { VideoPlayer } from './video-player';

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
  const [contactValue, setContactValue] = useState('');
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [showDropdown, setShowDropdown] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showVideo, setShowVideo] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  // Format phone number as user types (XXX-XXX-XXXX)
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 10);
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
  };

  // Validate phone number
  const validatePhone = (value: string): string | null => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return null;
    if (digits.length !== 10) return 'Whoops. Please enter a valid #';
    return null;
  };

  // Validate email
  const validateEmail = (value: string): string | null => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) return 'Whoops. Please enter a valid email.';
    return null;
  };

  // Handle input change
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

  // Toggle contact type
  const toggleContactType = (type: 'email' | 'phone') => {
    setContactType(type);
    setContactValue('');
    setValidationError('');
    setShowDropdown(false);
    if (status === 'error') setStatus('idle');
  };

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

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on CTA type
    if (popup.ctaType === 'email') {
      const error = validateEmail(contactValue);
      if (error || !contactValue) {
        setValidationError(error || 'Email is required');
        return;
      }
    } else if (popup.ctaType === 'sms') {
      const error = validatePhone(contactValue);
      if (error || !contactValue) {
        setValidationError(error || 'Phone number is required');
        return;
      }
    } else if (popup.ctaType === 'both') {
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

    // Build download info if popup has a download file
    const downloadInfo = popup.downloadFileUrl ? {
      fileUrl: popup.downloadFileUrl,
      fileName: popup.downloadFileName || 'download',
    } : undefined;

    if (popup.ctaType === 'email') {
      success = await submitEmail(contactValue, popup.id, 'custom', downloadInfo);
    } else if (popup.ctaType === 'sms') {
      const phoneDigits = contactValue.replace(/\D/g, '');
      success = await submitPhone(phoneDigits, popup.id, 'custom', downloadInfo);
    } else if (popup.ctaType === 'both') {
      if (contactType === 'phone') {
        const phoneDigits = contactValue.replace(/\D/g, '');
        success = await submitPhone(phoneDigits, popup.id, 'custom', downloadInfo);
      } else {
        success = await submitEmail(contactValue, popup.id, 'custom', downloadInfo);
      }
    }

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

  if (!enabled) return null;

  // Check if media is video
  const hasVideo = popup.videoUrl && (
    popup.videoUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ||
    popup.videoUrl.includes('/video/upload/')
  );

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
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl md:flex md:min-h-[480px]">
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
                {popup.videoUrl && showVideo ? (
                  <div className="relative aspect-video md:aspect-auto md:absolute md:inset-0 bg-black">
                    <VideoPlayer url={popup.videoUrl} autoPlay />
                  </div>
                ) : (
                  <div className="relative aspect-video md:aspect-auto md:absolute md:inset-0 w-full bg-gradient-to-br from-[#f5f0eb] via-white to-[#bbdae9]/30">
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
              </div>

              {/* Content Section - Right side on desktop, bottom on mobile */}
              <div className="p-6 md:p-8 md:w-1/2 md:flex md:flex-col md:justify-center">
                {status === 'success' ? (
                  <div className="py-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[#bbdae9] rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-6 h-6 text-[#1a1a1a]" strokeWidth={3} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-normal tracking-tight text-[#1a1a1a]">
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
                      <h3 className="text-2xl md:text-3xl font-normal mb-3 tracking-tight text-center text-[#1a1a1a]">
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
                                        contactType === 'phone' ? 'text-[#1a1a1a] font-medium' : 'text-gray-600'
                                      }`}
                                    >
                                      <Phone className="w-4 h-4" />
                                      Phone
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => toggleContactType('email')}
                                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
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

                            <input
                              type={contactType === 'email' ? 'email' : 'tel'}
                              inputMode={contactType === 'email' ? 'email' : 'tel'}
                              value={contactValue}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              placeholder={contactType === 'email' ? 'Enter your email' : 'Enter Phone #'}
                              autoComplete={contactType === 'email' ? 'email' : 'tel'}
                              className={`w-full pl-20 pr-5 py-4 text-base bg-[#f5f5f0] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#bbdae9] focus:border-[#bbdae9] placeholder:text-gray-400 ${
                                validationError ? 'ring-2 ring-[#bbdae9] border-[#bbdae9]' : ''
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
                            onChange={(e) => {
                              setContactValue(e.target.value);
                              setValidationError('');
                            }}
                            onBlur={() => {
                              const error = validateEmail(contactValue);
                              setValidationError(error || '');
                            }}
                            className={`w-full px-5 py-4 text-base bg-[#f5f5f0] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#bbdae9] focus:border-[#bbdae9] placeholder:text-gray-400 ${
                              validationError ? 'ring-2 ring-[#bbdae9] border-[#bbdae9]' : ''
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
                            onChange={(e) => {
                              setContactValue(formatPhoneNumber(e.target.value));
                              setValidationError('');
                            }}
                            onBlur={() => {
                              const error = validatePhone(contactValue);
                              setValidationError(error || '');
                            }}
                            autoComplete="tel"
                            className={`w-full px-5 py-4 text-base bg-[#f5f5f0] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#bbdae9] focus:border-[#bbdae9] placeholder:text-gray-400 ${
                              validationError ? 'ring-2 ring-[#bbdae9] border-[#bbdae9]' : ''
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
                          onClick={handleDownload}
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1a1a1a] text-white rounded-full font-medium text-base hover:bg-[#bbdae9] hover:text-[#1a1a1a] transition-colors"
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
