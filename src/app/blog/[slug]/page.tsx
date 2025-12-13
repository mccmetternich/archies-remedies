import { db } from '@/lib/db';
import { blogPosts, blogTags, blogPostTags } from '@/lib/db/schema';
import { eq, and, ne, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Share2, Twitter, Facebook, Linkedin, Eye, Heart } from 'lucide-react';
import { Metadata } from 'next';
import { isVideoUrl, formatEditorialDate } from '@/lib/media-utils';
import { MediaThumbnail } from '@/components/blog';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getHeaderProps, getFooterProps } from '@/lib/get-header-props';

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

export default async function BlogPostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === 'true';

  const [post, headerProps] = await Promise.all([
    getPostBySlug(slug, isPreview),
    getHeaderProps(),
  ]);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.id);
  const shareUrl = `https://archiesremedies.com/blog/${post.slug}`;
  const showVanityMetrics = post.viewCount || post.heartCount;
  const hasMedia = !!post.featuredImageUrl;
  const isVideo = isVideoUrl(post.featuredImageUrl);

  return (
    <>
      <Header {...headerProps} />
      <main className="min-h-screen bg-[var(--blog-bg)]">
      {/* Split-Screen Hero - 90vh */}
      <section className="min-h-[90vh] lg:h-[90vh]">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Left: Full-bleed image/video */}
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
          </div>

          {/* Right: Sticky title block with accent background */}
          <div className="bg-[var(--blog-accent)] min-h-[50vh] lg:h-full lg:sticky lg:top-0 flex items-center justify-center p-8 lg:p-16">
            <div className="max-w-lg w-full">
              {/* Back link */}
              <Link
                href="/blog"
                className="blog-meta inline-flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Journal
              </Link>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag) => (
                    <span key={tag.id} className="blog-meta opacity-60">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="blog-header blog-header-lg text-[var(--blog-text)]">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="blog-meta mt-8 opacity-60 flex flex-wrap items-center gap-4">
                {post.authorName && (
                  <span>By {post.authorName}</span>
                )}
                {post.publishedAt && (
                  <span>{formatEditorialDate(post.publishedAt)}</span>
                )}
                <span>{post.readingTime || 5} min read</span>
                {showVanityMetrics && (
                  <>
                    {post.viewCount && post.viewCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(post.viewCount)}
                      </span>
                    )}
                    {post.heartCount && post.heartCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(post.heartCount)}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Share */}
              <div className="flex items-center gap-3 mt-8 pt-8 border-t border-[var(--blog-divider)]">
                <span className="blog-meta opacity-60 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4" />
                  Share
                </span>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[var(--blog-text)] text-[var(--blog-bg)] hover:bg-[var(--blog-bg)] hover:text-[var(--blog-text)] transition-colors duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[var(--blog-text)] text-[var(--blog-bg)] hover:bg-[var(--blog-bg)] hover:text-[var(--blog-text)] transition-colors duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[var(--blog-text)] text-[var(--blog-bg)] hover:bg-[var(--blog-bg)] hover:text-[var(--blog-text)] transition-colors duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="py-16 lg:py-24">
        <div className="max-w-[680px] mx-auto px-4">
          {/* Excerpt/Lede */}
          {post.excerpt && (
            <p className="blog-body text-xl leading-relaxed mb-12 opacity-80">
              {post.excerpt}
            </p>
          )}

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
