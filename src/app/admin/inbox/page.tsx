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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white flex items-center gap-3">
            <Inbox className="w-6 h-6 text-[var(--primary)]" />
            Inbox
            {newMessages.length > 0 && (
              <span className="px-2.5 py-1 text-sm font-medium bg-[var(--primary)] text-[#0a0a0a] rounded-full">
                {newMessages.length} new
              </span>
            )}
          </h1>
          <p className="text-gray-400 mt-1">
            Messages from your contact form
          </p>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('new')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
              activeTab === 'new'
                ? 'bg-[var(--primary)] text-[#0a0a0a]'
                : 'bg-[#111111] text-gray-400 hover:text-white border border-[#1f1f1f]'
            )}
          >
            <Mail className="w-4 h-4" />
            New Messages
            {newMessages.length > 0 && (
              <span className={cn(
                'px-1.5 py-0.5 text-xs rounded-full',
                activeTab === 'new'
                  ? 'bg-[#0a0a0a]/20 text-[#0a0a0a]'
                  : 'bg-[var(--primary)] text-[#0a0a0a]'
              )}>
                {newMessages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
              activeTab === 'all'
                ? 'bg-[var(--primary)] text-[#0a0a0a]'
                : 'bg-[#111111] text-gray-400 hover:text-white border border-[#1f1f1f]'
            )}
          >
            <MailOpen className="w-4 h-4" />
            All Messages
            <span className={cn(
              'px-1.5 py-0.5 text-xs rounded-full',
              activeTab === 'all'
                ? 'bg-[#0a0a0a]/20 text-[#0a0a0a]'
                : 'bg-[#1a1a1a] text-gray-400'
            )}>
              {messages.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-[#111111] border border-[#1f1f1f] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading messages...</p>
          </div>
        ) : searchFiltered.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 font-medium">
              {activeTab === 'new' ? 'No new messages' : 'No messages yet'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {activeTab === 'new'
                ? 'All caught up! Check All Messages for previous conversations.'
                : 'Messages from your contact form will appear here.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1f1f1f]">
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
                  className="w-full px-6 py-4 text-left hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Status indicator */}
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                        message.isRead
                          ? 'bg-[#1a1a1a] text-gray-500'
                          : 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      )}>
                        {message.isRead ? (
                          <MailOpen className="w-5 h-5" />
                        ) : (
                          <Mail className="w-5 h-5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            'text-sm truncate',
                            message.isRead ? 'text-gray-300' : 'text-white font-medium'
                          )}>
                            {message.name}
                          </p>
                          {!message.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{message.email}</p>
                        {message.subject && (
                          <p className={cn(
                            'text-sm mt-1 truncate',
                            message.isRead ? 'text-gray-400' : 'text-gray-300'
                          )}>
                            {message.subject}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {message.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(message.createdAt)}
                      </span>
                      {expandedMessage === message.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedMessage === message.id && (
                  <div className="px-6 pb-6 border-t border-[#1f1f1f] bg-[#0a0a0a]">
                    <div className="pt-6">
                      {/* Message metadata */}
                      <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
                        <span>From: <span className="text-gray-300">{message.name} &lt;{message.email}&gt;</span></span>
                        <span>Date: <span className="text-gray-300">{new Date(message.createdAt || '').toLocaleString()}</span></span>
                      </div>

                      {message.subject && (
                        <p className="text-sm font-medium text-white mb-3">
                          Subject: {message.subject}
                        </p>
                      )}

                      {/* Message body */}
                      <div className="bg-[#111111] rounded-lg p-4 border border-[#1f1f1f]">
                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {message.message}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1f1f1f]">
                        <div className="flex gap-2">
                          {!message.isRead && (
                            <button
                              onClick={() => markAsRead(message.id)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-[#1a1a1a] text-gray-300 rounded-lg hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Mark as read
                            </button>
                          )}
                          <a
                            href={`mailto:${message.email}?subject=Re: ${message.subject || 'Your inquiry'}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-[var(--primary)] text-[#0a0a0a] rounded-lg hover:bg-[var(--primary-dark)] transition-colors font-medium"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Reply via email
                          </a>
                        </div>
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
        <h1 className="text-2xl font-medium text-white flex items-center gap-3">
          <Inbox className="w-6 h-6 text-[var(--primary)]" />
          Inbox
        </h1>
        <p className="text-gray-400 mt-1">
          Messages from your contact form
        </p>
      </div>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
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
