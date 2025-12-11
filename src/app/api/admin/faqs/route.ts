import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { faqs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const data = await db.select().from(faqs).orderBy(faqs.sortOrder);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch FAQs:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { faqs: items } = await request.json();

    // Delete all existing
    const existing = await db.select({ id: faqs.id }).from(faqs);
    for (const item of existing) {
      await db.delete(faqs).where(eq(faqs.id, item.id));
    }

    // Insert all with new order
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await db.insert(faqs).values({
        id: item.id.startsWith('new-') ? generateId() : item.id,
        question: item.question,
        answer: item.answer,
        category: item.category || 'General',
        isActive: item.isActive ?? true,
        sortOrder: i,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update FAQs:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
