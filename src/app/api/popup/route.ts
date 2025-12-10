import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customPopups } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// GET /api/popup - Get applicable popup for current page
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '/';
    const productId = searchParams.get('productId');

    // Get all live custom popups
    const livePopups = await db
      .select()
      .from(customPopups)
      .where(eq(customPopups.status, 'live'))
      .orderBy(desc(customPopups.priority));

    // Find matching popup
    let matchingPopup = null;

    for (const popup of livePopups) {
      const targetType = popup.targetType;

      if (targetType === 'all') {
        // Matches all pages
        matchingPopup = popup;
        break;
      }

      if (targetType === 'specific' && popup.targetPages) {
        const targetPages = JSON.parse(popup.targetPages);
        if (targetPages.includes(page) || targetPages.some((p: string) => page.startsWith(p))) {
          matchingPopup = popup;
          break;
        }
      }

      if (targetType === 'product' && productId && popup.targetProductIds) {
        const targetProductIds = JSON.parse(popup.targetProductIds);
        if (targetProductIds.includes(productId)) {
          matchingPopup = popup;
          break;
        }
      }
    }

    if (!matchingPopup) {
      return NextResponse.json({ popup: null });
    }

    // Parse JSON fields
    const parsed = {
      ...matchingPopup,
      targetPages: matchingPopup.targetPages ? JSON.parse(matchingPopup.targetPages) : [],
      targetProductIds: matchingPopup.targetProductIds ? JSON.parse(matchingPopup.targetProductIds) : [],
    };

    return NextResponse.json({ popup: parsed });
  } catch (error) {
    console.error('Failed to fetch popup:', error);
    return NextResponse.json({ popup: null });
  }
}
