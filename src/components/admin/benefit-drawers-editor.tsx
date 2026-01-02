'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { nanoid } from 'nanoid';

// ============================================
// TYPES
// ============================================

export interface BenefitDrawer {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface BenefitDrawersEditorProps {
  drawers: BenefitDrawer[];
  onChange: (drawers: BenefitDrawer[]) => void;
  maxDrawers?: number;
}

interface SortableDrawerItemProps {
  drawer: BenefitDrawer;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateTitle: (title: string) => void;
  onUpdateContent: (content: string) => void;
  onDelete: () => void;
  canDelete: boolean;
}

// ============================================
// SORTABLE DRAWER ITEM
// ============================================

function SortableDrawerItem({
  drawer,
  index,
  isExpanded,
  onToggleExpand,
  onUpdateTitle,
  onUpdateContent,
  onDelete,
  canDelete,
}: SortableDrawerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: drawer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl overflow-hidden',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      {/* Drawer Header - Always visible */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag Handle */}
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Drawer Number & Title Preview */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex-1 flex items-center gap-3 text-left"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-xs font-semibold flex-shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-[var(--admin-text-primary)] truncate">
            {drawer.title || `Drawer ${index + 1}`}
          </span>
        </button>

        {/* Delete Button */}
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete drawer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Expand/Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="p-1.5 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Drawer Content - Collapsible */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[var(--admin-border)]">
          <div className="pt-4">
            {/* Title Input */}
            <div>
              <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={drawer.title}
                onChange={(e) => onUpdateTitle(e.target.value)}
                placeholder="e.g., The Ritual, Ingredients, Good to Know"
                className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            {/* Content Editor */}
            <div className="mt-4">
              <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">
                Content
              </label>
              <RichTextEditor
                value={drawer.content}
                onChange={onUpdateContent}
                placeholder="Enter drawer content..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function BenefitDrawersEditor({
  drawers,
  onChange,
  maxDrawers = 5,
}: BenefitDrawersEditorProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = drawers.findIndex((d) => d.id === active.id);
      const newIndex = drawers.findIndex((d) => d.id === over.id);

      const reordered = arrayMove(drawers, oldIndex, newIndex).map((d, i) => ({
        ...d,
        order: i,
      }));

      onChange(reordered);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addDrawer = () => {
    if (drawers.length >= maxDrawers) return;

    const newDrawer: BenefitDrawer = {
      id: nanoid(),
      title: '',
      content: '',
      order: drawers.length,
    };

    onChange([...drawers, newDrawer]);
    // Auto-expand the new drawer
    setExpandedIds((prev) => new Set(prev).add(newDrawer.id));
  };

  const deleteDrawer = (id: string) => {
    const filtered = drawers
      .filter((d) => d.id !== id)
      .map((d, i) => ({ ...d, order: i }));
    onChange(filtered);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const updateDrawerTitle = (id: string, title: string) => {
    onChange(drawers.map((d) => (d.id === id ? { ...d, title } : d)));
  };

  const updateDrawerContent = (id: string, content: string) => {
    onChange(drawers.map((d) => (d.id === id ? { ...d, content } : d)));
  };

  return (
    <div className="space-y-3">
      {/* Drawer List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={drawers.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {drawers.map((drawer, index) => (
              <SortableDrawerItem
                key={drawer.id}
                drawer={drawer}
                index={index}
                isExpanded={expandedIds.has(drawer.id)}
                onToggleExpand={() => toggleExpand(drawer.id)}
                onUpdateTitle={(title) => updateDrawerTitle(drawer.id, title)}
                onUpdateContent={(content) => updateDrawerContent(drawer.id, content)}
                onDelete={() => deleteDrawer(drawer.id)}
                canDelete={drawers.length > 0}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Drawer Button */}
      {drawers.length < maxDrawers && (
        <button
          type="button"
          onClick={addDrawer}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--admin-border)] rounded-xl text-sm font-medium text-[var(--admin-text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Drawer ({drawers.length}/{maxDrawers})
        </button>
      )}

      {/* Empty State */}
      {drawers.length === 0 && (
        <p className="text-center text-sm text-[var(--admin-text-muted)] py-4">
          No drawers added yet. Click &quot;Add Drawer&quot; to create expandable content sections.
        </p>
      )}
    </div>
  );
}

// ============================================
// HELPER: Parse legacy drawer data into new format
// ============================================

export function migrateLegacyDrawers(product: {
  ritualTitle?: string | null;
  ritualContent?: string | null;
  ingredientsTitle?: string | null;
  ingredientsContent?: string | null;
  shippingTitle?: string | null;
  shippingContent?: string | null;
}): BenefitDrawer[] {
  const drawers: BenefitDrawer[] = [];

  // Only add drawers that have content
  if (product.ritualTitle || product.ritualContent) {
    drawers.push({
      id: nanoid(),
      title: product.ritualTitle || 'The Ritual',
      content: product.ritualContent || '',
      order: 0,
    });
  }

  if (product.ingredientsTitle || product.ingredientsContent) {
    drawers.push({
      id: nanoid(),
      title: product.ingredientsTitle || 'Ingredients',
      content: product.ingredientsContent || '',
      order: 1,
    });
  }

  if (product.shippingTitle || product.shippingContent) {
    drawers.push({
      id: nanoid(),
      title: product.shippingTitle || 'Good to Know',
      content: product.shippingContent || '',
      order: 2,
    });
  }

  return drawers;
}

// ============================================
// HELPER: Create default drawers for new products
// ============================================

export function createDefaultDrawers(): BenefitDrawer[] {
  return [
    { id: nanoid(), title: 'The Ritual', content: '', order: 0 },
    { id: nanoid(), title: 'Ingredients', content: '', order: 1 },
    { id: nanoid(), title: 'Good to Know', content: '', order: 2 },
  ];
}
