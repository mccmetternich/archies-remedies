import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const columns = [
    // Welcome popup new fields
    'ALTER TABLE site_settings ADD COLUMN welcome_popup_video_url TEXT',
    'ALTER TABLE site_settings ADD COLUMN welcome_popup_cta_type TEXT DEFAULT "email"',
    'ALTER TABLE site_settings ADD COLUMN welcome_popup_download_url TEXT',
    'ALTER TABLE site_settings ADD COLUMN welcome_popup_download_name TEXT',
    'ALTER TABLE site_settings ADD COLUMN welcome_popup_success_title TEXT DEFAULT "You\'re In!"',
    'ALTER TABLE site_settings ADD COLUMN welcome_popup_success_message TEXT DEFAULT "Thanks for joining. We\'ll be in touch soon."',
    // Exit popup new fields
    'ALTER TABLE site_settings ADD COLUMN exit_popup_video_url TEXT',
    'ALTER TABLE site_settings ADD COLUMN exit_popup_cta_type TEXT DEFAULT "email"',
    'ALTER TABLE site_settings ADD COLUMN exit_popup_download_url TEXT',
    'ALTER TABLE site_settings ADD COLUMN exit_popup_download_name TEXT',
    'ALTER TABLE site_settings ADD COLUMN exit_popup_success_title TEXT DEFAULT "You\'re In!"',
    'ALTER TABLE site_settings ADD COLUMN exit_popup_success_message TEXT DEFAULT "Thanks for subscribing. Check your inbox for your discount code."',
    'ALTER TABLE site_settings ADD COLUMN exit_popup_delay_after_welcome INTEGER DEFAULT 30',
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
