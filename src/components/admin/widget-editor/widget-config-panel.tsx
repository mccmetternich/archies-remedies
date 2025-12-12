'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, Trash2, Settings, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getWidgetByType, type WidgetTypeDefinition } from '@/lib/widget-library';

export interface Widget {
  id: string;
  type: string;
  isVisible: boolean;
  config?: Record<string, unknown>;
  // For homepage widgets loaded from database
  isHomepageWidget?: boolean;
  editUrl?: string;
  count?: number;
  activeCount?: number;
}

interface WidgetConfigPanelProps {
  widget: Widget;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleVisibility: () => void;
  onToggleSelect: () => void;
  onDelete: () => void;
  onUpdateConfig: (config: Record<string, unknown>) => void;
  /** Custom config panel component */
  children?: React.ReactNode;
  /** Whether multi-select mode is active */
  multiSelectMode?: boolean;
}

/**
 * Accordion-style widget config panel.
 * Click to expand and show the configuration form.
 */
export function WidgetConfigPanel({
  widget,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleVisibility,
  onToggleSelect,
  onDelete,
  onUpdateConfig,
  children,
  multiSelectMode = false,
}: WidgetConfigPanelProps) {
  const widgetDef = getWidgetByType(widget.type);
  const Icon = widgetDef?.icon || Settings;

  return (
    <div
      className={cn(
        'bg-[var(--admin-input)] border rounded-xl overflow-hidden transition-all',
        isExpanded ? 'border-[var(--primary)]' : 'border-[var(--admin-border)]',
        isSelected && 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--admin-bg)]',
        !widget.isVisible && 'opacity-60'
      )}
    >
      {/* Header Row */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--admin-hover)] transition-colors',
          isExpanded && 'border-b border-[var(--admin-border)]'
        )}
        onClick={onToggleExpand}
      >
        {/* Checkbox (for multi-select) */}
        {multiSelectMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
          />
        )}

        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Icon */}
        <div
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
            widget.isVisible ? 'bg-[var(--primary)]' : 'bg-[var(--admin-hover)]'
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5',
              widget.isVisible ? 'text-[var(--admin-button-text)]' : 'text-[var(--admin-text-muted)]'
            )}
          />
        </div>

        {/* Title & Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--admin-text-primary)]">
              {widgetDef?.name || widget.type}
            </span>
            {widget.isHomepageWidget && widget.count !== undefined && (
              <span className="text-xs text-[var(--admin-text-muted)] bg-[var(--admin-hover)] px-2 py-0.5 rounded-full">
                {widget.activeCount ?? widget.count} active
              </span>
            )}
            {widgetDef?.isGlobal && (
              <span className="text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full">
                Global
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--admin-text-muted)] truncate">
            {widgetDef?.description || 'Widget configuration'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Link to global admin (for homepage widgets) */}
          {widget.isHomepageWidget && widget.editUrl && (
            <Link
              href={widget.editUrl}
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
              title="Manage in dedicated page"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}

          {/* Visibility Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className={cn(
              'p-2 rounded-lg transition-colors',
              widget.isVisible
                ? 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-hover)]'
                : 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
            )}
            title={widget.isVisible ? 'Hide widget' : 'Show widget'}
          >
            {widget.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Delete (only for non-homepage widgets) */}
          {!widget.isHomepageWidget && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete widget"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Expand Indicator */}
          <div className="p-2 text-[var(--admin-text-muted)]">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Config Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[var(--admin-bg)]">
              {children || (
                <div className="text-center py-8 text-[var(--admin-text-muted)]">
                  {widget.isHomepageWidget ? (
                    <div>
                      <p className="mb-2">This widget is managed globally.</p>
                      {widget.editUrl && (
                        <Link
                          href={widget.editUrl}
                          className="inline-flex items-center gap-1.5 text-[var(--primary)] hover:underline"
                        >
                          <Settings className="w-4 h-4" />
                          Configure in dedicated page
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p>No configuration available for this widget type.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
