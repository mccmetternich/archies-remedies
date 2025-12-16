import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { blogSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const [settings] = await db
      .select()
      .from(blogSettings)
      .limit(1);

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        id: 'default',
        blogName: 'Blog',
        blogSlug: 'blog',
        heroMediaUrl: null,
        heroTitle: null,
        heroSubtitle: null,
        pageTitle: 'Blog',
        pageSubtitle: '',
        gridLayout: 'masonry',
        widgets: null,
        blogInDraftMode: true,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching blog settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { blogName, blogSlug, heroMediaUrl, heroTitle, heroSubtitle, pageTitle, pageSubtitle, gridLayout, widgets, blogInDraftMode } = body;

    // Check if settings exist
    const [existing] = await db
      .select()
      .from(blogSettings)
      .limit(1);

    const updatedAt = new Date().toISOString();

    if (existing) {
      // Update existing settings
      await db
        .update(blogSettings)
        .set({
          blogName,
          blogSlug,
          heroMediaUrl,
          heroTitle,
          heroSubtitle,
          pageTitle,
          pageSubtitle,
          gridLayout,
          widgets,
          blogInDraftMode,
          updatedAt,
        })
        .where(eq(blogSettings.id, existing.id));

      // Revalidate blog page cache
      revalidateTag('blog-data', 'max');

      return NextResponse.json({
        ...existing,
        blogName,
        blogSlug,
        heroMediaUrl,
        heroTitle,
        heroSubtitle,
        pageTitle,
        pageSubtitle,
        gridLayout,
        widgets,
        blogInDraftMode,
        updatedAt,
      });
    } else {
      // Create new settings
      const id = 'default';
      await db.insert(blogSettings).values({
        id,
        blogName,
        blogSlug,
        heroMediaUrl,
        heroTitle,
        heroSubtitle,
        pageTitle,
        pageSubtitle,
        gridLayout,
        widgets,
        blogInDraftMode,
        updatedAt,
      });

      // Revalidate blog page cache
      revalidateTag('blog-data', 'max');

      return NextResponse.json({
        id,
        blogName,
        blogSlug,
        heroMediaUrl,
        heroTitle,
        heroSubtitle,
        pageTitle,
        pageSubtitle,
        gridLayout,
        widgets,
        blogInDraftMode,
        updatedAt,
      });
    }
  } catch (error) {
    console.error('Error updating blog settings:', error);
    return NextResponse.json(
      { error: 'Failed to update blog settings' },
      { status: 500 }
    );
  }
}
