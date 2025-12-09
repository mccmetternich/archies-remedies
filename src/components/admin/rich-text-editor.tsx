'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
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
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { divider: true },
    { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading 2' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Heading 3' },
    { divider: true },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { divider: true },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
    { icon: Link, action: handleLink, title: 'Insert Link' },
    { divider: true },
    { icon: Undo, command: 'undo', title: 'Undo' },
    { icon: Redo, command: 'redo', title: 'Redo' },
  ];

  return (
    <div className={cn('border border-[var(--border)] rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-[var(--border)] bg-[var(--muted)] flex-wrap">
        {tools.map((tool, index) => {
          if ('divider' in tool) {
            return <div key={index} className="w-px h-6 bg-[var(--border)] mx-1" />;
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
              className="p-2 rounded hover:bg-[var(--border)] transition-colors"
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
            'px-2 py-1 rounded text-xs font-medium transition-colors',
            showHtml ? 'bg-[var(--foreground)] text-white' : 'hover:bg-[var(--border)]'
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
          className="w-full min-h-[200px] p-4 font-mono text-sm resize-y focus:outline-none"
          placeholder="<p>Enter HTML...</p>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="min-h-[200px] p-4 prose prose-sm max-w-none focus:outline-none"
          style={{ whiteSpace: 'pre-wrap' }}
          data-placeholder={placeholder}
        />
      )}

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--muted-foreground);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
