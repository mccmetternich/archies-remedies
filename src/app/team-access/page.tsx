'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Lock, Eye, EyeOff, Users } from 'lucide-react';

function TeamAccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [badgeUrl, setBadgeUrl] = useState<string | null>(null);

  // Fetch site settings for logo and badge (from public endpoint)
  useEffect(() => {
    fetch('/api/public/settings')
      .then(res => res.json())
      .then(data => {
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.draftModeBadgeUrl) setBadgeUrl(data.draftModeBadgeUrl);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/team-access/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        // Redirect to the intended page or home
        const redirectTo = searchParams.get('redirect') || '/';
        setTimeout(() => {
          router.push(redirectTo);
        }, 1000);
      } else {
        setErrorMessage(data.error || 'Invalid credentials');
        setStatus('error');
      }
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <>
      {/* CSS for smooth badge rotation */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-[#f5f0eb] via-white to-[#bbdae9]/20 flex items-start md:items-center justify-center px-5 pt-[15vh] md:pt-0 md:py-8 overflow-x-hidden">
        {/* Background decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-24 w-64 h-64 md:w-96 md:h-96 bg-[#bbdae9]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-24 w-64 h-64 md:w-96 md:h-96 bg-[#bbdae9]/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-md w-full text-center">
          {/* Logo with rotating badge */}
          <div className="mb-8 md:mb-12">
            {logoUrl ? (
              <div className="relative inline-block">
                {/* Rotating badge */}
                {badgeUrl && (
                  <div className="absolute -top-6 -right-10 md:-top-8 md:-right-14 w-[60px] h-[60px] md:w-[80px] md:h-[80px] z-0 animate-spin-slow">
                    <Image
                      src={badgeUrl}
                      alt="Badge"
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                {/* Logo */}
                <Image
                  src={logoUrl}
                  alt="Archie's Remedies"
                  width={180}
                  height={72}
                  className="h-[50px] md:h-[72px] w-auto object-contain relative z-10"
                  priority
                />
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-full shadow-sm border border-[#e5e5e5]">
                <Users className="w-4 h-4 text-[#bbdae9]" />
                <span className="text-base font-medium tracking-tight">Archie's Remedies</span>
              </div>
            )}
          </div>

          {/* Main content */}
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-5">
                  <div className="w-11 h-11 md:w-14 md:h-14 bg-[#bbdae9] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 md:w-7 md:h-7 text-[#1a1a1a]"
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
                  <h1 className="text-3xl md:text-4xl font-normal tracking-tight">
                    Welcome Back
                  </h1>
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Redirecting you now...
                </p>
                <Loader2 className="w-6 h-6 animate-spin text-[#bbdae9] mx-auto" />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Team Access badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#bbdae9]/30 border border-[#bbdae9]/50 rounded-full mb-6">
                  <Lock className="w-4 h-4 text-[#7ab8d4]" />
                  <span className="text-sm font-medium text-gray-700">Team Access</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-normal tracking-tight mb-3">
                  Welcome, Team
                </h1>
                <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed px-2">
                  Sign in to preview and navigate the site before launch.
                </p>

                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-4 px-2">
                  {/* Username */}
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      placeholder="Username"
                      required
                      autoComplete="username"
                      className="w-full px-5 py-4 text-base rounded-full border border-gray-200 bg-white shadow-sm transition-colors outline-none focus:border-[#bbdae9] placeholder:text-gray-400"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      placeholder="Password"
                      required
                      autoComplete="current-password"
                      className="w-full px-5 py-4 pr-14 text-base rounded-full border border-gray-200 bg-white shadow-sm transition-colors outline-none focus:border-[#bbdae9] placeholder:text-gray-400"
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Error message */}
                  <AnimatePresence mode="wait">
                    {status === 'error' && errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="flex justify-center"
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
                          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-red-600">{errorMessage}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={status === 'loading' || !username || !password}
                    className="w-full py-4 bg-[#1a1a1a] text-white rounded-full font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#bbdae9] hover:text-[#1a1a1a] active:bg-[#bbdae9] active:text-[#1a1a1a] group"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer note */}
                <p className="mt-8 text-sm text-gray-500">
                  For internal team use only.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

// Loading fallback for suspense
function TeamAccessLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f0eb] via-white to-[#bbdae9]/20 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#bbdae9]" />
    </div>
  );
}

export default function TeamAccessPage() {
  return (
    <Suspense fallback={<TeamAccessLoading />}>
      <TeamAccessContent />
    </Suspense>
  );
}
