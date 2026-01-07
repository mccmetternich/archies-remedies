/**
 * Seed script to create the Our Story page with all widgets configured
 * Run: npx tsx scripts/seed-our-story-page.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq } from 'drizzle-orm';
import { pages } from '../src/lib/db/schema';

// Initialize Turso client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

// Generate a simple unique ID
function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

// Widget configurations for the Our Story page
const ourStoryWidgets = [
  // Module 1: Story Hero
  {
    id: generateId(),
    type: 'story_hero',
    isVisible: true,
    config: {
      mediaUrl: '', // User will add via admin
      headline: 'The Architecture of Resilience.',
      subheadline: `Skin damage is a universal tax on a life well-lived. From sun-induced degradation to urban oxidative stress, environmental attrition doesn't discriminate. We engineer high-potency, touchless formulas designed to reverse existing damage and preserve the healthy, vibrant skin you were born with—regardless of age, gender, or skin tone.`,
      overlayOpacity: 40,
      height: 'short',
    },
  },
  // Module 2: Heritage Split (using two_column_feature)
  {
    id: generateId(),
    type: 'two_column_feature',
    isVisible: true,
    config: {
      theme: 'cream',
      mediaPosition: 'left',
      mediaMode: 'single',
      mediaUrl: '', // User will add via admin
      mediaIsVideo: false,
      textMode: 'title_body',
      textAlignment: 'left',
      showStars: false,
      title: 'Clinical Rigor. For Every Body.',
      body: `Our story began in the medical suite, formulating drug-grade topicals for the most sensitive areas of the human face. This high-stakes environment taught us that skin integrity is a matter of precision chemistry, not marketing. We saw how cumulative exposure to the elements dismantled the skin's structure, causing premature aging that most "beauty" products simply couldn't touch. We pivoted to solve this "Repair Gap" for everyone. By bringing prescription-level logic to a functional, full-body system, we've created a new standard in restoration.`,
      bulletPoints: [],
      ctaText: '',
      ctaUrl: '',
    },
  },
  // Module 3: Pillars Grid (using icon_highlights)
  {
    id: generateId(),
    type: 'icon_highlights',
    isVisible: true,
    config: {
      title: '',
      theme: 'dark',
      columns: [
        {
          iconUrl: '', // User will add via admin
          title: 'Structural Reversal',
          description: `UV rays and lifestyle stressors dismantle your skin's collagen matrix, regardless of ethnicity or age. Our Retinoid complexes are engineered to penetrate the dermis, signaling the skin to rebuild the density lost to years of exposure.`,
        },
        {
          iconUrl: '', // User will add via admin
          title: 'Universal Defense',
          description: `Modern life is an aggressor. Pollution and oxidative stress trigger the look of exhaustion and accelerate fine-line formation. We utilize potent antioxidants to neutralize these threats before they become permanent markers of age.`,
        },
        {
          iconUrl: '', // User will add via admin
          title: 'Barrier Integrity',
          description: `As we age, the moisture barrier thins, leading to "crepey" texture and sensitivity. Our formulas deliver high-concentration Ceramides to seal the barrier, preserving the firm, hydrated sheen of resilient, healthy skin.`,
        },
      ],
      linkText: '',
      linkUrl: '',
    },
  },
  // Module 4: Team Cards
  {
    id: generateId(),
    type: 'team_cards',
    isVisible: true,
    config: {
      theme: 'light',
      cards: [
        {
          id: generateId(),
          imageUrl: '', // User will add via admin
          name: 'The Scientist',
          title: 'The Formulation Architect',
          bio: `Obsessed with bio-availability. If an active doesn't reach the layers where damage lives, it doesn't belong in our laboratory.`,
        },
        {
          id: generateId(),
          imageUrl: '', // User will add via admin
          name: 'The Visionary',
          title: 'The Performance Minimalist',
          bio: `Designing for the man who spent too much time in the sun and the woman who demands actual results. Refined, effective, and intentionally direct.`,
        },
      ],
    },
  },
  // Module 5: Scale Carousel
  {
    id: generateId(),
    type: 'scale_carousel',
    isVisible: true,
    config: {
      aspectRatio: '3:4',
      scaleIntensity: 1.2,
      autoPlayCenter: true,
      items: [
        {
          id: generateId(),
          mediaUrl: '', // User will add via admin
          label: 'The Body Retinol. Targeted deep-tissue repair for the neck, chest, and arms.',
          isVideo: false,
        },
        {
          id: generateId(),
          mediaUrl: '', // User will add via admin
          label: 'The Damage Shield. Preserving peak health by stopping attrition before it manifests.',
          isVideo: false,
        },
      ],
    },
  },
  // Module 6: Signature Text
  {
    id: generateId(),
    type: 'text',
    isVisible: true,
    content: `<h2 style="text-align: center;">Clinically Rooted. Intentionally Potent. Unapologetically Effective.</h2><p style="text-align: center;">This is skin engineering for a life well-lived.</p>`,
    config: {
      maxWidth: 'lg',
    },
  },
];

async function seedOurStoryPage() {
  console.log('Creating Our Story page...');

  try {
    // Check if page already exists
    const existing = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, 'our-story'))
      .limit(1);

    if (existing.length > 0) {
      console.log('Our Story page already exists. Updating widgets...');
      await db
        .update(pages)
        .set({
          widgets: JSON.stringify(ourStoryWidgets),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(pages.slug, 'our-story'));
      console.log('Our Story page updated successfully!');
    } else {
      // Create new page
      await db.insert(pages).values({
        id: generateId(),
        slug: 'our-story',
        title: 'Our Story',
        pageType: 'content',
        content: null,
        widgets: JSON.stringify(ourStoryWidgets),
        heroImageUrl: null,
        heroTitle: null,
        heroSubtitle: null,
        metaTitle: 'Our Story | Archie\'s Remedies',
        metaDescription: 'Discover the story behind Archie\'s Remedies - clinical rigor for every body.',
        isActive: true,
        showInNav: true,
        navOrder: 10,
      });
      console.log('Our Story page created successfully!');
    }

    console.log('\nPage URL: /our-story');
    console.log('Admin URL: /admin/pages (find "Our Story" to edit)');
    console.log('\nNote: Media URLs are empty - add images/videos via admin panel.');
  } catch (error) {
    console.error('Error creating Our Story page:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedOurStoryPage();
