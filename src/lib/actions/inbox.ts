'use server';

import { revalidatePath } from 'next/cache';

/**
 * Server action to refresh the inbox count in the admin layout sidebar.
 * Call this after marking a message as read to update the unread count.
 */
export async function refreshInboxCount() {
  revalidatePath('/admin', 'layout');
}

/**
 * Server action to mark a message as read and refresh the inbox count.
 */
export async function markMessageAsRead(messageId: string) {
  try {
    // Import db here to avoid issues with server actions
    const { db } = await import('@/lib/db');
    const { contactSubmissions } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');

    await db
      .update(contactSubmissions)
      .set({ isRead: true })
      .where(eq(contactSubmissions.id, messageId));

    // Revalidate the admin layout to update sidebar count
    revalidatePath('/admin', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Failed to mark message as read:', error);
    return { success: false, error: 'Failed to mark message as read' };
  }
}
