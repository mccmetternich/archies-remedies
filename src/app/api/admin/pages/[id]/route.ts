import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const [page] = await db.select().from(pages).where(eq(pages.id, id));

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    // Get page slug to determine which cache to invalidate
    const [existingPage] = await db.select({ slug: pages.slug }).from(pages).where(eq(pages.id, id));

    await db
      .update(pages)
      .set({
        slug: body.slug,
        title: body.title,
        pageType: body.pageType,
        content: body.content,
        widgets: body.widgets,
        heroImageUrl: body.heroImageUrl,
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        pageTitle: body.pageTitle,
        pageSubtitle: body.pageSubtitle,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        isActive: body.isActive,
        showInNav: body.showInNav,
        navOrder: body.navOrder,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(pages.id, id));

    // Invalidate caches - homepage and dynamic pages
    if (existingPage?.slug === 'home' || body.slug === 'home') {
      revalidateTag('homepage-data', 'max');
    }
    revalidateTag('page-data', 'max');
    revalidateTag('dynamic-page-data', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update page:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    // Get page slug to determine which cache to invalidate
    const [existingPage] = await db.select({ slug: pages.slug }).from(pages).where(eq(pages.id, id));

    await db
      .update(pages)
      .set({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(pages.id, id));

    // Invalidate caches - homepage and dynamic pages
    if (existingPage?.slug === 'home' || body.slug === 'home') {
      revalidateTag('homepage-data', 'max');
    }
    revalidateTag('page-data', 'max');
    revalidateTag('dynamic-page-data', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update page:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    await db.delete(pages).where(eq(pages.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete page:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
