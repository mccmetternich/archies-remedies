import { db } from '@/lib/db';
import {
  products,
  productVariants,
  productImages,
  productBenefits,
  reviews,
  reviewKeywords,
  productCertifications,
} from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { checkProductDraft, hasPreviewAccess } from '@/lib/draft-mode';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SitePopups } from '@/components/popups';
import { PDPHeroSection } from '@/components/product/pdp-hero-section';
import { getHeaderProps, getFooterProps } from '@/lib/get-header-props';
import { getPopupSettings } from '@/lib/get-popup-settings';
import { getWidgetData } from '@/lib/get-widget-data';
import { WidgetRenderer, type PageWidget } from '@/components/widgets/widget-renderer';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string, includeInactive: boolean = false) {
  // If includeInactive (preview mode), get regardless of status
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) return null;

  // If not in preview mode and product is inactive, return null
  if (!includeInactive && !product.isActive) return null;

  const [variants, images, benefits, productReviews, keywords, certifications] =
    await Promise.all([
      db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, product.id))
        .orderBy(productVariants.sortOrder),
      db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(productImages.sortOrder),
      db
        .select()
        .from(productBenefits)
        .where(eq(productBenefits.productId, product.id))
        .orderBy(productBenefits.sortOrder),
      db
        .select()
        .from(reviews)
        .where(and(eq(reviews.productId, product.id), eq(reviews.isActive, true)))
        .orderBy(desc(reviews.isFeatured), reviews.sortOrder),
      db
        .select()
        .from(reviewKeywords)
        .where(eq(reviewKeywords.productId, product.id))
        .orderBy(reviewKeywords.sortOrder),
      db
        .select()
        .from(productCertifications)
        .where(eq(productCertifications.productId, product.id))
        .orderBy(productCertifications.sortOrder),
    ]);

  return {
    ...product,
    variants,
    images,
    benefits,
    reviews: productReviews,
    keywords,
    certifications,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.metaTitle || `${product.name} | Archie's Remedies`,
    description: product.metaDescription || product.shortDescription || undefined,
    openGraph: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.shortDescription || undefined,
      images: product.heroImageUrl ? [product.heroImageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  // Check if product is draft and user doesn't have preview access
  // This will redirect if needed
  await checkProductDraft(slug);

  // Check if user has preview access to show draft products
  const previewAccess = await hasPreviewAccess();

  const [productData, headerProps] = await Promise.all([
    getProduct(slug, previewAccess),
    getHeaderProps(),
  ]);

  if (!productData) {
    notFound();
  }

  const product = productData;

  // Parse below-fold widgets from product's widgets field
  let belowFoldWidgets: PageWidget[] = [];
  if (product.widgets) {
    try {
      belowFoldWidgets = JSON.parse(product.widgets);
    } catch {
      belowFoldWidgets = [];
    }
  }

  // Get visible widget types
  const visibleWidgetTypes = belowFoldWidgets
    .filter((w) => w.isVisible)
    .map((w) => w.type);

  // Fetch widget data for below-fold widgets
  const widgetData = await getWidgetData(visibleWidgetTypes);

  // Add instagramUrl from settings
  const widgetDataWithSettings = {
    ...widgetData,
    instagramUrl: headerProps.settings?.instagramUrl,
  };

  // Calculate average rating - use product.rating if set, otherwise calculate from reviews
  const validReviews = product.reviews.filter((r) => r.rating !== null);
  const averageRating =
    product.rating ??
    (validReviews.length > 0
      ? validReviews.reduce((acc, r) => acc + (r.rating || 5), 0) / validReviews.length
      : 4.9);

  // Use product.reviewCount if set, otherwise use actual reviews length
  const reviewCount = product.reviewCount ?? product.reviews.length;

  // Collect bullet points
  const bulletPoints = [
    product.bulletPoint1,
    product.bulletPoint2,
    product.bulletPoint3,
    product.bulletPoint4,
    product.bulletPoint5,
  ];

  return (
    <>
      <Header {...headerProps} />

      <main className="pt-0">
        {/* Product Hero Section - Split Screen Layout (Buy Box Left, Gallery Right) */}
        {/* No container class - hero section handles its own padding to allow flush-right thumbnails */}
        <section className="mb-8 lg:mb-16">
          <PDPHeroSection
            product={product}
            variants={product.variants}
            images={product.images}
            reviewCount={reviewCount}
            averageRating={averageRating}
            bulletPoints={bulletPoints}
            ctaButtonText={product.ctaButtonText || undefined}
            ctaExternalUrl={product.ctaExternalUrl}
            showDiscountSignup={product.showDiscountSignup ?? true}
            discountSignupText={product.discountSignupText || undefined}
            reviewBadge={product.reviewBadge}
            reviewBadgeEmoji={product.reviewBadgeEmoji}
            reviewBadgeBgColor={product.reviewBadgeBgColor}
            reviewBadgeTextColor={product.reviewBadgeTextColor}
            audioUrl={product.audioUrl}
            audioAvatarUrl={product.audioAvatarUrl}
            audioTitle={product.audioTitle}
            audioQuote={product.audioQuote}
            marqueeEnabled={product.marqueeEnabled ?? false}
            marqueeText={product.marqueeText}
            marqueeBackgroundColor={product.marqueeBackgroundColor}
            marqueeTextColor={product.marqueeTextColor}
            signupSectionEnabled={product.signupSectionEnabled ?? true}
            signupSectionTitle={product.signupSectionTitle}
            signupSectionSubtitle={product.signupSectionSubtitle}
            signupSectionButtonText={product.signupSectionButtonText}
            signupSectionSuccessMessage={product.signupSectionSuccessMessage}
            stickyDrawerThumbnailUrl={product.stickyDrawerThumbnailUrl}
          />
        </section>

        {/* Below-Fold Widgets from CMS */}
        <WidgetRenderer widgets={belowFoldWidgets} data={widgetDataWithSettings} />
      </main>

      <Footer {...await getFooterProps(headerProps.settings)} />

      {/* Site Popups */}
      <SitePopups
        currentPage={`/products/${slug}`}
        settings={getPopupSettings(headerProps.settings)}
      />
    </>
  );
}
