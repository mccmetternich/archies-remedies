'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Save, Loader2, Upload, Check, Palette, Share2, Bell, Code, X, ExternalLink, Link as LinkIcon } from 'lucide-react';
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

interface ImageUploadProps {
  label: string;
  value: string | null;
  onChange: (url: string) => void;
  placeholder?: string;
  aspectRatio?: string;
  helpText?: string;
}

function ImageUpload({ label, value, onChange, placeholder, aspectRatio = '1/1', helpText }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // For now, we'll use a data URL. In production, this would upload to a CDN
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
      setShowUrlInput(false);
      setUrlInputValue('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}

      <div className="flex gap-4">
        {/* Preview */}
        <div
          className={cn(
            'relative w-24 h-24 rounded-xl bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a] flex items-center justify-center overflow-hidden group',
            value && 'border-solid border-[#2a2a2a]'
          )}
          style={{ aspectRatio }}
        >
          {value ? (
            <>
              <Image
                src={value}
                alt={label}
                fill
                className="object-contain p-2"
              />
              <button
                onClick={() => onChange('')}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </>
          ) : (
            <Upload className="w-6 h-6 text-gray-500" />
          )}
        </div>

        {/* Upload Options */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-gray-300 rounded-lg text-sm hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload
            </button>
            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-gray-300 rounded-lg text-sm hover:bg-[#2a2a2a] transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              URL
            </button>
          </div>

          {showUrlInput && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                placeholder={placeholder || 'https://...'}
                className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)]"
              />
              <button
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-[var(--primary)] text-[#0a0a0a] rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
              >
                Set
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">Site Settings</h1>
          <p className="text-gray-400 mt-1">
            Manage your site configuration
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
            saved
              ? 'bg-green-500 text-white'
              : 'bg-[var(--primary)] text-[#0a0a0a] hover:bg-[var(--primary-dark)]',
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
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1f1f1f] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-[var(--primary)] text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-6">
        {activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Brand Assets */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4">Brand Assets</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ImageUpload
                  label="Logo"
                  value={settings.logoUrl}
                  onChange={(url) => updateField('logoUrl', url)}
                  placeholder="https://..."
                  helpText="Recommended: PNG with transparent background, 200x50px"
                />
                <ImageUpload
                  label="Favicon"
                  value={settings.faviconUrl}
                  onChange={(url) => updateField('faviconUrl', url)}
                  placeholder="https://..."
                  helpText="Recommended: Square PNG or ICO, 32x32px"
                />
              </div>
            </div>

            <div className="h-px bg-[#1f1f1f]" />

            {/* Site Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4">Site Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName || ''}
                    onChange={(e) => updateField('siteName', e.target.value)}
                    placeholder="Archie's Remedies"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={settings.tagline || ''}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    placeholder="Safe, Dry Eye Relief"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={settings.metaTitle || ''}
                  onChange={(e) => updateField('metaTitle', e.target.value)}
                  placeholder="Archie's Remedies - Safe, Clean Eye Care"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder="contact@archiesremedies.com"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Meta Description</label>
              <textarea
                value={settings.metaDescription || ''}
                onChange={(e) => updateField('metaDescription', e.target.value)}
                placeholder="Preservative-free eye drops and gentle eye wipes..."
                rows={3}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            </div>

            <div className="h-px bg-[#1f1f1f]" />

            {/* Social Links */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4">Social Links</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Instagram URL</label>
                  <input
                    type="url"
                    value={settings.instagramUrl || ''}
                    onChange={(e) => updateField('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/archiesremedies"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Facebook URL</label>
                  <input
                    type="url"
                    value={settings.facebookUrl || ''}
                    onChange={(e) => updateField('facebookUrl', e.target.value)}
                    placeholder="https://facebook.com/archiesremedies"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">TikTok URL</label>
                  <input
                    type="url"
                    value={settings.tiktokUrl || ''}
                    onChange={(e) => updateField('tiktokUrl', e.target.value)}
                    placeholder="https://tiktok.com/@archiesremedies"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amazon Store URL</label>
                  <input
                    type="url"
                    value={settings.amazonStoreUrl || ''}
                    onChange={(e) => updateField('amazonStoreUrl', e.target.value)}
                    placeholder="https://amazon.com/stores/..."
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
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
              <h3 className="text-sm font-medium text-gray-300 mb-4">Brand Colors</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor || '#bbdae9'}
                      onChange={(e) => updateField('primaryColor', e.target.value)}
                      className="w-14 h-12 rounded-lg border border-[#2a2a2a] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor || '#bbdae9'}
                      onChange={(e) => updateField('primaryColor', e.target.value)}
                      placeholder="#bbdae9"
                      className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.secondaryColor || '#f5f0eb'}
                      onChange={(e) => updateField('secondaryColor', e.target.value)}
                      className="w-14 h-12 rounded-lg border border-[#2a2a2a] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.secondaryColor || '#f5f0eb'}
                      onChange={(e) => updateField('secondaryColor', e.target.value)}
                      placeholder="#f5f0eb"
                      className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.accentColor || '#1a1a1a'}
                      onChange={(e) => updateField('accentColor', e.target.value)}
                      className="w-14 h-12 rounded-lg border border-[#2a2a2a] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.accentColor || '#1a1a1a'}
                      onChange={(e) => updateField('accentColor', e.target.value)}
                      placeholder="#1a1a1a"
                      className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-[#1f1f1f]" />

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4">Social Sharing Image</h3>
              <ImageUpload
                label="OG Image (Social sharing)"
                value={settings.ogImageUrl}
                onChange={(url) => updateField('ogImageUrl', url)}
                placeholder="https://..."
                aspectRatio="1.91/1"
                helpText="Recommended: 1200x630px for optimal display on social platforms"
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
            <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#1f1f1f]">
              <div>
                <p className="font-medium text-white">Enable Email Popup</p>
                <p className="text-sm text-gray-500">Show a popup to collect email signups</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailPopupEnabled ?? true}
                  onChange={(e) => updateField('emailPopupEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#2a2a2a] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)]/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] peer-checked:after:bg-[#0a0a0a]"></div>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Popup Title</label>
                <input
                  type="text"
                  value={settings.emailPopupTitle || ''}
                  onChange={(e) => updateField('emailPopupTitle', e.target.value)}
                  placeholder="Join the Archie's Community"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Button Text</label>
                <input
                  type="text"
                  value={settings.emailPopupButtonText || ''}
                  onChange={(e) => updateField('emailPopupButtonText', e.target.value)}
                  placeholder="Get My 10% Off"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Popup Subtitle</label>
              <textarea
                value={settings.emailPopupSubtitle || ''}
                onChange={(e) => updateField('emailPopupSubtitle', e.target.value)}
                placeholder="Get 10% off your first order and be the first to know..."
                rows={2}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            </div>

            <ImageUpload
              label="Popup Image"
              value={settings.emailPopupImageUrl}
              onChange={(url) => updateField('emailPopupImageUrl', url)}
              placeholder="https://..."
              helpText="Display a product image in your email popup"
            />
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Facebook Pixel ID
                <span className="text-gray-500 font-normal ml-2">or external script URL</span>
              </label>
              <input
                type="text"
                value={settings.facebookPixelId || ''}
                onChange={(e) => updateField('facebookPixelId', e.target.value)}
                placeholder="123456789012345 or https://..."
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1.5">Supports both pixel ID and external tracking script URLs</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Google Analytics ID
                <span className="text-gray-500 font-normal ml-2">or external script URL</span>
              </label>
              <input
                type="text"
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX or https://..."
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1.5">Supports both GA4 measurement ID and external tracking script URLs</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                TikTok Pixel ID
                <span className="text-gray-500 font-normal ml-2">or external script URL</span>
              </label>
              <input
                type="text"
                value={settings.tiktokPixelId || ''}
                onChange={(e) => updateField('tiktokPixelId', e.target.value)}
                placeholder="XXXXXXXXXXXXXXXXXX or https://..."
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1.5">Supports both TikTok pixel ID and external tracking script URLs</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
