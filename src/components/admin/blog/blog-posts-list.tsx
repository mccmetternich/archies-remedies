'use client';

import React from 'react';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  ExternalLink,
  PenSquare,
  Calendar,
  Tag,
  Search,
  Star,
  Clock,
  EyeOff,
  GripVertical,
  CheckSquare,
  Square,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogPost, BlogTag, BlogSettings } from '@/hooks/use-blog-admin';

interface BlogPostsListProps {
  posts: BlogPost[];
  filteredPosts: BlogPost[];
  tags: BlogTag[];
  settings: BlogSettings;
  isBlogDraft: boolean;
  publishedCount: number;
  draftCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  selectedPosts: Set<string>;
  draggedPost: string | null;
  dragOverPost: string | null;
  handleDeletePost: (postId: string) => void;
  handleToggleStatus: (post: BlogPost) => void;
  handleBatchDelete: () => void;
  handleBatchHide: () => void;
  handleDragStart: (e: React.DragEvent, postId: string) => void;
  handleDragOver: (e: React.DragEvent, postId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetPostId: string) => void;
  handleDragEnd: () => void;
  toggleSelectAll: () => void;
  toggleSelectPost: (postId: string) => void;
}

export function BlogPostsList({
  posts,
  filteredPosts,
  tags,
  settings,
  isBlogDraft,
  publishedCount,
  draftCount,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedPosts,
  draggedPost,
  dragOverPost,
  handleDeletePost,
  handleToggleStatus,
  handleBatchDelete,
  handleBatchHide,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDragEnd,
  toggleSelectAll,
  toggleSelectPost,
}: BlogPostsListProps) {
  return (
    <div className="space-y-4">
      {/* Search, Filter, and Batch Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-11 pr-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published ({publishedCount})</option>
            <option value="draft">Draft ({draftCount})</option>
          </select>

          {selectedPosts.size > 0 && (
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--admin-border)]">
              <span className="text-sm text-[var(--admin-text-secondary)]">
                {selectedPosts.size} selected
              </span>
              <button
                onClick={handleBatchHide}
                className="px-3 py-2 rounded-lg text-sm bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
              >
                <EyeOff className="w-4 h-4" />
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--admin-border)] bg-[var(--admin-input)]">
          <button
            onClick={toggleSelectAll}
            className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-colors"
          >
            {selectedPosts.size === filteredPosts.length && filteredPosts.length > 0 ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
          <span className="text-xs text-[var(--admin-text-muted)] uppercase tracking-wider font-medium">
            Drag to reorder posts
          </span>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="divide-y divide-[var(--admin-border-light)]">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                draggable
                onDragStart={(e) => handleDragStart(e, post.id)}
                onDragOver={(e) => handleDragOver(e, post.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, post.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'flex items-center gap-3 p-4 transition-colors cursor-move',
                  draggedPost === post.id && 'opacity-50 bg-[var(--admin-hover)]',
                  dragOverPost === post.id && 'bg-[var(--primary)]/10 border-t-2 border-[var(--primary)]',
                  !draggedPost && 'hover:bg-[var(--admin-hover)]'
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelectPost(post.id)}
                  className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-colors"
                >
                  {selectedPosts.has(post.id) ? (
                    <CheckSquare className="w-4 h-4 text-[var(--primary)]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                {/* Drag Handle */}
                <div className="text-[var(--admin-text-muted)] cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Thumbnail */}
                <Link href={`/admin/blog/${post.id}`} className="w-16 h-12 rounded-lg bg-[var(--admin-input)] overflow-hidden shrink-0">
                  {post.featuredImageUrl ? (
                    <img
                      src={post.featuredImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PenSquare className="w-5 h-5 text-[var(--admin-text-muted)]" />
                    </div>
                  )}
                </Link>

                {/* Content */}
                <Link href={`/admin/blog/${post.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-medium text-[var(--admin-text-primary)] hover:text-[var(--primary)] transition-colors truncate">
                      {post.title || 'Untitled'}
                    </h3>
                    {post.isFeatured && (
                      <span className="px-1.5 py-0.5 bg-yellow-400/20 text-yellow-400 text-[10px] font-semibold uppercase tracking-wider rounded">
                        Featured
                      </span>
                    )}
                    {post.status === 'draft' && (
                      <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-semibold uppercase tracking-wider rounded">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--admin-text-muted)]">
                    <span>/{settings.blogSlug}/{post.slug}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime || 5} min
                    </span>
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(post)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      post.status === 'published'
                        ? isBlogDraft
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                    )}
                  >
                    {post.status === 'published' ? (isBlogDraft ? 'Ready' : 'Live') : 'Draft'}
                  </button>

                  <a
                    href={post.status === 'published' && !isBlogDraft ? `/blog/${post.slug}` : `/blog/${post.slug}?preview=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)] transition-colors"
                    title={post.status === 'published' && !isBlogDraft ? 'View Live' : 'Preview Draft'}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2">
              <Tag className="w-5 h-5 text-[var(--admin-text-secondary)]" />
              Tags
            </h2>
            <Link
              href="/admin/blog/tags"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Manage Tags
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color || 'var(--primary)',
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
