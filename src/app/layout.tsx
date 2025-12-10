import type { Metadata } from 'next';
import './globals.css';
import { PageTracker } from '@/components/tracking/page-tracker';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';

export async function generateMetadata(): Promise<Metadata> {
  const [settings] = await db.select().from(siteSettings).limit(1);

  const siteName = settings?.siteName || "Archie's Remedies";
  const description = settings?.metaDescription || 'Preservative-free eye drops and gentle eye wipes made without questionable ingredients. Safe for all ages.';
  const title = settings?.metaTitle || `${siteName} - Safe, Clean Eye Care`;

  return {
    title,
    description,
    keywords: ['eye drops', 'dry eye relief', 'preservative-free', 'eye care', 'eye wipes', 'clean beauty'],
    authors: [{ name: siteName }],
    icons: settings?.faviconUrl ? {
      icon: settings.faviconUrl,
      shortcut: settings.faviconUrl,
      apple: settings.faviconUrl,
    } : undefined,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
      images: settings?.ogImageUrl ? [settings.ogImageUrl] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: settings?.ogImageUrl ? [settings.ogImageUrl] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PageTracker />
        {children}
      </body>
    </html>
  );
}
