'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Plus, Eye, EyeOff, ExternalLink, DollarSign, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/admin/status-badge';
import { MobileActionBar } from '@/components/admin/mobile-action-bar';

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number | null;
  heroImageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface DeleteModalProps {
  isOpen: boolean;
  productName: string;
  onClose: () => void;
  onDelete: () => void;
  onUnpublish: () => void;
}

function DeleteModal({ isOpen, productName, onClose, onDelete, onUnpublish }: DeleteModalProps) {
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
            <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-2">Delete "{productName}"?</h3>
            <p className="text-sm text-[var(--admin-text-secondary)] mb-6">
              This will permanently remove this product and all its variants. Would you like to unpublish it instead so you can restore it later?
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteInDraftMode, setSiteInDraftMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null,
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Get the selected product for mobile action bar
  const selectedProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null;

  useEffect(() => {
    Promise.all([fetchProducts(), fetchSiteSettings()]);
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

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // When site is in draft mode, ALL products are effectively draft regardless of individual status
  const isEffectivelyLive = (isActive: boolean) => {
    if (siteInDraftMode) return false;
    return isActive;
  };

  const activeCount = siteInDraftMode ? 0 : products.filter((p) => p.isActive).length;
  const draftCount = siteInDraftMode ? products.length : products.filter((p) => !p.isActive).length;

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

  const handleDelete = async (product: Product) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p.id !== product.id));
      setDeleteModal({ isOpen: false, product: null });
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleUnpublish = async (product: Product) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
      setProducts(products.map((p) =>
        p.id === product.id ? { ...p, isActive: false } : p
      ));
      setDeleteModal({ isOpen: false, product: null });
    } catch (error) {
      console.error('Failed to unpublish:', error);
    }
  };

  const handlePreview = async (product: Product) => {
    const baseUrl = `/products/${product.slug}`;
    const effectivelyLive = isEffectivelyLive(product.isActive);

    if (!effectivelyLive) {
      try {
        const res = await fetch('/api/admin/preview', { method: 'POST' });
        const data = await res.json();
        if (res.ok && data.token) {
          window.open(`${baseUrl}?token=${data.token}`, '_blank');
          return;
        }
      } catch (error) {
        console.error('Failed to generate preview token:', error);
      }
    }
    window.open(baseUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-medium text-[var(--admin-text-primary)]">Products</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1 text-sm hidden sm:block">
            Manage your product catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors text-sm sm:text-base shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
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
            <p className="text-sm text-[var(--admin-text-secondary)]">All products show as Draft to visitors. Individual toggles are disabled.</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--admin-input)] flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--admin-text-secondary)]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{products.length}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0",
              siteInDraftMode ? "bg-orange-500/10" : "bg-green-500/10"
            )}>
              {siteInDraftMode ? (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              ) : (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{activeCount}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Live</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0",
              siteInDraftMode ? "bg-orange-500/10" : "bg-gray-500/10"
            )}>
              <EyeOff className={cn(
                "w-4 h-4 sm:w-5 sm:h-5",
                siteInDraftMode ? "text-orange-400" : "text-[var(--admin-text-secondary)]"
              )} />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{draftCount}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Drafts</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">
                {products.filter((p) => p.price).length}
              </p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Priced</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-[var(--admin-border)] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            <span className="font-medium text-[var(--admin-text-primary)] text-sm sm:text-base">All Products</span>
            <span className="px-2 py-0.5 text-xs bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-full">
              {products.length}
            </span>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="divide-y divide-[var(--admin-border)]">
            {products.map((product) => {
              const effectivelyLive = isEffectivelyLive(product.isActive);

              return (
                <div
                  key={product.id}
                  className={cn(
                    "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-[var(--primary)]/5 transition-colors group cursor-pointer",
                    selectedProductId === product.id && "bg-[var(--primary)]/10 sm:bg-transparent"
                  )}
                  onClick={(e) => {
                    // On mobile, first tap selects; on desktop, navigate
                    if (window.innerWidth < 640) {
                      e.preventDefault();
                      setSelectedProductId(selectedProductId === product.id ? null : product.id);
                    } else {
                      window.location.href = `/admin/products/${product.id}`;
                    }
                  }}
                >
                  {/* Image */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[var(--admin-input)] flex items-center justify-center shrink-0 overflow-hidden group-hover:bg-[var(--primary)]/10 transition-colors">
                    {product.heroImageUrl ? (
                      <img
                        src={product.heroImageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--admin-text-secondary)] group-hover:text-[var(--primary)]" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[var(--admin-text-primary)] group-hover:text-[var(--primary)] transition-colors truncate text-sm sm:text-base">
                        {product.name}
                      </h3>
                      {/* Mobile status badge - tappable */}
                      <div className="sm:hidden" onClick={(e) => e.stopPropagation()}>
                        <StatusBadge isLive={effectivelyLive} size="sm" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--admin-text-muted)] truncate">
                      {product.price ? `$${product.price.toFixed(2)}` : 'No price'}
                      <span className="hidden sm:inline"> • /products/{product.slug}</span>
                    </p>
                  </div>

                  {/* Actions - Desktop */}
                  <div className="hidden sm:flex items-center gap-4" onClick={(e) => e.preventDefault()}>
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
                          if (!siteInDraftMode) toggleProductStatus(product);
                        }}
                        disabled={siteInDraftMode}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                          siteInDraftMode && "opacity-50 cursor-not-allowed"
                        )}
                        style={{
                          backgroundColor: effectivelyLive ? '#22c55e' : '#f97316'
                        }}
                        title={siteInDraftMode ? 'Site is in Draft Mode - all products are draft' : undefined}
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePreview(product);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        effectivelyLive
                          ? "text-[var(--admin-text-secondary)] hover:text-green-400 hover:bg-green-500/10"
                          : "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                      )}
                      title={effectivelyLive ? 'View Live Product' : 'View Draft Product'}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{effectivelyLive ? 'View' : 'View Draft'}</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteModal({ isOpen: true, product });
                      }}
                      className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)] opacity-50" />
            <h3 className="font-medium text-[var(--admin-text-primary)] mb-2">No products yet</h3>
            <p className="text-sm text-[var(--admin-text-muted)] mb-4">
              Create your first product to get started
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        productName={deleteModal.product?.name || ''}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onDelete={() => deleteModal.product && handleDelete(deleteModal.product)}
        onUnpublish={() => deleteModal.product && handleUnpublish(deleteModal.product)}
      />

      {/* Mobile Action Bar */}
      <MobileActionBar
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProductId(null)}
        title={selectedProduct?.name}
        actions={selectedProduct ? [
          {
            label: 'Edit Product',
            icon: <Package className="w-5 h-5" />,
            onClick: () => {
              window.location.href = `/admin/products/${selectedProduct.id}`;
            },
            variant: 'primary',
          },
          {
            label: isEffectivelyLive(selectedProduct.isActive) ? 'Set to Draft' : 'Set to Live',
            icon: isEffectivelyLive(selectedProduct.isActive) ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />,
            onClick: () => {
              toggleProductStatus(selectedProduct);
              setSelectedProductId(null);
            },
            disabled: siteInDraftMode,
          },
          {
            label: isEffectivelyLive(selectedProduct.isActive) ? 'View Live' : 'View Draft',
            icon: <ExternalLink className="w-5 h-5" />,
            onClick: () => {
              handlePreview(selectedProduct);
              setSelectedProductId(null);
            },
          },
          {
            label: 'Delete',
            icon: <Trash2 className="w-5 h-5" />,
            onClick: () => {
              setDeleteModal({ isOpen: true, product: selectedProduct });
              setSelectedProductId(null);
            },
            variant: 'danger',
          },
        ] : []}
      />
    </div>
  );
}
