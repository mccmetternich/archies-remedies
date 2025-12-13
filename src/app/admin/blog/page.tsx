'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  PenSquare,
  Calendar,
  Tag,
  Search,
  Star,
  AlertCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  authorName: string | null;
  status: string | null;
  publishedAt: string | null;
  isFeatured: boolean | null;
  readingTime: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  tags?: BlogTag[];
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface DeleteModalProps {
  isOpen: boolean;
  postTitle: string;
  onClose: () => void;
  onDelete: () => void;
  onDraft: () => void;
}

function DeleteModal({ isOpen, postTitle, onClose, onDelete, onDraft }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-border-light)] p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-2">Delete "{postTitle}"?</h3>
            <p className="text-sm text-[var(--admin-text-secondary)] mb-6">
              This will permanently remove this blog post. Would you like to save it as a draft instead?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={onDraft}
                className="w-full py-2.5 px-4 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-sm font-medium hover:bg-[var(--admin-hover)] transition-colors flex items-center justify-center gap-2"
              >
                <EyeOff className="w-4 h-4" />
                Save as Draft
              </button>
              <button
                onClick={onDelete}
                className="w-full py-2.5 px-4 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Permanently
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

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; post: BlogPost | null }>({
    isOpen: false,
    post: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, tagsRes] = await Promise.all([
        fetch('/api/admin/blog/posts'),
        fetch('/api/admin/blog/tags'),
      ]);
      const postsData = await postsRes.json();
      const tagsData = await tagsRes.json();
      setPosts(postsData.posts || []);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to fetch blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    try {
      await fetch(`/api/admin/blog/posts/${post.id}`, { method: 'DELETE' });
      setPosts(posts.filter((p) => p.id !== post.id));
      setDeleteModal({ isOpen: false, post: null });
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleSaveAsDraft = async (post: BlogPost) => {
    try {
      await fetch(`/api/admin/blog/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' }),
      });
      setPosts(posts.map((p) =>
        p.id === post.id ? { ...p, status: 'draft' } : p
      ));
      setDeleteModal({ isOpen: false, post: null });
    } catch (error) {
      console.error('Failed to save as draft:', error);
    }
  };

  const toggleFeatured = async (post: BlogPost) => {
    const newFeatured = !post.isFeatured;
    try {
      await fetch(`/api/admin/blog/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: newFeatured }),
      });
      setPosts(posts.map((p) =>
        p.id === post.id ? { ...p, isFeatured: newFeatured } : p
      ));
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const featuredCount = posts.filter((p) => p.isFeatured).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-medium text-[var(--admin-text-primary)]">Blog</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1 text-sm hidden sm:block">
            Create and manage blog posts
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/admin/blog/tags"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-colors text-sm"
          >
            <Tag className="w-4 h-4" />
            <span className="hidden sm:inline">Manage Tags</span>
            <span className="sm:hidden">Tags</span>
          </Link>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Post</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--admin-input)] flex items-center justify-center shrink-0">
              <PenSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--admin-text-secondary)]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{posts.length}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{publishedCount}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Published</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-500/10 flex items-center justify-center shrink-0">
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--admin-text-secondary)]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{draftCount}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Drafts</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{featuredCount}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Featured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm sm:text-base"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--admin-text-muted)] hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors appearance-none cursor-pointer text-sm sm:text-base"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden">
        {filteredPosts.length > 0 ? (
          <div className="divide-y divide-[var(--admin-border-light)]">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/blog/${post.id}`}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-[var(--primary)]/5 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="w-14 h-10 sm:w-20 sm:h-14 rounded-lg bg-[var(--admin-input)] overflow-hidden shrink-0">
                  {post.featuredImageUrl ? (
                    <img
                      src={post.featuredImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PenSquare className="w-4 h-4 sm:w-6 sm:h-6 text-[var(--admin-text-muted)]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                    <h3 className="font-medium text-[var(--admin-text-primary)] group-hover:text-[var(--primary)] transition-colors truncate text-sm sm:text-base">
                      {post.title}
                    </h3>
                    {post.isFeatured && (
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400 shrink-0" />
                    )}
                    {/* Mobile status indicator */}
                    <span className={cn(
                      'sm:hidden w-2 h-2 rounded-full shrink-0',
                      post.status === 'published' ? 'bg-green-400' : post.status === 'scheduled' ? 'bg-blue-400' : 'bg-gray-400'
                    )} />
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--admin-text-muted)] truncate hidden sm:block">
                    {post.excerpt || 'No excerpt'}
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                    <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime || 5} min
                    </span>
                    {post.publishedAt && (
                      <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)] flex items-center gap-1 hidden sm:flex">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions - Desktop only */}
                <div className="hidden sm:flex items-center gap-3" onClick={(e) => e.preventDefault()}>
                  {/* Featured Toggle */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFeatured(post);
                    }}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      post.isFeatured
                        ? 'text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20'
                        : 'text-[var(--admin-text-muted)] hover:text-yellow-400 hover:bg-yellow-500/10'
                    )}
                    title={post.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    <Star className={cn('w-4 h-4', post.isFeatured && 'fill-yellow-400')} />
                  </button>

                  {/* Status Badge */}
                  <span
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium',
                      post.status === 'published'
                        ? 'bg-green-500/10 text-green-400'
                        : post.status === 'scheduled'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-gray-500/10 text-[var(--admin-text-secondary)]'
                    )}
                  >
                    {post.status === 'published' ? 'Published' : post.status === 'scheduled' ? 'Scheduled' : 'Draft'}
                  </span>

                  {/* Preview */}
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] hover:bg-[var(--admin-input)] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteModal({ isOpen: true, post });
                    }}
                    className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <PenSquare className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)]" />
            <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-2">No blog posts yet</h3>
            <p className="text-sm text-[var(--admin-text-muted)] mb-6">
              Create your first blog post to get started
            </p>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Post
            </Link>
          </div>
        )}
      </div>

      {/* Tags Section */}
      {tags.length > 0 && (
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2 text-sm sm:text-base">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--admin-text-secondary)]" />
              Tags
            </h2>
            <Link
              href="/admin/blog/tags"
              className="text-xs sm:text-sm text-[var(--primary)] hover:underline"
            >
              Manage
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color || '#bbdae9',
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        postTitle={deleteModal.post?.title || ''}
        onClose={() => setDeleteModal({ isOpen: false, post: null })}
        onDelete={() => deleteModal.post && handleDelete(deleteModal.post)}
        onDraft={() => deleteModal.post && handleSaveAsDraft(deleteModal.post)}
      />
    </div>
  );
}
