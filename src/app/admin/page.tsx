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
} from '@/lib/db/schema';
import { eq, desc, sql, gte } from 'drizzle-orm';
import Link from 'next/link';
import {
  Package,
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
  TrendingUp,
  MessageSquare,
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
      label: 'Products Listed',
      value: data.stats.products,
      icon: Package,
      href: '/admin/products',
      description: 'Active products',
    },
    {
      label: 'Pages',
      value: data.stats.pages,
      icon: FileText,
      href: '/admin/pages',
      description: 'Published pages',
    },
    {
      label: 'Email Subscribers',
      value: data.stats.subscribers,
      icon: Mail,
      href: '/admin/subscribers',
      description: 'Total signups',
    },
    {
      label: 'Inbox Messages',
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
      icon: Package,
      href: '/admin/products/new',
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      label: 'Create New Page',
      description: 'Add a new page to your site',
      icon: FileText,
      href: '/admin/pages/new',
      color: 'bg-green-500/10 text-green-400',
    },
    {
      label: 'Site Settings',
      description: 'Logo, colors, tracking pixels',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-purple-500/10 text-purple-400',
    },
    {
      label: 'Manage Widgets',
      description: 'Hero, testimonials, FAQs',
      icon: Image,
      href: '/admin/hero-slides',
      color: 'bg-orange-500/10 text-orange-400',
    },
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
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center group-hover:bg-[var(--primary)]/10 transition-colors">
                <stat.icon className="w-5 h-5 text-gray-400 group-hover:text-[var(--primary)] transition-colors" />
              </div>
              {stat.badge && (
                <span className="px-2.5 py-1 text-xs font-medium bg-[var(--primary)] text-[#0a0a0a] rounded-full">
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
              <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
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
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5" />
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
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Shortcuts</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1a1a1a] text-gray-300 rounded-lg hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors"
              >
                <Plus className="w-3 h-3" />
                New Product
              </Link>
              <Link
                href="/admin/pages/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1a1a1a] text-gray-300 rounded-lg hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors"
              >
                <Plus className="w-3 h-3" />
                New Page
              </Link>
              <Link
                href="/admin/hero-slides"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1a1a1a] text-gray-300 rounded-lg hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors"
              >
                <Image className="w-3 h-3" />
                Hero Slides
              </Link>
              <Link
                href="/admin/testimonials"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1a1a1a] text-gray-300 rounded-lg hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors"
              >
                <Star className="w-3 h-3" />
                Testimonials
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-[#111111] rounded-xl border border-[#1f1f1f]">
          <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
            <h2 className="font-medium text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--primary)]" />
              Recent Messages
              {data.stats.unreadContacts > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-[var(--primary)] text-[#0a0a0a] rounded-full">
                  {data.stats.unreadContacts}
                </span>
              )}
            </h2>
            <Link
              href="/admin/inbox"
              className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              Jump into inbox <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#1f1f1f]">
            {data.recentContacts.length > 0 ? (
              data.recentContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/admin/inbox?message=${contact.id}`}
                  className="block px-6 py-4 hover:bg-[#1a1a1a] transition-colors"
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
                </Link>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                <p className="text-sm text-gray-400">No messages yet</p>
                <p className="text-xs text-gray-500 mt-1">Messages from your contact form will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Widget Overview */}
      <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medium text-white">Widget Library Overview</h2>
          <Link
            href="/admin/hero-slides"
            className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            Manage widgets <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link
            href="/admin/hero-slides"
            className="text-center p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[var(--primary)]/50 transition-colors group"
          >
            <Image className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-[var(--primary)] transition-colors" />
            <p className="text-2xl font-semibold text-white">{data.stats.heroSlides}</p>
            <p className="text-xs text-gray-500">Hero Slides</p>
          </Link>
          <Link
            href="/admin/testimonials"
            className="text-center p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[var(--primary)]/50 transition-colors group"
          >
            <Star className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-[var(--primary)] transition-colors" />
            <p className="text-2xl font-semibold text-white">{data.stats.testimonials}</p>
            <p className="text-xs text-gray-500">Testimonials</p>
          </Link>
          <Link
            href="/admin/video-testimonials"
            className="text-center p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[var(--primary)]/50 transition-colors group"
          >
            <Users className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-[var(--primary)] transition-colors" />
            <p className="text-2xl font-semibold text-white">0</p>
            <p className="text-xs text-gray-500">Video Reviews</p>
          </Link>
          <Link
            href="/admin/instagram"
            className="text-center p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[var(--primary)]/50 transition-colors group"
          >
            <Image className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-[var(--primary)] transition-colors" />
            <p className="text-2xl font-semibold text-white">0</p>
            <p className="text-xs text-gray-500">Instagram Posts</p>
          </Link>
          <Link
            href="/admin/faqs"
            className="text-center p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[var(--primary)]/50 transition-colors group"
          >
            <HelpCircle className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-[var(--primary)] transition-colors" />
            <p className="text-2xl font-semibold text-white">{data.stats.faqs}</p>
            <p className="text-xs text-gray-500">FAQs</p>
          </Link>
          <Link
            href="/admin/navigation"
            className="text-center p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[var(--primary)]/50 transition-colors group"
          >
            <FileText className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-[var(--primary)] transition-colors" />
            <p className="text-2xl font-semibold text-white">-</p>
            <p className="text-xs text-gray-500">Navigation</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
