'use client';

import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import Image from 'next/image';
import {
  Plus,
  Loader2,
  GripVertical,
  Edit,
  Trash2,
  Save,
  X,
  Menu,
  Link as LinkIcon,
  ChevronDown,
  Megaphone,
  Check,
  Layout,
  MousePointer,
  Image as ImageIcon,
  FileText,
  AlignLeft,
  AlignCenter,
  Smartphone,
  Monitor,
  Upload,
  Package,
  Star,
  Video,
  // Footer-related icons
  Mail,
  Shield,
  Instagram,
  Facebook,
  ExternalLink,
  Droplet,
  Flag,
  Award,
  Sun,
  Moon,
  Palette,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { InternalLinkSelector } from '@/components/admin/internal-link-selector';

// Footer-specific interfaces
interface FooterLinkItem {
  id: string;
  label: string;
  url: string;
  column: string;
  isExternal: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface EmailSignupSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  placeholder: string;
  buttonText: string;
  successMessage: string;
}

interface ColumnTitles {
  column1: string;
  column2: string;
  column3: string;
  column4: string;
}

interface Certification {
  icon: string;
  iconUrl: string | null;
  label: string;
}

interface LegalLinks {
  privacyUrl: string;
  privacyLabel: string;
  termsUrl: string;
  termsLabel: string;
}

interface NavItem {
  id: string;
  label: string;
  url: string;
  type: string;
  parentId: string | null;
  imageUrl: string | null;
  description: string | null;
  isActive: boolean | null;
  sortOrder: number | null;
}

interface FooterLink {
  id: string;
  label: string;
  url: string;
  column: string;
  isActive: boolean | null;
  sortOrder: number | null;
}

interface BumperSettings {
  bumperEnabled: boolean;
  bumperText: string;
  bumperLinkUrl: string;
  bumperLinkText: string;
  bumperTheme: 'light' | 'dark';
}

interface GlobalNavSettings {
  logoPosition: 'left' | 'center';
  logoPositionMobile: 'left' | 'center';
  ctaEnabled: boolean;
  ctaText: string;
  ctaUrl: string;
  tile1ProductId: string | null;
  tile1Title: string | null;
  tile1Subtitle: string | null;
  tile1Badge: string | null;
  tile1BadgeEmoji: string | null;
  tile1BadgeBgColor: string;
  tile1BadgeTextColor: string;
  tile1ImageUrl: string | null;
  tile1HoverImageUrl: string | null;
  tile2ProductId: string | null;
  tile2Title: string | null;
  tile2Subtitle: string | null;
  tile2Badge: string | null;
  tile2BadgeEmoji: string | null;
  tile2BadgeBgColor: string;
  tile2BadgeTextColor: string;
  tile2ImageUrl: string | null;
  tile2HoverImageUrl: string | null;
  // Marketing tile (formerly Clean Formulas)
  marketingTileTitle: string;
  marketingTileDescription: string;
  marketingTileBadge1: string;
  marketingTileBadge2: string;
  marketingTileBadge3: string;
  marketingTileCtaEnabled: boolean;
  marketingTileCtaEnabledDesktop: boolean;
  marketingTileCtaEnabledMobile: boolean;
  marketingTileCtaText: string | null;
  marketingTileCtaUrl: string | null;
  marketingTileRotatingBadgeEnabled: boolean;
  marketingTileRotatingBadgeEnabledDesktop: boolean;
  marketingTileRotatingBadgeEnabledMobile: boolean;
  marketingTileRotatingBadgeUrl: string | null;
  marketingTileHideOnMobile: boolean;
  // Legacy aliases for backwards compatibility
  cleanFormulasTitle?: string;
  cleanFormulasDescription?: string;
  cleanFormulasCtaEnabled?: boolean;
  cleanFormulasCtaText?: string | null;
  cleanFormulasCtaUrl?: string | null;
  cleanFormulasBadgeEnabled?: boolean;
  cleanFormulasBadgeUrl?: string | null;
}

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  heroImageUrl: string | null;
  shortDescription: string | null;
  badge: string | null;
  badgeEmoji: string | null;
  rating: number | null;
  reviewCount: number | null;
}

interface PageOption {
  id: string;
  slug: string;
  title: string;
  showInNav: boolean | null;
  navOrder: number | null;
  navPosition: string | null;
  navShowOnDesktop: boolean | null;
  navShowOnMobile: boolean | null;
}

// Special "Shop" nav item that represents the dropdown
interface ShopNavItem {
  id: 'shop';
  label: 'Shop';
  type: 'dropdown';
  navPosition: string;
  navOrder: number;
}

export default function NavigationPage() {
  // Main tabs: header (Global Navigation), footer, bumper (Announcement)
  const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'bumper'>('header');
  // Sub-tabs within Global Navigation
  const [navSubTab, setNavSubTab] = useState<'settings' | 'pages' | 'dropdown'>('settings');
  // Sub-tabs within Footer
  const [footerSubTab, setFooterSubTab] = useState<'theme' | 'signup' | 'main' | 'bottom'>('main');

  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [bumperSettings, setBumperSettings] = useState<BumperSettings>({
    bumperEnabled: false,
    bumperText: '',
    bumperLinkUrl: '',
    bumperLinkText: '',
    bumperTheme: 'light',
  });

  // Footer settings state
  const [footerTheme, setFooterTheme] = useState<'dark' | 'light'>('dark');
  const [footerLogoUrl, setFooterLogoUrl] = useState<string | null>(null);
  const [fullWidthLogoUrl, setFullWidthLogoUrl] = useState<string | null>(null);
  const [massiveLogoOpacity, setMassiveLogoOpacity] = useState<number>(15);
  const [socialLinks, setSocialLinks] = useState({
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    amazonStoreUrl: '',
  });
  const [emailSignup, setEmailSignup] = useState<EmailSignupSettings>({
    enabled: true,
    title: "Join the Archie's Community",
    subtitle: 'Expert eye care tips, new product drops, and wellness inspiration. No spam, ever.',
    placeholder: 'Enter your email',
    buttonText: 'Sign Up',
    successMessage: "You're on the list.",
  });
  const [columnTitles, setColumnTitles] = useState<ColumnTitles>({
    column1: 'Shop',
    column2: 'Learn',
    column3: 'Support',
    column4: 'Certifications',
  });
  const [certifications, setCertifications] = useState<Certification[]>([
    { icon: 'droplet', iconUrl: null, label: 'Preservative Free' },
    { icon: 'flag', iconUrl: null, label: 'Made in USA' },
    { icon: 'rabbit', iconUrl: null, label: 'Cruelty Free' },
  ]);
  const [legalLinks, setLegalLinks] = useState<LegalLinks>({
    privacyUrl: '/privacy',
    privacyLabel: 'Privacy Policy',
    termsUrl: '/terms',
    termsLabel: 'Terms of Service',
  });
  const [footerLinksByColumn, setFooterLinksByColumn] = useState<Record<string, FooterLinkItem[]>>({
    Shop: [],
    Learn: [],
    Support: [],
  });
  const [siteName, setSiteName] = useState("Archie's Remedies");
  const [editingFooterLink, setEditingFooterLink] = useState<FooterLinkItem | null>(null);
  const [editFooterColumn, setEditFooterColumn] = useState<string>('');
  const [globalNavSettings, setGlobalNavSettings] = useState<GlobalNavSettings>({
    logoPosition: 'left',
    logoPositionMobile: 'left',
    ctaEnabled: true,
    ctaText: 'Shop Now',
    ctaUrl: '/products/eye-drops',
    tile1ProductId: null,
    tile1Title: null,
    tile1Subtitle: null,
    tile1Badge: null,
    tile1BadgeEmoji: null,
    tile1BadgeBgColor: '#1a1a1a',
    tile1BadgeTextColor: '#ffffff',
    tile1ImageUrl: null,
    tile1HoverImageUrl: null,
    tile2ProductId: null,
    tile2Title: null,
    tile2Subtitle: null,
    tile2Badge: null,
    tile2BadgeEmoji: null,
    tile2BadgeBgColor: '#bbdae9',
    tile2BadgeTextColor: '#1a1a1a',
    tile2ImageUrl: null,
    tile2HoverImageUrl: null,
    marketingTileTitle: 'Clean Formulas',
    marketingTileDescription: 'No preservatives, phthalates, parabens, or sulfates.',
    marketingTileBadge1: 'Preservative-Free',
    marketingTileBadge2: 'Paraben-Free',
    marketingTileBadge3: 'Sulfate-Free',
    marketingTileCtaEnabled: false,
    marketingTileCtaEnabledDesktop: true,
    marketingTileCtaEnabledMobile: true,
    marketingTileCtaText: null,
    marketingTileCtaUrl: null,
    marketingTileRotatingBadgeEnabled: false,
    marketingTileRotatingBadgeEnabledDesktop: true,
    marketingTileRotatingBadgeEnabledMobile: true,
    marketingTileRotatingBadgeUrl: null,
    marketingTileHideOnMobile: false,
  });
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [pagesList, setPagesList] = useState<PageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingPageId, setDraggingPageId] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<NavItem | FooterLink>>({});
  const [editType, setEditType] = useState<'nav' | 'footer'>('nav');

  // Track original state for change detection
  const [originalNavItems, setOriginalNavItems] = useState<NavItem[]>([]);
  const [originalFooterLinks, setOriginalFooterLinks] = useState<FooterLink[]>([]);
  const [originalBumperSettings, setOriginalBumperSettings] = useState<BumperSettings>({
    bumperEnabled: false,
    bumperText: '',
    bumperLinkUrl: '',
    bumperLinkText: '',
    bumperTheme: 'light',
  });
  const [originalGlobalNavSettings, setOriginalGlobalNavSettings] = useState<GlobalNavSettings | null>(null);
  const [originalPagesList, setOriginalPagesList] = useState<PageOption[]>([]);
  const [originalFooterState, setOriginalFooterState] = useState<string>('');

  // Check if there are unsaved changes
  const currentFooterState = JSON.stringify({
    footerTheme,
    footerLogoUrl,
    fullWidthLogoUrl,
    massiveLogoOpacity,
    socialLinks,
    emailSignup,
    columnTitles,
    certifications,
    legalLinks,
    footerLinksByColumn,
  });
  const hasChanges =
    JSON.stringify(navItems) !== JSON.stringify(originalNavItems) ||
    JSON.stringify(footerLinks) !== JSON.stringify(originalFooterLinks) ||
    JSON.stringify(bumperSettings) !== JSON.stringify(originalBumperSettings) ||
    JSON.stringify(globalNavSettings) !== JSON.stringify(originalGlobalNavSettings) ||
    JSON.stringify(pagesList) !== JSON.stringify(originalPagesList) ||
    currentFooterState !== originalFooterState;

  useEffect(() => {
    fetchNavigation();
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const res = await fetch('/api/admin/footer');
      const data = await res.json();

      // Theme and logo settings
      setFooterTheme(data.footerTheme || 'dark');
      setFooterLogoUrl(data.footerLogoUrl || null);
      setFullWidthLogoUrl(data.fullWidthLogoUrl || data.massiveFooterLogoUrl || null);
      setMassiveLogoOpacity(data.massiveFooterLogoOpacity ?? 15);

      // Social links
      setSocialLinks({
        instagramUrl: data.instagramUrl || '',
        facebookUrl: data.facebookUrl || '',
        tiktokUrl: data.tiktokUrl || '',
        amazonStoreUrl: data.amazonStoreUrl || '',
      });

      if (data.emailSignup) setEmailSignup(data.emailSignup);
      if (data.columnTitles) setColumnTitles(data.columnTitles);
      if (data.certifications) setCertifications(data.certifications);
      if (data.legalLinks) setLegalLinks(data.legalLinks);
      if (data.siteName) setSiteName(data.siteName);

      // Organize links by column
      const linksByColumn: Record<string, FooterLinkItem[]> = {
        [data.columnTitles?.column1 || 'Shop']: [],
        [data.columnTitles?.column2 || 'Learn']: [],
        [data.columnTitles?.column3 || 'Support']: [],
      };

      if (data.allLinks) {
        for (const link of data.allLinks) {
          const col = link.column || 'Shop';
          if (!linksByColumn[col]) {
            linksByColumn[col] = [];
          }
          linksByColumn[col].push(link);
        }
      }
      setFooterLinksByColumn(linksByColumn);

      // Store original state
      setOriginalFooterState(JSON.stringify({
        footerTheme: data.footerTheme || 'dark',
        footerLogoUrl: data.footerLogoUrl || null,
        fullWidthLogoUrl: data.fullWidthLogoUrl || data.massiveFooterLogoUrl || null,
        massiveLogoOpacity: data.massiveFooterLogoOpacity ?? 15,
        socialLinks: {
          instagramUrl: data.instagramUrl || '',
          facebookUrl: data.facebookUrl || '',
          tiktokUrl: data.tiktokUrl || '',
          amazonStoreUrl: data.amazonStoreUrl || '',
        },
        emailSignup: data.emailSignup || emailSignup,
        columnTitles: data.columnTitles || columnTitles,
        certifications: data.certifications || certifications,
        legalLinks: data.legalLinks || legalLinks,
        footerLinksByColumn: linksByColumn,
      }));
    } catch (error) {
      console.error('Failed to fetch footer data:', error);
    }
  };

  const fetchNavigation = async () => {
    try {
      const res = await fetch('/api/admin/navigation');
      const data = await res.json();
      const nav = data.navigation || [];
      const footer = data.footer || [];
      const bumper = {
        bumperEnabled: data.bumper?.bumperEnabled ?? false,
        bumperText: data.bumper?.bumperText ?? '',
        bumperLinkUrl: data.bumper?.bumperLinkUrl ?? '',
        bumperLinkText: data.bumper?.bumperLinkText ?? '',
        bumperTheme: (data.bumper?.bumperTheme ?? 'light') as 'light' | 'dark',
      };
      const globalNav = data.globalNav ? {
        logoPosition: data.globalNav.logoPosition || 'left',
        logoPositionMobile: data.globalNav.logoPositionMobile || 'left',
        ctaEnabled: data.globalNav.ctaEnabled ?? true,
        ctaText: data.globalNav.ctaText || 'Shop Now',
        ctaUrl: data.globalNav.ctaUrl || '/products/eye-drops',
        tile1ProductId: data.globalNav.tile1ProductId || null,
        tile1Title: data.globalNav.tile1Title || null,
        tile1Subtitle: data.globalNav.tile1Subtitle || null,
        tile1Badge: data.globalNav.tile1Badge || null,
        tile1BadgeEmoji: data.globalNav.tile1BadgeEmoji || null,
        tile1BadgeBgColor: data.globalNav.tile1BadgeBgColor || '#1a1a1a',
        tile1BadgeTextColor: data.globalNav.tile1BadgeTextColor || '#ffffff',
        tile1ImageUrl: data.globalNav.tile1ImageUrl || null,
        tile1HoverImageUrl: data.globalNav.tile1HoverImageUrl || null,
        tile2ProductId: data.globalNav.tile2ProductId || null,
        tile2Title: data.globalNav.tile2Title || null,
        tile2Subtitle: data.globalNav.tile2Subtitle || null,
        tile2Badge: data.globalNav.tile2Badge || null,
        tile2BadgeEmoji: data.globalNav.tile2BadgeEmoji || null,
        tile2BadgeBgColor: data.globalNav.tile2BadgeBgColor || '#bbdae9',
        tile2BadgeTextColor: data.globalNav.tile2BadgeTextColor || '#1a1a1a',
        tile2ImageUrl: data.globalNav.tile2ImageUrl || null,
        tile2HoverImageUrl: data.globalNav.tile2HoverImageUrl || null,
        marketingTileTitle: data.globalNav.marketingTileTitle || data.globalNav.cleanFormulasTitle || 'Clean Formulas',
        marketingTileDescription: data.globalNav.marketingTileDescription || data.globalNav.cleanFormulasDescription || 'No preservatives, phthalates, parabens, or sulfates.',
        marketingTileBadge1: data.globalNav.marketingTileBadge1 || 'Preservative-Free',
        marketingTileBadge2: data.globalNav.marketingTileBadge2 || 'Paraben-Free',
        marketingTileBadge3: data.globalNav.marketingTileBadge3 || 'Sulfate-Free',
        marketingTileCtaEnabled: data.globalNav.marketingTileCtaEnabled ?? data.globalNav.cleanFormulasCtaEnabled ?? false,
        marketingTileCtaEnabledDesktop: data.globalNav.marketingTileCtaEnabledDesktop ?? true,
        marketingTileCtaEnabledMobile: data.globalNav.marketingTileCtaEnabledMobile ?? true,
        marketingTileCtaText: data.globalNav.marketingTileCtaText || data.globalNav.cleanFormulasCtaText || null,
        marketingTileCtaUrl: data.globalNav.marketingTileCtaUrl || data.globalNav.cleanFormulasCtaUrl || null,
        marketingTileRotatingBadgeEnabled: data.globalNav.marketingTileRotatingBadgeEnabled ?? data.globalNav.cleanFormulasBadgeEnabled ?? false,
        marketingTileRotatingBadgeEnabledDesktop: data.globalNav.marketingTileRotatingBadgeEnabledDesktop ?? true,
        marketingTileRotatingBadgeEnabledMobile: data.globalNav.marketingTileRotatingBadgeEnabledMobile ?? true,
        marketingTileRotatingBadgeUrl: data.globalNav.marketingTileRotatingBadgeUrl || data.globalNav.cleanFormulasBadgeUrl || null,
        marketingTileHideOnMobile: data.globalNav.marketingTileHideOnMobile ?? false,
      } : globalNavSettings;

      setNavItems(nav);
      setFooterLinks(footer);
      setBumperSettings(bumper);
      setGlobalNavSettings(globalNav);
      setProducts(data.products || []);
      setPagesList(data.pages || []);

      // Store original state
      setOriginalNavItems(JSON.parse(JSON.stringify(nav)));
      setOriginalFooterLinks(JSON.parse(JSON.stringify(footer)));
      setOriginalBumperSettings({ ...bumper });
      setOriginalGlobalNavSettings(JSON.parse(JSON.stringify(globalNav)));
      setOriginalPagesList(JSON.parse(JSON.stringify(data.pages || [])));
    } catch (error) {
      console.error('Failed to fetch navigation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save navigation data
      await fetch('/api/admin/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          navigation: navItems,
          footer: footerLinks,
          bumper: bumperSettings,
          globalNav: globalNavSettings,
          pageNavUpdates: pagesList.map(p => ({
            id: p.id,
            showInNav: p.showInNav,
            navOrder: p.navOrder,
            navPosition: p.navPosition,
            navShowOnDesktop: p.navShowOnDesktop,
            navShowOnMobile: p.navShowOnMobile,
          })),
        }),
      });

      // Save footer data
      await fetch('/api/admin/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          footerTheme,
          footerLogoUrl,
          fullWidthLogoUrl,
          massiveLogoOpacity,
          socialLinks,
          emailSignup,
          columnTitles,
          certifications,
          legalLinks,
          links: footerLinksByColumn,
        }),
      });

      // Update original state after successful save
      setOriginalNavItems(JSON.parse(JSON.stringify(navItems)));
      setOriginalFooterLinks(JSON.parse(JSON.stringify(footerLinks)));
      setOriginalBumperSettings({ ...bumperSettings });
      setOriginalGlobalNavSettings(JSON.parse(JSON.stringify(globalNavSettings)));
      setOriginalPagesList(JSON.parse(JSON.stringify(pagesList)));
      setOriginalFooterState(currentFooterState);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNav = () => {
    const newItem: NavItem = {
      id: `new-${Date.now()}`,
      label: '',
      url: '',
      type: 'link',
      parentId: null,
      imageUrl: null,
      description: null,
      isActive: true,
      sortOrder: navItems.length,
    };
    setNavItems([...navItems, newItem]);
    setEditingId(newItem.id);
    setEditForm(newItem);
    setEditType('nav');
  };

  const handleAddFooter = () => {
    const newItem: FooterLink = {
      id: `new-${Date.now()}`,
      label: '',
      url: '',
      column: 'Shop',
      isActive: true,
      sortOrder: footerLinks.length,
    };
    setFooterLinks([...footerLinks, newItem]);
    setEditingId(newItem.id);
    setEditForm(newItem);
    setEditType('footer');
  };

  const handleEditNav = (item: NavItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    setEditType('nav');
  };

  const handleEditFooter = (item: FooterLink) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    setEditType('footer');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (editType === 'nav') {
      setNavItems(navItems.map((n) => (n.id === editingId ? { ...n, ...editForm } as NavItem : n)));
    } else {
      setFooterLinks(footerLinks.map((f) => (f.id === editingId ? { ...f, ...editForm } as FooterLink : f)));
    }
    setEditingId(null);
    setEditForm({});
  };

  const handleDeleteNav = (id: string) => {
    if (confirm('Delete this navigation item?')) {
      setNavItems(navItems.filter((n) => n.id !== id));
    }
  };

  const handleDeleteFooter = (id: string) => {
    if (confirm('Delete this footer link?')) {
      setFooterLinks(footerLinks.filter((f) => f.id !== id));
    }
  };

  const handleReorderNav = (newOrder: NavItem[]) => {
    setNavItems(newOrder.map((item, index) => ({ ...item, sortOrder: index })));
  };

  const handleReorderFooter = (newOrder: FooterLink[]) => {
    setFooterLinks(newOrder.map((item, index) => ({ ...item, sortOrder: index })));
  };

  const handleReorderPages = (newOrder: PageOption[]) => {
    setPagesList(newOrder.map((item, index) => ({ ...item, navOrder: index })));
  };

  // Footer link handlers
  const handleAddFooterColumnLink = (column: string) => {
    const newLink: FooterLinkItem = {
      id: `new-${Date.now()}`,
      label: '',
      url: '',
      column,
      isExternal: false,
      isActive: true,
      sortOrder: (footerLinksByColumn[column]?.length || 0),
    };
    setEditingFooterLink(newLink);
    setEditFooterColumn(column);
  };

  const handleEditFooterColumnLink = (link: FooterLinkItem, column: string) => {
    setEditingFooterLink({ ...link });
    setEditFooterColumn(column);
  };

  const handleSaveFooterColumnLink = () => {
    if (!editingFooterLink || !editFooterColumn) return;

    const columnLinks = footerLinksByColumn[editFooterColumn] || [];
    const existingIndex = columnLinks.findIndex(l => l.id === editingFooterLink.id);

    if (existingIndex >= 0) {
      columnLinks[existingIndex] = editingFooterLink;
    } else {
      columnLinks.push(editingFooterLink);
    }

    setFooterLinksByColumn({
      ...footerLinksByColumn,
      [editFooterColumn]: columnLinks,
    });

    setEditingFooterLink(null);
    setEditFooterColumn('');
  };

  const handleDeleteFooterColumnLink = (linkId: string, column: string) => {
    if (!confirm('Delete this link?')) return;

    setFooterLinksByColumn({
      ...footerLinksByColumn,
      [column]: (footerLinksByColumn[column] || []).filter(l => l.id !== linkId),
    });
  };

  const handleReorderFooterColumnLinks = (column: string, newOrder: FooterLinkItem[]) => {
    setFooterLinksByColumn({
      ...footerLinksByColumn,
      [column]: newOrder.map((item, index) => ({ ...item, sortOrder: index })),
    });
  };

  // Certification icon helper
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'droplet':
        return <Droplet className="w-4 h-4 text-white/80" />;
      case 'flag':
        return <Flag className="w-4 h-4 text-white/80" />;
      case 'rabbit':
        return (
          <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 4c-2 0-3.5 1-4.5 2.5S6 9.5 6 11c0 2 1 3.5 2 4.5s2 2 2 3.5v1h4v-1c0-1.5 1-2.5 2-3.5s2-2.5 2-4.5c0-1.5-.5-3-1.5-4.5S14 4 12 4z" />
            <path d="M10 8.5c-.5-.5-1.5-.5-2.5.5M14 8.5c.5-.5 1.5-.5 2.5.5" />
          </svg>
        );
      default:
        return <Award className="w-4 h-4 text-white/80" />;
    }
  };

  // Drag handlers for available pages
  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    e.dataTransfer.setData('pageId', pageId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingPageId(pageId);
  };

  const handleDragEnd = () => {
    setDraggingPageId(null);
    setDragOverSection(null);
  };

  const handleDragOver = (e: React.DragEvent, section: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSection(section);
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
  };

  const handleDrop = (e: React.DragEvent, targetPosition: 'left' | 'center' | 'right') => {
    e.preventDefault();
    const pageId = e.dataTransfer.getData('pageId');
    if (!pageId) return;

    const maxOrder = Math.max(0, ...pagesList.filter(p => p.showInNav && p.navPosition === targetPosition).map(p => p.navOrder || 0));
    setPagesList(pagesList.map(p =>
      p.id === pageId ? { ...p, showInNav: true, navOrder: maxOrder + 1, navPosition: targetPosition, navShowOnDesktop: true, navShowOnMobile: true } : p
    ));
    setDraggingPageId(null);
    setDragOverSection(null);
  };

  const [saved, setSaved] = useState(false);

  const handleSaveWithFeedback = async () => {
    await handleSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Get selected product for preview
  const getProductById = (id: string | null) => products.find(p => p.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">Navigation</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1">
            Manage global navigation, dropdown, pages, footer, and announcement bar
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSaveWithFeedback}
            disabled={saving}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
              saved
                ? 'bg-green-500 text-white'
                : 'bg-[var(--primary)] text-[var(--admin-button-text)] hover:bg-[var(--primary-dark)]',
              saving && 'opacity-50 cursor-not-allowed'
            )}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 bg-[var(--admin-input)] rounded-xl p-1 border border-[var(--admin-border)] overflow-x-auto">
        <button
          onClick={() => setActiveTab('header')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'header'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <Layout className="w-4 h-4" />
          Global Navigation
        </button>
        <button
          onClick={() => setActiveTab('footer')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'footer'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <Shield className="w-4 h-4" />
          Global Footer
        </button>
        <button
          onClick={() => setActiveTab('bumper')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            activeTab === 'bumper'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <Megaphone className="w-4 h-4" />
          Announcement Bar
        </button>
      </div>

      {/* Global Navigation Sub-tabs */}
      {activeTab === 'header' && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setNavSubTab('settings')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap border',
              navSubTab === 'settings'
                ? 'bg-[var(--admin-hover)] border-[var(--admin-border)] text-[var(--admin-text-primary)]'
                : 'border-transparent text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
            )}
          >
            Header Settings
          </button>
          <button
            onClick={() => setNavSubTab('pages')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap border',
              navSubTab === 'pages'
                ? 'bg-[var(--admin-hover)] border-[var(--admin-border)] text-[var(--admin-text-primary)]'
                : 'border-transparent text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
            )}
          >
            Navigation Links
          </button>
          <button
            onClick={() => setNavSubTab('dropdown')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap border',
              navSubTab === 'dropdown'
                ? 'bg-[var(--admin-hover)] border-[var(--admin-border)] text-[var(--admin-text-primary)]'
                : 'border-transparent text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
            )}
          >
            Dropdown Menu
          </button>
        </div>
      )}

      {/* Footer Sub-tabs - Order: Footer Links, Email Section, Legal Links, Theme & Branding */}
      {activeTab === 'footer' && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFooterSubTab('main')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap border',
              footerSubTab === 'main'
                ? 'bg-[var(--admin-hover)] border-[var(--admin-border)] text-[var(--admin-text-primary)]'
                : 'border-transparent text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
            )}
          >
            <LinkIcon className="w-4 h-4" />
            Footer Links
          </button>
          <button
            onClick={() => setFooterSubTab('signup')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap border',
              footerSubTab === 'signup'
                ? 'bg-[var(--admin-hover)] border-[var(--admin-border)] text-[var(--admin-text-primary)]'
                : 'border-transparent text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
            )}
          >
            <Mail className="w-4 h-4" />
            Email Section
          </button>
          <button
            onClick={() => setFooterSubTab('bottom')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap border',
              footerSubTab === 'bottom'
                ? 'bg-[var(--admin-hover)] border-[var(--admin-border)] text-[var(--admin-text-primary)]'
                : 'border-transparent text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
            )}
          >
            <FileText className="w-4 h-4" />
            Legal Links
          </button>
          <button
            onClick={() => setFooterSubTab('theme')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap border',
              footerSubTab === 'theme'
                ? 'bg-[var(--admin-hover)] border-[var(--admin-border)] text-[var(--admin-text-primary)]'
                : 'border-transparent text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
            )}
          >
            <Palette className="w-4 h-4" />
            Theme & Branding
          </button>
        </div>
      )}

      {/* ============================================
          HEADER BAR SETTINGS (Sub-tab: settings)
          ============================================ */}
      {activeTab === 'header' && navSubTab === 'settings' && (
        <div className="space-y-6">
          {/* Logo Position */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Logo Position</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Control where the logo appears in the navigation bar
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* Desktop */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)] mb-3">
                  <Monitor className="w-4 h-4" />
                  Desktop
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setGlobalNavSettings({ ...globalNavSettings, logoPosition: 'left' })}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                      globalNavSettings.logoPosition === 'left'
                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]"
                    )}
                  >
                    <AlignLeft className="w-4 h-4" />
                    <span className="text-sm text-[var(--admin-text-primary)]">Left</span>
                  </button>
                  <button
                    onClick={() => setGlobalNavSettings({ ...globalNavSettings, logoPosition: 'center' })}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                      globalNavSettings.logoPosition === 'center'
                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]"
                    )}
                  >
                    <AlignCenter className="w-4 h-4" />
                    <span className="text-sm text-[var(--admin-text-primary)]">Center</span>
                  </button>
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)] mb-3">
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setGlobalNavSettings({ ...globalNavSettings, logoPositionMobile: 'left' })}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                      globalNavSettings.logoPositionMobile === 'left'
                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]"
                    )}
                  >
                    <AlignLeft className="w-4 h-4" />
                    <span className="text-sm text-[var(--admin-text-primary)]">Left</span>
                  </button>
                  <button
                    onClick={() => setGlobalNavSettings({ ...globalNavSettings, logoPositionMobile: 'center' })}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                      globalNavSettings.logoPositionMobile === 'center'
                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]"
                    )}
                  >
                    <AlignCenter className="w-4 h-4" />
                    <span className="text-sm text-[var(--admin-text-primary)]">Center</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">CTA Button</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Configure the main call-to-action button in the header
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* Enable Toggle */}
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  !globalNavSettings.ctaEnabled ? "text-red-400" : "text-[var(--admin-text-muted)]"
                )}>
                  Disabled
                </span>
                <button
                  onClick={() => setGlobalNavSettings({ ...globalNavSettings, ctaEnabled: !globalNavSettings.ctaEnabled })}
                  className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--admin-bg)]"
                  style={{
                    backgroundColor: globalNavSettings.ctaEnabled ? '#22c55e' : '#ef4444'
                  }}
                >
                  <span
                    className={cn(
                      "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg",
                      globalNavSettings.ctaEnabled ? "translate-x-9" : "translate-x-1"
                    )}
                  />
                </button>
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  globalNavSettings.ctaEnabled ? "text-green-400" : "text-[var(--admin-text-muted)]"
                )}>
                  Enabled
                </span>
              </div>

              {/* Button Text & URL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Button Text</label>
                  <input
                    value={globalNavSettings.ctaText}
                    onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, ctaText: e.target.value })}
                    placeholder="Shop Now"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Button URL</label>
                  <InternalLinkSelector
                    value={globalNavSettings.ctaUrl}
                    onChange={(value) => setGlobalNavSettings({ ...globalNavSettings, ctaUrl: value })}
                    placeholder="Select page or enter URL"
                  />
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Preview</label>
                <div className="p-4 rounded-lg bg-[var(--admin-hover)] flex justify-center">
                  <div className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full text-lg font-semibold">
                    {globalNavSettings.ctaText || 'Shop Now'}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          SHOP DROPDOWN SETTINGS (Sub-tab: dropdown)
          ============================================ */}
      {activeTab === 'header' && navSubTab === 'dropdown' && (
        <div className="space-y-6">
          {/* Product Tile 1 - Side by Side */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Product Tile 1 (Left)</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                First product shown in the dropdown menu
              </p>
            </div>
            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left side - Form fields */}
                <div className="space-y-4">
                  {/* Product Selector */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Select Product</label>
                    <select
                      value={globalNavSettings.tile1ProductId || ''}
                      onChange={(e) => {
                        const product = products.find(p => p.id === e.target.value);
                        setGlobalNavSettings({
                          ...globalNavSettings,
                          tile1ProductId: e.target.value || null,
                          tile1Title: product?.name || null,
                          tile1Subtitle: product?.shortDescription || null,
                          tile1Badge: product?.badge || null,
                          tile1BadgeEmoji: product?.badgeEmoji || null,
                        });
                      }}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    >
                      <option value="">Select a product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Override Title */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Title Override <span className="text-[var(--admin-text-muted)]">(optional)</span>
                    </label>
                    <input
                      value={globalNavSettings.tile1Title || ''}
                      onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1Title: e.target.value || null })}
                      placeholder={getProductById(globalNavSettings.tile1ProductId)?.name || 'Product name'}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>

                  {/* Override Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Subtitle Override <span className="text-[var(--admin-text-muted)]">(optional)</span>
                    </label>
                    <input
                      value={globalNavSettings.tile1Subtitle || ''}
                      onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1Subtitle: e.target.value || null })}
                      placeholder={getProductById(globalNavSettings.tile1ProductId)?.shortDescription || 'Product description'}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>

                  {/* Badge */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-[80px_1fr] gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Emoji</label>
                        <input
                          value={globalNavSettings.tile1BadgeEmoji || ''}
                          onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1BadgeEmoji: e.target.value || null })}
                          placeholder="🔥"
                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors text-center text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Badge Text</label>
                        <input
                          value={globalNavSettings.tile1Badge || ''}
                          onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1Badge: e.target.value || null })}
                          placeholder="Bestseller"
                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                      </div>
                    </div>
                    {/* Badge Colors - only show if badge text or emoji is set */}
                    {(globalNavSettings.tile1Badge || globalNavSettings.tile1BadgeEmoji) && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">Background</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={globalNavSettings.tile1BadgeBgColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1BadgeBgColor: e.target.value })}
                              className="w-10 h-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={globalNavSettings.tile1BadgeBgColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1BadgeBgColor: e.target.value })}
                              placeholder="#1a1a1a"
                              className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">Text Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={globalNavSettings.tile1BadgeTextColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1BadgeTextColor: e.target.value })}
                              className="w-10 h-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={globalNavSettings.tile1BadgeTextColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile1BadgeTextColor: e.target.value })}
                              placeholder="#ffffff"
                              className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary Image Override */}
                  <div className="pt-4 border-t border-[var(--admin-border)]">
                    <MediaPickerButton
                      label="Primary Image/Video Override"
                      value={globalNavSettings.tile1ImageUrl}
                      onChange={(url) => setGlobalNavSettings({ ...globalNavSettings, tile1ImageUrl: url || null })}
                      helpText="Leave blank to use product image. Supports images and MP4/WebM videos."
                      folder="products"
                      acceptVideo={true}
                    />
                  </div>

                  {/* Hover Image */}
                  <div>
                    <MediaPickerButton
                      label="Hover Image/Video"
                      value={globalNavSettings.tile1HoverImageUrl}
                      onChange={(url) => setGlobalNavSettings({ ...globalNavSettings, tile1HoverImageUrl: url || null })}
                      helpText="Shown when users hover over the tile. Supports images and MP4/WebM videos."
                      folder="products"
                      acceptVideo={true}
                    />
                  </div>
                </div>

                {/* Right side - Live Preview */}
                <div className="lg:sticky lg:top-6">
                  {/* Mobile separator */}
                  <div className="lg:hidden border-t border-[var(--admin-border)] pt-6 mt-2 mb-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">Preview</h4>
                  </div>
                  <label className="hidden lg:block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Live Preview</label>
                  <div className="p-5 rounded-2xl bg-white border border-[var(--admin-border)] hover:shadow-md transition-all duration-300 group/tile1">
                    <div className="relative mb-4">
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#f5f5f0] relative">
                        {(() => {
                          const primaryUrl = globalNavSettings.tile1ImageUrl || getProductById(globalNavSettings.tile1ProductId)?.heroImageUrl;
                          const hoverUrl = globalNavSettings.tile1HoverImageUrl;
                          const primaryIsVideo = primaryUrl?.match(/\.(mp4|webm|mov)$/i);
                          const hoverIsVideo = hoverUrl?.match(/\.(mp4|webm|mov)$/i);

                          if (!primaryUrl) {
                            return (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-[var(--admin-text-muted)]" />
                              </div>
                            );
                          }

                          return (
                            <>
                              {/* Primary Media */}
                              {primaryIsVideo ? (
                                <video
                                  src={primaryUrl}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className={`w-full h-full object-cover transition-opacity duration-300 ${hoverUrl ? 'group-hover/tile1:opacity-0' : ''}`}
                                />
                              ) : (
                                <Image
                                  src={primaryUrl}
                                  alt=""
                                  width={300}
                                  height={300}
                                  className={`w-full h-full object-cover transition-opacity duration-300 ${hoverUrl ? 'group-hover/tile1:opacity-0' : 'group-hover/tile1:scale-105'}`}
                                />
                              )}
                              {/* Hover Media */}
                              {hoverUrl && (
                                hoverIsVideo ? (
                                  <video
                                    src={hoverUrl}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile1:opacity-100 transition-opacity duration-300"
                                  />
                                ) : (
                                  <Image
                                    src={hoverUrl}
                                    alt=""
                                    width={300}
                                    height={300}
                                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile1:opacity-100 transition-opacity duration-300"
                                  />
                                )
                              )}
                            </>
                          );
                        })()}
                      </div>
                      {(globalNavSettings.tile1Badge || globalNavSettings.tile1BadgeEmoji) && (
                        <span
                          className="absolute top-3 right-3 text-sm px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5"
                          style={{
                            backgroundColor: globalNavSettings.tile1BadgeBgColor,
                            color: globalNavSettings.tile1BadgeTextColor
                          }}
                        >
                          {globalNavSettings.tile1BadgeEmoji} {globalNavSettings.tile1Badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm text-[#1a1a1a] font-medium">{(getProductById(globalNavSettings.tile1ProductId)?.reviewCount || 2900).toLocaleString()}+</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#7CB4B8] text-[#7CB4B8]" />
                        ))}
                      </div>
                      <span className="text-xs text-[#737373]">Verified Reviews</span>
                    </div>
                    <h4 className="text-lg font-medium mb-1 text-[#1a1a1a] group-hover/tile1:text-[#737373] transition-colors">
                      {globalNavSettings.tile1Title || getProductById(globalNavSettings.tile1ProductId)?.name || 'Product Name'}
                    </h4>
                    <p className="text-sm text-[#737373]">
                      {globalNavSettings.tile1Subtitle || getProductById(globalNavSettings.tile1ProductId)?.shortDescription || 'Product description'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tile 2 - Side by Side */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Product Tile 2 (Right)</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Second product shown in the dropdown menu
              </p>
            </div>
            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left side - Form fields */}
                <div className="space-y-4">
                  {/* Product Selector */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Select Product</label>
                    <select
                      value={globalNavSettings.tile2ProductId || ''}
                      onChange={(e) => {
                        const product = products.find(p => p.id === e.target.value);
                        setGlobalNavSettings({
                          ...globalNavSettings,
                          tile2ProductId: e.target.value || null,
                          tile2Title: product?.name || null,
                          tile2Subtitle: product?.shortDescription || null,
                          tile2Badge: product?.badge || null,
                          tile2BadgeEmoji: product?.badgeEmoji || null,
                        });
                      }}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    >
                      <option value="">Select a product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Override Title */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Title Override <span className="text-[var(--admin-text-muted)]">(optional)</span>
                    </label>
                    <input
                      value={globalNavSettings.tile2Title || ''}
                      onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2Title: e.target.value || null })}
                      placeholder={getProductById(globalNavSettings.tile2ProductId)?.name || 'Product name'}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>

                  {/* Override Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Subtitle Override <span className="text-[var(--admin-text-muted)]">(optional)</span>
                    </label>
                    <input
                      value={globalNavSettings.tile2Subtitle || ''}
                      onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2Subtitle: e.target.value || null })}
                      placeholder={getProductById(globalNavSettings.tile2ProductId)?.shortDescription || 'Product description'}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>

                  {/* Badge */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-[80px_1fr] gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Emoji</label>
                        <input
                          value={globalNavSettings.tile2BadgeEmoji || ''}
                          onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2BadgeEmoji: e.target.value || null })}
                          placeholder="✨"
                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors text-center text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Badge Text</label>
                        <input
                          value={globalNavSettings.tile2Badge || ''}
                          onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2Badge: e.target.value || null })}
                          placeholder="New"
                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                      </div>
                    </div>
                    {/* Badge Colors - only show if badge text or emoji is set */}
                    {(globalNavSettings.tile2Badge || globalNavSettings.tile2BadgeEmoji) && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">Background</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={globalNavSettings.tile2BadgeBgColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2BadgeBgColor: e.target.value })}
                              className="w-10 h-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={globalNavSettings.tile2BadgeBgColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2BadgeBgColor: e.target.value })}
                              placeholder="#bbdae9"
                              className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">Text Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={globalNavSettings.tile2BadgeTextColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2BadgeTextColor: e.target.value })}
                              className="w-10 h-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={globalNavSettings.tile2BadgeTextColor}
                              onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, tile2BadgeTextColor: e.target.value })}
                              placeholder="#1a1a1a"
                              className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary Image Override */}
                  <div className="pt-4 border-t border-[var(--admin-border)]">
                    <MediaPickerButton
                      label="Primary Image/Video Override"
                      value={globalNavSettings.tile2ImageUrl}
                      onChange={(url) => setGlobalNavSettings({ ...globalNavSettings, tile2ImageUrl: url || null })}
                      helpText="Leave blank to use product image. Supports images and MP4/WebM videos."
                      folder="products"
                      acceptVideo={true}
                    />
                  </div>

                  {/* Hover Image */}
                  <div>
                    <MediaPickerButton
                      label="Hover Image/Video"
                      value={globalNavSettings.tile2HoverImageUrl}
                      onChange={(url) => setGlobalNavSettings({ ...globalNavSettings, tile2HoverImageUrl: url || null })}
                      helpText="Shown when users hover over the tile. Supports images and MP4/WebM videos."
                      folder="products"
                      acceptVideo={true}
                    />
                  </div>
                </div>

                {/* Right side - Live Preview */}
                <div className="lg:sticky lg:top-6">
                  {/* Mobile separator */}
                  <div className="lg:hidden border-t border-[var(--admin-border)] pt-6 mt-2 mb-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">Preview</h4>
                  </div>
                  <label className="hidden lg:block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Live Preview</label>
                  <div className="p-5 rounded-2xl bg-white border border-[var(--admin-border)] hover:shadow-md transition-all duration-300 group/tile2">
                    <div className="relative mb-4">
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#f5f5f0] relative">
                        {(() => {
                          const primaryUrl = globalNavSettings.tile2ImageUrl || getProductById(globalNavSettings.tile2ProductId)?.heroImageUrl;
                          const hoverUrl = globalNavSettings.tile2HoverImageUrl;
                          const primaryIsVideo = primaryUrl?.match(/\.(mp4|webm|mov)$/i);
                          const hoverIsVideo = hoverUrl?.match(/\.(mp4|webm|mov)$/i);

                          if (!primaryUrl) {
                            return (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-[var(--admin-text-muted)]" />
                              </div>
                            );
                          }

                          return (
                            <>
                              {/* Primary Media */}
                              {primaryIsVideo ? (
                                <video
                                  src={primaryUrl}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className={`w-full h-full object-cover transition-opacity duration-300 ${hoverUrl ? 'group-hover/tile2:opacity-0' : ''}`}
                                />
                              ) : (
                                <Image
                                  src={primaryUrl}
                                  alt=""
                                  width={300}
                                  height={300}
                                  className={`w-full h-full object-cover transition-opacity duration-300 ${hoverUrl ? 'group-hover/tile2:opacity-0' : 'group-hover/tile2:scale-105'}`}
                                />
                              )}
                              {/* Hover Media */}
                              {hoverUrl && (
                                hoverIsVideo ? (
                                  <video
                                    src={hoverUrl}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile2:opacity-100 transition-opacity duration-300"
                                  />
                                ) : (
                                  <Image
                                    src={hoverUrl}
                                    alt=""
                                    width={300}
                                    height={300}
                                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tile2:opacity-100 transition-opacity duration-300"
                                  />
                                )
                              )}
                            </>
                          );
                        })()}
                      </div>
                      {(globalNavSettings.tile2Badge || globalNavSettings.tile2BadgeEmoji) && (
                        <span
                          className="absolute top-3 right-3 text-sm px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5"
                          style={{
                            backgroundColor: globalNavSettings.tile2BadgeBgColor,
                            color: globalNavSettings.tile2BadgeTextColor
                          }}
                        >
                          {globalNavSettings.tile2BadgeEmoji} {globalNavSettings.tile2Badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm text-[#1a1a1a] font-medium">{(getProductById(globalNavSettings.tile2ProductId)?.reviewCount || 2900).toLocaleString()}+</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#7CB4B8] text-[#7CB4B8]" />
                        ))}
                      </div>
                      <span className="text-xs text-[#737373]">Verified Reviews</span>
                    </div>
                    <h4 className="text-lg font-medium mb-1 text-[#1a1a1a] group-hover/tile2:text-[#737373] transition-colors">
                      {globalNavSettings.tile2Title || getProductById(globalNavSettings.tile2ProductId)?.name || 'Product Name'}
                    </h4>
                    <p className="text-sm text-[#737373]">
                      {globalNavSettings.tile2Subtitle || getProductById(globalNavSettings.tile2ProductId)?.shortDescription || 'Product description'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Tile (Far Right) */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Marketing Tile (Far Right)</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Information card shown between product tiles in the dropdown
              </p>
            </div>
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Title</label>
                <input
                  value={globalNavSettings.marketingTileTitle}
                  onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, marketingTileTitle: e.target.value })}
                  placeholder="Clean Formulas"
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Description</label>
                <textarea
                  value={globalNavSettings.marketingTileDescription}
                  onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, marketingTileDescription: e.target.value })}
                  placeholder="No preservatives, phthalates, parabens, or sulfates."
                  rows={3}
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                />
              </div>

              {/* Editable Badges */}
              <div className="pt-4 border-t border-[var(--admin-border)]">
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">Badge Labels</label>
                <p className="text-xs text-[var(--admin-text-muted)] mb-3">Customize the text badges displayed on this tile</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    value={globalNavSettings.marketingTileBadge1}
                    onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, marketingTileBadge1: e.target.value })}
                    placeholder="Preservative-Free"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm"
                  />
                  <input
                    value={globalNavSettings.marketingTileBadge2}
                    onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, marketingTileBadge2: e.target.value })}
                    placeholder="Paraben-Free"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm"
                  />
                  <input
                    value={globalNavSettings.marketingTileBadge3}
                    onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, marketingTileBadge3: e.target.value })}
                    placeholder="Sulfate-Free"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm"
                  />
                </div>
              </div>

              {/* CTA Button Toggle */}
              <div className="pt-4 border-t border-[var(--admin-border)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-[var(--admin-text-primary)]">CTA Button</p>
                    <p className="text-sm text-[var(--admin-text-muted)]">Add a call-to-action button to this tile</p>
                  </div>
                  <button
                    onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileCtaEnabled: !globalNavSettings.marketingTileCtaEnabled })}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{
                      backgroundColor: globalNavSettings.marketingTileCtaEnabled ? '#22c55e' : '#374151'
                    }}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        globalNavSettings.marketingTileCtaEnabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                {globalNavSettings.marketingTileCtaEnabled && (
                  <div className="space-y-4">
                    {/* Desktop/Mobile visibility toggles */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-[var(--admin-hover)] rounded-lg">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-[var(--admin-text-muted)]" />
                          <span className="text-sm text-[var(--admin-text-secondary)]">Show on Desktop</span>
                        </div>
                        <button
                          onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileCtaEnabledDesktop: !globalNavSettings.marketingTileCtaEnabledDesktop })}
                          className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                          style={{
                            backgroundColor: globalNavSettings.marketingTileCtaEnabledDesktop ? '#22c55e' : '#374151'
                          }}
                        >
                          <span
                            className={cn(
                              "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                              globalNavSettings.marketingTileCtaEnabledDesktop ? "translate-x-4" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[var(--admin-hover)] rounded-lg">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-[var(--admin-text-muted)]" />
                          <span className="text-sm text-[var(--admin-text-secondary)]">Show on Mobile</span>
                        </div>
                        <button
                          onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileCtaEnabledMobile: !globalNavSettings.marketingTileCtaEnabledMobile })}
                          className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                          style={{
                            backgroundColor: globalNavSettings.marketingTileCtaEnabledMobile ? '#22c55e' : '#374151'
                          }}
                        >
                          <span
                            className={cn(
                              "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                              globalNavSettings.marketingTileCtaEnabledMobile ? "translate-x-4" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Button text and URL fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Button Text</label>
                        <input
                          value={globalNavSettings.marketingTileCtaText || ''}
                          onChange={(e) => setGlobalNavSettings({ ...globalNavSettings, marketingTileCtaText: e.target.value || null })}
                          placeholder="Learn More"
                          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Button URL</label>
                        <InternalLinkSelector
                          value={globalNavSettings.marketingTileCtaUrl || ''}
                          onChange={(value) => setGlobalNavSettings({ ...globalNavSettings, marketingTileCtaUrl: value || null })}
                          placeholder="Select page or enter URL"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rotating Badge */}
              <div className="pt-4 border-t border-[var(--admin-border)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-[var(--admin-text-primary)]">Rotating Badge</p>
                    <p className="text-sm text-[var(--admin-text-muted)]">Add a rotating seal/badge that overlaps the tile</p>
                  </div>
                  <button
                    onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileRotatingBadgeEnabled: !globalNavSettings.marketingTileRotatingBadgeEnabled })}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{
                      backgroundColor: globalNavSettings.marketingTileRotatingBadgeEnabled ? '#22c55e' : '#374151'
                    }}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        globalNavSettings.marketingTileRotatingBadgeEnabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                {globalNavSettings.marketingTileRotatingBadgeEnabled && (
                  <div className="space-y-4">
                    {/* Desktop/Mobile visibility toggles */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-[var(--admin-hover)] rounded-lg">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-[var(--admin-text-muted)]" />
                          <span className="text-sm text-[var(--admin-text-secondary)]">Show on Desktop</span>
                        </div>
                        <button
                          onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileRotatingBadgeEnabledDesktop: !globalNavSettings.marketingTileRotatingBadgeEnabledDesktop })}
                          className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                          style={{
                            backgroundColor: globalNavSettings.marketingTileRotatingBadgeEnabledDesktop ? '#22c55e' : '#374151'
                          }}
                        >
                          <span
                            className={cn(
                              "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                              globalNavSettings.marketingTileRotatingBadgeEnabledDesktop ? "translate-x-4" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[var(--admin-hover)] rounded-lg">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-[var(--admin-text-muted)]" />
                          <span className="text-sm text-[var(--admin-text-secondary)]">Show on Mobile</span>
                        </div>
                        <button
                          onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileRotatingBadgeEnabledMobile: !globalNavSettings.marketingTileRotatingBadgeEnabledMobile })}
                          className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                          style={{
                            backgroundColor: globalNavSettings.marketingTileRotatingBadgeEnabledMobile ? '#22c55e' : '#374151'
                          }}
                        >
                          <span
                            className={cn(
                              "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                              globalNavSettings.marketingTileRotatingBadgeEnabledMobile ? "translate-x-4" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    <MediaPickerButton
                      label="Badge Image"
                      value={globalNavSettings.marketingTileRotatingBadgeUrl}
                      onChange={(url) => setGlobalNavSettings({ ...globalNavSettings, marketingTileRotatingBadgeUrl: url || null })}
                      helpText="Upload a PNG with transparent background. It will spin slowly and overlap the top-right corner."
                      folder="branding"
                    />
                  </div>
                )}
              </div>

              {/* Hide on Mobile Toggle */}
              <div className="pt-4 border-t border-[var(--admin-border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--admin-text-primary)]">Hide on Mobile</p>
                    <p className="text-sm text-[var(--admin-text-muted)]">Hide this tile on mobile devices to save space</p>
                  </div>
                  <button
                    onClick={() => setGlobalNavSettings({ ...globalNavSettings, marketingTileHideOnMobile: !globalNavSettings.marketingTileHideOnMobile })}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{
                      backgroundColor: globalNavSettings.marketingTileHideOnMobile ? '#22c55e' : '#374151'
                    }}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        globalNavSettings.marketingTileHideOnMobile ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          PAGE LINKS TAB (Sub-tab: pages)
          ============================================ */}
      {activeTab === 'header' && navSubTab === 'pages' && (
        <div className="space-y-6">
          {/* Current Navigation */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Current Navigation</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Manage pages in the header navigation. Use the position dropdown to place items on the left, center, or right.
              </p>
            </div>

            <div className="p-6">
              {/* Global Navigation - Dropdown Menu */}
              <div className="mb-6 pb-6 border-b border-[var(--admin-border)]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">Global Navigation - Dropdown Menu</p>
                <div className="p-4 bg-[var(--admin-hover)] rounded-lg flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-[var(--admin-text-primary)]">Shop</p>
                    <p className="text-sm text-[var(--admin-text-muted)]">Dropdown</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-[var(--primary)]/20 text-[var(--primary)] rounded-full">
                    Left
                  </span>
                </div>
              </div>

              {/* Global Navigation - Left Side */}
              <div
                className={cn(
                  "mb-6 rounded-xl transition-all",
                  dragOverSection === 'left' && "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--admin-input)] bg-[var(--primary)]/5"
                )}
                onDragOver={(e) => handleDragOver(e, 'left')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'left')}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">Global Navigation - Left Side</p>
                {draggingPageId && (
                  <div className={cn(
                    "mb-2 p-3 border-2 border-dashed rounded-lg text-center text-sm transition-colors",
                    dragOverSection === 'left'
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "border-[var(--admin-border)] text-[var(--admin-text-muted)]"
                  )}>
                    Drop here to add to left position
                  </div>
                )}
                <Reorder.Group
                  axis="y"
                  values={pagesList.filter(p => p.showInNav && p.navPosition === 'left').sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0))}
                  onReorder={(newOrder) => {
                    const otherPages = pagesList.filter(p => !p.showInNav || p.navPosition !== 'left');
                    setPagesList([
                      ...otherPages,
                      ...newOrder.map((item, index) => ({ ...item, navOrder: index })),
                    ]);
                  }}
                  className="space-y-2"
                >
                  {pagesList.filter(p => p.showInNav && p.navPosition === 'left').sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0)).map((page) => (
                    <Reorder.Item
                      key={page.id}
                      value={page}
                      className="p-4 bg-[var(--admin-hover)] rounded-lg cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--admin-text-primary)]">{page.title}</p>
                          <p className="text-sm text-[var(--admin-text-muted)]">/{page.slug}</p>
                        </div>
                        {/* Device visibility toggles - clear ON/OFF indicators */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setPagesList(pagesList.map(p =>
                                p.id === page.id ? { ...p, navShowOnDesktop: !p.navShowOnDesktop } : p
                              ));
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              page.navShowOnDesktop !== false
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-[var(--admin-input)] text-[var(--admin-text-muted)] border border-[var(--admin-border)] opacity-60 hover:opacity-100'
                            }`}
                            title={page.navShowOnDesktop !== false ? 'Visible on desktop - click to hide' : 'Hidden on desktop - click to show'}
                          >
                            <Monitor className="w-3.5 h-3.5" />
                            <span>{page.navShowOnDesktop !== false ? 'ON' : 'OFF'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPagesList(pagesList.map(p =>
                                p.id === page.id ? { ...p, navShowOnMobile: p.navShowOnMobile !== false ? false : true } : p
                              ));
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              page.navShowOnMobile !== false
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-[var(--admin-input)] text-[var(--admin-text-muted)] border border-[var(--admin-border)] opacity-60 hover:opacity-100'
                            }`}
                            title={page.navShowOnMobile !== false ? 'Visible on mobile - click to hide' : 'Hidden on mobile - click to show'}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>{page.navShowOnMobile !== false ? 'ON' : 'OFF'}</span>
                          </button>
                        </div>
                        <select
                          value={page.navPosition || 'right'}
                          onChange={(e) => {
                            setPagesList(pagesList.map(p =>
                              p.id === page.id ? { ...p, navPosition: e.target.value } : p
                            ));
                          }}
                          className="px-3 py-1.5 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                        <button
                          onClick={() => setPagesList(pagesList.map(p => p.id === page.id ? { ...p, showInNav: false } : p))}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                {pagesList.filter(p => p.showInNav && p.navPosition === 'left').length === 0 && (
                  <p className="text-sm text-[var(--admin-text-muted)] py-4 text-center">No pages in left position</p>
                )}
              </div>

              {/* Global Navigation - Center */}
              <div
                className={cn(
                  "mb-6 pb-6 border-b border-[var(--admin-border)] rounded-xl transition-all",
                  dragOverSection === 'center' && "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--admin-input)] bg-[var(--primary)]/5"
                )}
                onDragOver={(e) => handleDragOver(e, 'center')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'center')}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">Global Navigation - Center</p>
                {draggingPageId && (
                  <div className={cn(
                    "mb-2 p-3 border-2 border-dashed rounded-lg text-center text-sm transition-colors",
                    dragOverSection === 'center'
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "border-[var(--admin-border)] text-[var(--admin-text-muted)]"
                  )}>
                    Drop here to add to center position
                  </div>
                )}
                <Reorder.Group
                  axis="y"
                  values={pagesList.filter(p => p.showInNav && p.navPosition === 'center').sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0))}
                  onReorder={(newOrder) => {
                    const otherPages = pagesList.filter(p => !p.showInNav || p.navPosition !== 'center');
                    setPagesList([
                      ...otherPages,
                      ...newOrder.map((item, index) => ({ ...item, navOrder: index })),
                    ]);
                  }}
                  className="space-y-2"
                >
                  {pagesList.filter(p => p.showInNav && p.navPosition === 'center').sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0)).map((page) => (
                    <Reorder.Item
                      key={page.id}
                      value={page}
                      className="p-4 bg-[var(--admin-hover)] rounded-lg cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--admin-text-primary)]">{page.title}</p>
                          <p className="text-sm text-[var(--admin-text-muted)]">/{page.slug}</p>
                        </div>
                        {/* Device visibility toggles - clear ON/OFF indicators */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setPagesList(pagesList.map(p =>
                                p.id === page.id ? { ...p, navShowOnDesktop: !p.navShowOnDesktop } : p
                              ));
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              page.navShowOnDesktop !== false
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-[var(--admin-input)] text-[var(--admin-text-muted)] border border-[var(--admin-border)] opacity-60 hover:opacity-100'
                            }`}
                            title={page.navShowOnDesktop !== false ? 'Visible on desktop - click to hide' : 'Hidden on desktop - click to show'}
                          >
                            <Monitor className="w-3.5 h-3.5" />
                            <span>{page.navShowOnDesktop !== false ? 'ON' : 'OFF'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPagesList(pagesList.map(p =>
                                p.id === page.id ? { ...p, navShowOnMobile: p.navShowOnMobile !== false ? false : true } : p
                              ));
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              page.navShowOnMobile !== false
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-[var(--admin-input)] text-[var(--admin-text-muted)] border border-[var(--admin-border)] opacity-60 hover:opacity-100'
                            }`}
                            title={page.navShowOnMobile !== false ? 'Visible on mobile - click to hide' : 'Hidden on mobile - click to show'}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>{page.navShowOnMobile !== false ? 'ON' : 'OFF'}</span>
                          </button>
                        </div>
                        <select
                          value={page.navPosition || 'right'}
                          onChange={(e) => {
                            setPagesList(pagesList.map(p =>
                              p.id === page.id ? { ...p, navPosition: e.target.value } : p
                            ));
                          }}
                          className="px-3 py-1.5 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                        <button
                          onClick={() => setPagesList(pagesList.map(p => p.id === page.id ? { ...p, showInNav: false } : p))}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                {pagesList.filter(p => p.showInNav && p.navPosition === 'center').length === 0 && (
                  <p className="text-sm text-[var(--admin-text-muted)] py-4 text-center">No pages in center position</p>
                )}
              </div>

              {/* Global Navigation - Right Side */}
              <div
                className={cn(
                  "rounded-xl transition-all",
                  dragOverSection === 'right' && "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--admin-input)] bg-[var(--primary)]/5"
                )}
                onDragOver={(e) => handleDragOver(e, 'right')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'right')}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-3">Global Navigation - Right Side</p>
                {draggingPageId && (
                  <div className={cn(
                    "mb-2 p-3 border-2 border-dashed rounded-lg text-center text-sm transition-colors",
                    dragOverSection === 'right'
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "border-[var(--admin-border)] text-[var(--admin-text-muted)]"
                  )}>
                    Drop here to add to right position
                  </div>
                )}
                <Reorder.Group
                  axis="y"
                  values={pagesList.filter(p => p.showInNav && (p.navPosition === 'right' || !p.navPosition)).sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0))}
                  onReorder={(newOrder) => {
                    const otherPages = pagesList.filter(p => !p.showInNav || (p.navPosition !== 'right' && p.navPosition));
                    setPagesList([
                      ...otherPages,
                      ...newOrder.map((item, index) => ({ ...item, navOrder: index })),
                    ]);
                  }}
                  className="space-y-2"
                >
                  {pagesList.filter(p => p.showInNav && (p.navPosition === 'right' || !p.navPosition)).sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0)).map((page) => (
                    <Reorder.Item
                      key={page.id}
                      value={page}
                      className="p-4 bg-[var(--admin-hover)] rounded-lg cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--admin-text-primary)]">{page.title}</p>
                          <p className="text-sm text-[var(--admin-text-muted)]">/{page.slug}</p>
                        </div>
                        {/* Device visibility toggles - clear ON/OFF indicators */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setPagesList(pagesList.map(p =>
                                p.id === page.id ? { ...p, navShowOnDesktop: !p.navShowOnDesktop } : p
                              ));
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              page.navShowOnDesktop !== false
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-[var(--admin-input)] text-[var(--admin-text-muted)] border border-[var(--admin-border)] opacity-60 hover:opacity-100'
                            }`}
                            title={page.navShowOnDesktop !== false ? 'Visible on desktop - click to hide' : 'Hidden on desktop - click to show'}
                          >
                            <Monitor className="w-3.5 h-3.5" />
                            <span>{page.navShowOnDesktop !== false ? 'ON' : 'OFF'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPagesList(pagesList.map(p =>
                                p.id === page.id ? { ...p, navShowOnMobile: p.navShowOnMobile !== false ? false : true } : p
                              ));
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              page.navShowOnMobile !== false
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-[var(--admin-input)] text-[var(--admin-text-muted)] border border-[var(--admin-border)] opacity-60 hover:opacity-100'
                            }`}
                            title={page.navShowOnMobile !== false ? 'Visible on mobile - click to hide' : 'Hidden on mobile - click to show'}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>{page.navShowOnMobile !== false ? 'ON' : 'OFF'}</span>
                          </button>
                        </div>
                        <select
                          value={page.navPosition || 'right'}
                          onChange={(e) => {
                            setPagesList(pagesList.map(p =>
                              p.id === page.id ? { ...p, navPosition: e.target.value } : p
                            ));
                          }}
                          className="px-3 py-1.5 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                        <button
                          onClick={() => setPagesList(pagesList.map(p => p.id === page.id ? { ...p, showInNav: false } : p))}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                {pagesList.filter(p => p.showInNav && (p.navPosition === 'right' || !p.navPosition)).length === 0 && (
                  <p className="text-sm text-[var(--admin-text-muted)] py-4 text-center">No pages in right position</p>
                )}
              </div>
            </div>
          </div>

          {/* Available Pages */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Available Pages</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Drag pages to the navigation sections above, or use the toggle to add them to the right position.
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-2">
                {pagesList.filter(p => !p.showInNav).map((page) => (
                  <motion.div
                    key={page.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, page.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "p-4 bg-[var(--admin-hover)] rounded-lg flex items-center gap-4 cursor-grab active:cursor-grabbing transition-all",
                      draggingPageId === page.id && "opacity-50 ring-2 ring-[var(--primary)]"
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--admin-text-primary)]">{page.title}</p>
                      <p className="text-sm text-[var(--admin-text-muted)]">/{page.slug}</p>
                    </div>
                    {/* Toggle: Add to Navigation */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-[var(--admin-text-muted)]">Add to Nav</span>
                      <button
                        onClick={() => {
                          const maxOrder = Math.max(0, ...pagesList.filter(p => p.showInNav && (p.navPosition === 'right' || !p.navPosition)).map(p => p.navOrder || 0));
                          setPagesList(pagesList.map(p =>
                            p.id === page.id ? { ...p, showInNav: true, navOrder: maxOrder + 1, navPosition: 'right', navShowOnDesktop: true, navShowOnMobile: true } : p
                          ));
                        }}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-[#374151] hover:bg-[#4b5563]"
                      >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {pagesList.filter(p => !p.showInNav).length === 0 && (
                  <p className="text-sm text-[var(--admin-text-muted)] py-8 text-center">All pages are in the navigation</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          FOOTER TAB CONTENT
          ============================================ */}

      {/* Footer Theme & Branding */}
      {activeTab === 'footer' && footerSubTab === 'theme' && (
        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Footer Theme</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Choose the color scheme for your footer
              </p>
            </div>
            <div className="p-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setFooterTheme('dark')}
                  className={cn(
                    'flex-1 p-4 rounded-xl border-2 transition-all',
                    footerTheme === 'dark'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]'
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                      <Moon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[var(--admin-text-primary)]">Dark</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">Dark background, light text</p>
                    </div>
                  </div>
                  <div className="h-16 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                    <span className="text-xs text-white/60">Preview</span>
                  </div>
                </button>
                <button
                  onClick={() => setFooterTheme('light')}
                  className={cn(
                    'flex-1 p-4 rounded-xl border-2 transition-all',
                    footerTheme === 'light'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]'
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Sun className="w-5 h-5 text-gray-900" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[var(--admin-text-primary)]">Light</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">Light background, dark text</p>
                    </div>
                  </div>
                  <div className="h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-600">Preview</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Logo Uploads */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Footer Logos</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Upload the logos displayed in your footer
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">
                  Main Footer Logo
                </label>
                <p className="text-xs text-[var(--admin-text-muted)] mb-3">
                  Shown in the top-left of the main footer section
                </p>
                <MediaPickerButton
                  label="Upload Logo"
                  value={footerLogoUrl}
                  onChange={setFooterLogoUrl}
                  helpText="Recommended: 200x60px, PNG with transparency"
                  aspectRatio="16/5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-3">
                  Massive Footer Logo
                </label>
                <p className="text-xs text-[var(--admin-text-muted)] mb-3">
                  Full-width brand texture displayed near the bottom of the footer
                </p>
                <MediaPickerButton
                  label="Upload Massive Footer Logo"
                  value={fullWidthLogoUrl}
                  onChange={setFullWidthLogoUrl}
                  helpText="Recommended: 1920x400px or larger, PNG with transparency"
                  aspectRatio="6/1"
                />
                {/* Opacity Slider */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                    Logo Opacity: {massiveLogoOpacity}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={massiveLogoOpacity}
                    onChange={(e) => setMassiveLogoOpacity(Number(e.target.value))}
                    className="w-full h-2 bg-[var(--admin-border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                  />
                  <div className="flex justify-between text-xs text-[var(--admin-text-muted)] mt-1">
                    <span>Subtle</span>
                    <span>Full</span>
                  </div>
                </div>
                {/* Opacity Preview */}
                {fullWidthLogoUrl && (
                  <div className="mt-4 p-4 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <p className="text-xs text-white/50 mb-2">Preview (dark background)</p>
                    <img
                      src={fullWidthLogoUrl}
                      alt="Opacity preview"
                      className="w-full h-auto object-contain"
                      style={{ opacity: massiveLogoOpacity / 100 }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Social Links</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Add your social media profile URLs. Leave blank to hide.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </label>
                <input
                  type="text"
                  value={socialLinks.instagramUrl}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/yourhandle"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </label>
                <input
                  type="text"
                  value={socialLinks.facebookUrl}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  TikTok
                </label>
                <input
                  type="text"
                  value={socialLinks.tiktokUrl}
                  onChange={(e) => setSocialLinks({ ...socialLinks, tiktokUrl: e.target.value })}
                  placeholder="https://tiktok.com/@yourhandle"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48l-.006.004c-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.132-.1-.18-.22-.106-.343z"/>
                  </svg>
                  Amazon Store
                </label>
                <input
                  type="text"
                  value={socialLinks.amazonStoreUrl}
                  onChange={(e) => setSocialLinks({ ...socialLinks, amazonStoreUrl: e.target.value })}
                  placeholder="https://amazon.com/stores/yourstore"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Theme Preview */}
          <div className={cn(
            'rounded-xl p-8',
            footerTheme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'
          )}>
            <p className={cn(
              'text-xs uppercase tracking-wider mb-6',
              footerTheme === 'dark' ? 'text-white/40' : 'text-gray-400'
            )}>Theme Preview</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {footerLogoUrl ? (
                  <Image src={footerLogoUrl} alt="Footer Logo" width={120} height={40} className="h-10 w-auto object-contain" />
                ) : (
                  <div className={cn(
                    'h-10 w-32 rounded flex items-center justify-center text-xs',
                    footerTheme === 'dark' ? 'bg-white/10 text-white/40' : 'bg-gray-200 text-gray-400'
                  )}>
                    Logo Here
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {socialLinks.instagramUrl && (
                  <Instagram className={cn('w-5 h-5', footerTheme === 'dark' ? 'text-white/60' : 'text-gray-600')} />
                )}
                {socialLinks.facebookUrl && (
                  <Facebook className={cn('w-5 h-5', footerTheme === 'dark' ? 'text-white/60' : 'text-gray-600')} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Email Subscription */}
      {activeTab === 'footer' && footerSubTab === 'signup' && (
        <div className="space-y-6">
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Email Signup Section</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Configure the email signup prompt at the top of your footer
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* Enable Toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailSignup.enabled}
                    onChange={(e) => setEmailSignup({ ...emailSignup, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--admin-hover)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                </label>
                <span className="text-sm font-medium text-[var(--admin-text-primary)]">Show email signup section</span>
              </div>

              {emailSignup.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Title</label>
                    <input
                      type="text"
                      value={emailSignup.title}
                      onChange={(e) => setEmailSignup({ ...emailSignup, title: e.target.value })}
                      placeholder="Join the Archie's Community"
                      className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Subtitle</label>
                    <textarea
                      value={emailSignup.subtitle}
                      onChange={(e) => setEmailSignup({ ...emailSignup, subtitle: e.target.value })}
                      placeholder="Expert eye care tips, new product drops, and wellness inspiration."
                      rows={2}
                      className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Input Placeholder</label>
                      <input
                        type="text"
                        value={emailSignup.placeholder}
                        onChange={(e) => setEmailSignup({ ...emailSignup, placeholder: e.target.value })}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Button Text</label>
                      <input
                        type="text"
                        value={emailSignup.buttonText}
                        onChange={(e) => setEmailSignup({ ...emailSignup, buttonText: e.target.value })}
                        placeholder="Sign Up"
                        className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Success Message</label>
                    <input
                      type="text"
                      value={emailSignup.successMessage}
                      onChange={(e) => setEmailSignup({ ...emailSignup, successMessage: e.target.value })}
                      placeholder="You're on the list."
                      className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className={cn(
            'rounded-xl p-8',
            footerTheme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'
          )}>
            <p className={cn(
              'text-xs uppercase tracking-wider mb-6',
              footerTheme === 'dark' ? 'text-white/40' : 'text-gray-400'
            )}>Preview</p>
            {emailSignup.enabled ? (
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h3 className={cn(
                    'text-sm font-semibold tracking-[0.15em] uppercase mb-2',
                    footerTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {emailSignup.title || "Join the Archie's Community"}
                  </h3>
                  <p className={cn(
                    'text-sm',
                    footerTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                  )}>
                    {emailSignup.subtitle || 'Expert eye care tips, new product drops, and wellness inspiration.'}
                  </p>
                </div>
                <div className={cn(
                  'flex items-center gap-4 border-b pb-3 flex-1 max-w-md',
                  footerTheme === 'dark' ? 'border-white/30' : 'border-gray-300'
                )}>
                  <input
                    type="email"
                    placeholder={emailSignup.placeholder || 'Enter your email'}
                    disabled
                    className={cn(
                      'flex-1 bg-transparent text-base',
                      footerTheme === 'dark' ? 'text-white placeholder:text-white/40' : 'text-gray-900 placeholder:text-gray-400'
                    )}
                  />
                  <span className={cn(
                    'text-sm font-medium tracking-wide uppercase',
                    footerTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {emailSignup.buttonText || 'Sign Up'} →
                  </span>
                </div>
              </div>
            ) : (
              <p className={cn(
                'text-center py-4',
                footerTheme === 'dark' ? 'text-white/40' : 'text-gray-400'
              )}>Email signup section is hidden</p>
            )}
          </div>
        </div>
      )}

      {/* Footer Main Content */}
      {activeTab === 'footer' && footerSubTab === 'main' && (
        <div className="space-y-6">
          {/* Column Titles */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Column Titles</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Customize the header titles for each link column
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Column 1</label>
                <input
                  type="text"
                  value={columnTitles.column1}
                  onChange={(e) => setColumnTitles({ ...columnTitles, column1: e.target.value })}
                  placeholder="Shop"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Column 2</label>
                <input
                  type="text"
                  value={columnTitles.column2}
                  onChange={(e) => setColumnTitles({ ...columnTitles, column2: e.target.value })}
                  placeholder="Learn"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Column 3</label>
                <input
                  type="text"
                  value={columnTitles.column3}
                  onChange={(e) => setColumnTitles({ ...columnTitles, column3: e.target.value })}
                  placeholder="Support"
                  className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Link Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[columnTitles.column1, columnTitles.column2, columnTitles.column3].map((colTitle, colIndex) => (
              <div key={colIndex} className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
                <div className="p-4 border-b border-[var(--admin-border)] flex items-center justify-between">
                  <h3 className="font-medium text-[var(--admin-text-primary)]">{colTitle}</h3>
                  <button
                    onClick={() => handleAddFooterColumnLink(colTitle)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                <Reorder.Group
                  axis="y"
                  values={footerLinksByColumn[colTitle] || []}
                  onReorder={(newOrder) => handleReorderFooterColumnLinks(colTitle, newOrder)}
                  className="divide-y divide-[var(--admin-border)]"
                >
                  {(footerLinksByColumn[colTitle] || []).map((link) => (
                    <Reorder.Item
                      key={link.id}
                      value={link}
                      className="p-4 flex items-center gap-3 hover:bg-[var(--admin-hover)] transition-colors cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--admin-text-primary)] truncate">
                          {link.label || 'Untitled'}
                        </p>
                        <p className="text-xs text-[var(--admin-text-muted)] truncate">{link.url}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditFooterColumnLink(link, colTitle)}
                          className="p-1.5 rounded-lg hover:bg-[var(--admin-input)] transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5 text-[var(--admin-text-secondary)]" />
                        </button>
                        <button
                          onClick={() => handleDeleteFooterColumnLink(link.id, colTitle)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                {(!footerLinksByColumn[colTitle] || footerLinksByColumn[colTitle].length === 0) && (
                  <div className="py-8 text-center">
                    <LinkIcon className="w-8 h-8 mx-auto mb-2 text-[var(--admin-text-muted)]" />
                    <p className="text-sm text-[var(--admin-text-muted)]">No links yet</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Certifications Column</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Certification badges shown in the 4th column
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Column Title</label>
                <input
                  type="text"
                  value={columnTitles.column4}
                  onChange={(e) => setColumnTitles({ ...columnTitles, column4: e.target.value })}
                  placeholder="Certifications"
                  className="w-full max-w-xs px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="p-4 bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)]">
                    <h3 className="font-medium text-[var(--admin-text-primary)] mb-3 text-sm">Badge {index + 1}</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={cert.label}
                        onChange={(e) => {
                          const newCerts = [...certifications];
                          newCerts[index] = { ...cert, label: e.target.value };
                          setCertifications(newCerts);
                        }}
                        placeholder="Label"
                        className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                      <select
                        value={cert.iconUrl ? 'custom' : cert.icon}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newCerts = [...certifications];
                          if (val === 'custom') {
                            newCerts[index] = { ...cert, icon: 'custom' };
                          } else {
                            newCerts[index] = { ...cert, icon: val, iconUrl: null };
                          }
                          setCertifications(newCerts);
                        }}
                        className="w-full px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      >
                        <option value="droplet">Droplet</option>
                        <option value="flag">Flag</option>
                        <option value="rabbit">Rabbit</option>
                        <option value="custom">Custom Icon</option>
                      </select>
                      {(cert.icon === 'custom' || cert.iconUrl) && (
                        <MediaPickerButton
                          label="Icon"
                          value={cert.iconUrl}
                          onChange={(url) => {
                            const newCerts = [...certifications];
                            newCerts[index] = { ...cert, icon: 'custom', iconUrl: url };
                            setCertifications(newCerts);
                          }}
                          helpText="Square PNG"
                          aspectRatio="1/1"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Bottom Bar */}
      {activeTab === 'footer' && footerSubTab === 'bottom' && (
        <div className="space-y-6">
          <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)]">
              <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Legal Links</h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Configure the legal links that appear at the bottom of your footer
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Privacy Policy Label</label>
                  <input
                    type="text"
                    value={legalLinks.privacyLabel}
                    onChange={(e) => setLegalLinks({ ...legalLinks, privacyLabel: e.target.value })}
                    placeholder="Privacy Policy"
                    className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Privacy Policy URL</label>
                  <InternalLinkSelector
                    value={legalLinks.privacyUrl}
                    onChange={(value) => setLegalLinks({ ...legalLinks, privacyUrl: value })}
                    placeholder="Select page or enter URL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Terms of Service Label</label>
                  <input
                    type="text"
                    value={legalLinks.termsLabel}
                    onChange={(e) => setLegalLinks({ ...legalLinks, termsLabel: e.target.value })}
                    placeholder="Terms of Service"
                    className="w-full px-4 py-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Terms of Service URL</label>
                  <InternalLinkSelector
                    value={legalLinks.termsUrl}
                    onChange={(value) => setLegalLinks({ ...legalLinks, termsUrl: value })}
                    placeholder="Select page or enter URL"
                  />
                </div>
              </div>

              <div className="p-4 bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)]">
                <p className="text-sm text-[var(--admin-text-secondary)]">
                  <span className="font-medium text-[var(--admin-text-primary)]">Copyright Notice:</span> The site name in the copyright notice ({siteName}) is pulled from your Site Settings. The year is automatically updated.
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className={cn(
            'rounded-xl p-8',
            footerTheme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'
          )}>
            <p className={cn(
              'text-xs uppercase tracking-wider mb-6',
              footerTheme === 'dark' ? 'text-white/40' : 'text-gray-400'
            )}>Preview</p>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className={cn(
                'flex items-center gap-4 text-[11px] uppercase tracking-wide',
                footerTheme === 'dark' ? 'text-white/40' : 'text-gray-500'
              )}>
                <span className={cn(
                  'transition-colors cursor-pointer',
                  footerTheme === 'dark' ? 'hover:text-white/60' : 'hover:text-gray-700'
                )}>
                  {legalLinks.privacyLabel}
                </span>
                <span>•</span>
                <span className={cn(
                  'transition-colors cursor-pointer',
                  footerTheme === 'dark' ? 'hover:text-white/60' : 'hover:text-gray-700'
                )}>
                  {legalLinks.termsLabel}
                </span>
              </div>
              <p className={cn(
                'text-[11px] uppercase tracking-wide',
                footerTheme === 'dark' ? 'text-white/40' : 'text-gray-500'
              )}>
                © {new Date().getFullYear()} {siteName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Link Edit Modal */}
      {editingFooterLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setEditingFooterLink(null); setEditFooterColumn(''); }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-border)] shadow-xl w-full max-w-md"
          >
            <div className="p-6 border-b border-[var(--admin-border)] flex items-center justify-between">
              <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">
                {editingFooterLink.id.startsWith('new-') ? 'Add Link' : 'Edit Link'}
              </h2>
              <button
                onClick={() => { setEditingFooterLink(null); setEditFooterColumn(''); }}
                className="p-2 rounded-lg hover:bg-[var(--admin-input)] text-[var(--admin-text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Label</label>
                <input
                  type="text"
                  value={editingFooterLink.label}
                  onChange={(e) => setEditingFooterLink({ ...editingFooterLink, label: e.target.value })}
                  placeholder="Dry Eye Drops"
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingFooterLink.isExternal}
                    onChange={(e) => setEditingFooterLink({ ...editingFooterLink, isExternal: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--admin-hover)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                </label>
                <span className="text-sm font-medium text-[var(--admin-text-primary)]">
                  External link (opens in new tab)
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">URL</label>
                {editingFooterLink.isExternal ? (
                  <input
                    type="text"
                    value={editingFooterLink.url}
                    onChange={(e) => setEditingFooterLink({ ...editingFooterLink, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                ) : (
                  <InternalLinkSelector
                    value={editingFooterLink.url}
                    onChange={(value) => setEditingFooterLink({ ...editingFooterLink, url: value })}
                    placeholder="Select page or enter URL"
                  />
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[var(--admin-border)] flex justify-end gap-3">
              <button
                onClick={() => { setEditingFooterLink(null); setEditFooterColumn(''); }}
                className="px-4 py-2 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFooterColumnLink}
                disabled={!editingFooterLink.label || !editingFooterLink.url}
                className="px-5 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
              >
                Save Link
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ============================================
          ANNOUNCEMENT BAR SETTINGS
          ============================================ */}
      {activeTab === 'bumper' && (
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
          <div className="p-6 border-b border-[var(--admin-border)]">
            <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Announcement Bar</h2>
            <p className="text-sm text-[var(--admin-text-secondary)]">
              Display a promotional message at the top of all pages
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Enable Toggle - Disabled (left) / Enabled (right) */}
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-sm font-medium transition-colors",
                !bumperSettings.bumperEnabled ? "text-red-400" : "text-[var(--admin-text-muted)]"
              )}>
                Disabled
              </span>
              <button
                onClick={() => setBumperSettings({ ...bumperSettings, bumperEnabled: !bumperSettings.bumperEnabled })}
                className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--admin-bg)]"
                style={{
                  backgroundColor: bumperSettings.bumperEnabled ? '#22c55e' : '#ef4444'
                }}
              >
                <span
                  className={cn(
                    "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg",
                    bumperSettings.bumperEnabled ? "translate-x-9" : "translate-x-1"
                  )}
                />
              </button>
              <span className={cn(
                "text-sm font-medium transition-colors",
                bumperSettings.bumperEnabled ? "text-green-400" : "text-[var(--admin-text-muted)]"
              )}>
                Enabled
              </span>
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setBumperSettings({ ...bumperSettings, bumperTheme: 'light' })}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                    bumperSettings.bumperTheme === 'light'
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]"
                  )}
                >
                  <div className="w-full h-8 rounded bg-[var(--primary)] flex items-center justify-center">
                    <span className="text-xs font-medium text-[var(--foreground)]">Sample Text</span>
                  </div>
                  <span className="text-sm text-[var(--admin-text-primary)]">Light (Brand Blue)</span>
                </button>
                <button
                  onClick={() => setBumperSettings({ ...bumperSettings, bumperTheme: 'dark' })}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                    bumperSettings.bumperTheme === 'dark'
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]"
                  )}
                >
                  <div className="w-full h-8 rounded bg-black flex items-center justify-center">
                    <span className="text-xs font-medium text-white">Sample Text</span>
                  </div>
                  <span className="text-sm text-[var(--admin-text-primary)]">Dark (Black)</span>
                </button>
              </div>
            </div>

            {/* Announcement Text */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Announcement Text</label>
              <input
                value={bumperSettings.bumperText}
                onChange={(e) => setBumperSettings({ ...bumperSettings, bumperText: e.target.value })}
                placeholder="Free shipping on orders over $50!"
                className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">This text will be centered in the announcement bar</p>
            </div>

            {/* Link URL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Link Text (optional)</label>
                <input
                  value={bumperSettings.bumperLinkText}
                  onChange={(e) => setBumperSettings({ ...bumperSettings, bumperLinkText: e.target.value })}
                  placeholder="Shop Now"
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Link URL (optional)</label>
                <InternalLinkSelector
                  value={bumperSettings.bumperLinkUrl}
                  onChange={(value) => setBumperSettings({ ...bumperSettings, bumperLinkUrl: value })}
                  placeholder="Select page or enter URL"
                />
              </div>
            </div>

            {/* Preview */}
            {bumperSettings.bumperText && (
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Preview</label>
                <div className={cn(
                  "py-3 px-4 rounded-lg",
                  bumperSettings.bumperTheme === 'dark' ? "bg-black" : "bg-[var(--primary)]"
                )}>
                  <div className={cn(
                    "flex items-center justify-center gap-3 text-sm",
                    bumperSettings.bumperTheme === 'dark' ? "text-white" : "text-[var(--admin-button-text)]"
                  )}>
                    <span className="text-center font-medium">{bumperSettings.bumperText}</span>
                    {bumperSettings.bumperLinkUrl && bumperSettings.bumperLinkText && (
                      <span className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-2">
                        {bumperSettings.bumperLinkText}
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancelEdit} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[var(--admin-input)] rounded-2xl border border-[var(--admin-border)] shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto"
          >
            <div className="p-6 border-b border-[var(--admin-border)] flex items-center justify-between">
              <h2 className="text-xl font-medium text-[var(--admin-text-primary)]">
                {editType === 'nav' ? 'Edit Navigation Item' : 'Edit Footer Link'}
              </h2>
              <button onClick={handleCancelEdit} className="p-2 rounded-lg hover:bg-[var(--admin-input)] text-[var(--admin-text-secondary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editForm as any).isActive ?? true}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--admin-hover)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                </label>
                <span className="text-sm font-medium text-[var(--admin-text-primary)]">Active</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Label</label>
                  <input
                    value={(editForm as any).label || ''}
                    onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                    placeholder="Products"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">URL</label>
                  <InternalLinkSelector
                    value={(editForm as any).url || ''}
                    onChange={(value) => setEditForm({ ...editForm, url: value })}
                    placeholder="Select page or enter URL"
                  />
                </div>
              </div>

              {editType === 'nav' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Type</label>
                    <select
                      value={(editForm as NavItem).type || 'link'}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    >
                      <option value="link">Link</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="mega">Mega Menu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Description (for mega menu)</label>
                    <input
                      value={(editForm as NavItem).description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Browse our products"
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Image URL (for mega menu)</label>
                    <input
                      value={(editForm as NavItem).imageUrl || ''}
                      onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </>
              )}

              {editType === 'footer' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Column</label>
                  <input
                    value={(editForm as FooterLink).column || ''}
                    onChange={(e) => setEditForm({ ...editForm, column: e.target.value })}
                    placeholder="Shop"
                    list="columns"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  <datalist id="columns">
                    <option value="Shop" />
                    <option value="Support" />
                    <option value="Company" />
                    <option value="Legal" />
                  </datalist>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[var(--admin-border)] flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
