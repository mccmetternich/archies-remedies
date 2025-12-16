'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Save, Loader2, Check, Trash2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  // Breadcrumb configuration
  breadcrumbs: Breadcrumb[];

  // Title (entity name or "New Product", etc.)
  title: string;
  subtitle?: string; // e.g., "/products/eye-drops"

  // Draft/Live status
  status?: 'draft' | 'live';
  onStatusToggle?: () => void;
  statusDisabled?: boolean;
  statusNote?: string; // e.g., "(site draft)"

  // View button configuration
  viewUrl?: string;
  viewLabel?: string; // "View Live", "Preview", "View Draft"
  onView?: () => Promise<void> | void; // Custom view handler (e.g., for generating preview tokens)

  // Save button
  hasChanges?: boolean;
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
  saveLabel?: string; // "Save", "Create Product", etc.

  // Delete button
  onDelete?: () => void;
  showDelete?: boolean;
  deleteLabel?: string;

  // Back navigation
  backHref?: string;
}

export function AdminPageHeader({
  breadcrumbs,
  title,
  subtitle,
  status,
  onStatusToggle,
  statusDisabled = false,
  statusNote,
  viewUrl,
  viewLabel,
  onView,
  hasChanges = false,
  onSave,
  saving = false,
  saved = false,
  saveLabel = 'Save Changes',
  onDelete,
  showDelete = true,
  deleteLabel = 'Delete',
  backHref,
}: AdminPageHeaderProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleView = async () => {
    if (onView) {
      await onView();
    } else if (viewUrl) {
      window.open(viewUrl, '_blank');
    }
  };

  const isDraft = status === 'draft';
  const computedViewLabel = viewLabel || (isDraft ? 'View Draft' : 'View Live');

  return (
    <>
      <div className="sticky top-0 z-40 bg-[var(--admin-bg)] border-b border-[var(--admin-border)] px-6 py-4">
        {/* Top row: Breadcrumbs and Controls */}
        <div className="flex items-center justify-between mb-3">
          {/* Left side: Back button and breadcrumbs */}
          <div className="flex items-center gap-4">
            {backHref && (
              <Link
                href={backHref}
                className="p-2 rounded-lg hover:bg-[var(--admin-input)] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <nav className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={index}>
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-[var(--admin-text-primary)] transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={isLast ? 'text-[var(--admin-text-primary)] font-medium' : ''}>
                        {crumb.label}
                      </span>
                    )}
                    {!isLast && <span>/</span>}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Right side: All controls aligned right */}
          <div className="flex items-center gap-3">
            {/* Draft/Live Toggle */}
            {status && onStatusToggle && (
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  isDraft ? "text-orange-400" : "text-[var(--admin-text-muted)]"
                )}>
                  Draft
                </span>
                <button
                  onClick={onStatusToggle}
                  disabled={statusDisabled}
                  className={cn(
                    "relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--admin-bg)]",
                    statusDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  style={{
                    backgroundColor: isDraft ? '#f97316' : '#22c55e'
                  }}
                >
                  <span
                    className={cn(
                      "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg",
                      isDraft ? "translate-x-1" : "translate-x-9"
                    )}
                  />
                </button>
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  !isDraft ? "text-green-400" : "text-[var(--admin-text-muted)]"
                )}>
                  Live
                </span>
                {statusNote && (
                  <span className="text-xs text-[var(--admin-text-muted)]">{statusNote}</span>
                )}
              </div>
            )}

            {/* View Button */}
            {(viewUrl || onView) && (
              <button
                onClick={handleView}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isDraft
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                )}
              >
                <ExternalLink className="w-4 h-4" />
                {computedViewLabel}
              </button>
            )}

            {/* Save Button - only shows when hasChanges */}
            {hasChanges && onSave && (
              <button
                onClick={onSave}
                disabled={saving}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
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
                    {saveLabel}
                  </>
                )}
              </button>
            )}

            {/* Delete Button - icon only */}
            {showDelete && onDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                title={deleteLabel}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom row: Large Title and Subtitle */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--admin-text-primary)]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--admin-text-muted)] mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-[var(--admin-card)] rounded-xl p-6 w-full max-w-md mx-4 shadow-xl border border-[var(--admin-border)]">
            <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-2">
              {deleteLabel}?
            </h3>
            <p className="text-[var(--admin-text-secondary)] mb-6">
              Are you sure you want to delete this? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Deleting...
                  </>
                ) : (
                  `Yes, ${deleteLabel}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
