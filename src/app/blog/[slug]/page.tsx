import { db } from '@/lib/db';
import { blogPosts, blogTags, blogPostTags } from '@/lib/db/schema';
import { eq, and, ne, desc, lt, gt, asc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Share2, Twitter, Facebook, Linkedin, Eye, Heart } from 'lucide-react';
import { Metadata } from 'next';
import { isVideoUrl, formatEditorialDate } from '@/lib/media-utils';
import { MediaThumbnail } from '@/components/blog';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getHeaderProps, getFooterProps } from '@/lib/get-header-props';
import { checkDraftMode } from '@/lib/draft-mode';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

async function getPostBySlug(slug: string, preview: boolean = false) {
  const condition = preview
    ? eq(blogPosts.slug, slug)
    : and(eq(blogPosts.slug, slug), eq(blogPosts.status, 'published'));

  const [post] = await db
    .select()
    .from(blogPosts)
    .where(condition);

  if (!post) return null;

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
}

// Get previous and next posts for navigation
async function getAdjacentPosts(currentPostId: string, publishedAt: string | null) {
  if (!publishedAt) return { prev: null, next: null };

  // Get previous post (older - published before current)
  const [prevPost] = await db
    .select({ slug: blogPosts.slug, title: blogPosts.title })
    .from(blogPosts)
    .where(and(
      eq(blogPosts.status, 'published'),
      ne(blogPosts.id, currentPostId),
      lt(blogPosts.publishedAt, publishedAt)
    ))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(1);

  // Get next post (newer - published after current)
  const [nextPost] = await db
    .select({ slug: blogPosts.slug, title: blogPosts.title })
    .from(blogPosts)
    .where(and(
      eq(blogPosts.status, 'published'),
      ne(blogPosts.id, currentPostId),
      gt(blogPosts.publishedAt, publishedAt)
    ))
    .orderBy(asc(blogPosts.publishedAt))
    .limit(1);

  return { prev: prevPost || null, next: nextPost || null };
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

async function getRelatedPosts(postId: string) {
  const relatedPosts = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.status, 'published'), ne(blogPosts.id, postId)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(3);

  return relatedPosts;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      images: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
    },
  };
}

// Simple markdown/HTML content renderer
function renderContent(content: string | null) {
  if (!content) return '';

  const isHtml = content.includes('<') && content.includes('>');

  if (isHtml) {
    return content;
  }

  // Convert markdown to basic HTML for backwards compatibility
  let html = content
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');

  html = `<p>${html}</p>`;

  // Clean up list items
  html = html.replace(/<\/li><br \/><li/g, '</li><li');
  html = html.replace(/<p><li/g, '<ul><li');
  html = html.replace(/<\/li><\/p>/g, '</li></ul>');

  return html;
}

// Get background/text colors based on per-post setting
function getColumnColors(bgColor: string | null) {
  switch (bgColor) {
    case 'white':
      return {
        bg: 'bg-white',
        text: 'text-[#1a1a1a]',
        textMuted: 'text-[#1a1a1a]/60',
        border: 'border-[#1a1a1a]/20',
        tagBg: 'bg-[#1a1a1a]/10',
        tagHoverBg: 'hover:bg-[#1a1a1a] hover:text-white',
        shareBg: 'bg-[#1a1a1a]',
        shareText: 'text-white',
        shareHover: 'hover:bg-[#bad9ea] hover:text-[#1a1a1a]',
      };
    case 'black':
      return {
        bg: 'bg-[#1a1a1a]',
        text: 'text-white',
        textMuted: 'text-white/60',
        border: 'border-white/20',
        tagBg: 'bg-white/20',
        tagHoverBg: 'hover:bg-white hover:text-[#1a1a1a]',
        shareBg: 'bg-white',
        shareText: 'text-[#1a1a1a]',
        shareHover: 'hover:bg-[#bad9ea]',
      };
    case 'blue':
    default:
      return {
        bg: 'bg-[#bad9ea]',
        text: 'text-[#1a1a1a]',
        textMuted: 'text-[#1a1a1a]/60',
        border: 'border-[#1a1a1a]/20',
        tagBg: 'bg-[#1a1a1a]/10',
        tagHoverBg: 'hover:bg-[#1a1a1a] hover:text-white',
        shareBg: 'bg-[#1a1a1a]',
        shareText: 'text-white',
        shareHover: 'hover:bg-white hover:text-[#1a1a1a]',
      };
  }
}

export default async function BlogPostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === 'true';

  // Check if site is in draft mode - redirects to coming-soon if needed
  // Skip check for preview mode (allows admins to preview posts)
  if (!isPreview) {
    await checkDraftMode();
  }

  const [post, headerProps] = await Promise.all([
    getPostBySlug(slug, isPreview),
    getHeaderProps(),
  ]);

  if (!post) {
    notFound();
  }

  const [relatedPosts, adjacentPosts] = await Promise.all([
    getRelatedPosts(post.id),
    getAdjacentPosts(post.id, post.publishedAt),
  ]);

  const shareUrl = `https://archiesremedies.com/blog/${post.slug}`;
  const showVanityMetrics = post.viewCount || post.heartCount;
  const hasMedia = !!post.featuredImageUrl;
  const isVideo = isVideoUrl(post.featuredImageUrl);

  // Parse hero carousel images (JSON array of URLs)
  const heroCarouselImages: string[] = post.heroCarouselImages
    ? JSON.parse(post.heroCarouselImages)
    : [];

  // Get column colors based on per-post setting
  const colors = getColumnColors(post.rightColumnBgColor);

  return (
    <>
      <Header {...headerProps} />
      <main className="min-h-screen bg-[var(--blog-bg)]">
        {/* Split-Screen Hero - 90vh */}
        <section className="min-h-[90vh] lg:h-[90vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Left: Full-bleed image/video with floating carousel thumbnails */}
            <div className="relative h-[50vh] lg:h-full overflow-hidden bg-[#f5f5f5]">
              {hasMedia ? (
                isVideo ? (
                  <video
                    src={post.featuredImageUrl!}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={post.featuredImageUrl!}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="blog-header text-[20vw] text-[#e0e0e0]">
                    {post.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Floating Carousel Thumbnails - up to 4 images */}
              {heroCarouselImages.length > 0 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                  {heroCarouselImages.slice(0, 4).map((imageUrl, index) => (
                    <button
                      key={index}
                      className="w-20 h-20 lg:w-24 lg:h-24 overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300"
                      style={{ background: 'transparent' }}
                    >
                      {isVideoUrl(imageUrl) ? (
                        <video
                          src={imageUrl}
                          muted
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={imageUrl}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Redesigned content column with per-post background */}
            <div className={`${colors.bg} min-h-[50vh] lg:h-full lg:sticky lg:top-0 flex flex-col p-8 lg:p-12`}>
              {/* Top Row: Author/Read Time (left) + Nav Arrows (right) */}
              <div className="flex items-start justify-between mb-8">
                {/* Left: Author + Read Time */}
                <div className="flex items-center gap-3">
                  {post.authorAvatarUrl ? (
                    <img
                      src={post.authorAvatarUrl}
                      alt={post.authorName || 'Author'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : post.authorName ? (
                    <div className={`w-10 h-10 rounded-full ${colors.tagBg} flex items-center justify-center`}>
                      <span className={`blog-header text-sm ${colors.text}`}>
                        {post.authorName.charAt(0)}
                      </span>
                    </div>
                  ) : null}
                  <div>
                    {post.authorName && (
                      <p className={`blog-meta text-sm ${colors.text}`}>{post.authorName}</p>
                    )}
                    <p className={`blog-meta text-xs ${colors.textMuted}`}>
                      {post.readingTime || 5} min read
                    </p>
                  </div>
                </div>

                {/* Right: Prev/Next Navigation Arrows */}
                <div className="flex items-center gap-2">
                  {adjacentPosts.prev ? (
                    <Link
                      href={`/blog/${adjacentPosts.prev.slug}`}
                      className={`p-2 ${colors.tagBg} ${colors.text} ${colors.tagHoverBg} transition-colors duration-300`}
                      title={adjacentPosts.prev.title}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Link>
                  ) : (
                    <div className={`p-2 ${colors.tagBg} opacity-30`}>
                      <ChevronLeft className="w-5 h-5" />
                    </div>
                  )}
                  {adjacentPosts.next ? (
                    <Link
                      href={`/blog/${adjacentPosts.next.slug}`}
                      className={`p-2 ${colors.tagBg} ${colors.text} ${colors.tagHoverBg} transition-colors duration-300`}
                      title={adjacentPosts.next.title}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  ) : (
                    <div className={`p-2 ${colors.tagBg} opacity-30`}>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content Area - Title centered in top 1/3 */}
              <div className="flex-1 flex flex-col">
                {/* Title Block - Takes top 1/3 */}
                <div className="flex-[1] flex items-center justify-center">
                  <h1 className={`blog-header text-[clamp(2rem,5vw,4rem)] leading-[1.05] ${colors.text} text-center max-w-xl`}>
                    {post.title}
                  </h1>
                </div>

                {/* Middle Area - Optional Thumbnail + Caption */}
                <div className="flex-[1] flex flex-col items-center justify-center">
                  {post.rightColumnThumbnailUrl && (
                    <div className="mb-4 w-full max-w-xs">
                      <img
                        src={post.rightColumnThumbnailUrl}
                        alt=""
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                  )}
                  {post.excerpt && (
                    <p className={`blog-body text-center text-sm leading-relaxed ${colors.textMuted} max-w-md`}>
                      {post.excerpt}
                    </p>
                  )}
                </div>

                {/* Bottom Area - Breadcrumb + Tags + Share */}
                <div className="flex-[1] flex flex-col justify-end">
                  {/* Breadcrumb */}
                  <div className="flex justify-center mb-6">
                    <Link
                      href="/blog"
                      className={`blog-meta text-sm ${colors.textMuted} inline-flex items-center gap-2 hover:${colors.text} transition-colors`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Journal
                    </Link>
                  </div>

                  {/* Tags as centered boxes */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {post.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/blog/tag/${tag.slug}`}
                          className={`px-4 py-2 ${colors.tagBg} ${colors.text} text-xs font-semibold uppercase tracking-wider ${colors.tagHoverBg} transition-colors duration-300`}
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Share buttons + Date */}
                  <div className={`flex items-center justify-center gap-4 pt-6 border-t ${colors.border}`}>
                    {post.publishedAt && (
                      <span className={`blog-meta text-xs ${colors.textMuted}`}>
                        {formatEditorialDate(post.publishedAt)}
                      </span>
                    )}
                    <span className={`blog-meta text-xs ${colors.textMuted}`}>|</span>
                    <div className="flex items-center gap-2">
                      <span className={`blog-meta text-xs ${colors.textMuted} flex items-center gap-1`}>
                        <Share2 className="w-3 h-3" />
                        Share
                      </span>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 ${colors.shareBg} ${colors.shareText} ${colors.shareHover} transition-colors duration-300`}
                      >
                        <Twitter className="w-3 h-3" />
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 ${colors.shareBg} ${colors.shareText} ${colors.shareHover} transition-colors duration-300`}
                      >
                        <Facebook className="w-3 h-3" />
                      </a>
                      <a
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 ${colors.shareBg} ${colors.shareText} ${colors.shareHover} transition-colors duration-300`}
                      >
                        <Linkedin className="w-3 h-3" />
                      </a>
                    </div>
                    {showVanityMetrics && (
                      <>
                        <span className={`blog-meta text-xs ${colors.textMuted}`}>|</span>
                        <div className="flex items-center gap-3">
                          {post.viewCount && post.viewCount > 0 && (
                            <span className={`blog-meta text-xs ${colors.textMuted} flex items-center gap-1`}>
                              <Eye className="w-3 h-3" />
                              {formatNumber(post.viewCount)}
                            </span>
                          )}
                          {post.heartCount && post.heartCount > 0 && (
                            <span className={`blog-meta text-xs ${colors.textMuted} flex items-center gap-1`}>
                              <Heart className="w-3 h-3" />
                              {formatNumber(post.heartCount)}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Body */}
        <article className="py-16 lg:py-24">
          <div className="max-w-[680px] mx-auto px-4">
            {/* Content with editorial styling */}
            <div
              className="blog-article-content"
              dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
            />
          </div>
        </article>

        {/* Author box */}
        {post.authorName && (
          <section className="py-12 px-4">
            <div className="max-w-[680px] mx-auto">
              <div className="border-t border-b border-[var(--blog-divider)] py-12 flex flex-col md:flex-row items-center gap-6">
                {post.authorAvatarUrl ? (
                  <img
                    src={post.authorAvatarUrl}
                    alt={post.authorName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[var(--blog-accent)] flex items-center justify-center shrink-0">
                    <span className="blog-header text-2xl">
                      {post.authorName.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="text-center md:text-left">
                  <p className="blog-meta opacity-60 mb-1">Written by</p>
                  <p className="blog-header text-xl">{post.authorName}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 px-4 border-t border-[var(--blog-divider)]">
            <div className="max-w-7xl mx-auto">
              <h2 className="blog-header blog-header-md text-center mb-12">
                More from the Journal
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group block"
                  >
                    <div className="overflow-hidden">
                      <MediaThumbnail
                        url={relatedPost.featuredImageUrl}
                        alt={relatedPost.title}
                        aspectRatio="4-5"
                        className="transform transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="mt-6">
                      <h3 className="blog-header blog-header-sm transition-colors duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:text-[var(--blog-accent)]">
                        {relatedPost.title}
                      </h3>
                      <div className="blog-meta mt-3 opacity-50">
                        {relatedPost.readingTime || 5} min read
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-24 px-4 bg-[var(--blog-accent)]">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="blog-header blog-header-md mb-4">
              Ready to feel your best?
            </h2>
            <p className="blog-body mb-8 opacity-80">
              Discover our collection of natural remedies designed to support your wellness journey.
            </p>
            <Link
              href="/products"
              className="blog-button inline-flex"
            >
              Shop Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer {...getFooterProps(headerProps.settings)} />
    </>
  );
}
