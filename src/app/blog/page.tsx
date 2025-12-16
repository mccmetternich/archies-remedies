import { db } from '@/lib/db';
import { blogPosts, blogTags, blogPostTags, blogSettings } from '@/lib/db/schema';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { unstable_cache } from 'next/cache';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getHeaderProps, getFooterProps } from '@/lib/get-header-props';
import { checkDraftMode } from '@/lib/draft-mode';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface BlogSettingsData {
  blogName: string | null;
  heroMediaUrl: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  pageTitle: string | null;
  pageSubtitle: string | null;
  gridLayout: string | null;
}

interface TagWithCount {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  postCount: number;
}

// Cached blog data with single efficient query
const getCachedBlogData = unstable_cache(
  async () => {
    // Get blog settings for hero and layout
    const [settings] = await db.select().from(blogSettings).limit(1);

    // Get published posts
    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.publishedAt));

    // Get all tags for all posts in a single query
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

    // Get all tags with post counts
    const allTags = await db.select().from(blogTags);

    // Count posts per tag
    const tagPostCounts = new Map<string, number>();
    for (const row of allPostTags) {
      const current = tagPostCounts.get(row.tagId) || 0;
      tagPostCounts.set(row.tagId, current + 1);
    }

    const tagsWithCounts: TagWithCount[] = allTags.map(tag => ({
      ...tag,
      postCount: tagPostCounts.get(tag.id) || 0,
    }));

    return {
      posts: postsWithTags as BlogPost[],
      tags: tagsWithCounts,
      settings: {
        blogName: settings?.blogName || null,
        heroMediaUrl: settings?.heroMediaUrl || null,
        heroTitle: settings?.heroTitle || null,
        heroSubtitle: settings?.heroSubtitle || null,
        pageTitle: settings?.pageTitle || null,
        pageSubtitle: settings?.pageSubtitle || null,
        gridLayout: settings?.gridLayout || 'grid',
      } as BlogSettingsData,
    };
  },
  ['blog-data'],
  { revalidate: 60, tags: ['blog-data'] }
);

// Helper to check if URL is video
function isVideoUrl(url: string | null): boolean {
  if (!url) return false;
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes('/video/upload/');
}

// Editorial Card Component with compartments - supports size variants
function EditorialCard({
  post,
  className,
  size = 'default'
}: {
  post: BlogPost;
  className?: string;
  size?: 'default' | 'large' | 'tall' | 'wide';
}) {
  // Aspect ratios and sizes based on variant
  const aspectRatio = size === 'tall'
    ? 'aspect-[2/3]'
    : size === 'wide'
    ? 'aspect-[16/9]'
    : size === 'large'
    ? 'aspect-[4/3]'
    : 'aspect-[4/3]';

  const titleSize = size === 'large' || size === 'wide'
    ? 'text-xl lg:text-2xl'
    : 'text-lg';

  return (
    <Link href={`/blog/${post.slug}`} className={cn('group block h-full', className)}>
      {/* Thumbnail compartment with white gap inside black frame */}
      <div className="p-3 bg-white">
        <div className={cn(aspectRatio, 'overflow-hidden bg-[#f5f5f5]')}>
          {post.featuredImageUrl ? (
            isVideoUrl(post.featuredImageUrl) ? (
              <video
                src={post.featuredImageUrl}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                muted
                autoPlay
                loop
                playsInline
              />
            ) : (
              <img
                src={post.featuredImageUrl}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className={cn(
                'font-bold text-[#e0e0e0]',
                size === 'large' || size === 'wide' ? 'text-8xl' : 'text-6xl'
              )}>
                {post.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Title compartment - more space for wrapping */}
      <div className="px-5 py-4 border-t border-black min-h-[80px]">
        <h3 className={cn('font-semibold leading-snug line-clamp-3 text-black', titleSize)}>
          {post.title}
        </h3>
      </div>

      {/* Caption/excerpt compartment - show more text */}
      {post.excerpt && (
        <div className="px-5 py-3 border-t border-black">
          <p className="text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
        </div>
      )}

      {/* Tags compartment */}
      {post.tags && post.tags.length > 0 && (
        <div className="px-5 py-4 border-t border-black flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1.5 bg-[#bad9ea] text-sm font-medium text-black"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

// Full-width feature post (5th post or two-column)
function FeaturePost({ post, variant = 'full' }: { post: BlogPost; variant?: 'full' | 'split' }) {
  if (variant === 'split') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 border border-black">
        {/* Left: Content */}
        <div className="p-8 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-4 py-2 bg-[#bad9ea] text-sm font-semibold text-black uppercase tracking-wide"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          <h3 className="text-3xl lg:text-4xl font-bold leading-tight mb-4 text-black">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-gray-600 mb-6 line-clamp-4 text-lg">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            {post.readingTime && <span>{post.readingTime} min read</span>}
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium hover:bg-[#bad9ea] hover:text-black transition-colors self-start"
          >
            Read Article
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right: Media */}
        <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[400px] overflow-hidden order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-black">
          {post.featuredImageUrl ? (
            isVideoUrl(post.featuredImageUrl) ? (
              <video
                src={post.featuredImageUrl}
                className="w-full h-full object-cover"
                muted
                autoPlay
                loop
                playsInline
              />
            ) : (
              <img
                src={post.featuredImageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center">
              <span className="text-8xl font-bold text-[#e0e0e0]">
                {post.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full-width variant (3/4 media, 1/4 content)
  return (
    <Link href={`/blog/${post.slug}`} className="group block border border-black">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr]">
        {/* Media - 3/4 width */}
        <div className="aspect-[16/9] lg:aspect-[21/9] overflow-hidden border-b lg:border-b-0 lg:border-r border-black">
          {post.featuredImageUrl ? (
            isVideoUrl(post.featuredImageUrl) ? (
              <video
                src={post.featuredImageUrl}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                muted
                autoPlay
                loop
                playsInline
              />
            ) : (
              <img
                src={post.featuredImageUrl}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )
          ) : (
            <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center">
              <span className="text-[15vw] font-bold text-[#e0e0e0]">
                {post.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content - 1/4 width */}
        <div className="p-6 lg:p-8 flex flex-col justify-center">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1.5 bg-[#bad9ea] text-sm font-semibold text-black"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          <h3 className="text-xl lg:text-2xl font-bold leading-tight mb-3 text-black">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-gray-600 line-clamp-4">{post.excerpt}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

// Pagination component
function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        href={currentPage > 1 ? `/blog?page=${currentPage - 1}` : '#'}
        className={cn(
          'w-10 h-10 flex items-center justify-center border border-black transition-colors',
          currentPage > 1
            ? 'hover:bg-[#bad9ea] hover:border-[#bad9ea]'
            : 'opacity-30 cursor-not-allowed'
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </Link>

      {pages.map((page) => (
        <Link
          key={page}
          href={`/blog?page=${page}`}
          className={cn(
            'w-10 h-10 flex items-center justify-center border border-black font-medium transition-colors',
            page === currentPage
              ? 'bg-black text-white'
              : 'hover:bg-[#bad9ea] hover:border-[#bad9ea]'
          )}
        >
          {page}
        </Link>
      ))}

      <Link
        href={currentPage < totalPages ? `/blog?page=${currentPage + 1}` : '#'}
        className={cn(
          'w-10 h-10 flex items-center justify-center border border-black transition-colors',
          currentPage < totalPages
            ? 'hover:bg-[#bad9ea] hover:border-[#bad9ea]'
            : 'opacity-30 cursor-not-allowed'
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// Bento Grid - Editorial layout with varied sizes based on position
function BentoGrid({ posts, startIndex = 0 }: { posts: BlogPost[]; startIndex?: number }) {
  if (posts.length === 0) return null;

  // For a single post, show it at a reasonable size (not full width)
  if (posts.length === 1) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="border border-black">
          <EditorialCard post={posts[0]} size="large" />
        </div>
      </div>
    );
  }

  // For 2 posts, show them side by side
  if (posts.length === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 border border-black">
        <div className="border-b md:border-b-0 md:border-r border-black">
          <EditorialCard post={posts[0]} size="large" />
        </div>
        <div>
          <EditorialCard post={posts[1]} size="large" />
        </div>
      </div>
    );
  }

  // For 3 posts: 1 large + 2 stacked
  if (posts.length === 3) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 border border-black">
        {/* Large card taking full left side */}
        <div className="border-b lg:border-b-0 lg:border-r border-black">
          <EditorialCard post={posts[0]} size="large" />
        </div>
        {/* Two stacked cards on right */}
        <div className="grid grid-rows-2">
          <div className="border-b border-black">
            <EditorialCard post={posts[1]} />
          </div>
          <div>
            <EditorialCard post={posts[2]} />
          </div>
        </div>
      </div>
    );
  }

  // For 4+ posts: Bento layout
  // Pattern based on startIndex to create variety:
  // Pattern A (startIndex 0): Large left, 2 small right top, 1 wide bottom
  // Pattern B (startIndex 4): 2 small left, large right, 1 wide bottom
  const isPatternA = (startIndex / 4) % 2 === 0;

  const displayPosts = posts.slice(0, 4);

  if (isPatternA) {
    // Pattern A: Large (2x2) on left, 2 small on right, 1 wide at bottom
    return (
      <div className="border border-black">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Large card - spans 2 columns */}
          <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-black">
            <EditorialCard post={displayPosts[0]} size="large" />
          </div>
          {/* Two small cards stacked */}
          <div className="grid grid-cols-2 lg:grid-cols-1">
            <div className="border-r lg:border-r-0 lg:border-b border-black">
              <EditorialCard post={displayPosts[1]} />
            </div>
            <div>
              <EditorialCard post={displayPosts[2]} />
            </div>
          </div>
        </div>
        {/* Wide card at bottom */}
        {displayPosts[3] && (
          <div className="border-t border-black">
            <EditorialCard post={displayPosts[3]} size="wide" />
          </div>
        )}
      </div>
    );
  } else {
    // Pattern B: 2 small on left, Large (2x2) on right, 1 wide at bottom
    return (
      <div className="border border-black">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Two small cards stacked on left */}
          <div className="grid grid-cols-2 lg:grid-cols-1 order-2 lg:order-1">
            <div className="border-r lg:border-r-0 lg:border-b border-black">
              <EditorialCard post={displayPosts[0]} />
            </div>
            <div>
              <EditorialCard post={displayPosts[1]} />
            </div>
          </div>
          {/* Large card - spans 2 columns on right */}
          <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-l border-black order-1 lg:order-2">
            <EditorialCard post={displayPosts[2]} size="large" />
          </div>
        </div>
        {/* Wide card at bottom */}
        {displayPosts[3] && (
          <div className="border-t border-black">
            <EditorialCard post={displayPosts[3]} size="wide" />
          </div>
        )}
      </div>
    );
  }
}

// Uniform Grid - Equal-sized cards in a regular grid
function UniformGrid({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {posts.map((post) => (
        <div key={post.id} className="border border-black bg-white p-4">
          <EditorialCard post={post} size="tall" />
        </div>
      ))}
    </div>
  );
}

// List Layout - Full-width cards in vertical list
function ListLayout({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="group flex flex-col md:flex-row gap-6 border border-black p-4 bg-white hover:bg-gray-50 transition-colors"
        >
          {/* Thumbnail */}
          <div className="w-full md:w-64 lg:w-80 shrink-0 aspect-[4/3] overflow-hidden bg-[#f5f5f5]">
            {post.featuredImageUrl ? (
              isVideoUrl(post.featuredImageUrl) ? (
                <video
                  src={post.featuredImageUrl}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={post.featuredImageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl font-bold text-[#e0e0e0]">
                  {post.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 py-2">
            <h3 className="font-semibold text-xl lg:text-2xl leading-snug line-clamp-2 text-black mb-3">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-gray-600 line-clamp-3 mb-4">{post.excerpt}</p>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1.5 bg-[#bad9ea] text-sm font-medium text-black"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function BlogPage() {
  // Check if site is in draft mode
  await checkDraftMode();

  const [{ posts, tags, settings }, headerProps] = await Promise.all([
    getCachedBlogData(),
    getHeaderProps(),
  ]);

  // Split posts into sections:
  // Row 1: Posts 0-3 (4 cards)
  // Feature 1: Post 4 (full-width)
  // Row 2: Posts 5-8 (4 cards)
  // Feature 2: Post 9 (split layout)
  // Row 3: Posts 10-13 (4 cards)
  // Then paginate...

  const row1 = posts.slice(0, 4);
  const feature1 = posts[4];
  const row2 = posts.slice(5, 9);
  const feature2 = posts[9];
  const row3 = posts.slice(10, 14);

  const hasHero = settings.heroMediaUrl || settings.heroTitle;

  // Filter tags with posts only
  const tagsWithPosts = tags.filter(t => t.postCount > 0).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Header {...headerProps} />
      <main className="min-h-screen bg-white">
        {/* Blog Hero - Compact full-width banner */}
        {hasHero && (
          <section className="relative h-[50vh] min-h-[490px] max-h-[630px] overflow-hidden">
            {settings.heroMediaUrl && (
              <div className="absolute inset-0">
                {isVideoUrl(settings.heroMediaUrl) ? (
                  <video
                    src={settings.heroMediaUrl}
                    className="w-full h-full object-cover"
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={settings.heroMediaUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
            )}

            {/* Hero content */}
            <div className="relative h-full flex flex-col justify-end p-8 lg:p-16">
              <div className="max-w-4xl">
                {settings.heroTitle && (
                  <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[0.95] tracking-tight mb-4">
                    {settings.heroTitle}
                  </h1>
                )}
                {settings.heroSubtitle && (
                  <p className="text-xl lg:text-2xl text-white/80 max-w-2xl">
                    {settings.heroSubtitle}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Minimal header if no hero */}
        {!hasHero && (
          <section className="pt-32 pb-12 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                {settings.blogName || settings.pageTitle || 'Journal'}
              </h1>
              {settings.pageSubtitle && (
                <p className="mt-4 text-xl text-gray-600">{settings.pageSubtitle}</p>
              )}
            </div>
          </section>
        )}

        {/* Tag Filter Bar - No "All", 2x larger tags, hex blue, hide count if ≤1 */}
        {tagsWithPosts.length > 0 && (
          <section className="sticky top-[72px] z-40 bg-white border-y border-black py-4">
            <div className="overflow-x-auto scrollbar-hide px-4">
              <div className="flex gap-4 min-w-max">
                {tagsWithPosts.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className="px-8 py-4 bg-[#bad9ea] text-xl font-semibold text-black uppercase tracking-wide hover:bg-[#a5cce0] transition-colors flex items-center gap-2"
                  >
                    {tag.name}
                    {tag.postCount > 1 && (
                      <span className="text-lg font-normal opacity-70">({tag.postCount})</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Posts Grid - Layout based on settings.gridLayout */}
        {posts.length > 0 && (
          <section className="px-4 py-12">
            <div className="max-w-7xl mx-auto space-y-12">
              {/* Bento Layout (default) - Editorial with varied sizes and feature posts */}
              {(settings.gridLayout === 'bento' || !settings.gridLayout || settings.gridLayout === 'masonry') && (
                <>
                  {row1.length > 0 && <BentoGrid posts={row1} startIndex={0} />}
                  {feature1 && <FeaturePost post={feature1} variant="full" />}
                  {row2.length > 0 && <BentoGrid posts={row2} startIndex={4} />}
                  {feature2 && <FeaturePost post={feature2} variant="split" />}
                  {row3.length > 0 && <BentoGrid posts={row3} startIndex={8} />}
                </>
              )}

              {/* Uniform Grid Layout - Equal-sized cards */}
              {settings.gridLayout === 'grid' && (
                <UniformGrid posts={posts} />
              )}

              {/* List Layout - Full-width vertical list */}
              {settings.gridLayout === 'list' && (
                <ListLayout posts={posts} />
              )}

              {/* Pagination */}
              <Pagination currentPage={1} totalPages={Math.ceil(posts.length / 14)} />
            </div>
          </section>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <section className="px-4 py-24">
            <div className="max-w-md mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
              <p className="text-gray-600">
                We&apos;re working on some great content. Check back soon.
              </p>
            </div>
          </section>
        )}
      </main>
      <Footer {...await getFooterProps(headerProps.settings)} />
    </>
  );
}
