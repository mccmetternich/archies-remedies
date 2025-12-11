import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import { desc, eq, and, isNotNull, gte } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'email' | 'sms' | 'all'
    const dateFrom = searchParams.get('dateFrom');

    // Build query conditions
    const conditions = [];

    if (type === 'email') {
      conditions.push(isNotNull(contacts.email));
    } else if (type === 'sms') {
      conditions.push(isNotNull(contacts.phone));
    }

    if (dateFrom) {
      conditions.push(gte(contacts.createdAt, dateFrom));
    }

    // Fetch contacts
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

    // Build CSV
    const headers = [
      'Email',
      'Phone',
      'First Name',
      'Last Name',
      'Address',
      'City',
      'State',
      'Zip Code',
      'Country',
      'Email Status',
      'SMS Status',
      'Source',
      'Created At',
    ];

    const rows = data.map((contact) => [
      contact.email || '',
      contact.phone || '',
      contact.firstName || '',
      contact.lastName || '',
      contact.address || '',
      contact.city || '',
      contact.state || '',
      contact.zipCode || '',
      contact.country || '',
      contact.emailStatus || '',
      contact.smsStatus || '',
      contact.source || '',
      contact.createdAt || '',
    ]);

    // Escape CSV values
    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n');

    // Return as downloadable file
    const filename = `contacts-export-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Failed to export contacts:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
