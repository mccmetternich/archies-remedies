import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { footerLinks, siteSettings, pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    // Get footer links organized by column
    const links = await db.select().from(footerLinks).orderBy(footerLinks.sortOrder);

    // Get site settings for footer configuration
    const [settings] = await db.select().from(siteSettings).limit(1);

    // Get all pages that can be added to footer
    const pageList = await db.select({
      id: pages.id,
      slug: pages.slug,
      title: pages.title,
    }).from(pages).where(eq(pages.isActive, true)).orderBy(pages.title);

    // Footer email signup section
    const emailSignup = settings ? {
      enabled: settings.footerEmailSignupEnabled ?? true,
      title: settings.footerEmailSignupTitle || "Join the Archie's Community",
      subtitle: settings.footerEmailSignupSubtitle || 'Expert eye care tips, new product drops, and wellness inspiration. No spam, ever.',
      placeholder: settings.footerEmailSignupPlaceholder || 'Enter your email',
      buttonText: settings.footerEmailSignupButtonText || 'Sign Up',
      successMessage: settings.footerEmailSignupSuccessMessage || "You're on the list.",
    } : {
      enabled: true,
      title: "Join the Archie's Community",
      subtitle: 'Expert eye care tips, new product drops, and wellness inspiration. No spam, ever.',
      placeholder: 'Enter your email',
      buttonText: 'Sign Up',
      successMessage: "You're on the list.",
    };

    // Column titles
    const columnTitles = settings ? {
      column1: settings.footerColumn1Title || 'Shop',
      column2: settings.footerColumn2Title || 'Learn',
      column3: settings.footerColumn3Title || 'Support',
      column4: settings.footerColumn4Title || 'Certifications',
    } : {
      column1: 'Shop',
      column2: 'Learn',
      column3: 'Support',
      column4: 'Certifications',
    };

    // Certifications
    const certifications = settings ? [
      {
        icon: settings.footerCert1Icon || 'droplet',
        iconUrl: settings.footerCert1IconUrl || null,
        label: settings.footerCert1Label || 'Preservative Free',
      },
      {
        icon: settings.footerCert2Icon || 'flag',
        iconUrl: settings.footerCert2IconUrl || null,
        label: settings.footerCert2Label || 'Made in USA',
      },
      {
        icon: settings.footerCert3Icon || 'rabbit',
        iconUrl: settings.footerCert3IconUrl || null,
        label: settings.footerCert3Label || 'Cruelty Free',
      },
    ] : [
      { icon: 'droplet', iconUrl: null, label: 'Preservative Free' },
      { icon: 'flag', iconUrl: null, label: 'Made in USA' },
      { icon: 'rabbit', iconUrl: null, label: 'Cruelty Free' },
    ];

    // Legal links
    const legalLinks = settings ? {
      privacyUrl: settings.footerPrivacyUrl || '/privacy',
      privacyLabel: settings.footerPrivacyLabel || 'Privacy Policy',
      termsUrl: settings.footerTermsUrl || '/terms',
      termsLabel: settings.footerTermsLabel || 'Terms of Service',
    } : {
      privacyUrl: '/privacy',
      privacyLabel: 'Privacy Policy',
      termsUrl: '/terms',
      termsLabel: 'Terms of Service',
    };

    // Social links (from site settings)
    const socialLinks = settings ? {
      instagramUrl: settings.instagramUrl,
      facebookUrl: settings.facebookUrl,
      tiktokUrl: settings.tiktokUrl,
      amazonStoreUrl: settings.amazonStoreUrl,
      instagramIconUrl: settings.instagramIconUrl,
      facebookIconUrl: settings.facebookIconUrl,
      tiktokIconUrl: settings.tiktokIconUrl,
      amazonIconUrl: settings.amazonIconUrl,
    } : {};

    // Site name for copyright
    const siteName = settings?.siteName || "Archie's Remedies";

    // Footer theme and logos
    // Note: footerLogoUrl is for a dedicated footer logo, but we fall back to main logoUrl
    const footerTheme = settings?.footerTheme || 'dark';
    const footerLogoUrl = settings?.footerLogoUrl || settings?.logoUrl || null;
    const fullWidthLogoUrl = settings?.massiveFooterLogoUrl || null;
    const massiveFooterLogoOpacity = settings?.massiveFooterLogoOpacity ?? 15;

    // Organize links by column
    const linksByColumn: Record<string, typeof links> = {
      Shop: [],
      Learn: [],
      Support: [],
    };

    for (const link of links) {
      const column = link.column || 'Shop';
      if (!linksByColumn[column]) {
        linksByColumn[column] = [];
      }
      linksByColumn[column].push(link);
    }

    return NextResponse.json({
      emailSignup,
      columnTitles,
      certifications,
      legalLinks,
      socialLinks,
      siteName,
      // Theme and logo settings
      footerTheme,
      footerLogoUrl,
      fullWidthLogoUrl,
      massiveFooterLogoUrl: fullWidthLogoUrl, // Alias
      massiveFooterLogoOpacity,
      // Social links at root level for admin page
      instagramUrl: settings?.instagramUrl || null,
      facebookUrl: settings?.facebookUrl || null,
      tiktokUrl: settings?.tiktokUrl || null,
      amazonStoreUrl: settings?.amazonStoreUrl || null,
      // Links
      links: linksByColumn,
      allLinks: links,
      pages: pageList,
    });
  } catch (error) {
    console.error('Failed to fetch footer data:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const {
      emailSignup,
      columnTitles,
      certifications,
      legalLinks,
      links,
      footerTheme,
      footerLogoUrl,
      fullWidthLogoUrl,
      massiveLogoOpacity,
      socialLinks,
    } = await request.json();

    // Update site settings for footer configuration
    const [existingSettings] = await db.select().from(siteSettings).limit(1);

    const footerSettings: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    // Theme and logo settings
    if (footerTheme !== undefined) {
      footerSettings.footerTheme = footerTheme;
    }
    if (footerLogoUrl !== undefined) {
      footerSettings.footerLogoUrl = footerLogoUrl;
    }
    if (fullWidthLogoUrl !== undefined) {
      footerSettings.massiveFooterLogoUrl = fullWidthLogoUrl;
    }
    if (massiveLogoOpacity !== undefined) {
      footerSettings.massiveFooterLogoOpacity = massiveLogoOpacity;
    }

    // Social links
    if (socialLinks !== undefined) {
      if (socialLinks.instagramUrl !== undefined) {
        footerSettings.instagramUrl = socialLinks.instagramUrl || null;
      }
      if (socialLinks.facebookUrl !== undefined) {
        footerSettings.facebookUrl = socialLinks.facebookUrl || null;
      }
      if (socialLinks.tiktokUrl !== undefined) {
        footerSettings.tiktokUrl = socialLinks.tiktokUrl || null;
      }
      if (socialLinks.amazonStoreUrl !== undefined) {
        footerSettings.amazonStoreUrl = socialLinks.amazonStoreUrl || null;
      }
    }

    // Email signup settings
    if (emailSignup !== undefined) {
      footerSettings.footerEmailSignupEnabled = emailSignup.enabled ?? true;
      footerSettings.footerEmailSignupTitle = emailSignup.title || "Join the Archie's Community";
      footerSettings.footerEmailSignupSubtitle = emailSignup.subtitle || null;
      footerSettings.footerEmailSignupPlaceholder = emailSignup.placeholder || 'Enter your email';
      footerSettings.footerEmailSignupButtonText = emailSignup.buttonText || 'Sign Up';
      footerSettings.footerEmailSignupSuccessMessage = emailSignup.successMessage || null;
    }

    // Column titles
    if (columnTitles !== undefined) {
      footerSettings.footerColumn1Title = columnTitles.column1 || 'Shop';
      footerSettings.footerColumn2Title = columnTitles.column2 || 'Learn';
      footerSettings.footerColumn3Title = columnTitles.column3 || 'Support';
      footerSettings.footerColumn4Title = columnTitles.column4 || 'Certifications';
    }

    // Certifications
    if (certifications !== undefined && Array.isArray(certifications)) {
      if (certifications[0]) {
        footerSettings.footerCert1Icon = certifications[0].icon || 'droplet';
        footerSettings.footerCert1IconUrl = certifications[0].iconUrl || null;
        footerSettings.footerCert1Label = certifications[0].label || 'Preservative Free';
      }
      if (certifications[1]) {
        footerSettings.footerCert2Icon = certifications[1].icon || 'flag';
        footerSettings.footerCert2IconUrl = certifications[1].iconUrl || null;
        footerSettings.footerCert2Label = certifications[1].label || 'Made in USA';
      }
      if (certifications[2]) {
        footerSettings.footerCert3Icon = certifications[2].icon || 'rabbit';
        footerSettings.footerCert3IconUrl = certifications[2].iconUrl || null;
        footerSettings.footerCert3Label = certifications[2].label || 'Cruelty Free';
      }
    }

    // Legal links
    if (legalLinks !== undefined) {
      footerSettings.footerPrivacyUrl = legalLinks.privacyUrl || '/privacy';
      footerSettings.footerPrivacyLabel = legalLinks.privacyLabel || 'Privacy Policy';
      footerSettings.footerTermsUrl = legalLinks.termsUrl || '/terms';
      footerSettings.footerTermsLabel = legalLinks.termsLabel || 'Terms of Service';
    }

    // Update or insert settings
    if (existingSettings) {
      await db.update(siteSettings).set(footerSettings).where(eq(siteSettings.id, existingSettings.id));
    } else {
      await db.insert(siteSettings).values({
        id: generateId(),
        ...footerSettings,
      });
    }

    // Update footer links
    if (links !== undefined) {
      // Delete existing links
      const existingLinks = await db.select({ id: footerLinks.id }).from(footerLinks);
      for (const link of existingLinks) {
        await db.delete(footerLinks).where(eq(footerLinks.id, link.id));
      }

      // Insert new links
      let sortOrder = 0;
      for (const [column, columnLinks] of Object.entries(links)) {
        if (Array.isArray(columnLinks)) {
          for (const link of columnLinks as any[]) {
            await db.insert(footerLinks).values({
              id: link.id?.startsWith('new-') ? generateId() : (link.id || generateId()),
              label: link.label,
              url: link.url,
              column: column,
              isExternal: link.isExternal ?? false,
              isActive: link.isActive ?? true,
              sortOrder: sortOrder++,
            });
          }
        }
      }
    }

    // Invalidate caches - footer is on all pages
    revalidateTag('homepage-data', 'max');
    revalidateTag('page-data', 'max');
    revalidateTag('header-data', 'max');
    revalidateTag('dynamic-page-data', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update footer:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
