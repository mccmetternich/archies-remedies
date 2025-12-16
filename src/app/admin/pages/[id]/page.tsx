'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Reorder, AnimatePresence, useDragControls } from 'framer-motion';
import {
  Loader2,
  Eye,
  EyeOff,
  FileText,
  Layout,
  Plus,
  GripVertical,
  Trash2,
  Monitor,
  Smartphone,
  PanelLeftClose,
  LayoutPanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  WIDGET_CATEGORIES as CENTRALIZED_CATEGORIES,
  WIDGET_TYPES,
  getDefaultConfig,
} from '@/lib/widget-library';
import { DevicePreviewToggle, type DeviceType } from '@/components/admin/widget-editor/device-preview';
import { HeroCarouselConfig } from '@/components/admin/widget-configs/hero-carousel-config';
import { WidgetLibrarySidebar } from '@/components/admin/widget-library-sidebar';
import { WidgetConfigPanel } from '@/components/admin/widget-config-panel';
import { AdminPageHeader } from '@/components/admin/admin-page-header';

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

// Draggable Widget Row Component
function DraggableWidgetRow({
  widget,
  index,
  isExpanded,
  onToggleExpand,
  onDelete,
  onUpdate,
  previewDevice,
  products,
  heroSlides,
  heroSlidesLoading,
  onHeroSlidesChange,
}: {
  widget: PageWidget;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<PageWidget>) => void;
  previewDevice: DeviceType;
  products: Product[];
  heroSlides: HeroSlide[];
  heroSlidesLoading: boolean;
  onHeroSlidesChange: (slides: HeroSlide[]) => void;
}) {
  const Icon = ALL_WIDGETS.find((w) => w.type === widget.type)?.icon || FileText;
  const widgetLabel = ALL_WIDGETS.find((w) => w.type === widget.type)?.label || widget.type;
  const widgetDescription = ALL_WIDGETS.find((w) => w.type === widget.type)?.description || '';
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={widget}
      dragListener={false}
      dragControls={dragControls}
      className="bg-[var(--admin-input)]"
    >
      <div
        className={cn(
          'flex items-center gap-4 p-4 transition-colors',
          isExpanded ? 'bg-[var(--admin-sidebar)]' : 'hover:bg-[var(--admin-sidebar)]'
        )}
      >
        {/* Drag Handle */}
        <div
          className="cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)]" />
        </div>

        {/* Index */}
        <span className="text-xs text-[var(--admin-text-muted)] font-mono w-5">
          {index + 1}
        </span>

        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--primary)]" />
        </div>

        {/* Title & Description */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={onToggleExpand}
        >
          <h4 className="font-medium text-[var(--admin-text-primary)] truncate">
            {widget.title || widgetLabel}
          </h4>
          <p className="text-xs text-[var(--admin-text-muted)]">
            {widget.subtitle || widgetDescription}
          </p>
        </div>

        {/* Item Count Badge */}
        {widget.count !== undefined && (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--admin-hover)] text-[var(--admin-text-muted)]">
            {widget.activeCount !== undefined ? `${widget.activeCount}/${widget.count}` : widget.count} items
          </span>
        )}

        {/* Controls - Intuitive toggles with labels */}
        <div className="flex items-center gap-2">
          {/* Desktop visibility toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const cfg = (widget.config || {}) as Record<string, unknown>;
              onUpdate({
                config: { ...cfg, showOnDesktop: cfg.showOnDesktop !== false ? false : true }
              });
            }}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all',
              (widget.config as Record<string, unknown>)?.showOnDesktop !== false
                ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
                : 'text-[var(--admin-text-muted)] bg-[var(--admin-input)] hover:bg-[var(--admin-hover)]'
            )}
            title={(widget.config as Record<string, unknown>)?.showOnDesktop !== false ? 'Visible on desktop - click to hide' : 'Hidden on desktop - click to show'}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          {/* Mobile visibility toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const cfg = (widget.config || {}) as Record<string, unknown>;
              onUpdate({
                config: { ...cfg, showOnMobile: cfg.showOnMobile !== false ? false : true }
              });
            }}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all',
              (widget.config as Record<string, unknown>)?.showOnMobile !== false
                ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
                : 'text-[var(--admin-text-muted)] bg-[var(--admin-input)] hover:bg-[var(--admin-hover)]'
            )}
            title={(widget.config as Record<string, unknown>)?.showOnMobile !== false ? 'Visible on mobile - click to hide' : 'Hidden on mobile - click to show'}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
          {/* Widget visibility (draft/live) - Clear status indicator */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ isVisible: !widget.isVisible });
            }}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all',
              widget.isVisible
                ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
                : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
            )}
            title={widget.isVisible ? 'Live - click to set as draft' : 'Draft - click to publish'}
          >
            {widget.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{widget.isVisible ? 'Live' : 'Draft'}</span>
          </button>
          {/* Separator */}
          <div className="w-px h-5 bg-[var(--admin-border)]" />
          {/* Delete - Gray, subtle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-md text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete widget"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Widget Config Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
              {widget.type === 'hero_carousel' ? (
                heroSlidesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--admin-text-muted)]" />
                  </div>
                ) : (
                  <HeroCarouselConfig
                    slides={heroSlides}
                    products={products}
                    onSlidesChange={onHeroSlidesChange}
                    previewDevice={previewDevice}
                  />
                )
              ) : (
                <WidgetConfigPanel
                  widget={widget}
                  onUpdate={onUpdate}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}

// WidgetConfigPanel is now imported from @/components/admin/widget-config-panel
// This ensures consistency across all admin pages (blog, pages, etc.)

export default function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [siteInDraftMode, setSiteInDraftMode] = useState(false);
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
  const [isHomepage, setIsHomepage] = useState(false);

  // Device preview state
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');

  // Settings panel collapsed state
  const [settingsCollapsed, setSettingsCollapsed] = useState(true);

  // Homepage data state
  const [products, setProducts] = useState<Product[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [originalHeroSlides, setOriginalHeroSlides] = useState<HeroSlide[]>([]);
  const [heroSlidesLoading, setHeroSlidesLoading] = useState(false);

  // Computed: is this page effectively in draft mode?
  // Page is "draft" if: site is in draft mode OR page.isActive is false
  const isPageEffectivelyDraft = siteInDraftMode || !page.isActive;

  // Drag state for library widgets
  const [draggedWidgetType, setDraggedWidgetType] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Track unsaved changes
  const hasChanges = originalPage && (
    JSON.stringify(page) !== JSON.stringify(originalPage) ||
    JSON.stringify(widgets) !== JSON.stringify(originalWidgets) ||
    JSON.stringify(heroSlides) !== JSON.stringify(originalHeroSlides)
  );

  useEffect(() => {
    // Fetch site settings to know if site is in draft mode
    fetchSiteSettings();
    if (!isNew) {
      fetchPage();
    }
  }, [id, isNew]);

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSiteInDraftMode(data.siteInDraftMode ?? false);
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
    }
  };

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/pages/${id}`);
      const data = await res.json();
      setPage(data);
      setOriginalPage(data);

      const isHomepageSlug = data.slug === 'home' || data.slug === '';
      setIsHomepage(isHomepageSlug);

      if (isHomepageSlug) {
        // For homepage, load widgets from dedicated tables
        const homepageRes = await fetch(`/api/admin/pages/${id}/homepage-widgets`);
        const homepageData = await homepageRes.json();
        if (homepageData.widgets) {
          // Convert homepage widgets to editable format
          const editableWidgets = homepageData.widgets.map((w: PageWidget) => ({
            ...w,
            config: w.config || getDefaultConfig(w.type),
          }));
          setWidgets(editableWidgets);
          setOriginalWidgets(editableWidgets);
        }
        fetchProducts();
        fetchHeroSlides();
      } else if (data.widgets) {
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

  const handleAddWidget = (type: string, atIndex?: number) => {
    const widgetDef = ALL_WIDGETS.find((w) => w.type === type);
    const newWidget: PageWidget = {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: widgetDef?.label || '',
      subtitle: '',
      content: '',
      config: getDefaultConfig(type),
      isVisible: true,
    };

    if (atIndex !== undefined) {
      const newWidgets = [...widgets];
      newWidgets.splice(atIndex, 0, newWidget);
      setWidgets(newWidgets);
    } else {
      setWidgets([...widgets, newWidget]);
    }
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

  // Handle drop from library
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, atIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    const widgetType = e.dataTransfer.getData('widget-type');
    if (widgetType) {
      const insertIndex = atIndex !== undefined ? atIndex : dropTargetIndex !== null ? dropTargetIndex : widgets.length;
      handleAddWidget(widgetType, insertIndex);
    }
    setDraggedWidgetType(null);
    setDropTargetIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Calculate drop position based on mouse Y position
  const handleDragOverWidget = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const newIndex = e.clientY < midY ? index : index + 1;
    if (newIndex !== dropTargetIndex) {
      setDropTargetIndex(newIndex);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  const pageDisplayName = getPageDisplayName(page.slug, page.title);

  // Handle view with preview token for draft pages
  const handleView = async () => {
    const viewUrl = page.slug === 'home' ? '/' : `/${page.slug}`;
    if (isPageEffectivelyDraft) {
      // Generate preview token and open
      try {
        const res = await fetch('/api/admin/preview-token', { method: 'POST' });
        const { token } = await res.json();
        window.open(`${viewUrl}?preview=${token}`, '_blank');
      } catch {
        window.open(`${viewUrl}?preview=true`, '_blank');
      }
    } else {
      window.open(viewUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Pages', href: '/admin/pages' },
          { label: pageDisplayName },
        ]}
        title={pageDisplayName}
        subtitle={!isNew && page.slug && page.slug !== 'home' ? `/${page.slug}` : undefined}
        status={isPageEffectivelyDraft ? 'draft' : 'live'}
        onStatusToggle={() => setPage({ ...page, isActive: !page.isActive })}
        statusDisabled={siteInDraftMode && page.isActive}
        statusNote={siteInDraftMode && page.isActive ? '(site draft)' : undefined}
        onView={!isNew ? handleView : undefined}
        viewLabel={isPageEffectivelyDraft ? 'Preview' : 'View Live'}
        hasChanges={hasChanges || isNew}
        onSave={handleSave}
        saving={saving}
        saved={saved}
        saveLabel={isNew ? 'Create Page' : 'Save Changes'}
        showDelete={!isNew}
        onDelete={handleDeletePage}
        deleteLabel="Delete Page"
        backHref="/admin/pages"
      />

      {/* Main Content - Three Column Layout */}
      <div className="flex">
        {/* Left Panel - Page Settings (Collapsible) */}
        <div className={cn(
          'border-r border-[var(--admin-border)] bg-[var(--admin-sidebar)] transition-all duration-300 flex-shrink-0',
          settingsCollapsed ? 'w-14' : 'w-80'
        )}>
          <div className="sticky top-[73px] max-h-[calc(100vh-73px)] overflow-y-auto">
            {/* Collapse Toggle - More prominent when collapsed */}
            <button
              onClick={() => setSettingsCollapsed(!settingsCollapsed)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-4 border-b border-[var(--admin-border)] transition-all',
                settingsCollapsed
                  ? 'justify-center bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20'
                  : 'hover:bg-[var(--admin-hover)]'
              )}
              title={settingsCollapsed ? 'Expand page settings' : 'Collapse panel'}
            >
              {settingsCollapsed ? (
                <div className="flex flex-col items-center gap-1">
                  <LayoutPanelLeft className="w-5 h-5 text-[var(--primary)]" />
                  <span className="text-[10px] font-medium text-[var(--primary)] tracking-wide">Settings</span>
                </div>
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
        <div
          className="flex-1 min-w-0"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="p-6">
            {/* Widget List Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                  Page Content
                </h2>
                <span className="px-2 py-0.5 text-xs font-medium bg-[var(--admin-hover)] text-[var(--admin-text-muted)] rounded-full">
                  {widgets.length} widgets
                </span>
              </div>
              <DevicePreviewToggle device={previewDevice} onChange={setPreviewDevice} />
            </div>

            {/* Widget List */}
            <div
              className={cn(
                'bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] transition-all relative',
                draggedWidgetType && 'ring-2 ring-[var(--primary)] ring-opacity-50'
              )}
              onDragLeave={() => setDropTargetIndex(null)}
            >
              {widgets.length > 0 ? (
                <Reorder.Group
                  axis="y"
                  values={widgets}
                  onReorder={handleReorderWidgets}
                  className="divide-y divide-[var(--admin-border)]"
                >
                  {widgets.map((widget, index) => (
                    <div
                      key={widget.id}
                      onDragOver={(e) => draggedWidgetType && handleDragOverWidget(e, index)}
                      onDrop={(e) => handleDrop(e, dropTargetIndex ?? index)}
                    >
                      {/* Drop indicator before this widget */}
                      {draggedWidgetType && dropTargetIndex === index && (
                        <div className="h-1 bg-[var(--primary)] mx-4 rounded-full animate-pulse" />
                      )}
                      <DraggableWidgetRow
                        widget={widget}
                        index={index}
                        isExpanded={expandedWidget === widget.id}
                        onToggleExpand={() => setExpandedWidget(expandedWidget === widget.id ? null : widget.id)}
                        onDelete={() => handleDeleteWidget(widget.id)}
                        onUpdate={(updates) => handleUpdateWidget(widget.id, updates)}
                        previewDevice={previewDevice}
                        products={products}
                        heroSlides={heroSlides}
                        heroSlidesLoading={heroSlidesLoading}
                        onHeroSlidesChange={handleUpdateHeroSlides}
                      />
                      {/* Drop indicator after last widget */}
                      {draggedWidgetType && index === widgets.length - 1 && dropTargetIndex === widgets.length && (
                        <div className="h-1 bg-[var(--primary)] mx-4 rounded-full animate-pulse" />
                      )}
                    </div>
                  ))}
                </Reorder.Group>
              ) : (
                <div
                  className="py-16 text-center"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDropTargetIndex(0);
                  }}
                  onDrop={(e) => handleDrop(e, 0)}
                >
                  {draggedWidgetType ? (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center">
                        <Plus className="w-8 h-8 text-[var(--primary)]" />
                      </div>
                      <h3 className="font-medium text-lg text-[var(--primary)] mb-2">
                        Drop here to add
                      </h3>
                      <p className="text-sm text-[var(--admin-text-muted)]">
                        Release to add {ALL_WIDGETS.find(w => w.type === draggedWidgetType)?.label || 'widget'}
                      </p>
                    </>
                  ) : (
                    <>
                      <Layout className="w-16 h-16 mx-auto mb-4 text-[var(--admin-text-muted)]" />
                      <h3 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">
                        No widgets yet
                      </h3>
                      <p className="text-sm text-[var(--admin-text-muted)] mb-4 max-w-xs mx-auto">
                        Drag widgets from the library on the right, or click to add them to your page
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Widget Library (Always Visible) */}
        <div className="w-72 border-l border-[var(--admin-border)] bg-[var(--admin-sidebar)] flex-shrink-0">
          <div className="sticky top-[73px] max-h-[calc(100vh-73px)] overflow-y-auto">
            <WidgetLibrarySidebar
              onAddWidget={handleAddWidget}
              onDragStart={(type) => setDraggedWidgetType(type)}
              onDragEnd={() => setDraggedWidgetType(null)}
              draggedWidgetType={draggedWidgetType}
              storageKey="page-editor-widget-order"
              showReorderControls={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
