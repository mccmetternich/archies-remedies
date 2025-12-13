import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MediaThumbnail } from './MediaThumbnail';
import { formatEditorialDate } from '@/lib/media-utils';

interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  publishedAt: string | null;
  readingTime: number | null;
  tags?: BlogTag[];
}

interface BlogCardProps {
  post: BlogPost;
  variant: 'grid' | 'grid-wide' | 'masonry' | 'list';
  index?: number;
}

export function BlogCard({ post, variant }: BlogCardProps) {
  // Grid Wide variant (Kiala Span - 5th item in grid layout)
  if (variant === 'grid-wide') {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group col-span-full block"
      >
        <div className="overflow-hidden">
          <MediaThumbnail
            url={post.featuredImageUrl}
            alt={post.title}
            aspectRatio="16-9"
            className="transform transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.02]"
          />
        </div>
        <div className="mt-6">
          {post.tags && post.tags.length > 0 && (
            <span className="blog-meta opacity-60">
              {post.tags[0].name}
            </span>
          )}
          <h3 className="blog-header blog-header-lg mt-2 transition-colors duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:text-[#bad9ea]">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="blog-body mt-3 line-clamp-2 opacity-80">
              {post.excerpt}
            </p>
          )}
          <div className="blog-meta mt-4 opacity-50">
            {formatEditorialDate(post.publishedAt)} &mdash; {post.readingTime || 5} min read
          </div>
        </div>
      </Link>
    );
  }

  // List variant (Journal style)
  if (variant === 'list') {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 py-12 border-b border-[rgba(0,0,0,0.1)] first:pt-0"
      >
        <div className="overflow-hidden">
          <MediaThumbnail
            url={post.featuredImageUrl}
            alt={post.title}
            aspectRatio="4-5"
            className="transform transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.02]"
          />
        </div>
        <div className="flex flex-col justify-center">
          {post.tags && post.tags.length > 0 && (
            <span className="blog-meta opacity-60">
              {post.tags[0].name}
            </span>
          )}
          <h3 className="blog-header mt-3 text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] transition-colors duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:text-[#bad9ea]">
            {post.title}
          </h3>
          <div className="blog-meta mt-6 opacity-50">
            {formatEditorialDate(post.publishedAt)} &mdash; {post.readingTime || 5} min read
          </div>
        </div>
      </Link>
    );
  }

  // Masonry variant
  if (variant === 'masonry') {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group break-inside-avoid mb-8 block"
      >
        <div className="overflow-hidden">
          <MediaThumbnail
            url={post.featuredImageUrl}
            alt={post.title}
            aspectRatio="4-5"
            className="transform transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.02]"
          />
        </div>
        <div className="mt-4">
          {post.tags && post.tags.length > 0 && (
            <span className="blog-meta opacity-60 text-[0.6875rem]">
              {post.tags[0].name}
            </span>
          )}
          <h3 className="blog-header text-[1.5rem] mt-2 transition-colors duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:text-[#bad9ea]">
            {post.title}
          </h3>
          <div className="blog-meta mt-2 opacity-50 text-[0.6875rem]">
            {post.readingTime || 5} min
          </div>
        </div>
      </Link>
    );
  }

  // Default Grid variant
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block"
    >
      <div className="overflow-hidden">
        <MediaThumbnail
          url={post.featuredImageUrl}
          alt={post.title}
          aspectRatio="4-5"
          className="transform transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-6">
        {post.tags && post.tags.length > 0 && (
          <span className="blog-meta opacity-60">
            {post.tags[0].name}
          </span>
        )}
        <h3 className="blog-header blog-header-sm mt-2 transition-colors duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:text-[#bad9ea]">
          {post.title}
        </h3>
        <div className="blog-meta mt-3 opacity-50">
          {formatEditorialDate(post.publishedAt)}
        </div>
      </div>
    </Link>
  );
}
