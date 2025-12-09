'use client';

import React from 'react';
import { Play, Plus } from 'lucide-react';

export default function VideoTestimonialsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white flex items-center gap-3">
            <Play className="w-6 h-6 text-[var(--primary)]" />
            Video Testimonials
          </h1>
          <p className="text-gray-400 mt-1">
            Manage customer video reviews
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[#0a0a0a] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors">
          <Plus className="w-4 h-4" />
          Add Video
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-12 text-center">
        <Play className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-lg font-medium text-white mb-2">No video testimonials yet</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          Add customer video reviews to showcase on your website. Videos help build trust and increase conversions.
        </p>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-gray-300 rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors">
          <Plus className="w-4 h-4" />
          Add Your First Video
        </button>
      </div>
    </div>
  );
}
