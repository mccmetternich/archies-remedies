'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { InternalLinkSelector } from '@/components/admin/internal-link-selector';
import type { IconHighlightColumn, IconHighlightsTheme } from '@/components/widgets/icon-highlights';

// ============================================
// TYPES
// ============================================

interface IconHighlightsConfigProps {
  title: string;
  theme: IconHighlightsTheme;
  columns: IconHighlightColumn[];
  linkText: string;
  linkUrl: string;
  onTitleChange: (title: string) => void;
  onThemeChange: (theme: IconHighlightsTheme) => void;
  onColumnsChange: (columns: IconHighlightColumn[]) => void;
  onLinkTextChange: (text: string) => void;
  onLinkUrlChange: (url: string) => void;
}

// ============================================
// THEME OPTIONS
// ============================================

const themeOptions: { value: IconHighlightsTheme; label: string; description: string }[] = [
  { value: 'blue', label: 'Blue', description: 'Hex blue background, dark text' },
  { value: 'dark', label: 'Dark', description: 'Black background, white text' },
  { value: 'cream', label: 'Cream', description: 'Cream background, dark text' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function IconHighlightsConfig({
  title,
  theme,
  columns,
  linkText,
  linkUrl,
  onTitleChange,
  onThemeChange,
  onColumnsChange,
  onLinkTextChange,
  onLinkUrlChange,
}: IconHighlightsConfigProps) {
  // Ensure we always have exactly 3 columns
  const normalizedColumns: IconHighlightColumn[] = [
    columns[0] || { iconUrl: '', title: '', description: '' },
    columns[1] || { iconUrl: '', title: '', description: '' },
    columns[2] || { iconUrl: '', title: '', description: '' },
  ];

  const updateColumn = (index: number, updates: Partial<IconHighlightColumn>) => {
    const newColumns = [...normalizedColumns];
    newColumns[index] = { ...newColumns[index], ...updates };
    onColumnsChange(newColumns);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Why Choose Us"
          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      {/* Theme Selector */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onThemeChange(option.value)}
              className={cn(
                'flex flex-col items-center p-3 rounded-xl border transition-all',
                theme === option.value
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                  : 'border-[var(--admin-border)] hover:border-[var(--admin-border-light)] bg-[var(--admin-input)]'
              )}
            >
              {/* Theme preview swatch - use explicit colors */}
              <div
                className="w-full h-6 rounded-md mb-2"
                style={{
                  backgroundColor:
                    option.value === 'blue'
                      ? '#bbdae9'
                      : option.value === 'dark'
                        ? '#1a1a1a'
                        : '#f5f1eb',
                  border: option.value === 'cream' ? '1px solid #e5e5e5' : undefined,
                }}
              />
              <span className="text-sm font-medium text-[var(--admin-text-primary)]">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Column Editors */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)]">
          Columns
        </label>

        {normalizedColumns.map((column, index) => (
          <div
            key={index}
            className="p-4 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl space-y-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-sm font-semibold">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-[var(--admin-text-primary)]">
                Column {index + 1}
              </span>
            </div>

            {/* Icon Upload */}
            <MediaPickerButton
              label="Icon Image"
              value={column.iconUrl}
              onChange={(url) => updateColumn(index, { iconUrl: url || '' })}
              helpText="PNG with transparent background (recommended 200x200px)"
              folder="widgets"
            />

            {/* Column Title */}
            <div>
              <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={column.title}
                onChange={(e) => updateColumn(index, { title: e.target.value })}
                placeholder="Feature title"
                className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            {/* Column Description */}
            <div>
              <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">
                Description
              </label>
              <textarea
                value={column.description}
                onChange={(e) => updateColumn(index, { description: e.target.value })}
                placeholder="Brief description of this feature"
                rows={2}
                className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Learn More Link */}
      <div className="pt-4 border-t border-[var(--admin-border)]">
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Learn More Link <span className="text-[var(--admin-text-muted)] font-normal">(optional)</span>
        </label>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">
              Link Text
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => onLinkTextChange(e.target.value)}
              placeholder="Learn More"
              className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <InternalLinkSelector
            label="URL"
            value={linkUrl}
            onChange={onLinkUrlChange}
            placeholder="Select page or enter URL"
          />
        </div>
      </div>
    </div>
  );
}
