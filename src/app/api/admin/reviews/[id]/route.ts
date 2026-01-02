import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { reviews} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

// GET: Fetch single review
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const data = await db.select().from(reviews).where(eq(reviews.id, id));

    if (data.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Failed to fetch review:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PUT: Update single review
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const data = await request.json();

    // Parse keywords if needed
    let keywords = data.keywords;
    if (Array.isArray(keywords)) {
      keywords = JSON.stringify(keywords);
    }

    await db.update(reviews)
      .set({
        rating: data.rating,
        title: data.title || null,
        authorName: data.authorName,
        authorInitial: data.authorInitial,
        text: data.text,
        keywords,
        isVerified: data.isVerified,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      })
      .where(eq(reviews.id, id));

    revalidateTag('page-data', 'max');
    revalidateTag('product-data', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update review:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE: Delete single review
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    await db.delete(reviews).where(eq(reviews.id, id));

    revalidateTag('page-data', 'max');
    revalidateTag('product-data', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete review:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
