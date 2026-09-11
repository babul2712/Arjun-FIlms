'use client';

import React, { useEffect } from 'react';
import { useUIStore, applySiteFont } from '@/store/uiStore';

export default function FontThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteFont = useUIStore((state) => state.siteFont);
  const theme = useUIStore((state) => state.theme);

  // Initialize and synchronize siteFont to DOM on mount and updates
  useEffect(() => {
    applySiteFont(siteFont || 'montserrat');
  }, [siteFont]);

  // Synchronize dark/light theme mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}
