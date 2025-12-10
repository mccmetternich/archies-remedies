import { NextResponse } from 'next/server';
import { db, contactSubmissions } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { contactFormSchema, validateRequest } from '@/lib/validations';

export async function POST(request: Request) {
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

    // Insert contact submission
    await db.insert(contactSubmissions).values({
      id: generateId(),
      firstName: resolvedFirstName,
      lastName: resolvedLastName || null,
      name: fullName,
      email: email.toLowerCase(),
      subject: subject || null,
      message,
      isRead: false,
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
