import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { heroSlides, testimonials, videoTestimonials, faqs, instagramPosts, products, siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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
      settingsData,
    ] = await Promise.all([
      db.select().from(heroSlides).orderBy(heroSlides.sortOrder),
      db.select().from(testimonials).where(eq(testimonials.isActive, true)).orderBy(testimonials.sortOrder),
      db.select().from(videoTestimonials).where(eq(videoTestimonials.isActive, true)).orderBy(videoTestimonials.sortOrder),
      db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(faqs.sortOrder),
      db.select().from(instagramPosts).where(eq(instagramPosts.isActive, true)).orderBy(instagramPosts.sortOrder),
      db.select().from(products).where(eq(products.isActive, true)).orderBy(products.sortOrder),
      db.select().from(siteSettings).limit(1),
    ]);

    const settings = settingsData[0];

    // Convert to widget format for display in the page editor
    // Order matches actual homepage rendering order
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
        id: 'homepage-marquee',
        type: 'marquee',
        title: 'Marquee Bar',
        subtitle: settings?.marqueeText ? 'Scrolling text banner' : 'Not configured',
        isVisible: settings?.marqueeEnabled !== false,
        editUrl: '/admin/settings',
        isHomepageWidget: true,
        config: {
          text: settings?.marqueeText || '',
          speed: settings?.marqueeSpeed || 'slow',
          size: settings?.marqueeSize || 'xl',
          style: settings?.marqueeStyle || 'dark',
        },
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
        id: 'homepage-mission',
        type: 'mission',
        title: 'Mission Section',
        subtitle: 'Brand story and values',
        isVisible: true,
        editUrl: '/admin/settings',
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
