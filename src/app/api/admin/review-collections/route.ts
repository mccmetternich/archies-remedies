import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { reviews, reviewKeywords } from '@/lib/db/schema';
import { eq, isNotNull, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

// GET: List all unique collection names with stats
export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    // Get all reviews with collection names
    const collectionsData = await db
      .select({
        collectionName: reviews.collectionName,
        count: sql<number>`count(*)`,
        avgRating: sql<number>`avg(${reviews.rating})`,
      })
      .from(reviews)
      .where(isNotNull(reviews.collectionName))
      .groupBy(reviews.collectionName);

    const collections = collectionsData.map((c) => ({
      name: c.collectionName,
      reviewCount: c.count,
      avgRating: c.avgRating ? Math.round(c.avgRating * 10) / 10 : null,
    }));

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST: Create a new collection (just validates the name doesn't exist)
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Check if collection already exists
    const existing = await db
      .select()
      .from(reviews)
      .where(eq(reviews.collectionName, trimmedName))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Collection already exists' }, { status: 400 });
    }

    // Collection will be created when first review is added
    // For now, just return success with the validated name
    return NextResponse.json({ success: true, name: trimmedName });
  } catch (error) {
    console.error('Failed to create collection:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

// DELETE: Delete a collection and all its reviews
export async function DELETE(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    // Delete all reviews in this collection
    await db.delete(reviews).where(eq(reviews.collectionName, name));

    // Delete all keywords for this collection
    await db.delete(reviewKeywords).where(eq(reviewKeywords.collectionName, name));

    revalidateTag('page-data', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete collection:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
