'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, ArrowRight, Loader2, Sparkles, ChevronDown, Instagram } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactValue) return;

    setStatus('loading');
    try {
      const payload = contactType === 'email'
        ? { email: contactValue, source: 'coming-soon' }
        : { phone: contactValue, source: 'coming-soon' };

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
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f0eb] via-white to-[#bbdae9]/20 flex items-center justify-center p-6">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#bbdae9]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#bbdae9]/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-xl w-full text-center"
      >
        {/* Logo with rotating badge behind */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          {logoUrl ? (
            <div className="relative inline-block">
              {/* Rotating badge peeking from top-right corner */}
              {badgeUrl && (
                <motion.div
                  className="absolute -top-10 -right-12 w-[100px] h-[100px] z-0"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <Image
                    src={badgeUrl}
                    alt="Badge"
                    width={100}
                    height={100}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              )}
              <Image
                src={logoUrl}
                alt={siteName}
                width={200}
                height={80}
                className="h-20 w-auto object-contain relative z-10"
                priority
              />
            </div>
          ) : (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-sm border border-[#e5e5e5]">
              <Sparkles className="w-5 h-5 text-[#bbdae9]" />
              <span className="text-lg font-medium tracking-tight">{siteName}</span>
            </div>
          )}
        </motion.div>

        {/* Main content - switches between default and success state */}
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Success checkmark animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 bg-[#bbdae9] rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="w-10 h-10 text-[#1a1a1a]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path d="M5 13l4 4L19 7" />
                </motion.svg>
              </motion.div>

              <h1 className="text-5xl md:text-6xl font-normal tracking-tight mb-6">
                You're In
              </h1>
              <p className="text-xl text-gray-600 mb-12 max-w-md mx-auto leading-relaxed">
                We'll let you know when we launch. Follow us for updates.
              </p>

              {/* Social links */}
              <div className="flex items-center justify-center gap-4">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center text-gray-600 hover:text-[#1a1a1a] hover:border-[#bbdae9] transition-all"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center text-gray-600 hover:text-[#1a1a1a] hover:border-[#bbdae9] transition-all"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-normal tracking-tight mb-6">
                {title}
              </h1>
              <p className="text-xl text-gray-600 mb-12 max-w-md mx-auto leading-relaxed">
                {subtitle}
              </p>

              {/* Contact form */}
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="max-w-md mx-auto"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="relative">
                  {/* Dropdown selector for contact type */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <button
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center gap-1 px-2 py-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      {contactType === 'email' ? (
                        <Mail className="w-5 h-5" />
                      ) : (
                        <Phone className="w-5 h-5" />
                      )}
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {/* Dropdown menu */}
                    <AnimatePresence>
                      {showDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[140px] z-20"
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
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={contactType === 'email' ? 'Enter your email' : 'Enter your phone number'}
                    required
                    className="w-full pl-16 pr-36 py-5 text-lg rounded-full border border-gray-200 bg-white shadow-sm transition-all focus:outline-none focus:border-[#bbdae9] focus:ring-0"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-[#1a1a1a] text-white rounded-full font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#bbdae9] hover:text-[#1a1a1a] group"
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
                {status === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-3"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </motion.form>

              {/* Footer - Trust badges or Brand quip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-16"
              >
                {footerStyle === 'badges' ? (
                  <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                    {callout1 && (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#bbdae9] rounded-full" />
                        {callout1}
                      </span>
                    )}
                    {callout2 && (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#bbdae9] rounded-full" />
                        {callout2}
                      </span>
                    )}
                    {callout3 && (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#bbdae9] rounded-full" />
                        {callout3}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-lg text-gray-500 italic text-center max-w-md mx-auto">
                    {brandQuip}
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
