'use client';

import { useState, useCallback } from 'react';
import { formatPhoneNumber, validatePhone, validateEmail } from '@/lib/form-utils';

export type PopupStatus = 'idle' | 'loading' | 'success' | 'downloading' | 'downloaded' | 'error';
export type ContactType = 'phone' | 'email';
export type CtaType = 'email' | 'sms' | 'both' | 'download' | 'none';

interface DownloadInfo {
  fileUrl: string;
  fileName: string;
}

type PopupType = 'welcome' | 'exit' | 'custom';

interface UsePopupFormOptions {
  ctaType: CtaType;
  downloadEnabled?: boolean;
  downloadFileUrl?: string | null;
  downloadFileName?: string | null;
  popupType: PopupType;
  popupId?: string | null;
  submitEmail: (email: string, popupId: string | null, popupType: PopupType, downloadInfo?: DownloadInfo) => Promise<boolean>;
  submitPhone: (phone: string, popupId: string | null, popupType: PopupType, downloadInfo?: DownloadInfo) => Promise<boolean>;
  setPopupSubmitted: () => void;
  onSuccess?: () => void;
  onClose?: () => void;
}

interface UsePopupFormReturn {
  // State
  contactValue: string;
  contactType: ContactType;
  showDropdown: boolean;
  validationError: string;
  status: PopupStatus;
  isSuccessState: boolean;

  // Handlers
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  toggleContactType: (type: ContactType) => void;
  setShowDropdown: (show: boolean) => void;
  handleFormSubmit: (e: React.FormEvent) => Promise<void>;
  handleDownloadOnly: () => void;
  triggerDownload: () => void;
  resetForm: () => void;
}

/**
 * Shared hook for popup form logic.
 * Used by welcome-popup, exit-popup, and custom-popup components.
 */
export function usePopupForm({
  ctaType,
  downloadEnabled = false,
  downloadFileUrl,
  downloadFileName,
  popupType,
  popupId = null,
  submitEmail,
  submitPhone,
  setPopupSubmitted,
  onSuccess,
  onClose,
}: UsePopupFormOptions): UsePopupFormReturn {
  // Initialize contactType based on ctaType:
  // - 'email' mode: always 'email'
  // - 'sms' mode: always 'phone'
  // - 'both' mode: default to 'phone' (user can toggle)
  const initialContactType: ContactType = ctaType === 'email' ? 'email' : 'phone';

  const [contactValue, setContactValue] = useState('');
  const [contactType, setContactType] = useState<ContactType>(initialContactType);
  const [showDropdown, setShowDropdown] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [status, setStatus] = useState<PopupStatus>('idle');

  const isSuccessState = status === 'success' || status === 'downloading' || status === 'downloaded';

  // Handle input change with formatting
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (contactType === 'phone') {
      setContactValue(formatPhoneNumber(value));
    } else {
      setContactValue(value);
    }
    setValidationError('');
    if (status === 'error') setStatus('idle');
  }, [contactType, status]);

  // Validate on blur
  const handleBlur = useCallback(() => {
    if (contactType === 'phone') {
      const error = validatePhone(contactValue);
      setValidationError(error || '');
    } else {
      const error = validateEmail(contactValue);
      setValidationError(error || '');
    }
  }, [contactType, contactValue]);

  // Toggle contact type (for "both" mode dropdown)
  const toggleContactType = useCallback((type: ContactType) => {
    setContactType(type);
    setContactValue('');
    setValidationError('');
    setShowDropdown(false);
    if (status === 'error') setStatus('idle');
  }, [status]);

  // Trigger file download
  const triggerDownload = useCallback(() => {
    if (downloadFileUrl) {
      setStatus('downloading');
      const link = document.createElement('a');
      link.href = downloadFileUrl;
      link.download = downloadFileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Simulate download completion
      setTimeout(() => {
        setStatus('downloaded');
      }, 1500);
    }
  }, [downloadFileUrl, downloadFileName]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on CTA type
    if (ctaType === 'email') {
      const error = validateEmail(contactValue);
      if (error || !contactValue) {
        setValidationError(error || 'Email is required');
        return;
      }
    } else if (ctaType === 'sms') {
      const error = validatePhone(contactValue);
      if (error || !contactValue) {
        setValidationError(error || 'Phone number is required');
        return;
      }
    } else if (ctaType === 'both') {
      // "Both" uses dropdown - validate based on selected type
      if (contactType === 'phone') {
        const error = validatePhone(contactValue);
        if (error || !contactValue) {
          setValidationError(error || 'Phone number is required');
          return;
        }
      } else {
        const error = validateEmail(contactValue);
        if (error || !contactValue) {
          setValidationError(error || 'Email is required');
          return;
        }
      }
    }

    setValidationError('');
    setStatus('loading');

    let success = false;

    // Build download info if download is enabled
    const downloadInfo = downloadEnabled && downloadFileUrl ? {
      fileUrl: downloadFileUrl,
      fileName: downloadFileName || 'download',
    } : undefined;

    if (ctaType === 'email') {
      success = await submitEmail(contactValue, popupId, popupType, downloadInfo);
    } else if (ctaType === 'sms') {
      const phoneDigits = contactValue.replace(/\D/g, '');
      success = await submitPhone(phoneDigits, popupId, popupType, downloadInfo);
    } else if (ctaType === 'both') {
      // Submit based on selected type in dropdown
      if (contactType === 'phone') {
        const phoneDigits = contactValue.replace(/\D/g, '');
        success = await submitPhone(phoneDigits, popupId, popupType, downloadInfo);
      } else {
        success = await submitEmail(contactValue, popupId, popupType, downloadInfo);
      }
    }

    if (success) {
      setStatus('success');

      // If download is enabled, trigger it after success
      if (downloadEnabled && downloadFileUrl) {
        setTimeout(() => {
          triggerDownload();
        }, 500);
      } else {
        setTimeout(() => {
          onClose?.();
        }, 2500);
      }

      onSuccess?.();
    } else {
      setStatus('error');
    }
  }, [
    ctaType,
    contactValue,
    contactType,
    downloadEnabled,
    downloadFileUrl,
    downloadFileName,
    popupId,
    popupType,
    submitEmail,
    submitPhone,
    triggerDownload,
    onSuccess,
    onClose,
  ]);

  // Handle download-only CTA (no form)
  const handleDownloadOnly = useCallback(() => {
    setPopupSubmitted();
    triggerDownload();

    setTimeout(() => {
      onClose?.();
    }, 2500);
  }, [setPopupSubmitted, triggerDownload, onClose]);

  // Reset form state
  const resetForm = useCallback(() => {
    setContactValue('');
    setContactType('phone');
    setShowDropdown(false);
    setValidationError('');
    setStatus('idle');
  }, []);

  return {
    // State
    contactValue,
    contactType,
    showDropdown,
    validationError,
    status,
    isSuccessState,

    // Handlers
    handleInputChange,
    handleBlur,
    toggleContactType,
    setShowDropdown,
    handleFormSubmit,
    handleDownloadOnly,
    triggerDownload,
    resetForm,
  };
}
