'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, Phone, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export interface EmailSignupSectionProps {
  emailSignupTitle?: string | null;
  emailSignupSubtitle?: string | null;
  emailSignupPlaceholder?: string | null;
  emailSignupButtonText?: string | null;
  emailSignupSuccessMessage?: string | null;
  privacyUrl?: string | null;
  termsUrl?: string | null;
  isDark?: boolean;
}

export function EmailSignupSection({
  emailSignupTitle = "Join the Archie's Community",
  emailSignupSubtitle = 'Expert eye care tips, new product drops, and wellness inspiration. No spam, ever.',
  emailSignupPlaceholder = 'Enter your email',
  emailSignupButtonText = 'Sign Up',
  emailSignupSuccessMessage = "You're on the list.",
  privacyUrl = '/privacy',
  termsUrl = '/terms',
  isDark = true,
}: EmailSignupSectionProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeContactType, setSubscribeContactType] = useState<'email' | 'phone'>('email');
  const [subscribeContactValue, setSubscribeContactValue] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeContactValue) return;

    setStatus('loading');
    try {
      const body = subscribeContactType === 'email'
        ? { email: subscribeContactValue, source: 'footer' }
        : { phone: subscribeContactValue, source: 'footer' };

      const res = await fetch('/api/contacts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setStatus('success');
        setSubscribeContactValue('');
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <>
      <div className="py-16 md:py-20">
        {/* Desktop: Flex layout with fluid padding, title left, form right */}
        <div
          className="hidden md:flex justify-between items-center gap-6 lg:gap-10"
          style={{
            paddingLeft: 'var(--footer-side-padding)',
            paddingRight: 'var(--footer-side-padding)'
          }}
        >
          {/* Left: Title and Subtitle - constrained width on tablet to allow wrapping */}
          <div className="flex-shrink-0 max-w-[200px] lg:max-w-[280px] xl:max-w-none">
            <h3 className="text-[12px] font-semibold tracking-[0.15em] uppercase leading-tight">
              {emailSignupTitle}
            </h3>
            <p className="text-white text-[11px] leading-tight mt-1">
              {emailSignupSubtitle}
            </p>
          </div>

          {/* Right: Form + legal - anchored right, contents left-aligned within */}
          <div className="flex flex-col flex-shrink-0">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-[44px] px-6 bg-white/10 text-white font-semibold text-xs uppercase tracking-[0.1em] flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Subscribed!
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubscribe}
                  className="flex items-stretch h-[44px]"
                >
                  {/* Toggle: Email/Phone - blue when selected */}
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => { setSubscribeContactType('email'); setSubscribeContactValue(''); }}
                      className={cn(
                        'px-3 flex items-center justify-center transition-colors',
                        subscribeContactType === 'email'
                          ? 'bg-[var(--primary)] text-black'
                          : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                      )}
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSubscribeContactType('phone'); setSubscribeContactValue(''); }}
                      className={cn(
                        'px-3 flex items-center justify-center transition-colors border-r border-white/20',
                        subscribeContactType === 'phone'
                          ? 'bg-[var(--primary)] text-black'
                          : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                      )}
                      title="Phone"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Input - responsive width: smaller on tablet, larger on desktop */}
                  <input
                    type={subscribeContactType === 'email' ? 'email' : 'tel'}
                    placeholder={subscribeContactType === 'email' ? 'Enter your email' : 'Enter phone #'}
                    value={subscribeContactValue}
                    onChange={(e) => setSubscribeContactValue(e.target.value)}
                    className="w-[160px] lg:w-[224px] xl:w-[266px] bg-white text-black px-4 text-sm focus:outline-none placeholder:text-gray-400"
                    required
                  />
                  {/* Submit - blue hover */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-6 bg-white text-black font-semibold text-[11px] uppercase tracking-[0.1em] hover:bg-[var(--primary)] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {status === 'loading' ? (
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        Submit
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {status === 'error' && (
              <p className="text-red-400 text-[10px] mt-2">Something went wrong.</p>
            )}

            <p className="text-white/60 text-[9px] leading-relaxed mt-3 max-w-[320px] lg:max-w-[384px] xl:max-w-[426px]">
              By signing up via text you agree to receive recurring automated marketing messages. Consent is not a condition of purchase. Reply STOP to unsubscribe.{' '}
              <Link href={privacyUrl || '/privacy'} className="underline">Privacy Policy</Link> •{' '}
              <Link href={termsUrl || '/terms'} className="underline">Terms</Link>.
            </p>
          </div>
        </div>

        {/* Mobile: Stacked layout - Title, then 80% width centered form */}
        <div className="md:hidden px-5">
          <div className="text-center mb-6">
            <h3 className="text-[12px] font-semibold tracking-[0.15em] uppercase leading-tight">
              {emailSignupTitle}
            </h3>
            <p className="text-white text-[11px] leading-tight mt-1">
              {emailSignupSubtitle}
            </p>
          </div>

          {/* Centered form container - 80% width */}
          <div className="flex justify-center">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full py-4 bg-white/10 text-white font-semibold text-xs uppercase tracking-[0.1em] flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Subscribed!
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubscribe}
                  className="flex items-stretch h-[52px] w-full"
                >
                  {/* Toggle: Email/Phone - blue when selected */}
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => { setSubscribeContactType('email'); setSubscribeContactValue(''); }}
                      className={cn(
                        'px-4 flex items-center justify-center transition-colors',
                        subscribeContactType === 'email'
                          ? 'bg-[var(--primary)] text-black'
                          : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                      )}
                      title="Email"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSubscribeContactType('phone'); setSubscribeContactValue(''); }}
                      className={cn(
                        'px-4 flex items-center justify-center transition-colors border-r border-white/20',
                        subscribeContactType === 'phone'
                          ? 'bg-[var(--primary)] text-black'
                          : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                      )}
                      title="Phone"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Input */}
                  <input
                    type={subscribeContactType === 'email' ? 'email' : 'tel'}
                    placeholder={subscribeContactType === 'email' ? 'Your email' : 'Phone #'}
                    value={subscribeContactValue}
                    onChange={(e) => setSubscribeContactValue(e.target.value)}
                    className="flex-1 min-w-0 bg-white text-black px-4 text-sm focus:outline-none placeholder:text-gray-400"
                    required
                  />
                  {/* Submit - square icon-only on mobile */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-[52px] flex-shrink-0 bg-white text-black hover:bg-[var(--primary)] transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {status === 'loading' ? (
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-xs mt-2 text-center">Something went wrong. Please try again.</p>
          )}

          <p className="text-white/60 text-[9px] leading-relaxed mt-4 text-center">
            By signing up via text you agree to receive recurring automated marketing messages. Consent is not a condition of purchase. Reply STOP to unsubscribe.{' '}
            <Link href={privacyUrl || '/privacy'} className="underline">Privacy</Link> •{' '}
            <Link href={termsUrl || '/terms'} className="underline">Terms</Link>.
          </p>
        </div>
      </div>

      {/* Break line - with gutters matching content, pure white, 1px */}
      <div
        className="hidden md:block h-px bg-white"
        style={{
          marginLeft: 'var(--footer-side-padding)',
          marginRight: 'var(--footer-side-padding)'
        }}
      />
      <div className="md:hidden h-px bg-white mx-5" />
    </>
  );
}
