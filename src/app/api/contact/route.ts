import { NextResponse } from 'next/server';
import { db, contactSubmissions, contacts } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { contactFormSchema, validateRequest } from '@/lib/validations';
import { rateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimitResult = rateLimit(
    `contact:${clientIP}`,
    RATE_LIMITS.CONTACT.limit,
    RATE_LIMITS.CONTACT.windowMs
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
    const validation = validateRequest(contactFormSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { firstName, lastName, name, email, subject, message } = validation.data;

    // Support both old (name) and new (firstName/lastName) formats
    const resolvedFirstName = firstName || name?.split(' ')[0] || '';
    const resolvedLastName = lastName || name?.split(' ').slice(1).join(' ') || '';
    const fullName = name || `${resolvedFirstName} ${resolvedLastName}`.trim();
    const normalizedEmail = email.toLowerCase();

    // Find or create contact
    let contactId: string | null = null;

    // Check if contact with this email already exists
    const existingContact = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.email, normalizedEmail))
      .limit(1);

    if (existingContact.length > 0) {
      // Use existing contact
      contactId = existingContact[0].id;
    } else {
      // Create new contact
      contactId = generateId();
      await db.insert(contacts).values({
        id: contactId,
        email: normalizedEmail,
        firstName: resolvedFirstName || null,
        lastName: resolvedLastName || null,
        source: 'contact_form',
        emailStatus: 'active',
      });
    }

    // Insert contact submission with link to contact
    await db.insert(contactSubmissions).values({
      id: generateId(),
      firstName: resolvedFirstName,
      lastName: resolvedLastName || null,
      name: fullName,
      email: normalizedEmail,
      subject: subject || null,
      message,
      isRead: false,
      contactId,
    });

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
