import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log('Adding testimonial bubble and success links fields to site_settings...');

  // Welcome Popup Testimonial fields
  const welcomeTestimonialColumns = [
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_testimonial_enabled INTEGER DEFAULT 0;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_testimonial_enabled_desktop INTEGER DEFAULT 1;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_testimonial_enabled_mobile INTEGER DEFAULT 1;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_testimonial_quote TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_testimonial_author TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_testimonial_avatar_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_testimonial_stars INTEGER DEFAULT 5;`,
  ];

  // Welcome Popup Success Links
  const welcomeSuccessLinksColumns = [
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_success_link1_text TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_success_link1_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_success_link2_text TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN welcome_popup_success_link2_url TEXT;`,
  ];

  // Exit Popup Testimonial fields
  const exitTestimonialColumns = [
    `ALTER TABLE site_settings ADD COLUMN exit_popup_testimonial_enabled INTEGER DEFAULT 0;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_testimonial_enabled_desktop INTEGER DEFAULT 1;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_testimonial_enabled_mobile INTEGER DEFAULT 1;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_testimonial_quote TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_testimonial_author TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_testimonial_avatar_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_testimonial_stars INTEGER DEFAULT 5;`,
  ];

  // Exit Popup Success Links
  const exitSuccessLinksColumns = [
    `ALTER TABLE site_settings ADD COLUMN exit_popup_success_link1_text TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_success_link1_url TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_success_link2_text TEXT;`,
    `ALTER TABLE site_settings ADD COLUMN exit_popup_success_link2_url TEXT;`,
  ];

  const allColumns = [
    ...welcomeTestimonialColumns,
    ...welcomeSuccessLinksColumns,
    ...exitTestimonialColumns,
    ...exitSuccessLinksColumns,
  ];

  for (const sql of allColumns) {
    try {
      await client.execute(sql);
      console.log('✓', sql.match(/ADD COLUMN (\w+)/)?.[1]);
    } catch (error: unknown) {
      const err = error as Error;
      // Ignore "duplicate column name" errors
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
