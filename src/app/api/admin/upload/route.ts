import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { db } from '@/lib/db';
import { mediaFiles } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';
    const altText = formData.get('altText') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Determine resource type for Cloudinary
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    if (mimeType.startsWith('image/')) {
      resourceType = 'image';
    } else if (mimeType.startsWith('video/')) {
      resourceType = 'video';
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(dataUrl, {
      folder,
      resource_type: resourceType,
    });

    // Save to database with Cloudinary URL
    const mediaFile = {
      id: nanoid(),
      filename: file.name,
      url: result.secure_url,
      thumbnailUrl: resourceType === 'video'
        ? result.secure_url.replace(/\.[^.]+$/, '.jpg') // Video thumbnail
        : result.secure_url,
      mimeType,
      fileSize: result.bytes,
      width: result.width || null,
      height: result.height || null,
      altText: altText || null,
      folder,
      tags: null,
      cloudinaryPublicId: result.public_id, // Store for deletion
    };

    await db.insert(mediaFiles).values(mediaFile);

    return NextResponse.json({
      success: true,
      file: mediaFile,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
