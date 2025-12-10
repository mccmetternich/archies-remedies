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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">Products</h1>
          <p className="text-gray-400 mt-1">
            Manage your product catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[#0a0a0a] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{productList.length}</p>
              <p className="text-sm text-gray-500">Total Products</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{activeCount}</p>
              <p className="text-sm text-gray-500">Live</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{draftCount}</p>
              <p className="text-sm text-gray-500">Drafts</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">
                {productList.filter((p) => p.price).length}
              </p>
              <p className="text-sm text-gray-500">With Prices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] overflow-hidden">
        <div className="p-4 border-b border-[#1f1f1f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-[var(--primary)]" />
            <span className="font-medium text-white">All Products</span>
            <span className="px-2 py-0.5 text-xs bg-[#1a1a1a] text-gray-400 rounded-full">
              {productList.length}
            </span>
          </div>
        </div>

        {productList.length > 0 ? (
          <div className="divide-y divide-[#1f1f1f]">
            {productList.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="flex items-center justify-between p-4 hover:bg-[var(--primary)]/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Image */}
                  <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0 overflow-hidden group-hover:bg-[var(--primary)]/10 transition-colors">
                    {product.heroImageUrl ? (
                      <img
                        src={product.heroImageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-gray-400 group-hover:text-[var(--primary)]" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <h3 className="font-medium text-white group-hover:text-[var(--primary)] transition-colors truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      /products/{product.slug}
                      {product.price && (
                        <span className="ml-2">• ${product.price.toFixed(2)}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4" onClick={(e) => e.preventDefault()}>
                  {/* Status */}
                  <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                    product.isActive
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-gray-500/10 text-gray-400'
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
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-500 opacity-50" />
            <h3 className="font-medium text-white mb-2">No products yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create your first product to get started
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[#0a0a0a] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
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
