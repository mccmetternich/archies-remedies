import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const columns = [
    "ALTER TABLE products ADD COLUMN rating REAL DEFAULT 4.9",
    "ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 2900",
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
