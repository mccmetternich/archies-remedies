'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Check, Users, Key, Shield, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminTheme } from '@/contexts/AdminThemeContext';

interface AdminUser {
  id: string;
  username: string;
  createdAt: string;
}

export default function GlobalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { theme, toggleTheme } = useAdminTheme();

  useEffect(() => {
    fetchAdminUser();
  }, []);

  const fetchAdminUser = async () => {
    try {
      // For now, we'll just show a placeholder
      // In a full implementation, you'd fetch the current admin user
      setAdminUser({
        id: '1',
        username: 'admin',
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to fetch admin user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    setPasswordError('');

    try {
      // This would call an API to change the password
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to change password:', error);
      setPasswordError('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Theme Toggle */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">Global Settings</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1">
            Manage admin access and security settings
          </p>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
            'bg-[var(--admin-card)] border-[var(--admin-border)] hover:border-[var(--primary)]'
          )}
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-[var(--primary)]" />
            ) : (
              <Sun className="w-5 h-5 text-[var(--primary)]" />
            )}
            <span className="text-sm font-medium text-[var(--admin-text-primary)]">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>

          {/* Toggle Switch */}
          <div className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            theme === 'light' ? 'bg-[var(--primary)]' : 'bg-[var(--admin-border)]'
          )}>
            <div className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
              theme === 'light' ? 'translate-x-7' : 'translate-x-1'
            )} />
          </div>
        </button>
      </div>

      {/* Admin User Section */}
      <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <Users className="w-5 h-5 text-[var(--admin-button-text)]" />
          </div>
          <div>
            <h2 className="font-medium text-[var(--admin-text-primary)]">Admin User</h2>
            <p className="text-sm text-[var(--admin-text-muted)]">Manage your admin account</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Username</label>
            <input
              type="text"
              value={adminUser?.username || ''}
              disabled
              className="w-full px-4 py-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-muted)] cursor-not-allowed"
            />
            <p className="text-xs text-[var(--admin-text-muted)] mt-1">Username cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <Key className="w-5 h-5 text-[var(--admin-button-text)]" />
          </div>
          <div>
            <h2 className="font-medium text-[var(--admin-text-primary)]">Change Password</h2>
            <p className="text-sm text-[var(--admin-text-muted)]">Update your admin password</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          {passwordError && (
            <p className="text-sm text-[var(--admin-error)]">{passwordError}</p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={saving || !newPassword || !confirmPassword}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
              saved
                ? 'bg-[var(--admin-success)] text-[var(--admin-text-primary)]'
                : 'bg-[var(--primary)] text-[var(--admin-button-text)] hover:bg-[var(--primary-dark)]',
              (saving || !newPassword || !confirmPassword) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                Updated!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[var(--admin-button-text)]" />
          </div>
          <div>
            <h2 className="font-medium text-[var(--admin-text-primary)]">Security</h2>
            <p className="text-sm text-[var(--admin-text-muted)]">Session and security information</p>
          </div>
        </div>

        <div className="bg-[var(--admin-bg)] rounded-lg p-4">
          <div className="grid gap-4">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--admin-text-secondary)]">Session Type</span>
              <span className="text-sm text-[var(--admin-text-primary)]">Cookie-based</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--admin-text-secondary)]">Authentication</span>
              <span className="text-sm text-[var(--admin-text-primary)]">Password</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--admin-text-secondary)]">Last Activity</span>
              <span className="text-sm text-[var(--admin-text-primary)]">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
