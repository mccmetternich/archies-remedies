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
import { EmailPopup } from '@/components/home/email-popup';
import { ScrollingTextBar } from '@/components/ui/scrolling-text-bar';

export const revalidate = 60; // Revalidate every minute

async function getPageData() {
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
          tile2ProductId: data.settings.navDropdownTile2ProductId,
          tile2Title: data.settings.navDropdownTile2Title,
          tile2Subtitle: data.settings.navDropdownTile2Subtitle,
          tile2Badge: data.settings.navDropdownTile2Badge,
          tile2BadgeEmoji: data.settings.navDropdownTile2BadgeEmoji,
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

        {/* Scrolling Text Bar - XL Dark Style */}
        <ScrollingTextBar
          text="Preservative-Free ✦ Clean Ingredients ✦ Doctor Trusted ✦ Instant Relief ✦ Gentle Formula ✦ Made with Love"
          size="xl"
          speed="slow"
          stylePreset="dark"
        />

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
      />

      {/* Email Popup */}
      <EmailPopup
        enabled={data.settings?.emailPopupEnabled ?? true}
        title={data.settings?.emailPopupTitle ?? undefined}
        subtitle={data.settings?.emailPopupSubtitle ?? undefined}
        buttonText={data.settings?.emailPopupButtonText ?? undefined}
        imageUrl={data.settings?.emailPopupImageUrl}
        delay={5000}
      />
    </>
  );
}
