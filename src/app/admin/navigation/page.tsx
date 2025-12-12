'use client';

import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import Image from 'next/image';
import {
  Plus,
  Loader2,
  GripVertical,
  Edit,
  Trash2,
  Save,
  X,
  Menu,
  Link as LinkIcon,
  ChevronDown,
  Megaphone,
  Check,
  Layout,
  MousePointer,
  Image as ImageIcon,
  FileText,
  AlignLeft,
  AlignCenter,
  Smartphone,
  Monitor,
  Upload,
  Package,
  Star,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';

interface NavItem {
  id: string;
  label: string;
  url: string;
  type: string;
  parentId: string | null;
  imageUrl: string | null;
  description: string | null;
  isActive: boolean | null;
  sortOrder: number | null;
}

interface FooterLink {
  id: string;
  label: string;
  url: string;
  column: string;
  isActive: boolean | null;
  sortOrder: number | null;
}

interface BumperSettings {
  bumperEnabled: boolean;
  bumperText: string;
  bumperLinkUrl: string;
  bumperLinkText: string;
  bumperTheme: 'light' | 'dark';
}

interface GlobalNavSettings {
  logoPosition: 'left' | 'center';
  logoPositionMobile: 'left' | 'center';
  ctaEnabled: boolean;
  ctaText: string;
  ctaUrl: string;
  tile1ProductId: string | null;
  tile1Title: string | null;
  tile1Subtitle: string | null;
  tile1Badge: string | null;
  tile1BadgeEmoji: string | null;
  tile1BadgeBgColor: string;
  tile1BadgeTextColor: string;
  tile1ImageUrl: string | null;
  tile1HoverImageUrl: string | null;
  tile2ProductId: string | null;
  tile2Title: string | null;
  tile2Subtitle: string | null;
  tile2Badge: string | null;
  tile2BadgeEmoji: string | null;
  tile2BadgeBgColor: string;
  tile2BadgeTextColor: string;
  tile2ImageUrl: string | null;
  tile2HoverImageUrl: string | null;
  // Marketing tile (formerly Clean Formulas)
  marketingTileTitle: string;
  marketingTileDescription: string;
  marketingTileBadge1: string;
  marketingTileBadge2: string;
  marketingTileBadge3: string;
  marketingTileCtaEnabled: boolean;
  marketingTileCtaText: string | null;
  marketingTileCtaUrl: string | null;
  marketingTileRotatingBadgeEnabled: boolean;
  marketingTileRotatingBadgeUrl: string | null;
  marketingTileHideOnMobile: boolean;
  // Legacy aliases for backwards compatibility
  cleanFormulasTitle?: string;
  cleanFormulasDescription?: string;
  cleanFormulasCtaEnabled?: boolean;
  cleanFormulasCtaText?: string | null;
  cleanFormulasCtaUrl?: string | null;
  cleanFormulasBadgeEnabled?: boolean;
  cleanFormulasBadgeUrl?: string | null;
}

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  heroImageUrl: string | null;
  shortDescription: string | null;
  badge: string | null;
  badgeEmoji: string | null;
  rating: number | null;
  reviewCount: number | null;
}

interface PageOption {
  id: string;
  slug: string;
  title: string;
  showInNav: boolean | null;
  navOrder: number | null;
  navPosition: string | null;
  navShowOnDesktop: boolean | null;
  navShowOnMobile: boolean | null;
}

// Special "Shop" nav item that represents the dropdown
interface ShopNavItem {
  id: 'shop';
  label: 'Shop';
  type: 'dropdown';
  navPosition: string;
  navOrder: number;
}

export default function NavigationPage() {
  const [activeTab, setActiveTab] = useState<'header' | 'dropdown' | 'pages' | 'bumper'>('header');
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [bumperSettings, setBumperSettings] = useState<BumperSettings>({
    bumperEnabled: false,
    bumperText: '',
    bumperLinkUrl: '',
    bumperLinkText: '',
    bumperTheme: 'light',
  });
  const [globalNavSettings, setGlobalNavSettings] = useState<GlobalNavSettings>({
    logoPosition: 'left',
    logoPositionMobile: 'left',
    ctaEnabled: true,
    ctaText: 'Shop Now',
    ctaUrl: '/products/eye-drops',
    tile1ProductId: null,
    tile1Title: null,
    tile1Subtitle: null,
    tile1Badge: null,
    tile1BadgeEmoji: null,
    tile1BadgeBgColor: '#1a1a1a',
    tile1BadgeTextColor: '#ffffff',
    tile1ImageUrl: null,
    tile1HoverImageUrl: null,
    tile2ProductId: null,
    tile2Title: null,
    tile2Subtitle: null,
    tile2Badge: null,
    tile2BadgeEmoji: null,
    tile2BadgeBgColor: '#bbdae9',
    tile2BadgeTextColor: '#1a1a1a',
    tile2ImageUrl: null,
    tile2HoverImageUrl: null,
    marketingTileTitle: 'Clean Formulas',
    marketingTileDescription: 'No preservatives, phthalates, parabens, or sulfates.',
    marketingTileBadge1: 'Preservative-Free',
    marketingTileBadge2: 'Paraben-Free',
    marketingTileBadge3: 'Sulfate-Free',
    marketingTileCtaEnabled: false,
    marketingTileCtaText: null,
    marketingTileCtaUrl: null,
    marketingTileRotatingBadgeEnabled: false,
    marketingTileRotatingBadgeUrl: null,
    marketingTileHideOnMobile: false,
  });
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [pagesList, setPagesList] = useState<PageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<NavItem | FooterLink>>({});
  const [editType, setEditType] = useState<'nav' | 'footer'>('nav');

  // Track original state for change detection
  const [originalNavItems, setOriginalNavItems] = useState<NavItem[]>([]);
  const [originalFooterLinks, setOriginalFooterLinks] = useState<FooterLink[]>([]);
  const [originalBumperSettings, setOriginalBumperSettings] = useState<BumperSettings>({
    bumperEnabled: false,
    bumperText: '',
    bumperLinkUrl: '',
    bumperLinkText: '',
    bumperTheme: 'light',
  });
  const [originalGlobalNavSettings, setOriginalGlobalNavSettings] = useState<GlobalNavSettings | null>(null);
  const [originalPagesList, setOriginalPagesList] = useState<PageOption[]>([]);

  // Check if there are unsaved changes
  const hasChanges =
    JSON.stringify(navItems) !== JSON.stringify(originalNavItems) ||
    JSON.stringify(footerLinks) !== JSON.stringify(originalFooterLinks) ||
    JSON.stringify(bumperSettings) !== JSON.stringify(originalBumperSettings) ||
    JSON.stringify(globalNavSettings) !== JSON.stringify(originalGlobalNavSettings) ||
    JSON.stringify(pagesList) !== JSON.stringify(originalPagesList);

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = async () => {
    try {
      const res = await fetch('/api/admin/navigation');
      const data = await res.json();
      const nav = data.navigation || [];
      const footer = data.footer || [];
      const bumper = {
        bumperEnabled: data.bumper?.bumperEnabled ?? false,
        bumperText: data.bumper?.bumperText ?? '',
        bumperLinkUrl: data.bumper?.bumperLinkUrl ?? '',
        bumperLinkText: data.bumper?.bumperLinkText ?? '',
        bumperTheme: (data.bumper?.bumperTheme ?? 'light') as 'light' | 'dark',
      };
      const globalNav = data.globalNav ? {
        logoPosition: data.globalNav.logoPosition || 'left',
        logoPositionMobile: data.globalNav.logoPositionMobile || 'left',
        ctaEnabled: data.globalNav.ctaEnabled ?? true,
        ctaText: data.globalNav.ctaText || 'Shop Now',
        ctaUrl: data.globalNav.ctaUrl || '/products/eye-drops',
        tile1ProductId: data.globalNav.tile1ProductId || null,
        tile1Title: data.globalNav.tile1Title || null,
        tile1Subtitle: data.globalNav.tile1Subtitle || null,
        tile1Badge: data.globalNav.tile1Badge || null,
        tile1BadgeEmoji: data.globalNav.tile1BadgeEmoji || null,
        tile1BadgeBgColor: data.globalNav.tile1BadgeBgColor || '#1a1a1a',
        tile1BadgeTextColor: data.globalNav.tile1BadgeTextColor || '#ffffff',
        tile1ImageUrl: data.globalNav.tile1ImageUrl || null,
        tile1HoverImageUrl: data.globalNav.tile1HoverImageUrl || null,
        tile2ProductId: data.globalNav.tile2ProductId || null,
        tile2Title: data.globalNav.tile2Title || null,
        tile2Subtitle: data.globalNav.tile2Subtitle || null,
        tile2Badge: data.globalNav.tile2Badge || null,
        tile2BadgeEmoji: data.globalNav.tile2BadgeEmoji || null,
        tile2BadgeBgColor: data.globalNav.tile2BadgeBgColor || '#bbdae9',
        tile2BadgeTextColor: data.globalNav.tile2BadgeTextColor || '#1a1a1a',
        tile2ImageUrl: data.globalNav.tile2ImageUrl || null,
        tile2HoverImageUrl: data.globalNav.tile2HoverImageUrl || null,
        marketingTileTitle: data.globalNav.marketingTileTitle || data.globalNav.cleanFormulasTitle || 'Clean Formulas',
        marketingTileDescription: data.globalNav.marketingTileDescription || data.globalNav.cleanFormulasDescription || 'No preservatives, phthalates, parabens, or sulfates.',
        marketingTileBadge1: data.globalNav.marketingTileBadge1 || 'Preservative-Free',
        marketingTileBadge2: data.globalNav.marketingTileBadge2 || 'Paraben-Free',
        marketingTileBadge3: data.globalNav.marketingTileBadge3 || 'Sulfate-Free',
        marketingTileCtaEnabled: data.globalNav.marketingTileCtaEnabled ?? data.globalNav.cleanFormulasCtaEnabled ?? false,
        marketingTileCtaText: data.globalNav.marketingTileCtaText || data.globalNav.cleanFormulasCtaText || null,
        marketingTileCtaUrl: data.globalNav.marketingTileCtaUrl || data.globalNav.cleanFormulasCtaUrl || null,
        marketingTileRotatingBadgeEnabled: data.globalNav.marketingTileRotatingBadgeEnabled ?? data.globalNav.cleanFormulasBadgeEnabled ?? false,
        marketingTileRotatingBadgeUrl: data.globalNav.marketingTileRotatingBadgeUrl || data.globalNav.cleanFormulasBadgeUrl || null,
        marketingTileHideOnMobile: data.globalNav.marketingTileHideOnMobile ?? false,
      } : globalNavSettings;

      setNavItems(nav);
      setFooterLinks(footer);
      setBumperSettings(bumper);
      setGlobalNavSettings(globalNav);
      setProducts(data.products || []);
      setPagesList(data.pages || []);

      // Store original state
      setOriginalNavItems(JSON.parse(JSON.stringify(nav)));
      setOriginalFooterLinks(JSON.parse(JSON.stringify(footer)));
      setOriginalBumperSettings({ ...bumper });
      setOriginalGlobalNavSettings(JSON.parse(JSON.stringify(globalNav)));
      setOriginalPagesList(JSON.parse(JSON.stringify(data.pages || [])));
    } catch (error) {
      console.error('Failed to fetch navigation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          navigation: navItems,
          footer: footerLinks,
          bumper: bumperSettings,
          globalNav: globalNavSettings,
          pageNavUpdates: pagesList.map(p => ({
            id: p.id,
            showInNav: p.showInNav,
            navOrder: p.navOrder,
            navPosition: p.navPosition,
          })),
        }),
      });
      // Update original state after successful save
      setOriginalNavItems(JSON.parse(JSON.stringify(navItems)));
      setOriginalFooterLinks(JSON.parse(JSON.stringify(footerLinks)));
      setOriginalBumperSettings({ ...bumperSettings });
      setOriginalGlobalNavSettings(JSON.parse(JSON.stringify(globalNavSettings)));
      setOriginalPagesList(JSON.parse(JSON.stringify(pagesList)));
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNav = () => {
    const newItem: NavItem = {
      id: `new-${Date.now()}`,
      label: '',
      url: '',
      type: 'link',
      parentId: null,
      imageUrl: null,
      description: null,
      isActive: true,
      sortOrder: navItems.length,
    };
    setNavItems([...navItems, newItem]);
    setEditingId(newItem.id);
    setEditForm(newItem);
    setEditType('nav');
  };

  const handleAddFooter = () => {
    const newItem: FooterLink = {
      id: `new-${Date.now()}`,
      label: '',
      url: '',
      column: 'Shop',
      isActive: true,
      sortOrder: footerLinks.length,
    };
    setFooterLinks([...footerLinks, newItem]);
    setEditingId(newItem.id);
    setEditForm(newItem);
    setEditType('footer');
  };

  const handleEditNav = (item: NavItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    setEditType('nav');
  };

  const handleEditFooter = (item: FooterLink) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    setEditType('footer');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (editType === 'nav') {
      setNavItems(navItems.map((n) => (n.id === editingId ? { ...n, ...editForm } as NavItem : n)));
    } else {
      setFooterLinks(footerLinks.map((f) => (f.id === editingId ? { ...f, ...editForm } as FooterLink : f)));
    }
    setEditingId(null);
    setEditForm({});
  };

  const handleDeleteNav = (id: string) => {
    if (confirm('Delete this navigation item?')) {
      setNavItems(navItems.filter((n) => n.id !== id));
    }
  };

  const handleDeleteFooter = (id: string) => {
    if (confirm('Delete this footer link?')) {
      setFooterLinks(footerLinks.filter((f) => f.id !== id));
    }
  };

  const handleReorderNav = (newOrder: NavItem[]) => {
    setNavItems(newOrder.map((item, index) => ({ ...item, sortOrder: index })));
  };

  const handleReorderFooter = (newOrder: FooterLink[]) => {
    setFooterLinks(newOrder.map((item, index) => ({ ...item, sortOrder: index })));
  };

  const handleReorderPages = (newOrder: PageOption[]) => {
    setPagesList(newOrder.map((item, index) => ({ ...item, navOrder: index })));
  };

  const [saved, setSaved] = useState(false);

  const handleSaveWithFeedback = async () => {
    await handleSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Get selected product for preview
  const getProductById = (id: string | null) => products.find(p => p.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">Navigation</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1">
            Manage global navigation, dropdown, pages, footer, and announcement bar
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSaveWithFeedback}
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
                Save All
              </>
            )}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--admin-input)] rounded-xl p-1 border border-[var(--admin-border)] overflow-x-auto">
        <button
          onClick={() => setActiveTab('header')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'header'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <Layout className="w-4 h-4" />
          Header Bar
        </button>
        <button
          onClick={() => setActiveTab('dropdown')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'dropdown'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <ChevronDown className="w-4 h-4" />
          Shop Dropdown
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'pages'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <FileText className="w-4 h-4" />
          Page Links
        </button>
        <button
          onClick={() => setActiveTab('bumper')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'bumper'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <Megaphone className="w-4 h-4" />
          Announcement
        </button>
      </div>

      {/* ============================================
          HEADER BAR SETTINGS
          ============================================ */}
      {activeTab === 'header' && (
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
                  <input
                    value={globalNavSettings.ctaUrl}
                    onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, ctaUrl: e.target.value })}
                    placeholder="/products/eye-drops"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
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
      )}

      {/* ============================================
          SHOP DROPDOWN SETTINGS - Side by Side Layout
          ============================================ */}
      {activeTab === 'dropdown' && (
        <div className="space-y-6">
          {/* Product Tile 1 - Side by Side */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Product Tile 1 (Left)</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                First product shown in the dropdown menu
              </p>
            </div>
            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left side - Form fields */}
                <div className="space-y-4">
                  {/* Product Selector */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Select Product</label>
                    <select
                      value={globalNavSettings.tile1ProductId || ''}
                      onChange={(e) => {
                        const product = products.find(p => p.id === e.target.value);
                        setGlobalNavSettings({
                          ...globalNavSettings,
                          tile1ProductId: e.target.value || null,
                          tile1Title: product?.name || null,
                          tile1Subtitle: product?.shortDescription || null,
                          tile1Badge: product?.badge || null,
                          tile1BadgeEmoji: product?.badgeEmoji || null,
                        });
                      }}
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
                      value={globalNavSettings.tile1Title || ''}
                      onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1Title: e.target.value || null })}
                      placeholder={getProductById(globalNavSettings.tile1ProductId)?.name || 'Product name'}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>

                  {/* Override Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Subtitle Override <span className="text-[var(--admin-text-muted)]">(optional)</span>
                    </label>
                    <input
                      value={globalNavSettings.tile1Subtitle || ''}
                      onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1Subtitle: e.target.value || null })}
                      placeholder={getProductById(globalNavSettings.tile1ProductId)?.shortDescription || 'Product description'}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>

                  {/* Badge */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-[80px_1fr] gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Emoji</label>
                        <input
                          value={globalNavSettings.tile1BadgeEmoji || ''}
                          onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1BadgeEmoji: e.target.value || null })}
                          placeholder="🔥"
                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors text-center text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Badge Text</label>
                        <input
                          value={globalNavSettings.tile1Badge || ''}
                          onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1Badge: e.target.value || null })}
                          placeholder="Bestseller"
                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                      </div>
                    </div>
                    {/* Badge Colors - only show if badge text or emoji is set */}
                    {(globalNavSettings.tile1Badge || globalNavSettings.tile1BadgeEmoji) && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">Background</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={globalNavSettings.tile1BadgeBgColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1BadgeBgColor: e.target.value })}
                              className="w-10 h-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={globalNavSettings.tile1BadgeBgColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1BadgeBgColor: e.target.value })}
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
                              value={globalNavSettings.tile1BadgeTextColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1BadgeTextColor: e.target.value })}
                              className="w-10 h-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={globalNavSettings.tile1BadgeTextColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1BadgeTextColor: e.target.value })}
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
                      value={globalNavSettings.tile1ImageUrl}
                      onChange={(url) => setGlobalNavSettings({ ...globalNavSettings, tile1ImageUrl: url || null })}
                      helpText="Leave blank to use product image. Supports images and MP4/WebM videos."
                      folder="products"
                      acceptVideo={true}
                    />
                  </div>

                  {/* Hover Image */}
                  <div>
                    <MediaPickerButton
                      label="Hover Image/Video"
                      value={globalNavSettings.tile1HoverImageUrl}
                      onChange={(url) => setGlobalNavSettings({ ...globalNavSettings, tile1HoverImageUrl: url || null })}
                      helpText="Shown when users hover over the tile. Supports images and MP4/WebM videos."
                      folder="products"
                      acceptVideo={true}
                    />
                  </div>
                </div>

                {/* Right side - Live Preview */}
                <div className="lg:sticky lg:top-6">
                  {/* Mobile separator */}
                  <div className="lg:hidden border-t border-[var(--admin-border)] pt-6 mt-2 mb-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">Preview</h4>
                  </div>
                  <label className="hidden lg:block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Live Preview</label>
                  <div className="p-5 rounded-2xl bg-white border border-[var(--admin-border)] hover:shadow-md transition-all duration-300 group/tile1">
                    <div className="relative mb-4">
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#f5f5f0] relative">
                        {(() => {
                          const primaryUrl = globalNavSettings.tile1ImageUrl || getProductById(globalNavSettings.tile1ProductId)?.heroImageUrl;
                          const hoverUrl = globalNavSettings.tile1HoverImageUrl;
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
                              {/* Primary Media */}
                              {primaryIsVideo ? (
                                <video
                                  src={primaryUrl}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className={`w-full h-full object-cover transition-opacity duration-300 ${hoverUrl ? 'group-hover/tile1:opacity-0' : ''}`}
                                />
                              ) : (
                                <Image
                                  src={primaryUrl}
                                  alt=""
                                  width={300}
                                  height={300}
                                  className={`w-full h-full object-cover transition-opacity duration-300 ${hoverUrl ? 'group-hover/tile1:opacity-0' : 'group-hover/tile1:scale-105'}`}
                                />
                              )}
                              {/* Hover Media */}
                              {hoverUrl && (
                                hoverIsVideo ? (
                                  <video
                                    src={hoverUrl}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile1:opacity-100 transition-opacity duration-300"
                                  />
                                ) : (
                                  <Image
                                    src={hoverUrl}
                                    alt=""
                                    width={300}
                                    height={300}
                                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile1:opacity-100 transition-opacity duration-300"
                                  />
                                )
                              )}
                            </>
                          );
                        })()}
                      </div>
                      {(globalNavSettings.tile1Badge || globalNavSettings.tile1BadgeEmoji) && (
                        <span
                          className="absolute top-3 right-3 text-sm px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5"
                          style={{
                            backgroundColor: globalNavSettings.tile1BadgeBgColor,
                            color: globalNavSettings.tile1BadgeTextColor
                          }}
                        >
                          {globalNavSettings.tile1BadgeEmoji} {globalNavSettings.tile1Badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm text-[#1a1a1a] font-medium">{(getProductById(globalNavSettings.tile1ProductId)?.reviewCount || 2900).toLocaleString()}+</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#7CB4B8] text-[#7CB4B8]" />
                        ))}
                      </div>
                      <span className="text-xs text-[#737373]">Verified Reviews</span>
                    </div>
                    <h4 className="text-lg font-medium mb-1 text-[#1a1a1a] group-hover/tile1:text-[#737373] transition-colors">
                      {globalNavSettings.tile1Title || getProductById(globalNavSettings.tile1ProductId)?.name || 'Product Name'}
                    </h4>
                    <p className="text-sm text-[#737373]">
                      {globalNavSettings.tile1Subtitle || getProductById(globalNavSettings.tile1ProductId)?.shortDescription || 'Product description'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tile 2 - Side by Side */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Product Tile 2 (Right)</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Second product shown in the dropdown menu
              </p>
            </div>
            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left side - Form fields */}
                <div className="space-y-4">
                  {/* Product Selector */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Select Product</label>
                    <select
                      value={globalNavSettings.tile2ProductId || ''}
                      onChange={(e) => {
                        const product = products.find(p => p.id === e.target.value);
                        setGlobalNavSettings({
                          ...globalNavSettings,
                          tile2ProductId: e.target.value || null,
                          tile2Title: product?.name || null,
                          tile2Subtitle: product?.shortDescription || null,
                          tile2Badge: product?.badge || null,
                          tile2BadgeEmoji: product?.badgeEmoji || null,
                        });
                      }}
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
                      value={globalNavSettings.tile2Title || ''}
                      onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2Title: e.target.value || null })}
                      placeholder={getProductById(globalNavSettings.tile2ProductId)?.name || 'Product name'}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>

                  {/* Override Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Subtitle Override <span className="text-[var(--admin-text-muted)]">(optional)</span>
                    </label>
                    <input
                      value={globalNavSettings.tile2Subtitle || ''}
                      onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2Subtitle: e.target.value || null })}
                      placeholder={getProductById(globalNavSettings.tile2ProductId)?.shortDescription || 'Product description'}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>

                  {/* Badge */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-[80px_1fr] gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Emoji</label>
                        <input
                          value={globalNavSettings.tile2BadgeEmoji || ''}
                          onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2BadgeEmoji: e.target.value || null })}
                          placeholder="✨"
                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors text-center text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Badge Text</label>
                        <input
                          value={globalNavSettings.tile2Badge || ''}
                          onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2Badge: e.target.value || null })}
                          placeholder="New"
                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                      </div>
                    </div>
                    {/* Badge Colors - only show if badge text or emoji is set */}
                    {(globalNavSettings.tile2Badge || globalNavSettings.tile2BadgeEmoji) && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">Background</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={globalNavSettings.tile2BadgeBgColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2BadgeBgColor: e.target.value })}
                              className="w-10 h-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={globalNavSettings.tile2BadgeBgColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2BadgeBgColor: e.target.value })}
                              placeholder="#bbdae9"
                              className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">Text Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={globalNavSettings.tile2BadgeTextColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2BadgeTextColor: e.target.value })}
                              className="w-10 h-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={globalNavSettings.tile2BadgeTextColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2BadgeTextColor: e.target.value })}
                              placeholder="#1a1a1a"
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
                      value={globalNavSettings.tile2ImageUrl}
                      onChange={(url) => setGlobalNavSettings({ ...globalNavSettings, tile2ImageUrl: url || null })}
                      helpText="Leave blank to use product image. Supports images and MP4/WebM videos."
                      folder="products"
                      acceptVideo={true}
                    />
                  </div>

                  {/* Hover Image */}
                  <div>
                    <MediaPickerButton
                      label="Hover Image/Video"
                      value={globalNavSettings.tile2HoverImageUrl}
                      onChange={(url) => setGlobalNavSettings({ ...globalNavSettings, tile2HoverImageUrl: url || null })}
                      helpText="Shown when users hover over the tile. Supports images and MP4/WebM videos."
                      folder="products"
                      acceptVideo={true}
                    />
                  </div>
                </div>

                {/* Right side - Live Preview */}
                <div className="lg:sticky lg:top-6">
                  {/* Mobile separator */}
                  <div className="lg:hidden border-t border-[var(--admin-border)] pt-6 mt-2 mb-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">Preview</h4>
                  </div>
                  <label className="hidden lg:block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Live Preview</label>
                  <div className="p-5 rounded-2xl bg-white border border-[var(--admin-border)] hover:shadow-md transition-all duration-300 group/tile2">
                    <div className="relative mb-4">
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#f5f5f0] relative">
                        {(() => {
                          const primaryUrl = globalNavSettings.tile2ImageUrl || getProductById(globalNavSettings.tile2ProductId)?.heroImageUrl;
                          const hoverUrl = globalNavSettings.tile2HoverImageUrl;
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
                              {/* Primary Media */}
                              {primaryIsVideo ? (
                                <video
                                  src={primaryUrl}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className={`w-full h-full object-cover transition-opacity duration-300 ${hoverUrl ? 'group-hover/tile2:opacity-0' : ''}`}
                                />
                              ) : (
                                <Image
                                  src={primaryUrl}
                                  alt=""
                                  width={300}
                                  height={300}
                                  className={`w-full h-full object-cover transition-opacity duration-300 ${hoverUrl ? 'group-hover/tile2:opacity-0' : 'group-hover/tile2:scale-105'}`}
                                />
                              )}
                              {/* Hover Media */}
                              {hoverUrl && (
                                hoverIsVideo ? (
                                  <video
                                    src={hoverUrl}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile2:opacity-100 transition-opacity duration-300"
                                  />
                                ) : (
                                  <Image
                                    src={hoverUrl}
                                    alt=""
                                    width={300}
                                    height={300}
                                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile2:opacity-100 transition-opacity duration-300"
                                  />
                                )
                              )}
                            </>
                          );
                        })()}
                      </div>
                      {(globalNavSettings.tile2Badge || globalNavSettings.tile2BadgeEmoji) && (
                        <span
                          className="absolute top-3 right-3 text-sm px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5"
                          style={{
                            backgroundColor: globalNavSettings.tile2BadgeBgColor,
                            color: globalNavSettings.tile2BadgeTextColor
                          }}
                        >
                          {globalNavSettings.tile2BadgeEmoji} {globalNavSettings.tile2Badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm text-[#1a1a1a] font-medium">{(getProductById(globalNavSettings.tile2ProductId)?.reviewCount || 2900).toLocaleString()}+</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#7CB4B8] text-[#7CB4B8]" />
                        ))}
                      </div>
                      <span className="text-xs text-[#737373]">Verified Reviews</span>
                    </div>
                    <h4 className="text-lg font-medium mb-1 text-[#1a1a1a] group-hover/tile2:text-[#737373] transition-colors">
                      {globalNavSettings.tile2Title || getProductById(globalNavSettings.tile2ProductId)?.name || 'Product Name'}
                    </h4>
                    <p className="text-sm text-[#737373]">
                      {globalNavSettings.tile2Subtitle || getProductById(globalNavSettings.tile2ProductId)?.shortDescription || 'Product description'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Tile (Far Right) */}
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
                      <input
                        value={globalNavSettings.marketingTileCtaUrl || ''}
                        onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, marketingTileCtaUrl: e.target.value || null })}
                        placeholder="/our-story"
                        className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
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
                  <MediaPickerButton
                    label="Badge Image"
                    value={globalNavSettings.marketingTileRotatingBadgeUrl}
                    onChange={(url) => setGlobalNavSettings({ ...globalNavSettings, marketingTileRotatingBadgeUrl: url || null })}
                    helpText="Upload a PNG with transparent background. It will spin slowly and overlap the top-right corner."
                    folder="branding"
                  />
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
        </div>
      )}

      {/* ============================================
          PAGE LINKS TAB
          ============================================ */}
      {activeTab === 'pages' && (
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
              {/* Shop Dropdown - Special item */}
              <div className="mb-6 pb-6 border-b border-[var(--admin-border)]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">Shop Dropdown</p>
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

              {/* Left Position */}
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">Left Position</p>
                <Reorder.Group
                  axis="y"
                  values={pagesList.filter(p => p.showInNav && p.navPosition === 'left').sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0))}
                  onReorder={(newOrder) => {
                    const otherPages = pagesList.filter(p => !p.showInNav || p.navPosition !== 'left');
                    setPagesList([
                      ...otherPages,
                      ...newOrder.map((item, index) => ({ ...item, navOrder: index })),
                    ]);
                  }}
                  className="space-y-2"
                >
                  {pagesList.filter(p => p.showInNav && p.navPosition === 'left').sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0)).map((page) => (
                    <Reorder.Item
                      key={page.id}
                      value={page}
                      className="p-4 bg-[var(--admin-hover)] rounded-lg cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--admin-text-primary)]">{page.title}</p>
                          <p className="text-sm text-[var(--admin-text-muted)]">/{page.slug}</p>
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
                      {/* Device visibility checkboxes */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--admin-border)]/50 ml-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={page.navShowOnDesktop !== false}
                            onChange={(e) => {
                              setPagesList(pagesList.map(p =>
                                p.id === page.id ? { ...p, navShowOnDesktop: e.target.checked } : p
                              ));
                            }}
                            className="w-4 h-4 rounded border-[var(--admin-border)] bg-[var(--admin-input)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                          />
                          <Monitor className="w-4 h-4 text-[var(--admin-text-muted)]" />
                          <span className="text-sm text-[var(--admin-text-secondary)]">Desktop</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={page.navShowOnMobile !== false}
                            onChange={(e) => {
                              setPagesList(pagesList.map(p =>
                                p.id === page.id ? { ...p, navShowOnMobile: e.target.checked } : p
                              ));
                            }}
                            className="w-4 h-4 rounded border-[var(--admin-border)] bg-[var(--admin-input)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                          />
                          <Smartphone className="w-4 h-4 text-[var(--admin-text-muted)]" />
                          <span className="text-sm text-[var(--admin-text-secondary)]">Mobile</span>
                        </label>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                {pagesList.filter(p => p.showInNav && p.navPosition === 'left').length === 0 && (
                  <p className="text-sm text-[var(--admin-text-muted)] py-4 text-center">No pages in left position</p>
                )}
              </div>

              {/* Center Position */}
              <div className="mb-6 pb-6 border-b border-[var(--admin-border)]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">Center Position</p>
                <Reorder.Group
                  axis="y"
                  values={pagesList.filter(p => p.showInNav && p.navPosition === 'center').sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0))}
                  onReorder={(newOrder) => {
                    const otherPages = pagesList.filter(p => !p.showInNav || p.navPosition !== 'center');
                    setPagesList([
                      ...otherPages,
                      ...newOrder.map((item, index) => ({ ...item, navOrder: index })),
                    ]);
                  }}
                  className="space-y-2"
                >
                  {pagesList.filter(p => p.showInNav && p.navPosition === 'center').sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0)).map((page) => (
                    <Reorder.Item
                      key={page.id}
                      value={page}
                      className="p-4 bg-[var(--admin-hover)] rounded-lg cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--admin-text-primary)]">{page.title}</p>
                          <p className="text-sm text-[var(--admin-text-muted)]">/{page.slug}</p>
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
                      {/* Device visibility checkboxes */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--admin-border)]/50 ml-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={page.navShowOnDesktop !== false}
                            onChange={(e) => {
                              setPagesList(pagesList.map(p =>
                                p.id === page.id ? { ...p, navShowOnDesktop: e.target.checked } : p
                              ));
                            }}
                            className="w-4 h-4 rounded border-[var(--admin-border)] bg-[var(--admin-input)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                          />
                          <Monitor className="w-4 h-4 text-[var(--admin-text-muted)]" />
                          <span className="text-sm text-[var(--admin-text-secondary)]">Desktop</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={page.navShowOnMobile !== false}
                            onChange={(e) => {
                              setPagesList(pagesList.map(p =>
                                p.id === page.id ? { ...p, navShowOnMobile: e.target.checked } : p
                              ));
                            }}
                            className="w-4 h-4 rounded border-[var(--admin-border)] bg-[var(--admin-input)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                          />
                          <Smartphone className="w-4 h-4 text-[var(--admin-text-muted)]" />
                          <span className="text-sm text-[var(--admin-text-secondary)]">Mobile</span>
                        </label>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                {pagesList.filter(p => p.showInNav && p.navPosition === 'center').length === 0 && (
                  <p className="text-sm text-[var(--admin-text-muted)] py-4 text-center">No pages in center position</p>
                )}
              </div>

              {/* Right Position */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">Right Position</p>
                <Reorder.Group
                  axis="y"
                  values={pagesList.filter(p => p.showInNav && (p.navPosition === 'right' || !p.navPosition)).sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0))}
                  onReorder={(newOrder) => {
                    const otherPages = pagesList.filter(p => !p.showInNav || (p.navPosition !== 'right' && p.navPosition));
                    setPagesList([
                      ...otherPages,
                      ...newOrder.map((item, index) => ({ ...item, navOrder: index })),
                    ]);
                  }}
                  className="space-y-2"
                >
                  {pagesList.filter(p => p.showInNav && (p.navPosition === 'right' || !p.navPosition)).sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0)).map((page) => (
                    <Reorder.Item
                      key={page.id}
                      value={page}
                      className="p-4 bg-[var(--admin-hover)] rounded-lg cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--admin-text-primary)]">{page.title}</p>
                          <p className="text-sm text-[var(--admin-text-muted)]">/{page.slug}</p>
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
                      {/* Device visibility checkboxes */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--admin-border)]/50 ml-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={page.navShowOnDesktop !== false}
                            onChange={(e) => {
                              setPagesList(pagesList.map(p =>
                                p.id === page.id ? { ...p, navShowOnDesktop: e.target.checked } : p
                              ));
                            }}
                            className="w-4 h-4 rounded border-[var(--admin-border)] bg-[var(--admin-input)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                          />
                          <Monitor className="w-4 h-4 text-[var(--admin-text-muted)]" />
                          <span className="text-sm text-[var(--admin-text-secondary)]">Desktop</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={page.navShowOnMobile !== false}
                            onChange={(e) => {
                              setPagesList(pagesList.map(p =>
                                p.id === page.id ? { ...p, navShowOnMobile: e.target.checked } : p
                              ));
                            }}
                            className="w-4 h-4 rounded border-[var(--admin-border)] bg-[var(--admin-input)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                          />
                          <Smartphone className="w-4 h-4 text-[var(--admin-text-muted)]" />
                          <span className="text-sm text-[var(--admin-text-secondary)]">Mobile</span>
                        </label>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                {pagesList.filter(p => p.showInNav && (p.navPosition === 'right' || !p.navPosition)).length === 0 && (
                  <p className="text-sm text-[var(--admin-text-muted)] py-4 text-center">No pages in right position</p>
                )}
              </div>
            </div>
          </div>

          {/* Available Pages */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Available Pages</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Pages that are not currently in the navigation. Toggle to add them.
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
                    className="p-4 bg-[var(--admin-hover)] rounded-lg flex items-center gap-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-[var(--admin-text-primary)]">{page.title}</p>
                      <p className="text-sm text-[var(--admin-text-muted)]">/{page.slug}</p>
                    </div>
                    {/* Toggle: Add to Navigation */}
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
      )}

      {/* ============================================
          ANNOUNCEMENT BAR SETTINGS
          ============================================ */}
      {activeTab === 'bumper' && (
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
          <div className="p-6 border-b border-[var(--admin-border)]">
            <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Announcement Bar</h2>
            <p className="text-sm text-[var(--admin-text-secondary)]">
              Display a promotional message at the top of all pages
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Enable Toggle - Disabled (left) / Enabled (right) */}
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-sm font-medium transition-colors",
                !bumperSettings.bumperEnabled ? "text-red-400" : "text-[var(--admin-text-muted)]"
              )}>
                Disabled
              </span>
              <button
                onClick={() => setBumperSettings({ ...bumperSettings, bumperEnabled: !bumperSettings.bumperEnabled })}
                className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--admin-bg)]"
                style={{
                  backgroundColor: bumperSettings.bumperEnabled ? '#22c55e' : '#ef4444'
                }}
              >
                <span
                  className={cn(
                    "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg",
                    bumperSettings.bumperEnabled ? "translate-x-9" : "translate-x-1"
                  )}
                />
              </button>
              <span className={cn(
                "text-sm font-medium transition-colors",
                bumperSettings.bumperEnabled ? "text-green-400" : "text-[var(--admin-text-muted)]"
              )}>
                Enabled
              </span>
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setBumperSettings({ ...bumperSettings, bumperTheme: 'light' })}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                    bumperSettings.bumperTheme === 'light'
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]"
                  )}
                >
                  <div className="w-full h-8 rounded bg-[var(--primary)] flex items-center justify-center">
                    <span className="text-xs font-medium text-[var(--foreground)]">Sample Text</span>
                  </div>
                  <span className="text-sm text-[var(--admin-text-primary)]">Light (Brand Blue)</span>
                </button>
                <button
                  onClick={() => setBumperSettings({ ...bumperSettings, bumperTheme: 'dark' })}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                    bumperSettings.bumperTheme === 'dark'
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]"
                  )}
                >
                  <div className="w-full h-8 rounded bg-black flex items-center justify-center">
                    <span className="text-xs font-medium text-white">Sample Text</span>
                  </div>
                  <span className="text-sm text-[var(--admin-text-primary)]">Dark (Black)</span>
                </button>
              </div>
            </div>

            {/* Announcement Text */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Announcement Text</label>
              <input
                value={bumperSettings.bumperText}
                onChange={(e) => setBumperSettings({ ...bumperSettings, bumperText: e.target.value })}
                placeholder="Free shipping on orders over $50!"
                className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">This text will be centered in the announcement bar</p>
            </div>

            {/* Link URL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Link Text (optional)</label>
                <input
                  value={bumperSettings.bumperLinkText}
                  onChange={(e) => setBumperSettings({ ...bumperSettings, bumperLinkText: e.target.value })}
                  placeholder="Shop Now"
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Link URL (optional)</label>
                <input
                  value={bumperSettings.bumperLinkUrl}
                  onChange={(e) => setBumperSettings({ ...bumperSettings, bumperLinkUrl: e.target.value })}
                  placeholder="/products/eye-drops"
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            {/* Preview */}
            {bumperSettings.bumperText && (
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Preview</label>
                <div className={cn(
                  "py-3 px-4 rounded-lg",
                  bumperSettings.bumperTheme === 'dark' ? "bg-black" : "bg-[var(--primary)]"
                )}>
                  <div className={cn(
                    "flex items-center justify-center gap-3 text-sm",
                    bumperSettings.bumperTheme === 'dark' ? "text-white" : "text-[var(--admin-button-text)]"
                  )}>
                    <span className="text-center font-medium">{bumperSettings.bumperText}</span>
                    {bumperSettings.bumperLinkUrl && bumperSettings.bumperLinkText && (
                      <span className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-2">
                        {bumperSettings.bumperLinkText}
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancelEdit} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[var(--admin-input)] rounded-2xl border border-[var(--admin-border)] shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto"
          >
            <div className="p-6 border-b border-[var(--admin-border)] flex items-center justify-between">
              <h2 className="text-xl font-medium text-[var(--admin-text-primary)]">
                {editType === 'nav' ? 'Edit Navigation Item' : 'Edit Footer Link'}
              </h2>
              <button onClick={handleCancelEdit} className="p-2 rounded-lg hover:bg-[var(--admin-input)] text-[var(--admin-text-secondary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editForm as any).isActive ?? true}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--admin-hover)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                </label>
                <span className="text-sm font-medium text-[var(--admin-text-primary)]">Active</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Label</label>
                  <input
                    value={(editForm as any).label || ''}
                    onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                    placeholder="Products"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">URL</label>
                  <input
                    value={(editForm as any).url || ''}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    placeholder="/products"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>

              {editType === 'nav' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Type</label>
                    <select
                      value={(editForm as NavItem).type || 'link'}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    >
                      <option value="link">Link</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="mega">Mega Menu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Description (for mega menu)</label>
                    <input
                      value={(editForm as NavItem).description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Browse our products"
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Image URL (for mega menu)</label>
                    <input
                      value={(editForm as NavItem).imageUrl || ''}
                      onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </>
              )}

              {editType === 'footer' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Column</label>
                  <input
                    value={(editForm as FooterLink).column || ''}
                    onChange={(e) => setEditForm({ ...editForm, column: e.target.value })}
                    placeholder="Shop"
                    list="columns"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  <datalist id="columns">
                    <option value="Shop" />
                    <option value="Support" />
                    <option value="Company" />
                    <option value="Legal" />
                  </datalist>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[var(--admin-border)] flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
