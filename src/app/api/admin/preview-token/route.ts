import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Generate a preview token for viewing draft pages
// This is a simpler alias for /api/admin/preview
export async function POST() {
  try {
    const cookieStore = await cookies();

    // Verify admin is logged in
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a preview token (session-based - expires when browser closes)
    const previewToken = crypto.randomBytes(32).toString('hex');

    // Set the preview token as a SESSION cookie (no maxAge = deleted when browser closes)
    cookieStore.set('preview_token', previewToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // No maxAge = session cookie
    });

    return NextResponse.json({
      success: true,
      token: previewToken,
    });
  } catch (error) {
    console.error('Failed to generate preview token:', error);
    return NextResponse.json({ error: 'Failed to generate preview token' }, { status: 500 });
  }
}
