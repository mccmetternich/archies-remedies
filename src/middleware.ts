import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/coming-soon'
  ) {
    return NextResponse.next();
  }

  // Check for draft mode on public pages (not admin)
  if (!pathname.startsWith('/admin')) {
    const draftModeCookie = request.cookies.get('site_draft_mode');
    const previewToken = request.cookies.get('preview_token');
    const adminSession = request.cookies.get('admin_session');

    // If site is in draft mode and user doesn't have preview access
    if (draftModeCookie?.value === 'true') {
      // Allow access if they have preview token or admin session
      if (!previewToken?.value && !adminSession?.value) {
        // Redirect to coming soon page
        return NextResponse.redirect(new URL('/coming-soon', request.url));
      }
    }
  }

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('admin_session');

    if (!sessionCookie?.value) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Redirect /admin/login to /admin if already logged in
  if (pathname === '/admin/login') {
    const sessionCookie = request.cookies.get('admin_session');

    if (sessionCookie?.value) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
