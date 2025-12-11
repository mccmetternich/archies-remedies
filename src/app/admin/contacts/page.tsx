'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Mail,
  Phone,
  Download,
  Search,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  MessageSquare,
  RefreshCw,
  UserCheck,
  Trash2,
  UserMinus,
  AlertCircle,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 50;

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

type DateRange = '7d' | '14d' | '30d' | '90d' | '6m' | '12m' | 'ytd' | 'all';
type StatusFilter = 'active' | 'inactive';
type ColumnType = 'email' | 'sms';

interface DateRangeOption {
  value: DateRange;
  label: string;
  shortLabel: string;
  group: 'quick' | 'extended';
}

const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { value: '7d', label: 'Last 7 Days', shortLabel: '7D', group: 'quick' },
  { value: '14d', label: 'Last 14 Days', shortLabel: '14D', group: 'quick' },
  { value: '30d', label: 'Last 30 Days', shortLabel: '30D', group: 'quick' },
  { value: '90d', label: 'Last 90 Days', shortLabel: '90D', group: 'quick' },
  { value: '6m', label: 'Last 6 Months', shortLabel: '6M', group: 'extended' },
  { value: '12m', label: 'Last 12 Months', shortLabel: '12M', group: 'extended' },
  { value: 'ytd', label: 'Year to Date', shortLabel: 'YTD', group: 'extended' },
  { value: 'all', label: 'All Time', shortLabel: 'All', group: 'extended' },
];

// Delete/Unsubscribe Modal
interface ActionModalProps {
  isOpen: boolean;
  columnType: ColumnType;
  isUnsubscribedTab: boolean;
  selectedCount: number;
  onClose: () => void;
  onUnsubscribe: () => void;
  onDelete: () => void;
}

function ActionModal({ isOpen, columnType, isUnsubscribedTab, selectedCount, onClose, onUnsubscribe, onDelete }: ActionModalProps) {
  if (!isOpen) return null;

  const channelLabel = columnType === 'email' ? 'email' : 'SMS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-border)] p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-2">
              {selectedCount === 1 ? 'Remove contact?' : `Remove ${selectedCount} contacts?`}
            </h3>
            <p className="text-sm text-[var(--admin-text-secondary)] mb-6">
              {isUnsubscribedTab
                ? `These contacts are already unsubscribed from ${channelLabel}. What would you like to do?`
                : `What would you like to do with the selected ${channelLabel} contact${selectedCount > 1 ? 's' : ''}?`
              }
            </p>

            <div className="flex flex-col gap-3">
              {isUnsubscribedTab ? (
                <>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 px-4 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-sm font-medium hover:bg-[var(--admin-hover)] transition-colors flex items-center justify-center gap-2"
                  >
                    <UserMinus className="w-4 h-4" />
                    Keep Unsubscribed
                  </button>
                  <button
                    onClick={onDelete}
                    className="w-full py-2.5 px-4 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onUnsubscribe}
                    className="w-full py-2.5 px-4 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-sm font-medium hover:bg-[var(--admin-hover)] transition-colors flex items-center justify-center gap-2"
                  >
                    <UserMinus className="w-4 h-4" />
                    Unsubscribe
                  </button>
                  <button
                    onClick={onDelete}
                    className="w-full py-2.5 px-4 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 text-[var(--admin-text-muted)] rounded-lg text-sm font-medium hover:text-[var(--admin-text-secondary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [emailTab, setEmailTab] = useState<StatusFilter>('active');
  const [smsTab, setSmsTab] = useState<StatusFilter>('active');
  const [emailPage, setEmailPage] = useState(1);
  const [smsPage, setSmsPage] = useState(1);

  // Multi-select state
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set());
  const [selectedSmsIds, setSelectedSmsIds] = useState<Set<string>>(new Set());

  // Modal state
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    columnType: ColumnType;
    isUnsubscribedTab: boolean;
    contactIds: string[];
  }>({ isOpen: false, columnType: 'email', isUnsubscribedTab: false, contactIds: [] });

  const selectedOption = DATE_RANGE_OPTIONS.find(o => o.value === dateRange);

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange]);

  const fetchData = async (range: DateRange) => {
    try {
      if (loading) setLoading(true);

      // Build date filter
      let dateFrom = '';
      if (range !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (range) {
          case '7d':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case '14d':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 14);
            break;
          case '30d':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            break;
          case '90d':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 90);
            break;
          case '6m':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 6);
            break;
          case '12m':
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          case 'ytd':
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

  const handleRangeChange = (range: DateRange) => {
    setShowDropdown(false);
    if (range === dateRange) return;

    startTransition(() => {
      setDateRange(range);
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      fetchData(dateRange);
    });
  };

  // Clear selections when tab changes
  useEffect(() => {
    setSelectedEmailIds(new Set());
    setEmailPage(1);
  }, [emailTab, search]);

  useEffect(() => {
    setSelectedSmsIds(new Set());
    setSmsPage(1);
  }, [smsTab, search]);

  // Get counts for tabs
  const emailCounts = useMemo(() => {
    const active = contacts.filter(c => c.email && c.emailStatus === 'active').length;
    const inactive = contacts.filter(c => c.email && c.emailStatus === 'inactive').length;
    return { active, inactive };
  }, [contacts]);

  const smsCounts = useMemo(() => {
    const active = contacts.filter(c => c.phone && c.smsStatus === 'active').length;
    const inactive = contacts.filter(c => c.phone && c.smsStatus === 'inactive').length;
    return { active, inactive };
  }, [contacts]);

  // Filter contacts for email list
  const allEmailContacts = useMemo(() => {
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

  // Paginated email contacts
  const emailContacts = useMemo(() => {
    const start = (emailPage - 1) * ITEMS_PER_PAGE;
    return allEmailContacts.slice(start, start + ITEMS_PER_PAGE);
  }, [allEmailContacts, emailPage]);

  const emailTotalPages = Math.ceil(allEmailContacts.length / ITEMS_PER_PAGE);

  // Filter contacts for SMS list
  const allSmsContacts = useMemo(() => {
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

  // Paginated SMS contacts
  const smsContacts = useMemo(() => {
    const start = (smsPage - 1) * ITEMS_PER_PAGE;
    return allSmsContacts.slice(start, start + ITEMS_PER_PAGE);
  }, [allSmsContacts, smsPage]);

  const smsTotalPages = Math.ceil(allSmsContacts.length / ITEMS_PER_PAGE);

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

  // Selection handlers
  const toggleEmailSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEmailIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSmsSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSmsIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Action handlers
  const openBulkActionModal = (columnType: ColumnType) => {
    const ids = columnType === 'email' ? Array.from(selectedEmailIds) : Array.from(selectedSmsIds);
    const isUnsubscribed = columnType === 'email' ? emailTab === 'inactive' : smsTab === 'inactive';
    setActionModal({
      isOpen: true,
      columnType,
      isUnsubscribedTab: isUnsubscribed,
      contactIds: ids,
    });
  };

  const openSingleActionModal = (columnType: ColumnType, contactId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isUnsubscribed = columnType === 'email' ? emailTab === 'inactive' : smsTab === 'inactive';
    setActionModal({
      isOpen: true,
      columnType,
      isUnsubscribedTab: isUnsubscribed,
      contactIds: [contactId],
    });
  };

  const handleUnsubscribe = async () => {
    const { contactIds, columnType } = actionModal;
    const statusField = columnType === 'email' ? 'emailStatus' : 'smsStatus';

    try {
      await Promise.all(
        contactIds.map(id =>
          fetch(`/api/admin/subscribers/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [statusField]: 'inactive' }),
          })
        )
      );

      // Update local state
      setContacts(prev =>
        prev.map(c =>
          contactIds.includes(c.id)
            ? { ...c, [statusField]: 'inactive' }
            : c
        )
      );

      // Clear selections
      if (columnType === 'email') {
        setSelectedEmailIds(new Set());
      } else {
        setSelectedSmsIds(new Set());
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }

    setActionModal({ ...actionModal, isOpen: false });
  };

  const handleDelete = async () => {
    const { contactIds } = actionModal;

    try {
      await Promise.all(
        contactIds.map(id =>
          fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' })
        )
      );

      // Update local state
      setContacts(prev => prev.filter(c => !contactIds.includes(c.id)));

      // Clear selections
      setSelectedEmailIds(new Set());
      setSelectedSmsIds(new Set());
    } catch (error) {
      console.error('Failed to delete:', error);
    }

    setActionModal({ ...actionModal, isOpen: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-medium text-[var(--admin-text-primary)] flex items-center gap-2 sm:gap-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
            Contacts
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-1 text-sm hidden sm:block">
            Unified contact management
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-input)] rounded-lg text-sm font-medium hover:bg-[var(--admin-hover)] transition-colors text-[var(--admin-text-secondary)]"
          >
            <RefreshCw className={cn('w-4 h-4', isPending && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => handleExport()}
            className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors text-sm sm:text-base shrink-0"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={cn(
        'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 transition-opacity duration-200',
        isPending && 'opacity-60'
      )}>
        {/* Total Active */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">
                {contacts.filter(c =>
                  (c.email && c.emailStatus === 'active') ||
                  (c.phone && c.smsStatus === 'active')
                ).length}
              </p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Total Active</p>
            </div>
          </div>
        </div>
        {/* Total Contacts */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{stats?.total || 0}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Total Contacts</p>
            </div>
          </div>
        </div>
        {/* Active Emails */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{stats?.emails.active || 0}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Active Emails</p>
            </div>
          </div>
        </div>
        {/* Total Emails */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/5 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{stats?.emails.total || 0}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Total Emails</p>
            </div>
          </div>
        </div>
        {/* Active SMS */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{stats?.sms.active || 0}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Active SMS</p>
            </div>
          </div>
        </div>
        {/* Total SMS */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/5 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{stats?.sms.total || 0}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Total SMS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-[var(--admin-input)] rounded-xl p-1 gap-0.5">
          {DATE_RANGE_OPTIONS.filter(o => o.group === 'quick').map((option) => (
            <button
              key={option.value}
              onClick={() => handleRangeChange(option.value)}
              disabled={isPending}
              className={cn(
                'px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200',
                dateRange === option.value
                  ? 'bg-[var(--primary)] text-[var(--admin-button-text)] shadow-sm'
                  : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-hover)]',
                isPending && 'opacity-50 cursor-wait'
              )}
            >
              <span className="hidden sm:inline">{option.label.replace('Last ', '')}</span>
              <span className="sm:hidden">{option.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Extended Filters - Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={cn(
              'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border',
              DATE_RANGE_OPTIONS.find(o => o.value === dateRange)?.group === 'extended'
                ? 'bg-[var(--primary)] text-[var(--admin-button-text)] border-[var(--primary)]'
                : 'bg-[var(--admin-input)] text-[var(--admin-text-muted)] border-[var(--admin-border-light)] hover:border-[var(--primary)]'
            )}
          >
            {DATE_RANGE_OPTIONS.find(o => o.value === dateRange)?.group === 'extended'
              ? selectedOption?.label
              : 'More'}
            <ChevronDown className={cn('w-4 h-4 transition-transform', showDropdown && 'rotate-180')} />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-xl shadow-xl z-20 overflow-hidden">
                <div className="p-1">
                  {DATE_RANGE_OPTIONS.filter(o => o.group === 'extended').map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleRangeChange(option.value)}
                      className={cn(
                        'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors',
                        dateRange === option.value
                          ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                          : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-hover)]'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {isPending && (
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span className="hidden sm:inline">Updating...</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>

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
      <div className={cn(
        'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 transition-opacity duration-200',
        isPending && 'opacity-60'
      )}>
        {/* Email List */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--admin-border-light)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                <h2 className="font-medium text-[var(--admin-text-primary)] text-sm sm:text-base truncate">Email</h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Bulk delete button */}
                {selectedEmailIds.size > 0 && (
                  <button
                    onClick={() => openBulkActionModal('email')}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    ({selectedEmailIds.size})
                  </button>
                )}
                {/* Tabs */}
                <div className="flex">
                  <button
                    onClick={() => setEmailTab('active')}
                    className={cn(
                      'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-l-lg transition-colors',
                      emailTab === 'active'
                        ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                        : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                    )}
                  >
                    Active ({emailCounts.active})
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
                    Unsubscribed ({emailCounts.inactive})
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
            {emailContacts.length > 0 ? (
              <div className="divide-y divide-[var(--admin-border-light)]">
                {emailContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="group w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-[var(--admin-hover)] transition-colors text-left gap-3 cursor-pointer"
                    onClick={() => handleContactClick(contact.id)}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={(e) => toggleEmailSelection(contact.id, e)}
                      className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                        selectedEmailIds.has(contact.id)
                          ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                          : 'border-[var(--admin-border)] hover:border-[var(--primary)]'
                      )}
                    >
                      {selectedEmailIds.has(contact.id) && <Check className="w-3 h-3" />}
                    </button>

                    {/* Contact info */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
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

                    {/* Date & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[var(--admin-text-muted)] hidden sm:block">
                        {formatDate(contact.createdAt)}
                      </span>
                      <button
                        onClick={(e) => openSingleActionModal('email', contact.id, e)}
                        className="p-1.5 rounded-lg text-[var(--admin-text-muted)] opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 sm:py-12 text-center">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-[var(--admin-text-muted)]" />
                <p className="text-[var(--admin-text-muted)] text-sm">
                  No {emailTab === 'inactive' ? 'unsubscribed' : emailTab} emails
                </p>
              </div>
            )}
          </div>

          {/* Email Pagination */}
          {emailTotalPages > 1 && (
            <div className="px-4 sm:px-6 py-3 border-t border-[var(--admin-border-light)] flex items-center justify-between">
              <span className="text-xs text-[var(--admin-text-muted)]">
                Showing {(emailPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(emailPage * ITEMS_PER_PAGE, allEmailContacts.length)} of {allEmailContacts.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEmailPage(p => Math.max(1, p - 1))}
                  disabled={emailPage === 1}
                  className="p-1.5 rounded-lg bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-[var(--admin-text-secondary)] min-w-[60px] text-center">
                  {emailPage} / {emailTotalPages}
                </span>
                <button
                  onClick={() => setEmailPage(p => Math.min(emailTotalPages, p + 1))}
                  disabled={emailPage === emailTotalPages}
                  className="p-1.5 rounded-lg bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SMS List */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--admin-border-light)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
                <h2 className="font-medium text-[var(--admin-text-primary)] text-sm sm:text-base truncate">SMS</h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Bulk delete button */}
                {selectedSmsIds.size > 0 && (
                  <button
                    onClick={() => openBulkActionModal('sms')}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    ({selectedSmsIds.size})
                  </button>
                )}
                {/* Tabs */}
                <div className="flex">
                  <button
                    onClick={() => setSmsTab('active')}
                    className={cn(
                      'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-l-lg transition-colors',
                      smsTab === 'active'
                        ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                        : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                    )}
                  >
                    Active ({smsCounts.active})
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
                    Unsubscribed ({smsCounts.inactive})
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
            {smsContacts.length > 0 ? (
              <div className="divide-y divide-[var(--admin-border-light)]">
                {smsContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="group w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-[var(--admin-hover)] transition-colors text-left gap-3 cursor-pointer"
                    onClick={() => handleContactClick(contact.id)}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={(e) => toggleSmsSelection(contact.id, e)}
                      className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                        selectedSmsIds.has(contact.id)
                          ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                          : 'border-[var(--admin-border)] hover:border-[var(--primary)]'
                      )}
                    >
                      {selectedSmsIds.has(contact.id) && <Check className="w-3 h-3" />}
                    </button>

                    {/* Contact info */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
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

                    {/* Date & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[var(--admin-text-muted)] hidden sm:block">
                        {formatDate(contact.createdAt)}
                      </span>
                      <button
                        onClick={(e) => openSingleActionModal('sms', contact.id, e)}
                        className="p-1.5 rounded-lg text-[var(--admin-text-muted)] opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 sm:py-12 text-center">
                <Phone className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-[var(--admin-text-muted)]" />
                <p className="text-[var(--admin-text-muted)] text-sm">
                  No {smsTab === 'inactive' ? 'unsubscribed' : smsTab} SMS contacts
                </p>
              </div>
            )}
          </div>

          {/* SMS Pagination */}
          {smsTotalPages > 1 && (
            <div className="px-4 sm:px-6 py-3 border-t border-[var(--admin-border-light)] flex items-center justify-between">
              <span className="text-xs text-[var(--admin-text-muted)]">
                Showing {(smsPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(smsPage * ITEMS_PER_PAGE, allSmsContacts.length)} of {allSmsContacts.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSmsPage(p => Math.max(1, p - 1))}
                  disabled={smsPage === 1}
                  className="p-1.5 rounded-lg bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-[var(--admin-text-secondary)] min-w-[60px] text-center">
                  {smsPage} / {smsTotalPages}
                </span>
                <button
                  onClick={() => setSmsPage(p => Math.min(smsTotalPages, p + 1))}
                  disabled={smsPage === smsTotalPages}
                  className="p-1.5 rounded-lg bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      <ActionModal
        isOpen={actionModal.isOpen}
        columnType={actionModal.columnType}
        isUnsubscribedTab={actionModal.isUnsubscribedTab}
        selectedCount={actionModal.contactIds.length}
        onClose={() => setActionModal({ ...actionModal, isOpen: false })}
        onUnsubscribe={handleUnsubscribe}
        onDelete={handleDelete}
      />
    </div>
  );
}
