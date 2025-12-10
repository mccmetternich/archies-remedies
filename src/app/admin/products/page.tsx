import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import Link from 'next/link';
import { Package, Plus, Eye, EyeOff, ExternalLink, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

async function getProducts() {
  return db.select().from(products).orderBy(products.sortOrder);
}

export default async function ProductsPage() {
  const productList = await getProducts();

  const activeCount = productList.filter((p) => p.isActive).length;
  const draftCount = productList.filter((p) => !p.isActive).length;

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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--admin-input)] flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--admin-text-secondary)]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{productList.length}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{activeCount}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Live</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-500/10 flex items-center justify-center shrink-0">
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--admin-text-secondary)]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{draftCount}</p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">Drafts</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">
                {productList.filter((p) => p.price).length}
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
              {productList.length}
            </span>
          </div>
        </div>

        {productList.length > 0 ? (
          <div className="divide-y divide-[var(--admin-border)]">
            {productList.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-[var(--primary)]/5 transition-colors group cursor-pointer"
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
                    {/* Mobile status indicator */}
                    <span className={`sm:hidden w-2 h-2 rounded-full shrink-0 ${
                      product.isActive ? 'bg-green-400' : 'bg-gray-400'
                    }`} />
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--admin-text-muted)] truncate">
                    {product.price ? `$${product.price.toFixed(2)}` : 'No price'}
                    <span className="hidden sm:inline"> • /products/{product.slug}</span>
                  </p>
                </div>

                {/* Actions - Desktop */}
                <div className="hidden sm:flex items-center gap-4" onClick={(e) => e.preventDefault()}>
                  {/* Status */}
                  <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                    product.isActive
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-gray-500/10 text-[var(--admin-text-secondary)]'
                  }`}>
                    {product.isActive ? (
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
                  </span>

                  {/* Preview */}
                  <a
                    href={`/products/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] hover:bg-[var(--admin-input)] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </Link>
            ))}
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
    </div>
  );
}
