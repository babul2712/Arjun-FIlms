'use client';

import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { Tag, Award, AlertTriangle, TrendingUp, TrendingDown, Target } from 'lucide-react';

interface StrategyPerformanceChartProps {
  trades: any[];
  currencyMode?: 'USD' | 'INR';
  usdRate?: number;
}

export default function StrategyPerformanceChart({
  trades,
  currencyMode = 'USD',
  usdRate = 86.5,
}: StrategyPerformanceChartProps) {
  const currencySymbol = currencyMode === 'INR' ? '₹' : '$';

  const convertVal = (valInUSD: number) => {
    if (currencyMode === 'INR') return valInUSD * usdRate;
    return valInUSD;
  };

  // Group trades by tradeSetup
  const strategyData = useMemo(() => {
    const map: Record<string, {
      setup: string;
      netPnL: number;
      winCount: number;
      lossCount: number;
      totalTrades: number;
      totalGains: number;
      totalLosses: number;
    }> = {};

    trades.forEach((t) => {
      const setup = (t.tradeSetup || 'Discretionary / Unspecified').trim();
      const rawPnl = Number(t.profitLoss) || 0;
      const pnl = convertVal(rawPnl);

      if (!map[setup]) {
        map[setup] = {
          setup,
          netPnL: 0,
          winCount: 0,
          lossCount: 0,
          totalTrades: 0,
          totalGains: 0,
          totalLosses: 0,
        };
      }

      map[setup].netPnL += pnl;
      map[setup].totalTrades += 1;

      if (pnl > 0) {
        map[setup].winCount += 1;
        map[setup].totalGains += pnl;
      } else if (pnl < 0) {
        map[setup].lossCount += 1;
        map[setup].totalLosses += Math.abs(pnl);
      }
    });

    const list = Object.values(map).map((item) => {
      const winRate = item.totalTrades > 0 ? (item.winCount / item.totalTrades) * 100 : 0;
      const profitFactor = item.totalLosses > 0 ? item.totalGains / item.totalLosses : item.totalGains > 0 ? item.totalGains : 0;
      const avgTrade = item.totalTrades > 0 ? item.netPnL / item.totalTrades : 0;

      return {
        ...item,
        winRate: Number(winRate.toFixed(1)),
        profitFactor: Number(profitFactor.toFixed(2)),
        avgTrade: Number(avgTrade.toFixed(2)),
        netPnL: Number(item.netPnL.toFixed(2)),
      };
    });

    // Sort by netPnL descending
    return list.sort((a, b) => b.netPnL - a.netPnL);
  }, [trades, currencyMode, usdRate]);

  const bestSetup = strategyData.length > 0 && strategyData[0].netPnL > 0 ? strategyData[0] : null;
  const worstSetup = strategyData.length > 0 && strategyData[strategyData.length - 1].netPnL < 0 ? strategyData[strategyData.length - 1] : null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="p-3 rounded-2xl bg-gray-900/95 text-white border border-gray-700 shadow-xl text-xs space-y-1">
          <p className="font-black text-gray-200">{d.setup}</p>
          <p className="text-gray-400">
            Total Trades: <strong className="text-white">{d.totalTrades}</strong> ({d.winCount}W / {d.lossCount}L)
          </p>
          <p className="text-gray-400">
            Win Rate: <strong className="text-white">{d.winRate}%</strong>
          </p>
          <p className={`font-black ${d.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            Net Result: {d.netPnL >= 0 ? '+' : ''}{currencySymbol}{d.netPnL.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#e50914]/10 text-[#e50914] flex items-center justify-center border border-red-500/20 shadow-xs">
            <Target className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Strategy & Setup Matrix
            </h2>
            <p className="text-xs text-gray-400 font-bold">
              Analyze statistical edge across trade setups and chart models
            </p>
          </div>
        </div>

        {bestSetup && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black">
            <Award className="w-4 h-4" />
            <span>Top Edge: {bestSetup.setup} (+{currencySymbol}{bestSetup.netPnL.toLocaleString()})</span>
          </div>
        )}
      </div>

      {strategyData.length === 0 ? (
        <div className="py-12 text-center text-gray-400 space-y-2">
          <Tag className="w-8 h-8 opacity-40 mx-auto" />
          <p className="text-xs font-bold">No strategy tags recorded yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bar Chart View */}
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis 
                  dataKey="setup" 
                  tick={{ fontSize: 10, fill: '#888' }} 
                  interval={0} 
                  angle={-15} 
                  textAnchor="end"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#888' }} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${currencySymbol}${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#888888" opacity={0.4} />
                <Bar dataKey="netPnL" radius={[6, 6, 0, 0]}>
                  {strategyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.netPnL >= 0 ? '#10b981' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Strategy Ranking Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {strategyData.map((item) => {
              const isProfit = item.netPnL >= 0;
              return (
                <div 
                  key={item.setup} 
                  className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-extrabold text-xs text-gray-900 dark:text-white truncate block">
                      {item.setup}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                      <span>{item.totalTrades} Trades</span>
                      <span>&bull;</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {item.winRate}% Win Rate
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-sm font-black ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isProfit ? '+' : ''}{currencySymbol}{item.netPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-gray-400 block font-semibold">
                      Avg: {currencySymbol}{item.avgTrade.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
