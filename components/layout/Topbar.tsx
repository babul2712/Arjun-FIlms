'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Bell, 
  Filter, 
  TrendingUp, 
  Film, 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  FileText, 
  CreditCard, 
  Briefcase, 
  Users, 
  LineChart, 
  PlusCircle, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import UniversalSearchBar from '@/components/search/UniversalSearchBar';

const crmNavLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Quotations', href: '/quotations', icon: FileText },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Blueprint', href: '/blueprints', icon: Users },
  { name: 'Finance', href: '/finance', icon: LineChart },
];

const journalNavLinks = [
  { name: 'Dashboard', href: '/journal', icon: LayoutDashboard },
  { name: 'Trade Log', href: '/journal/trades', icon: LineChart },
  { name: 'Asset Portfolio', href: '/journal/assets', icon: Layers },
];

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
    '/dashboard': 'Active Projects & Metrics',
    '/calendar': 'Studio Schedule & Shoots',
    '/quotations': 'Quotations Engine',
    '/payments': 'Payments Verified',
    '/projects': 'Client Cases',
    '/blueprints': 'Crew Blueprint Database',
    '/finance': 'Financial Hub & Analytics',
    '/social-links': 'Bio & Social Links Manager',
    '/profile': 'Studio Profile & Settings',
    '/journal': 'Trading Journal & Analytics',
    '/journal/trades': 'Trade Execution Log',
    '/journal/assets': 'Asset Portfolio & Valuation',
  };

  const currentTitle = titleMap[pathname] || 
    (pathname.startsWith('/projects/') ? 'Project Details' : isJournal ? 'Zen Trading Journal' : 'Arjun Photography CRM');

  return (
    <header className="flex flex-col w-full bg-white/70 dark:bg-[#121418]/80 backdrop-blur-xl border-b border-[#fee2e2]/80 dark:border-gray-800/80 sticky top-0 z-40 transition-all">
      {/* Top Main Bar */}
      <div className="flex items-center justify-between px-4 md:px-8 h-16 w-full gap-3">
        {/* Left: Module Switcher Pills */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-inner">
            <button
              onClick={() => handleSwitchWorkspace('crm')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                !isJournal
                  ? 'bg-gradient-to-r from-[#e50914] to-red-600 text-white shadow-md shadow-red-500/25 scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-700/50'
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
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-700/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Trading Journal</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] bg-white/20 font-bold uppercase tracking-wider">Zen</span>
            </button>
          </div>

          <span className="hidden xl:inline-block h-5 w-px bg-gray-200 dark:bg-gray-800" />
          
          <h2 className="hidden lg:inline-block text-[14px] font-black text-gray-800 dark:text-gray-200 truncate max-w-xs">
            {currentTitle}
          </h2>
        </div>

        {/* Right controls: Search, Quick Actions & Notifications */}
        <div className="flex items-center gap-2.5 md:gap-3.5 flex-1 justify-end max-w-xl">
          {/* Universal Search Bar */}
          <div className="w-full max-w-[200px] sm:max-w-xs md:max-w-sm">
            <UniversalSearchBar 
              placeholder={isJournal ? "Search assets, setups, notes..." : "Search cases, crew, quotes..."} 
            />
          </div>

          {/* Filter Toggle (for dashboard) */}
          {pathname === '/dashboard' && (
            <button 
              onClick={toggleFilterPanel}
              className="p-2 bg-gray-100 dark:bg-gray-800/80 hover:bg-[#fee2e2]/60 dark:hover:bg-red-950/40 text-gray-600 dark:text-gray-300 hover:text-[#e50914] rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
              title="Toggle Filters Panel"
            >
              <Filter className="w-4 h-4" />
            </button>
          )}

          {/* Notifications */}
          <button 
            onClick={toggleNotificationDrawer}
            className="p-2 bg-gray-100 dark:bg-gray-800/80 hover:bg-[#fee2e2]/60 dark:hover:bg-red-950/40 text-gray-600 dark:text-gray-300 hover:text-[#e50914] rounded-xl transition-all cursor-pointer relative active:scale-95 shrink-0"
            title="Open Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e50914] ring-2 ring-white dark:ring-[#121418] animate-pulse" />
          </button>
        </div>
      </div>

      {/* Sub-Navigation Strip (Quick Access to Module Views) */}
      <div className="flex items-center justify-between px-4 md:px-8 py-1.5 bg-gray-50/60 dark:bg-black/20 overflow-x-auto custom-scrollbar gap-2 border-t border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center gap-1 sm:gap-2">
          {(isJournal ? journalNavLinks : crmNavLinks).map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/journal' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#fee2e2] dark:bg-red-950/60 text-[#e50914] dark:text-red-400 font-extrabold shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#e50914]' : 'text-gray-400 dark:text-gray-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Status Indicator / Zen Mode badge */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 pl-4 shrink-0">
          {isJournal ? (
            <div className="flex items-center gap-1.5 bg-red-500/10 dark:bg-red-950/40 text-[#e50914] px-2.5 py-0.5 rounded-lg border border-red-500/20">
              <Sparkles className="w-3 h-3 text-[#e50914]" />
              <span>Discipline &bull; Patience &bull; Execution</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Studio Live Engine</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

