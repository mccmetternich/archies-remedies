import { NextResponse } from 'next/server';
import { db, contactSubmissions } from '@/lib/db';
import { generateId } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, name, email, subject, message } = await request.json();

    // Support both old (name) and new (firstName/lastName) formats
    const resolvedFirstName = firstName || name?.split(' ')[0] || '';
    const resolvedLastName = lastName || name?.split(' ').slice(1).join(' ') || '';
    const fullName = name || `${resolvedFirstName} ${resolvedLastName}`.trim();

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
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
