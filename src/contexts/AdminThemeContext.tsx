'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AdminTheme = 'dark' | 'light';

interface AdminThemeContextType {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'admin-theme';

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>('dark');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as AdminTheme | null;
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored);
    }
    setMounted(true);
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: AdminTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
}
