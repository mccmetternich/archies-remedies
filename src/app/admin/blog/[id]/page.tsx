'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Loader2,
  Check,
  Eye,
  EyeOff,
  Star,
  Tag,
  X,
  Trash2,
  Plus,
  Heart,
  BarChart3,
  Search,
  User,
  AlertCircle,
  GripVertical,
  Layers,
  ChevronDown,
  ChevronUp,
  Monitor,
  Smartphone,
  ImageIcon,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { WidgetLibrarySidebar } from '@/components/admin/widget-library-sidebar';
import { WidgetConfigPanel } from '@/components/admin/widget-config-panel';
import { WIDGET_TYPES } from '@/lib/widget-library';

interface PostWidget {
  id: string;
  type: string;
  visible: boolean;
  config: Record<string, unknown>;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featuredImageUrl: string | null;
  authorName: string | null;
  authorAvatarUrl: string | null;
  status: string | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  isFeatured: boolean | null;
  metaTitle: string | null;
  metaDescription: string | null;
  readingTime: number | null;
  viewCount: number | null;
  heartCount: number | null;
  sortOrder: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  tags?: BlogTag[];
  // New fields for redesigned blog post page
  heroCarouselImages: string | null; // JSON array of up to 4 image URLs
  rightColumnBgColor: string | null; // 'blue' | 'white' | 'black'
  rightColumnThumbnailUrl: string | null;
  postWidgets: string | null; // JSON array of widget configs
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  postCount?: number;
}

export default function BlogPostEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';
  const rightColumnRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [allTags, setAllTags] = useState<BlogTag[]>([]);
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  const [post, setPost] = useState<BlogPost>({
    id: '',
    slug: '',
    title: '',
    excerpt: null,
    content: null,
    featuredImageUrl: null,
    authorName: "Archie's Remedies",
    authorAvatarUrl: null,
    status: 'draft',
    publishedAt: null,
    scheduledAt: null,
    isFeatured: false,
    metaTitle: null,
    metaDescription: null,
    readingTime: 5,
    viewCount: null,
    heartCount: null,
    sortOrder: 0,
    createdAt: null,
    updatedAt: null,
    tags: [],
    heroCarouselImages: null,
    rightColumnBgColor: 'blue',
    rightColumnThumbnailUrl: null,
    postWidgets: null,
  });

  // State for inline tag creation
  const [creatingTag, setCreatingTag] = useState(false);

  const [originalPost, setOriginalPost] = useState<BlogPost | null>(null);

  // Widget state
  const [postWidgets, setPostWidgets] = useState<PostWidget[]>([]);
  const [draggedWidgetType, setDraggedWidgetType] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [expandedWidgetId, setExpandedWidgetId] = useState<string | null>(null);

  // Fetch default author settings for new posts
  const fetchDefaultAuthor = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const settings = await res.json();
      if (settings.defaultBlogAuthorName || settings.defaultBlogAuthorAvatarUrl) {
        setPost((prev) => ({
          ...prev,
          authorName: settings.defaultBlogAuthorName || prev.authorName,
          authorAvatarUrl: settings.defaultBlogAuthorAvatarUrl || prev.authorAvatarUrl,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch default author settings:', error);
    }
  };

  useEffect(() => {
    fetchTags();
    if (isNew) {
      fetchDefaultAuthor();
    } else {
      fetchPost();
    }
  }, [id, isNew]);

  // Parse widgets from post when post changes
  useEffect(() => {
    if (post.postWidgets) {
      try {
        const parsed = JSON.parse(post.postWidgets);
        setPostWidgets(parsed);
      } catch {
        setPostWidgets([]);
      }
    } else {
      setPostWidgets([]);
    }
  }, [post.postWidgets]);

  // Sync widgets back to post state
  const updatePostWidgets = (widgets: PostWidget[]) => {
    setPostWidgets(widgets);
    setPost(prev => ({
      ...prev,
      postWidgets: widgets.length > 0 ? JSON.stringify(widgets) : null
    }));
  };

  // Widget handlers
  const handleAddWidget = (type: string, index?: number) => {
    const widgetDef = WIDGET_TYPES.find(w => w.type === type);
    if (!widgetDef) return;

    const newWidget: PostWidget = {
      id: `widget-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      visible: true,
      config: {},
    };

    const newWidgets = [...postWidgets];
    if (index !== undefined) {
      newWidgets.splice(index, 0, newWidget);
    } else {
      newWidgets.push(newWidget);
    }
    updatePostWidgets(newWidgets);
  };

  const handleDeleteWidget = (id: string) => {
    updatePostWidgets(postWidgets.filter(w => w.id !== id));
  };

  const handleToggleWidgetVisibility = (id: string) => {
    updatePostWidgets(postWidgets.map(w =>
      w.id === id ? { ...w, visible: !w.visible } : w
    ));
  };

  const handleUpdateWidget = (id: string, updates: Partial<PostWidget>) => {
    updatePostWidgets(postWidgets.map(w =>
      w.id === id ? { ...w, ...updates } : w
    ));
  };

  const handleWidgetDrop = (index: number) => {
    if (draggedWidgetType) {
      handleAddWidget(draggedWidgetType, index);
    }
    setDraggedWidgetType(null);
    setDropTargetIndex(null);
  };

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}`);
      if (!res.ok) throw new Error('Post not found');
      const data = await res.json();
      setPost(data);
      setOriginalPost(data);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      router.push('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/blog/tags');
      const data = await res.json();
      setAllTags(data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = isNew ? 'POST' : 'PATCH';
      const url = isNew ? '/api/admin/blog/posts' : `/api/admin/blog/posts/${id}`;

      const body = {
        ...post,
        tagIds: post.tags?.map((t) => t.id) || [],
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save');

      const savedPost = await res.json();

      if (isNew) {
        router.push(`/admin/blog/${savedPost.id}`);
      } else {
        setPost(savedPost);
        setOriginalPost(savedPost);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;

    try {
      await fetch(`/api/admin/blog/posts/${id}`, { method: 'DELETE' });
      router.push('/admin/blog');
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleAddTag = (tag: BlogTag) => {
    if (!post.tags?.find((t) => t.id === tag.id)) {
      setPost((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
    }
    setShowTagSearch(false);
    setTagSearch('');
  };

  const handleRemoveTag = (tagId: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t.id !== tagId) || [],
    }));
  };

  const handleCreateTag = async (name: string) => {
    setCreatingTag(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const res = await fetch('/api/admin/blog/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, color: '#bbdae9' }),
      });
      if (res.ok) {
        const newTag = await res.json();
        setAllTags((prev) => [...prev, newTag]);
        handleAddTag(newTag);
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setCreatingTag(false);
      setTagSearch('');
      setShowTagSearch(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagSearch.trim()) {
      e.preventDefault();
      // Check if exact match exists
      const exactMatch = allTags.find(t => t.name.toLowerCase() === tagSearch.trim().toLowerCase());
      if (exactMatch && !post.tags?.find(t => t.id === exactMatch.id)) {
        handleAddTag(exactMatch);
      } else if (!exactMatch) {
        handleCreateTag(tagSearch.trim());
      }
    }
  };

  // Auto-populate slug from title
  const handleTitleChange = (newTitle: string) => {
    setPost((prev) => {
      const newSlug = isNew || !prev.slug
        ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : prev.slug;
      return { ...prev, title: newTitle, slug: newSlug };
    });
  };

  const filteredTags = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !post.tags?.find((t) => t.id === tag.id)
  );

  // Track unsaved changes
  const hasChanges = originalPost
    ? JSON.stringify(post) !== JSON.stringify(originalPost)
    : isNew && post.title;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Draft Mode Banner */}
      {post.status === 'draft' && !isNew && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-400">This Post is in Draft Mode</p>
            <p className="text-xs text-orange-400/80">You can preview the blog post in draft mode, but visitors cannot see it.</p>
          </div>
          <button
            onClick={() => setPost((prev) => ({ ...prev, status: 'published' }))}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Publish Now
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link
            href="/admin/blog"
            className="p-2 rounded-lg hover:bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-medium text-[var(--admin-text-primary)] truncate max-w-[400px]" title={isNew ? 'New Blog Post' : post.title || 'Untitled Post'}>
              {isNew ? 'New Blog Post' : post.title || 'Untitled Post'}
            </h1>
            {!isNew && post.slug && (
              <p className="text-sm text-[var(--admin-text-muted)] truncate max-w-[400px]">
                /blog/{post.slug}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Draft/Live Toggle */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium transition-colors",
              post.status === 'draft' ? "text-orange-400" : "text-[var(--admin-text-muted)]"
            )}>
              Draft
            </span>
            <button
              onClick={() => setPost((prev) => ({
                ...prev,
                status: prev.status === 'published' ? 'draft' : 'published',
              }))}
              className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--admin-bg)]"
              style={{
                backgroundColor: post.status === 'draft' ? '#f97316' : '#22c55e'
              }}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-lg",
                  post.status === 'draft' ? "translate-x-1" : "translate-x-8"
                )}
              />
            </button>
            <span className={cn(
              "text-sm font-medium transition-colors",
              post.status === 'published' ? "text-green-400" : "text-[var(--admin-text-muted)]"
            )}>
              Live
            </span>
          </div>

          {/* View Live / View Draft buttons */}
          {!isNew && post.slug && (
            <a
              href={post.status === 'published' ? `/blog/${post.slug}` : `/blog/${post.slug}?preview=true`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                post.status === 'published'
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              )}
            >
              <Eye className="w-4 h-4" />
              {post.status === 'published' ? 'View Live' : 'View Draft'}
            </a>
          )}

          {/* Save Button */}
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving || !post.title}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all',
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-[var(--primary)] text-[var(--admin-button-text)] hover:bg-[var(--primary-dark)]',
                (saving || !post.title) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          )}
          {!isNew && (
            <button
              onClick={handleDeletePost}
              className="p-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Delete Post"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Title, Excerpt, Content */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Title */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">Title</label>
            <input
              type="text"
              value={post.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title..."
              className="w-full text-2xl font-medium bg-transparent text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">
              Preview Text / Excerpt
            </label>
            <p className="text-xs text-[var(--admin-text-muted)] mb-3">
              Short summary shown in blog listings and social shares. If empty, the first paragraph of content is used.
            </p>
            <textarea
              value={post.excerpt || ''}
              onChange={(e) => setPost((prev) => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Write a short preview of your post..."
              rows={3}
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
            />
          </div>

          {/* Content - Rich Text Editor - Fills remaining space */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">Content</label>
            <RichTextEditor
              value={post.content || ''}
              onChange={(content) => setPost((prev) => ({ ...prev, content }))}
              placeholder="Write your blog post content here..."
              minHeight="500px"
            />
          </div>

          {/* Post Widgets Section */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                  <Layers className="w-3.5 h-3.5 inline mr-1.5" />
                  Post Widgets
                </label>
                <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                  Add widgets to appear after the article content
                </p>
              </div>
              <button
                onClick={() => setShowWidgetLibrary(!showWidgetLibrary)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  showWidgetLibrary
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)]'
                )}
              >
                <Plus className="w-4 h-4" />
                {showWidgetLibrary ? 'Close Library' : 'Add Widget'}
              </button>
            </div>

            {/* Widget Library Dropdown */}
            {showWidgetLibrary && (
              <div className="mb-4 border border-[var(--admin-border-light)] rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                <WidgetLibrarySidebar
                  onAddWidget={(type) => {
                    handleAddWidget(type);
                    setShowWidgetLibrary(false);
                  }}
                  onDragStart={setDraggedWidgetType}
                  onDragEnd={() => setDraggedWidgetType(null)}
                  draggedWidgetType={draggedWidgetType}
                  showReorderControls={false}
                  compact
                  title="Select Widget"
                  subtitle="Click to add to post"
                />
              </div>
            )}

            {/* Widget Drop Zone & List */}
            <div
              className={cn(
                'min-h-[100px] rounded-lg border-2 border-dashed transition-colors',
                draggedWidgetType
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                  : 'border-[var(--admin-border-light)]',
                postWidgets.length === 0 && 'flex items-center justify-center'
              )}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const type = e.dataTransfer.getData('widget-type');
                if (type) {
                  handleAddWidget(type);
                  setDraggedWidgetType(null);
                }
              }}
            >
              {postWidgets.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="w-8 h-8 text-[var(--admin-text-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--admin-text-muted)]">
                    {draggedWidgetType ? 'Drop widget here' : 'No widgets added yet'}
                  </p>
                  <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                    Drag from the library or click "Add Widget"
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--admin-border-light)]">
                  {postWidgets.map((widget, index) => {
                    const widgetDef = WIDGET_TYPES.find(w => w.type === widget.type);
                    const Icon = widgetDef?.icon;
                    const isExpanded = expandedWidgetId === widget.id;
                    const config = (widget.config || {}) as Record<string, unknown>;

                    return (
                      <div key={widget.id} className="bg-[var(--admin-input)]">
                        {/* Widget Header - Click to expand */}
                        <div
                          className={cn(
                            'flex items-center gap-3 p-4 transition-colors cursor-pointer',
                            isExpanded ? 'bg-[var(--admin-sidebar)]' : 'hover:bg-[var(--admin-sidebar)]',
                            !widget.visible && 'opacity-60'
                          )}
                          onClick={() => setExpandedWidgetId(isExpanded ? null : widget.id)}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('widget-index', index.toString());
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDropTargetIndex(index);
                          }}
                          onDragLeave={() => setDropTargetIndex(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const fromIndex = parseInt(e.dataTransfer.getData('widget-index'));
                            if (!isNaN(fromIndex) && fromIndex !== index) {
                              const newWidgets = [...postWidgets];
                              const [moved] = newWidgets.splice(fromIndex, 1);
                              newWidgets.splice(index, 0, moved);
                              updatePostWidgets(newWidgets);
                            }
                            setDropTargetIndex(null);
                          }}
                        >
                          <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] cursor-grab" />
                          <span className="text-xs text-[var(--admin-text-muted)] font-mono w-5">{index + 1}</span>
                          {Icon && (
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--admin-text-primary)] truncate">
                              {widgetDef?.name || widget.type}
                            </p>
                            <p className="text-xs text-[var(--admin-text-muted)] truncate">
                              {widgetDef?.description}
                            </p>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Desktop toggle */}
                            <button
                              onClick={() => handleUpdateWidget(widget.id, {
                                config: { ...config, showOnDesktop: config.showOnDesktop !== false ? false : true }
                              })}
                              className={cn(
                                'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all',
                                config.showOnDesktop !== false
                                  ? 'text-green-400 bg-green-500/10'
                                  : 'text-[var(--admin-text-muted)] bg-[var(--admin-input)]'
                              )}
                              title={config.showOnDesktop !== false ? 'Hide on desktop' : 'Show on desktop'}
                            >
                              <Monitor className="w-3.5 h-3.5" />
                            </button>
                            {/* Mobile toggle */}
                            <button
                              onClick={() => handleUpdateWidget(widget.id, {
                                config: { ...config, showOnMobile: config.showOnMobile !== false ? false : true }
                              })}
                              className={cn(
                                'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all',
                                config.showOnMobile !== false
                                  ? 'text-green-400 bg-green-500/10'
                                  : 'text-[var(--admin-text-muted)] bg-[var(--admin-input)]'
                              )}
                              title={config.showOnMobile !== false ? 'Hide on mobile' : 'Show on mobile'}
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                            </button>
                            {/* Visible toggle */}
                            <button
                              onClick={() => handleToggleWidgetVisibility(widget.id)}
                              className={cn(
                                'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all',
                                widget.visible
                                  ? 'text-green-400 bg-green-500/10'
                                  : 'text-amber-400 bg-amber-500/10'
                              )}
                              title={widget.visible ? 'Click to hide' : 'Click to show'}
                            >
                              {widget.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              <span>{widget.visible ? 'Live' : 'Draft'}</span>
                            </button>
                            <div className="w-px h-5 bg-[var(--admin-border)]" />
                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteWidget(widget.id)}
                              className="p-1.5 rounded text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete widget"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {/* Expand/Collapse indicator */}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[var(--admin-text-muted)]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[var(--admin-text-muted)]" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Config Panel - Uses shared component for consistency */}
                        {isExpanded && (
                          <div className="border-t border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
                            <WidgetConfigPanel
                              widget={widget}
                              onUpdate={(updates) => handleUpdateWidget(widget.id, updates)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Settings in order */}
        <div className="space-y-6" ref={rightColumnRef}>
          {/* 1. Right Column Color Style - at top */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">
              Right Column Background
            </label>
            <div className="flex gap-2">
              {[
                { value: 'blue', label: 'Blue', bg: 'bg-[#bad9ea]', text: 'text-[#1a1a1a]' },
                { value: 'white', label: 'White', bg: 'bg-white', text: 'text-[#1a1a1a]' },
                { value: 'black', label: 'Black', bg: 'bg-[#1a1a1a]', text: 'text-white' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPost(prev => ({ ...prev, rightColumnBgColor: option.value }))}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium',
                    option.bg,
                    option.text,
                    post.rightColumnBgColor === option.value
                      ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20'
                      : 'border-transparent hover:border-[var(--admin-border-light)]'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Author Section */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-4">Author</label>

            <div className="flex items-start gap-4">
              {/* Author Avatar */}
              <div className="flex-shrink-0">
                {post.authorAvatarUrl ? (
                  <div className="relative group">
                    <img
                      src={post.authorAvatarUrl}
                      alt="Author"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[var(--admin-border-light)]"
                    />
                    <button
                      onClick={() => setPost(prev => ({ ...prev, authorAvatarUrl: null }))}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[var(--admin-input)] border-2 border-dashed border-[var(--admin-border-light)] flex items-center justify-center">
                    <User className="w-6 h-6 text-[var(--admin-text-muted)]" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={post.authorName || ''}
                  onChange={(e) => setPost((prev) => ({ ...prev, authorName: e.target.value }))}
                  placeholder="Author name"
                  className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
                <MediaPickerButton
                  label=""
                  value={post.authorAvatarUrl}
                  onChange={(url) => setPost((prev) => ({ ...prev, authorAvatarUrl: url || null }))}
                  helpText=""
                  folder="blog/authors"
                  aspectRatio="1/1"
                  buttonText="Upload Avatar"
                  compact
                />
              </div>
            </div>
          </div>

          {/* 2. Title Thumbnail (Optional) - Goes under title on frontend */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <MediaPickerButton
              label="Title Thumbnail (Optional)"
              value={post.rightColumnThumbnailUrl}
              onChange={(url) => setPost((prev) => ({ ...prev, rightColumnThumbnailUrl: url || null }))}
              helpText="Image or video displayed below the title in the right column"
              folder="blog/thumbnails"
              aspectRatio="1/1"
              acceptVideo
            />
          </div>

          {/* 3. Hero Media Section - Media 1-4 */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-2">
              <ImageIcon className="w-3.5 h-3.5 inline mr-1.5" />
              Hero Media (4 max)
            </label>
            <p className="text-xs text-[var(--admin-text-muted)] mb-4">
              Media 1 is the featured hero image/video. Media 2-4 appear as carousel thumbnails.
            </p>
            <div className="space-y-3">
              {[0, 1, 2, 3].map((index) => {
                // Get all media: featuredImageUrl is Media 1, heroCarouselImages are Media 2-4
                const carouselImages: string[] = post.heroCarouselImages ? JSON.parse(post.heroCarouselImages) : [];
                let currentUrl: string | null = null;

                if (index === 0) {
                  currentUrl = post.featuredImageUrl;
                } else {
                  currentUrl = carouselImages[index - 1] || null;
                }

                const isVideo = currentUrl && /\.(mp4|webm|mov)(\?|$)/i.test(currentUrl);
                const mediaLabel = index === 0 ? 'Media 1 - Featured' : `Media ${index + 1}`;

                return (
                  <div key={index} className="flex items-center gap-3">
                    {/* Label */}
                    <div className="w-32 shrink-0">
                      <span className={cn(
                        "text-sm font-medium",
                        index === 0 ? "text-[var(--primary)]" : "text-[var(--admin-text-secondary)]"
                      )}>
                        {mediaLabel}
                      </span>
                      {isVideo && (
                        <span className="ml-1.5 text-xs text-[var(--admin-text-muted)]">
                          <Video className="w-3 h-3 inline" />
                        </span>
                      )}
                    </div>

                    {/* Preview or Upload */}
                    <div className="flex-1">
                      {currentUrl ? (
                        <div className="flex items-center gap-3">
                          <div className="relative w-20 h-20 bg-[var(--admin-input)] rounded-lg overflow-hidden group shrink-0">
                            {isVideo ? (
                              <video src={currentUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                            ) : (
                              <img src={currentUrl} alt={mediaLabel} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[var(--admin-text-muted)] truncate">{currentUrl.split('/').pop()}</p>
                          </div>
                          <button
                            onClick={() => {
                              if (index === 0) {
                                setPost(prev => ({ ...prev, featuredImageUrl: null }));
                              } else {
                                const newImages = [...carouselImages];
                                newImages.splice(index - 1, 1);
                                setPost(prev => ({
                                  ...prev,
                                  heroCarouselImages: newImages.length > 0 ? JSON.stringify(newImages) : null
                                }));
                              }
                            }}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <MediaPickerButton
                          label=""
                          value={null}
                          onChange={(url) => {
                            if (url) {
                              if (index === 0) {
                                setPost(prev => ({ ...prev, featuredImageUrl: url }));
                              } else {
                                const newImages = [...carouselImages];
                                // Ensure we put it in the right slot
                                while (newImages.length < index) {
                                  newImages.push('');
                                }
                                newImages[index - 1] = url;
                                // Filter out empty strings
                                const filtered = newImages.filter(Boolean);
                                setPost(prev => ({
                                  ...prev,
                                  heroCarouselImages: filtered.length > 0 ? JSON.stringify(filtered) : null
                                }));
                              }
                            }
                          }}
                          helpText=""
                          folder="blog/carousel"
                          aspectRatio={index === 0 ? "16/9" : "1/1"}
                          buttonText="Browse / Upload / URL"
                          compact
                          acceptVideo
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Featured Post Toggle */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[var(--admin-text-secondary)]">Featured Post</p>
                <p className="text-xs text-[var(--admin-text-muted)] mt-1">Show as full-width hero on blog page</p>
              </div>
              <button
                onClick={() => setPost((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  post.isFeatured
                    ? 'text-yellow-400 bg-yellow-500/10'
                    : 'text-[var(--admin-text-muted)] hover:text-yellow-400 hover:bg-yellow-500/10'
                )}
              >
                <Star className={cn('w-5 h-5', post.isFeatured && 'fill-yellow-400')} />
              </button>
            </label>
          </div>

          {/* 4. Reading Time & Social Proof */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-4">
            {/* Reading Time */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-2">Reading Time</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={post.readingTime || 5}
                  onChange={(e) =>
                    setPost((prev) => ({ ...prev, readingTime: parseInt(e.target.value) || 5 }))
                  }
                  min={1}
                  className="w-20 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
                <span className="text-sm text-[var(--admin-text-secondary)]">minutes</span>
              </div>
            </div>

            <div className="border-t border-[var(--admin-border-light)] pt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-2">
                Social Proof (Optional)
              </label>
              <p className="text-xs text-[var(--admin-text-muted)] mb-3">
                Engagement metrics shown on article. Leave empty to hide.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--admin-text-secondary)] mb-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Views
                  </label>
                  <input
                    type="number"
                    value={post.viewCount || ''}
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        viewCount: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                    min={0}
                    placeholder="1200"
                    className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--admin-text-secondary)] mb-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    Hearts
                  </label>
                  <input
                    type="number"
                    value={post.heartCount || ''}
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        heartCount: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                    min={0}
                    placeholder="89"
                    className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Tags */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">Tags</label>

            {/* Selected Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color || '#bbdae9',
                    }}
                  >
                    {tag.name}
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Search with Inline Creation */}
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => {
                    setTagSearch(e.target.value);
                    setShowTagSearch(true);
                  }}
                  onFocus={() => setShowTagSearch(true)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type to add tags... (Enter to create)"
                  className="w-full px-4 py-2.5 pl-10 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
              </div>

              {showTagSearch && (tagSearch || filteredTags.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-xl shadow-xl z-10 overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    {/* Create New Tag Option */}
                    {tagSearch.trim() && !allTags.some(t => t.name.toLowerCase() === tagSearch.trim().toLowerCase()) && (
                      <button
                        onClick={() => handleCreateTag(tagSearch.trim())}
                        disabled={creatingTag}
                        className="w-full px-4 py-2.5 text-left hover:bg-[var(--admin-input)] transition-colors flex items-center gap-2 border-b border-[var(--admin-border-light)]"
                      >
                        {creatingTag ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
                        ) : (
                          <Plus className="w-4 h-4 text-[var(--primary)]" />
                        )}
                        <span className="text-sm text-[var(--admin-text-primary)]">
                          Create &ldquo;{tagSearch.trim()}&rdquo;
                        </span>
                      </button>
                    )}
                    {filteredTags.length > 0 ? (
                      filteredTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleAddTag(tag)}
                          className="w-full px-4 py-2.5 text-left hover:bg-[var(--admin-input)] transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color || '#bbdae9' }}
                            />
                            <span className="text-sm text-[var(--admin-text-primary)]">{tag.name}</span>
                          </div>
                          {tag.postCount !== undefined && (
                            <span className="text-xs text-[var(--admin-text-muted)]">
                              ({tag.postCount}) posts
                            </span>
                          )}
                        </button>
                      ))
                    ) : !tagSearch.trim() ? (
                      <div className="px-4 py-3 text-sm text-[var(--admin-text-muted)]">
                        Type to search or create a tag
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* Quick-Apply Tags - Show available tags */}
            {allTags.length > 0 && !showTagSearch && (
              <div className="mt-3 pt-3 border-t border-[var(--admin-border-light)]">
                <p className="text-xs text-[var(--admin-text-muted)] mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {allTags
                    .filter(tag => !post.tags?.find(t => t.id === tag.id))
                    .slice(0, 6)
                    .map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => handleAddTag(tag)}
                        className="px-2.5 py-1 text-xs rounded-full border border-[var(--admin-border-light)] text-[var(--admin-text-secondary)] hover:border-[var(--primary)] hover:text-[var(--admin-text-primary)] transition-colors"
                      >
                        {tag.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Click outside to close */}
            {showTagSearch && (
              <div
                className="fixed inset-0 z-0"
                onClick={() => setShowTagSearch(false)}
              />
            )}
          </div>

          {/* 6. URL Slug */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">URL Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-[var(--admin-text-muted)] text-sm">/blog/</span>
              <input
                type="text"
                value={post.slug}
                onChange={(e) => setPost((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="post-slug"
                className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </div>

          {/* 7. SEO */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
              <Search className="w-3.5 h-3.5 inline mr-1.5" />
              SEO
            </label>

            {/* Meta Title */}
            <div>
              <label className="block text-sm text-[var(--admin-text-secondary)] mb-2">Meta Title</label>
              <input
                type="text"
                value={post.metaTitle || ''}
                onChange={(e) => setPost((prev) => ({ ...prev, metaTitle: e.target.value }))}
                placeholder={post.title || 'SEO title'}
                className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                {(post.metaTitle || post.title || '').length}/60
              </p>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm text-[var(--admin-text-secondary)] mb-2">Meta Description</label>
              <textarea
                value={post.metaDescription || ''}
                onChange={(e) => setPost((prev) => ({ ...prev, metaDescription: e.target.value }))}
                placeholder={post.excerpt || 'SEO description'}
                rows={3}
                className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                {(post.metaDescription || post.excerpt || '').length}/160
              </p>
            </div>

            {/* SEO Preview */}
            <div className="border-t border-[var(--admin-border-light)] pt-4">
              <label className="block text-xs text-[var(--admin-text-muted)] mb-2">Search Preview</label>
              <div className="bg-white rounded-lg p-3 text-left">
                <p className="text-blue-600 text-sm font-medium truncate">
                  {post.metaTitle || post.title || 'Post Title'}
                </p>
                <p className="text-green-700 text-xs truncate">
                  archiesremedies.com/blog/{post.slug || 'post-slug'}
                </p>
                <p className="text-gray-600 text-xs line-clamp-2 mt-0.5">
                  {post.metaDescription || post.excerpt || 'Post description will appear here...'}
                </p>
              </div>
            </div>
          </div>

          {/* Published Date (only for published posts) */}
          {post.status === 'published' && (
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">Published Date</label>
              <input
                type="datetime-local"
                value={post.publishedAt ? post.publishedAt.slice(0, 16) : ''}
                onChange={(e) =>
                  setPost((prev) => ({
                    ...prev,
                    publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                  }))
                }
                className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
