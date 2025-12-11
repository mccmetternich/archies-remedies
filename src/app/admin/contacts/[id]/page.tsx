'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Activity,
  Tag,
  ExternalLink,
  FileText,
  X,
  AlertTriangle,
  UserMinus,
  MessageSquare,
  CheckCircle,
  Clock,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactActivity {
  id: string;
  activityType: string;
  activityData: string | null;
  popupId: string | null;
  productId: string | null;
  pageSlug: string | null;
  createdAt: string;
  productName?: string | null;
  productSlug?: string | null;
  popupName?: string | null;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string | null;
  isRead: boolean | null;
  createdAt: string;
}

interface Contact {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  notes: string | null;
  source: string | null;
  emailStatus: string | null;
  smsStatus: string | null;
  emailConsentAt: string | null;
  smsConsentAt: string | null;
  createdAt: string;
  updatedAt: string;
  activities?: ContactActivity[];
  messages?: ContactMessage[];
}

type TabType = 'info' | 'activity' | 'messages';

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [formData, setFormData] = useState<Partial<Contact>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchContact();
  }, [resolvedParams.id]);

  const fetchContact = async () => {
    try {
      const res = await fetch(`/api/admin/subscribers/${resolvedParams.id}`);
      if (!res.ok) {
        router.push('/admin/contacts');
        return;
      }
      const data = await res.json();
      setContact(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || '',
        country: data.country || '',
        notes: data.notes || '',
        emailStatus: data.emailStatus || 'active',
        smsStatus: data.smsStatus || 'none',
      });
    } catch (error) {
      console.error('Failed to fetch contact:', error);
      router.push('/admin/contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Contact, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!contact) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/subscribers/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updated = await res.json();
        setContact(updated);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to save contact:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!contact) return;

    setDeleting(true);
    try {
      await fetch(`/api/admin/subscribers/${contact.id}`, { method: 'DELETE' });
      router.push('/admin/contacts');
    } catch (error) {
      console.error('Failed to delete contact:', error);
      setDeleting(false);
    }
  };

  const handleSetInactive = async () => {
    if (!contact) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/subscribers/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailStatus: contact.email ? 'inactive' : contact.emailStatus,
          smsStatus: contact.phone ? 'inactive' : contact.smsStatus,
        }),
      });

      if (res.ok) {
        router.push('/admin/contacts');
      }
    } catch (error) {
      console.error('Failed to set contact inactive:', error);
      setDeleting(false);
    }
  };

  const formatActivityType = (type: string) => {
    const labels: Record<string, string> = {
      popup_view: 'Viewed Popup',
      popup_submit: 'Submitted Popup',
      product_cta_click: 'Clicked Product CTA',
      page_view: 'Viewed Page',
      email_open: 'Opened Email',
      sms_click: 'Clicked SMS Link',
    };
    return labels[type] || type;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'popup_view':
      case 'popup_submit':
        return <FileText className="w-4 h-4" />;
      case 'product_cta_click':
        return <ExternalLink className="w-4 h-4" />;
      case 'page_view':
        return <Activity className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  if (!contact) {
    return null;
  }

  const displayName = contact.firstName || contact.lastName
    ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
    : contact.email || contact.phone || 'Unknown Contact';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/contacts"
            className="p-2 rounded-lg hover:bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-lg font-medium text-[var(--primary)]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-medium text-[var(--admin-text-primary)]">{displayName}</h1>
              <p className="text-sm text-[var(--admin-text-muted)]">
                Added {new Date(contact.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-lg font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium transition-colors',
              (saving || !hasChanges) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--primary-dark)]'
            )}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--admin-border-light)]">
        <button
          onClick={() => setActiveTab('info')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'info'
              ? 'text-[var(--primary)] border-[var(--primary)]'
              : 'text-[var(--admin-text-secondary)] border-transparent hover:text-[var(--admin-text-primary)]'
          )}
        >
          Contact Info
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'activity'
              ? 'text-[var(--primary)] border-[var(--primary)]'
              : 'text-[var(--admin-text-secondary)] border-transparent hover:text-[var(--admin-text-primary)]'
          )}
        >
          Activity History
          {contact.activities && contact.activities.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-[var(--admin-input)] rounded-full">
              {contact.activities.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'messages'
              ? 'text-[var(--primary)] border-[var(--primary)]'
              : 'text-[var(--admin-text-secondary)] border-transparent hover:text-[var(--admin-text-primary)]'
          )}
        >
          Messages
          {contact.messages && contact.messages.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-[var(--admin-input)] rounded-full">
              {contact.messages.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)]">
                <User className="w-4 h-4" />
                Name
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="First name"
                    className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last name"
                    className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)]">
                <Mail className="w-4 h-4" />
                Contact Methods
              </h3>
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email address"
                    className="flex-1 px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  <select
                    value={formData.emailStatus || 'active'}
                    onChange={(e) => handleInputChange('emailStatus', e.target.value)}
                    className="px-3 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Unsubscribed</option>
                    <option value="bounced">Bounced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">Phone</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Phone number"
                    className="flex-1 px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  <select
                    value={formData.smsStatus || 'none'}
                    onChange={(e) => handleInputChange('smsStatus', e.target.value)}
                    className="px-3 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Unsubscribed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)]">
                <MapPin className="w-4 h-4" />
                Address
              </h3>
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">Street Address</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address"
                  className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">City</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">State</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zipCode || ''}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="ZIP"
                    className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--admin-text-muted)] mb-1.5">Country</label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Country"
                    className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)]">
                <FileText className="w-4 h-4" />
                Notes
              </h3>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add notes about this contact..."
                rows={4}
                className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            </div>

            {/* Source Info */}
            <div className="space-y-2 md:col-span-2 pt-4 border-t border-[var(--admin-border-light)]">
              <div className="flex items-center gap-6 text-sm text-[var(--admin-text-muted)]">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>Source: {contact.source || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {new Date(contact.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Updated: {new Date(contact.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden">
          {contact.activities && contact.activities.length > 0 ? (
            <div className="divide-y divide-[var(--admin-border-light)]">
              {contact.activities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[var(--admin-input)] flex items-center justify-center text-[var(--admin-text-muted)]">
                    {getActivityIcon(activity.activityType)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--admin-text-primary)]">
                      {formatActivityType(activity.activityType)}
                    </p>
                    {activity.productName && (
                      <p className="text-sm text-[var(--admin-text-secondary)]">
                        Product: {activity.productName}
                      </p>
                    )}
                    {activity.popupName && (
                      <p className="text-sm text-[var(--admin-text-secondary)]">
                        Popup: {activity.popupName}
                      </p>
                    )}
                    {activity.pageSlug && (
                      <p className="text-sm text-[var(--admin-text-secondary)]">
                        Page: /{activity.pageSlug}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-[var(--admin-text-muted)]">
                    {new Date(activity.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)]" />
              <h3 className="font-medium text-[var(--admin-text-primary)] mb-2">No activity yet</h3>
              <p className="text-sm text-[var(--admin-text-muted)]">
                Activity will be recorded when this contact interacts with your site
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden">
          {contact.messages && contact.messages.length > 0 ? (
            <div className="divide-y divide-[var(--admin-border-light)]">
              {contact.messages.map((msg) => (
                <div key={msg.id} className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[var(--admin-input)] flex items-center justify-center text-[var(--admin-text-muted)]">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {msg.subject && (
                          <p className="font-medium text-[var(--admin-text-primary)] truncate">
                            {msg.subject}
                          </p>
                        )}
                        <div className="flex items-center gap-1">
                          {msg.status === 'resolved' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-400">
                              <CheckCircle className="w-3 h-3" />
                              Resolved
                            </span>
                          ) : msg.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-400">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-400">
                              <Circle className="w-3 h-3" />
                              New
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-[var(--admin-text-secondary)] line-clamp-2 mb-2">
                        {msg.message}
                      </p>
                      <p className="text-xs text-[var(--admin-text-muted)]">
                        {new Date(msg.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Link
                      href={`/admin/messages/${msg.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)] rounded-lg transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)]" />
              <h3 className="font-medium text-[var(--admin-text-primary)] mb-2">No messages yet</h3>
              <p className="text-sm text-[var(--admin-text-muted)]">
                Messages from this contact will appear here when they reach out via the contact form
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-border-light)] shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border-light)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                  Remove Contact
                </h2>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="p-2 rounded-lg hover:bg-[var(--admin-hover)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-[var(--admin-text-secondary)] mb-6">
                What would you like to do with <span className="font-medium text-[var(--admin-text-primary)]">{displayName}</span>?
              </p>

              <div className="space-y-3">
                {/* Set Inactive Option */}
                <button
                  onClick={handleSetInactive}
                  disabled={deleting}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--admin-border-light)] hover:border-orange-400/50 hover:bg-orange-500/5 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    <UserMinus className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--admin-text-primary)]">Set as Unsubscribed</p>
                    <p className="text-sm text-[var(--admin-text-muted)]">Keep contact data but mark as inactive</p>
                  </div>
                </button>

                {/* Delete Permanently Option */}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--admin-border-light)] hover:border-red-400/50 hover:bg-red-500/5 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--admin-text-primary)]">Delete Permanently</p>
                    <p className="text-sm text-[var(--admin-text-muted)]">Remove all data for this contact</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--admin-border-light)] bg-[var(--admin-input)]">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="w-full px-4 py-2.5 rounded-lg text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-hover)] transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
