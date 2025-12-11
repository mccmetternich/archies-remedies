import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { heroSlides } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const slides = await db
      .select()
      .from(heroSlides)
      .orderBy(heroSlides.sortOrder);
    return NextResponse.json(slides);
  } catch (error) {
    console.error('Failed to fetch hero slides:', error);
    return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { slides } = await request.json();

    // Delete all existing slides
    const existing = await db.select({ id: heroSlides.id }).from(heroSlides);
    for (const slide of existing) {
      await db.delete(heroSlides).where(eq(heroSlides.id, slide.id));
    }

    // Insert all slides with new order
    for (const slide of slides) {
      await db.insert(heroSlides).values({
        id: slide.id.startsWith('new-') ? generateId() : slide.id,
        title: slide.title || null,
        subtitle: slide.subtitle || null,
        buttonText: slide.buttonText || null,
        buttonUrl: slide.buttonUrl || null,
        imageUrl: slide.imageUrl || '',
        mobileImageUrl: slide.mobileImageUrl || null,
        testimonialText: slide.testimonialText || null,
        testimonialAuthor: slide.testimonialAuthor || null,
        testimonialAvatarUrl: slide.testimonialAvatarUrl || null,
        isActive: slide.isActive ?? true,
        sortOrder: slide.sortOrder || 0,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update hero slides:', error);
    return NextResponse.json({ error: 'Failed to update slides' }, { status: 500 });
  }
}
