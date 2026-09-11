'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Filter } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import UniversalSearchBar from '@/components/search/UniversalSearchBar';

export default function Topbar() {
  const pathname = usePathname();
  const { toggleFilterPanel, toggleNotificationDrawer } = useUIStore();

  if (pathname === '/dashboard') return null;

  const titleMap: Record<string, string> = {
    '/dashboard': 'Active Projects',
    '/quotations': 'Quotations Engine',
    '/payments': 'Payments Verified',
    '/projects': 'Client Cases',
    '/blueprints': 'Crew Blueprint Database',
    '/finance': 'Financial Hub & Analytics',
    '/social-links': 'Bio & Social Links Manager',
    '/profile': 'Studio Profile & Settings',
  };

  const currentTitle = titleMap[pathname] || 
    (pathname.startsWith('/projects/') ? 'Project Details' : 'Arjun Photography CRM');

  return (
    <header className="flex justify-between items-center px-6 md:px-10 h-20 w-full bg-transparent sticky top-0 z-40 gap-4">
      {/* Title */}
      <div className="shrink-0">
        <h2 className="text-[18px] md:text-[20px] font-extrabold text-gray-800 dark:text-white tracking-tight">{currentTitle}</h2>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 justify-end max-w-xl">
        {/* Universal Search Bar */}
        <div className="w-full max-w-xs md:max-w-md">
          <UniversalSearchBar placeholder="Search cases, crew, quotes, payments..." />
        </div>

        {/* Filter Toggle (for dashboard) */}
        {pathname === '/dashboard' && (
          <button 
            onClick={toggleFilterPanel}
            className="p-2.5 bg-gray-100 hover:bg-[#e50914]/10 text-gray-600 hover:text-[#e50914] rounded-xl transition-all cursor-pointer shrink-0"
            title="Toggle Filters Panel"
          >
            <Filter className="w-5 h-5" />
          </button>
        )}

        {/* Notifications */}
        <button 
          onClick={toggleNotificationDrawer}
          className="p-2.5 bg-gray-100 dark:bg-gray-800/60 hover:bg-[#fee2e2]/50 dark:hover:bg-red-950/40 text-gray-600 dark:text-gray-300 hover:text-[#e50914] rounded-xl transition-all cursor-pointer relative active:scale-95 shrink-0"
          title="Open Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#e50914] ring-2 ring-white dark:ring-[#121418] animate-pulse" />
        </button>
      </div>
    </header>
  );
}
