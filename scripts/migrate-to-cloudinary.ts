/**
 * Migration script to move existing base64 images from database to Cloudinary
 *
 * Run with:
 * TURSO_DATABASE_URL="..." TURSO_AUTH_TOKEN="..." CLOUDINARY_CLOUD_NAME="..." CLOUDINARY_API_KEY="..." CLOUDINARY_API_SECRET="..." npx tsx scripts/migrate-to-cloudinary.ts
 */

import { createClient } from '@libsql/client';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  folder: string | null;
  tags: string | null;
  cloudinaryPublicId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  console.log('🔍 Fetching media files from database...');

  const result = await client.execute('SELECT * FROM media_files');
  const files = result.rows as unknown as MediaFile[];

  console.log(`📦 Found ${files.length} media files`);

  // Filter for base64 files (data URLs) that haven't been migrated
  const base64Files = files.filter(f =>
    f.url.startsWith('data:') && !f.cloudinaryPublicId
  );

  console.log(`🔄 ${base64Files.length} files need migration to Cloudinary`);

  if (base64Files.length === 0) {
    console.log('✅ No files need migration');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const file of base64Files) {
    try {
      console.log(`📤 Uploading: ${file.filename} (${file.id})`);

      // Determine resource type
      let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
      if (file.mimeType?.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.mimeType?.startsWith('video/')) {
        resourceType = 'video';
      }

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file.url, {
        folder: `archies-remedies/${file.folder || 'general'}`,
        resource_type: resourceType,
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      });

      // Update database with Cloudinary URL
      await client.execute({
        sql: `UPDATE media_files
              SET url = ?,
                  thumbnail_url = ?,
                  cloudinary_public_id = ?,
                  file_size = ?,
                  width = ?,
                  height = ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [
          uploadResult.secure_url,
          resourceType === 'video'
            ? uploadResult.secure_url.replace(/\.[^.]+$/, '.jpg')
            : uploadResult.secure_url,
          uploadResult.public_id,
          uploadResult.bytes,
          uploadResult.width || null,
          uploadResult.height || null,
          file.id,
        ],
      });

      console.log(`   ✅ Migrated: ${uploadResult.secure_url}`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Failed to migrate ${file.filename}:`, error);
      errorCount++;
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📦 Total: ${base64Files.length}`);
}

main().catch(console.error);
