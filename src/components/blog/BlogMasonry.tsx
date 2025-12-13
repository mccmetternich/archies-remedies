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

interface BlogMasonryProps {
  posts: BlogPost[];
}

/**
 * Masonry Layout
 * 3-column Pinterest-style staggered grid
 * Uses CSS columns for moodboard feel with minimal vertical spacing
 */
export function BlogMasonry({ posts }: BlogMasonryProps) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
      {posts.map((post) => (
        <BlogCard
          key={post.id}
          post={post}
          variant="masonry"
        />
      ))}
    </div>
  );
}
