/**
 * Dynamic Page Route
 *
 * Catches all page slugs and renders them dynamically from the pages table.
 * Uses WidgetRenderer to render widgets from pages.widgets JSON.
 */

import { db } from '@/lib/db';
import { pages, siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SitePopups } from '@/components/popups';
import { checkPageDraft } from '@/lib/draft-mode';
import { getHeaderProps, getFooterProps } from '@/lib/get-header-props';
import { getPopupSettings } from '@/lib/get-popup-settings';
import { getWidgetData } from '@/lib/get-widget-data';
import { WidgetRenderer, type PageWidget } from '@/components/widgets/widget-renderer';
import { unstable_cache } from 'next/cache';

export const revalidate = 60;

// Get page by slug path
async function getPage(slugPath: string) {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slugPath))
    .limit(1);

  return page;
}

// Cached page data
const getCachedPageData = unstable_cache(
  async (slugPath: string) => {
    const [page, [settings]] = await Promise.all([
      getPage(slugPath),
      db.select().from(siteSettings).limit(1),
    ]);

    return { page, settings };
  },
  ['dynamic-page-data'],
  { revalidate: 60, tags: ['dynamic-page-data'] }
);

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join('/');
  const page = await getPage(slugPath);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.metaTitle || page.title || "Archie's Remedies",
    description: page.metaDescription || undefined,
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugPath = slug.join('/');

  // Check if page is draft - redirects if needed
  await checkPageDraft(slugPath);

  // Get page data and header props in parallel
  const [{ page, settings }, headerProps] = await Promise.all([
    getCachedPageData(slugPath),
    getHeaderProps(),
  ]);

  // 404 if page doesn't exist
  if (!page) {
    notFound();
  }

  // Parse widgets JSON
  let widgets: PageWidget[] = [];
  if (page.widgets) {
    try {
      widgets = JSON.parse(page.widgets);
    } catch {
      widgets = [];
    }
  }

  // Get visible widget types
  const visibleWidgetTypes = widgets
    .filter((w) => w.isVisible)
    .map((w) => w.type);

  // Fetch widget data based on which widget types are present
  const widgetData = await getWidgetData(visibleWidgetTypes);

  // Add instagramUrl from settings
  const widgetDataWithSettings = {
    ...widgetData,
    instagramUrl: settings?.instagramUrl,
  };

  return (
    <>
      <Header {...headerProps} />

      <main>
        <WidgetRenderer widgets={widgets} data={widgetDataWithSettings} />
      </main>

      <Footer {...await getFooterProps(headerProps.settings)} />

      {/* Site Popups */}
      <SitePopups
        currentPage={`/${slugPath}`}
        settings={getPopupSettings(settings)}
      />
    </>
  );
}
