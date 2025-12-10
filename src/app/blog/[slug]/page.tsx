import { db } from '@/lib/db';
import { blogPosts, blogTags, blogPostTags } from '@/lib/db/schema';
import { eq, and, ne, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Calendar, ArrowLeft, ArrowRight, Share2, Twitter, Facebook, Linkedin } from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPostBySlug(slug: string) {
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, 'published')));

  if (!post) return null;

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
    .where(eq(blogPostTags.postId, post.id));

  return { ...post, tags: postTags };
}

async function getRelatedPosts(postId: string, tagIds: string[]) {
  // Get posts that share tags with this post
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

// Simple markdown to HTML converter
function renderContent(content: string | null) {
  if (!content) return '';

  // Convert markdown to basic HTML
  let html = content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-serif text-gray-900 mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-serif text-gray-900 mt-10 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-serif text-gray-900 mt-12 mb-6">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[var(--primary)] underline hover:no-underline">$1</a>')
    // Unordered lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-[var(--primary)] pl-4 my-6 italic text-gray-600">$1</blockquote>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
    .replace(/\n/g, '<br />');

  // Wrap in paragraph tags
  html = `<p class="mb-4 text-gray-700 leading-relaxed">${html}</p>`;

  // Clean up list items
  html = html.replace(/<\/li><br \/><li/g, '</li><li');
  html = html.replace(/<p class="mb-4 text-gray-700 leading-relaxed"><li/g, '<ul class="mb-4 space-y-2"><li');
  html = html.replace(/<\/li><\/p>/g, '</li></ul>');

  return html;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.id, post.tags?.map((t) => t.id) || []);
  const shareUrl = `https://archiesremedies.com/blog/${post.slug}`;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      {post.featuredImageUrl && (
        <div className="relative h-[50vh] md:h-[60vh] bg-gray-100">
          <img
            src={post.featuredImageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Content */}
      <article className="relative">
        {/* Header */}
        <header
          className={`max-w-3xl mx-auto px-4 ${
            post.featuredImageUrl ? '-mt-32 relative z-10' : 'pt-16'
          }`}
        >
          <div
            className={`${
              post.featuredImageUrl
                ? 'bg-white rounded-2xl shadow-xl p-8 md:p-12'
                : ''
            }`}
          >
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className="px-3 py-1 rounded-full text-xs font-medium hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color || '#333',
                    }}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              {post.authorName && (
                <span className="font-medium text-gray-900">{post.authorName}</span>
              )}
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readingTime || 5} min read
              </span>
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <Share2 className="w-4 h-4" />
                Share
              </span>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-[var(--primary)]/20 text-gray-600 hover:text-[var(--primary)] transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-[var(--primary)]/20 text-gray-600 hover:text-[var(--primary)] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-[var(--primary)]/20 text-gray-600 hover:text-[var(--primary)] transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-8 font-serif">
              {post.excerpt}
            </p>
          )}

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
          />
        </div>

        {/* Author box */}
        {post.authorName && (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-[var(--secondary)] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
                <span className="text-2xl font-serif text-[var(--primary)]">
                  {post.authorName.charAt(0)}
                </span>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-500 mb-1">Written by</p>
                <p className="text-lg font-medium text-gray-900">{post.authorName}</p>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-[var(--secondary)] py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-serif text-gray-900 mb-8 text-center">
              More from the Journal
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {relatedPost.featuredImageUrl ? (
                      <img
                        src={relatedPost.featuredImageUrl}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/50 flex items-center justify-center">
                        <span className="text-4xl">{relatedPost.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-serif text-gray-900 mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
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
      <section className="py-16 px-4 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-serif text-gray-900 mb-4">
            Ready to feel your best?
          </h2>
          <p className="text-gray-600 mb-6">
            Discover our collection of natural remedies designed to support your wellness journey.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-gray-900 rounded-full font-medium hover:bg-[var(--primary)]/80 transition-colors"
          >
            Shop Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
