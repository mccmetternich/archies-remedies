/**
 * Comprehensive migration script to move ALL base64 images from database to Cloudinary
 *
 * This migrates:
 * - Site settings (logos, icons, badges, nav tiles)
 * - Hero slides (images and avatars)
 * - Products (hero images)
 * - Blog posts (featured images)
 * - Testimonials (avatars)
 * - Custom popups (images, videos)
 *
 * Run with:
 * TURSO_DATABASE_URL="..." TURSO_AUTH_TOKEN="..." CLOUDINARY_CLOUD_NAME="..." CLOUDINARY_API_KEY="..." CLOUDINARY_API_SECRET="..." npx tsx scripts/migrate-all-base64-to-cloudinary.ts
 */

import { createClient, Client } from '@libsql/client';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let client: Client;

async function uploadToCloudinary(dataUrl: string, folder: string): Promise<string | null> {
  try {
    // Determine resource type
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    if (dataUrl.startsWith('data:image/')) {
      resourceType = 'image';
    } else if (dataUrl.startsWith('data:video/')) {
      resourceType = 'video';
    }

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: `archies-remedies/${folder}`,
      resource_type: resourceType,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error(`   ❌ Cloudinary upload failed:`, error);
    return null;
  }
}

async function migrateSiteSettings() {
  console.log('\n📦 Migrating Site Settings...');

  const result = await client.execute('SELECT * FROM site_settings LIMIT 1');
  if (result.rows.length === 0) {
    console.log('   No site settings found');
    return;
  }

  const row = result.rows[0] as Record<string, unknown>;
  const fieldsToMigrate = [
    { field: 'logo_url', folder: 'branding' },
    { field: 'favicon_url', folder: 'branding' },
    { field: 'draft_mode_badge_url', folder: 'branding' },
    { field: 'massive_footer_logo_url', folder: 'branding' },
    { field: 'instagram_icon_url', folder: 'social' },
    { field: 'facebook_icon_url', folder: 'social' },
    { field: 'tiktok_icon_url', folder: 'social' },
    { field: 'amazon_icon_url', folder: 'social' },
    { field: 'og_image_url', folder: 'branding' },
    { field: 'email_popup_image_url', folder: 'popups' },
    { field: 'nav_dropdown_tile1_image_url', folder: 'navigation' },
    { field: 'nav_dropdown_tile1_hover_image_url', folder: 'navigation' },
    { field: 'nav_dropdown_tile2_image_url', folder: 'navigation' },
    { field: 'nav_dropdown_tile2_hover_image_url', folder: 'navigation' },
    { field: 'nav_clean_formulas_badge_url', folder: 'navigation' },
  ];

  let migratedCount = 0;
  for (const { field, folder } of fieldsToMigrate) {
    const value = row[field] as string;
    if (value && value.startsWith('data:')) {
      console.log(`   📤 ${field}...`);
      const cloudinaryUrl = await uploadToCloudinary(value, folder);
      if (cloudinaryUrl) {
        await client.execute({
          sql: `UPDATE site_settings SET ${field} = ?`,
          args: [cloudinaryUrl],
        });
        console.log(`   ✅ ${field} migrated`);
        migratedCount++;
      }
    }
  }

  console.log(`   📊 Migrated ${migratedCount} site settings fields`);
}

async function migrateHeroSlides() {
  console.log('\n📦 Migrating Hero Slides...');

  const result = await client.execute('SELECT id, title, image_url, testimonial_avatar_url FROM hero_slides');
  let migratedCount = 0;

  for (const row of result.rows) {
    const id = row.id as string;
    const title = row.title as string;
    const imageUrl = row.image_url as string;
    const avatarUrl = row.testimonial_avatar_url as string;

    if (imageUrl && imageUrl.startsWith('data:')) {
      console.log(`   📤 ${title} (image)...`);
      const cloudinaryUrl = await uploadToCloudinary(imageUrl, 'hero');
      if (cloudinaryUrl) {
        await client.execute({
          sql: 'UPDATE hero_slides SET image_url = ? WHERE id = ?',
          args: [cloudinaryUrl, id],
        });
        console.log(`   ✅ ${title} image migrated`);
        migratedCount++;
      }
    }

    if (avatarUrl && avatarUrl.startsWith('data:')) {
      console.log(`   📤 ${title} (avatar)...`);
      const cloudinaryUrl = await uploadToCloudinary(avatarUrl, 'avatars');
      if (cloudinaryUrl) {
        await client.execute({
          sql: 'UPDATE hero_slides SET testimonial_avatar_url = ? WHERE id = ?',
          args: [cloudinaryUrl, id],
        });
        console.log(`   ✅ ${title} avatar migrated`);
        migratedCount++;
      }
    }
  }

  console.log(`   📊 Migrated ${migratedCount} hero slide images`);
}

async function migrateProducts() {
  console.log('\n📦 Migrating Products...');

  const result = await client.execute('SELECT id, name, hero_image_url FROM products');
  let migratedCount = 0;

  for (const row of result.rows) {
    const id = row.id as string;
    const name = row.name as string;
    const heroImageUrl = row.hero_image_url as string;

    if (heroImageUrl && heroImageUrl.startsWith('data:')) {
      console.log(`   📤 ${name}...`);
      const cloudinaryUrl = await uploadToCloudinary(heroImageUrl, 'products');
      if (cloudinaryUrl) {
        await client.execute({
          sql: 'UPDATE products SET hero_image_url = ? WHERE id = ?',
          args: [cloudinaryUrl, id],
        });
        console.log(`   ✅ ${name} migrated`);
        migratedCount++;
      }
    }
  }

  console.log(`   📊 Migrated ${migratedCount} product images`);
}

async function migrateBlogPosts() {
  console.log('\n📦 Migrating Blog Posts...');

  const result = await client.execute('SELECT id, title, featured_image_url FROM blog_posts');
  let migratedCount = 0;

  for (const row of result.rows) {
    const id = row.id as string;
    const title = row.title as string;
    const featuredImageUrl = row.featured_image_url as string;

    if (featuredImageUrl && featuredImageUrl.startsWith('data:')) {
      console.log(`   📤 ${title}...`);
      const cloudinaryUrl = await uploadToCloudinary(featuredImageUrl, 'blog');
      if (cloudinaryUrl) {
        await client.execute({
          sql: 'UPDATE blog_posts SET featured_image_url = ? WHERE id = ?',
          args: [cloudinaryUrl, id],
        });
        console.log(`   ✅ ${title} migrated`);
        migratedCount++;
      }
    }
  }

  console.log(`   📊 Migrated ${migratedCount} blog post images`);
}

async function migrateTestimonials() {
  console.log('\n📦 Migrating Testimonials...');

  const result = await client.execute('SELECT id, name, avatar_url FROM testimonials');
  let migratedCount = 0;

  for (const row of result.rows) {
    const id = row.id as string;
    const name = row.name as string;
    const avatarUrl = row.avatar_url as string;

    if (avatarUrl && avatarUrl.startsWith('data:')) {
      console.log(`   📤 ${name}...`);
      const cloudinaryUrl = await uploadToCloudinary(avatarUrl, 'avatars');
      if (cloudinaryUrl) {
        await client.execute({
          sql: 'UPDATE testimonials SET avatar_url = ? WHERE id = ?',
          args: [cloudinaryUrl, id],
        });
        console.log(`   ✅ ${name} migrated`);
        migratedCount++;
      }
    }
  }

  console.log(`   📊 Migrated ${migratedCount} testimonial avatars`);
}

async function migrateCustomPopups() {
  console.log('\n📦 Migrating Custom Popups...');

  const result = await client.execute('SELECT id, name, image_url, video_url, video_thumbnail_url FROM custom_popups');
  let migratedCount = 0;

  for (const row of result.rows) {
    const id = row.id as string;
    const name = row.name as string;
    const imageUrl = row.image_url as string;
    const videoUrl = row.video_url as string;
    const videoThumbnailUrl = row.video_thumbnail_url as string;

    if (imageUrl && imageUrl.startsWith('data:')) {
      console.log(`   📤 ${name} (image)...`);
      const cloudinaryUrl = await uploadToCloudinary(imageUrl, 'popups');
      if (cloudinaryUrl) {
        await client.execute({
          sql: 'UPDATE custom_popups SET image_url = ? WHERE id = ?',
          args: [cloudinaryUrl, id],
        });
        console.log(`   ✅ ${name} image migrated`);
        migratedCount++;
      }
    }

    if (videoUrl && videoUrl.startsWith('data:')) {
      console.log(`   📤 ${name} (video)...`);
      const cloudinaryUrl = await uploadToCloudinary(videoUrl, 'popups');
      if (cloudinaryUrl) {
        await client.execute({
          sql: 'UPDATE custom_popups SET video_url = ? WHERE id = ?',
          args: [cloudinaryUrl, id],
        });
        console.log(`   ✅ ${name} video migrated`);
        migratedCount++;
      }
    }

    if (videoThumbnailUrl && videoThumbnailUrl.startsWith('data:')) {
      console.log(`   📤 ${name} (video thumbnail)...`);
      const cloudinaryUrl = await uploadToCloudinary(videoThumbnailUrl, 'popups');
      if (cloudinaryUrl) {
        await client.execute({
          sql: 'UPDATE custom_popups SET video_thumbnail_url = ? WHERE id = ?',
          args: [cloudinaryUrl, id],
        });
        console.log(`   ✅ ${name} video thumbnail migrated`);
        migratedCount++;
      }
    }
  }

  console.log(`   📊 Migrated ${migratedCount} popup assets`);
}

async function migratePages() {
  console.log('\n📦 Migrating Pages...');

  const result = await client.execute('SELECT id, title, hero_image_url FROM pages');
  let migratedCount = 0;

  for (const row of result.rows) {
    const id = row.id as string;
    const title = row.title as string;
    const heroImageUrl = row.hero_image_url as string;

    if (heroImageUrl && heroImageUrl.startsWith('data:')) {
      console.log(`   📤 ${title}...`);
      const cloudinaryUrl = await uploadToCloudinary(heroImageUrl, 'pages');
      if (cloudinaryUrl) {
        await client.execute({
          sql: 'UPDATE pages SET hero_image_url = ? WHERE id = ?',
          args: [cloudinaryUrl, id],
        });
        console.log(`   ✅ ${title} migrated`);
        migratedCount++;
      }
    }
  }

  console.log(`   📊 Migrated ${migratedCount} page images`);
}

async function main() {
  client = createClient({
    url: process.env.TURSO_DATABASE_URL as string,
    authToken: process.env.TURSO_AUTH_TOKEN as string,
  });

  console.log('🚀 Starting comprehensive base64 to Cloudinary migration...');
  console.log('   Cloud: ' + process.env.CLOUDINARY_CLOUD_NAME);

  await migrateSiteSettings();
  await migrateHeroSlides();
  await migrateProducts();
  await migrateBlogPosts();
  await migrateTestimonials();
  await migrateCustomPopups();
  await migratePages();

  console.log('\n✅ Migration complete!');
}

main().catch(console.error);
