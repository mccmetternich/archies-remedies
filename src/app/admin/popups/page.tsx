'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Save,
  Loader2,
  Check,
  X,
  Clock,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  MousePointerClick,
  LogOut,
  Sparkles,
  Timer,
  Calendar,
  Plus,
  Trash2,
  Edit,
  BarChart3,
  Target,
  Play,
  Mail,
  Phone,
  Download,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';

interface PopupSettings {
  // Welcome Popup
  welcomePopupEnabled: boolean | null;
  welcomePopupTitle: string | null;
  welcomePopupSubtitle: string | null;
  welcomePopupButtonText: string | null;
  welcomePopupImageUrl: string | null;
  welcomePopupVideoUrl: string | null;
  welcomePopupDelay: number | null;
  welcomePopupDismissDays: number | null;
  welcomePopupCtaType: string | null;
  welcomePopupDownloadUrl: string | null;
  welcomePopupDownloadName: string | null;
  welcomePopupSuccessTitle: string | null;
  welcomePopupSuccessMessage: string | null;
  // Exit Popup
  exitPopupEnabled: boolean | null;
  exitPopupTitle: string | null;
  exitPopupSubtitle: string | null;
  exitPopupButtonText: string | null;
  exitPopupImageUrl: string | null;
  exitPopupVideoUrl: string | null;
  exitPopupMinTimeOnSite: number | null;
  exitPopupDismissDays: number | null;
  exitPopupCtaType: string | null;
  exitPopupDownloadUrl: string | null;
  exitPopupDownloadName: string | null;
  exitPopupSuccessTitle: string | null;
  exitPopupSuccessMessage: string | null;
  exitPopupDelayAfterWelcome: number | null;
  // Legacy (for migration)
  emailPopupEnabled: boolean | null;
  emailPopupTitle: string | null;
  emailPopupSubtitle: string | null;
  emailPopupButtonText: string | null;
  emailPopupImageUrl: string | null;
}

interface CustomPopup {
  id: string;
  name: string;
  title: string | null;
  body: string | null;
  videoUrl: string | null;
  imageUrl: string | null;
  ctaType: string;
  ctaButtonText: string | null;
  targetType: string;
  triggerType: string;
  triggerDelay: number | null;
  status: string;
  viewCount: number | null;
  conversionCount: number | null;
  createdAt: string;
}

type PopupType = 'welcome' | 'exit';
type CtaType = 'email' | 'sms' | 'download' | 'none';

const CTA_OPTIONS: { value: CtaType; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'email', label: 'Email', icon: Mail, description: 'Capture email address' },
  { value: 'sms', label: 'SMS', icon: Phone, description: 'Capture phone number' },
  { value: 'download', label: 'Download', icon: Download, description: 'Offer file download' },
  { value: 'none', label: 'Info Only', icon: FileText, description: 'No form, just content' },
];

export default function PopupsPage() {
  const [settings, setSettings] = useState<PopupSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<PopupSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<PopupType>('welcome');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewState, setPreviewState] = useState<'form' | 'success'>('form');
  const [customPopups, setCustomPopups] = useState<CustomPopup[]>([]);
  const [loadingCustomPopups, setLoadingCustomPopups] = useState(true);

  const hasChanges = settings && originalSettings && JSON.stringify(settings) !== JSON.stringify(originalSettings);

  useEffect(() => {
    fetchSettings();
    fetchCustomPopups();
  }, []);

  const fetchCustomPopups = async () => {
    try {
      const res = await fetch('/api/admin/custom-popups');
      const data = await res.json();
      setCustomPopups(data);
    } catch (error) {
      console.error('Failed to fetch custom popups:', error);
    } finally {
      setLoadingCustomPopups(false);
    }
  };

  const handleTogglePopupStatus = async (popup: CustomPopup) => {
    const newStatus = popup.status === 'live' ? 'draft' : 'live';
    try {
      await fetch(`/api/admin/custom-popups/${popup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setCustomPopups(customPopups.map(p =>
        p.id === popup.id ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Failed to toggle popup status:', error);
    }
  };

  const handleDeletePopup = async (popupId: string) => {
    if (!confirm('Are you sure you want to delete this popup?')) return;
    try {
      await fetch(`/api/admin/custom-popups/${popupId}`, { method: 'DELETE' });
      setCustomPopups(customPopups.filter(p => p.id !== popupId));
    } catch (error) {
      console.error('Failed to delete popup:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();

      // Migrate legacy popup settings if new ones don't exist
      const popupSettings: PopupSettings = {
        welcomePopupEnabled: data.welcomePopupEnabled ?? data.emailPopupEnabled ?? true,
        welcomePopupTitle: data.welcomePopupTitle ?? data.emailPopupTitle ?? 'Join Our Community',
        welcomePopupSubtitle: data.welcomePopupSubtitle ?? data.emailPopupSubtitle,
        welcomePopupButtonText: data.welcomePopupButtonText ?? data.emailPopupButtonText ?? 'Subscribe',
        welcomePopupImageUrl: data.welcomePopupImageUrl ?? data.emailPopupImageUrl,
        welcomePopupVideoUrl: data.welcomePopupVideoUrl ?? null,
        welcomePopupDelay: data.welcomePopupDelay ?? 3,
        welcomePopupDismissDays: data.welcomePopupDismissDays ?? 7,
        welcomePopupCtaType: data.welcomePopupCtaType ?? 'email',
        welcomePopupDownloadUrl: data.welcomePopupDownloadUrl ?? null,
        welcomePopupDownloadName: data.welcomePopupDownloadName ?? null,
        welcomePopupSuccessTitle: data.welcomePopupSuccessTitle ?? "You're In!",
        welcomePopupSuccessMessage: data.welcomePopupSuccessMessage ?? "Thanks for joining. We'll be in touch soon.",
        exitPopupEnabled: data.exitPopupEnabled ?? false,
        exitPopupTitle: data.exitPopupTitle ?? 'Wait! Before You Go...',
        exitPopupSubtitle: data.exitPopupSubtitle ?? 'Get 10% off your first order when you sign up for our newsletter.',
        exitPopupButtonText: data.exitPopupButtonText ?? 'Get My Discount',
        exitPopupImageUrl: data.exitPopupImageUrl,
        exitPopupVideoUrl: data.exitPopupVideoUrl ?? null,
        exitPopupMinTimeOnSite: data.exitPopupMinTimeOnSite ?? 10,
        exitPopupDismissDays: data.exitPopupDismissDays ?? 3,
        exitPopupCtaType: data.exitPopupCtaType ?? 'email',
        exitPopupDownloadUrl: data.exitPopupDownloadUrl ?? null,
        exitPopupDownloadName: data.exitPopupDownloadName ?? null,
        exitPopupSuccessTitle: data.exitPopupSuccessTitle ?? "You're In!",
        exitPopupSuccessMessage: data.exitPopupSuccessMessage ?? "Thanks for subscribing. Check your inbox for your discount code.",
        exitPopupDelayAfterWelcome: data.exitPopupDelayAfterWelcome ?? 30,
        // Keep legacy for backwards compat
        emailPopupEnabled: data.emailPopupEnabled,
        emailPopupTitle: data.emailPopupTitle,
        emailPopupSubtitle: data.emailPopupSubtitle,
        emailPopupButtonText: data.emailPopupButtonText,
        emailPopupImageUrl: data.emailPopupImageUrl,
      };

      setSettings(popupSettings);
      setOriginalSettings(popupSettings);
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
      setOriginalSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof PopupSettings, value: string | boolean | number | null) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
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

  // Get current popup settings based on active tab
  const isWelcome = activeTab === 'welcome';
  const currentEnabled = isWelcome ? settings.welcomePopupEnabled : settings.exitPopupEnabled;
  const currentTitle = isWelcome ? settings.welcomePopupTitle : settings.exitPopupTitle;
  const currentSubtitle = isWelcome ? settings.welcomePopupSubtitle : settings.exitPopupSubtitle;
  const currentButtonText = isWelcome ? settings.welcomePopupButtonText : settings.exitPopupButtonText;
  const currentImageUrl = isWelcome ? settings.welcomePopupImageUrl : settings.exitPopupImageUrl;
  const currentVideoUrl = isWelcome ? settings.welcomePopupVideoUrl : settings.exitPopupVideoUrl;
  const currentCtaType = (isWelcome ? settings.welcomePopupCtaType : settings.exitPopupCtaType) as CtaType || 'email';
  const currentSuccessTitle = isWelcome ? settings.welcomePopupSuccessTitle : settings.exitPopupSuccessTitle;
  const currentSuccessMessage = isWelcome ? settings.welcomePopupSuccessMessage : settings.exitPopupSuccessMessage;
  const currentDownloadUrl = isWelcome ? settings.welcomePopupDownloadUrl : settings.exitPopupDownloadUrl;
  const currentDownloadName = isWelcome ? settings.welcomePopupDownloadName : settings.exitPopupDownloadName;

  // Check if current media is video
  const hasVideo = currentVideoUrl && currentVideoUrl.match(/\.(mp4|webm|mov)$/i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">Pop-ups</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1">
            Configure email capture pop-ups for your site
          </p>
        </div>
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
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Welcome Popup Status */}
        <div
          className={cn(
            'bg-[var(--admin-card)] rounded-xl border p-5 cursor-pointer transition-all',
            activeTab === 'welcome'
              ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]/20'
              : 'border-[var(--admin-border-light)] hover:border-[var(--admin-divider)]'
          )}
          onClick={() => setActiveTab('welcome')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                settings.welcomePopupEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'
              )}>
                <Sparkles className={cn(
                  'w-5 h-5',
                  settings.welcomePopupEnabled ? 'text-green-400' : 'text-[var(--admin-text-muted)]'
                )} />
              </div>
              <div>
                <p className="font-medium text-[var(--admin-text-primary)]">Welcome Popup</p>
                <p className="text-xs text-[var(--admin-text-muted)]">Shows when visitor arrives</p>
              </div>
            </div>
            <span className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium',
              settings.welcomePopupEnabled
                ? 'bg-green-500/10 text-green-400'
                : 'bg-gray-500/10 text-[var(--admin-text-muted)]'
            )}>
              {settings.welcomePopupEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--admin-text-muted)]">
            <span className="flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" />
              {settings.welcomePopupDelay}s delay
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {settings.welcomePopupDismissDays}d cooldown
            </span>
          </div>
        </div>

        {/* Exit Popup Status */}
        <div
          className={cn(
            'bg-[var(--admin-card)] rounded-xl border p-5 cursor-pointer transition-all',
            activeTab === 'exit'
              ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]/20'
              : 'border-[var(--admin-border-light)] hover:border-[var(--admin-divider)]'
          )}
          onClick={() => setActiveTab('exit')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                settings.exitPopupEnabled ? 'bg-orange-500/20' : 'bg-gray-500/20'
              )}>
                <LogOut className={cn(
                  'w-5 h-5',
                  settings.exitPopupEnabled ? 'text-orange-400' : 'text-[var(--admin-text-muted)]'
                )} />
              </div>
              <div>
                <p className="font-medium text-[var(--admin-text-primary)]">Exit Intent Popup</p>
                <p className="text-xs text-[var(--admin-text-muted)]">Shows when visitor leaves</p>
              </div>
            </div>
            <span className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium',
              settings.exitPopupEnabled
                ? 'bg-orange-500/10 text-orange-400'
                : 'bg-gray-500/10 text-[var(--admin-text-muted)]'
            )}>
              {settings.exitPopupEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--admin-text-muted)]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {settings.exitPopupMinTimeOnSite}s min time
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {settings.exitPopupDismissDays}d cooldown
            </span>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Enable Toggle */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      currentEnabled
                        ? isWelcome ? 'bg-green-500/20' : 'bg-orange-500/20'
                        : 'bg-gray-500/20'
                    )}>
                      {currentEnabled ? (
                        <Eye className={cn('w-6 h-6', isWelcome ? 'text-green-400' : 'text-orange-400')} />
                      ) : (
                        <EyeOff className="w-6 h-6 text-[var(--admin-text-secondary)]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--admin-text-primary)]">
                        {currentEnabled ? `${isWelcome ? 'Welcome' : 'Exit'} Popup is Active` : 'Popup is Disabled'}
                      </p>
                      <p className="text-sm text-[var(--admin-text-muted)]">
                        {currentEnabled
                          ? isWelcome
                            ? 'Visitors will see this popup when they arrive'
                            : 'Visitors will see this popup when leaving'
                          : 'Enable to start showing this popup'}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentEnabled ?? false}
                      onChange={(e) => updateField(
                        isWelcome ? 'welcomePopupEnabled' : 'exitPopupEnabled',
                        e.target.checked
                      )}
                      className="sr-only peer"
                    />
                    <div className={cn(
                      'w-14 h-7 peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:bg-white',
                      isWelcome
                        ? 'bg-[var(--admin-border-light)] peer-focus:ring-green-500/50 peer-checked:bg-green-500'
                        : 'bg-[var(--admin-border-light)] peer-focus:ring-orange-500/50 peer-checked:bg-orange-500'
                    )}></div>
                  </label>
                </div>
              </div>

              {/* Content Settings */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-5">
                <h3 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2">
                  {isWelcome ? <Sparkles className="w-4 h-4 text-green-400" /> : <LogOut className="w-4 h-4 text-orange-400" />}
                  Content
                </h3>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Title</label>
                  <input
                    type="text"
                    value={currentTitle || ''}
                    onChange={(e) => updateField(
                      isWelcome ? 'welcomePopupTitle' : 'exitPopupTitle',
                      e.target.value
                    )}
                    placeholder={isWelcome ? 'Join Our Community' : 'Wait! Before You Go...'}
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Subtitle / Description</label>
                  <textarea
                    value={currentSubtitle || ''}
                    onChange={(e) => updateField(
                      isWelcome ? 'welcomePopupSubtitle' : 'exitPopupSubtitle',
                      e.target.value
                    )}
                    placeholder="Get 10% off your first order when you sign up for our newsletter."
                    rows={3}
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  />
                </div>

                {/* Media - Image or Video */}
                <div className="space-y-4">
                  <MediaPickerButton
                    label="Popup Image"
                    value={currentImageUrl}
                    onChange={(url) => updateField(
                      isWelcome ? 'welcomePopupImageUrl' : 'exitPopupImageUrl',
                      url || null
                    )}
                    helpText="Square image recommended, min 400x400px"
                    folder="popups"
                  />

                  <MediaPickerButton
                    label="Popup Video (optional)"
                    value={currentVideoUrl}
                    onChange={(url) => updateField(
                      isWelcome ? 'welcomePopupVideoUrl' : 'exitPopupVideoUrl',
                      url || null
                    )}
                    helpText="MP4/WebM video. Will replace image when set."
                    folder="popups"
                    acceptVideo={true}
                  />
                </div>
              </div>

              {/* CTA Type Selection */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-5">
                <h3 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-[var(--primary)]" />
                  Call to Action
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {CTA_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = currentCtaType === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => updateField(
                          isWelcome ? 'welcomePopupCtaType' : 'exitPopupCtaType',
                          option.value
                        )}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all',
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                            : 'border-[var(--admin-border-light)] hover:border-[var(--admin-divider)]'
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={cn(
                            'w-5 h-5',
                            isSelected ? 'text-[var(--primary)]' : 'text-[var(--admin-text-muted)]'
                          )} />
                          <span className={cn(
                            'font-medium',
                            isSelected ? 'text-[var(--admin-text-primary)]' : 'text-[var(--admin-text-secondary)]'
                          )}>
                            {option.label}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--admin-text-muted)]">{option.description}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Button Text */}
                {currentCtaType !== 'none' && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Button Text</label>
                    <input
                      type="text"
                      value={currentButtonText || ''}
                      onChange={(e) => updateField(
                        isWelcome ? 'welcomePopupButtonText' : 'exitPopupButtonText',
                        e.target.value
                      )}
                      placeholder={isWelcome ? 'Subscribe' : 'Get My Discount'}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                )}

                {/* Download File Settings */}
                {currentCtaType === 'download' && (
                  <div className="space-y-4 pt-4 border-t border-[var(--admin-border-light)]">
                    <MediaPickerButton
                      label="Download File"
                      value={currentDownloadUrl}
                      onChange={(url) => updateField(
                        isWelcome ? 'welcomePopupDownloadUrl' : 'exitPopupDownloadUrl',
                        url || null
                      )}
                      helpText="PDF, image, or other file to offer"
                      folder="downloads"
                    />
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Display File Name</label>
                      <input
                        type="text"
                        value={currentDownloadName || ''}
                        onChange={(e) => updateField(
                          isWelcome ? 'welcomePopupDownloadName' : 'exitPopupDownloadName',
                          e.target.value
                        )}
                        placeholder="e.g., Free Eye Care Guide.pdf"
                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Success State Settings */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-5">
                <h3 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Confirmation State
                </h3>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Success Title</label>
                  <input
                    type="text"
                    value={currentSuccessTitle || ''}
                    onChange={(e) => updateField(
                      isWelcome ? 'welcomePopupSuccessTitle' : 'exitPopupSuccessTitle',
                      e.target.value
                    )}
                    placeholder="You're In!"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Success Message</label>
                  <textarea
                    value={currentSuccessMessage || ''}
                    onChange={(e) => updateField(
                      isWelcome ? 'welcomePopupSuccessMessage' : 'exitPopupSuccessMessage',
                      e.target.value
                    )}
                    placeholder="Thanks for joining. We'll be in touch soon."
                    rows={2}
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Timing Settings */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-5">
                <h3 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--primary)]" />
                  Timing & Display
                </h3>

                {isWelcome ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Delay Before Showing (seconds)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={settings.welcomePopupDelay ?? 3}
                        onChange={(e) => updateField('welcomePopupDelay', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                      <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                        How long to wait after page load before showing the popup
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Days Before Showing Again
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={settings.welcomePopupDismissDays ?? 7}
                        onChange={(e) => updateField('welcomePopupDismissDays', parseInt(e.target.value) || 7)}
                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                      <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                        After dismissal or submission, how many days before showing again
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Minimum Time on Site (seconds)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={300}
                        value={settings.exitPopupMinTimeOnSite ?? 10}
                        onChange={(e) => updateField('exitPopupMinTimeOnSite', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                      <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                        Visitor must be on the site for at least this long before exit popup can trigger
                      </p>
                    </div>

                    {settings.welcomePopupEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                          Delay After Welcome Popup (seconds)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={300}
                          value={settings.exitPopupDelayAfterWelcome ?? 30}
                          onChange={(e) => updateField('exitPopupDelayAfterWelcome', parseInt(e.target.value) || 30)}
                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                        <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                          Wait this long after welcome popup before allowing exit popup to show
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Days Before Showing Again
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={settings.exitPopupDismissDays ?? 3}
                        onChange={(e) => updateField('exitPopupDismissDays', parseInt(e.target.value) || 3)}
                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                      <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                        After dismissal or submission, how many days before showing again
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Overlap Warning */}
              {settings.welcomePopupEnabled && settings.exitPopupEnabled && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-400">Overlap Prevention Active</p>
                      <p className="text-sm text-[var(--admin-text-secondary)] mt-1">
                        Exit popup will wait {settings.exitPopupDelayAfterWelcome}s after welcome popup before it can trigger.
                        If user submits the welcome popup, exit popup will be suppressed entirely.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-[var(--admin-text-primary)]">Preview</h2>
            <div className="flex items-center gap-2">
              {/* Preview State Toggle */}
              <div className="flex gap-1 p-1 bg-[var(--admin-input)] rounded-lg">
                <button
                  onClick={() => setPreviewState('form')}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    previewState === 'form'
                      ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                      : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                  )}
                >
                  Form
                </button>
                <button
                  onClick={() => setPreviewState('success')}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    previewState === 'success'
                      ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                      : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                  )}
                >
                  Success
                </button>
              </div>
              {/* Device Toggle */}
              <div className="flex gap-1 p-1 bg-[var(--admin-input)] rounded-lg">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    previewDevice === 'desktop'
                      ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                      : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                  )}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    previewDevice === 'mobile'
                      ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                      : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                  )}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 sticky top-6">
            {/* Preview Container */}
            <div
              className={cn(
                'mx-auto transition-all duration-300',
                previewDevice === 'desktop' ? 'max-w-md' : 'max-w-xs'
              )}
            >
              {/* Popup Preview */}
              <div className={cn(
                'bg-white rounded-3xl shadow-2xl overflow-hidden relative',
                previewDevice === 'mobile' && 'rounded-2xl'
              )}>
                {/* Media */}
                {(hasVideo || currentImageUrl) && (
                  <div className={cn(
                    'relative bg-[#f5f5f0]',
                    previewDevice === 'desktop' ? 'h-48' : 'h-36'
                  )}>
                    {hasVideo ? (
                      <video
                        src={currentVideoUrl || ''}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : currentImageUrl ? (
                      <Image
                        src={currentImageUrl}
                        alt="Popup preview"
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                )}

                {/* Content */}
                <div className={cn(
                  'text-center',
                  previewDevice === 'desktop' ? 'p-8' : 'p-5'
                )}>
                  <AnimatePresence mode="wait">
                    {previewState === 'form' ? (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <h3 className={cn(
                          'font-semibold text-gray-900 mb-2',
                          previewDevice === 'desktop' ? 'text-2xl' : 'text-xl'
                        )}>
                          {currentTitle || (isWelcome ? 'Join Our Community' : 'Wait! Before You Go...')}
                        </h3>
                        <p className={cn(
                          'text-gray-600 mb-6',
                          previewDevice === 'desktop' ? 'text-base' : 'text-sm'
                        )}>
                          {currentSubtitle || 'Get 10% off your first order when you sign up for our newsletter.'}
                        </p>

                        {/* Form based on CTA type */}
                        {currentCtaType !== 'none' && (
                          <div className="space-y-3">
                            {currentCtaType === 'email' && (
                              <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-5 py-3.5 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--primary)] text-center"
                                disabled
                              />
                            )}
                            {currentCtaType === 'sms' && (
                              <input
                                type="tel"
                                placeholder="Enter your phone number"
                                className="w-full px-5 py-3.5 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--primary)] text-center"
                                disabled
                              />
                            )}
                            {currentCtaType === 'download' && currentDownloadName && (
                              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
                                <Download className="w-4 h-4" />
                                {currentDownloadName}
                              </div>
                            )}
                            <button className={cn(
                              'w-full py-3.5 rounded-full font-semibold transition-colors',
                              isWelcome
                                ? 'bg-[#1a1a1a] text-white hover:bg-black'
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                            )}>
                              {currentButtonText || (isWelcome ? 'Subscribe' : 'Get My Discount')}
                            </button>
                          </div>
                        )}

                        <p className="text-xs text-gray-400 mt-4">
                          No spam. Unsubscribe anytime.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="py-4"
                      >
                        <div className={cn(
                          'mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center',
                          previewDevice === 'desktop' ? 'w-16 h-16' : 'w-12 h-12'
                        )}>
                          <Check className={cn(
                            'text-green-600',
                            previewDevice === 'desktop' ? 'w-8 h-8' : 'w-6 h-6'
                          )} />
                        </div>
                        <h3 className={cn(
                          'font-semibold text-gray-900 mb-2',
                          previewDevice === 'desktop' ? 'text-2xl' : 'text-xl'
                        )}>
                          {currentSuccessTitle || "You're In!"}
                        </h3>
                        <p className={cn(
                          'text-gray-600',
                          previewDevice === 'desktop' ? 'text-base' : 'text-sm'
                        )}>
                          {currentSuccessMessage || "Thanks for joining. We'll be in touch soon."}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Close button */}
                <button className="absolute top-3 right-3 w-8 h-8 bg-black/10 rounded-full flex items-center justify-center text-gray-500 hover:bg-black/20 transition-colors">
                  <X className="w-4 h-4" />
                </button>

                {/* Type badge */}
                <div className={cn(
                  'absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium',
                  isWelcome
                    ? 'bg-green-500/90 text-white'
                    : 'bg-orange-500/90 text-white'
                )}>
                  {isWelcome ? 'Welcome' : 'Exit Intent'}
                </div>
              </div>

              {/* Status indicator */}
              <div className={cn(
                'mt-4 text-center text-sm font-medium',
                currentEnabled
                  ? isWelcome ? 'text-green-400' : 'text-orange-400'
                  : 'text-[var(--admin-text-muted)]'
              )}>
                {currentEnabled ? 'Active - Visible to visitors' : 'Disabled - Not visible'}
              </div>

              {/* Timing info */}
              <div className="mt-2 text-center text-xs text-[var(--admin-text-muted)]">
                {isWelcome
                  ? `Shows after ${settings.welcomePopupDelay}s, then waits ${settings.welcomePopupDismissDays} days`
                  : `Triggers on exit after ${settings.exitPopupMinTimeOnSite}s on site`
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Popups Section */}
      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-[var(--admin-text-primary)]">Custom Popups</h2>
            <p className="text-sm text-[var(--admin-text-secondary)] mt-1">
              Page-specific popups with advanced targeting and triggers
            </p>
          </div>
          <Link
            href="/admin/popups/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Popup
          </Link>
        </div>

        {/* Custom Popups Stats */}
        {customPopups.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--admin-text-primary)]">{customPopups.length}</p>
                  <p className="text-sm text-[var(--admin-text-muted)]">Total Popups</p>
                </div>
              </div>
            </div>
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--admin-text-primary)]">
                    {customPopups.filter(p => p.status === 'live').length}
                  </p>
                  <p className="text-sm text-[var(--admin-text-muted)]">Live</p>
                </div>
              </div>
            </div>
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--admin-text-primary)]">
                    {customPopups.reduce((acc, p) => acc + (p.conversionCount || 0), 0)}
                  </p>
                  <p className="text-sm text-[var(--admin-text-muted)]">Total Conversions</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Popups List */}
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden">
          {loadingCustomPopups ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--admin-text-muted)]" />
            </div>
          ) : customPopups.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--admin-border-light)]">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                    Target
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                    CTA
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                    Stats
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border-light)]">
                {customPopups.map((popup) => (
                  <tr key={popup.id} className="hover:bg-[var(--admin-hover)] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[var(--admin-text-primary)]">{popup.name}</p>
                        {popup.title && (
                          <p className="text-sm text-[var(--admin-text-muted)] truncate max-w-[200px]">{popup.title}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-full capitalize">
                        {popup.targetType === 'all' ? 'All Pages' : popup.targetType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-full capitalize">
                        {popup.ctaType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-[var(--admin-text-primary)]">{popup.viewCount || 0}</span>
                        <span className="text-[var(--admin-text-muted)]"> views / </span>
                        <span className="text-green-400">{popup.conversionCount || 0}</span>
                        <span className="text-[var(--admin-text-muted)]"> conv</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePopupStatus(popup)}
                        className={cn(
                          'px-2.5 py-1 text-xs font-medium rounded-full transition-colors',
                          popup.status === 'live'
                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                            : 'bg-gray-500/10 text-[var(--admin-text-muted)] hover:bg-gray-500/20'
                        )}
                      >
                        {popup.status === 'live' ? 'Live' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/popups/${popup.id}`}
                          className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)] transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeletePopup(popup.id)}
                          className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center">
              <MousePointerClick className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)]" />
              <h3 className="font-medium text-[var(--admin-text-primary)] mb-2">No custom popups yet</h3>
              <p className="text-sm text-[var(--admin-text-muted)] mb-6">
                Create targeted popups for specific pages or products
              </p>
              <Link
                href="/admin/popups/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Popup
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
