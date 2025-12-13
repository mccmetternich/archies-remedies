/**
 * Migration: Add blog vanity metrics, blog settings table, and footer theme fields
 *
 * This script adds:
 * 1. viewCount, heartCount, sortOrder columns to blog_posts table
 * 2. blog_settings table for blog-level configuration
 * 3. footerTheme, footerLogoUrl columns to site_settings table
 */

import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log('Starting migration: blog and footer fields...\n');

  // 1. Add columns to blog_posts table
  console.log('Adding columns to blog_posts table...');

  const blogPostColumns = [
    { name: 'view_count', type: 'INTEGER' },
    { name: 'heart_count', type: 'INTEGER' },
    { name: 'sort_order', type: 'INTEGER DEFAULT 0' },
  ];

  for (const col of blogPostColumns) {
    try {
      await client.execute(`ALTER TABLE blog_posts ADD COLUMN ${col.name} ${col.type}`);
      console.log(`  ✓ Added ${col.name} column`);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message?.includes('duplicate column')) {
        console.log(`  - ${col.name} column already exists`);
      } else {
        throw error;
      }
    }
  }

  // 2. Create blog_settings table
  console.log('\nCreating blog_settings table...');

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS blog_settings (
        id TEXT PRIMARY KEY,
        blog_name TEXT DEFAULT 'Blog',
        blog_slug TEXT DEFAULT 'blog',
        page_title TEXT,
        grid_layout TEXT DEFAULT 'masonry',
        widgets TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ Created blog_settings table');

    // Insert default row if not exists
    const existing = await client.execute('SELECT id FROM blog_settings LIMIT 1');
    if (existing.rows.length === 0) {
      await client.execute(`
        INSERT INTO blog_settings (id, blog_name, blog_slug, page_title, grid_layout)
        VALUES ('default', 'Blog', 'blog', 'Blog', 'masonry')
      `);
      console.log('  ✓ Inserted default blog settings row');
    } else {
      console.log('  - Default blog settings row already exists');
    }
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes('already exists')) {
      console.log('  - blog_settings table already exists');
    } else {
      throw error;
    }
  }

  // 3. Add columns to site_settings table
  console.log('\nAdding footer columns to site_settings table...');

  const siteSettingsColumns = [
    { name: 'footer_theme', type: "TEXT DEFAULT 'dark'" },
    { name: 'footer_logo_url', type: 'TEXT' },
  ];

  for (const col of siteSettingsColumns) {
    try {
      await client.execute(`ALTER TABLE site_settings ADD COLUMN ${col.name} ${col.type}`);
      console.log(`  ✓ Added ${col.name} column`);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message?.includes('duplicate column')) {
        console.log(`  - ${col.name} column already exists`);
      } else {
        throw error;
      }
    }
  }

  // 4. Create index for blog posts sort order
  console.log('\nCreating indexes...');

  try {
    await client.execute('CREATE INDEX IF NOT EXISTS idx_blog_posts_sort_order ON blog_posts(sort_order)');
    console.log('  ✓ Created idx_blog_posts_sort_order index');
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes('already exists')) {
      console.log('  - idx_blog_posts_sort_order index already exists');
    } else {
      throw error;
    }
  }

  console.log('\n✅ Migration completed successfully!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
