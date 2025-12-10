import { db } from '@/lib/db';
import {
  products,
  productVariants,
  productImages,
  productBenefits,
  siteSettings,
  reviews,
  reviewKeywords,
  productCertifications,
  videoTestimonials,
} from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PDPGallery } from '@/components/product/pdp-gallery';
import { PDPBuyBox } from '@/components/product/pdp-buy-box';
import { PDPReviews } from '@/components/product/pdp-reviews';
import { BenefitsWidget } from '@/components/product/benefits-widget';
import { MarqueeBar } from '@/components/widgets/marquee-bar';
import { CertificationTrio } from '@/components/widgets/certification-trio';
import { VideoTestimonialsGrid } from '@/components/widgets/video-testimonials-grid';
import { InstagramFeed } from '@/components/home/instagram-feed';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);

  if (!product) return null;

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

async function getSiteData() {
  const [settings] = await db.select().from(siteSettings).limit(1);
  const productList = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.sortOrder);

  const videos = await db
    .select()
    .from(videoTestimonials)
    .where(eq(videoTestimonials.isActive, true))
    .orderBy(videoTestimonials.sortOrder)
    .limit(4);

  return { settings, products: productList, videos };
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
  const [product, siteData] = await Promise.all([getProduct(slug), getSiteData()]);

  if (!product) {
    notFound();
  }

  const positiveBenefits = product.benefits.filter((b) => b.isPositive);
  const negativeBenefits = product.benefits.filter((b) => !b.isPositive);

  // Calculate average rating
  const validReviews = product.reviews.filter((r) => r.rating !== null);
  const averageRating =
    validReviews.length > 0
      ? validReviews.reduce((acc, r) => acc + (r.rating || 5), 0) / validReviews.length
      : 5;

  // Map certifications to the format expected by CertificationTrio
  const certificationData = product.certifications.map((c) => ({
    icon: c.icon as 'droplet' | 'eye' | 'flag' | 'leaf' | 'sparkle' | 'cross',
    title: c.title,
    description: c.description || undefined,
  }));

  // Map video testimonials
  const videoData = siteData.videos.map((v) => ({
    id: v.id,
    thumbnailUrl: v.thumbnailUrl,
    videoUrl: v.videoUrl,
    title: v.title || undefined,
    name: v.name || undefined,
  }));

  return (
    <>
      <Header
        logo={siteData.settings?.logoUrl}
        products={siteData.products}
        bumper={
          siteData.settings
            ? {
                bumperEnabled: siteData.settings.bumperEnabled,
                bumperText: siteData.settings.bumperText,
                bumperLinkUrl: siteData.settings.bumperLinkUrl,
                bumperLinkText: siteData.settings.bumperLinkText,
              }
            : null
        }
      />

      <main className="pt-6 md:pt-8">
        {/* Product Hero Section - Split Screen Layout (Buy Box Left, Gallery Right) */}
        <section className="container mb-12 md:mb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left: Buy Box (sticky) - shows first on mobile too */}
            <div className="order-1">
              <PDPBuyBox
                product={product}
                variants={product.variants}
                reviewCount={product.reviews.length}
                averageRating={averageRating}
              />
            </div>

            {/* Right: Gallery */}
            <div className="order-2">
              <PDPGallery
                images={product.images}
                heroImage={product.heroImageUrl}
                productName={product.name}
                badge={product.badge}
                badgeEmoji={product.badgeEmoji}
                rotatingSealEnabled={product.rotatingSealEnabled || false}
                rotatingSealImageUrl={product.rotatingSealImageUrl}
              />
            </div>
          </div>
        </section>

        {/* Marquee Bar */}
        <MarqueeBar
          text="Ophthalmologist Tested • Preservative Free • Clean Formula • Made in USA"
          speed="medium"
          backgroundColor="var(--primary)"
          textColor="var(--foreground)"
        />

        {/* Benefits Widget */}
        {(positiveBenefits.length > 0 || negativeBenefits.length > 0) && (
          <section className="py-16 md:py-20">
            <div className="container">
              <BenefitsWidget
                positiveBenefits={positiveBenefits}
                negativeBenefits={negativeBenefits}
              />
            </div>
          </section>
        )}

        {/* Certification Trio */}
        {certificationData.length > 0 && (
          <CertificationTrio certifications={certificationData} />
        )}

        {/* Video Testimonials */}
        {videoData.length > 0 && (
          <VideoTestimonialsGrid
            videos={videoData}
            title="Real Results"
            subtitle="Hear from our community"
          />
        )}

        {/* Reviews Section */}
        <PDPReviews
          reviews={product.reviews}
          keywords={product.keywords}
          productName={product.name}
        />

        {/* Instagram Feed */}
        <InstagramFeed
          posts={[]}
          instagramUrl={siteData.settings?.instagramUrl}
        />
      </main>

      <Footer
        logo={siteData.settings?.logoUrl}
        instagramUrl={siteData.settings?.instagramUrl}
        facebookUrl={siteData.settings?.facebookUrl}
        tiktokUrl={siteData.settings?.tiktokUrl}
        amazonStoreUrl={siteData.settings?.amazonStoreUrl}
      />
    </>
  );
}
