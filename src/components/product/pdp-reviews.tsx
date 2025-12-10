'use client';

import React, { useState, useMemo, forwardRef } from 'react';
import { Star, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number | null;
  title: string | null;
  authorName: string;
  authorInitial: string | null;
  text: string;
  keywords: string | null; // JSON array
  isVerified: boolean | null;
  isFeatured: boolean | null;
  createdAt: string | null;
}

interface ReviewKeyword {
  id: string;
  keyword: string;
  count: number | null;
}

interface PDPReviewsProps {
  reviews: Review[];
  keywords: ReviewKeyword[];
  productName: string;
}

export const PDPReviews = forwardRef<HTMLElement, PDPReviewsProps>(
  function PDPReviews({ reviews, keywords, productName }, ref) {
    const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    // Calculate average rating
    const averageRating = useMemo(() => {
      const validReviews = reviews.filter((r) => r.rating !== null);
      if (validReviews.length === 0) return 5;
      const sum = validReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
      return sum / validReviews.length;
    }, [reviews]);

    // Filter reviews by keyword
    const filteredReviews = useMemo(() => {
      if (!selectedKeyword) return reviews;
      return reviews.filter((review) => {
        if (!review.keywords) return false;
        try {
          const reviewKeywords = JSON.parse(review.keywords) as string[];
          return reviewKeywords.some(
            (k) => k.toLowerCase() === selectedKeyword.toLowerCase()
          );
        } catch {
          return false;
        }
      });
    }, [reviews, selectedKeyword]);

    // Limit displayed reviews
    const displayedReviews = showAll ? filteredReviews : filteredReviews.slice(0, 6);

    return (
      <section ref={ref} className="py-16 md:py-24 bg-[var(--cream)]" id="reviews">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-4">
              <span className="w-8 h-px bg-[var(--foreground)]" />
              Reviews
              <span className="w-8 h-px bg-[var(--foreground)]" />
            </span>
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-3">
              What People Are Saying
            </h2>
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i <= Math.round(averageRating)
                        ? 'fill-[var(--foreground)] text-[var(--foreground)]'
                        : 'fill-transparent text-[var(--foreground)]/30'
                    )}
                  />
                ))}
              </div>
              <span className="text-lg font-medium">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-[var(--muted-foreground)]">
              Based on {reviews.length.toLocaleString()} verified reviews
            </p>
          </div>

          {/* Keyword Filter Bubbles */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              <button
                onClick={() => setSelectedKeyword(null)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  !selectedKeyword
                    ? 'bg-[var(--foreground)] text-white'
                    : 'bg-white border border-[var(--border)] hover:border-[var(--foreground)]'
                )}
              >
                All Reviews
              </button>
              {keywords.map((kw) => (
                <button
                  key={kw.id}
                  onClick={() =>
                    setSelectedKeyword(
                      selectedKeyword === kw.keyword ? null : kw.keyword
                    )
                  }
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    selectedKeyword === kw.keyword
                      ? 'bg-[var(--foreground)] text-white'
                      : 'bg-white border border-[var(--border)] hover:border-[var(--foreground)]'
                  )}
                >
                  {kw.keyword}
                  <span className="ml-1.5 text-xs opacity-60">({kw.count})</span>
                </button>
              ))}
            </div>
          )}

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Show More Button */}
          {filteredReviews.length > 6 && (
            <div className="text-center mt-10">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--foreground)] rounded-full text-sm font-medium hover:bg-[var(--foreground)] hover:text-white transition-all duration-200"
              >
                {showAll ? 'Show Less' : `Show All ${filteredReviews.length} Reviews`}
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    showAll && 'rotate-180'
                  )}
                />
              </button>
            </div>
          )}

          {/* No reviews message */}
          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[var(--muted-foreground)]">
                No reviews match this filter. Try a different keyword.
              </p>
            </div>
          )}
        </div>
      </section>
    );
  }
);

interface ReviewCardProps {
  review: Review;
}

function ReviewCard({ review }: ReviewCardProps) {
  const rating = review.rating || 5;
  const displayName = review.authorInitial || review.authorName;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Rating */}
      <div className="flex gap-0.5 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              'w-4 h-4',
              i <= rating
                ? 'fill-[var(--foreground)] text-[var(--foreground)]'
                : 'fill-transparent text-[var(--foreground)]/30'
            )}
          />
        ))}
      </div>

      {/* Title */}
      {review.title && (
        <h3 className="font-medium mb-2 line-clamp-2">{review.title}</h3>
      )}

      {/* Review Text */}
      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4 line-clamp-4">
        {review.text}
      </p>

      {/* Author */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-sm font-medium">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium">{displayName}</span>
        </div>
        {review.isVerified && (
          <span className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <Check className="w-3 h-3" />
            Verified
          </span>
        )}
      </div>
    </div>
  );
}
