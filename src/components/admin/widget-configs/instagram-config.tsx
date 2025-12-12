'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Instagram,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';

interface InstagramPost {
  id: string;
  thumbnailUrl: string;
  postUrl: string | null;
  caption: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface InstagramConfigProps {
  posts: InstagramPost[];
  onPostsChange: (posts: InstagramPost[]) => void;
}

/**
 * Instagram Feed configuration panel.
 * Allows editing manually uploaded Instagram-style posts with thumbnails and captions.
 */
export function InstagramConfig({
  posts,
  onPostsChange,
}: InstagramConfigProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // ─────────────────────────────────────────
  // Post Operations
  // ─────────────────────────────────────────

  const addPost = () => {
    const newItem: InstagramPost = {
      id: `new-${Date.now()}`,
      thumbnailUrl: '',
      postUrl: null,
      caption: null,
      isActive: true,
      sortOrder: posts.length,
    };

    onPostsChange([...posts, newItem]);
    setExpandedItem(newItem.id);
  };

  const updatePost = (id: string, updates: Partial<InstagramPost>) => {
    onPostsChange(posts.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deletePost = (id: string) => {
    onPostsChange(posts.filter((item) => item.id !== id));
    if (expandedItem === id) {
      setExpandedItem(null);
    }
  };

  const reorderPosts = (newOrder: InstagramPost[]) => {
    const reordered = newOrder.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));
    onPostsChange(reordered);
  };

  return (
    <div className="space-y-4">
      {/* Post Grid Preview */}
      {posts.length > 0 && (
        <div className="grid grid-cols-4 gap-2 p-3 bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
          {posts.slice(0, 8).map((post) => (
            <div
              key={post.id}
              className={cn(
                'aspect-square rounded-lg overflow-hidden bg-[var(--admin-hover)] cursor-pointer hover:ring-2 hover:ring-[var(--primary)] transition-all',
                !post.isActive && 'opacity-40',
                expandedItem === post.id && 'ring-2 ring-[var(--primary)]'
              )}
              onClick={() => setExpandedItem(expandedItem === post.id ? null : post.id)}
            >
              {post.thumbnailUrl ? (
                <Image
                  src={post.thumbnailUrl}
                  alt={post.caption || 'Post'}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-[var(--admin-text-muted)]" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post List */}
      <Reorder.Group axis="y" values={posts} onReorder={reorderPosts} className="space-y-3">
        {posts.map((item, index) => {
          const isExpanded = expandedItem === item.id;

          return (
            <Reorder.Item key={item.id} value={item} className="list-none">
              <PostCard
                post={item}
                index={index}
                isExpanded={isExpanded}
                onToggleExpand={() => setExpandedItem(isExpanded ? null : item.id)}
                onUpdate={(updates) => updatePost(item.id, updates)}
                onDelete={() => deletePost(item.id)}
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* Add Button */}
      <button
        type="button"
        onClick={addPost}
        className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-[var(--admin-border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 text-[var(--admin-text-muted)] hover:text-[var(--primary)] transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add Instagram Post</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// Post Card Component
// ─────────────────────────────────────────

interface PostCardProps {
  post: InstagramPost;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<InstagramPost>) => void;
  onDelete: () => void;
}

function PostCard({
  post,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
}: PostCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div
      className={cn(
        'bg-[var(--admin-input)] border rounded-xl overflow-hidden transition-all',
        isExpanded ? 'border-[var(--primary)]' : 'border-[var(--admin-border)]',
        !post.isActive && 'opacity-60'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--admin-hover)] transition-colors',
          isExpanded && 'border-b border-[var(--admin-border)]'
        )}
        onClick={onToggleExpand}
      >
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-[var(--admin-text-muted)]">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--admin-hover)] flex-shrink-0">
          {post.thumbnailUrl ? (
            <Image
              src={post.thumbnailUrl}
              alt={post.caption || 'Post'}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Instagram className="w-4 h-4 text-[var(--admin-text-muted)]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--admin-text-primary)] truncate">
              Post {index + 1}
            </span>
            {post.postUrl && (
              <a
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--admin-text-muted)] hover:text-[var(--primary)]"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="text-xs text-[var(--admin-text-muted)] truncate">
            {post.caption || 'No caption'}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          {/* Active toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ isActive: !post.isActive });
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              post.isActive
                ? 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]'
                : 'text-amber-500 bg-amber-50'
            )}
            title={post.isActive ? 'Active' : 'Inactive'}
          >
            {post.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (showDeleteConfirm) {
                onDelete();
              } else {
                setShowDeleteConfirm(true);
                setTimeout(() => setShowDeleteConfirm(false), 3000);
              }
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showDeleteConfirm
                ? 'text-white bg-red-500'
                : 'text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-50'
            )}
            title={showDeleteConfirm ? 'Click again to confirm' : 'Delete'}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Expand indicator */}
          <div className="p-1.5 text-[var(--admin-text-muted)]">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-[var(--admin-bg)]">
              {/* Thumbnail */}
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Image</label>
                <MediaPickerButton
                  value={post.thumbnailUrl}
                  onChange={(url) => onUpdate({ thumbnailUrl: url || '' })}
                  label="Upload Image"
                  helpText="Square aspect ratio recommended"
                />
              </div>

              {/* Post URL */}
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                  Instagram Post URL (optional)
                </label>
                <input
                  type="text"
                  value={post.postUrl || ''}
                  onChange={(e) => onUpdate({ postUrl: e.target.value || null })}
                  placeholder="https://instagram.com/p/..."
                  className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Caption</label>
                <textarea
                  value={post.caption || ''}
                  onChange={(e) => onUpdate({ caption: e.target.value || null })}
                  placeholder="Caption for the post..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-2 border-t border-[var(--admin-border)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={post.isActive}
                    onChange={(e) => onUpdate({ isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <Eye className="w-4 h-4 text-[var(--admin-text-muted)]" />
                  <span className="text-sm text-[var(--admin-text-secondary)]">Active</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
