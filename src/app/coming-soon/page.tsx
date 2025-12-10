import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
import { ComingSoonClient } from './client';

export const dynamic = 'force-dynamic';

export default async function ComingSoonPage() {
  // Fetch site settings from database
  const [settings] = await db.select().from(siteSettings).limit(1);

  return (
    <ComingSoonClient
      logoUrl={settings?.logoUrl || undefined}
      badgeUrl={settings?.draftModeBadgeUrl || undefined}
      title={settings?.draftModeTitle || 'Coming Soon'}
      subtitle={settings?.draftModeSubtitle || "Pure ingredients. Radiant you."}
      siteName={settings?.siteName || "Archie's Remedies"}
      footerStyle={(settings?.draftModeFooterStyle as 'badges' | 'quip') || 'badges'}
      callout1={settings?.draftModeCallout1 || 'Preservative-Free'}
      callout2={settings?.draftModeCallout2 || 'Clean Ingredients'}
      callout3={settings?.draftModeCallout3 || 'Made in USA'}
      brandQuip={settings?.draftModeBrandQuip || 'Where clean beauty meets clear vision.'}
      defaultContactType={(settings?.draftModeContactType as 'email' | 'phone') || 'phone'}
      instagramUrl={settings?.instagramUrl || undefined}
      facebookUrl={settings?.facebookUrl || undefined}
    />
  );
}
