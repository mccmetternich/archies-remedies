import { BlogCard } from './BlogCard';

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

interface BlogGridProps {
  posts: BlogPost[];
}

/**
 * Editorial Grid Layout
 * 2-column CSS Grid with generous spacing
 * 5th item (index 4) spans full width with 16:9 aspect ratio (Kiala Span)
 */
export function BlogGrid({ posts }: BlogGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
      {posts.map((post, index) => {
        // 5th item (index 4) spans full width - "Kiala Span"
        const isKialaSpan = index === 4;

        return (
          <BlogCard
            key={post.id}
            post={post}
            variant={isKialaSpan ? 'grid-wide' : 'grid'}
            index={index}
          />
        );
      })}
    </div>
  );
}
