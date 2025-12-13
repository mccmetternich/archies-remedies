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

interface BlogListProps {
  posts: BlogPost[];
}

/**
 * Journal List Layout
 * Single column with wide horizontal rows
 * 55% image / 45% text split with massive titles
 * 1px black dividers between rows
 */
export function BlogList({ posts }: BlogListProps) {
  return (
    <div>
      {posts.map((post, index) => (
        <BlogCard
          key={post.id}
          post={post}
          variant="list"
          index={index}
        />
      ))}
    </div>
  );
}
