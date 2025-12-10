import { db } from '@/lib/db';
import { blogPosts, blogTags, blogPostTags } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { Clock, Calendar, ArrowRight, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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

async function getBlogData() {
  // Get published posts
  const posts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.status, 'published'))
    .orderBy(desc(blogPosts.publishedAt));

  // Get tags for each post
  const postsWithTags = await Promise.all(
    posts.map(async (post) => {
      const postTags = await db
        .select({
          id: blogTags.id,
          name: blogTags.name,
          slug: blogTags.slug,
          color: blogTags.color,
        })
        .from(blogPostTags)
        .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
        .where(eq(blogPostTags.postId, post.id));

      return { ...post, tags: postTags };
    })
  );

  // Get all tags with post counts
  const allTags = await db.select().from(blogTags);

  return { posts: postsWithTags as BlogPost[], tags: allTags };
}

export default async function BlogPage() {
  const { posts, tags } = await getBlogData();

  // Separate featured posts
  const featuredPosts = posts.filter((p) => p.isFeatured);
  const regularPosts = posts.filter((p) => !p.isFeatured);

  // Show the first featured post as hero, or first regular post if no featured
  const heroPost = featuredPosts[0] || regularPosts[0];
  const gridPosts = heroPost
    ? posts.filter((p) => p.id !== heroPost.id)
    : posts;

  return (
    <main className="min-h-screen bg-[var(--secondary)]">
      {/* Header */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
            The Journal
          </h1>
          <p className="text-lg text-gray-600">
            Wellness wisdom, natural remedies, and tips for living your best life
          </p>
        </div>
      </section>

      {/* Tag Filters */}
      {tags.length > 0 && (
        <section className="px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/blog"
                className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--primary)] text-gray-900 transition-colors"
              >
                All Posts
              </Link>
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog/tag/${tag.slug}`}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 hover:bg-[var(--primary)] hover:text-gray-900 transition-colors"
                  style={{
                    '--hover-bg': tag.color,
                  } as React.CSSProperties}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured/Hero Post */}
      {heroPost && (
        <section className="px-4 pb-12">
          <div className="max-w-6xl mx-auto">
            <Link
              href={`/blog/${heroPost.slug}`}
              className="block group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="aspect-[4/3] md:aspect-auto md:h-full relative overflow-hidden">
                  {heroPost.featuredImageUrl ? (
                    <img
                      src={heroPost.featuredImageUrl}
                      alt={heroPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/50 flex items-center justify-center">
                      <span className="text-6xl">
                        {heroPost.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {heroPost.isFeatured && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-[var(--primary)] text-gray-900 text-xs font-medium rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  {/* Tags */}
                  {heroPost.tags && heroPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {heroPost.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color || '#333',
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 group-hover:text-[var(--primary)] transition-colors">
                    {heroPost.title}
                  </h2>

                  {heroPost.excerpt && (
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {heroPost.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {heroPost.publishedAt && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(heroPost.publishedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {heroPost.readingTime || 5} min read
                    </span>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-[var(--primary)] font-medium">
                    Read Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      {gridPosts.length > 0 && (
        <section className="px-4 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPosts.map((post, index) => {
                // Every 4th post is full-width
                const isWide = index > 0 && index % 4 === 0;

                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className={cn(
                      'group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all',
                      isWide && 'sm:col-span-2 lg:col-span-3'
                    )}
                  >
                    {isWide ? (
                      // Wide layout
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="aspect-[4/3] md:aspect-auto md:h-full relative overflow-hidden">
                          {post.featuredImageUrl ? (
                            <img
                              src={post.featuredImageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/50 flex items-center justify-center">
                              <span className="text-4xl">{post.title.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-8 flex flex-col justify-center">
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag.id}
                                  className="px-3 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: `${tag.color}20`,
                                    color: tag.color || '#333',
                                  }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                          <h3 className="text-xl font-serif text-gray-900 mb-3 group-hover:text-[var(--primary)] transition-colors">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {post.publishedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(post.publishedAt).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {post.readingTime || 5} min
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Regular card layout
                      <>
                        <div className="aspect-[4/3] relative overflow-hidden">
                          {post.featuredImageUrl ? (
                            <img
                              src={post.featuredImageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/50 flex items-center justify-center">
                              <span className="text-4xl">{post.title.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag.id}
                                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: `${tag.color}20`,
                                    color: tag.color || '#333',
                                  }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                          <h3 className="text-lg font-serif text-gray-900 mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {post.publishedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(post.publishedAt).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {post.readingTime || 5} min
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <section className="px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--primary)]/20 flex items-center justify-center mx-auto mb-6">
              <Tag className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h2 className="text-2xl font-serif text-gray-900 mb-3">
              Coming Soon
            </h2>
            <p className="text-gray-600">
              We&apos;re working on some great content. Check back soon for wellness tips and natural remedies.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
