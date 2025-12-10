import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { siteSettings, pages, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Check if the site is in draft mode and redirect to coming-soon if needed.
 * This should be called at the top of server components that need draft protection.
 *
 * Access is granted if:
 * 1. Site is NOT in draft mode (siteInDraftMode = false)
 * 2. User has a valid preview_token cookie (from clicking "View Draft" in admin)
 *
 * Note: Admin session alone does NOT grant access - admins must use the preview link
 */
export async function checkDraftMode(): Promise<{ isInDraftMode: boolean; hasPreviewAccess: boolean }> {
  // Get site settings from database
  const [settings] = await db.select().from(siteSettings).limit(1);

  const isInDraftMode = settings?.siteInDraftMode ?? false;

  // Check for preview token
  const cookieStore = await cookies();
  const previewToken = cookieStore.get('preview_token');
  const hasPreviewAccess = !!previewToken?.value;

  // If not in draft mode, allow access
  if (!isInDraftMode) {
    return { isInDraftMode: false, hasPreviewAccess };
  }

  // If user has preview token, allow access
  if (hasPreviewAccess) {
    return { isInDraftMode: true, hasPreviewAccess: true };
  }

  // No access - redirect to coming soon
  redirect('/coming-soon');
}

/**
 * Check if a specific page is in draft mode (isActive = false).
 * If the page is draft:
 * - With preview token → allow access
 * - Without preview token → redirect to homepage (or coming-soon if homepage is also draft)
 *
 * This should be called AFTER checkDraftMode() in the layout has passed.
 */
export async function checkPageDraft(slug: string): Promise<{ isDraft: boolean }> {
  // Check for preview token first
  const cookieStore = await cookies();
  const previewToken = cookieStore.get('preview_token');

  if (previewToken?.value) {
    // With preview token, allow access to any page
    return { isDraft: false };
  }

  // Get the page
  const [page] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);

  if (!page) {
    // Page doesn't exist, let the page component handle 404
    return { isDraft: false };
  }

  // If page is active, allow access
  if (page.isActive) {
    return { isDraft: false };
  }

  // Page is draft and no preview token - need to redirect
  // Check if homepage is active
  if (slug !== 'home') {
    const [homePage] = await db.select().from(pages).where(eq(pages.slug, 'home')).limit(1);
    if (homePage?.isActive) {
      redirect('/');
    }
  }

  // Homepage is also draft or we're on homepage - redirect to coming-soon
  redirect('/coming-soon');
}

/**
 * Check if a specific product is in draft mode (isActive = false).
 * Similar logic to checkPageDraft.
 */
export async function checkProductDraft(productSlug: string): Promise<{ isDraft: boolean }> {
  // Check for preview token first
  const cookieStore = await cookies();
  const previewToken = cookieStore.get('preview_token');

  if (previewToken?.value) {
    return { isDraft: false };
  }

  // Get the product
  const [product] = await db.select().from(products).where(eq(products.slug, productSlug)).limit(1);

  if (!product) {
    return { isDraft: false };
  }

  if (product.isActive) {
    return { isDraft: false };
  }

  // Product is draft - redirect to homepage (or coming-soon)
  const [homePage] = await db.select().from(pages).where(eq(pages.slug, 'home')).limit(1);
  if (homePage?.isActive) {
    redirect('/');
  }

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

  // Only preview token grants access, not admin session
  const hasAccess = !!previewToken?.value;

  return { isInDraftMode, hasAccess };
}

/**
 * Check if user has preview access (has valid preview_token cookie).
 */
export async function hasPreviewAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  const previewToken = cookieStore.get('preview_token');
  return !!previewToken?.value;
}
