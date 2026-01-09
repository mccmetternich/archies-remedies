'use client';

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WIDGET_TYPES, type WidgetTypeDefinition } from '@/lib/widget-library';

interface WidgetLibrarySidebarProps {
  /** Called when a widget is clicked to add */
  onAddWidget: (type: string) => void;
  /** Called when drag starts */
  onDragStart?: (type: string) => void;
  /** Called when drag ends */
  onDragEnd?: () => void;
  /** Currently dragged widget type */
  draggedWidgetType?: string | null;
  /** Compact mode (narrower) */
  compact?: boolean;
  /** Optional title override */
  title?: string;
  /** Optional subtitle override */
  subtitle?: string;
  /** Class name for container */
  className?: string;
  /** @deprecated No longer used - categories removed */
  storageKey?: string;
  /** @deprecated No longer used - categories removed */
  showReorderControls?: boolean;
  /** @deprecated No longer used - using centralized widget library */
  categories?: unknown;
}

export function WidgetLibrarySidebar({
  onAddWidget,
  onDragStart,
  onDragEnd,
  draggedWidgetType,
  compact = false,
  title = 'Widget Library',
  subtitle = 'Drag or click to add widgets',
  className,
}: WidgetLibrarySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter widgets by search and only those addable to pages
  const filteredWidgets = WIDGET_TYPES.filter((widget) => {
    if (!widget.addableToPages) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        widget.name.toLowerCase().includes(query) ||
        widget.description.toLowerCase().includes(query) ||
        widget.type.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className={cn('p-4 border-b border-[var(--admin-border)]', compact && 'p-3')}>
        <h3 className="font-medium text-[var(--admin-text-primary)]">{title}</h3>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1">{subtitle}</p>

        {/* Search */}
        <div className="relative mt-3">
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

      {/* Widget List - Flat scrollable list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredWidgets.map((widget) => {
          const Icon = widget.icon;
          const isBeingDragged = draggedWidgetType === widget.type;

          return (
            <div
              key={widget.type}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('widget-type', widget.type);
                e.dataTransfer.effectAllowed = 'copy';

                // Create a custom drag preview
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

                const textContainer = document.createElement('div');
                textContainer.innerHTML = `
                  <div style="font-weight: 500; font-size: 14px; color: var(--admin-text-primary, #fff);">${widget.name}</div>
                  <div style="font-size: 11px; color: var(--admin-text-muted, #888); margin-top: 2px;">Drag to add</div>
                `;

                dragPreview.appendChild(iconContainer);
                dragPreview.appendChild(textContainer);
                document.body.appendChild(dragPreview);

                e.dataTransfer.setDragImage(dragPreview, 100, 30);

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
                      {widget.name}
                    </span>
                    <Plus className="w-4 h-4 text-[var(--admin-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-[var(--admin-text-muted)] mt-0.5 line-clamp-1">
                    {widget.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* No results */}
        {filteredWidgets.length === 0 && (
          <div className="text-center py-8 text-[var(--admin-text-muted)] text-sm">
            No widgets found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
