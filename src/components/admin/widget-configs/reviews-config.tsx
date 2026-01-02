'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Package, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

interface Product {
  id: string;
  name: string;
  slug: string;
}

interface Collection {
  name: string;
  reviewCount: number;
}

interface ReviewsConfigProps {
  productId: string | null;
  collectionName: string | null;
  title: string;
  subtitle: string;
  showKeywordFilters: boolean;
  initialCount: number;
  backgroundColor: string;
  showVerifiedBadge: boolean;
  showRatingHeader: boolean;
  excludedTags: string[];
  onProductIdChange: (productId: string | null) => void;
  onCollectionNameChange: (collectionName: string | null) => void;
  onTitleChange: (title: string) => void;
  onSubtitleChange: (subtitle: string) => void;
  onShowKeywordFiltersChange: (show: boolean) => void;
  onInitialCountChange: (count: number) => void;
  onBackgroundColorChange: (color: string) => void;
  onShowVerifiedBadgeChange: (show: boolean) => void;
  onShowRatingHeaderChange: (show: boolean) => void;
  onExcludedTagsChange: (tags: string[]) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ReviewsConfig({
  productId,
  collectionName,
  title,
  subtitle,
  showKeywordFilters,
  initialCount,
  backgroundColor,
  showVerifiedBadge,
  showRatingHeader,
  excludedTags,
  onProductIdChange,
  onCollectionNameChange,
  onTitleChange,
  onSubtitleChange,
  onShowKeywordFiltersChange,
  onInitialCountChange,
  onBackgroundColorChange,
  onShowVerifiedBadgeChange,
  onShowRatingHeaderChange,
  onExcludedTagsChange,
}: ReviewsConfigProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products, collections, and tags
  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, collectionsRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/review-collections'),
        ]);

        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(Array.isArray(data) ? data : (data.products || []));
        }

        if (collectionsRes.ok) {
          const data = await collectionsRes.json();
          setCollections(data.collections || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Fetch tags when source changes
  useEffect(() => {
    async function fetchTags() {
      try {
        let url = '/api/admin/review-keywords';
        if (productId) {
          url += `?productId=${productId}`;
        } else if (collectionName) {
          url += `?collection=${encodeURIComponent(collectionName)}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const keywords = data.keywords || [];
          setAvailableTags(keywords.map((k: { keyword: string }) => k.keyword));
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    }
    fetchTags();
  }, [productId, collectionName]);

  // Handle source selection
  const handleSourceChange = (value: string) => {
    if (value === 'all') {
      onProductIdChange(null);
      onCollectionNameChange(null);
    } else if (value.startsWith('product:')) {
      onProductIdChange(value.replace('product:', ''));
      onCollectionNameChange(null);
    } else if (value.startsWith('collection:')) {
      onProductIdChange(null);
      onCollectionNameChange(value.replace('collection:', ''));
    }
    // Clear excluded tags when source changes
    onExcludedTagsChange([]);
  };

  // Get current source value
  const getCurrentSource = () => {
    if (productId) return `product:${productId}`;
    if (collectionName) return `collection:${collectionName}`;
    return 'all';
  };

  // Add/remove excluded tag
  const toggleExcludedTag = (tag: string) => {
    if (excludedTags.includes(tag)) {
      onExcludedTagsChange(excludedTags.filter((t) => t !== tag));
    } else {
      onExcludedTagsChange([...excludedTags, tag]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="What People Are Saying"
          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Subtitle <span className="text-[var(--admin-text-muted)]">(optional)</span>
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
          placeholder="Real reviews from verified customers"
          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      {/* Source Selector */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Review Source
        </label>
        <select
          value={getCurrentSource()}
          onChange={(e) => handleSourceChange(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        >
          <option value="all">All Reviews</option>
          {products.length > 0 && (
            <optgroup label="Products">
              {products.map((product) => (
                <option key={product.id} value={`product:${product.id}`}>
                  {product.name}
                </option>
              ))}
            </optgroup>
          )}
          {collections.length > 0 && (
            <optgroup label="Collections">
              {collections.map((collection) => (
                <option key={collection.name} value={`collection:${collection.name}`}>
                  {collection.name} ({collection.reviewCount})
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1.5">
          Choose which reviews to display in this widget
        </p>
      </div>

      {/* Source Badge */}
      {(productId || collectionName) && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--admin-hover)] rounded-lg">
          {productId ? (
            <>
              <Package className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm text-[var(--admin-text-primary)]">
                Linked to: {products.find((p) => p.id === productId)?.name || 'Product'}
              </span>
            </>
          ) : (
            <>
              <FolderOpen className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-[var(--admin-text-primary)]">
                Collection: {collectionName}
              </span>
            </>
          )}
        </div>
      )}

      {/* Keyword Filters Toggle */}
      <div className="flex items-center justify-between p-4 bg-[var(--admin-hover)] rounded-xl">
        <div>
          <p className="text-sm font-medium text-[var(--admin-text-primary)]">
            Keyword Filter Bubbles
          </p>
          <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
            Show clickable keyword tags above reviews
          </p>
        </div>
        <button
          type="button"
          onClick={() => onShowKeywordFiltersChange(!showKeywordFilters)}
          className={cn(
            'relative w-12 h-7 rounded-full transition-colors',
            showKeywordFilters ? 'bg-[var(--primary)]' : 'bg-[var(--admin-border)]'
          )}
        >
          <span
            className={cn(
              'absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform',
              showKeywordFilters ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {/* Excluded Tags */}
      {showKeywordFilters && availableTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Hide Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleExcludedTag(tag)}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors',
                  excludedTags.includes(tag)
                    ? 'bg-red-500/10 text-red-400 line-through'
                    : 'bg-[var(--admin-input)] text-[var(--admin-text-primary)] hover:bg-[var(--admin-hover)]'
                )}
              >
                {tag}
                {excludedTags.includes(tag) && <X className="w-3 h-3" />}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--admin-text-muted)] mt-1.5">
            Click tags to hide them from the filter bar
          </p>
        </div>
      )}

      {/* Show Verified Badge Toggle */}
      <div className="flex items-center justify-between p-4 bg-[var(--admin-hover)] rounded-xl">
        <div>
          <p className="text-sm font-medium text-[var(--admin-text-primary)]">
            Verified Badge
          </p>
          <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
            Show &quot;Verified Purchase&quot; badge on reviews
          </p>
        </div>
        <button
          type="button"
          onClick={() => onShowVerifiedBadgeChange(!showVerifiedBadge)}
          className={cn(
            'relative w-12 h-7 rounded-full transition-colors',
            showVerifiedBadge ? 'bg-[var(--primary)]' : 'bg-[var(--admin-border)]'
          )}
        >
          <span
            className={cn(
              'absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform',
              showVerifiedBadge ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {/* Show Rating Header Toggle */}
      <div className="flex items-center justify-between p-4 bg-[var(--admin-hover)] rounded-xl">
        <div>
          <p className="text-sm font-medium text-[var(--admin-text-primary)]">
            Rating Summary Header
          </p>
          <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
            Show &quot;Based on X verified reviews&quot; with star rating
          </p>
        </div>
        <button
          type="button"
          onClick={() => onShowRatingHeaderChange(!showRatingHeader)}
          className={cn(
            'relative w-12 h-7 rounded-full transition-colors',
            showRatingHeader ? 'bg-[var(--primary)]' : 'bg-[var(--admin-border)]'
          )}
        >
          <span
            className={cn(
              'absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform',
              showRatingHeader ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {/* Initial Count */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Reviews Shown Initially
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={3}
            max={12}
            step={3}
            value={initialCount}
            onChange={(e) => onInitialCountChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-[var(--admin-border)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--primary)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-sm font-medium text-[var(--admin-text-primary)] w-8 text-center">
            {initialCount}
          </span>
        </div>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1.5">
          Number of reviews shown before &quot;Show More&quot; button
        </p>
      </div>

      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Background Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'cream', label: 'Cream', color: 'bg-[#f5f0e8]' },
            { value: 'white', label: 'White', color: 'bg-white' },
            { value: 'transparent', label: 'None', color: 'bg-transparent' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onBackgroundColorChange(option.value)}
              className={cn(
                'p-3 rounded-xl border-2 transition-all text-center',
                backgroundColor === option.value
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                  : 'border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg mx-auto mb-2 border border-[var(--admin-border)]',
                  option.color
                )}
              />
              <span className="text-xs font-medium text-[var(--admin-text-primary)]">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Help Text & Link */}
      <div className="p-4 bg-[var(--admin-input)] rounded-xl">
        <p className="text-sm text-[var(--admin-text-secondary)]">
          Reviews are managed in the Reviews admin section.
        </p>
        <Link
          href="/admin/reviews"
          className="text-sm text-[var(--primary)] hover:underline mt-1 inline-block"
        >
          Manage Reviews →
        </Link>
      </div>
    </div>
  );
}
