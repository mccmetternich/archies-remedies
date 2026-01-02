'use client';

import React from 'react';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  PenSquare,
  Star,
  Settings,
  LayoutGrid,
  List,
  Columns,
  Check,
  FileText,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetLibrarySidebar } from '@/components/admin/widget-library-sidebar';
import { WIDGET_TYPES } from '@/lib/widget-library';
import { MediaPickerButton } from '@/components/admin/media-picker';
import type { BlogPost, BlogSettings, BlogWidget } from '@/hooks/use-blog-admin';

const LAYOUT_OPTIONS = [
  { value: 'bento', label: 'Bento Grid', icon: LayoutGrid, description: 'Editorial layout with varied card sizes' },
  { value: 'grid', label: 'Uniform Grid', icon: Columns, description: 'Equal-sized cards in a grid' },
  { value: 'list', label: 'List', icon: List, description: 'Full-width cards in a vertical list' },
];

interface BlogPostFormProps {
  posts: BlogPost[];
  settings: BlogSettings;
  setSettings: (settings: BlogSettings) => void;
  blogWidgets: BlogWidget[];
  isBlogDraft: boolean;
  publishedCount: number;
  draftCount: number;
  draggedWidgetType: string | null;
  setDraggedWidgetType: (type: string | null) => void;
  dropTargetIndex: number | null;
  setDropTargetIndex: (index: number | null) => void;
  expandedWidgetId: string | null;
  setExpandedWidgetId: (id: string | null) => void;
  setActiveTab: (tab: 'settings' | 'posts') => void;
  handleToggleStatus: (post: BlogPost) => void;
  handleAddWidget: (type: string, atIndex?: number) => void;
  handleUpdateWidget: (widgetId: string, updates: Partial<BlogWidget>) => void;
  handleDeleteWidget: (widgetId: string) => void;
  handleWidgetDrop: (e: React.DragEvent<HTMLDivElement>, atIndex?: number) => void;
  handleWidgetDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOverWidgetRow: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
}

export function BlogPostForm({
  posts,
  settings,
  setSettings,
  blogWidgets,
  isBlogDraft,
  publishedCount,
  draftCount,
  draggedWidgetType,
  setDraggedWidgetType,
  dropTargetIndex,
  setDropTargetIndex,
  expandedWidgetId,
  setExpandedWidgetId,
  setActiveTab,
  handleToggleStatus,
  handleAddWidget,
  handleUpdateWidget,
  handleDeleteWidget,
  handleWidgetDrop,
  handleWidgetDragOver,
  handleDragOverWidgetRow,
}: BlogPostFormProps) {
  return (
    <div className="space-y-6">
      {/* Two Column Layout: Recent Posts (left) + Settings (right) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Recent Posts */}
        <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--admin-border)]">
            <div>
              <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                Recent Posts
              </h2>
              <p className="text-xs text-[var(--admin-text-muted)]">
                {posts.length} total &bull; {publishedCount} {isBlogDraft ? 'ready' : 'live'} &bull; {draftCount} drafts
              </p>
            </div>
            <button
              onClick={() => setActiveTab('posts')}
              className="text-sm text-[var(--primary)] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-[var(--admin-border)] max-h-[600px] overflow-y-auto">
            {posts.slice(0, 10).map((post) => {
              const isVideo = post.featuredImageUrl && /\.(mp4|webm|mov)(\?|$)/i.test(post.featuredImageUrl);
              return (
                <div
                  key={post.id}
                  className="flex items-center gap-3 p-3 hover:bg-[var(--admin-hover)] transition-colors"
                >
                  <Link href={`/admin/blog/${post.id}`} className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--admin-input)] shrink-0">
                    {post.featuredImageUrl ? (
                      isVideo ? (
                        <video
                          src={post.featuredImageUrl}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={post.featuredImageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PenSquare className="w-5 h-5 text-[var(--admin-text-muted)]" />
                      </div>
                    )}
                  </Link>
                  <Link href={`/admin/blog/${post.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[var(--admin-text-primary)] truncate" title={post.title}>
                        {post.title && post.title.length > 36 ? `${post.title.substring(0, 36)}...` : post.title || 'Untitled'}
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
                    <button
                      onClick={() => handleToggleStatus(post)}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
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
                      className="p-1.5 rounded-md text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)] transition-colors"
                      title={post.status === 'published' && !isBlogDraft ? 'View Live' : 'Preview Draft'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
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

        {/* Right Column - Basic Settings */}
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
                Blog name, URL, and page design
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
                onChange={(e) => setSettings({ ...settings, blogName: e.target.value, pageTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                placeholder="AR Magazine"
              />
              <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">
                Used as the page title on your blog homepage
              </p>
            </div>

            {/* Subtitle - moved under Blog Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Subtitle (Optional)
              </label>
              <input
                type="text"
                value={settings.heroSubtitle || ''}
                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value || null, pageSubtitle: e.target.value || '' })}
                className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                placeholder="Stories, tips, and inspiration"
              />
              <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">
                Displayed below the blog name
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

            {/* Homepage Header Section */}
            <div className="pt-6 border-t border-[var(--admin-border)]">
              <h3 className="text-sm font-semibold text-[var(--admin-text-primary)] mb-4">
                Homepage Header
              </h3>
              <p className="text-xs text-[var(--admin-text-muted)] mb-4">
                Add a hero image/video for a full-screen header, or leave empty for a simple title header
              </p>

              <div className="space-y-4">
                {/* Hero Media Upload */}
                <div>
                  <MediaPickerButton
                    label="Hero Media (Optional)"
                    value={settings.heroMediaUrl}
                    onChange={(url) => setSettings({ ...settings, heroMediaUrl: url || null })}
                    helpText="Desktop: 1920x800px (21:9) - Mobile: 1080x1350px (4:5)"
                    folder="blog/hero"
                    aspectRatio="21/9"
                    acceptVideo
                  />
                </div>
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
                  const isExpanded = expandedWidgetId === widget.id;
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
                          'rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input)] transition-all overflow-hidden',
                          'hover:border-[var(--admin-border-light)]',
                          isExpanded && 'border-[var(--primary)]'
                        )}
                      >
                        {/* Widget Header */}
                        <div
                          className="flex items-center gap-3 p-4 cursor-pointer"
                          onClick={() => setExpandedWidgetId(isExpanded ? null : widget.id)}
                        >
                          <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] cursor-grab" onClick={(e) => e.stopPropagation()} />
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
                            onClick={(e) => { e.stopPropagation(); handleUpdateWidget(widget.id, { isVisible: !widget.isVisible }); }}
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
                            onClick={(e) => { e.stopPropagation(); handleDeleteWidget(widget.id); }}
                            className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete widget"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[var(--admin-text-muted)]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[var(--admin-text-muted)]" />
                          )}
                        </div>

                        {/* Expandable Edit Panel */}
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-[var(--admin-border)] pt-4 space-y-4">
                            {/* Title Field - All widgets have this */}
                            <div>
                              <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                                Widget Title
                              </label>
                              <input
                                type="text"
                                value={widget.title || ''}
                                onChange={(e) => handleUpdateWidget(widget.id, { title: e.target.value })}
                                placeholder={widgetDef?.name || 'Widget title'}
                                className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                              />
                            </div>

                            {/* Subtitle Field */}
                            <div>
                              <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                                Subtitle (Optional)
                              </label>
                              <input
                                type="text"
                                value={widget.subtitle || ''}
                                onChange={(e) => handleUpdateWidget(widget.id, { subtitle: e.target.value })}
                                placeholder="Optional subtitle"
                                className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                              />
                            </div>

                            {/* Widget-specific fields */}
                            {(widget.type === 'image-text' || widget.type === 'hero-carousel' || widget.type === 'full-width-image') && (
                              <div>
                                <MediaPickerButton
                                  label="Image/Video"
                                  value={(widget.config as { imageUrl?: string })?.imageUrl || null}
                                  onChange={(url) => handleUpdateWidget(widget.id, { config: { ...widget.config, imageUrl: url } })}
                                  helpText="Select or upload media"
                                  folder="blog/widgets"
                                  aspectRatio="16/9"
                                  acceptVideo
                                />
                              </div>
                            )}

                            {(widget.type === 'image-text' || widget.type === 'text-block' || widget.type === 'cta-banner') && (
                              <div>
                                <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                                  Content Text
                                </label>
                                <textarea
                                  value={widget.content || ''}
                                  onChange={(e) => handleUpdateWidget(widget.id, { content: e.target.value })}
                                  placeholder="Enter content text..."
                                  rows={4}
                                  className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] resize-none"
                                />
                              </div>
                            )}

                            {(widget.type === 'cta-banner' || widget.type === 'newsletter-signup') && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                                    Button Text
                                  </label>
                                  <input
                                    type="text"
                                    value={(widget.config as { buttonText?: string })?.buttonText || ''}
                                    onChange={(e) => handleUpdateWidget(widget.id, { config: { ...widget.config, buttonText: e.target.value } })}
                                    placeholder="Shop Now"
                                    className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                                    Button Link
                                  </label>
                                  <input
                                    type="text"
                                    value={(widget.config as { buttonLink?: string })?.buttonLink || ''}
                                    onChange={(e) => handleUpdateWidget(widget.id, { config: { ...widget.config, buttonLink: e.target.value } })}
                                    placeholder="/products"
                                    className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                                  />
                                </div>
                              </div>
                            )}

                            {widget.type === 'testimonials' && (
                              <div className="space-y-3">
                                <label className="block text-xs font-medium text-[var(--admin-text-muted)]">
                                  Display Options
                                </label>
                                <div className="flex items-center gap-4">
                                  <label className="flex items-center gap-2 text-sm text-[var(--admin-text-secondary)]">
                                    <input
                                      type="checkbox"
                                      checked={(widget.config as { showRating?: boolean })?.showRating !== false}
                                      onChange={(e) => handleUpdateWidget(widget.id, { config: { ...widget.config, showRating: e.target.checked } })}
                                      className="rounded border-[var(--admin-border)]"
                                    />
                                    Show Rating Stars
                                  </label>
                                  <label className="flex items-center gap-2 text-sm text-[var(--admin-text-secondary)]">
                                    <input
                                      type="checkbox"
                                      checked={(widget.config as { autoRotate?: boolean })?.autoRotate !== false}
                                      onChange={(e) => handleUpdateWidget(widget.id, { config: { ...widget.config, autoRotate: e.target.checked } })}
                                      className="rounded border-[var(--admin-border)]"
                                    />
                                    Auto-Rotate
                                  </label>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                                    Number of Testimonials
                                  </label>
                                  <select
                                    value={(widget.config as { count?: number })?.count || 3}
                                    onChange={(e) => handleUpdateWidget(widget.id, { config: { ...widget.config, count: parseInt(e.target.value) } })}
                                    className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                                  >
                                    <option value={3}>3 testimonials</option>
                                    <option value={5}>5 testimonials</option>
                                    <option value={10}>10 testimonials</option>
                                    <option value={0}>All testimonials</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            {widget.type === 'featured-products' && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                                    Number of Products
                                  </label>
                                  <select
                                    value={(widget.config as { count?: number })?.count || 4}
                                    onChange={(e) => handleUpdateWidget(widget.id, { config: { ...widget.config, count: parseInt(e.target.value) } })}
                                    className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                                  >
                                    <option value={2}>2 products</option>
                                    <option value={3}>3 products</option>
                                    <option value={4}>4 products</option>
                                    <option value={6}>6 products</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            {widget.type === 'instagram-feed' && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                                    Instagram Handle
                                  </label>
                                  <input
                                    type="text"
                                    value={(widget.config as { handle?: string })?.handle || ''}
                                    onChange={(e) => handleUpdateWidget(widget.id, { config: { ...widget.config, handle: e.target.value } })}
                                    placeholder="@archiesremedies"
                                    className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                                    Number of Posts
                                  </label>
                                  <select
                                    value={(widget.config as { count?: number })?.count || 6}
                                    onChange={(e) => handleUpdateWidget(widget.id, { config: { ...widget.config, count: parseInt(e.target.value) } })}
                                    className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                                  >
                                    <option value={4}>4 posts</option>
                                    <option value={6}>6 posts</option>
                                    <option value={8}>8 posts</option>
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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
  );
}
