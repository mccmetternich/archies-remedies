import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { blogPosts, blogTags, blogPostTags } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireAuth } from '@/lib/api-auth';

// GET /api/admin/blog/posts/[id] - Get a single post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get tags for this post
    const postTags = await db
      .select({
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug,
        color: blogTags.color,
      })
      .from(blogPostTags)
      .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
      .where(eq(blogPostTags.postId, id));

    return NextResponse.json({ ...post, tags: postTags });
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PATCH /api/admin/blog/posts/[id] - Update a post
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    // Calculate reading time if content is updated
    if (body.content !== undefined) {
      const wordCount = (body.content || '').split(/\s+/).length;
      body.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    // Set publishedAt if status changed to published
    if (body.status === 'published') {
      const [existing] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
      if (existing && existing.status !== 'published') {
        body.publishedAt = new Date().toISOString();
      }
    }

    // Update slug if title changed and no custom slug
    if (body.title && !body.slug) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    body.updatedAt = new Date().toISOString();

    // Handle tag updates separately
    const tagIds = body.tagIds;
    delete body.tagIds;

    await db.update(blogPosts).set(body).where(eq(blogPosts.id, id));

    // Update tags if provided
    if (tagIds !== undefined) {
      // Remove existing tags
      await db.delete(blogPostTags).where(eq(blogPostTags.postId, id));

      // Add new tags
      if (tagIds.length > 0) {
        const tagRelations = tagIds.map((tagId: string) => ({
          id: nanoid(),
          postId: id,
          tagId,
        }));
        await db.insert(blogPostTags).values(tagRelations);
      }
    }

    // Fetch updated post with tags
    const [updated] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    const postTags = await db
      .select({
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug,
        color: blogTags.color,
      })
      .from(blogPostTags)
      .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
      .where(eq(blogPostTags.postId, id));

    // Invalidate blog cache
    revalidateTag('blog-data', 'max');

    return NextResponse.json({ ...updated, tags: postTags });
  } catch (error) {
    console.error('Failed to update blog post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// PUT /api/admin/blog/posts/[id] - Update a post (alternative to PATCH)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Delegate to PATCH handler
  return PATCH(request, { params });
}

// DELETE /api/admin/blog/posts/[id] - Delete a post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;

    // Tags will be deleted automatically due to CASCADE
    await db.delete(blogPosts).where(eq(blogPosts.id, id));

    // Invalidate blog cache
    revalidateTag('blog-data', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete blog post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
