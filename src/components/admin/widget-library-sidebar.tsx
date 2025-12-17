'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  ArrowUp,
  ArrowDown,
  Save,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  WIDGET_CATEGORIES as CENTRALIZED_CATEGORIES,
  WIDGET_TYPES,
} from '@/lib/widget-library';

// Create compatible format from centralized library
const DEFAULT_WIDGET_CATEGORIES = CENTRALIZED_CATEGORIES.map((cat) => ({
  name: cat.name,
  widgets: WIDGET_TYPES.filter((w) => w.category === cat.name).map((w) => ({
    type: w.type,
    label: w.name,
    icon: w.icon,
    description: w.description,
  })),
})).filter((cat) => cat.widgets.length > 0);

interface WidgetItem {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface WidgetCategory {
  name: string;
  widgets: WidgetItem[];
}

interface WidgetLibrarySidebarProps {
  /** Called when a widget is clicked to add */
  onAddWidget: (type: string) => void;
  /** Called when drag starts */
  onDragStart?: (type: string) => void;
  /** Called when drag ends */
  onDragEnd?: () => void;
  /** Currently dragged widget type */
  draggedWidgetType?: string | null;
  /** Optional custom categories (defaults to centralized library) */
  categories?: WidgetCategory[];
  /** Storage key for persisting category/widget order */
  storageKey?: string;
  /** Show reorder controls */
  showReorderControls?: boolean;
  /** Compact mode (narrower) */
  compact?: boolean;
  /** Optional title override */
  title?: string;
  /** Optional subtitle override */
  subtitle?: string;
  /** Class name for container */
  className?: string;
}

export function WidgetLibrarySidebar({
  onAddWidget,
  onDragStart,
  onDragEnd,
  draggedWidgetType,
  categories: initialCategories,
  storageKey = 'widget-library-order',
  showReorderControls = true,
  compact = false,
  title = 'Widget Library',
  subtitle = 'Drag or click to add widgets',
  className,
}: WidgetLibrarySidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Hero');
  const [categories, setCategories] = useState<WidgetCategory[]>(
    initialCategories || DEFAULT_WIDGET_CATEGORIES
  );
  const [originalCategories, setOriginalCategories] = useState<WidgetCategory[]>(
    initialCategories || DEFAULT_WIDGET_CATEGORIES
  );
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load saved order from localStorage on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem(storageKey);
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        // Merge saved order with current widgets (in case new widgets were added)
        const mergedCategories = mergeWithSavedOrder(
          initialCategories || DEFAULT_WIDGET_CATEGORIES,
          parsed
        );
        setCategories(mergedCategories);
        setOriginalCategories(mergedCategories);
      } catch {
        // Invalid saved data, use defaults
      }
    }
  }, [storageKey, initialCategories]);

  // Check for changes
  useEffect(() => {
    const hasChanges = JSON.stringify(categories) !== JSON.stringify(originalCategories);
    setHasOrderChanges(hasChanges);
  }, [categories, originalCategories]);

  // Merge saved order with current widgets
  function mergeWithSavedOrder(
    current: WidgetCategory[],
    saved: { categoryOrder: string[]; widgetOrder: Record<string, string[]> }
  ): WidgetCategory[] {
    const { categoryOrder, widgetOrder } = saved;

    // Reorder categories
    const reorderedCategories = [...current].sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.name);
      const bIndex = categoryOrder.indexOf(b.name);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    // Reorder widgets within each category
    return reorderedCategories.map((cat) => {
      const order = widgetOrder[cat.name];
      if (!order) return cat;

      const reorderedWidgets = [...cat.widgets].sort((a, b) => {
        const aIndex = order.indexOf(a.type);
        const bIndex = order.indexOf(b.type);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });

      return { ...cat, widgets: reorderedWidgets };
    });
  }

  // Move widget up within category
  const moveWidgetUp = (categoryName: string, widgetIndex: number) => {
    if (widgetIndex === 0) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.name !== categoryName) return cat;
        const newWidgets = [...cat.widgets];
        [newWidgets[widgetIndex - 1], newWidgets[widgetIndex]] = [
          newWidgets[widgetIndex],
          newWidgets[widgetIndex - 1],
        ];
        return { ...cat, widgets: newWidgets };
      })
    );
  };

  // Move widget down within category
  const moveWidgetDown = (categoryName: string, widgetIndex: number, totalWidgets: number) => {
    if (widgetIndex === totalWidgets - 1) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.name !== categoryName) return cat;
        const newWidgets = [...cat.widgets];
        [newWidgets[widgetIndex], newWidgets[widgetIndex + 1]] = [
          newWidgets[widgetIndex + 1],
          newWidgets[widgetIndex],
        ];
        return { ...cat, widgets: newWidgets };
      })
    );
  };

  // Save order to localStorage
  const saveOrder = () => {
    setSaving(true);

    const orderData = {
      categoryOrder: categories.map((c) => c.name),
      widgetOrder: categories.reduce(
        (acc, cat) => {
          acc[cat.name] = cat.widgets.map((w) => w.type);
          return acc;
        },
        {} as Record<string, string[]>
      ),
    };

    localStorage.setItem(storageKey, JSON.stringify(orderData));
    setOriginalCategories(categories);

    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 300);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className={cn('p-4 border-b border-[var(--admin-border)]', compact && 'p-3')}>
        <h3 className="font-medium text-[var(--admin-text-primary)]">{title}</h3>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1">{subtitle}</p>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        {categories.map((category) => (
          <div key={category.name} className="border-b border-[var(--admin-border)] last:border-0">
            <button
              onClick={() =>
                setExpandedCategory(expandedCategory === category.name ? null : category.name)
              }
              className="w-full p-3 flex items-center justify-between hover:bg-[var(--admin-hover)] transition-colors"
            >
              <span className="text-sm font-medium text-[var(--admin-text-primary)]">
                {category.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--admin-text-muted)]">
                  {category.widgets.length}
                </span>
                {expandedCategory === category.name ? (
                  <ChevronUp className="w-4 h-4 text-[var(--admin-text-muted)]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[var(--admin-text-muted)]" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {expandedCategory === category.name && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="p-2 space-y-1">
                    {category.widgets.map((widget, widgetIndex) => {
                      const Icon = widget.icon;
                      const isBeingDragged = draggedWidgetType === widget.type;

                      return (
                        <div
                          key={widget.type}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('widget-type', widget.type);
                            e.dataTransfer.effectAllowed = 'copy';

                            // Create a custom drag preview that looks like the widget tile
                            const dragPreview = document.createElement('div');
                            dragPreview.style.cssText = `
                              position: fixed;
                              top: -1000px;
                              left: -1000px;
                              padding: 12px 16px;
                              background: var(--admin-card, #1a1a1a);
                              border: 2px solid var(--primary, #bbdae9);
                              border-radius: 12px;
                              box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                              display: flex;
                              align-items: center;
                              gap: 12px;
                              font-family: inherit;
                              z-index: 9999;
                              pointer-events: none;
                              min-width: 200px;
                            `;

                            // Icon container
                            const iconContainer = document.createElement('div');
                            iconContainer.style.cssText = `
                              width: 32px;
                              height: 32px;
                              background: rgba(187, 218, 233, 0.2);
                              border-radius: 8px;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                            `;
                            iconContainer.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #bbdae9)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`;

                            // Text container
                            const textContainer = document.createElement('div');
                            textContainer.innerHTML = `
                              <div style="font-weight: 500; font-size: 14px; color: var(--admin-text-primary, #fff);">${widget.label}</div>
                              <div style="font-size: 11px; color: var(--admin-text-muted, #888); margin-top: 2px;">Drag to add</div>
                            `;

                            dragPreview.appendChild(iconContainer);
                            dragPreview.appendChild(textContainer);
                            document.body.appendChild(dragPreview);

                            // Set the custom drag image
                            e.dataTransfer.setDragImage(dragPreview, 100, 30);

                            // Clean up after a short delay
                            requestAnimationFrame(() => {
                              setTimeout(() => {
                                if (dragPreview.parentNode) {
                                  document.body.removeChild(dragPreview);
                                }
                              }, 0);
                            });

                            onDragStart?.(widget.type);
                          }}
                          onDragEnd={() => onDragEnd?.()}
                          onClick={() => onAddWidget(widget.type)}
                          className={cn(
                            'w-full p-3 rounded-lg border border-transparent transition-all text-left group cursor-grab active:cursor-grabbing',
                            'hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5',
                            isBeingDragged && 'opacity-50 border-[var(--primary)] bg-[var(--primary)]/10'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                'w-8 h-8 rounded-lg bg-[var(--admin-input)] flex items-center justify-center flex-shrink-0 transition-colors',
                                'group-hover:bg-[var(--primary)]/10'
                              )}
                            >
                              <Icon className="w-4 h-4 text-[var(--admin-text-secondary)] group-hover:text-[var(--primary)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-[var(--admin-text-primary)]">
                                  {widget.label}
                                </span>
                                <div className="flex items-center gap-1">
                                  {/* Reorder controls */}
                                  {showReorderControls && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          moveWidgetUp(category.name, widgetIndex);
                                        }}
                                        disabled={widgetIndex === 0}
                                        className={cn(
                                          'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
                                          widgetIndex === 0
                                            ? 'text-[var(--admin-text-muted)]/30 cursor-not-allowed'
                                            : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-hover)]'
                                        )}
                                        title="Move up"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          moveWidgetDown(
                                            category.name,
                                            widgetIndex,
                                            category.widgets.length
                                          );
                                        }}
                                        disabled={widgetIndex === category.widgets.length - 1}
                                        className={cn(
                                          'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
                                          widgetIndex === category.widgets.length - 1
                                            ? 'text-[var(--admin-text-muted)]/30 cursor-not-allowed'
                                            : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-hover)]'
                                        )}
                                        title="Move down"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                  <Plus className="w-4 h-4 text-[var(--admin-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                              <p className="text-xs text-[var(--admin-text-muted)] mt-0.5 line-clamp-1">
                                {widget.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Save Button for Reorder Changes */}
      {showReorderControls && hasOrderChanges && (
        <div className="p-3 border-t border-[var(--admin-border)] bg-[var(--admin-sidebar)]">
          <button
            onClick={saveOrder}
            disabled={saving}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
              saved
                ? 'bg-green-500 text-white'
                : 'bg-[var(--primary)] text-[var(--admin-button-text)] hover:bg-[var(--primary-dark)]',
              saving && 'opacity-50 cursor-not-allowed'
            )}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Order
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
