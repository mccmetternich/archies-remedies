'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  FileText,
  Package,
  Mail,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Inbox,
  Eye,
  Bell,
  Construction,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  unreadMessages?: number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
  separator?: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: number;
  children?: NavItem[];
}

export function AdminLayout({ children, unreadMessages = 0 }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInDraftMode, setIsInDraftMode] = useState(false);

  // Check draft mode status on mount
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => setIsInDraftMode(data.siteInDraftMode ?? false))
      .catch(() => {});
  }, []);

  const handlePreviewSite = async () => {
    if (isInDraftMode) {
      // Generate preview token first
      await fetch('/api/admin/preview', { method: 'POST' });
    }
    window.open('/', '_blank');
  };

  const navSections: NavSection[] = [
    {
      items: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: 'Content',
      items: [
        { href: '/admin/pages', label: 'Pages', icon: FileText },
        { href: '/admin/products', label: 'Products', icon: Package },
      ],
    },
    {
      title: 'Marketing',
      items: [
        { href: '/admin/subscribers', label: 'Email Subscribers', icon: Mail },
        { href: '/admin/inbox', label: 'Inbox', icon: Inbox, badge: unreadMessages },
      ],
    },
    {
      separator: true,
      items: [
        { href: '/admin/settings', label: 'Site Settings', icon: Settings },
      ],
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href: string }[] = [];

    parts.forEach((part, index) => {
      const href = '/' + parts.slice(0, index + 1).join('/');
      let label = part.charAt(0).toUpperCase() + part.slice(1);
      label = label.replace(/-/g, ' ');
      breadcrumbs.push({ label, href });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // Clear cookie manually as fallback
      document.cookie = 'admin_session=; path=/admin; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] admin-theme">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 md:hidden bg-[#111111] border-b border-[#1f1f1f]">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-sm font-bold text-[#0a0a0a]">
              A
            </div>
            <span className="font-medium text-white">Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            {unreadMessages > 0 && (
              <Link href="/admin/inbox" className="relative p-2">
                <Bell className="w-5 h-5 text-[#a1a1aa]" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-xs bg-[var(--primary)] text-[#0a0a0a] rounded-full flex items-center justify-center font-medium">
                  {unreadMessages}
                </span>
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-[#1f1f1f] text-[#a1a1aa]"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] border-r border-[#1f1f1f] transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-auto flex flex-col',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Logo */}
          <div className="h-16 flex items-center px-5 border-b border-[#1f1f1f]">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-lg font-bold text-[#0a0a0a]">
                A
              </div>
              <div>
                <span className="font-medium block text-sm text-white">Archie&apos;s Remedies</span>
                <span className="text-xs text-[#6b6b73]">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* View Site Link */}
          <div className="px-3 py-3 border-b border-[#1f1f1f]">
            {isInDraftMode && (
              <div className="flex items-center gap-2 px-3 py-2 mb-2 text-xs bg-orange-500/10 text-orange-400 rounded-lg">
                <Construction className="w-3.5 h-3.5" />
                Draft Mode Active
              </div>
            )}
            <button
              onClick={handlePreviewSite}
              className="flex items-center gap-2 px-3 py-2 w-full text-sm text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              {isInDraftMode ? (
                <>
                  <Eye className="w-4 h-4" />
                  Preview Site
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  View Live Site
                </>
              )}
              <ChevronRight className="w-3 h-3 ml-auto" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
            {navSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.separator && (
                  <div className="h-px bg-[#1f1f1f] mb-4" />
                )}
                {section.title && (
                  <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[#6b6b73]">
                    {section.title}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group',
                          active
                            ? 'bg-[var(--primary)] text-[#0a0a0a] font-medium'
                            : 'text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white'
                        )}
                      >
                        <item.icon className={cn('w-4 h-4', active && 'text-[#0a0a0a]')} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            active
                              ? 'bg-[#0a0a0a]/20 text-[#0a0a0a]'
                              : 'bg-[var(--primary)] text-[#0a0a0a]'
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-[#1f1f1f]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center justify-between bg-[#111111] border-b border-[#1f1f1f]">
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    {index > 0 && (
                      <ChevronRight className="w-4 h-4 text-[#6b6b73]" />
                    )}
                    {index === breadcrumbs.length - 1 ? (
                      <span className="font-medium text-white">{crumb.label}</span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-[#a1a1aa] hover:text-white transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {unreadMessages > 0 && (
              <Link
                href="/admin/inbox"
                className="mr-6 flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-sm hover:bg-[var(--primary)]/20 transition-colors"
              >
                <Inbox className="w-4 h-4" />
                <span>{unreadMessages} new message{unreadMessages > 1 ? 's' : ''}</span>
              </Link>
            )}
          </div>

          {/* Page Content */}
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
