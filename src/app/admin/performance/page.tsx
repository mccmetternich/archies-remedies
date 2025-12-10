'use client';

import { useEffect, useState, useMemo } from 'react';
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
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type DateRange = '7d' | '14d' | '30d' | '90d';

interface AnalyticsData {
  visitors: { total: number; today: number; week: number };
  clicks: { total: number; today: number; week: number };
  contacts: { period: number; total: number };
  emailContacts: { period: number; total: number };
  smsContacts: { period: number; total: number };
  topPages: Array<{ path: string; count: number }>;
  topClicks: Array<{ url: string; count: number; productSlug?: string }>;
  dailyVisitors: Array<{ date: string; count: number }>;
  dailyClicks: Array<{ date: string; count: number }>;
}

const DATE_RANGE_OPTIONS: { value: DateRange; label: string; days: number }[] = [
  { value: '7d', label: '7 Days', days: 7 },
  { value: '14d', label: '14 Days', days: 14 },
  { value: '30d', label: '30 Days', days: 30 },
  { value: '90d', label: '90 Days', days: 90 },
];

export default function PerformancePage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (range: DateRange, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange]);

  // Calculate chart dimensions
  const chartData = useMemo(() => {
    if (!data?.dailyVisitors?.length) return { visitors: [], clicks: [], maxValue: 1 };

    const visitors = data.dailyVisitors;
    const clicks = data.dailyClicks || [];
    const maxVisitors = Math.max(...visitors.map(d => d.count), 1);
    const maxClicks = Math.max(...clicks.map(d => d.count), 1);

    return {
      visitors,
      clicks,
      maxValue: Math.max(maxVisitors, maxClicks, 1),
    };
  }, [data]);

  // Calculate click-through rate
  const clickRate = useMemo(() => {
    if (!data || data.visitors.total === 0) return 0;
    return ((data.clicks.total / data.visitors.total) * 100).toFixed(1);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 text-[var(--admin-text-muted)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium" style={{ color: '#ffffff' }}>Performance</h1>
          <p className="mt-1 text-sm" style={{ color: '#9ca3af' }}>
            Site traffic and engagement analytics
          </p>
        </div>
        <button
          onClick={() => fetchData(dateRange, true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-input)] rounded-lg text-sm font-medium hover:bg-[var(--admin-hover)] transition-colors self-start sm:self-auto"
          style={{ color: '#9ca3af' }}
        >
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Date Range Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DATE_RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setDateRange(option.value)}
            className={cn(
              'px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium shrink-0 transition-colors',
              dateRange === option.value
                ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                : 'bg-[var(--admin-input)] hover:bg-[var(--admin-hover)]'
            )}
            style={dateRange !== option.value ? { color: '#9ca3af' } : undefined}
          >
            {option.label}
          </button>
        ))}
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
          <p className="text-xl sm:text-3xl font-semibold mb-0.5 sm:mb-1" style={{ color: '#ffffff' }}>
            {data?.visitors.total || 0}
          </p>
          <p className="text-xs sm:text-sm" style={{ color: '#9ca3af' }}>Visitors</p>
          <div className="flex items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
            <span className="text-[10px] sm:text-xs" style={{ color: '#71717a' }}>
              {data?.visitors.today || 0} today
            </span>
            <span className="text-[10px] sm:text-xs hidden sm:inline" style={{ color: '#71717a' }}>|</span>
            <span className="text-[10px] sm:text-xs hidden sm:inline" style={{ color: '#71717a' }}>
              {data?.visitors.week || 0} this week
            </span>
          </div>
        </div>

        {/* Clicks */}
        <div className="bg-[var(--admin-card)] rounded-xl p-3 sm:p-5 border border-[var(--admin-border-light)]">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <MousePointerClick className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-semibold mb-0.5 sm:mb-1" style={{ color: '#ffffff' }}>
            {data?.clicks.total || 0}
          </p>
          <p className="text-xs sm:text-sm" style={{ color: '#9ca3af' }}>Clicks</p>
          <div className="flex items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
            <span className="text-[10px] sm:text-xs" style={{ color: '#71717a' }}>
              {data?.clicks.today || 0} today
            </span>
            <span className="text-[10px] sm:text-xs hidden sm:inline" style={{ color: '#71717a' }}>|</span>
            <span className="text-[10px] sm:text-xs hidden sm:inline" style={{ color: '#71717a' }}>
              {data?.clicks.week || 0} this week
            </span>
          </div>
        </div>

        {/* Click Rate */}
        <div className="bg-[var(--admin-card)] rounded-xl p-3 sm:p-5 border border-[var(--admin-border-light)]">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-semibold mb-0.5 sm:mb-1" style={{ color: '#ffffff' }}>
            {clickRate}%
          </p>
          <p className="text-xs sm:text-sm" style={{ color: '#9ca3af' }}>Click Rate</p>
          <p className="text-[10px] sm:text-xs mt-1.5 sm:mt-2 hidden sm:block" style={{ color: '#71717a' }}>
            Visitors who clicked
          </p>
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
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-[var(--primary)] transition-colors" style={{ color: '#71717a' }} />
          </div>
          <p className="text-xl sm:text-3xl font-semibold mb-0.5 sm:mb-1" style={{ color: '#ffffff' }}>
            {data?.contacts.period || 0}
          </p>
          <p className="text-xs sm:text-sm" style={{ color: '#9ca3af' }}>New Contacts</p>
          <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
            <span className="flex items-center gap-1 text-[10px] sm:text-xs" style={{ color: '#71717a' }}>
              <Mail className="w-3 h-3" /> {data?.emailContacts.period || 0}
            </span>
            <span className="flex items-center gap-1 text-[10px] sm:text-xs hidden sm:flex" style={{ color: '#71717a' }}>
              <Smartphone className="w-3 h-3" /> {data?.smsContacts.period || 0}
            </span>
          </div>
        </Link>
      </div>

      {/* Traffic Chart */}
      <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="font-medium flex items-center gap-2 text-sm sm:text-base" style={{ color: '#ffffff' }}>
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#9ca3af' }} />
            <span className="hidden sm:inline">Daily Traffic</span>
            <span className="sm:hidden">Traffic</span>
          </h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span style={{ color: '#9ca3af' }}>Visitors</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-500" />
              <span style={{ color: '#9ca3af' }}>Clicks</span>
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48 sm:h-64 flex items-end gap-0.5 sm:gap-1 overflow-x-auto pb-6 relative">
          {chartData.visitors.length > 0 ? (
            chartData.visitors.map((day, index) => {
              const visitorHeight = (day.count / chartData.maxValue) * 100;
              const clickDay = chartData.clicks.find(c => c.date === day.date);
              const clickHeight = clickDay ? (clickDay.count / chartData.maxValue) * 100 : 0;
              const date = new Date(day.date);
              const isToday = index === chartData.visitors.length - 1;

              return (
                <div
                  key={day.date}
                  className="flex-1 min-w-[24px] sm:min-w-[32px] flex flex-col items-center gap-1 group relative"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[var(--admin-sidebar)] border border-[var(--admin-border)] rounded-lg p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <p style={{ color: '#ffffff' }}>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p style={{ color: '#60a5fa' }}>{day.count} visitors</p>
                    <p style={{ color: '#4ade80' }}>{clickDay?.count || 0} clicks</p>
                  </div>

                  {/* Bars container */}
                  <div className="w-full h-36 sm:h-48 flex items-end justify-center gap-0.5">
                    {/* Visitors bar */}
                    <div
                      className={cn(
                        'w-[45%] rounded-t transition-all',
                        isToday ? 'bg-blue-500' : 'bg-blue-500/60'
                      )}
                      style={{ height: `${Math.max(visitorHeight, 2)}%` }}
                    />
                    {/* Clicks bar */}
                    <div
                      className={cn(
                        'w-[45%] rounded-t transition-all',
                        isToday ? 'bg-green-500' : 'bg-green-500/60'
                      )}
                      style={{ height: `${Math.max(clickHeight, clickDay?.count ? 2 : 0)}%` }}
                    />
                  </div>

                  {/* Date label */}
                  <span className="text-[10px] sm:text-xs absolute -bottom-5" style={{ color: '#71717a' }}>
                    {date.getDate()}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm" style={{ color: '#71717a' }}>
              No traffic data yet. Visitor tracking is active.
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Pages */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)]">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--admin-border-light)] flex items-center justify-between">
            <h2 className="font-medium flex items-center gap-2 text-sm sm:text-base" style={{ color: '#ffffff' }}>
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#9ca3af' }} />
              Top Pages
            </h2>
          </div>
          <div className="divide-y divide-[var(--admin-border-light)]">
            {data?.topPages && data.topPages.length > 0 ? (
              data.topPages.map((page, index) => (
                <div
                  key={page.path}
                  className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3"
                >
                  <span className="text-[10px] sm:text-xs font-mono w-5 sm:w-6 shrink-0" style={{ color: '#71717a' }}>
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm truncate" style={{ color: '#ffffff' }}>
                      {page.path || '/'}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-medium shrink-0" style={{ color: '#9ca3af' }}>
                    {page.count} views
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm" style={{ color: '#71717a' }}>
                No page views recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Top Clicked Links */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)]">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--admin-border-light)] flex items-center justify-between">
            <h2 className="font-medium flex items-center gap-2 text-sm sm:text-base" style={{ color: '#ffffff' }}>
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#9ca3af' }} />
              <span className="hidden sm:inline">Top Clicked Links</span>
              <span className="sm:hidden">Top Links</span>
            </h2>
          </div>
          <div className="divide-y divide-[var(--admin-border-light)]">
            {data?.topClicks && data.topClicks.length > 0 ? (
              data.topClicks.map((click, index) => {
                let displayUrl = click.url;
                try {
                  const url = new URL(click.url);
                  displayUrl = url.hostname.replace('www.', '');
                } catch {
                  // Keep original
                }
                return (
                  <div
                    key={click.url}
                    className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3"
                  >
                    <span className="text-[10px] sm:text-xs font-mono w-5 sm:w-6 shrink-0" style={{ color: '#71717a' }}>
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm truncate" style={{ color: '#ffffff' }}>
                        {displayUrl}
                      </p>
                      {click.productSlug && (
                        <p className="text-[10px] sm:text-xs truncate" style={{ color: '#71717a' }}>
                          via {click.productSlug}
                        </p>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-medium shrink-0" style={{ color: '#9ca3af' }}>
                      {click.count} clicks
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm" style={{ color: '#71717a' }}>
                No clicks recorded yet. Add tracking to Buy buttons.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
