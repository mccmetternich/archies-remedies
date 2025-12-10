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
  ExternalLink,
  Navigation,
  Layers,
  Globe,
  Rocket,
  PenSquare,
  MousePointerClick,
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

// Hard-coded colors that CANNOT be overridden
const NAV_COLORS = {
  textPrimary: '#ffffff',
  textSecondary: '#9ca3af',
  textMuted: '#71717a',
  iconColor: '#9ca3af',
};

function AdminLayoutInner({ children, unreadMessages = 0 }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInDraftMode, setIsInDraftMode] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [isTogglingDraft, setIsTogglingDraft] = useState(false);
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

  const handleToggleDraftMode = async () => {
    setIsTogglingDraft(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteInDraftMode: !isInDraftMode }),
      });
      if (res.ok) {
        setIsInDraftMode(!isInDraftMode);
        if (!isInDraftMode) {
          // Switching to draft mode, generate preview token
          generatePreviewToken();
        }
      }
    } catch (error) {
      console.error('Failed to toggle draft mode:', error);
    }
    setIsTogglingDraft(false);
  };

  const navSections: NavSection[] = [
    {
      items: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { href: '/admin/settings', label: 'Site Settings', icon: Settings },
      ],
    },
    {
      title: 'Content',
      items: [
        { href: '/admin/navigation', label: 'Navigation', icon: Navigation },
        { href: '/admin/pages', label: 'Pages', icon: FileText },
        { href: '/admin/products', label: 'Products', icon: Package },
        { href: '/admin/blog', label: 'Blog', icon: PenSquare },
      ],
    },
    {
      title: 'Marketing',
      items: [
        { href: '/admin/inbox', label: 'Inbox', icon: Inbox, badge: unreadMessages },
        { href: '/admin/performance', label: 'Performance', icon: Rocket },
        { href: '/admin/contacts', label: 'Contacts', icon: Users },
        { href: '/admin/settings?tab=popup', label: 'Pop-ups', icon: MousePointerClick },
      ],
    },
    {
      title: 'Widgets',
      items: [
        { href: '/admin/widgets', label: 'Widget Library', icon: Layers },
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
            <span className="font-medium" style={{ color: NAV_COLORS.textPrimary }}>Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            {/* Mobile Draft Toggle */}
            <button
              onClick={handleToggleDraftMode}
              disabled={isTogglingDraft}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isInDraftMode
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-green-500/20 text-green-400'
              )}
            >
              {isInDraftMode ? 'Draft' : 'Live'}
            </button>
            {unreadMessages > 0 && (
              <Link href="/admin/inbox" className="relative p-2">
                <Bell className="w-5 h-5" style={{ color: NAV_COLORS.textSecondary }} />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-xs bg-[var(--primary)] text-[var(--admin-button-text)] rounded-full flex items-center justify-center font-medium">
                  {unreadMessages}
                </span>
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-[var(--admin-hover)]"
              style={{ color: NAV_COLORS.textSecondary }}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Fixed on desktop so footer is always visible */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-[var(--admin-sidebar)] border-r border-[var(--admin-border)] transform transition-transform duration-200 ease-in-out md:translate-x-0 flex flex-col',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--admin-border)]">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-lg font-bold text-[var(--admin-button-text)]">
                A
              </div>
              <div>
                <span className="font-medium block text-sm" style={{ color: NAV_COLORS.textPrimary }}>Archie&apos;s Remedies</span>
                <span className="text-xs" style={{ color: NAV_COLORS.textMuted }}>Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* Navigation - Using INLINE STYLES for text colors */}
          <nav className="flex-1 p-3 pt-4 space-y-6 overflow-y-auto">
            {navSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.separator && (
                  <div className="h-px bg-[var(--admin-border)] mb-4" />
                )}
                {section.title && (
                  <p
                    className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: NAV_COLORS.textMuted }}
                  >
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
                            ? 'bg-[var(--primary)] font-medium'
                            : 'hover:bg-[var(--admin-hover)]'
                        )}
                        style={{
                          color: active ? 'var(--admin-button-text)' : NAV_COLORS.textSecondary
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.color = NAV_COLORS.textPrimary;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.color = NAV_COLORS.textSecondary;
                          }
                        }}
                      >
                        <item.icon
                          className="w-4 h-4"
                          style={{ color: active ? 'var(--admin-button-text)' : NAV_COLORS.iconColor }}
                        />
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
          <div className="p-3 border-t border-[var(--admin-border)] space-y-1">
            <Link
              href="/admin/settings/global"
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors',
                pathname === '/admin/settings/global'
                  ? 'bg-[var(--primary)] font-medium'
                  : 'hover:bg-[var(--admin-hover)]'
              )}
              style={{
                color: pathname === '/admin/settings/global' ? 'var(--admin-button-text)' : NAV_COLORS.textSecondary
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/admin/settings/global') {
                  e.currentTarget.style.color = NAV_COLORS.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/admin/settings/global') {
                  e.currentTarget.style.color = NAV_COLORS.textSecondary;
                }
              }}
            >
              <Globe className="w-4 h-4" style={{ color: pathname === '/admin/settings/global' ? 'var(--admin-button-text)' : NAV_COLORS.iconColor }} />
              Global Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--admin-hover)] transition-colors"
              style={{ color: NAV_COLORS.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = NAV_COLORS.textPrimary}
              onMouseLeave={(e) => e.currentTarget.style.color = NAV_COLORS.textSecondary}
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

        {/* Main Content - Add left margin for fixed sidebar on desktop */}
        <main className="flex-1 min-h-screen md:ml-64">
          {/* Top Horizontal Bar with Breadcrumbs + Draft Toggle + View Site */}
          <div className="hidden md:flex items-center justify-between bg-[var(--admin-sidebar)] border-b border-[var(--admin-border)]">
            {/* Left: Breadcrumbs */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    {index > 0 && (
                      <ChevronRight className="w-4 h-4" style={{ color: NAV_COLORS.textMuted }} />
                    )}
                    {index === breadcrumbs.length - 1 ? (
                      <span className="font-medium" style={{ color: NAV_COLORS.textPrimary }}>{crumb.label}</span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="hover:underline transition-colors"
                        style={{ color: NAV_COLORS.textSecondary }}
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Right: Draft Toggle + View Site Button */}
            <div className="flex items-center gap-4 pr-6">
              {/* Unread Messages Badge */}
              {unreadMessages > 0 && (
                <Link
                  href="/admin/inbox"
                  className="flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-sm hover:bg-[var(--primary)]/20 transition-colors"
                >
                  <Inbox className="w-4 h-4" />
                  <span>{unreadMessages} new</span>
                </Link>
              )}

              {/* Draft Mode Toggle Switch - LEFT=Draft, RIGHT=Live */}
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-medium"
                  style={{ color: isInDraftMode ? '#f97316' : '#71717a' }}
                >
                  Draft
                </span>
                <button
                  onClick={handleToggleDraftMode}
                  disabled={isTogglingDraft}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--admin-sidebar)]',
                    isInDraftMode
                      ? 'bg-orange-500 focus:ring-orange-500'
                      : 'bg-green-500 focus:ring-green-500',
                    isTogglingDraft && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-label={isInDraftMode ? 'Switch to Live' : 'Switch to Draft'}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                      isInDraftMode ? 'translate-x-0' : 'translate-x-6'
                    )}
                  />
                </button>
                <span
                  className="text-xs font-medium"
                  style={{ color: isInDraftMode ? '#71717a' : '#22c55e' }}
                >
                  Live
                </span>
              </div>

              {/* View Site Button */}
              <button
                onClick={handleViewSite}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
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
