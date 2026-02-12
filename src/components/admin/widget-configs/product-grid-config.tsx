'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Play, ImageIcon, Loader2 } from 'lucide-react';
import { MediaPickerButton } from '@/components/admin/media-picker';

// ============================================
// TYPES
// ============================================

export interface ProductOverride {
  productId: string | null;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  hoverImageUrl: string | null;
  badge: string | null;
  badgeEmoji: string | null;
  badgeBgColor: string | null;
  badgeTextColor: string | null;
}

export interface ProductGridConfig {
  title: string;
  subtitle: string;
  product1: ProductOverride;
  product2: ProductOverride;
}

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  heroImageUrl: string | null;
  secondaryImageUrl: string | null;
  badge: string | null;
  badgeEmoji: string | null;
}

interface ProductGridConfigProps {
  config: ProductGridConfig;
  onConfigChange: (config: ProductGridConfig) => void;
  products?: ProductOption[];
}

// ============================================
// HELPERS
// ============================================

function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.match(/\.(mp4|webm|mov)$/i) !== null || lowerUrl.includes('/video/upload/');
}

const DEFAULT_PRODUCT_OVERRIDE: ProductOverride = {
  productId: null,
  title: null,
  description: null,
  imageUrl: null,
  hoverImageUrl: null,
  badge: null,
  badgeEmoji: null,
  badgeBgColor: null,
  badgeTextColor: null,
};

// ============================================
// MAIN COMPONENT
// ============================================

export function ProductGridConfig({
  config,
  onConfigChange,
  products: externalProducts,
}: ProductGridConfigProps) {
  const [expandedTile, setExpandedTile] = useState<1 | 2 | null>(null);
  const [fetchedProducts, setFetchedProducts] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use externally provided products or fetch our own
  const products = externalProducts || fetchedProducts;

  // Fetch products if not provided externally
  useEffect(() => {
    const fetchProducts = async () => {
      if (!externalProducts) {
        setIsLoading(true);
        try {
          const res = await fetch('/api/admin/products');
          const data = await res.json();
          // API returns array directly, not { products: [...] }
          const productList = Array.isArray(data) ? data : (data.products || []);
          setFetchedProducts(productList.map((p: { id: string; name: string; slug: string; shortDescription: string | null; heroImageUrl: string | null; secondaryImageUrl: string | null; badge: string | null; badgeEmoji: string | null }) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            shortDescription: p.shortDescription,
            heroImageUrl: p.heroImageUrl,
            secondaryImageUrl: p.secondaryImageUrl,
            badge: p.badge,
            badgeEmoji: p.badgeEmoji,
          })));
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchProducts();
  }, [externalProducts]);

  const updateConfig = (updates: Partial<ProductGridConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const updateProduct = (key: 'product1' | 'product2', updates: Partial<ProductOverride>) => {
    onConfigChange({
      ...config,
      [key]: { ...config[key], ...updates },
    });
  };

  const getProductById = (id: string | null) => products.find(p => p.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--admin-text-muted)]" />
        <span className="ml-2 text-sm text-[var(--admin-text-muted)]">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Title & Subtitle */}
      <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-5">
        <h3 className="text-sm font-medium text-[var(--admin-text-primary)] mb-4">Section Header</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={config.title || ''}
              onChange={(e) => updateConfig({ title: e.target.value })}
              placeholder="Clean Formulas for Sensitive Eyes"
              className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
              Subtitle
            </label>
            <input
              type="text"
              value={config.subtitle || ''}
              onChange={(e) => updateConfig({ subtitle: e.target.value })}
              placeholder="Preservative-free eye care, crafted without the questionable ingredients."
              className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* Product Tile 1 */}
      <ProductTileConfig
        tileNumber={1}
        override={config.product1 || DEFAULT_PRODUCT_OVERRIDE}
        onOverrideChange={(updates) => updateProduct('product1', updates)}
        products={products}
        getProductById={getProductById}
        isExpanded={expandedTile === 1}
        onToggleExpand={() => setExpandedTile(expandedTile === 1 ? null : 1)}
      />

      {/* Product Tile 2 */}
      <ProductTileConfig
        tileNumber={2}
        override={config.product2 || DEFAULT_PRODUCT_OVERRIDE}
        onOverrideChange={(updates) => updateProduct('product2', updates)}
        products={products}
        getProductById={getProductById}
        isExpanded={expandedTile === 2}
        onToggleExpand={() => setExpandedTile(expandedTile === 2 ? null : 2)}
      />
    </div>
  );
}

// ============================================
// PRODUCT TILE CONFIG
// ============================================

interface ProductTileConfigProps {
  tileNumber: 1 | 2;
  override: ProductOverride;
  onOverrideChange: (updates: Partial<ProductOverride>) => void;
  products: ProductOption[];
  getProductById: (id: string | null) => ProductOption | undefined;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function ProductTileConfig({
  tileNumber,
  override,
  onOverrideChange,
  products,
  getProductById,
  isExpanded,
  onToggleExpand,
}: ProductTileConfigProps) {
  const selectedProduct = getProductById(override.productId);
  const displayTitle = override.title || selectedProduct?.name || `Product ${tileNumber}`;
  const displayImage = override.imageUrl || selectedProduct?.heroImageUrl;
  const isVideo = isVideoUrl(displayImage);

  return (
    <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full flex items-center gap-4 p-5 hover:bg-[var(--admin-hover)] transition-colors"
      >
        {/* Thumbnail */}
        <div className="w-16 h-20 rounded-lg overflow-hidden bg-[var(--admin-hover)] flex-shrink-0 relative">
          {displayImage ? (
            isVideo ? (
              <>
                <video
                  src={displayImage}
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </>
            ) : (
              <Image
                src={displayImage}
                alt={displayTitle}
                width={64}
                height={80}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-[var(--admin-text-muted)]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-[var(--admin-text-primary)]">
            Product Tile {tileNumber}
          </p>
          <p className="text-sm text-[var(--admin-text-muted)] truncate">
            {displayTitle}
          </p>
        </div>

        {/* Expand icon */}
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[var(--admin-text-muted)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--admin-text-muted)]" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-5 pt-0 space-y-5 border-t border-[var(--admin-border)]">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
              Select Product
            </label>
            <select
              value={override.productId || ''}
              onChange={(e) => {
                const productId = e.target.value || null;
                const product = getProductById(productId);
                onOverrideChange({
                  productId,
                  // Pre-fill with product defaults if clearing overrides
                  title: null,
                  description: null,
                  imageUrl: null,
                  hoverImageUrl: null,
                  badge: product?.badge || null,
                  badgeEmoji: product?.badgeEmoji || null,
                });
              }}
              className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] text-sm focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="">Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title Override */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
              Title Override
            </label>
            <input
              type="text"
              value={override.title || ''}
              onChange={(e) => onOverrideChange({ title: e.target.value || null })}
              placeholder={selectedProduct?.name || 'Product title'}
              className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] text-sm focus:outline-none focus:border-[var(--primary)]"
            />
            <p className="text-xs text-[var(--admin-text-muted)] mt-1">
              Leave empty to use product name
            </p>
          </div>

          {/* Description Override */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
              Description Override
            </label>
            <textarea
              value={override.description || ''}
              onChange={(e) => onOverrideChange({ description: e.target.value || null })}
              placeholder={selectedProduct?.shortDescription || 'Product description'}
              rows={2}
              className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] text-sm focus:outline-none focus:border-[var(--primary)] resize-none"
            />
            <p className="text-xs text-[var(--admin-text-muted)] mt-1">
              Leave empty to use product description
            </p>
          </div>

          {/* Media Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Primary Image/Video */}
            <div>
              <MediaPickerButton
                label="Primary Image/Video"
                value={override.imageUrl || ''}
                onChange={(url) => onOverrideChange({ imageUrl: url || null })}
                helpText="Overrides product image"
                folder="products"
                acceptVideo={true}
              />
            </div>

            {/* Hover Image/Video */}
            <div>
              <MediaPickerButton
                label="Hover Image/Video"
                value={override.hoverImageUrl || ''}
                onChange={(url) => onOverrideChange({ hoverImageUrl: url || null })}
                helpText="Shown on hover (optional)"
                folder="products"
                acceptVideo={true}
              />
            </div>
          </div>

          {/* Badge Section */}
          <div className="bg-[var(--admin-bg)] rounded-lg p-4 border border-[var(--admin-border)]">
            <h4 className="text-sm font-medium text-[var(--admin-text-primary)] mb-3">Badge</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Badge Emoji */}
              <div>
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                  Emoji
                </label>
                <input
                  type="text"
                  value={override.badgeEmoji || ''}
                  onChange={(e) => onOverrideChange({ badgeEmoji: e.target.value || null })}
                  placeholder="🔥"
                  className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Badge Text */}
              <div>
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                  Text
                </label>
                <input
                  type="text"
                  value={override.badge || ''}
                  onChange={(e) => onOverrideChange({ badge: e.target.value || null })}
                  placeholder="Best Seller"
                  className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Badge Background Color */}
              <div>
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={override.badgeBgColor || '#ffffff'}
                    onChange={(e) => onOverrideChange({ badgeBgColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-[var(--admin-border)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={override.badgeBgColor || ''}
                    onChange={(e) => onOverrideChange({ badgeBgColor: e.target.value || null })}
                    placeholder="#ffffff"
                    className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Badge Text Color */}
              <div>
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                  Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={override.badgeTextColor || '#1a1a1a'}
                    onChange={(e) => onOverrideChange({ badgeTextColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-[var(--admin-border)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={override.badgeTextColor || ''}
                    onChange={(e) => onOverrideChange({ badgeTextColor: e.target.value || null })}
                    placeholder="#1a1a1a"
                    className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Badge Preview */}
            {(override.badge || override.badgeEmoji) && (
              <div className="mt-4 pt-4 border-t border-[var(--admin-border)]">
                <p className="text-xs text-[var(--admin-text-muted)] mb-2">Preview:</p>
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{
                    backgroundColor: override.badgeBgColor || '#ffffff',
                    color: override.badgeTextColor || '#1a1a1a',
                  }}
                >
                  {override.badgeEmoji && <span>{override.badgeEmoji}</span>}
                  {override.badge}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductGridConfig;
