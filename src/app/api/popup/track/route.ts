import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { contactActivity, contacts, customPopups } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

// POST /api/popup/track - Track popup views and dismissals
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      popupId,
      popupType, // 'welcome' | 'exit' | 'custom'
      action, // 'view' | 'dismiss'
      pageSlug,
    } = body;

    // Get visitor ID from cookie
    const cookieStore = await cookies();
    const visitorId = cookieStore.get('visitor_id')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    const now = new Date().toISOString();

    // Try to find contact by visitor ID
    let contactId: string | null = null;
    if (visitorId) {
      const existingContacts = await db
        .select()
        .from(contacts)
        .where(eq(contacts.visitorId, visitorId))
        .limit(1);

      if (existingContacts.length > 0) {
        contactId = existingContacts[0].id;
      }
    }

    // Record activity
    if (action === 'view') {
      await db.insert(contactActivity).values({
        id: generateId(),
        contactId: contactId || null,
        activityType: 'popup_view',
        activityData: JSON.stringify({ popupType }),
        popupId: popupId || null,
        pageSlug: pageSlug || null,
        visitorId: visitorId || null,
        sessionId: sessionId || null,
        createdAt: now,
      });

      // Increment view count for custom popup
      if (popupId) {
        await db
          .update(customPopups)
          .set({
            viewCount: sql`${customPopups.viewCount} + 1`,
          })
          .where(eq(customPopups.id, popupId));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track popup:', error);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}
