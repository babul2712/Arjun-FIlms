'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  CreditCard,
  Briefcase,
  Users,
  MessageSquare,
  Bell,
  LogOut,
  Camera,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Quotations', href: '/quotations', icon: FileText },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Blueprint', href: '/blueprints', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { theme, toggleTheme } = useUIStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <aside className="w-20 h-screen bg-[#f3f7fc] dark:bg-[#090b0d] border-r border-gray-200/50 dark:border-gray-800/40 flex flex-col items-center justify-between py-8 z-50 shrink-0">
      {/* Top Section: Logo */}
      <div className="flex flex-col items-center">
        <Link href="/dashboard" className="cursor-pointer group flex flex-col items-center" title="Arjun Films CRM">
          <div className="w-12 h-12 rounded-2xl  dark:bg-[#16181c] p-1.5 shadow-sm  hover:shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center overflow-hidden">
            <img 
              src="/logo.jpeg" 
              alt="Arjun Films" 
              className="w-full h-full object-contain rounded-xl scale-200"
            />
          </div>
        </Link>
      </div>

      {/* Middle Section: Navigation Icons */}
      <nav className="flex-1 flex flex-col items-center justify-center gap-5 my-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative group cursor-pointer"
              title={item.name}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#0a0b0d] text-white shadow-md dark:bg-[#8efa1d] dark:text-[#090b0d] dark:shadow-[#8efa1d]/20'
                    : 'text-gray-400 hover:text-gray-805 hover:bg-gray-200/40 dark:hover:text-white dark:hover:bg-gray-800/35'
                }`}
              >
                <Icon className="w-[18px] h-[18px] stroke-[2]" />
              </div>
              
              {/* Tooltip */}
              <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#0a0b0d] dark:bg-[#16181c] border border-gray-850 dark:border-gray-800/60 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-[60]">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Chat, Bell Notifications & Profile Avatar */}
      <div className="flex flex-col items-center gap-4 w-full px-2">
        {/* Chat / Message Button */}
        <button 
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-808 dark:hover:text-white hover:bg-gray-200/40 dark:hover:bg-gray-800/35 transition-colors cursor-pointer relative"
          title="Messages"
        >
          <MessageSquare className="w-[18px] h-[18px] stroke-[2]" />
        </button>

        {/* Notification Bell */}
        <button 
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-808 dark:hover:text-white hover:bg-gray-200/40 dark:hover:bg-gray-800/35 transition-colors cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-[18px] h-[18px] stroke-[2]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 border border-[#f3f7fc] dark:border-[#090b0d]" />
        </button>

        {/* Theme Switcher Button */}
        <button 
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-808 dark:hover:text-white hover:bg-gray-200/40 dark:hover:bg-gray-800/35 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-[18px] h-[18px] text-amber-400 fill-amber-400/20" />
          ) : (
            <Moon className="w-[18px] h-[18px]" />
          )}
        </button>

        {/* Profile Avatar */}
        <div className="relative mt-1">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full overflow-hidden border border-white dark:border-gray-800 hover:border-[#0066fe] dark:hover:border-[#8efa1d] transition-all cursor-pointer shadow-sm active:scale-95"
            title="User Profile"
          >
            {/* High-quality Unsplash avatar to match premium design */}
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Popover Profile Menu */}
          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute bottom-10 left-10 bg-white dark:bg-[#16181c] border border-gray-200/80 dark:border-gray-800/80 shadow-2xl rounded-2xl p-2.5 z-50 w-52 animate-fade-in text-gray-800 dark:text-white">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-[12px] font-bold text-gray-700 dark:text-gray-200">{user?.name || 'Arjun Owner'}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-505 truncate">{user?.username || 'admin@arjunfilms.com'}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 mt-1.5 text-[12px] font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-955/20 rounded-lg cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

