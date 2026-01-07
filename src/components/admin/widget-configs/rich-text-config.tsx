'use client';

import React from 'react';
import { RichTextEditor } from '@/components/admin/rich-text-editor';

// ============================================
// TYPES
// ============================================

export type RichTextTheme = 'light' | 'dark' | 'cream';

interface RichTextConfigProps {
  content: string;
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  theme: RichTextTheme;
  onContentChange: (content: string) => void;
  onMaxWidthChange: (maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full') => void;
  onThemeChange: (theme: RichTextTheme) => void;
}

// ============================================
// WIDTH OPTIONS
// ============================================

const maxWidthOptions: { value: RichTextConfigProps['maxWidth']; label: string; desc: string }[] = [
  { value: 'sm', label: 'Small', desc: '640px' },
  { value: 'md', label: 'Medium', desc: '768px' },
  { value: 'lg', label: 'Large', desc: '1024px' },
  { value: 'xl', label: 'XL', desc: '1280px' },
  { value: 'full', label: 'Full', desc: 'No limit' },
];

// ============================================
// THEME OPTIONS
// ============================================

const themeOptions: { value: RichTextTheme; label: string; bgColor: string; textColor: string }[] = [
  { value: 'light', label: 'Light', bgColor: '#ffffff', textColor: '#333333' },
  { value: 'dark', label: 'Dark', bgColor: '#1a1a1a', textColor: '#ffffff' },
  { value: 'cream', label: 'Cream', bgColor: '#f5f1eb', textColor: '#333333' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function RichTextConfig({
  content,
  maxWidth,
  theme,
  onContentChange,
  onMaxWidthChange,
  onThemeChange,
}: RichTextConfigProps) {
  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Theme
        </label>
        <div className="flex gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onThemeChange(option.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                theme === option.value
                  ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--admin-card)]'
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: option.bgColor,
                color: option.textColor,
                borderColor: option.value === 'light' ? '#e5e5e5' : 'transparent',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Max Width */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Content Width
        </label>
        <div className="flex gap-2">
          {maxWidthOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onMaxWidthChange(option.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                maxWidth === option.value
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rich Text Editor */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Content
        </label>
        <RichTextEditor
          value={content}
          onChange={onContentChange}
          placeholder="Enter your content here... Use the toolbar to format text, add headings, lists, and links."
          minHeight="300px"
        />
      </div>

      {/* Help Text */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400">
          <strong>Tip:</strong> This widget is perfect for legal pages, about sections, and other text-heavy content.
          You can paste formatted text or use the toolbar to style your content.
        </p>
      </div>
    </div>
  );
}
