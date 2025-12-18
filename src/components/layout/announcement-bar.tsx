'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface AnnouncementBarProps {
  text: string;
  linkUrl?: string | null;
  linkText?: string | null;
  theme?: 'light' | 'dark';
}

export function AnnouncementBar({ text, linkUrl, linkText, theme = 'light' }: AnnouncementBarProps) {
  const isDark = theme === 'dark';

  return (
    <div className={isDark ? "bg-black py-1.5 md:py-3" : "bg-[var(--primary)] py-1.5 md:py-3"}>
      <div className="container">
        <div className={`flex items-center justify-center gap-3 text-xs md:text-sm ${isDark ? 'text-white' : 'text-[var(--foreground)]'}`}>
          <span className="text-center font-medium">{text}</span>
          {linkUrl && linkText && (
            <Link
              href={linkUrl}
              className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-2 hover:no-underline transition-all"
            >
              {linkText}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
