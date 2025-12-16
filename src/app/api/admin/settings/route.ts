import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const [settings] = await db.select().from(siteSettings).limit(1);

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = {
        id: 'default',
        siteName: "Archie's Remedies",
        tagline: 'Safe, Dry Eye Relief that Works',
        primaryColor: '#bbdae9',
        secondaryColor: '#f5f0eb',
        emailPopupEnabled: true,
        emailPopupTitle: "Join the Archie's Community",
        emailPopupButtonText: 'Get My 10% Off',
      };

      await db.insert(siteSettings).values(defaultSettings);
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const data = await request.json();

    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Ensure we have a valid ID to update
    const settingsId = data.id || 'default';

    const result = await db
      .update(siteSettings)
      .set(updateData)
      .where(eq(siteSettings.id, settingsId));

    // Invalidate all cached page data so changes take effect immediately
    revalidateTag('homepage-data', 'max');
    revalidateTag('page-data', 'max');
    revalidateTag('header-data', 'max');
    revalidateTag('settings', 'max');
    revalidateTag('dynamic-page-data', 'max');

    return NextResponse.json({ success: true, updated: updateData });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
