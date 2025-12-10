'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  Check,
  BarChart3,
  Facebook,
  Activity,
  Music2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingSettings {
  facebookPixelId: string | null;
  googleAnalyticsId: string | null;
  tiktokPixelId: string | null;
}

interface TrackingStatus {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  placeholder: string;
  helpText: string;
  docsUrl: string;
  field: keyof TrackingSettings;
}

const trackingPlatforms: TrackingStatus[] = [
  {
    id: 'facebook',
    name: 'Meta Pixel',
    icon: Facebook,
    color: '#1877F2',
    placeholder: '123456789012345',
    helpText: 'Enter your Meta/Facebook Pixel ID or paste your entire pixel code snippet',
    docsUrl: 'https://www.facebook.com/business/help/952192354843755',
    field: 'facebookPixelId',
  },
  {
    id: 'google',
    name: 'Google Analytics',
    icon: Activity,
    color: '#F9AB00',
    placeholder: 'G-XXXXXXXXXX',
    helpText: 'Enter your GA4 Measurement ID (starts with G-) or paste your gtag.js code',
    docsUrl: 'https://support.google.com/analytics/answer/9304153',
    field: 'googleAnalyticsId',
  },
  {
    id: 'tiktok',
    name: 'TikTok Pixel',
    icon: Music2,
    color: '#000000',
    placeholder: 'XXXXXXXXXXXXXXXXXX',
    helpText: 'Enter your TikTok Pixel ID or paste your pixel code snippet',
    docsUrl: 'https://ads.tiktok.com/help/article/tiktok-pixel',
    field: 'tiktokPixelId',
  },
];

export default function TrackingPage() {
  const [settings, setSettings] = useState<TrackingSettings>({
    facebookPixelId: null,
    googleAnalyticsId: null,
    tiktokPixelId: null,
  });
  const [originalSettings, setOriginalSettings] = useState<TrackingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const hasChanges = originalSettings && JSON.stringify(settings) !== JSON.stringify(originalSettings);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      const trackingSettings = {
        facebookPixelId: data.facebookPixelId,
        googleAnalyticsId: data.googleAnalyticsId,
        tiktokPixelId: data.tiktokPixelId,
      };
      setSettings(trackingSettings);
      setOriginalSettings(trackingSettings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setOriginalSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (value: string, id: string) => {
    navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const isConfigured = (value: string | null) => {
    return value && value.trim().length > 0;
  };

  // Count configured trackers
  const configuredCount = Object.values(settings).filter(isConfigured).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">Tracking & Analytics</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1">
            Configure tracking pixels and analytics for your site
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
              saved
                ? 'bg-green-500 text-[var(--admin-text-primary)]'
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
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--admin-text-primary)]">{configuredCount}/3</p>
              <p className="text-sm text-[var(--admin-text-muted)]">Trackers Configured</p>
            </div>
          </div>
        </div>

        {trackingPlatforms.map((platform) => {
          const value = settings[platform.field];
          const configured = isConfigured(value);
          return (
            <div key={platform.id} className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-5">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    configured ? 'bg-green-500/20' : 'bg-gray-500/20'
                  )}
                >
                  {configured ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[var(--admin-text-muted)]" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[var(--admin-text-primary)]">{platform.name}</p>
                  <p className={cn('text-sm', configured ? 'text-green-400' : 'text-[var(--admin-text-muted)]')}>
                    {configured ? 'Active' : 'Not configured'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl p-4 flex items-start gap-3">
        <Code className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-[var(--primary)] font-medium">Flexible Input</p>
          <p className="text-sm text-[var(--admin-text-secondary)] mt-1">
            You can enter either a tracking ID (e.g., G-XXXXXXXXXX) or paste your full tracking code snippet.
            Both formats are supported and will be automatically detected.
          </p>
        </div>
      </div>

      {/* Tracking Platforms */}
      <div className="space-y-4">
        {trackingPlatforms.map((platform) => {
          const value = settings[platform.field];
          const configured = isConfigured(value);

          return (
            <div
              key={platform.id}
              className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden"
            >
              {/* Platform Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border-light)]">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${platform.color}20` }}
                  >
                    <platform.icon className="w-5 h-5" style={{ color: platform.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--admin-text-primary)]">{platform.name}</p>
                    <p className="text-sm text-[var(--admin-text-muted)]">
                      {configured ? 'Tracking active' : 'Not configured'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {configured && (
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium">
                      Active
                    </span>
                  )}
                  <a
                    href={platform.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-border-light)] rounded-lg transition-colors"
                    title="View documentation"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Platform Input */}
              <div className="p-6">
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  Pixel ID or Tracking Code
                </label>
                <div className="relative">
                  <textarea
                    value={value || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, [platform.field]: e.target.value }))
                    }
                    placeholder={platform.placeholder}
                    rows={value && value.includes('<script') ? 4 : 1}
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-sm resize-none"
                  />
                  {value && (
                    <button
                      onClick={() => handleCopy(value, platform.id)}
                      className="absolute top-3 right-3 p-1.5 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-border-light)] rounded-lg transition-colors"
                      title="Copy"
                    >
                      {copied === platform.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-xs text-[var(--admin-text-muted)] mt-2">{platform.helpText}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Privacy Note */}
      <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
        <h3 className="font-medium text-[var(--admin-text-primary)] mb-3">Privacy & Compliance</h3>
        <p className="text-sm text-[var(--admin-text-secondary)]">
          Make sure your tracking implementation complies with privacy regulations like GDPR and CCPA.
          Consider implementing a cookie consent banner if you&apos;re collecting user data in regions
          that require explicit consent.
        </p>
      </div>
    </div>
  );
}
