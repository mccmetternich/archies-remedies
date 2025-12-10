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

    // Generate a preview token (valid for 24 hours)
    const previewToken = crypto.randomBytes(32).toString('hex');

    // Set the preview token as a cookie (accessible on the main site)
    cookieStore.set('preview_token', previewToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
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
