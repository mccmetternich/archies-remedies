'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { markMessageAsRead as markMessageAsReadAction, markMessageAsUnread as markMessageAsUnreadAction } from '@/lib/actions/inbox';
import {
  Inbox,
  Mail,
  MailOpen,
  Clock,
  Trash2,
  Search,
  Loader2,
  Reply,
  User,
  Calendar,
  MessageSquare,
  ChevronRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ContactMessage {
  id: string;
  firstName: string | null;
  lastName: string | null;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string | null;
  isRead: boolean | null;
  createdAt: string | null;
  contactId?: string | null;
}

function InboxContent() {
  const searchParams = useSearchParams();
  const highlightedMessageId = searchParams.get('message');

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'all'>('new');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Track which messages were "new" when user opened them (to prevent disappearing)
  const [viewedNewMessageIds, setViewedNewMessageIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle highlighted message from URL
  useEffect(() => {
    if (highlightedMessageId && messages.length > 0) {
      const message = messages.find(m => m.id === highlightedMessageId);
      if (message) {
        setSelectedMessage(message);
        if (message.isRead) {
          setActiveTab('all');
        }
      }
    }
  }, [highlightedMessageId, messages]);

  // NOTE: Removed the useEffect that cleared viewedNewMessageIds on tab switch
  // Messages now stay in "New" tab until user navigates away from inbox entirely

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/contacts');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Use server action to mark as read and revalidate layout
      const result = await markMessageAsReadAction(id);

      if (result.success) {
        setMessages(prev => prev.map(m =>
          m.id === id ? { ...m, isRead: true } : m
        ));
        if (selectedMessage?.id === id) {
          setSelectedMessage(prev => prev ? { ...prev, isRead: true } : null);
        }
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      const result = await markMessageAsUnreadAction(id);

      if (result.success) {
        setMessages(prev => prev.map(m =>
          m.id === id ? { ...m, isRead: false } : m
        ));
        if (selectedMessage?.id === id) {
          setSelectedMessage(prev => prev ? { ...prev, isRead: false } : null);
        }
        // Remove from viewed set so it shows as truly unread
        setViewedNewMessageIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to mark as unread:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        // Import and call server action to revalidate
        const { refreshInboxCount } = await import('@/lib/actions/inbox');
        await refreshInboxCount();
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleSelectMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    // Track this message so it doesn't disappear from "New" tab
    if (!message.isRead) {
      setViewedNewMessageIds(prev => new Set(prev).add(message.id));
      markAsRead(message.id);
    }
  };

  const newMessages = messages.filter(m => !m.isRead);
  // For "New" tab, include both unread messages AND messages that were just viewed
  const newTabMessages = messages.filter(m => !m.isRead || viewedNewMessageIds.has(m.id));
  const filteredMessages = activeTab === 'new' ? newTabMessages : messages;

  const searchFiltered = filteredMessages.filter(m => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      (m.subject?.toLowerCase().includes(query)) ||
      m.message.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatFullDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-medium text-[var(--admin-text-primary)] flex items-center gap-2 sm:gap-3">
            <Inbox className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
            Inbox
            {newMessages.length > 0 && (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs sm:text-sm font-medium bg-[#bbdae9] text-[#1a1a1a] rounded-full">
                {newMessages.length}
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Message List Panel */}
        <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[var(--admin-border)]">
            <button
              onClick={() => setActiveTab('new')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
                activeTab === 'new'
                  ? 'text-[var(--admin-text-primary)] border-b-2 border-[var(--primary)] bg-[var(--admin-bg)]'
                  : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]'
              )}
            >
              <Mail className="w-4 h-4" />
              New
              {newMessages.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-[#bbdae9] text-[#1a1a1a]">
                  {newMessages.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
                activeTab === 'all'
                  ? 'text-[var(--admin-text-primary)] border-b-2 border-[var(--primary)] bg-[var(--admin-bg)]'
                  : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]'
              )}
            >
              <MailOpen className="w-4 h-4" />
              All
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-[var(--admin-border)] text-[var(--admin-text-muted)]">
                {messages.length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-[var(--admin-border)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--primary)]" />
                <p className="text-sm text-[var(--admin-text-muted)]">Loading...</p>
              </div>
            ) : searchFiltered.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-[var(--admin-text-muted)] opacity-50" />
                <p className="text-sm text-[var(--admin-text-muted)]">
                  {activeTab === 'new' ? 'No new messages' : 'No messages yet'}
                </p>
              </div>
            ) : (
              <div>
                {searchFiltered.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-[var(--admin-border)] transition-colors',
                      selectedMessage?.id === message.id
                        ? 'bg-[var(--primary)]/10'
                        : 'hover:bg-[var(--admin-bg)]',
                      !message.isRead && 'bg-[var(--primary)]/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0',
                        message.isRead
                          ? 'bg-[var(--admin-border)] text-[var(--admin-text-muted)]'
                          : 'bg-[#bbdae9] text-[#1a1a1a]'
                      )}>
                        {getInitials(message.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={cn(
                            'text-sm truncate',
                            message.isRead
                              ? 'text-[var(--admin-text-secondary)]'
                              : 'text-[var(--admin-text-primary)] font-semibold'
                          )}>
                            {message.name}
                          </span>
                          <span className="text-xs text-[var(--admin-text-muted)] shrink-0">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>

                        {message.subject && (
                          <p className={cn(
                            'text-sm truncate mb-0.5',
                            message.isRead
                              ? 'text-[var(--admin-text-muted)]'
                              : 'text-[var(--admin-text-secondary)] font-medium'
                          )}>
                            {message.subject}
                          </p>
                        )}

                        <p className="text-xs text-[var(--admin-text-muted)] truncate">
                          {message.message}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {!message.isRead && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#bbdae9] shrink-0 mt-1.5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail Panel - Desktop */}
        <div className="hidden lg:flex flex-1 flex-col bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="p-6 border-b border-[var(--admin-border)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#bbdae9] flex items-center justify-center text-lg font-semibold text-[#1a1a1a]">
                      {getInitials(selectedMessage.name)}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--admin-text-primary)]">
                        {selectedMessage.name}
                      </h2>
                      <p className="text-sm text-[var(--admin-text-muted)]">
                        {selectedMessage.email}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[var(--admin-text-muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatFullDate(selectedMessage.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {selectedMessage.contactId && (
                      <Link
                        href={`/admin/contacts/${selectedMessage.contactId}`}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-[var(--admin-border)] text-[var(--admin-text-primary)] rounded-lg hover:bg-[var(--admin-hover)] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        View Contact
                      </Link>
                    )}
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your inquiry'}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg hover:bg-[var(--primary-dark)] transition-colors font-medium"
                    >
                      <Reply className="w-4 h-4" />
                      Reply
                    </a>
                    {selectedMessage.isRead && (
                      <button
                        onClick={() => markAsUnread(selectedMessage.id)}
                        className="p-2 text-[var(--admin-text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                        title="Mark as unread"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="p-2 text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subject */}
              {selectedMessage.subject && (
                <div className="px-6 py-4 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]">
                  <p className="text-sm text-[var(--admin-text-muted)]">Subject</p>
                  <p className="text-base font-medium text-[var(--admin-text-primary)] mt-1">
                    {selectedMessage.subject}
                  </p>
                </div>
              )}

              {/* Message Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <p className="text-[var(--admin-text-secondary)] whitespace-pre-wrap leading-relaxed text-base">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 text-[var(--admin-text-muted)] opacity-30" />
                <p className="text-[var(--admin-text-muted)]">
                  Select a message to read
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Message Detail Modal */}
      {selectedMessage && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[var(--admin-bg)]">
          <div className="h-full flex flex-col">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--admin-border)]">
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 -ml-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your inquiry'}`}
                  className="p-2 text-[var(--primary)]"
                >
                  <Reply className="w-5 h-5" />
                </a>
                {selectedMessage.isRead && (
                  <button
                    onClick={() => markAsUnread(selectedMessage.id)}
                    className="p-2 text-[var(--admin-text-muted)]"
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="p-2 text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#bbdae9] flex items-center justify-center text-base font-semibold text-[#1a1a1a]">
                  {getInitials(selectedMessage.name)}
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--admin-text-primary)]">
                    {selectedMessage.name}
                  </h2>
                  <p className="text-sm text-[var(--admin-text-muted)]">
                    {selectedMessage.email}
                  </p>
                </div>
              </div>

              <div className="text-xs text-[var(--admin-text-muted)] mb-4">
                {formatFullDate(selectedMessage.createdAt)}
              </div>

              {selectedMessage.subject && (
                <div className="mb-4 p-3 bg-[var(--admin-input)] rounded-lg">
                  <p className="text-xs text-[var(--admin-text-muted)]">Subject</p>
                  <p className="text-sm font-medium text-[var(--admin-text-primary)] mt-1">
                    {selectedMessage.subject}
                  </p>
                </div>
              )}

              <p className="text-[var(--admin-text-secondary)] whitespace-pre-wrap leading-relaxed">
                {selectedMessage.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InboxLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-[var(--admin-text-primary)] flex items-center gap-3">
          <Inbox className="w-6 h-6 text-[var(--primary)]" />
          Inbox
        </h1>
      </div>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<InboxLoading />}>
      <InboxContent />
    </Suspense>
  );
}
