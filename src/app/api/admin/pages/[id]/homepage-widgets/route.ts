import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { heroSlides, testimonials, videoTestimonials, faqs, instagramPosts, products } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

// GET /api/admin/pages/[id]/homepage-widgets - Get widgets for homepage from dedicated tables
export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const [
      heroSlidesData,
      testimonialsData,
      videoTestimonialsData,
      faqsData,
      instagramData,
      productsData,
    ] = await Promise.all([
      db.select().from(heroSlides).orderBy(heroSlides.sortOrder),
      db.select().from(testimonials).where(eq(testimonials.isActive, true)).orderBy(testimonials.sortOrder),
      db.select().from(videoTestimonials).where(eq(videoTestimonials.isActive, true)).orderBy(videoTestimonials.sortOrder),
      db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(faqs.sortOrder),
      db.select().from(instagramPosts).where(eq(instagramPosts.isActive, true)).orderBy(instagramPosts.sortOrder),
      db.select().from(products).where(eq(products.isActive, true)).orderBy(products.sortOrder),
    ]);

    // Convert to widget format for display in the page editor
    const widgets = [
      {
        id: 'homepage-hero',
        type: 'hero_carousel',
        title: 'Hero Carousel',
        subtitle: `${heroSlidesData.filter(h => h.isActive).length} active slides`,
        isVisible: heroSlidesData.some(h => h.isActive),
        count: heroSlidesData.length,
        activeCount: heroSlidesData.filter(h => h.isActive).length,
        editUrl: '/admin/hero-slides',
        isHomepageWidget: true,
      },
      {
        id: 'homepage-products',
        type: 'product_grid',
        title: 'Featured Products',
        subtitle: `${productsData.length} products`,
        isVisible: productsData.length > 0,
        count: productsData.length,
        editUrl: '/admin/products',
        isHomepageWidget: true,
      },
      {
        id: 'homepage-testimonials',
        type: 'testimonials',
        title: 'Customer Testimonials',
        subtitle: `${testimonialsData.length} testimonials`,
        isVisible: testimonialsData.length > 0,
        count: testimonialsData.length,
        editUrl: '/admin/testimonials',
        isHomepageWidget: true,
      },
      {
        id: 'homepage-video-testimonials',
        type: 'video_testimonials',
        title: 'Video Reviews',
        subtitle: `${videoTestimonialsData.length} video reviews`,
        isVisible: videoTestimonialsData.length > 0,
        count: videoTestimonialsData.length,
        editUrl: '/admin/video-testimonials',
        isHomepageWidget: true,
      },
      {
        id: 'homepage-faqs',
        type: 'faqs',
        title: 'FAQ Section',
        subtitle: `${faqsData.length} questions`,
        isVisible: faqsData.length > 0,
        count: faqsData.length,
        editUrl: '/admin/faqs',
        isHomepageWidget: true,
      },
      {
        id: 'homepage-instagram',
        type: 'instagram',
        title: 'Instagram Feed',
        subtitle: `${instagramData.length} posts`,
        isVisible: instagramData.length > 0,
        count: instagramData.length,
        editUrl: '/admin/instagram',
        isHomepageWidget: true,
      },
    ];

    return NextResponse.json({
      widgets,
      rawData: {
        heroSlides: heroSlidesData,
        testimonials: testimonialsData,
        videoTestimonials: videoTestimonialsData,
        faqs: faqsData,
        instagram: instagramData,
        products: productsData,
      },
    });
  } catch (error) {
    console.error('Failed to fetch homepage widgets:', error);
    return NextResponse.json({ error: 'Failed to fetch homepage widgets' }, { status: 500 });
  }
}
