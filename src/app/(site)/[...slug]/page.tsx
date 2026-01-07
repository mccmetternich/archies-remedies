/**
 * Dynamic Page Route
 *
 * Catches all page slugs and renders them dynamically from the pages table.
 * Supports:
 * - Hero section (heroImageUrl, heroTitle, heroSubtitle)
 * - Rich text content (content field)
 * - Widget system (widgets JSON array)
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
import { isVideoUrl } from '@/lib/media-utils';

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
    settings: settings,
  };

  // Check if page has hero content
  const hasHero = page.heroImageUrl || page.heroTitle;
  const heroIsVideo = page.heroImageUrl && isVideoUrl(page.heroImageUrl);

  // Check if page has display header (pageTitle/pageSubtitle - shown above widgets)
  const hasPageHeader = page.pageTitle && page.pageTitle.trim().length > 0;

  // Check if page has rich text content
  const hasContent = page.content && page.content.trim().length > 0;

  // Check if content is HTML or plain text
  const contentIsHtml = hasContent && page.content!.includes('<') && page.content!.includes('>');

  return (
    <>
      <Header {...headerProps} />

      <main className="min-h-screen">
        {/* Page Hero Section */}
        {hasHero && (
          <section className="relative min-h-[50vh] lg:min-h-[60vh] flex items-center justify-center overflow-hidden">
            {/* Background Media */}
            {page.heroImageUrl && (
              <div className="absolute inset-0">
                {heroIsVideo ? (
                  <video
                    src={page.heroImageUrl}
                    className="w-full h-full object-cover"
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={page.heroImageUrl}
                    alt={page.heroTitle || page.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
              </div>
            )}

            {/* Hero Content */}
            <div className="relative z-10 text-center px-6 py-16 max-w-4xl mx-auto">
              {page.heroTitle && (
                <h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
                 
                >
                  {page.heroTitle}
                </h1>
              )}
              {page.heroSubtitle && (
                <p
                  className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
                 
                >
                  {page.heroSubtitle}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Page Display Header - optional title/subtitle that appears above widgets */}
        {/* This is shown when pageTitle is set, regardless of widgets */}
        {!hasHero && hasPageHeader && (
          <section className={`px-6 ${hasContent || widgets.length > 0 ? 'pt-32 pb-16 md:pb-20' : 'pt-32 pb-12'}`}>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] leading-tight">
                {page.pageTitle}
              </h1>
              {page.pageSubtitle && (
                <p className="mt-4 text-lg md:text-xl text-[#666] max-w-2xl mx-auto">
                  {page.pageSubtitle}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Fallback Page Title (if no hero, no pageTitle, no widgets, but has internal title) */}
        {!hasHero && !hasPageHeader && page.title && widgets.length === 0 && !hasContent && (
          <section className="pt-32 pb-12 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] leading-tight">
                {page.title}
              </h1>
            </div>
          </section>
        )}

        {/* Rich Text Content */}
        {hasContent && (
          <article className="py-12 lg:py-16">
            <div className="max-w-3xl mx-auto px-6">
              {contentIsHtml ? (
                <div
                  className="prose prose-lg max-w-none prose-headings:font-semibold prose-a:text-[#4a90a4] prose-a:underline"
                 
                  dangerouslySetInnerHTML={{ __html: page.content! }}
                />
              ) : (
                <div
                  className="text-lg text-[#333] leading-relaxed whitespace-pre-wrap"
                 
                >
                  {page.content}
                </div>
              )}
            </div>
          </article>
        )}

        {/* Widget System - renders below content */}
        {/* Apply widgets-only-page class when widgets are the main content (no hero, no pageHeader) */}
        {/* Note: hasContent check removed - pages using widgets shouldn't have the old content field */}
        {widgets.length > 0 && (
          <div className={!hasHero && !hasPageHeader ? 'widgets-only-page' : ''}>
            <WidgetRenderer widgets={widgets} data={widgetDataWithSettings} />
          </div>
        )}

        {/* Empty State - show message if no content at all */}
        {!hasHero && !hasContent && widgets.length === 0 && (
          <section className="py-24 px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h1
                className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4"
               
              >
                {page.title}
              </h1>
              <p
                className="text-lg text-[#666]"
               
              >
                This page is being updated. Check back soon.
              </p>
            </div>
          </section>
        )}
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
