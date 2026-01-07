'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface SuccessStateProps {
  title: string;
  message: string;
  showSocialLinks?: boolean;
  socialUrls?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  onReset?: () => void;
  resetText?: string;
  className?: string;
}

/**
 * Unified success state component matching the Coming Soon page style.
 * Features brand blue (#bbdae9) circle with custom SVG checkmark.
 */
export function SuccessState({
  title,
  message,
  showSocialLinks = false,
  socialUrls,
  onReset,
  resetText = 'Send another message',
  className = '',
}: SuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center text-center ${className}`}
    >
      {/* Title with checkmark */}
      <div className="flex items-center justify-center gap-3 mb-5">
        <div className="w-11 h-11 md:w-14 md:h-14 bg-[var(--primary)] rounded-full flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 md:w-7 md:h-7 text-[var(--foreground)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight">
          {title}
        </h3>
      </div>

      <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-md">
        {message}
      </p>

      {/* Social links */}
      {showSocialLinks && socialUrls && (
        <div className="flex items-center justify-center gap-4 mb-6">
          {socialUrls.instagram && (
            <a
              href={socialUrls.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--foreground)] hover:bg-[#a8d0e0] transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          )}
          {socialUrls.facebook && (
            <a
              href={socialUrls.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--foreground)] hover:bg-[#a8d0e0] transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
              </svg>
            </a>
          )}
          {socialUrls.tiktok && (
            <a
              href={socialUrls.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--foreground)] hover:bg-[#a8d0e0] transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
            </a>
          )}
        </div>
      )}

      {/* Reset button */}
      {onReset && (
        <button
          onClick={onReset}
          className="text-sm text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--primary-dark)] transition-colors"
        >
          {resetText}
        </button>
      )}
    </motion.div>
  );
}
