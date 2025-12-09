import { db } from '@/lib/db';
import { products, siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ContactForm } from '@/components/contact/contact-form';

export const metadata: Metadata = {
  title: "Contact Us | Archie's Remedies",
  description: "Get in touch with Archie's Remedies. We're here to help with any questions about our products.",
};

async function getPageData() {
  const [settings] = await db.select().from(siteSettings).limit(1);
  const productList = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.sortOrder);

  return { settings, products: productList };
}

export default async function ContactPage() {
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
              <h1 className="text-4xl md:text-5xl font-light mb-6">
                Contact Us
              </h1>
              <p className="text-lg text-[var(--muted-foreground)]">
                Have a question or need help? We&apos;d love to hear from you.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="section">
          <div className="container">
            <div className="max-w-xl mx-auto">
              <ContactForm />
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="pb-16">
          <div className="container">
            <div className="max-w-xl mx-auto">
              <div className="bg-[var(--muted)] rounded-2xl p-8 text-center">
                <h3 className="text-xl font-medium mb-4">Quick Help</h3>
                <p className="text-[var(--muted-foreground)] mb-6">
                  For the fastest response to common questions, check out our FAQ page.
                </p>
                <a
                  href="/faq"
                  className="inline-flex items-center gap-2 text-[var(--foreground)] font-medium hover:text-[var(--primary-dark)] transition-colors"
                >
                  Visit FAQ →
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
