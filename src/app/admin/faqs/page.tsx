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
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/admin/rich-text-editor';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean | null;
  sortOrder: number | null;
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FAQ>>({});

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/admin/faqs');
      const data = await res.json();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqs }),
      });
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    const newItem: FAQ = {
      id: `new-${Date.now()}`,
      question: '',
      answer: '',
      category: 'General',
      isActive: true,
      sortOrder: faqs.length,
    };
    setFaqs([...faqs, newItem]);
    setEditingId(newItem.id);
    setEditForm(newItem);
  };

  const handleEdit = (item: FAQ) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    setFaqs(faqs.map((f) => (f.id === editingId ? { ...f, ...editForm } : f)));
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this FAQ?')) {
      setFaqs(faqs.filter((f) => f.id !== id));
    }
  };

  const handleReorder = (newOrder: FAQ[]) => {
    setFaqs(newOrder.map((faq, index) => ({ ...faq, sortOrder: index })));
  };

  // Group FAQs by category
  const categories = [...new Set(faqs.map((f) => f.category || 'General'))];

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
          <h1 className="text-2xl font-medium">FAQs</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Manage frequently asked questions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            Add FAQ
          </Button>
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            Save All
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border)]">
        <Reorder.Group
          axis="y"
          values={faqs}
          onReorder={handleReorder}
          className="divide-y divide-[var(--border-light)]"
        >
          {faqs.map((faq) => (
            <Reorder.Item
              key={faq.id}
              value={faq}
              className="p-4 flex items-start gap-4 hover:bg-[var(--muted)] transition-colors cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4 text-[var(--muted-foreground)] mt-1" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {faq.category && (
                    <span className="px-2 py-0.5 text-xs bg-[var(--primary-light)] text-[var(--foreground)] rounded-full">
                      {faq.category}
                    </span>
                  )}
                  {!faq.isActive && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
                <h3 className="font-medium">{faq.question || 'Untitled question'}</h3>
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-1 mt-1">
                  {faq.answer?.replace(/<[^>]*>/g, '') || 'No answer'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(faq)}
                  className="p-2 rounded-lg hover:bg-[var(--border-light)] transition-colors"
                >
                  <Edit className="w-4 h-4 text-[var(--muted-foreground)]" />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {faqs.length === 0 && (
          <div className="py-12 text-center">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
            <h3 className="font-medium mb-2">No FAQs yet</h3>
            <Button variant="outline" onClick={handleAdd}>
              <Plus className="w-4 h-4" />
              Add FAQ
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
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto"
          >
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-xl font-medium">Edit FAQ</h2>
              <button onClick={handleCancelEdit} className="p-2 rounded-lg hover:bg-[var(--muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive ?? true}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Input
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    placeholder="General"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <Input
                  value={editForm.question || ''}
                  onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                  placeholder="What makes Archie's different?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Answer</label>
                <RichTextEditor
                  value={editForm.answer || ''}
                  onChange={(value) => setEditForm({ ...editForm, answer: value })}
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
