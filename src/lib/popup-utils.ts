import { isVideoUrl } from './media-utils';

interface PopupMediaUrls {
  // Legacy URLs
  imageUrl?: string | null;
  videoUrl?: string | null;
  // Form state media (desktop/mobile)
  formDesktopImageUrl?: string | null;
  formDesktopVideoUrl?: string | null;
  formMobileImageUrl?: string | null;
  formMobileVideoUrl?: string | null;
  // Success state media (desktop/mobile)
  successDesktopImageUrl?: string | null;
  successDesktopVideoUrl?: string | null;
  successMobileImageUrl?: string | null;
  successMobileVideoUrl?: string | null;
}

interface EffectiveMediaUrls {
  desktopVideoUrl: string | null | undefined;
  desktopImageUrl: string | null | undefined;
  mobileVideoUrl: string | null | undefined;
  mobileImageUrl: string | null | undefined;
  hasDesktopVideo: boolean;
  hasMobileVideo: boolean;
  hasLegacyVideo: boolean;
}

/**
 * Calculate effective media URLs based on popup state.
 * Handles fallback chain: success state -> form state -> legacy URLs
 */
export function getEffectivePopupMedia(
  urls: PopupMediaUrls,
  isSuccessState: boolean
): EffectiveMediaUrls {
  const {
    imageUrl,
    videoUrl,
    formDesktopImageUrl,
    formDesktopVideoUrl,
    formMobileImageUrl,
    formMobileVideoUrl,
    successDesktopImageUrl,
    successDesktopVideoUrl,
    successMobileImageUrl,
    successMobileVideoUrl,
  } = urls;

  // Desktop media: success state falls back to form state, form state falls back to legacy
  const desktopVideoUrl = isSuccessState
    ? (successDesktopVideoUrl || formDesktopVideoUrl || videoUrl)
    : (formDesktopVideoUrl || videoUrl);
  const desktopImageUrl = isSuccessState
    ? (successDesktopImageUrl || formDesktopImageUrl || imageUrl)
    : (formDesktopImageUrl || imageUrl);

  // Mobile media: success state falls back to form state mobile, then desktop
  const mobileVideoUrl = isSuccessState
    ? (successMobileVideoUrl || successDesktopVideoUrl || formMobileVideoUrl || formDesktopVideoUrl || videoUrl)
    : (formMobileVideoUrl || formDesktopVideoUrl || videoUrl);
  const mobileImageUrl = isSuccessState
    ? (successMobileImageUrl || successDesktopImageUrl || formMobileImageUrl || formDesktopImageUrl || imageUrl)
    : (formMobileImageUrl || formDesktopImageUrl || imageUrl);

  return {
    desktopVideoUrl,
    desktopImageUrl,
    mobileVideoUrl,
    mobileImageUrl,
    hasDesktopVideo: isVideoUrl(desktopVideoUrl),
    hasMobileVideo: isVideoUrl(mobileVideoUrl),
    hasLegacyVideo: isVideoUrl(videoUrl),
  };
}

/**
 * Storage keys for popup dismissal tracking
 */
export const POPUP_STORAGE_KEYS = {
  WELCOME_DISMISSED: 'welcome_popup_dismissed',
  WELCOME_DISMISSED_SESSION: 'welcome_popup_dismissed_session',
  EXIT_DISMISSED: 'exit_popup_dismissed',
  POPUP_SUBMITTED: 'popup_submitted',
  CUSTOM_POPUP_PREFIX: 'custom_popup_dismissed_',
} as const;

/**
 * Check if a popup was dismissed within the given days
 */
export function wasPopupDismissedWithinDays(
  storageKey: string,
  days: number
): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) return false;

    const dismissedDate = new Date(dismissed);
    const now = new Date();
    const diffDays = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

    return diffDays < days;
  } catch {
    return false;
  }
}

/**
 * Mark a popup as dismissed
 */
export function markPopupDismissed(storageKey: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(storageKey, new Date().toISOString());
  } catch {
    // Storage might be full or blocked
  }
}
