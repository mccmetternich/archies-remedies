import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  console.log('Adding default blog author fields to site_settings...');

  // Add defaultBlogAuthorName column
  try {
    await client.execute(`ALTER TABLE site_settings ADD COLUMN default_blog_author_name TEXT DEFAULT 'Archie''s Remedies'`);
    console.log('Added default_blog_author_name column');
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('duplicate column')) {
      console.log('default_blog_author_name column already exists');
    } else {
      throw error;
    }
  }

  // Add defaultBlogAuthorAvatarUrl column
  try {
    await client.execute(`ALTER TABLE site_settings ADD COLUMN default_blog_author_avatar_url TEXT`);
    console.log('Added default_blog_author_avatar_url column');
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('duplicate column')) {
      console.log('default_blog_author_avatar_url column already exists');
    } else {
      throw error;
    }
  }

  console.log('Migration complete!');
}

main().catch(console.error);
