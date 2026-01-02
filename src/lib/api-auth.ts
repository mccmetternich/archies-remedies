import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/auth';

// Simple in-memory rate limiter for admin APIs
// Tracks requests per user session with sliding window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // Start new window
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const resetIn = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetIn: RATE_LIMIT_WINDOW_MS - (now - entry.windowStart),
  };
}

/**
 * Validates the admin session for API routes
 * Returns the user if valid, or an error response if not
 * Includes rate limiting (100 requests/minute per user)
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

    // Check rate limit for authenticated user
    const rateLimit = checkRateLimit(user.userId);
    if (!rateLimit.allowed) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Rate limit exceeded. Please slow down.' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
              'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
            },
          }
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
