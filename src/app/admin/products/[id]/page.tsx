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
  ImageIcon,
  Layers,
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
  // Badge
  badge: string | null;
  badgeEmoji: string | null;
  badgeBgColor: string | null;
  badgeTextColor: string | null;
  rotatingBadgeEnabled: boolean | null;
  rotatingBadgeText: string | null;
  // Rating
  rating: number | null;
  reviewCount: number | null;
  // Rotating Seal
  rotatingSealEnabled: boolean | null;
  rotatingSealImageUrl: string | null;
  // Accordions
  ritualTitle: string | null;
  ritualContent: string | null;
  ingredientsTitle: string | null;
  ingredientsContent: string | null;
  shippingTitle: string | null;
  shippingContent: string | null;
  // Bullet Points
  bulletPoint1: string | null;
  bulletPoint2: string | null;
  bulletPoint3: string | null;
  bulletPoint4: string | null;
  bulletPoint5: string | null;
  // CTA
  ctaButtonText: string | null;
  ctaExternalUrl: string | null;
  showDiscountSignup: boolean | null;
  discountSignupText: string | null;
  // Widgets
  widgets: string | null;
  // SEO
  metaTitle: string | null;
  metaDescription: string | null;
  // Status
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
      className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4">
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-[var(--admin-hover)] rounded"
        >
          <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)]" />
        </div>

        <span className="w-6 h-6 flex items-center justify-center text-xs font-mono bg-[var(--admin-input)] rounded">
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

      // Parse widgets from JSON
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

      // Count existing bullet points
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

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    if (!product) return;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setProduct({ ...product, name, slug: isNew || !product.slug ? slug : product.slug });
  };

  // Save handler
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

  // Delete handler
  const handleDelete = async () => {
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  // Toggle status
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

  // View handler with preview token
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
    setVariants([
      ...variants,
      {
        id: `new-${Date.now()}`,
        name: '',
        price: null,
        compareAtPrice: null,
        amazonUrl: '',
        isDefault: variants.length === 0,
        sortOrder: variants.length,
      },
    ]);
  };

  const removeVariant = (variantId: string) => {
    setVariants(variants.filter((v) => v.id !== variantId));
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

  // Handle drop from library
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

  // Loading state
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

  return (
    <div className="min-h-screen">
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
      <div className="border-b border-[var(--admin-border)] bg-[var(--admin-card)]">
        <div className="px-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('details')}
              className={cn(
                'py-4 text-sm font-medium border-b-2 transition-colors',
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
                'py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'content'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]'
              )}
            >
              Additional Content
              {widgets.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-[var(--admin-input)] rounded-full">
                  {widgets.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' ? (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
          {/* Product Info + Pricing Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Info */}
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                Product Info
              </h3>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                  Product Name *
                </label>
                <Input
                  value={product.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Dry Eye Relief Drops"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                  Short Description
                </label>
                <textarea
                  value={product.shortDescription || ''}
                  onChange={(e) => setProduct({ ...product, shortDescription: e.target.value })}
                  placeholder="Brief description..."
                  rows={3}
                  className="flex w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input)] px-3 py-2 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                  URL Slug *
                </label>
                <Input
                  value={product.slug}
                  onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                  placeholder="eye-drops"
                />
                <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                  /products/{product.slug || 'your-slug'}
                </p>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                Pricing
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                    Price ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={product.price || ''}
                    onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || null })}
                    placeholder="24.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                    Compare at ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={product.compareAtPrice || ''}
                    onChange={(e) =>
                      setProduct({ ...product, compareAtPrice: parseFloat(e.target.value) || null })
                    }
                    placeholder="29.99"
                  />
                </div>
              </div>

              {/* Rating & Reviews in same card */}
              <div className="pt-4 border-t border-[var(--admin-border)]">
                <h4 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-3">
                  Rating & Reviews
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
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
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                      Review Count
                    </label>
                    <Input
                      type="number"
                      value={product.reviewCount || ''}
                      onChange={(e) => setProduct({ ...product, reviewCount: parseInt(e.target.value) || null })}
                      placeholder="2900"
                    />
                  </div>
                </div>
                <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                  Used in nav, homepage tiles, and PDP
                </p>
              </div>
            </div>
          </div>

          {/* Hero Media Section - 4 images like blog */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-2">
              <ImageIcon className="w-4 h-4 inline mr-2" />
              Hero Media (4 max)
            </h3>
            <p className="text-xs text-[var(--admin-text-muted)] mb-4">
              Media 1 is the featured hero image/video. Media 2-4 appear as gallery thumbnails.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Media 1 - Featured */}
              <MediaPickerButton
                label="Media 1 - Featured"
                value={product.heroImageUrl}
                onChange={(url) => setProduct({ ...product, heroImageUrl: url || null })}
                folder="products"
                aspectRatio="1/1"
                acceptVideo
              />

              {/* Media 2-4 - Carousel images */}
              {[0, 1, 2].map((index) => {
                const currentUrl = carouselImages[index] || null;

                return (
                  <MediaPickerButton
                    key={index}
                    label={`Media ${index + 2}`}
                    value={currentUrl}
                    onChange={(url) => {
                      const newImages = [...carouselImages];
                      while (newImages.length < index + 1) {
                        newImages.push('');
                      }
                      if (url) {
                        newImages[index] = url;
                      } else {
                        newImages[index] = '';
                      }
                      const filtered = newImages.filter(Boolean);
                      setProduct({
                        ...product,
                        heroCarouselImages: filtered.length > 0 ? JSON.stringify(filtered) : null,
                      });
                    }}
                    folder="products"
                    aspectRatio="1/1"
                    acceptVideo
                  />
                );
              })}
            </div>
          </div>

          {/* Badge Configuration */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-4">
              Badge (Optional)
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                  Badge Text
                </label>
                <Input
                  value={product.badge || ''}
                  onChange={(e) => setProduct({ ...product, badge: e.target.value || null })}
                  placeholder="Bestseller"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                  Emoji
                </label>
                <Input
                  value={product.badgeEmoji || ''}
                  onChange={(e) => setProduct({ ...product, badgeEmoji: e.target.value || null })}
                  placeholder="🔥"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                  Background
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={product.badgeBgColor || '#1a1a1a'}
                    onChange={(e) => setProduct({ ...product, badgeBgColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border border-[var(--admin-border)]"
                  />
                  <Input
                    value={product.badgeBgColor || '#1a1a1a'}
                    onChange={(e) => setProduct({ ...product, badgeBgColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={product.badgeTextColor || '#ffffff'}
                    onChange={(e) => setProduct({ ...product, badgeTextColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border border-[var(--admin-border)]"
                  />
                  <Input
                    value={product.badgeTextColor || '#ffffff'}
                    onChange={(e) => setProduct({ ...product, badgeTextColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits / Bullet Points */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-2">
              Key Benefits
            </h3>
            <p className="text-xs text-[var(--admin-text-muted)] mb-4">
              Shown with green checkmarks on the product page
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {Array.from({ length: bulletPointCount }).map((_, i) => {
                const key = `bulletPoint${i + 1}` as keyof Product;
                return (
                  <Input
                    key={i}
                    value={(product[key] as string) || ''}
                    onChange={(e) =>
                      setProduct({ ...product, [key]: e.target.value || null })
                    }
                    placeholder={`Benefit ${i + 1}`}
                  />
                );
              })}
            </div>
            {bulletPointCount < 5 && (
              <button
                onClick={() => setBulletPointCount(bulletPointCount + 1)}
                className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline mt-4"
              >
                <Plus className="w-3 h-3" />
                Add another
              </button>
            )}
          </div>

          {/* CTA Configuration */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-4">
              CTA Button
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                  Button Text
                </label>
                <Input
                  value={product.ctaButtonText || ''}
                  onChange={(e) => setProduct({ ...product, ctaButtonText: e.target.value })}
                  placeholder="Buy Now on Amazon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                  External URL (optional)
                </label>
                <Input
                  value={product.ctaExternalUrl || ''}
                  onChange={(e) => setProduct({ ...product, ctaExternalUrl: e.target.value || null })}
                  placeholder="https://amazon.com/..."
                />
                <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                  Overrides variant Amazon URL
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--admin-border)] flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-[var(--admin-text-secondary)]">
                  Show discount signup
                </span>
                <p className="text-xs text-[var(--admin-text-muted)]">
                  "Get X% off" link below CTA
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
              <div className="mt-3">
                <Input
                  value={product.discountSignupText || ''}
                  onChange={(e) => setProduct({ ...product, discountSignupText: e.target.value })}
                  placeholder="Get 10% off your first order"
                />
              </div>
            )}
          </div>

          {/* Accordion Drawers */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-2">
              Accordion Drawers
            </h3>
            <p className="text-xs text-[var(--admin-text-muted)] mb-4">
              Only drawers with content will appear on the product page
            </p>
            <div className="space-y-6">
              {/* Drawer 1 */}
              <div className="p-4 border border-[var(--admin-border)] rounded-lg space-y-3">
                <Input
                  value={product.ritualTitle || ''}
                  onChange={(e) => setProduct({ ...product, ritualTitle: e.target.value })}
                  placeholder="Title (e.g., The Ritual)"
                />
                <RichTextEditor
                  value={product.ritualContent || ''}
                  onChange={(value) => setProduct({ ...product, ritualContent: value })}
                  placeholder="Content..."
                />
              </div>
              {/* Drawer 2 */}
              <div className="p-4 border border-[var(--admin-border)] rounded-lg space-y-3">
                <Input
                  value={product.ingredientsTitle || ''}
                  onChange={(e) => setProduct({ ...product, ingredientsTitle: e.target.value })}
                  placeholder="Title (e.g., Ingredients)"
                />
                <RichTextEditor
                  value={product.ingredientsContent || ''}
                  onChange={(value) => setProduct({ ...product, ingredientsContent: value })}
                  placeholder="Content..."
                />
              </div>
              {/* Drawer 3 */}
              <div className="p-4 border border-[var(--admin-border)] rounded-lg space-y-3">
                <Input
                  value={product.shippingTitle || ''}
                  onChange={(e) => setProduct({ ...product, shippingTitle: e.target.value })}
                  placeholder="Title (e.g., Good to Know)"
                />
                <RichTextEditor
                  value={product.shippingContent || ''}
                  onChange={(value) => setProduct({ ...product, shippingContent: value })}
                  placeholder="Content..."
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-4">
              Variants
            </h3>
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="p-4 border border-[var(--admin-border)] rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--admin-text-secondary)]">
                      Variant {index + 1}
                    </span>
                    <button
                      onClick={() => removeVariant(variant.id)}
                      className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input
                      value={variant.name}
                      onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                      placeholder="Variant name (e.g., 30 Count)"
                    />
                    <Input
                      value={variant.amazonUrl}
                      onChange={(e) => updateVariant(variant.id, 'amazonUrl', e.target.value)}
                      placeholder="Amazon URL"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Input
                      type="number"
                      step="0.01"
                      value={variant.price || ''}
                      onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || null)}
                      placeholder="Price"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={variant.compareAtPrice || ''}
                      onChange={(e) =>
                        updateVariant(variant.id, 'compareAtPrice', parseFloat(e.target.value) || null)
                      }
                      placeholder="Compare at"
                    />
                    <label className="flex items-center gap-2 text-sm col-span-2">
                      <input
                        type="checkbox"
                        checked={variant.isDefault ?? false}
                        onChange={(e) => {
                          setVariants(
                            variants.map((v) => ({
                              ...v,
                              isDefault: v.id === variant.id ? e.target.checked : false,
                            }))
                          );
                        }}
                        className="rounded"
                      />
                      Default variant
                    </label>
                  </div>
                </div>
              ))}
              <button
                onClick={addVariant}
                className="w-full py-3 border-2 border-dashed border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-4">
              SEO
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                  Meta Title
                </label>
                <Input
                  value={product.metaTitle || ''}
                  onChange={(e) => setProduct({ ...product, metaTitle: e.target.value || null })}
                  placeholder={`${product.name || 'Product'} | Archie's Remedies`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                  Meta Description
                </label>
                <textarea
                  value={product.metaDescription || ''}
                  onChange={(e) => setProduct({ ...product, metaDescription: e.target.value || null })}
                  placeholder="Description for search engines..."
                  rows={3}
                  className="flex w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input)] px-3 py-2 text-sm resize-none"
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
                    <Layers className="w-5 h-5 inline mr-2" />
                    Below-Fold Content
                  </h2>
                  <p className="text-sm text-[var(--admin-text-muted)] mt-1">
                    Drag widgets from the library to add content below the product hero
                  </p>
                </div>
                {widgets.length > 0 && (
                  <span className="px-3 py-1 text-sm bg-[var(--admin-input)] rounded-full">
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
                <div className="py-20 text-center border-2 border-dashed border-[var(--admin-border)] rounded-xl bg-[var(--admin-input)]/50">
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
          <div className="w-80 flex-shrink-0 border-l border-[var(--admin-border)] overflow-y-auto">
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
