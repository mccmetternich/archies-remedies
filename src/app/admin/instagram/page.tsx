'use client';

import React from 'react';
import { Instagram, Plus, Link as LinkIcon } from 'lucide-react';

export default function InstagramPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white flex items-center gap-3">
            <Instagram className="w-6 h-6 text-[var(--primary)]" />
            Instagram Feed
          </h1>
          <p className="text-gray-400 mt-1">
            Display Instagram posts on your website
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[#0a0a0a] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors">
          <Plus className="w-4 h-4" />
          Add Post
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-12 text-center">
        <Instagram className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-lg font-medium text-white mb-2">No Instagram posts yet</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          Add Instagram posts to display on your website. You can manually add posts or connect your Instagram account.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-gray-300 rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors">
            <Plus className="w-4 h-4" />
            Add Post Manually
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors">
            <LinkIcon className="w-4 h-4" />
            Connect Instagram
          </button>
        </div>
      </div>
    </div>
  );
}
