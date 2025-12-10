'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, ArrowRight, ChevronDown, Droplet, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  logo?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  amazonStoreUrl?: string | null;
  massiveFooterLogoUrl?: string | null;
}

export function Footer({
  logo,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  amazonStoreUrl,
  massiveFooterLogoUrl,
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Mobile accordion states
  const [openSection, setOpenSection] = useState<string | null>(null);

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
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* ROW 1: Community Invitation - Full Width */}
      <div className="py-20 md:py-24">
        <div className="container">
          {status === 'success' ? (
            <div className="text-center py-8">
              <p className="text-2xl font-light tracking-wide animate-fade-in">
                You&apos;re on the list.
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-20">
              {/* Text Group - Left */}
              <div className="lg:max-w-md">
                <h3 className="text-sm font-semibold tracking-[0.15em] uppercase mb-4">
                  Join the Archie&apos;s Community
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Expert eye care tips, new product drops, and wellness inspiration. No spam, ever.
                </p>
              </div>

              {/* Input Group - Right */}
              <form onSubmit={handleSubscribe} className="flex-1 lg:max-w-lg">
                <div className="flex items-center gap-4 border-b border-white/30 pb-3 group focus-within:border-white transition-colors">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder:text-white/40 text-base focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex items-center gap-2 text-sm font-medium tracking-wide uppercase text-white hover:text-white/70 transition-colors disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign Up
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-red-400 text-xs mt-3">Something went wrong. Please try again.</p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Separator */}
      <div className="container">
        <div className="h-px bg-white/10" />
      </div>

      {/* ROW 2: Navigation Grid */}
      <div className="py-16 md:py-20">
        <div className="container">
          {/* Desktop Grid - 5 Columns */}
          <div className="hidden md:grid md:grid-cols-12 gap-10 lg:gap-16">
            {/* Column 1: Brand Anchor */}
            <div className="col-span-3">
              {logo ? (
                <Image
                  src={logo}
                  alt="Archie's Remedies"
                  width={180}
                  height={45}
                  className="h-8 w-auto mb-8 brightness-0 invert"
                />
              ) : (
                <span className="text-xl font-medium block mb-8 tracking-tight">
                  Archie&apos;s Remedies
                </span>
              )}

              {/* Social Icons */}
              <div className="flex gap-4">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-[18px] h-[18px]" />
                  </a>
                )}
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label="TikTok"
                  >
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-[18px] h-[18px]" />
                  </a>
                )}
              </div>
            </div>

            {/* Column 2: Shop */}
            <div className="col-span-2">
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase mb-6 text-white">
                Shop
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/products/eye-drops" className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed">
                    Dry Eye Drops
                  </Link>
                </li>
                <li>
                  <Link href="/products/eye-wipes" className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed">
                    Lid & Lash Wipes
                  </Link>
                </li>
                {amazonStoreUrl && (
                  <li>
                    <a
                      href={amazonStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed inline-flex items-center gap-1"
                    >
                      Shop on Amazon
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Column 3: Learn */}
            <div className="col-span-2">
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase mb-6 text-white">
                Learn
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/our-story" className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Support */}
            <div className="col-span-2">
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase mb-6 text-white">
                Support
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Certifications - Icons Only */}
            <div className="col-span-3">
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase mb-6 text-white">
                Certifications
              </h4>
              <div className="flex gap-6">
                {/* Preservative Free */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
                    <Droplet className="w-4 h-4 text-white/80" />
                  </div>
                  <span className="text-[10px] text-white/50 uppercase tracking-wide">Preservative Free</span>
                </div>
                {/* Made in USA */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
                    <Flag className="w-4 h-4 text-white/80" />
                  </div>
                  <span className="text-[10px] text-white/50 uppercase tracking-wide">Made in USA</span>
                </div>
                {/* Cruelty Free */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 4c-2 0-3.5 1-4.5 2.5S6 9.5 6 11c0 2 1 3.5 2 4.5s2 2 2 3.5v1h4v-1c0-1.5 1-2.5 2-3.5s2-2.5 2-4.5c0-1.5-.5-3-1.5-4.5S14 4 12 4z" />
                      <path d="M10 8.5c-.5-.5-1.5-.5-2.5.5M14 8.5c.5-.5 1.5-.5 2.5.5" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-white/50 uppercase tracking-wide">Cruelty Free</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Accordions */}
          <div className="md:hidden space-y-0">
            {/* Brand - Always Visible */}
            <div className="pb-8">
              {logo ? (
                <Image
                  src={logo}
                  alt="Archie's Remedies"
                  width={150}
                  height={38}
                  className="h-7 w-auto mb-6 brightness-0 invert"
                />
              ) : (
                <span className="text-lg font-medium block mb-6 tracking-tight">
                  Archie&apos;s Remedies
                </span>
              )}

              {/* Social Icons */}
              <div className="flex gap-5">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label="TikTok"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Shop Accordion */}
            <MobileAccordion
              title="Shop"
              isOpen={openSection === 'shop'}
              onToggle={() => toggleSection('shop')}
            >
              <ul className="space-y-4 pb-4">
                <li>
                  <Link href="/products/eye-drops" className="text-sm text-white/60">
                    Dry Eye Drops
                  </Link>
                </li>
                <li>
                  <Link href="/products/eye-wipes" className="text-sm text-white/60">
                    Lid & Lash Wipes
                  </Link>
                </li>
                {amazonStoreUrl && (
                  <li>
                    <a href={amazonStoreUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 inline-flex items-center gap-1">
                      Shop on Amazon <ArrowRight className="w-3 h-3" />
                    </a>
                  </li>
                )}
              </ul>
            </MobileAccordion>

            {/* Learn Accordion */}
            <MobileAccordion
              title="Learn"
              isOpen={openSection === 'learn'}
              onToggle={() => toggleSection('learn')}
            >
              <ul className="space-y-4 pb-4">
                <li>
                  <Link href="/our-story" className="text-sm text-white/60">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-white/60">
                    FAQ
                  </Link>
                </li>
              </ul>
            </MobileAccordion>

            {/* Support Accordion */}
            <MobileAccordion
              title="Support"
              isOpen={openSection === 'support'}
              onToggle={() => toggleSection('support')}
            >
              <ul className="space-y-4 pb-4">
                <li>
                  <Link href="/contact" className="text-sm text-white/60">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-white/60">
                    FAQs
                  </Link>
                </li>
              </ul>
            </MobileAccordion>

            {/* Certifications - Mobile */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex justify-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center">
                    <Droplet className="w-4 h-4 text-white/80" />
                  </div>
                  <span className="text-[9px] text-white/50 uppercase tracking-wide">Preservative Free</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center">
                    <Flag className="w-4 h-4 text-white/80" />
                  </div>
                  <span className="text-[9px] text-white/50 uppercase tracking-wide">Made in USA</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 4c-2 0-3.5 1-4.5 2.5S6 9.5 6 11c0 2 1 3.5 2 4.5s2 2 2 3.5v1h4v-1c0-1.5 1-2.5 2-3.5s2-2.5 2-4.5c0-1.5-.5-3-1.5-4.5S14 4 12 4z" />
                      <path d="M10 8.5c-.5-.5-1.5-.5-2.5.5M14 8.5c.5-.5 1.5-.5 2.5.5" />
                    </svg>
                  </div>
                  <span className="text-[9px] text-white/50 uppercase tracking-wide">Cruelty Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Massive Footer Logo - Full Width Brand Texture */}
      {massiveFooterLogoUrl && (
        <div className="w-full overflow-hidden">
          <div className="relative w-full flex justify-center">
            <Image
              src={massiveFooterLogoUrl}
              alt=""
              width={1920}
              height={400}
              className="w-full max-w-none object-contain opacity-10"
              style={{ minWidth: '100vw' }}
              priority={false}
            />
          </div>
        </div>
      )}

      {/* Separator */}
      <div className="container">
        <div className="h-px bg-white/10" />
      </div>

      {/* ROW 3: Legal Basement */}
      <div className="py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Legal Links - Left */}
            <div className="flex items-center gap-4 text-[11px] uppercase tracking-wide text-white/40">
              <Link href="/privacy" className="hover:text-white/60 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white/60 transition-colors">
                Terms of Service
              </Link>
            </div>

            {/* Copyright - Right */}
            <p className="text-[11px] uppercase tracking-wide text-white/40">
              © {new Date().getFullYear()} Archie&apos;s Remedies
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Mobile Accordion Component
interface MobileAccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function MobileAccordion({ title, isOpen, onToggle, children }: MobileAccordionProps) {
  return (
    <div className="border-t border-white/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-white">
          {title}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-white/60 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {children}
      </div>
    </div>
  );
}
