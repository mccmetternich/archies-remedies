import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Package, Plus, Edit, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

async function getProducts() {
  return db.select().from(products).orderBy(products.sortOrder);
}

export default async function ProductsPage() {
  const productList = await getProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Products</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Manage your product pages
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-xl border border-[var(--border)]">
        {productList.length > 0 ? (
          <div className="divide-y divide-[var(--border-light)]">
            {productList.map((product) => (
              <div
                key={product.id}
                className="p-4 flex items-center gap-4 hover:bg-[var(--muted)] transition-colors"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-lg bg-[var(--secondary)] flex items-center justify-center shrink-0 overflow-hidden">
                  {product.heroImageUrl ? (
                    <img
                      src={product.heroImageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-[var(--muted-foreground)]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{product.name}</h3>
                    {!product.isActive && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-1">
                    {product.shortDescription || 'No description'}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    /{product.slug}
                    {product.price && (
                      <span className="ml-2">• ${product.price.toFixed(2)}</span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/products/${product.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg hover:bg-[var(--border-light)] transition-colors"
                    title="View product"
                  >
                    <Eye className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </Link>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="p-2 rounded-lg hover:bg-[var(--border-light)] transition-colors"
                    title="Edit product"
                  >
                    <Edit className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
            <h3 className="font-medium mb-2">No products yet</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Create your first product to get started
            </p>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
