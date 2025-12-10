import { db } from '@/lib/db';
import { pageViews, clickTracking, contacts } from '@/lib/db/schema';
import { sql, gte, eq, and } from 'drizzle-orm';
import Link from 'next/link';
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Calendar,
  ArrowRight,
  Users,
  Globe,
  ExternalLink,
  Mail,
  Smartphone,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getAnalyticsData() {
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [
    visitors30d,
    visitors7d,
    visitorsToday,
    clicks30d,
    clicks7d,
    clicksToday,
    contacts30d,
    contactsTotal,
    emailContacts30d,
    emailContactsTotal,
    smsContacts30d,
    smsContactsTotal,
    topPages,
    topClicks,
    dailyVisitors,
  ] = await Promise.all([
    // Unique visitors last 30 days
    db.select({ count: sql<number>`count(distinct ${pageViews.visitorId})` })
      .from(pageViews)
      .where(gte(pageViews.createdAt, thirtyDaysAgo.toISOString())),
    // Unique visitors last 7 days
    db.select({ count: sql<number>`count(distinct ${pageViews.visitorId})` })
      .from(pageViews)
      .where(gte(pageViews.createdAt, sevenDaysAgo.toISOString())),
    // Unique visitors today
    db.select({ count: sql<number>`count(distinct ${pageViews.visitorId})` })
      .from(pageViews)
      .where(gte(pageViews.createdAt, yesterday.toISOString())),
    // Clicks last 30 days
    db.select({ count: sql<number>`count(distinct ${clickTracking.visitorId})` })
      .from(clickTracking)
      .where(gte(clickTracking.createdAt, thirtyDaysAgo.toISOString())),
    // Clicks last 7 days
    db.select({ count: sql<number>`count(distinct ${clickTracking.visitorId})` })
      .from(clickTracking)
      .where(gte(clickTracking.createdAt, sevenDaysAgo.toISOString())),
    // Clicks today
    db.select({ count: sql<number>`count(distinct ${clickTracking.visitorId})` })
      .from(clickTracking)
      .where(gte(clickTracking.createdAt, yesterday.toISOString())),
    // New contacts last 30 days
    db.select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(gte(contacts.createdAt, thirtyDaysAgo.toISOString())),
    // Total contacts
    db.select({ count: sql<number>`count(*)` }).from(contacts),
    // Email contacts last 30 days
    db.select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(and(
        gte(contacts.createdAt, thirtyDaysAgo.toISOString()),
        eq(contacts.emailStatus, 'active')
      )),
    // Total email contacts
    db.select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(eq(contacts.emailStatus, 'active')),
    // SMS contacts last 30 days
    db.select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(and(
        gte(contacts.createdAt, thirtyDaysAgo.toISOString()),
        eq(contacts.smsStatus, 'active')
      )),
    // Total SMS contacts
    db.select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(eq(contacts.smsStatus, 'active')),
    // Top pages
    db.select({
      path: pageViews.path,
      count: sql<number>`count(*)`,
    })
      .from(pageViews)
      .where(gte(pageViews.createdAt, thirtyDaysAgo.toISOString()))
      .groupBy(pageViews.path)
      .orderBy(sql`count(*) desc`)
      .limit(5),
    // Top clicked links
    db.select({
      url: clickTracking.destinationUrl,
      count: sql<number>`count(*)`,
    })
      .from(clickTracking)
      .where(gte(clickTracking.createdAt, thirtyDaysAgo.toISOString()))
      .groupBy(clickTracking.destinationUrl)
      .orderBy(sql`count(*) desc`)
      .limit(5),
    // Daily visitors for chart (last 14 days)
    db.select({
      date: sql<string>`date(${pageViews.createdAt})`,
      count: sql<number>`count(distinct ${pageViews.visitorId})`,
    })
      .from(pageViews)
      .where(gte(pageViews.createdAt, new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()))
      .groupBy(sql`date(${pageViews.createdAt})`)
      .orderBy(sql`date(${pageViews.createdAt})`),
  ]);

  return {
    visitors: {
      today: visitorsToday[0]?.count || 0,
      week: visitors7d[0]?.count || 0,
      month: visitors30d[0]?.count || 0,
    },
    clicks: {
      today: clicksToday[0]?.count || 0,
      week: clicks7d[0]?.count || 0,
      month: clicks30d[0]?.count || 0,
    },
    contacts: {
      month: contacts30d[0]?.count || 0,
      total: contactsTotal[0]?.count || 0,
    },
    emailContacts: {
      month: emailContacts30d[0]?.count || 0,
      total: emailContactsTotal[0]?.count || 0,
    },
    smsContacts: {
      month: smsContacts30d[0]?.count || 0,
      total: smsContactsTotal[0]?.count || 0,
    },
    topPages,
    topClicks,
    dailyVisitors,
  };
}

export default async function PerformancePage() {
  const data = await getAnalyticsData();

  // Calculate max for chart scaling
  const maxVisitors = Math.max(...data.dailyVisitors.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-medium text-[var(--admin-text-primary)]">Performance</h1>
        <p className="text-[var(--admin-text-secondary)] mt-1 text-sm hidden sm:block">
          Site traffic and engagement analytics
        </p>
      </div>

      {/* Time Period Selector (visual only for now) */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg text-xs sm:text-sm font-medium shrink-0">
          30 Days
        </button>
        <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-xs sm:text-sm font-medium hover:text-[var(--admin-text-primary)] transition-colors shrink-0">
          7 Days
        </button>
        <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-xs sm:text-sm font-medium hover:text-[var(--admin-text-primary)] transition-colors shrink-0">
          Today
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Unique Visitors */}
        <div className="bg-[var(--admin-card)] rounded-xl p-3 sm:p-5 border border-[var(--admin-border-light)]">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-semibold text-[var(--admin-text-primary)] mb-0.5 sm:mb-1">{data.visitors.month}</p>
          <p className="text-xs sm:text-sm text-[var(--admin-text-secondary)]">Visitors</p>
          <div className="flex items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
            <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)]">{data.visitors.today} today</span>
            <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)] hidden sm:inline">|</span>
            <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)] hidden sm:inline">{data.visitors.week} week</span>
          </div>
        </div>

        {/* Clicks */}
        <div className="bg-[var(--admin-card)] rounded-xl p-3 sm:p-5 border border-[var(--admin-border-light)]">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <MousePointerClick className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-semibold text-[var(--admin-text-primary)] mb-0.5 sm:mb-1">{data.clicks.month}</p>
          <p className="text-xs sm:text-sm text-[var(--admin-text-secondary)]">Clicks</p>
          <div className="flex items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
            <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)]">{data.clicks.today} today</span>
            <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)] hidden sm:inline">|</span>
            <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)] hidden sm:inline">{data.clicks.week} week</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-[var(--admin-card)] rounded-xl p-3 sm:p-5 border border-[var(--admin-border-light)]">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-semibold text-[var(--admin-text-primary)] mb-0.5 sm:mb-1">
            {data.visitors.month > 0
              ? ((data.clicks.month / data.visitors.month) * 100).toFixed(1)
              : 0}%
          </p>
          <p className="text-xs sm:text-sm text-[var(--admin-text-secondary)]">Click Rate</p>
          <p className="text-[10px] sm:text-xs text-[var(--admin-text-muted)] mt-1.5 sm:mt-2 hidden sm:block">Visitors who clicked</p>
        </div>

        {/* New Contacts */}
        <Link
          href="/admin/contacts"
          className="bg-[var(--admin-card)] rounded-xl p-3 sm:p-5 border border-[var(--admin-border-light)] hover:border-[var(--primary)] transition-colors group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--admin-text-muted)] group-hover:text-[var(--primary)] transition-colors" />
          </div>
          <p className="text-xl sm:text-3xl font-semibold text-[var(--admin-text-primary)] mb-0.5 sm:mb-1">{data.contacts.month}</p>
          <p className="text-xs sm:text-sm text-[var(--admin-text-secondary)]">Contacts</p>
          <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[var(--admin-text-muted)]">
              <Mail className="w-3 h-3" /> {data.emailContacts.month}
            </span>
            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[var(--admin-text-muted)] hidden sm:flex">
              <Smartphone className="w-3 h-3" /> {data.smsContacts.month}
            </span>
          </div>
        </Link>
      </div>

      {/* Traffic Chart (Simple Bar Chart) */}
      <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2 text-sm sm:text-base">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--admin-text-secondary)]" />
            <span className="hidden sm:inline">Daily Visitors (Last 14 Days)</span>
            <span className="sm:hidden">Daily Visitors</span>
          </h2>
        </div>
        <div className="h-36 sm:h-48 flex items-end gap-1 sm:gap-2 overflow-x-auto">
          {data.dailyVisitors.length > 0 ? (
            data.dailyVisitors.map((day, index) => {
              const height = (day.count / maxVisitors) * 100;
              const date = new Date(day.date);
              const isToday = index === data.dailyVisitors.length - 1;
              return (
                <div
                  key={day.date}
                  className="flex-1 min-w-[20px] sm:min-w-0 flex flex-col items-center gap-1 sm:gap-2"
                >
                  <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)]">{day.count}</span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      isToday ? 'bg-[var(--primary)]' : 'bg-blue-500/50'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)]">
                    {date.getDate()}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--admin-text-muted)] text-sm">
              No visitor data yet
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Pages */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)]">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--admin-border-light)] flex items-center justify-between">
            <h2 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2 text-sm sm:text-base">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--admin-text-secondary)]" />
              Top Pages
            </h2>
          </div>
          <div className="divide-y divide-[var(--admin-border-light)]">
            {data.topPages.length > 0 ? (
              data.topPages.map((page, index) => (
                <div
                  key={page.path}
                  className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3"
                >
                  <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)] font-mono w-5 sm:w-6 shrink-0">
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-[var(--admin-text-primary)] truncate">
                      {page.path || '/'}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[var(--admin-text-secondary)] shrink-0">
                    {page.count}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-[var(--admin-text-muted)] text-xs sm:text-sm">
                No page views recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Top Clicked Links */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)]">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--admin-border-light)] flex items-center justify-between">
            <h2 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2 text-sm sm:text-base">
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--admin-text-secondary)]" />
              <span className="hidden sm:inline">Top Clicked Links</span>
              <span className="sm:hidden">Top Links</span>
            </h2>
          </div>
          <div className="divide-y divide-[var(--admin-border-light)]">
            {data.topClicks.length > 0 ? (
              data.topClicks.map((click, index) => {
                let displayUrl = click.url;
                try {
                  const url = new URL(click.url);
                  displayUrl = url.hostname + url.pathname;
                } catch {
                  // Keep original
                }
                return (
                  <div
                    key={click.url}
                    className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3"
                  >
                    <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)] font-mono w-5 sm:w-6 shrink-0">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-[var(--admin-text-primary)] truncate">
                        {displayUrl}
                      </p>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-[var(--admin-text-secondary)] shrink-0">
                      {click.count}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-[var(--admin-text-muted)] text-xs sm:text-sm">
                No clicks recorded yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
