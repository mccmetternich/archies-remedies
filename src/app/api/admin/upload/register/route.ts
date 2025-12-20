import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaFiles } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const {
      public_id,
      secure_url,
      original_filename,
      format,
      resource_type,
      bytes,
      width,
      height,
      folder,
      altText,
    } = body;

    if (!public_id || !secure_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine MIME type from format and resource type
    let mimeType = 'application/octet-stream';
    if (resource_type === 'image') {
      mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
    } else if (resource_type === 'video') {
      mimeType = `video/${format}`;
    }

    // Generate thumbnail URL for videos
    const thumbnailUrl = resource_type === 'video'
      ? secure_url.replace(/\.[^.]+$/, '.jpg')
      : secure_url;

    const mediaFile = {
      id: nanoid(),
      filename: original_filename || public_id.split('/').pop() || 'upload',
      url: secure_url,
      thumbnailUrl,
      mimeType,
      fileSize: bytes,
      width: width || null,
      height: height || null,
      altText: altText || null,
      folder: folder || 'general',
      tags: null,
      cloudinaryPublicId: public_id,
    };

    try {
      await db.insert(mediaFiles).values(mediaFile);
    } catch (dbError) {
      console.error('Database insert error:', dbError);
      console.error('Failed to save file:', { public_id, mimeType, filename: mediaFile.filename });
      // Return proper error status so client knows DB save failed
      return NextResponse.json({
        success: false,
        error: 'Database insert failed',
        file: mediaFile, // Include file data so user can still use the URL
        cloudinaryUrl: secure_url, // URL is still usable even if not in library
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      file: mediaFile,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register uploaded file' },
      { status: 500 }
    );
  }
}
