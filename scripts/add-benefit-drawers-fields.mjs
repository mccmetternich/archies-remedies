#!/usr/bin/env node
/**
 * Migration: Add benefit_drawers and sticky_drawer_thumbnail_url fields to products table
 */

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  console.log('Adding benefit_drawers and sticky_drawer_thumbnail_url fields...');

  try {
    // Add benefit_drawers column
    await client.execute(`
      ALTER TABLE products ADD COLUMN benefit_drawers TEXT;
    `);
    console.log('✓ Added benefit_drawers column');
  } catch (err) {
    if (err.message?.includes('duplicate column')) {
      console.log('→ benefit_drawers column already exists');
    } else {
      console.error('Error adding benefit_drawers:', err.message);
    }
  }

  try {
    // Add sticky_drawer_thumbnail_url column
    await client.execute(`
      ALTER TABLE products ADD COLUMN sticky_drawer_thumbnail_url TEXT;
    `);
    console.log('✓ Added sticky_drawer_thumbnail_url column');
  } catch (err) {
    if (err.message?.includes('duplicate column')) {
      console.log('→ sticky_drawer_thumbnail_url column already exists');
    } else {
      console.error('Error adding sticky_drawer_thumbnail_url:', err.message);
    }
  }

  console.log('Migration complete!');
}

migrate().catch(console.error);
