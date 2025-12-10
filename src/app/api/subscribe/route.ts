import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { contacts, contactActivity } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

// POST /api/subscribe - Public email subscription endpoint
// Writes to the unified contacts table
export async function POST(request: Request) {
  try {
    const { email, source } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Get visitor ID from cookie if available
    const cookieStore = await cookies();
    const visitorId = cookieStore.get('visitor_id')?.value;

    const now = new Date().toISOString();

    // Check if contact already exists
    const existingContacts = await db
      .select()
      .from(contacts)
      .where(eq(contacts.email, normalizedEmail))
      .limit(1);

    let contactId: string;

    if (existingContacts.length > 0) {
      contactId = existingContacts[0].id;

      // Update existing contact
      await db
        .update(contacts)
        .set({
          visitorId: visitorId || existingContacts[0].visitorId,
          emailStatus: 'active',
          emailConsentAt: existingContacts[0].emailConsentAt || now,
          updatedAt: now,
        })
        .where(eq(contacts.id, contactId));

      // Record re-subscribe activity
      await db.insert(contactActivity).values({
        id: generateId(),
        contactId,
        activityType: 'email_resubscribe',
        activityData: JSON.stringify({ source: source || 'website' }),
        visitorId: visitorId || null,
        createdAt: now,
      });

      return NextResponse.json(
        { message: 'Already subscribed', contactId },
        { status: 200 }
      );
    }

    // Create new contact
    contactId = generateId();
    await db.insert(contacts).values({
      id: contactId,
      email: normalizedEmail,
      emailStatus: 'active',
      emailConsentAt: now,
      source: source || 'website',
      visitorId: visitorId || null,
      createdAt: now,
      updatedAt: now,
    });

    // Record activity
    await db.insert(contactActivity).values({
      id: generateId(),
      contactId,
      activityType: 'email_subscribe',
      activityData: JSON.stringify({ source: source || 'website' }),
      visitorId: visitorId || null,
      createdAt: now,
    });

    return NextResponse.json(
      { message: 'Successfully subscribed', contactId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
