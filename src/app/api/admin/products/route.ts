import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { products, productVariants, productBenefits, pages } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const data = await db.select().from(products).orderBy(products.sortOrder);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { product, variants, benefits } = await request.json();

    const productId = generateId();

    // Create product
    await db.insert(products).values({
      id: productId,
      slug: product.slug,
      name: product.name,
      shortDescription: product.shortDescription || null,
      longDescription: product.longDescription || null,
      price: product.price || null,
      compareAtPrice: product.compareAtPrice || null,
      heroImageUrl: product.heroImageUrl || null,
      metaTitle: product.metaTitle || null,
      metaDescription: product.metaDescription || null,
      isActive: product.isActive ?? true,
      sortOrder: product.sortOrder || 0,
    });

    // Create variants
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await db.insert(productVariants).values({
          id: generateId(),
          productId,
          name: variant.name,
          price: variant.price || null,
          compareAtPrice: variant.compareAtPrice || null,
          amazonUrl: variant.amazonUrl,
          isDefault: variant.isDefault || false,
          sortOrder: variant.sortOrder || 0,
        });
      }
    }

    // Create benefits
    if (benefits && benefits.length > 0) {
      for (const benefit of benefits) {
        await db.insert(productBenefits).values({
          id: generateId(),
          productId,
          title: benefit.title,
          description: benefit.description || null,
          isPositive: benefit.isPositive ?? true,
          sortOrder: benefit.sortOrder || 0,
        });
      }
    }

    // Auto-create linked page for below-fold widget management
    const pageId = generateId();
    await db.insert(pages).values({
      id: pageId,
      slug: `products/${product.slug}`,
      title: product.name,
      pageType: 'product',
      productId: productId,
      widgets: '[]',
      isActive: product.isActive ?? true,
      showInNav: false,
    });

    // Invalidate caches - products widget is on homepage
    revalidateTag('homepage-data', 'max');
    revalidateTag('page-data', 'max');

    return NextResponse.json({ id: productId, pageId, success: true });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
