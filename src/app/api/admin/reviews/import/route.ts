import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { reviews, reviewKeywords } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { requireAuth } from '@/lib/api-auth';

interface ParsedReview {
  firstName: string;
  lastName: string;
  rating: number;
  title: string;
  text: string;
  tags: string[];
  isVerified: boolean;
  errors: string[];
}

// POST: Import reviews from CSV data
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { csvData, productId, collectionName, mode = 'append' } = await request.json();

    if (!csvData || !Array.isArray(csvData)) {
      return NextResponse.json({ error: 'Invalid CSV data' }, { status: 400 });
    }

    if (!productId && !collectionName) {
      return NextResponse.json({ error: 'Must specify productId or collectionName' }, { status: 400 });
    }

    // If mode is 'replace', delete existing reviews
    if (mode === 'replace') {
      if (productId) {
        await db.delete(reviews).where(eq(reviews.productId, productId));
        await db.delete(reviewKeywords).where(eq(reviewKeywords.productId, productId));
      } else if (collectionName) {
        await db.delete(reviews).where(eq(reviews.collectionName, collectionName));
        await db.delete(reviewKeywords).where(eq(reviewKeywords.collectionName, collectionName));
      }
    }

    // Get current max sortOrder
    let startOrder = 0;
    if (mode === 'append') {
      const existing = productId
        ? await db.select().from(reviews).where(eq(reviews.productId, productId))
        : await db.select().from(reviews).where(eq(reviews.collectionName, collectionName!));
      startOrder = existing.length;
    }

    // Track all keywords for aggregation
    const keywordCounts = new Map<string, number>();
    const importedReviews: string[] = [];
    const errors: { row: number; errors: string[] }[] = [];

    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const parsed = parseReviewRow(row, i + 1);

      if (parsed.errors.length > 0) {
        errors.push({ row: i + 1, errors: parsed.errors });
        continue;
      }

      // Generate author initial: "FirstName L."
      const authorInitial = parsed.lastName
        ? `${parsed.firstName} ${parsed.lastName.charAt(0)}.`
        : parsed.firstName;

      // Count keywords
      parsed.tags.forEach((tag) => {
        keywordCounts.set(tag, (keywordCounts.get(tag) || 0) + 1);
      });

      const reviewId = generateId();
      await db.insert(reviews).values({
        id: reviewId,
        productId: productId || null,
        collectionName: collectionName || null,
        rating: parsed.rating,
        title: parsed.title || null,
        authorName: `${parsed.firstName} ${parsed.lastName || ''}`.trim(),
        authorInitial,
        text: parsed.text,
        keywords: parsed.tags.length > 0 ? JSON.stringify(parsed.tags) : null,
        isVerified: parsed.isVerified,
        isFeatured: false,
        isActive: true,
        sortOrder: startOrder + i,
      });

      importedReviews.push(reviewId);
    }

    // Update keyword counts
    for (const [keyword, count] of keywordCounts) {
      // Check if keyword exists
      let existing;
      if (productId) {
        existing = await db.select().from(reviewKeywords)
          .where(and(eq(reviewKeywords.productId, productId), eq(reviewKeywords.keyword, keyword)));
      } else {
        existing = await db.select().from(reviewKeywords)
          .where(and(eq(reviewKeywords.collectionName, collectionName!), eq(reviewKeywords.keyword, keyword)));
      }

      if (existing && existing.length > 0) {
        // Update count
        await db.update(reviewKeywords)
          .set({ count: (existing[0].count || 0) + count })
          .where(eq(reviewKeywords.id, existing[0].id));
      } else {
        // Create new keyword
        await db.insert(reviewKeywords).values({
          id: generateId(),
          productId: productId || null,
          collectionName: collectionName || null,
          keyword,
          count,
          sortOrder: 0,
        });
      }
    }

    revalidateTag('page-data', 'max');
    revalidateTag('product-data', 'max');

    return NextResponse.json({
      success: true,
      imported: importedReviews.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Failed to import reviews:', error);
    return NextResponse.json({ error: 'Failed to import' }, { status: 500 });
  }
}

// Helper: Parse a single review row
function parseReviewRow(row: Record<string, unknown>, rowNum: number): ParsedReview {
  const errors: string[] = [];

  // Extract fields with flexible column name matching
  const firstName = getField(row, ['first_name', 'firstname', 'first', 'name']) as string || '';
  const lastName = getField(row, ['last_name', 'lastname', 'last']) as string || '';
  const ratingRaw = getField(row, ['rating', 'stars', 'star_rating', 'score']);
  const title = getField(row, ['title', 'headline', 'subject']) as string || '';
  const text = getField(row, ['text', 'review_text', 'review', 'body', 'content', 'message']) as string || '';
  const tagsRaw = getField(row, ['tags', 'keywords', 'labels']);
  const verifiedRaw = getField(row, ['verified', 'is_verified']);

  // Validate required fields
  if (!firstName && !lastName) {
    errors.push('Missing name');
  }
  if (!text) {
    errors.push('Missing review text');
  }

  // Parse rating (1-5)
  let rating = 5;
  if (ratingRaw !== undefined && ratingRaw !== null && ratingRaw !== '') {
    const parsed = Number(ratingRaw);
    if (isNaN(parsed) || parsed < 1 || parsed > 5) {
      errors.push('Invalid rating (must be 1-5)');
    } else {
      rating = Math.round(parsed);
    }
  }

  // Parse tags
  let tags: string[] = [];
  if (tagsRaw) {
    if (typeof tagsRaw === 'string') {
      tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
    } else if (Array.isArray(tagsRaw)) {
      tags = tagsRaw.map((t) => String(t).trim()).filter(Boolean);
    }
  }

  // Parse verified
  let isVerified = true;
  if (verifiedRaw !== undefined && verifiedRaw !== null) {
    if (typeof verifiedRaw === 'boolean') {
      isVerified = verifiedRaw;
    } else if (typeof verifiedRaw === 'string') {
      isVerified = ['true', 'yes', '1', 'verified'].includes(verifiedRaw.toLowerCase());
    } else if (typeof verifiedRaw === 'number') {
      isVerified = verifiedRaw === 1;
    }
  }

  return {
    firstName,
    lastName,
    rating,
    title,
    text,
    tags,
    isVerified,
    errors,
  };
}

// Helper: Get field value with flexible column name matching
function getField(row: Record<string, unknown>, possibleNames: string[]): unknown {
  for (const name of possibleNames) {
    // Try exact match
    if (row[name] !== undefined) return row[name];
    // Try lowercase
    if (row[name.toLowerCase()] !== undefined) return row[name.toLowerCase()];
    // Try with spaces instead of underscores
    const spacedName = name.replace(/_/g, ' ');
    if (row[spacedName] !== undefined) return row[spacedName];
  }
  return undefined;
}
