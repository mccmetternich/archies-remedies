import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogTags } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

// GET /api/admin/blog/tags/[id] - Get a single tag
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const [tag] = await db.select().from(blogTags).where(eq(blogTags.id, id));

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Failed to fetch tag:', error);
    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 });
  }
}

// PATCH /api/admin/blog/tags/[id] - Update a tag
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    // Update slug if name changed
    if (body.name && !body.slug) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    await db.update(blogTags).set(body).where(eq(blogTags.id, id));

    const [updated] = await db.select().from(blogTags).where(eq(blogTags.id, id));

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update tag:', error);
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

// DELETE /api/admin/blog/tags/[id] - Delete a tag
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;

    // Post-tag relations will be deleted automatically due to CASCADE
    await db.delete(blogTags).where(eq(blogTags.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
