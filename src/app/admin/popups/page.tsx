'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Save,
  Loader2,
  Check,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  LogOut,
  Sparkles,
  Timer,
  Calendar,
  Plus,
  Trash2,
  Edit,
  BarChart3,
  Mail,
  Phone,
  Download,
  FileText,
  Users,
  Image as ImageIcon,
  Play,
  Star,
  Quote,
  ExternalLink,
  Link as LinkIcon,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { InternalLinkSelector } from '@/components/admin/internal-link-selector';

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
  welcomePopupSessionOnly: boolean | null;
  welcomePopupSessionExpiryHours: number | null;
  welcomePopupCtaType: string | null;
  welcomePopupDownloadEnabled: boolean | null;
  welcomePopupDownloadUrl: string | null;
  welcomePopupDownloadName: string | null;
  welcomePopupSuccessTitle: string | null;
  welcomePopupSuccessMessage: string | null;
  welcomePopupNoSpamText: string | null;
  // Welcome Popup Testimonial
  welcomePopupTestimonialEnabled: boolean | null;
  welcomePopupTestimonialEnabledDesktop: boolean | null;
  welcomePopupTestimonialEnabledMobile: boolean | null;
  welcomePopupTestimonialQuote: string | null;
  welcomePopupTestimonialAuthor: string | null;
  welcomePopupTestimonialAvatarUrl: string | null;
  welcomePopupTestimonialStars: number | null;
  // Welcome Popup Success Links
  welcomePopupSuccessLink1Text: string | null;
  welcomePopupSuccessLink1Url: string | null;
  welcomePopupSuccessLink2Text: string | null;
  welcomePopupSuccessLink2Url: string | null;
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
  exitPopupDownloadEnabled: boolean | null;
  exitPopupDownloadUrl: string | null;
  exitPopupDownloadName: string | null;
  exitPopupSuccessTitle: string | null;
  exitPopupSuccessMessage: string | null;
  exitPopupNoSpamText: string | null;
  exitPopupDelayAfterWelcome: number | null;
  // Exit Popup Testimonial
  exitPopupTestimonialEnabled: boolean | null;
  exitPopupTestimonialEnabledDesktop: boolean | null;
  exitPopupTestimonialEnabledMobile: boolean | null;
  exitPopupTestimonialQuote: string | null;
  exitPopupTestimonialAuthor: string | null;
  exitPopupTestimonialAvatarUrl: string | null;
  exitPopupTestimonialStars: number | null;
  // Exit Popup Success Links
  exitPopupSuccessLink1Text: string | null;
  exitPopupSuccessLink1Url: string | null;
  exitPopupSuccessLink2Text: string | null;
  exitPopupSuccessLink2Url: string | null;
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

type TabType = 'welcome' | 'exit' | 'custom';
type CtaType = 'email' | 'sms' | 'both' | 'none';

const CTA_OPTIONS: { value: CtaType; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'email', label: 'Email Only', icon: Mail, description: 'Capture email address' },
  { value: 'sms', label: 'Phone Only', icon: Phone, description: 'Capture phone number' },
  { value: 'both', label: 'Email & Phone', icon: Users, description: 'Capture both (phone default)' },
  { value: 'none', label: 'Info Only', icon: FileText, description: 'No form, just content' },
];

export default function PopupsPage() {
  const [settings, setSettings] = useState<PopupSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<PopupSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('welcome');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewState, setPreviewState] = useState<'form' | 'success'>('form');
  const [customPopups, setCustomPopups] = useState<CustomPopup[]>([]);
  const [loadingCustomPopups, setLoadingCustomPopups] = useState(true);

  const hasChanges = settings && originalSettings && JSON.stringify(settings) !== JSON.stringify(originalSettings);
  const liveCustomPopups = customPopups.filter(p => p.status === 'live');

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

      const popupSettings: PopupSettings = {
        welcomePopupEnabled: data.welcomePopupEnabled ?? true,
        welcomePopupTitle: data.welcomePopupTitle ?? 'Join Our Community',
        welcomePopupSubtitle: data.welcomePopupSubtitle ?? 'Get 10% off your first order plus exclusive access to new products.',
        welcomePopupButtonText: data.welcomePopupButtonText ?? 'Subscribe',
        welcomePopupImageUrl: data.welcomePopupImageUrl ?? null,
        welcomePopupVideoUrl: data.welcomePopupVideoUrl ?? null,
        welcomePopupDelay: data.welcomePopupDelay ?? 3,
        welcomePopupDismissDays: data.welcomePopupDismissDays ?? 7,
        welcomePopupSessionOnly: data.welcomePopupSessionOnly ?? true,
        welcomePopupSessionExpiryHours: data.welcomePopupSessionExpiryHours ?? 24,
        welcomePopupCtaType: data.welcomePopupCtaType ?? 'both',
        welcomePopupDownloadEnabled: data.welcomePopupDownloadEnabled ?? false,
        welcomePopupDownloadUrl: data.welcomePopupDownloadUrl ?? null,
        welcomePopupDownloadName: data.welcomePopupDownloadName ?? null,
        welcomePopupSuccessTitle: data.welcomePopupSuccessTitle ?? "You're In!",
        welcomePopupSuccessMessage: data.welcomePopupSuccessMessage ?? "Thanks for joining. We'll be in touch soon.",
        welcomePopupNoSpamText: data.welcomePopupNoSpamText ?? 'No spam, ever. Unsubscribe anytime.',
        // Welcome Popup Testimonial
        welcomePopupTestimonialEnabled: data.welcomePopupTestimonialEnabled ?? false,
        welcomePopupTestimonialEnabledDesktop: data.welcomePopupTestimonialEnabledDesktop ?? true,
        welcomePopupTestimonialEnabledMobile: data.welcomePopupTestimonialEnabledMobile ?? true,
        welcomePopupTestimonialQuote: data.welcomePopupTestimonialQuote ?? null,
        welcomePopupTestimonialAuthor: data.welcomePopupTestimonialAuthor ?? null,
        welcomePopupTestimonialAvatarUrl: data.welcomePopupTestimonialAvatarUrl ?? null,
        welcomePopupTestimonialStars: data.welcomePopupTestimonialStars ?? 5,
        // Welcome Popup Success Links
        welcomePopupSuccessLink1Text: data.welcomePopupSuccessLink1Text ?? null,
        welcomePopupSuccessLink1Url: data.welcomePopupSuccessLink1Url ?? null,
        welcomePopupSuccessLink2Text: data.welcomePopupSuccessLink2Text ?? null,
        welcomePopupSuccessLink2Url: data.welcomePopupSuccessLink2Url ?? null,
        // Exit Popup
        exitPopupEnabled: data.exitPopupEnabled ?? false,
        exitPopupTitle: data.exitPopupTitle ?? 'Wait! Before You Go...',
        exitPopupSubtitle: data.exitPopupSubtitle ?? 'Get 10% off your first order when you sign up.',
        exitPopupButtonText: data.exitPopupButtonText ?? 'Get My Discount',
        exitPopupImageUrl: data.exitPopupImageUrl ?? null,
        exitPopupVideoUrl: data.exitPopupVideoUrl ?? null,
        exitPopupMinTimeOnSite: data.exitPopupMinTimeOnSite ?? 10,
        exitPopupDismissDays: data.exitPopupDismissDays ?? 3,
        exitPopupCtaType: data.exitPopupCtaType ?? 'both',
        exitPopupDownloadEnabled: data.exitPopupDownloadEnabled ?? false,
        exitPopupDownloadUrl: data.exitPopupDownloadUrl ?? null,
        exitPopupDownloadName: data.exitPopupDownloadName ?? null,
        exitPopupSuccessTitle: data.exitPopupSuccessTitle ?? "You're In!",
        exitPopupSuccessMessage: data.exitPopupSuccessMessage ?? "Thanks for subscribing. Check your inbox!",
        exitPopupNoSpamText: data.exitPopupNoSpamText ?? 'No spam, ever. Unsubscribe anytime.',
        exitPopupDelayAfterWelcome: data.exitPopupDelayAfterWelcome ?? 30,
        // Exit Popup Testimonial
        exitPopupTestimonialEnabled: data.exitPopupTestimonialEnabled ?? false,
        exitPopupTestimonialEnabledDesktop: data.exitPopupTestimonialEnabledDesktop ?? true,
        exitPopupTestimonialEnabledMobile: data.exitPopupTestimonialEnabledMobile ?? true,
        exitPopupTestimonialQuote: data.exitPopupTestimonialQuote ?? null,
        exitPopupTestimonialAuthor: data.exitPopupTestimonialAuthor ?? null,
        exitPopupTestimonialAvatarUrl: data.exitPopupTestimonialAvatarUrl ?? null,
        exitPopupTestimonialStars: data.exitPopupTestimonialStars ?? 5,
        // Exit Popup Success Links
        exitPopupSuccessLink1Text: data.exitPopupSuccessLink1Text ?? null,
        exitPopupSuccessLink1Url: data.exitPopupSuccessLink1Url ?? null,
        exitPopupSuccessLink2Text: data.exitPopupSuccessLink2Text ?? null,
        exitPopupSuccessLink2Url: data.exitPopupSuccessLink2Url ?? null,
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
    console.log('[PopupsPage] updateField called:', field, value);
    setSettings(prev => {
      if (!prev) {
        console.error('[PopupsPage] updateField failed: settings is null');
        return prev;
      }
      const newSettings = { ...prev, [field]: value };
      console.log('[PopupsPage] updateField complete, field:', field, 'now:', newSettings[field]);
      return newSettings;
    });
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

  // Helper to get current popup fields based on tab
  const isWelcome = activeTab === 'welcome';
  const prefix = isWelcome ? 'welcomePopup' : 'exitPopup';

  const currentEnabled = isWelcome ? settings.welcomePopupEnabled : settings.exitPopupEnabled;
  const currentTitle = isWelcome ? settings.welcomePopupTitle : settings.exitPopupTitle;
  const currentSubtitle = isWelcome ? settings.welcomePopupSubtitle : settings.exitPopupSubtitle;
  const currentButtonText = isWelcome ? settings.welcomePopupButtonText : settings.exitPopupButtonText;
  const currentImageUrl = isWelcome ? settings.welcomePopupImageUrl : settings.exitPopupImageUrl;
  const currentVideoUrl = isWelcome ? settings.welcomePopupVideoUrl : settings.exitPopupVideoUrl;
  const currentCtaType = (isWelcome ? settings.welcomePopupCtaType : settings.exitPopupCtaType) as CtaType || 'both';
  const currentDownloadEnabled = isWelcome ? settings.welcomePopupDownloadEnabled : settings.exitPopupDownloadEnabled;
  const currentDownloadUrl = isWelcome ? settings.welcomePopupDownloadUrl : settings.exitPopupDownloadUrl;
  const currentDownloadName = isWelcome ? settings.welcomePopupDownloadName : settings.exitPopupDownloadName;
  const currentSuccessTitle = isWelcome ? settings.welcomePopupSuccessTitle : settings.exitPopupSuccessTitle;
  const currentSuccessMessage = isWelcome ? settings.welcomePopupSuccessMessage : settings.exitPopupSuccessMessage;
  const currentNoSpamText = isWelcome ? settings.welcomePopupNoSpamText : settings.exitPopupNoSpamText;

  // Testimonial bubble settings
  const currentTestimonialEnabled = isWelcome ? settings.welcomePopupTestimonialEnabled : settings.exitPopupTestimonialEnabled;
  const currentTestimonialEnabledDesktop = isWelcome ? settings.welcomePopupTestimonialEnabledDesktop : settings.exitPopupTestimonialEnabledDesktop;
  const currentTestimonialEnabledMobile = isWelcome ? settings.welcomePopupTestimonialEnabledMobile : settings.exitPopupTestimonialEnabledMobile;
  const currentTestimonialQuote = isWelcome ? settings.welcomePopupTestimonialQuote : settings.exitPopupTestimonialQuote;
  const currentTestimonialAuthor = isWelcome ? settings.welcomePopupTestimonialAuthor : settings.exitPopupTestimonialAuthor;
  const currentTestimonialAvatarUrl = isWelcome ? settings.welcomePopupTestimonialAvatarUrl : settings.exitPopupTestimonialAvatarUrl;
  const currentTestimonialStars = isWelcome ? settings.welcomePopupTestimonialStars : settings.exitPopupTestimonialStars;

  // Success view links
  const currentSuccessLink1Text = isWelcome ? settings.welcomePopupSuccessLink1Text : settings.exitPopupSuccessLink1Text;
  const currentSuccessLink1Url = isWelcome ? settings.welcomePopupSuccessLink1Url : settings.exitPopupSuccessLink1Url;
  const currentSuccessLink2Text = isWelcome ? settings.welcomePopupSuccessLink2Text : settings.exitPopupSuccessLink2Text;
  const currentSuccessLink2Url = isWelcome ? settings.welcomePopupSuccessLink2Url : settings.exitPopupSuccessLink2Url;

  // Check if media is video - check both file extension and Cloudinary video resource type
  const hasVideo = currentVideoUrl && (
    currentVideoUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ||
    currentVideoUrl.includes('/video/upload/')
  );

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

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)]">
        <button
          onClick={() => setActiveTab('welcome')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
            activeTab === 'welcome'
              ? 'bg-[var(--admin-bg)] shadow-sm text-[var(--admin-text-primary)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
          )}
        >
          <Sparkles className="w-4 h-4" />
          Welcome Popup
          <span className={cn(
            'px-2 py-0.5 text-xs rounded-full',
            settings.welcomePopupEnabled
              ? 'bg-green-500/10 text-green-500'
              : 'bg-gray-500/10 text-gray-500'
          )}>
            {settings.welcomePopupEnabled ? 'Active' : 'Disabled'}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('exit')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
            activeTab === 'exit'
              ? 'bg-[var(--admin-bg)] shadow-sm text-[var(--admin-text-primary)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
          )}
        >
          <LogOut className="w-4 h-4" />
          Exit Intent
          <span className={cn(
            'px-2 py-0.5 text-xs rounded-full',
            settings.exitPopupEnabled
              ? 'bg-orange-500/10 text-orange-500'
              : 'bg-gray-500/10 text-gray-500'
          )}>
            {settings.exitPopupEnabled ? 'Active' : 'Disabled'}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
            activeTab === 'custom'
              ? 'bg-[var(--admin-bg)] shadow-sm text-[var(--admin-text-primary)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
          )}
        >
          <BarChart3 className="w-4 h-4" />
          Custom Popups
          {liveCustomPopups.length > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
              {liveCustomPopups.length} Live
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'custom' ? (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Custom Popups List */}
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden">
              <div className="p-6 border-b border-[var(--admin-border-light)] flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[var(--admin-text-primary)]">Custom Popups</h3>
                  <p className="text-sm text-[var(--admin-text-muted)] mt-1">
                    Create targeted popups for specific pages or products
                  </p>
                </div>
                <Link
                  href="/admin/popups/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Popup
                </Link>
              </div>

              {loadingCustomPopups ? (
                <div className="p-12 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--admin-text-muted)]" />
                </div>
              ) : customPopups.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--admin-border-light)] flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-[var(--admin-text-muted)]" />
                  </div>
                  <p className="text-[var(--admin-text-secondary)]">No custom popups yet</p>
                  <p className="text-sm text-[var(--admin-text-muted)] mt-1">
                    Create your first targeted popup to engage visitors
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--admin-border-light)]">
                  {customPopups.map((popup) => (
                    <div key={popup.id} className="p-4 flex items-center gap-4 hover:bg-[var(--admin-hover)] transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-[var(--admin-text-primary)] truncate">{popup.name}</h4>
                          <span className={cn(
                            'px-2 py-0.5 text-xs rounded-full',
                            popup.status === 'live'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-gray-500/10 text-gray-500'
                          )}>
                            {popup.status === 'live' ? 'Live' : 'Draft'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-[var(--admin-text-muted)]">
                          <span>{popup.targetType === 'all' ? 'All Pages' : popup.targetType === 'product' ? 'Products' : 'Specific Pages'}</span>
                          <span>•</span>
                          <span>{popup.triggerType}</span>
                          {popup.viewCount !== null && (
                            <>
                              <span>•</span>
                              <span>{popup.viewCount} views</span>
                            </>
                          )}
                          {popup.conversionCount !== null && (
                            <>
                              <span>•</span>
                              <span>{popup.conversionCount} conversions</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePopupStatus(popup)}
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            popup.status === 'live'
                              ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                              : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                          )}
                          title={popup.status === 'live' ? 'Disable' : 'Enable'}
                        >
                          {popup.status === 'live' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <Link
                          href={`/admin/popups/${popup.id}`}
                          className="p-2 rounded-lg bg-[var(--admin-border-light)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeletePopup(popup.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Settings Panel */}
            <div className="space-y-6">
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

              {/* Media Upload */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-4">
                <h3 className="font-medium text-[var(--admin-text-primary)]">Media</h3>
                <MediaPickerButton
                  label="Image or Video"
                  value={currentVideoUrl || currentImageUrl}
                  onChange={(url) => {
                    // Check if URL is a video - check both file extension and Cloudinary video path
                    const isVideoUrl = url && (
                      url.match(/\.(mp4|webm|mov)(\?|$)/i) ||
                      url.includes('/video/upload/')
                    );
                    if (isVideoUrl) {
                      updateField(isWelcome ? 'welcomePopupVideoUrl' : 'exitPopupVideoUrl', url);
                      updateField(isWelcome ? 'welcomePopupImageUrl' : 'exitPopupImageUrl', null);
                    } else {
                      updateField(isWelcome ? 'welcomePopupImageUrl' : 'exitPopupImageUrl', url);
                      updateField(isWelcome ? 'welcomePopupVideoUrl' : 'exitPopupVideoUrl', null);
                    }
                  }}
                  helpText="Upload an image or video for the popup header"
                  folder="popups"
                  acceptVideo={true}
                />
              </div>

              {/* Content */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-4">
                <h3 className="font-medium text-[var(--admin-text-primary)]">Content</h3>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Title</label>
                  <input
                    type="text"
                    value={currentTitle || ''}
                    onChange={(e) => updateField(isWelcome ? 'welcomePopupTitle' : 'exitPopupTitle', e.target.value)}
                    placeholder={isWelcome ? 'Join Our Community' : 'Wait! Before You Go...'}
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Subtitle</label>
                  <textarea
                    value={currentSubtitle || ''}
                    onChange={(e) => updateField(isWelcome ? 'welcomePopupSubtitle' : 'exitPopupSubtitle', e.target.value)}
                    placeholder="Get 10% off your first order..."
                    rows={2}
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Button Text</label>
                  <input
                    type="text"
                    value={currentButtonText || ''}
                    onChange={(e) => updateField(isWelcome ? 'welcomePopupButtonText' : 'exitPopupButtonText', e.target.value)}
                    placeholder="Subscribe"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>

              {/* CTA Type */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-4">
                <h3 className="font-medium text-[var(--admin-text-primary)]">Call to Action</h3>

                <div className="grid grid-cols-2 gap-2">
                  {CTA_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = currentCtaType === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => updateField(isWelcome ? 'welcomePopupCtaType' : 'exitPopupCtaType', option.value)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                            : 'border-[var(--admin-border-light)] hover:border-[var(--admin-divider)]'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          isSelected ? 'bg-[var(--primary)]/20' : 'bg-[var(--admin-border-light)]'
                        )}>
                          <Icon className={cn('w-4 h-4', isSelected ? 'text-[var(--primary)]' : 'text-[var(--admin-text-muted)]')} />
                        </div>
                        <div>
                          <p className={cn('text-sm font-medium', isSelected ? 'text-[var(--admin-text-primary)]' : 'text-[var(--admin-text-secondary)]')}>
                            {option.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Download Add-on */}
                {currentCtaType !== 'none' && (
                  <div className="pt-4 border-t border-[var(--admin-border-light)]">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentDownloadEnabled ?? false}
                        onChange={(e) => updateField(isWelcome ? 'welcomePopupDownloadEnabled' : 'exitPopupDownloadEnabled', e.target.checked)}
                        className="w-5 h-5 rounded border-[var(--admin-border-light)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <div>
                        <p className="font-medium text-[var(--admin-text-primary)]">Include file download</p>
                        <p className="text-xs text-[var(--admin-text-muted)]">
                          Shows badge: "Download starts on submission"
                        </p>
                      </div>
                    </label>

                    {currentDownloadEnabled && (
                      <div className="mt-4 space-y-3">
                        <MediaPickerButton
                          label="Download File"
                          value={currentDownloadUrl}
                          onChange={(url) => updateField(isWelcome ? 'welcomePopupDownloadUrl' : 'exitPopupDownloadUrl', url)}
                          helpText="PDF, image, or other file to download"
                          folder="downloads"
                        />
                        <div>
                          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">File Name (optional)</label>
                          <input
                            type="text"
                            value={currentDownloadName || ''}
                            onChange={(e) => updateField(isWelcome ? 'welcomePopupDownloadName' : 'exitPopupDownloadName', e.target.value)}
                            placeholder="guide.pdf"
                            className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timing / Behavior */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-4">
                <h3 className="font-medium text-[var(--admin-text-primary)]">Timing & Behavior</h3>

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
                    </div>

                    <div className="pt-4 border-t border-[var(--admin-border-light)]">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium text-[var(--admin-text-primary)]">Show Once Per Session</p>
                          <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                            Only show once per browsing session, then wait until expiry
                          </p>
                        </div>
                        <div className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.welcomePopupSessionOnly ?? true}
                            onChange={(e) => updateField('welcomePopupSessionOnly', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-[var(--admin-border-light)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 peer-checked:after:bg-white"></div>
                        </div>
                      </label>
                    </div>

                    {settings.welcomePopupSessionOnly && (
                      <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                          Session Expiry (hours)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={720}
                          value={settings.welcomePopupSessionExpiryHours ?? 24}
                          onChange={(e) => updateField('welcomePopupSessionExpiryHours', parseInt(e.target.value) || 24)}
                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                        <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                          After this many hours, the popup can show again
                        </p>
                      </div>
                    )}
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
                        Visitor must be on site this long before exit popup can trigger
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
                        value={settings.exitPopupDismissDays ?? 3}
                        onChange={(e) => updateField('exitPopupDismissDays', parseInt(e.target.value) || 3)}
                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>

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
                        Wait this long after welcome popup before allowing exit popup
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Success State */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-4">
                <h3 className="font-medium text-[var(--admin-text-primary)]">Success State</h3>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Success Title</label>
                  <input
                    type="text"
                    value={currentSuccessTitle || ''}
                    onChange={(e) => updateField(isWelcome ? 'welcomePopupSuccessTitle' : 'exitPopupSuccessTitle', e.target.value)}
                    placeholder="You're In!"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Success Message</label>
                  <textarea
                    value={currentSuccessMessage || ''}
                    onChange={(e) => updateField(isWelcome ? 'welcomePopupSuccessMessage' : 'exitPopupSuccessMessage', e.target.value)}
                    placeholder="Thanks for joining. We'll be in touch soon."
                    rows={2}
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-4">
                <h3 className="font-medium text-[var(--admin-text-primary)]">Privacy Notice</h3>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                    No Spam Text
                  </label>
                  <input
                    type="text"
                    value={currentNoSpamText || ''}
                    onChange={(e) => updateField(isWelcome ? 'welcomePopupNoSpamText' : 'exitPopupNoSpamText', e.target.value)}
                    placeholder="No spam, ever. Unsubscribe anytime."
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                    Shown below the form to reassure visitors
                  </p>
                </div>
              </div>

              {/* Testimonial Bubble */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#bbdae9]/20 flex items-center justify-center">
                      <Quote className="w-5 h-5 text-[#bbdae9]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--admin-text-primary)]">Testimonial Bubble</h3>
                      <p className="text-xs text-[var(--admin-text-muted)]">Social proof overlay on popup media</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentTestimonialEnabled ?? false}
                      onChange={(e) => updateField(
                        isWelcome ? 'welcomePopupTestimonialEnabled' : 'exitPopupTestimonialEnabled',
                        e.target.checked
                      )}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-[var(--admin-border-light)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#bbdae9]/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#bbdae9] peer-checked:after:bg-white"></div>
                  </label>
                </div>

                {currentTestimonialEnabled && (
                  <div className="space-y-4 pt-4 border-t border-[var(--admin-border-light)]">
                    {/* Device visibility toggles */}
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentTestimonialEnabledDesktop ?? true}
                          onChange={(e) => updateField(
                            isWelcome ? 'welcomePopupTestimonialEnabledDesktop' : 'exitPopupTestimonialEnabledDesktop',
                            e.target.checked
                          )}
                          className="w-4 h-4 rounded border-[var(--admin-border-light)] text-[#bbdae9] focus:ring-[#bbdae9]"
                        />
                        <Monitor className="w-4 h-4 text-[var(--admin-text-muted)]" />
                        <span className="text-sm text-[var(--admin-text-secondary)]">Desktop</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentTestimonialEnabledMobile ?? true}
                          onChange={(e) => updateField(
                            isWelcome ? 'welcomePopupTestimonialEnabledMobile' : 'exitPopupTestimonialEnabledMobile',
                            e.target.checked
                          )}
                          className="w-4 h-4 rounded border-[var(--admin-border-light)] text-[#bbdae9] focus:ring-[#bbdae9]"
                        />
                        <Smartphone className="w-4 h-4 text-[var(--admin-text-muted)]" />
                        <span className="text-sm text-[var(--admin-text-secondary)]">Mobile</span>
                      </label>
                    </div>

                    {/* Avatar */}
                    <MediaPickerButton
                      label="Avatar"
                      value={currentTestimonialAvatarUrl}
                      onChange={(url) => updateField(
                        isWelcome ? 'welcomePopupTestimonialAvatarUrl' : 'exitPopupTestimonialAvatarUrl',
                        url
                      )}
                      helpText="Square profile image (min 64x64)"
                      folder="testimonials"
                    />

                    {/* Quote */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Quote</label>
                      <textarea
                        value={currentTestimonialQuote || ''}
                        onChange={(e) => updateField(
                          isWelcome ? 'welcomePopupTestimonialQuote' : 'exitPopupTestimonialQuote',
                          e.target.value
                        )}
                        placeholder="This changed my life!"
                        rows={2}
                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                      />
                    </div>

                    {/* Author */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Author Name</label>
                      <input
                        type="text"
                        value={currentTestimonialAuthor || ''}
                        onChange={(e) => updateField(
                          isWelcome ? 'welcomePopupTestimonialAuthor' : 'exitPopupTestimonialAuthor',
                          e.target.value
                        )}
                        placeholder="Sarah M."
                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>

                    {/* Star Rating */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Star Rating</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => updateField(
                              isWelcome ? 'welcomePopupTestimonialStars' : 'exitPopupTestimonialStars',
                              star
                            )}
                            className="p-1 transition-colors"
                          >
                            <Star
                              className={cn(
                                'w-6 h-6 transition-colors',
                                star <= (currentTestimonialStars ?? 5)
                                  ? 'fill-[#bbdae9] text-[#bbdae9]'
                                  : 'text-gray-300'
                              )}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-[var(--admin-text-muted)]">
                          {currentTestimonialStars ?? 5} star{(currentTestimonialStars ?? 5) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Success Links */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#bbdae9]/20 flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-[#bbdae9]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--admin-text-primary)]">Success View Links</h3>
                    <p className="text-xs text-[var(--admin-text-muted)]">Navigation links shown after form submission</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Link 1 */}
                  <div className="p-4 bg-[var(--admin-bg)] rounded-xl space-y-3">
                    <p className="text-sm font-medium text-[var(--admin-text-secondary)]">Link 1</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Button Text</label>
                        <input
                          type="text"
                          value={currentSuccessLink1Text || ''}
                          onChange={(e) => updateField(
                            isWelcome ? 'welcomePopupSuccessLink1Text' : 'exitPopupSuccessLink1Text',
                            e.target.value
                          )}
                          placeholder="Shop Now"
                          className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                      </div>
                      <div>
                        <InternalLinkSelector
                          label="URL"
                          value={currentSuccessLink1Url || ''}
                          onChange={(value) => updateField(
                            isWelcome ? 'welcomePopupSuccessLink1Url' : 'exitPopupSuccessLink1Url',
                            value
                          )}
                          placeholder="Select page or enter URL"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Link 2 */}
                  <div className="p-4 bg-[var(--admin-bg)] rounded-xl space-y-3">
                    <p className="text-sm font-medium text-[var(--admin-text-secondary)]">Link 2 (Optional)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Button Text</label>
                        <input
                          type="text"
                          value={currentSuccessLink2Text || ''}
                          onChange={(e) => updateField(
                            isWelcome ? 'welcomePopupSuccessLink2Text' : 'exitPopupSuccessLink2Text',
                            e.target.value
                          )}
                          placeholder="Learn More"
                          className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                      </div>
                      <div>
                        <InternalLinkSelector
                          label="URL"
                          value={currentSuccessLink2Url || ''}
                          onChange={(value) => updateField(
                            isWelcome ? 'welcomePopupSuccessLink2Url' : 'exitPopupSuccessLink2Url',
                            value
                          )}
                          placeholder="Select page or enter URL"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Device Toggle */}
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[var(--admin-text-primary)]">Preview</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewState(previewState === 'form' ? 'success' : 'form')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--admin-border-light)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] transition-colors"
                  >
                    {previewState === 'form' ? 'Show Success' : 'Show Form'}
                  </button>
                  <div className="flex bg-[var(--admin-card)] rounded-lg border border-[var(--admin-border-light)] p-1">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={cn(
                        'p-2 rounded-md transition-colors',
                        previewDevice === 'desktop'
                          ? 'bg-[#bbdae9] text-[#1a1a1a]'
                          : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]'
                      )}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={cn(
                        'p-2 rounded-md transition-colors',
                        previewDevice === 'mobile'
                          ? 'bg-[#bbdae9] text-[#1a1a1a]'
                          : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]'
                      )}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Container */}
              <div className={cn(
                'bg-black/40 rounded-2xl p-4 md:p-8 flex items-center justify-center min-h-[500px] transition-all',
                previewDevice === 'mobile' ? 'max-w-[375px] mx-auto' : ''
              )}>
                {/* Mobile Layout - Stacked */}
                {previewDevice === 'mobile' ? (
                  <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm">
                    {/* Media Header - Full width on mobile */}
                    <div className="relative aspect-video w-full bg-gradient-to-br from-[#f5f0eb] via-white to-[#bbdae9]/30">
                      {hasVideo && currentVideoUrl ? (
                        <video
                          src={currentVideoUrl}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : currentImageUrl ? (
                        <Image
                          src={currentImageUrl}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-300" />
                        </div>
                      )}

                      {/* Testimonial Bubble - Mobile */}
                      {currentTestimonialEnabled && currentTestimonialEnabledMobile && currentTestimonialQuote && (
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                            <div className="flex items-start gap-2.5">
                              {currentTestimonialAvatarUrl ? (
                                <Image
                                  src={currentTestimonialAvatarUrl}
                                  alt={currentTestimonialAuthor || 'Reviewer'}
                                  width={36}
                                  height={36}
                                  className="rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-[#bbdae9]/30 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-medium text-[#1a1a1a]">
                                    {(currentTestimonialAuthor || 'A')[0]}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 mb-0.5">
                                  {[...Array(currentTestimonialStars ?? 5)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-[#bbdae9] text-[#bbdae9]" />
                                  ))}
                                </div>
                                <p className="text-xs text-gray-700 leading-snug line-clamp-2">
                                  &ldquo;{currentTestimonialQuote}&rdquo;
                                </p>
                                {currentTestimonialAuthor && (
                                  <p className="text-[10px] text-gray-500 mt-0.5">{currentTestimonialAuthor}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {previewState === 'success' ? (
                        <div className="text-center py-4">
                          <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-[#bbdae9] rounded-full flex items-center justify-center">
                              <Check className="w-6 h-6 text-[#1a1a1a]" />
                            </div>
                            <h3 className="text-2xl font-normal tracking-tight">{currentSuccessTitle || "You're In!"}</h3>
                          </div>
                          <p className="text-gray-600">
                            {currentSuccessMessage || "Thanks for joining. We'll be in touch soon."}
                          </p>
                          {currentDownloadEnabled && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                              <div className="w-6 h-6 bg-[#bbdae9] rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm text-gray-600">Download complete!</span>
                            </div>
                          )}
                          {/* Success Links - Mobile */}
                          {(currentSuccessLink1Text || currentSuccessLink2Text) && (
                            <div className="mt-6 space-y-2">
                              {currentSuccessLink1Text && (
                                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-full font-medium text-sm">
                                  {currentSuccessLink1Text}
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {currentSuccessLink2Text && (
                                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-gray-200 text-gray-700 rounded-full font-medium text-sm">
                                  {currentSuccessLink2Text}
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <h3 className="text-2xl font-normal mb-3 tracking-tight text-center">
                            {currentTitle || (isWelcome ? 'Join Our Community' : 'Wait! Before You Go...')}
                          </h3>
                          <p className="text-gray-600 mb-6 text-center leading-relaxed text-sm">
                            {currentSubtitle || 'Get 10% off your first order plus exclusive access.'}
                          </p>

                          {currentCtaType !== 'none' && (
                            <div className="space-y-3">
                              {/* Form fields based on CTA type */}
                              {currentCtaType === 'both' ? (
                                <div className="relative">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                                    <div className="flex items-center gap-1 px-2 py-2 text-gray-500">
                                      <Phone className="w-5 h-5" />
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </div>
                                  </div>
                                  <input
                                    type="tel"
                                    placeholder="Enter Phone #"
                                    className="w-full pl-20 pr-5 py-4 text-base bg-[#f5f5f0] border-0 rounded-full placeholder:text-gray-400"
                                    readOnly
                                  />
                                </div>
                              ) : currentCtaType === 'email' ? (
                                <input
                                  type="email"
                                  placeholder="Your email address"
                                  className="w-full px-5 py-4 text-base bg-[#f5f5f0] border-0 rounded-full placeholder:text-gray-400"
                                  readOnly
                                />
                              ) : currentCtaType === 'sms' && (
                                <input
                                  type="tel"
                                  placeholder="Phone number"
                                  className="w-full px-5 py-4 text-base bg-[#f5f5f0] border-0 rounded-full placeholder:text-gray-400"
                                  readOnly
                                />
                              )}

                              <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1a1a1a] text-white rounded-full font-medium text-sm">
                                {currentButtonText || 'Subscribe'}
                              </button>

                              {currentDownloadEnabled && (
                                <div className="flex justify-center">
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#bbdae9]/20 border border-[#bbdae9]/40 rounded-full">
                                    <Download className="w-3.5 h-3.5 text-[#7ab8d4]" />
                                    <span className="text-xs text-gray-600">Download starts on submission</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-gray-500 mt-4 text-center">
                            {currentNoSpamText || 'No spam, ever. Unsubscribe anytime.'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Desktop Layout - Side by Side */
                  <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-3xl flex min-h-[420px]">
                    {/* Media Section - Left side */}
                    <div className="relative w-1/2 bg-gradient-to-br from-[#f5f0eb] via-white to-[#bbdae9]/30">
                      {hasVideo && currentVideoUrl ? (
                        <video
                          src={currentVideoUrl}
                          className="absolute inset-0 w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : currentImageUrl ? (
                        <Image
                          src={currentImageUrl}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-gray-300" />
                        </div>
                      )}

                      {/* Testimonial Bubble - Desktop */}
                      {currentTestimonialEnabled && currentTestimonialEnabledDesktop && currentTestimonialQuote && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3.5 shadow-lg">
                            <div className="flex items-start gap-3">
                              {currentTestimonialAvatarUrl ? (
                                <Image
                                  src={currentTestimonialAvatarUrl}
                                  alt={currentTestimonialAuthor || 'Reviewer'}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#bbdae9]/30 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-medium text-[#1a1a1a]">
                                    {(currentTestimonialAuthor || 'A')[0]}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 mb-1">
                                  {[...Array(currentTestimonialStars ?? 5)].map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-[#bbdae9] text-[#bbdae9]" />
                                  ))}
                                </div>
                                <p className="text-sm text-gray-700 leading-snug">
                                  &ldquo;{currentTestimonialQuote}&rdquo;
                                </p>
                                {currentTestimonialAuthor && (
                                  <p className="text-xs text-gray-500 mt-1">{currentTestimonialAuthor}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Section - Right side */}
                    <div className="w-1/2 p-8 flex flex-col justify-center">
                      {previewState === 'success' ? (
                        <div className="text-center py-4">
                          <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-[#bbdae9] rounded-full flex items-center justify-center">
                              <Check className="w-6 h-6 text-[#1a1a1a]" />
                            </div>
                            <h3 className="text-2xl font-normal tracking-tight">{currentSuccessTitle || "You're In!"}</h3>
                          </div>
                          <p className="text-gray-600">
                            {currentSuccessMessage || "Thanks for joining. We'll be in touch soon."}
                          </p>
                          {currentDownloadEnabled && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                              <div className="w-6 h-6 bg-[#bbdae9] rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm text-gray-600">Download complete!</span>
                            </div>
                          )}
                          {/* Success Links - Desktop */}
                          {(currentSuccessLink1Text || currentSuccessLink2Text) && (
                            <div className="mt-6 space-y-2">
                              {currentSuccessLink1Text && (
                                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-full font-medium text-sm hover:bg-[#bbdae9] hover:text-[#1a1a1a] transition-colors">
                                  {currentSuccessLink1Text}
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {currentSuccessLink2Text && (
                                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-gray-200 text-gray-700 rounded-full font-medium text-sm hover:bg-gray-50 transition-colors">
                                  {currentSuccessLink2Text}
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <h3 className="text-3xl font-normal mb-3 tracking-tight text-center">
                            {currentTitle || (isWelcome ? 'Join Our Community' : 'Wait! Before You Go...')}
                          </h3>
                          <p className="text-gray-600 mb-6 text-center leading-relaxed">
                            {currentSubtitle || 'Get 10% off your first order plus exclusive access.'}
                          </p>

                          {currentCtaType !== 'none' && (
                            <div className="space-y-3">
                              {/* Form fields based on CTA type */}
                              {currentCtaType === 'both' ? (
                                <div className="relative">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                                    <div className="flex items-center gap-1 px-2 py-2 text-gray-500">
                                      <Phone className="w-5 h-5" />
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </div>
                                  </div>
                                  <input
                                    type="tel"
                                    placeholder="Enter Phone #"
                                    className="w-full pl-20 pr-5 py-4 text-base bg-[#f5f5f0] border-0 rounded-full placeholder:text-gray-400"
                                    readOnly
                                  />
                                </div>
                              ) : currentCtaType === 'email' ? (
                                <input
                                  type="email"
                                  placeholder="Your email address"
                                  className="w-full px-5 py-4 text-base bg-[#f5f5f0] border-0 rounded-full placeholder:text-gray-400"
                                  readOnly
                                />
                              ) : currentCtaType === 'sms' && (
                                <input
                                  type="tel"
                                  placeholder="Phone number"
                                  className="w-full px-5 py-4 text-base bg-[#f5f5f0] border-0 rounded-full placeholder:text-gray-400"
                                  readOnly
                                />
                              )}

                              <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1a1a1a] text-white rounded-full font-medium text-sm hover:bg-[#bbdae9] hover:text-[#1a1a1a] transition-colors">
                                {currentButtonText || 'Subscribe'}
                              </button>

                              {currentDownloadEnabled && (
                                <div className="flex justify-center">
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#bbdae9]/20 border border-[#bbdae9]/40 rounded-full">
                                    <Download className="w-3.5 h-3.5 text-[#7ab8d4]" />
                                    <span className="text-xs text-gray-600">Download starts on submission</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-gray-500 mt-4 text-center">
                            {currentNoSpamText || 'No spam, ever. Unsubscribe anytime.'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Info */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-4">
                <div className="flex items-center gap-6 text-sm text-[var(--admin-text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <Timer className="w-4 h-4" />
                    {isWelcome
                      ? `${settings.welcomePopupDelay}s delay`
                      : `${settings.exitPopupMinTimeOnSite}s min time`
                    }
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {isWelcome
                      ? settings.welcomePopupSessionOnly
                        ? `${settings.welcomePopupSessionExpiryHours}h expiry`
                        : `${settings.welcomePopupDismissDays}d cooldown`
                      : `${settings.exitPopupDismissDays}d cooldown`
                    }
                  </span>
                  <span className="flex items-center gap-1.5">
                    {currentCtaType === 'email' && <Mail className="w-4 h-4" />}
                    {currentCtaType === 'sms' && <Phone className="w-4 h-4" />}
                    {currentCtaType === 'both' && <Users className="w-4 h-4" />}
                    {currentCtaType === 'none' && <FileText className="w-4 h-4" />}
                    {CTA_OPTIONS.find(o => o.value === currentCtaType)?.label || 'Email & Phone'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
