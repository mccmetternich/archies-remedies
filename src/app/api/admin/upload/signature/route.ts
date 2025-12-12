import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '@/lib/api-auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  // Check Cloudinary config
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Missing Cloudinary environment variables');
    return NextResponse.json(
      { error: 'Server configuration error. Please contact support.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { folder = 'general' } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folderPath = `archies-remedies/${folder}`;

    // Generate signature for unsigned upload
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: folderPath,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: folderPath,
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
