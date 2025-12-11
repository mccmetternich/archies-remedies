import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import { eq, and, gte, isNotNull, ne, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');

    // Build date condition if provided
    const dateCondition = dateFrom ? gte(contacts.createdAt, dateFrom) : undefined;

    // Get counts for different categories
    const [
      totalContacts,
      activeEmails,
      inactiveEmails,
      activeSms,
      inactiveSms,
    ] = await Promise.all([
      // Total contacts
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(contacts)
        .where(dateCondition)
        .then(r => r[0]?.count || 0),

      // Active emails
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(contacts)
        .where(
          dateCondition
            ? and(
                isNotNull(contacts.email),
                eq(contacts.emailStatus, 'active'),
                dateCondition
              )
            : and(
                isNotNull(contacts.email),
                eq(contacts.emailStatus, 'active')
              )
        )
        .then(r => r[0]?.count || 0),

      // Inactive emails
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(contacts)
        .where(
          dateCondition
            ? and(
                isNotNull(contacts.email),
                eq(contacts.emailStatus, 'inactive'),
                dateCondition
              )
            : and(
                isNotNull(contacts.email),
                eq(contacts.emailStatus, 'inactive')
              )
        )
        .then(r => r[0]?.count || 0),

      // Active SMS
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(contacts)
        .where(
          dateCondition
            ? and(
                isNotNull(contacts.phone),
                eq(contacts.smsStatus, 'active'),
                dateCondition
              )
            : and(
                isNotNull(contacts.phone),
                eq(contacts.smsStatus, 'active')
              )
        )
        .then(r => r[0]?.count || 0),

      // Inactive SMS
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(contacts)
        .where(
          dateCondition
            ? and(
                isNotNull(contacts.phone),
                eq(contacts.smsStatus, 'inactive'),
                dateCondition
              )
            : and(
                isNotNull(contacts.phone),
                eq(contacts.smsStatus, 'inactive')
              )
        )
        .then(r => r[0]?.count || 0),
    ]);

    return NextResponse.json({
      total: totalContacts,
      emails: {
        active: activeEmails,
        inactive: inactiveEmails,
        total: activeEmails + inactiveEmails,
      },
      sms: {
        active: activeSms,
        inactive: inactiveSms,
        total: activeSms + inactiveSms,
      },
    });
  } catch (error) {
    console.error('Failed to fetch contact stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
