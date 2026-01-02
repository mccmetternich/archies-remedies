'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, ArrowRight, Droplet, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FooterLink {
  id: string;
  label: string;
  url: string;
  column: string;
  isExternal?: boolean;
  isActive?: boolean;
}

export interface Certification {
  icon: string;
  iconUrl: string | null;
  label: string;
}

export interface NavColumnsProps {
  logo?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  amazonStoreUrl?: string | null;
  instagramIconUrl?: string | null;
  facebookIconUrl?: string | null;
  tiktokIconUrl?: string | null;
  amazonIconUrl?: string | null;
  column1Title?: string | null;
  column2Title?: string | null;
  column3Title?: string | null;
  column4Title?: string | null;
  column1Links?: FooterLink[];
  column2Links?: FooterLink[];
  column3Links?: FooterLink[];
  certifications?: Certification[];
  isDark?: boolean;
}

// Helper to render certification icon
function renderCertIcon(cert: Certification, certIconClass: string) {
  if (cert.iconUrl) {
    return <Image src={cert.iconUrl} alt={cert.label} width={16} height={16} className="w-4 h-4 object-contain" />;
  }
  switch (cert.icon) {
    case 'droplet':
      return <Droplet className={cn('w-4 h-4', certIconClass)} />;
    case 'flag':
      return <Flag className={cn('w-4 h-4', certIconClass)} />;
    case 'rabbit':
      return (
        <svg className={cn('w-4 h-4', certIconClass)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 4c-2 0-3.5 1-4.5 2.5S6 9.5 6 11c0 2 1 3.5 2 4.5s2 2 2 3.5v1h4v-1c0-1.5 1-2.5 2-3.5s2-2.5 2-4.5c0-1.5-.5-3-1.5-4.5S14 4 12 4z" />
          <path d="M10 8.5c-.5-.5-1.5-.5-2.5.5M14 8.5c.5-.5 1.5-.5 2.5.5" />
        </svg>
      );
    default:
      return <Droplet className={cn('w-4 h-4', certIconClass)} />;
  }
}

export function NavColumns({
  logo,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  amazonStoreUrl,
  instagramIconUrl,
  facebookIconUrl,
  tiktokIconUrl,
  amazonIconUrl,
  column1Title = 'Shop',
  column2Title = 'Learn',
  column3Title = 'Support',
  column4Title = 'Certifications',
  column1Links,
  column2Links,
  column3Links,
  certifications,
  isDark = true,
}: NavColumnsProps) {
  // Theme-based styles
  const textMutedClass = isDark ? 'text-white' : 'text-gray-600';
  const textFadedClass = isDark ? 'text-white/60' : 'text-gray-400';
  const borderAccentClass = isDark ? 'border-white/30' : 'border-gray-300';
  const logoFilter = isDark ? 'brightness-0 invert' : '';
  const certIconClass = isDark ? 'text-white/80' : 'text-gray-600';

  // Default certifications if not provided
  const displayCertifications = certifications || [
    { icon: 'droplet', iconUrl: null, label: 'Preservative Free' },
    { icon: 'flag', iconUrl: null, label: 'Made in USA' },
    { icon: 'rabbit', iconUrl: null, label: 'Cruelty Free' },
  ];

  // Default links if not provided from CMS
  const shopLinks = column1Links || [
    { id: '1', label: 'Dry Eye Drops', url: '/products/eye-drops', column: 'Shop' },
    { id: '2', label: 'Lid & Lash Wipes', url: '/products/eye-wipes', column: 'Shop' },
  ];
  const learnLinks = column2Links || [
    { id: '1', label: 'Our Story', url: '/our-story', column: 'Learn' },
    { id: '2', label: 'FAQ', url: '/faq', column: 'Learn' },
    { id: '3', label: 'AR Function Mag', url: '/blog', column: 'Learn' },
  ];
  const supportLinks = column3Links || [
    { id: '1', label: 'Contact Us', url: '/contact', column: 'Support' },
    { id: '2', label: 'FAQs', url: '/faq', column: 'Support' },
  ];

  // Render a link column
  const renderLinkColumn = (
    title: string | null | undefined,
    links: FooterLink[],
    isMobile: boolean = false
  ) => (
    <div>
      <h4 className={cn('text-[6px] font-bold tracking-[0.15em] uppercase text-white', isMobile ? 'mb-2' : 'mb-3')}>
        {title}
      </h4>
      <ul className="space-y-0">
        {links.map((link) => (
          <li key={link.id}>
            {link.isExternal ? (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'text-xs uppercase tracking-wide transition-colors leading-[1.8] inline-flex items-center gap-1',
                  isMobile ? '' : 'border-b border-transparent',
                  textMutedClass,
                  !isMobile && (isDark ? 'hover:text-white hover:border-white' : 'hover:text-gray-900 hover:border-gray-900')
                )}
              >
                {link.label}
                <ArrowRight className="w-3 h-3" />
              </a>
            ) : (
              <Link
                href={link.url}
                className={cn(
                  'text-xs uppercase tracking-wide transition-colors leading-[1.8] block',
                  isMobile ? '' : 'border-b border-transparent',
                  textMutedClass,
                  !isMobile && (isDark ? 'hover:text-white hover:border-white' : 'hover:text-gray-900 hover:border-gray-900')
                )}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  // Render social icons
  const renderSocialIcons = (iconSize: string, containerGap: string) => (
    <div className={cn('flex items-center', containerGap)}>
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(iconSize, 'flex items-center justify-center transition-colors', textMutedClass, isDark ? 'hover:text-white' : 'hover:text-gray-900')}
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
          className={cn(iconSize, 'flex items-center justify-center transition-colors', textMutedClass, isDark ? 'hover:text-white' : 'hover:text-gray-900')}
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
          className={cn(iconSize, 'flex items-center justify-center transition-colors', textMutedClass, isDark ? 'hover:text-white' : 'hover:text-gray-900')}
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
          className={cn(iconSize, 'flex items-center justify-center transition-colors', textMutedClass, isDark ? 'hover:text-white' : 'hover:text-gray-900')}
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
  );

  // Render certifications
  const renderCertifications = (isMobile: boolean = false) => (
    <div className={isMobile ? 'pt-8' : ''}>
      {!isMobile && (
        <h4 className="text-[6px] font-bold tracking-[0.15em] uppercase mb-3 text-white">
          {column4Title}
        </h4>
      )}
      <div className={cn('flex', isMobile ? 'justify-center gap-[74px]' : 'gap-5')}>
        {displayCertifications.map((cert, index) => (
          <div key={index} className={cn('flex flex-col gap-2', isMobile ? 'items-center' : 'items-start')}>
            <div className={cn('rounded-full border flex items-center justify-center', borderAccentClass, isMobile ? 'w-9 h-9' : 'w-10 h-10')}>
              {renderCertIcon(cert, certIconClass)}
            </div>
            <span className={cn('uppercase tracking-wide', textFadedClass, isMobile ? 'text-[9px] text-center' : 'text-[10px]')}>{cert.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="py-12 md:py-16">
      {/* Desktop Layout - Flex with left/right groups, fluid scaling */}
      <div
        className="hidden md:flex justify-between items-start"
        style={{
          paddingLeft: 'var(--footer-side-padding)',
          paddingRight: 'var(--footer-side-padding)'
        }}
      >
        {/* LEFT GROUP: Logo + Social Icons */}
        <div className="flex-shrink-0">
          {logo ? (
            <Image
              src={logo}
              alt="Archie's Remedies"
              width={180}
              height={45}
              className={cn('h-10 w-auto', logoFilter)}
            />
          ) : (
            <span className="text-xl font-medium block tracking-tight">
              Archie&apos;s Remedies
            </span>
          )}

          {/* Social Icons */}
          <div className="mt-5">
            {renderSocialIcons('w-[18px] h-[18px]', 'gap-4')}
          </div>
        </div>

        {/* RIGHT GROUP: Link Columns */}
        <div className="flex gap-12 lg:gap-16 xl:gap-20">
          {renderLinkColumn(column1Title, shopLinks)}
          {renderLinkColumn(column2Title, learnLinks)}
          {renderLinkColumn(column3Title, supportLinks)}
          {renderCertifications()}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden px-5">
        {/* Brand - Logo + social icons */}
        <div className="mb-[70px]">
          {logo ? (
            <Image
              src={logo}
              alt="Archie's Remedies"
              width={170}
              height={43}
              className={cn('h-11 w-auto', logoFilter)}
            />
          ) : (
            <span className="text-xl font-medium block tracking-tight">
              Archie&apos;s Remedies
            </span>
          )}

          {/* Social Icons */}
          <div className="mt-4">
            {renderSocialIcons('w-5 h-5', 'gap-5')}
          </div>
        </div>

        {/* Link Columns - Left aligned */}
        <div className="space-y-10 mb-5">
          {renderLinkColumn(column1Title, shopLinks, true)}
          {renderLinkColumn(column2Title, learnLinks, true)}
          {renderLinkColumn(column3Title, supportLinks, true)}
        </div>

        {/* Certifications - Mobile */}
        {renderCertifications(true)}
      </div>
    </div>
  );
}
