import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  hashPassword,
  verifyPassword,
  createSession,
  isFirstUser,
} from '@/lib/auth';
import { loginSchema, validateRequest } from '@/lib/validations';
import crypto from 'crypto';

// Rate limiting: simple in-memory store (resets on server restart)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);

  if (!attempts) return false;

  // Reset if lockout period has passed
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(identifier);
    return false;
  }

  return attempts.count >= MAX_ATTEMPTS;
}

function recordAttempt(identifier: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);

  if (!attempts || now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
  } else {
    loginAttempts.set(identifier, { count: attempts.count + 1, lastAttempt: now });
  }
}

function clearAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = validateRequest(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;

    // Rate limiting check
    const clientIdentifier = username.toLowerCase();
    if (isRateLimited(clientIdentifier)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Check for the admin user
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    // Handle first-time setup: if no users exist, create admin from env vars
    if (!user && await isFirstUser()) {
      const defaultUsername = process.env.ADMIN_USERNAME;
      const defaultPassword = process.env.ADMIN_PASSWORD;

      // Only create default user if env vars are set AND match the login attempt
      if (defaultUsername && defaultPassword && username === defaultUsername) {
        const hashedPassword = await hashPassword(defaultPassword);

        await db.insert(adminUsers).values({
          id: crypto.randomUUID(),
          username: defaultUsername,
          passwordHash: hashedPassword,
        });

        // Verify the password matches
        if (password === defaultPassword) {
          const [newUser] = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.username, defaultUsername))
            .limit(1);

          if (newUser) {
            clearAttempts(clientIdentifier);
            const sessionToken = await createSession(newUser.id);

            // Update last login time
            await db
              .update(adminUsers)
              .set({ lastLoginAt: new Date().toISOString() })
              .where(eq(adminUsers.id, newUser.id));

            // Set session cookie
            const cookieStore = await cookies();
            cookieStore.set('admin_session', sessionToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 60 * 60 * 24 * 7, // 7 days
            });

            return NextResponse.json({ success: true });
          }
        }
      }
    }

    if (!user) {
      recordAttempt(clientIdentifier);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      recordAttempt(clientIdentifier);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Clear rate limiting on successful login
    clearAttempts(clientIdentifier);

    // Create session in database
    const sessionToken = await createSession(user.id);

    // Update last login time
    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date().toISOString() })
      .where(eq(adminUsers.id, user.id));

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
