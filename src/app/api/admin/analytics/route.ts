import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pageViews, clickTracking, contacts } from '@/lib/db/schema';
import { sql, gte, and, isNotNull, count, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range based on filter
    const startDate = new Date();
    let startDateStr: string;

    switch (range) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '14d':
        startDate.setDate(startDate.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '6m':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '12m':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'ytd':
        startDate.setMonth(0, 1); // January 1st of current year
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
        startDate.setFullYear(2020, 0, 1); // Far enough back to get all data
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    startDateStr = startDate.toISOString();

    // Today and week dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString();

    // Get visitor counts
    const totalVisitors = await db
      .select({ count: count() })
      .from(pageViews)
      .where(gte(pageViews.createdAt, startDateStr));

    const todayVisitors = await db
      .select({ count: count() })
      .from(pageViews)
      .where(gte(pageViews.createdAt, todayStr));

    const weekVisitors = await db
      .select({ count: count() })
      .from(pageViews)
      .where(gte(pageViews.createdAt, weekStartStr));

    // Get click counts
    const totalClicks = await db
      .select({ count: count() })
      .from(clickTracking)
      .where(gte(clickTracking.createdAt, startDateStr));

    const todayClicks = await db
      .select({ count: count() })
      .from(clickTracking)
      .where(gte(clickTracking.createdAt, todayStr));

    const weekClicks = await db
      .select({ count: count() })
      .from(clickTracking)
      .where(gte(clickTracking.createdAt, weekStartStr));

    // Get contact counts
    const periodContacts = await db
      .select({ count: count() })
      .from(contacts)
      .where(gte(contacts.createdAt, startDateStr));

    const totalContacts = await db
      .select({ count: count() })
      .from(contacts);

    const periodEmailContacts = await db
      .select({ count: count() })
      .from(contacts)
      .where(
        and(
          gte(contacts.createdAt, startDateStr),
          isNotNull(contacts.email)
        )
      );

    const periodSmsContacts = await db
      .select({ count: count() })
      .from(contacts)
      .where(
        and(
          gte(contacts.createdAt, startDateStr),
          isNotNull(contacts.phone)
        )
      );

    // Get top pages
    const topPages = await db
      .select({
        path: pageViews.path,
        count: count(),
      })
      .from(pageViews)
      .where(gte(pageViews.createdAt, startDateStr))
      .groupBy(pageViews.path)
      .orderBy(desc(count()))
      .limit(10);

    // Get top clicked links
    const topClicks = await db
      .select({
        url: clickTracking.destinationUrl,
        productSlug: clickTracking.productSlug,
        count: count(),
      })
      .from(clickTracking)
      .where(gte(clickTracking.createdAt, startDateStr))
      .groupBy(clickTracking.destinationUrl, clickTracking.productSlug)
      .orderBy(desc(count()))
      .limit(10);

    // Get daily visitors for chart
    const dailyVisitorsResult = await db.all(sql`
      SELECT
        date(created_at) as date,
        COUNT(*) as count
      FROM page_views
      WHERE created_at >= ${startDateStr}
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `);

    // Get daily clicks for chart
    const dailyClicksResult = await db.all(sql`
      SELECT
        date(created_at) as date,
        COUNT(*) as count
      FROM click_tracking
      WHERE created_at >= ${startDateStr}
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `);

    // Fill in missing dates with zero counts
    const dailyVisitors: Array<{ date: string; count: number }> = [];
    const dailyClicks: Array<{ date: string; count: number }> = [];

    // Create a map of existing data
    const visitorsByDate = new Map(
      (dailyVisitorsResult as Array<{ date: string; count: number }>).map(d => [d.date, d.count])
    );
    const clicksByDate = new Map(
      (dailyClicksResult as Array<{ date: string; count: number }>).map(d => [d.date, d.count])
    );

    // Generate all dates in range
    const current = new Date(startDate);
    const end = new Date();
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      dailyVisitors.push({
        date: dateStr,
        count: visitorsByDate.get(dateStr) || 0,
      });
      dailyClicks.push({
        date: dateStr,
        count: clicksByDate.get(dateStr) || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return NextResponse.json({
      visitors: {
        total: totalVisitors[0]?.count || 0,
        today: todayVisitors[0]?.count || 0,
        week: weekVisitors[0]?.count || 0,
      },
      clicks: {
        total: totalClicks[0]?.count || 0,
        today: todayClicks[0]?.count || 0,
        week: weekClicks[0]?.count || 0,
      },
      contacts: {
        period: periodContacts[0]?.count || 0,
        total: totalContacts[0]?.count || 0,
      },
      emailContacts: {
        period: periodEmailContacts[0]?.count || 0,
        total: 0,
      },
      smsContacts: {
        period: periodSmsContacts[0]?.count || 0,
        total: 0,
      },
      topPages: topPages.map(p => ({
        path: p.path,
        count: p.count,
      })),
      topClicks: topClicks.map(c => ({
        url: c.url,
        count: c.count,
        productSlug: c.productSlug || undefined,
      })),
      dailyVisitors,
      dailyClicks,
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
