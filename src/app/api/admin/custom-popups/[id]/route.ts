import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customPopups } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

// GET /api/admin/custom-popups/[id] - Get a single popup
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;

    const [popup] = await db
      .select()
      .from(customPopups)
      .where(eq(customPopups.id, id));

    if (!popup) {
      return NextResponse.json({ error: 'Popup not found' }, { status: 404 });
    }

    // Parse JSON fields
    const parsed = {
      ...popup,
      targetPages: popup.targetPages ? JSON.parse(popup.targetPages) : [],
      targetProductIds: popup.targetProductIds ? JSON.parse(popup.targetProductIds) : [],
    };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Failed to fetch popup:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PUT /api/admin/custom-popups/[id] - Update a popup
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    // Verify popup exists
    const [existing] = await db
      .select()
      .from(customPopups)
      .where(eq(customPopups.id, id));

    if (!existing) {
      return NextResponse.json({ error: 'Popup not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    const allowedFields = [
      'name',
      'title',
      'body',
      'videoUrl',
      'videoThumbnailUrl',
      'imageUrl',
      'ctaType',
      'ctaButtonText',
      'downloadFileUrl',
      'downloadFileName',
      'targetType',
      'triggerType',
      'triggerDelay',
      'triggerScrollPercent',
      'dismissDays',
      'status',
      'priority',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle JSON fields
    if (body.targetPages !== undefined) {
      updateData.targetPages = body.targetPages ? JSON.stringify(body.targetPages) : null;
    }
    if (body.targetProductIds !== undefined) {
      updateData.targetProductIds = body.targetProductIds ? JSON.stringify(body.targetProductIds) : null;
    }

    await db
      .update(customPopups)
      .set(updateData)
      .where(eq(customPopups.id, id));

    const [updated] = await db
      .select()
      .from(customPopups)
      .where(eq(customPopups.id, id));

    // Parse JSON fields for response
    const parsed = {
      ...updated,
      targetPages: updated.targetPages ? JSON.parse(updated.targetPages) : [],
      targetProductIds: updated.targetProductIds ? JSON.parse(updated.targetProductIds) : [],
    };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Failed to update popup:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/admin/custom-popups/[id] - Delete a popup
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;

    // Verify popup exists
    const [existing] = await db
      .select()
      .from(customPopups)
      .where(eq(customPopups.id, id));

    if (!existing) {
      return NextResponse.json({ error: 'Popup not found' }, { status: 404 });
    }

    await db.delete(customPopups).where(eq(customPopups.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete popup:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

// PATCH /api/admin/custom-popups/[id] - Toggle status or update stats
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    // Verify popup exists
    const [existing] = await db
      .select()
      .from(customPopups)
      .where(eq(customPopups.id, id));

    if (!existing) {
      return NextResponse.json({ error: 'Popup not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    // Handle status toggle
    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    // Handle stats increment
    if (body.incrementViews) {
      updateData.viewCount = (existing.viewCount || 0) + 1;
    }
    if (body.incrementConversions) {
      updateData.conversionCount = (existing.conversionCount || 0) + 1;
    }

    await db
      .update(customPopups)
      .set(updateData)
      .where(eq(customPopups.id, id));

    const [updated] = await db
      .select()
      .from(customPopups)
      .where(eq(customPopups.id, id));

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to patch popup:', error);
    return NextResponse.json({ error: 'Failed to patch' }, { status: 500 });
  }
}
