import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';

/**
 * Check if the site is in draft mode and redirect to coming-soon if needed.
 * This should be called at the top of server components that need draft protection.
 *
 * Access is granted if:
 * 1. Site is NOT in draft mode (siteInDraftMode = false)
 * 2. User has a valid preview_token cookie
 * 3. User has an admin_session cookie (admin user)
 */
export async function checkDraftMode(): Promise<{ isInDraftMode: boolean }> {
  // Get site settings from database
  const [settings] = await db.select().from(siteSettings).limit(1);

  const isInDraftMode = settings?.siteInDraftMode ?? false;

  // If not in draft mode, allow access
  if (!isInDraftMode) {
    return { isInDraftMode: false };
  }

  // Check for preview token or admin session
  const cookieStore = await cookies();
  const previewToken = cookieStore.get('preview_token');
  const adminSession = cookieStore.get('admin_session');

  // If user has preview token or admin session, allow access
  if (previewToken?.value || adminSession?.value) {
    return { isInDraftMode: true };
  }

  // No access - redirect to coming soon
  redirect('/coming-soon');
}

/**
 * Get draft mode status without redirecting.
 * Useful for UI components that need to know draft status.
 */
export async function getDraftModeStatus(): Promise<{
  isInDraftMode: boolean;
  hasAccess: boolean;
}> {
  const [settings] = await db.select().from(siteSettings).limit(1);
  const isInDraftMode = settings?.siteInDraftMode ?? false;

  if (!isInDraftMode) {
    return { isInDraftMode: false, hasAccess: true };
  }

  const cookieStore = await cookies();
  const previewToken = cookieStore.get('preview_token');
  const adminSession = cookieStore.get('admin_session');

  const hasAccess = !!(previewToken?.value || adminSession?.value);

  return { isInDraftMode, hasAccess };
}
