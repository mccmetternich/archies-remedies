import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactSubmissions } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

export async function GET() {
  try {
    const data = await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();

    await db
      .update(contactSubmissions)
      .set({ status })
      .where(eq(contactSubmissions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update contact:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
