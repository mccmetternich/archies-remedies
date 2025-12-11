import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactSubmissions } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

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
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

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
