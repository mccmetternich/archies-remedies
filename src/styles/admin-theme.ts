/**
 * Admin Theme Constants
 *
 * This file provides TypeScript constants for admin panel styling.
 * Import these values in components for consistent theming.
 *
 * To update the admin theme globally:
 * 1. Modify values here
 * 2. Run: npm run update-admin-theme (or use the script in package.json)
 *
 * The CSS file (admin-theme.css) uses CSS variables that reference these same values.
 */

export const adminTheme = {
  // ========================================
  // BACKGROUND COLORS
  // ========================================

  /** Main page background - darkest */
  bg: '#121212',

  /** Sidebar and header background */
  sidebar: '#1a1a1a',

  /** Card/panel backgrounds */
  card: '#1e1e1e',

  /** Input fields, hover states, nested elements */
  input: '#242424',

  /** Hover states for interactive elements */
  hover: '#2a2a2a',

  // ========================================
  // BORDER COLORS
  // ========================================

  /** Primary border color */
  border: '#2a2a2a',

  /** Lighter border for cards and sections */
  borderLight: '#2e2e2e',

  /** Subtle dividers */
  divider: '#353535',

  // ========================================
  // TEXT COLORS
  // ========================================

  /** Primary text - white */
  textPrimary: '#ffffff',

  /** Secondary text - light gray */
  textSecondary: '#9ca3af',

  /** Muted text - darker gray */
  textMuted: '#71717a',

  /** Placeholder text */
  textPlaceholder: '#6b7280',

  // ========================================
  // INTERACTIVE COLORS
  // ========================================

  /** Button text on primary background */
  buttonText: '#121212',

  // ========================================
  // STATUS COLORS
  // ========================================

  success: '#22c55e',
  successBg: 'rgba(34, 197, 94, 0.1)',
  successBorder: 'rgba(34, 197, 94, 0.2)',

  warning: '#f97316',
  warningBg: 'rgba(249, 115, 22, 0.1)',
  warningBorder: 'rgba(249, 115, 22, 0.2)',

  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.2)',

  info: '#3b82f6',
  infoBg: 'rgba(59, 130, 246, 0.1)',
  infoBorder: 'rgba(59, 130, 246, 0.2)',
} as const;

// Type for the theme object
export type AdminTheme = typeof adminTheme;

// Light theme values
export const adminThemeLight = {
  bg: '#f8f9fa',
  sidebar: '#ffffff',
  card: '#ffffff',
  input: '#f1f3f5',
  hover: '#e9ecef',
  border: '#dee2e6',
  borderLight: '#e9ecef',
  divider: '#ced4da',
  textPrimary: '#212529',
  textSecondary: '#495057',
  textMuted: '#868e96',
  textPlaceholder: '#adb5bd',
  buttonText: '#ffffff',
  success: '#198754',
  successBg: 'rgba(25, 135, 84, 0.1)',
  successBorder: 'rgba(25, 135, 84, 0.2)',
  warning: '#fd7e14',
  warningBg: 'rgba(253, 126, 20, 0.1)',
  warningBorder: 'rgba(253, 126, 20, 0.2)',
  error: '#dc3545',
  errorBg: 'rgba(220, 53, 69, 0.1)',
  errorBorder: 'rgba(220, 53, 69, 0.2)',
  info: '#0d6efd',
  infoBg: 'rgba(13, 110, 253, 0.1)',
  infoBorder: 'rgba(13, 110, 253, 0.2)',
} as const;

// ========================================
// TAILWIND CLASS HELPERS
// ========================================

/**
 * Common Tailwind class combinations for admin components.
 * Use these to ensure consistent styling across the admin panel.
 */
export const adminStyles = {
  // Backgrounds
  pageBg: `bg-[${adminTheme.bg}]`,
  cardBg: `bg-[${adminTheme.card}]`,
  inputBg: `bg-[${adminTheme.input}]`,
  sidebarBg: `bg-[${adminTheme.sidebar}]`,

  // Borders
  border: `border-[${adminTheme.border}]`,
  borderLight: `border-[${adminTheme.borderLight}]`,

  // Text
  textPrimary: 'text-white',
  textSecondary: `text-[${adminTheme.textSecondary}]`,
  textMuted: `text-[${adminTheme.textMuted}]`,

  // Common component styles
  card: `bg-[${adminTheme.card}] rounded-xl border border-[${adminTheme.borderLight}]`,
  input: `px-4 py-3 bg-[${adminTheme.input}] border border-[${adminTheme.borderLight}] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors`,
  button: `px-5 py-2.5 rounded-lg font-medium bg-[var(--primary)] text-[${adminTheme.buttonText}] hover:bg-[var(--primary-dark)] transition-all`,
  buttonSecondary: `px-4 py-2.5 bg-[${adminTheme.input}] border border-[${adminTheme.borderLight}] rounded-lg text-white hover:bg-[${adminTheme.hover}] transition-colors`,
} as const;

// ========================================
// CSS VARIABLE MAPPING
// ========================================

/**
 * Maps theme values to CSS variable names.
 * Useful for generating CSS or updating styles programmatically.
 */
export const cssVariables = {
  '--admin-bg': adminTheme.bg,
  '--admin-sidebar': adminTheme.sidebar,
  '--admin-card': adminTheme.card,
  '--admin-input': adminTheme.input,
  '--admin-hover': adminTheme.hover,
  '--admin-border': adminTheme.border,
  '--admin-border-light': adminTheme.borderLight,
  '--admin-divider': adminTheme.divider,
  '--admin-text-primary': adminTheme.textPrimary,
  '--admin-text-secondary': adminTheme.textSecondary,
  '--admin-text-muted': adminTheme.textMuted,
  '--admin-text-placeholder': adminTheme.textPlaceholder,
  '--admin-button-text': adminTheme.buttonText,
  '--admin-success': adminTheme.success,
  '--admin-success-bg': adminTheme.successBg,
  '--admin-success-border': adminTheme.successBorder,
  '--admin-warning': adminTheme.warning,
  '--admin-warning-bg': adminTheme.warningBg,
  '--admin-warning-border': adminTheme.warningBorder,
  '--admin-error': adminTheme.error,
  '--admin-error-bg': adminTheme.errorBg,
  '--admin-error-border': adminTheme.errorBorder,
  '--admin-info': adminTheme.info,
  '--admin-info-bg': adminTheme.infoBg,
  '--admin-info-border': adminTheme.infoBorder,
} as const;

// ========================================
// ADMIN SITEMAP
// ========================================

/**
 * Complete list of all admin pages for reference.
 * Use this to ensure no pages are forgotten when making global changes.
 */
export const adminSitemap = {
  dashboard: '/admin',
  performance: '/admin/performance',

  // Content
  pages: {
    list: '/admin/pages',
    edit: '/admin/pages/[id]',
  },
  products: {
    list: '/admin/products',
    edit: '/admin/products/[id]',
  },
  blog: {
    list: '/admin/blog',
    edit: '/admin/blog/[id]',
    tags: '/admin/blog/tags',
  },
  widgets: '/admin/widgets',
  navigation: '/admin/navigation',
  media: '/admin/media',

  // Marketing
  contacts: '/admin/contacts',
  popups: '/admin/popups',
  tracking: '/admin/tracking',
  inbox: '/admin/inbox',
  instagram: '/admin/instagram',

  // Settings
  settings: {
    site: '/admin/settings',
    global: '/admin/settings/global',
  },

  // Widget pages (content types)
  heroSlides: '/admin/hero-slides',
  testimonials: '/admin/testimonials',
  videoTestimonials: '/admin/video-testimonials',
  faqs: '/admin/faqs',

  // Auth (separate layout)
  login: '/admin/login',
} as const;

/**
 * Flat list of all admin paths for bulk operations
 */
export const allAdminPaths = [
  '/admin',
  '/admin/performance',
  '/admin/pages',
  '/admin/pages/[id]',
  '/admin/products',
  '/admin/products/[id]',
  '/admin/blog',
  '/admin/blog/[id]',
  '/admin/blog/tags',
  '/admin/widgets',
  '/admin/navigation',
  '/admin/media',
  '/admin/contacts',
  '/admin/popups',
  '/admin/tracking',
  '/admin/inbox',
  '/admin/instagram',
  '/admin/settings',
  '/admin/settings/global',
  '/admin/hero-slides',
  '/admin/testimonials',
  '/admin/video-testimonials',
  '/admin/faqs',
  '/admin/contacts',
  '/admin/login',
] as const;
