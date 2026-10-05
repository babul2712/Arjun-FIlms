'use client';

import React, { useMemo } from 'react';
import { Clock, Calendar, Sun, Moon, Zap, BarChart2 } from 'lucide-react';

interface TimeAnalyticsHeatmapProps {
  trades: any[];
  currencyMode?: 'USD' | 'INR';
  usdRate?: number;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SESSIONS = [
  { name: 'Indian Morning Open (9:15 - 11:30)', startH: 9, startM: 15, endH: 11, endM: 30, icon: Sun },
  { name: 'Mid-Day Lunch (11:30 - 13:30)', startH: 11, startM: 30, endH: 13, endM: 30, icon: Clock },
  { name: 'Indian Close / London Open (13:30 - 17:30)', startH: 13, startM: 30, endH: 17, endM: 30, icon: Zap },
  { name: 'New York Session (19:00 - 23:30)', startH: 19, startM: 0, endH: 23, endM: 30, icon: Moon },
  { name: 'Asian / Off-Hours (00:00 - 09:15)', startH: 0, startM: 0, endH: 9, endM: 15, icon: Clock },
];

export default function TimeAnalyticsHeatmap({
  trades,
  currencyMode = 'USD',
  usdRate = 86.5,
}: TimeAnalyticsHeatmapProps) {
  const currencySymbol = currencyMode === 'INR' ? '₹' : '$';

  const convertVal = (valInUSD: number) => {
    if (currencyMode === 'INR') return valInUSD * usdRate;
    return valInUSD;
  };

  // 1. Day of Week Breakdown
  const dayStats = useMemo(() => {
    const map: Record<string, { day: string; pnl: number; wins: number; total: number }> = {};
    DAYS.forEach((d) => {
      map[d] = { day: d, pnl: 0, wins: 0, total: 0 };
    });

    trades.forEach((t) => {
      if (!t.date && !t.createdAt) return;
      const d = new Date(t.date || t.createdAt);
      // getDay: 0 = Sun, 1 = Mon, ..., 6 = Sat
      const dayIndex = d.getDay();
      const dayName = dayIndex === 0 ? 'Sunday' : DAYS[dayIndex - 1];

      if (map[dayName]) {
        const rawPnl = Number(t.profitLoss) || 0;
        const pnl = convertVal(rawPnl);
        map[dayName].pnl += pnl;
        map[dayName].total += 1;
        if (pnl > 0) map[dayName].wins += 1;
      }
    });

    return DAYS.map((d) => {
      const item = map[d];
      const winRate = item.total > 0 ? (item.wins / item.total) * 100 : 0;
      return {
        ...item,
        winRate: Number(winRate.toFixed(1)),
        pnl: Number(item.pnl.toFixed(2)),
      };
    });
  }, [trades, currencyMode, usdRate]);

  // 2. Session Breakdown
  const sessionStats = useMemo(() => {
    const list = SESSIONS.map((sess) => {
      let pnl = 0;
      let wins = 0;
      let total = 0;

      trades.forEach((t) => {
        if (!t.date && !t.createdAt) return;
        const d = new Date(t.date || t.createdAt);
        const h = d.getHours();
        const m = d.getMinutes();
        const totalMin = h * 60 + m;

        const startMin = sess.startH * 60 + sess.startM;
        const endMin = sess.endH * 60 + sess.endM;

        if (totalMin >= startMin && totalMin < endMin) {
          const rawPnl = Number(t.profitLoss) || 0;
          const p = convertVal(rawPnl);
          pnl += p;
          total += 1;
          if (p > 0) wins += 1;
        }
      });

      const winRate = total > 0 ? (wins / total) * 100 : 0;
      return {
        ...sess,
        pnl: Number(pnl.toFixed(2)),
        wins,
        total,
        winRate: Number(winRate.toFixed(1)),
      };
    });

    return list;
  }, [trades, currencyMode, usdRate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Card 1: Day of the Week Performance */}
      <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">
              Day-of-the-Week Win Rate & P&L
            </h3>
            <p className="text-xs text-gray-400 font-semibold">
              Discover which weekdays give you the highest statistical edge
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {dayStats.map((item) => {
            const isProfit = item.pnl >= 0;
            return (
              <div
                key={item.day}
                className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#121418]/60 border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between"
              >
                <div className="w-28 shrink-0">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                    {item.day}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {item.total} {item.total === 1 ? 'trade' : 'trades'}
                  </span>
                </div>

                {/* Progress bar for Win Rate */}
                <div className="flex-1 px-4 hidden sm:block">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                    <span>Win Rate</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{item.winRate}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.winRate >= 50 ? 'bg-emerald-500' : 'bg-[#e50914]'
                      }`}
                      style={{ width: `${Math.min(item.winRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs sm:text-sm font-black ${
                    isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isProfit ? '+' : ''}{currencySymbol}{item.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 2: Market Session Heatmap */}
      <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">
              Trading Session Heatmap
            </h3>
            <p className="text-xs text-gray-400 font-semibold">
              Performance grouped by Indian, London, and NY market hours
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {sessionStats.map((sess) => {
            const Icon = sess.icon;
            const isProfit = sess.pnl >= 0;
            return (
              <div
                key={sess.name}
                className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#121418]/60 border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block truncate">
                      {sess.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {sess.total} Trades &bull; {sess.winRate}% Win Rate
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs sm:text-sm font-black ${
                    isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isProfit ? '+' : ''}{currencySymbol}{sess.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
