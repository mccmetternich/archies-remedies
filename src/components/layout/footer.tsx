'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, ArrowRight, Star } from 'lucide-react';

interface FooterProps {
  logo?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  amazonStoreUrl?: string | null;
}

export function Footer({
  logo,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  amazonStoreUrl,
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 4000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer>
      {/* Newsletter Section - More spacing */}
      <div className="bg-[var(--cream)] pt-20 pb-24 md:pt-24 md:pb-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-8">
              <span className="w-12 h-px bg-[var(--foreground)]" />
              Newsletter
              <span className="w-12 h-px bg-[var(--foreground)]" />
            </span>
            <h3 className="text-3xl md:text-4xl font-normal mb-6 tracking-tight">
              Stay in the Know
            </h3>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-10 max-w-md mx-auto">
              Get exclusive access to new products, eye care tips, and special offers.
            </p>

            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-5 py-4 text-base bg-white border border-[var(--border)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
                  required
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-4 bg-[var(--foreground)] text-white rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                  ) : status === 'success' ? (
                    'Done!'
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
              {status === 'error' && (
                <p className="text-red-500 text-sm mt-3">Something went wrong. Please try again.</p>
              )}
              {status === 'success' && (
                <p className="text-[var(--foreground)] text-sm mt-3">Welcome to the community!</p>
              )}
            </form>
            <p className="text-xs text-[var(--muted-foreground)] mt-4">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer - Blue Background - More room at top */}
      <div className="bg-[var(--primary)]">
        <div className="container pt-24 pb-20 md:pt-28 md:pb-24">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-4">
              {logo ? (
                <Image
                  src={logo}
                  alt="Archie's Remedies"
                  width={160}
                  height={40}
                  className="h-9 w-auto mb-6"
                />
              ) : (
                <span className="text-lg font-medium block mb-6 tracking-tight text-[var(--foreground)]">Archie&apos;s Remedies</span>
              )}
              <p className="text-[var(--foreground)]/70 text-sm leading-relaxed mb-8 max-w-xs">
                Clean, effective eye care made without preservatives, phthalates, parabens, or sulfates.
              </p>

              {/* Social Links */}
              <div className="flex gap-3">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-[var(--foreground)] hover:bg-white hover:text-[var(--foreground)] transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-[var(--foreground)] hover:bg-white hover:text-[var(--foreground)] transition-all duration-300"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-[var(--foreground)] hover:bg-white hover:text-[var(--foreground)] transition-all duration-300"
                    aria-label="TikTok"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Shop Column */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--foreground)]/60 mb-6">
                Shop
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/products/eye-drops"
                    className="text-sm text-[var(--foreground)] hover:text-[var(--foreground)]/70 transition-colors"
                  >
                    Eye Drops
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/eye-wipes"
                    className="text-sm text-[var(--foreground)] hover:text-[var(--foreground)]/70 transition-colors"
                  >
                    Eye Wipes
                  </Link>
                </li>
                {amazonStoreUrl && (
                  <li>
                    <a
                      href={amazonStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--foreground)] hover:text-[var(--foreground)]/70 transition-colors flex items-center gap-1"
                    >
                      Amazon Store
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Company Column */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--foreground)]/60 mb-6">
                Company
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-[var(--foreground)] hover:text-[var(--foreground)]/70 transition-colors"
                  >
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-[var(--foreground)] hover:text-[var(--foreground)]/70 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-sm text-[var(--foreground)] hover:text-[var(--foreground)]/70 transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--foreground)]/60 mb-6">
                Legal
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-[var(--foreground)] hover:text-[var(--foreground)]/70 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-[var(--foreground)] hover:text-[var(--foreground)]/70 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Reviews Badge - integrated look */}
            <div className="col-span-2 md:col-span-2">
              <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--foreground)]/60 mb-6">
                Reviews
              </h4>
              <div className="bg-[var(--foreground)]/10 rounded-2xl p-6 border border-[var(--foreground)]/10">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-4 h-4 fill-[var(--foreground)] text-[var(--foreground)]" />
                  ))}
                </div>
                <p className="text-2xl font-normal tracking-tight mb-1 text-[var(--foreground)]">4.9</p>
                <p className="text-xs text-[var(--foreground)]/60">2,500+ verified reviews</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-[var(--foreground)]/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[var(--foreground)]/70">
                &copy; {new Date().getFullYear()} Archie&apos;s Remedies. All rights reserved.
              </p>
              <p className="text-xs text-[var(--foreground)]/70">
                Made with care in the USA
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
