'use client';

import React from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';

/**
 * Floating cog badge that links to team access login.
 * Positioned in the bottom-right corner of the viewport.
 */
export function TeamAccessBadge() {
  return (
    <Link
      href="/team-access"
      className="fixed bottom-4 right-4 z-50 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-[#1a1a1a] hover:border-[#bbdae9] hover:bg-white transition-all duration-200 group"
      aria-label="Team Access"
    >
      <Settings className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:rotate-90" />
    </Link>
  );
}
