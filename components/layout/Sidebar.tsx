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
  Calendar,
  Sun,
  Moon,
  Share2,
  User,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getBioProfileAdmin } from '@/app/actions';

const crmNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Quotations', href: '/quotations', icon: FileText },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Blueprint', href: '/blueprints', icon: Users },
  { name: 'Finance', href: '/finance', icon: TrendingUp },
];

const journalNavItems = [
  { name: 'Journal Overview', href: '/journal', icon: Home },
  { name: 'Analytics & Charts', href: '/journal/analytics', icon: BarChart3 },
  { name: 'Trade Log', href: '/journal/trades', icon: TrendingUp },
  { name: 'Asset Portfolio', href: '/journal/assets', icon: Briefcase },
];

export default function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const toggleNotificationDrawer = useUIStore((state) => state.toggleNotificationDrawer);
  const userAvatar = useUIStore((state) => state.userAvatar);
  const setUserAvatar = useUIStore((state) => state.setUserAvatar);
  const crmTheme = useUIStore((state) => state.crmTheme);
  const journalTheme = useUIStore((state) => state.journalTheme);
  const activeWorkspace = useUIStore((state) => state.activeWorkspace);
  const setActiveWorkspace = useUIStore((state) => state.setActiveWorkspace);

  const isJournal = pathname.startsWith('/journal') || activeWorkspace === 'journal';
  const currentWorkspaceTheme = isJournal ? journalTheme : crmTheme;
  const navItems = isJournal ? journalNavItems : crmNavItems;

  // Sync studio profile avatar on mount if not yet loaded or on change
  useEffect(() => {
    let isMounted = true;
    const fetchStudioProfile = async () => {
      try {
        const bio = await getBioProfileAdmin('arjunfilms');
        if (bio?.avatar && isMounted) {
          setUserAvatar(bio.avatar);
        }
      } catch (e) {
        // ignore fallback
      }
    };
    fetchStudioProfile();
    return () => {
      isMounted = false;
    };
  }, [setUserAvatar]);

  // Reset error when avatar source changes
  useEffect(() => {
    setAvatarLoadError(false);
  }, [userAvatar, user?.avatar]);

  const isProfileActive = pathname === '/profile' || pathname === '/social-links';

  return (
    <aside className="my-3 ml-3 md:my-4 md:ml-4 h-[calc(100vh-1.5rem)] md:h-[calc(100vh-2rem)] w-20 bg-white/85 dark:bg-[#121418]/90 backdrop-blur-xl border border-[#fee2e2] dark:border-gray-800/80 shadow-xl shadow-red-500/5 rounded-[32px] flex flex-col items-center justify-between py-6 z-50 shrink-0 transition-all">
      {/* Top Section: Logo */}
      <div className="flex flex-col items-center">
        <Link href={isJournal ? "/journal" : "/dashboard"} className="cursor-pointer group flex flex-col items-center" title={isJournal ? "Zen Trading Journal" : "Arjun Films CRM"}>
          <div className="w-13 h-13 rounded-2xl bg-[#fef2f2] dark:bg-[#1c1f24] p-1.5 border border-[#fee2e2] dark:border-red-950/50 shadow-sm group-hover:shadow-md group-hover:border-[#e50914]/50 group-hover:scale-105 active:scale-95 transition-all flex items-center justify-center overflow-hidden">
            <img 
              src="/logo.jpeg" 
              alt="Arjun Films" 
              className="w-full h-full object-contain rounded-xl scale-200"
            />
          </div>
        </Link>
      </div>

      {/* Middle Section: Navigation Icons */}
      <nav className="flex-1 flex flex-col items-center justify-center gap-4.5 my-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/journal' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative group cursor-pointer"
              title={item.name}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#e50914] text-white shadow-lg shadow-red-500/30 scale-105 ring-2 ring-red-400/20'
                    : 'text-gray-400 hover:text-[#e50914] hover:bg-[#fef2f2] dark:hover:text-red-300 dark:hover:bg-red-950/40'
                }`}
              >
                <Icon className="w-[19px] h-[19px] stroke-[2.2]" />
              </div>
              
              {/* Tooltip */}
              <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#16181c] border border-red-500/20 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-[60]">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Chat, Bell Notifications & Profile Avatar */}
      <div className="flex flex-col items-center gap-3.5 w-full px-2">
        {/* Chat / Message Button */}
        <button 
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-[#e50914] dark:hover:text-red-300 hover:bg-[#fef2f2] dark:hover:bg-red-950/40 transition-all cursor-pointer relative active:scale-95"
          title="Messages"
        >
          <MessageSquare className="w-[18px] h-[18px] stroke-[2]" />
        </button>

        {/* Notification Bell */}
        <button 
          onClick={toggleNotificationDrawer}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-[#e50914] dark:hover:text-red-300 hover:bg-[#fef2f2] dark:hover:bg-red-950/40 transition-all cursor-pointer relative active:scale-95"
          title="Notifications"
        >
          <Bell className="w-[18px] h-[18px] stroke-[2]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e50914] border-2 border-white dark:border-[#121418] animate-pulse" />
        </button>

        {/* Workspace Theme Switcher Button */}
        <button 
          onClick={() => toggleTheme(isJournal ? 'journal' : 'crm')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-[#e50914] dark:hover:text-amber-400 hover:bg-[#fef2f2] dark:hover:bg-red-950/40 transition-all cursor-pointer active:scale-95"
          title={currentWorkspaceTheme === 'dark' ? `Switch ${isJournal ? 'Trading Journal' : 'CRM'} to Light Mode` : `Switch ${isJournal ? 'Trading Journal' : 'CRM'} to Dark Mode`}
        >
          {currentWorkspaceTheme === 'dark' ? (
            <Sun className="w-[18px] h-[18px] text-amber-400 fill-amber-400/20" />
          ) : (
            <Moon className="w-[18px] h-[18px]" />
          )}
        </button>

        {/* Profile Avatar */}
        <div className="relative mt-1">
          {(() => {
            const resolvedAvatar = user?.avatar || userAvatar || '/logo.jpeg';
            const displayName = user?.name || 'Arjun Owner';
            const initial = displayName.charAt(0).toUpperCase();

            return (
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer shadow-sm active:scale-95 p-0.5 flex items-center justify-center bg-[#fef2f2] dark:bg-gray-800 ${
                  isProfileActive
                    ? 'border-[#e50914] ring-2 ring-red-400/30'
                    : 'border-[#fee2e2] dark:border-gray-800 hover:border-[#e50914] dark:hover:border-[#e50914]'
                }`}
                title={`${displayName} - Profile Settings`}
              >
                {resolvedAvatar && !avatarLoadError ? (
                  <img
                    src={resolvedAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setAvatarLoadError(true)}
                  />
                ) : (
                  <span className="w-full h-full rounded-full bg-gradient-to-tr from-[#e50914] to-rose-500 text-white font-black text-xs flex items-center justify-center">
                    {initial}
                  </span>
                )}
              </button>
            );
          })()}

          {/* Popover Profile Menu */}
          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute bottom-2 left-16 bg-white dark:bg-[#16181c] border border-[#fee2e2] dark:border-gray-800/80 shadow-2xl rounded-2xl p-2.5 z-50 w-56 animate-fade-in text-gray-800 dark:text-white">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                    <img
                      src={user?.avatar || userAvatar || '/logo.jpeg'}
                      alt="User"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.jpeg';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-gray-800 dark:text-gray-200 truncate">{user?.name || 'Arjun Owner'}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{user?.username || 'admin@arjunfilms.com'}</p>
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-bold rounded-xl cursor-pointer transition-colors ${
                      pathname === '/profile'
                        ? 'bg-[#fee2e2]/70 dark:bg-red-950/50 text-[#e50914]'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-[#fef2f2] dark:hover:bg-red-950/30 hover:text-[#e50914]'
                    }`}
                  >
                    <User className="w-4 h-4 text-[#e50914]" />
                    <span>Studio Profile</span>
                  </Link>

                  <Link
                    href="/social-links"
                    onClick={() => setShowProfileMenu(false)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-bold rounded-xl cursor-pointer transition-colors ${
                      pathname === '/social-links'
                        ? 'bg-[#fee2e2]/70 dark:bg-red-950/50 text-[#e50914]'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-[#fef2f2] dark:hover:bg-red-950/30 hover:text-[#e50914]'
                    }`}
                  >
                    <Share2 className="w-4 h-4 text-[#e50914]" />
                    <span>Bio Link</span>
                  </Link>
                </div>

                <div className="pt-1 mt-1 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-bold text-red-600 dark:text-red-400 hover:bg-[#fef2f2] dark:hover:bg-red-950/30 rounded-xl cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
