'use client';

import { PopupProvider } from './popup-provider';
import { WelcomePopup } from './welcome-popup';
import { ExitPopup } from './exit-popup';

interface SitePopupsProps {
  currentPage?: string;
  currentProductId?: string;
  settings: {
    // Welcome popup
    welcomePopupEnabled?: boolean;
    welcomePopupTitle?: string | null;
    welcomePopupSubtitle?: string | null;
    welcomePopupButtonText?: string | null;
    welcomePopupImageUrl?: string | null;
    welcomePopupVideoUrl?: string | null;
    welcomePopupDelay?: number | null;
    welcomePopupDismissDays?: number | null;
    welcomePopupCtaType?: string | null;
    welcomePopupDownloadUrl?: string | null;
    welcomePopupDownloadName?: string | null;
    welcomePopupSuccessTitle?: string | null;
    welcomePopupSuccessMessage?: string | null;
    // Exit popup
    exitPopupEnabled?: boolean;
    exitPopupTitle?: string | null;
    exitPopupSubtitle?: string | null;
    exitPopupButtonText?: string | null;
    exitPopupImageUrl?: string | null;
    exitPopupVideoUrl?: string | null;
    exitPopupDismissDays?: number | null;
    exitPopupCtaType?: string | null;
    exitPopupDownloadUrl?: string | null;
    exitPopupDownloadName?: string | null;
    exitPopupSuccessTitle?: string | null;
    exitPopupSuccessMessage?: string | null;
    exitPopupDelayAfterWelcome?: number | null;
  };
}

export function SitePopups({ currentPage = '/', currentProductId, settings }: SitePopupsProps) {
  return (
    <PopupProvider currentPage={currentPage} currentProductId={currentProductId}>
      <WelcomePopup
        enabled={settings.welcomePopupEnabled ?? false}
        title={settings.welcomePopupTitle || undefined}
        subtitle={settings.welcomePopupSubtitle || undefined}
        buttonText={settings.welcomePopupButtonText || undefined}
        imageUrl={settings.welcomePopupImageUrl}
        videoUrl={settings.welcomePopupVideoUrl}
        delay={settings.welcomePopupDelay ?? 3000}
        dismissDays={settings.welcomePopupDismissDays ?? 7}
        ctaType={(settings.welcomePopupCtaType as 'email' | 'sms' | 'download' | 'none') || 'email'}
        downloadFileUrl={settings.welcomePopupDownloadUrl}
        downloadFileName={settings.welcomePopupDownloadName}
        successTitle={settings.welcomePopupSuccessTitle || undefined}
        successMessage={settings.welcomePopupSuccessMessage || undefined}
      />
      <ExitPopup
        enabled={settings.exitPopupEnabled ?? false}
        title={settings.exitPopupTitle || undefined}
        subtitle={settings.exitPopupSubtitle || undefined}
        buttonText={settings.exitPopupButtonText || undefined}
        imageUrl={settings.exitPopupImageUrl}
        videoUrl={settings.exitPopupVideoUrl}
        dismissDays={settings.exitPopupDismissDays ?? 7}
        ctaType={(settings.exitPopupCtaType as 'email' | 'sms' | 'download' | 'none') || 'email'}
        downloadFileUrl={settings.exitPopupDownloadUrl}
        downloadFileName={settings.exitPopupDownloadName}
        successTitle={settings.exitPopupSuccessTitle || undefined}
        successMessage={settings.exitPopupSuccessMessage || undefined}
        welcomeEnabled={settings.welcomePopupEnabled ?? false}
        delayAfterWelcome={settings.exitPopupDelayAfterWelcome ?? 30}
      />
    </PopupProvider>
  );
}
