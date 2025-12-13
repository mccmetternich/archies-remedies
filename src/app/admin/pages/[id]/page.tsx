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
  ChevronDown,
  ChevronUp,
  Check,
  Search,
  ExternalLink,
  Monitor,
  Smartphone,
  LayoutGrid,
  Columns,
  PanelLeftClose,
  LayoutPanelLeft,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';
import {
  WIDGET_CATEGORIES as CENTRALIZED_CATEGORIES,
  WIDGET_TYPES,
  getWidgetByType,
  getWidgetDisplayName,
  getDefaultConfig,
} from '@/lib/widget-library';
import { DevicePreviewToggle, type DeviceType } from '@/components/admin/widget-editor/device-preview';
import { HeroCarouselConfig } from '@/components/admin/widget-configs/hero-carousel-config';

interface PageWidget {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  config?: Record<string, unknown>;
  isVisible: boolean;
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

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  rating: number | null;
  reviewCount: number | null;
}

interface HeroSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  bodyText: string | null;
  productId: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  secondaryButtonText: string | null;
  secondaryButtonUrl: string | null;
  secondaryButtonType: string;
  secondaryAnchorTarget: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  videoUrl: string | null;
  mobileVideoUrl: string | null;
  testimonialText: string | null;
  testimonialAuthor: string | null;
  testimonialAvatarUrl: string | null;
  testimonialVerifiedText: string | null;
  testimonialShowCheckmark: boolean;
  ratingOverride: number | null;
  reviewCountOverride: number | null;
  isActive: boolean;
  showOnDesktop: boolean;
  showOnMobile: boolean;
  sortOrder: number;
  layout: string | null;
  textColor: string | null;
}

// Create compatible format from centralized library
const WIDGET_CATEGORIES = CENTRALIZED_CATEGORIES.map((cat) => ({
  name: cat.name,
  widgets: WIDGET_TYPES.filter((w) => w.category === cat.name).map((w) => ({
    type: w.type,
    label: w.name,
    icon: w.icon,
    description: w.description,
  })),
})).filter((cat) => cat.widgets.length > 0);

const ALL_WIDGETS = WIDGET_CATEGORIES.flatMap((cat) => cat.widgets);

// Get readable page title
function getPageDisplayName(slug: string, title: string): string {
  if (slug === 'home' || slug === '') return 'Homepage';
  return title || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Hero');
  const [isHomepage, setIsHomepage] = useState(false);
  const [homepageWidgets, setHomepageWidgets] = useState<PageWidget[]>([]);

  // Device preview state
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');

  // Settings panel collapsed state
  const [settingsCollapsed, setSettingsCollapsed] = useState(true);

  // Homepage data state
  const [products, setProducts] = useState<Product[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [originalHeroSlides, setOriginalHeroSlides] = useState<HeroSlide[]>([]);
  const [heroSlidesLoading, setHeroSlidesLoading] = useState(false);

  // Track unsaved changes
  const hasChanges = originalPage && (
    JSON.stringify(page) !== JSON.stringify(originalPage) ||
    JSON.stringify(widgets) !== JSON.stringify(originalWidgets) ||
    JSON.stringify(heroSlides) !== JSON.stringify(originalHeroSlides)
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

      const isHomepageSlug = data.slug === 'home' || data.slug === '';
      setIsHomepage(isHomepageSlug);

      if (isHomepageSlug) {
        const homepageRes = await fetch(`/api/admin/pages/${id}/homepage-widgets`);
        const homepageData = await homepageRes.json();
        if (homepageData.widgets) {
          setHomepageWidgets(homepageData.widgets);
        }
        fetchProducts();
        fetchHeroSlides();
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

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchHeroSlides = async () => {
    setHeroSlidesLoading(true);
    try {
      const res = await fetch('/api/admin/hero-slides');
      const data = await res.json();
      setHeroSlides(data);
      setOriginalHeroSlides(data);
    } catch (error) {
      console.error('Failed to fetch hero slides:', error);
    } finally {
      setHeroSlidesLoading(false);
    }
  };

  // Update hero slides locally (no API call - saves on main Save button)
  const handleUpdateHeroSlides = (updatedSlides: HeroSlide[]) => {
    setHeroSlides(updatedSlides);
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
        // Save page data
        await fetch(`/api/admin/pages/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // If homepage, also save hero slides
        if (isHomepage && heroSlides.length > 0) {
          await fetch('/api/admin/hero-slides', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slides: heroSlides }),
          });
          setOriginalHeroSlides(heroSlides);
        }

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
      config: getDefaultConfig(type),
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

  const pageDisplayName = getPageDisplayName(page.slug, page.title);
  const activeWidgets = isHomepage ? homepageWidgets : widgets;

  return (
    <div className="min-h-screen">
      {/* Header - Clean breadcrumb with page title */}
      <div className="sticky top-0 z-40 bg-[var(--admin-bg)] border-b border-[var(--admin-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/pages"
              className="p-2 rounded-lg hover:bg-[var(--admin-input)] transition-colors text-[var(--admin-text-secondary)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              {/* Readable Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
                <span>Admin</span>
                <span>/</span>
                <span>Pages</span>
                <span>/</span>
                <span className="text-[var(--admin-text-primary)] font-medium">{pageDisplayName}</span>
              </div>
              {!isNew && page.slug && page.slug !== 'home' && (
                <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">/{page.slug}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
              page.isActive
                ? 'bg-green-500/10 text-green-400'
                : 'bg-amber-500/10 text-amber-400'
            )}>
              {page.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {page.isActive ? 'Live' : 'Draft'}
            </div>

            {/* Preview Link */}
            {!isNew && (
              <a
                href={page.slug === 'home' ? '/' : `/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
                title="Preview page"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Save Button */}
            {(hasChanges || isNew) && (
              <button
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all text-sm',
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
                    {isNew ? 'Create Page' : 'Save'}
                  </>
                )}
              </button>
            )}

            {!isNew && (
              <button
                onClick={handleDeletePage}
                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Delete Page"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="flex">
        {/* Left Panel - Page Settings (Collapsible) */}
        <div className={cn(
          'border-r border-[var(--admin-border)] bg-[var(--admin-sidebar)] transition-all duration-300 flex-shrink-0',
          settingsCollapsed ? 'w-12' : 'w-80'
        )}>
          <div className="sticky top-[73px] max-h-[calc(100vh-73px)] overflow-y-auto">
            {/* Collapse Toggle */}
            <button
              onClick={() => setSettingsCollapsed(!settingsCollapsed)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-4 border-b border-[var(--admin-border)] hover:bg-[var(--admin-hover)] transition-colors',
                settingsCollapsed && 'justify-center'
              )}
            >
              {settingsCollapsed ? (
                <LayoutPanelLeft className="w-5 h-5 text-[var(--admin-text-muted)]" />
              ) : (
                <>
                  <PanelLeftClose className="w-5 h-5 text-[var(--admin-text-muted)]" />
                  <span className="font-medium text-[var(--admin-text-primary)]">Page Settings</span>
                </>
              )}
            </button>

            {!settingsCollapsed && (
              <div className="p-4 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5 uppercase tracking-wide">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={page.title}
                      onChange={(e) => setPage({ ...page, title: e.target.value })}
                      placeholder="About Us"
                      className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5 uppercase tracking-wide">
                      URL Slug
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--admin-text-muted)] text-sm">/</span>
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
                        disabled={page.slug === 'home'}
                        className="flex-1 px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="pt-4 border-t border-[var(--admin-border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--admin-text-primary)]">Page Status</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">
                        {page.isActive ? 'Visible to visitors' : 'Hidden from visitors'}
                      </p>
                    </div>
                    <button
                      onClick={() => setPage({ ...page, isActive: !page.isActive })}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      style={{
                        backgroundColor: page.isActive ? '#22c55e' : '#374151'
                      }}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          page.isActive ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Navigation Settings */}
                <div className="pt-4 border-t border-[var(--admin-border)]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--admin-text-primary)]">Show in Nav</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">
                        Display in site navigation
                      </p>
                    </div>
                    <button
                      onClick={() => setPage({ ...page, showInNav: !page.showInNav })}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      style={{
                        backgroundColor: page.showInNav ? '#22c55e' : '#374151'
                      }}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          page.showInNav ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>

                  {page.showInNav && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                        Nav Order
                      </label>
                      <input
                        type="number"
                        value={page.navOrder}
                        onChange={(e) => setPage({ ...page, navOrder: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  )}
                </div>

                {/* SEO */}
                <div className="pt-4 border-t border-[var(--admin-border)]">
                  <h4 className="text-xs font-medium text-[var(--admin-text-muted)] mb-3 uppercase tracking-wide">
                    SEO
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Meta Title</label>
                      <input
                        type="text"
                        value={page.metaTitle || ''}
                        onChange={(e) => setPage({ ...page, metaTitle: e.target.value })}
                        placeholder={page.title || 'Page title'}
                        className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Meta Description</label>
                      <textarea
                        value={page.metaDescription || ''}
                        onChange={(e) => setPage({ ...page, metaDescription: e.target.value })}
                        placeholder="Brief description for search engines..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center - Widget List */}
        <div className="flex-1 min-w-0">
          <div className="p-6">
            {/* Widget List Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                  Page Content
                </h2>
                <span className="px-2 py-0.5 text-xs font-medium bg-[var(--admin-hover)] text-[var(--admin-text-muted)] rounded-full">
                  {activeWidgets.length} widgets
                </span>
              </div>
              <DevicePreviewToggle device={previewDevice} onChange={setPreviewDevice} />
            </div>

            {/* Widget List */}
            <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
              {isHomepage && homepageWidgets.length > 0 ? (
                <div className="divide-y divide-[var(--admin-border)]">
                  {homepageWidgets.map((widget, index) => {
                    const Icon = getWidgetIcon(widget.type);
                    const isExpanded = expandedWidget === widget.id;
                    const isHeroCarousel = widget.type === 'hero_carousel';

                    return (
                      <div key={widget.id}>
                        <div
                          className={cn(
                            'flex items-center gap-4 p-4 transition-colors cursor-pointer',
                            isExpanded ? 'bg-[var(--admin-sidebar)]' : 'hover:bg-[var(--admin-sidebar)]'
                          )}
                          onClick={() => {
                            if (isHeroCarousel) {
                              setExpandedWidget(isExpanded ? null : widget.id);
                            }
                          }}
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
                            <h4 className="font-medium text-[var(--admin-text-primary)]">
                              {widget.title}
                            </h4>
                            <p className="text-xs text-[var(--admin-text-muted)]">
                              {widget.subtitle}
                            </p>
                          </div>

                          {/* Desktop/Mobile visibility toggles */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]"
                              title="Toggle desktop visibility"
                            >
                              <Monitor className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]"
                              title="Toggle mobile visibility"
                            >
                              <Smartphone className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]"
                              title={widget.isVisible ? 'Hide widget' : 'Show widget'}
                            >
                              {widget.isVisible !== false ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {widget.count !== undefined && (
                              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--admin-hover)] text-[var(--admin-text-muted)]">
                                {widget.count} items
                              </span>
                            )}
                            {isHeroCarousel ? (
                              <button className="p-2 rounded-lg hover:bg-[var(--admin-input)] transition-colors text-[var(--admin-text-secondary)]">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            ) : (
                              <Link
                                href={widget.editUrl || '#'}
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 rounded-lg hover:bg-[var(--admin-input)] transition-colors text-[var(--admin-text-muted)] hover:text-[var(--primary)]"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Inline Hero Carousel Editor */}
                        <AnimatePresence>
                          {isExpanded && isHeroCarousel && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
                                {heroSlidesLoading ? (
                                  <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-[var(--admin-text-muted)]" />
                                  </div>
                                ) : (
                                  <HeroCarouselConfig
                                    slides={heroSlides}
                                    products={products}
                                    onSlidesChange={handleUpdateHeroSlides}
                                    previewDevice={previewDevice}
                                  />
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
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
                            isExpanded ? 'bg-[var(--admin-sidebar)]' : 'hover:bg-[var(--admin-sidebar)]'
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
                            {/* Desktop visibility */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cfg = (widget.config || {}) as Record<string, unknown>;
                                handleUpdateWidget(widget.id, {
                                  config: { ...cfg, showOnDesktop: cfg.showOnDesktop !== false ? false : true }
                                });
                              }}
                              className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                (widget.config as Record<string, unknown>)?.showOnDesktop !== false
                                  ? 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]'
                                  : 'text-amber-500 bg-amber-500/10'
                              )}
                              title="Toggle desktop visibility"
                            >
                              <Monitor className="w-4 h-4" />
                            </button>
                            {/* Mobile visibility */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cfg = (widget.config || {}) as Record<string, unknown>;
                                handleUpdateWidget(widget.id, {
                                  config: { ...cfg, showOnMobile: cfg.showOnMobile !== false ? false : true }
                                });
                              }}
                              className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                (widget.config as Record<string, unknown>)?.showOnMobile !== false
                                  ? 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]'
                                  : 'text-amber-500 bg-amber-500/10'
                              )}
                              title="Toggle mobile visibility"
                            >
                              <Smartphone className="w-4 h-4" />
                            </button>
                            {/* Widget visibility */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateWidget(widget.id, { isVisible: !widget.isVisible });
                              }}
                              className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                widget.isVisible
                                  ? 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]'
                                  : 'text-amber-500 bg-amber-500/10'
                              )}
                              title={widget.isVisible ? 'Hide' : 'Show'}
                            >
                              {widget.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedWidget(isExpanded ? null : widget.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-[var(--admin-hover)] transition-colors text-[var(--admin-text-secondary)]"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWidget(widget.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
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

                                  {(widget.type === 'image' || widget.type === 'hero' || widget.type === 'image_text') && (
                                    <MediaPickerButton
                                      label="Widget Image"
                                      value={(widget.config as Record<string, string>)?.imageUrl || null}
                                      onChange={(url) =>
                                        handleUpdateWidget(widget.id, {
                                          config: { ...widget.config, imageUrl: url || '' },
                                        })
                                      }
                                      helpText="Image for this widget"
                                      folder="widgets"
                                    />
                                  )}

                                  {widget.type === 'video' && (
                                    <MediaPickerButton
                                      label="Video"
                                      value={(widget.config as Record<string, string>)?.videoUrl || null}
                                      onChange={(url) =>
                                        handleUpdateWidget(widget.id, {
                                          config: { ...widget.config, videoUrl: url || '' },
                                        })
                                      }
                                      helpText="Upload MP4/WebM or paste a Vimeo/YouTube URL"
                                      folder="widgets"
                                      acceptVideo={true}
                                    />
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
                                    <div className="space-y-4">
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
                                      <div className="grid grid-cols-3 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                            Speed
                                          </label>
                                          <select
                                            value={(widget.config as Record<string, string>)?.speed || 'slow'}
                                            onChange={(e) =>
                                              handleUpdateWidget(widget.id, {
                                                config: { ...widget.config, speed: e.target.value },
                                              })
                                            }
                                            className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)]"
                                          >
                                            <option value="slow">Slow</option>
                                            <option value="normal">Normal</option>
                                            <option value="fast">Fast</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                            Size
                                          </label>
                                          <select
                                            value={(widget.config as Record<string, string>)?.size || 'xl'}
                                            onChange={(e) =>
                                              handleUpdateWidget(widget.id, {
                                                config: { ...widget.config, size: e.target.value },
                                              })
                                            }
                                            className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)]"
                                          >
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                            <option value="xl">XL</option>
                                            <option value="xxl">XXL</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                            Style
                                          </label>
                                          <select
                                            value={(widget.config as Record<string, string>)?.style || 'dark'}
                                            onChange={(e) =>
                                              handleUpdateWidget(widget.id, {
                                                config: { ...widget.config, style: e.target.value },
                                              })
                                            }
                                            className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)]"
                                          >
                                            <option value="dark">Dark</option>
                                            <option value="light">Light</option>
                                            <option value="baby-blue">Baby Blue</option>
                                          </select>
                                        </div>
                                      </div>
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
              ) : (
                <div className="py-16 text-center">
                  <Layout className="w-16 h-16 mx-auto mb-4 text-[var(--admin-text-muted)]" />
                  <h3 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">
                    {isHomepage ? 'Loading homepage widgets...' : 'No widgets yet'}
                  </h3>
                  <p className="text-sm text-[var(--admin-text-muted)] mb-4 max-w-xs mx-auto">
                    {isHomepage
                      ? 'Homepage widgets are managed in their dedicated sections'
                      : 'Add widgets from the library on the right to build your page'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Widget Library (Always Visible) */}
        <div className="w-72 border-l border-[var(--admin-border)] bg-[var(--admin-sidebar)] flex-shrink-0">
          <div className="sticky top-[73px] max-h-[calc(100vh-73px)] overflow-y-auto">
            <div className="p-4 border-b border-[var(--admin-border)]">
              <h3 className="font-medium text-[var(--admin-text-primary)]">Widget Library</h3>
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                Click to add widgets to your page
              </p>
            </div>

            <div>
              {WIDGET_CATEGORIES.map((category) => (
                <div key={category.name} className="border-b border-[var(--admin-border)] last:border-0">
                  <button
                    onClick={() =>
                      setExpandedCategory(
                        expandedCategory === category.name ? null : category.name
                      )
                    }
                    className="w-full p-3 flex items-center justify-between hover:bg-[var(--admin-hover)] transition-colors"
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
                                disabled={isHomepage}
                                className={cn(
                                  'w-full p-3 rounded-lg border border-transparent transition-all text-left group',
                                  isHomepage
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5'
                                )}
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
                                      {!isHomepage && (
                                        <Plus className="w-4 h-4 text-[var(--admin-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                      )}
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

            {isHomepage && (
              <div className="p-4 border-t border-[var(--admin-border)] bg-amber-500/5">
                <p className="text-xs text-amber-600">
                  Homepage widgets are managed globally. Click on a widget above to edit its content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
