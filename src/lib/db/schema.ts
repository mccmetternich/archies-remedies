import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Site Settings - single row for global config
export const siteSettings = sqliteTable('site_settings', {
  id: text('id').primaryKey(),
  siteName: text('site_name').default('Archie\'s Remedies'),
  tagline: text('tagline'),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),

  // Colors
  primaryColor: text('primary_color').default('#bbdae9'),
  secondaryColor: text('secondary_color').default('#f5f0eb'),
  accentColor: text('accent_color'),

  // Meta & SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  ogImageUrl: text('og_image_url'),

  // Social Links
  instagramUrl: text('instagram_url'),
  facebookUrl: text('facebook_url'),
  tiktokUrl: text('tiktok_url'),
  amazonStoreUrl: text('amazon_store_url'),

  // Tracking
  facebookPixelId: text('facebook_pixel_id'),
  googleAnalyticsId: text('google_analytics_id'),
  tiktokPixelId: text('tiktok_pixel_id'),

  // Contact
  contactEmail: text('contact_email'),

  // Email Popup
  emailPopupEnabled: integer('email_popup_enabled', { mode: 'boolean' }).default(true),
  emailPopupTitle: text('email_popup_title').default('Join Our Community'),
  emailPopupSubtitle: text('email_popup_subtitle'),
  emailPopupButtonText: text('email_popup_button_text').default('Subscribe'),
  emailPopupImageUrl: text('email_popup_image_url'),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Products
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  shortDescription: text('short_description'),
  longDescription: text('long_description'), // Rich text

  // Pricing display (for show, actual purchase on Amazon)
  price: real('price'),
  compareAtPrice: real('compare_at_price'),

  // Media
  heroImageUrl: text('hero_image_url'),

  // SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),

  // Display
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Product Variants (e.g., 30 count, 60 count)
export const productVariants = sqliteTable('product_variants', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., "30 Count", "60 Count"
  price: real('price'),
  compareAtPrice: real('compare_at_price'),
  amazonUrl: text('amazon_url').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Product Images (carousel)
export const productImages = sqliteTable('product_images', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  altText: text('alt_text'),
  isVideo: integer('is_video', { mode: 'boolean' }).default(false),
  videoUrl: text('video_url'), // Vimeo URL or uploaded video
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Product Benefits (What's In / What's Not widget)
export const productBenefits = sqliteTable('product_benefits', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  isPositive: integer('is_positive', { mode: 'boolean' }).default(true), // true = "What's In", false = "What's Not"
  iconName: text('icon_name'),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Homepage Widgets
export const homepageWidgets = sqliteTable('homepage_widgets', {
  id: text('id').primaryKey(),
  widgetType: text('widget_type').notNull(), // hero_carousel, social_proof, testimonials, mission, video_carousel, instagram_feed
  title: text('title'),
  subtitle: text('subtitle'),
  content: text('content'), // Rich text or JSON config
  isVisible: integer('is_visible', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Hero Slides
export const heroSlides = sqliteTable('hero_slides', {
  id: text('id').primaryKey(),
  title: text('title'),
  subtitle: text('subtitle'),
  buttonText: text('button_text'),
  buttonUrl: text('button_url'),
  imageUrl: text('image_url').notNull(),
  mobileImageUrl: text('mobile_image_url'),
  testimonialText: text('testimonial_text'),
  testimonialAuthor: text('testimonial_author'),
  testimonialAvatarUrl: text('testimonial_avatar_url'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Testimonials
export const testimonials = sqliteTable('testimonials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location'),
  avatarUrl: text('avatar_url'),
  rating: integer('rating').default(5),
  text: text('text').notNull(),
  productId: text('product_id').references(() => products.id),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(true),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Video Testimonials (social proof carousel)
export const videoTestimonials = sqliteTable('video_testimonials', {
  id: text('id').primaryKey(),
  title: text('title'),
  thumbnailUrl: text('thumbnail_url').notNull(),
  videoUrl: text('video_url').notNull(), // Vimeo or uploaded
  name: text('name'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Instagram Posts (manual upload)
export const instagramPosts = sqliteTable('instagram_posts', {
  id: text('id').primaryKey(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  postUrl: text('post_url'), // Link to actual IG post or account
  caption: text('caption'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// FAQs
export const faqs = sqliteTable('faqs', {
  id: text('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(), // Rich text
  category: text('category'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Pages (About, Contact, Terms, Privacy, etc.)
export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content'), // Rich text
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Email Subscribers
export const emailSubscribers = sqliteTable('email_subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  source: text('source'), // popup, footer, etc.
  subscribedAt: text('subscribed_at').default(sql`CURRENT_TIMESTAMP`),
});

// Contact Submissions
export const contactSubmissions = sqliteTable('contact_submissions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Navigation Items
export const navigationItems = sqliteTable('navigation_items', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  url: text('url'),
  type: text('type').default('link'), // link, product_tile, dropdown
  productId: text('product_id').references(() => products.id),
  parentId: text('parent_id'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Footer Links
export const footerLinks = sqliteTable('footer_links', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  url: text('url').notNull(),
  column: integer('column').default(1), // Which footer column
  isExternal: integer('is_external', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
