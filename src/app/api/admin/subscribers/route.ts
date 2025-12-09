import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailSubscribers } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db
      .select()
      .from(emailSubscribers)
      .orderBy(desc(emailSubscribers.subscribedAt));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
