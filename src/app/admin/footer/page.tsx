'use client';

import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import Image from 'next/image';
import {
  Plus,
  Loader2,
  GripVertical,
  Edit,
  Trash2,
  Save,
  X,
  Mail,
  Link as LinkIcon,
  Shield,
  Instagram,
  Facebook,
  ExternalLink,
  Check,
  Droplet,
  Flag,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { InternalLinkSelector } from '@/components/admin/internal-link-selector';

interface FooterLink {
  id: string;
  label: string;
  url: string;
  column: string;
  isExternal: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface EmailSignupSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  placeholder: string;
  buttonText: string;
  successMessage: string;
}

interface ColumnTitles {
  column1: string;
  column2: string;
  column3: string;
  column4: string;
}

interface Certification {
  icon: string;
  iconUrl: string | null;
  label: string;
}

interface LegalLinks {
  privacyUrl: string;
  privacyLabel: string;
  termsUrl: string;
  termsLabel: string;
}

interface SocialLinks {
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  amazonStoreUrl?: string | null;
  instagramIconUrl?: string | null;
  facebookIconUrl?: string | null;
  tiktokIconUrl?: string | null;
  amazonIconUrl?: string | null;
}

interface PageOption {
  id: string;
  slug: string;
  title: string;
}

export default function FooterAdminPage() {
  const [activeTab, setActiveTab] = useState<'signup' | 'columns' | 'certs' | 'legal'>('signup');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Footer settings state
  const [emailSignup, setEmailSignup] = useState<EmailSignupSettings>({
    enabled: true,
    title: "Join the Archie's Community",
    subtitle: 'Expert eye care tips, new product drops, and wellness inspiration. No spam, ever.',
    placeholder: 'Enter your email',
    buttonText: 'Sign Up',
    successMessage: "You're on the list.",
  });

  const [columnTitles, setColumnTitles] = useState<ColumnTitles>({
    column1: 'Shop',
    column2: 'Learn',
    column3: 'Support',
    column4: 'Certifications',
  });

  const [certifications, setCertifications] = useState<Certification[]>([
    { icon: 'droplet', iconUrl: null, label: 'Preservative Free' },
    { icon: 'flag', iconUrl: null, label: 'Made in USA' },
    { icon: 'rabbit', iconUrl: null, label: 'Cruelty Free' },
  ]);

  const [legalLinks, setLegalLinks] = useState<LegalLinks>({
    privacyUrl: '/privacy',
    privacyLabel: 'Privacy Policy',
    termsUrl: '/terms',
    termsLabel: 'Terms of Service',
  });

  const [links, setLinks] = useState<Record<string, FooterLink[]>>({
    Shop: [],
    Learn: [],
    Support: [],
  });

  const [pages, setPages] = useState<PageOption[]>([]);
  const [siteName, setSiteName] = useState("Archie's Remedies");

  // Track original state for change detection
  const [originalState, setOriginalState] = useState<string>('');

  // Edit modal state
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [editColumn, setEditColumn] = useState<string>('');

  const hasChanges = JSON.stringify({
    emailSignup,
    columnTitles,
    certifications,
    legalLinks,
    links,
  }) !== originalState;

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const res = await fetch('/api/admin/footer');
      const data = await res.json();

      setEmailSignup(data.emailSignup || emailSignup);
      setColumnTitles(data.columnTitles || columnTitles);
      setCertifications(data.certifications || certifications);
      setLegalLinks(data.legalLinks || legalLinks);
      setSiteName(data.siteName || siteName);
      setPages(data.pages || []);

      // Organize links by column
      const linksByColumn: Record<string, FooterLink[]> = {
        [data.columnTitles?.column1 || 'Shop']: [],
        [data.columnTitles?.column2 || 'Learn']: [],
        [data.columnTitles?.column3 || 'Support']: [],
      };

      if (data.allLinks) {
        for (const link of data.allLinks) {
          const col = link.column || 'Shop';
          if (!linksByColumn[col]) {
            linksByColumn[col] = [];
          }
          linksByColumn[col].push(link);
        }
      }
      setLinks(linksByColumn);

      // Store original state
      setOriginalState(JSON.stringify({
        emailSignup: data.emailSignup || emailSignup,
        columnTitles: data.columnTitles || columnTitles,
        certifications: data.certifications || certifications,
        legalLinks: data.legalLinks || legalLinks,
        links: linksByColumn,
      }));
    } catch (error) {
      console.error('Failed to fetch footer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailSignup,
          columnTitles,
          certifications,
          legalLinks,
          links,
        }),
      });

      // Update original state after save
      setOriginalState(JSON.stringify({
        emailSignup,
        columnTitles,
        certifications,
        legalLinks,
        links,
      }));

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save footer:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = (column: string) => {
    const newLink: FooterLink = {
      id: `new-${Date.now()}`,
      label: '',
      url: '',
      column,
      isExternal: false,
      isActive: true,
      sortOrder: (links[column]?.length || 0),
    };
    setEditingLink(newLink);
    setEditColumn(column);
  };

  const handleEditLink = (link: FooterLink, column: string) => {
    setEditingLink({ ...link });
    setEditColumn(column);
  };

  const handleSaveLink = () => {
    if (!editingLink || !editColumn) return;

    const columnLinks = links[editColumn] || [];
    const existingIndex = columnLinks.findIndex(l => l.id === editingLink.id);

    if (existingIndex >= 0) {
      // Update existing
      columnLinks[existingIndex] = editingLink;
    } else {
      // Add new
      columnLinks.push(editingLink);
    }

    setLinks({
      ...links,
      [editColumn]: columnLinks,
    });

    setEditingLink(null);
    setEditColumn('');
  };

  const handleDeleteLink = (linkId: string, column: string) => {
    if (!confirm('Delete this link?')) return;

    setLinks({
      ...links,
      [column]: (links[column] || []).filter(l => l.id !== linkId),
    });
  };

  const handleReorderLinks = (column: string, newOrder: FooterLink[]) => {
    setLinks({
      ...links,
      [column]: newOrder.map((item, index) => ({ ...item, sortOrder: index })),
    });
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'droplet':
        return <Droplet className="w-4 h-4 text-white/80" />;
      case 'flag':
        return <Flag className="w-4 h-4 text-white/80" />;
      case 'rabbit':
        return (
          <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 4c-2 0-3.5 1-4.5 2.5S6 9.5 6 11c0 2 1 3.5 2 4.5s2 2 2 3.5v1h4v-1c0-1.5 1-2.5 2-3.5s2-2.5 2-4.5c0-1.5-.5-3-1.5-4.5S14 4 12 4z" />
            <path d="M10 8.5c-.5-.5-1.5-.5-2.5.5M14 8.5c.5-.5 1.5-.5 2.5.5" />
          </svg>
        );
      default:
        return <Award className="w-4 h-4 text-white/80" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--admin-text-primary)]">Footer</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1">
            Manage your site footer content and links
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all",
            hasChanges
              ? "bg-[var(--primary)] text-[var(--admin-button-text)] hover:bg-[var(--primary-dark)]"
              : "bg-[var(--admin-input)] text-[var(--admin-text-muted)] cursor-not-allowed"
          )}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Saved!' : hasChanges ? 'Save Changes' : 'No Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab('signup')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'signup'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <Mail className="w-4 h-4" />
          Email Signup
        </button>
        <button
          onClick={() => setActiveTab('columns')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'columns'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <LinkIcon className="w-4 h-4" />
          Navigation Links
        </button>
        <button
          onClick={() => setActiveTab('certs')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'certs'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <Shield className="w-4 h-4" />
          Certifications
        </button>
        <button
          onClick={() => setActiveTab('legal')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'legal'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <ExternalLink className="w-4 h-4" />
          Legal Links
        </button>
      </div>

      {/* Email Signup Tab */}
      {activeTab === 'signup' && (
        <div className="space-y-6">
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Email Signup Section</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Configure the email signup prompt at the top of your footer
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* Enable Toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailSignup.enabled}
                    onChange={(e) => setEmailSignup({ ...emailSignup, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--admin-hover)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                </label>
                <span className="text-sm font-medium text-[var(--admin-text-primary)]">Show email signup section</span>
              </div>

              {emailSignup.enabled && (
                <>
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={emailSignup.title}
                      onChange={(e) => setEmailSignup({ ...emailSignup, title: e.target.value })}
                      placeholder="Join the Archie's Community"
                      className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Subtitle
                    </label>
                    <textarea
                      value={emailSignup.subtitle}
                      onChange={(e) => setEmailSignup({ ...emailSignup, subtitle: e.target.value })}
                      placeholder="Expert eye care tips, new product drops, and wellness inspiration."
                      rows={2}
                      className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                    />
                  </div>

                  {/* Placeholder & Button Text */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Input Placeholder
                      </label>
                      <input
                        type="text"
                        value={emailSignup.placeholder}
                        onChange={(e) => setEmailSignup({ ...emailSignup, placeholder: e.target.value })}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={emailSignup.buttonText}
                        onChange={(e) => setEmailSignup({ ...emailSignup, buttonText: e.target.value })}
                        placeholder="Sign Up"
                        className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Success Message */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Success Message
                    </label>
                    <input
                      type="text"
                      value={emailSignup.successMessage}
                      onChange={(e) => setEmailSignup({ ...emailSignup, successMessage: e.target.value })}
                      placeholder="You're on the list."
                      className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[#1a1a1a] rounded-xl p-8">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-6">Preview</p>
            {emailSignup.enabled ? (
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h3 className="text-sm font-semibold tracking-[0.15em] uppercase mb-2 text-white">
                    {emailSignup.title || "Join the Archie's Community"}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {emailSignup.subtitle || 'Expert eye care tips, new product drops, and wellness inspiration.'}
                  </p>
                </div>
                <div className="flex items-center gap-4 border-b border-white/30 pb-3 flex-1 max-w-md">
                  <input
                    type="email"
                    placeholder={emailSignup.placeholder || 'Enter your email'}
                    disabled
                    className="flex-1 bg-transparent text-white placeholder:text-white/40 text-base"
                  />
                  <span className="text-sm font-medium tracking-wide uppercase text-white">
                    {emailSignup.buttonText || 'Sign Up'} →
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-white/40 text-center py-4">Email signup section is hidden</p>
            )}
          </div>
        </div>
      )}

      {/* Navigation Links Tab */}
      {activeTab === 'columns' && (
        <div className="space-y-6">
          {/* Column Titles */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Column Titles</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Customize the header titles for each link column
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  Column 1
                </label>
                <input
                  type="text"
                  value={columnTitles.column1}
                  onChange={(e) => setColumnTitles({ ...columnTitles, column1: e.target.value })}
                  placeholder="Shop"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  Column 2
                </label>
                <input
                  type="text"
                  value={columnTitles.column2}
                  onChange={(e) => setColumnTitles({ ...columnTitles, column2: e.target.value })}
                  placeholder="Learn"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  Column 3
                </label>
                <input
                  type="text"
                  value={columnTitles.column3}
                  onChange={(e) => setColumnTitles({ ...columnTitles, column3: e.target.value })}
                  placeholder="Support"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Link Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[columnTitles.column1, columnTitles.column2, columnTitles.column3].map((colTitle, colIndex) => (
              <div key={colIndex} className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
                <div className="p-4 border-b border-[var(--admin-border)] flex items-center justify-between">
                  <h3 className="font-medium text-[var(--admin-text-primary)]">{colTitle}</h3>
                  <button
                    onClick={() => handleAddLink(colTitle)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                <Reorder.Group
                  axis="y"
                  values={links[colTitle] || []}
                  onReorder={(newOrder) => handleReorderLinks(colTitle, newOrder)}
                  className="divide-y divide-[var(--admin-border)]"
                >
                  {(links[colTitle] || []).map((link) => (
                    <Reorder.Item
                      key={link.id}
                      value={link}
                      className="p-4 flex items-center gap-3 hover:bg-[var(--admin-hover)] transition-colors cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--admin-text-primary)] truncate">
                          {link.label || 'Untitled'}
                        </p>
                        <p className="text-xs text-[var(--admin-text-muted)] truncate">{link.url}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditLink(link, colTitle)}
                          className="p-1.5 rounded-lg hover:bg-[var(--admin-input)] transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5 text-[var(--admin-text-secondary)]" />
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id, colTitle)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                {(!links[colTitle] || links[colTitle].length === 0) && (
                  <div className="py-8 text-center">
                    <LinkIcon className="w-8 h-8 mx-auto mb-2 text-[var(--admin-text-muted)]" />
                    <p className="text-sm text-[var(--admin-text-muted)]">No links yet</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certs' && (
        <div className="space-y-6">
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Certifications</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Customize the certification badges shown in your footer. You can use built-in icons or upload custom ones.
              </p>
            </div>
            <div className="p-6 space-y-8">
              {/* Certification Column Title */}
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  Column Title
                </label>
                <input
                  type="text"
                  value={columnTitles.column4}
                  onChange={(e) => setColumnTitles({ ...columnTitles, column4: e.target.value })}
                  placeholder="Certifications"
                  className="w-full max-w-xs px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              {/* Certification Items */}
              {certifications.map((cert, index) => (
                <div key={index} className="p-6 bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)]">
                  <h3 className="font-medium text-[var(--admin-text-primary)] mb-4">Certification {index + 1}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Label
                      </label>
                      <input
                        type="text"
                        value={cert.label}
                        onChange={(e) => {
                          const newCerts = [...certifications];
                          newCerts[index] = { ...cert, label: e.target.value };
                          setCertifications(newCerts);
                        }}
                        placeholder="Preservative Free"
                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Icon Type
                      </label>
                      <select
                        value={cert.iconUrl ? 'custom' : cert.icon}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newCerts = [...certifications];
                          if (val === 'custom') {
                            newCerts[index] = { ...cert, icon: 'custom' };
                          } else {
                            newCerts[index] = { ...cert, icon: val, iconUrl: null };
                          }
                          setCertifications(newCerts);
                        }}
                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      >
                        <option value="droplet">Droplet (Preservative Free)</option>
                        <option value="flag">Flag (Made in USA)</option>
                        <option value="rabbit">Rabbit (Cruelty Free)</option>
                        <option value="custom">Custom Icon</option>
                      </select>
                    </div>
                  </div>

                  {(cert.icon === 'custom' || cert.iconUrl) && (
                    <div className="mt-4">
                      <MediaPickerButton
                        label="Custom Icon"
                        value={cert.iconUrl}
                        onChange={(url) => {
                          const newCerts = [...certifications];
                          newCerts[index] = { ...cert, icon: 'custom', iconUrl: url };
                          setCertifications(newCerts);
                        }}
                        helpText="Upload a small icon image (PNG recommended)"
                        aspectRatio="1/1"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[#1a1a1a] rounded-xl p-8">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-6">Preview</p>
            <h4 className="text-xs font-bold tracking-[0.15em] uppercase mb-6 text-white">
              {columnTitles.column4}
            </h4>
            <div className="flex gap-5">
              {certifications.map((cert, index) => (
                <div key={index} className="flex flex-col items-start gap-2">
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
                    {cert.iconUrl ? (
                      <Image src={cert.iconUrl} alt={cert.label} width={16} height={16} className="w-4 h-4 object-contain" />
                    ) : (
                      getIconComponent(cert.icon)
                    )}
                  </div>
                  <span className="text-[10px] text-white/50 uppercase tracking-wide">{cert.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legal Links Tab */}
      {activeTab === 'legal' && (
        <div className="space-y-6">
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Legal Links</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Configure the legal links that appear at the bottom of your footer
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* Privacy Policy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                    Privacy Policy Label
                  </label>
                  <input
                    type="text"
                    value={legalLinks.privacyLabel}
                    onChange={(e) => setLegalLinks({ ...legalLinks, privacyLabel: e.target.value })}
                    placeholder="Privacy Policy"
                    className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                    Privacy Policy URL
                  </label>
                  <InternalLinkSelector
                    value={legalLinks.privacyUrl}
                    onChange={(value) => setLegalLinks({ ...legalLinks, privacyUrl: value })}
                    placeholder="Select page or enter URL"
                  />
                </div>
              </div>

              {/* Terms of Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                    Terms of Service Label
                  </label>
                  <input
                    type="text"
                    value={legalLinks.termsLabel}
                    onChange={(e) => setLegalLinks({ ...legalLinks, termsLabel: e.target.value })}
                    placeholder="Terms of Service"
                    className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                    Terms of Service URL
                  </label>
                  <InternalLinkSelector
                    value={legalLinks.termsUrl}
                    onChange={(value) => setLegalLinks({ ...legalLinks, termsUrl: value })}
                    placeholder="Select page or enter URL"
                  />
                </div>
              </div>

              {/* Site Name Info */}
              <div className="p-4 bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)]">
                <p className="text-sm text-[var(--admin-text-secondary)]">
                  <span className="font-medium text-[var(--admin-text-primary)]">Copyright Notice:</span> The site name in the copyright notice ({siteName}) is pulled from your Site Settings. The year is automatically updated.
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[#1a1a1a] rounded-xl p-8">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-6">Preview</p>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-[11px] uppercase tracking-wide text-white/40">
                <span className="hover:text-white/60 transition-colors cursor-pointer">
                  {legalLinks.privacyLabel}
                </span>
                <span>•</span>
                <span className="hover:text-white/60 transition-colors cursor-pointer">
                  {legalLinks.termsLabel}
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-wide text-white/40">
                © {new Date().getFullYear()} {siteName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Link Modal */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setEditingLink(null); setEditColumn(''); }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-border)] shadow-xl w-full max-w-md"
          >
            <div className="p-6 border-b border-[var(--admin-border)] flex items-center justify-between">
              <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                {editingLink.id.startsWith('new-') ? 'Add Link' : 'Edit Link'}
              </h2>
              <button
                onClick={() => { setEditingLink(null); setEditColumn(''); }}
                className="p-2 rounded-lg hover:bg-[var(--admin-input)] text-[var(--admin-text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Label</label>
                <input
                  type="text"
                  value={editingLink.label}
                  onChange={(e) => setEditingLink({ ...editingLink, label: e.target.value })}
                  placeholder="Dry Eye Drops"
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingLink.isExternal}
                    onChange={(e) => setEditingLink({ ...editingLink, isExternal: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--admin-hover)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                </label>
                <span className="text-sm font-medium text-[var(--admin-text-primary)]">
                  External link (opens in new tab)
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">URL</label>
                {editingLink.isExternal ? (
                  <input
                    type="text"
                    value={editingLink.url}
                    onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                ) : (
                  <InternalLinkSelector
                    value={editingLink.url}
                    onChange={(value) => setEditingLink({ ...editingLink, url: value })}
                    placeholder="Select page or enter URL"
                  />
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[var(--admin-border)] flex justify-end gap-3">
              <button
                onClick={() => { setEditingLink(null); setEditColumn(''); }}
                className="px-4 py-2 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLink}
                disabled={!editingLink.label || !editingLink.url}
                className="px-5 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
              >
                Save Link
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
