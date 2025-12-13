import { db } from '@/lib/db';
import { blogPosts, blogTags, blogPostTags } from '@/lib/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { BlogGrid, BlogMasonry, BlogList } from '@/components/blog';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getHeaderProps, getFooterProps } from '@/lib/get-header-props';
import { blogSettings } from '@/lib/db/schema';
import { Metadata } from 'next';
import { checkDraftMode } from '@/lib/draft-mode';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getTagData(tagSlug: string) {
  // Get the tag
  const [tag] = await db
    .select()
    .from(blogTags)
    .where(eq(blogTags.slug, tagSlug));

  if (!tag) return null;

  // Get all tags for the filter bar
  const allTags = await db.select().from(blogTags);

  // Get blog settings for layout mode
  const [settings] = await db.select().from(blogSettings).limit(1);
  const layoutMode = settings?.gridLayout || 'grid';

  // Get post IDs that have this tag
  const postTagRelations = await db
    .select({ postId: blogPostTags.postId })
    .from(blogPostTags)
    .where(eq(blogPostTags.tagId, tag.id));

  const postIds = postTagRelations.map((r) => r.postId);

  if (postIds.length === 0) {
    return { tag, posts: [], allTags, layoutMode };
  }

  // Get published posts with this tag, ordered by newest first
  const posts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.status, 'published'))
    .orderBy(desc(blogPosts.publishedAt));

  // Filter to only posts with this tag
  const filteredPosts = posts.filter((post) => postIds.includes(post.id));

  // Get all tags for all filtered posts
  const filteredPostIds = filteredPosts.map((p) => p.id);
  const allPostTags = filteredPostIds.length > 0
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
        .where(inArray(blogPostTags.postId, filteredPostIds))
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
  const postsWithTags = filteredPosts.map((post) => ({
    ...post,
    tags: tagsByPostId.get(post.id) || [],
  }));

  return {
    tag,
    posts: postsWithTags,
    allTags,
    layoutMode: layoutMode as 'grid' | 'masonry' | 'list',
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTagData(slug);

  if (!data) {
    return { title: 'Tag Not Found' };
  }

  return {
    title: `${data.tag.name} | Journal`,
    description: `Browse all articles tagged with ${data.tag.name}`,
  };
}

export default async function BlogTagPage({ params }: Props) {
  // Check if site is in draft mode - redirects to coming-soon if needed
  await checkDraftMode();

  const { slug } = await params;

  const [data, headerProps] = await Promise.all([
    getTagData(slug),
    getHeaderProps(),
  ]);

  if (!data) {
    notFound();
  }

  const { tag, posts, allTags, layoutMode } = data;

  return (
    <>
      <Header {...headerProps} />
      <main className="min-h-screen bg-[var(--blog-bg)]">
        {/* Minimal Editorial Header */}
        <section className="pt-32 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="blog-header blog-header-xl text-center">
              {tag.name}
            </h1>
            <p className="blog-body text-center mt-4 opacity-60">
              {posts.length} {posts.length === 1 ? 'article' : 'articles'}
            </p>
          </div>
        </section>

        {/* Sticky Tag Filter Bar */}
        {allTags.length > 0 && (
          <section className="sticky top-[72px] z-40 bg-[var(--blog-bg)] border-b border-[var(--blog-divider)] py-4 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/blog"
                  className="blog-tag-pill"
                >
                  All
                </Link>
                {allTags.map((t) => (
                  <Link
                    key={t.id}
                    href={`/blog/tag/${t.slug}`}
                    className={cn(
                      'blog-tag-pill',
                      t.slug === slug && 'blog-tag-pill-active'
                    )}
                  >
                    {t.name}
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
              <h2 className="blog-header blog-header-md mb-4">No Articles Yet</h2>
              <p className="blog-body mb-8">
                There are no published articles with this tag yet.
              </p>
              <Link
                href="/blog"
                className="blog-button inline-flex"
              >
                View All Articles
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer {...getFooterProps(headerProps.settings)} />
    </>
  );
}
