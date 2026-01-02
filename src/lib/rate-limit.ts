/**
 * Simple in-memory rate limiter for API routes
 * Note: This resets on server restart. For production at scale,
 * consider using Redis or a distributed rate limiting service.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key
 * @param key - Unique identifier (e.g., IP address, user ID)
 * @param limit - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with success status and remaining requests
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  // No record or expired - create new
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  // At or over limit
  if (record.count >= limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  // Increment count
  record.count++;
  return { success: true, remaining: limit - record.count, resetAt: record.resetAt };
}

/**
 * Get client IP from request headers
 * Works with Vercel, Cloudflare, and other proxies
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;

  // Try various headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback
  return 'unknown';
}

// Common rate limit configurations
export const RATE_LIMITS = {
  // Public form submissions: 5 per minute per IP
  FORM_SUBMIT: { limit: 5, windowMs: 60 * 1000 },

  // Email subscriptions: 3 per minute per IP
  SUBSCRIBE: { limit: 3, windowMs: 60 * 1000 },

  // Contact form: 3 per 5 minutes per IP
  CONTACT: { limit: 3, windowMs: 5 * 60 * 1000 },

  // Popup submissions: 5 per minute per IP
  POPUP: { limit: 5, windowMs: 60 * 1000 },

  // Admin API: 100 requests per minute per session (prevents brute force)
  ADMIN: { limit: 100, windowMs: 60 * 1000 },

  // Admin write operations: 30 per minute per session
  ADMIN_WRITE: { limit: 30, windowMs: 60 * 1000 },
};

/**
 * Rate limit helper for admin routes
 * Uses session ID instead of IP for authenticated requests
 */
export function adminRateLimit(
  sessionId: string,
  isWriteOperation: boolean = false
): RateLimitResult {
  const config = isWriteOperation ? RATE_LIMITS.ADMIN_WRITE : RATE_LIMITS.ADMIN;
  const key = `admin:${isWriteOperation ? 'write' : 'read'}:${sessionId}`;
  return rateLimit(key, config.limit, config.windowMs);
}
