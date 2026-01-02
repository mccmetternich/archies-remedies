import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(100),
  password: z.string().min(1, 'Password is required').max(200),
});

// Contact form schema (public submission)
export const contactFormSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  name: z.string().max(200).optional(),
  email: z.string().email('Invalid email address').max(320),
  subject: z.string().max(500).optional().nullable(),
  message: z.string().min(1, 'Message is required').max(10000),
}).refine(
  data => data.name || data.firstName,
  { message: 'Name is required' }
);

// Popup submission schema
export const popupSubmitSchema = z.object({
  popupType: z.enum(['welcome', 'exit', 'custom']),
  popupId: z.string().max(100).optional(),
  ctaType: z.enum(['email', 'sms', 'download']),
  email: z.string().email('Invalid email').max(320).optional(),
  phone: z.string().max(30).optional(),
  source: z.string().max(100).optional(),
  // Download tracking - captures what file compelled the user to sign up
  downloadFileUrl: z.string().url().max(2000).optional(),
  downloadFileName: z.string().max(255).optional(),
}).refine(
  data => {
    // Email required for email CTA, phone required for SMS CTA
    if (data.ctaType === 'email') return !!data.email;
    if (data.ctaType === 'sms') return !!data.phone;
    return true; // download doesn't require either
  },
  { message: 'Email required for email CTA, phone required for SMS CTA' }
);

// Popup tracking schema
export const popupTrackSchema = z.object({
  event: z.enum(['view', 'dismiss', 'submit']),
  popupType: z.enum(['welcome', 'exit', 'custom']),
  popupId: z.string().optional(),
  visitorId: z.string().max(100).optional(),
  sessionId: z.string().max(100).optional(),
});

// Subscribe schema
export const subscribeSchema = z.object({
  email: z.string().email('Invalid email address').max(320),
  source: z.string().max(100).optional(),
});

// Product variant schema
const productVariantSchema = z.object({
  id: z.string().max(100),
  name: z.string().max(200),
  price: z.string().max(50).optional().nullable(),
  compareAtPrice: z.string().max(50).optional().nullable(),
  amazonUrl: z.string().max(2000).optional().nullable(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  heroImageUrl: z.string().max(2000).optional().nullable(),
  secondaryImageUrl: z.string().max(2000).optional().nullable(),
  heroCarouselImages: z.string().optional().nullable(),
  thumbnailUrl: z.string().max(2000).optional().nullable(),
  badge: z.string().max(200).optional().nullable(),
  badgeBgColor: z.string().max(20).optional(),
  badgeTextColor: z.string().max(20).optional(),
}).passthrough();

// Product benefit schema
const productBenefitSchema = z.object({
  id: z.string().max(100),
  title: z.string().max(500),
  description: z.string().max(2000).optional().nullable(),
  isPositive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
}).passthrough();

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(500),
  slug: z.string().max(500).optional(),
  description: z.string().max(10000).optional(),
  price: z.string().max(50).optional(),
  currency: z.string().max(10).default('USD'),
  imageUrl: z.string().max(2000).optional().nullable(),
  amazonUrl: z.string().max(2000).optional().nullable(),
  ctaText: z.string().max(200).optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  status: z.enum(['active', 'draft']).optional(),
}).passthrough(); // Allow additional product fields

export const updateProductSchema = createProductSchema.partial();

// Full product update schema (for PUT with variants/benefits)
export const updateProductFullSchema = z.object({
  product: z.object({
    slug: z.string().max(500).optional(),
    name: z.string().max(500).optional(),
    subtitle: z.string().max(500).optional().nullable(),
    shortDescription: z.string().max(2000).optional().nullable(),
    price: z.string().max(50).optional().nullable(),
    compareAtPrice: z.string().max(50).optional().nullable(),
    heroImageUrl: z.string().max(2000).optional().nullable(),
    isActive: z.boolean().optional(),
  }).passthrough(), // Allow all product fields
  variants: z.array(productVariantSchema).optional(),
  benefits: z.array(productBenefitSchema).optional(),
});

// Blog post schemas
export const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  slug: z.string().max(500).optional(),
  excerpt: z.string().max(1000).optional().nullable(),
  content: z.string().max(100000).optional().nullable(),
  featuredImageUrl: z.string().max(2000).optional().nullable(),
  authorName: z.string().max(200).optional(),
  authorAvatarUrl: z.string().max(2000).optional().nullable(),
  status: z.enum(['draft', 'published', 'scheduled']).optional(),
  publishedAt: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  // Additional fields for blog post redesign
  heroCarouselImages: z.string().optional().nullable(),
  rightColumnBgColor: z.string().max(50).optional(),
  rightColumnThumbnailUrl: z.string().max(2000).optional().nullable(),
  postWidgets: z.string().optional().nullable(),
}).passthrough(); // Allow additional fields

export const updateBlogPostSchema = createBlogPostSchema.partial();

// Blog tag schemas
export const createBlogTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(100).optional(),
  color: z.string().max(20).optional().nullable(),
});

export const updateBlogTagSchema = createBlogTagSchema.partial();

// Contact schemas (admin)
export const createContactSchema = z.object({
  email: z.string().email().max(320).optional(),
  phone: z.string().max(30).optional(),
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  zipCode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  source: z.string().max(100).optional(),
  emailStatus: z.enum(['active', 'inactive', 'bounced']).optional(),
  smsStatus: z.enum(['active', 'inactive', 'none']).optional(),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
});

export const updateContactSchema = createContactSchema.partial();

// Contact submission update schema (admin)
export const updateContactSubmissionSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'spam']).optional(),
  notes: z.string().max(5000).optional().nullable(),
  assignedTo: z.string().max(200).optional().nullable(),
}).passthrough();

// Settings schemas
export const updateSettingsSchema = z.object({
  siteName: z.string().max(200).optional(),
  siteDescription: z.string().max(1000).optional(),
  heroTitle: z.string().max(500).optional(),
  heroSubtitle: z.string().max(1000).optional(),
  primaryColor: z.string().max(20).optional(),
  secondaryColor: z.string().max(20).optional(),
  // Add more settings as needed
}).passthrough(); // Allow additional settings fields

// Page views tracking schema
export const pageViewSchema = z.object({
  pageSlug: z.string().max(500),
  visitorId: z.string().max(100).optional(),
  sessionId: z.string().max(100).optional(),
  referrer: z.string().max(2000).optional(),
  userAgent: z.string().max(1000).optional(),
});

// Validation helper (strict - rejects invalid data)
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorMessages = result.error.issues.map((e: z.ZodIssue) => e.message).join(', ');
    return { success: false, error: errorMessages };
  }
  return { success: true, data: result.data };
}

// Permissive validation helper - strips invalid fields but continues processing
export function validatePermissive<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { data: T; hadErrors: boolean; errors?: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { data: result.data, hadErrors: false };
  }
  // Log errors but return what we can parse
  const errors = result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`);
  console.warn('[Validation] Permissive parse had errors:', errors);
  // Return the original data cast to T - schema should use passthrough() for admin routes
  return { data: data as T, hadErrors: true, errors };
}
