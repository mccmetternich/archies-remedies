import { AdminLayout } from '@/components/admin/admin-layout';
import { db } from '@/lib/db';
import { contactSubmissions } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const metadata = {
  title: "Admin | Archie's Remedies",
};

async function getUnreadCount() {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.isRead, false));
    return result[0]?.count || 0;
  } catch {
    return 0;
  }
}

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const unreadMessages = await getUnreadCount();
  return <AdminLayout unreadMessages={unreadMessages}>{children}</AdminLayout>;
}
