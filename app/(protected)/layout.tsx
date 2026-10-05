'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import NotificationDrawer from '@/components/layout/NotificationDrawer';
import { useUIStore, applyThemeColor } from '@/store/uiStore';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const crmTheme = useUIStore((state) => state.crmTheme);
  const journalTheme = useUIStore((state) => state.journalTheme);
  const themeColor = useUIStore((state) => state.themeColor);

  // Synchronize persisted theme state based on active workspace route
  useEffect(() => {
    const isJournal = pathname.startsWith('/journal');
    const targetTheme = isJournal ? journalTheme : crmTheme;

    if (targetTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    applyThemeColor(themeColor || 'crimson');
  }, [pathname, crmTheme, journalTheme, themeColor]);

  return (
    <div className="min-h-screen flex overflow-hidden bg-transparent">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-8">
          {children}
        </div>
      </main>
      <NotificationDrawer />
    </div>
  );
}

