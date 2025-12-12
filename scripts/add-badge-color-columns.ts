import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const columns = [
    "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile1_badge_bg_color TEXT DEFAULT '#1a1a1a'",
    "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile1_badge_text_color TEXT DEFAULT '#ffffff'",
    "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile2_badge_bg_color TEXT DEFAULT '#bbdae9'",
    "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile2_badge_text_color TEXT DEFAULT '#1a1a1a'",
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
