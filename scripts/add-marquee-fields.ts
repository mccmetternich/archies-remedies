import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function addMarqueeFields() {
  console.log('Adding marquee fields to site_settings table...');

  const columns = [
    { name: 'marquee_enabled', type: 'INTEGER DEFAULT 1' },
    { name: 'marquee_text', type: "TEXT DEFAULT 'Preservative-Free ✦ Clean Ingredients ✦ Doctor Trusted ✦ Instant Relief ✦ Gentle Formula ✦ Made with Love'" },
    { name: 'marquee_speed', type: "TEXT DEFAULT 'slow'" },
    { name: 'marquee_size', type: "TEXT DEFAULT 'xl'" },
    { name: 'marquee_style', type: "TEXT DEFAULT 'dark'" },
  ];

  for (const col of columns) {
    try {
      await client.execute(`ALTER TABLE site_settings ADD COLUMN ${col.name} ${col.type}`);
      console.log(`✓ Added column: ${col.name}`);
    } catch (error: any) {
      if (error.message?.includes('duplicate column name')) {
        console.log(`○ Column already exists: ${col.name}`);
      } else {
        console.error(`✗ Failed to add column ${col.name}:`, error.message);
      }
    }
  }

  console.log('\nDone!');
}

addMarqueeFields().catch(console.error);
