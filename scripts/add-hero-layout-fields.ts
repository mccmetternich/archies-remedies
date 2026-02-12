import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function addHeroLayoutFields() {
  console.log('Adding layout fields to hero_slides table...');

  const columns = [
    { name: 'layout', type: "TEXT DEFAULT 'full-width'" },
    { name: 'text_color', type: "TEXT DEFAULT 'dark'" },
  ];

  for (const col of columns) {
    try {
      await client.execute(`ALTER TABLE hero_slides ADD COLUMN ${col.name} ${col.type}`);
      console.log(`✓ Added column: ${col.name}`);
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('duplicate column name')) {
        console.log(`○ Column already exists: ${col.name}`);
      } else {
        console.error(`✗ Failed to add column ${col.name}:`, error instanceof Error ? error.message : String(error));
      }
    }
  }

  console.log('\nDone!');
}

addHeroLayoutFields().catch(console.error);
