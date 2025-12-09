import { NextResponse } from 'next/server';
import { db, emailSubscribers } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { eq } from 'drizzle-orm';

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

    // Check if already subscribed
    const existing = await db
      .select()
      .from(emailSubscribers)
      .where(eq(emailSubscribers.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { message: 'Already subscribed' },
        { status: 200 }
      );
    }

    // Insert new subscriber
    await db.insert(emailSubscribers).values({
      id: generateId(),
      email: email.toLowerCase(),
      source: source || 'website',
    });

    return NextResponse.json(
      { message: 'Successfully subscribed' },
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
