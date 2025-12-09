'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  title = 'Join the Archie\'s Community',
  subtitle = 'Get 10% off your first order and be the first to know about new products and exclusive offers.',
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-lg"
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                aria-label="Close popup"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Image side */}
                <div className="relative h-48 md:h-auto md:w-2/5 bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Archie's Remedies"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-6xl mb-2">💧</div>
                        <span className="text-sm font-medium opacity-80">Clean Eye Care</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content side */}
                <div className="p-8 md:w-3/5">
                  {status === 'success' ? (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4">🎉</div>
                      <h3 className="text-2xl font-light mb-2">Welcome!</h3>
                      <p className="text-[var(--muted-foreground)]">
                        Check your email for your discount code.
                      </p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl md:text-3xl font-light mb-3">
                        {title}
                      </h3>
                      <p className="text-[var(--muted-foreground)] mb-6">
                        {subtitle}
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          error={status === 'error'}
                        />
                        {status === 'error' && (
                          <p className="text-sm text-[var(--error)]">
                            Something went wrong. Please try again.
                          </p>
                        )}
                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          loading={status === 'loading'}
                        >
                          {buttonText}
                        </Button>
                      </form>

                      <p className="text-xs text-[var(--muted-foreground)] mt-4 text-center">
                        By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
