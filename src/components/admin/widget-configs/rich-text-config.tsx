'use client';

import React from 'react';
import { RichTextEditor } from '@/components/admin/rich-text-editor';

// ============================================
// TYPES
// ============================================

interface RichTextConfigProps {
  content: string;
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onContentChange: (content: string) => void;
  onMaxWidthChange: (maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full') => void;
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
// MAIN COMPONENT
// ============================================

export function RichTextConfig({
  content,
  maxWidth,
  onContentChange,
  onMaxWidthChange,
}: RichTextConfigProps) {
  return (
    <div className="space-y-6">
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
