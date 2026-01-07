'use client';

import React from 'react';
import Link from 'next/link';
import {
  Plus,
  Loader2,
  Eye,
  ExternalLink,
  Save,
  Settings,
  Check,
  FileText,
  TrendingUp,
  FileEdit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlogAdmin } from '@/hooks/use-blog-admin';
import { BlogPostsList } from '@/components/admin/blog/blog-posts-list';
import { BlogPostForm } from '@/components/admin/blog/blog-post-form';

export default function BlogAdminPage() {
  const {
    // Tab state
    activeTab,
    setActiveTab,

    // Data
    posts,
    tags,
    settings,
    setSettings,
    blogWidgets,

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
  } = useBlogAdmin();

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
        <div>
          <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">Blog</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1">
            Configure blog settings and manage posts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Blog Draft/Live Toggle - moved to right side */}
          <div className="flex items-center gap-2 pr-3 border-r border-[var(--admin-border)]">
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

          {/* Save Settings - only shows when changes exist */}
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

          {/* New Blog Post - always visible with hex blue */}
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#bad9ea] text-[var(--foreground)] rounded-lg font-medium hover:bg-[#a5cce0] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Blog Post
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6">
        {isBlogDraft ? (
          // When blog/site is in draft mode, show "Ready" instead of "Live"
          <>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">{publishedCount} Ready to Publish</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-lg">
              <FileEdit className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">{draftCount} Drafts</span>
            </div>
          </>
        ) : (
          // When blog is live, show actual live status
          <>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">{publishedCount} Live Posts</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-lg">
              <FileEdit className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">{draftCount} Drafts</span>
            </div>
          </>
        )}
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
        <BlogPostForm
          posts={posts}
          settings={settings}
          setSettings={setSettings}
          blogWidgets={blogWidgets}
          isBlogDraft={isBlogDraft}
          publishedCount={publishedCount}
          draftCount={draftCount}
          draggedWidgetType={draggedWidgetType}
          setDraggedWidgetType={setDraggedWidgetType}
          dropTargetIndex={dropTargetIndex}
          setDropTargetIndex={setDropTargetIndex}
          expandedWidgetId={expandedWidgetId}
          setExpandedWidgetId={setExpandedWidgetId}
          setActiveTab={setActiveTab}
          handleToggleStatus={handleToggleStatus}
          handleAddWidget={handleAddWidget}
          handleUpdateWidget={handleUpdateWidget}
          handleDeleteWidget={handleDeleteWidget}
          handleWidgetDrop={handleWidgetDrop}
          handleWidgetDragOver={handleWidgetDragOver}
          handleDragOverWidgetRow={handleDragOverWidgetRow}
        />
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <BlogPostsList
          posts={posts}
          filteredPosts={filteredPosts}
          tags={tags}
          settings={settings}
          isBlogDraft={isBlogDraft}
          publishedCount={publishedCount}
          draftCount={draftCount}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedPosts={selectedPosts}
          draggedPost={draggedPost}
          dragOverPost={dragOverPost}
          handleDeletePost={handleDeletePost}
          handleToggleStatus={handleToggleStatus}
          handleBatchDelete={handleBatchDelete}
          handleBatchHide={handleBatchHide}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleDragEnd={handleDragEnd}
          toggleSelectAll={toggleSelectAll}
          toggleSelectPost={toggleSelectPost}
        />
      )}
    </div>
  );
}
