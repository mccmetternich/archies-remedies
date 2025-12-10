'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Loader2,
  Tag,
  Trash2,
  Edit,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
}

const PRESET_COLORS = [
  '#bbdae9', // Primary
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
];

export default function BlogTagsPage() {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
  const [newTag, setNewTag] = useState({ name: '', description: '', color: '#bbdae9' });
  const [showNewForm, setShowNewForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/blog/tags');
      const data = await res.json();
      setTags(data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/blog/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTag),
      });
      const created = await res.json();
      setTags([...tags, created]);
      setNewTag({ name: '', description: '', color: '#bbdae9' });
      setShowNewForm(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/blog/tags/${editingTag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTag),
      });
      const updated = await res.json();
      setTags(tags.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTag(null);
    } catch (error) {
      console.error('Failed to update tag:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Delete this tag? It will be removed from all posts.')) return;

    try {
      await fetch(`/api/admin/blog/tags/${tagId}`, { method: 'DELETE' });
      setTags(tags.filter((t) => t.id !== tagId));
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

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
            <h1 className="text-xl font-medium text-[var(--admin-text-primary)]">Blog Tags</h1>
            <p className="text-sm text-[var(--admin-text-muted)]">{tags.length} tags</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Tag
        </button>
      </div>

      {/* New Tag Form */}
      {showNewForm && (
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
          <h2 className="text-lg font-medium text-[var(--admin-text-primary)] mb-4">Create New Tag</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Name</label>
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Tag name"
                className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Description (optional)</label>
              <input
                type="text"
                value={newTag.description}
                onChange={(e) => setNewTag((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Tag description"
                className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewTag((prev) => ({ ...prev, color }))}
                    className={cn(
                      'w-8 h-8 rounded-lg transition-all',
                      newTag.color === color && 'ring-2 ring-white ring-offset-2 ring-offset-[var(--admin-card)]'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowNewForm(false);
                  setNewTag({ name: '', description: '', color: '#bbdae9' });
                }}
                className="px-4 py-2 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTag}
                disabled={saving || !newTag.name.trim()}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium transition-colors',
                  (saving || !newTag.name.trim()) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Create Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags List */}
      <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden">
        {tags.length > 0 ? (
          <div className="divide-y divide-[var(--admin-border-light)]">
            {tags.map((tag) => (
              <div key={tag.id}>
                {editingTag?.id === tag.id ? (
                  // Edit Mode
                  <div className="p-4 space-y-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="text"
                        value={editingTag.name}
                        onChange={(e) =>
                          setEditingTag((prev) => prev && { ...prev, name: e.target.value })
                        }
                        className="flex-1 px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <input
                      type="text"
                      value={editingTag.description || ''}
                      onChange={(e) =>
                        setEditingTag((prev) => prev && { ...prev, description: e.target.value })
                      }
                      placeholder="Description"
                      className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() =>
                            setEditingTag((prev) => prev && { ...prev, color })
                          }
                          className={cn(
                            'w-8 h-8 rounded-lg transition-all',
                            editingTag.color === color && 'ring-2 ring-white ring-offset-2 ring-offset-[var(--admin-card)]'
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setEditingTag(null)}
                        className="px-4 py-2 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateTag}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium transition-colors"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between p-4 hover:bg-[var(--admin-input)] transition-colors">
                    <div className="flex items-center gap-4">
                      <span
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color || '#bbdae9' }}
                      />
                      <div>
                        <p className="font-medium text-[var(--admin-text-primary)]">{tag.name}</p>
                        {tag.description && (
                          <p className="text-sm text-[var(--admin-text-muted)]">{tag.description}</p>
                        )}
                        <p className="text-xs text-[var(--admin-text-muted)] mt-1">/{tag.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingTag(tag)}
                        className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-border-light)] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)]" />
            <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-2">No tags yet</h3>
            <p className="text-sm text-[var(--admin-text-muted)] mb-6">
              Create tags to organize your blog posts
            </p>
            <button
              onClick={() => setShowNewForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Tag
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
