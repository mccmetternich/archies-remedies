import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { db } from '@/lib/db';
import { siteSettings, pages, products, previewTokens } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';

/**
 * Hybrid preview token system (URL + Cookie)
 *
 * Preview access is granted via:
 * 1. URL token: ?token=xxx (shareable preview links)
 * 2. Session cookie: preview_session (set by middleware when URL token is present)
 *
 * Flow:
 * 1. Admin generates preview link with ?token=xxx
 * 2. User visits link, middleware sets preview_session cookie
 * 3. Subsequent navigation works without token in URL (cookie provides access)
 * 4. Cookie expires when browser closes (session cookie)
 *
 * This allows shareable preview links while enabling seamless navigation.
 */

/**
 * Extract preview token from URL or session cookie
 * Checks in order: URL token → session cookie
 */
export async function getPreviewTokenFromRequest(): Promise<string | null> {
  // First, try to get token from URL (via x-url header set by middleware)
  const headersList = await headers();
  const xUrl = headersList.get('x-url');
  const referer = headersList.get('referer');

  const url = xUrl || referer;
  if (url) {
    try {
      const urlObj = new URL(url);
      const urlToken = urlObj.searchParams.get('token');
      if (urlToken) return urlToken;
    } catch {
      // Invalid URL, continue to check cookie
    }
  }

  // Fall back to session cookie (set by middleware when URL token was present)
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('preview_session');
    if (sessionCookie?.value) {
      return sessionCookie.value;
    }
  } catch {
    // Cookies not available (e.g., during static generation)
  }

  return null;
}

/**
 * Validate a preview token against the database
 * Returns true if token is valid and not expired
 */
export async function validatePreviewToken(token: string): Promise<boolean> {
  if (!token) return false;

  const now = new Date().toISOString();

  const [validToken] = await db
    .select()
    .from(previewTokens)
    .where(
      and(
        eq(previewTokens.token, token),
        gt(previewTokens.expiresAt, now)
      )
    )
    .limit(1);

  return !!validToken;
}

/**
 * Check if user has team access via cookie
 * Team access allows browsing the site when in draft mode
 */
export async function hasTeamAccess(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const teamToken = cookieStore.get('team_access_token');
    return !!teamToken?.value;
  } catch {
    return false;
  }
}

/**
 * Check if the site is in draft mode and redirect to coming-soon if needed.
 *
 * Access is granted if:
 * 1. Site is NOT in draft mode (siteInDraftMode = false)
 * 2. URL contains a valid, non-expired preview token (?token=xxx)
 * 3. User has team access (via team_access_token cookie)
 *
 * Note: Admin session alone does NOT grant access - admins must use the preview link with token
 *
 * @param token - Optional preview token from URL (if already extracted)
 */
export async function checkDraftMode(token?: string | null): Promise<{ isInDraftMode: boolean; hasPreviewAccess: boolean }> {
  // Get site settings from database
  const [settings] = await db.select().from(siteSettings).limit(1);

  const isInDraftMode = settings?.siteInDraftMode ?? false;

  // If not in draft mode, allow access
  if (!isInDraftMode) {
    return { isInDraftMode: false, hasPreviewAccess: false };
  }

  // Check for team access cookie first
  const hasTeam = await hasTeamAccess();
  if (hasTeam) {
    return { isInDraftMode: true, hasPreviewAccess: true };
  }

  // Check for valid preview token
  const previewToken = token ?? await getPreviewTokenFromRequest();
  const hasPreviewAccess = previewToken ? await validatePreviewToken(previewToken) : false;

  if (hasPreviewAccess) {
    return { isInDraftMode: true, hasPreviewAccess: true };
  }

  // No access - redirect to coming soon
  redirect('/coming-soon');
}

/**
 * Check if a specific page is in draft mode (isActive = false).
 *
 * @param slug - Page slug to check
 * @param token - Optional preview token from URL
 */
export async function checkPageDraft(slug: string, token?: string | null): Promise<{ isDraft: boolean }> {
  // Check for team access first
  const hasTeam = await hasTeamAccess();
  if (hasTeam) {
    return { isDraft: false };
  }

  // Check for valid preview token
  const previewToken = token ?? await getPreviewTokenFromRequest();
  const hasAccess = previewToken ? await validatePreviewToken(previewToken) : false;

  if (hasAccess) {
    // With valid token, allow access to any page
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
 *
 * @param productSlug - Product slug to check
 * @param token - Optional preview token from URL
 */
export async function checkProductDraft(productSlug: string, token?: string | null): Promise<{ isDraft: boolean }> {
  // Check for team access first
  const hasTeam = await hasTeamAccess();
  if (hasTeam) {
    return { isDraft: false };
  }

  // Check for valid preview token
  const previewToken = token ?? await getPreviewTokenFromRequest();
  const hasAccess = previewToken ? await validatePreviewToken(previewToken) : false;

  if (hasAccess) {
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
 *
 * @param token - Optional preview token from URL
 */
export async function getDraftModeStatus(token?: string | null): Promise<{
  isInDraftMode: boolean;
  hasAccess: boolean;
}> {
  const [settings] = await db.select().from(siteSettings).limit(1);
  const isInDraftMode = settings?.siteInDraftMode ?? false;

  if (!isInDraftMode) {
    return { isInDraftMode: false, hasAccess: true };
  }

  // Check team access first
  const hasTeam = await hasTeamAccess();
  if (hasTeam) {
    return { isInDraftMode, hasAccess: true };
  }

  const previewToken = token ?? await getPreviewTokenFromRequest();
  const hasAccess = previewToken ? await validatePreviewToken(previewToken) : false;

  return { isInDraftMode, hasAccess };
}

/**
 * Check if user has preview access via URL token.
 *
 * @param token - Optional preview token (if already extracted from URL)
 */
export async function hasPreviewAccess(token?: string | null): Promise<boolean> {
  const previewToken = token ?? await getPreviewTokenFromRequest();
  if (!previewToken) return false;
  return validatePreviewToken(previewToken);
}

/**
 * Helper to build URLs that preserve the preview token
 * Use this for internal navigation links when in preview mode
 */
export function buildPreviewUrl(path: string, token: string | null): string {
  if (!token) return path;

  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}token=${token}`;
}
