'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  Settings,
  FileText,
  MousePointerClick,
  Eye,
  Smartphone,
  Monitor,
  X,
  Video,
  Mail,
  Phone,
  Download,
  Image as ImageIcon,
  Target,
  Timer,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';

interface CustomPopup {
  id: string;
  name: string;
  title: string | null;
  body: string | null;
  videoUrl: string | null;
  videoThumbnailUrl: string | null;
  imageUrl: string | null;
  ctaType: string;
  ctaButtonText: string | null;
  downloadFileUrl: string | null;
  downloadFileName: string | null;
  targetType: string;
  targetPages: string[];
  targetProductIds: string[];
  triggerType: string;
  triggerDelay: number | null;
  triggerScrollPercent: number | null;
  dismissDays: number | null;
  status: string;
  priority: number | null;
  viewCount: number | null;
  conversionCount: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
}

type TabType = 'settings' | 'content' | 'cta';

const CTA_TYPES = [
  { value: 'email', label: 'Email Capture', icon: Mail, description: 'Collect email addresses' },
  { value: 'sms', label: 'SMS Capture', icon: Phone, description: 'Collect phone numbers' },
  { value: 'download', label: 'Digital Download', icon: Download, description: 'Offer a downloadable file' },
  { value: 'none', label: 'No CTA', icon: Eye, description: 'Just show content/video' },
];

const TARGET_TYPES = [
  { value: 'all', label: 'All Pages', description: 'Show on every page' },
  { value: 'specific', label: 'Specific Pages', description: 'Choose specific pages' },
  { value: 'product', label: 'Product Pages', description: 'Show on product pages' },
];

const TRIGGER_TYPES = [
  { value: 'timer', label: 'Timer', description: 'Show after delay' },
  { value: 'exit', label: 'Exit Intent', description: 'Show when leaving' },
  { value: 'scroll', label: 'Scroll Depth', description: 'Show after scrolling' },
];

export default function PopupEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === 'new';

  const [popup, setPopup] = useState<CustomPopup | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [products, setProducts] = useState<Product[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<CustomPopup>>({
    name: '',
    title: '',
    body: '',
    videoUrl: '',
    videoThumbnailUrl: '',
    imageUrl: '',
    ctaType: 'email',
    ctaButtonText: 'Subscribe',
    downloadFileUrl: '',
    downloadFileName: '',
    targetType: 'all',
    targetPages: [],
    targetProductIds: [],
    triggerType: 'timer',
    triggerDelay: 5,
    triggerScrollPercent: 50,
    dismissDays: 7,
    status: 'draft',
    priority: 0,
  });

  useEffect(() => {
    if (!isNew) {
      fetchPopup();
    }
    fetchProducts();
  }, [resolvedParams.id]);

  const fetchPopup = async () => {
    try {
      const res = await fetch(`/api/admin/custom-popups/${resolvedParams.id}`);
      if (!res.ok) {
        router.push('/admin/popups');
        return;
      }
      const data = await res.json();
      setPopup(data);
      setFormData({
        name: data.name || '',
        title: data.title || '',
        body: data.body || '',
        videoUrl: data.videoUrl || '',
        videoThumbnailUrl: data.videoThumbnailUrl || '',
        imageUrl: data.imageUrl || '',
        ctaType: data.ctaType || 'email',
        ctaButtonText: data.ctaButtonText || 'Subscribe',
        downloadFileUrl: data.downloadFileUrl || '',
        downloadFileName: data.downloadFileName || '',
        targetType: data.targetType || 'all',
        targetPages: data.targetPages || [],
        targetProductIds: data.targetProductIds || [],
        triggerType: data.triggerType || 'timer',
        triggerDelay: data.triggerDelay ?? 5,
        triggerScrollPercent: data.triggerScrollPercent ?? 50,
        dismissDays: data.dismissDays ?? 7,
        status: data.status || 'draft',
        priority: data.priority ?? 0,
      });
    } catch (error) {
      console.error('Failed to fetch popup:', error);
      router.push('/admin/popups');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleInputChange = (field: keyof CustomPopup, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert('Please enter a popup name');
      return;
    }

    setSaving(true);
    try {
      const url = isNew
        ? '/api/admin/custom-popups'
        : `/api/admin/custom-popups/${resolvedParams.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const saved = await res.json();
        if (isNew) {
          router.push(`/admin/popups/${saved.id}`);
        } else {
          setPopup(saved);
          setHasChanges(false);
        }
      }
    } catch (error) {
      console.error('Failed to save popup:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!popup) return;
    if (!confirm('Are you sure you want to delete this popup?')) return;

    setDeleting(true);
    try {
      await fetch(`/api/admin/custom-popups/${popup.id}`, { method: 'DELETE' });
      router.push('/admin/popups');
    } catch (error) {
      console.error('Failed to delete popup:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/popups"
            className="p-2 rounded-lg hover:bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-medium text-[var(--admin-text-primary)]">
              {isNew ? 'New Custom Popup' : formData.name || 'Edit Popup'}
            </h1>
            <p className="text-sm text-[var(--admin-text-muted)]">
              {isNew ? 'Create a targeted popup' : `ID: ${resolvedParams.id}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-lg font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium transition-colors',
              saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--primary-dark)]'
            )}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isNew ? 'Create Popup' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--admin-border-light)]">
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'settings'
              ? 'text-[var(--primary)] border-[var(--primary)]'
              : 'text-[var(--admin-text-secondary)] border-transparent hover:text-[var(--admin-text-primary)]'
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'content'
              ? 'text-[var(--primary)] border-[var(--primary)]'
              : 'text-[var(--admin-text-secondary)] border-transparent hover:text-[var(--admin-text-primary)]'
          )}
        >
          <FileText className="w-4 h-4" />
          Content
        </button>
        <button
          onClick={() => setActiveTab('cta')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'cta'
              ? 'text-[var(--primary)] border-[var(--primary)]'
              : 'text-[var(--admin-text-secondary)] border-transparent hover:text-[var(--admin-text-primary)]'
          )}
        >
          <MousePointerClick className="w-4 h-4" />
          Call to Action
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form Panel */}
        <div className="space-y-6">
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-5">
                <h3 className="font-medium text-[var(--admin-text-primary)]">Basic Info</h3>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                    Popup Name (Internal)
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Summer Sale Popup"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                    Status
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleInputChange('status', 'draft')}
                      className={cn(
                        'flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                        formData.status === 'draft'
                          ? 'bg-gray-500/20 text-[var(--admin-text-primary)] border border-gray-500'
                          : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] border border-[var(--admin-border-light)]'
                      )}
                    >
                      Draft
                    </button>
                    <button
                      onClick={() => handleInputChange('status', 'live')}
                      className={cn(
                        'flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                        formData.status === 'live'
                          ? 'bg-green-500/20 text-green-400 border border-green-500'
                          : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] border border-[var(--admin-border-light)]'
                      )}
                    >
                      Live
                    </button>
                  </div>
                </div>
              </div>

              {/* Targeting */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-5">
                <h3 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[var(--primary)]" />
                  Targeting
                </h3>

                <div className="space-y-3">
                  {TARGET_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange('targetType', type.value)}
                      className={cn(
                        'w-full p-4 rounded-xl text-left transition-colors',
                        formData.targetType === type.value
                          ? 'bg-[var(--primary)]/10 border border-[var(--primary)]'
                          : 'bg-[var(--admin-input)] border border-[var(--admin-border-light)] hover:border-[var(--admin-divider)]'
                      )}
                    >
                      <p className="font-medium text-[var(--admin-text-primary)]">{type.label}</p>
                      <p className="text-sm text-[var(--admin-text-muted)]">{type.description}</p>
                    </button>
                  ))}
                </div>

                {formData.targetType === 'product' && products.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Select Products
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {products.map((product) => (
                        <label
                          key={product.id}
                          className="flex items-center gap-3 p-3 bg-[var(--admin-input)] rounded-lg cursor-pointer hover:bg-[var(--admin-hover)]"
                        >
                          <input
                            type="checkbox"
                            checked={formData.targetProductIds?.includes(product.id) || false}
                            onChange={(e) => {
                              const current = formData.targetProductIds || [];
                              const updated = e.target.checked
                                ? [...current, product.id]
                                : current.filter((id) => id !== product.id);
                              handleInputChange('targetProductIds', updated);
                            }}
                            className="w-4 h-4 rounded border-[var(--admin-border-light)] text-[var(--primary)] focus:ring-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--admin-text-primary)]">{product.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Trigger */}
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-5">
                <h3 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2">
                  <Timer className="w-4 h-4 text-[var(--primary)]" />
                  Trigger
                </h3>

                <div className="space-y-3">
                  {TRIGGER_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange('triggerType', type.value)}
                      className={cn(
                        'w-full p-4 rounded-xl text-left transition-colors',
                        formData.triggerType === type.value
                          ? 'bg-[var(--primary)]/10 border border-[var(--primary)]'
                          : 'bg-[var(--admin-input)] border border-[var(--admin-border-light)] hover:border-[var(--admin-divider)]'
                      )}
                    >
                      <p className="font-medium text-[var(--admin-text-primary)]">{type.label}</p>
                      <p className="text-sm text-[var(--admin-text-muted)]">{type.description}</p>
                    </button>
                  ))}
                </div>

                {formData.triggerType === 'timer' && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Delay (seconds)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={formData.triggerDelay || 5}
                      onChange={(e) => handleInputChange('triggerDelay', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                )}

                {formData.triggerType === 'scroll' && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Scroll Depth (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.triggerScrollPercent || 50}
                      onChange={(e) => handleInputChange('triggerScrollPercent', parseInt(e.target.value) || 50)}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Days before showing again
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={formData.dismissDays || 7}
                    onChange={(e) => handleInputChange('dismissDays', parseInt(e.target.value) || 7)}
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-5">
                <h3 className="font-medium text-[var(--admin-text-primary)]">Popup Content</h3>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Catchy headline..."
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Body Text</label>
                  <textarea
                    value={formData.body || ''}
                    onChange={(e) => handleInputChange('body', e.target.value)}
                    placeholder="Supporting text..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] resize-none"
                  />
                </div>
              </div>

              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-5">
                <h3 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2">
                  <Video className="w-4 h-4 text-[var(--primary)]" />
                  Video (Optional)
                </h3>

                <MediaPickerButton
                  label="Video"
                  value={formData.videoUrl || null}
                  onChange={(url) => handleInputChange('videoUrl', url || null)}
                  helpText="Upload MP4/WebM or paste a YouTube/Vimeo URL"
                  folder="popups"
                  acceptVideo={true}
                />
              </div>

              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-5">
                <h3 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[var(--primary)]" />
                  Image (Optional)
                </h3>

                <MediaPickerButton
                  label="Popup Image"
                  value={formData.imageUrl || null}
                  onChange={(url) => handleInputChange('imageUrl', url || null)}
                  helpText="Background or featured image for the popup"
                  folder="popups"
                />
              </div>
            </div>
          )}

          {activeTab === 'cta' && (
            <div className="space-y-6">
              <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-5">
                <h3 className="font-medium text-[var(--admin-text-primary)]">Call to Action Type</h3>

                <div className="grid grid-cols-2 gap-3">
                  {CTA_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => handleInputChange('ctaType', type.value)}
                        className={cn(
                          'p-4 rounded-xl text-left transition-colors',
                          formData.ctaType === type.value
                            ? 'bg-[var(--primary)]/10 border border-[var(--primary)]'
                            : 'bg-[var(--admin-input)] border border-[var(--admin-border-light)] hover:border-[var(--admin-divider)]'
                        )}
                      >
                        <Icon className={cn(
                          'w-5 h-5 mb-2',
                          formData.ctaType === type.value ? 'text-[var(--primary)]' : 'text-[var(--admin-text-muted)]'
                        )} />
                        <p className="font-medium text-sm text-[var(--admin-text-primary)]">{type.label}</p>
                        <p className="text-xs text-[var(--admin-text-muted)]">{type.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.ctaType !== 'none' && (
                <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 space-y-5">
                  <h3 className="font-medium text-[var(--admin-text-primary)]">CTA Settings</h3>

                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.ctaButtonText || ''}
                      onChange={(e) => handleInputChange('ctaButtonText', e.target.value)}
                      placeholder="Subscribe"
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>

                  {formData.ctaType === 'download' && (
                    <>
                      <MediaPickerButton
                        label="Download File"
                        value={formData.downloadFileUrl || null}
                        onChange={(url) => handleInputChange('downloadFileUrl', url || null)}
                        helpText="File users will download (PDF, image, etc.)"
                        folder="downloads"
                      />
                      <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                          File Name (Display)
                        </label>
                        <input
                          type="text"
                          value={formData.downloadFileName || ''}
                          onChange={(e) => handleInputChange('downloadFileName', e.target.value)}
                          placeholder="e.g., Free Recipe Guide.pdf"
                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)]"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-[var(--admin-text-primary)]">Preview</h2>
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

          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6 sticky top-6">
            <div className={cn(
              'mx-auto transition-all duration-300',
              previewDevice === 'desktop' ? 'max-w-md' : 'max-w-xs'
            )}>
              {/* Popup Preview */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
                {/* Video/Image */}
                {(formData.videoUrl || formData.imageUrl) && (
                  <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                    {formData.videoUrl ? (
                      <div className="text-center">
                        <Video className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Video Preview</p>
                      </div>
                    ) : formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Popup preview"
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                )}

                {/* Content */}
                <div className="p-6 text-center">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {formData.title || 'Your Title Here'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {formData.body || 'Your popup body text will appear here.'}
                  </p>

                  {/* CTA Preview */}
                  {formData.ctaType === 'email' && (
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400"
                        disabled
                      />
                      <button className="w-full px-4 py-3 bg-[var(--primary)] text-gray-900 rounded-xl font-medium">
                        {formData.ctaButtonText || 'Subscribe'}
                      </button>
                    </div>
                  )}

                  {formData.ctaType === 'sms' && (
                    <div className="space-y-3">
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400"
                        disabled
                      />
                      <button className="w-full px-4 py-3 bg-[var(--primary)] text-gray-900 rounded-xl font-medium">
                        {formData.ctaButtonText || 'Subscribe'}
                      </button>
                    </div>
                  )}

                  {formData.ctaType === 'download' && (
                    <button className="w-full px-4 py-3 bg-[var(--primary)] text-gray-900 rounded-xl font-medium flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      {formData.ctaButtonText || 'Download Now'}
                    </button>
                  )}

                  {formData.ctaType === 'none' && (
                    <p className="text-xs text-gray-400">No call to action</p>
                  )}
                </div>

                {/* Close button */}
                <button className="absolute top-3 right-3 w-8 h-8 bg-black/10 rounded-full flex items-center justify-center text-gray-500 hover:bg-black/20 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status */}
              <div className={cn(
                'mt-4 text-center text-sm font-medium',
                formData.status === 'live' ? 'text-green-400' : 'text-[var(--admin-text-muted)]'
              )}>
                {formData.status === 'live' ? 'Live - Visible to visitors' : 'Draft - Not visible'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
