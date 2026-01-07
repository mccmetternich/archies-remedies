/**
 * 404 Not Found Page
 *
 * Renders a custom 404 page that can be edited via admin.
 * If a page with slug '404' exists in the database, renders its widgets.
 * Otherwise shows a default attractive 404 message.
 */

import { db } from '@/lib/db';
import { pages, siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowRight, Home } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getHeaderProps, getFooterProps } from '@/lib/get-header-props';
import { getWidgetData } from '@/lib/get-widget-data';
import { WidgetRenderer, type PageWidget } from '@/components/widgets/widget-renderer';

export default async function NotFound() {
  // Get header props and 404 page data in parallel
  const [headerProps, notFoundPage, [settings]] = await Promise.all([
    getHeaderProps(),
    db.select().from(pages).where(eq(pages.slug, '404')).limit(1).then(r => r[0]),
    db.select().from(siteSettings).limit(1),
  ]);

  // Parse widgets if page exists
  let widgets: PageWidget[] = [];
  if (notFoundPage?.widgets) {
    try {
      widgets = JSON.parse(notFoundPage.widgets);
    } catch {
      widgets = [];
    }
  }

  // Get visible widget types
  const visibleWidgetTypes = widgets.filter((w) => w.isVisible).map((w) => w.type);

  // Fetch widget data if needed
  const widgetData = visibleWidgetTypes.length > 0
    ? await getWidgetData(visibleWidgetTypes)
    : {};

  const widgetDataWithSettings = {
    ...widgetData,
    instagramUrl: settings?.instagramUrl,
    settings,
  };

  const hasCustomContent = widgets.length > 0;

  return (
    <>
      <Header {...headerProps} />

      <main className="relative">
        {/* Custom widgets from admin if configured */}
        {hasCustomContent ? (
          <WidgetRenderer
            widgets={widgets}
            data={widgetDataWithSettings}
            isWidgetOnlyPage={true}
          />
        ) : (
          /* Default 404 content */
          <section className="min-h-[60vh] flex items-center justify-center px-6 pt-32 pb-24">
            <div className="max-w-2xl mx-auto text-center">
              {/* Large 404 number */}
              <div className="mb-8">
                <span className="text-[120px] md:text-[180px] font-light leading-none text-[var(--primary)] tracking-tight">
                  404
                </span>
              </div>

              {/* Friendly message */}
              <h1 className="text-3xl md:text-4xl font-semibold text-[var(--foreground)] mb-4">
                Page Not Found
              </h1>
              <p className="text-lg md:text-xl text-[var(--muted-foreground)] mb-10 max-w-md mx-auto leading-relaxed">
                Oops! The page you're looking for seems to have wandered off.
                Let's get you back on track.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {/* Primary button - same style as PDP */}
                <Link
                  href="/"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--foreground)] text-white text-sm font-semibold uppercase tracking-[0.1em] hover:bg-[var(--primary)] hover:text-[var(--foreground)] transition-all duration-300"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Secondary button */}
                <Link
                  href="/products/eye-drops"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-[var(--foreground)] text-[var(--foreground)] text-sm font-semibold uppercase tracking-[0.1em] hover:bg-[var(--foreground)] hover:text-white transition-all duration-300"
                >
                  Shop Eye Drops
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* If using custom content but no widgets visible, show minimal default */}
        {hasCustomContent && visibleWidgetTypes.length === 0 && (
          <section className="min-h-[40vh] flex items-center justify-center px-6 py-24">
            <div className="text-center">
              <h1 className="text-4xl font-semibold text-[var(--foreground)] mb-4">
                Page Not Found
              </h1>
              <Link
                href="/"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--foreground)] text-white text-sm font-semibold uppercase tracking-[0.1em] hover:bg-[var(--primary)] hover:text-[var(--foreground)] transition-all duration-300 mt-6"
              >
                Back to Home
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer {...await getFooterProps(headerProps.settings)} />
    </>
  );
}
