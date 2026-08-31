'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useUIStore } from '@/store/uiStore';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useUIStore((state) => state.theme);

  // Synchronize persisted theme state to HTML DOM element on client mount/update
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen flex overflow-hidden bg-transparent">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
