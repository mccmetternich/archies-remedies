import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogPosts, blogTags, blogPostTags } from '@/lib/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/admin/blog/posts - List all posts
export async function GET() {
  try {
    const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));

    // Batch fetch all tags for all posts in ONE query (fixes N+1)
    const postIds = posts.map(p => p.id);

    const allPostTags = postIds.length > 0
      ? await db
          .select({
            postId: blogPostTags.postId,
            tagId: blogTags.id,
            tagName: blogTags.name,
            tagSlug: blogTags.slug,
            tagColor: blogTags.color,
          })
          .from(blogPostTags)
          .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
          .where(inArray(blogPostTags.postId, postIds))
      : [];

    // Group tags by post ID in memory
    const tagsByPostId = new Map<string, Array<{ id: string; name: string; slug: string; color: string | null }>>();
    for (const row of allPostTags) {
      if (!tagsByPostId.has(row.postId)) {
        tagsByPostId.set(row.postId, []);
      }
      tagsByPostId.get(row.postId)!.push({
        id: row.tagId,
        name: row.tagName,
        slug: row.tagSlug,
        color: row.tagColor,
      });
    }

    // Map tags to posts
    const postsWithTags = posts.map(post => ({
      ...post,
      tags: tagsByPostId.get(post.id) || [],
    }));

    return NextResponse.json(postsWithTags);
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/admin/blog/posts - Create a new post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = nanoid();

    // Generate slug from title if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Calculate reading time from content (roughly 200 words per minute)
    const wordCount = (body.content || '').split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const newPost = {
      id,
      slug,
      title: body.title,
      excerpt: body.excerpt || null,
      content: body.content || null,
      featuredImageUrl: body.featuredImageUrl || null,
      authorName: body.authorName || "Archie's Remedies",
      authorAvatarUrl: body.authorAvatarUrl || null,
      status: body.status || 'draft',
      publishedAt: body.status === 'published' ? new Date().toISOString() : null,
      scheduledAt: body.scheduledAt || null,
      isFeatured: body.isFeatured || false,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      readingTime,
    };

    await db.insert(blogPosts).values(newPost);

    // Add tags if provided
    if (body.tagIds && body.tagIds.length > 0) {
      const tagRelations = body.tagIds.map((tagId: string) => ({
        id: nanoid(),
        postId: id,
        tagId,
      }));
      await db.insert(blogPostTags).values(tagRelations);
    }

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Failed to create blog post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
