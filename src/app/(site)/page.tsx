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

// Widget type from pages.widgets JSON
interface PageWidget {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  isVisible: boolean;
  config?: Record<string, unknown>;
}

// Cached homepage data for better performance
const getCachedPageData = unstable_cache(
  async () => {
    const [settings] = await db.select().from(siteSettings).limit(1);

    // Get homepage page record with widgets
    const [homePage] = await db
      .select({ widgets: pages.widgets })
      .from(pages)
      .where(eq(pages.slug, 'home'))
      .limit(1);

    // Parse widgets JSON
    let pageWidgets: PageWidget[] = [];
    if (homePage?.widgets) {
      try {
        pageWidgets = JSON.parse(homePage.widgets);
      } catch {
        pageWidgets = [];
      }
    }

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
      pageWidgets,
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

  // Render widgets in order they appear in the widgets array
  // This allows drag-drop reordering to work
  const renderWidget = (widget: PageWidget) => {
    if (!widget.isVisible) return null;

    const config = widget.config || {};

    switch (widget.type) {
      case 'hero_carousel':
        return <HeroCarousel key={widget.id} slides={data.slides} />;

      case 'marquee':
        const marqueeText = (config.text as string) || '';
        if (!marqueeText) return null;
        return (
          <ScrollingTextBar
            key={widget.id}
            text={marqueeText}
            size={(config.size as 'small' | 'medium' | 'large' | 'xl' | 'xxl') || 'xl'}
            speed={(config.speed as 'slow' | 'normal' | 'fast') || 'slow'}
            stylePreset={(config.style as 'baby-blue' | 'dark' | 'light') || 'dark'}
          />
        );

      case 'product_grid':
        return (
          <ProductTiles
            key={widget.id}
            products={data.products}
            title={(config.title as string) || 'Shop Our Collection'}
            subtitle={(config.subtitle as string) || 'Clean, effective eye care made without the questionable ingredients.'}
          />
        );

      case 'mission':
        return <MissionSection key={widget.id} />;

      case 'testimonials':
        return (
          <TestimonialsSection
            key={widget.id}
            testimonials={data.testimonials}
            title={(config.title as string) || 'What Our Customers Say'}
            subtitle={(config.subtitle as string) || 'Join thousands of happy customers who trust Archie\'s for their eye care needs.'}
          />
        );

      case 'video_testimonials':
        return (
          <VideoTestimonials
            key={widget.id}
            videos={data.videos}
            title={(config.title as string) || 'Real Stories, Real Results'}
            subtitle={(config.subtitle as string) || 'Hear from our community'}
          />
        );

      case 'instagram':
        return (
          <InstagramFeed
            key={widget.id}
            posts={data.instagramPosts}
            instagramUrl={data.settings?.instagramUrl}
          />
        );

      default:
        return null;
    }
  };

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
        {/* Render widgets in the order they appear in the page config */}
        {data.pageWidgets.map(renderWidget)}
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
          // Welcome popup - basic
          welcomePopupEnabled: data.settings?.welcomePopupEnabled ?? data.settings?.emailPopupEnabled ?? false,
          welcomePopupTitle: data.settings?.welcomePopupTitle ?? data.settings?.emailPopupTitle,
          welcomePopupSubtitle: data.settings?.welcomePopupSubtitle ?? data.settings?.emailPopupSubtitle,
          welcomePopupButtonText: data.settings?.welcomePopupButtonText ?? data.settings?.emailPopupButtonText,
          welcomePopupImageUrl: data.settings?.welcomePopupImageUrl ?? data.settings?.emailPopupImageUrl,
          welcomePopupVideoUrl: data.settings?.welcomePopupVideoUrl,
          // Welcome popup - desktop/mobile form media
          welcomePopupFormDesktopImageUrl: data.settings?.welcomePopupFormDesktopImageUrl,
          welcomePopupFormDesktopVideoUrl: data.settings?.welcomePopupFormDesktopVideoUrl,
          welcomePopupFormMobileImageUrl: data.settings?.welcomePopupFormMobileImageUrl,
          welcomePopupFormMobileVideoUrl: data.settings?.welcomePopupFormMobileVideoUrl,
          // Welcome popup - desktop/mobile success media
          welcomePopupSuccessDesktopImageUrl: data.settings?.welcomePopupSuccessDesktopImageUrl,
          welcomePopupSuccessDesktopVideoUrl: data.settings?.welcomePopupSuccessDesktopVideoUrl,
          welcomePopupSuccessMobileImageUrl: data.settings?.welcomePopupSuccessMobileImageUrl,
          welcomePopupSuccessMobileVideoUrl: data.settings?.welcomePopupSuccessMobileVideoUrl,
          // Welcome popup - timing
          welcomePopupDelay: data.settings?.welcomePopupDelay ?? 3000,
          welcomePopupDismissDays: data.settings?.welcomePopupDismissDays ?? 7,
          welcomePopupSessionOnly: data.settings?.welcomePopupSessionOnly ?? true,
          welcomePopupSessionExpiryHours: data.settings?.welcomePopupSessionExpiryHours ?? 24,
          // Welcome popup - CTA
          welcomePopupCtaType: data.settings?.welcomePopupCtaType ?? 'email',
          welcomePopupDownloadUrl: data.settings?.welcomePopupDownloadUrl,
          welcomePopupDownloadName: data.settings?.welcomePopupDownloadName,
          welcomePopupDownloadText: data.settings?.welcomePopupDownloadText,
          welcomePopupSuccessTitle: data.settings?.welcomePopupSuccessTitle,
          welcomePopupSuccessMessage: data.settings?.welcomePopupSuccessMessage,
          // Welcome popup - testimonial
          welcomePopupTestimonialEnabled: data.settings?.welcomePopupTestimonialEnabled ?? false,
          welcomePopupTestimonialEnabledDesktop: data.settings?.welcomePopupTestimonialEnabledDesktop ?? true,
          welcomePopupTestimonialEnabledMobile: data.settings?.welcomePopupTestimonialEnabledMobile ?? true,
          welcomePopupTestimonialQuote: data.settings?.welcomePopupTestimonialQuote,
          welcomePopupTestimonialAuthor: data.settings?.welcomePopupTestimonialAuthor,
          welcomePopupTestimonialAvatarUrl: data.settings?.welcomePopupTestimonialAvatarUrl,
          welcomePopupTestimonialStars: data.settings?.welcomePopupTestimonialStars ?? 5,
          // Welcome popup - success links
          welcomePopupSuccessLink1Text: data.settings?.welcomePopupSuccessLink1Text,
          welcomePopupSuccessLink1Url: data.settings?.welcomePopupSuccessLink1Url,
          welcomePopupSuccessLink2Text: data.settings?.welcomePopupSuccessLink2Text,
          welcomePopupSuccessLink2Url: data.settings?.welcomePopupSuccessLink2Url,
          // Welcome popup - rotating badges
          welcomePopupFormBadgeUrl: data.settings?.welcomePopupFormBadgeUrl,
          welcomePopupSuccessBadgeUrl: data.settings?.welcomePopupSuccessBadgeUrl,

          // Exit popup - basic
          exitPopupEnabled: data.settings?.exitPopupEnabled ?? false,
          exitPopupTitle: data.settings?.exitPopupTitle,
          exitPopupSubtitle: data.settings?.exitPopupSubtitle,
          exitPopupButtonText: data.settings?.exitPopupButtonText,
          exitPopupImageUrl: data.settings?.exitPopupImageUrl,
          exitPopupVideoUrl: data.settings?.exitPopupVideoUrl,
          // Exit popup - desktop/mobile form media
          exitPopupFormDesktopImageUrl: data.settings?.exitPopupFormDesktopImageUrl,
          exitPopupFormDesktopVideoUrl: data.settings?.exitPopupFormDesktopVideoUrl,
          exitPopupFormMobileImageUrl: data.settings?.exitPopupFormMobileImageUrl,
          exitPopupFormMobileVideoUrl: data.settings?.exitPopupFormMobileVideoUrl,
          // Exit popup - desktop/mobile success media
          exitPopupSuccessDesktopImageUrl: data.settings?.exitPopupSuccessDesktopImageUrl,
          exitPopupSuccessDesktopVideoUrl: data.settings?.exitPopupSuccessDesktopVideoUrl,
          exitPopupSuccessMobileImageUrl: data.settings?.exitPopupSuccessMobileImageUrl,
          exitPopupSuccessMobileVideoUrl: data.settings?.exitPopupSuccessMobileVideoUrl,
          // Exit popup - timing
          exitPopupDismissDays: data.settings?.exitPopupDismissDays ?? 7,
          exitPopupDelayAfterWelcome: data.settings?.exitPopupDelayAfterWelcome ?? 30,
          // Exit popup - CTA
          exitPopupCtaType: data.settings?.exitPopupCtaType ?? 'email',
          exitPopupDownloadUrl: data.settings?.exitPopupDownloadUrl,
          exitPopupDownloadName: data.settings?.exitPopupDownloadName,
          exitPopupDownloadText: data.settings?.exitPopupDownloadText,
          exitPopupSuccessTitle: data.settings?.exitPopupSuccessTitle,
          exitPopupSuccessMessage: data.settings?.exitPopupSuccessMessage,
          // Exit popup - testimonial
          exitPopupTestimonialEnabled: data.settings?.exitPopupTestimonialEnabled ?? false,
          exitPopupTestimonialEnabledDesktop: data.settings?.exitPopupTestimonialEnabledDesktop ?? true,
          exitPopupTestimonialEnabledMobile: data.settings?.exitPopupTestimonialEnabledMobile ?? true,
          exitPopupTestimonialQuote: data.settings?.exitPopupTestimonialQuote,
          exitPopupTestimonialAuthor: data.settings?.exitPopupTestimonialAuthor,
          exitPopupTestimonialAvatarUrl: data.settings?.exitPopupTestimonialAvatarUrl,
          exitPopupTestimonialStars: data.settings?.exitPopupTestimonialStars ?? 5,
          // Exit popup - success links
          exitPopupSuccessLink1Text: data.settings?.exitPopupSuccessLink1Text,
          exitPopupSuccessLink1Url: data.settings?.exitPopupSuccessLink1Url,
          exitPopupSuccessLink2Text: data.settings?.exitPopupSuccessLink2Text,
          exitPopupSuccessLink2Url: data.settings?.exitPopupSuccessLink2Url,
          // Exit popup - rotating badges
          exitPopupFormBadgeUrl: data.settings?.exitPopupFormBadgeUrl,
          exitPopupSuccessBadgeUrl: data.settings?.exitPopupSuccessBadgeUrl,
        }}
      />
    </>
  );
}
