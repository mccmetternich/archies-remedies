import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Site Settings - single row for global config
export const siteSettings = sqliteTable('site_settings', {
  id: text('id').primaryKey(),
  siteName: text('site_name').default('Archie\'s Remedies'),
  tagline: text('tagline'),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),

  // Draft/Maintenance Mode
  siteInDraftMode: integer('site_in_draft_mode', { mode: 'boolean' }).default(false),
  draftModeTitle: text('draft_mode_title').default('Coming Soon'),
  draftModeSubtitle: text('draft_mode_subtitle').default("Pure ingredients. Radiant you."),
  draftModeBadgeUrl: text('draft_mode_badge_url'), // Rotating badge image (PNG) that overlaps the logo
  // Footer style: 'badges' for trust badges, 'quip' for single brand line
  draftModeFooterStyle: text('draft_mode_footer_style').default('badges'), // 'badges' or 'quip'
  // Editable callouts (trust badges underneath form)
  draftModeCallout1: text('draft_mode_callout1').default('Preservative-Free'),
  draftModeCallout2: text('draft_mode_callout2').default('Clean Ingredients'),
  draftModeCallout3: text('draft_mode_callout3').default('Made in USA'),
  // Single brand quip/slogan (alternative to trust badges)
  draftModeBrandQuip: text('draft_mode_brand_quip').default('Where clean beauty meets clear vision.'),
  // Default contact type for coming soon form
  draftModeContactType: text('draft_mode_contact_type').default('phone'), // 'email' or 'phone'

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

  // Welcome Popup (shows on entry)
  welcomePopupEnabled: integer('welcome_popup_enabled', { mode: 'boolean' }).default(true),
  welcomePopupTitle: text('welcome_popup_title').default('Join Our Community'),
  welcomePopupSubtitle: text('welcome_popup_subtitle'),
  welcomePopupButtonText: text('welcome_popup_button_text').default('Subscribe'),
  welcomePopupImageUrl: text('welcome_popup_image_url'),
  welcomePopupDelay: integer('welcome_popup_delay').default(3), // seconds before showing
  welcomePopupDismissDays: integer('welcome_popup_dismiss_days').default(7), // days before showing again

  // Exit Intent Popup
  exitPopupEnabled: integer('exit_popup_enabled', { mode: 'boolean' }).default(false),
  exitPopupTitle: text('exit_popup_title').default('Wait! Before You Go...'),
  exitPopupSubtitle: text('exit_popup_subtitle'),
  exitPopupButtonText: text('exit_popup_button_text').default('Get My Discount'),
  exitPopupImageUrl: text('exit_popup_image_url'),
  exitPopupMinTimeOnSite: integer('exit_popup_min_time_on_site').default(10), // seconds before exit popup can trigger
  exitPopupDismissDays: integer('exit_popup_dismiss_days').default(3), // days before showing again

  // Legacy fields (for backwards compatibility)
  emailPopupEnabled: integer('email_popup_enabled', { mode: 'boolean' }).default(true),
  emailPopupTitle: text('email_popup_title').default('Join Our Community'),
  emailPopupSubtitle: text('email_popup_subtitle'),
  emailPopupButtonText: text('email_popup_button_text').default('Subscribe'),
  emailPopupImageUrl: text('email_popup_image_url'),

  // Announcement Bumper Bar
  bumperEnabled: integer('bumper_enabled', { mode: 'boolean' }).default(false),
  bumperText: text('bumper_text'),
  bumperLinkUrl: text('bumper_link_url'),
  bumperLinkText: text('bumper_link_text'),
  bumperTheme: text('bumper_theme').default('light'), // 'light' (brand blue bg) or 'dark' (black bg, white text)

  // Global Navigation Configuration
  // Logo Position
  navLogoPosition: text('nav_logo_position').default('left'), // 'left' | 'center'
  navLogoPositionMobile: text('nav_logo_position_mobile').default('left'), // 'left' | 'center'

  // CTA Button
  navCtaEnabled: integer('nav_cta_enabled', { mode: 'boolean' }).default(true),
  navCtaText: text('nav_cta_text').default('Shop Now'),
  navCtaUrl: text('nav_cta_url').default('/products/eye-drops'),

  // Dropdown Nav Hero Tiles
  navDropdownTile1ProductId: text('nav_dropdown_tile1_product_id'), // Product ID for first tile
  navDropdownTile1Title: text('nav_dropdown_tile1_title'), // Override product name
  navDropdownTile1Subtitle: text('nav_dropdown_tile1_subtitle'), // Override description
  navDropdownTile1Badge: text('nav_dropdown_tile1_badge'), // e.g., "Bestseller"
  navDropdownTile1BadgeEmoji: text('nav_dropdown_tile1_badge_emoji'), // e.g., "🔥"

  navDropdownTile2ProductId: text('nav_dropdown_tile2_product_id'), // Product ID for second tile
  navDropdownTile2Title: text('nav_dropdown_tile2_title'),
  navDropdownTile2Subtitle: text('nav_dropdown_tile2_subtitle'),
  navDropdownTile2Badge: text('nav_dropdown_tile2_badge'),
  navDropdownTile2BadgeEmoji: text('nav_dropdown_tile2_badge_emoji'),

  // Clean Formulas Info Tile
  navCleanFormulasTitle: text('nav_clean_formulas_title').default('Clean Formulas'),
  navCleanFormulasDescription: text('nav_clean_formulas_description').default('No preservatives, phthalates, parabens, or sulfates.'),
  navCleanFormulasCtaEnabled: integer('nav_clean_formulas_cta_enabled', { mode: 'boolean' }).default(false),
  navCleanFormulasCtaText: text('nav_clean_formulas_cta_text'),
  navCleanFormulasCtaUrl: text('nav_clean_formulas_cta_url'),
  navCleanFormulasBadgeEnabled: integer('nav_clean_formulas_badge_enabled', { mode: 'boolean' }).default(false),
  navCleanFormulasBadgeUrl: text('nav_clean_formulas_badge_url'), // Rotating badge PNG

  // Footer
  massiveFooterLogoUrl: text('massive_footer_logo_url'), // Full-width brand texture logo that spans viewport

  // Social Stats (for consistent social proof across the site)
  totalReviews: integer('total_reviews').default(2900),
  totalCustomers: integer('total_customers').default(10000),
  instagramFollowers: integer('instagram_followers'),
  facebookFollowers: integer('facebook_followers'),
  tiktokFollowers: integer('tiktok_followers'),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Products
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  subtitle: text('subtitle'), // Editorial subtitle e.g., "The Instant Relief Ritual"
  shortDescription: text('short_description'),
  longDescription: text('long_description'), // Rich text

  // Pricing display (for show, actual purchase on Amazon)
  price: real('price'),
  compareAtPrice: real('compare_at_price'),

  // Media
  heroImageUrl: text('hero_image_url'),
  secondaryImageUrl: text('secondary_image_url'), // For rollover effect

  // Badge (editable in admin) - e.g., "Bestseller", "Just Launched"
  badge: text('badge'),
  badgeEmoji: text('badge_emoji'), // e.g., "🔥", "✨"
  rotatingBadgeEnabled: integer('rotating_badge_enabled', { mode: 'boolean' }).default(false),
  rotatingBadgeText: text('rotating_badge_text'), // e.g., "NEW"

  // Rotating Seal (slow-spinning circular badge on gallery)
  rotatingSealEnabled: integer('rotating_seal_enabled', { mode: 'boolean' }).default(false),
  rotatingSealImageUrl: text('rotating_seal_image_url'), // CMS uploadable PNG

  // PDP Drawer Content (accordions)
  ritualTitle: text('ritual_title').default('The Ritual'),
  ritualContent: text('ritual_content'), // How to use/apply - rich text
  ingredientsTitle: text('ingredients_title').default('Ingredients'),
  ingredientsContent: text('ingredients_content'), // Full transparency list - rich text
  shippingTitle: text('shipping_title').default('Good to Know'),
  shippingContent: text('shipping_content'), // Shipping & Returns - rich text

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

  // Primary button
  buttonText: text('button_text'),
  buttonUrl: text('button_url'),

  // Secondary button
  secondaryButtonText: text('secondary_button_text'),
  secondaryButtonUrl: text('secondary_button_url'),
  secondaryButtonType: text('secondary_button_type').default('page'), // 'page', 'anchor', 'external'
  secondaryAnchorTarget: text('secondary_anchor_target'), // Widget ID or path with anchor (e.g., "/products/eye-drops#benefits")

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
  pageType: text('page_type').default('content'), // content, landing, product
  content: text('content'), // Rich text for simple pages
  widgets: text('widgets'), // JSON array of widget configs for landing pages
  heroImageUrl: text('hero_image_url'),
  heroTitle: text('hero_title'),
  heroSubtitle: text('hero_subtitle'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  showInNav: integer('show_in_nav', { mode: 'boolean' }).default(false),
  navOrder: integer('nav_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Email Subscribers
export const emailSubscribers = sqliteTable('email_subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  source: text('source'), // popup, footer, etc.
  subscribedAt: text('subscribed_at').default(sql`CURRENT_TIMESTAMP`),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Contact Submissions
export const contactSubmissions = sqliteTable('contact_submissions', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  name: text('name').notNull(), // Full name for backwards compatibility
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  status: text('status').default('new'), // new, pending, resolved
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  // Link to unified contacts table for viewing contact history
  contactId: text('contact_id'),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Page Views / Visitor Tracking
export const pageViews = sqliteTable('page_views', {
  id: text('id').primaryKey(),
  path: text('path').notNull(),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  visitorId: text('visitor_id'), // Anonymous visitor identifier
  sessionId: text('session_id'),
  country: text('country'),
  city: text('city'),
  device: text('device'), // desktop, mobile, tablet
  browser: text('browser'),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Admin Users
export const adminUsers = sqliteTable('admin_users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  lastLoginAt: text('last_login_at'),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Admin Sessions (for secure session management)
export const adminSessions = sqliteTable('admin_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Navigation Items
export const navigationItems = sqliteTable('navigation_items', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  url: text('url'),
  type: text('type').default('link'), // link, dropdown, mega
  productId: text('product_id').references(() => products.id),
  parentId: text('parent_id'),
  imageUrl: text('image_url'),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Click Tracking (external link clicks)
export const clickTracking = sqliteTable('click_tracking', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id),
  productSlug: text('product_slug'),
  destinationUrl: text('destination_url').notNull(),
  visitorId: text('visitor_id'),
  sessionId: text('session_id'),
  referrer: text('referrer'),
  userAgent: text('user_agent'),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Footer Links
export const footerLinks = sqliteTable('footer_links', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  url: text('url').notNull(),
  column: text('column').default('Shop'), // Column header: Shop, Support, Company, Legal
  isExternal: integer('is_external', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Product Reviews (detailed reviews for PDP)
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  rating: integer('rating').default(5), // 1-5 stars
  title: text('title'), // Review headline e.g., "Finally, a drop that doesn't burn."
  authorName: text('author_name').notNull(),
  authorInitial: text('author_initial'), // e.g., "Sarah J."
  text: text('text').notNull(), // Full review text
  keywords: text('keywords'), // JSON array of keyword strings e.g., ["No Stinging", "Contacts Safe"]
  isVerified: integer('is_verified', { mode: 'boolean' }).default(true),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Review Keywords (aggregated for filter bubbles)
export const reviewKeywords = sqliteTable('review_keywords', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  keyword: text('keyword').notNull(),
  count: integer('count').default(1), // Number of reviews with this keyword
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Product Certifications (Certification Trio widget)
export const productCertifications = sqliteTable('product_certifications', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  icon: text('icon').notNull(), // Icon name: droplet, eye, flag, leaf, sparkle, cross
  title: text('title').notNull(), // e.g., "Preservative Free"
  description: text('description'), // e.g., "Single-use vials, no irritating preservatives"
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Blog Posts
export const blogPosts = sqliteTable('blog_posts', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'), // Short preview text
  content: text('content'), // Rich text content
  featuredImageUrl: text('featured_image_url'),
  authorName: text('author_name').default('Archie\'s Remedies'),
  authorAvatarUrl: text('author_avatar_url'),

  // Status
  status: text('status').default('draft'), // draft, published, scheduled
  publishedAt: text('published_at'),
  scheduledAt: text('scheduled_at'),

  // Feature flags
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false), // Featured = full-width hero

  // SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),

  // Reading time estimate (in minutes)
  readingTime: integer('reading_time').default(5),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Blog Tags
export const blogTags = sqliteTable('blog_tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color').default('#bbdae9'), // Tag color for styling

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Blog Post Tags (many-to-many)
export const blogPostTags = sqliteTable('blog_post_tags', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => blogTags.id, { onDelete: 'cascade' }),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Media Library
export const mediaFiles = sqliteTable('media_files', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(), // Original filename
  url: text('url').notNull(), // Full URL to the file
  thumbnailUrl: text('thumbnail_url'), // Optional thumbnail for images
  mimeType: text('mime_type'), // image/jpeg, image/png, etc.
  fileSize: integer('file_size'), // Size in bytes
  width: integer('width'), // Image width in pixels
  height: integer('height'), // Image height in pixels
  altText: text('alt_text'), // Alt text for accessibility
  folder: text('folder').default('general'), // Folder/category: general, products, blog, etc.
  tags: text('tags'), // JSON array of tags for searching

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Custom Popups - page-specific with advanced features
export const customPopups = sqliteTable('custom_popups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // Internal name for admin
  title: text('title'), // Popup headline
  body: text('body'), // Rich text body content

  // Media
  videoUrl: text('video_url'), // YouTube/Vimeo embed URL
  videoThumbnailUrl: text('video_thumbnail_url'), // Thumbnail for video
  imageUrl: text('image_url'), // Alternative to video

  // CTA Configuration
  ctaType: text('cta_type').default('email'), // 'email' | 'sms' | 'download' | 'none'
  ctaButtonText: text('cta_button_text').default('Subscribe'),
  downloadFileUrl: text('download_file_url'), // PDF/file URL for download CTA
  downloadFileName: text('download_file_name'), // Display name for download

  // Targeting
  targetType: text('target_type').default('all'), // 'all' | 'specific' | 'product'
  targetPages: text('target_pages'), // JSON array of page slugs
  targetProductIds: text('target_product_ids'), // JSON array of product IDs

  // Trigger Configuration
  triggerType: text('trigger_type').default('timer'), // 'timer' | 'exit' | 'scroll'
  triggerDelay: integer('trigger_delay').default(5), // Seconds for timer trigger
  triggerScrollPercent: integer('trigger_scroll_percent').default(50), // % for scroll trigger
  dismissDays: integer('dismiss_days').default(7), // Days before showing again after dismiss

  // Status
  status: text('status').default('draft'), // 'draft' | 'live'
  priority: integer('priority').default(0), // Higher = shows first if multiple match

  // Analytics
  viewCount: integer('view_count').default(0),
  conversionCount: integer('conversion_count').default(0),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Unified Contacts (replaces emailSubscribers)
export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  email: text('email').unique(), // Can be null if SMS-only
  phone: text('phone'), // E.164 format for SMS

  // Profile
  firstName: text('first_name'),
  lastName: text('last_name'),

  // Address
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country'),

  // Notes
  notes: text('notes'), // Editable notes by admin

  // Source Tracking
  source: text('source'), // 'welcome_popup' | 'exit_popup' | 'custom_popup' | 'footer' | 'product_page'
  sourcePopupId: text('source_popup_id').references(() => customPopups.id),
  visitorId: text('visitor_id'), // Link to anonymous visitor

  // Status
  emailStatus: text('email_status').default('active'), // 'active' | 'inactive' | 'bounced'
  smsStatus: text('sms_status').default('none'), // 'active' | 'inactive' | 'none'

  // Consent timestamps
  emailConsentAt: text('email_consent_at'),
  smsConsentAt: text('sms_consent_at'),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Contact Activity Tracking
export const contactActivity = sqliteTable('contact_activity', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),

  // Activity Type
  activityType: text('activity_type').notNull(), // 'popup_view' | 'popup_submit' | 'product_cta_click' | 'page_view' | 'email_open' | 'sms_click'

  // Activity Context
  activityData: text('activity_data'), // JSON with additional context
  popupId: text('popup_id').references(() => customPopups.id),
  productId: text('product_id').references(() => products.id),
  pageSlug: text('page_slug'),

  // Visitor Info (for linking before contact created)
  visitorId: text('visitor_id'),
  sessionId: text('session_id'),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Preview Tokens (for URL-based draft site preview)
export const previewTokens = sqliteTable('preview_tokens', {
  id: text('id').primaryKey(),
  token: text('token').notNull().unique(),
  createdById: text('created_by_id').references(() => adminUsers.id),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// DATABASE INDEXES FOR PERFORMANCE
// ============================================

// Product indexes - for slug lookups and listing queries
export const productsSlugIdx = index('idx_products_slug').on(products.slug);
export const productsActiveIdx = index('idx_products_active').on(products.isActive);

// Blog post indexes - for slug lookups and status filtering
export const blogPostsSlugIdx = index('idx_blog_posts_slug').on(blogPosts.slug);
export const blogPostsStatusIdx = index('idx_blog_posts_status').on(blogPosts.status);
export const blogPostsPublishedAtIdx = index('idx_blog_posts_published_at').on(blogPosts.publishedAt);

// Blog post tags - for many-to-many joins
export const blogPostTagsPostIdIdx = index('idx_blog_post_tags_post_id').on(blogPostTags.postId);
export const blogPostTagsTagIdIdx = index('idx_blog_post_tags_tag_id').on(blogPostTags.tagId);

// Contact indexes - for email lookups and filtering
export const contactsEmailIdx = index('idx_contacts_email').on(contacts.email);
export const contactsEmailStatusIdx = index('idx_contacts_email_status').on(contacts.emailStatus);
export const contactsCreatedAtIdx = index('idx_contacts_created_at').on(contacts.createdAt);

// Contact activity - for lookup by contact and type
export const contactActivityContactIdIdx = index('idx_contact_activity_contact_id').on(contactActivity.contactId);
export const contactActivityTypeIdx = index('idx_contact_activity_type').on(contactActivity.activityType);

// Page views - for analytics queries
export const pageViewsVisitorIdIdx = index('idx_page_views_visitor_id').on(pageViews.visitorId);
export const pageViewsCreatedAtIdx = index('idx_page_views_created_at').on(pageViews.createdAt);
export const pageViewsPathIdx = index('idx_page_views_path').on(pageViews.path);

// Click tracking - for analytics
export const clickTrackingProductIdIdx = index('idx_click_tracking_product_id').on(clickTracking.productId);
export const clickTrackingCreatedAtIdx = index('idx_click_tracking_created_at').on(clickTracking.createdAt);

// Admin sessions - for token lookups
export const adminSessionsTokenIdx = index('idx_admin_sessions_token').on(adminSessions.token);
export const adminSessionsUserIdIdx = index('idx_admin_sessions_user_id').on(adminSessions.userId);

// Pages - for slug lookups
export const pagesSlugIdx = index('idx_pages_slug').on(pages.slug);

// Media files - for folder filtering
export const mediaFilesFolderIdx = index('idx_media_files_folder').on(mediaFiles.folder);

// Testimonials - for active filtering
export const testimonialsActiveIdx = index('idx_testimonials_active').on(testimonials.isActive);

// Reviews - for product-specific queries
export const reviewsProductIdIdx = index('idx_reviews_product_id').on(reviews.productId);
export const reviewsActiveIdx = index('idx_reviews_active').on(reviews.isActive);

// Preview tokens - for token lookups
export const previewTokensTokenIdx = index('idx_preview_tokens_token').on(previewTokens.token);
