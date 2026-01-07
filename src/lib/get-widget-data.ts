/**
 * Widget Data Fetching Utility
 *
 * Fetches data required by widgets based on which widget types are present on a page.
 * Only fetches data for widgets that need global data (from database tables).
 */

import { db } from '@/lib/db';
import { heroSlides, products, testimonials, videoTestimonials, instagramPosts, faqs, reviews, reviewKeywords } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Type definitions for widget data
export interface WidgetData {
  heroSlides?: Array<{
    id: string;
    title: string | null;
    subtitle: string | null;
    buttonText: string | null;
    buttonUrl: string | null;
    secondaryButtonText: string | null;
    secondaryButtonUrl: string | null;
    secondaryButtonType: string | null;
    secondaryAnchorTarget: string | null;
    imageUrl: string;
    testimonialText: string | null;
    testimonialAuthor: string | null;
    testimonialAvatarUrl: string | null;
    layout: string | null;
    textColor: string | null;
  }>;
  products?: Array<{
    id: string;
    slug: string;
    name: string;
    subtitle: string | null;
    shortDescription: string | null;
    price: number | null;
    compareAtPrice: number | null;
    heroImageUrl: string | null;
    badge: string | null;
    badgeEmoji: string | null;
    rating: number | null;
    reviewCount: number | null;
    isActive: boolean | null;
    sortOrder: number | null;
  }>;
  testimonials?: Array<{
    id: string;
    name: string;
    location: string | null;
    text: string;
    rating: number | null;
    avatarUrl: string | null;
    productId: string | null;
    isVerified: boolean | null;
    isFeatured: boolean | null;
    isActive: boolean | null;
    sortOrder: number | null;
    createdAt: string | null;
  }>;
  videos?: Array<{
    id: string;
    title: string | null;
    thumbnailUrl: string;
    videoUrl: string;
    name: string | null;
    isActive: boolean | null;
    sortOrder: number | null;
  }>;
  instagramPosts?: Array<{
    id: string;
    thumbnailUrl: string;
    postUrl: string | null;
    caption: string | null;
    isActive: boolean | null;
    sortOrder: number | null;
  }>;
  faqs?: Array<{
    id: string;
    question: string;
    answer: string;
    category: string | null;
    isActive: boolean | null;
    sortOrder: number | null;
  }>;
  reviews?: Array<{
    id: string;
    productId: string | null;
    collectionName: string | null;
    rating: number | null;
    title: string | null;
    authorName: string;
    authorInitial: string | null;
    text: string;
    keywords: string | null;
    isVerified: boolean | null;
    isFeatured: boolean | null;
    isActive: boolean | null;
    sortOrder: number | null;
    createdAt: string | null;
  }>;
  reviewKeywords?: Array<{
    id: string;
    productId: string | null;
    collectionName: string | null;
    keyword: string;
    count: number | null;
    sortOrder: number | null;
  }>;
  reviewCollections?: string[]; // List of unique collection names
  instagramUrl?: string | null;
}

/**
 * Fetch widget data based on which widget types are present on the page
 * Only fetches data for widgets that need it (global widgets from DB tables)
 */
export async function getWidgetData(widgetTypes: string[]): Promise<WidgetData> {
  const data: WidgetData = {};
  const fetches: Promise<void>[] = [];

  // Hero Carousel
  if (widgetTypes.includes('hero_carousel')) {
    fetches.push(
      db
        .select()
        .from(heroSlides)
        .where(eq(heroSlides.isActive, true))
        .orderBy(heroSlides.sortOrder)
        .then((slides) => {
          console.log('[getWidgetData] Hero slides fetched:', slides.length, 'slides');
          if (slides.length === 0) {
            console.log('[getWidgetData] WARNING: No active hero slides found!');
          }
          data.heroSlides = slides;
        })
        .catch((error) => {
          console.error('[getWidgetData] ERROR fetching hero slides:', error);
          data.heroSlides = [];
        })
    );
  }

  // Product Grid
  if (widgetTypes.includes('product_grid')) {
    fetches.push(
      db
        .select()
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(products.sortOrder)
        .then((productList) => {
          data.products = productList;
        })
    );
  }

  // Testimonials
  if (widgetTypes.includes('testimonials')) {
    fetches.push(
      db
        .select()
        .from(testimonials)
        .where(eq(testimonials.isActive, true))
        .orderBy(testimonials.sortOrder)
        .then((testimonialList) => {
          data.testimonials = testimonialList;
        })
    );
  }

  // Video Testimonials
  if (widgetTypes.includes('video_testimonials')) {
    fetches.push(
      db
        .select()
        .from(videoTestimonials)
        .where(eq(videoTestimonials.isActive, true))
        .orderBy(videoTestimonials.sortOrder)
        .then((videoList) => {
          data.videos = videoList;
        })
    );
  }

  // Instagram Feed
  if (widgetTypes.includes('instagram')) {
    fetches.push(
      db
        .select()
        .from(instagramPosts)
        .where(eq(instagramPosts.isActive, true))
        .orderBy(instagramPosts.sortOrder)
        .then((posts) => {
          data.instagramPosts = posts;
        })
    );
  }

  // FAQs
  if (widgetTypes.includes('faqs')) {
    fetches.push(
      db
        .select()
        .from(faqs)
        .where(eq(faqs.isActive, true))
        .orderBy(faqs.sortOrder)
        .then((faqList) => {
          data.faqs = faqList;
        })
    );
  }

  // Reviews
  if (widgetTypes.includes('reviews')) {
    fetches.push(
      db
        .select()
        .from(reviews)
        .where(eq(reviews.isActive, true))
        .orderBy(reviews.sortOrder)
        .then((reviewList) => {
          data.reviews = reviewList;
          // Extract unique collection names
          const collections = new Set<string>();
          reviewList.forEach((r) => {
            if (r.collectionName) collections.add(r.collectionName);
          });
          data.reviewCollections = Array.from(collections);
        })
    );
    fetches.push(
      db
        .select()
        .from(reviewKeywords)
        .orderBy(reviewKeywords.sortOrder)
        .then((keywordList) => {
          data.reviewKeywords = keywordList;
        })
    );
  }

  // Wait for all fetches to complete
  await Promise.all(fetches);

  return data;
}
