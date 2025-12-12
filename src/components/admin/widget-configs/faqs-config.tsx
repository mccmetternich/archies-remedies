'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  HelpCircle,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface FAQsConfigProps {
  faqs: FAQ[];
  onFAQsChange: (faqs: FAQ[]) => void;
  categories?: string[];
}

/**
 * FAQs configuration panel.
 * Allows editing FAQs with categories, rich text answers, and visibility controls.
 */
export function FAQsConfig({
  faqs,
  onFAQsChange,
  categories = ['General', 'Products', 'Shipping', 'Returns', 'Account'],
}: FAQsConfigProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // ─────────────────────────────────────────
  // FAQ Operations
  // ─────────────────────────────────────────

  const addFAQ = () => {
    const newItem: FAQ = {
      id: `new-${Date.now()}`,
      question: '',
      answer: '',
      category: null,
      isActive: true,
      sortOrder: faqs.length,
    };

    onFAQsChange([...faqs, newItem]);
    setExpandedItem(newItem.id);
  };

  const updateFAQ = (id: string, updates: Partial<FAQ>) => {
    onFAQsChange(faqs.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteFAQ = (id: string) => {
    onFAQsChange(faqs.filter((item) => item.id !== id));
    if (expandedItem === id) {
      setExpandedItem(null);
    }
  };

  const reorderFAQs = (newOrder: FAQ[]) => {
    const reordered = newOrder.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));
    onFAQsChange(reordered);
  };

  // Get unique categories from existing FAQs
  const existingCategories = [...new Set(faqs.map((f) => f.category).filter(Boolean))] as string[];
  const allCategories = [...new Set([...categories, ...existingCategories])];

  return (
    <div className="space-y-4">
      {/* FAQ List */}
      <Reorder.Group axis="y" values={faqs} onReorder={reorderFAQs} className="space-y-3">
        {faqs.map((item, index) => {
          const isExpanded = expandedItem === item.id;

          return (
            <Reorder.Item key={item.id} value={item} className="list-none">
              <FAQCard
                faq={item}
                index={index}
                isExpanded={isExpanded}
                onToggleExpand={() => setExpandedItem(isExpanded ? null : item.id)}
                onUpdate={(updates) => updateFAQ(item.id, updates)}
                onDelete={() => deleteFAQ(item.id)}
                categories={allCategories}
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* Add Button */}
      <button
        type="button"
        onClick={addFAQ}
        className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-[var(--admin-border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 text-[var(--admin-text-muted)] hover:text-[var(--primary)] transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add FAQ</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// FAQ Card Component
// ─────────────────────────────────────────

interface FAQCardProps {
  faq: FAQ;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<FAQ>) => void;
  onDelete: () => void;
  categories: string[];
}

function FAQCard({
  faq,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  categories,
}: FAQCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div
      className={cn(
        'bg-[var(--admin-input)] border rounded-xl overflow-hidden transition-all',
        isExpanded ? 'border-[var(--primary)]' : 'border-[var(--admin-border)]',
        !faq.isActive && 'opacity-60'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--admin-hover)] transition-colors',
          isExpanded && 'border-b border-[var(--admin-border)]'
        )}
        onClick={onToggleExpand}
      >
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-[var(--admin-text-muted)]">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Icon */}
        <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-4 h-4 text-[var(--primary)]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--admin-text-primary)] truncate">
              {faq.question || `FAQ ${index + 1}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
            {faq.category && (
              <span className="flex items-center gap-0.5 bg-[var(--admin-hover)] px-1.5 py-0.5 rounded">
                <Tag className="w-3 h-3" />
                {faq.category}
              </span>
            )}
            {faq.answer && (
              <span className="truncate max-w-[200px]">{faq.answer.substring(0, 50)}...</span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          {/* Active toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ isActive: !faq.isActive });
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              faq.isActive
                ? 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]'
                : 'text-amber-500 bg-amber-50'
            )}
            title={faq.isActive ? 'Active' : 'Inactive'}
          >
            {faq.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (showDeleteConfirm) {
                onDelete();
              } else {
                setShowDeleteConfirm(true);
                setTimeout(() => setShowDeleteConfirm(false), 3000);
              }
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showDeleteConfirm
                ? 'text-white bg-red-500'
                : 'text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-50'
            )}
            title={showDeleteConfirm ? 'Click again to confirm' : 'Delete'}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Expand indicator */}
          <div className="p-1.5 text-[var(--admin-text-muted)]">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-[var(--admin-bg)]">
              {/* Question */}
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Question</label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => onUpdate({ question: e.target.value })}
                  placeholder="What is your question?"
                  className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Answer</label>
                <textarea
                  value={faq.answer}
                  onChange={(e) => onUpdate({ answer: e.target.value })}
                  placeholder="Provide a helpful answer..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] resize-none"
                />
                <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                  Supports basic HTML: &lt;b&gt;, &lt;i&gt;, &lt;a&gt;, &lt;ul&gt;, &lt;li&gt;
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Category</label>
                <select
                  value={faq.category || ''}
                  onChange={(e) => onUpdate({ category: e.target.value || null })}
                  className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Toggle */}
              <div className="pt-2 border-t border-[var(--admin-border)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={faq.isActive}
                    onChange={(e) => onUpdate({ isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <Eye className="w-4 h-4 text-[var(--admin-text-muted)]" />
                  <span className="text-sm text-[var(--admin-text-secondary)]">Active</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
