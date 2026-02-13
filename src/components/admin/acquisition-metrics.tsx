'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Users, Send, MessageSquare, CheckCircle, HelpCircle, X, AlertTriangle, Gift } from 'lucide-react';

interface Metrics {
  // Pipeline Overview
  totalContacts: number;
  enrolledInCampaign: number;
  awaitingSend: number;
  phase1Sent: number;
  phase2Sent: number;
  
  // Response Breakdown
  interested: number;
  questions: number;
  declined: number;
  unsubscribed: number;
  needsReview: number;
  
  // Conversion Metrics
  responseRate: number;
  interestRate: number;
  unsubscribeRate: number;
  pendingAutoReply: number;
  codesSent: number;
  
  campaign: string;
  lastUpdated: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'yellow' | 'orange' | 'gray' | 'red' | 'default';
  subtitle?: string;
}

function MetricCard({ title, value, icon, color = 'default', subtitle }: MetricCardProps) {
  const colorClasses = {
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    gray: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
    default: 'text-[var(--admin-text-primary)] bg-[var(--admin-card)] border-[var(--admin-border)]'
  };

  const textColorClasses = {
    green: 'text-green-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    orange: 'text-orange-400',
    gray: 'text-gray-400',
    red: 'text-red-400',
    default: 'text-[var(--admin-text-primary)]'
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 ${textColorClasses[color]}`}>
            {icon}
          </div>
          <span className="text-sm text-[var(--admin-text-secondary)] font-medium">{title}</span>
        </div>
      </div>
      <div className={`text-2xl font-bold ${textColorClasses[color]} mb-1`}>
        {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}
        {typeof value === 'number' && title.toLowerCase().includes('rate') && '%'}
      </div>
      {subtitle && (
        <div className="text-xs text-[var(--admin-text-secondary)]">{subtitle}</div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-[var(--admin-hover)] rounded animate-pulse" />
        <div className="h-4 bg-[var(--admin-hover)] rounded w-24 animate-pulse" />
      </div>
      <div className="h-8 bg-[var(--admin-hover)] rounded w-16 animate-pulse mb-1" />
      <div className="h-3 bg-[var(--admin-hover)] rounded w-20 animate-pulse" />
    </div>
  );
}

export default function AcquisitionMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedSeconds, setLastUpdatedSeconds] = useState(0);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/acquisition/metrics');
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMetrics(data);
      setLastUpdatedSeconds(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 60 seconds
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update "seconds ago" counter
  useEffect(() => {
    if (!metrics) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const lastUpdated = new Date(metrics.lastUpdated);
      const secondsAgo = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
      setLastUpdatedSeconds(secondsAgo);
    }, 1000);

    return () => clearInterval(interval);
  }, [metrics]);

  const formatTimeAgo = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h3 className="font-semibold text-red-400">Failed to Load Metrics</h3>
        </div>
        <p className="text-sm text-red-300 mb-4">{error}</p>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--admin-text-primary)]">Campaign Metrics</h2>
            <p className="text-sm text-[var(--admin-text-secondary)]">
              {metrics?.campaign || 'stick_launch_test'} • Last updated: {loading ? 'Updating...' : formatTimeAgo(lastUpdatedSeconds)}
            </p>
          </div>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="p-2 rounded-lg bg-[var(--admin-hover)] hover:bg-[var(--primary)]/10 text-[var(--admin-text-secondary)] hover:text-[var(--primary)] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Row 1: Pipeline Overview */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--admin-text-primary)] mb-4">Pipeline Overview</h3>
        <div className="grid grid-cols-5 gap-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : metrics ? (
            <>
              <MetricCard
                title="Total Contacts"
                value={metrics.totalContacts}
                icon={<Users className="w-5 h-5" />}
                subtitle="Active contacts"
              />
              <MetricCard
                title="Enrolled in Campaign"
                value={metrics.enrolledInCampaign}
                icon={<MessageSquare className="w-5 h-5" />}
                subtitle="In stick_launch_test"
              />
              <MetricCard
                title="Awaiting Send"
                value={metrics.awaitingSend}
                icon={<Send className="w-5 h-5" />}
                color={metrics.awaitingSend > 0 ? 'blue' : 'gray'}
                subtitle="Ready to enroll"
              />
              <MetricCard
                title="Phase 1 Sent"
                value={metrics.phase1Sent}
                icon={<Send className="w-5 h-5" />}
                subtitle="Initial outreach"
              />
              <MetricCard
                title="Phase 2 Sent"
                value={metrics.phase2Sent}
                icon={<Send className="w-5 h-5" />}
                subtitle="Follow-up sent"
              />
            </>
          ) : null}
        </div>
      </div>

      {/* Row 2: Response Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--admin-text-primary)] mb-4">Response Breakdown</h3>
        <div className="grid grid-cols-5 gap-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : metrics ? (
            <>
              <MetricCard
                title="Interested"
                value={metrics.interested}
                icon={<CheckCircle className="w-5 h-5" />}
                color="green"
                subtitle="Positive responses"
              />
              <MetricCard
                title="Questions"
                value={metrics.questions}
                icon={<HelpCircle className="w-5 h-5" />}
                color="blue"
                subtitle="Need clarification"
              />
              <MetricCard
                title="Declined"
                value={metrics.declined}
                icon={<X className="w-5 h-5" />}
                color="gray"
                subtitle="Not interested"
              />
              <MetricCard
                title="Unsubscribed"
                value={metrics.unsubscribed}
                icon={<X className="w-5 h-5" />}
                color="gray"
                subtitle="Opted out"
              />
              <MetricCard
                title="Needs Review"
                value={metrics.needsReview}
                icon={<AlertTriangle className="w-5 h-5" />}
                color="yellow"
                subtitle="Manual review required"
              />
            </>
          ) : null}
        </div>
      </div>

      {/* Row 3: Conversion Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--admin-text-primary)] mb-4">Conversion Metrics</h3>
        <div className="grid grid-cols-5 gap-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : metrics ? (
            <>
              <MetricCard
                title="Response Rate"
                value={metrics.responseRate}
                icon={<TrendingUp className="w-5 h-5" />}
                color={metrics.responseRate > 15 ? 'green' : metrics.responseRate > 5 ? 'blue' : 'gray'}
                subtitle="Total replies / Phase 1"
              />
              <MetricCard
                title="Interest Rate"
                value={metrics.interestRate}
                icon={<TrendingUp className="w-5 h-5" />}
                color={metrics.interestRate > 5 ? 'green' : metrics.interestRate > 2 ? 'blue' : 'gray'}
                subtitle="Interested / Phase 1"
              />
              <MetricCard
                title="Unsubscribe Rate"
                value={metrics.unsubscribeRate}
                icon={<TrendingUp className="w-5 h-5" />}
                color={metrics.unsubscribeRate < 2 ? 'green' : metrics.unsubscribeRate < 5 ? 'yellow' : 'red'}
                subtitle="Unsubscribed / Phase 1"
              />
              <MetricCard
                title="Pending Auto-Reply"
                value={metrics.pendingAutoReply}
                icon={<MessageSquare className="w-5 h-5" />}
                color={metrics.pendingAutoReply > 0 ? 'orange' : 'gray'}
                subtitle="Awaiting response"
              />
              <MetricCard
                title="Codes Sent"
                value={metrics.codesSent}
                icon={<Gift className="w-5 h-5" />}
                color="green"
                subtitle="Discount codes delivered"
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}