'use client';

import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-transparent p-6 md:p-8 font-sans -m-6 md:-m-10">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Main content area (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header row skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="h-9 w-64 bg-gray-200 dark:bg-gray-805 rounded-xl animate-pulse" />
              <div className="h-4.5 w-80 bg-gray-200/60 dark:bg-gray-800/60 rounded-lg animate-pulse" />
            </div>
            
            <div className="h-12 w-64 bg-gray-200 dark:bg-gray-805 rounded-2xl animate-pulse" />
          </div>

          {/* Bento grid metrics row skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Smart Wallet Card Skeleton */}
            <div className="md:col-span-5 bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 rounded-[32px] p-6 flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="flex justify-between items-center">
                  <div className="space-y-1.5">
                    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                    <div className="h-3 w-32 bg-gray-200/60 dark:bg-gray-800/60 rounded-md animate-pulse" />
                  </div>
                  <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800/40 rounded-xl animate-pulse" />
                </div>
                
                <div className="mt-6 space-y-2">
                  <div className="h-9 w-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                  <div className="h-3 w-28 bg-gray-200/60 dark:bg-gray-800/60 rounded-md animate-pulse" />
                </div>
              </div>

              {/* Bottom Quick Tiles (Crew stats replacement) */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-50 dark:bg-[#24272c] border border-gray-100/40 dark:border-gray-800/30 rounded-2xl p-2 flex flex-col justify-between animate-pulse">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto" />
                    <div className="h-3.5 w-8 bg-gray-200 dark:bg-gray-800 rounded-md mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics Metric Cards Skeleton */}
            <div className="md:col-span-7 grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 rounded-[28px] p-5 flex flex-col justify-between h-[115px]">
                  <div className="flex justify-between items-start w-full">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Cash flow columns card skeleton */}
          <div className="bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 rounded-[32px] p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
                <div className="h-7 w-36 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            </div>

            <div className="h-44 flex items-end justify-between pt-10 px-2 gap-3">
              {[60, 40, 80, 50, 70, 30, 90, 65, 45, 85, 55, 75].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div 
                    className="w-full bg-gray-150 dark:bg-gray-850 rounded-t-lg animate-pulse"
                    style={{ height: `${h}px` }}
                  />
                  <div className="h-3 w-7 bg-gray-200/60 dark:bg-gray-800/60 rounded-md animate-pulse" />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Sidebar details (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick send skeleton */}
          <div className="bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 rounded-[32px] p-6 space-y-4">
            <div className="space-y-1.5">
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
              <div className="h-3.5 w-48 bg-gray-200/60 dark:bg-gray-800/60 rounded-md animate-pulse" />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-205 dark:bg-gray-800 border-2 border-white dark:border-[#16181c] animate-pulse" />
                ))}
              </div>
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800/80 animate-pulse ml-auto" />
            </div>
          </div>

          {/* Visa Card Skeleton */}
          <div className="bg-gray-200 dark:bg-gray-800/50 rounded-[32px] p-6 min-h-[195px] flex flex-col justify-between animate-pulse">
            <div className="flex justify-between items-start">
              <div className="h-6 w-10 bg-gray-300 dark:bg-gray-700 rounded-md" />
              <div className="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded-md" />
            </div>
            <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded-md my-4" />
            <div className="flex justify-between items-end border-t border-gray-300/20 dark:border-gray-700/20 pt-4">
              <div className="space-y-1">
                <div className="h-2 w-12 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-3 w-28 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-3 w-10 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          </div>

          {/* Deposit/Transfer Buttons skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          </div>

          {/* Quick Action skeleton */}
          <div className="bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 rounded-[32px] p-6 space-y-4">
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Starter Plan Promo skeleton */}
          <div className="bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 rounded-[32px] p-6 h-[175px] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
              <div className="h-3.5 w-44 bg-gray-200/60 dark:bg-gray-800/60 rounded-md animate-pulse" />
            </div>
            <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          </div>

        </div>

      </div>

      {/* Bottom Section: Active Cases & Prospects Directory skeleton */}
      <div className="border-t border-gray-200/40 dark:border-gray-800/20 pt-8 mt-8 space-y-6">
        
        {/* Controls row skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded-[22px] animate-pulse" />
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Counter Badge */}
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />

        {/* Case Cards Grid listing skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#16181c] border border-gray-100 dark:border-gray-850 rounded-[32px] p-6 h-[340px] flex flex-col justify-between animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded-md" />
                  <div className="h-3.5 w-24 bg-gray-200 dark:bg-gray-800 rounded-md" />
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
              </div>
              <div className="space-y-2 border-t border-gray-100 dark:border-gray-800/40 pt-4">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
              <div className="h-11 w-full bg-gray-200 dark:bg-gray-800 rounded-xl mt-4" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
