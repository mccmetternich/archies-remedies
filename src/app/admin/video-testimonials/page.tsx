'use client';

import React from 'react';
import { Play, Plus } from 'lucide-react';

export default function VideoTestimonialsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[var(--admin-text-primary)] flex items-center gap-3">
            <Play className="w-6 h-6 text-[var(--primary)]" />
            Video Testimonials
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-1">
            Manage customer video reviews
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors">
          <Plus className="w-4 h-4" />
          Add Video
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-12 text-center">
        <Play className="w-16 h-16 mx-auto mb-4 text-[var(--admin-text-muted)]" />
        <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-2">No video testimonials yet</h3>
        <p className="text-sm text-[var(--admin-text-muted)] mb-6 max-w-md mx-auto">
          Add customer video reviews to showcase on your website. Videos help build trust and increase conversions.
        </p>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg font-medium hover:bg-[var(--admin-hover)] transition-colors">
          <Plus className="w-4 h-4" />
          Add Your First Video
        </button>
      </div>
    </div>
  );
}
