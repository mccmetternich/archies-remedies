'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';

interface ComingSoonClientProps {
  logoUrl?: string;
  badgeUrl?: string;
  title: string;
  subtitle: string;
  siteName: string;
}

export function ComingSoonClient({
  logoUrl,
  badgeUrl,
  title,
  subtitle,
  siteName,
}: ComingSoonClientProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'coming-soon' }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
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
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          {logoUrl ? (
            <div className="relative inline-block">
              <Image
                src={logoUrl}
                alt={siteName}
                width={200}
                height={80}
                className="h-20 w-auto object-contain"
                priority
              />
              {/* Rotating badge overlay */}
              {badgeUrl && (
                <motion.div
                  className="absolute -top-4 -right-8 w-20 h-20"
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
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-sm border border-[#e5e5e5]">
              <Sparkles className="w-5 h-5 text-[#bbdae9]" />
              <span className="text-lg font-medium tracking-tight">{siteName}</span>
            </div>
          )}
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-normal tracking-tight mb-6">
            {title}
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Email form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-2xl p-6 max-w-md mx-auto"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-green-900 mb-2">You're on the list!</h3>
              <p className="text-green-700">
                We'll notify you as soon as we launch. Keep an eye on your inbox.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-14 pr-36 py-5 text-lg rounded-full border-2 border-gray-200 focus:border-[#bbdae9] focus:outline-none focus:ring-4 focus:ring-[#bbdae9]/20 transition-all bg-white shadow-sm"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-[#1a1a1a] text-white rounded-full font-medium hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
              {status === 'error' && (
                <p className="text-red-500 text-sm mt-3">{errorMessage}</p>
              )}
            </form>
          )}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-gray-500"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#bbdae9] rounded-full" />
            Preservative-Free
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#bbdae9] rounded-full" />
            Clean Ingredients
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#bbdae9] rounded-full" />
            Made in USA
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
