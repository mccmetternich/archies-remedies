'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';

interface EmailPopupProps {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  imageUrl?: string | null;
  delay?: number; // ms before showing
}

export function EmailPopup({
  enabled = true,
  title = 'Join the Clean Eye Care Movement',
  subtitle = 'Get 10% off your first order plus exclusive access to new products and wellness tips.',
  buttonText = 'Get My 10% Off',
  imageUrl,
  delay = 3000,
}: EmailPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!enabled) return;

    // Check if user has already seen/dismissed the popup
    const hasSeenPopup = localStorage.getItem('archies-popup-dismissed');
    if (hasSeenPopup) return;

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, delay]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('archies-popup-dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'popup' }),
      });

      if (res.ok) {
        setStatus('success');
        localStorage.setItem('archies-popup-dismissed', 'true');
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92%] max-w-md"
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

              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-[var(--primary-light)] via-[var(--cream)] to-[var(--primary)]">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Archie's Remedies"
                    fill
                    className="object-cover"
                  />
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

              {/* Content */}
              <div className="p-8">
                {status === 'success' ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h3 className="text-2xl font-normal mb-2 tracking-tight">Welcome!</h3>
                    <p className="text-[var(--muted-foreground)]">
                      Check your email for your discount code.
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

                    <form onSubmit={handleSubmit} className="space-y-4">
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

                    <p className="text-xs text-[var(--muted-foreground)] mt-6 text-center">
                      No spam, ever. Unsubscribe anytime.
                    </p>
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
