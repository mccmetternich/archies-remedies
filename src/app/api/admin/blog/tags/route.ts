import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogTags } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { requireAuth } from '@/lib/api-auth';

// GET /api/admin/blog/tags - List all tags
export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const tags = await db.select().from(blogTags);
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Failed to fetch blog tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// POST /api/admin/blog/tags - Create a new tag
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const id = nanoid();

    // Generate slug from name if not provided
    const slug = body.slug || body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newTag = {
      id,
      name: body.name,
      slug,
      description: body.description || null,
      color: body.color || '#bbdae9',
    };

    await db.insert(blogTags).values(newTag);

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error('Failed to create blog tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
