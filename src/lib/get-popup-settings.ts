/**
 * Popup Settings Helper
 *
 * Extracts popup settings from siteSettings for use in SitePopups component.
 * This helper ensures consistent popup behavior across all pages.
 */

import { siteSettings } from '@/lib/db/schema';

type SiteSettings = typeof siteSettings.$inferSelect | null | undefined;

export function getPopupSettings(settings: SiteSettings) {
  if (!settings) {
    return {
      // Welcome popup - basic (all disabled by default)
      welcomePopupEnabled: false,
      welcomePopupTitle: undefined,
      welcomePopupSubtitle: undefined,
      welcomePopupButtonText: undefined,
      welcomePopupImageUrl: undefined,
      welcomePopupVideoUrl: undefined,
      welcomePopupFormDesktopImageUrl: undefined,
      welcomePopupFormDesktopVideoUrl: undefined,
      welcomePopupFormMobileImageUrl: undefined,
      welcomePopupFormMobileVideoUrl: undefined,
      welcomePopupSuccessDesktopImageUrl: undefined,
      welcomePopupSuccessDesktopVideoUrl: undefined,
      welcomePopupSuccessMobileImageUrl: undefined,
      welcomePopupSuccessMobileVideoUrl: undefined,
      welcomePopupDelay: 3000,
      welcomePopupDismissDays: 7,
      welcomePopupSessionOnly: true,
      welcomePopupSessionExpiryHours: 24,
      welcomePopupCtaType: 'email',
      welcomePopupDownloadUrl: undefined,
      welcomePopupDownloadName: undefined,
      welcomePopupDownloadText: undefined,
      welcomePopupSuccessTitle: undefined,
      welcomePopupSuccessMessage: undefined,
      welcomePopupTestimonialEnabled: false,
      welcomePopupTestimonialEnabledDesktop: true,
      welcomePopupTestimonialEnabledMobile: true,
      welcomePopupTestimonialQuote: undefined,
      welcomePopupTestimonialAuthor: undefined,
      welcomePopupTestimonialAvatarUrl: undefined,
      welcomePopupTestimonialStars: 5,
      welcomePopupSuccessLink1Text: undefined,
      welcomePopupSuccessLink1Url: undefined,
      welcomePopupSuccessLink2Text: undefined,
      welcomePopupSuccessLink2Url: undefined,
      welcomePopupFormBadgeUrl: undefined,
      welcomePopupSuccessBadgeUrl: undefined,
      // Exit popup (all disabled)
      exitPopupEnabled: false,
      exitPopupTitle: undefined,
      exitPopupSubtitle: undefined,
      exitPopupButtonText: undefined,
      exitPopupImageUrl: undefined,
      exitPopupVideoUrl: undefined,
      exitPopupFormDesktopImageUrl: undefined,
      exitPopupFormDesktopVideoUrl: undefined,
      exitPopupFormMobileImageUrl: undefined,
      exitPopupFormMobileVideoUrl: undefined,
      exitPopupSuccessDesktopImageUrl: undefined,
      exitPopupSuccessDesktopVideoUrl: undefined,
      exitPopupSuccessMobileImageUrl: undefined,
      exitPopupSuccessMobileVideoUrl: undefined,
      exitPopupDismissDays: 7,
      exitPopupDelayAfterWelcome: 30,
      exitPopupCtaType: 'email',
      exitPopupDownloadUrl: undefined,
      exitPopupDownloadName: undefined,
      exitPopupDownloadText: undefined,
      exitPopupSuccessTitle: undefined,
      exitPopupSuccessMessage: undefined,
      exitPopupTestimonialEnabled: false,
      exitPopupTestimonialEnabledDesktop: true,
      exitPopupTestimonialEnabledMobile: true,
      exitPopupTestimonialQuote: undefined,
      exitPopupTestimonialAuthor: undefined,
      exitPopupTestimonialAvatarUrl: undefined,
      exitPopupTestimonialStars: 5,
      exitPopupSuccessLink1Text: undefined,
      exitPopupSuccessLink1Url: undefined,
      exitPopupSuccessLink2Text: undefined,
      exitPopupSuccessLink2Url: undefined,
      exitPopupFormBadgeUrl: undefined,
      exitPopupSuccessBadgeUrl: undefined,
    };
  }

  return {
    // Welcome popup - basic
    welcomePopupEnabled: settings.welcomePopupEnabled ?? settings.emailPopupEnabled ?? false,
    welcomePopupTitle: settings.welcomePopupTitle ?? settings.emailPopupTitle,
    welcomePopupSubtitle: settings.welcomePopupSubtitle ?? settings.emailPopupSubtitle,
    welcomePopupButtonText: settings.welcomePopupButtonText ?? settings.emailPopupButtonText,
    welcomePopupImageUrl: settings.welcomePopupImageUrl ?? settings.emailPopupImageUrl,
    welcomePopupVideoUrl: settings.welcomePopupVideoUrl,
    // Welcome popup - desktop/mobile form media
    welcomePopupFormDesktopImageUrl: settings.welcomePopupFormDesktopImageUrl,
    welcomePopupFormDesktopVideoUrl: settings.welcomePopupFormDesktopVideoUrl,
    welcomePopupFormMobileImageUrl: settings.welcomePopupFormMobileImageUrl,
    welcomePopupFormMobileVideoUrl: settings.welcomePopupFormMobileVideoUrl,
    // Welcome popup - desktop/mobile success media
    welcomePopupSuccessDesktopImageUrl: settings.welcomePopupSuccessDesktopImageUrl,
    welcomePopupSuccessDesktopVideoUrl: settings.welcomePopupSuccessDesktopVideoUrl,
    welcomePopupSuccessMobileImageUrl: settings.welcomePopupSuccessMobileImageUrl,
    welcomePopupSuccessMobileVideoUrl: settings.welcomePopupSuccessMobileVideoUrl,
    // Welcome popup - timing
    welcomePopupDelay: settings.welcomePopupDelay ?? 3000,
    welcomePopupDismissDays: settings.welcomePopupDismissDays ?? 7,
    welcomePopupSessionOnly: settings.welcomePopupSessionOnly ?? true,
    welcomePopupSessionExpiryHours: settings.welcomePopupSessionExpiryHours ?? 24,
    // Welcome popup - CTA
    welcomePopupCtaType: settings.welcomePopupCtaType ?? 'email',
    welcomePopupDownloadUrl: settings.welcomePopupDownloadUrl,
    welcomePopupDownloadName: settings.welcomePopupDownloadName,
    welcomePopupDownloadText: settings.welcomePopupDownloadText,
    welcomePopupSuccessTitle: settings.welcomePopupSuccessTitle,
    welcomePopupSuccessMessage: settings.welcomePopupSuccessMessage,
    // Welcome popup - testimonial
    welcomePopupTestimonialEnabled: settings.welcomePopupTestimonialEnabled ?? false,
    welcomePopupTestimonialEnabledDesktop: settings.welcomePopupTestimonialEnabledDesktop ?? true,
    welcomePopupTestimonialEnabledMobile: settings.welcomePopupTestimonialEnabledMobile ?? true,
    welcomePopupTestimonialQuote: settings.welcomePopupTestimonialQuote,
    welcomePopupTestimonialAuthor: settings.welcomePopupTestimonialAuthor,
    welcomePopupTestimonialAvatarUrl: settings.welcomePopupTestimonialAvatarUrl,
    welcomePopupTestimonialStars: settings.welcomePopupTestimonialStars ?? 5,
    // Welcome popup - success links
    welcomePopupSuccessLink1Text: settings.welcomePopupSuccessLink1Text,
    welcomePopupSuccessLink1Url: settings.welcomePopupSuccessLink1Url,
    welcomePopupSuccessLink2Text: settings.welcomePopupSuccessLink2Text,
    welcomePopupSuccessLink2Url: settings.welcomePopupSuccessLink2Url,
    // Welcome popup - rotating badges
    welcomePopupFormBadgeUrl: settings.welcomePopupFormBadgeUrl,
    welcomePopupSuccessBadgeUrl: settings.welcomePopupSuccessBadgeUrl,

    // Exit popup - basic
    exitPopupEnabled: settings.exitPopupEnabled ?? false,
    exitPopupTitle: settings.exitPopupTitle,
    exitPopupSubtitle: settings.exitPopupSubtitle,
    exitPopupButtonText: settings.exitPopupButtonText,
    exitPopupImageUrl: settings.exitPopupImageUrl,
    exitPopupVideoUrl: settings.exitPopupVideoUrl,
    // Exit popup - desktop/mobile form media
    exitPopupFormDesktopImageUrl: settings.exitPopupFormDesktopImageUrl,
    exitPopupFormDesktopVideoUrl: settings.exitPopupFormDesktopVideoUrl,
    exitPopupFormMobileImageUrl: settings.exitPopupFormMobileImageUrl,
    exitPopupFormMobileVideoUrl: settings.exitPopupFormMobileVideoUrl,
    // Exit popup - desktop/mobile success media
    exitPopupSuccessDesktopImageUrl: settings.exitPopupSuccessDesktopImageUrl,
    exitPopupSuccessDesktopVideoUrl: settings.exitPopupSuccessDesktopVideoUrl,
    exitPopupSuccessMobileImageUrl: settings.exitPopupSuccessMobileImageUrl,
    exitPopupSuccessMobileVideoUrl: settings.exitPopupSuccessMobileVideoUrl,
    // Exit popup - timing
    exitPopupDismissDays: settings.exitPopupDismissDays ?? 7,
    exitPopupDelayAfterWelcome: settings.exitPopupDelayAfterWelcome ?? 30,
    // Exit popup - CTA
    exitPopupCtaType: settings.exitPopupCtaType ?? 'email',
    exitPopupDownloadUrl: settings.exitPopupDownloadUrl,
    exitPopupDownloadName: settings.exitPopupDownloadName,
    exitPopupDownloadText: settings.exitPopupDownloadText,
    exitPopupSuccessTitle: settings.exitPopupSuccessTitle,
    exitPopupSuccessMessage: settings.exitPopupSuccessMessage,
    // Exit popup - testimonial
    exitPopupTestimonialEnabled: settings.exitPopupTestimonialEnabled ?? false,
    exitPopupTestimonialEnabledDesktop: settings.exitPopupTestimonialEnabledDesktop ?? true,
    exitPopupTestimonialEnabledMobile: settings.exitPopupTestimonialEnabledMobile ?? true,
    exitPopupTestimonialQuote: settings.exitPopupTestimonialQuote,
    exitPopupTestimonialAuthor: settings.exitPopupTestimonialAuthor,
    exitPopupTestimonialAvatarUrl: settings.exitPopupTestimonialAvatarUrl,
    exitPopupTestimonialStars: settings.exitPopupTestimonialStars ?? 5,
    // Exit popup - success links
    exitPopupSuccessLink1Text: settings.exitPopupSuccessLink1Text,
    exitPopupSuccessLink1Url: settings.exitPopupSuccessLink1Url,
    exitPopupSuccessLink2Text: settings.exitPopupSuccessLink2Text,
    exitPopupSuccessLink2Url: settings.exitPopupSuccessLink2Url,
    // Exit popup - rotating badges
    exitPopupFormBadgeUrl: settings.exitPopupFormBadgeUrl,
    exitPopupSuccessBadgeUrl: settings.exitPopupSuccessBadgeUrl,
  };
}
