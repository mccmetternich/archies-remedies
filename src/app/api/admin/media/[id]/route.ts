import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaFiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;

    const [file] = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, id));

    if (!file) {
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error('Error fetching media file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media file' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Partial<typeof mediaFiles.$inferInsert> = {};

    if (body.filename !== undefined) updates.filename = body.filename;
    if (body.altText !== undefined) updates.altText = body.altText;
    if (body.folder !== undefined) updates.folder = body.folder;
    if (body.tags !== undefined) updates.tags = JSON.stringify(body.tags);
    updates.updatedAt = new Date().toISOString();

    await db.update(mediaFiles).set(updates).where(eq(mediaFiles.id, id));

    const [updated] = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, id));

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating media file:', error);
    return NextResponse.json(
      { error: 'Failed to update media file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;

    // Get the file first to check for Cloudinary public_id
    const [file] = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, id));

    if (file?.cloudinaryPublicId) {
      // Delete from Cloudinary
      try {
        await deleteFromCloudinary(file.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    await db.delete(mediaFiles).where(eq(mediaFiles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media file:', error);
    return NextResponse.json(
      { error: 'Failed to delete media file' },
      { status: 500 }
    );
  }
}
