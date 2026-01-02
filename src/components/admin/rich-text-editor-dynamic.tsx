'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Loading placeholder for the rich text editor
function EditorLoadingPlaceholder({ minHeight = '400px' }: { minHeight?: string }) {
  return (
    <div
      className="flex items-center justify-center bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg"
      style={{ minHeight }}
    >
      <div className="flex items-center gap-2 text-[var(--admin-text-muted)]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading editor...</span>
      </div>
    </div>
  );
}

/**
 * Dynamically imported RichTextEditor for better initial page load performance.
 * Use this instead of importing RichTextEditor directly in admin pages.
 *
 * Example:
 * ```tsx
 * import { RichTextEditorDynamic } from '@/components/admin/rich-text-editor-dynamic';
 *
 * <RichTextEditorDynamic
 *   value={content}
 *   onChange={setContent}
 *   placeholder="Write your content..."
 * />
 * ```
 */
export const RichTextEditorDynamic = dynamic(
  () => import('./rich-text-editor').then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <EditorLoadingPlaceholder />,
  }
);

// Re-export props type for convenience
export type { RichTextEditorProps } from './rich-text-editor';
