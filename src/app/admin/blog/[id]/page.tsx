'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Eye,
  EyeOff,
  Star,
  Tag,
  X,
  Plus,
  Heart,
  BarChart3,
  Search,
  User,
  ImageIcon,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { WidgetLibrarySidebar } from '@/components/admin/widget-library-sidebar';
import { WidgetListContainer, useWidgetDragState, useWidgetExpandState } from '@/components/admin/widget-list-container';
import { WIDGET_TYPES } from '@/lib/widget-library';
import { AdminPageHeader } from '@/components/admin/admin-page-header';

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

  // Widget state - using shared hooks for consistency
  const [postWidgets, setPostWidgets] = useState<PostWidget[]>([]);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const { draggedWidgetType, handleDragStart, handleDragEnd } = useWidgetDragState();
  const { expandedWidget, toggleExpand } = useWidgetExpandState();

  // Global site draft mode - if true, entire site is behind coming soon page
  const [siteInDraftMode, setSiteInDraftMode] = useState(false);

  // Fetch default author settings and site draft mode
  const fetchSiteSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const settings = await res.json();
      setSiteInDraftMode(settings.siteInDraftMode ?? false);
      if (isNew && (settings.defaultBlogAuthorName || settings.defaultBlogAuthorAvatarUrl)) {
        setPost((prev) => ({
          ...prev,
          authorName: settings.defaultBlogAuthorName || prev.authorName,
          authorAvatarUrl: settings.defaultBlogAuthorAvatarUrl || prev.authorAvatarUrl,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchSiteSettings();
    if (!isNew) {
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

  // Widget handlers - simplified for shared WidgetListContainer
  const handleAddWidget = (type: string, atIndex?: number) => {
    const widgetDef = WIDGET_TYPES.find(w => w.type === type);
    if (!widgetDef) return;

    const newWidget: PostWidget = {
      id: `widget-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      visible: true,
      config: {},
    };

    const newWidgets = [...postWidgets];
    if (atIndex !== undefined) {
      newWidgets.splice(atIndex, 0, newWidget);
    } else {
      newWidgets.push(newWidget);
    }
    updatePostWidgets(newWidgets);
  };

  const handleDeleteWidget = (id: string) => {
    updatePostWidgets(postWidgets.filter(w => w.id !== id));
    if (expandedWidget === id) {
      toggleExpand(null);
    }
  };

  const handleUpdateWidget = (id: string, updates: Partial<PostWidget>) => {
    updatePostWidgets(postWidgets.map(w =>
      w.id === id ? { ...w, ...updates } : w
    ));
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

  // Handle view with preview token for draft posts
  const handleView = async () => {
    const viewUrl = `/blog/${post.slug}`;
    if (post.status === 'draft') {
      // Generate preview token and open
      try {
        const res = await fetch('/api/admin/preview-token', { method: 'POST' });
        const { token } = await res.json();
        window.open(`${viewUrl}?preview=${token}`, '_blank');
      } catch {
        window.open(`${viewUrl}?preview=true`, '_blank');
      }
    } else {
      window.open(viewUrl, '_blank');
    }
  };

  const isDraft = post.status === 'draft' || siteInDraftMode;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Blog', href: '/admin/blog' },
          { label: isNew ? 'New Post' : (post.title || 'Untitled Post') },
        ]}
        title={isNew ? 'New Blog Post' : (post.title || 'Untitled Post')}
        subtitle={!isNew && post.slug ? `/blog/${post.slug}` : undefined}
        status={isDraft ? 'draft' : 'live'}
        onStatusToggle={() => setPost((prev) => ({
          ...prev,
          status: prev.status === 'published' ? 'draft' : 'published',
        }))}
        statusNote={siteInDraftMode && post.status === 'published' ? '(site draft)' : undefined}
        onView={!isNew && post.slug ? handleView : undefined}
        viewLabel={post.status === 'draft' ? 'Preview' : 'View Live'}
        hasChanges={!!hasChanges}
        onSave={handleSave}
        saving={saving}
        saved={saved}
        saveLabel={isNew ? 'Create Post' : 'Save Changes'}
        showDelete={!isNew}
        onDelete={handleDeletePost}
        deleteLabel="Delete Post"
        backHref="/admin/blog"
      />

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
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  draggedWidgetType={draggedWidgetType}
                  showReorderControls={false}
                  compact
                  title="Select Widget"
                  subtitle="Click to add to post"
                />
              </div>
            )}

            {/* Shared Widget List Container */}
            <WidgetListContainer
              widgets={postWidgets}
              onReorder={updatePostWidgets}
              onAddWidget={handleAddWidget}
              onUpdateWidget={handleUpdateWidget}
              onDeleteWidget={handleDeleteWidget}
              draggedWidgetType={draggedWidgetType}
              onDragEnd={handleDragEnd}
              expandedWidget={expandedWidget}
              onToggleExpand={toggleExpand}
              showDeviceToggles={true}
              showCount={false}
              emptyTitle="No widgets added yet"
              emptyDescription="Drag from the library or click 'Add Widget'"
            />
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
            <div className="space-y-4">
              {/* Media 1 - Featured */}
              <MediaPickerButton
                label="Media 1 - Featured"
                value={post.featuredImageUrl}
                onChange={(url) => setPost((prev) => ({ ...prev, featuredImageUrl: url || null }))}
                helpText=""
                folder="blog/carousel"
                aspectRatio="16/9"
                acceptVideo
              />

              {/* Media 2-4 - Carousel images */}
              {[1, 2, 3].map((index) => {
                const carouselImages: string[] = post.heroCarouselImages ? JSON.parse(post.heroCarouselImages) : [];
                const currentUrl = carouselImages[index - 1] || null;

                return (
                  <MediaPickerButton
                    key={index}
                    label={`Media ${index + 1}`}
                    value={currentUrl}
                    onChange={(url) => {
                      const newImages = [...carouselImages];
                      // Ensure array has enough slots
                      while (newImages.length < index) {
                        newImages.push('');
                      }
                      if (url) {
                        newImages[index - 1] = url;
                      } else {
                        newImages[index - 1] = '';
                      }
                      // Filter out empty strings for storage
                      const filtered = newImages.filter(Boolean);
                      setPost((prev) => ({
                        ...prev,
                        heroCarouselImages: filtered.length > 0 ? JSON.stringify(filtered) : null
                      }));
                    }}
                    helpText=""
                    folder="blog/carousel"
                    aspectRatio="1/1"
                    acceptVideo
                  />
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
