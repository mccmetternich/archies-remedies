import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { heroSlides, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    // Get all slides with product data
    const slides = await db
      .select()
      .from(heroSlides)
      .orderBy(heroSlides.sortOrder);

    // Get all products for lookup
    const allProducts = await db.select().from(products);
    const productMap = new Map(allProducts.map((p) => [p.id, p]));

    // Enrich slides with product data
    const enrichedSlides = slides.map((slide) => {
      const product = slide.productId ? productMap.get(slide.productId) : null;
      return {
        ...slide,
        product: product
          ? {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              rating: product.rating,
              reviewCount: product.reviewCount,
            }
          : null,
      };
    });

    return NextResponse.json(enrichedSlides);
  } catch (error) {
    console.error('Failed to fetch hero slides:', error);
    return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { slides } = await request.json();

    // Delete all existing slides
    const existing = await db.select({ id: heroSlides.id }).from(heroSlides);
    for (const slide of existing) {
      await db.delete(heroSlides).where(eq(heroSlides.id, slide.id));
    }

    // Insert all slides with new order
    for (const slide of slides) {
      await db.insert(heroSlides).values({
        id: slide.id.startsWith('new-') || slide.id.startsWith('slide-') ? generateId() : slide.id,
        title: slide.title || null,
        subtitle: slide.subtitle || null,
        bodyText: slide.bodyText || null,
        productId: slide.productId || null,
        buttonText: slide.buttonText || null,
        buttonUrl: slide.buttonUrl || null,
        secondaryButtonText: slide.secondaryButtonText || null,
        secondaryButtonUrl: slide.secondaryButtonUrl || null,
        secondaryButtonType: slide.secondaryButtonType || 'page',
        secondaryAnchorTarget: slide.secondaryAnchorTarget || null,
        imageUrl: slide.imageUrl || '',
        mobileImageUrl: slide.mobileImageUrl || null,
        videoUrl: slide.videoUrl || null,
        mobileVideoUrl: slide.mobileVideoUrl || null,
        testimonialText: slide.testimonialText || null,
        testimonialAuthor: slide.testimonialAuthor || null,
        testimonialAvatarUrl: slide.testimonialAvatarUrl || null,
        testimonialVerifiedText: slide.testimonialVerifiedText || 'Verified Purchase',
        testimonialShowCheckmark: slide.testimonialShowCheckmark ?? true,
        ratingOverride: slide.ratingOverride || null,
        reviewCountOverride: slide.reviewCountOverride || null,
        isActive: slide.isActive ?? true,
        showOnDesktop: slide.showOnDesktop ?? true,
        showOnMobile: slide.showOnMobile ?? true,
        layout: slide.layout || 'full-width',
        textColor: slide.textColor || 'dark',
        sortOrder: slide.sortOrder || 0,
      });
    }

    // Invalidate caches - hero carousel is on homepage
    revalidateTag('homepage-data', 'max');
    revalidateTag('page-data', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update hero slides:', error);
    return NextResponse.json({ error: 'Failed to update slides' }, { status: 500 });
  }
}
