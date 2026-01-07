/**
 * Homepage
 *
 * Renders the homepage from the 'home' page record in the database.
 * Uses WidgetRenderer to render widgets from pages.widgets JSON.
 */

import { db } from '@/lib/db';
import { pages, siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { checkPageDraft } from '@/lib/draft-mode';
import { SitePopups } from '@/components/popups';
import { getHeaderProps, getFooterProps } from '@/lib/get-header-props';
import { getPopupSettings } from '@/lib/get-popup-settings';
import { getWidgetData } from '@/lib/get-widget-data';
import { WidgetRenderer, type PageWidget } from '@/components/widgets/widget-renderer';
import { unstable_cache } from 'next/cache';

export const revalidate = 60;

// Cached homepage data for better performance
const getCachedPageData = unstable_cache(
  async () => {
    const [settings] = await db.select().from(siteSettings).limit(1);

    // Get homepage page record with widgets
    const [homePage] = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, 'home'))
      .limit(1);

    // Parse widgets JSON
    let pageWidgets: PageWidget[] = [];
    if (homePage?.widgets) {
      try {
        pageWidgets = JSON.parse(homePage.widgets);
      } catch {
        pageWidgets = [];
      }
    }

    return {
      settings,
      pageWidgets,
    };
  },
  ['homepage-data'],
  { revalidate: 60, tags: ['homepage-data'] }
);

export default async function HomePage() {
  // Check if homepage is draft - redirects to coming-soon if needed
  await checkPageDraft('home');

  // Get page data and header props in parallel
  const [{ settings, pageWidgets }, headerProps] = await Promise.all([
    getCachedPageData(),
    getHeaderProps(),
  ]);

  // Get visible widget types
  const visibleWidgetTypes = pageWidgets
    .filter((w) => w.isVisible)
    .map((w) => w.type);

  console.log('[HomePage] Page widgets count:', pageWidgets.length);
  console.log('[HomePage] Visible widget types:', visibleWidgetTypes);

  // Fetch widget data based on which widget types are present
  const widgetData = await getWidgetData(visibleWidgetTypes);

  console.log('[HomePage] Widget data keys:', Object.keys(widgetData));
  console.log('[HomePage] Hero slides in data:', widgetData.heroSlides?.length ?? 'undefined');

  // Add instagramUrl from settings
  const widgetDataWithSettings = {
    ...widgetData,
    instagramUrl: settings?.instagramUrl,
  };

  return (
    <>
      <Header {...headerProps} />

      <main className="relative">
        <WidgetRenderer widgets={pageWidgets} data={widgetDataWithSettings} />
      </main>

      <Footer {...await getFooterProps(headerProps.settings)} />

      {/* Site Popups - Welcome, Exit, and Custom */}
      <SitePopups
        currentPage="/"
        settings={getPopupSettings(settings)}
      />
    </>
  );
}
