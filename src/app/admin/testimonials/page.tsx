'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  Save,
  X,
  Star,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  avatarUrl: string | null;
  rating: number | null;
  text: string;
  isVerified: boolean | null;
  isFeatured: boolean | null;
  isActive: boolean | null;
  sortOrder: number | null;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Testimonial>>({});

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testimonials }),
      });
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    const newItem: Testimonial = {
      id: `new-${Date.now()}`,
      name: '',
      location: '',
      avatarUrl: '',
      rating: 5,
      text: '',
      isVerified: true,
      isFeatured: false,
      isActive: true,
      sortOrder: testimonials.length,
    };
    setTestimonials([...testimonials, newItem]);
    setEditingId(newItem.id);
    setEditForm(newItem);
  };

  const handleEdit = (item: Testimonial) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    setTestimonials(
      testimonials.map((t) => (t.id === editingId ? { ...t, ...editForm } : t))
    );
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this testimonial?')) {
      setTestimonials(testimonials.filter((t) => t.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Testimonials</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Manage customer reviews and testimonials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            Add Testimonial
          </Button>
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            Save All
          </Button>
        </div>
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <div className="divide-y divide-[var(--border-light)]">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-start gap-4 hover:bg-[var(--muted)] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-sm font-medium shrink-0">
                {item.name?.charAt(0) || '?'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium">{item.name || 'Unnamed'}</h3>
                  {item.location && (
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {item.location}
                    </span>
                  )}
                  {item.isVerified && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {item.isFeatured && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                      Featured
                    </span>
                  )}
                  {!item.isActive && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="flex gap-0.5 my-1">
                  {Array.from({ length: item.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 rounded-lg hover:bg-[var(--border-light)] transition-colors"
                >
                  <Edit className="w-4 h-4 text-[var(--muted-foreground)]" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {testimonials.length === 0 && (
          <div className="py-12 text-center">
            <Star className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
            <h3 className="font-medium mb-2">No testimonials yet</h3>
            <Button variant="outline" onClick={handleAdd}>
              <Plus className="w-4 h-4" />
              Add Testimonial
            </Button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleCancelEdit} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[var(--card)] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto"
          >
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-xl font-medium">Edit Testimonial</h2>
              <button onClick={handleCancelEdit} className="p-2 rounded-lg hover:bg-[var(--muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive ?? true}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isVerified ?? true}
                    onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Verified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isFeatured ?? false}
                    onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Featured</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Sarah M."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="Los Angeles, CA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, rating: n })}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          n <= (editForm.rating || 5)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Review Text</label>
                <textarea
                  value={editForm.text || ''}
                  onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                  placeholder="Customer review..."
                  rows={4}
                  className="flex w-full rounded-lg border-[1.5px] border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base transition-all duration-150 placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary-dark)] focus:ring-[3px] focus:ring-[var(--primary-light)] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Avatar URL</label>
                <Input
                  value={editForm.avatarUrl || ''}
                  onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
