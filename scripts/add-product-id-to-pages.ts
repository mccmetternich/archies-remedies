import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log('Adding product_id column to pages table...');

  try {
    // Add the product_id column
    await client.execute(`
      ALTER TABLE pages ADD COLUMN product_id TEXT REFERENCES products(id) ON DELETE CASCADE
    `);
    console.log('✓ Added product_id column');

    // Create index for efficient lookups
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_pages_product_id ON pages(product_id)
    `);
    console.log('✓ Created index on product_id');

    console.log('\nMigration complete!');
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes('duplicate column name')) {
      console.log('Column product_id already exists, skipping...');
    } else {
      throw error;
    }
  }
}

migrate().catch(console.error);
