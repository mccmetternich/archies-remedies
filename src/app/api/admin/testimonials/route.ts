import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { testimonials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const data = await db.select().from(testimonials).orderBy(testimonials.sortOrder);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { testimonials: items } = await request.json();

    // Delete all existing
    const existing = await db.select({ id: testimonials.id }).from(testimonials);
    for (const item of existing) {
      await db.delete(testimonials).where(eq(testimonials.id, item.id));
    }

    // Insert all with new order
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await db.insert(testimonials).values({
        id: item.id.startsWith('new-') ? generateId() : item.id,
        name: item.name,
        location: item.location || null,
        avatarUrl: item.avatarUrl || null,
        rating: item.rating || 5,
        text: item.text,
        productId: item.productId || null,
        isVerified: item.isVerified ?? true,
        isFeatured: item.isFeatured ?? false,
        isActive: item.isActive ?? true,
        sortOrder: i,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update testimonials:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
