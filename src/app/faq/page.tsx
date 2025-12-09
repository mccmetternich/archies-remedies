import { db } from '@/lib/db';
import { faqs, products, siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FAQAccordion } from '@/components/faq/faq-accordion';

export const metadata: Metadata = {
  title: "FAQ | Archie's Remedies",
  description: "Frequently asked questions about Archie's Remedies eye drops and eye care products.",
};

export const revalidate = 60;

async function getPageData() {
  const [settings] = await db.select().from(siteSettings).limit(1);
  const productList = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.sortOrder);

  const faqList = await db
    .select()
    .from(faqs)
    .where(eq(faqs.isActive, true))
    .orderBy(faqs.sortOrder);

  return { settings, products: productList, faqs: faqList };
}

export default async function FAQPage() {
  const data = await getPageData();

  // Group FAQs by category
  const categories = data.faqs.reduce((acc, faq) => {
    const category = faq.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, typeof data.faqs>);

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
        } : null}
      />

      <main>
        {/* Hero */}
        <section className="pt-12 pb-8 bg-[var(--secondary)]">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-light mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-[var(--muted-foreground)]">
                Everything you need to know about our products and how to use them.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="section">
          <div className="container">
            <div className="max-w-3xl mx-auto space-y-12">
              {Object.entries(categories).map(([category, faqItems]) => (
                <div key={category}>
                  <h2 className="text-2xl font-medium mb-6">{category}</h2>
                  <FAQAccordion faqs={faqItems} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Still have questions */}
        <section className="pb-16">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="bg-[var(--primary-light)] rounded-2xl p-8 text-center">
                <h3 className="text-xl font-medium mb-4">Still have questions?</h3>
                <p className="text-[var(--muted-foreground)] mb-6">
                  Can&apos;t find the answer you&apos;re looking for? Our team is here to help.
                </p>
                <a
                  href="/contact"
                  className="btn btn-primary inline-flex"
                >
                  Contact Us
                </a>
              </div>
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
