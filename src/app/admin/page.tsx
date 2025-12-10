import { db } from '@/lib/db';
import {
  products,
  heroSlides,
  testimonials,
  faqs,
  contacts,
  contactSubmissions,
  pages,
  pageViews,
  clickTracking,
  videoTestimonials,
} from '@/lib/db/schema';
import { eq, desc, sql, gte } from 'drizzle-orm';
import Link from 'next/link';
import {
  ShoppingBag,
  Image,
  Star,
  HelpCircle,
  Users,
  Eye,
  ArrowRight,
  Inbox,
  MessageSquare,
  Play,
  Layers,
  MousePointerClick,
  Clock,
  FileText,
  Package,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  // Get date from 30 days ago for visitor stats
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    productCount,
    heroSlideCount,
    testimonialCount,
    videoTestimonialCount,
    faqCount,
    totalContactsCount,
    emailContactsCount,
    smsContactsCount,
    inboxCount,
    pageCount,
    recentContacts,
    unreadContacts,
    uniqueVisitors,
    uniqueClicks,
    recentPages,
    recentProducts,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(heroSlides).where(eq(heroSlides.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(testimonials).where(eq(testimonials.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(videoTestimonials).where(eq(videoTestimonials.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(faqs).where(eq(faqs.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(contacts),
    db.select({ count: sql<number>`count(*)` }).from(contacts).where(eq(contacts.emailStatus, 'active')),
    db.select({ count: sql<number>`count(*)` }).from(contacts).where(eq(contacts.smsStatus, 'active')),
    db.select({ count: sql<number>`count(*)` }).from(contactSubmissions),
    db.select({ count: sql<number>`count(*)` }).from(pages).where(eq(pages.isActive, true)),
    db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(5),
    db.select({ count: sql<number>`count(*)` }).from(contactSubmissions).where(eq(contactSubmissions.isRead, false)),
    db.select({ count: sql<number>`count(distinct ${pageViews.visitorId})` }).from(pageViews).where(gte(pageViews.createdAt, thirtyDaysAgo.toISOString())),
    db.select({ count: sql<number>`count(distinct ${clickTracking.visitorId})` }).from(clickTracking).where(gte(clickTracking.createdAt, thirtyDaysAgo.toISOString())),
    db.select({ id: pages.id, title: pages.title, slug: pages.slug, updatedAt: pages.updatedAt }).from(pages).orderBy(desc(pages.updatedAt)).limit(3),
    db.select({ id: products.id, name: products.name, slug: products.slug, updatedAt: products.updatedAt }).from(products).orderBy(desc(products.updatedAt)).limit(2),
  ]);

  return {
    stats: {
      products: productCount[0]?.count || 0,
      heroSlides: heroSlideCount[0]?.count || 0,
      testimonials: testimonialCount[0]?.count || 0,
      videoTestimonials: videoTestimonialCount[0]?.count || 0,
      faqs: faqCount[0]?.count || 0,
      totalContacts: totalContactsCount[0]?.count || 0,
      emailContacts: emailContactsCount[0]?.count || 0,
      smsContacts: smsContactsCount[0]?.count || 0,
      inbox: inboxCount[0]?.count || 0,
      pages: pageCount[0]?.count || 0,
      unreadContacts: unreadContacts[0]?.count || 0,
      uniqueVisitors: uniqueVisitors[0]?.count || 0,
      uniqueClicks: uniqueClicks[0]?.count || 0,
    },
    recentContacts,
    recentPages,
    recentProducts,
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const statCards = [
    {
      label: 'Unique Visitors',
      value: data.stats.uniqueVisitors,
      icon: Eye,
      href: '/admin/performance',
      description: 'Last 30 days',
    },
    {
      label: 'Unique Clicks',
      value: data.stats.uniqueClicks,
      icon: MousePointerClick,
      href: '/admin/performance',
      description: 'External links',
    },
    {
      label: 'Products',
      value: data.stats.products,
      icon: ShoppingBag,
      href: '/admin/products',
      description: 'Active products',
    },
    {
      label: 'Contacts',
      value: data.stats.totalContacts,
      icon: Users,
      href: '/admin/contacts',
      description: `${data.stats.emailContacts} emails, ${data.stats.smsContacts} SMS`,
    },
    {
      label: 'Inbox',
      value: data.stats.inbox,
      icon: Inbox,
      href: '/admin/inbox',
      description: data.stats.unreadContacts > 0 ? `${data.stats.unreadContacts} unread` : 'All read',
      badge: data.stats.unreadContacts > 0 ? data.stats.unreadContacts : undefined,
    },
  ];

  const widgetItems = [
    { label: 'Hero Slides', value: data.stats.heroSlides, icon: Image, href: '/admin/hero-slides' },
    { label: 'Testimonials', value: data.stats.testimonials, icon: Star, href: '/admin/testimonials' },
    { label: 'Video Reviews', value: data.stats.videoTestimonials, icon: Play, href: '/admin/video-testimonials' },
    { label: 'FAQs', value: data.stats.faqs, icon: HelpCircle, href: '/admin/faqs' },
  ];

  // Combine recent pages and products for "Recently Edited"
  const recentlyEdited = [
    ...data.recentPages.map((p) => ({
      id: p.id,
      title: p.title,
      type: 'page' as const,
      href: `/admin/pages/${p.id}`,
      updatedAt: p.updatedAt,
    })),
    ...data.recentProducts.map((p) => ({
      id: p.id,
      title: p.name,
      type: 'product' as const,
      href: `/admin/products/${p.id}`,
      updatedAt: p.updatedAt,
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">Dashboard</h1>
        <p className="text-[var(--admin-text-secondary)] mt-1">
          Welcome to your Archie&apos;s Remedies admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-[var(--admin-card)] rounded-xl p-3 sm:p-5 border border-[var(--admin-border-light)] hover:border-[var(--primary)] transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--admin-button-text)]" />
              </div>
              {stat.badge && (
                <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-red-500 text-[var(--admin-text-primary)] rounded-full">
                  {stat.badge}
                </span>
              )}
            </div>
            <p className="text-xl sm:text-3xl font-semibold text-[var(--admin-text-primary)] mb-0.5 sm:mb-1">{stat.value}</p>
            <p className="text-xs sm:text-sm text-[var(--admin-text-secondary)] group-hover:text-[var(--admin-text-primary)] transition-colors">
              {stat.label}
            </p>
            <p className="text-[10px] sm:text-xs text-[var(--admin-text-muted)] mt-0.5 sm:mt-1 hidden sm:block">{stat.description}</p>
            <ArrowRight className="absolute bottom-3 sm:bottom-5 right-3 sm:right-5 w-4 h-4 text-[var(--admin-text-muted)] group-hover:text-[var(--primary)] transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 hidden sm:block" />
          </Link>
        ))}
      </div>

      {/* Widget Library - Full Width */}
      <Link
        href="/admin/widgets"
        className="block bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] hover:border-[var(--primary)] transition-all group"
      >
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--admin-border-light)] flex items-center justify-between">
          <h2 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2 text-sm sm:text-base">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--admin-button-text)]" />
            </div>
            Widget Library
          </h2>
          <span className="text-xs sm:text-sm text-[var(--primary)] group-hover:underline flex items-center gap-1">
            <span className="hidden sm:inline">Manage Widgets</span> <ArrowRight className="w-3 h-3" />
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-6">
          {widgetItems.map((widget) => (
            <div
              key={widget.label}
              className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-[var(--admin-input)] border border-[var(--admin-border-light)] group-hover:border-[var(--primary)]/30 transition-all"
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[var(--primary)] flex items-center justify-center mb-2 sm:mb-3">
                <widget.icon className="w-4 h-4 sm:w-6 sm:h-6 text-[var(--admin-button-text)]" />
              </div>
              <p className="text-lg sm:text-2xl font-semibold text-[var(--admin-text-primary)]">{widget.value}</p>
              <p className="text-[10px] sm:text-xs text-[var(--admin-text-secondary)] mt-0.5 sm:mt-1 text-center">{widget.label}</p>
            </div>
          ))}
        </div>
      </Link>

      {/* Recently Edited */}
      {recentlyEdited.length > 0 && (
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)]">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--admin-border-light)] flex items-center justify-between">
            <h2 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2 text-sm sm:text-base">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--admin-button-text)]" />
              </div>
              Recently Edited
            </h2>
          </div>
          <div className="divide-y divide-[var(--admin-border-light)]">
            {recentlyEdited.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 hover:bg-[var(--admin-input)] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--admin-input)] flex items-center justify-center group-hover:bg-[var(--primary)]/10 shrink-0">
                  {item.type === 'page' ? (
                    <FileText className="w-4 h-4 text-[var(--admin-text-secondary)] group-hover:text-[var(--primary)]" />
                  ) : (
                    <Package className="w-4 h-4 text-[var(--admin-text-secondary)] group-hover:text-[var(--primary)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--admin-text-primary)] truncate group-hover:text-[var(--primary)]">
                    {item.title}
                  </p>
                  <p className="text-xs text-[var(--admin-text-muted)] capitalize">{item.type}</p>
                </div>
                <span className="text-xs text-[var(--admin-text-muted)] hidden sm:block">
                  {item.updatedAt
                    ? new Date(item.updatedAt).toLocaleDateString()
                    : 'Recently'}
                </span>
                <ArrowRight className="w-4 h-4 text-[var(--admin-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Messages */}
      <Link
        href="/admin/inbox"
        className="block bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] hover:border-[var(--primary)] transition-all group"
      >
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--admin-border-light)] flex items-center justify-between">
          <h2 className="font-medium text-[var(--admin-text-primary)] flex items-center gap-2 text-sm sm:text-base">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
              <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--admin-button-text)]" />
            </div>
            Messages
            {data.stats.unreadContacts > 0 && (
              <span className="ml-1 sm:ml-2 px-1.5 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium bg-red-500 text-[var(--admin-text-primary)] rounded-full">
                {data.stats.unreadContacts}
              </span>
            )}
          </h2>
          <span className="text-xs sm:text-sm text-[var(--primary)] group-hover:underline flex items-center gap-1">
            <span className="hidden sm:inline">View all</span> <ArrowRight className="w-3 h-3" />
          </span>
        </div>
        <div className="divide-y divide-[var(--admin-border-light)]">
          {data.recentContacts.length > 0 ? (
            <div className="divide-y divide-[var(--admin-border-light)] sm:divide-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-px sm:bg-[var(--admin-border-light)]">
              {data.recentContacts.slice(0, 3).map((contact) => (
                <div
                  key={contact.id}
                  className="bg-[var(--admin-card)] px-4 sm:px-6 py-3 sm:py-4 hover:bg-[var(--admin-input)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                    <p className="text-sm font-medium text-[var(--admin-text-primary)] flex items-center gap-2 truncate">
                      {contact.name}
                      {!contact.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
                      )}
                    </p>
                    <span className="text-[10px] sm:text-xs text-[var(--admin-text-muted)] shrink-0 ml-2">
                      {new Date(contact.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                  {contact.subject && (
                    <p className="text-sm text-[var(--admin-text-secondary)] mb-1 truncate">{contact.subject}</p>
                  )}
                  <p className="text-xs text-[var(--admin-text-muted)] line-clamp-1">
                    {contact.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
              <Inbox className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-[var(--admin-text-muted)]" />
              <p className="text-sm text-[var(--admin-text-secondary)]">No messages yet</p>
              <p className="text-xs text-[var(--admin-text-muted)] mt-1 hidden sm:block">Messages from your contact form will appear here</p>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
