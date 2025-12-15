import { db } from '@/lib/db';
import { blogPosts, blogTags, blogPostTags, blogSettings } from '@/lib/db/schema';
import { eq, and, ne, desc, lt, gt, asc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Share2, Twitter, Facebook, Linkedin, Eye, Heart } from 'lucide-react';
import { Metadata } from 'next';
import { isVideoUrl, formatEditorialDate } from '@/lib/media-utils';
import { MediaThumbnail, BlogHeroCarousel } from '@/components/blog';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getHeaderProps, getFooterProps } from '@/lib/get-header-props';
import { checkDraftMode } from '@/lib/draft-mode';
import { WidgetRenderer } from '@/components/widgets/widget-renderer';
import { getWidgetData } from '@/lib/get-widget-data';

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

// Get blog settings for fallback author
async function getBlogSettings() {
  const [settings] = await db.select().from(blogSettings).limit(1);
  return settings;
}

// Get previous and next posts for navigation
async function getAdjacentPosts(currentPostId: string, publishedAt: string | null) {
  if (!publishedAt) return { prev: null, next: null };

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
        tagText: 'text-[#1a1a1a]',
        // Icon-only share buttons: black icons on white bg
        shareIcon: 'text-[#1a1a1a]',
        shareHover: 'hover:text-[#1a1a1a]/70',
        navBg: 'bg-[#1a1a1a]/10',
        navText: 'text-[#1a1a1a]',
        navHover: 'hover:bg-[#1a1a1a] hover:text-white',
      };
    case 'black':
      return {
        bg: 'bg-[#1a1a1a]',
        text: 'text-white',
        textMuted: 'text-white/60',
        border: 'border-white/20',
        tagBg: 'bg-white/20',
        tagText: 'text-white',
        // Icon-only share buttons: white icons on black bg
        shareIcon: 'text-white',
        shareHover: 'hover:text-white/70',
        navBg: 'bg-white/20',
        navText: 'text-white',
        navHover: 'hover:bg-white hover:text-[#1a1a1a]',
      };
    case 'blue':
    default:
      return {
        bg: 'bg-[#bad9ea]',
        text: 'text-[#1a1a1a]',
        textMuted: 'text-[#1a1a1a]/60',
        border: 'border-[#1a1a1a]/20',
        tagBg: 'bg-[#1a1a1a]/10',
        tagText: 'text-[#1a1a1a]',
        // Icon-only share buttons: black icons on blue bg
        shareIcon: 'text-[#1a1a1a]',
        shareHover: 'hover:text-[#1a1a1a]/70',
        navBg: 'bg-[#1a1a1a]/10',
        navText: 'text-[#1a1a1a]',
        navHover: 'hover:bg-[#1a1a1a] hover:text-white',
      };
  }
}

export default async function BlogPostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === 'true';

  if (!isPreview) {
    await checkDraftMode();
  }

  const [post, headerProps, settings] = await Promise.all([
    getPostBySlug(slug, isPreview),
    getHeaderProps(),
    getBlogSettings(),
  ]);

  if (!post) {
    notFound();
  }

  const [relatedPosts, adjacentPosts] = await Promise.all([
    getRelatedPosts(post.id),
    getAdjacentPosts(post.id, post.publishedAt),
  ]);

  // Parse post widgets (JSON array of widget configs)
  // Map to PageWidget format with required id and isVisible fields
  let postWidgets: Array<{ id: string; type: string; isVisible: boolean; config?: Record<string, unknown> }> = [];
  if (post.postWidgets) {
    try {
      const rawWidgets = JSON.parse(post.postWidgets) as Array<{ id?: string; type: string; isVisible?: boolean; config?: Record<string, unknown> }>;
      postWidgets = rawWidgets.map((w, index) => ({
        id: w.id || `post-widget-${index}`,
        type: w.type,
        isVisible: w.isVisible !== false, // Default to true
        config: w.config,
      }));
    } catch {
      postWidgets = [];
    }
  }

  // Fetch widget data if there are widgets to render
  const widgetTypes = postWidgets.map(w => w.type);
  const widgetData = widgetTypes.length > 0 ? await getWidgetData(widgetTypes) : {};

  // Add settings data for widgets that need it (like instagram)
  const widgetDataWithSettings = {
    ...widgetData,
    instagramUrl: headerProps.settings?.instagramUrl,
    settings: headerProps.settings,
  };

  // Use post author or fall back to site settings
  const authorName = post.authorName || settings?.blogName || "Archie's Remedies";
  const authorAvatarUrl = post.authorAvatarUrl || null;

  const shareUrl = `https://archiesremedies.com/blog/${post.slug}`;
  const showVanityMetrics = post.viewCount || post.heartCount;

  // Parse hero carousel images (JSON array of URLs)
  const heroCarouselImages: string[] = post.heroCarouselImages
    ? JSON.parse(post.heroCarouselImages)
    : [];

  // Get column colors based on per-post setting
  const colors = getColumnColors(post.rightColumnBgColor);

  // Check if title thumbnail is a video
  const titleThumbnailIsVideo = post.rightColumnThumbnailUrl && isVideoUrl(post.rightColumnThumbnailUrl);
  const hasTitleThumbnail = !!post.rightColumnThumbnailUrl;

  return (
    <>
      <Header {...headerProps} />
      <main className="min-h-screen bg-[var(--blog-bg)]">
        {/* Split-Screen Hero - 90vh */}
        <section className="min-h-[90vh] lg:h-[90vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Left: Full-bleed image/video with floating carousel thumbnails */}
            <BlogHeroCarousel
              featuredMediaUrl={post.featuredImageUrl}
              title={post.title}
              heroCarouselImages={heroCarouselImages}
            />

            {/* Right: Redesigned content column with per-post background */}
            <div className={`${colors.bg} min-h-[50vh] lg:h-full lg:sticky lg:top-0 flex flex-col p-8 lg:p-12`}>
              {/* Top Row: Back to Journal (left) + Date + Nav Arrows (right) */}
              <div className="flex items-start justify-between mb-8">
                {/* Left: Back to Journal */}
                <Link
                  href="/blog"
                  className={`${colors.textMuted} inline-flex items-center gap-2 text-sm ${colors.navHover} px-3 py-2 -ml-3 transition-colors`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Journal
                </Link>

                {/* Right: Date + Nav Arrows */}
                <div className="flex items-center gap-3">
                  {post.publishedAt && (
                    <span className={`text-sm ${colors.textMuted}`}>
                      {formatEditorialDate(post.publishedAt)}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    {adjacentPosts.prev ? (
                      <Link
                        href={`/blog/${adjacentPosts.prev.slug}`}
                        className={`p-2 ${colors.navBg} ${colors.navText} ${colors.navHover} transition-colors duration-300`}
                        title={adjacentPosts.prev.title}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Link>
                    ) : (
                      <div className={`p-2 ${colors.navBg} ${colors.navText} opacity-30`}>
                        <ChevronLeft className="w-5 h-5" />
                      </div>
                    )}
                    {adjacentPosts.next ? (
                      <Link
                        href={`/blog/${adjacentPosts.next.slug}`}
                        className={`p-2 ${colors.navBg} ${colors.navText} ${colors.navHover} transition-colors duration-300`}
                        title={adjacentPosts.next.title}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    ) : (
                      <div className={`p-2 ${colors.navBg} ${colors.navText} opacity-30`}>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col justify-center">
                {/* Title Block - moderate width, smaller font, tighter line-height */}
                <div className={`text-center ${hasTitleThumbnail ? 'mb-6' : 'mb-4'} max-w-lg mx-auto px-4`}>
                  <h1 className={`blog-header text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] ${colors.text}`}>
                    {post.title}
                  </h1>
                </div>

                {/* Optional Title Thumbnail - 75% larger */}
                {hasTitleThumbnail && (
                  <div className="mb-6 mx-auto w-full max-w-[350px]">
                    {titleThumbnailIsVideo ? (
                      <video
                        src={post.rightColumnThumbnailUrl!}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full aspect-square object-cover"
                      />
                    ) : (
                      <img
                        src={post.rightColumnThumbnailUrl!}
                        alt=""
                        className="w-full aspect-square object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Excerpt - 1.5x bigger */}
                {post.excerpt && (
                  <p className={`blog-body text-center text-xl leading-relaxed ${colors.textMuted} max-w-lg mx-auto ${hasTitleThumbnail ? '' : 'mt-4'}`}>
                    {post.excerpt}
                  </p>
                )}
              </div>

              {/* Bottom Area - Tags + Share + Read Time */}
              <div className="mt-auto pt-8">
                {/* Tags - 4x bigger, not clickable (just for reference) */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-4 mb-6">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className={`px-10 py-5 ${colors.tagBg} ${colors.tagText} text-xl font-semibold uppercase tracking-wider`}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Share buttons + Read Time - icons only, no boxes */}
                <div className={`flex items-center justify-center gap-4 pt-6 border-t ${colors.border}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${colors.textMuted} flex items-center gap-1`}>
                      <Share2 className="w-4 h-4" />
                    </span>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${colors.shareIcon} ${colors.shareHover} transition-colors duration-300`}
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${colors.shareIcon} ${colors.shareHover} transition-colors duration-300`}
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${colors.shareIcon} ${colors.shareHover} transition-colors duration-300`}
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                  <span className={`text-sm ${colors.textMuted}`}>|</span>
                  <span className={`text-sm ${colors.textMuted}`}>
                    {post.readingTime || 5} min read
                  </span>
                  {showVanityMetrics && (
                    <>
                      <span className={`text-sm ${colors.textMuted}`}>|</span>
                      <div className="flex items-center gap-3">
                        {post.viewCount && post.viewCount > 0 && (
                          <span className={`text-sm ${colors.textMuted} flex items-center gap-1`}>
                            <Eye className="w-4 h-4" />
                            {formatNumber(post.viewCount)}
                          </span>
                        )}
                        {post.heartCount && post.heartCount > 0 && (
                          <span className={`text-sm ${colors.textMuted} flex items-center gap-1`}>
                            <Heart className="w-4 h-4" />
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
        </section>

        {/* Article Body */}
        <article className="py-16 lg:py-24">
          <div className="max-w-[680px] mx-auto px-4">
            {/* Written by - Top left, small and discrete */}
            {authorName && (
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[var(--blog-divider)]">
                {authorAvatarUrl ? (
                  <img
                    src={authorAvatarUrl}
                    alt={authorName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--blog-accent)] flex items-center justify-center">
                    <span className="blog-header text-sm">
                      {authorName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="blog-meta text-xs opacity-50">Written by</p>
                  <p className="blog-meta text-sm">{authorName}</p>
                </div>
              </div>
            )}

            {/* Content with editorial styling */}
            <div
              className="blog-article-content"
              dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
            />
          </div>
        </article>

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
      </main>

      {/* Blog Post Widgets - rendered above footer */}
      {postWidgets.length > 0 && (
        <WidgetRenderer widgets={postWidgets} data={widgetDataWithSettings} />
      )}

      <Footer {...await getFooterProps(headerProps.settings)} />
    </>
  );
}
