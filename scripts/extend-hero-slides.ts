/**
 * Migration: Extend hero_slides table with new fields
 *
 * Adds:
 * - productId (product association)
 * - bodyText (body copy)
 * - videoUrl, mobileVideoUrl (video support)
 * - testimonialVerifiedText, testimonialShowCheckmark (testimonial enhancements)
 * - ratingOverride, reviewCountOverride (manual rating override)
 * - showOnDesktop, showOnMobile (device visibility)
 */

import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log('Starting hero_slides migration...\n');

  const alterStatements = [
    // Product association
    `ALTER TABLE hero_slides ADD COLUMN product_id TEXT REFERENCES products(id)`,

    // Body copy
    `ALTER TABLE hero_slides ADD COLUMN body_text TEXT`,

    // Video support
    `ALTER TABLE hero_slides ADD COLUMN video_url TEXT`,
    `ALTER TABLE hero_slides ADD COLUMN mobile_video_url TEXT`,

    // Testimonial enhancements
    `ALTER TABLE hero_slides ADD COLUMN testimonial_verified_text TEXT DEFAULT 'Verified Purchase'`,
    `ALTER TABLE hero_slides ADD COLUMN testimonial_show_checkmark INTEGER DEFAULT 1`,

    // Rating overrides
    `ALTER TABLE hero_slides ADD COLUMN rating_override REAL`,
    `ALTER TABLE hero_slides ADD COLUMN review_count_override INTEGER`,

    // Device visibility
    `ALTER TABLE hero_slides ADD COLUMN show_on_desktop INTEGER DEFAULT 1`,
    `ALTER TABLE hero_slides ADD COLUMN show_on_mobile INTEGER DEFAULT 1`,
  ];

  for (const sql of alterStatements) {
    try {
      await client.execute(sql);
      console.log('✓', sql.replace('ALTER TABLE hero_slides ADD COLUMN ', ''));
    } catch (error: any) {
      if (error.message?.includes('duplicate column name')) {
        console.log('○ Column already exists:', sql.split('ADD COLUMN ')[1]?.split(' ')[0]);
      } else {
        console.error('✗ Error:', error.message);
      }
    }
  }

  console.log('\nMigration complete!');

  // Verify the schema
  const result = await client.execute(`PRAGMA table_info(hero_slides)`);
  console.log('\nCurrent hero_slides columns:');
  result.rows.forEach((row: any) => {
    console.log(`  - ${row.name} (${row.type})`);
  });
}

migrate().catch(console.error);
