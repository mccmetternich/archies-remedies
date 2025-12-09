import { db } from '@/lib/db';
import { products, productVariants, productImages, productBenefits, testimonials, siteSettings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductHero } from '@/components/product/product-hero';
import { ProductInfo } from '@/components/product/product-info';
import { BenefitsWidget } from '@/components/product/benefits-widget';
import { ProductReviews } from '@/components/product/product-reviews';
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

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, product.id))
    .orderBy(productVariants.sortOrder);

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(productImages.sortOrder);

  const benefits = await db
    .select()
    .from(productBenefits)
    .where(eq(productBenefits.productId, product.id))
    .orderBy(productBenefits.sortOrder);

  const productTestimonials = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.isActive, true))
    .orderBy(testimonials.sortOrder)
    .limit(6);

  return {
    ...product,
    variants,
    images,
    benefits,
    testimonials: productTestimonials,
  };
}

async function getSiteData() {
  const [settings] = await db.select().from(siteSettings).limit(1);
  const productList = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.sortOrder);

  return { settings, products: productList };
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
  const [product, siteData] = await Promise.all([
    getProduct(slug),
    getSiteData(),
  ]);

  if (!product) {
    notFound();
  }

  const positiveBenefits = product.benefits.filter((b) => b.isPositive);
  const negativeBenefits = product.benefits.filter((b) => !b.isPositive);

  return (
    <>
      <Header
        logo={siteData.settings?.logoUrl}
        products={siteData.products}
        bumper={siteData.settings ? {
          bumperEnabled: siteData.settings.bumperEnabled,
          bumperText: siteData.settings.bumperText,
          bumperLinkUrl: siteData.settings.bumperLinkUrl,
          bumperLinkText: siteData.settings.bumperLinkText,
        } : null}
      />

      <main className="pt-4">
        {/* Product Hero Section */}
        <section className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Images */}
            <ProductHero
              images={product.images}
              heroImage={product.heroImageUrl}
              productName={product.name}
              badge={product.badge}
              badgeEmoji={product.badgeEmoji}
            />

            {/* Right: Info */}
            <ProductInfo
              product={product}
              variants={product.variants}
            />
          </div>
        </section>

        {/* Benefits Widget */}
        {(positiveBenefits.length > 0 || negativeBenefits.length > 0) && (
          <section className="section">
            <div className="container">
              <BenefitsWidget
                positiveBenefits={positiveBenefits}
                negativeBenefits={negativeBenefits}
              />
            </div>
          </section>
        )}

        {/* Product Description */}
        {product.longDescription && (
          <section className="section bg-[var(--secondary)]">
            <div className="container">
              <div className="max-w-3xl mx-auto">
                <div
                  className="prose prose-lg"
                  dangerouslySetInnerHTML={{ __html: product.longDescription }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <ProductReviews testimonials={product.testimonials} />

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
