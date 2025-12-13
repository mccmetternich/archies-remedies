import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { posts } = body;

    if (!posts || !Array.isArray(posts)) {
      return NextResponse.json(
        { error: 'Invalid posts data' },
        { status: 400 }
      );
    }

    // Update each post's sortOrder
    for (const post of posts) {
      await db
        .update(blogPosts)
        .set({ sortOrder: post.sortOrder })
        .where(eq(blogPosts.id, post.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to reorder blog posts' },
      { status: 500 }
    );
  }
}
