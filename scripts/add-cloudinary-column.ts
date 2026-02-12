import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    await client.execute('ALTER TABLE media_files ADD COLUMN cloudinary_public_id TEXT');
    console.log('Column cloudinary_public_id added successfully');
  } catch (error: unknown) {
    if (error instanceof Error && error.message?.includes('duplicate column')) {
      console.log('Column cloudinary_public_id already exists');
    } else {
      throw error;
    }
  }
}

main().catch(console.error);
