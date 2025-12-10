import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pageViews, clickTracking } from '@/lib/db/schema';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, path, destinationUrl, productId, productSlug } = body;

    // Get visitor info from headers
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;

    // Generate or get visitor ID from cookie
    let visitorId = request.cookies.get('visitor_id')?.value;
    const isNewVisitor = !visitorId;
    if (!visitorId) {
      visitorId = nanoid(16);
    }

    // Generate session ID (new per session)
    let sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      sessionId = nanoid(12);
    }

    // Detect device type
    const device = userAgent?.includes('Mobile')
      ? 'mobile'
      : userAgent?.includes('Tablet')
      ? 'tablet'
      : 'desktop';

    // Detect browser
    let browser = 'unknown';
    if (userAgent) {
      if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';
    }

    if (type === 'pageview') {
      await db.insert(pageViews).values({
        id: nanoid(),
        path: path || '/',
        referrer,
        userAgent,
        visitorId,
        sessionId,
        device,
        browser,
      });
    } else if (type === 'click') {
      await db.insert(clickTracking).values({
        id: nanoid(),
        productId,
        productSlug,
        destinationUrl,
        visitorId,
        sessionId,
        referrer,
        userAgent,
      });
    }

    const response = NextResponse.json({ success: true });

    // Set cookies if new
    if (isNewVisitor) {
      response.cookies.set('visitor_id', visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    // Session cookie (expires on browser close, but set 30 min sliding)
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30, // 30 minutes
    });

    return response;
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
