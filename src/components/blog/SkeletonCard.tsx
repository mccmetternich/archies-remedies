import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  layout: 'grid' | 'masonry' | 'list';
  isWide?: boolean;
}

export function SkeletonCard({ layout, isWide = false }: SkeletonCardProps) {
  // List layout skeleton
  if (layout === 'list') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 py-12 border-b border-[rgba(0,0,0,0.1)]">
        <div className="blog-skeleton aspect-[4/5]" />
        <div className="flex flex-col justify-center space-y-4">
          <div className="blog-skeleton h-4 w-24" />
          <div className="blog-skeleton h-12 w-full" />
          <div className="blog-skeleton h-12 w-3/4" />
          <div className="blog-skeleton h-4 w-32" />
        </div>
      </div>
    );
  }

  // Masonry layout skeleton
  if (layout === 'masonry') {
    return (
      <div className="break-inside-avoid mb-8">
        <div className="blog-skeleton aspect-[4/5]" />
        <div className="mt-4 space-y-2">
          <div className="blog-skeleton h-3 w-20" />
          <div className="blog-skeleton h-6 w-full" />
          <div className="blog-skeleton h-3 w-24" />
        </div>
      </div>
    );
  }

  // Grid layout skeleton (default)
  return (
    <div className={cn(isWide && 'col-span-full')}>
      <div className={cn(
        'blog-skeleton',
        isWide ? 'aspect-[16/9]' : 'aspect-[4/5]'
      )} />
      <div className="mt-6 space-y-3">
        <div className="blog-skeleton h-3 w-24" />
        <div className="blog-skeleton h-8 w-full" />
        {isWide && <div className="blog-skeleton h-4 w-3/4" />}
        <div className="blog-skeleton h-3 w-32" />
      </div>
    </div>
  );
}
