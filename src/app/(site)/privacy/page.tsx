import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { checkPageDraft } from '@/lib/draft-mode';
import { getHeaderProps, getFooterProps } from '@/lib/get-header-props';

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

async function getPage() {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, 'privacy'))
    .limit(1);

  return page;
}

export default async function PrivacyPage() {
  // Check if this page is draft - redirects if needed
  await checkPageDraft('privacy');

  const [headerProps, page] = await Promise.all([
    getHeaderProps(),
    getPage(),
  ]);

  return (
    <>
      <Header {...headerProps} />

      <main>
        {/* Hero */}
        <section className="pt-12 pb-8 bg-[var(--secondary)]">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-light mb-4">
                {page?.title || 'Privacy Policy'}
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="section">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              {page?.content ? (
                <div
                  className="prose prose-lg"
                  dangerouslySetInnerHTML={{ __html: page.content }}
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

      <Footer {...getFooterProps(headerProps.settings)} />
    </>
  );
}
