import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { contacts, contactActivity, customPopups } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { popupSubmitSchema, validateRequest } from '@/lib/validations';
import { rateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

// POST /api/popup/submit - Handle popup form submissions
export async function POST(request: Request) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimitResult = rateLimit(
    `popup:${clientIP}`,
    RATE_LIMITS.POPUP.limit,
    RATE_LIMITS.POPUP.windowMs
  );

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = validateRequest(popupSubmitSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const {
      popupId,
      popupType,
      ctaType,
      email,
      phone,
      source = 'popup',
      downloadFileUrl,
      downloadFileName,
    } = validation.data;

    // Get visitor ID from cookie
    const cookieStore = await cookies();
    const visitorId = cookieStore.get('visitor_id')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    const now = new Date().toISOString();
    let contactId: string | null = null;

    // Handle email submission
    if (ctaType === 'email' && email) {
      // Check if contact exists
      const existingContacts = await db
        .select()
        .from(contacts)
        .where(eq(contacts.email, email))
        .limit(1);

      if (existingContacts.length > 0) {
        // Update existing contact
        contactId = existingContacts[0].id;
        await db
          .update(contacts)
          .set({
            visitorId: visitorId || existingContacts[0].visitorId,
            updatedAt: now,
          })
          .where(eq(contacts.id, contactId));
      } else {
        // Create new contact
        contactId = generateId();
        const sourceStr = popupType === 'welcome' ? 'welcome_popup'
          : popupType === 'exit' ? 'exit_popup'
          : popupId ? `custom_popup_${popupId}`
          : source;

        await db.insert(contacts).values({
          id: contactId,
          email,
          emailStatus: 'active',
          emailConsentAt: now,
          source: sourceStr,
          sourcePopupId: popupId || null,
          visitorId: visitorId || null,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Handle SMS submission
    if (ctaType === 'sms' && phone) {
      // Check if contact exists with this phone
      const existingContacts = await db
        .select()
        .from(contacts)
        .where(eq(contacts.phone, phone))
        .limit(1);

      if (existingContacts.length > 0) {
        // Update existing contact
        contactId = existingContacts[0].id;
        await db
          .update(contacts)
          .set({
            smsStatus: 'active',
            smsConsentAt: now,
            visitorId: visitorId || existingContacts[0].visitorId,
            updatedAt: now,
          })
          .where(eq(contacts.id, contactId));
      } else {
        // Create new contact
        contactId = generateId();
        const sourceStr = popupType === 'welcome' ? 'welcome_popup'
          : popupType === 'exit' ? 'exit_popup'
          : popupId ? `custom_popup_${popupId}`
          : source;

        await db.insert(contacts).values({
          id: contactId,
          phone,
          smsStatus: 'active',
          smsConsentAt: now,
          source: sourceStr,
          sourcePopupId: popupId || null,
          visitorId: visitorId || null,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Record activity with download tracking
    if (contactId) {
      await db.insert(contactActivity).values({
        id: generateId(),
        contactId,
        activityType: 'popup_submit',
        activityData: JSON.stringify({
          popupType,
          ctaType,
          ...(downloadFileUrl && { downloadFileUrl }),
          ...(downloadFileName && { downloadFileName }),
        }),
        popupId: popupId || null,
        // Download tracking - captures what file compelled the user to sign up
        downloadFileUrl: downloadFileUrl || null,
        downloadFileName: downloadFileName || null,
        visitorId: visitorId || null,
        sessionId: sessionId || null,
        createdAt: now,
      });
    }

    // Increment conversion count for custom popup
    if (popupId) {
      await db
        .update(customPopups)
        .set({
          conversionCount: sql`${customPopups.conversionCount} + 1`,
        })
        .where(eq(customPopups.id, popupId));
    }

    return NextResponse.json({ success: true, contactId });
  } catch (error) {
    console.error('Failed to handle popup submission:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
