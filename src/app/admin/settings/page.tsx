'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Save, Loader2, Check, Palette, Share2, Code, ExternalLink, Construction, Eye, Copy, Trash2, Mail, Phone, ChevronDown, ArrowRight, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';

interface SiteSettings {
  id: string;
  siteName: string | null;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  amazonStoreUrl: string | null;
  // Social Icons (custom uploaded)
  instagramIconUrl: string | null;
  facebookIconUrl: string | null;
  tiktokIconUrl: string | null;
  amazonIconUrl: string | null;
  facebookPixelId: string | null;
  googleAnalyticsId: string | null;
  tiktokPixelId: string | null;
  contactEmail: string | null;
  // Draft mode
  siteInDraftMode: boolean | null;
  draftModeTitle: string | null;
  draftModeSubtitle: string | null;
  draftModeBadgeUrl: string | null;
  draftModeFooterStyle: string | null;
  draftModeCallout1: string | null;
  draftModeCallout2: string | null;
  draftModeCallout3: string | null;
  draftModeBrandQuip: string | null;
  draftModeContactType: string | null;
  // Footer
  massiveFooterLogoUrl: string | null;
  // Default Blog Author
  defaultBlogAuthorName: string | null;
  defaultBlogAuthorAvatarUrl: string | null;
}

const tabs = [
  { id: 'general', label: 'General', icon: Share2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'tracking', label: 'Tracking', icon: Code },
  { id: 'coming-soon', label: 'Coming Soon', icon: Construction },
];

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL param for initial tab
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      return tabParam;
    }
    return 'general';
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Track if there are unsaved changes
  const hasChanges = settings && originalSettings && JSON.stringify(settings) !== JSON.stringify(originalSettings);

  // Update tab when URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);
      setOriginalSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setOriginalSettings(settings); // Reset original to current after save
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickToggleDraft = async () => {
    if (!settings) return;
    const newDraftMode = !settings.siteInDraftMode;

    // Optimistically update UI
    setSettings({ ...settings, siteInDraftMode: newDraftMode });

    // Save immediately
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, siteInDraftMode: newDraftMode }),
      });
      setOriginalSettings({ ...settings, siteInDraftMode: newDraftMode });
    } catch (error) {
      console.error('Failed to toggle draft mode:', error);
      // Revert on error
      setSettings({ ...settings, siteInDraftMode: !newDraftMode });
    }
  };

  const updateField = (field: keyof SiteSettings, value: string | boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleDeleteSite = async () => {
    setDeleting(true);
    try {
      // For now, just reset settings to defaults or show a message
      // In a real implementation, this would delete all site data
      alert('Site deletion not implemented yet. This would delete all site data.');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete site:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--admin-text-secondary)]">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">Site Settings</h1>

        <div className="flex items-center gap-3">
          {/* Draft/Live Toggle */}
          {settings && (
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-medium transition-colors",
                settings.siteInDraftMode ? "text-orange-400" : "text-[var(--admin-text-muted)]"
              )}>
                Draft
              </span>
              <button
                onClick={handleQuickToggleDraft}
                className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--admin-bg)]"
                style={{
                  backgroundColor: settings.siteInDraftMode ? '#f97316' : '#22c55e'
                }}
              >
                <span
                  className={cn(
                    "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg",
                    settings.siteInDraftMode ? "translate-x-1" : "translate-x-9"
                  )}
                />
              </button>
              <span className={cn(
                "text-sm font-medium transition-colors",
                !settings.siteInDraftMode ? "text-green-400" : "text-[var(--admin-text-muted)]"
              )}>
                Live
              </span>
            </div>
          )}

          {/* View Draft/Live Button */}
          {settings && (
            <button
              onClick={async () => {
                if (settings.siteInDraftMode) {
                  // Generate token and open with token
                  try {
                    const res = await fetch('/api/admin/preview', { method: 'POST' });
                    const data = await res.json();
                    if (data.token) {
                      window.open(`/?token=${data.token}`, '_blank');
                      return;
                    }
                  } catch (error) {
                    console.error('Failed to generate preview token:', error);
                  }
                }
                window.open('/', '_blank');
              }}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                settings.siteInDraftMode
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              )}
            >
              <ExternalLink className="w-4 h-4" />
              {settings.siteInDraftMode ? 'View Draft' : 'View Live'}
            </button>
          )}

          {/* Save Changes Button */}
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-[var(--primary)] text-[var(--admin-button-text)] hover:bg-[var(--primary-dark)]',
                saving && 'opacity-50 cursor-not-allowed'
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          )}

          {/* Delete Site Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            title="Delete Site"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-[var(--admin-card)] rounded-xl p-6 w-full max-w-md mx-4 shadow-xl border border-[var(--admin-border)]">
            <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-2">Delete Site?</h3>
            <p className="text-[var(--admin-text-secondary)] mb-6">
              Are you sure you want to delete this site? This action cannot be undone and will permanently delete all pages, products, and settings.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSite}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete Site'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--admin-border)] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-[var(--primary)] text-[var(--admin-text-primary)]'
                : 'border-transparent text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-6">
        {activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Brand Assets */}
            <div>
              <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-4">Brand Assets</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <MediaPickerButton
                  label="Logo"
                  value={settings.logoUrl}
                  onChange={(url) => updateField('logoUrl', url || '')}
                  helpText="Recommended: PNG with transparent background, 200x50px"
                  folder="branding"
                />
                <MediaPickerButton
                  label="Favicon"
                  value={settings.faviconUrl}
                  onChange={(url) => updateField('faviconUrl', url || '')}
                  helpText="Recommended: Square PNG or ICO, 32x32px"
                  folder="branding"
                  aspectRatio="1/1"
                />
              </div>

              {/* Default Blog Author - part of Brand Assets */}
              <div className="mt-6 pt-6 border-t border-[var(--admin-border)]">
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Default Blog Author</label>
                <p className="text-xs text-[var(--admin-text-muted)] mb-4">Used as the default author for new blog posts when no author is specified.</p>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {settings.defaultBlogAuthorAvatarUrl ? (
                      <div className="relative group">
                        <img
                          src={settings.defaultBlogAuthorAvatarUrl}
                          alt="Default Author"
                          className="w-16 h-16 rounded-full object-cover border-2 border-[var(--admin-border-light)]"
                        />
                        <button
                          onClick={() => updateField('defaultBlogAuthorAvatarUrl', '')}
                          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[var(--admin-input)] border-2 border-dashed border-[var(--admin-border-light)] flex items-center justify-center">
                        <User className="w-6 h-6 text-[var(--admin-text-muted)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={settings.defaultBlogAuthorName || ''}
                      onChange={(e) => updateField('defaultBlogAuthorName', e.target.value)}
                      placeholder="Author Name"
                      className="w-full px-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                    <MediaPickerButton
                      label=""
                      value={settings.defaultBlogAuthorAvatarUrl}
                      onChange={(url) => updateField('defaultBlogAuthorAvatarUrl', url || '')}
                      helpText=""
                      folder="blog/authors"
                      aspectRatio="1/1"
                      buttonText="Upload Avatar"
                      compact
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-[var(--admin-hover)]" />

            {/* Site Info */}
            <div>
              <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-4">Site Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName || ''}
                    onChange={(e) => updateField('siteName', e.target.value)}
                    placeholder="Archie's Remedies"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Tagline</label>
                  <input
                    type="text"
                    value={settings.tagline || ''}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    placeholder="Safe, Dry Eye Relief"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Meta Title</label>
                <input
                  type="text"
                  value={settings.metaTitle || ''}
                  onChange={(e) => updateField('metaTitle', e.target.value)}
                  placeholder="Archie's Remedies - Safe, Clean Eye Care"
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder="contact@archiesremedies.com"
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Meta Description</label>
              <textarea
                value={settings.metaDescription || ''}
                onChange={(e) => updateField('metaDescription', e.target.value)}
                placeholder="Preservative-free eye drops and gentle eye wipes..."
                rows={3}
                className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            </div>

            <div className="h-px bg-[var(--admin-hover)]" />

            {/* Social Links */}
            <div>
              <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-4">Social Links</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Instagram URL</label>
                  <input
                    type="url"
                    value={settings.instagramUrl || ''}
                    onChange={(e) => updateField('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/archiesremedies"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Facebook URL</label>
                  <input
                    type="url"
                    value={settings.facebookUrl || ''}
                    onChange={(e) => updateField('facebookUrl', e.target.value)}
                    placeholder="https://facebook.com/archiesremedies"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">TikTok URL</label>
                  <input
                    type="url"
                    value={settings.tiktokUrl || ''}
                    onChange={(e) => updateField('tiktokUrl', e.target.value)}
                    placeholder="https://tiktok.com/@archiesremedies"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Amazon Store URL</label>
                  <input
                    type="url"
                    value={settings.amazonStoreUrl || ''}
                    onChange={(e) => updateField('amazonStoreUrl', e.target.value)}
                    placeholder="https://amazon.com/stores/..."
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-[var(--admin-hover)]" />

            {/* Social Icons */}
            <div>
              <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Social Icons</h3>
              <p className="text-xs text-[var(--admin-text-muted)] mb-4">Upload custom icons to replace the defaults in the footer. Use white or light-colored icons on transparent backgrounds.</p>
              <div className="grid md:grid-cols-4 gap-4">
                <MediaPickerButton
                  label="Instagram Icon"
                  value={settings.instagramIconUrl}
                  onChange={(url) => updateField('instagramIconUrl', url || '')}
                  aspectRatio="1/1"
                  helpText="24x24px recommended"
                  folder="social"
                />
                <MediaPickerButton
                  label="Facebook Icon"
                  value={settings.facebookIconUrl}
                  onChange={(url) => updateField('facebookIconUrl', url || '')}
                  aspectRatio="1/1"
                  helpText="24x24px recommended"
                  folder="social"
                />
                <MediaPickerButton
                  label="TikTok Icon"
                  value={settings.tiktokIconUrl}
                  onChange={(url) => updateField('tiktokIconUrl', url || '')}
                  aspectRatio="1/1"
                  helpText="24x24px recommended"
                  folder="social"
                />
                <MediaPickerButton
                  label="Amazon Icon"
                  value={settings.amazonIconUrl}
                  onChange={(url) => updateField('amazonIconUrl', url || '')}
                  aspectRatio="1/1"
                  helpText="24x24px recommended"
                  folder="social"
                />
              </div>
            </div>

          </motion.div>
        )}

        {activeTab === 'appearance' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-4">Brand Colors</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor || '#bbdae9'}
                      onChange={(e) => updateField('primaryColor', e.target.value)}
                      className="w-14 h-12 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor || '#bbdae9'}
                      onChange={(e) => updateField('primaryColor', e.target.value)}
                      placeholder="#bbdae9"
                      className="flex-1 px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.secondaryColor || '#f5f0eb'}
                      onChange={(e) => updateField('secondaryColor', e.target.value)}
                      className="w-14 h-12 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.secondaryColor || '#f5f0eb'}
                      onChange={(e) => updateField('secondaryColor', e.target.value)}
                      placeholder="#f5f0eb"
                      className="flex-1 px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.accentColor || '#242424'}
                      onChange={(e) => updateField('accentColor', e.target.value)}
                      className="w-14 h-12 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.accentColor || '#242424'}
                      onChange={(e) => updateField('accentColor', e.target.value)}
                      placeholder="#242424"
                      className="flex-1 px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-[var(--admin-hover)]" />

            <div>
              <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-4">Social Sharing Image</h3>
              <MediaPickerButton
                label="OG Image (Social sharing)"
                value={settings.ogImageUrl}
                onChange={(url) => updateField('ogImageUrl', url || '')}
                aspectRatio="1.91/1"
                helpText="Recommended: 1200x630px for optimal display on social platforms"
                folder="branding"
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'tracking' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-4 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl">
              <p className="text-sm text-[var(--primary)]">
                Add your tracking IDs to enable analytics and conversion tracking. You can use either an ID or an external script URL.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Facebook Pixel ID
                <span className="text-[var(--admin-text-muted)] font-normal ml-2">or external script URL</span>
              </label>
              <input
                type="text"
                value={settings.facebookPixelId || ''}
                onChange={(e) => updateField('facebookPixelId', e.target.value)}
                placeholder="123456789012345 or https://..."
                className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <p className="text-xs text-[var(--admin-text-muted)] mt-1.5">Supports both pixel ID and external tracking script URLs</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Google Analytics ID
                <span className="text-[var(--admin-text-muted)] font-normal ml-2">or external script URL</span>
              </label>
              <input
                type="text"
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX or https://..."
                className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <p className="text-xs text-[var(--admin-text-muted)] mt-1.5">Supports both GA4 measurement ID and external tracking script URLs</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                TikTok Pixel ID
                <span className="text-[var(--admin-text-muted)] font-normal ml-2">or external script URL</span>
              </label>
              <input
                type="text"
                value={settings.tiktokPixelId || ''}
                onChange={(e) => updateField('tiktokPixelId', e.target.value)}
                placeholder="XXXXXXXXXXXXXXXXXX or https://..."
                className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <p className="text-xs text-[var(--admin-text-muted)] mt-1.5">Supports both TikTok pixel ID and external tracking script URLs</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'coming-soon' && (
          <ComingSoonTab
            settings={settings}
            updateField={updateField}
          />
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}

// Coming Soon Tab Component
function ComingSoonTab({
  settings,
  updateField,
}: {
  settings: SiteSettings;
  updateField: (field: keyof SiteSettings, value: string | boolean) => void;
}) {
  const [previewLoading, setPreviewLoading] = useState(false);
  const [hasPreviewToken, setHasPreviewToken] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if we have active preview tokens
    fetch('/api/admin/preview')
      .then(res => res.json())
      .then(data => {
        setHasPreviewToken(data.activeTokenCount > 0);
        if (data.tokens?.[0]?.previewUrl) {
          // Extract token from the first active token's previewUrl
          const match = data.tokens[0].previewUrl.match(/token=([^&]+)/);
          if (match) setCurrentToken(match[1]);
        }
      })
      .catch(() => {});
  }, []);

  const handleGeneratePreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch('/api/admin/preview', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.token) {
        setHasPreviewToken(true);
        setCurrentToken(data.token);
        // Open the site with token in URL
        window.open(`/?token=${data.token}`, '_blank');
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRevokePreview = async () => {
    try {
      await fetch('/api/admin/preview', { method: 'DELETE' });
      setHasPreviewToken(false);
      setCurrentToken(null);
    } catch (error) {
      console.error('Failed to revoke preview:', error);
    }
  };

  const handleCopyPreviewLink = async () => {
    let token = currentToken;
    // Generate a new token if we don't have one
    if (!token) {
      try {
        const res = await fetch('/api/admin/preview', { method: 'POST' });
        const data = await res.json();
        if (data.token) {
          token = data.token;
          setCurrentToken(token);
          setHasPreviewToken(true);
        }
      } catch (error) {
        console.error('Failed to generate token for copy:', error);
        return;
      }
    }
    const url = `${window.location.origin}/?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Coming Soon Mode Status */}
      <div className={cn(
        "p-6 rounded-xl border-2 transition-colors",
        settings.siteInDraftMode
          ? "bg-orange-500/10 border-orange-500/50"
          : "bg-green-500/10 border-green-500/50"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              settings.siteInDraftMode ? "bg-orange-500/20" : "bg-green-500/20"
            )}>
              {settings.siteInDraftMode ? (
                <Construction className="w-6 h-6 text-orange-400" />
              ) : (
                <Eye className="w-6 h-6 text-green-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-[var(--admin-text-primary)]">
                {settings.siteInDraftMode ? 'Coming Soon Mode Active' : 'Site is Live'}
              </p>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                {settings.siteInDraftMode
                  ? 'Visitors will see the "Coming Soon" page below'
                  : 'Your site is publicly accessible'}
              </p>
            </div>
          </div>
          {/* Toggle: OFF (left) = Coming Soon, ON (right) = Live */}
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-xs font-medium",
              settings.siteInDraftMode ? "text-orange-400" : "text-[var(--admin-text-muted)]"
            )}>
              Coming Soon
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!settings.siteInDraftMode}
                onChange={(e) => updateField('siteInDraftMode', !e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-orange-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
            </label>
            <span className={cn(
              "text-xs font-medium",
              !settings.siteInDraftMode ? "text-green-400" : "text-[var(--admin-text-muted)]"
            )}>
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Preview Access - Only show when in Coming Soon mode */}
      {settings.siteInDraftMode && (
        <div className="p-6 bg-[var(--admin-bg)] rounded-xl border border-[var(--admin-border)]">
          <h3 className="font-medium text-[var(--admin-text-primary)] mb-4">Preview Access</h3>
          <p className="text-sm text-[var(--admin-text-secondary)] mb-4">
            Preview the full site while in Coming Soon mode. Preview links are shareable and expire after 24 hours. To see what visitors see, open a new incognito/private window.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleGeneratePreview}
              disabled={previewLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
            >
              {previewLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {hasPreviewToken ? 'Preview Site' : 'Generate Preview'}
            </button>
            {hasPreviewToken && (
              <>
                <button
                  onClick={handleCopyPreviewLink}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg font-medium hover:bg-[var(--admin-hover)] transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={handleRevokePreview}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 rounded-lg font-medium hover:bg-red-500/20 transition-colors"
                >
                  Revoke Access
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="h-px bg-[var(--admin-hover)]" />

      {/* Coming Soon Page Content */}
      <div>
        <h3 className="font-medium text-[var(--admin-text-primary)] mb-4">Coming Soon Page Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Title</label>
            <input
              type="text"
              value={settings.draftModeTitle || ''}
              onChange={(e) => updateField('draftModeTitle', e.target.value)}
              placeholder="Coming Soon"
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Subtitle</label>
            <textarea
              value={settings.draftModeSubtitle || ''}
              onChange={(e) => updateField('draftModeSubtitle', e.target.value)}
              placeholder="We're working on something special. Leave your email to be the first to know when we launch."
              rows={3}
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Rotating Badge */}
      <div>
        <h3 className="font-medium text-[var(--admin-text-primary)] mb-4">Rotating Badge</h3>
        <p className="text-sm text-[var(--admin-text-muted)] mb-4">
          Upload a PNG image that will rotate behind your logo. Great for promotional badges or announcements.
        </p>
        <MediaPickerButton
          label="Badge Image"
          value={settings.draftModeBadgeUrl}
          onChange={(url) => updateField('draftModeBadgeUrl', url || '')}
          aspectRatio="1/1"
          helpText="Transparent PNG recommended for best results (200x200px)"
          folder="branding"
        />
      </div>

      <div className="h-px bg-[var(--admin-hover)]" />

      {/* Contact Form Settings */}
      <div>
        <h3 className="font-medium text-[var(--admin-text-primary)] mb-4">Contact Form Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Default Contact Type</label>
            <select
              value={settings.draftModeContactType || 'phone'}
              onChange={(e) => updateField('draftModeContactType', e.target.value)}
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            >
              <option value="phone">Phone (SMS List)</option>
              <option value="email">Email</option>
            </select>
            <p className="text-xs text-[var(--admin-text-muted)] mt-1">
              Users can switch between phone and email, but this sets the default shown.
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-[var(--admin-hover)]" />

      {/* Footer Style - Trust Badges or Brand Quip */}
      <div>
        <h3 className="font-medium text-[var(--admin-text-primary)] mb-4">Footer Content</h3>
        <p className="text-sm text-[var(--admin-text-muted)] mb-4">
          Choose what appears below the signup form.
        </p>

        {/* Style Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Style</label>
          <select
            value={settings.draftModeFooterStyle || 'badges'}
            onChange={(e) => updateField('draftModeFooterStyle', e.target.value)}
            className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          >
            <option value="badges">Trust Badges (3 short callouts)</option>
            <option value="quip">Brand Quip (single tagline)</option>
          </select>
        </div>

        {/* Conditional Fields based on style */}
        {(settings.draftModeFooterStyle || 'badges') === 'badges' ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Badge 1</label>
              <input
                type="text"
                value={settings.draftModeCallout1 || ''}
                onChange={(e) => updateField('draftModeCallout1', e.target.value)}
                placeholder="Preservative-Free"
                className="w-full px-3 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Badge 2</label>
              <input
                type="text"
                value={settings.draftModeCallout2 || ''}
                onChange={(e) => updateField('draftModeCallout2', e.target.value)}
                placeholder="Clean Ingredients"
                className="w-full px-3 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Badge 3</label>
              <input
                type="text"
                value={settings.draftModeCallout3 || ''}
                onChange={(e) => updateField('draftModeCallout3', e.target.value)}
                placeholder="Made in USA"
                className="w-full px-3 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Brand Quip</label>
            <input
              type="text"
              value={settings.draftModeBrandQuip || ''}
              onChange={(e) => updateField('draftModeBrandQuip', e.target.value)}
              placeholder="Where clean beauty meets clear vision."
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <p className="text-xs text-[var(--admin-text-muted)] mt-2">
              A short, poetic tagline that captures your brand essence.
            </p>
          </div>
        )}
      </div>

      <div className="h-px bg-[var(--admin-hover)]" />

      {/* Full Preview of Coming Soon page */}
      <div>
        <h3 className="font-medium text-[var(--admin-text-primary)] mb-4">Preview</h3>
        <div className="p-8 bg-gradient-to-br from-[#f5f0eb] via-white to-[#bbdae9]/20 rounded-xl text-center">
          {/* Logo with badge preview */}
          <div className="mb-8 flex justify-center">
            <div className="relative inline-block">
              {/* Rotating badge peeking from top-right corner */}
              {settings.draftModeBadgeUrl && (
                <div
                  className="absolute -top-6 -right-8 w-[60px] h-[60px] z-0 animate-spin"
                  style={{ animationDuration: '20s' }}
                >
                  <img
                    src={settings.draftModeBadgeUrl}
                    alt="Badge"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="h-12 w-auto object-contain relative z-10"
                />
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium relative z-10">
                  {settings.siteName || "Archie's Remedies"}
                </div>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-normal text-gray-900 mb-2">
            {settings.draftModeTitle || 'Coming Soon'}
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            {settings.draftModeSubtitle || "Pure ingredients. Radiant you."}
          </p>

          {/* Form Preview */}
          <div className="max-w-sm mx-auto mb-6">
            <div className="relative">
              <div className="flex items-center gap-1 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                {settings.draftModeContactType === 'email' ? (
                  <Mail className="w-4 h-4" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
                <ChevronDown className="w-3 h-3" />
              </div>
              <input
                type="text"
                placeholder={settings.draftModeContactType === 'email' ? 'Enter your email' : 'Enter your phone number'}
                disabled
                className="w-full pl-12 pr-28 py-3 text-sm rounded-full border border-gray-200 bg-white text-gray-400"
              />
              <button
                disabled
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#1a1a1a] text-white text-sm rounded-full font-medium flex items-center gap-1.5 hover:bg-[#bbdae9] hover:text-[#1a1a1a] transition-colors"
              >
                Notify Me
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Footer preview - badges or quip */}
          {(settings.draftModeFooterStyle || 'badges') === 'badges' ? (
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
              {settings.draftModeCallout1 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#bbdae9] rounded-full" />
                  {settings.draftModeCallout1}
                </span>
              )}
              {settings.draftModeCallout2 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#bbdae9] rounded-full" />
                  {settings.draftModeCallout2}
                </span>
              )}
              {settings.draftModeCallout3 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#bbdae9] rounded-full" />
                  {settings.draftModeCallout3}
                </span>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#bbdae9]/30 border border-[#bbdae9]/40 rounded-full shadow-[0_0_15px_rgba(187,218,233,0.3)] animate-pulse">
              <span className="text-sm">✨</span>
              <span className="text-xs text-gray-600 font-medium">
                {settings.draftModeBrandQuip || 'Where clean beauty meets clear vision.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
