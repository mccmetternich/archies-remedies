'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { nanoid } from 'nanoid';
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
import type { FAQDrawerTheme, FAQItem } from '@/components/widgets/faq-drawer';

// ============================================
// TYPES
// ============================================

interface FAQDrawerConfigProps {
  theme: FAQDrawerTheme;
  items: FAQItem[];
  onThemeChange: (theme: FAQDrawerTheme) => void;
  onItemsChange: (items: FAQItem[]) => void;
}

// ============================================
// THEME OPTIONS
// ============================================

const themeOptions: { value: FAQDrawerTheme; label: string }[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'dark', label: 'Dark' },
  { value: 'cream', label: 'Cream' },
];

// ============================================
// SORTABLE FAQ ITEM
// ============================================

function SortableFAQItem({
  item,
  index,
  onUpdate,
  onDelete,
  canDelete,
}: {
  item: FAQItem;
  index: number;
  onUpdate: (updates: Partial<FAQItem>) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-4 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl space-y-3',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      {/* Header with drag handle and delete */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-xs font-semibold">
          {index + 1}
        </span>
        <span className="flex-1 text-sm font-medium text-[var(--admin-text-primary)] truncate">
          {item.question || `Question ${index + 1}`}
        </span>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Question Input */}
      <div>
        <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">
          Question
        </label>
        <input
          type="text"
          value={item.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          placeholder="Enter your question"
          className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      {/* Answer Input */}
      <div>
        <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">
          Answer
        </label>
        <textarea
          value={item.answer}
          onChange={(e) => onUpdate({ answer: e.target.value })}
          placeholder="Enter the answer"
          rows={3}
          className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
        />
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function FAQDrawerConfig({
  theme,
  items,
  onThemeChange,
  onItemsChange,
}: FAQDrawerConfigProps) {
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

  // Ensure we have at least one item
  const normalizedItems: FAQItem[] =
    items.length > 0 ? items : [{ id: nanoid(), question: '', answer: '' }];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = normalizedItems.findIndex((item) => item.id === active.id);
      const newIndex = normalizedItems.findIndex((item) => item.id === over.id);
      onItemsChange(arrayMove(normalizedItems, oldIndex, newIndex));
    }
  };

  const addItem = () => {
    onItemsChange([
      ...normalizedItems,
      { id: nanoid(), question: '', answer: '' },
    ]);
  };

  const updateItem = (id: string, updates: Partial<FAQItem>) => {
    onItemsChange(
      normalizedItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    const filtered = normalizedItems.filter((item) => item.id !== id);
    onItemsChange(filtered.length > 0 ? filtered : [{ id: nanoid(), question: '', answer: '' }]);
  };

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onThemeChange(option.value)}
              className={cn(
                'flex flex-col items-center p-3 rounded-xl border transition-all',
                theme === option.value
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                  : 'border-[var(--admin-border)] hover:border-[var(--admin-border-light)] bg-[var(--admin-input)]'
              )}
            >
              <div
                className="w-full h-5 rounded-md mb-1.5"
                style={{
                  backgroundColor:
                    option.value === 'blue'
                      ? 'var(--primary)'
                      : option.value === 'dark'
                        ? 'var(--foreground)'
                        : '#f5f1eb',
                  border: option.value === 'cream' ? '1px solid #e5e5e5' : undefined,
                }}
              />
              <span className="text-xs font-medium text-[var(--admin-text-primary)]">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)]">
          Questions & Answers
        </label>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={normalizedItems.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {normalizedItems.map((item, index) => (
                <SortableFAQItem
                  key={item.id}
                  item={item}
                  index={index}
                  onUpdate={(updates) => updateItem(item.id, updates)}
                  onDelete={() => deleteItem(item.id)}
                  canDelete={normalizedItems.length > 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Question Button */}
        <button
          type="button"
          onClick={addItem}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--admin-border)] rounded-xl text-sm font-medium text-[var(--admin-text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>
    </div>
  );
}
