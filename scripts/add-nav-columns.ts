import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const columns = [
  "ALTER TABLE site_settings ADD COLUMN nav_logo_position TEXT DEFAULT 'left'",
  "ALTER TABLE site_settings ADD COLUMN nav_logo_position_mobile TEXT DEFAULT 'left'",
  "ALTER TABLE site_settings ADD COLUMN nav_cta_enabled INTEGER DEFAULT 1",
  "ALTER TABLE site_settings ADD COLUMN nav_cta_text TEXT DEFAULT 'Shop Now'",
  "ALTER TABLE site_settings ADD COLUMN nav_cta_url TEXT DEFAULT '/products/eye-drops'",
  "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile1_product_id TEXT",
  "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile1_title TEXT",
  "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile1_subtitle TEXT",
  "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile1_badge TEXT",
  "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile1_badge_emoji TEXT",
  "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile2_product_id TEXT",
  "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile2_title TEXT",
  "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile2_subtitle TEXT",
  "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile2_badge TEXT",
  "ALTER TABLE site_settings ADD COLUMN nav_dropdown_tile2_badge_emoji TEXT",
  "ALTER TABLE site_settings ADD COLUMN nav_clean_formulas_title TEXT DEFAULT 'Clean Formulas'",
  "ALTER TABLE site_settings ADD COLUMN nav_clean_formulas_description TEXT DEFAULT 'No preservatives, phthalates, parabens, or sulfates.'",
  "ALTER TABLE site_settings ADD COLUMN nav_clean_formulas_cta_enabled INTEGER DEFAULT 0",
  "ALTER TABLE site_settings ADD COLUMN nav_clean_formulas_cta_text TEXT",
  "ALTER TABLE site_settings ADD COLUMN nav_clean_formulas_cta_url TEXT",
  "ALTER TABLE site_settings ADD COLUMN nav_clean_formulas_badge_enabled INTEGER DEFAULT 0",
  "ALTER TABLE site_settings ADD COLUMN nav_clean_formulas_badge_url TEXT",
  "ALTER TABLE site_settings ADD COLUMN bumper_theme TEXT DEFAULT 'light'",
];

async function run() {
  console.log('Adding navigation columns to site_settings...\n');

  for (const sql of columns) {
    const colName = sql.split('ADD COLUMN ')[1]?.split(' ')[0];
    try {
      await client.execute(sql);
      console.log('✓', colName);
    } catch (e: any) {
      if (e.message?.includes('duplicate column')) {
        console.log('⊘', colName, '(already exists)');
      } else {
        console.log('✗', colName, '-', e.message);
      }
    }
  }

  console.log('\nDone!');
  process.exit(0);
}

run();
