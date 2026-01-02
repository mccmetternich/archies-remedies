import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { reviews, reviewKeywords, products } from '@/lib/db/schema';
import { eq, isNull, and, sql } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { requireAuth } from '@/lib/api-auth';

// GET: Fetch reviews with optional filtering
export async function GET(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const collectionName = searchParams.get('collection');

    let query = db.select().from(reviews);

    if (productId) {
      query = query.where(eq(reviews.productId, productId)) as typeof query;
    } else if (collectionName) {
      query = query.where(eq(reviews.collectionName, collectionName)) as typeof query;
    }

    const data = await query.orderBy(reviews.sortOrder);

    // Also fetch keywords for this product/collection
    let keywordQuery = db.select().from(reviewKeywords);
    if (productId) {
      keywordQuery = keywordQuery.where(eq(reviewKeywords.productId, productId)) as typeof keywordQuery;
    } else if (collectionName) {
      keywordQuery = keywordQuery.where(eq(reviewKeywords.collectionName, collectionName)) as typeof keywordQuery;
    }
    const keywords = await keywordQuery.orderBy(reviewKeywords.sortOrder);

    return NextResponse.json({ reviews: data, keywords });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST: Create a single review
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const data = await request.json();

    // Generate author initial from last name if not provided
    let authorInitial = data.authorInitial;
    if (!authorInitial && data.lastName) {
      authorInitial = `${data.firstName} ${data.lastName.charAt(0)}.`;
    } else if (!authorInitial) {
      authorInitial = data.authorName;
    }

    const newReview = {
      id: generateId(),
      productId: data.productId || null,
      collectionName: data.collectionName || null,
      rating: data.rating || 5,
      title: data.title || null,
      authorName: data.authorName || data.firstName || 'Anonymous',
      authorInitial,
      text: data.text,
      keywords: data.keywords ? JSON.stringify(data.keywords) : null,
      isVerified: data.isVerified ?? true,
      isFeatured: data.isFeatured ?? false,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
    };

    await db.insert(reviews).values(newReview);

    // Update keyword counts if keywords provided
    if (data.keywords && Array.isArray(data.keywords)) {
      await updateKeywordCounts(data.productId, data.collectionName, data.keywords);
    }

    revalidateTag('page-data', 'max');
    revalidateTag('product-data', 'max');

    return NextResponse.json({ success: true, id: newReview.id });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

// PUT: Batch update reviews for a product/collection
export async function PUT(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { reviews: items, productId, collectionName } = await request.json();

    // Delete existing reviews for this product/collection
    if (productId) {
      await db.delete(reviews).where(eq(reviews.productId, productId));
      await db.delete(reviewKeywords).where(eq(reviewKeywords.productId, productId));
    } else if (collectionName) {
      await db.delete(reviews).where(eq(reviews.collectionName, collectionName));
      await db.delete(reviewKeywords).where(eq(reviewKeywords.collectionName, collectionName));
    }

    // Track all keywords for aggregation
    const keywordCounts = new Map<string, number>();

    // Insert all reviews with new order
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Parse keywords if string
      let keywordsArray: string[] = [];
      if (typeof item.keywords === 'string') {
        try {
          keywordsArray = JSON.parse(item.keywords);
        } catch {
          keywordsArray = item.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
        }
      } else if (Array.isArray(item.keywords)) {
        keywordsArray = item.keywords;
      }

      // Count keywords
      keywordsArray.forEach((keyword: string) => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      });

      await db.insert(reviews).values({
        id: item.id?.startsWith('new-') ? generateId() : (item.id || generateId()),
        productId: productId || null,
        collectionName: collectionName || null,
        rating: item.rating || 5,
        title: item.title || null,
        authorName: item.authorName,
        authorInitial: item.authorInitial || item.authorName,
        text: item.text,
        keywords: keywordsArray.length > 0 ? JSON.stringify(keywordsArray) : null,
        isVerified: item.isVerified ?? true,
        isFeatured: item.isFeatured ?? false,
        isActive: item.isActive ?? true,
        sortOrder: i,
      });
    }

    // Insert aggregated keywords
    let keywordOrder = 0;
    for (const [keyword, count] of keywordCounts) {
      await db.insert(reviewKeywords).values({
        id: generateId(),
        productId: productId || null,
        collectionName: collectionName || null,
        keyword,
        count,
        sortOrder: keywordOrder++,
      });
    }

    revalidateTag('page-data', 'max');
    revalidateTag('product-data', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update reviews:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// Helper: Update keyword counts
async function updateKeywordCounts(productId: string | null, collectionName: string | null, keywords: string[]) {
  for (const keyword of keywords) {
    // Check if keyword exists
    let existing;
    if (productId) {
      existing = await db.select().from(reviewKeywords)
        .where(and(eq(reviewKeywords.productId, productId), eq(reviewKeywords.keyword, keyword)));
    } else if (collectionName) {
      existing = await db.select().from(reviewKeywords)
        .where(and(eq(reviewKeywords.collectionName, collectionName), eq(reviewKeywords.keyword, keyword)));
    }

    if (existing && existing.length > 0) {
      // Increment count
      await db.update(reviewKeywords)
        .set({ count: (existing[0].count || 0) + 1 })
        .where(eq(reviewKeywords.id, existing[0].id));
    } else {
      // Create new keyword
      await db.insert(reviewKeywords).values({
        id: generateId(),
        productId: productId || null,
        collectionName: collectionName || null,
        keyword,
        count: 1,
        sortOrder: 0,
      });
    }
  }
}
