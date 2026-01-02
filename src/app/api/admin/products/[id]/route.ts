import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { products, productVariants, productBenefits, pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { requireAuth } from '@/lib/api-auth';
import { updateProductFullSchema, validatePermissive } from '@/lib/validations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

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
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  const { id } = await params;

  try {
    const body = await request.json();

    // Validate with permissive mode - logs errors but continues processing
    const validation = validatePermissive(updateProductFullSchema, body);
    if (validation.hadErrors) {
      console.warn(`[Products API] Validation warnings for product ${id}:`, validation.errors);
    }

    // Extract product data with type safety through runtime checks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { product, variants, benefits } = validation.data as { product: any; variants: any[]; benefits: any[] };

    // Update product with all fields
    await db
      .update(products)
      .set({
        // Basic info
        slug: product.slug,
        name: product.name,
        subtitle: product.subtitle || null,
        shortDescription: product.shortDescription || null,

        // Pricing (convert strings to numbers)
        price: product.price ? Number(product.price) : null,
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,

        // Media (ensure string type for URLs)
        heroImageUrl: typeof product.heroImageUrl === 'string' ? product.heroImageUrl : null,
        secondaryImageUrl: typeof product.secondaryImageUrl === 'string' ? product.secondaryImageUrl : null,
        heroCarouselImages: typeof product.heroCarouselImages === 'string' ? product.heroCarouselImages : null,

        // Badge
        badge: product.badge || null,
        badgeEmoji: product.badgeEmoji || null,
        badgeBgColor: product.badgeBgColor || '#1a1a1a',
        badgeTextColor: product.badgeTextColor || '#ffffff',
        rotatingBadgeEnabled: product.rotatingBadgeEnabled ?? false,
        rotatingBadgeText: product.rotatingBadgeText || null,

        // Rating & Reviews
        rating: product.rating ?? 4.9,
        reviewCount: product.reviewCount ?? 2900,

        // Review Badge
        reviewBadge: product.reviewBadge || null,
        reviewBadgeEmoji: product.reviewBadgeEmoji || null,
        reviewBadgeBgColor: product.reviewBadgeBgColor || '#bbdae9',
        reviewBadgeTextColor: product.reviewBadgeTextColor || '#1a1a1a',

        // Rotating Seal
        rotatingSealEnabled: product.rotatingSealEnabled ?? false,
        rotatingSealImageUrl: product.rotatingSealImageUrl || null,

        // PDP Accordions
        ritualTitle: product.ritualTitle || 'The Ritual',
        ritualContent: product.ritualContent || null,
        ingredientsTitle: product.ingredientsTitle || 'Ingredients',
        ingredientsContent: product.ingredientsContent || null,
        shippingTitle: product.shippingTitle || 'Good to Know',
        shippingContent: product.shippingContent || null,

        // Bullet Points
        bulletPoint1: product.bulletPoint1 || null,
        bulletPoint2: product.bulletPoint2 || null,
        bulletPoint3: product.bulletPoint3 || null,
        bulletPoint4: product.bulletPoint4 || null,
        bulletPoint5: product.bulletPoint5 || null,

        // CTA
        ctaButtonText: product.ctaButtonText || 'Buy Now on Amazon',
        ctaExternalUrl: product.ctaExternalUrl || null,
        showDiscountSignup: product.showDiscountSignup ?? true,
        discountSignupText: product.discountSignupText || 'Get 10% off your first order',

        // Signup Section
        signupSectionEnabled: product.signupSectionEnabled ?? true,
        signupSectionTitle: product.signupSectionTitle || null,
        signupSectionSubtitle: product.signupSectionSubtitle || null,
        signupSectionButtonText: product.signupSectionButtonText || null,
        signupSectionSuccessMessage: product.signupSectionSuccessMessage || null,

        // Audio Player
        audioUrl: product.audioUrl || null,
        audioAvatarUrl: product.audioAvatarUrl || null,
        audioTitle: product.audioTitle || null,
        audioQuote: product.audioQuote || null,

        // Marquee
        marqueeEnabled: product.marqueeEnabled ?? false,
        marqueeText: product.marqueeText || null,
        marqueeBackgroundColor: product.marqueeBackgroundColor || '#1a1a1a',
        marqueeTextColor: product.marqueeTextColor || '#ffffff',

        // Widgets
        widgets: product.widgets || null,

        // SEO
        metaTitle: product.metaTitle || null,
        metaDescription: product.metaDescription || null,

        // Status
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
          heroImageUrl: variant.heroImageUrl || null,
          secondaryImageUrl: variant.secondaryImageUrl || null,
          heroCarouselImages: variant.heroCarouselImages || null,
          thumbnailUrl: variant.thumbnailUrl || null,
          badge: variant.badge || null,
          badgeBgColor: variant.badgeBgColor || '#bbdae9',
          badgeTextColor: variant.badgeTextColor || '#1a1a1a',
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

    // Update linked page (if it exists) to sync slug and title
    await db
      .update(pages)
      .set({
        slug: `products/${product.slug}`,
        title: product.name,
        isActive: product.isActive ?? true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(pages.productId, id));

    // Invalidate caches - products widget is on homepage
    revalidateTag('homepage-data', 'max');
    revalidateTag('page-data', 'max');

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
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  const { id } = await params;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await request.json() as Record<string, any>;

    await db
      .update(products)
      .set({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, id));

    // Sync isActive to linked page if changed
    if (body.isActive !== undefined) {
      await db
        .update(pages)
        .set({
          isActive: body.isActive,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(pages.productId, id));
    }

    // Invalidate caches - products widget is on homepage
    revalidateTag('homepage-data', 'max');
    revalidateTag('page-data', 'max');

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
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  const { id } = await params;

  try {
    // Variants and benefits will cascade delete due to foreign key
    await db.delete(products).where(eq(products.id, id));

    // Invalidate caches - products widget is on homepage
    revalidateTag('homepage-data', 'max');
    revalidateTag('page-data', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
