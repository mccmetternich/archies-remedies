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
      <div className="relative bg-[#111111] rounded-2xl border border-[#1f1f1f] p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Delete "{pageName}"?</h3>
            <p className="text-sm text-gray-400 mb-6">
              This will permanently remove this page. Would you like to unpublish it instead so you can restore it later?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={onUnpublish}
                className="w-full py-2.5 px-4 bg-[#1a1a1a] text-gray-300 rounded-lg text-sm font-medium hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
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
                className="w-full py-2.5 px-4 text-gray-500 rounded-lg text-sm font-medium hover:text-gray-300 transition-colors"
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
    Promise.all([fetchPages(), fetchProducts()]);
  }, []);

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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Categorize pages
  const mainNavPages = pages.filter((p) => p.showInNav && p.slug !== 'about' && !['terms', 'privacy', 'shipping', 'returns'].includes(p.slug));
  const footerPages = pages.filter((p) => ['about', 'terms', 'privacy', 'shipping', 'returns', 'contact'].includes(p.slug));
  const otherPages = pages.filter((p) => !mainNavPages.includes(p) && !footerPages.includes(p));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const PageRow = ({ page, onToggle, onDelete }: { page: Page; onToggle: () => void; onDelete: () => void }) => (
    <Link
      href={`/admin/pages/${page.id}`}
      className="flex items-center justify-between p-4 hover:bg-[var(--primary)]/5 transition-colors group cursor-pointer"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0 group-hover:bg-[var(--primary)]/10 transition-colors">
          {page.pageType === 'landing' ? (
            <Layout className="w-5 h-5 text-gray-400 group-hover:text-[var(--primary)]" />
          ) : (
            <FileText className="w-5 h-5 text-gray-400 group-hover:text-[var(--primary)]" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-white group-hover:text-[var(--primary)] transition-colors truncate">
            {page.title}
          </h3>
          <p className="text-sm text-gray-500 truncate">/{page.slug}</p>
        </div>
      </div>

      <div className="flex items-center gap-4" onClick={(e) => e.preventDefault()}>
        {/* Status Toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            page.isActive
              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
              : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
          )}
        >
          {page.isActive ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              Live
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              Draft
            </>
          )}
        </button>

        {/* Preview */}
        <a
          href={`/${page.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Link>
  );

  const ProductRow = ({ product, onToggle }: { product: Product; onToggle: () => void }) => (
    <Link
      href={`/admin/products/${product.id}`}
      className="flex items-center justify-between p-4 hover:bg-[var(--primary)]/5 transition-colors group cursor-pointer"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0 group-hover:bg-[var(--primary)]/10 transition-colors">
          <Package className="w-5 h-5 text-gray-400 group-hover:text-[var(--primary)]" />
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-white group-hover:text-[var(--primary)] transition-colors truncate">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">/products/{product.slug}</p>
        </div>
      </div>

      <div className="flex items-center gap-4" onClick={(e) => e.preventDefault()}>
        {/* Status Toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            product.isActive
              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
              : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
          )}
        >
          {product.isActive ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              Live
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              Hidden
            </>
          )}
        </button>

        {/* Preview */}
        <a
          href={`/products/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </Link>
  );

  const Section = ({
    title,
    icon: Icon,
    count,
    expanded,
    onToggle,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    count: number;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[var(--primary)]" />
          <span className="font-medium text-white">{title}</span>
          <span className="px-2 py-0.5 text-xs bg-[#1a1a1a] text-gray-400 rounded-full">
            {count}
          </span>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {expanded && <div className="border-t border-[#1f1f1f] divide-y divide-[#1f1f1f]">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">Pages</h1>
          <p className="text-gray-400 mt-1">
            Manage your site pages and navigation
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[#0a0a0a] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Page
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{pages.length}</p>
              <p className="text-sm text-gray-500">Total Pages</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">
                {pages.filter((p) => p.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Live Pages</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{products.length}</p>
              <p className="text-sm text-gray-500">Products</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">
                {pages.filter((p) => !p.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Draft Pages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Sections */}
      <div className="space-y-4">
        {/* Main Navigation Pages */}
        <Section
          title="Main Navigation Pages"
          icon={Navigation}
          count={mainNavPages.length}
          expanded={expandedSections.navigation}
          onToggle={() => toggleSection('navigation')}
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
            <div className="p-8 text-center text-gray-500 text-sm">
              No pages in main navigation
            </div>
          )}
        </Section>

        {/* Products */}
        <Section
          title="Products"
          icon={Package}
          count={products.length}
          expanded={expandedSections.products}
          onToggle={() => toggleSection('products')}
        >
          {products.length > 0 ? (
            products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onToggle={() => toggleProductStatus(product)}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm mb-4">No products yet</p>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-gray-300 rounded-lg text-sm hover:bg-[#2a2a2a] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Link>
            </div>
          )}
        </Section>

        {/* Footer Links */}
        <Section
          title="Footer Links"
          icon={FileText}
          count={footerPages.length}
          expanded={expandedSections.footer}
          onToggle={() => toggleSection('footer')}
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
            <div className="p-8 text-center text-gray-500 text-sm">
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
