'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  FileText,
  Layout,
  Eye,
  EyeOff,
  ExternalLink,
  Package,
  Navigation,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Page {
  id: string;
  slug: string;
  title: string;
  pageType: string | null;
  isActive: boolean | null;
  showInNav: boolean | null;
  navOrder: number | null;
  updatedAt: string | null;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  isActive: boolean | null;
  updatedAt: string | null;
}

interface DeleteModalProps {
  isOpen: boolean;
  pageName: string;
  onClose: () => void;
  onDelete: () => void;
  onUnpublish: () => void;
}

function DeleteModal({ isOpen, pageName, onClose, onDelete, onUnpublish }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--admin-input)] rounded-2xl border border-[var(--admin-border)] p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-2">Delete "{pageName}"?</h3>
            <p className="text-sm text-[var(--admin-text-secondary)] mb-6">
              This will permanently remove this page. Would you like to unpublish it instead so you can restore it later?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={onUnpublish}
                className="w-full py-2.5 px-4 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-sm font-medium hover:bg-[var(--admin-hover)] transition-colors flex items-center justify-center gap-2"
              >
                <EyeOff className="w-4 h-4" />
                Unpublish (Keep as Draft)
              </button>
              <button
                onClick={onDelete}
                className="w-full py-2.5 px-4 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Permanently
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 text-[var(--admin-text-muted)] rounded-lg text-sm font-medium hover:text-[var(--admin-text-secondary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteInDraftMode, setSiteInDraftMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; page: Page | null }>({
    isOpen: false,
    page: null,
  });
  const [expandedSections, setExpandedSections] = useState({
    navigation: true,
    products: true,
    footer: true,
    other: true,
  });

  useEffect(() => {
    Promise.all([fetchPages(), fetchProducts(), fetchSiteSettings()]);
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSiteInDraftMode(data.siteInDraftMode ?? false);
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
    }
  };

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/pages');
      const data = await res.json();
      setPages(data);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
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

  const handleDelete = async (page: Page) => {
    try {
      await fetch(`/api/admin/pages/${page.id}`, { method: 'DELETE' });
      setPages(pages.filter((p) => p.id !== page.id));
      setDeleteModal({ isOpen: false, page: null });
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleUnpublish = async (page: Page) => {
    try {
      await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
      setPages(pages.map((p) =>
        p.id === page.id ? { ...p, isActive: false } : p
      ));
      setDeleteModal({ isOpen: false, page: null });
    } catch (error) {
      console.error('Failed to unpublish:', error);
    }
  };

  const togglePageStatus = async (page: Page) => {
    const newStatus = !page.isActive;
    try {
      await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      setPages(pages.map((p) =>
        p.id === page.id ? { ...p, isActive: newStatus } : p
      ));
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    const newStatus = !product.isActive;
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      setProducts(products.map((p) =>
        p.id === product.id ? { ...p, isActive: newStatus } : p
      ));
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p.id !== product.id));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Categorize pages
  // Homepage gets its own special treatment - always first in main nav
  const homePage = pages.find((p) => p.slug === 'home');
  // Main navigation pages: showInNav=true OR is homepage
  const mainNavPages = pages
    .filter((p) => p.showInNav || p.slug === 'home')
    .sort((a, b) => {
      // Home page always first
      if (a.slug === 'home') return -1;
      if (b.slug === 'home') return 1;
      // Then by navOrder
      return (a.navOrder || 999) - (b.navOrder || 999);
    });
  // Footer/legal pages (include FAQ here)
  const footerPages = pages.filter((p) => ['about', 'terms', 'privacy', 'shipping', 'returns', 'contact', 'faq'].includes(p.slug) && !p.showInNav);
  // Other pages: not in main nav and not in footer
  const otherPages = pages.filter((p) => !mainNavPages.includes(p) && !footerPages.includes(p));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  // Helper to get display title
  const getDisplayTitle = (page: Page) => {
    if (page.slug === 'home') return 'Home Page';
    return page.title;
  };

  // When site is in draft mode, ALL pages are effectively draft regardless of individual status
  const isEffectivelyLive = (isActive: boolean | null) => {
    if (siteInDraftMode) return false; // Site-level draft overrides everything
    return isActive ?? false;
  };

  const PageRow = ({ page, onToggle, onDelete }: { page: Page; onToggle: () => void; onDelete: () => void }) => {
    const effectivelyLive = isEffectivelyLive(page.isActive);

    return (
    <Link
      href={`/admin/pages/${page.id}`}
      className="flex items-center justify-between p-4 hover:bg-[var(--primary)]/5 transition-colors group cursor-pointer"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
          page.slug === 'home'
            ? "bg-[var(--primary)]/20 group-hover:bg-[var(--primary)]/30"
            : "bg-[var(--admin-input)] group-hover:bg-[var(--primary)]/10"
        )}>
          {page.slug === 'home' ? (
            <Home className="w-5 h-5 text-[var(--primary)]" />
          ) : page.pageType === 'landing' ? (
            <Layout className="w-5 h-5 text-[var(--admin-text-secondary)] group-hover:text-[var(--primary)]" />
          ) : (
            <FileText className="w-5 h-5 text-[var(--admin-text-secondary)] group-hover:text-[var(--primary)]" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-[var(--admin-text-primary)] group-hover:text-[var(--primary)] transition-colors truncate">
              {getDisplayTitle(page)}
            </h3>
            {page.slug === 'home' && (
              <span className="px-2 py-0.5 text-xs bg-[var(--primary)]/20 text-[var(--primary)] rounded-full">
                Main
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--admin-text-muted)] truncate">{page.slug === 'home' ? '/' : `/${page.slug}`}</p>
        </div>
      </div>

      <div className="flex items-center gap-4" onClick={(e) => e.preventDefault()}>
        {/* Draft/Live Toggle Switch */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-medium transition-colors",
            !effectivelyLive ? "text-orange-400" : "text-[var(--admin-text-muted)]"
          )}>
            Draft
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!siteInDraftMode) onToggle(); // Only allow toggle if site is not in draft mode
            }}
            disabled={siteInDraftMode}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
              siteInDraftMode && "opacity-50 cursor-not-allowed"
            )}
            style={{
              backgroundColor: effectivelyLive ? '#22c55e' : '#f97316'
            }}
            title={siteInDraftMode ? 'Site is in Draft Mode - all pages are draft' : undefined}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
                effectivelyLive ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
          <span className={cn(
            "text-xs font-medium transition-colors",
            effectivelyLive ? "text-green-400" : "text-[var(--admin-text-muted)]"
          )}>
            Live
          </span>
        </div>

        {/* Preview - Dynamic label */}
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Generate preview token if page is not effectively live
            if (!effectivelyLive) {
              try {
                const res = await fetch('/api/admin/preview-token', { method: 'POST' });
                if (res.ok) {
                  // Token is set as cookie, now open the page
                  const url = page.slug === 'home' ? '/' : `/${page.slug}`;
                  window.open(url, '_blank');
                }
              } catch (error) {
                console.error('Failed to generate preview token:', error);
              }
            } else {
              const url = page.slug === 'home' ? '/' : `/${page.slug}`;
              window.open(url, '_blank');
            }
          }}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
            effectivelyLive
              ? "text-[var(--admin-text-secondary)] hover:text-green-400 hover:bg-green-500/10"
              : "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
          )}
          title={effectivelyLive ? 'View Live Page' : 'View Draft Page'}
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">{effectivelyLive ? 'View' : 'View Draft'}</span>
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Link>
  );
  };

  const ProductRow = ({ product, onToggle, onDelete }: { product: Product; onToggle: () => void; onDelete: () => void }) => {
    const effectivelyLive = isEffectivelyLive(product.isActive);

    return (
    <Link
      href={`/admin/products/${product.id}`}
      className="flex items-center justify-between p-4 hover:bg-[var(--primary)]/5 transition-colors group cursor-pointer"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-[var(--admin-input)] flex items-center justify-center shrink-0 group-hover:bg-[var(--primary)]/10 transition-colors">
          <Package className="w-5 h-5 text-[var(--admin-text-secondary)] group-hover:text-[var(--primary)]" />
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-[var(--admin-text-primary)] group-hover:text-[var(--primary)] transition-colors truncate">
            {product.name}
          </h3>
          <p className="text-sm text-[var(--admin-text-muted)] truncate">/products/{product.slug}</p>
        </div>
      </div>

      <div className="flex items-center gap-4" onClick={(e) => e.preventDefault()}>
        {/* Draft/Live Toggle Switch */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-medium transition-colors",
            !effectivelyLive ? "text-orange-400" : "text-[var(--admin-text-muted)]"
          )}>
            Draft
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!siteInDraftMode) onToggle();
            }}
            disabled={siteInDraftMode}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
              siteInDraftMode && "opacity-50 cursor-not-allowed"
            )}
            style={{
              backgroundColor: effectivelyLive ? '#22c55e' : '#f97316'
            }}
            title={siteInDraftMode ? 'Site is in Draft Mode - all pages are draft' : undefined}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
                effectivelyLive ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
          <span className={cn(
            "text-xs font-medium transition-colors",
            effectivelyLive ? "text-green-400" : "text-[var(--admin-text-muted)]"
          )}>
            Live
          </span>
        </div>

        {/* Preview - Dynamic label */}
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Generate preview token if product is not effectively live
            if (!effectivelyLive) {
              try {
                const res = await fetch('/api/admin/preview-token', { method: 'POST' });
                if (res.ok) {
                  window.open(`/products/${product.slug}`, '_blank');
                }
              } catch (error) {
                console.error('Failed to generate preview token:', error);
              }
            } else {
              window.open(`/products/${product.slug}`, '_blank');
            }
          }}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
            effectivelyLive
              ? "text-[var(--admin-text-secondary)] hover:text-green-400 hover:bg-green-500/10"
              : "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
          )}
          title={effectivelyLive ? 'View Live Page' : 'View Draft Page'}
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">{effectivelyLive ? 'View' : 'View Draft'}</span>
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Link>
  );
  };

  const Section = ({
    title,
    icon: Icon,
    count,
    expanded,
    onToggle,
    children,
    actionHref,
    actionLabel,
  }: {
    title: string;
    icon: React.ElementType;
    count: number;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    actionHref?: string;
    actionLabel?: string;
  }) => (
    <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[var(--admin-border)]">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Icon className="w-5 h-5 text-[var(--primary)]" />
          <span className="font-medium text-[var(--admin-text-primary)]">{title}</span>
          <span className="px-2 py-0.5 text-xs bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-full">
            {count}
          </span>
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-[var(--admin-text-muted)]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[var(--admin-text-muted)]" />
          )}
        </button>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {actionLabel}
          </Link>
        )}
      </div>
      {expanded && <div className="divide-y divide-[var(--admin-border)]">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">Pages</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1">
            Manage your site pages and navigation
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Page
        </Link>
      </div>

      {/* Site Draft Mode Banner */}
      {siteInDraftMode && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="font-medium text-orange-400">Site is in Draft Mode</p>
            <p className="text-sm text-[var(--admin-text-secondary)]">All pages show as Draft to visitors. Individual page toggles are disabled.</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--admin-input)] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--admin-text-secondary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--admin-text-primary)]">{pages.length}</p>
              <p className="text-sm text-[var(--admin-text-muted)]">Total Pages</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-5">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              siteInDraftMode ? "bg-orange-500/10" : "bg-green-500/10"
            )}>
              {siteInDraftMode ? (
                <EyeOff className="w-5 h-5 text-orange-400" />
              ) : (
                <Eye className="w-5 h-5 text-green-400" />
              )}
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--admin-text-primary)]">
                {siteInDraftMode ? 0 : pages.filter((p) => p.isActive).length}
              </p>
              <p className="text-sm text-[var(--admin-text-muted)]">Live Pages</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--admin-text-primary)]">{products.length}</p>
              <p className="text-sm text-[var(--admin-text-muted)]">Products</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-5">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              siteInDraftMode ? "bg-orange-500/10" : "bg-gray-500/10"
            )}>
              <EyeOff className={cn(
                "w-5 h-5",
                siteInDraftMode ? "text-orange-400" : "text-[var(--admin-text-secondary)]"
              )} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--admin-text-primary)]">
                {siteInDraftMode ? pages.length : pages.filter((p) => !p.isActive).length}
              </p>
              <p className="text-sm text-[var(--admin-text-muted)]">Draft Pages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Sections */}
      <div className="space-y-4">
        {/* Main Pages */}
        <Section
          title="Main Pages"
          icon={Navigation}
          count={mainNavPages.length}
          expanded={expandedSections.navigation}
          onToggle={() => toggleSection('navigation')}
          actionHref="/admin/pages/new"
          actionLabel="New Page"
        >
          {mainNavPages.length > 0 ? (
            mainNavPages.map((page) => (
              <PageRow
                key={page.id}
                page={page}
                onToggle={() => togglePageStatus(page)}
                onDelete={() => setDeleteModal({ isOpen: true, page })}
              />
            ))
          ) : (
            <div className="p-8 text-center text-[var(--admin-text-muted)] text-sm">
              No pages in main navigation
            </div>
          )}
        </Section>

        {/* Product Pages */}
        <Section
          title="Product Pages"
          icon={Package}
          count={products.length}
          expanded={expandedSections.products}
          onToggle={() => toggleSection('products')}
          actionHref="/admin/products/new"
          actionLabel="New Product"
        >
          {products.length > 0 ? (
            products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onToggle={() => toggleProductStatus(product)}
                onDelete={() => handleDeleteProduct(product)}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-[var(--admin-text-muted)] text-sm mb-4">No products yet</p>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-sm hover:bg-[var(--admin-hover)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Link>
            </div>
          )}
        </Section>

        {/* Footer Pages */}
        <Section
          title="Footer Pages"
          icon={FileText}
          count={footerPages.length}
          expanded={expandedSections.footer}
          onToggle={() => toggleSection('footer')}
          actionHref="/admin/pages/new"
          actionLabel="New Footer Page"
        >
          {footerPages.length > 0 ? (
            footerPages.map((page) => (
              <PageRow
                key={page.id}
                page={page}
                onToggle={() => togglePageStatus(page)}
                onDelete={() => setDeleteModal({ isOpen: true, page })}
              />
            ))
          ) : (
            <div className="p-8 text-center text-[var(--admin-text-muted)] text-sm">
              No footer pages
            </div>
          )}
        </Section>

        {/* Other Pages */}
        {otherPages.length > 0 && (
          <Section
            title="Other Pages"
            icon={Layout}
            count={otherPages.length}
            expanded={expandedSections.other}
            onToggle={() => toggleSection('other')}
          >
            {otherPages.map((page) => (
              <PageRow
                key={page.id}
                page={page}
                onToggle={() => togglePageStatus(page)}
                onDelete={() => setDeleteModal({ isOpen: true, page })}
              />
            ))}
          </Section>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        pageName={deleteModal.page?.title || ''}
        onClose={() => setDeleteModal({ isOpen: false, page: null })}
        onDelete={() => deleteModal.page && handleDelete(deleteModal.page)}
        onUnpublish={() => deleteModal.page && handleUnpublish(deleteModal.page)}
      />
    </div>
  );
}
