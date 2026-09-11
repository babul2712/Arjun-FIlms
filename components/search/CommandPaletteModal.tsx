'use client';

import React, { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import UniversalSearchBar from './UniversalSearchBar';
import { Command, X, Sparkles, FolderPlus, FileText, Users, CreditCard, Calendar } from 'lucide-react';

export default function CommandPaletteModal() {
  const { commandPaletteOpen, closeCommandPalette, toggleCommandPalette } = useUIStore();

  // Global Keyboard Shortcut: ⌘K / Ctrl+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        closeCommandPalette();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [commandPaletteOpen, toggleCommandPalette, closeCommandPalette]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
      {/* Click backdrop to dismiss */}
      <div 
        className="absolute inset-0" 
        onClick={closeCommandPalette}
      />

      {/* Main Omnibar Window */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#15181e] border border-[#fee2e2]/80 dark:border-gray-800 rounded-[32px] shadow-2xl shadow-red-500/10 overflow-hidden z-10 flex flex-col max-h-[85vh] h-[580px] animate-slide-in">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-150 dark:border-gray-800/80 shrink-0">
          <div className="flex items-center gap-2 text-[12px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <Command className="w-4 h-4 text-[#e50914]" />
            <span>Studio Omnibar • Universal Auto Search</span>
          </div>
          <button
            type="button"
            onClick={closeCommandPalette}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar Input Container */}
        <div className="p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
          <UniversalSearchBar
            variant="hero"
            autoFocus
            placeholder="Search cases, crew members, quotations, payments, or actions..."
            onSelectResult={closeCommandPalette}
          />
        </div>
      </div>
    </div>
  );
}
