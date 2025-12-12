import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { db } from '@/lib/db';
import { mediaFiles } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { requireAuth } from '@/lib/api-auth';

// Allow longer execution time for video uploads (2 minutes)
export const maxDuration = 120;

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  // Check Cloudinary config early
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Missing Cloudinary environment variables');
    return NextResponse.json(
      { error: 'Server configuration error. Please contact support.' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';
    const altText = formData.get('altText') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
        { status: 413 }
      );
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
    let result;
    try {
      // Log config status (not secrets)
      console.log('Cloudinary config check:', {
        hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
        folder,
        resourceType,
        fileSize: file.size,
      });

      result = await uploadToCloudinary(dataUrl, {
        folder,
        resource_type: resourceType,
      });

      console.log('Cloudinary upload success:', result.public_id);
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      const errorMessage = cloudinaryError instanceof Error ? cloudinaryError.message : 'Cloudinary upload failed';

      // Check for specific Cloudinary errors
      if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
        return NextResponse.json(
          { error: 'Upload timed out. Try a smaller file or check your connection.' },
          { status: 408 }
        );
      }
      if (errorMessage.includes('File size too large')) {
        return NextResponse.json(
          { error: 'File exceeds Cloudinary size limit.' },
          { status: 413 }
        );
      }

      return NextResponse.json(
        { error: `Upload to cloud storage failed: ${errorMessage}` },
        { status: 502 }
      );
    }

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

    try {
      await db.insert(mediaFiles).values(mediaFile);
    } catch (dbError) {
      console.error('Database insert error:', dbError);
      // File uploaded to Cloudinary but DB failed - still return the URL so user can use it
      // Log this for manual cleanup later
      console.warn(`Orphaned Cloudinary file: ${result.public_id}`);
      return NextResponse.json({
        success: true,
        file: mediaFile,
        warning: 'File uploaded but not saved to media library. You can still use it.',
      });
    }

    return NextResponse.json({
      success: true,
      file: mediaFile,
    });
  } catch (error) {
    console.error('Upload error:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        return NextResponse.json(
          { error: 'Upload timed out. Try a smaller file or check your connection.' },
          { status: 408 }
        );
      }
      if (error.message.includes('ECONNRESET') || error.message.includes('network')) {
        return NextResponse.json(
          { error: 'Network error. Please check your connection and try again.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}
