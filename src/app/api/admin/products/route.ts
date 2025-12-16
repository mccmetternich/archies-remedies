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

    // Create product with all fields
    await db.insert(products).values({
      id: productId,
      // Basic info
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle || null,
      shortDescription: product.shortDescription || null,

      // Pricing
      price: product.price || null,
      compareAtPrice: product.compareAtPrice || null,

      // Media
      heroImageUrl: product.heroImageUrl || null,
      secondaryImageUrl: product.secondaryImageUrl || null,
      heroCarouselImages: product.heroCarouselImages || null,

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

      // Widgets
      widgets: product.widgets || null,

      // SEO
      metaTitle: product.metaTitle || null,
      metaDescription: product.metaDescription || null,

      // Status
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
