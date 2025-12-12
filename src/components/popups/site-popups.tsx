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
    welcomePopupSessionOnly?: boolean | null;
    welcomePopupSessionExpiryHours?: number | null;
    welcomePopupCtaType?: string | null;
    welcomePopupDownloadUrl?: string | null;
    welcomePopupDownloadName?: string | null;
    welcomePopupSuccessTitle?: string | null;
    welcomePopupSuccessMessage?: string | null;
    // Welcome popup testimonial
    welcomePopupTestimonialEnabled?: boolean | null;
    welcomePopupTestimonialEnabledDesktop?: boolean | null;
    welcomePopupTestimonialEnabledMobile?: boolean | null;
    welcomePopupTestimonialQuote?: string | null;
    welcomePopupTestimonialAuthor?: string | null;
    welcomePopupTestimonialAvatarUrl?: string | null;
    welcomePopupTestimonialStars?: number | null;
    // Welcome popup success links
    welcomePopupSuccessLink1Text?: string | null;
    welcomePopupSuccessLink1Url?: string | null;
    welcomePopupSuccessLink2Text?: string | null;
    welcomePopupSuccessLink2Url?: string | null;
    // Welcome popup rotating badges
    welcomePopupFormBadgeUrl?: string | null;
    welcomePopupSuccessBadgeUrl?: string | null;
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
    // Exit popup testimonial
    exitPopupTestimonialEnabled?: boolean | null;
    exitPopupTestimonialEnabledDesktop?: boolean | null;
    exitPopupTestimonialEnabledMobile?: boolean | null;
    exitPopupTestimonialQuote?: string | null;
    exitPopupTestimonialAuthor?: string | null;
    exitPopupTestimonialAvatarUrl?: string | null;
    exitPopupTestimonialStars?: number | null;
    // Exit popup success links
    exitPopupSuccessLink1Text?: string | null;
    exitPopupSuccessLink1Url?: string | null;
    exitPopupSuccessLink2Text?: string | null;
    exitPopupSuccessLink2Url?: string | null;
    // Exit popup rotating badges
    exitPopupFormBadgeUrl?: string | null;
    exitPopupSuccessBadgeUrl?: string | null;
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
        sessionOnly={settings.welcomePopupSessionOnly ?? true}
        sessionExpiryHours={settings.welcomePopupSessionExpiryHours ?? 24}
        ctaType={(settings.welcomePopupCtaType as 'email' | 'sms' | 'download' | 'none') || 'email'}
        downloadFileUrl={settings.welcomePopupDownloadUrl}
        downloadFileName={settings.welcomePopupDownloadName}
        successTitle={settings.welcomePopupSuccessTitle || undefined}
        successMessage={settings.welcomePopupSuccessMessage || undefined}
        // Testimonial bubble
        testimonialEnabled={settings.welcomePopupTestimonialEnabled ?? false}
        testimonialEnabledDesktop={settings.welcomePopupTestimonialEnabledDesktop ?? true}
        testimonialEnabledMobile={settings.welcomePopupTestimonialEnabledMobile ?? true}
        testimonialQuote={settings.welcomePopupTestimonialQuote}
        testimonialAuthor={settings.welcomePopupTestimonialAuthor}
        testimonialAvatarUrl={settings.welcomePopupTestimonialAvatarUrl}
        testimonialStars={settings.welcomePopupTestimonialStars ?? 5}
        // Success links
        successLink1Text={settings.welcomePopupSuccessLink1Text}
        successLink1Url={settings.welcomePopupSuccessLink1Url}
        successLink2Text={settings.welcomePopupSuccessLink2Text}
        successLink2Url={settings.welcomePopupSuccessLink2Url}
        // Rotating badges
        formBadgeUrl={settings.welcomePopupFormBadgeUrl}
        successBadgeUrl={settings.welcomePopupSuccessBadgeUrl}
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
        // Testimonial bubble
        testimonialEnabled={settings.exitPopupTestimonialEnabled ?? false}
        testimonialEnabledDesktop={settings.exitPopupTestimonialEnabledDesktop ?? true}
        testimonialEnabledMobile={settings.exitPopupTestimonialEnabledMobile ?? true}
        testimonialQuote={settings.exitPopupTestimonialQuote}
        testimonialAuthor={settings.exitPopupTestimonialAuthor}
        testimonialAvatarUrl={settings.exitPopupTestimonialAvatarUrl}
        testimonialStars={settings.exitPopupTestimonialStars ?? 5}
        // Success links
        successLink1Text={settings.exitPopupSuccessLink1Text}
        successLink1Url={settings.exitPopupSuccessLink1Url}
        successLink2Text={settings.exitPopupSuccessLink2Text}
        successLink2Url={settings.exitPopupSuccessLink2Url}
        // Rotating badges
        formBadgeUrl={settings.exitPopupFormBadgeUrl}
        successBadgeUrl={settings.exitPopupSuccessBadgeUrl}
      />
    </PopupProvider>
  );
}
