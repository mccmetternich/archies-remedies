import { db } from '@/lib/db';
import { pages, products, siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, 'privacy'))
    .limit(1);

  return {
    title: page?.metaTitle || "Privacy Policy | Archie's Remedies",
    description: page?.metaDescription || "Read our privacy policy.",
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
    .where(eq(pages.slug, 'privacy'))
    .limit(1);

  return { settings, products: productList, page };
}

export default async function PrivacyPage() {
  const data = await getPageData();

  return (
    <>
      <Header
        logo={data.settings?.logoUrl}
        products={data.products}
      />

      <main>
        {/* Hero */}
        <section className="pt-12 pb-8 bg-[var(--secondary)]">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-light mb-4">
                {data.page?.title || 'Privacy Policy'}
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="section">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              {data.page?.content ? (
                <div
                  className="prose prose-lg"
                  dangerouslySetInnerHTML={{ __html: data.page.content }}
                />
              ) : (
                <p className="text-[var(--muted-foreground)]">
                  Privacy policy content coming soon.
                </p>
              )}
            </div>
          </div>
        </section>
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
