import { db } from '@/lib/db';
import {
  products,
  heroSlides,
  testimonials,
  faqs,
  emailSubscribers,
  contactSubmissions,
  pages,
  pageViews,
  clickTracking,
} from '@/lib/db/schema';
import { eq, desc, sql, gte } from 'drizzle-orm';
import Link from 'next/link';
import {
  ShoppingBag,
  Image,
  Star,
  HelpCircle,
  Mail,
  FileText,
  Eye,
  Users,
  ArrowRight,
  Plus,
  Settings,
  Inbox,
  Zap,
  MessageSquare,
  Play,
  Instagram,
  Navigation,
  Layers,
  MousePointerClick,
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
    faqCount,
    subscriberCount,
    contactCount,
    pageCount,
    recentContacts,
    unreadContacts,
    uniqueVisitors,
    uniqueClicks,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(heroSlides).where(eq(heroSlides.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(testimonials).where(eq(testimonials.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(faqs).where(eq(faqs.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(emailSubscribers),
    db.select({ count: sql<number>`count(*)` }).from(contactSubmissions),
    db.select({ count: sql<number>`count(*)` }).from(pages).where(eq(pages.isActive, true)),
    db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(5),
    db.select({ count: sql<number>`count(*)` }).from(contactSubmissions).where(eq(contactSubmissions.isRead, false)),
    db.select({ count: sql<number>`count(distinct ${pageViews.visitorId})` }).from(pageViews).where(gte(pageViews.createdAt, thirtyDaysAgo.toISOString())),
    db.select({ count: sql<number>`count(distinct ${clickTracking.visitorId})` }).from(clickTracking).where(gte(clickTracking.createdAt, thirtyDaysAgo.toISOString())),
  ]);

  return {
    stats: {
      products: productCount[0]?.count || 0,
      heroSlides: heroSlideCount[0]?.count || 0,
      testimonials: testimonialCount[0]?.count || 0,
      faqs: faqCount[0]?.count || 0,
      subscribers: subscriberCount[0]?.count || 0,
      contacts: contactCount[0]?.count || 0,
      pages: pageCount[0]?.count || 0,
      unreadContacts: unreadContacts[0]?.count || 0,
      uniqueVisitors: uniqueVisitors[0]?.count || 0,
      uniqueClicks: uniqueClicks[0]?.count || 0,
    },
    recentContacts,
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const statCards = [
    {
      label: 'Unique Visitors',
      value: data.stats.uniqueVisitors,
      icon: Eye,
      href: '/admin',
      description: 'Last 30 days',
    },
    {
      label: 'Unique Clicks',
      value: data.stats.uniqueClicks,
      icon: MousePointerClick,
      href: '/admin',
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
      label: 'Subscribers',
      value: data.stats.subscribers,
      icon: Mail,
      href: '/admin/subscribers',
      description: 'Total signups',
    },
    {
      label: 'Inbox',
      value: data.stats.contacts,
      icon: Inbox,
      href: '/admin/inbox',
      description: data.stats.unreadContacts > 0 ? `${data.stats.unreadContacts} unread` : 'All read',
      badge: data.stats.unreadContacts > 0 ? data.stats.unreadContacts : undefined,
    },
  ];

  const quickActions = [
    {
      label: 'Create New Product',
      description: 'Add a new product to your store',
      icon: ShoppingBag,
      href: '/admin/products/new',
    },
    {
      label: 'Create New Page',
      description: 'Add a new page to your site',
      icon: FileText,
      href: '/admin/pages/new',
    },
    {
      label: 'Site Settings',
      description: 'Logo, colors, tracking pixels',
      icon: Settings,
      href: '/admin/settings',
    },
    {
      label: 'Widget Library',
      description: 'Hero, testimonials, FAQs',
      icon: Layers,
      href: '/admin/hero-slides',
    },
  ];

  const widgetItems = [
    { label: 'Hero Slides', value: data.stats.heroSlides, icon: Image, href: '/admin/hero-slides' },
    { label: 'Testimonials', value: data.stats.testimonials, icon: Star, href: '/admin/testimonials' },
    { label: 'Video Reviews', value: 0, icon: Play, href: '/admin/video-testimonials' },
    { label: 'Instagram', value: 0, icon: Instagram, href: '/admin/instagram' },
    { label: 'FAQs', value: data.stats.faqs, icon: HelpCircle, href: '/admin/faqs' },
    { label: 'Navigation', value: '-', icon: Navigation, href: '/admin/navigation' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Welcome to your Archie&apos;s Remedies admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-[#111111] rounded-xl p-5 border border-[#1f1f1f] hover:border-[var(--primary)] transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-gray-700" />
              </div>
              {stat.badge && (
                <span className="px-2.5 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                  {stat.badge} new
                </span>
              )}
            </div>
            <p className="text-3xl font-semibold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              {stat.label}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            <ArrowRight className="absolute bottom-5 right-5 w-4 h-4 text-gray-600 group-hover:text-[var(--primary)] transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0" />
          </Link>
        ))}
      </div>

      {/* Two Column Layout - Quick Actions + Recent Messages */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions - 2x2 Grid */}
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium text-white flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-gray-700" />
              </div>
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col gap-3 p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[var(--primary)]/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="font-medium text-sm text-white group-hover:text-[var(--primary)] transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick hotlinks */}
          <div className="mt-6 pt-6 border-t border-[#1f1f1f]">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Shortcuts</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-[#1a1a1a] text-white rounded-lg hover:bg-[var(--primary)] hover:text-gray-700 transition-colors border border-[#2a2a2a]"
              >
                <Plus className="w-3 h-3" />
                New Product
              </Link>
              <Link
                href="/admin/pages/new"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-[#1a1a1a] text-white rounded-lg hover:bg-[var(--primary)] hover:text-gray-700 transition-colors border border-[#2a2a2a]"
              >
                <Plus className="w-3 h-3" />
                New Page
              </Link>
              <Link
                href="/admin/hero-slides"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-[#1a1a1a] text-white rounded-lg hover:bg-[var(--primary)] hover:text-gray-700 transition-colors border border-[#2a2a2a]"
              >
                <Image className="w-3 h-3" />
                Hero Slides
              </Link>
              <Link
                href="/admin/testimonials"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-[#1a1a1a] text-white rounded-lg hover:bg-[var(--primary)] hover:text-gray-700 transition-colors border border-[#2a2a2a]"
              >
                <Star className="w-3 h-3" />
                Testimonials
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Messages - Entire card clickable */}
        <Link
          href="/admin/inbox"
          className="block bg-[#111111] rounded-xl border border-[#1f1f1f] hover:border-[var(--primary)] transition-all group"
        >
          <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
            <h2 className="font-medium text-white flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-gray-700" />
              </div>
              Recent Messages
              {data.stats.unreadContacts > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                  {data.stats.unreadContacts}
                </span>
              )}
            </h2>
            <span className="text-sm text-[var(--primary)] group-hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="divide-y divide-[#1f1f1f]">
            {data.recentContacts.length > 0 ? (
              data.recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="px-6 py-4 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-white flex items-center gap-2">
                      {contact.name}
                      {!contact.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                      )}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(contact.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                  {contact.subject && (
                    <p className="text-sm text-gray-400 mb-1">{contact.subject}</p>
                  )}
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {contact.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                <p className="text-sm text-gray-400">No messages yet</p>
                <p className="text-xs text-gray-500 mt-1">Messages from your contact form will appear here</p>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Widget Library Overview - Vertical Cards */}
      <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medium text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-gray-700" />
            </div>
            Widget Library
          </h2>
          <Link
            href="/admin/hero-slides"
            className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            Manage all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {widgetItems.map((widget) => (
            <Link
              key={widget.label}
              href={widget.href}
              className="flex flex-col items-center p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[var(--primary)] transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center mb-3">
                <widget.icon className="w-6 h-6 text-gray-700" />
              </div>
              <p className="text-2xl font-semibold text-white">{widget.value}</p>
              <p className="text-xs text-gray-500 mt-1">{widget.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
