/**
 * Centralized Widget Library Configuration
 *
 * This is the SINGLE SOURCE OF TRUTH for all widget definitions.
 * Used by:
 * - /admin/widgets (global widget library page)
 * - Page editor widget sidebar
 * - Widget config panels
 *
 * To add a new widget:
 * 1. Add it to the appropriate category in WIDGET_TYPES
 * 2. Create the widget component if needed
 * 3. Add default config in DEFAULT_CONFIGS
 */

import {
  Image as ImageIcon,
  Type,
  Quote,
  Star,
  HelpCircle,
  MessageSquare,
  Instagram,
  PlayCircle,
  Columns,
  Columns3,
  Video,
  MousePointerClick,
  Grid3X3,
  Sparkles,
  List,
  Award,
  Megaphone,
  Gift,
  Zap,
  Target,
  GalleryHorizontalEnd,
  LayoutPanelLeft,
  MessageCircleQuestion,
  LucideIcon,
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
  table?: 'heroSlides' | 'testimonials' | 'videoTestimonials' | 'faqs' | 'instagramPosts' | 'reviews' | null;
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
// CATEGORY DEFINITIONS
// ============================================

export const WIDGET_CATEGORIES: CategoryDefinition[] = [
  {
    name: 'Hero',
    description: 'Hero sections and carousels',
    color: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/30' },
  },
  {
    name: 'Content',
    description: 'Core content blocks for building pages',
    color: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  },
  {
    name: 'Social Proof',
    description: 'Build trust with customer reviews and social content',
    color: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  },
  {
    name: 'Product',
    description: 'Showcase products and their benefits',
    color: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  },
  {
    name: 'Engagement',
    description: 'Interactive elements to engage visitors',
    color: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  },
];

// ============================================
// WIDGET TYPE DEFINITIONS
// ============================================

export const WIDGET_TYPES: WidgetTypeDefinition[] = [
  // ─────────────────────────────────────────
  // HERO
  // ─────────────────────────────────────────
  {
    type: 'hero_carousel',
    name: 'Hero Carousel',
    icon: ImageIcon,
    category: 'Hero',
    description: 'Full-width hero carousel with product integration',
    table: 'heroSlides',
    adminHref: '/admin/hero-slides',
    countKey: 'heroSlides',
    addableToPages: true,
    isGlobal: true,
  },

  // ─────────────────────────────────────────
  // CONTENT
  // ─────────────────────────────────────────
  {
    type: 'text',
    name: 'Text Block',
    icon: Type,
    category: 'Content',
    description: 'Rich text content section',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  {
    type: 'image_text',
    name: 'Image + Text',
    icon: Columns,
    category: 'Content',
    description: 'Split layout with image and copy',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  {
    type: 'video',
    name: 'Video Embed',
    icon: Video,
    category: 'Content',
    description: 'Embedded video player',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  {
    type: 'media_carousel',
    name: 'Media Carousel',
    icon: GalleryHorizontalEnd,
    category: 'Content',
    description: 'Full-bleed horizontal carousel with images and videos',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  {
    type: 'quote',
    name: 'Pull Quote',
    icon: Quote,
    category: 'Content',
    description: 'Testimonial or pull quote block',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  {
    type: 'mission',
    name: 'Mission Section',
    icon: Target,
    category: 'Content',
    description: 'Brand mission with stats and CTA',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  {
    type: 'icon_highlights',
    name: 'Icon Highlights',
    icon: Columns3,
    category: 'Content',
    description: '3-column feature bar with icons, titles, and copy',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  {
    type: 'two_column_feature',
    name: 'Two Column Feature',
    icon: LayoutPanelLeft,
    category: 'Content',
    description: 'Full-width split layout with media and text/bullets',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  {
    type: 'faq_drawer',
    name: 'FAQ Drawer',
    icon: MessageCircleQuestion,
    category: 'Content',
    description: 'Expandable Q&A accordion with themed styling',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },

  // ─────────────────────────────────────────
  // SOCIAL PROOF
  // ─────────────────────────────────────────
  {
    type: 'testimonials',
    name: 'Testimonials',
    icon: Star,
    category: 'Social Proof',
    description: 'Customer testimonial carousel',
    table: 'testimonials',
    adminHref: '/admin/testimonials',
    countKey: 'testimonials',
    addableToPages: true,
    isGlobal: true,
  },
  {
    type: 'video_testimonials',
    name: 'Video Reviews',
    icon: PlayCircle,
    category: 'Social Proof',
    description: 'Video testimonial grid',
    table: 'videoTestimonials',
    adminHref: '/admin/video-testimonials',
    countKey: 'videoTestimonials',
    addableToPages: true,
    isGlobal: true,
  },
  {
    type: 'instagram',
    name: 'Instagram Feed',
    icon: Instagram,
    category: 'Social Proof',
    description: 'Instagram post grid',
    table: 'instagramPosts',
    adminHref: '/admin/instagram',
    countKey: 'instagramPosts',
    addableToPages: true,
    isGlobal: true,
  },
  {
    type: 'reviews',
    name: 'Reviews',
    icon: Star,
    category: 'Social Proof',
    description: 'Customer reviews with keyword filters',
    table: 'reviews',
    adminHref: '/admin/reviews',
    countKey: 'reviews',
    addableToPages: true,
    isGlobal: true,
  },
  {
    type: 'press',
    name: 'Press & Media',
    icon: Megaphone,
    category: 'Social Proof',
    description: 'As seen in logos',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },

  // ─────────────────────────────────────────
  // PRODUCT
  // ─────────────────────────────────────────
  {
    type: 'product_grid',
    name: 'Product Grid',
    icon: Grid3X3,
    category: 'Product',
    description: 'Featured products showcase',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  {
    type: 'benefits',
    name: 'Benefits',
    icon: Sparkles,
    category: 'Product',
    description: 'Product benefits with icons',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  {
    type: 'ingredients',
    name: 'Ingredients',
    icon: List,
    category: 'Product',
    description: 'Ingredient list with info',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  {
    type: 'comparison',
    name: 'Comparison',
    icon: Columns,
    category: 'Product',
    description: 'Before/after comparison',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
  {
    type: 'certifications',
    name: 'Certifications',
    icon: Award,
    category: 'Product',
    description: 'Trust badges and certifications',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },

  // ─────────────────────────────────────────
  // ENGAGEMENT
  // ─────────────────────────────────────────
  {
    type: 'faqs',
    name: 'FAQs',
    icon: HelpCircle,
    category: 'Engagement',
    description: 'Accordion FAQ section',
    table: 'faqs',
    adminHref: '/admin/faqs',
    countKey: 'faqs',
    addableToPages: true,
    isGlobal: true,
  },
  {
    type: 'cta',
    name: 'Call to Action',
    icon: MousePointerClick,
    category: 'Engagement',
    description: 'Button with background',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
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
  {
    type: 'newsletter',
    name: 'Newsletter',
    icon: Gift,
    category: 'Engagement',
    description: 'Email signup form',
    table: null,
    adminHref: null,
    countKey: null,
    addableToPages: true,
    isGlobal: false,
  },
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
    alignment: 'left',
    maxWidth: 'prose',
  },
  image_text: {
    imageUrl: '',
    imagePosition: 'left',
    title: '',
    content: '',
    ctaText: '',
    ctaUrl: '',
  },
  video: {
    videoUrl: '',
    autoplay: false,
    muted: true,
    loop: false,
  },
  media_carousel: {
    items: [],
    autoplay: true,
  },
  quote: {
    text: '',
    author: '',
    authorTitle: '',
    avatarUrl: '',
  },
  mission: {
    title: 'Our Mission',
    subtitle: '',
    content: '',
    imageUrl: '',
    stats: [],
    ctaText: '',
    ctaUrl: '',
  },
  reviews: {
    title: 'What People Are Saying',
    subtitle: '',
    productId: null, // null = all products
    collectionName: null, // null = not using collection
    showKeywordFilters: true,
    initialCount: 6,
    backgroundColor: 'cream', // 'cream', 'white', 'transparent'
    showVerifiedBadge: true,
    showRatingHeader: true,
    excludedTags: [],
  },
  press: {
    title: 'As Seen In',
    logos: [],
  },
  product_grid: {
    title: 'Clean Formulas for Sensitive Eyes',
    subtitle: 'Preservative-free eye care, crafted without the questionable ingredients.',
    product1: {
      productId: null,
      title: null,
      description: null,
      imageUrl: null,
      hoverImageUrl: null,
      badge: null,
      badgeEmoji: null,
      badgeBgColor: null,
      badgeTextColor: null,
    },
    product2: {
      productId: null,
      title: null,
      description: null,
      imageUrl: null,
      hoverImageUrl: null,
      badge: null,
      badgeEmoji: null,
      badgeBgColor: null,
      badgeTextColor: null,
    },
  },
  benefits: {
    title: 'Why Choose Us',
    benefits: [],
    layout: 'grid',
  },
  ingredients: {
    title: 'Key Ingredients',
    ingredients: [],
    showDetails: true,
  },
  comparison: {
    title: 'See the Difference',
    beforeImage: '',
    afterImage: '',
    beforeLabel: 'Before',
    afterLabel: 'After',
  },
  certifications: {
    title: 'Quality & Trust',
    badges: [],
  },
  cta: {
    title: '',
    subtitle: '',
    buttonText: 'Shop Now',
    buttonUrl: '/products',
    backgroundColor: '#bbdae9',
  },
  contact_form: {
    title: 'Get in Touch',
    subtitle: '',
    fields: ['name', 'email', 'message'],
  },
  newsletter: {
    title: 'Stay Updated',
    subtitle: 'Join our newsletter for exclusive offers',
    buttonText: 'Subscribe',
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
    theme: 'blue', // 'blue' | 'dark' | 'cream'
    columns: [
      { iconUrl: '', title: '', description: '' },
      { iconUrl: '', title: '', description: '' },
      { iconUrl: '', title: '', description: '' },
    ],
    linkText: '',
    linkUrl: '',
  },
  two_column_feature: {
    theme: 'blue', // 'blue' | 'dark' | 'cream'
    mediaPosition: 'left', // 'left' | 'right'
    mediaMode: 'single', // 'single' | 'before_after'
    mediaUrl: '',
    mediaIsVideo: false,
    beforeMediaUrl: '',
    beforeMediaIsVideo: false,
    beforeLabel: 'BEFORE',
    afterMediaUrl: '',
    afterMediaIsVideo: false,
    afterLabel: 'AFTER',
    textMode: 'title_body', // 'title_body' | 'bullet_points'
    textAlignment: 'left', // 'left' | 'center' | 'right'
    showStars: false,
    starCount: 5,
    title: '',
    body: '',
    bulletPoints: [''],
    ctaText: '',
    ctaUrl: '',
  },
  faq_drawer: {
    theme: 'blue', // 'blue' | 'dark' | 'cream'
    items: [{ id: '', question: '', answer: '' }],
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
 * Get widgets grouped by category
 */
export function getWidgetsByCategory(): Record<string, WidgetTypeDefinition[]> {
  return WIDGET_TYPES.reduce(
    (acc, widget) => {
      if (!acc[widget.category]) {
        acc[widget.category] = [];
      }
      acc[widget.category].push(widget);
      return acc;
    },
    {} as Record<string, WidgetTypeDefinition[]>
  );
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
 * Get category definition by name
 */
export function getCategoryByName(name: string): CategoryDefinition | undefined {
  return WIDGET_CATEGORIES.find((c) => c.name === name);
}

/**
 * Get default config for a widget type
 */
export function getDefaultConfig(type: string): Record<string, unknown> {
  return DEFAULT_CONFIGS[type] || {};
}

/**
 * Get ordered list of categories that have widgets
 */
export function getOrderedCategories(): string[] {
  const categoriesWithWidgets = new Set(WIDGET_TYPES.map((w) => w.category));
  return WIDGET_CATEGORIES.filter((c) => categoriesWithWidgets.has(c.name)).map((c) => c.name);
}
