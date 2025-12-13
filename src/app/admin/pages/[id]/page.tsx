'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Reorder, AnimatePresence, useDragControls } from 'framer-motion';
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
  ChevronDown,
  ChevronUp,
  Check,
  ExternalLink,
  Monitor,
  Smartphone,
  PanelLeftClose,
  LayoutPanelLeft,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';
import {
  WIDGET_CATEGORIES as CENTRALIZED_CATEGORIES,
  WIDGET_TYPES,
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

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Desktop visibility - Green when on, Red when off */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const cfg = (widget.config || {}) as Record<string, unknown>;
              onUpdate({
                config: { ...cfg, showOnDesktop: cfg.showOnDesktop !== false ? false : true }
              });
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              (widget.config as Record<string, unknown>)?.showOnDesktop !== false
                ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20'
                : 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
            )}
            title={(widget.config as Record<string, unknown>)?.showOnDesktop !== false ? 'Visible on desktop - click to hide' : 'Hidden on desktop - click to show'}
          >
            <Monitor className="w-4 h-4" />
          </button>
          {/* Mobile visibility - Green when on, Red when off */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const cfg = (widget.config || {}) as Record<string, unknown>;
              onUpdate({
                config: { ...cfg, showOnMobile: cfg.showOnMobile !== false ? false : true }
              });
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              (widget.config as Record<string, unknown>)?.showOnMobile !== false
                ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20'
                : 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
            )}
            title={(widget.config as Record<string, unknown>)?.showOnMobile !== false ? 'Visible on mobile - click to hide' : 'Hidden on mobile - click to show'}
          >
            <Smartphone className="w-4 h-4" />
          </button>
          {/* Widget visibility (draft/live) - Green when live, Amber when draft */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ isVisible: !widget.isVisible });
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              widget.isVisible
                ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20'
                : 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
            )}
            title={widget.isVisible ? 'Live - click to set as draft' : 'Draft - click to publish'}
          >
            {widget.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          {/* Expand/Collapse */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-1.5 rounded-lg hover:bg-[var(--admin-hover)] transition-colors text-[var(--admin-text-secondary)]"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
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

// Generic Widget Config Panel for non-hero widgets
function WidgetConfigPanel({
  widget,
  onUpdate,
}: {
  widget: PageWidget;
  onUpdate: (updates: Partial<PageWidget>) => void;
}) {
  const config = (widget.config || {}) as Record<string, unknown>;

  return (
    <div className="space-y-4">
      {/* Title & Subtitle - Common for most widgets */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Title
          </label>
          <input
            value={widget.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
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
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            placeholder="Widget subtitle"
            className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
      </div>

      {/* Text/Quote content */}
      {(widget.type === 'text' || widget.type === 'quote' || widget.type === 'mission') && (
        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Content
          </label>
          <textarea
            value={widget.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter content..."
            rows={4}
            className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
          />
        </div>
      )}

      {/* Image widgets */}
      {(widget.type === 'image' || widget.type === 'hero' || widget.type === 'image_text') && (
        <MediaPickerButton
          label="Widget Image"
          value={(config.imageUrl as string) || null}
          onChange={(url) =>
            onUpdate({
              config: { ...config, imageUrl: url || '' },
            })
          }
          helpText="Image for this widget"
          folder="widgets"
        />
      )}

      {/* Video widget */}
      {widget.type === 'video' && (
        <MediaPickerButton
          label="Video"
          value={(config.videoUrl as string) || null}
          onChange={(url) =>
            onUpdate({
              config: { ...config, videoUrl: url || '' },
            })
          }
          helpText="Upload MP4/WebM or paste a Vimeo/YouTube URL"
          folder="widgets"
          acceptVideo={true}
        />
      )}

      {/* CTA / Newsletter widgets */}
      {(widget.type === 'cta' || widget.type === 'newsletter') && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Button Text
            </label>
            <input
              value={(config.buttonText as string) || ''}
              onChange={(e) =>
                onUpdate({
                  config: { ...config, buttonText: e.target.value },
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
              value={(config.buttonUrl as string) || ''}
              onChange={(e) =>
                onUpdate({
                  config: { ...config, buttonUrl: e.target.value },
                })
              }
              placeholder="/products"
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
        </div>
      )}

      {/* Image + Text layout */}
      {widget.type === 'image_text' && (
        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
            Layout
          </label>
          <select
            value={(config.layout as string) || 'image-left'}
            onChange={(e) =>
              onUpdate({
                config: { ...config, layout: e.target.value },
              })
            }
            className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          >
            <option value="image-left">Image Left</option>
            <option value="image-right">Image Right</option>
          </select>
        </div>
      )}

      {/* Marquee widget */}
      {widget.type === 'marquee' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Marquee Text
            </label>
            <input
              value={(config.text as string) || ''}
              onChange={(e) =>
                onUpdate({
                  config: { ...config, text: e.target.value },
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
                value={(config.speed as string) || 'slow'}
                onChange={(e) =>
                  onUpdate({
                    config: { ...config, speed: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)]"
              >
                <option value="slow">Slow (120s)</option>
                <option value="medium">Medium (60s)</option>
                <option value="fast">Fast (30s)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Size
              </label>
              <select
                value={(config.size as string) || 'xxl'}
                onChange={(e) =>
                  onUpdate({
                    config: { ...config, size: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)]"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="xl">XL</option>
                <option value="xxl">XXL (Gigantic)</option>
                <option value="xxxl">XXXL (Massive)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Theme
              </label>
              <select
                value={(config.style as string) || (config.theme as string) || 'dark'}
                onChange={(e) =>
                  onUpdate({
                    config: { ...config, style: e.target.value, theme: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)]"
              >
                <option value="dark">Dark (Black BG)</option>
                <option value="light">Light (White BG)</option>
                <option value="baby-blue">Baby Blue</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials widget placeholder */}
      {widget.type === 'testimonials' && (
        <div className="text-sm text-[var(--admin-text-muted)] py-4 text-center">
          Configure testimonial display options. Individual testimonials are managed in the{' '}
          <Link href="/admin/testimonials" className="text-[var(--primary)] hover:underline">
            Testimonials section
          </Link>.
        </div>
      )}

      {/* Video Testimonials widget placeholder */}
      {widget.type === 'video_testimonials' && (
        <div className="text-sm text-[var(--admin-text-muted)] py-4 text-center">
          Configure video testimonial display options. Individual videos are managed in the{' '}
          <Link href="/admin/video-testimonials" className="text-[var(--primary)] hover:underline">
            Video Testimonials section
          </Link>.
        </div>
      )}

      {/* FAQs widget placeholder */}
      {widget.type === 'faqs' && (
        <div className="text-sm text-[var(--admin-text-muted)] py-4 text-center">
          Configure FAQ display options. Individual FAQs are managed in the{' '}
          <Link href="/admin/faqs" className="text-[var(--primary)] hover:underline">
            FAQs section
          </Link>.
        </div>
      )}

      {/* Instagram widget placeholder */}
      {widget.type === 'instagram' && (
        <div className="text-sm text-[var(--admin-text-muted)] py-4 text-center">
          Configure Instagram feed display. Individual posts are managed in the{' '}
          <Link href="/admin/instagram" className="text-[var(--primary)] hover:underline">
            Instagram section
          </Link>.
        </div>
      )}

      {/* Product Grid widget placeholder */}
      {widget.type === 'product_grid' && (
        <div className="text-sm text-[var(--admin-text-muted)] py-4 text-center">
          Configure product grid display. Products are managed in the{' '}
          <Link href="/admin/products" className="text-[var(--primary)] hover:underline">
            Products section
          </Link>.
        </div>
      )}
    </div>
  );
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

  // Device preview state
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');

  // Settings panel collapsed state
  const [settingsCollapsed, setSettingsCollapsed] = useState(true);

  // Homepage data state
  const [products, setProducts] = useState<Product[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [originalHeroSlides, setOriginalHeroSlides] = useState<HeroSlide[]>([]);
  const [heroSlidesLoading, setHeroSlidesLoading] = useState(false);

  // Drag state for library widgets
  const [draggedWidgetType, setDraggedWidgetType] = useState<string | null>(null);

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
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const widgetType = e.dataTransfer.getData('widget-type');
    if (widgetType) {
      handleAddWidget(widgetType);
    }
    setDraggedWidgetType(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  const pageDisplayName = getPageDisplayName(page.slug, page.title);

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
            <div className={cn(
              'bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] transition-all',
              draggedWidgetType && 'ring-2 ring-[var(--primary)] ring-opacity-50'
            )}>
              {widgets.length > 0 ? (
                <Reorder.Group
                  axis="y"
                  values={widgets}
                  onReorder={handleReorderWidgets}
                  className="divide-y divide-[var(--admin-border)]"
                >
                  {widgets.map((widget, index) => (
                    <DraggableWidgetRow
                      key={widget.id}
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
                  ))}
                </Reorder.Group>
              ) : (
                <div className="py-16 text-center">
                  <Layout className="w-16 h-16 mx-auto mb-4 text-[var(--admin-text-muted)]" />
                  <h3 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">
                    No widgets yet
                  </h3>
                  <p className="text-sm text-[var(--admin-text-muted)] mb-4 max-w-xs mx-auto">
                    Drag widgets from the library on the right, or click to add them to your page
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
                Drag or click to add widgets
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
                              <div
                                key={widget.type}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('widget-type', widget.type);
                                  setDraggedWidgetType(widget.type);
                                }}
                                onDragEnd={() => setDraggedWidgetType(null)}
                                onClick={() => handleAddWidget(widget.type)}
                                className="w-full p-3 rounded-lg border border-transparent transition-all text-left group cursor-grab active:cursor-grabbing hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5"
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
                              </div>
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
        </div>
      </div>
    </div>
  );
}
