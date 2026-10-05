'use client';

import React, { useMemo } from 'react';
import { 
  Percent, 
  BarChart3, 
  Flame, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Compass
} from 'lucide-react';

interface ExpectancyRiskMatrixProps {
  trades: any[];
  currencyMode?: 'USD' | 'INR';
  usdRate?: number;
}

export default function ExpectancyRiskMatrix({
  trades,
  currencyMode = 'USD',
  usdRate = 86.5,
}: ExpectancyRiskMatrixProps) {
  const currencySymbol = currencyMode === 'INR' ? '₹' : '$';

  const convertVal = (valInUSD: number) => {
    if (currencyMode === 'INR') return valInUSD * usdRate;
    return valInUSD;
  };

  const matrix = useMemo(() => {
    let totalTrades = trades.length;
    let winCount = 0;
    let lossCount = 0;
    let totalGains = 0;
    let totalLosses = 0;
    let largestWin = 0;
    let largestLoss = 0;

    // Streaks calculation (sorted chronologically)
    const sorted = [...trades].sort((a, b) => new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime());
    
    let currentWinStreak = 0;
    let maxWinStreak = 0;
    let currentLossStreak = 0;
    let maxLossStreak = 0;

    sorted.forEach((t) => {
      const rawPnl = Number(t.profitLoss) || 0;
      const pnl = convertVal(rawPnl);

      if (pnl > 0) {
        winCount++;
        totalGains += pnl;
        if (pnl > largestWin) largestWin = pnl;

        currentWinStreak++;
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
        currentLossStreak = 0;
      } else if (pnl < 0) {
        lossCount++;
        const lossMagnitude = Math.abs(pnl);
        totalLosses += lossMagnitude;
        if (lossMagnitude > largestLoss) largestLoss = lossMagnitude;

        currentLossStreak++;
        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
        currentWinStreak = 0;
      }
    });

    const winRate = totalTrades > 0 ? winCount / totalTrades : 0;
    const lossRate = totalTrades > 0 ? lossCount / totalTrades : 0;

    const avgWin = winCount > 0 ? totalGains / winCount : 0;
    const avgLoss = lossCount > 0 ? totalLosses / lossCount : 0;

    const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? avgWin : 0;
    const profitFactor = totalLosses > 0 ? totalGains / totalLosses : totalGains > 0 ? totalGains : 0;

    // Mathematical Expectancy per Trade Formula: (WinRate * AvgWin) - (LossRate * AvgLoss)
    const expectancy = (winRate * avgWin) - (lossRate * avgLoss);

    return {
      totalTrades,
      winCount,
      lossCount,
      winRate: (winRate * 100).toFixed(1),
      lossRate: (lossRate * 100).toFixed(1),
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      winLossRatio: winLossRatio.toFixed(2),
      profitFactor: profitFactor.toFixed(2),
      expectancy: expectancy.toFixed(2),
      largestWin: largestWin.toFixed(2),
      largestLoss: largestLoss.toFixed(2),
      maxWinStreak,
      maxLossStreak,
    };
  }, [trades, currencyMode, usdRate]);

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <Compass className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">
            Expectancy & Risk Matrix
          </h2>
          <p className="text-xs text-gray-400 font-semibold">
            Institutional probability profile, payoff ratio, and edge quantification
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Expectancy per Trade */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
            Expected Value / Trade
          </span>
          <span className={`text-lg font-black truncate block ${Number(matrix.expectancy) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
            {Number(matrix.expectancy) >= 0 ? '+' : ''}{currencySymbol}{matrix.expectancy}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">Mathematical edge</span>
        </div>

        {/* Profit Factor */}
        <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
            Profit Factor
          </span>
          <span className="text-lg font-black text-gray-900 dark:text-white truncate block">
            {matrix.profitFactor}x
          </span>
          <span className="text-[10px] text-gray-400 font-medium">Gains / Losses</span>
        </div>

        {/* Win/Loss Ratio */}
        <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
            Win / Loss Ratio
          </span>
          <span className="text-lg font-black text-gray-900 dark:text-white truncate block">
            {matrix.winLossRatio} : 1
          </span>
          <span className="text-[10px] text-gray-400 font-medium">Avg Win vs Avg Loss</span>
        </div>

        {/* Avg Win vs Avg Loss */}
        <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
            Avg Win / Avg Loss
          </span>
          <div className="text-sm font-black truncate">
            <span className="text-emerald-600">+{currencySymbol}{matrix.avgWin}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-red-600">-{currencySymbol}{matrix.avgLoss}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Mean trade size</span>
        </div>

        {/* Largest Win vs Largest Loss */}
        <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
            Extremes (Win / Loss)
          </span>
          <div className="text-sm font-black truncate">
            <span className="text-emerald-600">+{currencySymbol}{matrix.largestWin}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-red-600">-{currencySymbol}{matrix.largestLoss}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Peak trade swing</span>
        </div>

        {/* Max Streaks */}
        <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
            Max Streaks (W / L)
          </span>
          <div className="text-sm font-black truncate">
            <span className="text-emerald-600">{matrix.maxWinStreak} Wins</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-red-600">{matrix.maxLossStreak} Losses</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Execution consistency</span>
        </div>
      </div>
    </div>
  );
}
