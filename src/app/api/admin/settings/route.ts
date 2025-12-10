import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
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
  try {
    const data = await request.json();
    const cookieStore = await cookies();

    await db
      .update(siteSettings)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(siteSettings.id, data.id || 'default'));

    // Set or clear the draft mode cookie based on the setting
    // This cookie is read by middleware to enforce draft mode
    if (data.siteInDraftMode !== undefined) {
      if (data.siteInDraftMode) {
        cookieStore.set('site_draft_mode', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
      } else {
        cookieStore.delete('site_draft_mode');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
