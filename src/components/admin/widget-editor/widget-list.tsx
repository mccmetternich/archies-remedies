'use client';

import React from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetConfigPanel, type Widget } from './widget-config-panel';

interface WidgetListProps {
  widgets: Widget[];
  onReorder: (widgets: Widget[]) => void;
  expandedWidget: string | null;
  onToggleExpand: (id: string) => void;
  selectedWidgets: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateConfig: (id: string, config: Record<string, unknown>) => void;
  /** Render custom config panel for a widget */
  renderConfigPanel?: (widget: Widget) => React.ReactNode;
  /** Handle drop from widget library */
  onDropWidget?: (type: string, index: number) => void;
  /** Whether multi-select mode is active */
  multiSelectMode?: boolean;
  className?: string;
}

/**
 * Reorderable widget list with drag-drop support.
 * Uses Framer Motion's Reorder for smooth reordering.
 */
export function WidgetList({
  widgets,
  onReorder,
  expandedWidget,
  onToggleExpand,
  selectedWidgets,
  onToggleSelect,
  onToggleVisibility,
  onDelete,
  onUpdateConfig,
  renderConfigPanel,
  onDropWidget,
  multiSelectMode = false,
  className,
}: WidgetListProps) {
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const hasWidgetType = e.dataTransfer.types.includes('widgettype') || e.dataTransfer.types.includes('text/plain');
    if (hasWidgetType || e.dataTransfer.types.includes('widgetType')) {
      e.dataTransfer.dropEffect = 'copy';
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const widgetType = e.dataTransfer.getData('widgetType');
    if (widgetType && onDropWidget) {
      onDropWidget(widgetType, index);
    }
    setDragOverIndex(null);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone at top */}
      <DropZone
        index={0}
        isActive={dragOverIndex === 0}
        onDragOver={(e) => handleDragOver(e, 0)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 0)}
        show={widgets.length === 0 || dragOverIndex === 0}
        isEmpty={widgets.length === 0}
      />

      <Reorder.Group
        axis="y"
        values={widgets}
        onReorder={onReorder}
        className="space-y-3"
      >
        <AnimatePresence>
          {widgets.map((widget, index) => (
            <React.Fragment key={widget.id}>
              <Reorder.Item
                value={widget}
                id={widget.id}
                className="list-none"
              >
                <WidgetConfigPanel
                  widget={widget}
                  isExpanded={expandedWidget === widget.id}
                  isSelected={selectedWidgets.has(widget.id)}
                  onToggleExpand={() => onToggleExpand(widget.id)}
                  onToggleVisibility={() => onToggleVisibility(widget.id)}
                  onToggleSelect={() => onToggleSelect(widget.id)}
                  onDelete={() => onDelete(widget.id)}
                  onUpdateConfig={(config) => onUpdateConfig(widget.id, config)}
                  multiSelectMode={multiSelectMode}
                >
                  {renderConfigPanel?.(widget)}
                </WidgetConfigPanel>
              </Reorder.Item>

              {/* Drop zone after each widget */}
              <DropZone
                index={index + 1}
                isActive={dragOverIndex === index + 1}
                onDragOver={(e) => handleDragOver(e, index + 1)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index + 1)}
                show={dragOverIndex === index + 1}
              />
            </React.Fragment>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}

// ─────────────────────────────────────────
// Drop Zone Component
// ─────────────────────────────────────────

interface DropZoneProps {
  index: number;
  isActive: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  show: boolean;
  isEmpty?: boolean;
}

function DropZone({ index, isActive, onDragOver, onDragLeave, onDrop, show, isEmpty }: DropZoneProps) {
  if (!show && !isEmpty) return null;

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'transition-all duration-200',
        isActive ? 'py-4' : isEmpty ? 'py-8' : 'py-1'
      )}
    >
      <div
        className={cn(
          'border-2 border-dashed rounded-xl flex items-center justify-center transition-all',
          isActive
            ? 'border-[var(--primary)] bg-[var(--primary)]/5 py-6'
            : isEmpty
              ? 'border-[var(--admin-border)] py-8'
              : 'border-transparent py-0 opacity-0'
        )}
      >
        {(isActive || isEmpty) && (
          <div className="flex items-center gap-2 text-[var(--admin-text-muted)]">
            <Plus className="w-5 h-5" />
            <span className="text-sm">
              {isEmpty ? 'Drag a widget here to get started' : 'Drop widget here'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
