import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log('Adding download text fields to site_settings...');

  // Add welcome popup download text
  try {
    await client.execute(`
      ALTER TABLE site_settings ADD COLUMN welcome_popup_download_text TEXT DEFAULT 'Download starts on submission';
    `);
    console.log('Added welcome_popup_download_text column');
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message.includes('duplicate column name')) {
      console.log('welcome_popup_download_text column already exists');
    } else {
      throw error;
    }
  }

  // Add exit popup download text
  try {
    await client.execute(`
      ALTER TABLE site_settings ADD COLUMN exit_popup_download_text TEXT DEFAULT 'Download starts on submission';
    `);
    console.log('Added exit_popup_download_text column');
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message.includes('duplicate column name')) {
      console.log('exit_popup_download_text column already exists');
    } else {
      throw error;
    }
  }

  console.log('Migration complete!');
}

migrate().catch(console.error);
