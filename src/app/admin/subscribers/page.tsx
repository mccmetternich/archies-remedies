'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Loader2,
  Mail,
  Download,
  Search,
  Users,
  Calendar,
  Filter,
  ChevronDown,
  X,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  subscribedAt: string;
}

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year';

const dateFilterOptions: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
];

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/subscribers');
      const data = await res.json();
      setSubscribers(data);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique sources for filter
  const sources = useMemo(() => {
    const uniqueSources = [...new Set(subscribers.map((s) => s.source || 'Unknown'))];
    return uniqueSources.sort();
  }, [subscribers]);

  // Filter subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      // Search filter
      if (search && !s.email.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Source filter
      if (sourceFilter !== 'all') {
        const subscriberSource = s.source || 'Unknown';
        if (subscriberSource !== sourceFilter) return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const date = new Date(s.subscribedAt);
        const now = new Date();

        switch (dateFilter) {
          case 'today':
            if (date.toDateString() !== now.toDateString()) return false;
            break;
          case 'week': {
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            if (date < weekAgo) return false;
            break;
          }
          case 'month': {
            if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return false;
            break;
          }
          case 'quarter': {
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            if (date < quarterStart) return false;
            break;
          }
          case 'year': {
            if (date.getFullYear() !== now.getFullYear()) return false;
            break;
          }
        }
      }

      return true;
    });
  }, [subscribers, search, sourceFilter, dateFilter]);

  const handleExport = () => {
    const csv = [
      ['Email', 'Source', 'Date'],
      ...filteredSubscribers.map((s) => [
        s.email,
        s.source || 'Unknown',
        new Date(s.subscribedAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch('');
    setSourceFilter('all');
    setDateFilter('all');
  };

  const hasActiveFilters = search || sourceFilter !== 'all' || dateFilter !== 'all';

  // Stats
  const totalSubscribers = subscribers.length;
  const thisMonth = subscribers.filter((s) => {
    const date = new Date(s.subscribedAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const thisWeek = subscribers.filter((s) => {
    const date = new Date(s.subscribedAt);
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return date >= weekAgo;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white flex items-center gap-3">
            <Mail className="w-6 h-6 text-[var(--primary)]" />
            Email Subscribers
          </h1>
          <p className="text-gray-400 mt-1">
            View and export your email list
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[#0a0a0a] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{totalSubscribers}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{thisMonth}</p>
              <p className="text-sm text-gray-500">This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{thisWeek}</p>
              <p className="text-sm text-gray-500">This Week</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Filter className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{sources.length}</p>
              <p className="text-sm text-gray-500">Sources</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-[#1f1f1f] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>

        {/* Source Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSourceDropdown(!showSourceDropdown);
              setShowDateDropdown(false);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 bg-[#111111] border border-[#1f1f1f] rounded-lg text-sm transition-colors min-w-[160px] justify-between',
              sourceFilter !== 'all' ? 'text-[var(--primary)] border-[var(--primary)]' : 'text-gray-400'
            )}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>{sourceFilter === 'all' ? 'All Sources' : sourceFilter}</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showSourceDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSourceDropdown(false)} />
              <div className="absolute top-full mt-2 right-0 w-48 bg-[#111111] border border-[#1f1f1f] rounded-lg shadow-xl z-20 py-1 max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    setSourceFilter('all');
                    setShowSourceDropdown(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm hover:bg-[#1a1a1a] transition-colors',
                    sourceFilter === 'all' ? 'text-[var(--primary)]' : 'text-gray-400'
                  )}
                >
                  All Sources
                </button>
                {sources.map((source) => (
                  <button
                    key={source}
                    onClick={() => {
                      setSourceFilter(source);
                      setShowSourceDropdown(false);
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-[#1a1a1a] transition-colors',
                      sourceFilter === source ? 'text-[var(--primary)]' : 'text-gray-400'
                    )}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Date Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDateDropdown(!showDateDropdown);
              setShowSourceDropdown(false);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 bg-[#111111] border border-[#1f1f1f] rounded-lg text-sm transition-colors min-w-[160px] justify-between',
              dateFilter !== 'all' ? 'text-[var(--primary)] border-[var(--primary)]' : 'text-gray-400'
            )}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{dateFilterOptions.find((o) => o.value === dateFilter)?.label}</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showDateDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDateDropdown(false)} />
              <div className="absolute top-full mt-2 right-0 w-48 bg-[#111111] border border-[#1f1f1f] rounded-lg shadow-xl z-20 py-1">
                {dateFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDateFilter(option.value);
                      setShowDateDropdown(false);
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-[#1a1a1a] transition-colors',
                      dateFilter === option.value ? 'text-[var(--primary)]' : 'text-gray-400'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-gray-400 rounded-lg text-sm hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Showing:</span>
          <span className="text-white font-medium">{filteredSubscribers.length}</span>
          <span className="text-gray-500">of</span>
          <span className="text-white font-medium">{subscribers.length}</span>
          <span className="text-gray-500">subscribers</span>
        </div>
      )}

      {/* Subscribers Table */}
      <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1f1f1f]">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Source
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f1f]">
            {filteredSubscribers.map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-[#1a1a1a] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-sm font-medium text-[var(--primary)]">
                      {subscriber.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-white">{subscriber.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 text-xs font-medium bg-[#1a1a1a] text-gray-400 rounded-full">
                    {subscriber.source || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(subscriber.subscribedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSubscribers.length === 0 && (
          <div className="py-16 text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="font-medium text-white mb-2">
              {hasActiveFilters ? 'No matching subscribers' : 'No subscribers yet'}
            </h3>
            <p className="text-sm text-gray-500">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Subscribers will appear here when they sign up'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-gray-300 rounded-lg text-sm hover:bg-[#2a2a2a] transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
