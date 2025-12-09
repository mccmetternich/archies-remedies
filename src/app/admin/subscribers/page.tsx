'use client';

import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Mail,
  Download,
  Search,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  subscribedAt: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const handleExport = () => {
    const csv = [
      ['Email', 'Source', 'Date'],
      ...subscribers.map((s) => [
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

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalSubscribers = subscribers.length;
  const thisMonth = subscribers.filter((s) => {
    const date = new Date(s.subscribedAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const sources = [...new Set(subscribers.map((s) => s.source || 'Unknown'))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Email Subscribers</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            View and export your email list
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--primary-dark)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{totalSubscribers}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Total Subscribers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{thisMonth}</p>
              <p className="text-sm text-[var(--muted-foreground)]">This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{sources.length}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Sources</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="pl-10"
        />
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-light)] bg-[var(--muted)]">
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                Source
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {filteredSubscribers.map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-[var(--muted)] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-sm font-medium">
                      {subscriber.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{subscriber.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs bg-[var(--secondary)] rounded-full">
                    {subscriber.source || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">
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
          <div className="py-12 text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
            <h3 className="font-medium mb-2">
              {search ? 'No matching subscribers' : 'No subscribers yet'}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {search
                ? 'Try a different search term'
                : 'Subscribers will appear here when they sign up'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
