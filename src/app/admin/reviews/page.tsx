'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Star, Package, Plus, FolderOpen, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductWithReviews {
  id: string;
  slug: string;
  name: string;
  heroImageUrl: string | null;
  reviewCount: number;
  avgRating: number | null;
}

interface Collection {
  name: string;
  reviewCount: number;
  avgRating: number | null;
}

interface DeleteCollectionModalProps {
  isOpen: boolean;
  collectionName: string;
  reviewCount: number;
  onClose: () => void;
  onDelete: () => void;
}

function DeleteCollectionModal({ isOpen, collectionName, reviewCount, onClose, onDelete }: DeleteCollectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--admin-input)] rounded-2xl border border-[var(--admin-border)] p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-2">Delete "{collectionName}"?</h3>
            <p className="text-sm text-[var(--admin-text-secondary)] mb-6">
              This will permanently delete this collection and all {reviewCount} review{reviewCount !== 1 ? 's' : ''} in it.
              This action cannot be undone.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={onDelete}
                className="w-full py-2.5 px-4 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Collection
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 text-[var(--admin-text-muted)] rounded-lg text-sm font-medium hover:text-[var(--admin-text-secondary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

function CreateCollectionModal({ isOpen, onClose, onCreate }: CreateCollectionModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Collection name is required');
      return;
    }
    onCreate(name.trim());
    setName('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--admin-input)] rounded-2xl border border-[var(--admin-border)] p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-4">Create Collection</h3>
        <p className="text-sm text-[var(--admin-text-secondary)] mb-4">
          Collections let you group reviews that aren't tied to a specific product (e.g., community feedback, event reviews).
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Collection Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="e.g., Community Reviews, Event Feedback"
            className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 text-[var(--admin-text-secondary)] rounded-lg text-sm font-medium hover:bg-[var(--admin-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 py-2.5 px-4 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-[var(--admin-text-muted)] text-sm">No reviews</span>;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-3.5 h-3.5",
            star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-[var(--admin-text-muted)]"
          )}
        />
      ))}
      <span className="text-sm text-[var(--admin-text-secondary)] ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ReviewsHubPage() {
  const [products, setProducts] = useState<ProductWithReviews[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; collection: Collection | null }>({
    isOpen: false,
    collection: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch products with review stats
      const [productsRes, collectionsRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/review-collections'),
      ]);

      const productsData = await productsRes.json();
      const collectionsData = await collectionsRes.json();

      // Fetch review counts for each product
      const productsWithReviews = await Promise.all(
        productsData.map(async (product: { id: string; slug: string; name: string; heroImageUrl: string | null }) => {
          const reviewsRes = await fetch(`/api/admin/reviews?productId=${product.id}`);
          const reviewsData = await reviewsRes.json();
          const reviews = reviewsData.reviews || [];

          const avgRating = reviews.length > 0
            ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
            : null;

          return {
            id: product.id,
            slug: product.slug,
            name: product.name,
            heroImageUrl: product.heroImageUrl,
            reviewCount: reviews.length,
            avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
          };
        })
      );

      setProducts(productsWithReviews);
      setCollections(collectionsData.collections || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (name: string) => {
    try {
      const res = await fetch('/api/admin/review-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setCollections([...collections, { name, reviewCount: 0, avgRating: null }]);
        setCreateModalOpen(false);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create collection');
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleDeleteCollection = async (collection: Collection) => {
    try {
      const res = await fetch('/api/admin/review-collections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: collection.name }),
      });

      if (res.ok) {
        setCollections(collections.filter((c) => c.name !== collection.name));
        setDeleteModal({ isOpen: false, collection: null });
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
    }
  };

  const totalReviews = products.reduce((sum, p) => sum + p.reviewCount, 0) +
    collections.reduce((sum, c) => sum + c.reviewCount, 0);

  const productsWithReviews = products.filter((p) => p.reviewCount > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-medium text-[var(--admin-text-primary)]">Reviews</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1 text-sm hidden sm:block">
            Manage product reviews and collections
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{totalReviews}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Total Reviews</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{productsWithReviews}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Products w/ Reviews</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{collections.length}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Collections</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">
                {(() => {
                  const allRatings = [
                    ...products.filter((p) => p.avgRating !== null).map((p) => ({ rating: p.avgRating!, count: p.reviewCount })),
                    ...collections.filter((c) => c.avgRating !== null).map((c) => ({ rating: c.avgRating!, count: c.reviewCount })),
                  ];
                  if (allRatings.length === 0) return '-';
                  const totalWeight = allRatings.reduce((sum, r) => sum + r.count, 0);
                  if (totalWeight === 0) return '-';
                  const weightedAvg = allRatings.reduce((sum, r) => sum + r.rating * r.count, 0) / totalWeight;
                  return weightedAvg.toFixed(1);
                })()}
              </p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-[var(--admin-border)] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            <span className="font-medium text-[var(--admin-text-primary)] text-sm sm:text-base">Product Reviews</span>
            <span className="px-2 py-0.5 text-xs bg-[var(--admin-bg)] text-[var(--admin-text-secondary)] rounded-full">
              {products.length}
            </span>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="divide-y divide-[var(--admin-border)]">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/admin/reviews/product/${product.id}`}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-[var(--primary)]/5 transition-colors group"
              >
                {/* Image */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[var(--admin-bg)] flex items-center justify-center shrink-0 overflow-hidden group-hover:bg-[var(--primary)]/10 transition-colors">
                  {product.heroImageUrl ? (
                    <img
                      src={product.heroImageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--admin-text-secondary)] group-hover:text-[var(--primary)]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[var(--admin-text-primary)] group-hover:text-[var(--primary)] transition-colors truncate text-sm sm:text-base">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <StarRating rating={product.avgRating} />
                  </div>
                </div>

                {/* Review Count */}
                <div className="flex items-center gap-2 text-[var(--admin-text-secondary)]">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">{product.reviewCount}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)] opacity-50" />
            <h3 className="font-medium text-[var(--admin-text-primary)] mb-2">No products</h3>
            <p className="text-sm text-[var(--admin-text-muted)]">
              Create products first to manage their reviews
            </p>
          </div>
        )}
      </div>

      {/* Collections Section */}
      <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-[var(--admin-border)] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <span className="font-medium text-[var(--admin-text-primary)] text-sm sm:text-base">Collections</span>
            <span className="px-2 py-0.5 text-xs bg-[var(--admin-bg)] text-[var(--admin-text-secondary)] rounded-full">
              {collections.length}
            </span>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--admin-bg)] text-[var(--admin-text-secondary)] rounded-lg text-sm font-medium hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text-primary)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>

        {collections.length > 0 ? (
          <div className="divide-y divide-[var(--admin-border)]">
            {collections.map((collection) => (
              <div
                key={collection.name}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-[var(--primary)]/5 transition-colors group"
              >
                {/* Icon */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
                  <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                </div>

                {/* Info */}
                <Link
                  href={`/admin/reviews/collection/${encodeURIComponent(collection.name)}`}
                  className="flex-1 min-w-0"
                >
                  <h3 className="font-medium text-[var(--admin-text-primary)] group-hover:text-[var(--primary)] transition-colors truncate text-sm sm:text-base">
                    {collection.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <StarRating rating={collection.avgRating} />
                  </div>
                </Link>

                {/* Review Count & Delete */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[var(--admin-text-secondary)]">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">{collection.reviewCount}</span>
                  </div>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, collection })}
                    className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)] opacity-50" />
            <h3 className="font-medium text-[var(--admin-text-primary)] mb-2">No collections yet</h3>
            <p className="text-sm text-[var(--admin-text-muted)] mb-4">
              Collections let you group reviews not tied to a product
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Collection
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateCollectionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateCollection}
      />
      <DeleteCollectionModal
        isOpen={deleteModal.isOpen}
        collectionName={deleteModal.collection?.name || ''}
        reviewCount={deleteModal.collection?.reviewCount || 0}
        onClose={() => setDeleteModal({ isOpen: false, collection: null })}
        onDelete={() => deleteModal.collection && handleDeleteCollection(deleteModal.collection)}
      />
    </div>
  );
}
