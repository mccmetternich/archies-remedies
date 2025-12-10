'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  FileText,
  Package,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Inbox,
  Eye,
  Bell,
  Construction,
  ExternalLink,
  Navigation,
  Layers,
  Globe,
  Rocket,
  PenSquare,
  MousePointerClick,
  BarChart3,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminThemeProvider, useAdminTheme } from '@/contexts/AdminThemeContext';

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
}

function AdminLayoutInner({ children, unreadMessages = 0 }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInDraftMode, setIsInDraftMode] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const { theme } = useAdminTheme();

  // Check draft mode status on mount
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => setIsInDraftMode(data.siteInDraftMode ?? false))
      .catch(() => {});
  }, []);

  // Generate preview token when in draft mode
  const generatePreviewToken = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/preview', { method: 'POST' });
      const data = await res.json();
      if (data.token) {
        setPreviewToken(data.token);
      }
    } catch (error) {
      console.error('Failed to generate preview token:', error);
    }
  }, []);

  useEffect(() => {
    if (isInDraftMode) {
      generatePreviewToken();
    }
  }, [isInDraftMode, generatePreviewToken]);

  const handleViewSite = () => {
    if (isInDraftMode && previewToken) {
      window.open(`/?preview=${previewToken}`, '_blank');
    } else {
      window.open('/', '_blank');
    }
  };

  const navSections: NavSection[] = [
    {
      items: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { href: '/admin/performance', label: 'Performance', icon: Rocket },
      ],
    },
    {
      title: 'Content',
      items: [
        { href: '/admin/pages', label: 'Pages', icon: FileText },
        { href: '/admin/products', label: 'Products', icon: Package },
        { href: '/admin/blog', label: 'Blog', icon: PenSquare },
        { href: '/admin/widgets', label: 'Widget Library', icon: Layers },
        { href: '/admin/navigation', label: 'Navigation', icon: Navigation },
      ],
    },
    {
      title: 'Marketing',
      items: [
        { href: '/admin/contacts', label: 'Contacts', icon: Users },
        { href: '/admin/popups', label: 'Pop-ups', icon: MousePointerClick },
        { href: '/admin/tracking', label: 'Tracking', icon: BarChart3 },
        { href: '/admin/inbox', label: 'Inbox', icon: Inbox, badge: unreadMessages },
      ],
    },
    {
      title: 'Settings',
      items: [
        { href: '/admin/settings', label: 'Site Settings', icon: Settings },
        { href: '/admin/settings/global', label: 'Global Settings', icon: Globe },
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
      document.cookie = 'admin_session=; path=/admin; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className={cn('min-h-screen bg-[var(--admin-bg)] admin-theme', theme === 'light' && 'admin-theme-light')}>
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 md:hidden bg-[var(--admin-sidebar)] border-b border-[var(--admin-border)]">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-sm font-bold text-[var(--admin-button-text)]">
              A
            </div>
            <span className="font-medium text-white">Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            {unreadMessages > 0 && (
              <Link href="/admin/inbox" className="relative p-2">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-xs bg-[var(--primary)] text-[var(--admin-button-text)] rounded-full flex items-center justify-center font-medium">
                  {unreadMessages}
                </span>
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-[var(--admin-hover)] text-gray-400"
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
            'fixed inset-y-0 left-0 z-50 w-64 bg-[var(--admin-sidebar)] border-r border-[var(--admin-border)] transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-auto flex flex-col',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Logo + View Site Button Row */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--admin-border)]">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-lg font-bold text-[var(--admin-button-text)]">
                A
              </div>
              <div>
                <span className="font-medium block text-sm text-white">Archie&apos;s Remedies</span>
                <span className="text-xs text-gray-500">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* View Site Button - Full Width at Top */}
          <div className="px-3 py-3 border-b border-[var(--admin-border)]">
            <button
              onClick={handleViewSite}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isInDraftMode
                  ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              )}
            >
              {isInDraftMode ? (
                <>
                  <Eye className="w-4 h-4" />
                  View Draft
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  View Live Site
                </>
              )}
            </button>
          </div>

          {/* Draft Mode Indicator */}
          {isInDraftMode && (
            <div className="px-3 py-2 border-b border-[var(--admin-border)]">
              <div className="flex items-center gap-2 px-3 py-2 text-xs bg-orange-500/10 text-orange-400 rounded-lg">
                <Construction className="w-3.5 h-3.5" />
                <span>Draft Mode Active</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
            {navSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.separator && (
                  <div className="h-px bg-[var(--admin-border)] mb-4" />
                )}
                {section.title && (
                  <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
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
                            ? 'bg-[var(--primary)] text-[var(--admin-button-text)] font-medium'
                            : 'text-gray-300 hover:bg-[var(--admin-hover)] hover:text-white'
                        )}
                      >
                        <item.icon className={cn('w-4 h-4', active ? 'text-[var(--admin-button-text)]' : 'text-gray-400')} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            active
                              ? 'bg-[var(--admin-button-text)]/20 text-[var(--admin-button-text)]'
                              : 'bg-[var(--primary)] text-[var(--admin-button-text)]'
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
          <div className="p-3 border-t border-[var(--admin-border)]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-[var(--admin-hover)] hover:text-white transition-colors"
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
          <div className="hidden md:flex items-center justify-between bg-[var(--admin-sidebar)] border-b border-[var(--admin-border)]">
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    {index > 0 && (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    {index === breadcrumbs.length - 1 ? (
                      <span className="font-medium text-white">{crumb.label}</span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-gray-400 hover:text-white transition-colors"
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

// Wrapper component that provides theme context
export function AdminLayout(props: AdminLayoutProps) {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner {...props} />
    </AdminThemeProvider>
  );
}
