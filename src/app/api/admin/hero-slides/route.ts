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

    // Prepare all slide data first (before any database operations)
    const slideData = slides.map((slide: Record<string, unknown>, index: number) => ({
      id: (slide.id as string)?.startsWith('new-') || (slide.id as string)?.startsWith('slide-') ? generateId() : slide.id as string,
      title: slide.title as string || null,
      subtitle: slide.subtitle as string || null,
      bodyText: slide.bodyText as string || null,
      productId: slide.productId as string || null,
      buttonText: slide.buttonText as string || null,
      buttonUrl: slide.buttonUrl as string || null,
      secondaryButtonText: slide.secondaryButtonText as string || null,
      secondaryButtonUrl: slide.secondaryButtonUrl as string || null,
      secondaryButtonType: slide.secondaryButtonType as string || 'page',
      secondaryAnchorTarget: slide.secondaryAnchorTarget as string || null,
      imageUrl: slide.imageUrl as string || '',
      mobileImageUrl: slide.mobileImageUrl as string || null,
      videoUrl: slide.videoUrl as string || null,
      mobileVideoUrl: slide.mobileVideoUrl as string || null,
      testimonialText: slide.testimonialText as string || null,
      testimonialAuthor: slide.testimonialAuthor as string || null,
      testimonialAvatarUrl: slide.testimonialAvatarUrl as string || null,
      testimonialVerifiedText: slide.testimonialVerifiedText as string || 'Verified Purchase',
      testimonialShowCheckmark: slide.testimonialShowCheckmark ?? true,
      ratingOverride: slide.ratingOverride as number || null,
      reviewCountOverride: slide.reviewCountOverride as number || null,
      isActive: slide.isActive ?? true,
      showOnDesktop: slide.showOnDesktop ?? true,
      showOnMobile: slide.showOnMobile ?? true,
      layout: slide.layout as string || 'full-width',
      textColor: slide.textColor as string || 'dark',
      sortOrder: slide.sortOrder as number ?? index,
    }));

    // Use a transaction to ensure atomicity - if insert fails, delete is rolled back
    await db.transaction(async (tx) => {
      // Delete all existing slides
      const existing = await tx.select({ id: heroSlides.id }).from(heroSlides);
      for (const slide of existing) {
        await tx.delete(heroSlides).where(eq(heroSlides.id, slide.id));
      }

      // Insert all slides with new order
      for (const slide of slideData) {
        await tx.insert(heroSlides).values(slide);
      }
    });

    // Invalidate caches - hero carousel is on homepage
    revalidateTag('homepage-data', 'max');
    revalidateTag('page-data', 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update hero slides:', error);
    return NextResponse.json({ error: 'Failed to update slides' }, { status: 500 });
  }
}
