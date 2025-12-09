import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { navigationItems, footerLinks, siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

export async function GET() {
  try {
    const navItems = await db.select().from(navigationItems).orderBy(navigationItems.sortOrder);
    const footer = await db.select().from(footerLinks).orderBy(footerLinks.sortOrder);
    const [settings] = await db.select().from(siteSettings).limit(1);

    const bumper = settings ? {
      bumperEnabled: settings.bumperEnabled,
      bumperText: settings.bumperText,
      bumperLinkUrl: settings.bumperLinkUrl,
      bumperLinkText: settings.bumperLinkText,
    } : null;

    return NextResponse.json({ navigation: navItems, footer, bumper });
  } catch (error) {
    console.error('Failed to fetch navigation:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { navigation, footer, bumper } = await request.json();

    // Update bumper settings
    if (bumper !== undefined) {
      const [existingSettings] = await db.select().from(siteSettings).limit(1);

      if (existingSettings) {
        await db.update(siteSettings).set({
          bumperEnabled: bumper.bumperEnabled,
          bumperText: bumper.bumperText,
          bumperLinkUrl: bumper.bumperLinkUrl,
          bumperLinkText: bumper.bumperLinkText,
          updatedAt: new Date().toISOString(),
        }).where(eq(siteSettings.id, existingSettings.id));
      } else {
        await db.insert(siteSettings).values({
          id: generateId(),
          bumperEnabled: bumper.bumperEnabled,
          bumperText: bumper.bumperText,
          bumperLinkUrl: bumper.bumperLinkUrl,
          bumperLinkText: bumper.bumperLinkText,
        });
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
