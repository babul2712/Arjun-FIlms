'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, Settings, Filter } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function Topbar() {
  const pathname = usePathname();
  const { toggleFilterPanel } = useUIStore();

  if (pathname === '/dashboard') return null;

  const titleMap: Record<string, string> = {
    '/dashboard': 'Active Projects',
    '/quotations': 'Quotations Engine',
    '/payments': 'Payments Verified',
    '/projects': 'Client Cases',
    '/blueprints': 'Crew Blueprint Database',
  };

  const currentTitle = titleMap[pathname] || 
    (pathname.startsWith('/projects/') ? 'Project Details' : 'Arjun Photography CRM');

  return (
    <header className="flex justify-between items-center px-8 h-20 w-full bg-transparent sticky top-0 z-40">
      {/* Title */}
      <div>
        <h2 className="text-[20px] font-extrabold text-gray-800 tracking-tight">{currentTitle}</h2>
      </div>


      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden sm:flex items-center px-4 py-2 bg-[#f0f4fa] rounded-full border border-gray-200/20 w-64 focus-within:ring-1 focus-within:ring-[#0066fe]/50">
          <Search className="text-gray-400 w-[18px] h-[18px] mr-2" />
          <input 
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-[13px] font-medium w-full placeholder:text-gray-400" 
            placeholder="Search studio records..." 
            type="text"
          />
        </div>

        {/* Filter Toggle (for dashboard) */}
        {pathname === '/dashboard' && (
          <button 
            onClick={toggleFilterPanel}
            className="p-2.5 bg-gray-100 hover:bg-[#0066fe]/10 text-gray-600 hover:text-[#0066fe] rounded-xl transition-all cursor-pointer"
            title="Toggle Filters Panel"
          >
            <Filter className="w-5 h-5" />
          </button>
        )}

        {/* Notifications */}
        <button className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all cursor-pointer relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
