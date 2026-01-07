'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkActionsToolbarProps {
  selectedCount: number;
  hasHiddenSelected: boolean;
  hasVisibleSelected: boolean;
  onShowAll: () => void;
  onHideAll: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  className?: string;
}

/**
 * Floating bulk actions toolbar that appears when widgets are selected.
 * Positioned on the left side of the viewport, following Kiala's pattern.
 */
export function BulkActionsToolbar({
  selectedCount,
  hasHiddenSelected,
  hasVisibleSelected,
  onShowAll,
  onHideAll,
  onDuplicate,
  onDelete,
  onClearSelection,
  className,
}: BulkActionsToolbarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedCount === 0) return null;

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'fixed left-4 top-1/2 -translate-y-1/2 z-40',
          className
        )}
      >
        <div className="bg-[var(--foreground)] text-white rounded-2xl shadow-2xl border border-gray-700 px-3 py-3 flex flex-col items-center gap-2">
          {/* Selection count badge */}
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--foreground)] flex items-center justify-center text-sm font-bold">
            {selectedCount}
          </div>

          <div className="w-full h-px bg-gray-700 my-1" />

          {/* Show button (if any hidden selected) */}
          {hasHiddenSelected && (
            <button
              type="button"
              onClick={onShowAll}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Show selected"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {/* Hide button (if any visible selected) */}
          {hasVisibleSelected && (
            <button
              type="button"
              onClick={onHideAll}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Hide selected"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          )}

          {/* Duplicate button */}
          <button
            type="button"
            onClick={onDuplicate}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            title="Duplicate selected"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={handleDelete}
            onBlur={() => setShowDeleteConfirm(false)}
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
              showDeleteConfirm
                ? 'bg-red-500 text-white'
                : 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
            )}
            title={showDeleteConfirm ? 'Click again to confirm' : 'Delete selected'}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="w-full h-px bg-gray-700 my-1" />

          {/* Clear selection */}
          <button
            type="button"
            onClick={onClearSelection}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
