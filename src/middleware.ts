import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Session tokens are 64-character hex strings (32 bytes as hex)
// This quick check rejects obviously malformed tokens in middleware
// Full validation happens in API routes via requireAuth()
const SESSION_TOKEN_REGEX = /^[a-f0-9]{64}$/i;

function isValidTokenFormat(token: string | undefined): boolean {
  return !!token && SESSION_TOKEN_REGEX.test(token);
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Create response with custom header containing the full URL
  // This allows server components to access URL params (including ?token=xxx)
  const response = NextResponse.next();
  response.headers.set('x-url', request.url);

  // Preview token → cookie conversion for seamless navigation
  // When URL has ?token=xxx, set a session cookie so subsequent navigation
  // works without needing the token in every URL
  const token = searchParams.get('token');
  if (token && !pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    response.cookies.set('preview_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // No maxAge = session cookie (expires when browser closes)
    });
  }

  // Protect admin routes (except login and auth API)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('admin_session');

    if (!isValidTokenFormat(sessionCookie?.value)) {
      // Redirect to login if no session or malformed token
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Note: Full session validation happens in API routes via requireAuth()
    // Middleware checks token format as a quick first-pass filter
  }

  // Protect admin API routes (except auth endpoints)
  if (
    pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/admin/auth')
  ) {
    const sessionCookie = request.cookies.get('admin_session');

    if (!isValidTokenFormat(sessionCookie?.value)) {
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

    if (isValidTokenFormat(sessionCookie?.value)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
