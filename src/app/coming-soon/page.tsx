import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
import { ComingSoonClient } from './client';

export default async function ComingSoonPage() {
  // Fetch site settings from database
  const [settings] = await db.select().from(siteSettings).limit(1);

  return (
    <ComingSoonClient
      logoUrl={settings?.logoUrl || undefined}
      badgeUrl={settings?.draftModeBadgeUrl || undefined}
      title={settings?.draftModeTitle || 'Coming Soon'}
      subtitle={settings?.draftModeSubtitle || "We're working on something special. Leave your email to be the first to know when we launch."}
      siteName={settings?.siteName || "Archie's Remedies"}
    />
  );
}
