import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts, contactActivity, products, customPopups } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

// GET /api/admin/subscribers/[id] - Get contact with activity history
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;

    // Get contact
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id));

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Get activity history with related data
    const activities = await db
      .select({
        id: contactActivity.id,
        activityType: contactActivity.activityType,
        activityData: contactActivity.activityData,
        popupId: contactActivity.popupId,
        productId: contactActivity.productId,
        pageSlug: contactActivity.pageSlug,
        createdAt: contactActivity.createdAt,
        productName: products.name,
        productSlug: products.slug,
        popupName: customPopups.name,
      })
      .from(contactActivity)
      .leftJoin(products, eq(contactActivity.productId, products.id))
      .leftJoin(customPopups, eq(contactActivity.popupId, customPopups.id))
      .where(eq(contactActivity.contactId, id))
      .orderBy(desc(contactActivity.createdAt));

    return NextResponse.json({
      ...contact,
      activities,
    });
  } catch (error) {
    console.error('Failed to fetch contact:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PATCH /api/admin/subscribers/[id] - Update contact
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    // Verify contact exists
    const [existing] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id));

    if (!existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    // Only update provided fields
    const allowedFields = [
      'email',
      'phone',
      'firstName',
      'lastName',
      'address',
      'city',
      'state',
      'zipCode',
      'country',
      'notes',
      'emailStatus',
      'smsStatus',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    await db
      .update(contacts)
      .set(updateData)
      .where(eq(contacts.id, id));

    // Return updated contact
    const [updated] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id));

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update contact:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/admin/subscribers/[id] - Delete contact
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;

    // Verify contact exists
    const [existing] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id));

    if (!existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Delete contact (activity will cascade)
    await db.delete(contacts).where(eq(contacts.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete contact:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
