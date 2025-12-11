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
    }).from(products).where(eq(products.isActive, true)).orderBy(products.sortOrder);

    // Get all pages that can be added to nav
    const pageList = await db.select({
      id: pages.id,
      slug: pages.slug,
      title: pages.title,
      showInNav: pages.showInNav,
      navOrder: pages.navOrder,
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
      // Dropdown tile 2
      tile2ProductId: settings.navDropdownTile2ProductId,
      tile2Title: settings.navDropdownTile2Title,
      tile2Subtitle: settings.navDropdownTile2Subtitle,
      tile2Badge: settings.navDropdownTile2Badge,
      tile2BadgeEmoji: settings.navDropdownTile2BadgeEmoji,
      // Clean formulas tile
      cleanFormulasTitle: settings.navCleanFormulasTitle || 'Clean Formulas',
      cleanFormulasDescription: settings.navCleanFormulasDescription || 'No preservatives, phthalates, parabens, or sulfates.',
      cleanFormulasCtaEnabled: settings.navCleanFormulasCtaEnabled ?? false,
      cleanFormulasCtaText: settings.navCleanFormulasCtaText,
      cleanFormulasCtaUrl: settings.navCleanFormulasCtaUrl,
      cleanFormulasBadgeEnabled: settings.navCleanFormulasBadgeEnabled ?? false,
      cleanFormulasBadgeUrl: settings.navCleanFormulasBadgeUrl,
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
        navDropdownTile2ProductId: globalNav.tile2ProductId || null,
        navDropdownTile2Title: globalNav.tile2Title || null,
        navDropdownTile2Subtitle: globalNav.tile2Subtitle || null,
        navDropdownTile2Badge: globalNav.tile2Badge || null,
        navDropdownTile2BadgeEmoji: globalNav.tile2BadgeEmoji || null,
        navCleanFormulasTitle: globalNav.cleanFormulasTitle || 'Clean Formulas',
        navCleanFormulasDescription: globalNav.cleanFormulasDescription || null,
        navCleanFormulasCtaEnabled: globalNav.cleanFormulasCtaEnabled ?? false,
        navCleanFormulasCtaText: globalNav.cleanFormulasCtaText || null,
        navCleanFormulasCtaUrl: globalNav.cleanFormulasCtaUrl || null,
        navCleanFormulasBadgeEnabled: globalNav.cleanFormulasBadgeEnabled ?? false,
        navCleanFormulasBadgeUrl: globalNav.cleanFormulasBadgeUrl || null,
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

    // Update page nav settings (showInNav, navOrder)
    if (pageNavUpdates && Array.isArray(pageNavUpdates)) {
      for (const pageUpdate of pageNavUpdates) {
        if (pageUpdate.id) {
          await db.update(pages).set({
            showInNav: pageUpdate.showInNav ?? false,
            navOrder: pageUpdate.navOrder ?? 0,
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
