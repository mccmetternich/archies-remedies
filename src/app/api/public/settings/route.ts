import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';

/**
 * Public settings endpoint - returns only non-sensitive site settings
 * Used by team-access login page and other public pages that need branding
 */
export async function GET() {
  try {
    const settings = await db.select().from(siteSettings).limit(1);
    const data = settings[0];

    if (!data) {
      return NextResponse.json({
        siteName: "Archie's Remedies",
        logoUrl: null,
        draftModeBadgeUrl: null,
        primaryColor: '#bbdae9',
      });
    }

    // Return only public-safe settings
    return NextResponse.json({
      siteName: data.siteName,
      logoUrl: data.logoUrl,
      draftModeBadgeUrl: data.draftModeBadgeUrl,
      primaryColor: data.primaryColor,
      tagline: data.tagline,
    });
  } catch (error) {
    console.error('Failed to fetch public settings:', error);
    return NextResponse.json({
      siteName: "Archie's Remedies",
      logoUrl: null,
      draftModeBadgeUrl: null,
      primaryColor: '#bbdae9',
    });
  }
}
