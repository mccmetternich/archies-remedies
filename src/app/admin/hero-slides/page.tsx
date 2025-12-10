'use client';

import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  Plus,
  Loader2,
  GripVertical,
  Edit,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeroSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  secondaryButtonText: string | null;
  secondaryButtonUrl: string | null;
  secondaryButtonType: string | null;
  secondaryAnchorTarget: string | null;
  imageUrl: string;
  testimonialText: string | null;
  testimonialAuthor: string | null;
  testimonialAvatarUrl: string | null;
  isActive: boolean | null;
  sortOrder: number | null;
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<HeroSlide>>({});

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/admin/hero-slides');
      const data = await res.json();
      setSlides(data);
    } catch (error) {
      console.error('Failed to fetch slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/hero-slides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides }),
      });
    } catch (error) {
      console.error('Failed to save slides:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const newSlide: HeroSlide = {
      id: `new-${Date.now()}`,
      title: 'New Slide',
      subtitle: '',
      buttonText: 'Shop Now',
      buttonUrl: '/products/eye-drops',
      secondaryButtonText: 'Or Learn More',
      secondaryButtonUrl: '/about',
      secondaryButtonType: 'page',
      secondaryAnchorTarget: null,
      imageUrl: '',
      testimonialText: '',
      testimonialAuthor: '',
      testimonialAvatarUrl: '',
      isActive: true,
      sortOrder: slides.length,
    };
    setSlides([...slides, newSlide]);
    setEditingId(newSlide.id);
    setEditForm(newSlide);
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setEditForm({ ...slide });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    setSlides(
      slides.map((s) => (s.id === editingId ? { ...s, ...editForm } : s))
    );
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this slide?')) {
      setSlides(slides.filter((s) => s.id !== id));
    }
  };

  const handleReorder = (newOrder: HeroSlide[]) => {
    setSlides(newOrder.map((slide, index) => ({ ...slide, sortOrder: index })));
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Hero Slides</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Manage homepage carousel slides
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            Add Slide
          </Button>
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            Save Order
          </Button>
        </div>
      </div>

      {/* Slides List */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <Reorder.Group
          axis="y"
          values={slides}
          onReorder={handleReorder}
          className="divide-y divide-[var(--border-light)]"
        >
          {slides.map((slide) => (
            <Reorder.Item
              key={slide.id}
              value={slide}
              className="p-4 flex items-center gap-4 hover:bg-[var(--muted)] transition-colors cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4 text-[var(--muted-foreground)]" />

              {/* Preview */}
              <div className="w-24 h-16 rounded-lg bg-[var(--secondary)] flex items-center justify-center shrink-0 overflow-hidden">
                {slide.imageUrl ? (
                  <img
                    src={slide.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-[var(--muted-foreground)]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{slide.title || 'Untitled'}</h3>
                  {!slide.isActive && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-1">
                  {slide.subtitle || 'No subtitle'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(slide)}
                  className="p-2 rounded-lg hover:bg-[var(--border-light)] transition-colors"
                >
                  <Edit className="w-4 h-4 text-[var(--muted-foreground)]" />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {slides.length === 0 && (
          <div className="py-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
            <h3 className="font-medium mb-2">No slides yet</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Add your first hero slide
            </p>
            <Button variant="outline" onClick={handleAdd}>
              <Plus className="w-4 h-4" />
              Add Slide
            </Button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleCancelEdit}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[var(--card)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto"
          >
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-xl font-medium">Edit Slide</h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 rounded-lg hover:bg-[var(--muted)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive ?? true}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isActive: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[var(--card)] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
                <span className="font-medium">Active</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    value={editForm.title || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    placeholder="Safe, Dry Eye Relief"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle</label>
                  <Input
                    value={editForm.subtitle || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, subtitle: e.target.value })
                    }
                    placeholder="Made clean without..."
                  />
                </div>
              </div>

              {/* Primary Button */}
              <div className="border-t border-[var(--border-light)] pt-4 mt-4">
                <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-4">Primary Button</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Button Text</label>
                    <Input
                      value={editForm.buttonText || ''}
                      onChange={(e) =>
                        setEditForm({ ...editForm, buttonText: e.target.value })
                      }
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Button URL</label>
                    <Input
                      value={editForm.buttonUrl || ''}
                      onChange={(e) =>
                        setEditForm({ ...editForm, buttonUrl: e.target.value })
                      }
                      placeholder="/products/eye-drops"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Button */}
              <div className="border-t border-[var(--border-light)] pt-4 mt-4">
                <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-4">Secondary Button</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Button Text</label>
                    <Input
                      value={editForm.secondaryButtonText || ''}
                      onChange={(e) =>
                        setEditForm({ ...editForm, secondaryButtonText: e.target.value })
                      }
                      placeholder="Or Learn More"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Button Type</label>
                    <select
                      value={editForm.secondaryButtonType || 'page'}
                      onChange={(e) =>
                        setEditForm({ ...editForm, secondaryButtonType: e.target.value })
                      }
                      className="flex w-full rounded-lg border-[1.5px] border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base transition-all duration-150 focus:outline-none focus:border-[var(--primary-dark)] focus:ring-[3px] focus:ring-[var(--primary-light)]"
                    >
                      <option value="page">Link to Page</option>
                      <option value="anchor">Jump to Widget (Anchor)</option>
                      <option value="external">External URL</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">
                    {editForm.secondaryButtonType === 'anchor'
                      ? 'Anchor Target (e.g., /products/eye-drops#benefits)'
                      : 'Button URL'}
                  </label>
                  <Input
                    value={editForm.secondaryButtonType === 'anchor'
                      ? (editForm.secondaryAnchorTarget || '')
                      : (editForm.secondaryButtonUrl || '')}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        ...(editForm.secondaryButtonType === 'anchor'
                          ? { secondaryAnchorTarget: e.target.value }
                          : { secondaryButtonUrl: e.target.value })
                      })
                    }
                    placeholder={editForm.secondaryButtonType === 'anchor'
                      ? '/products/eye-drops#benefits'
                      : '/about'}
                  />
                </div>
              </div>

              {/* Image */}
              <div className="border-t border-[var(--border-light)] pt-4 mt-4">
                <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-4">Background Image</h3>
                <Input
                  value={editForm.imageUrl || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              {/* Testimonial */}
              <div className="border-t border-[var(--border-light)] pt-4 mt-4">
                <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-4">Testimonial Card</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Testimonial Quote</label>
                  <textarea
                    value={editForm.testimonialText || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, testimonialText: e.target.value })
                    }
                    placeholder='"Clean, gentle and highly effective..."'
                    rows={2}
                    className="flex w-full rounded-lg border-[1.5px] border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base transition-all duration-150 placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary-dark)] focus:ring-[3px] focus:ring-[var(--primary-light)] resize-none"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Author Name</label>
                    <Input
                      value={editForm.testimonialAuthor || ''}
                      onChange={(e) =>
                        setEditForm({ ...editForm, testimonialAuthor: e.target.value })
                      }
                      placeholder="Sarah M., Verified Buyer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Avatar Image URL</label>
                    <Input
                      value={editForm.testimonialAvatarUrl || ''}
                      onChange={(e) =>
                        setEditForm({ ...editForm, testimonialAvatarUrl: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
