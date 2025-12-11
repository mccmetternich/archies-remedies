import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { previewTokens } from '@/lib/db/schema';
import { eq, lt } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';
import { generateId } from '@/lib/utils';

// Token expiry: 24 hours
const TOKEN_EXPIRY_HOURS = 24;

/**
 * Generate a preview token for viewing the site while in draft mode.
 * Returns a URL-based token that must be included in the URL as ?token=xxx
 */
export async function POST() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    // Generate a cryptographically secure token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

    // Store token in database
    await db.insert(previewTokens).values({
      id: generateId(),
      token,
      createdById: auth.user.userId,
      expiresAt: expiresAt.toISOString(),
    });

    // Clean up expired tokens (housekeeping)
    const now = new Date().toISOString();
    await db.delete(previewTokens).where(lt(previewTokens.expiresAt, now));

    return NextResponse.json({
      success: true,
      token,
      expiresAt: expiresAt.toISOString(),
      expiresIn: `${TOKEN_EXPIRY_HOURS} hours`,
      previewUrl: `/?token=${token}`,
    });
  } catch (error) {
    console.error('Failed to generate preview token:', error);
    return NextResponse.json({ error: 'Failed to generate preview token' }, { status: 500 });
  }
}

/**
 * Revoke a specific preview token or all tokens
 */
export async function DELETE(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const tokenToRevoke = searchParams.get('token');

    if (tokenToRevoke) {
      // Revoke specific token
      await db.delete(previewTokens).where(eq(previewTokens.token, tokenToRevoke));
    } else {
      // Revoke all tokens created by this user
      await db.delete(previewTokens).where(eq(previewTokens.createdById, auth.user.userId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to revoke preview token:', error);
    return NextResponse.json({ error: 'Failed to revoke preview token' }, { status: 500 });
  }
}

/**
 * Check if a token is valid (for debugging/admin purposes)
 */
export async function GET(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const tokenToCheck = searchParams.get('token');

    if (tokenToCheck) {
      // Check specific token
      const now = new Date().toISOString();
      const [validToken] = await db
        .select()
        .from(previewTokens)
        .where(eq(previewTokens.token, tokenToCheck))
        .limit(1);

      if (!validToken) {
        return NextResponse.json({ valid: false, reason: 'Token not found' });
      }

      if (validToken.expiresAt < now) {
        return NextResponse.json({ valid: false, reason: 'Token expired' });
      }

      return NextResponse.json({
        valid: true,
        expiresAt: validToken.expiresAt,
        createdAt: validToken.createdAt,
      });
    }

    // List all active tokens for this user
    const now = new Date().toISOString();
    const userTokens = await db
      .select({
        token: previewTokens.token,
        expiresAt: previewTokens.expiresAt,
        createdAt: previewTokens.createdAt,
      })
      .from(previewTokens)
      .where(eq(previewTokens.createdById, auth.user.userId));

    const activeTokens = userTokens.filter(t => t.expiresAt > now);

    return NextResponse.json({
      activeTokenCount: activeTokens.length,
      tokens: activeTokens.map(t => ({
        token: `${t.token.substring(0, 8)}...`,
        expiresAt: t.expiresAt,
        previewUrl: `/?token=${t.token}`,
      })),
    });
  } catch (error) {
    console.error('Failed to check preview tokens:', error);
    return NextResponse.json({ error: 'Failed to check preview tokens' }, { status: 500 });
  }
}
