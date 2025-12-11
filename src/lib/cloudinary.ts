import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  width?: number;
  height?: number;
  bytes: number;
  original_filename: string;
}

export async function uploadToCloudinary(
  file: string, // base64 data URL or URL
  options?: {
    folder?: string;
    public_id?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
  }
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(file, {
    folder: options?.folder ? `archies-remedies/${options.folder}` : 'archies-remedies',
    public_id: options?.public_id,
    resource_type: options?.resource_type || 'auto',
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });

  return result as CloudinaryUploadResult;
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: options?.width,
        height: options?.height,
        crop: options?.crop || 'fill',
        quality: options?.quality || 'auto',
        fetch_format: options?.format || 'auto',
      },
    ],
  });
}

export { cloudinary };
