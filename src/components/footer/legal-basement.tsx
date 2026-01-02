'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface LegalBasementProps {
  privacyUrl?: string | null;
  privacyLabel?: string | null;
  termsUrl?: string | null;
  termsLabel?: string | null;
  siteName?: string | null;
  isDark?: boolean;
}

export function LegalBasement({
  privacyUrl = '/privacy',
  privacyLabel = 'Privacy Policy',
  termsUrl = '/terms',
  termsLabel = 'Terms of Service',
  siteName = "Archie's Remedies",
  isDark = true,
}: LegalBasementProps) {
  return (
    <>
      {/* Break line - with gutters matching content, pure white, 1px */}
      <div
        className="hidden md:block h-px bg-white"
        style={{
          marginLeft: 'var(--footer-side-padding)',
          marginRight: 'var(--footer-side-padding)'
        }}
      />
      <div className="md:hidden h-px bg-white mx-5" />

      {/* ROW 3: Legal Basement - Fluid scaling with CSS vars */}
      <div className="py-8">
        {/* Desktop: Flex layout with fluid padding */}
        <div
          className="hidden md:flex items-center justify-between"
          style={{
            paddingLeft: 'var(--footer-side-padding)',
            paddingRight: 'var(--footer-side-padding)'
          }}
        >
          {/* Legal Links - Left */}
          <div className={cn('flex items-center gap-4 text-[11px] uppercase tracking-wide', isDark ? 'text-white' : 'text-gray-600')}>
            <Link href={privacyUrl || '/privacy'} className={cn('transition-colors border-b border-transparent pb-0.5', isDark ? 'hover:text-white/70 hover:border-white/70' : 'hover:text-gray-600 hover:border-gray-600')}>
              {privacyLabel}
            </Link>
            <span>•</span>
            <Link href={termsUrl || '/terms'} className={cn('transition-colors border-b border-transparent pb-0.5', isDark ? 'hover:text-white/70 hover:border-white/70' : 'hover:text-gray-600 hover:border-gray-600')}>
              {termsLabel}
            </Link>
          </div>

          {/* Copyright - Right */}
          <p className={cn('text-[11px] uppercase tracking-wide', isDark ? 'text-white' : 'text-gray-600')}>
            © {new Date().getFullYear()} {siteName}
          </p>
        </div>

        {/* Mobile: Uses standard px-5 padding */}
        <div className="md:hidden px-5 flex items-center justify-between">
          {/* Legal Links - Left */}
          <div className={cn('flex items-center gap-4 text-[11px] uppercase tracking-wide', isDark ? 'text-white' : 'text-gray-600')}>
            <Link href={privacyUrl || '/privacy'} className={cn('transition-colors border-b border-transparent pb-0.5', isDark ? 'hover:text-white/70 hover:border-white/70' : 'hover:text-gray-600 hover:border-gray-600')}>
              {privacyLabel}
            </Link>
            <span>•</span>
            <Link href={termsUrl || '/terms'} className={cn('transition-colors border-b border-transparent pb-0.5', isDark ? 'hover:text-white/70 hover:border-white/70' : 'hover:text-gray-600 hover:border-gray-600')}>
              {termsLabel}
            </Link>
          </div>

          {/* Copyright - Right */}
          <p className={cn('text-[11px] uppercase tracking-wide', isDark ? 'text-white' : 'text-gray-600')}>
            © {new Date().getFullYear()} {siteName}
          </p>
        </div>
      </div>
    </>
  );
}
