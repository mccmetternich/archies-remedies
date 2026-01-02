'use client';

import React from 'react';
import { motion, Reorder } from 'framer-motion';
import Image from 'next/image';
import {
  GripVertical,
  X,
  Monitor,
  Smartphone,
  AlignLeft,
  AlignCenter,
  Image as ImageIcon,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { InternalLinkSelector } from '@/components/admin/internal-link-selector';
import type { GlobalNavSettings, ProductOption, PageOption } from './types';

interface HeaderNavEditorProps {
  navSubTab: 'settings' | 'pages' | 'dropdown';
  globalNavSettings: GlobalNavSettings;
  setGlobalNavSettings: (settings: GlobalNavSettings) => void;
  products: ProductOption[];
  pagesList: PageOption[];
  setPagesList: (pages: PageOption[]) => void;
  draggingPageId: string | null;
  setDraggingPageId: (id: string | null) => void;
  dragOverSection: string | null;
  setDragOverSection: (section: string | null) => void;
}

export function HeaderNavEditor({
  navSubTab,
  globalNavSettings,
  setGlobalNavSettings,
  products,
  pagesList,
  setPagesList,
  draggingPageId,
  setDraggingPageId,
  dragOverSection,
  setDragOverSection,
}: HeaderNavEditorProps) {
  // Get selected product for preview
  const getProductById = (id: string | null) => products.find(p => p.id === id);

  // Drag handlers for available pages
  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    e.dataTransfer.setData('pageId', pageId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingPageId(pageId);
  };

  const handleDragEnd = () => {
    setDraggingPageId(null);
    setDragOverSection(null);
  };

  const handleDragOver = (e: React.DragEvent, section: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSection(section);
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
  };

  const handleDrop = (e: React.DragEvent, targetPosition: 'left' | 'center' | 'right') => {
    e.preventDefault();
    const pageId = e.dataTransfer.getData('pageId');
    if (!pageId) return;

    const maxOrder = Math.max(0, ...pagesList.filter(p => p.showInNav && p.navPosition === targetPosition).map(p => p.navOrder || 0));
    setPagesList(pagesList.map(p =>
      p.id === pageId ? { ...p, showInNav: true, navOrder: maxOrder + 1, navPosition: targetPosition, navShowOnDesktop: true, navShowOnMobile: true } : p
    ));
    setDraggingPageId(null);
    setDragOverSection(null);
  };

  // Header Settings Sub-tab
  if (navSubTab === 'settings') {
    return (
      <div className="space-y-6">
        {/* Logo Position */}
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
          <div className="p-6 border-b border-[var(--admin-border)]">
            <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Logo Position</h2>
            <p className="text-sm text-[var(--admin-text-secondary)]">
              Control where the logo appears in the navigation bar
            </p>
          </div>
          <div className="p-6 space-y-6">
            {/* Desktop */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)] mb-3">
                <Monitor className="w-4 h-4" />
                Desktop
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setGlobalNavSettings({ ...globalNavSettings, logoPosition: 'left' })}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                    globalNavSettings.logoPosition === 'left'
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]"
                  )}
                >
                  <AlignLeft className="w-4 h-4" />
                  <span className="text-sm text-[var(--admin-text-primary)]">Left</span>
                </button>
                <button
                  onClick={() => setGlobalNavSettings({ ...globalNavSettings, logoPosition: 'center' })}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                    globalNavSettings.logoPosition === 'center'
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]"
                  )}
                >
                  <AlignCenter className="w-4 h-4" />
                  <span className="text-sm text-[var(--admin-text-primary)]">Center</span>
                </button>
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)] mb-3">
                <Smartphone className="w-4 h-4" />
                Mobile
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setGlobalNavSettings({ ...globalNavSettings, logoPositionMobile: 'left' })}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                    globalNavSettings.logoPositionMobile === 'left'
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]"
                  )}
                >
                  <AlignLeft className="w-4 h-4" />
                  <span className="text-sm text-[var(--admin-text-primary)]">Left</span>
                </button>
                <button
                  onClick={() => setGlobalNavSettings({ ...globalNavSettings, logoPositionMobile: 'center' })}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                    globalNavSettings.logoPositionMobile === 'center'
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]"
                  )}
                >
                  <AlignCenter className="w-4 h-4" />
                  <span className="text-sm text-[var(--admin-text-primary)]">Center</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
          <div className="p-6 border-b border-[var(--admin-border)]">
            <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">CTA Button</h2>
            <p className="text-sm text-[var(--admin-text-secondary)]">
              Configure the main call-to-action button in the header
            </p>
          </div>
          <div className="p-6 space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-sm font-medium transition-colors",
                !globalNavSettings.ctaEnabled ? "text-red-400" : "text-[var(--admin-text-muted)]"
              )}>
                Disabled
              </span>
              <button
                onClick={() => setGlobalNavSettings({ ...globalNavSettings, ctaEnabled: !globalNavSettings.ctaEnabled })}
                className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--admin-bg)]"
                style={{
                  backgroundColor: globalNavSettings.ctaEnabled ? '#22c55e' : '#ef4444'
                }}
              >
                <span
                  className={cn(
                    "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg",
                    globalNavSettings.ctaEnabled ? "translate-x-9" : "translate-x-1"
                  )}
                />
              </button>
              <span className={cn(
                "text-sm font-medium transition-colors",
                globalNavSettings.ctaEnabled ? "text-green-400" : "text-[var(--admin-text-muted)]"
              )}>
                Enabled
              </span>
            </div>

            {/* Button Text & URL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Button Text</label>
                <input
                  value={globalNavSettings.ctaText}
                  onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, ctaText: e.target.value })}
                  placeholder="Shop Now"
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Button URL</label>
                <InternalLinkSelector
                  value={globalNavSettings.ctaUrl}
                  onChange={(value) => setGlobalNavSettings({ ...globalNavSettings, ctaUrl: value })}
                  placeholder="Select page or enter URL"
                />
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Preview</label>
              <div className="p-4 rounded-lg bg-[var(--admin-hover)] flex justify-center">
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full text-lg font-semibold">
                  {globalNavSettings.ctaText || 'Shop Now'}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dropdown Menu Sub-tab
  if (navSubTab === 'dropdown') {
    return (
      <div className="space-y-6">
        {/* Product Tile 1 */}
        <ProductTileEditor
          tileNumber={1}
          title="Product Tile 1 (Left)"
          description="First product shown in the dropdown menu"
          productId={globalNavSettings.tile1ProductId}
          tileTitle={globalNavSettings.tile1Title}
          subtitle={globalNavSettings.tile1Subtitle}
          badge={globalNavSettings.tile1Badge}
          badgeEmoji={globalNavSettings.tile1BadgeEmoji}
          badgeBgColor={globalNavSettings.tile1BadgeBgColor}
          badgeTextColor={globalNavSettings.tile1BadgeTextColor}
          imageUrl={globalNavSettings.tile1ImageUrl}
          hoverImageUrl={globalNavSettings.tile1HoverImageUrl}
          products={products}
          getProductById={getProductById}
          onProductChange={(productId) => {
            const product = products.find(p => p.id === productId);
            setGlobalNavSettings({
              ...globalNavSettings,
              tile1ProductId: productId || null,
              tile1Title: product?.name || null,
              tile1Subtitle: product?.shortDescription || null,
              tile1Badge: product?.badge || null,
              tile1BadgeEmoji: product?.badgeEmoji || null,
            });
          }}
          onTitleChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile1Title: val || null })}
          onSubtitleChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile1Subtitle: val || null })}
          onBadgeChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile1Badge: val || null })}
          onBadgeEmojiChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile1BadgeEmoji: val || null })}
          onBadgeBgColorChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile1BadgeBgColor: val })}
          onBadgeTextColorChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile1BadgeTextColor: val })}
          onImageUrlChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile1ImageUrl: val || null })}
          onHoverImageUrlChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile1HoverImageUrl: val || null })}
        />

        {/* Product Tile 2 */}
        <ProductTileEditor
          tileNumber={2}
          title="Product Tile 2 (Right)"
          description="Second product shown in the dropdown menu"
          productId={globalNavSettings.tile2ProductId}
          tileTitle={globalNavSettings.tile2Title}
          subtitle={globalNavSettings.tile2Subtitle}
          badge={globalNavSettings.tile2Badge}
          badgeEmoji={globalNavSettings.tile2BadgeEmoji}
          badgeBgColor={globalNavSettings.tile2BadgeBgColor}
          badgeTextColor={globalNavSettings.tile2BadgeTextColor}
          imageUrl={globalNavSettings.tile2ImageUrl}
          hoverImageUrl={globalNavSettings.tile2HoverImageUrl}
          products={products}
          getProductById={getProductById}
          onProductChange={(productId) => {
            const product = products.find(p => p.id === productId);
            setGlobalNavSettings({
              ...globalNavSettings,
              tile2ProductId: productId || null,
              tile2Title: product?.name || null,
              tile2Subtitle: product?.shortDescription || null,
              tile2Badge: product?.badge || null,
              tile2BadgeEmoji: product?.badgeEmoji || null,
            });
          }}
          onTitleChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile2Title: val || null })}
          onSubtitleChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile2Subtitle: val || null })}
          onBadgeChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile2Badge: val || null })}
          onBadgeEmojiChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile2BadgeEmoji: val || null })}
          onBadgeBgColorChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile2BadgeBgColor: val })}
          onBadgeTextColorChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile2BadgeTextColor: val })}
          onImageUrlChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile2ImageUrl: val || null })}
          onHoverImageUrlChange={(val) => setGlobalNavSettings({ ...globalNavSettings, tile2HoverImageUrl: val || null })}
        />

        {/* Marketing Tile (Far Right) */}
        <MarketingTileEditor
          globalNavSettings={globalNavSettings}
          setGlobalNavSettings={setGlobalNavSettings}
        />
      </div>
    );
  }

  // Pages Sub-tab
  if (navSubTab === 'pages') {
    return (
      <div className="space-y-6">
        {/* Current Navigation */}
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
          <div className="p-6 border-b border-[var(--admin-border)]">
            <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Current Navigation</h2>
            <p className="text-sm text-[var(--admin-text-secondary)]">
              Manage pages in the header navigation. Use the position dropdown to place items on the left, center, or right.
            </p>
          </div>

          <div className="p-6">
            {/* Global Navigation - Dropdown Menu */}
            <div className="mb-6 pb-6 border-b border-[var(--admin-border)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">Global Navigation - Dropdown Menu</p>
              <div className="p-4 bg-[var(--admin-hover)] rounded-lg flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium text-[var(--admin-text-primary)]">Shop</p>
                  <p className="text-sm text-[var(--admin-text-muted)]">Dropdown</p>
                </div>
                <span className="px-2 py-1 text-xs bg-[var(--primary)]/20 text-[var(--primary)] rounded-full">
                  Left
                </span>
              </div>
            </div>

            {/* Navigation Sections */}
            {(['left', 'center', 'right'] as const).map((position) => (
              <NavigationSection
                key={position}
                position={position}
                pagesList={pagesList}
                setPagesList={setPagesList}
                draggingPageId={draggingPageId}
                dragOverSection={dragOverSection}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>

        {/* Available Pages */}
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
          <div className="p-6 border-b border-[var(--admin-border)]">
            <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Available Pages</h2>
            <p className="text-sm text-[var(--admin-text-secondary)]">
              Drag pages to the navigation sections above, or use the toggle to add them to the right position.
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-2">
              {pagesList.filter(p => !p.showInNav).map((page) => (
                <motion.div
                  key={page.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, page.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "p-4 bg-[var(--admin-hover)] rounded-lg flex items-center gap-4 cursor-grab active:cursor-grabbing transition-all",
                    draggingPageId === page.id && "opacity-50 ring-2 ring-[var(--primary)]"
                  )}
                >
                  <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--admin-text-primary)]">{page.title}</p>
                    <p className="text-sm text-[var(--admin-text-muted)]">/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[var(--admin-text-muted)]">Add to Nav</span>
                    <button
                      onClick={() => {
                        const maxOrder = Math.max(0, ...pagesList.filter(p => p.showInNav && (p.navPosition === 'right' || !p.navPosition)).map(p => p.navOrder || 0));
                        setPagesList(pagesList.map(p =>
                          p.id === page.id ? { ...p, showInNav: true, navOrder: maxOrder + 1, navPosition: 'right', navShowOnDesktop: true, navShowOnMobile: true } : p
                        ));
                      }}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-[#374151] hover:bg-[#4b5563]"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
              {pagesList.filter(p => !p.showInNav).length === 0 && (
                <p className="text-sm text-[var(--admin-text-muted)] py-8 text-center">All pages are in the navigation</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Product Tile Editor Component
interface ProductTileEditorProps {
  tileNumber: 1 | 2;
  title: string;
  description: string;
  productId: string | null;
  tileTitle: string | null;
  subtitle: string | null;
  badge: string | null;
  badgeEmoji: string | null;
  badgeBgColor: string;
  badgeTextColor: string;
  imageUrl: string | null;
  hoverImageUrl: string | null;
  products: ProductOption[];
  getProductById: (id: string | null) => ProductOption | undefined;
  onProductChange: (id: string) => void;
  onTitleChange: (val: string) => void;
  onSubtitleChange: (val: string) => void;
  onBadgeChange: (val: string) => void;
  onBadgeEmojiChange: (val: string) => void;
  onBadgeBgColorChange: (val: string) => void;
  onBadgeTextColorChange: (val: string) => void;
  onImageUrlChange: (val: string | null) => void;
  onHoverImageUrlChange: (val: string | null) => void;
}

function ProductTileEditor({
  tileNumber,
  title,
  description,
  productId,
  tileTitle,
  subtitle,
  badge,
  badgeEmoji,
  badgeBgColor,
  badgeTextColor,
  imageUrl,
  hoverImageUrl,
  products,
  getProductById,
  onProductChange,
  onTitleChange,
  onSubtitleChange,
  onBadgeChange,
  onBadgeEmojiChange,
  onBadgeBgColorChange,
  onBadgeTextColorChange,
  onImageUrlChange,
  onHoverImageUrlChange,
}: ProductTileEditorProps) {
  const groupClass = `group/tile${tileNumber}`;

  return (
    <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
      <div className="p-6 border-b border-[var(--admin-border)]">
        <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">{title}</h2>
        <p className="text-sm text-[var(--admin-text-secondary)]">{description}</p>
      </div>
      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left side - Form fields */}
          <div className="space-y-4">
            {/* Product Selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Select Product</label>
              <select
                value={productId || ''}
                onChange={(e) => onProductChange(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              >
                <option value="">Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Override Title */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Title Override <span className="text-[var(--admin-text-muted)]">(optional)</span>
              </label>
              <input
                value={tileTitle || ''}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder={getProductById(productId)?.name || 'Product name'}
                className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            {/* Override Subtitle */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Subtitle Override <span className="text-[var(--admin-text-muted)]">(optional)</span>
              </label>
              <input
                value={subtitle || ''}
                onChange={(e) => onSubtitleChange(e.target.value)}
                placeholder={getProductById(productId)?.shortDescription || 'Product description'}
                className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            {/* Badge */}
            <div className="space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Emoji</label>
                  <input
                    value={badgeEmoji || ''}
                    onChange={(e) => onBadgeEmojiChange(e.target.value)}
                    placeholder={tileNumber === 1 ? "..." : "..."}
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors text-center text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Badge Text</label>
                  <input
                    value={badge || ''}
                    onChange={(e) => onBadgeChange(e.target.value)}
                    placeholder={tileNumber === 1 ? "Bestseller" : "New"}
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>
              {/* Badge Colors */}
              {(badge || badgeEmoji) && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={badgeBgColor}
                        onChange={(e) => onBadgeBgColorChange(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={badgeBgColor}
                        onChange={(e) => onBadgeBgColorChange(e.target.value)}
                        placeholder="#1a1a1a"
                        className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={badgeTextColor}
                        onChange={(e) => onBadgeTextColorChange(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={badgeTextColor}
                        onChange={(e) => onBadgeTextColorChange(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Image Override */}
            <div className="pt-4 border-t border-[var(--admin-border)]">
              <MediaPickerButton
                label="Primary Image/Video Override"
                value={imageUrl}
                onChange={(url) => onImageUrlChange(url || null)}
                helpText="Leave blank to use product image. Supports images and MP4/WebM videos."
                folder="products"
                acceptVideo={true}
              />
            </div>

            {/* Hover Image */}
            <div>
              <MediaPickerButton
                label="Hover Image/Video"
                value={hoverImageUrl}
                onChange={(url) => onHoverImageUrlChange(url || null)}
                helpText="Shown when users hover over the tile. Supports images and MP4/WebM videos."
                folder="products"
                acceptVideo={true}
              />
            </div>
          </div>

          {/* Right side - Live Preview */}
          <div className="lg:sticky lg:top-6">
            <div className="lg:hidden border-t border-[var(--admin-border)] pt-6 mt-2 mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">Preview</h4>
            </div>
            <label className="hidden lg:block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Live Preview</label>
            <div className={`p-5 rounded-2xl bg-white border border-[var(--admin-border)] hover:shadow-md transition-all duration-300 ${groupClass}`}>
              <div className="relative mb-4">
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#f5f5f0] relative">
                  {(() => {
                    const primaryUrl = imageUrl || getProductById(productId)?.heroImageUrl;
                    const hoverUrl = hoverImageUrl;
                    const primaryIsVideo = primaryUrl?.match(/\.(mp4|webm|mov)$/i);
                    const hoverIsVideo = hoverUrl?.match(/\.(mp4|webm|mov)$/i);

                    if (!primaryUrl) {
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-[var(--admin-text-muted)]" />
                        </div>
                      );
                    }

                    return (
                      <>
                        {primaryIsVideo ? (
                          <video
                            src={primaryUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className={`w-full h-full object-cover transition-opacity duration-300 ${hoverUrl ? `group-hover/tile${tileNumber}:opacity-0` : ''}`}
                          />
                        ) : (
                          <Image
                            src={primaryUrl}
                            alt=""
                            width={300}
                            height={300}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${hoverUrl ? `group-hover/tile${tileNumber}:opacity-0` : `group-hover/tile${tileNumber}:scale-105`}`}
                          />
                        )}
                        {hoverUrl && (
                          hoverIsVideo ? (
                            <video
                              src={hoverUrl}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className={`absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile${tileNumber}:opacity-100 transition-opacity duration-300`}
                            />
                          ) : (
                            <Image
                              src={hoverUrl}
                              alt=""
                              width={300}
                              height={300}
                              className={`absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile${tileNumber}:opacity-100 transition-opacity duration-300`}
                            />
                          )
                        )}
                      </>
                    );
                  })()}
                </div>
                {(badge || badgeEmoji) && (
                  <span
                    className="absolute top-3 right-3 text-sm px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5"
                    style={{
                      backgroundColor: badgeBgColor,
                      color: badgeTextColor
                    }}
                  >
                    {badgeEmoji} {badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm text-[#1a1a1a] font-medium">{(getProductById(productId)?.reviewCount || 2900).toLocaleString()}+</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#7CB4B8] text-[#7CB4B8]" />
                  ))}
                </div>
                <span className="text-xs text-[#737373]">Verified Reviews</span>
              </div>
              <h4 className={`text-lg font-medium mb-1 text-[#1a1a1a] group-hover/tile${tileNumber}:text-[#737373] transition-colors`}>
                {tileTitle || getProductById(productId)?.name || 'Product Name'}
              </h4>
              <p className="text-sm text-[#737373]">
                {subtitle || getProductById(productId)?.shortDescription || 'Product description'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Marketing Tile Editor Component
interface MarketingTileEditorProps {
  globalNavSettings: GlobalNavSettings;
  setGlobalNavSettings: (settings: GlobalNavSettings) => void;
}

function MarketingTileEditor({ globalNavSettings, setGlobalNavSettings }: MarketingTileEditorProps) {
  return (
    <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
      <div className="p-6 border-b border-[var(--admin-border)]">
        <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Marketing Tile (Far Right)</h2>
        <p className="text-sm text-[var(--admin-text-secondary)]">
          Information card shown between product tiles in the dropdown
        </p>
      </div>
      <div className="p-6 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Title</label>
          <input
            value={globalNavSettings.marketingTileTitle}
            onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, marketingTileTitle: e.target.value })}
            placeholder="Clean Formulas"
            className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Description</label>
          <textarea
            value={globalNavSettings.marketingTileDescription}
            onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, marketingTileDescription: e.target.value })}
            placeholder="No preservatives, phthalates, parabens, or sulfates."
            rows={3}
            className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
          />
        </div>

        {/* Editable Badges */}
        <div className="pt-4 border-t border-[var(--admin-border)]">
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Badge Labels</label>
          <p className="text-xs text-[var(--admin-text-muted)] mb-3">Customize the text badges displayed on this tile</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={globalNavSettings.marketingTileBadge1}
              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, marketingTileBadge1: e.target.value })}
              placeholder="Preservative-Free"
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm"
            />
            <input
              value={globalNavSettings.marketingTileBadge2}
              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, marketingTileBadge2: e.target.value })}
              placeholder="Paraben-Free"
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm"
            />
            <input
              value={globalNavSettings.marketingTileBadge3}
              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, marketingTileBadge3: e.target.value })}
              placeholder="Sulfate-Free"
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm"
            />
          </div>
        </div>

        {/* CTA Button Toggle */}
        <div className="pt-4 border-t border-[var(--admin-border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-[var(--admin-text-primary)]">CTA Button</p>
              <p className="text-sm text-[var(--admin-text-muted)]">Add a call-to-action button to this tile</p>
            </div>
            <button
              onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileCtaEnabled: !globalNavSettings.marketingTileCtaEnabled })}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{
                backgroundColor: globalNavSettings.marketingTileCtaEnabled ? '#22c55e' : '#374151'
              }}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  globalNavSettings.marketingTileCtaEnabled ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {globalNavSettings.marketingTileCtaEnabled && (
            <div className="space-y-4">
              {/* Desktop/Mobile visibility toggles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-[var(--admin-hover)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[var(--admin-text-muted)]" />
                    <span className="text-sm text-[var(--admin-text-secondary)]">Show on Desktop</span>
                  </div>
                  <button
                    onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileCtaEnabledDesktop: !globalNavSettings.marketingTileCtaEnabledDesktop })}
                    className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                    style={{
                      backgroundColor: globalNavSettings.marketingTileCtaEnabledDesktop ? '#22c55e' : '#374151'
                    }}
                  >
                    <span
                      className={cn(
                        "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                        globalNavSettings.marketingTileCtaEnabledDesktop ? "translate-x-4" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--admin-hover)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[var(--admin-text-muted)]" />
                    <span className="text-sm text-[var(--admin-text-secondary)]">Show on Mobile</span>
                  </div>
                  <button
                    onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileCtaEnabledMobile: !globalNavSettings.marketingTileCtaEnabledMobile })}
                    className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                    style={{
                      backgroundColor: globalNavSettings.marketingTileCtaEnabledMobile ? '#22c55e' : '#374151'
                    }}
                  >
                    <span
                      className={cn(
                        "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                        globalNavSettings.marketingTileCtaEnabledMobile ? "translate-x-4" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Button text and URL fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Button Text</label>
                  <input
                    value={globalNavSettings.marketingTileCtaText || ''}
                    onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, marketingTileCtaText: e.target.value || null })}
                    placeholder="Learn More"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Button URL</label>
                  <InternalLinkSelector
                    value={globalNavSettings.marketingTileCtaUrl || ''}
                    onChange={(value) => setGlobalNavSettings({ ...globalNavSettings, marketingTileCtaUrl: value || null })}
                    placeholder="Select page or enter URL"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rotating Badge */}
        <div className="pt-4 border-t border-[var(--admin-border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-[var(--admin-text-primary)]">Rotating Badge</p>
              <p className="text-sm text-[var(--admin-text-muted)]">Add a rotating seal/badge that overlaps the tile</p>
            </div>
            <button
              onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileRotatingBadgeEnabled: !globalNavSettings.marketingTileRotatingBadgeEnabled })}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{
                backgroundColor: globalNavSettings.marketingTileRotatingBadgeEnabled ? '#22c55e' : '#374151'
              }}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  globalNavSettings.marketingTileRotatingBadgeEnabled ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {globalNavSettings.marketingTileRotatingBadgeEnabled && (
            <div className="space-y-4">
              {/* Desktop/Mobile visibility toggles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-[var(--admin-hover)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[var(--admin-text-muted)]" />
                    <span className="text-sm text-[var(--admin-text-secondary)]">Show on Desktop</span>
                  </div>
                  <button
                    onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileRotatingBadgeEnabledDesktop: !globalNavSettings.marketingTileRotatingBadgeEnabledDesktop })}
                    className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                    style={{
                      backgroundColor: globalNavSettings.marketingTileRotatingBadgeEnabledDesktop ? '#22c55e' : '#374151'
                    }}
                  >
                    <span
                      className={cn(
                        "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                        globalNavSettings.marketingTileRotatingBadgeEnabledDesktop ? "translate-x-4" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--admin-hover)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[var(--admin-text-muted)]" />
                    <span className="text-sm text-[var(--admin-text-secondary)]">Show on Mobile</span>
                  </div>
                  <button
                    onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileRotatingBadgeEnabledMobile: !globalNavSettings.marketingTileRotatingBadgeEnabledMobile })}
                    className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                    style={{
                      backgroundColor: globalNavSettings.marketingTileRotatingBadgeEnabledMobile ? '#22c55e' : '#374151'
                    }}
                  >
                    <span
                      className={cn(
                        "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                        globalNavSettings.marketingTileRotatingBadgeEnabledMobile ? "translate-x-4" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              <MediaPickerButton
                label="Badge Image"
                value={globalNavSettings.marketingTileRotatingBadgeUrl}
                onChange={(url) => setGlobalNavSettings({ ...globalNavSettings, marketingTileRotatingBadgeUrl: url || null })}
                helpText="Upload a PNG with transparent background. It will spin slowly and overlap the top-right corner."
                folder="branding"
              />
            </div>
          )}
        </div>

        {/* Hide on Mobile Toggle */}
        <div className="pt-4 border-t border-[var(--admin-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--admin-text-primary)]">Hide on Mobile</p>
              <p className="text-sm text-[var(--admin-text-muted)]">Hide this tile on mobile devices to save space</p>
            </div>
            <button
              onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileHideOnMobile: !globalNavSettings.marketingTileHideOnMobile })}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{
                backgroundColor: globalNavSettings.marketingTileHideOnMobile ? '#22c55e' : '#374151'
              }}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  globalNavSettings.marketingTileHideOnMobile ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation Section Component
interface NavigationSectionProps {
  position: 'left' | 'center' | 'right';
  pagesList: PageOption[];
  setPagesList: (pages: PageOption[]) => void;
  draggingPageId: string | null;
  dragOverSection: string | null;
  onDragOver: (e: React.DragEvent, section: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, position: 'left' | 'center' | 'right') => void;
}

function NavigationSection({
  position,
  pagesList,
  setPagesList,
  draggingPageId,
  dragOverSection,
  onDragOver,
  onDragLeave,
  onDrop,
}: NavigationSectionProps) {
  const positionLabel = position.charAt(0).toUpperCase() + position.slice(1);
  const isCenter = position === 'center';
  const isRight = position === 'right';

  const filteredPages = pagesList
    .filter(p => {
      if (isRight) {
        return p.showInNav && (p.navPosition === 'right' || !p.navPosition);
      }
      return p.showInNav && p.navPosition === position;
    })
    .sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0));

  return (
    <div
      className={cn(
        "rounded-xl transition-all",
        isCenter && "mb-6 pb-6 border-b border-[var(--admin-border)]",
        !isCenter && !isRight && "mb-6",
        dragOverSection === position && "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--admin-input)] bg-[var(--primary)]/5"
      )}
      onDragOver={(e) => onDragOver(e, position)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, position)}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">
        Global Navigation - {positionLabel} Side
      </p>
      {draggingPageId && (
        <div className={cn(
          "mb-2 p-3 border-2 border-dashed rounded-lg text-center text-sm transition-colors",
          dragOverSection === position
            ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
            : "border-[var(--admin-border)] text-[var(--admin-text-muted)]"
        )}>
          Drop here to add to {position} position
        </div>
      )}
      <Reorder.Group
        axis="y"
        values={filteredPages}
        onReorder={(newOrder) => {
          const otherPages = pagesList.filter(p => {
            if (isRight) {
              return !p.showInNav || (p.navPosition !== 'right' && p.navPosition);
            }
            return !p.showInNav || p.navPosition !== position;
          });
          setPagesList([
            ...otherPages,
            ...newOrder.map((item, index) => ({ ...item, navOrder: index })),
          ]);
        }}
        className="space-y-2"
      >
        {filteredPages.map((page) => (
          <Reorder.Item
            key={page.id}
            value={page}
            className="p-4 bg-[var(--admin-hover)] rounded-lg cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--admin-text-primary)]">{page.title}</p>
                <p className="text-sm text-[var(--admin-text-muted)]">/{page.slug}</p>
              </div>
              {/* Device visibility toggles */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setPagesList(pagesList.map(p =>
                      p.id === page.id ? { ...p, navShowOnDesktop: !p.navShowOnDesktop } : p
                    ));
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    page.navShowOnDesktop !== false
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-[var(--admin-input)] text-[var(--admin-text-muted)] border border-[var(--admin-border)] opacity-60 hover:opacity-100'
                  }`}
                  title={page.navShowOnDesktop !== false ? 'Visible on desktop - click to hide' : 'Hidden on desktop - click to show'}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>{page.navShowOnDesktop !== false ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPagesList(pagesList.map(p =>
                      p.id === page.id ? { ...p, navShowOnMobile: p.navShowOnMobile !== false ? false : true } : p
                    ));
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    page.navShowOnMobile !== false
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-[var(--admin-input)] text-[var(--admin-text-muted)] border border-[var(--admin-border)] opacity-60 hover:opacity-100'
                  }`}
                  title={page.navShowOnMobile !== false ? 'Visible on mobile - click to hide' : 'Hidden on mobile - click to show'}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{page.navShowOnMobile !== false ? 'ON' : 'OFF'}</span>
                </button>
              </div>
              <select
                value={page.navPosition || 'right'}
                onChange={(e) => {
                  setPagesList(pagesList.map(p =>
                    p.id === page.id ? { ...p, navPosition: e.target.value } : p
                  ));
                }}
                className="px-3 py-1.5 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
              <button
                onClick={() => setPagesList(pagesList.map(p => p.id === page.id ? { ...p, showInNav: false } : p))}
                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      {filteredPages.length === 0 && (
        <p className="text-sm text-[var(--admin-text-muted)] py-4 text-center">No pages in {position} position</p>
      )}
    </div>
  );
}
