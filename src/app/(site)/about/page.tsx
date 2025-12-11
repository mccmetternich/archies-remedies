import { db } from '@/lib/db';
import { pages, testimonials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { checkPageDraft } from '@/lib/draft-mode';
import { AboutHero } from '@/components/about/about-hero';
import { AboutStory } from '@/components/about/about-story';
import { AboutValues } from '@/components/about/about-values';
import { AboutTeam } from '@/components/about/about-team';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { getHeaderProps, getFooterProps } from '@/lib/get-header-props';

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

async function getTestimonials() {
  const reviewsList = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.isActive, true))
    .orderBy(testimonials.sortOrder)
    .limit(6);

  return reviewsList;
}

export default async function AboutPage() {
  // Check if this page is draft - redirects if needed
  await checkPageDraft('about');

  const [headerProps, testimonialsList] = await Promise.all([
    getHeaderProps(),
    getTestimonials(),
  ]);

  return (
    <>
      <Header {...headerProps} />

      <main>
        <AboutHero />
        <AboutStory />
        <AboutValues />
        <AboutTeam />

        {/* Testimonials */}
        {testimonialsList.length > 0 && (
          <TestimonialsSection
            testimonials={testimonialsList}
            title="What Our Customers Say"
            subtitle="Join thousands who have made the switch to clean eye care."
          />
        )}

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-[var(--primary)]">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6">
                Ready to Experience the Difference?
              </h2>
              <p className="text-lg text-[var(--foreground)]/80 mb-10 max-w-xl mx-auto">
                Join thousands of happy customers who&apos;ve made the switch to clean, effective eye care.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/products/eye-drops"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--foreground)] text-white rounded-full font-medium hover:bg-[var(--foreground)]/90 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  Shop Eye Drops
                </Link>
                <Link
                  href="/products/eye-wipes"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[var(--foreground)] rounded-full font-medium hover:bg-white/90 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  Shop Eye Wipes
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer {...getFooterProps(headerProps.settings)} />
    </>
  );
}
