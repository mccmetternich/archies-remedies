import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Archie's Remedies - Safe, Clean Eye Care",
  description: 'Preservative-free eye drops and gentle eye wipes made without questionable ingredients. Safe for all ages.',
  keywords: ['eye drops', 'dry eye relief', 'preservative-free', 'eye care', 'eye wipes', 'clean beauty'],
  authors: [{ name: "Archie's Remedies" }],
  openGraph: {
    title: "Archie's Remedies - Safe, Clean Eye Care",
    description: 'Preservative-free eye drops and gentle eye wipes made without questionable ingredients.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Archie's Remedies - Safe, Clean Eye Care",
    description: 'Preservative-free eye drops and gentle eye wipes made without questionable ingredients.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
