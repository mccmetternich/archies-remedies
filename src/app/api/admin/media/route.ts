import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaFiles } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { desc, like, or, eq, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = db.select().from(mediaFiles);

    // Apply filters
    const conditions = [];
    if (folder && folder !== 'all') {
      conditions.push(eq(mediaFiles.folder, folder));
    }
    if (search) {
      conditions.push(
        or(
          like(mediaFiles.filename, `%${search}%`),
          like(mediaFiles.altText, `%${search}%`),
          like(mediaFiles.tags, `%${search}%`)
        )
      );
    }

    const files = await db
      .select()
      .from(mediaFiles)
      .where(conditions.length > 0 ? conditions.reduce((acc, cond) => acc ? sql`${acc} AND ${cond}` : cond) : undefined)
      .orderBy(desc(mediaFiles.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(mediaFiles)
      .where(conditions.length > 0 ? conditions.reduce((acc, cond) => acc ? sql`${acc} AND ${cond}` : cond) : undefined);

    // Get folder counts
    const folderCounts = await db
      .select({
        folder: mediaFiles.folder,
        count: sql<number>`count(*)`,
      })
      .from(mediaFiles)
      .groupBy(mediaFiles.folder);

    return NextResponse.json({
      files,
      total: countResult?.count || 0,
      page,
      limit,
      totalPages: Math.ceil((countResult?.count || 0) / limit),
      folderCounts: Object.fromEntries(
        folderCounts.map((f) => [f.folder || 'general', f.count])
      ),
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();

    const file = {
      id: nanoid(),
      filename: body.filename,
      url: body.url,
      thumbnailUrl: body.thumbnailUrl || null,
      mimeType: body.mimeType || null,
      fileSize: body.fileSize || null,
      width: body.width || null,
      height: body.height || null,
      altText: body.altText || null,
      folder: body.folder || 'general',
      tags: body.tags ? JSON.stringify(body.tags) : null,
    };

    await db.insert(mediaFiles).values(file);

    const [created] = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, file.id));

    return NextResponse.json(created);
  } catch (error) {
    console.error('Error adding media:', error);
    return NextResponse.json(
      { error: 'Failed to add media' },
      { status: 500 }
    );
  }
}
