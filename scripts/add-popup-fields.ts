import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const columns = [
    "ALTER TABLE site_settings ADD COLUMN welcome_popup_download_enabled INTEGER DEFAULT 0",
    "ALTER TABLE site_settings ADD COLUMN welcome_popup_no_spam_text TEXT DEFAULT 'No spam, ever. Unsubscribe anytime.'",
    "ALTER TABLE site_settings ADD COLUMN exit_popup_download_enabled INTEGER DEFAULT 0",
    "ALTER TABLE site_settings ADD COLUMN exit_popup_no_spam_text TEXT DEFAULT 'No spam, ever. Unsubscribe anytime.'",
  ];

  for (const sql of columns) {
    try {
      await client.execute(sql);
      const colName = sql.split('ADD COLUMN ')[1]?.split(' ')[0];
      console.log('✓', colName);
    } catch (e: unknown) {
      const error = e as Error;
      const colName = sql.split('ADD COLUMN ')[1]?.split(' ')[0];
      if (error.message?.includes('duplicate column')) {
        console.log('○ Already exists:', colName);
      } else {
        console.error('✗', colName, '-', error.message);
      }
    }
  }
  console.log('\nDone!');
}

main().catch(console.error);
