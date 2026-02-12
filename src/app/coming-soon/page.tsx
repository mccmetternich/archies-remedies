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
      title={settings?.draftModeTitle || 'Launching Soon'}
      subtitle={settings?.draftModeSubtitle || "A women's health and wellness lab in stealth, developing breakthrough products that address real needs with research and science."}
      siteName={settings?.siteName || "Archie's Remedies"}
      footerStyle={(settings?.draftModeFooterStyle as 'badges' | 'quip') || 'badges'}
      callout1={settings?.draftModeCallout1 || 'Research-Driven'}
      callout2={settings?.draftModeCallout2 || 'Women-Focused'}
      callout3={settings?.draftModeCallout3 || 'Science-Backed'}
      brandQuip={settings?.draftModeBrandQuip || 'Breakthrough solutions for women\'s real health needs.'}
      defaultContactType={(settings?.draftModeContactType as 'email' | 'phone') || 'phone'}
      instagramUrl={settings?.instagramUrl || undefined}
      facebookUrl={settings?.facebookUrl || undefined}
    />
  );
}
