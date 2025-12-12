import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log('Starting migration: Adding download tracking fields to contact_activity...');

  try {
    // Add download_file_url column
    await client.execute(`
      ALTER TABLE contact_activity ADD COLUMN download_file_url TEXT;
    `);
    console.log('Added download_file_url column');
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes('duplicate column name')) {
      console.log('download_file_url column already exists, skipping...');
    } else {
      throw error;
    }
  }

  try {
    // Add download_file_name column
    await client.execute(`
      ALTER TABLE contact_activity ADD COLUMN download_file_name TEXT;
    `);
    console.log('Added download_file_name column');
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes('duplicate column name')) {
      console.log('download_file_name column already exists, skipping...');
    } else {
      throw error;
    }
  }

  console.log('Migration complete: Added download tracking fields to contact_activity');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
