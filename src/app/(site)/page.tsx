import { db } from '@/lib/db';
import { heroSlides, products, testimonials, videoTestimonials, instagramPosts, siteSettings, pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { checkPageDraft } from '@/lib/draft-mode';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { ProductTiles } from '@/components/home/product-tiles';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { MissionSection } from '@/components/home/mission-section';
import { VideoTestimonials } from '@/components/home/video-testimonials';
import { InstagramFeed } from '@/components/home/instagram-feed';
import { SitePopups } from '@/components/popups';
import { ScrollingTextBar } from '@/components/ui/scrolling-text-bar';
import { unstable_cache } from 'next/cache';

export const revalidate = 60; // Revalidate every minute

// Cached homepage data for better performance
const getCachedPageData = unstable_cache(
  async () => {
    const [settings] = await db.select().from(siteSettings).limit(1);

    const slides = await db
      .select()
      .from(heroSlides)
      .where(eq(heroSlides.isActive, true))
      .orderBy(heroSlides.sortOrder);

    const productList = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(products.sortOrder);

    const testimonialList = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isActive, true))
      .orderBy(testimonials.sortOrder);

    const videoList = await db
      .select()
      .from(videoTestimonials)
      .where(eq(videoTestimonials.isActive, true))
      .orderBy(videoTestimonials.sortOrder);

    const instagramList = await db
      .select()
      .from(instagramPosts)
      .where(eq(instagramPosts.isActive, true))
      .orderBy(instagramPosts.sortOrder);

    // Get pages for nav
    const navPages = await db
      .select({
        id: pages.id,
        slug: pages.slug,
        title: pages.title,
        showInNav: pages.showInNav,
        navOrder: pages.navOrder,
        navShowOnDesktop: pages.navShowOnDesktop,
        navShowOnMobile: pages.navShowOnMobile,
      })
      .from(pages)
      .where(eq(pages.isActive, true))
      .orderBy(pages.navOrder);

    return {
      settings,
      slides,
      products: productList,
      testimonials: testimonialList,
      videos: videoList,
      instagramPosts: instagramList,
      navPages,
    };
  },
  ['homepage-data'],
  { revalidate: 60, tags: ['homepage-data'] }
);

async function getPageData() {
  return getCachedPageData();
}

export default async function HomePage() {
  // Check if homepage is draft - redirects to coming-soon if needed
  await checkPageDraft('home');

  const data = await getPageData();

  return (
    <>
      <Header
        logo={data.settings?.logoUrl}
        products={data.products}
        bumper={data.settings ? {
          bumperEnabled: data.settings.bumperEnabled,
          bumperText: data.settings.bumperText,
          bumperLinkUrl: data.settings.bumperLinkUrl,
          bumperLinkText: data.settings.bumperLinkText,
          bumperTheme: (data.settings.bumperTheme as 'light' | 'dark') || 'light',
        } : null}
        socialStats={data.settings ? {
          totalReviews: data.settings.totalReviews,
          totalCustomers: data.settings.totalCustomers,
          instagramFollowers: data.settings.instagramFollowers,
          facebookFollowers: data.settings.facebookFollowers,
        } : null}
        globalNav={data.settings ? {
          logoPosition: data.settings.navLogoPosition,
          logoPositionMobile: data.settings.navLogoPositionMobile,
          ctaEnabled: data.settings.navCtaEnabled,
          ctaText: data.settings.navCtaText,
          ctaUrl: data.settings.navCtaUrl,
          tile1ProductId: data.settings.navDropdownTile1ProductId,
          tile1Title: data.settings.navDropdownTile1Title,
          tile1Subtitle: data.settings.navDropdownTile1Subtitle,
          tile1Badge: data.settings.navDropdownTile1Badge,
          tile1BadgeEmoji: data.settings.navDropdownTile1BadgeEmoji,
          tile1BadgeBgColor: data.settings.navDropdownTile1BadgeBgColor,
          tile1BadgeTextColor: data.settings.navDropdownTile1BadgeTextColor,
          tile1ImageUrl: data.settings.navDropdownTile1ImageUrl,
          tile1HoverImageUrl: data.settings.navDropdownTile1HoverImageUrl,
          tile2ProductId: data.settings.navDropdownTile2ProductId,
          tile2Title: data.settings.navDropdownTile2Title,
          tile2Subtitle: data.settings.navDropdownTile2Subtitle,
          tile2Badge: data.settings.navDropdownTile2Badge,
          tile2BadgeEmoji: data.settings.navDropdownTile2BadgeEmoji,
          tile2BadgeBgColor: data.settings.navDropdownTile2BadgeBgColor,
          tile2BadgeTextColor: data.settings.navDropdownTile2BadgeTextColor,
          tile2ImageUrl: data.settings.navDropdownTile2ImageUrl,
          tile2HoverImageUrl: data.settings.navDropdownTile2HoverImageUrl,
          // Marketing Tile fields (what header.tsx checks for)
          marketingTileTitle: data.settings.navMarketingTileTitle,
          marketingTileDescription: data.settings.navMarketingTileDescription,
          marketingTileBadge1: data.settings.navMarketingTileBadge1,
          marketingTileBadge2: data.settings.navMarketingTileBadge2,
          marketingTileBadge3: data.settings.navMarketingTileBadge3,
          marketingTileCtaEnabled: data.settings.navMarketingTileCtaEnabled,
          marketingTileCtaText: data.settings.navMarketingTileCtaText,
          marketingTileCtaUrl: data.settings.navMarketingTileCtaUrl,
          marketingTileRotatingBadgeEnabled: data.settings.navMarketingTileRotatingBadgeEnabled,
          marketingTileRotatingBadgeUrl: data.settings.navMarketingTileRotatingBadgeUrl,
          marketingTileHideOnMobile: data.settings.navMarketingTileHideOnMobile,
          // Legacy fields for backwards compatibility
          cleanFormulasTitle: data.settings.navCleanFormulasTitle,
          cleanFormulasDescription: data.settings.navCleanFormulasDescription,
          cleanFormulasCtaEnabled: data.settings.navCleanFormulasCtaEnabled,
          cleanFormulasCtaText: data.settings.navCleanFormulasCtaText,
          cleanFormulasCtaUrl: data.settings.navCleanFormulasCtaUrl,
          cleanFormulasBadgeEnabled: data.settings.navCleanFormulasBadgeEnabled,
          cleanFormulasBadgeUrl: data.settings.navCleanFormulasBadgeUrl,
        } : null}
        navPages={data.navPages}
      />

      <main>
        {/* Hero Carousel */}
        <HeroCarousel slides={data.slides} />

        {/* Scrolling Text Bar - Configurable from admin */}
        {data.settings?.marqueeEnabled !== false && data.settings?.marqueeText && (
          <ScrollingTextBar
            text={data.settings.marqueeText}
            size={(data.settings.marqueeSize as 'small' | 'medium' | 'large' | 'xl' | 'xxl') || 'xl'}
            speed={(data.settings.marqueeSpeed as 'slow' | 'normal' | 'fast') || 'slow'}
            stylePreset={(data.settings.marqueeStyle as 'baby-blue' | 'dark' | 'light') || 'dark'}
          />
        )}

        {/* Product Tiles */}
        <ProductTiles
          products={data.products}
          title="Shop Our Collection"
          subtitle="Clean, effective eye care made without the questionable ingredients."
        />

        {/* Mission Section */}
        <MissionSection />

        {/* Testimonials */}
        <TestimonialsSection
          testimonials={data.testimonials}
          title="What Our Customers Say"
          subtitle="Join thousands of happy customers who trust Archie's for their eye care needs."
        />

        {/* Video Testimonials */}
        <VideoTestimonials
          videos={data.videos}
          title="Real Stories, Real Results"
          subtitle="Hear from our community"
        />

        {/* Instagram Feed */}
        <InstagramFeed
          posts={data.instagramPosts}
          instagramUrl={data.settings?.instagramUrl}
        />
      </main>

      <Footer
        logo={data.settings?.logoUrl}
        instagramUrl={data.settings?.instagramUrl}
        facebookUrl={data.settings?.facebookUrl}
        tiktokUrl={data.settings?.tiktokUrl}
        amazonStoreUrl={data.settings?.amazonStoreUrl}
        massiveFooterLogoUrl={data.settings?.massiveFooterLogoUrl}
        instagramIconUrl={data.settings?.instagramIconUrl}
        facebookIconUrl={data.settings?.facebookIconUrl}
        tiktokIconUrl={data.settings?.tiktokIconUrl}
        amazonIconUrl={data.settings?.amazonIconUrl}
      />

      {/* Site Popups - Welcome, Exit, and Custom */}
      <SitePopups
        currentPage="/"
        settings={{
          // Welcome popup
          welcomePopupEnabled: data.settings?.welcomePopupEnabled ?? data.settings?.emailPopupEnabled ?? false,
          welcomePopupTitle: data.settings?.welcomePopupTitle ?? data.settings?.emailPopupTitle,
          welcomePopupSubtitle: data.settings?.welcomePopupSubtitle ?? data.settings?.emailPopupSubtitle,
          welcomePopupButtonText: data.settings?.welcomePopupButtonText ?? data.settings?.emailPopupButtonText,
          welcomePopupImageUrl: data.settings?.welcomePopupImageUrl ?? data.settings?.emailPopupImageUrl,
          welcomePopupVideoUrl: data.settings?.welcomePopupVideoUrl,
          welcomePopupDelay: data.settings?.welcomePopupDelay ?? 5000,
          welcomePopupDismissDays: data.settings?.welcomePopupDismissDays ?? 7,
          welcomePopupCtaType: data.settings?.welcomePopupCtaType ?? 'email',
          welcomePopupDownloadUrl: data.settings?.welcomePopupDownloadUrl,
          welcomePopupDownloadName: data.settings?.welcomePopupDownloadName,
          welcomePopupSuccessTitle: data.settings?.welcomePopupSuccessTitle,
          welcomePopupSuccessMessage: data.settings?.welcomePopupSuccessMessage,
          // Exit popup
          exitPopupEnabled: data.settings?.exitPopupEnabled ?? false,
          exitPopupTitle: data.settings?.exitPopupTitle,
          exitPopupSubtitle: data.settings?.exitPopupSubtitle,
          exitPopupButtonText: data.settings?.exitPopupButtonText,
          exitPopupImageUrl: data.settings?.exitPopupImageUrl,
          exitPopupVideoUrl: data.settings?.exitPopupVideoUrl,
          exitPopupDismissDays: data.settings?.exitPopupDismissDays ?? 7,
          exitPopupCtaType: data.settings?.exitPopupCtaType ?? 'email',
          exitPopupDownloadUrl: data.settings?.exitPopupDownloadUrl,
          exitPopupDownloadName: data.settings?.exitPopupDownloadName,
          exitPopupSuccessTitle: data.settings?.exitPopupSuccessTitle,
          exitPopupSuccessMessage: data.settings?.exitPopupSuccessMessage,
          exitPopupDelayAfterWelcome: data.settings?.exitPopupDelayAfterWelcome ?? 30,
        }}
      />
    </>
  );
}
