import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log('Adding device-specific and state-specific media fields to site_settings...');

  const columns = [
    // Welcome popup - Form state media (desktop/mobile)
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_form_desktop_image_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_form_desktop_video_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_form_mobile_image_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_form_mobile_video_url TEXT;`,
    // Welcome popup - Success state media (desktop/mobile)
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_success_desktop_image_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_success_desktop_video_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_success_mobile_image_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_success_mobile_video_url TEXT;`,
    // Exit popup - Form state media (desktop/mobile)
    `ALTER TABLE site_settings ADD COLUMN exit_popup_form_desktop_image_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_form_desktop_video_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_form_mobile_image_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_form_mobile_video_url TEXT;`,
    // Exit popup - Success state media (desktop/mobile)
    `ALTER TABLE site_settings ADD COLUMN exit_popup_success_desktop_image_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_success_desktop_video_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_success_mobile_image_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_success_mobile_video_url TEXT;`,
  ];

  for (const sql of columns) {
    try {
      await client.execute(sql);
      console.log('✓', sql.match(/ADD COLUMN (\w+)/)?.[1]);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message?.includes('duplicate column name')) {
        console.log('⏭ Column already exists:', sql.match(/ADD COLUMN (\w+)/)?.[1]);
      } else {
        console.error('✗ Failed:', sql.match(/ADD COLUMN (\w+)/)?.[1], err.message);
      }
    }
  }

  console.log('\nMigration complete!');
}

migrate().catch(console.error);
