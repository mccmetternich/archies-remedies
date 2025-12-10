import { checkDraftMode } from '@/lib/draft-mode';

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to /coming-soon if draft mode is active and no access
  await checkDraftMode();

  return <>{children}</>;
}
