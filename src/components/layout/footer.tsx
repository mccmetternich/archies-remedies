'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-[var(--foreground)] text-white">
      {/* Email Signup Section */}
      <div className="border-b border-white/10">
        <div className="container py-12 md:py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-light mb-3">
              Join the Archie&apos;s Community
            </h3>
            <p className="text-white/60 mb-6">
              Be the first to know about new products, exclusive offers, and eye care tips.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                required
              />
              <Button
                type="submit"
                variant="secondary"
                loading={status === 'loading'}
                className="shrink-0"
              >
                {status === 'success' ? 'Subscribed!' : 'Subscribe'}
              </Button>
            </form>
            {status === 'error' && (
              <p className="text-red-400 text-sm mt-2">Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            {logo ? (
              <Image
                src={logo}
                alt="Archie's Remedies"
                width={140}
                height={35}
                className="h-8 w-auto mb-4 brightness-0 invert"
              />
            ) : (
              <span className="text-lg font-medium block mb-4">Archie&apos;s Remedies</span>
            )}
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Safe, effective eye care made clean without the questionable ingredients.
            </p>
            <div className="flex gap-4">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[var(--primary)] transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[var(--primary)] transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[var(--primary)] transition-colors"
                  aria-label="TikTok"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-xs font-medium tracking-widest uppercase mb-4 text-white/40">
              Shop
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products/eye-drops"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Eye Drops
                </Link>
              </li>
              <li>
                <Link
                  href="/products/eye-wipes"
                  className="text-white/60 hover:text-white transition-colors text-sm"
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
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    Amazon Store →
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-xs font-medium tracking-widest uppercase mb-4 text-white/40">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-xs font-medium tracking-widest uppercase mb-4 text-white/40">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-[var(--primary)] border-2 border-[var(--foreground)] flex items-center justify-center text-xs font-medium text-[var(--foreground)]"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-white/60 ml-2">
                <span className="text-white font-medium">4.8★</span> from 2,500+ reviews
              </div>
            </div>
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} Archie&apos;s Remedies. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
