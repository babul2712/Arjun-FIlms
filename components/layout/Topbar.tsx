'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Filter, Film, TrendingUp } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import UniversalSearchBar from '@/components/search/UniversalSearchBar';

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    activeWorkspace, 
    setActiveWorkspace, 
    toggleFilterPanel, 
    toggleNotificationDrawer 
  } = useUIStore();

  const isJournal = pathname.startsWith('/journal') || activeWorkspace === 'journal';

  // Keep active workspace in sync with current URL path
  useEffect(() => {
    if (pathname.startsWith('/journal') && activeWorkspace !== 'journal') {
      setActiveWorkspace('journal');
    } else if (!pathname.startsWith('/journal') && activeWorkspace === 'journal') {
      setActiveWorkspace('crm');
    }
  }, [pathname, activeWorkspace, setActiveWorkspace]);

  const handleSwitchWorkspace = (target: 'crm' | 'journal') => {
    setActiveWorkspace(target);
    if (target === 'journal') {
      if (!pathname.startsWith('/journal')) {
        router.push('/journal');
      }
    } else {
      if (pathname.startsWith('/journal')) {
        router.push('/dashboard');
      }
    }
  };

  const titleMap: Record<string, string> = {
    '/dashboard': 'Active Projects',
    '/calendar': 'Studio Schedule & Shoots',
    '/quotations': 'Quotations Engine',
    '/payments': 'Payments Verified',
    '/projects': 'Client Cases',
    '/blueprints': 'Crew Blueprint Database',
    '/finance': 'Financial Hub & Analytics',
    '/social-links': 'Bio & Social Links Manager',
    '/profile': 'Studio Profile & Settings',
    '/journal': 'Trading Journal Dashboard',
    '/journal/trades': 'Trade Execution Log',
    '/journal/assets': 'Asset Portfolio & Valuation',
  };

  const currentTitle = titleMap[pathname] || 
    (pathname.startsWith('/projects/') ? 'Project Details' : isJournal ? 'Zen Trading Journal' : 'Arjun Photography CRM');

  return (
    <header className="flex justify-between items-center px-6 md:px-10 h-20 w-full bg-transparent sticky top-0 z-40 gap-4">
      {/* Left: Title & Workspace Switcher */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Workspace Switcher Pill */}
        <div className="flex items-center p-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-xs">
          <button
            onClick={() => handleSwitchWorkspace('crm')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              !isJournal
                ? 'bg-gradient-to-r from-[#e50914] to-red-600 text-white shadow-md shadow-red-500/25 scale-[1.02]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
          >
            <Film className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Studio CRM</span>
          </button>

          <button
            onClick={() => handleSwitchWorkspace('journal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              isJournal
                ? 'bg-gradient-to-r from-[#e50914] to-rose-600 text-white shadow-md shadow-red-500/25 scale-[1.02]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Trading Journal</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] bg-white/20 font-bold uppercase tracking-wider">Zen</span>
          </button>
        </div>

        <span className="hidden lg:inline-block h-6 w-px bg-gray-200 dark:bg-gray-800" />

        {/* Title */}
        <h2 className="hidden md:inline-block text-[18px] md:text-[20px] font-extrabold text-gray-800 dark:text-white tracking-tight">
          {currentTitle}
        </h2>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 justify-end max-w-xl">
        {/* Universal Search Bar */}
        <div className="w-full max-w-xs md:max-w-md">
          <UniversalSearchBar 
            placeholder={isJournal ? "Search assets, setups, notes..." : "Search cases, crew, quotes, payments..."} 
          />
        </div>

        {/* Filter Toggle (for dashboard) */}
        {pathname === '/dashboard' && (
          <button 
            onClick={toggleFilterPanel}
            className="p-2.5 bg-gray-100 dark:bg-gray-800/80 hover:bg-[#e50914]/10 text-gray-600 dark:text-gray-300 hover:text-[#e50914] rounded-xl transition-all cursor-pointer shrink-0"
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


