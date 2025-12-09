'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  MessageSquare,
  Search,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string | null;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/admin/contacts');
      const data = await res.json();
      setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      setContacts(contacts.map((c) => (c.id === id ? { ...c, status } : c)));
      if (selectedContact?.id === id) {
        setSelectedContact({ ...selectedContact, status });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || c.status === statusFilter || (!c.status && statusFilter === 'new');
    return matchesSearch && matchesStatus;
  });

  // Stats
  const newCount = contacts.filter((c) => !c.status || c.status === 'new').length;
  const pendingCount = contacts.filter((c) => c.status === 'pending').length;
  const resolvedCount = contacts.filter((c) => c.status === 'resolved').length;

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
          <h1 className="text-2xl font-medium">Contact Messages</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Manage customer inquiries and messages
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setStatusFilter('new')}
          className={`bg-white rounded-xl border p-6 text-left transition-colors ${
            statusFilter === 'new' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-[var(--border)]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{newCount}</p>
              <p className="text-sm text-[var(--muted-foreground)]">New</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`bg-white rounded-xl border p-6 text-left transition-colors ${
            statusFilter === 'pending' ? 'border-yellow-500 ring-2 ring-yellow-100' : 'border-[var(--border)]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{pendingCount}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Pending</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`bg-white rounded-xl border p-6 text-left transition-colors ${
            statusFilter === 'resolved' ? 'border-green-500 ring-2 ring-green-100' : 'border-[var(--border)]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{resolvedCount}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Resolved</p>
            </div>
          </div>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="pl-10"
          />
        </div>
        {statusFilter !== 'all' && (
          <Button variant="outline" onClick={() => setStatusFilter('all')}>
            Clear Filter
          </Button>
        )}
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="divide-y divide-[var(--border-light)]">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className="p-4 flex items-start gap-4 hover:bg-[var(--muted)] transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-sm font-medium shrink-0">
                {contact.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium">{contact.name}</h3>
                  <span className="text-sm text-[var(--muted-foreground)]">{contact.email}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(contact.status)}`}>
                    {contact.status || 'New'}
                  </span>
                </div>
                {contact.subject && (
                  <p className="text-sm font-medium mt-1">{contact.subject}</p>
                )}
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-1 mt-1">
                  {contact.message}
                </p>
              </div>

              <div className="text-sm text-[var(--muted-foreground)] shrink-0">
                {new Date(contact.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="py-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
            <h3 className="font-medium mb-2">
              {search || statusFilter !== 'all' ? 'No matching messages' : 'No messages yet'}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {search || statusFilter !== 'all'
                ? 'Try a different search or filter'
                : 'Contact form submissions will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedContact(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto"
          >
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-lg font-medium">
                  {selectedContact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-medium">{selectedContact.name}</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">{selectedContact.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedContact(null)} className="p-2 rounded-lg hover:bg-[var(--muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedContact.status)}
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadge(selectedContact.status)}`}>
                    {selectedContact.status || 'New'}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {new Date(selectedContact.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {selectedContact.subject && (
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">Subject</label>
                  <p className="font-medium">{selectedContact.subject}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">Message</label>
                <div className="bg-[var(--muted)] rounded-lg p-4 whitespace-pre-wrap">
                  {selectedContact.message}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Update Status</label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedContact.status === 'new' || !selectedContact.status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedContact.id, 'new')}
                  >
                    <AlertCircle className="w-4 h-4" />
                    New
                  </Button>
                  <Button
                    variant={selectedContact.status === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedContact.id, 'pending')}
                  >
                    <Clock className="w-4 h-4" />
                    Pending
                  </Button>
                  <Button
                    variant={selectedContact.status === 'resolved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedContact.id, 'resolved')}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolved
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)] flex justify-between">
              <a
                href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject || 'Your inquiry'}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-dark)] transition-colors font-medium"
              >
                Reply via Email
              </a>
              <Button variant="outline" onClick={() => setSelectedContact(null)}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
