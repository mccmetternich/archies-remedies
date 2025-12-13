import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { heroSlides, testimonials, videoTestimonials, faqs, instagramPosts, products, pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';
import { getDefaultConfig } from '@/lib/widget-library';

interface StoredWidget {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  config?: Record<string, unknown>;
  isVisible: boolean;
  isHomepageWidget?: boolean;
  editUrl?: string;
  count?: number;
  activeCount?: number;
}

// GET /api/admin/pages/[id]/homepage-widgets - Get widgets for homepage
// IMPORTANT: This reads from pages.widgets JSON to stay in sync with what's rendered on public site
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;

    // First, get the homepage record to read its widgets JSON
    const [homePage] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);

    // Parse existing widgets from pages.widgets JSON
    let existingWidgets: StoredWidget[] = [];
    if (homePage?.widgets) {
      try {
        existingWidgets = JSON.parse(homePage.widgets);
      } catch {
        existingWidgets = [];
      }
    }

    // Fetch counts for global widgets
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

    // If no existing widgets, create defaults
    if (existingWidgets.length === 0) {
      existingWidgets = [
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
          config: {},
        },
        {
          id: 'homepage-marquee',
          type: 'marquee',
          title: 'Marquee Bar',
          subtitle: 'Scrolling text banner',
          isVisible: true,
          editUrl: '/admin/settings',
          isHomepageWidget: true,
          config: getDefaultConfig('marquee'),
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
          config: getDefaultConfig('product_grid'),
        },
        {
          id: 'homepage-mission',
          type: 'mission',
          title: 'Mission Section',
          subtitle: 'Brand story and values',
          isVisible: true,
          editUrl: '/admin/settings',
          isHomepageWidget: true,
          config: getDefaultConfig('mission'),
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
          config: {},
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
          config: {},
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
          config: {},
        },
      ];
    }

    // Update counts on existing widgets (counts can change)
    const widgets = existingWidgets.map((widget) => {
      switch (widget.type) {
        case 'hero_carousel':
          return {
            ...widget,
            subtitle: `${heroSlidesData.filter(h => h.isActive).length} active slides`,
            count: heroSlidesData.length,
            activeCount: heroSlidesData.filter(h => h.isActive).length,
          };
        case 'product_grid':
          return {
            ...widget,
            subtitle: `${productsData.length} products`,
            count: productsData.length,
          };
        case 'testimonials':
          return {
            ...widget,
            subtitle: `${testimonialsData.length} testimonials`,
            count: testimonialsData.length,
          };
        case 'video_testimonials':
          return {
            ...widget,
            subtitle: `${videoTestimonialsData.length} video reviews`,
            count: videoTestimonialsData.length,
          };
        case 'instagram':
          return {
            ...widget,
            subtitle: `${instagramData.length} posts`,
            count: instagramData.length,
          };
        default:
          return widget;
      }
    });

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
