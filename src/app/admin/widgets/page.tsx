import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { heroSlides, reviews } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { WIDGET_TYPES, type WidgetTypeDefinition } from '@/lib/widget-library';

export const dynamic = 'force-dynamic';

async function getWidgetCounts() {
  const [heroCount, reviewCount] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(heroSlides)
      .where(eq(heroSlides.isActive, true)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.isActive, true)),
  ]);

  return {
    heroSlides: heroCount[0]?.count || 0,
    reviews: reviewCount[0]?.count || 0,
  };
}

// Widget preview placeholder styles based on widget type
function getPreviewStyle(type: string): { bg: string; accent: string } {
  const styles: Record<string, { bg: string; accent: string }> = {
    hero_carousel: { bg: 'bg-gradient-to-br from-blue-100 to-blue-200', accent: 'bg-blue-400' },
    story_hero: { bg: 'bg-gradient-to-br from-slate-100 to-slate-200', accent: 'bg-slate-400' },
    floating_badges: { bg: 'bg-gradient-to-br from-amber-50 to-amber-100', accent: 'bg-amber-400' },
    text: { bg: 'bg-gradient-to-br from-gray-50 to-gray-100', accent: 'bg-gray-400' },
    two_column_feature: { bg: 'bg-gradient-to-br from-teal-50 to-teal-100', accent: 'bg-teal-400' },
    team_cards: { bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100', accent: 'bg-indigo-400' },
    scale_carousel: { bg: 'bg-gradient-to-br from-purple-50 to-purple-100', accent: 'bg-purple-400' },
    icon_highlights: { bg: 'bg-gradient-to-br from-green-50 to-green-100', accent: 'bg-green-400' },
    media_carousel: { bg: 'bg-gradient-to-br from-pink-50 to-pink-100', accent: 'bg-pink-400' },
    faq_drawer: { bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100', accent: 'bg-cyan-400' },
    reviews: { bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100', accent: 'bg-yellow-500' },
    cta: { bg: 'bg-gradient-to-br from-orange-50 to-orange-100', accent: 'bg-orange-400' },
    contact_form: { bg: 'bg-gradient-to-br from-rose-50 to-rose-100', accent: 'bg-rose-400' },
    marquee: { bg: 'bg-gradient-to-br from-violet-50 to-violet-100', accent: 'bg-violet-400' },
  };
  return styles[type] || { bg: 'bg-gradient-to-br from-gray-50 to-gray-100', accent: 'bg-gray-400' };
}

// Mini preview component showing a simplified widget representation
function WidgetPreview({ widget }: { widget: WidgetTypeDefinition }) {
  const Icon = widget.icon;
  const style = getPreviewStyle(widget.type);

  return (
    <div className={`relative w-full aspect-[16/10] rounded-lg overflow-hidden ${style.bg}`}>
      {/* Simplified visual representation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-12 h-12 rounded-xl ${style.accent} flex items-center justify-center shadow-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {/* Mini preview elements to hint at widget layout */}
      <WidgetLayoutHint type={widget.type} accent={style.accent} />
    </div>
  );
}

// Layout hints to show what kind of widget this is
function WidgetLayoutHint({ type, accent }: { type: string; accent: string }) {
  switch (type) {
    case 'hero_carousel':
      return (
        <>
          <div className="absolute bottom-3 left-3 right-3 h-2 bg-white/60 rounded" />
          <div className="absolute bottom-6 left-3 w-16 h-1.5 bg-white/40 rounded" />
        </>
      );
    case 'two_column_feature':
      return (
        <>
          <div className="absolute top-3 left-3 w-[45%] h-[60%] bg-white/40 rounded" />
          <div className="absolute top-3 right-3 w-[45%] space-y-1">
            <div className="h-2 bg-white/40 rounded w-full" />
            <div className="h-1.5 bg-white/30 rounded w-3/4" />
          </div>
        </>
      );
    case 'text':
      return (
        <div className="absolute inset-3 space-y-2 flex flex-col items-center justify-center">
          <div className="h-1.5 bg-white/40 rounded w-3/4" />
          <div className="h-1 bg-white/30 rounded w-1/2" />
          <div className="h-1 bg-white/30 rounded w-2/3" />
        </div>
      );
    case 'reviews':
      return (
        <div className="absolute bottom-3 left-3 right-3 flex gap-1 justify-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${accent}`} />
          ))}
        </div>
      );
    case 'media_carousel':
    case 'scale_carousel':
      return (
        <div className="absolute bottom-3 left-3 right-3 flex gap-1.5 justify-center">
          <div className="w-6 h-6 bg-white/30 rounded" />
          <div className="w-8 h-8 bg-white/50 rounded -mt-1" />
          <div className="w-6 h-6 bg-white/30 rounded" />
        </div>
      );
    case 'icon_highlights':
      return (
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 justify-center">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-white/40 rounded" />
          ))}
        </div>
      );
    case 'faq_drawer':
      return (
        <div className="absolute bottom-3 left-3 right-3 space-y-1">
          <div className="h-1.5 bg-white/40 rounded" />
          <div className="h-1.5 bg-white/30 rounded" />
        </div>
      );
    case 'marquee':
      return (
        <div className="absolute bottom-3 left-0 right-0 h-3 bg-white/30 flex items-center justify-center gap-2">
          <div className="w-8 h-1 bg-white/50 rounded" />
          <div className="w-1 h-1 rounded-full bg-white/50" />
          <div className="w-8 h-1 bg-white/50 rounded" />
        </div>
      );
    default:
      return null;
  }
}

function WidgetCard({
  widget,
  count,
}: {
  widget: WidgetTypeDefinition;
  count: number | null;
}) {
  const isConfigurable = widget.adminHref !== null;

  const content = (
    <div
      className={`flex flex-col rounded-xl bg-[var(--admin-input)] border transition-all overflow-hidden ${
        isConfigurable
          ? 'border-[var(--admin-border)] hover:border-[var(--primary)] hover:shadow-lg cursor-pointer group'
          : 'border-[var(--admin-border)]/50'
      }`}
    >
      {/* Preview area */}
      <WidgetPreview widget={widget} />

      {/* Info area */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[var(--admin-text-primary)] truncate">
              {widget.name}
            </h3>
            <p className="text-xs text-[var(--admin-text-muted)] mt-1 line-clamp-2">
              {widget.description}
            </p>
          </div>
          {count !== null && (
            <div className="flex-shrink-0 px-2 py-1 bg-[var(--primary)]/10 rounded-md">
              <span className="text-sm font-semibold text-[var(--primary)]">{count}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-[var(--admin-border)]/50 flex items-center justify-between">
          {widget.isGlobal ? (
            <span className="text-xs text-[var(--admin-text-muted)]">Global widget</span>
          ) : (
            <span className="text-xs text-[var(--admin-text-muted)]">Page-specific</span>
          )}
          {isConfigurable && (
            <span className="text-xs text-[var(--primary)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return isConfigurable ? (
    <Link href={widget.adminHref!}>{content}</Link>
  ) : (
    <div>{content}</div>
  );
}

export default async function WidgetLibraryPage() {
  const counts = await getWidgetCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">
          Widget Library
        </h1>
        <p className="text-[var(--admin-text-secondary)] mt-1">
          Browse all available widgets. Global widgets can be configured here, page-specific widgets
          are configured in the page editor.
        </p>
      </div>

      {/* Widget Grid - 2 columns */}
      <div className="grid md:grid-cols-2 gap-4">
        {WIDGET_TYPES.map((widget) => {
          const count = widget.countKey
            ? counts[widget.countKey as keyof typeof counts] ?? null
            : null;
          return <WidgetCard key={widget.type} widget={widget} count={count} />;
        })}
      </div>

      {/* Info Card */}
      <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl p-5">
        <h3 className="font-medium text-[var(--primary)] mb-2">Widget Types</h3>
        <p className="text-sm text-[var(--admin-text-secondary)]">
          <strong>Global widgets</strong> (Hero Carousel, Dynamic Review Wall) are configured once
          and can be added to any page. <strong>Page-specific widgets</strong> store their content
          directly in each page.
        </p>
      </div>
    </div>
  );
}
