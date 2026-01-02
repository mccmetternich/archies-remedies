'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Upload, Tag, Star, Plus, Trash2, GripVertical, Check, X, Edit2, Loader2, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reorder } from 'framer-motion';

interface Review {
  id: string;
  productId: string | null;
  collectionName: string | null;
  rating: number;
  title: string | null;
  authorName: string;
  authorInitial: string | null;
  text: string;
  keywords: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface Keyword {
  id: string;
  productId: string | null;
  collectionName: string | null;
  keyword: string;
  count: number;
  sortOrder: number;
}

type TabType = 'reviews' | 'import' | 'tags';

export default function CollectionReviewsPage() {
  const params = useParams();
  const collectionName = decodeURIComponent(params.name as string);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('reviews');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const reviewsRes = await fetch(`/api/admin/reviews?collection=${encodeURIComponent(collectionName)}`);
      const reviewsData = await reviewsRes.json();

      setReviews(reviewsData.reviews || []);
      setKeywords(reviewsData.keywords || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveReviews = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews, collectionName }),
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveKeywords = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/review-keywords', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, collectionName }),
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

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
        <div className="flex items-center gap-4">
          <Link
            href="/admin/reviews"
            className="p-2 rounded-lg hover:bg-[var(--admin-hover)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--admin-text-secondary)]" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-medium text-[var(--admin-text-primary)]">
                {collectionName}
              </h1>
              <p className="text-[var(--admin-text-secondary)] mt-0.5 text-sm">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        {hasChanges && (
          <button
            onClick={activeTab === 'tags' ? saveKeywords : saveReviews}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Changes
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] w-fit">
        {[
          { id: 'reviews' as TabType, label: 'Reviews', icon: MessageSquare },
          { id: 'import' as TabType, label: 'Import', icon: Upload },
          { id: 'tags' as TabType, label: 'Tags', icon: Tag },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[var(--primary)] text-[var(--admin-button-text)]"
                : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-hover)]"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'reviews' && (
        <ReviewsTab
          reviews={reviews}
          setReviews={(r) => { setReviews(r); setHasChanges(true); }}
          collectionName={collectionName}
          onRefresh={fetchData}
        />
      )}
      {activeTab === 'import' && (
        <ImportTab collectionName={collectionName} onImport={fetchData} />
      )}
      {activeTab === 'tags' && (
        <TagsTab
          keywords={keywords}
          setKeywords={(k) => { setKeywords(k); setHasChanges(true); }}
          collectionName={collectionName}
        />
      )}
    </div>
  );
}

// Reviews Tab Component
function ReviewsTab({
  reviews,
  setReviews,
  collectionName,
  onRefresh,
}: {
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  collectionName: string;
  onRefresh: () => void;
}) {
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteReview = async (id: string) => {
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      setReviews(reviews.filter((r) => r.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleUpdateReview = async (review: Partial<Review>) => {
    if (!review.id) return;
    try {
      await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      setReviews(reviews.map((r) => r.id === review.id ? { ...r, ...review } as Review : r));
      setEditingReview(null);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const handleAddReview = async (review: Partial<Review>) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...review, collectionName }),
      });
      if (res.ok) {
        onRefresh();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Failed to add:', error);
    }
  };

  return (
    <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
      <div className="p-4 border-b border-[var(--admin-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
          <span className="font-medium text-[var(--admin-text-primary)]">All Reviews</span>
          <span className="px-2 py-0.5 text-xs bg-[var(--admin-bg)] text-[var(--admin-text-secondary)] rounded-full">
            {reviews.length}
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--admin-bg)] text-[var(--admin-text-secondary)] rounded-lg text-sm font-medium hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text-primary)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Review
        </button>
      </div>

      {reviews.length > 0 ? (
        <Reorder.Group
          axis="y"
          values={reviews}
          onReorder={setReviews}
          className="divide-y divide-[var(--admin-border)]"
        >
          {reviews.map((review) => (
            <Reorder.Item
              key={review.id}
              value={review}
              className="flex items-start gap-4 p-4 bg-[var(--admin-input)] hover:bg-[var(--admin-hover)]/50 transition-colors group"
            >
              <div className="cursor-grab active:cursor-grabbing pt-1">
                <GripVertical className="w-5 h-5 text-[var(--admin-text-muted)]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-3.5 h-3.5",
                          star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-[var(--admin-text-muted)]"
                        )}
                      />
                    ))}
                  </div>
                  {review.isVerified && (
                    <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 rounded-full">
                      Verified
                    </span>
                  )}
                  {review.isFeatured && (
                    <span className="px-2 py-0.5 text-xs bg-[var(--primary)]/10 text-[var(--primary)] rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                {review.title && (
                  <h4 className="font-medium text-[var(--admin-text-primary)] mb-1">{review.title}</h4>
                )}
                <p className="text-sm text-[var(--admin-text-secondary)] line-clamp-2 mb-2">{review.text}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">
                  — {review.authorInitial || review.authorName}
                </p>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingReview(review)}
                  className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {deleteConfirm === review.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(review.id)}
                    className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className="py-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)] opacity-50" />
          <h3 className="font-medium text-[var(--admin-text-primary)] mb-2">No reviews yet</h3>
          <p className="text-sm text-[var(--admin-text-muted)] mb-4">
            Add reviews manually or import from a CSV file
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Review
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingReview && (
        <ReviewEditModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSave={handleUpdateReview}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <ReviewEditModal
          review={null}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddReview}
        />
      )}
    </div>
  );
}

// Review Edit Modal
function ReviewEditModal({
  review,
  onClose,
  onSave,
}: {
  review: Review | null;
  onClose: () => void;
  onSave: (review: Partial<Review>) => void;
}) {
  const [form, setForm] = useState({
    rating: review?.rating || 5,
    title: review?.title || '',
    authorName: review?.authorName || '',
    authorInitial: review?.authorInitial || '',
    text: review?.text || '',
    isVerified: review?.isVerified ?? true,
    isFeatured: review?.isFeatured ?? false,
    isActive: review?.isActive ?? true,
    keywords: review?.keywords ? JSON.parse(review.keywords) : [],
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.authorName.trim() || !form.text.trim()) {
      alert('Author name and review text are required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...review,
        ...form,
        authorInitial: form.authorInitial || form.authorName.split(' ')[0],
        keywords: form.keywords,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--admin-input)] rounded-2xl border border-[var(--admin-border)] p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-4">
          {review ? 'Edit Review' : 'Add Review'}
        </h3>

        <div className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setForm({ ...form, rating: star })}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      "w-6 h-6 transition-colors",
                      star <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-[var(--admin-text-muted)] hover:text-yellow-400"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Author Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Author Name *</label>
            <input
              type="text"
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
              placeholder="Sarah Johnson"
              className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
            />
          </div>

          {/* Author Initial */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Display Name</label>
            <input
              type="text"
              value={form.authorInitial}
              onChange={(e) => setForm({ ...form, authorInitial: e.target.value })}
              placeholder="Sarah J."
              className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
            />
            <p className="text-xs text-[var(--admin-text-muted)] mt-1">Leave blank to use first name only</p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Life changing product!"
              className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
            />
          </div>

          {/* Text */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Review Text *</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              rows={4}
              placeholder="Write the review..."
              className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 resize-none"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isVerified}
                onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-[var(--admin-text-secondary)]">Verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-[var(--admin-text-secondary)]">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-[var(--admin-text-secondary)]">Active</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 text-[var(--admin-text-secondary)] rounded-lg text-sm font-medium hover:bg-[var(--admin-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 px-4 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Import Tab Component
function ImportTab({ collectionName, onImport }: { collectionName: string; onImport: () => void }) {
  const [csvData, setCsvData] = useState<Record<string, unknown>[]>([]);
  const [importing, setImporting] = useState(false);
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [result, setResult] = useState<{ imported?: number; errors?: { row: number; errors: string[] }[] } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    const data: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim().replace(/^["']|["']$/g, '') || '';
      });
      data.push(row);
    }

    return data;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSV(text);
      setCsvData(data);
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      handleFile(file);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/admin/reviews/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData, collectionName, mode }),
      });
      const data = await res.json();
      setResult(data);
      if (data.imported > 0) {
        onImport();
      }
    } catch (error) {
      console.error('Failed to import:', error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
      <div className="p-4 border-b border-[var(--admin-border)]">
        <div className="flex items-center gap-3">
          <Upload className="w-5 h-5 text-[var(--primary)]" />
          <span className="font-medium text-[var(--admin-text-primary)]">Import from CSV</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
            dragActive ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--admin-border)]"
          )}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)]" />
          <p className="text-[var(--admin-text-primary)] font-medium mb-2">
            Drop your CSV file here
          </p>
          <p className="text-sm text-[var(--admin-text-muted)] mb-4">
            or click to browse
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            id="csv-upload-collection"
          />
          <label
            htmlFor="csv-upload-collection"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-bg)] text-[var(--admin-text-secondary)] rounded-lg text-sm font-medium hover:bg-[var(--admin-hover)] cursor-pointer transition-colors"
          >
            Choose File
          </label>
        </div>

        {/* CSV Format Info */}
        <div className="bg-[var(--admin-bg)] rounded-xl p-4 border border-[var(--admin-border)]">
          <h4 className="font-medium text-[var(--admin-text-primary)] mb-2">Expected CSV Format</h4>
          <p className="text-sm text-[var(--admin-text-muted)] mb-3">
            Column headers (flexible naming):
          </p>
          <code className="block text-xs bg-[var(--admin-input)] p-3 rounded-lg text-[var(--admin-text-secondary)] overflow-x-auto">
            first_name, last_name, rating, title, text, tags, verified
          </code>
          <p className="text-xs text-[var(--admin-text-muted)] mt-2">
            Last names are auto-truncated to initials (Johnson → J.)
          </p>
        </div>

        {/* Preview */}
        {csvData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-[var(--admin-text-primary)]">
                Preview ({csvData.length} rows)
              </h4>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={mode === 'append'}
                    onChange={() => setMode('append')}
                    className="text-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--admin-text-secondary)]">Add to existing</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={mode === 'replace'}
                    onChange={() => setMode('replace')}
                    className="text-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--admin-text-secondary)]">Replace all</span>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--admin-border)]">
                    <th className="text-left p-2 text-[var(--admin-text-muted)]">Name</th>
                    <th className="text-left p-2 text-[var(--admin-text-muted)]">Rating</th>
                    <th className="text-left p-2 text-[var(--admin-text-muted)]">Title</th>
                    <th className="text-left p-2 text-[var(--admin-text-muted)]">Text</th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-[var(--admin-border)]">
                      <td className="p-2 text-[var(--admin-text-primary)]">
                        {String(row.first_name || row.firstname || row.name || '')} {String(row.last_name || row.lastname || '').charAt(0)}.
                      </td>
                      <td className="p-2 text-[var(--admin-text-secondary)]">{String(row.rating || row.stars || 5)}</td>
                      <td className="p-2 text-[var(--admin-text-secondary)] max-w-[150px] truncate">{String(row.title || row.headline || '-')}</td>
                      <td className="p-2 text-[var(--admin-text-secondary)] max-w-[200px] truncate">{String(row.text || row.review || row.body || '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvData.length > 5 && (
                <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                  ... and {csvData.length - 5} more rows
                </p>
              )}
            </div>

            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full py-3 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import ${csvData.length} Reviews`}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={cn(
            "rounded-xl p-4 border",
            result.errors?.length ? "bg-orange-500/10 border-orange-500/30" : "bg-green-500/10 border-green-500/30"
          )}>
            {result.imported !== undefined && (
              <p className="font-medium text-green-400 mb-2">
                Successfully imported {result.imported} reviews
              </p>
            )}
            {result.errors && result.errors.length > 0 && (
              <div>
                <p className="font-medium text-orange-400 mb-2">
                  {result.errors.length} row{result.errors.length !== 1 ? 's' : ''} had errors:
                </p>
                <ul className="text-sm text-[var(--admin-text-secondary)] space-y-1">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>Row {err.row}: {err.errors.join(', ')}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Tags Tab Component
function TagsTab({
  keywords,
  setKeywords,
  collectionName,
}: {
  keywords: Keyword[];
  setKeywords: (keywords: Keyword[]) => void;
  collectionName: string;
}) {
  const [newKeyword, setNewKeyword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;

    try {
      const res = await fetch('/api/admin/review-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword.trim(), collectionName }),
      });

      if (res.ok) {
        const data = await res.json();
        setKeywords([...keywords, {
          id: data.id,
          productId: null,
          collectionName,
          keyword: newKeyword.trim(),
          count: 0,
          sortOrder: keywords.length,
        }]);
        setNewKeyword('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add keyword');
      }
    } catch (error) {
      console.error('Failed to add keyword:', error);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    try {
      await fetch('/api/admin/review-keywords', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setKeywords(keywords.filter((k) => k.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
      <div className="p-4 border-b border-[var(--admin-border)]">
        <div className="flex items-center gap-3">
          <Tag className="w-5 h-5 text-[var(--primary)]" />
          <span className="font-medium text-[var(--admin-text-primary)]">Review Tags</span>
          <span className="px-2 py-0.5 text-xs bg-[var(--admin-bg)] text-[var(--admin-text-secondary)] rounded-full">
            {keywords.length}
          </span>
        </div>
        <p className="text-sm text-[var(--admin-text-muted)] mt-1">
          Tags are displayed as filter bubbles in the reviews widget
        </p>
      </div>

      {/* Add New */}
      <div className="p-4 border-b border-[var(--admin-border)] flex gap-3">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="Add a new tag..."
          className="flex-1 px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
          onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
        />
        <button
          onClick={handleAddKeyword}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
        >
          Add
        </button>
      </div>

      {/* Keyword List */}
      {keywords.length > 0 ? (
        <Reorder.Group
          axis="y"
          values={keywords}
          onReorder={setKeywords}
          className="divide-y divide-[var(--admin-border)]"
        >
          {keywords.map((keyword) => (
            <Reorder.Item
              key={keyword.id}
              value={keyword}
              className="flex items-center gap-4 p-4 bg-[var(--admin-input)] hover:bg-[var(--admin-hover)]/50 transition-colors group"
            >
              <div className="cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5 text-[var(--admin-text-muted)]" />
              </div>

              <div className="flex-1 flex items-center gap-3">
                <span className="px-3 py-1.5 bg-[var(--admin-bg)] text-[var(--admin-text-primary)] rounded-full text-sm font-medium">
                  {keyword.keyword}
                </span>
                <span className="text-xs text-[var(--admin-text-muted)]">
                  {keyword.count} review{keyword.count !== 1 ? 's' : ''}
                </span>
              </div>

              {deleteConfirm === keyword.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteKeyword(keyword.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(keyword.id)}
                  className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className="py-12 text-center">
          <Tag className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)] opacity-50" />
          <h3 className="font-medium text-[var(--admin-text-primary)] mb-2">No tags yet</h3>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Tags are automatically created when importing reviews with tags
          </p>
        </div>
      )}
    </div>
  );
}
