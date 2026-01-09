/**
 * Centralized Widget Library Configuration
 *
 * This is the SINGLE SOURCE OF TRUTH for all widget definitions.
 * Used by:
 * - /admin/widgets (global widget library page)
 * - Page editor widget sidebar
 * - Widget config panels
 */

import {
  Image as ImageIcon,
  Type,
  Star,
  HelpCircle,
  MessageSquare,
  PlayCircle,
  Columns,
  Columns3,
  MousePointerClick,
  Zap,
  GalleryHorizontalEnd,
  LayoutPanelLeft,
  MessageCircleQuestion,
  LucideIcon,
  Sparkles,
  Users,
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface WidgetTypeDefinition {
  type: string;
  name: string;
  icon: LucideIcon;
  category: string;
  description: string;
  /** Database table for this widget (if global), null if page-specific JSON */
  table?: 'heroSlides' | 'reviews' | null;
  /** Admin page href for global widget management */
  adminHref?: string | null;
  /** Key for count lookups */
  countKey?: string | null;
  /** Whether this widget can be added to pages */
  addableToPages: boolean;
  /** Whether widget is globally managed or page-specific */
  isGlobal: boolean;
}

export interface CategoryDefinition {
  name: string;
  description: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
}

// ============================================
// WIDGET TYPE DEFINITIONS (Flat ordered list)
// ============================================

export const WIDGET_TYPES: WidgetTypeDefinition[] = [
  // 1. Hero Carousel
  {
    type: 'hero_carousel',
    name: 'Hero Carousel',
    icon: ImageIcon,
    category: 'Hero',
    description: 'Full-width hero carousel with slides and product integration',
    table: 'heroSlides',
    adminHref: '/admin/hero-slides',
    countKey: 'heroSlides',
    addableToPages: true,
    isGlobal: true,
  },
  // 2. Story Hero
  {
    type: 'story_hero',
    name: 'Story Hero',
    icon: ImageIcon,
    category: 'Hero',
    description: 'Compact hero with media background and centered text overlay',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  // 3. Floating Badges
  {
    type: 'floating_badges',
    name: 'Floating Badges',
    icon: Sparkles,
    category: 'Content',
    description: 'Fixed position rotating badge overlays',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  // 4. Rich Text
  {
    type: 'text',
    name: 'Rich Text',
    icon: Type,
    category: 'Content',
    description: 'Formatted text for legal pages, about sections, etc.',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  // 5. Two Column Media
  {
    type: 'two_column_feature',
    name: 'Two Column Media',
    icon: LayoutPanelLeft,
    category: 'Content',
    description: 'Full-width split layout with media and text/bullets',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  // 6. Team Cards
  {
    type: 'team_cards',
    name: 'Team Cards',
    icon: Users,
    category: 'Content',
    description: 'Side-by-side team member cards with portrait photos',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  // 7. Social Proof Carousel
  {
    type: 'scale_carousel',
    name: 'Social Proof Carousel',
    icon: PlayCircle,
    category: 'Content',
    description: 'Center-scaled carousel with media items and quotes',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  // 8. Three Column Icons
  {
    type: 'icon_highlights',
    name: 'Three Column Icons',
    icon: Columns3,
    category: 'Content',
    description: '3-column feature bar with icons, titles, and copy',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  // 9. Square Media Carousel
  {
    type: 'media_carousel',
    name: 'Square Media Carousel',
    icon: GalleryHorizontalEnd,
    category: 'Content',
    description: 'Full-bleed horizontal carousel with images and videos',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  // 10. FAQ Accordion
  {
    type: 'faq_drawer',
    name: 'FAQ Accordion',
    icon: MessageCircleQuestion,
    category: 'Content',
    description: 'Expandable Q&A accordion with themed styling',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  // 11. Dynamic Review Wall
  {
    type: 'reviews',
    name: 'Dynamic Review Wall',
    icon: Star,
    category: 'Social Proof',
    description: 'Customer reviews with keyword filters and ratings',
    table: 'reviews',
    adminHref: '/admin/reviews',
    countKey: 'reviews',
    addableToPages: true,
    isGlobal: true,
  },
  // 12. Call to Action
  {
    type: 'cta',
    name: 'Call to Action',
    icon: MousePointerClick,
    category: 'Engagement',
    description: 'CTA button with customizable background',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  // 13. Contact Form
  {
    type: 'contact_form',
    name: 'Contact Form',
    icon: MessageSquare,
    category: 'Engagement',
    description: 'Email contact form',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  // 14. Marquee Bar
  {
    type: 'marquee',
    name: 'Marquee Bar',
    icon: Zap,
    category: 'Engagement',
    description: 'Scrolling text banner',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
];

// ============================================
// DEFAULT CONFIGS
// ============================================

export const DEFAULT_CONFIGS: Record<string, Record<string, unknown>> = {
  text: {
    content: '',
    maxWidth: 'lg',
    theme: 'light',
  },
  media_carousel: {
    items: [],
    autoplay: true,
  },
  reviews: {
    title: 'What People Are Saying',
    subtitle: '',
    productId: null,
    collectionName: null,
    showKeywordFilters: true,
    initialCount: 6,
    backgroundColor: 'cream',
    showVerifiedBadge: true,
    showRatingHeader: true,
    excludedTags: [],
  },
  cta: {
    title: '',
    subtitle: '',
    buttonText: 'Shop Now',
    buttonUrl: '/products',
    buttonSize: 'medium',
    height: 'medium',
    backgroundType: 'color',
    backgroundColor: '#bbdae9',
    backgroundImageUrl: '',
    backgroundVideoUrl: '',
    textTheme: 'dark',
    showSocialProof: false,
    reviewCount: 0,
    avatarUrls: [],
  },
  contact_form: {
    title: 'Get in Touch',
    subtitle: '',
    fields: ['name', 'email', 'message'],
  },
  marquee: {
    text: 'Preservative-Free ✦ Clean Ingredients ✦ Doctor Trusted ✦ Instant Relief',
    speed: 'slow',
    size: 'xxl',
    style: 'dark',
    theme: 'dark',
    separator: '✦',
  },
  icon_highlights: {
    title: '',
    theme: 'blue',
    columns: [
      { iconUrl: '', title: '', description: '' },
      { iconUrl: '', title: '', description: '' },
      { iconUrl: '', title: '', description: '' },
    ],
    linkText: '',
    linkUrl: '',
  },
  two_column_feature: {
    theme: 'blue',
    mediaPosition: 'left',
    mediaMode: 'single',
    mediaUrl: '',
    mediaIsVideo: false,
    beforeMediaUrl: '',
    beforeMediaIsVideo: false,
    beforeLabel: 'BEFORE',
    afterMediaUrl: '',
    afterMediaIsVideo: false,
    afterLabel: 'AFTER',
    textMode: 'title_body',
    textAlignment: 'left',
    showStars: false,
    starCount: 5,
    title: '',
    body: '',
    bulletPoints: [''],
    ctaText: '',
    ctaUrl: '',
  },
  faq_drawer: {
    theme: 'blue',
    items: [{ id: '', question: '', answer: '' }],
  },
  floating_badges: {
    badges: [
      {
        id: '',
        imageUrl: '',
        desktopX: 10,
        desktopY: 20,
        mobileX: 5,
        mobileY: 15,
        desktopSize: 120,
        mobileSize: 80,
        speed: 'medium',
        layer: 'below',
      },
    ],
  },
  story_hero: {
    mediaUrl: '',
    headline: '',
    subheadline: '',
    overlayOpacity: 40,
    height: 'short',
  },
  team_cards: {
    title: '',
    subtitle: '',
    cards: [],
    theme: 'light',
  },
  scale_carousel: {
    title: '',
    subtitle: '',
    items: [],
    aspectRatio: '3:4',
    theme: 'light',
    imageDuration: 5,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a widget definition by type
 */
export function getWidgetByType(type: string): WidgetTypeDefinition | undefined {
  return WIDGET_TYPES.find((w) => w.type === type);
}

/**
 * Get display name for a widget type
 */
export function getWidgetDisplayName(type: string): string {
  const widget = getWidgetByType(type);
  return widget?.name || type;
}

/**
 * Get only widgets that can be added to pages
 */
export function getAddableWidgets(): WidgetTypeDefinition[] {
  return WIDGET_TYPES.filter((w) => w.addableToPages);
}

/**
 * Get only global widgets (managed in dedicated admin pages)
 */
export function getGlobalWidgets(): WidgetTypeDefinition[] {
  return WIDGET_TYPES.filter((w) => w.isGlobal);
}

/**
 * Get only page-specific widgets (stored in page JSON)
 */
export function getPageSpecificWidgets(): WidgetTypeDefinition[] {
  return WIDGET_TYPES.filter((w) => !w.isGlobal);
}

/**
 * Get default config for a widget type
 */
export function getDefaultConfig(type: string): Record<string, unknown> {
  return DEFAULT_CONFIGS[type] || {};
}

// ============================================
// BACKWARD COMPATIBILITY
// (Will be removed in Parts 4-6 when pages are updated)
// ============================================

/**
 * @deprecated Use WIDGET_TYPES directly - categories are being removed
 */
export const WIDGET_CATEGORIES: CategoryDefinition[] = [
  {
    name: 'Hero',
    description: 'Hero sections',
    color: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  },
  {
    name: 'Content',
    description: 'Content blocks',
    color: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  },
  {
    name: 'Social Proof',
    description: 'Reviews and testimonials',
    color: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  },
  {
    name: 'Engagement',
    description: 'CTAs and forms',
    color: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  },
];

/**
 * @deprecated Use WIDGET_TYPES directly
 */
export function getWidgetsByCategory(categoryName: string): WidgetTypeDefinition[] {
  return WIDGET_TYPES.filter((w) => w.category === categoryName);
}

/**
 * @deprecated Use WIDGET_TYPES directly
 */
export function getCategoryByName(name: string): CategoryDefinition | undefined {
  return WIDGET_CATEGORIES.find((c) => c.name === name);
}
