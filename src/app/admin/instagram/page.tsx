'use client';

import React from 'react';
import { Instagram, Plus, Link as LinkIcon } from 'lucide-react';

export default function InstagramPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[var(--admin-text-primary)] flex items-center gap-3">
            <Instagram className="w-6 h-6 text-[var(--primary)]" />
            Instagram Feed
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-1">
            Display Instagram posts on your website
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors">
          <Plus className="w-4 h-4" />
          Add Post
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-12 text-center">
        <Instagram className="w-16 h-16 mx-auto mb-4 text-[var(--admin-text-muted)]" />
        <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-2">No Instagram posts yet</h3>
        <p className="text-sm text-[var(--admin-text-muted)] mb-6 max-w-md mx-auto">
          Add Instagram posts to display on your website. You can manually add posts or connect your Instagram account.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg font-medium hover:bg-[var(--admin-hover)] transition-colors">
            <Plus className="w-4 h-4" />
            Add Post Manually
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-[var(--admin-text-primary)] rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors">
            <LinkIcon className="w-4 h-4" />
            Connect Instagram
          </button>
        </div>
      </div>
    </div>
  );
}
