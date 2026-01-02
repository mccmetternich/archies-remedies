'use client';

/**
 * Shared Draggable Widget Row Component
 *
 * This is the SINGLE SOURCE OF TRUTH for widget row rendering in admin editors.
 * Used by page admin, product admin, and blog admin to ensure consistency.
 *
 * Features:
 * - Drag handle for reordering
 * - Expandable configuration drawer
 * - Desktop/Mobile visibility toggles
 * - Live/Draft status toggle
 * - Delete button with confirmation
 * - Widget icon and description from centralized library
 */

import React from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Reorder } from 'framer-motion';
import {
  GripVertical,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Trash2,
  ChevronDown,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WIDGET_TYPES } from '@/lib/widget-library';
import { WidgetConfigPanel } from '@/components/admin/widget-config-panel';

// Unified widget interface that works across all editors
export interface Widget {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  config?: Record<string, unknown>;
  // Visibility can be handled differently - we normalize it
  isVisible?: boolean;
  visible?: boolean;
  showOnDesktop?: boolean;
  showOnMobile?: boolean;
  // Optional metadata
  count?: number;
  activeCount?: number;
  isHomepageWidget?: boolean;
  editUrl?: string;
}

interface DraggableWidgetRowProps {
  widget: Widget;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<Widget>) => void;
  onDelete: () => void;
  // Optional: custom config component for special widgets
  renderCustomConfig?: (widget: Widget, onUpdate: (updates: Partial<Widget>) => void) => React.ReactNode;
  // Optional: show device visibility toggles (default: true)
  showDeviceToggles?: boolean;
  // Optional: show item count badge
  showCount?: boolean;
}

export function DraggableWidgetRow({
  widget,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  renderCustomConfig,
  showDeviceToggles = true,
  showCount = true,
}: DraggableWidgetRowProps) {
  const dragControls = useDragControls();

  // Get widget info from centralized library
  const widgetDef = WIDGET_TYPES.find((w) => w.type === widget.type);
  const Icon = widgetDef?.icon || FileText;
  const widgetLabel = widgetDef?.name || widget.type;
  const widgetDescription = widgetDef?.description || '';

  // Normalize visibility - support both isVisible and visible
  const isWidgetVisible = widget.isVisible ?? widget.visible ?? true;

  // Normalize device visibility - default to true if not specified
  const showOnDesktop = widget.showOnDesktop ?? (widget.config as Record<string, unknown>)?.showOnDesktop !== false;
  const showOnMobile = widget.showOnMobile ?? (widget.config as Record<string, unknown>)?.showOnMobile !== false;

  const handleVisibilityToggle = () => {
    // Update whichever property exists
    if ('isVisible' in widget) {
      onUpdate({ isVisible: !isWidgetVisible });
    } else {
      onUpdate({ visible: !isWidgetVisible });
    }
  };

  const handleDesktopToggle = () => {
    if ('showOnDesktop' in widget) {
      onUpdate({ showOnDesktop: !showOnDesktop });
    } else {
      // Store in config
      const cfg = (widget.config || {}) as Record<string, unknown>;
      onUpdate({ config: { ...cfg, showOnDesktop: !showOnDesktop } });
    }
  };

  const handleMobileToggle = () => {
    if ('showOnMobile' in widget) {
      onUpdate({ showOnMobile: !showOnMobile });
    } else {
      // Store in config
      const cfg = (widget.config || {}) as Record<string, unknown>;
      onUpdate({ config: { ...cfg, showOnMobile: !showOnMobile } });
    }
  };

  const handleDelete = () => {
    if (confirm('Delete this widget?')) {
      onDelete();
    }
  };

  return (
    <Reorder.Item
      value={widget}
      dragListener={false}
      dragControls={dragControls}
      className="bg-[var(--admin-input)]"
    >
      <div
        className={cn(
          'flex items-center gap-4 p-4 transition-colors',
          isExpanded ? 'bg-[var(--admin-sidebar)]' : 'hover:bg-[var(--admin-sidebar)]'
        )}
      >
        {/* Drag Handle */}
        <div
          className="cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)]" />
        </div>

        {/* Index */}
        <span className="text-xs text-[var(--admin-text-muted)] font-mono w-5">
          {index + 1}
        </span>

        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--primary)]" />
        </div>

        {/* Title & Description - Clickable to expand */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={onToggleExpand}
        >
          {/* Always show widget type name as primary label */}
          <h4 className="font-medium text-[var(--admin-text-primary)] truncate">
            {widgetLabel}
            {widget.title && widget.title !== widgetLabel && (
              <span className="text-[var(--admin-text-muted)] font-normal ml-2">
                &ldquo;{widget.title}&rdquo;
              </span>
            )}
          </h4>
          <p className="text-xs text-[var(--admin-text-muted)] truncate">
            {widget.subtitle || widgetDescription}
          </p>
        </div>

        {/* Item Count Badge */}
        {showCount && widget.count !== undefined && (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--admin-hover)] text-[var(--admin-text-muted)]">
            {widget.activeCount !== undefined ? `${widget.activeCount}/${widget.count}` : widget.count} items
          </span>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Desktop visibility toggle */}
          {showDeviceToggles && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDesktopToggle();
              }}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all',
                showOnDesktop
                  ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
                  : 'text-[var(--admin-text-muted)] bg-[var(--admin-input)] hover:bg-[var(--admin-hover)]'
              )}
              title={showOnDesktop ? 'Visible on desktop - click to hide' : 'Hidden on desktop - click to show'}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
          )}

          {/* Mobile visibility toggle */}
          {showDeviceToggles && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMobileToggle();
              }}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all',
                showOnMobile
                  ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
                  : 'text-[var(--admin-text-muted)] bg-[var(--admin-input)] hover:bg-[var(--admin-hover)]'
              )}
              title={showOnMobile ? 'Visible on mobile - click to hide' : 'Hidden on mobile - click to show'}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          )}

          {/* Widget visibility (draft/live) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVisibilityToggle();
            }}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all',
              isWidgetVisible
                ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
                : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
            )}
            title={isWidgetVisible ? 'Live - click to set as draft' : 'Draft - click to publish'}
          >
            {isWidgetVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isWidgetVisible ? 'Live' : 'Draft'}</span>
          </button>

          {/* Separator */}
          <div className="w-px h-5 bg-[var(--admin-border)]" />

          {/* Expand/Collapse Chevron */}
          <button
            onClick={onToggleExpand}
            className="p-1.5 rounded-md text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-hover)] transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
            />
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-1.5 rounded-md text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete widget"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Widget Config Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
              {renderCustomConfig ? (
                renderCustomConfig(widget, onUpdate)
              ) : (
                <WidgetConfigPanel
                  widget={widget}
                  onUpdate={onUpdate}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}
