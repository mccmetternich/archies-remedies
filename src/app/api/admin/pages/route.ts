import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

export async function GET() {
  try {
    const data = await db.select().from(pages).orderBy(pages.title);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = generateId();

    await db.insert(pages).values({
      id,
      slug: body.slug,
      title: body.title,
      pageType: body.pageType || 'content',
      content: body.content || null,
      widgets: body.widgets || null,
      heroImageUrl: body.heroImageUrl || null,
      heroTitle: body.heroTitle || null,
      heroSubtitle: body.heroSubtitle || null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      isActive: body.isActive ?? true,
      showInNav: body.showInNav ?? false,
      navOrder: body.navOrder || 0,
    });

    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error('Failed to create page:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
