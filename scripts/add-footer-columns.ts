import { createClient } from '@libsql/client';

async function run() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const columns = [
    `ALTER TABLE site_settings ADD COLUMN footer_email_signup_enabled INTEGER DEFAULT 1`,
    `ALTER TABLE site_settings ADD COLUMN footer_email_signup_title TEXT DEFAULT 'Join the Archies Community'`,
    `ALTER TABLE site_settings ADD COLUMN footer_email_signup_subtitle TEXT`,
    `ALTER TABLE site_settings ADD COLUMN footer_email_signup_placeholder TEXT DEFAULT 'Enter your email'`,
    `ALTER TABLE site_settings ADD COLUMN footer_email_signup_button_text TEXT DEFAULT 'Sign Up'`,
    `ALTER TABLE site_settings ADD COLUMN footer_email_signup_success_message TEXT`,
    `ALTER TABLE site_settings ADD COLUMN footer_column1_title TEXT DEFAULT 'Shop'`,
    `ALTER TABLE site_settings ADD COLUMN footer_column2_title TEXT DEFAULT 'Learn'`,
    `ALTER TABLE site_settings ADD COLUMN footer_column3_title TEXT DEFAULT 'Support'`,
    `ALTER TABLE site_settings ADD COLUMN footer_column4_title TEXT DEFAULT 'Certifications'`,
    `ALTER TABLE site_settings ADD COLUMN footer_cert1_icon TEXT DEFAULT 'droplet'`,
    `ALTER TABLE site_settings ADD COLUMN footer_cert1_icon_url TEXT`,
    `ALTER TABLE site_settings ADD COLUMN footer_cert1_label TEXT DEFAULT 'Preservative Free'`,
    `ALTER TABLE site_settings ADD COLUMN footer_cert2_icon TEXT DEFAULT 'flag'`,
    `ALTER TABLE site_settings ADD COLUMN footer_cert2_icon_url TEXT`,
    `ALTER TABLE site_settings ADD COLUMN footer_cert2_label TEXT DEFAULT 'Made in USA'`,
    `ALTER TABLE site_settings ADD COLUMN footer_cert3_icon TEXT DEFAULT 'rabbit'`,
    `ALTER TABLE site_settings ADD COLUMN footer_cert3_icon_url TEXT`,
    `ALTER TABLE site_settings ADD COLUMN footer_cert3_label TEXT DEFAULT 'Cruelty Free'`,
    `ALTER TABLE site_settings ADD COLUMN footer_privacy_url TEXT DEFAULT '/privacy'`,
    `ALTER TABLE site_settings ADD COLUMN footer_privacy_label TEXT DEFAULT 'Privacy Policy'`,
    `ALTER TABLE site_settings ADD COLUMN footer_terms_url TEXT DEFAULT '/terms'`,
    `ALTER TABLE site_settings ADD COLUMN footer_terms_label TEXT DEFAULT 'Terms of Service'`,
  ];

  for (const sql of columns) {
    try {
      await client.execute(sql);
      const colName = sql.split('ADD COLUMN ')[1]?.split(' ')[0];
      console.log('Added:', colName);
    } catch (e: unknown) {
      const colName = sql.split('ADD COLUMN ')[1]?.split(' ')[0];
      if (e instanceof Error && e.message?.includes('duplicate column')) {
        console.log('Exists:', colName);
      } else {
        console.error('Error on', colName, ':', e instanceof Error ? e.message : String(e));
      }
    }
  }
  console.log('Done!');
}

run();
