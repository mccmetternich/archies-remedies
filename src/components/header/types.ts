export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  heroImageUrl: string | null;
  rating?: number | null;
  reviewCount?: number | null;
}

export interface BumperSettings {
  bumperEnabled?: boolean | null;
  bumperText?: string | null;
  bumperLinkUrl?: string | null;
  bumperLinkText?: string | null;
  bumperTheme?: 'light' | 'dark' | null;
}

export interface SocialStats {
  totalReviews?: number | null;
  totalCustomers?: number | null;
  instagramFollowers?: number | null;
  facebookFollowers?: number | null;
}

export interface GlobalNavSettings {
  logoPosition?: string | null;
  logoPositionMobile?: string | null;
  ctaEnabled?: boolean | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  tile1ProductId?: string | null;
  tile1Title?: string | null;
  tile1Subtitle?: string | null;
  tile1Badge?: string | null;
  tile1BadgeEmoji?: string | null;
  tile1BadgeBgColor?: string | null;
  tile1BadgeTextColor?: string | null;
  tile1ImageUrl?: string | null;
  tile1HoverImageUrl?: string | null;
  tile2ProductId?: string | null;
  tile2Title?: string | null;
  tile2Subtitle?: string | null;
  tile2Badge?: string | null;
  tile2BadgeEmoji?: string | null;
  tile2BadgeBgColor?: string | null;
  tile2BadgeTextColor?: string | null;
  tile2ImageUrl?: string | null;
  tile2HoverImageUrl?: string | null;
  // Marketing tile (uses both new and legacy field names)
  marketingTileTitle?: string | null;
  marketingTileDescription?: string | null;
  marketingTileBadge1?: string | null;
  marketingTileBadge2?: string | null;
  marketingTileBadge3?: string | null;
  marketingTileCtaEnabled?: boolean | null;
  marketingTileCtaEnabledDesktop?: boolean | null;
  marketingTileCtaEnabledMobile?: boolean | null;
  marketingTileCtaText?: string | null;
  marketingTileCtaUrl?: string | null;
  marketingTileRotatingBadgeEnabled?: boolean | null;
  marketingTileRotatingBadgeEnabledDesktop?: boolean | null;
  marketingTileRotatingBadgeEnabledMobile?: boolean | null;
  marketingTileRotatingBadgeUrl?: string | null;
  marketingTileHideOnMobile?: boolean | null;
  // Legacy aliases
  cleanFormulasTitle?: string | null;
  cleanFormulasDescription?: string | null;
  cleanFormulasCtaEnabled?: boolean | null;
  cleanFormulasCtaText?: string | null;
  cleanFormulasCtaUrl?: string | null;
  cleanFormulasBadgeEnabled?: boolean | null;
  cleanFormulasBadgeUrl?: string | null;
}

export interface NavPage {
  id: string;
  slug: string;
  title: string;
  showInNav: boolean | null;
  navOrder: number | null;
  navShowOnDesktop: boolean | null;
  navShowOnMobile: boolean | null;
}

// Default product images for mega nav
export const PRODUCT_IMAGES: Record<string, string> = {
  'eye-drops': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
  'eye-wipes': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
};

// Default avatars for social proof
export const SOCIAL_PROOF_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face',
];
