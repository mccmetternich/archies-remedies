'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Mail,
  Phone,
  Download,
  Search,
  Users,
  Calendar,
  ChevronDown,
  X,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  source: string | null;
  emailStatus: string | null;
  smsStatus: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  emails: {
    active: number;
    inactive: number;
    total: number;
  };
  sms: {
    active: number;
    inactive: number;
    total: number;
  };
}

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year';
type StatusFilter = 'active' | 'inactive';

const dateFilterOptions: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
];

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [emailTab, setEmailTab] = useState<StatusFilter>('active');
  const [smsTab, setSmsTab] = useState<StatusFilter>('active');

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Build date filter
      let dateFrom = '';
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'quarter':
            startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = new Date(0);
        }
        dateFrom = startDate.toISOString();
      }

      const params = new URLSearchParams();
      if (dateFrom) params.set('dateFrom', dateFrom);

      const [contactsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/subscribers?${params.toString()}`),
        fetch(`/api/admin/subscribers/stats?${params.toString()}`),
      ]);

      const contactsData = await contactsRes.json();
      const statsData = await statsRes.json();

      setContacts(contactsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter contacts for email list
  const emailContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (!c.email) return false;
      if (c.emailStatus !== emailTab) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        if (c.email.toLowerCase().includes(searchLower)) return true;
        if (c.firstName && c.firstName.toLowerCase().includes(searchLower)) return true;
        if (c.lastName && c.lastName.toLowerCase().includes(searchLower)) return true;
        return false;
      }
      return true;
    });
  }, [contacts, emailTab, search]);

  // Filter contacts for SMS list
  const smsContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (!c.phone) return false;
      if (c.smsStatus !== smsTab) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        if (c.phone.includes(search)) return true;
        if (c.firstName && c.firstName.toLowerCase().includes(searchLower)) return true;
        if (c.lastName && c.lastName.toLowerCase().includes(searchLower)) return true;
        return false;
      }
      return true;
    });
  }, [contacts, smsTab, search]);

  const handleExport = (type?: 'email' | 'sms') => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);

    const url = `/api/admin/subscribers/export?${params.toString()}`;
    window.open(url, '_blank');
  };

  const handleContactClick = (contactId: string) => {
    router.push(`/admin/contacts/${contactId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDisplayName = (contact: Contact) => {
    if (contact.firstName || contact.lastName) {
      return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-medium text-[var(--admin-text-primary)] flex items-center gap-2 sm:gap-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
            Contacts
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-1 text-sm hidden sm:block">
            Unified contact management
          </p>
        </div>
        <button
          onClick={() => handleExport()}
          className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors text-sm sm:text-base shrink-0"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{stats?.total || 0}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{stats?.emails.total || 0}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Emails</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{stats?.sms.total || 0}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">SMS</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">
                {(stats?.emails.active || 0) + (stats?.sms.active || 0)}
              </p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm transition-colors min-w-[160px] justify-between',
              dateFilter !== 'all' ? 'text-[var(--primary)] border-[var(--primary)]' : 'text-[var(--admin-text-secondary)]'
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
              <div className="absolute top-full mt-2 right-0 w-48 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg shadow-xl z-20 py-1">
                {dateFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDateFilter(option.value);
                      setShowDateDropdown(false);
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-[var(--admin-hover)] transition-colors',
                      dateFilter === option.value ? 'text-[var(--primary)]' : 'text-[var(--admin-text-secondary)]'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Clear Search */}
        {search && (
          <button
            onClick={() => setSearch('')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-sm hover:text-[var(--admin-text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Two-Column Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Email List */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--admin-border-light)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                <h2 className="font-medium text-[var(--admin-text-primary)] text-sm sm:text-base truncate">Email</h2>
              </div>
              <div className="flex shrink-0">
                <button
                  onClick={() => setEmailTab('active')}
                  className={cn(
                    'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-l-lg transition-colors',
                    emailTab === 'active'
                      ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                      : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                  )}
                >
                  {stats?.emails.active || 0}
                </button>
                <button
                  onClick={() => setEmailTab('inactive')}
                  className={cn(
                    'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-r-lg transition-colors',
                    emailTab === 'inactive'
                      ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                      : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                  )}
                >
                  {stats?.emails.inactive || 0}
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-[400px] sm:max-h-[500px] overflow-y-auto">
            {emailContacts.length > 0 ? (
              <div className="divide-y divide-[var(--admin-border-light)]">
                {emailContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleContactClick(contact.id)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-[var(--admin-hover)] transition-colors text-left gap-3"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-xs sm:text-sm font-medium text-[var(--primary)] shrink-0">
                        {(contact.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--admin-text-primary)] text-sm truncate">
                          {getDisplayName(contact) || contact.email}
                        </p>
                        {getDisplayName(contact) && (
                          <p className="text-xs text-[var(--admin-text-muted)] truncate">{contact.email}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-[var(--admin-text-muted)] shrink-0 hidden sm:block">
                      {formatDate(contact.createdAt)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 sm:py-12 text-center">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-[var(--admin-text-muted)]" />
                <p className="text-[var(--admin-text-muted)] text-sm">
                  No {emailTab} emails
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SMS List */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--admin-border-light)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
                <h2 className="font-medium text-[var(--admin-text-primary)] text-sm sm:text-base truncate">SMS</h2>
              </div>
              <div className="flex shrink-0">
                <button
                  onClick={() => setSmsTab('active')}
                  className={cn(
                    'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-l-lg transition-colors',
                    smsTab === 'active'
                      ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                      : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                  )}
                >
                  {stats?.sms.active || 0}
                </button>
                <button
                  onClick={() => setSmsTab('inactive')}
                  className={cn(
                    'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-r-lg transition-colors',
                    smsTab === 'inactive'
                      ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                      : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                  )}
                >
                  {stats?.sms.inactive || 0}
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-[400px] sm:max-h-[500px] overflow-y-auto">
            {smsContacts.length > 0 ? (
              <div className="divide-y divide-[var(--admin-border-light)]">
                {smsContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleContactClick(contact.id)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-[var(--admin-hover)] transition-colors text-left gap-3"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-500/10 flex items-center justify-center text-xs sm:text-sm font-medium text-green-400 shrink-0">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--admin-text-primary)] text-sm truncate">
                          {getDisplayName(contact) || contact.phone}
                        </p>
                        {getDisplayName(contact) && (
                          <p className="text-xs text-[var(--admin-text-muted)] truncate">{contact.phone}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-[var(--admin-text-muted)] shrink-0 hidden sm:block">
                      {formatDate(contact.createdAt)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 sm:py-12 text-center">
                <Phone className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-[var(--admin-text-muted)]" />
                <p className="text-[var(--admin-text-muted)] text-sm">
                  No {smsTab} SMS contacts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
