'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

// localStorage keys
const STORAGE_KEYS = {
  POPUP_SUBMITTED: 'archies-popup-submitted', // If true, skip exit popups
  WELCOME_DISMISSED: 'archies-welcome-dismissed-at',
  WELCOME_SESSION_SHOWN: 'archies-welcome-shown-session', // sessionStorage key
  EXIT_DISMISSED: 'archies-exit-dismissed-at',
  CUSTOM_DISMISSED: (id: string) => `archies-popup-${id}-dismissed-at`,
  // Legacy key for backwards compatibility
  LEGACY_DISMISSED: 'archies-popup-dismissed',
};

interface CustomPopup {
  id: string;
  name: string;
  title: string | null;
  body: string | null;
  videoUrl: string | null;
  videoThumbnailUrl: string | null;
  imageUrl: string | null;
  ctaType: 'email' | 'sms' | 'download' | 'none';
  ctaButtonText: string;
  downloadFileUrl: string | null;
  downloadFileName: string | null;
  targetType: 'all' | 'specific' | 'product';
  targetPages: string[];
  targetProductIds: string[];
  triggerType: 'timer' | 'exit' | 'scroll';
  triggerDelay: number;
  triggerScrollPercent: number;
  dismissDays: number;
  status: 'draft' | 'live';
  priority: number;
}

interface PopupContextType {
  // State
  hasSubmittedPopup: boolean;
  welcomeDismissedAt: number | null;
  exitDismissedAt: number | null;
  activePopup: string | null; // Currently visible popup ID
  customPopup: CustomPopup | null;

  // Actions
  setPopupSubmitted: () => void;
  dismissWelcomePopup: () => void;
  dismissExitPopup: () => void;
  dismissCustomPopup: (popupId: string) => void;
  setActivePopup: (popupId: string | null) => void;

  // Checks
  canShowWelcomePopup: (options?: { sessionOnly?: boolean; sessionExpiryHours?: number; dismissDays?: number }) => boolean;
  canShowExitPopup: (dismissDays?: number) => boolean;
  canShowCustomPopup: (popupId: string, dismissDays?: number) => boolean;

  // Tracking
  trackPopupView: (popupId: string | null, popupType: 'welcome' | 'exit' | 'custom', pageSlug?: string) => void;
  trackPopupDismiss: (popupId: string | null, popupType: 'welcome' | 'exit' | 'custom') => void;

  // Submit handlers (with optional download tracking)
  submitEmail: (email: string, popupId: string | null, popupType: 'welcome' | 'exit' | 'custom', downloadInfo?: { fileUrl?: string; fileName?: string }) => Promise<boolean>;
  submitPhone: (phone: string, popupId: string | null, popupType: 'welcome' | 'exit' | 'custom', downloadInfo?: { fileUrl?: string; fileName?: string }) => Promise<boolean>;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function usePopup() {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}

interface PopupProviderProps {
  children: ReactNode;
  currentPage?: string;
  currentProductId?: string;
}

export function PopupProvider({ children, currentPage = '/', currentProductId }: PopupProviderProps) {
  const [hasSubmittedPopup, setHasSubmittedPopup] = useState(false);
  const [welcomeDismissedAt, setWelcomeDismissedAt] = useState<number | null>(null);
  const [exitDismissedAt, setExitDismissedAt] = useState<number | null>(null);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [customPopup, setCustomPopup] = useState<CustomPopup | null>(null);
  const [customDismissals, setCustomDismissals] = useState<Record<string, number>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const submitted = localStorage.getItem(STORAGE_KEYS.POPUP_SUBMITTED) === 'true';
    const legacyDismissed = localStorage.getItem(STORAGE_KEYS.LEGACY_DISMISSED) === 'true';
    const welcomeAt = localStorage.getItem(STORAGE_KEYS.WELCOME_DISMISSED);
    const exitAt = localStorage.getItem(STORAGE_KEYS.EXIT_DISMISSED);

    setHasSubmittedPopup(submitted || legacyDismissed);
    setWelcomeDismissedAt(welcomeAt ? parseInt(welcomeAt, 10) : (legacyDismissed ? Date.now() : null));
    setExitDismissedAt(exitAt ? parseInt(exitAt, 10) : null);
    setIsHydrated(true);
  }, []);

  // Fetch applicable custom popup for current page
  useEffect(() => {
    async function fetchCustomPopup() {
      try {
        const params = new URLSearchParams({ page: currentPage });
        if (currentProductId) {
          params.append('productId', currentProductId);
        }

        const res = await fetch(`/api/popup?${params}`);
        if (res.ok) {
          const data = await res.json();
          setCustomPopup(data.popup);
        }
      } catch (error) {
        console.error('Failed to fetch custom popup:', error);
      }
    }

    fetchCustomPopup();
  }, [currentPage, currentProductId]);

  const setPopupSubmitted = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.POPUP_SUBMITTED, 'true');
    localStorage.setItem(STORAGE_KEYS.LEGACY_DISMISSED, 'true');
    setHasSubmittedPopup(true);
  }, []);

  const dismissWelcomePopup = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.WELCOME_DISMISSED, now.toString());
    localStorage.setItem(STORAGE_KEYS.LEGACY_DISMISSED, 'true');
    // Also mark as shown this session
    try {
      sessionStorage.setItem(STORAGE_KEYS.WELCOME_SESSION_SHOWN, 'true');
    } catch {
      // sessionStorage not available
    }
    setWelcomeDismissedAt(now);
  }, []);

  const dismissExitPopup = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.EXIT_DISMISSED, now.toString());
    setExitDismissedAt(now);
  }, []);

  const dismissCustomPopup = useCallback((popupId: string) => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.CUSTOM_DISMISSED(popupId), now.toString());
    setCustomDismissals(prev => ({ ...prev, [popupId]: now }));
  }, []);

  const canShowWelcomePopup = useCallback((options?: { sessionOnly?: boolean; sessionExpiryHours?: number; dismissDays?: number }) => {
    const { sessionOnly = true, sessionExpiryHours = 24, dismissDays = 7 } = options || {};

    // Don't show until localStorage state is loaded
    if (!isHydrated) return false;

    // Don't show if already submitted
    if (hasSubmittedPopup) return false;

    // Don't show if another popup is active
    if (activePopup) return false;

    // Session-based behavior (default)
    if (sessionOnly) {
      // Check if already shown this session (sessionStorage)
      try {
        const shownThisSession = sessionStorage.getItem(STORAGE_KEYS.WELCOME_SESSION_SHOWN);
        if (shownThisSession === 'true') return false;
      } catch {
        // sessionStorage not available, fall back to localStorage
      }

      // Check time-based expiry (localStorage) - hours
      if (welcomeDismissedAt) {
        const hoursSinceDismiss = (Date.now() - welcomeDismissedAt) / (1000 * 60 * 60);
        if (hoursSinceDismiss < sessionExpiryHours) return false;
      }
    } else {
      // Legacy days-based behavior
      if (welcomeDismissedAt) {
        const daysSinceDismiss = (Date.now() - welcomeDismissedAt) / (1000 * 60 * 60 * 24);
        if (daysSinceDismiss < dismissDays) return false;
      }
    }

    return true;
  }, [isHydrated, hasSubmittedPopup, activePopup, welcomeDismissedAt]);

  const canShowExitPopup = useCallback((dismissDays = 7) => {
    // Don't show if user already submitted to any popup
    if (hasSubmittedPopup) return false;

    // Don't show if another popup is active
    if (activePopup) return false;

    // Check dismissal
    if (exitDismissedAt) {
      const daysSinceDismiss = (Date.now() - exitDismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < dismissDays) return false;
    }

    return true;
  }, [hasSubmittedPopup, activePopup, exitDismissedAt]);

  const canShowCustomPopup = useCallback((popupId: string, dismissDays = 7) => {
    // Don't show if another popup is active
    if (activePopup && activePopup !== popupId) return false;

    // Check dismissal for this specific popup
    let dismissedAt = customDismissals[popupId];
    if (!dismissedAt) {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_DISMISSED(popupId));
      if (stored) dismissedAt = parseInt(stored, 10);
    }

    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < dismissDays) return false;
    }

    return true;
  }, [activePopup, customDismissals]);

  const trackPopupView = useCallback(async (
    popupId: string | null,
    popupType: 'welcome' | 'exit' | 'custom',
    pageSlug?: string
  ) => {
    try {
      await fetch('/api/popup/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popupId,
          popupType,
          action: 'view',
          pageSlug,
        }),
      });
    } catch (error) {
      console.error('Failed to track popup view:', error);
    }
  }, []);

  const trackPopupDismiss = useCallback(async (
    popupId: string | null,
    popupType: 'welcome' | 'exit' | 'custom'
  ) => {
    try {
      await fetch('/api/popup/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popupId,
          popupType,
          action: 'dismiss',
        }),
      });
    } catch (error) {
      console.error('Failed to track popup dismiss:', error);
    }
  }, []);

  const submitEmail = useCallback(async (
    email: string,
    popupId: string | null,
    popupType: 'welcome' | 'exit' | 'custom',
    downloadInfo?: { fileUrl?: string; fileName?: string }
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/popup/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popupId,
          popupType,
          ctaType: 'email',
          email,
          ...(downloadInfo?.fileUrl && { downloadFileUrl: downloadInfo.fileUrl }),
          ...(downloadInfo?.fileName && { downloadFileName: downloadInfo.fileName }),
        }),
      });

      if (res.ok) {
        setPopupSubmitted();
        return true;
      }
      // Log the error response
      const errorData = await res.json().catch(() => ({}));
      console.error('Popup email submit failed:', res.status, errorData);
      return false;
    } catch (error) {
      console.error('Failed to submit email:', error);
      return false;
    }
  }, [setPopupSubmitted]);

  const submitPhone = useCallback(async (
    phone: string,
    popupId: string | null,
    popupType: 'welcome' | 'exit' | 'custom',
    downloadInfo?: { fileUrl?: string; fileName?: string }
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/popup/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popupId,
          popupType,
          ctaType: 'sms',
          phone,
          ...(downloadInfo?.fileUrl && { downloadFileUrl: downloadInfo.fileUrl }),
          ...(downloadInfo?.fileName && { downloadFileName: downloadInfo.fileName }),
        }),
      });

      if (res.ok) {
        setPopupSubmitted();
        return true;
      }
      // Log the error response
      const errorData = await res.json().catch(() => ({}));
      console.error('Popup phone submit failed:', res.status, errorData);
      return false;
    } catch (error) {
      console.error('Failed to submit phone:', error);
      return false;
    }
  }, [setPopupSubmitted]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<PopupContextType>(() => ({
    hasSubmittedPopup,
    welcomeDismissedAt,
    exitDismissedAt,
    activePopup,
    customPopup,
    setPopupSubmitted,
    dismissWelcomePopup,
    dismissExitPopup,
    dismissCustomPopup,
    setActivePopup,
    canShowWelcomePopup,
    canShowExitPopup,
    canShowCustomPopup,
    trackPopupView,
    trackPopupDismiss,
    submitEmail,
    submitPhone,
  }), [
    hasSubmittedPopup,
    welcomeDismissedAt,
    exitDismissedAt,
    activePopup,
    customPopup,
    setPopupSubmitted,
    dismissWelcomePopup,
    dismissExitPopup,
    dismissCustomPopup,
    canShowWelcomePopup,
    canShowExitPopup,
    canShowCustomPopup,
    trackPopupView,
    trackPopupDismiss,
    submitEmail,
    submitPhone,
  ]);

  return (
    <PopupContext.Provider value={value}>
      {children}
    </PopupContext.Provider>
  );
}
