import { db } from '@/lib/db';
import { products, siteSettings, pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ContactForm } from '@/components/contact/contact-form';
import { checkPageDraft } from '@/lib/draft-mode';

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

  return { settings, products: productList, navPages };
}

export default async function ContactPage() {
  // Check if this page is draft - redirects if needed
  await checkPageDraft('contact');

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
          tile1ImageUrl: data.settings.navDropdownTile1ImageUrl,
          tile1HoverImageUrl: data.settings.navDropdownTile1HoverImageUrl,
          tile2ProductId: data.settings.navDropdownTile2ProductId,
          tile2Title: data.settings.navDropdownTile2Title,
          tile2Subtitle: data.settings.navDropdownTile2Subtitle,
          tile2Badge: data.settings.navDropdownTile2Badge,
          tile2BadgeEmoji: data.settings.navDropdownTile2BadgeEmoji,
          tile2ImageUrl: data.settings.navDropdownTile2ImageUrl,
          tile2HoverImageUrl: data.settings.navDropdownTile2HoverImageUrl,
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
        massiveFooterLogoUrl={data.settings?.massiveFooterLogoUrl}
        instagramIconUrl={data.settings?.instagramIconUrl}
        facebookIconUrl={data.settings?.facebookIconUrl}
        tiktokIconUrl={data.settings?.tiktokIconUrl}
        amazonIconUrl={data.settings?.amazonIconUrl}
      />
    </>
  );
}
