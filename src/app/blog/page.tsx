import { db } from '@/lib/db';
import { blogPosts, blogTags, blogPostTags, blogSettings } from '@/lib/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { unstable_cache } from 'next/cache';
import { BlogGrid, BlogMasonry, BlogList } from '@/components/blog';

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  authorName: string | null;
  status: string | null;
  publishedAt: string | null;
  isFeatured: boolean | null;
  readingTime: number | null;
  tags?: { id: string; name: string; slug: string; color: string | null }[];
}

// Cached blog data with single efficient query (fixes N+1 problem)
const getCachedBlogData = unstable_cache(
  async () => {
    // Get blog settings for layout mode
    const [settings] = await db.select().from(blogSettings).limit(1);
    const layoutMode = settings?.gridLayout || 'grid';

    // Get published posts
    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.publishedAt));

    // Get all tags for all posts in a single query (fixes N+1)
    const postIds = posts.map((p) => p.id);
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

    // Group tags by post ID
    const tagsByPostId = new Map<string, { id: string; name: string; slug: string; color: string | null }[]>();
    for (const row of allPostTags) {
      const existing = tagsByPostId.get(row.postId) || [];
      existing.push({
        id: row.tagId,
        name: row.tagName,
        slug: row.tagSlug,
        color: row.tagColor,
      });
      tagsByPostId.set(row.postId, existing);
    }

    // Combine posts with their tags
    const postsWithTags = posts.map((post) => ({
      ...post,
      tags: tagsByPostId.get(post.id) || [],
    }));

    // Get all tags for filter bar
    const allTags = await db.select().from(blogTags);

    return {
      posts: postsWithTags as BlogPost[],
      tags: allTags,
      layoutMode: layoutMode as 'grid' | 'masonry' | 'list'
    };
  },
  ['blog-data'],
  { revalidate: 60, tags: ['blog-data'] }
);

async function getBlogData() {
  return getCachedBlogData();
}

export default async function BlogPage() {
  const { posts, tags, layoutMode } = await getBlogData();

  return (
    <main className="min-h-screen bg-[var(--blog-bg)]">
      {/* Minimal Editorial Header */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="blog-header blog-header-xl text-center">
            Journal
          </h1>
        </div>
      </section>

      {/* Sticky Tag Filter Bar */}
      {tags.length > 0 && (
        <section className="sticky top-0 z-40 bg-[var(--blog-bg)] border-b border-[var(--blog-divider)] py-4 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/blog"
                className="blog-tag-pill blog-tag-pill-active"
              >
                All
              </Link>
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog/tag/${tag.slug}`}
                  className="blog-tag-pill"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Posts - Dynamic Layout Based on CMS Setting */}
      {posts.length > 0 && (
        <section className="px-4 py-16">
          <div className={cn(
            'mx-auto',
            layoutMode === 'list' ? 'max-w-5xl' : 'max-w-7xl'
          )}>
            {layoutMode === 'masonry' && <BlogMasonry posts={posts} />}
            {layoutMode === 'grid' && <BlogGrid posts={posts} />}
            {layoutMode === 'list' && <BlogList posts={posts} />}
          </div>
        </section>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <section className="px-4 py-24">
          <div className="max-w-md mx-auto text-center">
            <h2 className="blog-header blog-header-md mb-4">Coming Soon</h2>
            <p className="blog-body">
              We&apos;re working on some great content. Check back soon.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
