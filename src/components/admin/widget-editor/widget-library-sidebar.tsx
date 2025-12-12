'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight, Plus, GripVertical, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  WIDGET_CATEGORIES,
  WIDGET_TYPES,
  getWidgetsByCategory,
  getCategoryByName,
  type WidgetTypeDefinition,
} from '@/lib/widget-library';

interface WidgetLibrarySidebarProps {
  onAddWidget: (type: string) => void;
  onDragStart?: (e: React.DragEvent, type: string) => void;
  className?: string;
  /** Filter to only show certain widget types */
  filter?: 'all' | 'global' | 'page-specific';
}

/**
 * Always-visible widget library sidebar for the page editor.
 * Shows categorized widgets that can be dragged or clicked to add.
 */
export function WidgetLibrarySidebar({
  onAddWidget,
  onDragStart,
  className,
  filter = 'all',
}: WidgetLibrarySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(WIDGET_CATEGORIES.map((c) => c.name))
  );

  // Filter widgets based on search and filter prop
  const filteredWidgets = WIDGET_TYPES.filter((widget) => {
    // Filter by type
    if (filter === 'global' && !widget.isGlobal) return false;
    if (filter === 'page-specific' && widget.isGlobal) return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        widget.name.toLowerCase().includes(query) ||
        widget.description.toLowerCase().includes(query) ||
        widget.category.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const widgetsByCategory = filteredWidgets.reduce(
    (acc, widget) => {
      if (!acc[widget.category]) {
        acc[widget.category] = [];
      }
      acc[widget.category].push(widget);
      return acc;
    },
    {} as Record<string, WidgetTypeDefinition[]>
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('widgetType', type);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(e, type);
  };

  return (
    <div className={cn('flex flex-col h-full bg-[var(--admin-input)] border-l border-[var(--admin-border)]', className)}>
      {/* Header */}
      <div className="p-4 border-b border-[var(--admin-border)]">
        <h3 className="font-medium text-[var(--admin-text-primary)] mb-3">Widget Library</h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
          <input
            type="text"
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      {/* Widget Categories */}
      <div className="flex-1 overflow-y-auto p-2">
        {WIDGET_CATEGORIES.map((category) => {
          const widgets = widgetsByCategory[category.name] || [];
          if (widgets.length === 0) return null;

          const isExpanded = expandedCategories.has(category.name);
          const categoryDef = getCategoryByName(category.name);

          return (
            <div key={category.name} className="mb-2">
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span className={cn('px-2 py-0.5 rounded text-xs', categoryDef?.color.bg, categoryDef?.color.text)}>
                  {category.name}
                </span>
                <span className="text-[var(--admin-text-muted)] text-xs ml-auto">{widgets.length}</span>
              </button>

              {/* Widget List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 pl-4 pr-2 pb-2">
                      {widgets.map((widget) => (
                        <WidgetTile
                          key={widget.type}
                          widget={widget}
                          onAdd={() => onAddWidget(widget.type)}
                          onDragStart={(e) => handleDragStart(e, widget.type)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* No results */}
        {Object.keys(widgetsByCategory).length === 0 && (
          <div className="text-center py-8 text-[var(--admin-text-muted)] text-sm">
            No widgets found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--admin-border)] text-xs text-[var(--admin-text-muted)]">
        <p>Drag or double-click to add widgets</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Widget Tile Component
// ─────────────────────────────────────────

interface WidgetTileProps {
  widget: WidgetTypeDefinition;
  onAdd: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

function WidgetTile({ widget, onAdd, onDragStart }: WidgetTileProps) {
  const Icon = widget.icon;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDoubleClick={onAdd}
      className="flex items-center gap-2 px-2 py-2 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)] hover:border-[var(--primary)] cursor-grab active:cursor-grabbing transition-colors group"
    >
      {/* Drag handle */}
      <GripVertical className="w-3 h-3 text-[var(--admin-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />

      {/* Icon */}
      <div className="w-7 h-7 rounded-md bg-[var(--admin-hover)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[var(--admin-text-secondary)]" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-[var(--admin-text-primary)] truncate">
            {widget.name}
          </span>
          {widget.isGlobal && widget.adminHref && (
            <Link
              href={widget.adminHref}
              onClick={(e) => e.stopPropagation()}
              className="text-[var(--admin-text-muted)] hover:text-[var(--primary)] transition-colors"
              title="Manage globally"
            >
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
        <p className="text-xs text-[var(--admin-text-muted)] truncate">{widget.description}</p>
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--admin-text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
        title="Add widget"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
