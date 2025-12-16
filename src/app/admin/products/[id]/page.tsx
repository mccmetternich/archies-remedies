'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Reorder, useDragControls } from 'framer-motion';
import {
  Loader2,
  Plus,
  GripVertical,
  X,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Trash2,
  Layers,
  Check,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { WidgetLibrarySidebar } from '@/components/admin/widget-library-sidebar';
import { cn } from '@/lib/utils';

// Types
interface ProductVariant {
  id: string;
  name: string;
  price: number | null;
  compareAtPrice: number | null;
  amazonUrl: string;
  isDefault: boolean | null;
  sortOrder: number;
  // Variant-specific media
  heroImageUrl?: string | null;
  secondaryImageUrl?: string | null;
  heroCarouselImages?: string | null;
  // Variant thumbnail and badge
  thumbnailUrl?: string | null;
  badge?: string | null;
  badgeBgColor?: string | null;
  badgeTextColor?: string | null;
}

interface ProductBenefit {
  id: string;
  title: string;
  description: string | null;
  isPositive: boolean | null;
  sortOrder: number;
}

interface ProductWidget {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  config?: Record<string, unknown>;
  isVisible: boolean;
  showOnDesktop: boolean;
  showOnMobile: boolean;
  sortOrder: number;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  shortDescription: string | null;
  price: number | null;
  compareAtPrice: number | null;
  heroImageUrl: string | null;
  secondaryImageUrl: string | null;
  heroCarouselImages: string | null;
  badge: string | null;
  badgeEmoji: string | null;
  badgeBgColor: string | null;
  badgeTextColor: string | null;
  rotatingBadgeEnabled: boolean | null;
  rotatingBadgeText: string | null;
  rating: number | null;
  reviewCount: number | null;
  // Review Badge
  reviewBadge: string | null;
  reviewBadgeEmoji: string | null;
  reviewBadgeBgColor: string | null;
  reviewBadgeTextColor: string | null;
  rotatingSealEnabled: boolean | null;
  rotatingSealImageUrl: string | null;
  ritualTitle: string | null;
  ritualContent: string | null;
  ingredientsTitle: string | null;
  ingredientsContent: string | null;
  shippingTitle: string | null;
  shippingContent: string | null;
  bulletPoint1: string | null;
  bulletPoint2: string | null;
  bulletPoint3: string | null;
  bulletPoint4: string | null;
  bulletPoint5: string | null;
  ctaButtonText: string | null;
  ctaExternalUrl: string | null;
  showDiscountSignup: boolean | null;
  discountSignupText: string | null;
  widgets: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean | null;
  sortOrder: number | null;
}

type TabType = 'details' | 'content';

// Draggable Widget Row Component
function DraggableWidgetRow({
  widget,
  index,
  onUpdate,
  onDelete,
}: {
  widget: ProductWidget;
  index: number;
  onUpdate: (id: string, updates: Partial<ProductWidget>) => void;
  onDelete: (id: string) => void;
}) {
  const dragControls = useDragControls();

  const widgetLabels: Record<string, string> = {
    testimonials: 'Testimonials',
    video_testimonials: 'Video Testimonials',
    instagram: 'Instagram Feed',
    faqs: 'FAQs',
    benefits: 'Benefits Grid',
    marquee: 'Marquee',
    text: 'Text Block',
    image_text: 'Image + Text',
    cta: 'Call to Action',
    newsletter: 'Newsletter Signup',
  };

  return (
    <Reorder.Item
      value={widget}
      dragListener={false}
      dragControls={dragControls}
      className="bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4">
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-[var(--admin-hover)] rounded"
        >
          <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)]" />
        </div>

        <span className="w-6 h-6 flex items-center justify-center text-xs font-mono bg-[var(--admin-input)] rounded text-[var(--admin-text-primary)]">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[var(--admin-text-primary)] truncate">
            {widget.title || widgetLabels[widget.type] || widget.type}
          </h4>
          {widget.subtitle && (
            <p className="text-xs text-[var(--admin-text-muted)] truncate">{widget.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate(widget.id, { showOnDesktop: !widget.showOnDesktop })}
            className={cn(
              'p-1.5 rounded transition-colors',
              widget.showOnDesktop
                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]'
            )}
            title="Show on desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onUpdate(widget.id, { showOnMobile: !widget.showOnMobile })}
            className={cn(
              'p-1.5 rounded transition-colors',
              widget.showOnMobile
                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]'
            )}
            title="Show on mobile"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onUpdate(widget.id, { isVisible: !widget.isVisible })}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
              widget.isVisible
                ? 'bg-green-500/10 text-green-400'
                : 'bg-orange-500/10 text-orange-400'
            )}
          >
            {widget.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {widget.isVisible ? 'Live' : 'Draft'}
          </button>

          <button
            onClick={() => onDelete(widget.id)}
            className="p-1.5 rounded text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  // State
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [product, setProduct] = useState<Product | null>(null);
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [originalVariants, setOriginalVariants] = useState<ProductVariant[]>([]);
  const [benefits, setBenefits] = useState<ProductBenefit[]>([]);
  const [originalBenefits, setOriginalBenefits] = useState<ProductBenefit[]>([]);
  const [widgets, setWidgets] = useState<ProductWidget[]>([]);
  const [originalWidgets, setOriginalWidgets] = useState<ProductWidget[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bulletPointCount, setBulletPointCount] = useState(3);
  const [siteInDraftMode, setSiteInDraftMode] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedMediaVariantIndex, setSelectedMediaVariantIndex] = useState(0);

  // Track changes
  const hasChanges =
    (product && originalProduct && JSON.stringify(product) !== JSON.stringify(originalProduct)) ||
    JSON.stringify(variants) !== JSON.stringify(originalVariants) ||
    JSON.stringify(benefits) !== JSON.stringify(originalBenefits) ||
    JSON.stringify(widgets) !== JSON.stringify(originalWidgets);

  // Fetch product
  useEffect(() => {
    if (!isNew) {
      fetchProduct();
    } else {
      const newProduct: Product = {
        id: '',
        slug: '',
        name: '',
        subtitle: null,
        shortDescription: '',
        price: null,
        compareAtPrice: null,
        heroImageUrl: null,
        secondaryImageUrl: null,
        heroCarouselImages: null,
        badge: null,
        badgeEmoji: null,
        badgeBgColor: '#1a1a1a',
        badgeTextColor: '#ffffff',
        rotatingBadgeEnabled: false,
        rotatingBadgeText: null,
        rating: 4.9,
        reviewCount: 2900,
        reviewBadge: null,
        reviewBadgeEmoji: null,
        reviewBadgeBgColor: '#bbdae9',
        reviewBadgeTextColor: '#1a1a1a',
        rotatingSealEnabled: false,
        rotatingSealImageUrl: null,
        ritualTitle: 'The Ritual',
        ritualContent: null,
        ingredientsTitle: 'Ingredients',
        ingredientsContent: null,
        shippingTitle: 'Good to Know',
        shippingContent: null,
        bulletPoint1: null,
        bulletPoint2: null,
        bulletPoint3: null,
        bulletPoint4: null,
        bulletPoint5: null,
        ctaButtonText: 'Buy Now on Amazon',
        ctaExternalUrl: null,
        showDiscountSignup: true,
        discountSignupText: 'Get 10% off your first order',
        widgets: null,
        metaTitle: null,
        metaDescription: null,
        isActive: true,
        sortOrder: 0,
      };
      setProduct(newProduct);
      setOriginalProduct(newProduct);
    }
    fetchSiteSettings();
  }, [id, isNew]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${id}`);
      const data = await res.json();
      setProduct(data.product);
      setOriginalProduct(data.product);
      setVariants(data.variants || []);
      setOriginalVariants(data.variants || []);
      setBenefits(data.benefits || []);
      setOriginalBenefits(data.benefits || []);

      if (data.product?.widgets) {
        try {
          const parsedWidgets = JSON.parse(data.product.widgets);
          setWidgets(parsedWidgets);
          setOriginalWidgets(parsedWidgets);
        } catch {
          setWidgets([]);
          setOriginalWidgets([]);
        }
      }

      const bulletPoints = [
        data.product?.bulletPoint1,
        data.product?.bulletPoint2,
        data.product?.bulletPoint3,
        data.product?.bulletPoint4,
        data.product?.bulletPoint5,
      ].filter(Boolean);
      setBulletPointCount(Math.max(3, bulletPoints.length));
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSiteInDraftMode(data?.siteInDraftMode ?? false);
    } catch {
      // Ignore
    }
  };

  const handleNameChange = (name: string) => {
    if (!product) return;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setProduct({ ...product, name, slug: isNew || !product.slug ? slug : product.slug });
  };

  const handleSave = async () => {
    if (!product) return;

    setSaving(true);
    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${id}`;

      const productData = {
        ...product,
        widgets: widgets.length > 0 ? JSON.stringify(widgets) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: productData, variants, benefits }),
      });

      const data = await res.json();

      if (isNew && data.id) {
        router.push(`/admin/products/${data.id}`);
      } else {
        setOriginalProduct(product);
        setOriginalVariants([...variants]);
        setOriginalBenefits([...benefits]);
        setOriginalWidgets([...widgets]);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleStatusToggle = async () => {
    if (!product) return;
    const newStatus = !product.isActive;
    setProduct({ ...product, isActive: newStatus });

    if (!isNew) {
      try {
        await fetch(`/api/admin/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: newStatus }),
        });
      } catch (error) {
        console.error('Failed to toggle status:', error);
        setProduct({ ...product, isActive: !newStatus });
      }
    }
  };

  const handleView = async () => {
    const isDraft = siteInDraftMode || !product?.isActive;
    if (isDraft) {
      try {
        const res = await fetch('/api/admin/preview', { method: 'POST' });
        const data = await res.json();
        if (data.token) {
          window.open(`/products/${product?.slug}?token=${data.token}`, '_blank');
          return;
        }
      } catch {
        // Fall through
      }
    }
    window.open(`/products/${product?.slug}`, '_blank');
  };

  // Variant handlers
  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `new-${Date.now()}`,
      name: '',
      price: null,
      compareAtPrice: null,
      amazonUrl: '',
      isDefault: variants.length === 0,
      sortOrder: variants.length,
      heroImageUrl: null,
      secondaryImageUrl: null,
      heroCarouselImages: null,
      thumbnailUrl: null,
      badge: null,
      badgeBgColor: null,
      badgeTextColor: null,
    };
    setVariants([...variants, newVariant]);
    setSelectedVariantIndex(variants.length);
  };

  const removeVariant = (variantId: string) => {
    const newVariants = variants.filter((v) => v.id !== variantId);
    setVariants(newVariants);
    if (selectedVariantIndex >= newVariants.length) {
      setSelectedVariantIndex(Math.max(0, newVariants.length - 1));
    }
  };

  const updateVariant = (
    variantId: string,
    field: keyof ProductVariant,
    value: string | number | boolean | null
  ) => {
    setVariants(variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v)));
  };

  // Widget handlers
  const addWidget = (type: string) => {
    const newWidget: ProductWidget = {
      id: `widget-${Date.now()}`,
      type,
      isVisible: true,
      showOnDesktop: true,
      showOnMobile: true,
      sortOrder: widgets.length,
    };
    setWidgets([...widgets, newWidget]);
  };

  const updateWidget = (widgetId: string, updates: Partial<ProductWidget>) => {
    setWidgets(widgets.map((w) => (w.id === widgetId ? { ...w, ...updates } : w)));
  };

  const deleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter((w) => w.id !== widgetId));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const widgetType = e.dataTransfer.getData('widget-type');
    if (widgetType) {
      addWidget(widgetType);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--admin-text-muted)]">Product not found</p>
      </div>
    );
  }

  const isDraft = siteInDraftMode || !product.isActive;
  const statusNote = siteInDraftMode && product.isActive ? '(site draft)' : undefined;

  // Parse carousel images
  const carouselImages: string[] = product.heroCarouselImages
    ? JSON.parse(product.heroCarouselImages)
    : [];

  // Get selected variant for CTA
  const selectedVariant = variants[selectedVariantIndex] || variants[0];

  return (
    <div className="min-h-screen bg-[var(--admin-bg)]">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: isNew ? 'New Product' : product.name || 'Edit Product' },
        ]}
        title={isNew ? 'New Product' : product.name || 'Edit Product'}
        subtitle={!isNew && product.slug ? `/products/${product.slug}` : undefined}
        status={isDraft ? 'draft' : 'live'}
        onStatusToggle={handleStatusToggle}
        statusDisabled={siteInDraftMode}
        statusNote={statusNote}
        onView={handleView}
        viewLabel={isDraft ? 'Preview' : 'View Live'}
        hasChanges={hasChanges || isNew}
        onSave={handleSave}
        saving={saving}
        saved={saved}
        saveLabel={isNew ? 'Create Product' : 'Save Changes'}
        onDelete={!isNew ? handleDelete : undefined}
        showDelete={!isNew}
        deleteLabel="Delete Product"
        backHref="/admin/products"
      />

      {/* Horizontal Tab Navigation */}
      <div className="border-b border-[var(--admin-border)] bg-[var(--admin-sidebar)]">
        <div className="px-6">
          <nav className="flex gap-10">
            <button
              onClick={() => setActiveTab('details')}
              className={cn(
                'py-5 text-base font-medium border-b-2 transition-colors',
                activeTab === 'details'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]'
              )}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={cn(
                'py-5 text-base font-medium border-b-2 transition-colors',
                activeTab === 'content'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]'
              )}
            >
              Additional Content
              {widgets.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-[var(--admin-input)] rounded-full text-[var(--admin-text-primary)]">
                  {widgets.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' ? (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {/* Section 1: Product Info */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <h3 className="text-sm font-medium text-[var(--admin-text-primary)] mb-4">
              Product Info
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                  Product Name *
                </label>
                <Input
                  value={product.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Dry Eye Relief Drops"
                  className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                  Short Description
                </label>
                <textarea
                  value={product.shortDescription || ''}
                  onChange={(e) => setProduct({ ...product, shortDescription: e.target.value })}
                  placeholder="Brief description for product cards and meta..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] resize-none focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Key Benefits - Under Short Description */}
              <div>
                <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                  Key Benefits
                </label>
                <p className="text-xs text-[var(--admin-text-muted)] mb-3">
                  Shown with checkmarks on the product page
                </p>
                <div className="space-y-2">
                  {Array.from({ length: bulletPointCount }).map((_, i) => {
                    const key = `bulletPoint${i + 1}` as keyof Product;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#bbdae9] flex-shrink-0" />
                        <Input
                          value={(product[key] as string) || ''}
                          onChange={(e) =>
                            setProduct({ ...product, [key]: e.target.value || null })
                          }
                          placeholder={`Benefit ${i + 1}`}
                          className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                        />
                      </div>
                    );
                  })}
                </div>
                {bulletPointCount < 5 && (
                  <button
                    onClick={() => setBulletPointCount(bulletPointCount + 1)}
                    className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline mt-3"
                  >
                    <Plus className="w-3 h-3" />
                    Add another
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                  URL Slug *
                </label>
                <Input
                  value={product.slug}
                  onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                  placeholder="eye-drops"
                  className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                />
                <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                  archiesremedies.com/products/{product.slug || 'your-slug'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Variants & Pricing */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <h3 className="text-sm font-medium text-[var(--admin-text-primary)] mb-4">
              Variants & Pricing
            </h3>

            {variants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--admin-text-muted)] mb-4">
                  No variants added. Add at least one variant with pricing and Amazon URL.
                </p>
                <button
                  onClick={addVariant}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Variant
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Variant Selector Tiles */}
                {variants.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {variants.map((variant, index) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantIndex(index)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                          selectedVariantIndex === index
                            ? 'bg-[var(--primary)] text-[var(--admin-button-text)] border-[var(--primary)]'
                            : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] border-[var(--admin-border-light)] hover:border-[var(--primary)]'
                        )}
                      >
                        {variant.name || `Variant ${index + 1}`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Variant Details */}
                {variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className={cn(
                      'p-4 border border-[var(--admin-border-light)] rounded-lg space-y-4',
                      variants.length > 1 && selectedVariantIndex !== index && 'hidden'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--admin-text-primary)]">
                        {variants.length === 1 ? 'Product Details' : `Variant ${index + 1}`}
                      </span>
                      {variants.length > 1 && (
                        <button
                          onClick={() => removeVariant(variant.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                          Variant Name
                        </label>
                        <Input
                          value={variant.name}
                          onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                          placeholder="e.g., 30 Count"
                          className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                          Amazon URL *
                        </label>
                        <Input
                          value={variant.amazonUrl}
                          onChange={(e) => updateVariant(variant.id, 'amazonUrl', e.target.value)}
                          placeholder="https://amazon.com/dp/..."
                          className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                          Price ($)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.price || ''}
                          onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || null)}
                          placeholder="24.99"
                          className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                          Compare at ($)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.compareAtPrice || ''}
                          onChange={(e) =>
                            updateVariant(variant.id, 'compareAtPrice', parseFloat(e.target.value) || null)
                          }
                          placeholder="29.99"
                          className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                        />
                      </div>
                    </div>

                    {variants.length === 1 && (
                      <label className="flex items-center gap-2 text-sm text-[var(--admin-text-secondary)]">
                        <input
                          type="checkbox"
                          checked={variant.isDefault ?? true}
                          onChange={(e) => updateVariant(variant.id, 'isDefault', e.target.checked)}
                          className="rounded border-[var(--admin-border-light)]"
                        />
                        Default variant
                      </label>
                    )}
                  </div>
                ))}

                <button
                  onClick={addVariant}
                  className="w-full py-3 border-2 border-dashed border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Variant
                </button>
              </div>
            )}

            {/* Rating & Reviews */}
            <div className="mt-6 pt-6 border-t border-[var(--admin-border-light)]">
              <h4 className="text-sm font-medium text-[var(--admin-text-primary)] mb-4">
                Rating & Reviews
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                    Rating (0-5)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={product.rating || ''}
                    onChange={(e) => setProduct({ ...product, rating: parseFloat(e.target.value) || null })}
                    placeholder="4.9"
                    className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                    Review Count
                  </label>
                  <Input
                    type="number"
                    value={product.reviewCount || ''}
                    onChange={(e) => setProduct({ ...product, reviewCount: parseInt(e.target.value) || null })}
                    placeholder="2900"
                    className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                  />
                </div>
              </div>
              <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                Displayed in navigation, homepage tiles, and product page
              </p>

              {/* Review Badge */}
              <div className="mt-6 pt-4 border-t border-[var(--admin-border-light)]">
                <h5 className="text-sm font-medium text-[var(--admin-text-primary)] mb-4">
                  Review Badge (Optional)
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                      Badge Text
                    </label>
                    <Input
                      value={product.reviewBadge || ''}
                      onChange={(e) => setProduct({ ...product, reviewBadge: e.target.value || null })}
                      placeholder="Amazon Choice"
                      className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                      Emoji
                    </label>
                    <Input
                      value={product.reviewBadgeEmoji || ''}
                      onChange={(e) => setProduct({ ...product, reviewBadgeEmoji: e.target.value || null })}
                      placeholder="🏆"
                      className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={product.reviewBadgeBgColor || '#bbdae9'}
                        onChange={(e) => setProduct({ ...product, reviewBadgeBgColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer border border-[var(--admin-border-light)]"
                      />
                      <Input
                        value={product.reviewBadgeBgColor || '#bbdae9'}
                        onChange={(e) => setProduct({ ...product, reviewBadgeBgColor: e.target.value })}
                        className="flex-1 bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                      Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={product.reviewBadgeTextColor || '#1a1a1a'}
                        onChange={(e) => setProduct({ ...product, reviewBadgeTextColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer border border-[var(--admin-border-light)]"
                      />
                      <Input
                        value={product.reviewBadgeTextColor || '#1a1a1a'}
                        onChange={(e) => setProduct({ ...product, reviewBadgeTextColor: e.target.value })}
                        className="flex-1 bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                  Shows next to the star rating on the product page
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Hero Media & Badge */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <h3 className="text-sm font-medium text-[var(--admin-text-primary)] mb-4">
              Hero Media & Badge
            </h3>

            {/* Variant Tabs for Media - only show if variants exist */}
            {variants.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm text-[var(--admin-text-secondary)] mb-2">
                  Select Variant Media
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant, index) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedMediaVariantIndex(index)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                        selectedMediaVariantIndex === index
                          ? 'bg-[var(--primary)] text-[var(--admin-button-text)] border-[var(--primary)]'
                          : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] border-[var(--admin-border-light)] hover:border-[var(--primary)]'
                      )}
                    >
                      {variant.name || `Variant ${index + 1}`}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                  Each variant can have its own product images/videos
                </p>
              </div>
            )}

            {/* Media Grid - Shows selected variant's media */}
            {variants.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {(() => {
                  const selectedMediaVariant = variants[selectedMediaVariantIndex];
                  if (!selectedMediaVariant) return null;

                  const variantCarouselImages: string[] = selectedMediaVariant.heroCarouselImages
                    ? JSON.parse(selectedMediaVariant.heroCarouselImages)
                    : [];

                  const updateVariantMedia = (field: keyof ProductVariant, value: string | null) => {
                    setVariants(variants.map((v, i) =>
                      i === selectedMediaVariantIndex ? { ...v, [field]: value } : v
                    ));
                  };

                  const updateVariantCarousel = (index: number, url: string | null) => {
                    const newImages = [...variantCarouselImages];
                    while (newImages.length <= index) newImages.push('');
                    newImages[index] = url || '';
                    const filtered = newImages.filter(Boolean);
                    updateVariantMedia('heroCarouselImages', filtered.length > 0 ? JSON.stringify(filtered) : null);
                  };

                  return (
                    <>
                      {/* Variant Thumbnail for Tile */}
                      <div className="col-span-2 mb-4">
                        <label className="block text-sm text-[var(--admin-text-secondary)] mb-2">
                          Variant Tile Thumbnail
                        </label>
                        <MediaPickerButton
                          label="Thumbnail for Variant Tile"
                          value={selectedMediaVariant.thumbnailUrl || null}
                          onChange={(url) => updateVariantMedia('thumbnailUrl', url || null)}
                          folder="products"
                          aspectRatio="1/1"
                        />
                        <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                          Shows in the variant selection tile on the product page
                        </p>
                      </div>

                      {/* Variant Badge */}
                      <div className="col-span-2 mb-4 p-4 bg-[var(--admin-input)] rounded-lg">
                        <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-3">
                          Variant Badge (e.g., &quot;Best Value&quot;)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">
                              Badge Text
                            </label>
                            <Input
                              value={selectedMediaVariant.badge || ''}
                              onChange={(e) => updateVariantMedia('badge', e.target.value || null)}
                              placeholder="Best Value"
                              className="bg-[var(--admin-card)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">
                                BG Color
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="color"
                                  value={selectedMediaVariant.badgeBgColor || '#bbdae9'}
                                  onChange={(e) => updateVariantMedia('badgeBgColor', e.target.value)}
                                  className="w-8 h-8 rounded cursor-pointer border border-[var(--admin-border-light)]"
                                />
                                <Input
                                  value={selectedMediaVariant.badgeBgColor || '#bbdae9'}
                                  onChange={(e) => updateVariantMedia('badgeBgColor', e.target.value)}
                                  className="flex-1 bg-[var(--admin-card)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)] text-xs"
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">
                                Text Color
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="color"
                                  value={selectedMediaVariant.badgeTextColor || '#1a1a1a'}
                                  onChange={(e) => updateVariantMedia('badgeTextColor', e.target.value)}
                                  className="w-8 h-8 rounded cursor-pointer border border-[var(--admin-border-light)]"
                                />
                                <Input
                                  value={selectedMediaVariant.badgeTextColor || '#1a1a1a'}
                                  onChange={(e) => updateVariantMedia('badgeTextColor', e.target.value)}
                                  className="flex-1 bg-[var(--admin-card)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)] text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gallery Media */}
                      <MediaPickerButton
                        label="Media 1 - Featured"
                        value={selectedMediaVariant.heroImageUrl || null}
                        onChange={(url) => updateVariantMedia('heroImageUrl', url || null)}
                        folder="products"
                        aspectRatio="1/1"
                        acceptVideo
                      />
                      <MediaPickerButton
                        label="Media 2"
                        value={variantCarouselImages[0] || null}
                        onChange={(url) => updateVariantCarousel(0, url)}
                        folder="products"
                        aspectRatio="1/1"
                        acceptVideo
                      />
                      <MediaPickerButton
                        label="Media 3"
                        value={variantCarouselImages[1] || null}
                        onChange={(url) => updateVariantCarousel(1, url)}
                        folder="products"
                        aspectRatio="1/1"
                        acceptVideo
                      />
                      <MediaPickerButton
                        label="Media 4"
                        value={variantCarouselImages[2] || null}
                        onChange={(url) => updateVariantCarousel(2, url)}
                        folder="products"
                        aspectRatio="1/1"
                        acceptVideo
                      />
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-[var(--admin-border-light)] rounded-lg mb-6">
                <p className="text-sm text-[var(--admin-text-muted)]">
                  Add at least one variant above to upload media
                </p>
              </div>
            )}

            {/* Badge Configuration */}
            <div className="pt-6 border-t border-[var(--admin-border-light)]">
              <h4 className="text-sm font-medium text-[var(--admin-text-primary)] mb-4">
                Badge (Optional)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                    Badge Text
                  </label>
                  <Input
                    value={product.badge || ''}
                    onChange={(e) => setProduct({ ...product, badge: e.target.value || null })}
                    placeholder="Bestseller"
                    className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                    Emoji
                  </label>
                  <Input
                    value={product.badgeEmoji || ''}
                    onChange={(e) => setProduct({ ...product, badgeEmoji: e.target.value || null })}
                    placeholder="🔥"
                    className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={product.badgeBgColor || '#1a1a1a'}
                      onChange={(e) => setProduct({ ...product, badgeBgColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border border-[var(--admin-border-light)]"
                    />
                    <Input
                      value={product.badgeBgColor || '#1a1a1a'}
                      onChange={(e) => setProduct({ ...product, badgeBgColor: e.target.value })}
                      className="flex-1 bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={product.badgeTextColor || '#ffffff'}
                      onChange={(e) => setProduct({ ...product, badgeTextColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border border-[var(--admin-border-light)]"
                    />
                    <Input
                      value={product.badgeTextColor || '#ffffff'}
                      onChange={(e) => setProduct({ ...product, badgeTextColor: e.target.value })}
                      className="flex-1 bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Benefit Drawers */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <h3 className="text-sm font-medium text-[var(--admin-text-primary)] mb-2">
              Benefit Drawers
            </h3>
            <p className="text-xs text-[var(--admin-text-muted)] mb-4">
              Expandable sections on the product page. Only populated drawers will appear.
            </p>
            <div className="space-y-4">
              {/* Drawer 1 */}
              <div className="p-4 border border-[var(--admin-border-light)] rounded-lg space-y-3">
                <Input
                  value={product.ritualTitle || ''}
                  onChange={(e) => setProduct({ ...product, ritualTitle: e.target.value })}
                  placeholder="Drawer 1 Title (e.g., The Ritual)"
                  className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                />
                <RichTextEditor
                  value={product.ritualContent || ''}
                  onChange={(value) => setProduct({ ...product, ritualContent: value })}
                  placeholder="Content..."
                />
              </div>
              {/* Drawer 2 */}
              <div className="p-4 border border-[var(--admin-border-light)] rounded-lg space-y-3">
                <Input
                  value={product.ingredientsTitle || ''}
                  onChange={(e) => setProduct({ ...product, ingredientsTitle: e.target.value })}
                  placeholder="Drawer 2 Title (e.g., Ingredients)"
                  className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                />
                <RichTextEditor
                  value={product.ingredientsContent || ''}
                  onChange={(value) => setProduct({ ...product, ingredientsContent: value })}
                  placeholder="Content..."
                />
              </div>
              {/* Drawer 3 */}
              <div className="p-4 border border-[var(--admin-border-light)] rounded-lg space-y-3">
                <Input
                  value={product.shippingTitle || ''}
                  onChange={(e) => setProduct({ ...product, shippingTitle: e.target.value })}
                  placeholder="Drawer 3 Title (e.g., Good to Know)"
                  className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                />
                <RichTextEditor
                  value={product.shippingContent || ''}
                  onChange={(value) => setProduct({ ...product, shippingContent: value })}
                  placeholder="Content..."
                />
              </div>
            </div>
          </div>

          {/* Section 5: CTA Configuration */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <h3 className="text-sm font-medium text-[var(--admin-text-primary)] mb-4">
              CTA Button
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                  Button Text
                </label>
                <Input
                  value={product.ctaButtonText || ''}
                  onChange={(e) => setProduct({ ...product, ctaButtonText: e.target.value })}
                  placeholder="Buy Now on Amazon"
                  className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="text-sm font-medium text-[var(--admin-text-primary)]">
                    Show discount signup
                  </span>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    "Get X% off" link below the CTA button
                  </p>
                </div>
                <button
                  onClick={() => setProduct({ ...product, showDiscountSignup: !product.showDiscountSignup })}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    product.showDiscountSignup ? 'bg-green-500' : 'bg-[var(--admin-hover)]'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      product.showDiscountSignup ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
              {product.showDiscountSignup && (
                <Input
                  value={product.discountSignupText || ''}
                  onChange={(e) => setProduct({ ...product, discountSignupText: e.target.value })}
                  placeholder="Get 10% off your first order"
                  className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                />
              )}
            </div>
          </div>

          {/* Section 6: SEO */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
            <h3 className="text-sm font-medium text-[var(--admin-text-primary)] mb-4">
              SEO
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                  Meta Title
                </label>
                <Input
                  value={product.metaTitle || ''}
                  onChange={(e) => setProduct({ ...product, metaTitle: e.target.value || null })}
                  placeholder={`${product.name || 'Product'} | Archie's Remedies`}
                  className="bg-[var(--admin-input)] border-[var(--admin-border-light)] text-[var(--admin-text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--admin-text-secondary)] mb-1.5">
                  Meta Description
                </label>
                <textarea
                  value={product.metaDescription || ''}
                  onChange={(e) => setProduct({ ...product, metaDescription: e.target.value || null })}
                  placeholder="Description for search engines..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] resize-none focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Additional Content Tab */
        <div className="flex h-[calc(100vh-140px)]">
          {/* Widget List */}
          <div
            className="flex-1 p-6 overflow-y-auto"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                    Below-Fold Content
                  </h2>
                  <p className="text-sm text-[var(--admin-text-muted)] mt-1">
                    Drag widgets from the library to add content below the product hero
                  </p>
                </div>
                {widgets.length > 0 && (
                  <span className="px-3 py-1 text-sm bg-[var(--admin-input)] rounded-full text-[var(--admin-text-primary)]">
                    {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {widgets.length > 0 ? (
                <Reorder.Group
                  axis="y"
                  values={widgets}
                  onReorder={setWidgets}
                  className="space-y-3"
                >
                  {widgets.map((widget, index) => (
                    <DraggableWidgetRow
                      key={widget.id}
                      widget={widget}
                      index={index}
                      onUpdate={updateWidget}
                      onDelete={deleteWidget}
                    />
                  ))}
                </Reorder.Group>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-[var(--admin-border-light)] rounded-xl bg-[var(--admin-input)]/30">
                  <Layers className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)] opacity-50" />
                  <p className="text-[var(--admin-text-muted)] font-medium mb-2">
                    No widgets added yet
                  </p>
                  <p className="text-sm text-[var(--admin-text-muted)]">
                    Drag widgets from the library on the right, or click to add
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Widget Library Sidebar */}
          <div className="w-80 flex-shrink-0 border-l border-[var(--admin-border)] overflow-y-auto bg-[var(--admin-sidebar)]">
            <WidgetLibrarySidebar
              title="Widget Library"
              subtitle="Drag or click to add"
              onAddWidget={addWidget}
              storageKey="product-widget-order"
            />
          </div>
        </div>
      )}
    </div>
  );
}
