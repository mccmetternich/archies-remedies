// Shared types for navigation admin components

// Footer-specific interfaces
export interface FooterLinkItem {
  id: string;
  label: string;
  url: string;
  column: string;
  isExternal: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface EmailSignupSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  placeholder: string;
  buttonText: string;
  successMessage: string;
}

export interface ColumnTitles {
  column1: string;
  column2: string;
  column3: string;
  column4: string;
}

export interface Certification {
  icon: string;
  iconUrl: string | null;
  label: string;
}

export interface LegalLinks {
  privacyUrl: string;
  privacyLabel: string;
  termsUrl: string;
  termsLabel: string;
}

export interface SocialLinks {
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  amazonStoreUrl: string;
}

export interface NavItem {
  id: string;
  label: string;
  url: string;
  type: string;
  parentId: string | null;
  imageUrl: string | null;
  description: string | null;
  isActive: boolean | null;
  sortOrder: number | null;
}

export interface FooterLink {
  id: string;
  label: string;
  url: string;
  column: string;
  isActive: boolean | null;
  sortOrder: number | null;
}

export interface BumperSettings {
  bumperEnabled: boolean;
  bumperText: string;
  bumperLinkUrl: string;
  bumperLinkText: string;
  bumperTheme: 'light' | 'dark';
}

export interface GlobalNavSettings {
  logoPosition: 'left' | 'center';
  logoPositionMobile: 'left' | 'center';
  ctaEnabled: boolean;
  ctaText: string;
  ctaUrl: string;
  tile1ProductId: string | null;
  tile1Title: string | null;
  tile1Subtitle: string | null;
  tile1Badge: string | null;
  tile1BadgeEmoji: string | null;
  tile1BadgeBgColor: string;
  tile1BadgeTextColor: string;
  tile1ImageUrl: string | null;
  tile1HoverImageUrl: string | null;
  tile2ProductId: string | null;
  tile2Title: string | null;
  tile2Subtitle: string | null;
  tile2Badge: string | null;
  tile2BadgeEmoji: string | null;
  tile2BadgeBgColor: string;
  tile2BadgeTextColor: string;
  tile2ImageUrl: string | null;
  tile2HoverImageUrl: string | null;
  // Marketing tile (formerly Clean Formulas)
  marketingTileTitle: string;
  marketingTileDescription: string;
  marketingTileBadge1: string;
  marketingTileBadge2: string;
  marketingTileBadge3: string;
  marketingTileCtaEnabled: boolean;
  marketingTileCtaEnabledDesktop: boolean;
  marketingTileCtaEnabledMobile: boolean;
  marketingTileCtaText: string | null;
  marketingTileCtaUrl: string | null;
  marketingTileRotatingBadgeEnabled: boolean;
  marketingTileRotatingBadgeEnabledDesktop: boolean;
  marketingTileRotatingBadgeEnabledMobile: boolean;
  marketingTileRotatingBadgeUrl: string | null;
  marketingTileHideOnMobile: boolean;
  // Legacy aliases for backwards compatibility
  cleanFormulasTitle?: string;
  cleanFormulasDescription?: string;
  cleanFormulasCtaEnabled?: boolean;
  cleanFormulasCtaText?: string | null;
  cleanFormulasCtaUrl?: string | null;
  cleanFormulasBadgeEnabled?: boolean;
  cleanFormulasBadgeUrl?: string | null;
}

export interface ProductOption {
  id: string;
  name: string;
  slug: string;
  heroImageUrl: string | null;
  shortDescription: string | null;
  badge: string | null;
  badgeEmoji: string | null;
  rating: number | null;
  reviewCount: number | null;
}

export interface PageOption {
  id: string;
  slug: string;
  title: string;
  showInNav: boolean | null;
  navOrder: number | null;
  navPosition: string | null;
  navShowOnDesktop: boolean | null;
  navShowOnMobile: boolean | null;
}

// Footer state for the footer editor
export interface FooterState {
  footerTheme: 'dark' | 'light';
  footerLogoUrl: string | null;
  fullWidthLogoUrl: string | null;
  fullWidthLogoEnabled: boolean;
  massiveLogoOpacity: number;
  socialLinks: SocialLinks;
  emailSignup: EmailSignupSettings;
  columnTitles: ColumnTitles;
  certifications: Certification[];
  legalLinks: LegalLinks;
  footerLinksByColumn: Record<string, FooterLinkItem[]>;
  siteName: string;
}

// Default values
export const defaultEmailSignup: EmailSignupSettings = {
  enabled: true,
  title: "Join the Archie's Community",
  subtitle: 'Expert eye care tips, new product drops, and wellness inspiration. No spam, ever.',
  placeholder: 'Enter your email',
  buttonText: 'Sign Up',
  successMessage: "You're on the list.",
};

export const defaultColumnTitles: ColumnTitles = {
  column1: 'Shop',
  column2: 'Learn',
  column3: 'Support',
  column4: 'Certifications',
};

export const defaultCertifications: Certification[] = [
  { icon: 'droplet', iconUrl: null, label: 'Preservative Free' },
  { icon: 'flag', iconUrl: null, label: 'Made in USA' },
  { icon: 'rabbit', iconUrl: null, label: 'Cruelty Free' },
];

export const defaultLegalLinks: LegalLinks = {
  privacyUrl: '/privacy',
  privacyLabel: 'Privacy Policy',
  termsUrl: '/terms',
  termsLabel: 'Terms of Service',
};

export const defaultSocialLinks: SocialLinks = {
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
  amazonStoreUrl: '',
};

export const defaultBumperSettings: BumperSettings = {
  bumperEnabled: false,
  bumperText: '',
  bumperLinkUrl: '',
  bumperLinkText: '',
  bumperTheme: 'light',
};

export const defaultGlobalNavSettings: GlobalNavSettings = {
  logoPosition: 'left',
  logoPositionMobile: 'left',
  ctaEnabled: true,
  ctaText: 'Shop Now',
  ctaUrl: '/products/eye-drops',
  tile1ProductId: null,
  tile1Title: null,
  tile1Subtitle: null,
  tile1Badge: null,
  tile1BadgeEmoji: null,
  tile1BadgeBgColor: '#1a1a1a',
  tile1BadgeTextColor: '#ffffff',
  tile1ImageUrl: null,
  tile1HoverImageUrl: null,
  tile2ProductId: null,
  tile2Title: null,
  tile2Subtitle: null,
  tile2Badge: null,
  tile2BadgeEmoji: null,
  tile2BadgeBgColor: '#bbdae9',
  tile2BadgeTextColor: '#1a1a1a',
  tile2ImageUrl: null,
  tile2HoverImageUrl: null,
  marketingTileTitle: 'Clean Formulas',
  marketingTileDescription: 'No preservatives, phthalates, parabens, or sulfates.',
  marketingTileBadge1: 'Preservative-Free',
  marketingTileBadge2: 'Paraben-Free',
  marketingTileBadge3: 'Sulfate-Free',
  marketingTileCtaEnabled: false,
  marketingTileCtaEnabledDesktop: true,
  marketingTileCtaEnabledMobile: true,
  marketingTileCtaText: null,
  marketingTileCtaUrl: null,
  marketingTileRotatingBadgeEnabled: false,
  marketingTileRotatingBadgeEnabledDesktop: true,
  marketingTileRotatingBadgeEnabledMobile: true,
  marketingTileRotatingBadgeUrl: null,
  marketingTileHideOnMobile: false,
};
