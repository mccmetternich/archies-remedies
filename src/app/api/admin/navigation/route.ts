import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { navigationItems, footerLinks, siteSettings, products, pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const navItems = await db.select().from(navigationItems).orderBy(navigationItems.sortOrder);
    const footer = await db.select().from(footerLinks).orderBy(footerLinks.sortOrder);
    const [settings] = await db.select().from(siteSettings).limit(1);

    // Get all products for dropdown selection
    const productList = await db.select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      heroImageUrl: products.heroImageUrl,
      shortDescription: products.shortDescription,
      badge: products.badge,
      badgeEmoji: products.badgeEmoji,
      rating: products.rating,
      reviewCount: products.reviewCount,
    }).from(products).where(eq(products.isActive, true)).orderBy(products.sortOrder);

    // Get all pages that can be added to nav
    const pageList = await db.select({
      id: pages.id,
      slug: pages.slug,
      title: pages.title,
      showInNav: pages.showInNav,
      navOrder: pages.navOrder,
      navPosition: pages.navPosition,
      navShowOnDesktop: pages.navShowOnDesktop,
      navShowOnMobile: pages.navShowOnMobile,
    }).from(pages).where(eq(pages.isActive, true)).orderBy(pages.navOrder);

    const bumper = settings ? {
      bumperEnabled: settings.bumperEnabled,
      bumperText: settings.bumperText,
      bumperLinkUrl: settings.bumperLinkUrl,
      bumperLinkText: settings.bumperLinkText,
      bumperTheme: settings.bumperTheme || 'light',
    } : null;

    // Global nav configuration
    const globalNav = settings ? {
      // Logo position
      logoPosition: settings.navLogoPosition || 'left',
      logoPositionMobile: settings.navLogoPositionMobile || 'left',
      // CTA button
      ctaEnabled: settings.navCtaEnabled ?? true,
      ctaText: settings.navCtaText || 'Shop Now',
      ctaUrl: settings.navCtaUrl || '/products/eye-drops',
      // Dropdown tile 1
      tile1ProductId: settings.navDropdownTile1ProductId,
      tile1Title: settings.navDropdownTile1Title,
      tile1Subtitle: settings.navDropdownTile1Subtitle,
      tile1Badge: settings.navDropdownTile1Badge,
      tile1BadgeEmoji: settings.navDropdownTile1BadgeEmoji,
      tile1BadgeBgColor: settings.navDropdownTile1BadgeBgColor || '#1a1a1a',
      tile1BadgeTextColor: settings.navDropdownTile1BadgeTextColor || '#ffffff',
      tile1ImageUrl: settings.navDropdownTile1ImageUrl,
      tile1HoverImageUrl: settings.navDropdownTile1HoverImageUrl,
      // Dropdown tile 2
      tile2ProductId: settings.navDropdownTile2ProductId,
      tile2Title: settings.navDropdownTile2Title,
      tile2Subtitle: settings.navDropdownTile2Subtitle,
      tile2Badge: settings.navDropdownTile2Badge,
      tile2BadgeEmoji: settings.navDropdownTile2BadgeEmoji,
      tile2BadgeBgColor: settings.navDropdownTile2BadgeBgColor || '#bbdae9',
      tile2BadgeTextColor: settings.navDropdownTile2BadgeTextColor || '#1a1a1a',
      tile2ImageUrl: settings.navDropdownTile2ImageUrl,
      tile2HoverImageUrl: settings.navDropdownTile2HoverImageUrl,
      // Marketing tile (formerly "Clean Formulas")
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
      // Legacy aliases for backwards compatibility
      cleanFormulasTitle: settings.navMarketingTileTitle || settings.navCleanFormulasTitle || 'Clean Formulas',
      cleanFormulasDescription: settings.navMarketingTileDescription || settings.navCleanFormulasDescription || 'No preservatives, phthalates, parabens, or sulfates.',
      cleanFormulasCtaEnabled: settings.navMarketingTileCtaEnabled ?? settings.navCleanFormulasCtaEnabled ?? false,
      cleanFormulasCtaText: settings.navMarketingTileCtaText || settings.navCleanFormulasCtaText,
      cleanFormulasCtaUrl: settings.navMarketingTileCtaUrl || settings.navCleanFormulasCtaUrl,
      cleanFormulasBadgeEnabled: settings.navMarketingTileRotatingBadgeEnabled ?? settings.navCleanFormulasBadgeEnabled ?? false,
      cleanFormulasBadgeUrl: settings.navMarketingTileRotatingBadgeUrl || settings.navCleanFormulasBadgeUrl,
    } : null;

    return NextResponse.json({
      navigation: navItems,
      footer,
      bumper,
      globalNav,
      products: productList,
      pages: pageList,
    });
  } catch (error) {
    console.error('Failed to fetch navigation:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { navigation, footer, bumper, globalNav, pageNavUpdates } = await request.json();

    // Update bumper settings
    if (bumper !== undefined) {
      const [existingSettings] = await db.select().from(siteSettings).limit(1);

      if (existingSettings) {
        await db.update(siteSettings).set({
          bumperEnabled: bumper.bumperEnabled,
          bumperText: bumper.bumperText,
          bumperLinkUrl: bumper.bumperLinkUrl,
          bumperLinkText: bumper.bumperLinkText,
          bumperTheme: bumper.bumperTheme || 'light',
          updatedAt: new Date().toISOString(),
        }).where(eq(siteSettings.id, existingSettings.id));
      } else {
        await db.insert(siteSettings).values({
          id: generateId(),
          bumperEnabled: bumper.bumperEnabled,
          bumperText: bumper.bumperText,
          bumperLinkUrl: bumper.bumperLinkUrl,
          bumperLinkText: bumper.bumperLinkText,
          bumperTheme: bumper.bumperTheme || 'light',
        });
      }
    }

    // Update global nav settings
    if (globalNav !== undefined) {
      const [existingSettings] = await db.select().from(siteSettings).limit(1);

      const navUpdateData = {
        navLogoPosition: globalNav.logoPosition || 'left',
        navLogoPositionMobile: globalNav.logoPositionMobile || 'left',
        navCtaEnabled: globalNav.ctaEnabled ?? true,
        navCtaText: globalNav.ctaText || 'Shop Now',
        navCtaUrl: globalNav.ctaUrl || '/products/eye-drops',
        navDropdownTile1ProductId: globalNav.tile1ProductId || null,
        navDropdownTile1Title: globalNav.tile1Title || null,
        navDropdownTile1Subtitle: globalNav.tile1Subtitle || null,
        navDropdownTile1Badge: globalNav.tile1Badge || null,
        navDropdownTile1BadgeEmoji: globalNav.tile1BadgeEmoji || null,
        navDropdownTile1BadgeBgColor: globalNav.tile1BadgeBgColor || '#1a1a1a',
        navDropdownTile1BadgeTextColor: globalNav.tile1BadgeTextColor || '#ffffff',
        navDropdownTile1ImageUrl: globalNav.tile1ImageUrl || null,
        navDropdownTile1HoverImageUrl: globalNav.tile1HoverImageUrl || null,
        navDropdownTile2ProductId: globalNav.tile2ProductId || null,
        navDropdownTile2Title: globalNav.tile2Title || null,
        navDropdownTile2Subtitle: globalNav.tile2Subtitle || null,
        navDropdownTile2Badge: globalNav.tile2Badge || null,
        navDropdownTile2BadgeEmoji: globalNav.tile2BadgeEmoji || null,
        navDropdownTile2BadgeBgColor: globalNav.tile2BadgeBgColor || '#bbdae9',
        navDropdownTile2BadgeTextColor: globalNav.tile2BadgeTextColor || '#1a1a1a',
        navDropdownTile2ImageUrl: globalNav.tile2ImageUrl || null,
        navDropdownTile2HoverImageUrl: globalNav.tile2HoverImageUrl || null,
        // Marketing tile settings (using new field names)
        navMarketingTileTitle: globalNav.marketingTileTitle || globalNav.cleanFormulasTitle || 'Clean Formulas',
        navMarketingTileDescription: globalNav.marketingTileDescription || globalNav.cleanFormulasDescription || null,
        navMarketingTileBadge1: globalNav.marketingTileBadge1 || 'Preservative-Free',
        navMarketingTileBadge2: globalNav.marketingTileBadge2 || 'Paraben-Free',
        navMarketingTileBadge3: globalNav.marketingTileBadge3 || 'Sulfate-Free',
        navMarketingTileCtaEnabled: globalNav.marketingTileCtaEnabled ?? globalNav.cleanFormulasCtaEnabled ?? false,
        navMarketingTileCtaText: globalNav.marketingTileCtaText || globalNav.cleanFormulasCtaText || null,
        navMarketingTileCtaUrl: globalNav.marketingTileCtaUrl || globalNav.cleanFormulasCtaUrl || null,
        navMarketingTileRotatingBadgeEnabled: globalNav.marketingTileRotatingBadgeEnabled ?? globalNav.cleanFormulasBadgeEnabled ?? false,
        navMarketingTileRotatingBadgeUrl: globalNav.marketingTileRotatingBadgeUrl || globalNav.cleanFormulasBadgeUrl || null,
        navMarketingTileHideOnMobile: globalNav.marketingTileHideOnMobile ?? false,
        updatedAt: new Date().toISOString(),
      };

      if (existingSettings) {
        await db.update(siteSettings).set(navUpdateData).where(eq(siteSettings.id, existingSettings.id));
      } else {
        await db.insert(siteSettings).values({
          id: generateId(),
          ...navUpdateData,
        });
      }
    }

    // Update page nav settings (showInNav, navOrder, navPosition, desktop/mobile visibility)
    if (pageNavUpdates && Array.isArray(pageNavUpdates)) {
      for (const pageUpdate of pageNavUpdates) {
        if (pageUpdate.id) {
          await db.update(pages).set({
            showInNav: pageUpdate.showInNav ?? false,
            navOrder: pageUpdate.navOrder ?? 0,
            navPosition: pageUpdate.navPosition ?? 'right',
            navShowOnDesktop: pageUpdate.navShowOnDesktop ?? true,
            navShowOnMobile: pageUpdate.navShowOnMobile ?? true,
            updatedAt: new Date().toISOString(),
          }).where(eq(pages.id, pageUpdate.id));
        }
      }
    }

    // Update navigation items
    if (navigation) {
      const existingNav = await db.select({ id: navigationItems.id }).from(navigationItems);
      for (const item of existingNav) {
        await db.delete(navigationItems).where(eq(navigationItems.id, item.id));
      }

      for (let i = 0; i < navigation.length; i++) {
        const item = navigation[i];
        await db.insert(navigationItems).values({
          id: item.id.startsWith('new-') ? generateId() : item.id,
          label: item.label,
          url: item.url,
          type: item.type || 'link',
          parentId: item.parentId || null,
          imageUrl: item.imageUrl || null,
          description: item.description || null,
          isActive: item.isActive ?? true,
          sortOrder: i,
        });
      }
    }

    // Update footer links
    if (footer) {
      const existingFooter = await db.select({ id: footerLinks.id }).from(footerLinks);
      for (const item of existingFooter) {
        await db.delete(footerLinks).where(eq(footerLinks.id, item.id));
      }

      for (let i = 0; i < footer.length; i++) {
        const item = footer[i];
        await db.insert(footerLinks).values({
          id: item.id.startsWith('new-') ? generateId() : item.id,
          label: item.label,
          url: item.url,
          column: item.column || 'Shop',
          isActive: item.isActive ?? true,
          sortOrder: i,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update navigation:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
