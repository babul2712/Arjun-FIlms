'use client';

import React, { useEffect, useState } from 'react';
import { Repeat, Film } from 'lucide-react';

interface SubscriptionLoaderProps {
  title?: string;
  subtitle?: string;
  showSkeletonPreview?: boolean;
}

const loadingMessages = [
  'Connecting to Subscription Cloud...',
  'Syncing client schedules & shoot days...',
  'Calculating per-day revenue values...',
  'Preparing Arjun Films Suite...',
];

export default function SubscriptionLoader({
  title = 'Client Subscription',
  subtitle,
  showSkeletonPreview = true,
}: SubscriptionLoaderProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex-1 min-h-[85vh] w-full p-4 md:p-8 flex items-center justify-center overflow-hidden">
      {/* Background Skeleton Preview (Soft layout structure behind frosted glass) */}
      {showSkeletonPreview && (
        <div className="absolute inset-0 max-w-7xl mx-auto p-4 md:p-6 opacity-35 dark:opacity-20 pointer-events-none filter blur-[1px] transition-opacity">
          {/* Skeleton Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <div className="h-4 w-36 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            </div>
            <div className="h-10 w-36 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          </div>

          {/* Skeleton Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-white dark:bg-[#16181c] border border-gray-200/70 dark:border-gray-800/60 rounded-3xl p-5 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                  <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-7 w-28 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                  <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800/60 rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Table Card */}
          <div className="h-80 bg-white dark:bg-[#16181c] border border-gray-200/70 dark:border-gray-800/60 rounded-3xl p-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl mb-6 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-full bg-gray-100/70 dark:bg-gray-800/40 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Atmospheric Ambient Glow behind Hero Card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-tr from-[#e50914]/20 via-[#e50914]/5 to-transparent blur-3xl pointer-events-none rounded-full animate-pulse-glow" />

      {/* Hero Glass Loader Card */}
      <div className="relative z-10 max-w-sm w-full mx-auto p-8 rounded-[32px] bg-white/80 dark:bg-[#16181c]/85 backdrop-blur-2xl border border-white/60 dark:border-gray-800/80 shadow-[0_20px_60px_-15px_rgba(229,9,20,0.15)] dark:shadow-[0_25px_70px_-20px_rgba(0,0,0,0.7)] text-center animate-float-smooth">
        
        {/* Animated Badge Core */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          {/* Outer Rotating Conic Glow Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#e50914] border-r-[#e50914]/40 animate-spin" />
          
          {/* Middle Counter-Rotating Dashed Orbit */}
          <div className="absolute inset-2 rounded-full border border-dashed border-red-500/30 dark:border-red-500/40 animate-spin-reverse-slow" />
          
          {/* Center Glass Emblem */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-white dark:from-[#241416] dark:to-[#16181c] border border-red-200/60 dark:border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/15">
            <Repeat className="w-6 h-6 text-[#e50914] animate-pulse" />
            
            {/* Sparkle micro accent */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e50914] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e50914]" />
            </span>
          </div>
        </div>

        {/* Brand Chip */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#e50914] animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e50914]">
            {title}
          </span>
        </div>

        {/* Dynamic Status Text */}
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
          Loading Subscription Suite
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 h-5 transition-all duration-300">
          {subtitle || loadingMessages[msgIndex]}
        </p>

        {/* Laser Shimmer Progress Bar */}
        <div className="mt-5 w-48 mx-auto h-1.5 bg-gray-100 dark:bg-gray-800/80 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e50914] to-transparent w-full animate-shimmer" />
        </div>

        {/* Footer Subtle Brand Tag */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-center gap-2">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <Film className="w-3 h-3 text-[#e50914]" /> Arjun Films Studio
          </span>
        </div>
      </div>
    </div>
  );
}
