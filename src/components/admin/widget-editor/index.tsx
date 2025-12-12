'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getDefaultConfig, getWidgetByType } from '@/lib/widget-library';
import { WidgetList } from './widget-list';
import { WidgetLibrarySidebar } from './widget-library-sidebar';
import { BulkActionsToolbar } from './bulk-actions-toolbar';
import { DevicePreviewToggle, type DeviceType } from './device-preview';
import type { Widget } from './widget-config-panel';

// Re-export types
export type { Widget } from './widget-config-panel';
export type { DeviceType } from './device-preview';

interface WidgetEditorProps {
  widgets: Widget[];
  onWidgetsChange: (widgets: Widget[]) => void;
  pageType: 'home' | 'product' | 'landing' | 'article';
  /** Render custom config panel for a widget */
  renderConfigPanel?: (widget: Widget, device: DeviceType) => React.ReactNode;
  /** Optional: control preview device externally */
  previewDevice?: DeviceType;
  onPreviewDeviceChange?: (device: DeviceType) => void;
  /** Whether to show the library sidebar */
  showLibrary?: boolean;
  /** Library filter */
  libraryFilter?: 'all' | 'global' | 'page-specific';
  className?: string;
}

/**
 * Main Widget Editor component.
 * Provides a complete widget editing experience with:
 * - Reorderable widget list with accordion expand
 * - Multi-select with bulk actions
 * - Widget library sidebar (optional, always visible)
 * - Device preview toggle
 */
export function WidgetEditor({
  widgets,
  onWidgetsChange,
  pageType,
  renderConfigPanel,
  previewDevice: externalDevice,
  onPreviewDeviceChange: externalDeviceChange,
  showLibrary = true,
  libraryFilter = 'all',
  className,
}: WidgetEditorProps) {
  // Internal device state if not controlled externally
  const [internalDevice, setInternalDevice] = useState<DeviceType>('desktop');
  const device = externalDevice ?? internalDevice;
  const setDevice = externalDeviceChange ?? setInternalDevice;

  // Widget state
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [selectedWidgets, setSelectedWidgets] = useState<Set<string>>(new Set());

  // Multi-select mode is active when any widgets are selected
  const multiSelectMode = selectedWidgets.size > 0;

  // ─────────────────────────────────────────
  // Widget Operations
  // ─────────────────────────────────────────

  const addWidget = useCallback(
    (type: string, index?: number) => {
      const widgetDef = getWidgetByType(type);
      const newWidget: Widget = {
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        isVisible: true,
        config: getDefaultConfig(type),
        isHomepageWidget: widgetDef?.isGlobal ?? false,
        editUrl: widgetDef?.adminHref ?? undefined,
      };

      const insertIndex = index ?? widgets.length;
      const newWidgets = [...widgets];
      newWidgets.splice(insertIndex, 0, newWidget);
      onWidgetsChange(newWidgets);
      setExpandedWidget(newWidget.id);
    },
    [widgets, onWidgetsChange]
  );

  const updateWidget = useCallback(
    (id: string, config: Record<string, unknown>) => {
      const updatedWidgets = widgets.map((widget) =>
        widget.id === id ? { ...widget, config: { ...widget.config, ...config } } : widget
      );
      onWidgetsChange(updatedWidgets);
    },
    [widgets, onWidgetsChange]
  );

  const deleteWidget = useCallback(
    (id: string) => {
      const filteredWidgets = widgets.filter((widget) => widget.id !== id);
      onWidgetsChange(filteredWidgets);
      if (expandedWidget === id) {
        setExpandedWidget(null);
      }
      setSelectedWidgets((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [widgets, onWidgetsChange, expandedWidget]
  );

  const toggleVisibility = useCallback(
    (id: string) => {
      const updatedWidgets = widgets.map((widget) =>
        widget.id === id ? { ...widget, isVisible: !widget.isVisible } : widget
      );
      onWidgetsChange(updatedWidgets);
    },
    [widgets, onWidgetsChange]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedWidget((prev) => (prev === id ? null : id));
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ─────────────────────────────────────────
  // Bulk Operations
  // ─────────────────────────────────────────

  const bulkShow = useCallback(() => {
    const updatedWidgets = widgets.map((widget) =>
      selectedWidgets.has(widget.id) ? { ...widget, isVisible: true } : widget
    );
    onWidgetsChange(updatedWidgets);
    setSelectedWidgets(new Set());
  }, [widgets, selectedWidgets, onWidgetsChange]);

  const bulkHide = useCallback(() => {
    const updatedWidgets = widgets.map((widget) =>
      selectedWidgets.has(widget.id) ? { ...widget, isVisible: false } : widget
    );
    onWidgetsChange(updatedWidgets);
    setSelectedWidgets(new Set());
  }, [widgets, selectedWidgets, onWidgetsChange]);

  const bulkDuplicate = useCallback(() => {
    const duplicatedWidgets = Array.from(selectedWidgets)
      .map((id) => {
        const widget = widgets.find((w) => w.id === id);
        if (!widget || widget.isHomepageWidget) return null; // Can't duplicate homepage widgets
        return {
          ...widget,
          id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
      })
      .filter(Boolean) as Widget[];

    onWidgetsChange([...widgets, ...duplicatedWidgets]);
    setSelectedWidgets(new Set());
  }, [widgets, selectedWidgets, onWidgetsChange]);

  const bulkDelete = useCallback(() => {
    // Can't delete homepage widgets
    const deletableIds = Array.from(selectedWidgets).filter((id) => {
      const widget = widgets.find((w) => w.id === id);
      return widget && !widget.isHomepageWidget;
    });

    const filteredWidgets = widgets.filter((widget) => !deletableIds.includes(widget.id));
    onWidgetsChange(filteredWidgets);
    setSelectedWidgets(new Set());
    if (expandedWidget && deletableIds.includes(expandedWidget)) {
      setExpandedWidget(null);
    }
  }, [widgets, selectedWidgets, onWidgetsChange, expandedWidget]);

  const clearSelection = useCallback(() => {
    setSelectedWidgets(new Set());
  }, []);

  // Check bulk action availability
  const hasHiddenSelected = Array.from(selectedWidgets).some((id) => {
    const widget = widgets.find((w) => w.id === id);
    return widget && !widget.isVisible;
  });

  const hasVisibleSelected = Array.from(selectedWidgets).some((id) => {
    const widget = widgets.find((w) => w.id === id);
    return widget && widget.isVisible;
  });

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <div className={cn('flex h-full', className)}>
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedWidgets.size}
        hasHiddenSelected={hasHiddenSelected}
        hasVisibleSelected={hasVisibleSelected}
        onShowAll={bulkShow}
        onHideAll={bulkHide}
        onDuplicate={bulkDuplicate}
        onDelete={bulkDelete}
        onClearSelection={clearSelection}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with Device Toggle */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)]">
          <div>
            <h2 className="font-medium text-[var(--admin-text-primary)]">Page Content</h2>
            <p className="text-sm text-[var(--admin-text-muted)]">
              {widgets.length} widget{widgets.length !== 1 ? 's' : ''} on this page
            </p>
          </div>
          <DevicePreviewToggle device={device} onChange={setDevice} />
        </div>

        {/* Widget List */}
        <div className="flex-1 overflow-y-auto p-6">
          <WidgetList
            widgets={widgets}
            onReorder={onWidgetsChange}
            expandedWidget={expandedWidget}
            onToggleExpand={toggleExpand}
            selectedWidgets={selectedWidgets}
            onToggleSelect={toggleSelect}
            onToggleVisibility={toggleVisibility}
            onDelete={deleteWidget}
            onUpdateConfig={updateWidget}
            onDropWidget={addWidget}
            multiSelectMode={multiSelectMode}
            renderConfigPanel={(widget) => renderConfigPanel?.(widget, device)}
          />
        </div>
      </div>

      {/* Widget Library Sidebar */}
      {showLibrary && (
        <div className="w-72 flex-shrink-0">
          <WidgetLibrarySidebar
            onAddWidget={(type) => addWidget(type)}
            filter={libraryFilter}
            className="h-full"
          />
        </div>
      )}
    </div>
  );
}

// Re-export sub-components for direct use
export { WidgetList } from './widget-list';
export { WidgetLibrarySidebar } from './widget-library-sidebar';
export { BulkActionsToolbar } from './bulk-actions-toolbar';
export { DevicePreviewToggle } from './device-preview';
export { WidgetConfigPanel } from './widget-config-panel';
