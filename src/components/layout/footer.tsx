'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, ArrowRight, Heart, ShieldCheck, Leaf, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FooterProps {
  logo?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  amazonStoreUrl?: string | null;
}

// Avatar images
const AVATAR_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
];

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
    <footer className="bg-[var(--primary)]">
      {/* Newsletter Section */}
      <div className="bg-[var(--secondary)]">
        <div className="container py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)] mb-4 block">
                  Join Our Community
                </span>
                <h3 className="text-3xl md:text-4xl font-light mb-4">
                  Stay in the Know
                </h3>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  Get exclusive access to new products, eye care tips, and special offers delivered to your inbox.
                </p>
              </div>
              <div>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-white border-[var(--border)]"
                      required
                    />
                    <Button
                      type="submit"
                      loading={status === 'loading'}
                      className="shrink-0 px-8"
                    >
                      {status === 'success' ? 'Subscribed!' : 'Subscribe'}
                    </Button>
                  </div>
                  {status === 'error' && (
                    <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
                  )}
                  {status === 'success' && (
                    <p className="text-[var(--success)] text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4" /> Welcome to the Archie&apos;s community!
                    </p>
                  )}
                </form>
                <p className="text-xs text-[var(--muted-foreground)] mt-4">
                  By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4">
            {logo ? (
              <Image
                src={logo}
                alt="Archie's Remedies"
                width={160}
                height={40}
                className="h-10 w-auto mb-6"
              />
            ) : (
              <span className="text-xl font-medium block mb-6">Archie&apos;s Remedies</span>
            )}
            <p className="text-[var(--foreground)]/70 text-sm leading-relaxed mb-8 max-w-xs">
              Clean, effective eye care made without preservatives, phthalates, parabens, or sulfates. Because your eyes deserve better.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-[var(--foreground)]/70">
                <ShieldCheck className="w-5 h-5 text-[var(--primary-dark)]" />
                <span>Ophthalmologist Tested</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--foreground)]/70">
                <Leaf className="w-5 h-5 text-[var(--primary-dark)]" />
                <span>Clean Formula</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-[var(--foreground)] hover:bg-white hover:shadow-md transition-all duration-300"
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
                  className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-[var(--foreground)] hover:bg-white hover:shadow-md transition-all duration-300"
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
                  className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-[var(--foreground)] hover:bg-white hover:shadow-md transition-all duration-300"
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
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[var(--foreground)]/50 mb-6">
              Shop
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/products/eye-drops"
                  className="text-sm text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors flex items-center gap-2 group"
                >
                  Eye Drops
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link
                  href="/products/eye-wipes"
                  className="text-sm text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors flex items-center gap-2 group"
                >
                  Eye Wipes
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              {amazonStoreUrl && (
                <li>
                  <a
                    href={amazonStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors flex items-center gap-2 group"
                  >
                    Amazon Store
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Company Column */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[var(--foreground)]/50 mb-6">
              Company
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[var(--foreground)]/50 mb-6">
              Legal
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Reviews Column */}
          <div className="col-span-2 md:col-span-2">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[var(--foreground)]/50 mb-6">
              Reviews
            </h4>
            <div className="bg-white/40 rounded-2xl p-5">
              <div className="flex -space-x-2 mb-3">
                {AVATAR_IMAGES.slice(0, 4).map((src, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-white overflow-hidden"
                  >
                    <Image
                      src={src}
                      alt="Customer"
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[1,2,3,4,5].map(i => (
                  <Sparkles key={i} className="w-4 h-4 text-amber-500" />
                ))}
              </div>
              <p className="text-sm font-medium">4.9 out of 5</p>
              <p className="text-xs text-[var(--foreground)]/60">2,500+ verified reviews</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[var(--primary-dark)]/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--foreground)]/60">
              © {new Date().getFullYear()} Archie&apos;s Remedies. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-[var(--foreground)]/50">
                Made with care in the USA
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
