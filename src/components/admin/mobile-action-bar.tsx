'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButton {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}

interface MobileActionBarProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionButton[];
}

export function MobileActionBar({
  isOpen,
  onClose,
  title,
  actions
}: MobileActionBarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="sm:hidden fixed inset-0 bg-black/40 z-40"
          />

          {/* Action Bar */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="sm:hidden fixed bottom-0 left-0 right-0 bg-[var(--admin-card)] border-t border-[var(--admin-border)] rounded-t-2xl z-50 safe-area-pb"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-[var(--admin-border)] rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-4 pb-3 border-b border-[var(--admin-border)]">
                <span className="text-sm font-medium text-[var(--admin-text-primary)] truncate">
                  {title}
                </span>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="p-4 space-y-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    if (action.variant !== 'danger') {
                      // Don't auto-close for danger actions (let confirmation handle it)
                    }
                  }}
                  disabled={action.disabled}
                  className={cn(
                    'w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-colors',
                    action.variant === 'primary' &&
                      'bg-[var(--primary)] text-[var(--admin-button-text)]',
                    action.variant === 'danger' &&
                      'bg-red-500/10 text-red-400 hover:bg-red-500/20',
                    action.variant === 'default' || !action.variant
                      ? 'bg-[var(--admin-input)] text-[var(--admin-text-primary)] hover:bg-[var(--admin-hover)]'
                      : '',
                    action.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>

            {/* Cancel Button */}
            <div className="px-4 pb-4">
              <button
                onClick={onClose}
                className="w-full py-3 text-sm font-medium text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
