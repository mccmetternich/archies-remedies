import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customPopups } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

// GET /api/admin/custom-popups - List all custom popups
export async function GET() {
  try {
    const popups = await db
      .select()
      .from(customPopups)
      .orderBy(desc(customPopups.createdAt));

    return NextResponse.json(popups);
  } catch (error) {
    console.error('Failed to fetch custom popups:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST /api/admin/custom-popups - Create a new custom popup
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      title,
      body: bodyText,
      videoUrl,
      videoThumbnailUrl,
      imageUrl,
      ctaType = 'email',
      ctaButtonText = 'Subscribe',
      downloadFileUrl,
      downloadFileName,
      targetType = 'all',
      targetPages,
      targetProductIds,
      triggerType = 'timer',
      triggerDelay = 5,
      triggerScrollPercent = 50,
      dismissDays = 7,
      status = 'draft',
      priority = 0,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const id = generateId();
    const now = new Date().toISOString();

    await db.insert(customPopups).values({
      id,
      name,
      title: title || null,
      body: bodyText || null,
      videoUrl: videoUrl || null,
      videoThumbnailUrl: videoThumbnailUrl || null,
      imageUrl: imageUrl || null,
      ctaType,
      ctaButtonText,
      downloadFileUrl: downloadFileUrl || null,
      downloadFileName: downloadFileName || null,
      targetType,
      targetPages: targetPages ? JSON.stringify(targetPages) : null,
      targetProductIds: targetProductIds ? JSON.stringify(targetProductIds) : null,
      triggerType,
      triggerDelay,
      triggerScrollPercent,
      dismissDays,
      status,
      priority,
      viewCount: 0,
      conversionCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    const [created] = await db
      .select()
      .from(customPopups)
      .where(eq(customPopups.id, id));

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create custom popup:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
