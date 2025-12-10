'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, AlertCircle, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('admin-theme') as 'dark' | 'light' | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center p-4 admin-theme',
      theme === 'light' ? 'admin-theme-light bg-[var(--admin-bg)]' : 'bg-[var(--admin-bg)]'
    )}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-2xl font-bold text-[var(--admin-button-text)] mx-auto mb-4">
            A
          </div>
          <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">Admin Login</h1>
          <p className="text-[var(--admin-text-muted)] mt-1">Archie&apos;s Remedies Dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-border)] p-8">
          {error && (
            <div className="mb-6 p-4 bg-[var(--admin-error-bg)] border border-[var(--admin-error-border)] rounded-xl flex items-center gap-3 text-[var(--admin-error)]">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-text-muted)]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 py-3.5 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-xl font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-[var(--admin-text-muted)] text-sm mt-6">
          Protected admin area
        </p>
      </div>

      {/* Theme Toggle - Bottom Right */}
      <button
        onClick={() => {
          const newTheme = theme === 'dark' ? 'light' : 'dark';
          setTheme(newTheme);
          localStorage.setItem('admin-theme', newTheme);
        }}
        className="fixed bottom-6 right-6 p-3 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-full hover:border-[var(--primary)] transition-colors"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-[var(--admin-text-secondary)]" />
        ) : (
          <Moon className="w-5 h-5 text-[var(--admin-text-secondary)]" />
        )}
      </button>
    </div>
  );
}
