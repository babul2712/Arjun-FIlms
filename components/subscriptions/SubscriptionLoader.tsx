'use client';

import React from 'react';
import { 
  Users, IndianRupee, CheckCircle2, Camera, Search, LayoutGrid, List,
  BarChart3, Plus, RefreshCcw, ArrowLeft
} from 'lucide-react';

interface SubscriptionLoaderProps {
  variant?: 'dashboard' | 'detail' | 'analytics';
  title?: string;
  subtitle?: string;
}

/**
 * Reusable Liquid Shimmer Block with diagonal GPU-accelerated light sweep
 */
function Shimmer({ className = '', rounded = 'rounded-xl' }: { className?: string; rounded?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200/70 dark:bg-[#1e2229] ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-liquid-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent pointer-events-none" />
    </div>
  );
}

export default function SubscriptionLoader({
  variant = 'dashboard',
  title = 'Client Subscription',
  subtitle = 'Syncing client portfolios & calculating revenue metrics...',
}: SubscriptionLoaderProps) {
  if (variant === 'detail') {
    return <DetailSkeleton />;
  }

  if (variant === 'analytics') {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Executive Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-5 bg-[#e50914] rounded-full" />
              <span className="text-[11px] font-black text-[#e50914] uppercase tracking-[0.15em] flex items-center gap-1.5">
                Subscription Management
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e50914] animate-ping ml-1" />
              </span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              {title}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold tracking-wide">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Action Button Skeletons */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <RefreshCcw className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#16181c]/50">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <Shimmer className="w-16 h-4" />
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 text-white shadow-lg shadow-red-500/20">
              <Plus className="w-4 h-4" />
              <Shimmer className="w-20 h-4 bg-white/20 dark:bg-white/20" rounded="rounded-md" />
            </div>
          </div>
        </div>

        {/* ── Bento Stats Grid (Exact 4 Cards) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: Active Clients */}
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <Shimmer className="w-20 h-3 mb-2" />
                <Shimmer className="w-14 h-8" rounded="rounded-lg" />
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#e50914] to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
                <Users className="w-5 h-5 text-white/90" />
              </div>
            </div>
            <div className="mt-3">
              <Shimmer className="w-28 h-3.5" />
            </div>
          </div>

          {/* Card 2: Monthly Revenue */}
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <Shimmer className="w-24 h-3 mb-2" />
                <Shimmer className="w-28 h-8" rounded="rounded-lg" />
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <IndianRupee className="w-5 h-5 text-white/90" />
              </div>
            </div>
            <div className="mt-3">
              <Shimmer className="w-32 h-3.5" />
            </div>
          </div>

          {/* Card 3: Collected */}
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <Shimmer className="w-16 h-3 mb-2" />
                <Shimmer className="w-24 h-8" rounded="rounded-lg" />
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white/90" />
              </div>
            </div>
            <div className="mt-3">
              <Shimmer className="w-24 h-3.5" />
            </div>
          </div>

          {/* Card 4: Shoots This Month */}
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <Shimmer className="w-28 h-3 mb-2" />
                <Shimmer className="w-16 h-8" rounded="rounded-lg" />
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                <Camera className="w-5 h-5 text-white/90" />
              </div>
            </div>
            <div className="mt-3">
              <Shimmer className="w-28 h-3.5" />
            </div>
          </div>
        </div>

        {/* ── Filters & Search Control Bar ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600" />
            <div className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-[#16181c] border border-gray-200 dark:border-gray-800 flex items-center">
              <Shimmer className="w-48 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {['All', 'Active', 'Paused', 'Inactive'].map((s, idx) => (
              <div
                key={s}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                  idx === 0
                    ? 'bg-[#e50914]/80 text-white shadow-sm'
                    : 'bg-white dark:bg-[#16181c] border border-gray-200 dark:border-gray-800'
                }`}
              >
                {idx === 0 ? s : <Shimmer className="w-12 h-3" />}
              </div>
            ))}
            <div className="flex items-center bg-white dark:bg-[#16181c] border border-gray-200 dark:border-gray-800 rounded-2xl p-1 gap-1">
              <div className="p-2 rounded-xl text-gray-400">
                <LayoutGrid className="w-3.5 h-3.5" />
              </div>
              <div className="p-2 rounded-xl text-white bg-[#e50914]/80">
                <List className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Sleek Client Rows Table ── */}
        <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 overflow-hidden shadow-xs">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Client</th>
                <th className="text-left p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Plan & Per-Day</th>
                <th className="text-left p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Working Days</th>
                <th className="text-left p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Generated Revenue</th>
                <th className="text-left p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Progress</th>
                <th className="text-left p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((row) => (
                <tr
                  key={row}
                  className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-[#1c1f24]/50 transition-colors"
                >
                  {/* Client Column */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-200/80 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <Shimmer className="w-full h-full" rounded="rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Shimmer className={`h-4 ${row % 2 === 0 ? 'w-36' : 'w-44'}`} />
                        <Shimmer className="w-24 h-3" />
                      </div>
                    </div>
                  </td>

                  {/* Plan & Per-Day */}
                  <td className="p-4">
                    <div className="space-y-1.5">
                      <Shimmer className="w-24 h-4" />
                      <Shimmer className="w-16 h-3" />
                    </div>
                  </td>

                  {/* Working Days */}
                  <td className="p-4">
                    <div className="space-y-1.5">
                      <Shimmer className="w-20 h-4" />
                      <Shimmer className="w-14 h-3" />
                    </div>
                  </td>

                  {/* Generated Revenue */}
                  <td className="p-4">
                    <div className="space-y-1.5">
                      <Shimmer className="w-28 h-4.5 bg-emerald-100/60 dark:bg-emerald-950/40" />
                      <Shimmer className="w-20 h-3" />
                    </div>
                  </td>

                  {/* Progress Bar */}
                  <td className="p-4">
                    <div className="w-32 space-y-1.5">
                      <Shimmer className="w-full h-2 rounded-full" />
                      <Shimmer className="w-10 h-2.5" />
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    <Shimmer className="w-16 h-6 rounded-full" />
                  </td>

                  {/* Action Pill */}
                  <td className="p-4 text-right">
                    <Shimmer className="w-8 h-8 rounded-xl ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

/**
 * Executive Client Detail Skeleton
 */
function DetailSkeleton() {
  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#16181c] border border-gray-200 dark:border-gray-800 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <Shimmer className="w-56 h-7" />
            <Shimmer className="w-36 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <Shimmer className="w-24 h-9 rounded-xl" />
            <Shimmer className="w-24 h-9 rounded-xl" />
            <Shimmer className="w-32 h-9 rounded-xl bg-red-600/20" />
          </div>
        </div>

        {/* Hero Card */}
        <div className="rounded-[28px] p-6 bg-gradient-to-br from-red-600 via-rose-600 to-red-800 text-white relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-3">
              <Shimmer className="w-20 h-6 rounded-full bg-white/20" />
              <Shimmer className="w-64 h-8 bg-white/30" />
              <Shimmer className="w-40 h-4 bg-white/20" />
            </div>
            <div className="space-y-2 text-right">
              <Shimmer className="w-24 h-3 bg-white/20 ml-auto" />
              <Shimmer className="w-36 h-9 bg-white/30 ml-auto" />
              <Shimmer className="w-24 h-3 bg-white/20 ml-auto" />
            </div>
          </div>
          <div className="space-y-2 mb-6">
            <Shimmer className="w-full h-3 rounded-full bg-white/20" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-black/20 backdrop-blur rounded-2xl p-3 space-y-2">
                <Shimmer className="w-20 h-3 bg-white/20" />
                <Shimmer className="w-16 h-6 bg-white/30" />
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-6 space-y-4">
          <Shimmer className="w-48 h-6" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Shimmer className="h-24 rounded-2xl" />
            <Shimmer className="h-24 rounded-2xl" />
            <Shimmer className="h-24 rounded-2xl" />
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * Executive Analytics Skeleton
 */
function AnalyticsSkeleton() {
  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#16181c] border border-gray-200 dark:border-gray-800 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-1.5">
            <Shimmer className="w-40 h-3" />
            <Shimmer className="w-56 h-7" />
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-5 space-y-3">
              <Shimmer className="w-24 h-3" />
              <Shimmer className="w-32 h-8" />
              <Shimmer className="w-20 h-3" />
            </div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-6 space-y-4">
          <Shimmer className="w-48 h-5" />
          <Shimmer className="w-full h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
