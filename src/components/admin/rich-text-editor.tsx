'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo,
  RemoveFormatting,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
  minHeight = '400px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showHtml, setShowHtml] = useState(false);
  const [isInternalChange, setIsInternalChange] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isInternalChange) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setIsInternalChange(false);
  }, [value, isInternalChange]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      setIsInternalChange(true);
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const tools = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
    { icon: Strikethrough, command: 'strikeThrough', title: 'Strikethrough' },
    { divider: true },
    { icon: Heading1, command: 'formatBlock', value: 'h1', title: 'Heading 1' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading 2' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Heading 3' },
    { divider: true },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
    { divider: true },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { divider: true },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote (XXL styled block)' },
    { icon: Code, command: 'formatBlock', value: 'pre', title: 'Code Block' },
    { icon: Link, action: handleLink, title: 'Insert Link' },
    { divider: true },
    { icon: Undo, command: 'undo', title: 'Undo (Ctrl+Z)' },
    { icon: Redo, command: 'redo', title: 'Redo (Ctrl+Y)' },
    { divider: true },
    { icon: RemoveFormatting, command: 'removeFormat', title: 'Clear Formatting' },
  ];

  return (
    <div className={cn('border border-[var(--admin-border-light)] rounded-xl overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-2 border-b border-[var(--admin-border-light)] bg-[var(--admin-input)] flex-wrap">
        {tools.map((tool, index) => {
          if ('divider' in tool) {
            return <div key={index} className="w-px h-6 bg-[var(--admin-border-light)] mx-1" />;
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                if ('action' in tool && tool.action) {
                  tool.action();
                } else if (tool.command) {
                  execCommand(tool.command, tool.value);
                }
              }}
              className="p-2 rounded-md text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-card)] transition-colors"
              title={tool.title}
            >
              <tool.icon className="w-4 h-4" />
            </button>
          );
        })}

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => setShowHtml(!showHtml)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            showHtml
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-card)]'
          )}
        >
          HTML
        </button>
      </div>

      {/* Editor */}
      {showHtml ? (
        <textarea
          value={value}
          onChange={handleHtmlChange}
          className="w-full p-4 font-mono text-sm resize-y focus:outline-none bg-[var(--admin-input)] text-[var(--admin-text-primary)]"
          style={{ minHeight }}
          placeholder="<p>Enter HTML...</p>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className={cn(
            'p-4 focus:outline-none bg-[var(--admin-input)] text-[var(--admin-text-primary)]',
            // Styled blockquotes - XXL text for blog impact
            '[&_blockquote]:text-2xl [&_blockquote]:md:text-3xl [&_blockquote]:font-medium [&_blockquote]:leading-relaxed',
            '[&_blockquote]:border-l-4 [&_blockquote]:border-[var(--primary)] [&_blockquote]:pl-6 [&_blockquote]:py-4 [&_blockquote]:my-6',
            '[&_blockquote]:bg-[var(--admin-card)] [&_blockquote]:rounded-r-xl [&_blockquote]:italic',
            // Headers
            '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-[var(--admin-text-primary)]',
            '[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-[var(--admin-text-primary)]',
            '[&_h3]:text-xl [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-[var(--admin-text-primary)]',
            // Lists
            '[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4',
            '[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4',
            '[&_li]:my-1',
            // Links
            '[&_a]:text-[var(--primary)] [&_a]:underline [&_a]:hover:opacity-80',
            // Code
            '[&_pre]:bg-[var(--admin-card)] [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:font-mono [&_pre]:text-sm [&_pre]:my-4',
            '[&_code]:bg-[var(--admin-card)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm',
            // Paragraphs
            '[&_p]:my-4 [&_p]:leading-relaxed'
          )}
          style={{ minHeight, whiteSpace: 'pre-wrap' }}
          data-placeholder={placeholder}
        />
      )}

      {/* Help text */}
      <div className="px-4 py-2 bg-[var(--admin-input)] border-t border-[var(--admin-border-light)]">
        <p className="text-xs text-[var(--admin-text-muted)]">
          Tip: Blockquotes render as large styled text on the blog. Use them for impactful quotes or key takeaways.
        </p>
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--admin-text-placeholder);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
