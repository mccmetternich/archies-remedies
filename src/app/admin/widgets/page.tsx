import Link from 'next/link';
import {
  Image as ImageIcon,
  Type,
  Quote,
  Star,
  HelpCircle,
  MessageSquare,
  Instagram,
  PlayCircle,
  Layout,
  ArrowRight,
  Columns,
  Video,
  MousePointerClick,
  Grid3X3,
  Sparkles,
  List,
  Award,
  Megaphone,
  Gift,
  Zap,
  Settings,
} from 'lucide-react';
import { db } from '@/lib/db';
import { heroSlides, testimonials, videoTestimonials, faqs, instagramPosts } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

async function getWidgetCounts() {
  const [
    heroCount,
    testimonialCount,
    videoCount,
    faqCount,
    instagramCount,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(heroSlides).where(eq(heroSlides.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(testimonials).where(eq(testimonials.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(videoTestimonials).where(eq(videoTestimonials.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(faqs).where(eq(faqs.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(instagramPosts).where(eq(instagramPosts.isActive, true)),
  ]);

  return {
    heroSlides: heroCount[0]?.count || 0,
    testimonials: testimonialCount[0]?.count || 0,
    videoTestimonials: videoCount[0]?.count || 0,
    faqs: faqCount[0]?.count || 0,
    instagramPosts: instagramCount[0]?.count || 0,
  };
}

// Widget categories for organization
const WIDGET_CATEGORIES = [
  {
    name: 'Content',
    description: 'Core content blocks for building pages',
    widgets: [
      { type: 'hero', label: 'Hero Slides', icon: ImageIcon, href: '/admin/hero-slides', description: 'Full-width hero carousel', countKey: 'heroSlides' },
      { type: 'text', label: 'Text Blocks', icon: Type, href: null, description: 'Rich text content sections', countKey: null },
      { type: 'image_text', label: 'Image + Text', icon: Columns, href: null, description: 'Split layout with image and copy', countKey: null },
      { type: 'video', label: 'Video Embed', icon: Video, href: null, description: 'Embedded video player', countKey: null },
      { type: 'quote', label: 'Pull Quotes', icon: Quote, href: null, description: 'Testimonial or pull quote blocks', countKey: null },
    ],
  },
  {
    name: 'Social Proof',
    description: 'Build trust with customer reviews and social content',
    widgets: [
      { type: 'testimonials', label: 'Testimonials', icon: Star, href: '/admin/testimonials', description: 'Customer testimonial carousel', countKey: 'testimonials' },
      { type: 'video_testimonials', label: 'Video Reviews', icon: PlayCircle, href: '/admin/video-testimonials', description: 'Video testimonial grid', countKey: 'videoTestimonials' },
      { type: 'instagram', label: 'Instagram Feed', icon: Instagram, href: '/admin/instagram', description: 'Instagram post grid', countKey: 'instagramPosts' },
      { type: 'press', label: 'Press & Media', icon: Megaphone, href: null, description: 'As seen in logos', countKey: null },
    ],
  },
  {
    name: 'Product',
    description: 'Showcase products and their benefits',
    widgets: [
      { type: 'product_grid', label: 'Product Grid', icon: Grid3X3, href: null, description: 'Featured products showcase', countKey: null },
      { type: 'benefits', label: 'Benefits', icon: Sparkles, href: null, description: 'Product benefits with icons', countKey: null },
      { type: 'ingredients', label: 'Ingredients', icon: List, href: null, description: 'Ingredient list with info', countKey: null },
      { type: 'comparison', label: 'Comparison', icon: Columns, href: null, description: 'Before/after comparison', countKey: null },
      { type: 'certifications', label: 'Certifications', icon: Award, href: null, description: 'Trust badges and certifications', countKey: null },
    ],
  },
  {
    name: 'Engagement',
    description: 'Interactive elements to engage visitors',
    widgets: [
      { type: 'faqs', label: 'FAQs', icon: HelpCircle, href: '/admin/faqs', description: 'Accordion FAQ section', countKey: 'faqs' },
      { type: 'cta', label: 'Call to Action', icon: MousePointerClick, href: null, description: 'Button with background', countKey: null },
      { type: 'contact_form', label: 'Contact Form', icon: MessageSquare, href: null, description: 'Email contact form', countKey: null },
      { type: 'newsletter', label: 'Newsletter', icon: Gift, href: null, description: 'Email signup form', countKey: null },
      { type: 'marquee', label: 'Marquee Bar', icon: Zap, href: null, description: 'Scrolling text banner', countKey: null },
    ],
  },
];

export default async function WidgetLibraryPage() {
  const counts = await getWidgetCounts();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">Widget Library</h1>
        <p className="text-[var(--admin-text-secondary)] mt-1">
          Manage global widgets used across your site. Click on a widget to configure its content.
        </p>
      </div>

      {/* Widget Categories */}
      <div className="space-y-8">
        {WIDGET_CATEGORIES.map((category) => (
          <div key={category.name} className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-[var(--admin-text-primary)] text-lg">{category.name}</h2>
              <p className="text-sm text-[var(--admin-text-muted)] mt-1">{category.description}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-6">
              {category.widgets.map((widget) => {
                const Icon = widget.icon;
                const count = widget.countKey ? counts[widget.countKey as keyof typeof counts] : null;
                const isConfigurable = widget.href !== null;

                const content = (
                  <div
                    className={`flex flex-col items-center p-5 rounded-xl bg-[var(--admin-bg)] border transition-all group ${
                      isConfigurable
                        ? 'border-[var(--admin-border)] hover:border-[var(--primary)] cursor-pointer'
                        : 'border-[var(--admin-border)]/50 opacity-60'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                      isConfigurable ? 'bg-[var(--primary)]' : 'bg-[var(--admin-hover)]'
                    }`}>
                      <Icon className={`w-7 h-7 ${isConfigurable ? 'text-[var(--admin-button-text)]' : 'text-[var(--admin-text-muted)]'}`} />
                    </div>
                    {count !== null && (
                      <p className="text-2xl font-semibold text-[var(--admin-text-primary)] mb-1">{count}</p>
                    )}
                    <p className="text-sm font-medium text-[var(--admin-text-primary)] text-center">{widget.label}</p>
                    <p className="text-xs text-[var(--admin-text-muted)] text-center mt-1">{widget.description}</p>
                    {isConfigurable && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                        <Settings className="w-3 h-3" />
                        Configure
                      </div>
                    )}
                    {!isConfigurable && (
                      <div className="mt-3 text-xs text-[var(--admin-text-muted)]">
                        Page-specific
                      </div>
                    )}
                  </div>
                );

                return isConfigurable ? (
                  <Link key={widget.type} href={widget.href!}>
                    {content}
                  </Link>
                ) : (
                  <div key={widget.type}>{content}</div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl p-6">
        <h3 className="font-medium text-[var(--primary)] mb-2">About the Widget Library</h3>
        <p className="text-sm text-[var(--admin-text-secondary)]">
          Global widgets like Hero Slides, Testimonials, and FAQs are configured here and can be added to any page.
          Page-specific widgets are configured directly within each page&apos;s editor.
        </p>
      </div>
    </div>
  );
}
