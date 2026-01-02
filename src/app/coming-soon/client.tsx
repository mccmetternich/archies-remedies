'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, ArrowRight, Loader2, Sparkles, ChevronDown, Instagram, Settings } from 'lucide-react';
import Link from 'next/link';
import { formatPhoneNumber, validatePhone, validateEmail } from '@/lib/form-utils';

interface ComingSoonClientProps {
  logoUrl?: string;
  badgeUrl?: string;
  title: string;
  subtitle: string;
  siteName: string;
  footerStyle?: 'badges' | 'quip';
  callout1?: string;
  callout2?: string;
  callout3?: string;
  brandQuip?: string;
  defaultContactType?: 'email' | 'phone';
  instagramUrl?: string;
  facebookUrl?: string;
}

export function ComingSoonClient({
  logoUrl,
  badgeUrl,
  title,
  subtitle,
  siteName,
  footerStyle = 'badges',
  callout1 = 'Preservative-Free',
  callout2 = 'Clean Ingredients',
  callout3 = 'Made in USA',
  brandQuip = 'Where clean beauty meets clear vision.',
  defaultContactType = 'phone',
  instagramUrl,
  facebookUrl,
}: ComingSoonClientProps) {
  const [contactValue, setContactValue] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>(defaultContactType);
  const [showDropdown, setShowDropdown] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  // Phone/email validation functions imported from @/lib/form-utils

  // Handle input change with formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (contactType === 'phone') {
      const formatted = formatPhoneNumber(value);
      setContactValue(formatted);
      setValidationError('');
    } else {
      setContactValue(value);
      setValidationError('');
    }

    if (status === 'error') {
      setStatus('idle');
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactValue) return;

    if (contactType === 'phone') {
      const error = validatePhone(contactValue);
      if (error) {
        setValidationError(error);
        return;
      }
    } else {
      const error = validateEmail(contactValue);
      if (error) {
        setValidationError(error);
        return;
      }
    }

    setValidationError('');
    setStatus('loading');

    try {
      const phoneDigits = contactType === 'phone' ? contactValue.replace(/\D/g, '') : null;

      const payload = contactType === 'email'
        ? { email: contactValue, source: 'coming-soon' }
        : { phone: phoneDigits, source: 'coming-soon' };

      const res = await fetch('/api/contacts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus('success');
        setContactValue('');
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Something went wrong');
        setStatus('error');
      }
    } catch {
      setErrorMessage('Failed to subscribe. Please try again.');
      setStatus('error');
    }
  };

  const toggleContactType = (type: 'email' | 'phone') => {
    setContactType(type);
    setContactValue('');
    setValidationError('');
    setShowDropdown(false);
    if (status === 'error') {
      setStatus('idle');
    }
  };

  return (
    <>
      {/* CSS for smooth badge rotation - GPU accelerated */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
          will-change: transform;
        }
        @keyframes gentle-glow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(187,218,233,0.3);
            opacity: 0.9;
          }
          50% {
            box-shadow: 0 0 25px rgba(187,218,233,0.5);
            opacity: 1;
          }
        }
        .animate-gentle-glow {
          animation: gentle-glow 2.5s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-[#f5f0eb] via-white to-[#bbdae9]/20 flex items-start md:items-center justify-center px-5 pt-[15vh] md:pt-0 md:py-8 overflow-x-hidden">
        {/* Background decorative elements - contained within viewport */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-24 w-64 h-64 md:w-96 md:h-96 bg-[#bbdae9]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-24 w-64 h-64 md:w-96 md:h-96 bg-[#bbdae9]/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-md md:max-w-xl w-full text-center">
          {/* Logo with rotating badge - using CSS animation */}
          <div className="mb-8 md:mb-12">
            {logoUrl ? (
              <div className="relative inline-block">
                {/* Rotating badge - CSS animation for smooth performance */}
                {badgeUrl && (
                  <div className="absolute -top-6 -right-10 md:-top-8 md:-right-14 w-[60px] h-[60px] md:w-[80px] md:h-[80px] z-0 animate-spin-slow">
                    <Image
                      src={badgeUrl}
                      alt="Badge"
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                {/* Logo - 30% smaller on mobile */}
                <Image
                  src={logoUrl}
                  alt={siteName}
                  width={180}
                  height={72}
                  className="h-[50px] md:h-[72px] w-auto object-contain relative z-10"
                  priority
                />
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-full shadow-sm border border-[#e5e5e5]">
                <Sparkles className="w-4 h-4 text-[#bbdae9]" />
                <span className="text-base font-medium tracking-tight">{siteName}</span>
              </div>
            )}
          </div>

          {/* Main content - fixed height container with absolute positioning to prevent jump */}
          <div className="relative h-[340px] md:h-[380px]">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex flex-col justify-start pt-4 md:justify-center md:pt-0 text-center"
                >
                  {/* Title with checkmark */}
                  <div className="flex items-center justify-center gap-3 mb-5">
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
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight">
                      You're In
                    </h1>
                  </div>
                  <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed px-4">
                    We'll let you know when we launch.<br />Follow us for updates.
                  </p>

                  {/* Social links */}
                  <div className="flex items-center justify-center gap-4">
                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#bbdae9] flex items-center justify-center text-[#1a1a1a] active:bg-[#a8d0e0] transition-colors"
                      >
                        <Instagram className="w-5 h-5 md:w-6 md:h-6" />
                      </a>
                    )}
                    {facebookUrl && (
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center text-gray-600 active:border-[#bbdae9] transition-colors"
                      >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex flex-col justify-start pt-4 md:justify-center md:pt-0"
                >
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight mb-4 md:mb-6">
                    {title}
                  </h1>
                  <p className="text-base md:text-xl text-gray-600 mb-8 md:mb-12 leading-relaxed px-2 max-w-sm md:max-w-md mx-auto">
                    {subtitle}
                  </p>

                  {/* Contact form - stacked on mobile, inline on desktop */}
                  <form onSubmit={handleSubmit} className="w-full px-2 md:max-w-md md:mx-auto">
                    {/* Desktop: inline input with button inside */}
                    {/* Mobile: stacked input and button */}
                    <div className="relative">
                      {/* Dropdown selector */}
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 md:top-[26px] md:-translate-y-1/2">
                        <button
                          type="button"
                          onClick={() => setShowDropdown(!showDropdown)}
                          className="flex items-center gap-1 px-2 py-2 text-gray-500 active:text-gray-700 md:hover:text-gray-700 transition-colors rounded-lg active:bg-gray-100 md:hover:bg-gray-100"
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
                                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left active:bg-gray-50 md:hover:bg-gray-50 transition-colors ${
                                  contactType === 'phone' ? 'text-[#1a1a1a] font-medium' : 'text-gray-600'
                                }`}
                              >
                                <Phone className="w-4 h-4" />
                                Phone
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleContactType('email')}
                                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left active:bg-gray-50 md:hover:bg-gray-50 transition-colors ${
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

                      {/* Input - different padding for mobile vs desktop */}
                      <input
                        type={contactType === 'email' ? 'email' : 'tel'}
                        inputMode={contactType === 'email' ? 'email' : 'tel'}
                        value={contactValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder={contactType === 'email' ? 'Enter your email' : 'Enter Phone #'}
                        required
                        autoComplete={contactType === 'email' ? 'email' : 'tel'}
                        className={`w-full pl-14 pr-4 py-4 md:pl-16 md:pr-36 md:py-5 text-base md:text-lg rounded-full border bg-white shadow-sm transition-colors outline-none ${
                          validationError ? 'border-[#bbdae9]' : 'border-gray-200 focus:border-[#bbdae9]'
                        }`}
                        style={{ fontSize: '16px' }}
                      />

                      {/* Desktop only: button inside input */}
                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-[#1a1a1a] text-white rounded-full font-medium transition-all items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#bbdae9] hover:text-[#1a1a1a] group"
                      >
                        {status === 'loading' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Notify Me
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Mobile only: separate button below input */}
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="md:hidden w-full mt-3 py-4 bg-[#1a1a1a] text-white rounded-full font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 active:bg-[#bbdae9] active:text-[#1a1a1a]"
                    >
                      {status === 'loading' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Notify Me
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Error message */}
                    <AnimatePresence mode="wait">
                      {(validationError || status === 'error') && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="mt-3 flex justify-center"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#bbdae9]/20 border border-[#bbdae9]/40 rounded-full">
                            <svg className="w-4 h-4 text-[#7ab8d4] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-600">
                              {validationError || errorMessage}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>

                  {/* Footer - Brand quip */}
                  <div className="mt-8 md:mt-16">
                    {footerStyle === 'badges' ? (
                      <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-gray-500">
                        {callout1 && (
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#bbdae9] rounded-full" />
                            {callout1}
                          </span>
                        )}
                        {callout2 && (
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#bbdae9] rounded-full" />
                            {callout2}
                          </span>
                        )}
                        {callout3 && (
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#bbdae9] rounded-full" />
                            {callout3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-[#bbdae9]/40 border border-[#bbdae9]/50 rounded-full animate-gentle-glow">
                          <span className="text-sm md:text-base">✨</span>
                          <span className="text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap">
                            {brandQuip}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowDropdown(false)}
          />
        )}

        {/* Team Access Badge - Bottom right cog */}
        <Link
          href="/team-access"
          className="fixed bottom-4 right-4 z-50 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-[#1a1a1a] hover:border-[#bbdae9] hover:bg-white transition-all duration-200 group"
          aria-label="Team Access"
        >
          <Settings className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:rotate-90" />
        </Link>
      </div>
    </>
  );
}
