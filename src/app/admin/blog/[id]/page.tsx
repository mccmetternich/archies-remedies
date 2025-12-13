'use client';

import React, { useState, useEffect, use } from 'react';
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
  Calendar,
  Tag,
  Image as ImageIcon,
  FileText,
  Settings,
  Search,
  X,
  ExternalLink,
  Trash2,
  Plus,
  Heart,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { RichTextEditor } from '@/components/admin/rich-text-editor';

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
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export default function BlogPostEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'seo'>('content');
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
  });

  // State for inline tag creation
  const [creatingTag, setCreatingTag] = useState(false);

  const [originalPost, setOriginalPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchTags();
    if (!isNew) {
      fetchPost();
    }
  }, [id, isNew]);

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

  const handlePublish = async () => {
    setPost((prev) => ({ ...prev, status: 'published' }));
    await handleSave();
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="p-2 rounded-lg hover:bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-medium text-[var(--admin-text-primary)]">
              {isNew ? 'New Blog Post' : post.title || 'Untitled Post'}
            </h1>
            <p className="text-sm text-[var(--admin-text-muted)]">
              {post.status === 'published' ? 'Published' : 'Draft'}
              {post.publishedAt && ` on ${new Date(post.publishedAt).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Toggle */}
          <button
            onClick={() =>
              setPost((prev) => ({
                ...prev,
                status: prev.status === 'published' ? 'draft' : 'published',
              }))
            }
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              post.status === 'published'
                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                : 'bg-gray-500/10 text-[var(--admin-text-secondary)] hover:bg-gray-500/20'
            )}
          >
            {post.status === 'published' ? (
              <>
                <Eye className="w-4 h-4" />
                Published
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Draft
              </>
            )}
          </button>

          {/* View Live / View Draft buttons */}
          {!isNew && post.slug && (
            <>
              {post.status === 'published' ? (
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--admin-card)] border border-[var(--admin-border-light)] text-[var(--admin-text-primary)] hover:bg-[var(--admin-hover)] transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Live
                </a>
              ) : (
                <a
                  href={`/blog/${post.slug}?preview=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--admin-card)] border border-[var(--admin-border-light)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] transition-colors"
                >
                  <EyeOff className="w-4 h-4" />
                  View Draft
                </a>
              )}
            </>
          )}

          {/* Save Button */}
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving || !post.title}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all',
                saved
                  ? 'bg-green-500 text-[var(--admin-text-primary)]'
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

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] w-fit">
        <button
          onClick={() => setActiveTab('content')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'content'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
          )}
        >
          <FileText className="w-4 h-4" />
          Content
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'settings'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'seo'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
          )}
        >
          <Search className="w-4 h-4" />
          SEO
        </button>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
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
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Excerpt</label>
              <textarea
                value={post.excerpt || ''}
                onChange={(e) => setPost((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Write a short preview of your post..."
                rows={3}
                className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            </div>

            {/* Content - Rich Text Editor */}
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Content</label>
              <RichTextEditor
                value={post.content || ''}
                onChange={(content) => setPost((prev) => ({ ...prev, content }))}
                placeholder="Write your blog post content here..."
                minHeight="400px"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
              <MediaPickerButton
                label="Featured Image"
                value={post.featuredImageUrl}
                onChange={(url) => setPost((prev) => ({ ...prev, featuredImageUrl: url || null }))}
                helpText="Main image displayed in blog listings and at top of post"
                folder="blog"
                aspectRatio="16/9"
              />
            </div>

            {/* Tags */}
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Tags</label>

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
                <button
                  onClick={() => setShowTagSearch(!showTagSearch)}
                  className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-secondary)] text-left text-sm hover:border-[var(--primary)] transition-colors flex items-center gap-2"
                >
                  <Tag className="w-4 h-4" />
                  Add tags...
                </button>

                {showTagSearch && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-xl shadow-xl z-10 overflow-hidden">
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="Search or create a tag..."
                      className="w-full px-4 py-3 bg-[var(--admin-input)] text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none border-b border-[var(--admin-border-light)]"
                      autoFocus
                    />
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
                            className="w-full px-4 py-2.5 text-left hover:bg-[var(--admin-input)] transition-colors flex items-center gap-2"
                          >
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color || '#bbdae9' }}
                            />
                            <span className="text-sm text-[var(--admin-text-primary)]">{tag.name}</span>
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
            </div>

            {/* Featured Toggle */}
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
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          {/* Slug */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">URL Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-[var(--admin-text-muted)] text-sm">/blog/</span>
              <input
                type="text"
                value={post.slug}
                onChange={(e) => setPost((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="post-slug"
                className="flex-1 px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </div>

          {/* Author */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Author</label>
            <input
              type="text"
              value={post.authorName || ''}
              onChange={(e) => setPost((prev) => ({ ...prev, authorName: e.target.value }))}
              placeholder="Author name"
              className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          {/* Publish Date */}
          {post.status === 'published' && (
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Published Date</label>
              <input
                type="datetime-local"
                value={post.publishedAt ? post.publishedAt.slice(0, 16) : ''}
                onChange={(e) =>
                  setPost((prev) => ({
                    ...prev,
                    publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                  }))
                }
                className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
          )}

          {/* Reading Time */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Reading Time</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={post.readingTime || 5}
                onChange={(e) =>
                  setPost((prev) => ({ ...prev, readingTime: parseInt(e.target.value) || 5 }))
                }
                min={1}
                className="w-24 px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <span className="text-[var(--admin-text-secondary)]">minutes</span>
            </div>
            <p className="text-xs text-[var(--admin-text-muted)] mt-2">
              Auto-calculated based on content, but you can override it
            </p>
          </div>

          {/* Vanity Metrics */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">
              Social Proof (Optional)
            </label>
            <p className="text-xs text-[var(--admin-text-muted)] mb-4">
              Add engagement metrics to display on the article page. Leave empty to hide.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--admin-text-secondary)] mb-2">
                  <BarChart3 className="w-4 h-4" />
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
                  placeholder="e.g., 1200"
                  className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--admin-text-secondary)] mb-2">
                  <Heart className="w-4 h-4" />
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
                  placeholder="e.g., 89"
                  className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="max-w-2xl space-y-6">
          {/* Meta Title */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Meta Title</label>
            <input
              type="text"
              value={post.metaTitle || ''}
              onChange={(e) => setPost((prev) => ({ ...prev, metaTitle: e.target.value }))}
              placeholder={post.title || 'SEO title'}
              className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <p className="text-xs text-[var(--admin-text-muted)] mt-2">
              {(post.metaTitle || post.title || '').length}/60 characters
            </p>
          </div>

          {/* Meta Description */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Meta Description</label>
            <textarea
              value={post.metaDescription || ''}
              onChange={(e) => setPost((prev) => ({ ...prev, metaDescription: e.target.value }))}
              placeholder={post.excerpt || 'SEO description'}
              rows={3}
              className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
            />
            <p className="text-xs text-[var(--admin-text-muted)] mt-2">
              {(post.metaDescription || post.excerpt || '').length}/160 characters
            </p>
          </div>

          {/* SEO Preview */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Search Preview</label>
            <div className="bg-white rounded-lg p-4">
              <p className="text-blue-600 text-lg font-medium truncate">
                {post.metaTitle || post.title || 'Post Title'}
              </p>
              <p className="text-green-700 text-sm truncate">
                archiesremedies.com/blog/{post.slug || 'post-slug'}
              </p>
              <p className="text-[var(--admin-text-muted)] text-sm line-clamp-2 mt-1">
                {post.metaDescription || post.excerpt || 'Post description will appear here...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
