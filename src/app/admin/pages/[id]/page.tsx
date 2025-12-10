'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  EyeOff,
  FileText,
  Layout,
  Plus,
  GripVertical,
  Trash2,
  Settings,
  Type,
  Image as ImageIcon,
  Quote,
  Star,
  MessageSquare,
  HelpCircle,
  Instagram,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  PanelRightOpen,
  PanelRightClose,
  ShoppingBag,
  Award,
  Sparkles,
  Columns,
  List,
  Users,
  Gift,
  Zap,
  Video,
  MousePointerClick,
  Grid3X3,
  Megaphone,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PageWidget {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  config?: Record<string, unknown>;
  isVisible: boolean;
  // Homepage widget specific
  isHomepageWidget?: boolean;
  editUrl?: string;
  count?: number;
  activeCount?: number;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  pageType: string;
  content: string | null;
  widgets: string | null;
  heroImageUrl: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  showInNav: boolean;
  navOrder: number;
}

// Widget categories for organization
const WIDGET_CATEGORIES = [
  {
    name: 'Content',
    widgets: [
      { type: 'hero', label: 'Hero Section', icon: ImageIcon, description: 'Full-width hero with image and text overlay' },
      { type: 'text', label: 'Text Block', icon: Type, description: 'Rich text content section' },
      { type: 'image', label: 'Image', icon: ImageIcon, description: 'Single image or gallery grid' },
      { type: 'image_text', label: 'Image + Text', icon: Columns, description: 'Split layout with image and copy' },
      { type: 'video', label: 'Video', icon: Video, description: 'Embedded video player' },
      { type: 'quote', label: 'Quote', icon: Quote, description: 'Testimonial or pull quote' },
    ],
  },
  {
    name: 'Social Proof',
    widgets: [
      { type: 'testimonials', label: 'Testimonials', icon: Star, description: 'Customer testimonial carousel' },
      { type: 'video_testimonials', label: 'Video Reviews', icon: PlayCircle, description: 'Video testimonial grid' },
      { type: 'instagram', label: 'Instagram Feed', icon: Instagram, description: 'Instagram post grid' },
      { type: 'press', label: 'Press & Media', icon: Megaphone, description: 'As seen in logos' },
    ],
  },
  {
    name: 'Product',
    widgets: [
      { type: 'product_grid', label: 'Product Grid', icon: Grid3X3, description: 'Featured products showcase' },
      { type: 'benefits', label: 'Benefits', icon: Sparkles, description: 'Product benefits with icons' },
      { type: 'ingredients', label: 'Ingredients', icon: List, description: 'Ingredient list with info' },
      { type: 'comparison', label: 'Comparison', icon: Columns, description: 'Before/after comparison' },
      { type: 'certifications', label: 'Certifications', icon: Award, description: 'Trust badges and certifications' },
    ],
  },
  {
    name: 'Engagement',
    widgets: [
      { type: 'cta', label: 'Call to Action', icon: MousePointerClick, description: 'Button with background' },
      { type: 'faqs', label: 'FAQs', icon: HelpCircle, description: 'Accordion FAQ section' },
      { type: 'contact_form', label: 'Contact Form', icon: MessageSquare, description: 'Email contact form' },
      { type: 'newsletter', label: 'Newsletter', icon: Gift, description: 'Email signup form' },
      { type: 'marquee', label: 'Marquee Bar', icon: Zap, description: 'Scrolling text banner' },
    ],
  },
];

// Flat list for lookup
const ALL_WIDGETS = WIDGET_CATEGORIES.flatMap((cat) => cat.widgets);

export default function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'content' | 'seo'>('settings');
  const [page, setPage] = useState<PageData>({
    id: '',
    slug: '',
    title: '',
    pageType: 'landing',
    content: '',
    widgets: null,
    heroImageUrl: null,
    heroTitle: null,
    heroSubtitle: null,
    metaTitle: null,
    metaDescription: null,
    isActive: false,
    showInNav: false,
    navOrder: 0,
  });
  const [originalPage, setOriginalPage] = useState<PageData | null>(null);
  const [widgets, setWidgets] = useState<PageWidget[]>([]);
  const [originalWidgets, setOriginalWidgets] = useState<PageWidget[]>([]);
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Content');
  const [isHomepage, setIsHomepage] = useState(false);
  const [homepageWidgets, setHomepageWidgets] = useState<PageWidget[]>([]);

  // Track unsaved changes
  const hasChanges = originalPage && (
    JSON.stringify(page) !== JSON.stringify(originalPage) ||
    JSON.stringify(widgets) !== JSON.stringify(originalWidgets)
  );

  useEffect(() => {
    if (!isNew) {
      fetchPage();
    }
  }, [id, isNew]);

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/pages/${id}`);
      const data = await res.json();
      setPage(data);
      setOriginalPage(data);

      // Check if this is the homepage
      const isHomepageSlug = data.slug === 'home' || data.slug === '';
      setIsHomepage(isHomepageSlug);

      if (isHomepageSlug) {
        // Fetch homepage widgets from dedicated tables
        const homepageRes = await fetch(`/api/admin/pages/${id}/homepage-widgets`);
        const homepageData = await homepageRes.json();
        if (homepageData.widgets) {
          setHomepageWidgets(homepageData.widgets);
        }
      }

      if (data.widgets) {
        try {
          const parsedWidgets = JSON.parse(data.widgets);
          setWidgets(parsedWidgets);
          setOriginalWidgets(parsedWidgets);
        } catch {
          setWidgets([]);
          setOriginalWidgets([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...page,
        widgets: JSON.stringify(widgets),
      };

      if (isNew) {
        const res = await fetch('/api/admin/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        router.push(`/admin/pages/${data.id}`);
      } else {
        await fetch(`/api/admin/pages/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setOriginalPage(page);
        setOriginalWidgets(widgets);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddWidget = (type: string) => {
    const widgetDef = ALL_WIDGETS.find((w) => w.type === type);
    const newWidget: PageWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: widgetDef?.label || '',
      subtitle: '',
      content: '',
      config: {},
      isVisible: true,
    };
    setWidgets([...widgets, newWidget]);
    setExpandedWidget(newWidget.id);
  };

  const handleUpdateWidget = (widgetId: string, updates: Partial<PageWidget>) => {
    setWidgets(widgets.map((w) => (w.id === widgetId ? { ...w, ...updates } : w)));
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (confirm('Delete this widget?')) {
      setWidgets(widgets.filter((w) => w.id !== widgetId));
      if (expandedWidget === widgetId) {
        setExpandedWidget(null);
      }
    }
  };

  const handleDeletePage = async () => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) return;

    try {
      await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
      router.push('/admin/pages');
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  const handleReorderWidgets = (newOrder: PageWidget[]) => {
    setWidgets(newOrder);
  };

  const getWidgetIcon = (type: string) => {
    const widget = ALL_WIDGETS.find((w) => w.type === type);
    return widget?.icon || FileText;
  };

  const getWidgetLabel = (type: string) => {
    const widget = ALL_WIDGETS.find((w) => w.type === type);
    return widget?.label || type;
  };

  const getWidgetDescription = (type: string) => {
    const widget = ALL_WIDGETS.find((w) => w.type === type);
    return widget?.description || '';
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
            href="/admin/pages"
            className="p-2 rounded-lg hover:bg-[var(--admin-input)] transition-colors text-[var(--admin-text-secondary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">
              {isNew ? 'New Page' : page.title || 'Edit Page'}
            </h1>
            {!isNew && page.slug && (
              <p className="text-[var(--admin-text-secondary)]">/{page.slug}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Toggle */}
          <button
            onClick={() => setPage({ ...page, isActive: !page.isActive })}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              page.isActive
                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
            )}
          >
            {page.isActive ? (
              <>
                <Eye className="w-4 h-4" />
                Live
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Draft
              </>
            )}
          </button>

          {/* Preview Link */}
          {!isNew && (
            <a
              href={page.slug === 'home' ? '/' : `/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}

          {/* Save Button - Only show when changes exist */}
          {(hasChanges || isNew) && (
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
                  {isNew ? 'Create Page' : 'Save Changes'}
                </>
              )}
            </button>
          )}
          {!isNew && (
            <button
              onClick={handleDeletePage}
              className="p-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Delete Page"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--admin-input)] rounded-xl p-1 border border-[var(--admin-border)]">
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
            activeTab === 'settings'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <Settings className="w-4 h-4" />
          Page Settings
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
            activeTab === 'content'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <Layout className="w-4 h-4" />
          Page Content
          <span className={cn(
            'px-2 py-0.5 text-xs rounded-full',
            activeTab === 'content' ? 'bg-[var(--admin-bg)]/20 text-[var(--admin-button-text)]' : 'bg-[var(--admin-hover)] text-[var(--admin-text-secondary)]'
          )}>
            {isHomepage ? homepageWidgets.length : widgets.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
            activeTab === 'seo'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <Search className="w-4 h-4" />
          SEO
        </button>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
              <h3 className="font-medium text-[var(--admin-text-primary)]">Page Information</h3>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Page Title</label>
                <input
                  type="text"
                  value={page.title}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                  placeholder="About Us"
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--admin-text-muted)]">/</span>
                  <input
                    type="text"
                    value={page.slug}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      })
                    }
                    placeholder="about-us"
                    className="flex-1 px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Page Type</label>
                <select
                  value={page.pageType}
                  onChange={(e) => setPage({ ...page, pageType: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                >
                  <option value="landing">Landing Page (With Widgets)</option>
                  <option value="content">Content Page (Simple)</option>
                </select>
              </div>
            </div>

            {/* Hero Section */}
            <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
              <h3 className="font-medium text-[var(--admin-text-primary)]">Hero Section</h3>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Hero Title</label>
                <input
                  type="text"
                  value={page.heroTitle || ''}
                  onChange={(e) => setPage({ ...page, heroTitle: e.target.value })}
                  placeholder="Welcome to Our Page"
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Hero Subtitle</label>
                <input
                  type="text"
                  value={page.heroSubtitle || ''}
                  onChange={(e) => setPage({ ...page, heroSubtitle: e.target.value })}
                  placeholder="A brief description..."
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Hero Image URL</label>
                <input
                  type="text"
                  value={page.heroImageUrl || ''}
                  onChange={(e) => setPage({ ...page, heroImageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
              <h3 className="font-medium text-[var(--admin-text-primary)]">Navigation Settings</h3>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={page.showInNav}
                  onChange={(e) => setPage({ ...page, showInNav: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--admin-hover)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] relative"></div>
                <span className="text-sm text-[var(--admin-text-secondary)]">Show in navigation</span>
              </label>

              {page.showInNav && (
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Nav Order</label>
                  <input
                    type="number"
                    value={page.navOrder}
                    onChange={(e) => setPage({ ...page, navOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Publishing Status */}
            <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
              <h3 className="font-medium text-[var(--admin-text-primary)]">Publishing</h3>

              <div className={cn(
                'p-4 rounded-xl border-2 transition-colors',
                page.isActive
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-orange-500/10 border-orange-500/50'
              )}>
                <div className="flex items-center gap-3">
                  {page.isActive ? (
                    <Eye className="w-5 h-5 text-green-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-orange-400" />
                  )}
                  <div>
                    <p className="font-medium text-[var(--admin-text-primary)]">
                      {page.isActive ? 'Published' : 'Draft'}
                    </p>
                    <p className="text-xs text-[var(--admin-text-secondary)]">
                      {page.isActive ? 'Page is visible to visitors' : 'Page is hidden from visitors'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="flex gap-6">
          {/* Page Widgets - Left Side */}
          <div className={`flex-1 transition-all duration-300`}>
            <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
              <div className="p-4 border-b border-[var(--admin-border)] flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[var(--admin-text-primary)]">
                    {isHomepage ? 'Homepage Widgets' : 'Page Widgets'}
                  </h3>
                  <p className="text-sm text-[var(--admin-text-muted)]">
                    {isHomepage
                      ? 'Click a widget to manage its content'
                      : 'Drag to reorder, click to edit'}
                  </p>
                </div>
                {!isHomepage && (
                  <button
                    onClick={() => setLibraryOpen(!libraryOpen)}
                    className="p-2 rounded-lg hover:bg-[var(--admin-input)] transition-colors text-[var(--admin-text-secondary)]"
                    title={libraryOpen ? 'Hide Widget Library' : 'Show Widget Library'}
                  >
                    {libraryOpen ? (
                      <PanelRightClose className="w-5 h-5" />
                    ) : (
                      <PanelRightOpen className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>

              {/* Homepage Widgets - Special Display */}
              {isHomepage && homepageWidgets.length > 0 ? (
                <div className="divide-y divide-[var(--admin-border)]">
                  {homepageWidgets.map((widget, index) => {
                    const Icon = getWidgetIcon(widget.type);
                    return (
                      <Link
                        key={widget.id}
                        href={widget.editUrl || '#'}
                        className="flex items-center gap-4 p-4 hover:bg-[var(--admin-sidebar)] transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--admin-text-muted)] font-mono w-5">
                            {index + 1}
                          </span>
                        </div>

                        <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[var(--primary)]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[var(--admin-text-primary)] group-hover:text-[var(--primary)] transition-colors">
                            {widget.title}
                          </h4>
                          <p className="text-xs text-[var(--admin-text-muted)]">
                            {widget.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {widget.count !== undefined && (
                            <span className={cn(
                              'px-2.5 py-1 text-xs font-medium rounded-full',
                              widget.isVisible
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-[var(--admin-hover)] text-[var(--admin-text-muted)]'
                            )}>
                              {widget.count} items
                            </span>
                          )}
                          <ExternalLink className="w-4 h-4 text-[var(--admin-text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : widgets.length > 0 ? (
                <Reorder.Group
                  axis="y"
                  values={widgets}
                  onReorder={handleReorderWidgets}
                  className="divide-y divide-[var(--admin-border)]"
                >
                  {widgets.map((widget, index) => {
                    const Icon = getWidgetIcon(widget.type);
                    const isExpanded = expandedWidget === widget.id;

                    return (
                      <Reorder.Item
                        key={widget.id}
                        value={widget}
                        className="bg-[var(--admin-input)]"
                      >
                        <div
                          className={cn(
                            'p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing transition-colors',
                            isExpanded ? 'bg-[var(--admin-input)]' : 'hover:bg-[var(--admin-sidebar)]'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)]" />
                            <span className="text-xs text-[var(--admin-text-muted)] font-mono w-5">
                              {index + 1}
                            </span>
                          </div>

                          <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-[var(--primary)]" />
                          </div>

                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => setExpandedWidget(isExpanded ? null : widget.id)}
                          >
                            <h4 className="font-medium text-[var(--admin-text-primary)] truncate">
                              {widget.title || getWidgetLabel(widget.type)}
                            </h4>
                            <p className="text-xs text-[var(--admin-text-muted)]">
                              {getWidgetDescription(widget.type)}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateWidget(widget.id, { isVisible: !widget.isVisible });
                              }}
                              className={cn(
                                'p-2 rounded-lg transition-colors',
                                widget.isVisible
                                  ? 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-input)]'
                                  : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-input)]'
                              )}
                              title={widget.isVisible ? 'Hide' : 'Show'}
                            >
                              {widget.isVisible ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedWidget(isExpanded ? null : widget.id);
                              }}
                              className="p-2 rounded-lg hover:bg-[var(--admin-input)] transition-colors text-[var(--admin-text-secondary)]"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWidget(widget.id);
                              }}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Widget Editor */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-2 bg-[var(--admin-sidebar)] border-t border-[var(--admin-border)]">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                        Title
                                      </label>
                                      <input
                                        value={widget.title || ''}
                                        onChange={(e) =>
                                          handleUpdateWidget(widget.id, { title: e.target.value })
                                        }
                                        placeholder="Widget title"
                                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                        Subtitle
                                      </label>
                                      <input
                                        value={widget.subtitle || ''}
                                        onChange={(e) =>
                                          handleUpdateWidget(widget.id, { subtitle: e.target.value })
                                        }
                                        placeholder="Widget subtitle"
                                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                                      />
                                    </div>
                                  </div>

                                  {(widget.type === 'text' || widget.type === 'quote') && (
                                    <div>
                                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                        Content
                                      </label>
                                      <textarea
                                        value={widget.content || ''}
                                        onChange={(e) =>
                                          handleUpdateWidget(widget.id, { content: e.target.value })
                                        }
                                        placeholder="Enter content..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                                      />
                                    </div>
                                  )}

                                  {(widget.type === 'image' ||
                                    widget.type === 'hero' ||
                                    widget.type === 'image_text') && (
                                    <div>
                                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                        Image URL
                                      </label>
                                      <input
                                        value={(widget.config as Record<string, string>)?.imageUrl || ''}
                                        onChange={(e) =>
                                          handleUpdateWidget(widget.id, {
                                            config: { ...widget.config, imageUrl: e.target.value },
                                          })
                                        }
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                                      />
                                    </div>
                                  )}

                                  {widget.type === 'video' && (
                                    <div>
                                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                        Video URL
                                      </label>
                                      <input
                                        value={(widget.config as Record<string, string>)?.videoUrl || ''}
                                        onChange={(e) =>
                                          handleUpdateWidget(widget.id, {
                                            config: { ...widget.config, videoUrl: e.target.value },
                                          })
                                        }
                                        placeholder="https://vimeo.com/..."
                                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                                      />
                                    </div>
                                  )}

                                  {(widget.type === 'cta' || widget.type === 'newsletter') && (
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                          Button Text
                                        </label>
                                        <input
                                          value={(widget.config as Record<string, string>)?.buttonText || ''}
                                          onChange={(e) =>
                                            handleUpdateWidget(widget.id, {
                                              config: { ...widget.config, buttonText: e.target.value },
                                            })
                                          }
                                          placeholder="Shop Now"
                                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                          Button URL
                                        </label>
                                        <input
                                          value={(widget.config as Record<string, string>)?.buttonUrl || ''}
                                          onChange={(e) =>
                                            handleUpdateWidget(widget.id, {
                                              config: { ...widget.config, buttonUrl: e.target.value },
                                            })
                                          }
                                          placeholder="/products"
                                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {widget.type === 'image_text' && (
                                    <div>
                                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                        Layout
                                      </label>
                                      <select
                                        value={(widget.config as Record<string, string>)?.layout || 'image-left'}
                                        onChange={(e) =>
                                          handleUpdateWidget(widget.id, {
                                            config: { ...widget.config, layout: e.target.value },
                                          })
                                        }
                                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                                      >
                                        <option value="image-left">Image Left</option>
                                        <option value="image-right">Image Right</option>
                                      </select>
                                    </div>
                                  )}

                                  {widget.type === 'marquee' && (
                                    <div>
                                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                        Marquee Text
                                      </label>
                                      <input
                                        value={(widget.config as Record<string, string>)?.text || ''}
                                        onChange={(e) =>
                                          handleUpdateWidget(widget.id, {
                                            config: { ...widget.config, text: e.target.value },
                                          })
                                        }
                                        placeholder="Free shipping on orders $50+ ★"
                                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              ) : isHomepage ? (
                <div className="py-16 text-center">
                  <Layout className="w-16 h-16 mx-auto mb-4 text-[var(--admin-text-muted)]" />
                  <h3 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Loading homepage widgets...</h3>
                  <p className="text-sm text-[var(--admin-text-muted)] mb-4 max-w-xs mx-auto">
                    Homepage widgets are managed in their dedicated sections
                  </p>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Layout className="w-16 h-16 mx-auto mb-4 text-[var(--admin-text-muted)]" />
                  <h3 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">No widgets yet</h3>
                  <p className="text-sm text-[var(--admin-text-muted)] mb-4 max-w-xs mx-auto">
                    Add widgets from the library on the right to build your page
                  </p>
                  {!libraryOpen && (
                    <button
                      onClick={() => setLibraryOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-sm hover:bg-[var(--admin-hover)] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Open Widget Library
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Widget Library - Right Side Panel (not for homepage) */}
          <AnimatePresence>
            {libraryOpen && !isHomepage && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 overflow-hidden"
              >
                <div className="w-80 bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] sticky top-4">
                  <div className="p-4 border-b border-[var(--admin-border)]">
                    <h3 className="font-medium text-[var(--admin-text-primary)]">Widget Library</h3>
                    <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                      Click a widget to add it to your page
                    </p>
                  </div>

                  <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                    {WIDGET_CATEGORIES.map((category) => (
                      <div key={category.name} className="border-b border-[var(--admin-border)] last:border-0">
                        <button
                          onClick={() =>
                            setExpandedCategory(
                              expandedCategory === category.name ? null : category.name
                            )
                          }
                          className="w-full p-3 flex items-center justify-between hover:bg-[var(--admin-input)] transition-colors"
                        >
                          <span className="text-sm font-medium text-[var(--admin-text-primary)]">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--admin-text-muted)]">
                              {category.widgets.length}
                            </span>
                            {expandedCategory === category.name ? (
                              <ChevronUp className="w-4 h-4 text-[var(--admin-text-muted)]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[var(--admin-text-muted)]" />
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedCategory === category.name && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden"
                            >
                              <div className="p-2 space-y-1">
                                {category.widgets.map((widget) => {
                                  const Icon = widget.icon;
                                  return (
                                    <button
                                      key={widget.type}
                                      onClick={() => handleAddWidget(widget.type)}
                                      className="w-full p-3 rounded-lg border border-transparent hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 transition-all text-left group"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--admin-input)] group-hover:bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 transition-colors">
                                          <Icon className="w-4 h-4 text-[var(--admin-text-secondary)] group-hover:text-[var(--primary)]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-[var(--admin-text-primary)]">
                                              {widget.label}
                                            </span>
                                            <Plus className="w-4 h-4 text-[var(--admin-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                          <p className="text-xs text-[var(--admin-text-muted)] mt-0.5 line-clamp-1">
                                            {widget.description}
                                          </p>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-6 space-y-6 max-w-2xl">
          <h3 className="font-medium text-[var(--admin-text-primary)]">Search Engine Optimization</h3>

          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Meta Title</label>
            <input
              type="text"
              value={page.metaTitle || ''}
              onChange={(e) => setPage({ ...page, metaTitle: e.target.value })}
              placeholder={page.title || 'Page title'}
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <p className="text-xs text-[var(--admin-text-muted)] mt-1">
              {(page.metaTitle || page.title || '').length}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Meta Description</label>
            <textarea
              value={page.metaDescription || ''}
              onChange={(e) => setPage({ ...page, metaDescription: e.target.value })}
              placeholder="Brief description for search engines..."
              rows={3}
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
            />
            <p className="text-xs text-[var(--admin-text-muted)] mt-1">
              {(page.metaDescription || '').length}/160 characters
            </p>
          </div>

          {/* SEO Preview */}
          <div className="mt-6 p-4 bg-white rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Search Preview</p>
            <div className="text-blue-600 text-lg hover:underline cursor-pointer">
              {page.metaTitle || page.title || 'Page Title'}
            </div>
            <div className="text-green-700 text-sm">
              archiesremedies.com/{page.slug || 'page-slug'}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {page.metaDescription || 'Page description will appear here...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
