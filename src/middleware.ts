import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Handle preview mode URL parameter
  // When ?preview=true is present, set a preview cookie so admin can view draft site
  const hasPreviewParam = searchParams.get('preview') === 'true';
  const hasPreviewToken = request.cookies.get('preview_token');

  if (hasPreviewParam && !hasPreviewToken && !pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    // Set preview cookie and redirect to same page without the param
    const url = new URL(pathname, request.url);
    const response = NextResponse.redirect(url);
    response.cookies.set('preview_token', 'admin-preview', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return response;
  }

  // Protect admin routes (except login and auth API)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('admin_session');

    if (!sessionCookie?.value) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Note: Full session validation happens in API routes via requireAuth()
    // Middleware only checks cookie existence for page routes
    // This is a security trade-off for performance (no DB call in middleware)
  }

  // Protect admin API routes (except auth endpoints)
  if (
    pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/admin/auth')
  ) {
    const sessionCookie = request.cookies.get('admin_session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Full validation happens in the API route handlers via requireAuth()
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
