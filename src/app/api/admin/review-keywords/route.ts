import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { reviewKeywords } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { requireAuth } from '@/lib/api-auth';

// GET: Fetch keywords for a product or collection
export async function GET(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const collectionName = searchParams.get('collection');

    let query = db.select().from(reviewKeywords);

    if (productId) {
      query = query.where(eq(reviewKeywords.productId, productId)) as typeof query;
    } else if (collectionName) {
      query = query.where(eq(reviewKeywords.collectionName, collectionName)) as typeof query;
    }

    const data = await query.orderBy(reviewKeywords.sortOrder);
    return NextResponse.json({ keywords: data });
  } catch (error) {
    console.error('Failed to fetch keywords:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PUT: Batch update keywords (reorder, update counts, delete)
export async function PUT(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { keywords, productId, collectionName } = await request.json();

    // Delete existing keywords for this product/collection
    if (productId) {
      await db.delete(reviewKeywords).where(eq(reviewKeywords.productId, productId));
    } else if (collectionName) {
      await db.delete(reviewKeywords).where(eq(reviewKeywords.collectionName, collectionName));
    }

    // Insert updated keywords with new order
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      await db.insert(reviewKeywords).values({
        id: keyword.id?.startsWith('new-') ? generateId() : (keyword.id || generateId()),
        productId: productId || null,
        collectionName: collectionName || null,
        keyword: keyword.keyword,
        count: keyword.count || 1,
        sortOrder: i,
      });
    }

    revalidateTag('page-data', 'max');
    revalidateTag('product-data', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update keywords:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// POST: Add a single keyword
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { keyword, productId, collectionName } = await request.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    // Check if keyword already exists
    let existing;
    if (productId) {
      existing = await db.select().from(reviewKeywords)
        .where(and(eq(reviewKeywords.productId, productId), eq(reviewKeywords.keyword, keyword)));
    } else if (collectionName) {
      existing = await db.select().from(reviewKeywords)
        .where(and(eq(reviewKeywords.collectionName, collectionName), eq(reviewKeywords.keyword, keyword)));
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Keyword already exists' }, { status: 400 });
    }

    const id = generateId();
    await db.insert(reviewKeywords).values({
      id,
      productId: productId || null,
      collectionName: collectionName || null,
      keyword,
      count: 0,
      sortOrder: 0,
    });

    revalidateTag('page-data', 'max');
    revalidateTag('product-data', 'max');

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to add keyword:', error);
    return NextResponse.json({ error: 'Failed to add' }, { status: 500 });
  }
}

// DELETE: Delete a single keyword
export async function DELETE(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Keyword ID is required' }, { status: 400 });
    }

    await db.delete(reviewKeywords).where(eq(reviewKeywords.id, id));

    revalidateTag('page-data', 'max');
    revalidateTag('product-data', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete keyword:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
