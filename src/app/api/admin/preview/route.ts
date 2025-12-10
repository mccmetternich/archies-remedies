import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Generate a preview token for viewing the site while in draft mode
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
    // This ensures admins must explicitly request preview access each browser session
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
      expiresIn: 'browser session'
    });
  } catch (error) {
    console.error('Failed to generate preview token:', error);
    return NextResponse.json({ error: 'Failed to generate preview token' }, { status: 500 });
  }
}

// Revoke the preview token
export async function DELETE() {
  try {
    const cookieStore = await cookies();

    // Clear the preview token
    cookieStore.delete('preview_token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to revoke preview token:', error);
    return NextResponse.json({ error: 'Failed to revoke preview token' }, { status: 500 });
  }
}

// Check if preview token is valid
export async function GET() {
  try {
    const cookieStore = await cookies();
    const previewToken = cookieStore.get('preview_token');

    return NextResponse.json({
      hasPreviewToken: !!previewToken?.value,
    });
  } catch (error) {
    console.error('Failed to check preview token:', error);
    return NextResponse.json({ error: 'Failed to check preview token' }, { status: 500 });
  }
}
