'use client';

/**
 * Shared Widget List Container Component
 *
 * This is the SINGLE SOURCE OF TRUTH for widget list rendering in admin editors.
 * Handles:
 * - Reorderable widget list with Framer Motion
 * - Drop zone detection and visual indicators
 * - Empty state rendering
 * - Drag state management
 *
 * Used by page admin, product admin, and blog admin.
 */

import React, { useState, useCallback } from 'react';
import { Reorder } from 'framer-motion';
import { Layout, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WIDGET_TYPES } from '@/lib/widget-library';
import { DraggableWidgetRow, Widget } from './draggable-widget-row';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface WidgetListContainerProps {
  widgets: any[];
  onReorder: (widgets: any[]) => void;
  onAddWidget: (type: string, atIndex?: number) => void;
  onUpdateWidget: (widgetId: string, updates: Partial<Widget>) => void;
  onDeleteWidget: (widgetId: string) => void;
  // Drag state from parent (connected to WidgetLibrarySidebar)
  draggedWidgetType: string | null;
  onDragEnd?: () => void;
  // Expanded widget state
  expandedWidget: string | null;
  onToggleExpand: (widgetId: string | null) => void;
  // Optional: custom config renderer for special widgets
  renderCustomConfig?: (widget: Widget, onUpdate: (updates: Partial<Widget>) => void) => React.ReactNode;
  // Optional: show device visibility toggles
  showDeviceToggles?: boolean;
  // Optional: show item count badges
  showCount?: boolean;
  // Optional: custom empty state
  emptyTitle?: string;
  emptyDescription?: string;
  // Optional: class name for container
  className?: string;
}

export function WidgetListContainer({
  widgets,
  onReorder,
  onAddWidget,
  onUpdateWidget,
  onDeleteWidget,
  draggedWidgetType,
  onDragEnd,
  expandedWidget,
  onToggleExpand,
  renderCustomConfig,
  showDeviceToggles = true,
  showCount = true,
  emptyTitle = 'No widgets yet',
  emptyDescription = 'Drag widgets from the library on the right, or click to add them',
  className,
}: WidgetListContainerProps) {
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Handle drop from library
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, atIndex?: number) => {
      e.preventDefault();
      e.stopPropagation();
      const widgetType = e.dataTransfer.getData('widget-type');
      if (widgetType) {
        const insertIndex = atIndex !== undefined ? atIndex : dropTargetIndex !== null ? dropTargetIndex : widgets.length;
        onAddWidget(widgetType, insertIndex);
      }
      setDropTargetIndex(null);
      onDragEnd?.();
    },
    [dropTargetIndex, widgets.length, onAddWidget, onDragEnd]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Calculate drop position based on mouse Y position
  const handleDragOverWidget = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const newIndex = e.clientY < midY ? index : index + 1;
      if (newIndex !== dropTargetIndex) {
        setDropTargetIndex(newIndex);
      }
    },
    [dropTargetIndex]
  );

  const handleDragLeave = useCallback(() => {
    setDropTargetIndex(null);
  }, []);

  return (
    <div
      className={cn(
        'bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] transition-all relative',
        draggedWidgetType && 'ring-2 ring-[var(--primary)] ring-opacity-50',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {widgets.length > 0 ? (
        <Reorder.Group
          axis="y"
          values={widgets}
          onReorder={onReorder}
          className="divide-y divide-[var(--admin-border)]"
        >
          {widgets.map((widget, index) => (
            <div
              key={widget.id}
              onDragOver={(e) => draggedWidgetType && handleDragOverWidget(e, index)}
              onDrop={(e) => handleDrop(e, dropTargetIndex ?? index)}
            >
              {/* Drop indicator before this widget */}
              {draggedWidgetType && dropTargetIndex === index && (
                <div className="h-1 bg-[var(--primary)] mx-4 rounded-full animate-pulse" />
              )}
              <DraggableWidgetRow
                widget={widget}
                index={index}
                isExpanded={expandedWidget === widget.id}
                onToggleExpand={() => onToggleExpand(expandedWidget === widget.id ? null : widget.id)}
                onUpdate={(updates) => onUpdateWidget(widget.id, updates)}
                onDelete={() => onDeleteWidget(widget.id)}
                renderCustomConfig={renderCustomConfig}
                showDeviceToggles={showDeviceToggles}
                showCount={showCount}
              />
              {/* Drop indicator after last widget */}
              {draggedWidgetType && index === widgets.length - 1 && dropTargetIndex === widgets.length && (
                <div className="h-1 bg-[var(--primary)] mx-4 rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </Reorder.Group>
      ) : (
        <div
          className="py-16 text-center"
          onDragOver={(e) => {
            e.preventDefault();
            setDropTargetIndex(0);
          }}
          onDrop={(e) => handleDrop(e, 0)}
        >
          {draggedWidgetType ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center">
                <Plus className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h3 className="font-medium text-lg text-[var(--primary)] mb-2">
                Drop here to add
              </h3>
              <p className="text-sm text-[var(--admin-text-muted)]">
                Release to add {WIDGET_TYPES.find((w) => w.type === draggedWidgetType)?.name || 'widget'}
              </p>
            </>
          ) : (
            <>
              <Layout className="w-16 h-16 mx-auto mb-4 text-[var(--admin-text-muted)]" />
              <h3 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">
                {emptyTitle}
              </h3>
              <p className="text-sm text-[var(--admin-text-muted)] mb-4 max-w-xs mx-auto">
                {emptyDescription}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Hook to manage widget drag state
 *
 * Use this hook in your admin page to manage drag state
 * and connect it to both WidgetListContainer and WidgetLibrarySidebar
 */
export function useWidgetDragState() {
  const [draggedWidgetType, setDraggedWidgetType] = useState<string | null>(null);

  const handleDragStart = useCallback((type: string) => {
    setDraggedWidgetType(type);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedWidgetType(null);
  }, []);

  return {
    draggedWidgetType,
    handleDragStart,
    handleDragEnd,
  };
}

/**
 * Hook to manage expanded widget state
 */
export function useWidgetExpandState() {
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

  const toggleExpand = useCallback((widgetId: string | null) => {
    setExpandedWidget(widgetId);
  }, []);

  return {
    expandedWidget,
    toggleExpand,
  };
}
