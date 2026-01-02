'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { EmailSignupSection } from '@/components/footer/email-signup-section';
import { NavColumns } from '@/components/footer/nav-columns';
import { LegalBasement } from '@/components/footer/legal-basement';
import type { FooterLink, Certification } from '@/components/footer/nav-columns';

// Re-export types for external use
export type { FooterLink, Certification };

// Re-export sub-components for direct access if needed
export { MobileAccordion } from '@/components/footer/mobile-accordion';

interface FooterProps {
  logo?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  amazonStoreUrl?: string | null;
  massiveFooterLogoUrl?: string | null;
  massiveFooterLogoEnabled?: boolean;
  massiveFooterLogoOpacity?: number | null;
  // Custom social icons
  instagramIconUrl?: string | null;
  facebookIconUrl?: string | null;
  tiktokIconUrl?: string | null;
  amazonIconUrl?: string | null;
  // CMS: Theme
  footerTheme?: 'dark' | 'light';
  // CMS: Site name for copyright
  siteName?: string | null;
  // CMS: Email signup section
  emailSignupEnabled?: boolean;
  emailSignupTitle?: string | null;
  emailSignupSubtitle?: string | null;
  emailSignupPlaceholder?: string | null;
  emailSignupButtonText?: string | null;
  emailSignupSuccessMessage?: string | null;
  // CMS: Column titles
  column1Title?: string | null;
  column2Title?: string | null;
  column3Title?: string | null;
  column4Title?: string | null;
  // CMS: Footer links by column
  column1Links?: FooterLink[];
  column2Links?: FooterLink[];
  column3Links?: FooterLink[];
  // CMS: Certifications
  certifications?: Certification[];
  // CMS: Legal links
  privacyUrl?: string | null;
  privacyLabel?: string | null;
  termsUrl?: string | null;
  termsLabel?: string | null;
}

export function Footer({
  logo,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  amazonStoreUrl,
  massiveFooterLogoUrl,
  massiveFooterLogoEnabled = true,
  massiveFooterLogoOpacity = 15,
  instagramIconUrl,
  facebookIconUrl,
  tiktokIconUrl,
  amazonIconUrl,
  footerTheme = 'dark',
  siteName = "Archie's Remedies",
  emailSignupEnabled = true,
  emailSignupTitle = "Join the Archie's Community",
  emailSignupSubtitle = 'Expert eye care tips, new product drops, and wellness inspiration. No spam, ever.',
  emailSignupPlaceholder = 'Enter your email',
  emailSignupButtonText = 'Sign Up',
  emailSignupSuccessMessage = "You're on the list.",
  column1Title = 'Shop',
  column2Title = 'Learn',
  column3Title = 'Support',
  column4Title = 'Certifications',
  column1Links,
  column2Links,
  column3Links,
  certifications,
  privacyUrl = '/privacy',
  privacyLabel = 'Privacy Policy',
  termsUrl = '/terms',
  termsLabel = 'Terms of Service',
}: FooterProps) {
  // Theme-based styles
  const isDark = footerTheme === 'dark';
  const bgClass = isDark ? 'bg-black' : 'bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const logoFilter = isDark ? 'brightness-0 invert' : '';

  return (
    <footer className={cn(bgClass, textClass, "font-['Inter',sans-serif]")}>
      {/* ROW 1: Email Signup Section */}
      {emailSignupEnabled && (
        <EmailSignupSection
          emailSignupTitle={emailSignupTitle}
          emailSignupSubtitle={emailSignupSubtitle}
          emailSignupPlaceholder={emailSignupPlaceholder}
          emailSignupButtonText={emailSignupButtonText}
          emailSignupSuccessMessage={emailSignupSuccessMessage}
          privacyUrl={privacyUrl}
          termsUrl={termsUrl}
          isDark={isDark}
        />
      )}

      {/* ROW 2: Navigation Grid */}
      <NavColumns
        logo={logo}
        instagramUrl={instagramUrl}
        facebookUrl={facebookUrl}
        tiktokUrl={tiktokUrl}
        amazonStoreUrl={amazonStoreUrl}
        instagramIconUrl={instagramIconUrl}
        facebookIconUrl={facebookIconUrl}
        tiktokIconUrl={tiktokIconUrl}
        amazonIconUrl={amazonIconUrl}
        column1Title={column1Title}
        column2Title={column2Title}
        column3Title={column3Title}
        column4Title={column4Title}
        column1Links={column1Links}
        column2Links={column2Links}
        column3Links={column3Links}
        certifications={certifications}
        isDark={isDark}
      />

      {/* Massive Footer Logo - Full Width Brand Texture */}
      {massiveFooterLogoEnabled && massiveFooterLogoUrl && (massiveFooterLogoOpacity ?? 15) > 0 && (
        <div className="w-full overflow-hidden mb-12 md:mb-16">
          <div className="relative w-full flex justify-center">
            <Image
              src={massiveFooterLogoUrl}
              alt=""
              width={2400}
              height={500}
              className={cn('w-[108vw] max-w-none object-contain', logoFilter)}
              style={{
                marginLeft: '-4vw',
                marginRight: '-4vw',
                opacity: (massiveFooterLogoOpacity ?? 15) / 100,
              }}
              priority={false}
            />
          </div>
        </div>
      )}

      {/* ROW 3: Legal Basement */}
      <LegalBasement
        privacyUrl={privacyUrl}
        privacyLabel={privacyLabel}
        termsUrl={termsUrl}
        termsLabel={termsLabel}
        siteName={siteName}
        isDark={isDark}
      />
    </footer>
  );
}
