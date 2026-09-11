'use client';

import React, { useEffect } from 'react';
import { useUIStore, applySiteFont, applyThemeColor } from '@/store/uiStore';
import CommandPaletteModal from '@/components/search/CommandPaletteModal';

export default function FontThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteFont = useUIStore((state) => state.siteFont);
  const theme = useUIStore((state) => state.theme);
  const themeColor = useUIStore((state) => state.themeColor);

  // Early sync from localStorage on client-side initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('arjun-ui-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.siteFont) {
          applySiteFont(parsed.state.siteFont);
        }
        if (parsed?.state?.themeColor) {
          applyThemeColor(parsed.state.themeColor);
        }
        if (parsed?.state?.userAvatar) {
          useUIStore.getState().setUserAvatar(parsed.state.userAvatar);
        }
        if (parsed?.state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Initialize and synchronize siteFont to DOM on mount and updates
  useEffect(() => {
    applySiteFont(siteFont || 'montserrat');
  }, [siteFont]);

  // Initialize and synchronize themeColor to DOM on mount and updates
  useEffect(() => {
    applyThemeColor(themeColor || 'crimson');
  }, [themeColor]);

  // Synchronize dark/light theme mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Re-apply theme color so light/dark specific gradient and tints update
    applyThemeColor(themeColor || 'crimson');
  }, [theme, themeColor]);

  return (
    <>
      {children}
      <CommandPaletteModal />
    </>
  );
}
