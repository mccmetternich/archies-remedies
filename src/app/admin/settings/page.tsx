'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Upload, Check, Palette, Share2, Bell, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
  facebookPixelId: string | null;
  googleAnalyticsId: string | null;
  tiktokPixelId: string | null;
  contactEmail: string | null;
  emailPopupEnabled: boolean | null;
  emailPopupTitle: string | null;
  emailPopupSubtitle: string | null;
  emailPopupButtonText: string | null;
  emailPopupImageUrl: string | null;
}

const tabs = [
  { id: 'general', label: 'General', icon: Share2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'popup', label: 'Email Popup', icon: Bell },
  { id: 'tracking', label: 'Tracking', icon: Code },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SiteSettings, value: string | boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted-foreground)]">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Site Settings</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Manage your site configuration
          </p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-[var(--foreground)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-[var(--border)] p-6">
        {activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Site Name</label>
                <Input
                  value={settings.siteName || ''}
                  onChange={(e) => updateField('siteName', e.target.value)}
                  placeholder="Archie's Remedies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tagline</label>
                <Input
                  value={settings.tagline || ''}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  placeholder="Safe, Dry Eye Relief"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Logo URL</label>
                <Input
                  value={settings.logoUrl || ''}
                  onChange={(e) => updateField('logoUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Favicon URL</label>
                <Input
                  value={settings.faviconUrl || ''}
                  onChange={(e) => updateField('faviconUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Meta Title</label>
                <Input
                  value={settings.metaTitle || ''}
                  onChange={(e) => updateField('metaTitle', e.target.value)}
                  placeholder="Archie's Remedies - Safe, Clean Eye Care"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contact Email</label>
                <Input
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder="contact@archiesremedies.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meta Description</label>
              <textarea
                value={settings.metaDescription || ''}
                onChange={(e) => updateField('metaDescription', e.target.value)}
                placeholder="Preservative-free eye drops and gentle eye wipes..."
                rows={3}
                className="flex w-full rounded-lg border-[1.5px] border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base transition-all duration-150 placeholder:text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary-dark)] focus:ring-[3px] focus:ring-[var(--primary-light)] resize-none"
              />
            </div>

            <h3 className="text-lg font-medium pt-4 border-t border-[var(--border)]">Social Links</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Instagram URL</label>
                <Input
                  value={settings.instagramUrl || ''}
                  onChange={(e) => updateField('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/archiesremedies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Facebook URL</label>
                <Input
                  value={settings.facebookUrl || ''}
                  onChange={(e) => updateField('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/archiesremedies"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">TikTok URL</label>
                <Input
                  value={settings.tiktokUrl || ''}
                  onChange={(e) => updateField('tiktokUrl', e.target.value)}
                  placeholder="https://tiktok.com/@archiesremedies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amazon Store URL</label>
                <Input
                  value={settings.amazonStoreUrl || ''}
                  onChange={(e) => updateField('amazonStoreUrl', e.target.value)}
                  placeholder="https://amazon.com/stores/..."
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
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor || '#bbdae9'}
                    onChange={(e) => updateField('primaryColor', e.target.value)}
                    className="w-12 h-11 rounded-lg border border-[var(--border)] cursor-pointer"
                  />
                  <Input
                    value={settings.primaryColor || '#bbdae9'}
                    onChange={(e) => updateField('primaryColor', e.target.value)}
                    placeholder="#bbdae9"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.secondaryColor || '#f5f0eb'}
                    onChange={(e) => updateField('secondaryColor', e.target.value)}
                    className="w-12 h-11 rounded-lg border border-[var(--border)] cursor-pointer"
                  />
                  <Input
                    value={settings.secondaryColor || '#f5f0eb'}
                    onChange={(e) => updateField('secondaryColor', e.target.value)}
                    placeholder="#f5f0eb"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.accentColor || '#1a1a1a'}
                    onChange={(e) => updateField('accentColor', e.target.value)}
                    className="w-12 h-11 rounded-lg border border-[var(--border)] cursor-pointer"
                  />
                  <Input
                    value={settings.accentColor || '#1a1a1a'}
                    onChange={(e) => updateField('accentColor', e.target.value)}
                    placeholder="#1a1a1a"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">OG Image URL (Social sharing)</label>
              <Input
                value={settings.ogImageUrl || ''}
                onChange={(e) => updateField('ogImageUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'popup' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailPopupEnabled ?? true}
                  onChange={(e) => updateField('emailPopupEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary-light)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
              <span className="font-medium">Enable Email Popup</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Popup Title</label>
                <Input
                  value={settings.emailPopupTitle || ''}
                  onChange={(e) => updateField('emailPopupTitle', e.target.value)}
                  placeholder="Join the Archie's Community"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Button Text</label>
                <Input
                  value={settings.emailPopupButtonText || ''}
                  onChange={(e) => updateField('emailPopupButtonText', e.target.value)}
                  placeholder="Get My 10% Off"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Popup Subtitle</label>
              <textarea
                value={settings.emailPopupSubtitle || ''}
                onChange={(e) => updateField('emailPopupSubtitle', e.target.value)}
                placeholder="Get 10% off your first order and be the first to know..."
                rows={2}
                className="flex w-full rounded-lg border-[1.5px] border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base transition-all duration-150 placeholder:text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary-dark)] focus:ring-[3px] focus:ring-[var(--primary-light)] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Popup Image URL</label>
              <Input
                value={settings.emailPopupImageUrl || ''}
                onChange={(e) => updateField('emailPopupImageUrl', e.target.value)}
                placeholder="https://..."
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Add your tracking IDs to enable analytics and conversion tracking.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Facebook Pixel ID</label>
              <Input
                value={settings.facebookPixelId || ''}
                onChange={(e) => updateField('facebookPixelId', e.target.value)}
                placeholder="123456789012345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Google Analytics ID</label>
              <Input
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">TikTok Pixel ID</label>
              <Input
                value={settings.tiktokPixelId || ''}
                onChange={(e) => updateField('tiktokPixelId', e.target.value)}
                placeholder="XXXXXXXXXXXXXXXXXX"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
