'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDefaultConfig, WIDGET_TYPES } from '@/lib/widget-library';

export interface BlogPost {
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

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface BlogSettings {
  id: string;
  blogName: string;
  blogSlug: string;
  heroMediaUrl: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  pageTitle: string;
  pageSubtitle: string;
  gridLayout: 'bento' | 'masonry' | 'grid' | 'list';
  widgets: string | null;
  blogInDraftMode: boolean;
}

export interface BlogWidget {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  config?: Record<string, unknown>;
  isVisible: boolean;
}

const DEFAULT_SETTINGS: BlogSettings = {
  id: 'default',
  blogName: 'Blog',
  blogSlug: 'blog',
  heroMediaUrl: null,
  heroTitle: null,
  heroSubtitle: null,
  pageTitle: 'Blog',
  pageSubtitle: '',
  gridLayout: 'bento',
  widgets: null,
  blogInDraftMode: true,
};

export function useBlogAdmin() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'settings' | 'posts'>('settings');

  // Data state
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [settings, setSettings] = useState<BlogSettings>(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<BlogSettings | null>(null);

  // Loading states
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
  const [expandedWidgetId, setExpandedWidgetId] = useState<string | null>(null);

  // Track unsaved changes
  const hasSettingsChanges = originalSettings && (
    JSON.stringify(settings) !== JSON.stringify(originalSettings) ||
    JSON.stringify(blogWidgets) !== JSON.stringify(originalBlogWidgets)
  );

  // Computed values
  const isBlogDraft = settings.blogInDraftMode || siteInDraftMode;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Fetch all data
  const fetchData = useCallback(async () => {
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
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      setPosts(sortedPosts);
      setTags(tagsData || []);
      setSiteInDraftMode(siteSettingsData.siteInDraftMode ?? false);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData) {
          const mergedSettings = { ...DEFAULT_SETTINGS, ...settingsData };
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Settings handlers
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

  // Post CRUD handlers
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

  // Drag and drop for reordering posts
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

  // Selection handlers
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

  // Widget handlers
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

  return {
    // Tab state
    activeTab,
    setActiveTab,

    // Data
    posts,
    tags,
    settings,
    setSettings,
    blogWidgets,
    setBlogWidgets,

    // Loading states
    loading,
    saving,
    saved,

    // Computed values
    hasSettingsChanges,
    isBlogDraft,
    publishedCount,
    draftCount,
    filteredPosts,

    // Posts tab state
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedPosts,
    draggedPost,
    dragOverPost,

    // Widget state
    draggedWidgetType,
    setDraggedWidgetType,
    dropTargetIndex,
    setDropTargetIndex,
    expandedWidgetId,
    setExpandedWidgetId,

    // Settings handlers
    handleSaveSettings,
    handleToggleBlogDraftMode,

    // Post CRUD handlers
    handleDeletePost,
    handleToggleStatus,
    handleBatchDelete,
    handleBatchHide,

    // Drag and drop handlers for posts
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,

    // Selection handlers
    toggleSelectAll,
    toggleSelectPost,

    // Widget handlers
    handleAddWidget,
    handleUpdateWidget,
    handleDeleteWidget,
    handleWidgetDrop,
    handleWidgetDragOver,
    handleDragOverWidgetRow,
  };
}
