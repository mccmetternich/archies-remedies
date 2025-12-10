import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { adminUsers, adminSessions } from '@/lib/db/schema';
import { eq, and, gt, lt } from 'drizzle-orm';

const SALT_ROUNDS = 12;
const SESSION_EXPIRY_DAYS = 7;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session in the database
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await db.insert(adminSessions).values({
    id: crypto.randomUUID(),
    userId,
    token,
    expiresAt: expiresAt.toISOString(),
  });

  return token;
}

/**
 * Validate a session token and return the user if valid
 */
export async function validateSession(token: string): Promise<{ userId: string; username: string } | null> {
  if (!token) return null;

  const now = new Date().toISOString();

  const [session] = await db
    .select({
      userId: adminSessions.userId,
      username: adminUsers.username,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
    .where(
      and(
        eq(adminSessions.token, token),
        gt(adminSessions.expiresAt, now)
      )
    )
    .limit(1);

  return session || null;
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(token: string): Promise<void> {
  await db.delete(adminSessions).where(eq(adminSessions.token, token));
}

/**
 * Delete all expired sessions (cleanup)
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const now = new Date().toISOString();
  // Use lt() with the column first: delete where expiresAt < now
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, now));
}

/**
 * Check if this is the first admin user (for initial setup)
 */
export async function isFirstUser(): Promise<boolean> {
  const [user] = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
  return !user;
}
