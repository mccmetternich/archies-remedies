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
  // Custom social icons
  instagramIconUrl?: string | null;
  facebookIconUrl?: string | null;
  tiktokIconUrl?: string | null;
  amazonIconUrl?: string | null;
}

export function Footer({
  logo,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  amazonStoreUrl,
  massiveFooterLogoUrl,
  instagramIconUrl,
  facebookIconUrl,
  tiktokIconUrl,
  amazonIconUrl,
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
      {/* ROW 1: Community Invitation - Full Width with wider spread */}
      <div className="py-20 md:py-24">
        <div className="w-full px-6 md:px-12 lg:px-20 xl:px-28">
          {status === 'success' ? (
            <div className="text-center py-8">
              <p className="text-2xl font-light tracking-wide animate-fade-in">
                You&apos;re on the list.
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-32">
              {/* Text Group - Left - anchored to left edge */}
              <div className="lg:max-w-sm">
                <h3 className="text-sm font-semibold tracking-[0.15em] uppercase mb-4">
                  Join the Archie&apos;s Community
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Expert eye care tips, new product drops, and wellness inspiration. No spam, ever.
                </p>
              </div>

              {/* Input Group - Right - anchored to right edge */}
              <form onSubmit={handleSubscribe} className="flex-1 lg:max-w-md">
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
        <div className="w-full px-6 md:px-12 lg:px-20 xl:px-28">
          {/* Desktop Grid - 5 Columns with wider spread */}
          <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-12">
            {/* Column 1: Brand Anchor - pushed left */}
            <div className="col-span-3 lg:col-span-2">
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
              <div className="flex items-center gap-4">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[18px] h-[18px] flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    {instagramIconUrl ? (
                      <Image src={instagramIconUrl} alt="Instagram" width={18} height={18} className="w-full h-full object-contain" />
                    ) : (
                      <Instagram className="w-full h-full" />
                    )}
                  </a>
                )}
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[18px] h-[18px] flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    aria-label="TikTok"
                  >
                    {tiktokIconUrl ? (
                      <Image src={tiktokIconUrl} alt="TikTok" width={18} height={18} className="w-full h-full object-contain" />
                    ) : (
                      <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    )}
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[18px] h-[18px] flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    {facebookIconUrl ? (
                      <Image src={facebookIconUrl} alt="Facebook" width={18} height={18} className="w-full h-full object-contain" />
                    ) : (
                      <Facebook className="w-full h-full" />
                    )}
                  </a>
                )}
                {amazonStoreUrl && (
                  <a
                    href={amazonStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[18px] h-[18px] flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    aria-label="Amazon Store"
                  >
                    {amazonIconUrl ? (
                      <Image src={amazonIconUrl} alt="Amazon" width={18} height={18} className="w-full h-full object-contain" />
                    ) : (
                      <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.124.108.178.054.39-.156.637-.213.245-.537.51-.965.79-1.478.963-3.063 1.706-4.752 2.225-1.69.52-3.333.78-4.93.78-2.14 0-4.191-.358-6.15-1.073-1.96-.714-3.593-1.64-4.902-2.777-.11-.095-.138-.192-.09-.29l.18-.304zm6.032-5.815c0-1.103.254-2.047.762-2.828.508-.782 1.204-1.38 2.086-1.796-.27-.903-.405-1.737-.405-2.503 0-.906.136-1.68.405-2.322.27-.64.685-1.2 1.243-1.676.558-.477 1.257-.842 2.095-1.094.838-.253 1.816-.38 2.934-.38 1.417 0 2.654.188 3.71.565v1.93c-.895-.425-1.973-.64-3.233-.64-1.48 0-2.6.31-3.358.933-.76.622-1.14 1.56-1.14 2.814 0 .618.084 1.27.25 1.955 1.63-.25 3.036-.376 4.22-.376 1.417 0 2.625.226 3.625.678v2.093c-.82-.426-1.973-.64-3.46-.64-1.406 0-2.84.156-4.3.47.15.994.368 1.85.654 2.573.286.722.63 1.298 1.032 1.726.4.43.868.736 1.398.92.53.184 1.128.276 1.792.276.78 0 1.614-.166 2.503-.498v1.95c-.756.332-1.725.498-2.906.498-1.218 0-2.27-.177-3.155-.53-.886-.355-1.622-.856-2.208-1.504-.587-.65-1.028-1.423-1.32-2.322-.294-.9-.44-1.902-.44-3.007z"/>
                      </svg>
                    )}
                  </a>
                )}
              </div>
            </div>

            {/* Spacer to push columns right */}
            <div className="hidden lg:block lg:col-span-2" />

            {/* Column 2: Shop */}
            <div className="col-span-2 lg:col-span-2">
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase mb-6 text-white">
                Shop
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/products/eye-drops" className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed border-b border-transparent hover:border-white pb-0.5">
                    Dry Eye Drops
                  </Link>
                </li>
                <li>
                  <Link href="/products/eye-wipes" className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed border-b border-transparent hover:border-white pb-0.5">
                    Lid & Lash Wipes
                  </Link>
                </li>
                {amazonStoreUrl && (
                  <li>
                    <a
                      href={amazonStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed inline-flex items-center gap-1 border-b border-transparent hover:border-white pb-0.5"
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
                  <Link href="/our-story" className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed border-b border-transparent hover:border-white pb-0.5">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed border-b border-transparent hover:border-white pb-0.5">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed border-b border-transparent hover:border-white pb-0.5">
                    AR Function Mag
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
                  <Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed border-b border-transparent hover:border-white pb-0.5">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed border-b border-transparent hover:border-white pb-0.5">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Certifications - Icons Only - left aligned */}
            <div className="col-span-3 lg:col-span-2">
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase mb-6 text-white">
                Certifications
              </h4>
              <div className="flex gap-5">
                {/* Preservative Free */}
                <div className="flex flex-col items-start gap-2">
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
                    <Droplet className="w-4 h-4 text-white/80" />
                  </div>
                  <span className="text-[10px] text-white/50 uppercase tracking-wide">Preservative Free</span>
                </div>
                {/* Made in USA */}
                <div className="flex flex-col items-start gap-2">
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
                    <Flag className="w-4 h-4 text-white/80" />
                  </div>
                  <span className="text-[10px] text-white/50 uppercase tracking-wide">Made in USA</span>
                </div>
                {/* Cruelty Free */}
                <div className="flex flex-col items-start gap-2">
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
          <div className="md:hidden space-y-0 px-6">
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
              <div className="flex items-center gap-5">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    {instagramIconUrl ? (
                      <Image src={instagramIconUrl} alt="Instagram" width={20} height={20} className="w-full h-full object-contain" />
                    ) : (
                      <Instagram className="w-full h-full" />
                    )}
                  </a>
                )}
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    aria-label="TikTok"
                  >
                    {tiktokIconUrl ? (
                      <Image src={tiktokIconUrl} alt="TikTok" width={20} height={20} className="w-full h-full object-contain" />
                    ) : (
                      <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    )}
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    {facebookIconUrl ? (
                      <Image src={facebookIconUrl} alt="Facebook" width={20} height={20} className="w-full h-full object-contain" />
                    ) : (
                      <Facebook className="w-full h-full" />
                    )}
                  </a>
                )}
                {amazonStoreUrl && (
                  <a
                    href={amazonStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    aria-label="Amazon Store"
                  >
                    {amazonIconUrl ? (
                      <Image src={amazonIconUrl} alt="Amazon" width={20} height={20} className="w-full h-full object-contain" />
                    ) : (
                      <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.124.108.178.054.39-.156.637-.213.245-.537.51-.965.79-1.478.963-3.063 1.706-4.752 2.225-1.69.52-3.333.78-4.93.78-2.14 0-4.191-.358-6.15-1.073-1.96-.714-3.593-1.64-4.902-2.777-.11-.095-.138-.192-.09-.29l.18-.304zm6.032-5.815c0-1.103.254-2.047.762-2.828.508-.782 1.204-1.38 2.086-1.796-.27-.903-.405-1.737-.405-2.503 0-.906.136-1.68.405-2.322.27-.64.685-1.2 1.243-1.676.558-.477 1.257-.842 2.095-1.094.838-.253 1.816-.38 2.934-.38 1.417 0 2.654.188 3.71.565v1.93c-.895-.425-1.973-.64-3.233-.64-1.48 0-2.6.31-3.358.933-.76.622-1.14 1.56-1.14 2.814 0 .618.084 1.27.25 1.955 1.63-.25 3.036-.376 4.22-.376 1.417 0 2.625.226 3.625.678v2.093c-.82-.426-1.973-.64-3.46-.64-1.406 0-2.84.156-4.3.47.15.994.368 1.85.654 2.573.286.722.63 1.298 1.032 1.726.4.43.868.736 1.398.92.53.184 1.128.276 1.792.276.78 0 1.614-.166 2.503-.498v1.95c-.756.332-1.725.498-2.906.498-1.218 0-2.27-.177-3.155-.53-.886-.355-1.622-.856-2.208-1.504-.587-.65-1.028-1.423-1.32-2.322-.294-.9-.44-1.902-.44-3.007z"/>
                      </svg>
                    )}
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
                <li>
                  <Link href="/blog" className="text-sm text-white/60">
                    AR Function Mag
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
        <div className="w-full overflow-hidden mb-12 md:mb-16">
          <div className="relative w-full flex justify-center">
            <Image
              src={massiveFooterLogoUrl}
              alt=""
              width={2400}
              height={500}
              className="w-[108vw] max-w-none object-contain opacity-15 brightness-0 invert"
              style={{ marginLeft: '-4vw', marginRight: '-4vw' }}
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
              <Link href="/privacy" className="hover:text-white/60 transition-colors border-b border-transparent hover:border-white/60 pb-0.5">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white/60 transition-colors border-b border-transparent hover:border-white/60 pb-0.5">
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
