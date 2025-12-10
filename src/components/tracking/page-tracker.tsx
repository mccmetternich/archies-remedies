'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return;

    // Track page view
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'pageview',
        path: pathname,
      }),
    }).catch(() => {
      // Silently fail - tracking shouldn't break the site
    });
  }, [pathname]);

  return null;
}
