'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Save,
  GripVertical,
  Settings,
  LayoutGrid,
  List,
  Columns,
  Check,
  CheckSquare,
  Square,
  FileText,
  TrendingUp,
  FileEdit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetLibrarySidebar } from '@/components/admin/widget-library-sidebar';
import { getDefaultConfig, WIDGET_TYPES } from '@/lib/widget-library';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  authorName: string | null;
  authorAvatarUrl: string | null;
  status: string | null;
  publishedAt: string | null;
  isFeatured: boolean | null;
  readingTime: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  sortOrder: number;
  tags?: BlogTag[];
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface BlogSettings {
  id: string;
  blogName: string;
  blogSlug: string;
  // Homepage hero section
  heroMediaUrl: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  pageTitle: string;
  pageSubtitle: string;
  gridLayout: 'masonry' | 'grid' | 'list';
  widgets: string | null;
  blogInDraftMode: boolean;
}

interface BlogWidget {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  config?: Record<string, unknown>;
  isVisible: boolean;
}

const LAYOUT_OPTIONS = [
  { value: 'masonry', label: 'Masonry', icon: Columns, description: 'Pinterest-style staggered grid' },
  { value: 'grid', label: 'Grid', icon: LayoutGrid, description: 'Uniform card grid' },
  { value: 'list', label: 'List', icon: List, description: 'Vertical list layout' },
];

export default function BlogAdminPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'posts'>('settings');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [settings, setSettings] = useState<BlogSettings>({
    id: 'default',
    blogName: 'Blog',
    blogSlug: 'blog',
    heroMediaUrl: null,
    heroTitle: null,
    heroSubtitle: null,
    pageTitle: 'Blog',
    pageSubtitle: '',
    gridLayout: 'masonry',
    widgets: null,
    blogInDraftMode: true,
  });
  const [originalSettings, setOriginalSettings] = useState<BlogSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [siteInDraftMode, setSiteInDraftMode] = useState(false);

  // Posts tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [draggedPost, setDraggedPost] = useState<string | null>(null);
  const [dragOverPost, setDragOverPost] = useState<string | null>(null);

  // Widget state for blog page content
  const [blogWidgets, setBlogWidgets] = useState<BlogWidget[]>([]);
  const [originalBlogWidgets, setOriginalBlogWidgets] = useState<BlogWidget[]>([]);
  const [draggedWidgetType, setDraggedWidgetType] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Track unsaved changes (must be after state declarations)
  const hasSettingsChanges = originalSettings && (
    JSON.stringify(settings) !== JSON.stringify(originalSettings) ||
    JSON.stringify(blogWidgets) !== JSON.stringify(originalBlogWidgets)
  );

  // Fetch all data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, tagsRes, settingsRes, siteSettingsRes] = await Promise.all([
        fetch('/api/admin/blog/posts?includeAll=true'),
        fetch('/api/admin/blog/tags'),
        fetch('/api/admin/blog/settings'),
        fetch('/api/admin/settings'),
      ]);

      const postsData = await postsRes.json();
      const tagsData = await tagsRes.json();
      const siteSettingsData = await siteSettingsRes.json();

      // Sort posts by sortOrder first, then by createdAt descending (newest first)
      const sortedPosts = (postsData.posts || []).sort((a: BlogPost, b: BlogPost) => {
        if (a.sortOrder !== b.sortOrder && a.sortOrder !== undefined && b.sortOrder !== undefined) {
          return a.sortOrder - b.sortOrder;
        }
        // Default to newest first
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      setPosts(sortedPosts);
      setTags(tagsData || []);
      setSiteInDraftMode(siteSettingsData.siteInDraftMode ?? false);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData) {
          const mergedSettings = { ...settings, ...settingsData };
          setSettings(mergedSettings);
          setOriginalSettings(mergedSettings);

          // Parse and load widgets if they exist
          if (settingsData.widgets) {
            try {
              const parsedWidgets = JSON.parse(settingsData.widgets);
              setBlogWidgets(parsedWidgets);
              setOriginalBlogWidgets(parsedWidgets);
            } catch {
              setBlogWidgets([]);
              setOriginalBlogWidgets([]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const settingsWithWidgets = {
        ...settings,
        widgets: JSON.stringify(blogWidgets),
      };
      const res = await fetch('/api/admin/blog/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsWithWidgets),
      });
      if (res.ok) {
        setOriginalSettings(settings);
        setOriginalBlogWidgets(blogWidgets);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBlogDraftMode = async () => {
    const newDraftMode = !settings.blogInDraftMode;
    setSettings({ ...settings, blogInDraftMode: newDraftMode });

    try {
      await fetch('/api/admin/blog/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, blogInDraftMode: newDraftMode }),
      });
      setOriginalSettings({ ...settings, blogInDraftMode: newDraftMode });
    } catch (error) {
      console.error('Failed to toggle blog draft mode:', error);
      setSettings({ ...settings, blogInDraftMode: !newDraftMode });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await fetch(`/api/admin/blog/posts/${postId}`, { method: 'DELETE' });
      setPosts(posts.filter((p) => p.id !== postId));
      setSelectedPosts(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await fetch(`/api/admin/blog/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setPosts(posts.map((p) =>
        p.id === post.id ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleBatchDelete = async () => {
    if (!confirm(`Delete ${selectedPosts.size} selected posts? This cannot be undone.`)) return;

    try {
      await Promise.all(
        Array.from(selectedPosts).map(id =>
          fetch(`/api/admin/blog/posts/${id}`, { method: 'DELETE' })
        )
      );
      setPosts(posts.filter(p => !selectedPosts.has(p.id)));
      setSelectedPosts(new Set());
    } catch (error) {
      console.error('Failed to delete posts:', error);
    }
  };

  const handleBatchHide = async () => {
    try {
      await Promise.all(
        Array.from(selectedPosts).map(id =>
          fetch(`/api/admin/blog/posts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'draft' }),
          })
        )
      );
      setPosts(posts.map(p =>
        selectedPosts.has(p.id) ? { ...p, status: 'draft' } : p
      ));
      setSelectedPosts(new Set());
    } catch (error) {
      console.error('Failed to hide posts:', error);
    }
  };

  // Drag and drop for reordering
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

    const draggedIndex = posts.findIndex(p => p.id === draggedPost);
    const targetIndex = posts.findIndex(p => p.id === targetPostId);

    const newPosts = [...posts];
    const [removed] = newPosts.splice(draggedIndex, 1);
    newPosts.splice(targetIndex, 0, removed);

    const updatedPosts = newPosts.map((post, index) => ({
      ...post,
      sortOrder: index,
    }));

    setPosts(updatedPosts);
    setDraggedPost(null);

    // Save new order
    try {
      await fetch('/api/admin/blog/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posts: updatedPosts.map(p => ({ id: p.id, sortOrder: p.sortOrder })),
        }),
      });
    } catch (error) {
      console.error('Failed to save post order:', error);
    }
  };

  const handleDragEnd = () => {
    setDraggedPost(null);
    setDragOverPost(null);
  };

  // Widget handlers for blog page content
  const handleAddWidget = (type: string, atIndex?: number) => {
    const widgetDef = WIDGET_TYPES.find((w) => w.type === type);
    const newWidget: BlogWidget = {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: widgetDef?.name || '',
      subtitle: '',
      content: '',
      config: getDefaultConfig(type),
      isVisible: true,
    };

    if (atIndex !== undefined) {
      const newWidgets = [...blogWidgets];
      newWidgets.splice(atIndex, 0, newWidget);
      setBlogWidgets(newWidgets);
    } else {
      setBlogWidgets([...blogWidgets, newWidget]);
    }
  };

  const handleUpdateWidget = (widgetId: string, updates: Partial<BlogWidget>) => {
    setBlogWidgets(blogWidgets.map((w) => (w.id === widgetId ? { ...w, ...updates } : w)));
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (confirm('Delete this widget?')) {
      setBlogWidgets(blogWidgets.filter((w) => w.id !== widgetId));
    }
  };

  const handleWidgetDrop = (e: React.DragEvent<HTMLDivElement>, atIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    const widgetType = e.dataTransfer.getData('widget-type');
    if (widgetType) {
      const insertIndex = atIndex !== undefined ? atIndex : dropTargetIndex !== null ? dropTargetIndex : blogWidgets.length;
      handleAddWidget(widgetType, insertIndex);
    }
    setDraggedWidgetType(null);
    setDropTargetIndex(null);
  };

  const handleWidgetDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragOverWidgetRow = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const newIndex = e.clientY < midY ? index : index + 1;
    if (newIndex !== dropTargetIndex) {
      setDropTargetIndex(newIndex);
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

  const toggleSelectAll = () => {
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map(p => p.id)));
    }
  };

  const toggleSelectPost = (postId: string) => {
    setSelectedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  // Determine if blog is effectively in draft mode (either blog-specific or site-wide)
  const isBlogDraft = settings.blogInDraftMode || siteInDraftMode;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">Blog</h1>
            <p className="text-[var(--admin-text-secondary)] mt-1">
              Configure blog settings and manage posts
            </p>
          </div>

          {/* Blog Draft/Live Toggle */}
          <div className="flex items-center gap-2 pl-4 border-l border-[var(--admin-border)]">
            <span className={cn(
              "text-sm font-medium transition-colors",
              isBlogDraft ? "text-orange-400" : "text-[var(--admin-text-muted)]"
            )}>
              Draft
            </span>
            <button
              onClick={handleToggleBlogDraftMode}
              className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--admin-bg)]"
              style={{
                backgroundColor: isBlogDraft ? '#f97316' : '#22c55e'
              }}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-lg",
                  isBlogDraft ? "translate-x-1" : "translate-x-8"
                )}
              />
            </button>
            <span className={cn(
              "text-sm font-medium transition-colors",
              !isBlogDraft ? "text-green-400" : "text-[var(--admin-text-muted)]"
            )}>
              Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Live / View Draft */}
          <a
            href={isBlogDraft ? `/blog?preview=true` : '/blog'}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isBlogDraft
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            )}
          >
            {isBlogDraft ? (
              <>
                <Eye className="w-4 h-4" />
                View Draft
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                View Live
              </>
            )}
          </a>

          {activeTab === 'settings' && hasSettingsChanges && (
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-[var(--primary)] text-[var(--admin-button-text)] hover:bg-[var(--primary-dark)]',
                saving && 'opacity-50 cursor-not-allowed'
              )}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          )}

          {activeTab === 'posts' && (
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </Link>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-lg">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">{publishedCount} Live Posts</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-lg">
          <FileEdit className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">{draftCount} Drafts</span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 bg-[var(--admin-input)] rounded-xl p-1 border border-[var(--admin-border)]">
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
            activeTab === 'settings'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-hover)]'
          )}
        >
          <Settings className="w-4 h-4" />
          Blog Settings
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
            activeTab === 'posts'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-hover)]'
          )}
        >
          <FileText className="w-4 h-4" />
          All Posts
        </button>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Two Column Layout: Settings + Recent Posts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Settings */}
            <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                    Basic Settings
                  </h2>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    Blog name, URL, and page titles
                  </p>
                </div>
              </div>

              <div className="space-y-5">
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
                </div>

                {/* Homepage Hero Section */}
                <div className="pt-6 border-t border-[var(--admin-border)]">
                  <h3 className="text-sm font-semibold text-[var(--admin-text-primary)] mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    Homepage Hero
                  </h3>

                  <div className="space-y-4">
                    {/* Hero Media Upload */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Hero Media (Full-Screen Image/Video)
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={settings.heroMediaUrl || ''}
                          onChange={(e) => setSettings({ ...settings, heroMediaUrl: e.target.value || null })}
                          className="flex-1 px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                          placeholder="https://... (image or video URL)"
                        />
                        {settings.heroMediaUrl && (
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, heroMediaUrl: null })}
                            className="px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {settings.heroMediaUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden bg-[var(--admin-bg-secondary)] h-32">
                          {settings.heroMediaUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                            <video src={settings.heroMediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
                          ) : (
                            <img src={settings.heroMediaUrl} alt="Hero preview" className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}
                      <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">
                        Full-width hero displayed at the top of the blog homepage
                      </p>
                    </div>

                    {/* Hero Title */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Hero Title
                      </label>
                      <input
                        type="text"
                        value={settings.heroTitle || ''}
                        onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value || null })}
                        className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                        placeholder="The Journal"
                      />
                    </div>

                    {/* Hero Subtitle */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Hero Subtitle
                      </label>
                      <input
                        type="text"
                        value={settings.heroSubtitle || ''}
                        onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value || null })}
                        className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                        placeholder="Stories, tips, and inspiration for healthy eyes"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Page Subtitle
                    </label>
                    <input
                      type="text"
                      value={settings.pageSubtitle || ''}
                      onChange={(e) => setSettings({ ...settings, pageSubtitle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                      placeholder="Insights & stories"
                    />
                  </div>
                </div>

                {/* Blog Design - Stacked Layout Options */}
                <div className="pt-4 border-t border-[var(--admin-border)]">
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">
                    Blog Design
                  </label>
                  <div className="space-y-2">
                    {LAYOUT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSettings({ ...settings, gridLayout: option.value as BlogSettings['gridLayout'] })}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                          settings.gridLayout === option.value
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                            : 'border-[var(--admin-border)] hover:border-[var(--admin-border-light)] bg-[var(--admin-input)]'
                        )}
                      >
                        <option.icon
                          className={cn(
                            'w-5 h-5 shrink-0',
                            settings.gridLayout === option.value
                              ? 'text-[var(--primary)]'
                              : 'text-[var(--admin-text-secondary)]'
                          )}
                        />
                        <div className="flex-1">
                          <span
                            className={cn(
                              'text-sm font-medium block',
                              settings.gridLayout === option.value
                                ? 'text-[var(--primary)]'
                                : 'text-[var(--admin-text-primary)]'
                            )}
                          >
                            {option.label}
                          </span>
                          <span className="text-xs text-[var(--admin-text-muted)]">
                            {option.description}
                          </span>
                        </div>
                        {settings.gridLayout === option.value && (
                          <Check className="w-4 h-4 text-[var(--primary)] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Recent Posts */}
            <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[var(--admin-border)]">
                <div>
                  <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                    Recent Posts
                  </h2>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    {posts.length} total &bull; {publishedCount} live &bull; {draftCount} drafts
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('posts')}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="divide-y divide-[var(--admin-border)] max-h-[500px] overflow-y-auto">
                {posts.slice(0, 10).map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-3 p-3 hover:bg-[var(--admin-hover)] transition-colors"
                  >
                    <Link href={`/admin/blog/${post.id}`} className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--admin-input)] shrink-0">
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
                    <Link href={`/admin/blog/${post.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[var(--admin-text-primary)] truncate">
                          {post.title || 'Untitled'}
                        </p>
                        {post.isFeatured && (
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--admin-text-muted)]">
                        /{settings.blogSlug}/{post.slug}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status toggle */}
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                          post.status === 'published'
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                        )}
                      >
                        {post.status === 'published' ? 'Live' : 'Draft'}
                      </button>
                      {/* View link */}
                      <a
                        href={post.status === 'published' ? `/blog/${post.slug}` : `/blog/${post.slug}?preview=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)] transition-colors"
                        title={post.status === 'published' ? 'View Live' : 'Preview Draft'}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-sm text-[var(--admin-text-muted)]">No posts yet</p>
                    <Link
                      href="/admin/blog/new"
                      className="inline-flex items-center gap-2 mt-3 text-sm text-[var(--primary)] hover:underline"
                    >
                      <Plus className="w-4 h-4" />
                      Create First Post
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page Content / Widgets Section - Full Width */}
          <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[var(--admin-border)]">
              <div>
                <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                  Page Content
                </h2>
                <p className="text-sm text-[var(--admin-text-muted)] mt-1">
                  Add widgets to customize your blog page layout
                </p>
              </div>
              <span className="px-2 py-0.5 text-xs font-medium bg-[var(--admin-hover)] text-[var(--admin-text-muted)] rounded-full">
                {blogWidgets.length} widgets
              </span>
            </div>
            <div className="flex">
              {/* Widget Drop Zone - Left side */}
              <div
                className={cn(
                  'flex-1 p-6 min-h-[400px] transition-all',
                  draggedWidgetType && 'bg-[var(--primary)]/5'
                )}
                onDrop={handleWidgetDrop}
                onDragOver={handleWidgetDragOver}
                onDragLeave={() => setDropTargetIndex(null)}
              >
                {blogWidgets.length > 0 ? (
                  <div className="space-y-2">
                    {blogWidgets.map((widget, index) => {
                      const widgetDef = WIDGET_TYPES.find((w) => w.type === widget.type);
                      const Icon = widgetDef?.icon || FileText;
                      return (
                        <div
                          key={widget.id}
                          onDragOver={(e) => draggedWidgetType && handleDragOverWidgetRow(e, index)}
                          onDrop={(e) => handleWidgetDrop(e, dropTargetIndex ?? index)}
                        >
                          {/* Drop indicator before this widget */}
                          {draggedWidgetType && dropTargetIndex === index && (
                            <div className="h-1 bg-[var(--primary)] mx-4 rounded-full animate-pulse mb-2" />
                          )}
                          <div
                            className={cn(
                              'flex items-center gap-3 p-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input)] transition-all',
                              'hover:border-[var(--admin-border-light)]'
                            )}
                          >
                            <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] cursor-grab" />
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--admin-text-primary)] truncate">
                                {widget.title || widgetDef?.name || widget.type}
                              </h4>
                              <p className="text-xs text-[var(--admin-text-muted)]">
                                {widgetDef?.description || ''}
                              </p>
                            </div>
                            <button
                              onClick={() => handleUpdateWidget(widget.id, { isVisible: !widget.isVisible })}
                              className={cn(
                                'p-2 rounded-lg transition-colors',
                                widget.isVisible
                                  ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
                                  : 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20'
                              )}
                              title={widget.isVisible ? 'Visible - click to hide' : 'Hidden - click to show'}
                            >
                              {widget.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteWidget(widget.id)}
                              className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete widget"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Drop indicator after last widget */}
                          {draggedWidgetType && index === blogWidgets.length - 1 && dropTargetIndex === blogWidgets.length && (
                            <div className="h-1 bg-[var(--primary)] mx-4 rounded-full animate-pulse mt-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="h-full flex flex-col items-center justify-center text-center"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDropTargetIndex(0);
                    }}
                    onDrop={(e) => handleWidgetDrop(e, 0)}
                  >
                    {draggedWidgetType ? (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center mb-4">
                          <Plus className="w-8 h-8 text-[var(--primary)]" />
                        </div>
                        <h3 className="font-medium text-lg text-[var(--primary)] mb-2">
                          Drop here to add
                        </h3>
                        <p className="text-sm text-[var(--admin-text-muted)]">
                          Release to add widget
                        </p>
                      </>
                    ) : (
                      <>
                        <Plus className="w-12 h-12 text-[var(--admin-text-muted)] mb-4" />
                        <h3 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">
                          No widgets yet
                        </h3>
                        <p className="text-sm text-[var(--admin-text-muted)] max-w-xs">
                          Drag widgets from the library on the right, or click to add them to your blog page
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Widget Library Sidebar - Right side */}
              <div className="w-72 border-l border-[var(--admin-border)] bg-[var(--admin-sidebar)]">
                <WidgetLibrarySidebar
                  onAddWidget={handleAddWidget}
                  onDragStart={(type) => setDraggedWidgetType(type)}
                  onDragEnd={() => setDraggedWidgetType(null)}
                  draggedWidgetType={draggedWidgetType}
                  storageKey="blog-admin-widget-order"
                  showReorderControls={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
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
                {filteredPosts.map((post, index) => (
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
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                        )}
                      >
                        {post.status === 'published' ? 'Live' : 'Draft'}
                      </button>

                      <a
                        href={post.status === 'published' ? `/blog/${post.slug}` : `/blog/${post.slug}?preview=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)] transition-colors"
                        title="View post"
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
                      color: tag.color || '#bbdae9',
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
