import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
  
  const result = await client.execute(`
    SELECT 
      nav_marketing_tile_cta_enabled,
      nav_marketing_tile_cta_text,
      nav_marketing_tile_cta_url,
      nav_marketing_tile_rotating_badge_enabled,
      nav_marketing_tile_rotating_badge_url,
      nav_clean_formulas_cta_enabled,
      nav_clean_formulas_cta_text,
      nav_clean_formulas_cta_url,
      nav_clean_formulas_badge_enabled,
      nav_clean_formulas_badge_url
    FROM site_settings 
    LIMIT 1
  `);
  console.log(JSON.stringify(result.rows[0], null, 2));
}

main().catch(console.error);
