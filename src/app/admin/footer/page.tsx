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
  Sun,
  Moon,
  Palette,
  Image as ImageIcon,
  Share2,
  FileText,
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
  const [activeTab, setActiveTab] = useState<'theme' | 'signup' | 'main' | 'bottom'>('main');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Theme settings
  const [footerTheme, setFooterTheme] = useState<'dark' | 'light'>('dark');
  const [footerLogoUrl, setFooterLogoUrl] = useState<string | null>(null);
  const [fullWidthLogoUrl, setFullWidthLogoUrl] = useState<string | null>(null);
  const [fullWidthLogoEnabled, setFullWidthLogoEnabled] = useState(true);

  // Social links state
  const [socialLinks, setSocialLinks] = useState({
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    amazonStoreUrl: '',
  });

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
    footerTheme,
    footerLogoUrl,
    fullWidthLogoUrl,
    fullWidthLogoEnabled,
    socialLinks,
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

      // Theme and logo settings
      setFooterTheme(data.footerTheme || 'dark');
      setFooterLogoUrl(data.footerLogoUrl || null);
      setFullWidthLogoUrl(data.fullWidthLogoUrl || data.massiveFooterLogoUrl || null);
      setFullWidthLogoEnabled(data.fullWidthLogoEnabled ?? true);

      // Social links
      setSocialLinks({
        instagramUrl: data.instagramUrl || '',
        facebookUrl: data.facebookUrl || '',
        tiktokUrl: data.tiktokUrl || '',
        amazonStoreUrl: data.amazonStoreUrl || '',
      });

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
        footerTheme: data.footerTheme || 'dark',
        footerLogoUrl: data.footerLogoUrl || null,
        fullWidthLogoUrl: data.fullWidthLogoUrl || data.massiveFooterLogoUrl || null,
        fullWidthLogoEnabled: data.fullWidthLogoEnabled ?? true,
        socialLinks: {
          instagramUrl: data.instagramUrl || '',
          facebookUrl: data.facebookUrl || '',
          tiktokUrl: data.tiktokUrl || '',
          amazonStoreUrl: data.amazonStoreUrl || '',
        },
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
          footerTheme,
          footerLogoUrl,
          fullWidthLogoUrl,
          fullWidthLogoEnabled,
          socialLinks,
          emailSignup,
          columnTitles,
          certifications,
          legalLinks,
          links,
        }),
      });

      // Update original state after save
      setOriginalState(JSON.stringify({
        footerTheme,
        footerLogoUrl,
        fullWidthLogoUrl,
        fullWidthLogoEnabled,
        socialLinks,
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

      {/* Tabs - Order: Footer Links, Email Sign Up, Legal Links, Theme & Branding */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab('main')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'main'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <LinkIcon className="w-4 h-4" />
          Footer Links
        </button>
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
          Email Sign Up
        </button>
        <button
          onClick={() => setActiveTab('bottom')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'bottom'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <FileText className="w-4 h-4" />
          Legal Links
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'theme'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <Palette className="w-4 h-4" />
          Theme & Branding
        </button>
      </div>

      {/* Theme & Branding Tab */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Footer Theme</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Choose the color scheme for your footer
              </p>
            </div>
            <div className="p-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setFooterTheme('dark')}
                  className={cn(
                    'flex-1 p-4 rounded-xl border-2 transition-all',
                    footerTheme === 'dark'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]'
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                      <Moon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[var(--admin-text-primary)]">Dark</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">Dark background, light text</p>
                    </div>
                  </div>
                  <div className="h-16 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                    <span className="text-xs text-white/60">Preview</span>
                  </div>
                </button>
                <button
                  onClick={() => setFooterTheme('light')}
                  className={cn(
                    'flex-1 p-4 rounded-xl border-2 transition-all',
                    footerTheme === 'light'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]'
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Sun className="w-5 h-5 text-gray-900" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[var(--admin-text-primary)]">Light</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">Light background, dark text</p>
                    </div>
                  </div>
                  <div className="h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-600">Preview</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Logo Uploads */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Footer Logos</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Upload the logos displayed in your footer
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Footer Logo */}
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">
                  Main Footer Logo
                </label>
                <p className="text-xs text-[var(--admin-text-muted)] mb-3">
                  Shown in the top-left of the main footer section
                </p>
                <MediaPickerButton
                  label="Upload Logo"
                  value={footerLogoUrl}
                  onChange={setFooterLogoUrl}
                  helpText="Recommended: 200x60px, PNG with transparency"
                  aspectRatio="16/5"
                />
              </div>

              {/* Full-Width Logo */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)]">
                    Full-Width Logo
                  </label>
                  <button
                    type="button"
                    onClick={() => setFullWidthLogoEnabled(!fullWidthLogoEnabled)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      fullWidthLogoEnabled ? 'bg-[var(--primary)]' : 'bg-[var(--admin-border)]'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        fullWidthLogoEnabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
                <p className="text-xs text-[var(--admin-text-muted)] mb-3">
                  Large logo displayed at the bottom of the footer
                </p>
                {fullWidthLogoEnabled && (
                  <MediaPickerButton
                    label="Upload Full-Width Logo"
                    value={fullWidthLogoUrl}
                    onChange={setFullWidthLogoUrl}
                    helpText="Recommended: 1200x200px, PNG with transparency"
                    aspectRatio="6/1"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Social Links</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Add your social media profile URLs. Leave blank to hide.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </label>
                <input
                  type="text"
                  value={socialLinks.instagramUrl}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/yourhandle"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </label>
                <input
                  type="text"
                  value={socialLinks.facebookUrl}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  TikTok
                </label>
                <input
                  type="text"
                  value={socialLinks.tiktokUrl}
                  onChange={(e) => setSocialLinks({ ...socialLinks, tiktokUrl: e.target.value })}
                  placeholder="https://tiktok.com/@yourhandle"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.132-.1-.18-.22-.106-.343zm6.664-5.082c0-1.167.424-2.165 1.27-2.99.847-.826 1.878-1.24 3.093-1.24 1.178 0 2.18.415 3.007 1.244.828.83 1.242 1.83 1.242 3.002 0 1.155-.414 2.143-1.242 2.964-.83.82-1.83 1.23-3.007 1.23-1.215 0-2.246-.41-3.093-1.23-.846-.82-1.27-1.81-1.27-2.98zm-4.876-9.37c-.068-.114-.04-.218.084-.315L3.81 2.09c.126-.095.24-.06.346.104.666 1.036 1.23 2.2 1.69 3.5.472 1.3.71 2.51.71 3.627 0 .15-.02.28-.057.39-.036.107-.13.26-.282.462-.154.2-.37.467-.65.8-.286.334-.538.605-.756.81l-.02.02c-.21.204-.402.42-.56.645-.156.224-.23.46-.217.707.012.247.11.473.29.68.185.206.42.34.706.4 1.254.26 2.348-.094 3.28-1.058.386-.393.77-.92 1.15-1.58.384-.664.668-1.163.85-1.5.186-.335.26-.57.227-.7-.032-.13-.166-.217-.4-.263-.236-.045-.542-.067-.92-.067-1.076 0-2.215.22-3.416.655l-.16.058c-.182.066-.35.062-.503-.013-.153-.076-.248-.22-.283-.435-.036-.22.027-.41.19-.58.165-.17.39-.295.68-.38.94-.28 1.87-.44 2.79-.49.45-.016.9-.025 1.36-.025.97 0 1.78.16 2.44.5.65.33.97.85.97 1.56 0 .38-.1.78-.32 1.18-.22.41-.54.83-.96 1.27-.43.44-.89.86-1.39 1.25-.5.4-1.03.82-1.6 1.27-.57.45-.98.93-1.22 1.44-.24.5-.24 1.04 0 1.6.24.56.66.98 1.26 1.26.59.28 1.27.42 2.02.42.75 0 1.5-.15 2.26-.46.75-.3 1.44-.73 2.07-1.27.63-.55 1.12-1.18 1.48-1.9.36-.72.54-1.48.54-2.28 0-1.37-.4-2.61-1.2-3.7-.8-1.1-1.87-1.93-3.2-2.5-1.33-.56-2.8-.84-4.4-.84-1.73 0-3.34.38-4.83 1.13-1.48.75-2.67 1.78-3.56 3.1-.89 1.3-1.34 2.76-1.34 4.35 0 1.07.18 2.05.54 2.95.36.9.84 1.67 1.46 2.32.61.65 1.3 1.13 2.07 1.46.77.32 1.57.48 2.4.48 1.13 0 2.16-.28 3.1-.84.93-.56 1.66-1.32 2.17-2.3.52-.97.78-2.05.78-3.22v-.36c0-.12-.04-.23-.1-.32-.07-.1-.17-.17-.3-.22-.13-.05-.28-.08-.44-.08h-.36c-.36 0-.65.1-.87.3-.22.2-.33.47-.33.8 0 .85-.2 1.58-.6 2.2-.4.6-.93 1.07-1.6 1.4-.66.32-1.38.48-2.17.48-.93 0-1.76-.2-2.5-.6-.73-.4-1.3-.96-1.72-1.68-.42-.72-.63-1.53-.63-2.44 0-.6.1-1.2.3-1.78.2-.58.5-1.13.9-1.64.4-.5.88-.95 1.44-1.35.56-.4 1.17-.7 1.84-.92.66-.22 1.36-.33 2.1-.33 1.3 0 2.44.3 3.44.9 1 .6 1.78 1.42 2.33 2.46.56 1.04.84 2.2.84 3.47 0 1.5-.38 2.84-1.14 4.03-.76 1.2-1.8 2.13-3.1 2.8-1.3.67-2.76 1-4.37 1-1.17 0-2.27-.17-3.3-.5-1.03-.34-1.95-.83-2.75-1.48-.8-.65-1.42-1.42-1.87-2.32-.45-.9-.67-1.9-.67-3 0-.73.1-1.43.32-2.1.22-.67.5-1.28.87-1.82.36-.54.77-1.02 1.22-1.44.45-.42.9-.77 1.37-1.07l.36-.22c.17-.1.28-.23.33-.4.05-.17.02-.34-.1-.5-.12-.17-.3-.26-.52-.28-.23-.02-.45.06-.66.22-.2.17-.43.38-.66.64-.24.26-.46.5-.66.7l-.26.28c-.2.2-.38.38-.54.52-.17.15-.35.22-.57.22-.22 0-.4-.08-.56-.24-.15-.16-.23-.37-.23-.62 0-.3.08-.57.24-.8.16-.23.37-.46.63-.7.26-.24.54-.5.84-.78.3-.28.58-.58.84-.9.25-.32.45-.68.58-1.07.14-.4.2-.85.2-1.36 0-1.2-.34-2.35-1.02-3.46-.68-1.12-1.56-2.03-2.63-2.74-1.08-.7-2.17-1.06-3.3-1.06-.4 0-.8.05-1.2.14-.4.1-.8.24-1.2.42l-.3.14c-.12.06-.23.06-.35 0-.1-.07-.17-.18-.2-.33-.02-.14.03-.27.15-.38.12-.1.28-.2.47-.27.4-.15.83-.28 1.3-.38.46-.1.93-.15 1.4-.15 1.5 0 2.9.43 4.2 1.3 1.3.87 2.33 2.03 3.1 3.48.77 1.45 1.15 3 1.15 4.66 0 .68-.08 1.33-.25 1.93-.17.6-.42 1.18-.75 1.72-.34.54-.75 1.05-1.24 1.52-.5.47-1.07.9-1.72 1.3z"/>
                  </svg>
                  Amazon Store
                </label>
                <input
                  type="text"
                  value={socialLinks.amazonStoreUrl}
                  onChange={(e) => setSocialLinks({ ...socialLinks, amazonStoreUrl: e.target.value })}
                  placeholder="https://amazon.com/stores/yourstore"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Full Footer Preview */}
          <div className={cn(
            'rounded-xl overflow-hidden',
            footerTheme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'
          )}>
            <p className={cn(
              'text-xs uppercase tracking-wider px-6 pt-4',
              footerTheme === 'dark' ? 'text-white/40' : 'text-gray-400'
            )}>Desktop Footer Preview</p>

            {/* Email Signup Row */}
            {emailSignup.enabled && (
              <div className={cn('px-6 py-6 border-b', footerTheme === 'dark' ? 'border-white/10' : 'border-gray-200')}>
                <div className="flex items-center justify-between gap-8">
                  <div>
                    <p className={cn('text-xs font-semibold uppercase tracking-wider', footerTheme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {emailSignup.title || "Join the Community"}
                    </p>
                    <p className={cn('text-[10px] mt-1', footerTheme === 'dark' ? 'text-white/50' : 'text-gray-500')}>
                      {emailSignup.subtitle?.substring(0, 50)}...
                    </p>
                  </div>
                  <div className={cn('flex items-center gap-2 border-b pb-1 text-[10px]', footerTheme === 'dark' ? 'border-white/30 text-white/40' : 'border-gray-300 text-gray-400')}>
                    <span>{emailSignup.placeholder}</span>
                    <span className={cn('font-medium uppercase', footerTheme === 'dark' ? 'text-white' : 'text-gray-900')}>{emailSignup.buttonText} →</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Grid Row */}
            <div className="px-6 py-6 grid grid-cols-5 gap-4">
              {/* Logo & Social */}
              <div>
                {footerLogoUrl ? (
                  <Image src={footerLogoUrl} alt="Footer Logo" width={80} height={28} className="h-6 w-auto object-contain mb-3" />
                ) : (
                  <div className={cn(
                    'h-6 w-20 rounded flex items-center justify-center text-[8px] mb-3',
                    footerTheme === 'dark' ? 'bg-white/10 text-white/40' : 'bg-gray-200 text-gray-400'
                  )}>
                    Logo
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {socialLinks.instagramUrl && <Instagram className={cn('w-3 h-3', footerTheme === 'dark' ? 'text-white/60' : 'text-gray-500')} />}
                  {socialLinks.tiktokUrl && (
                    <svg className={cn('w-3 h-3', footerTheme === 'dark' ? 'text-white/60' : 'text-gray-500')} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  )}
                  {socialLinks.facebookUrl && <Facebook className={cn('w-3 h-3', footerTheme === 'dark' ? 'text-white/60' : 'text-gray-500')} />}
                </div>
              </div>

              {/* Column 1 */}
              <div>
                <p className={cn('text-[8px] font-bold uppercase tracking-wider mb-2', footerTheme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {columnTitles.column1}
                </p>
                <div className="space-y-1">
                  {(links[columnTitles.column1] || []).slice(0, 3).map((link, i) => (
                    <p key={i} className={cn('text-[8px]', footerTheme === 'dark' ? 'text-white/60' : 'text-gray-500')}>{link.label}</p>
                  ))}
                  {(!links[columnTitles.column1] || links[columnTitles.column1].length === 0) && (
                    <p className={cn('text-[8px]', footerTheme === 'dark' ? 'text-white/30' : 'text-gray-300')}>No links</p>
                  )}
                </div>
              </div>

              {/* Column 2 */}
              <div>
                <p className={cn('text-[8px] font-bold uppercase tracking-wider mb-2', footerTheme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {columnTitles.column2}
                </p>
                <div className="space-y-1">
                  {(links[columnTitles.column2] || []).slice(0, 3).map((link, i) => (
                    <p key={i} className={cn('text-[8px]', footerTheme === 'dark' ? 'text-white/60' : 'text-gray-500')}>{link.label}</p>
                  ))}
                  {(!links[columnTitles.column2] || links[columnTitles.column2].length === 0) && (
                    <p className={cn('text-[8px]', footerTheme === 'dark' ? 'text-white/30' : 'text-gray-300')}>No links</p>
                  )}
                </div>
              </div>

              {/* Column 3 */}
              <div>
                <p className={cn('text-[8px] font-bold uppercase tracking-wider mb-2', footerTheme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {columnTitles.column3}
                </p>
                <div className="space-y-1">
                  {(links[columnTitles.column3] || []).slice(0, 3).map((link, i) => (
                    <p key={i} className={cn('text-[8px]', footerTheme === 'dark' ? 'text-white/60' : 'text-gray-500')}>{link.label}</p>
                  ))}
                  {(!links[columnTitles.column3] || links[columnTitles.column3].length === 0) && (
                    <p className={cn('text-[8px]', footerTheme === 'dark' ? 'text-white/30' : 'text-gray-300')}>No links</p>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <p className={cn('text-[8px] font-bold uppercase tracking-wider mb-2', footerTheme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {columnTitles.column4}
                </p>
                <div className="flex gap-2">
                  {certifications.map((cert, i) => (
                    <div key={i} className={cn('w-6 h-6 rounded-full border flex items-center justify-center', footerTheme === 'dark' ? 'border-white/30' : 'border-gray-300')}>
                      {getIconComponent(cert.icon)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Full-Width Logo */}
            {fullWidthLogoUrl && (
              <div className="px-6 py-4">
                <Image src={fullWidthLogoUrl} alt="Full Width Logo" width={400} height={60} className="w-full h-8 object-contain opacity-20" />
              </div>
            )}

            {/* Legal Row */}
            <div className={cn('px-6 py-3 border-t flex items-center justify-between', footerTheme === 'dark' ? 'border-white/10' : 'border-gray-200')}>
              <div className={cn('flex items-center gap-3 text-[8px] uppercase tracking-wider', footerTheme === 'dark' ? 'text-white/40' : 'text-gray-400')}>
                <span>{legalLinks.privacyLabel}</span>
                <span>•</span>
                <span>{legalLinks.termsLabel}</span>
              </div>
              <p className={cn('text-[8px] uppercase tracking-wider', footerTheme === 'dark' ? 'text-white/40' : 'text-gray-400')}>
                © {new Date().getFullYear()} {siteName}
              </p>
            </div>
          </div>
        </div>
      )}

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
          <div className={cn(
            'rounded-xl p-8',
            footerTheme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'
          )}>
            <p className={cn(
              'text-xs uppercase tracking-wider mb-6',
              footerTheme === 'dark' ? 'text-white/40' : 'text-gray-400'
            )}>Preview</p>
            {emailSignup.enabled ? (
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h3 className={cn(
                    'text-sm font-semibold tracking-[0.15em] uppercase mb-2',
                    footerTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {emailSignup.title || "Join the Archie's Community"}
                  </h3>
                  <p className={cn(
                    'text-sm',
                    footerTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                  )}>
                    {emailSignup.subtitle || 'Expert eye care tips, new product drops, and wellness inspiration.'}
                  </p>
                </div>
                <div className={cn(
                  'flex items-center gap-4 border-b pb-3 flex-1 max-w-md',
                  footerTheme === 'dark' ? 'border-white/30' : 'border-gray-300'
                )}>
                  <input
                    type="email"
                    placeholder={emailSignup.placeholder || 'Enter your email'}
                    disabled
                    className={cn(
                      'flex-1 bg-transparent text-base',
                      footerTheme === 'dark' ? 'text-white placeholder:text-white/40' : 'text-gray-900 placeholder:text-gray-400'
                    )}
                  />
                  <span className={cn(
                    'text-sm font-medium tracking-wide uppercase',
                    footerTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {emailSignup.buttonText || 'Sign Up'} →
                  </span>
                </div>
              </div>
            ) : (
              <p className={cn(
                'text-center py-4',
                footerTheme === 'dark' ? 'text-white/40' : 'text-gray-400'
              )}>Email signup section is hidden</p>
            )}
          </div>
        </div>
      )}

      {/* Main Footer Tab */}
      {activeTab === 'main' && (
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
          {/* Certifications */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Certifications Column</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Certification badges shown in the 4th column
              </p>
            </div>
            <div className="p-6 space-y-6">
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

              {/* Certification Items in a grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="p-4 bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)]">
                    <h3 className="font-medium text-[var(--admin-text-primary)] mb-3 text-sm">Badge {index + 1}</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={cert.label}
                        onChange={(e) => {
                          const newCerts = [...certifications];
                          newCerts[index] = { ...cert, label: e.target.value };
                          setCertifications(newCerts);
                        }}
                        placeholder="Label"
                        className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
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
                        className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      >
                        <option value="droplet">Droplet</option>
                        <option value="flag">Flag</option>
                        <option value="rabbit">Rabbit</option>
                        <option value="custom">Custom Icon</option>
                      </select>
                      {(cert.icon === 'custom' || cert.iconUrl) && (
                        <MediaPickerButton
                          label="Icon"
                          value={cert.iconUrl}
                          onChange={(url) => {
                            const newCerts = [...certifications];
                            newCerts[index] = { ...cert, icon: 'custom', iconUrl: url };
                            setCertifications(newCerts);
                          }}
                          helpText="Square PNG"
                          aspectRatio="1/1"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar Tab */}
      {activeTab === 'bottom' && (
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
          <div className={cn(
            'rounded-xl p-8',
            footerTheme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'
          )}>
            <p className={cn(
              'text-xs uppercase tracking-wider mb-6',
              footerTheme === 'dark' ? 'text-white/40' : 'text-gray-400'
            )}>Preview</p>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className={cn(
                'flex items-center gap-4 text-[11px] uppercase tracking-wide',
                footerTheme === 'dark' ? 'text-white/40' : 'text-gray-500'
              )}>
                <span className={cn(
                  'transition-colors cursor-pointer',
                  footerTheme === 'dark' ? 'hover:text-white/60' : 'hover:text-gray-700'
                )}>
                  {legalLinks.privacyLabel}
                </span>
                <span>•</span>
                <span className={cn(
                  'transition-colors cursor-pointer',
                  footerTheme === 'dark' ? 'hover:text-white/60' : 'hover:text-gray-700'
                )}>
                  {legalLinks.termsLabel}
                </span>
              </div>
              <p className={cn(
                'text-[11px] uppercase tracking-wide',
                footerTheme === 'dark' ? 'text-white/40' : 'text-gray-500'
              )}>
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
