import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, productVariants, productBenefits } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id))
      .orderBy(productVariants.sortOrder);

    const benefits = await db
      .select()
      .from(productBenefits)
      .where(eq(productBenefits.productId, id))
      .orderBy(productBenefits.sortOrder);

    return NextResponse.json({ product, variants, benefits });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { product, variants, benefits } = await request.json();

    // Update product
    await db
      .update(products)
      .set({
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
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, id));

    // Delete existing variants and recreate
    await db.delete(productVariants).where(eq(productVariants.productId, id));
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await db.insert(productVariants).values({
          id: variant.id.startsWith('new-') ? generateId() : variant.id,
          productId: id,
          name: variant.name,
          price: variant.price || null,
          compareAtPrice: variant.compareAtPrice || null,
          amazonUrl: variant.amazonUrl,
          isDefault: variant.isDefault || false,
          sortOrder: variant.sortOrder || 0,
        });
      }
    }

    // Delete existing benefits and recreate
    await db.delete(productBenefits).where(eq(productBenefits.productId, id));
    if (benefits && benefits.length > 0) {
      for (const benefit of benefits) {
        await db.insert(productBenefits).values({
          id: benefit.id.startsWith('new-') ? generateId() : benefit.id,
          productId: id,
          title: benefit.title,
          description: benefit.description || null,
          isPositive: benefit.isPositive ?? true,
          sortOrder: benefit.sortOrder || 0,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    await db
      .update(products)
      .set({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Variants and benefits will cascade delete due to foreign key
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
