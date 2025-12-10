import { NextResponse } from 'next/server';
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

    await db
      .update(siteSettings)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(siteSettings.id, data.id || 'default'));

    // Draft mode is now checked directly from the database
    // No need for cookies anymore

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
