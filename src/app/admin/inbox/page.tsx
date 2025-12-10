'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Inbox,
  Mail,
  MailOpen,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

function InboxContent() {
  const searchParams = useSearchParams();
  const highlightedMessageId = searchParams.get('message');

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'all'>('new');
  const [expandedMessage, setExpandedMessage] = useState<string | null>(highlightedMessageId);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (highlightedMessageId) {
      setExpandedMessage(highlightedMessageId);
      // If highlighted message is not new, switch to all tab
      const message = messages.find(m => m.id === highlightedMessageId);
      if (message?.isRead) {
        setActiveTab('all');
      }
    }
  }, [highlightedMessageId, messages]);

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
      await fetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      setMessages(messages.map(m =>
        m.id === id ? { ...m, isRead: true } : m
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
      });
      setMessages(messages.filter(m => m.id !== id));
      if (expandedMessage === id) {
        setExpandedMessage(null);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedMessage === id) {
      setExpandedMessage(null);
    } else {
      setExpandedMessage(id);
      // Mark as read when expanded
      const message = messages.find(m => m.id === id);
      if (message && !message.isRead) {
        markAsRead(id);
      }
    }
  };

  const newMessages = messages.filter(m => !m.isRead);
  const filteredMessages = activeTab === 'new' ? newMessages : messages;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-medium text-[var(--admin-text-primary)] flex items-center gap-2 sm:gap-3">
            <Inbox className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
            Inbox
            {newMessages.length > 0 && (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs sm:text-sm font-medium bg-[var(--primary)] text-[var(--admin-button-text)] rounded-full">
                {newMessages.length}
              </span>
            )}
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-1 text-sm hidden sm:block">
            Messages from your contact form
          </p>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('new')}
            className={cn(
              'px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2',
              activeTab === 'new'
                ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] border border-[var(--admin-border)]'
            )}
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">New Messages</span>
            <span className="sm:hidden">New</span>
            {newMessages.length > 0 && (
              <span className={cn(
                'px-1.5 py-0.5 text-xs rounded-full',
                activeTab === 'new'
                  ? 'bg-[var(--admin-bg)]/20 text-[var(--admin-button-text)]'
                  : 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              )}>
                {newMessages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2',
              activeTab === 'all'
                ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] border border-[var(--admin-border)]'
            )}
          >
            <MailOpen className="w-4 h-4" />
            <span className="hidden sm:inline">All Messages</span>
            <span className="sm:hidden">All</span>
            <span className={cn(
              'px-1.5 py-0.5 text-xs rounded-full',
              activeTab === 'all'
                ? 'bg-[var(--admin-bg)]/20 text-[var(--admin-button-text)]'
                : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)]'
            )}>
              {messages.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--admin-text-secondary)]">Loading messages...</p>
          </div>
        ) : searchFiltered.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)]" />
            <p className="text-[var(--admin-text-secondary)] font-medium">
              {activeTab === 'new' ? 'No new messages' : 'No messages yet'}
            </p>
            <p className="text-[var(--admin-text-muted)] text-sm mt-1">
              {activeTab === 'new'
                ? 'All caught up! Check All Messages for previous conversations.'
                : 'Messages from your contact form will appear here.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--admin-border)]">
            {searchFiltered.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'transition-colors',
                  highlightedMessageId === message.id && 'bg-[var(--primary)]/5'
                )}
              >
                {/* Message Header - Clickable */}
                <button
                  onClick={() => toggleExpand(message.id)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-[var(--admin-input)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      {/* Status indicator */}
                      <div className={cn(
                        'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                        message.isRead
                          ? 'bg-[var(--admin-input)] text-[var(--admin-text-muted)]'
                          : 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      )}>
                        {message.isRead ? (
                          <MailOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            'text-sm truncate',
                            message.isRead ? 'text-[var(--admin-text-secondary)]' : 'text-[var(--admin-text-primary)] font-medium'
                          )}>
                            {message.name}
                          </p>
                          {!message.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--admin-text-muted)] truncate hidden sm:block">{message.email}</p>
                        {message.subject && (
                          <p className="text-sm mt-1 truncate text-[var(--admin-text-secondary)]">
                            {message.subject}
                          </p>
                        )}
                        <p className="text-xs text-[var(--admin-text-muted)] mt-1 line-clamp-1">
                          {message.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)] hidden sm:flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(message.createdAt)}
                      </span>
                      {expandedMessage === message.id ? (
                        <ChevronUp className="w-4 h-4 text-[var(--admin-text-muted)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--admin-text-muted)]" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedMessage === message.id && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-[var(--admin-border)] bg-[var(--admin-bg)]">
                    <div className="pt-4 sm:pt-6">
                      {/* Message metadata */}
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-4 mb-3 sm:mb-4 text-xs text-[var(--admin-text-muted)]">
                        <span className="truncate">From: <span className="text-[var(--admin-text-secondary)]">{message.name} &lt;{message.email}&gt;</span></span>
                        <span>Date: <span className="text-[var(--admin-text-secondary)]">{new Date(message.createdAt || '').toLocaleString()}</span></span>
                      </div>

                      {message.subject && (
                        <p className="text-sm font-medium text-[var(--admin-text-primary)] mb-2 sm:mb-3">
                          Subject: {message.subject}
                        </p>
                      )}

                      {/* Message body */}
                      <div className="bg-[var(--admin-input)] rounded-lg p-3 sm:p-4 border border-[var(--admin-border)]">
                        <p className="text-sm text-[var(--admin-text-secondary)] whitespace-pre-wrap leading-relaxed">
                          {message.message}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-[var(--admin-border)]">
                        <div className="flex flex-wrap gap-2">
                          {!message.isRead && (
                            <button
                              onClick={() => markAsRead(message.id)}
                              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 text-xs bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Mark as read</span>
                              <span className="sm:hidden">Read</span>
                            </button>
                          )}
                          <a
                            href={`mailto:${message.email}?subject=Re: ${message.subject || 'Your inquiry'}`}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 text-xs bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg hover:bg-[var(--primary-dark)] transition-colors font-medium"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Reply
                          </a>
                        </div>
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors self-start sm:self-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
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
        <p className="text-[var(--admin-text-secondary)] mt-1">
          Messages from your contact form
        </p>
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
