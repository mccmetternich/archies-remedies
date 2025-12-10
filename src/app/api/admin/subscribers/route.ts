import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts, contactActivity } from '@/lib/db/schema';
import { desc, eq, and, or, gte, sql, isNotNull, ne } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

// GET /api/admin/subscribers - List all contacts with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'email' | 'sms' | 'all'
    const status = searchParams.get('status'); // 'active' | 'inactive' | 'all'
    const dateFrom = searchParams.get('dateFrom');
    const search = searchParams.get('search');

    // Build query conditions
    const conditions = [];

    // Filter by type (email or sms)
    if (type === 'email') {
      conditions.push(isNotNull(contacts.email));
      conditions.push(ne(contacts.emailStatus, 'none'));
    } else if (type === 'sms') {
      conditions.push(isNotNull(contacts.phone));
      conditions.push(ne(contacts.smsStatus, 'none'));
    }

    // Filter by status
    if (status && status !== 'all') {
      if (type === 'email') {
        conditions.push(eq(contacts.emailStatus, status));
      } else if (type === 'sms') {
        conditions.push(eq(contacts.smsStatus, status));
      } else {
        // For 'all' type, match either email or sms status
        conditions.push(
          or(
            eq(contacts.emailStatus, status),
            eq(contacts.smsStatus, status)
          )
        );
      }
    }

    // Date filter
    if (dateFrom) {
      conditions.push(gte(contacts.createdAt, dateFrom));
    }

    // Search filter
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${contacts.email}) LIKE ${searchLower}`,
          sql`LOWER(${contacts.phone}) LIKE ${searchLower}`,
          sql`LOWER(${contacts.firstName}) LIKE ${searchLower}`,
          sql`LOWER(${contacts.lastName}) LIKE ${searchLower}`
        )
      );
    }

    // Execute query with conditions
    const data = conditions.length > 0
      ? await db
          .select()
          .from(contacts)
          .where(and(...conditions))
          .orderBy(desc(contacts.createdAt))
      : await db
          .select()
          .from(contacts)
          .orderBy(desc(contacts.createdAt));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST /api/admin/subscribers - Create a new contact
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      phone,
      firstName,
      lastName,
      source = 'admin',
      emailStatus = 'active',
      smsStatus = phone ? 'active' : 'none',
    } = body;

    // Check if contact already exists
    if (email) {
      const existing = await db
        .select()
        .from(contacts)
        .where(eq(contacts.email, email))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Contact with this email already exists' },
          { status: 400 }
        );
      }
    }

    const id = generateId();
    const now = new Date().toISOString();

    await db.insert(contacts).values({
      id,
      email: email || null,
      phone: phone || null,
      firstName: firstName || null,
      lastName: lastName || null,
      source,
      emailStatus: email ? emailStatus : 'none',
      smsStatus: phone ? smsStatus : 'none',
      emailConsentAt: email ? now : null,
      smsConsentAt: phone ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    const [created] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id));

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create contact:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

// GET stats summary
export async function OPTIONS() {
  return NextResponse.json({ message: 'Use GET /api/admin/subscribers/stats for statistics' });
}
