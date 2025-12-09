import { db } from '@/lib/db';
import { pages, products, siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MissionSection } from '@/components/home/mission-section';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, 'about'))
    .limit(1);

  return {
    title: page?.metaTitle || "About Us | Archie's Remedies",
    description: page?.metaDescription || "Learn about Archie's Remedies and our commitment to safe, clean eye care.",
  };
}

async function getPageData() {
  const [settings] = await db.select().from(siteSettings).limit(1);
  const productList = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.sortOrder);

  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, 'about'))
    .limit(1);

  return { settings, products: productList, page };
}

export default async function AboutPage() {
  const data = await getPageData();

  return (
    <>
      <Header
        logo={data.settings?.logoUrl}
        products={data.products}
      />

      <main>
        {/* Hero */}
        <section className="pt-12 pb-16 bg-[var(--secondary)]">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-light mb-6">
                {data.page?.title || 'About Us'}
              </h1>
              <p className="text-lg text-[var(--muted-foreground)]">
                Eye care you can trust, made without compromises.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        {data.page?.content && (
          <section className="section">
            <div className="container">
              <div
                className="prose prose-lg max-w-3xl mx-auto"
                dangerouslySetInnerHTML={{ __html: data.page.content }}
              />
            </div>
          </section>
        )}

        {/* Mission Section */}
        <MissionSection />
      </main>

      <Footer
        logo={data.settings?.logoUrl}
        instagramUrl={data.settings?.instagramUrl}
        facebookUrl={data.settings?.facebookUrl}
        tiktokUrl={data.settings?.tiktokUrl}
        amazonStoreUrl={data.settings?.amazonStoreUrl}
      />
    </>
  );
}
