'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import {
  Save,
  Loader2,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Plus,
  Settings as SettingsIcon,
  LayoutGrid,
  List,
  Columns,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BlogSettings {
  id: string;
  blogName: string;
  blogSlug: string;
  pageTitle: string;
  gridLayout: 'masonry' | 'grid' | 'list';
  widgets: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  featuredImageUrl: string | null;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
}

const LAYOUT_OPTIONS = [
  { value: 'masonry', label: 'Masonry', icon: Columns, description: 'Pinterest-style staggered grid' },
  { value: 'grid', label: 'Grid', icon: LayoutGrid, description: 'Uniform card grid' },
  { value: 'list', label: 'List', icon: List, description: 'Vertical list layout' },
];

export default function BlogSettingsPage() {
  const [settings, setSettings] = useState<BlogSettings>({
    id: 'default',
    blogName: 'Blog',
    blogSlug: 'blog',
    pageTitle: 'Blog',
    gridLayout: 'masonry',
    widgets: null,
  });
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [draggedPost, setDraggedPost] = useState<string | null>(null);
  const [dragOverPost, setDragOverPost] = useState<string | null>(null);

  // Fetch blog settings and posts
  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, postsRes] = await Promise.all([
          fetch('/api/admin/blog/settings'),
          fetch('/api/admin/blog/posts?includeAll=true'),
        ]);

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData) {
            setSettings(settingsData);
          }
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          // Sort by sortOrder first, then by createdAt descending
          const sortedPosts = (postsData.posts || []).sort((a: BlogPost, b: BlogPost) => {
            if (a.sortOrder !== b.sortOrder) {
              return a.sortOrder - b.sortOrder;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setPosts(sortedPosts);
        }
      } catch (err) {
        setError('Failed to load blog settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/blog/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Failed to save settings');

      setSuccessMessage('Blog settings saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to save blog settings');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';

    try {
      const res = await fetch(`/api/admin/blog/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update post status');

      setPosts(posts.map(p =>
        p.id === post.id ? { ...p, status: newStatus } : p
      ));
    } catch (err) {
      setError('Failed to update post status');
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete post');

      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      setError('Failed to delete post');
      console.error(err);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, postId: string) => {
    setDraggedPost(postId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, postId: string) => {
    e.preventDefault();
    if (postId !== draggedPost) {
      setDragOverPost(postId);
    }
  };

  const handleDragLeave = () => {
    setDragOverPost(null);
  };

  const handleDrop = async (e: React.DragEvent, targetPostId: string) => {
    e.preventDefault();
    setDragOverPost(null);

    if (!draggedPost || draggedPost === targetPostId) {
      setDraggedPost(null);
      return;
    }

    // Reorder posts
    const draggedIndex = posts.findIndex(p => p.id === draggedPost);
    const targetIndex = posts.findIndex(p => p.id === targetPostId);

    const newPosts = [...posts];
    const [removed] = newPosts.splice(draggedIndex, 1);
    newPosts.splice(targetIndex, 0, removed);

    // Update sortOrder for all posts
    const updatedPosts = newPosts.map((post, index) => ({
      ...post,
      sortOrder: index,
    }));

    setPosts(updatedPosts);
    setDraggedPost(null);

    // Save new order to backend
    try {
      await fetch('/api/admin/blog/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posts: updatedPosts.map(p => ({ id: p.id, sortOrder: p.sortOrder })),
        }),
      });
    } catch (err) {
      setError('Failed to save post order');
      console.error(err);
    }
  };

  const handleDragEnd = () => {
    setDraggedPost(null);
    setDragOverPost(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--admin-text-primary)]">
              Blog Settings
            </h1>
            <p className="text-sm text-[var(--admin-text-secondary)] mt-1">
              Configure your blog and manage post order
            </p>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Settings
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {successMessage}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            {/* Basic Settings Card */}
            <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                  <SettingsIcon className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                    Basic Settings
                  </h2>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    Blog name, URL, and page title
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Blog Name */}
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                    Blog Name
                  </label>
                  <input
                    type="text"
                    value={settings.blogName}
                    onChange={(e) => setSettings({ ...settings, blogName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                    placeholder="Blog"
                  />
                  <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">
                    Displayed in navigation and page headers
                  </p>
                </div>

                {/* URL Slug */}
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                    URL Slug
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-[var(--admin-input)] border border-r-0 border-[var(--admin-border)] rounded-l-lg text-[var(--admin-text-muted)] text-sm">
                      /
                    </span>
                    <input
                      type="text"
                      value={settings.blogSlug}
                      onChange={(e) => setSettings({ ...settings, blogSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="flex-1 px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-r-lg text-[var(--admin-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                      placeholder="blog"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">
                    The URL path for your blog (e.g., yoursite.com/{settings.blogSlug || 'blog'})
                  </p>
                </div>

                {/* Page Title */}
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={settings.pageTitle}
                    onChange={(e) => setSettings({ ...settings, pageTitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                    placeholder="Blog"
                  />
                  <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">
                    The title displayed at the top of the blog page
                  </p>
                </div>
              </div>
            </div>

            {/* Layout Settings Card */}
            <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                    Grid Layout
                  </h2>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    How blog posts are displayed
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {LAYOUT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSettings({ ...settings, gridLayout: option.value as BlogSettings['gridLayout'] })}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      settings.gridLayout === option.value
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-[var(--admin-border)] hover:border-[var(--admin-border-light)] bg-[var(--admin-input)]'
                    )}
                  >
                    <option.icon
                      className={cn(
                        'w-6 h-6',
                        settings.gridLayout === option.value
                          ? 'text-[var(--primary)]'
                          : 'text-[var(--admin-text-secondary)]'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium',
                        settings.gridLayout === option.value
                          ? 'text-[var(--primary)]'
                          : 'text-[var(--admin-text-secondary)]'
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--admin-text-muted)] text-center">
                {LAYOUT_OPTIONS.find(o => o.value === settings.gridLayout)?.description}
              </p>
            </div>

            {/* Widgets Section (placeholder for future) */}
            <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                  Widgets
                </h2>
                <Link
                  href="/admin/widgets"
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  Browse Library
                </Link>
              </div>
              <div className="border-2 border-dashed border-[var(--admin-border)] rounded-lg p-8 text-center">
                <Plus className="w-8 h-8 mx-auto text-[var(--admin-text-muted)] mb-2" />
                <p className="text-sm text-[var(--admin-text-muted)]">
                  Add widgets from the library to enhance your blog page
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Posts List */}
          <div>
            <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl">
              <div className="flex items-center justify-between p-4 border-b border-[var(--admin-border)]">
                <div>
                  <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                    Posts ({posts.length})
                  </h2>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    Drag to reorder how posts appear on the blog
                  </p>
                </div>
                <Link
                  href="/admin/blog/new"
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  New Post
                </Link>
              </div>

              {posts.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[var(--admin-text-muted)]">No blog posts yet</p>
                  <Link
                    href="/admin/blog/new"
                    className="inline-flex items-center gap-2 mt-4 text-[var(--primary)] hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first post
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--admin-border)] max-h-[600px] overflow-y-auto">
                  {posts.map((post, index) => (
                    <div
                      key={post.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, post.id)}
                      onDragOver={(e) => handleDragOver(e, post.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, post.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'flex items-center gap-3 p-3 transition-colors cursor-move',
                        draggedPost === post.id && 'opacity-50 bg-[var(--admin-hover)]',
                        dragOverPost === post.id && 'bg-[var(--primary)]/10 border-t-2 border-[var(--primary)]',
                        !draggedPost && 'hover:bg-[var(--admin-hover)]'
                      )}
                    >
                      {/* Drag Handle */}
                      <div className="text-[var(--admin-text-muted)] cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Position Number */}
                      <div className="w-6 h-6 rounded bg-[var(--admin-input)] flex items-center justify-center text-xs font-medium text-[var(--admin-text-muted)]">
                        {index + 1}
                      </div>

                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--admin-input)] shrink-0">
                        {post.featuredImageUrl ? (
                          <img
                            src={post.featuredImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)]">
                            <LayoutGrid className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Title - Clickable to edit */}
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="flex-1 min-w-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-sm font-medium text-[var(--admin-text-primary)] truncate hover:text-[var(--primary)] transition-colors">
                          {post.title || 'Untitled'}
                        </p>
                        <p className="text-xs text-[var(--admin-text-muted)]">
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString()
                            : 'Not published'}
                        </p>
                      </Link>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {/* Status Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(post);
                          }}
                          className={cn(
                            'px-2 py-1 rounded text-xs font-medium transition-colors',
                            post.status === 'published'
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                          )}
                          title={post.status === 'published' ? 'Click to unpublish' : 'Click to publish'}
                        >
                          {post.status === 'published' ? 'Live' : 'Draft'}
                        </button>

                        {/* View */}
                        <a
                          href={post.status === 'published' ? `/blog/${post.slug}` : `/blog/${post.slug}?preview=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded hover:bg-[var(--admin-input)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-colors"
                          title="View post"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePost(post.id);
                          }}
                          className="p-1.5 rounded hover:bg-red-500/20 text-[var(--admin-text-muted)] hover:text-red-400 transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
