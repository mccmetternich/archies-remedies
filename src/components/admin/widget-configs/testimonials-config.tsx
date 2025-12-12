'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Star,
  User,
  MapPin,
  MessageSquare,
  Check,
  Badge,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';

interface Product {
  id: string;
  name: string;
  slug: string;
}

interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  avatarUrl: string | null;
  rating: number;
  text: string;
  productId: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface TestimonialsConfigProps {
  testimonials: Testimonial[];
  onTestimonialsChange: (testimonials: Testimonial[]) => void;
  products: Product[];
}

/**
 * Testimonials configuration panel.
 * Allows editing testimonials with product association, ratings, and visibility controls.
 */
export function TestimonialsConfig({
  testimonials,
  onTestimonialsChange,
  products,
}: TestimonialsConfigProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // ─────────────────────────────────────────
  // Testimonial Operations
  // ─────────────────────────────────────────

  const addTestimonial = () => {
    const newItem: Testimonial = {
      id: `new-${Date.now()}`,
      name: 'New Reviewer',
      location: null,
      avatarUrl: null,
      rating: 5,
      text: '',
      productId: null,
      isVerified: true,
      isFeatured: false,
      isActive: true,
      sortOrder: testimonials.length,
    };

    onTestimonialsChange([...testimonials, newItem]);
    setExpandedItem(newItem.id);
  };

  const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    onTestimonialsChange(
      testimonials.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteTestimonial = (id: string) => {
    onTestimonialsChange(testimonials.filter((item) => item.id !== id));
    if (expandedItem === id) {
      setExpandedItem(null);
    }
  };

  const reorderTestimonials = (newOrder: Testimonial[]) => {
    const reordered = newOrder.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));
    onTestimonialsChange(reordered);
  };

  return (
    <div className="space-y-4">
      {/* Testimonial List */}
      <Reorder.Group axis="y" values={testimonials} onReorder={reorderTestimonials} className="space-y-3">
        {testimonials.map((item, index) => {
          const isExpanded = expandedItem === item.id;
          const product = item.productId ? products.find((p) => p.id === item.productId) : null;

          return (
            <Reorder.Item key={item.id} value={item} className="list-none">
              <TestimonialCard
                testimonial={item}
                index={index}
                product={product ?? null}
                isExpanded={isExpanded}
                onToggleExpand={() => setExpandedItem(isExpanded ? null : item.id)}
                onUpdate={(updates) => updateTestimonial(item.id, updates)}
                onDelete={() => deleteTestimonial(item.id)}
                products={products}
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* Add Button */}
      <button
        type="button"
        onClick={addTestimonial}
        className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-[var(--admin-border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 text-[var(--admin-text-muted)] hover:text-[var(--primary)] transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add Testimonial</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// Testimonial Card Component
// ─────────────────────────────────────────

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
  product: Product | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<Testimonial>) => void;
  onDelete: () => void;
  products: Product[];
}

function TestimonialCard({
  testimonial,
  index,
  product,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  products,
}: TestimonialCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div
      className={cn(
        'bg-[var(--admin-input)] border rounded-xl overflow-hidden transition-all',
        isExpanded ? 'border-[var(--primary)]' : 'border-[var(--admin-border)]',
        !testimonial.isActive && 'opacity-60'
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

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--admin-hover)] flex-shrink-0">
          {testimonial.avatarUrl ? (
            <Image
              src={testimonial.avatarUrl}
              alt={testimonial.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--admin-text-muted)]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--admin-text-primary)] truncate">
              {testimonial.name || `Testimonial ${index + 1}`}
            </span>
            {testimonial.isFeatured && (
              <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
            {/* Rating Stars */}
            <span className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-3 h-3',
                    star <= testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                  )}
                />
              ))}
            </span>
            {testimonial.location && (
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {testimonial.location}
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          {/* Featured toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ isFeatured: !testimonial.isFeatured });
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              testimonial.isFeatured
                ? 'text-amber-500 bg-amber-50'
                : 'text-[var(--admin-text-muted)] hover:text-amber-500'
            )}
            title={testimonial.isFeatured ? 'Unfeature' : 'Feature'}
          >
            <Star className={cn('w-4 h-4', testimonial.isFeatured && 'fill-current')} />
          </button>

          {/* Active toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ isActive: !testimonial.isActive });
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              testimonial.isActive
                ? 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]'
                : 'text-amber-500 bg-amber-50'
            )}
            title={testimonial.isActive ? 'Active' : 'Inactive'}
          >
            {testimonial.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
              {/* Name & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Name</label>
                  <input
                    type="text"
                    value={testimonial.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder="John D."
                    className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Location</label>
                  <input
                    type="text"
                    value={testimonial.location || ''}
                    onChange={(e) => onUpdate({ location: e.target.value || null })}
                    placeholder="Los Angeles, CA"
                    className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Avatar</label>
                <MediaPickerButton
                  value={testimonial.avatarUrl}
                  onChange={(url) => onUpdate({ avatarUrl: url || null })}
                  label="Upload Avatar"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-2">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => onUpdate({ rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={cn(
                          'w-6 h-6 transition-colors',
                          star <= testimonial.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 hover:text-amber-200'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Testimonial Text */}
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Review Text</label>
                <textarea
                  value={testimonial.text}
                  onChange={(e) => onUpdate({ text: e.target.value })}
                  placeholder="What the customer said about the product..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] resize-none"
                />
              </div>

              {/* Product Association */}
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Product</label>
                <select
                  value={testimonial.productId || ''}
                  onChange={(e) => onUpdate({ productId: e.target.value || null })}
                  className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="">No product (general testimonial)</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-[var(--admin-border)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testimonial.isVerified}
                    onChange={(e) => onUpdate({ isVerified: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <Check className="w-4 h-4 text-[var(--admin-text-muted)]" />
                  <span className="text-sm text-[var(--admin-text-secondary)]">Verified Purchase</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testimonial.isFeatured}
                    onChange={(e) => onUpdate({ isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <Star className="w-4 h-4 text-[var(--admin-text-muted)]" />
                  <span className="text-sm text-[var(--admin-text-secondary)]">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testimonial.isActive}
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
