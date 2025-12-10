import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/auth';

/**
 * Validates the admin session for API routes
 * Returns the user if valid, or an error response if not
 */
export async function requireAuth(): Promise<
  | { authenticated: true; user: { userId: string; username: string } }
  | { authenticated: false; response: NextResponse }
> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        ),
      };
    }

    const user = await validateSession(sessionToken);

    if (!user) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Invalid or expired session' },
          { status: 401 }
        ),
      };
    }

    return { authenticated: true, user };
  } catch (error) {
    console.error('Auth validation error:', error);
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      ),
    };
  }
}
