import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL as string,
    authToken: process.env.TURSO_AUTH_TOKEN as string,
  });

  // Check media files - are they all migrated?
  const media = await client.execute('SELECT id, filename, url, cloudinary_public_id FROM media_files');
  console.log('=== MEDIA FILES ===');
  for (const row of media.rows) {
    const url = row.url as string;
    const isCloudinary = url?.includes('cloudinary');
    const isBase64 = url?.startsWith('data:');
    console.log(`${row.filename}: ${isCloudinary ? '✅ Cloudinary' : isBase64 ? '❌ Base64' : '🔗 External URL'}`);
  }

  // Check site settings for any image URLs
  const settings = await client.execute('SELECT * FROM site_settings LIMIT 1');
  console.log('\n=== SITE SETTINGS IMAGE FIELDS ===');
  const base64SettingsFields: string[] = [];
  if (settings.rows.length > 0) {
    const row = settings.rows[0] as Record<string, unknown>;
    for (const [key, val] of Object.entries(row)) {
      if (typeof val === 'string' && val.length > 10) {
        const isBase64 = val.startsWith('data:');
        const isCloudinary = val.includes('cloudinary');
        const isHttp = val.startsWith('http');
        if (key.toLowerCase().includes('url') || key.toLowerCase().includes('image') || key.toLowerCase().includes('icon') || key.toLowerCase().includes('logo')) {
          if (isBase64) {
            console.log(`❌ ${key}: Base64 (needs migration)`);
            base64SettingsFields.push(key);
          } else if (isCloudinary) {
            console.log(`✅ ${key}: Cloudinary`);
          } else if (isHttp) {
            console.log(`🔗 ${key}: External URL`);
          } else if (val) {
            console.log(`❓ ${key}: ${val.slice(0, 60)}`);
          }
        }
      }
    }
  }

  // Check hero slides
  const heroSlides = await client.execute('SELECT id, title, image_url, testimonial_avatar_url FROM hero_slides');
  console.log('\n=== HERO SLIDES ===');
  const base64HeroSlides: { id: string, field: string }[] = [];
  for (const row of heroSlides.rows) {
    const imageUrl = row.image_url as string;
    const avatarUrl = row.testimonial_avatar_url as string;

    const imageIsBase64 = imageUrl?.startsWith('data:');
    const imageIsCloudinary = imageUrl?.includes('cloudinary');
    console.log(`${row.title} (image): ${imageIsCloudinary ? '✅ Cloudinary' : imageIsBase64 ? '❌ Base64' : imageUrl ? '🔗 External' : '⚠️ No image'}`);
    if (imageIsBase64) base64HeroSlides.push({ id: row.id as string, field: 'image_url' });

    if (avatarUrl) {
      const avatarIsBase64 = avatarUrl.startsWith('data:');
      const avatarIsCloudinary = avatarUrl.includes('cloudinary');
      console.log(`${row.title} (avatar): ${avatarIsCloudinary ? '✅ Cloudinary' : avatarIsBase64 ? '❌ Base64' : '🔗 External'}`);
      if (avatarIsBase64) base64HeroSlides.push({ id: row.id as string, field: 'testimonial_avatar_url' });
    }
  }

  // Check products
  const products = await client.execute('SELECT id, name, hero_image_url FROM products');
  console.log('\n=== PRODUCTS ===');
  const base64Products: string[] = [];
  for (const row of products.rows) {
    const url = row.hero_image_url as string;
    const isBase64 = url?.startsWith('data:');
    const isCloudinary = url?.includes('cloudinary');
    console.log(`${row.name}: ${isCloudinary ? '✅ Cloudinary' : isBase64 ? '❌ Base64' : url ? '🔗 External' : '⚠️ No hero image'}`);
    if (isBase64) base64Products.push(row.id as string);
  }

  // Check blog posts
  const blogPosts = await client.execute('SELECT id, title, featured_image_url FROM blog_posts');
  console.log('\n=== BLOG POSTS ===');
  const base64BlogPosts: string[] = [];
  for (const row of blogPosts.rows) {
    const url = row.featured_image_url as string;
    const isBase64 = url?.startsWith('data:');
    const isCloudinary = url?.includes('cloudinary');
    console.log(`${row.title}: ${isCloudinary ? '✅ Cloudinary' : isBase64 ? '❌ Base64' : url ? '🔗 External' : '⚠️ No image'}`);
    if (isBase64) base64BlogPosts.push(row.id as string);
  }

  // Check testimonials
  const testimonials = await client.execute('SELECT id, author_name, avatar_url FROM testimonials');
  console.log('\n=== TESTIMONIALS ===');
  const base64Testimonials: string[] = [];
  for (const row of testimonials.rows) {
    const url = row.avatar_url as string;
    const isBase64 = url?.startsWith('data:');
    const isCloudinary = url?.includes('cloudinary');
    console.log(`${row.author_name}: ${isCloudinary ? '✅ Cloudinary' : isBase64 ? '❌ Base64' : url ? '🔗 External' : '⚠️ No avatar'}`);
    if (isBase64) base64Testimonials.push(row.id as string);
  }

  // Check navigation config
  const navConfig = await client.execute(`SELECT * FROM site_settings LIMIT 1`);
  console.log('\n=== NAVIGATION CONFIG (Shop Dropdown Tiles) ===');
  if (navConfig.rows.length > 0) {
    const row = navConfig.rows[0] as Record<string, unknown>;
    // Check nav-related fields
    const navFields = ['navShopTile1ImageUrl', 'navShopTile2ImageUrl', 'nav_shop_tile1_image_url', 'nav_shop_tile2_image_url'];
    for (const field of navFields) {
      if (row[field]) {
        const val = row[field] as string;
        const isBase64 = val.startsWith('data:');
        const isCloudinary = val.includes('cloudinary');
        console.log(`${field}: ${isCloudinary ? '✅ Cloudinary' : isBase64 ? '❌ Base64' : '🔗 External'}`);
        if (!isBase64 && !isCloudinary) {
          console.log(`   Value: ${val.slice(0, 100)}`);
        }
      }
    }
  }

  // Summary
  console.log('\n📊 MIGRATION SUMMARY:');
  console.log(`   Site Settings with Base64: ${base64SettingsFields.length}`);
  console.log(`   Hero Slides with Base64: ${base64HeroSlides.length}`);
  console.log(`   Products with Base64: ${base64Products.length}`);
  console.log(`   Blog Posts with Base64: ${base64BlogPosts.length}`);
  console.log(`   Testimonials with Base64: ${base64Testimonials.length}`);

  const totalBase64 = base64SettingsFields.length + base64HeroSlides.length + base64Products.length + base64BlogPosts.length + base64Testimonials.length;
  if (totalBase64 > 0) {
    console.log(`\n⚠️ Total items needing migration: ${totalBase64}`);
  } else {
    console.log(`\n✅ All content is using Cloudinary or external URLs!`);
  }
}

main().catch(console.error);
