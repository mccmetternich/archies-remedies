import { db } from '@/lib/db';
import {
  products,
  heroSlides,
  testimonials,
  faqs,
  emailSubscribers,
  contactSubmissions,
  pages,
} from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import Link from 'next/link';
import {
  Package,
  Image,
  Star,
  HelpCircle,
  Mail,
  MessageSquare,
  FileText,
  TrendingUp,
  Eye,
  Users,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const [
    productCount,
    heroSlideCount,
    testimonialCount,
    faqCount,
    subscriberCount,
    contactCount,
    pageCount,
    recentSubscribers,
    recentContacts,
    unreadContacts,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(heroSlides).where(eq(heroSlides.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(testimonials).where(eq(testimonials.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(faqs).where(eq(faqs.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(emailSubscribers),
    db.select({ count: sql<number>`count(*)` }).from(contactSubmissions),
    db.select({ count: sql<number>`count(*)` }).from(pages).where(eq(pages.isActive, true)),
    db.select().from(emailSubscribers).orderBy(desc(emailSubscribers.subscribedAt)).limit(5),
    db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(5),
    db.select({ count: sql<number>`count(*)` }).from(contactSubmissions).where(eq(contactSubmissions.isRead, false)),
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
    },
    recentSubscribers,
    recentContacts,
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const statCards = [
    {
      label: 'Products',
      value: data.stats.products,
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Hero Slides',
      value: data.stats.heroSlides,
      icon: Image,
      href: '/admin/hero-slides',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Testimonials',
      value: data.stats.testimonials,
      icon: Star,
      href: '/admin/testimonials',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: 'FAQs',
      value: data.stats.faqs,
      icon: HelpCircle,
      href: '/admin/faqs',
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Email Subscribers',
      value: data.stats.subscribers,
      icon: Mail,
      href: '/admin/subscribers',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      label: 'Contact Messages',
      value: data.stats.contacts,
      icon: MessageSquare,
      href: '/admin/contacts',
      color: 'bg-orange-100 text-orange-600',
      badge: data.stats.unreadContacts > 0 ? data.stats.unreadContacts : undefined,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium">Dashboard</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Welcome to your Archie&apos;s Remedies admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl p-4 border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                  {stat.badge} new
                </span>
              )}
            </div>
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-sm text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Subscribers */}
        <div className="bg-white rounded-xl border border-[var(--border)]">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-medium">Recent Subscribers</h2>
            <Link
              href="/admin/subscribers"
              className="text-sm text-[var(--primary-dark)] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {data.recentSubscribers.length > 0 ? (
              data.recentSubscribers.map((sub) => (
                <div key={sub.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{sub.email}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {sub.source || 'Website'} • {new Date(sub.subscribedAt || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-[var(--muted-foreground)]">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No subscribers yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Contact Messages */}
        <div className="bg-white rounded-xl border border-[var(--border)]">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-medium">Recent Messages</h2>
            <Link
              href="/admin/contacts"
              className="text-sm text-[var(--primary-dark)] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {data.recentContacts.length > 0 ? (
              data.recentContacts.map((contact) => (
                <div key={contact.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      {contact.name}
                      {!contact.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </p>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {new Date(contact.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                    {contact.subject || contact.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-[var(--muted-foreground)]">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-[var(--border)] p-5">
        <h2 className="font-medium mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm">Site Settings</p>
              <p className="text-xs text-[var(--muted-foreground)]">Logo, colors, tracking</p>
            </div>
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm">Edit Products</p>
              <p className="text-xs text-[var(--muted-foreground)]">Manage PDP pages</p>
            </div>
          </Link>
          <Link
            href="/admin/hero-slides"
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm">Hero Carousel</p>
              <p className="text-xs text-[var(--muted-foreground)]">Homepage slides</p>
            </div>
          </Link>
          <Link
            href="/admin/faqs"
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm">Manage FAQs</p>
              <p className="text-xs text-[var(--muted-foreground)]">Questions & answers</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
