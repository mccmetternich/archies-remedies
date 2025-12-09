'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  FileText,
  Package,
  Image,
  MessageSquare,
  HelpCircle,
  Mail,
  Menu,
  X,
  ChevronRight,
  Navigation,
  Star,
  Play,
  Instagram,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/hero-slides', label: 'Hero Slides', icon: Image },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/video-testimonials', label: 'Video Testimonials', icon: Play },
  { href: '/admin/instagram', label: 'Instagram', icon: Instagram },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/navigation', label: 'Navigation', icon: Navigation },
  { href: '/admin/subscribers', label: 'Email Subscribers', icon: Mail },
  { href: '/admin/contacts', label: 'Contact Messages', icon: MessageSquare },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  // Get breadcrumb from path
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href: string }[] = [];

    parts.forEach((part, index) => {
      const href = '/' + parts.slice(0, index + 1).join('/');
      let label = part.charAt(0).toUpperCase() + part.slice(1);

      // Clean up label
      label = label.replace(/-/g, ' ');

      breadcrumbs.push({ label, href });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 md:hidden bg-white border-b border-[var(--border)]">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-sm font-bold">
              A
            </div>
            <span className="font-medium">Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[var(--muted)]"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[var(--border)] transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-auto',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-lg font-bold">
                A
              </div>
              <div>
                <span className="font-medium block text-sm">Archie&apos;s Remedies</span>
                <span className="text-xs text-[var(--muted-foreground)]">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* View Site Link */}
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              View Site
              <ChevronRight className="w-3 h-3 ml-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                    active
                      ? 'bg-[var(--primary)] text-[var(--foreground)] font-medium'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Breadcrumbs */}
          <div className="hidden md:block bg-white border-b border-[var(--border)]">
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    {index > 0 && (
                      <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                    )}
                    {index === breadcrumbs.length - 1 ? (
                      <span className="font-medium">{crumb.label}</span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
