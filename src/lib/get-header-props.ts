import { db } from '@/lib/db';
import { siteSettings, products, pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getHeaderProps() {
  const [settings] = await db.select().from(siteSettings).limit(1);

  const productList = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.sortOrder);

  const navPages = await db
    .select({
      id: pages.id,
      slug: pages.slug,
      title: pages.title,
      showInNav: pages.showInNav,
      navOrder: pages.navOrder,
      navShowOnDesktop: pages.navShowOnDesktop,
      navShowOnMobile: pages.navShowOnMobile,
    })
    .from(pages)
    .where(eq(pages.isActive, true))
    .orderBy(pages.navOrder);

  return {
    logo: settings?.logoUrl,
    products: productList,
    bumper: settings ? {
      bumperEnabled: settings.bumperEnabled,
      bumperText: settings.bumperText,
      bumperLinkUrl: settings.bumperLinkUrl,
      bumperLinkText: settings.bumperLinkText,
      bumperTheme: (settings.bumperTheme as 'light' | 'dark') || 'light',
    } : null,
    socialStats: settings ? {
      totalReviews: settings.totalReviews,
      totalCustomers: settings.totalCustomers,
      instagramFollowers: settings.instagramFollowers,
      facebookFollowers: settings.facebookFollowers,
    } : null,
    globalNav: settings ? {
      // Logo position
      logoPosition: settings.navLogoPosition || 'left',
      logoPositionMobile: settings.navLogoPositionMobile || 'left',
      // CTA button
      ctaEnabled: settings.navCtaEnabled ?? true,
      ctaText: settings.navCtaText || 'Shop Now',
      ctaUrl: settings.navCtaUrl || '/products/eye-drops',
      // Tile 1
      tile1ProductId: settings.navDropdownTile1ProductId,
      tile1Title: settings.navDropdownTile1Title,
      tile1Subtitle: settings.navDropdownTile1Subtitle,
      tile1Badge: settings.navDropdownTile1Badge,
      tile1BadgeEmoji: settings.navDropdownTile1BadgeEmoji,
      tile1BadgeBgColor: settings.navDropdownTile1BadgeBgColor || '#1a1a1a',
      tile1BadgeTextColor: settings.navDropdownTile1BadgeTextColor || '#ffffff',
      tile1ImageUrl: settings.navDropdownTile1ImageUrl,
      tile1HoverImageUrl: settings.navDropdownTile1HoverImageUrl,
      // Tile 2
      tile2ProductId: settings.navDropdownTile2ProductId,
      tile2Title: settings.navDropdownTile2Title,
      tile2Subtitle: settings.navDropdownTile2Subtitle,
      tile2Badge: settings.navDropdownTile2Badge,
      tile2BadgeEmoji: settings.navDropdownTile2BadgeEmoji,
      tile2BadgeBgColor: settings.navDropdownTile2BadgeBgColor || '#bbdae9',
      tile2BadgeTextColor: settings.navDropdownTile2BadgeTextColor || '#1a1a1a',
      tile2ImageUrl: settings.navDropdownTile2ImageUrl,
      tile2HoverImageUrl: settings.navDropdownTile2HoverImageUrl,
      // Marketing Tile (with fallbacks matching API route)
      marketingTileTitle: settings.navMarketingTileTitle || settings.navCleanFormulasTitle || 'Clean Formulas',
      marketingTileDescription: settings.navMarketingTileDescription || settings.navCleanFormulasDescription || 'No preservatives, phthalates, parabens, or sulfates.',
      marketingTileBadge1: settings.navMarketingTileBadge1 || 'Preservative-Free',
      marketingTileBadge2: settings.navMarketingTileBadge2 || 'Paraben-Free',
      marketingTileBadge3: settings.navMarketingTileBadge3 || 'Sulfate-Free',
      marketingTileCtaEnabled: settings.navMarketingTileCtaEnabled ?? settings.navCleanFormulasCtaEnabled ?? false,
      marketingTileCtaText: settings.navMarketingTileCtaText || settings.navCleanFormulasCtaText,
      marketingTileCtaUrl: settings.navMarketingTileCtaUrl || settings.navCleanFormulasCtaUrl,
      marketingTileRotatingBadgeEnabled: settings.navMarketingTileRotatingBadgeEnabled ?? settings.navCleanFormulasBadgeEnabled ?? false,
      marketingTileRotatingBadgeUrl: settings.navMarketingTileRotatingBadgeUrl || settings.navCleanFormulasBadgeUrl,
      marketingTileHideOnMobile: settings.navMarketingTileHideOnMobile ?? false,
      // Legacy aliases (for backwards compatibility)
      cleanFormulasTitle: settings.navMarketingTileTitle || settings.navCleanFormulasTitle || 'Clean Formulas',
      cleanFormulasDescription: settings.navMarketingTileDescription || settings.navCleanFormulasDescription || 'No preservatives, phthalates, parabens, or sulfates.',
      cleanFormulasCtaEnabled: settings.navMarketingTileCtaEnabled ?? settings.navCleanFormulasCtaEnabled ?? false,
      cleanFormulasCtaText: settings.navMarketingTileCtaText || settings.navCleanFormulasCtaText,
      cleanFormulasCtaUrl: settings.navMarketingTileCtaUrl || settings.navCleanFormulasCtaUrl,
      cleanFormulasBadgeEnabled: settings.navMarketingTileRotatingBadgeEnabled ?? settings.navCleanFormulasBadgeEnabled ?? false,
      cleanFormulasBadgeUrl: settings.navMarketingTileRotatingBadgeUrl || settings.navCleanFormulasBadgeUrl,
    } : null,
    navPages,
    settings,
  };
}

export function getFooterProps(settings: typeof siteSettings.$inferSelect | null) {
  return {
    logo: settings?.logoUrl,
    instagramUrl: settings?.instagramUrl,
    facebookUrl: settings?.facebookUrl,
    tiktokUrl: settings?.tiktokUrl,
    amazonStoreUrl: settings?.amazonStoreUrl,
    massiveFooterLogoUrl: settings?.massiveFooterLogoUrl,
    // Custom social icons
    instagramIconUrl: settings?.instagramIconUrl,
    facebookIconUrl: settings?.facebookIconUrl,
    tiktokIconUrl: settings?.tiktokIconUrl,
    amazonIconUrl: settings?.amazonIconUrl,
  };
}
