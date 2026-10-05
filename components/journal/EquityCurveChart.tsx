'use client';

import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar, 
  Flame, 
  ShieldAlert, 
  Sparkles,
  DollarSign
} from 'lucide-react';

interface EquityCurveChartProps {
  trades: any[];
  currencyMode?: 'USD' | 'INR';
  usdRate?: number;
}

const TIMEFRAMES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: 'YTD', days: 'ytd' },
  { label: 'ALL', days: 'all' },
];

export default function EquityCurveChart({
  trades,
  currencyMode = 'USD',
  usdRate = 86.5,
}: EquityCurveChartProps) {
  const [timeframe, setTimeframe] = useState<string>('ALL');

  // Convert raw value to selected currency
  const convertVal = (valInUSD: number) => {
    if (currencyMode === 'INR') {
      return valInUSD * usdRate;
    }
    return valInUSD;
  };

  const currencySymbol = currencyMode === 'INR' ? '₹' : '$';

  // Process and sort trades chronologically (oldest to newest for equity curve)
  const chartData = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    // Sort ascending by date
    const sorted = [...trades]
      .filter((t) => t.date || t.createdAt)
      .sort((a, b) => new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime());

    // Filter by timeframe
    const now = new Date();
    const filtered = sorted.filter((t) => {
      const tradeDate = new Date(t.date || t.createdAt);
      if (timeframe === '7D') {
        return now.getTime() - tradeDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
      }
      if (timeframe === '30D') {
        return now.getTime() - tradeDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
      }
      if (timeframe === '90D') {
        return now.getTime() - tradeDate.getTime() <= 90 * 24 * 60 * 60 * 1000;
      }
      if (timeframe === 'YTD') {
        return tradeDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    let cumulativePnL = 0;
    let peakEquity = 0;

    const points: any[] = [];

    // Starting baseline point
    if (filtered.length > 0) {
      const firstDate = new Date(filtered[0].date || filtered[0].createdAt);
      points.push({
        date: firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: firstDate.toLocaleString(),
        asset: 'Start Baseline',
        tradePnL: 0,
        equity: 0,
        drawdown: 0,
      });
    }

    filtered.forEach((t, index) => {
      const rawPnl = Number(t.profitLoss) || 0;
      const convertedTradePnL = convertVal(rawPnl);
      cumulativePnL += convertedTradePnL;

      if (cumulativePnL > peakEquity) {
        peakEquity = cumulativePnL;
      }

      const drawdown = peakEquity > 0 ? Math.max(0, peakEquity - cumulativePnL) : 0;
      const d = new Date(t.date || t.createdAt);

      points.push({
        index: index + 1,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: d.toLocaleString(),
        asset: t.assetName || 'Trade',
        tradeType: t.tradeType || 'BUY',
        marketType: t.marketType || 'Forex',
        tradePnL: convertedTradePnL,
        equity: Number(cumulativePnL.toFixed(2)),
        drawdown: Number(drawdown.toFixed(2)),
      });
    });

    return points;
  }, [trades, timeframe, currencyMode, usdRate]);

  // High-Level Equity Metrics
  const metrics = useMemo(() => {
    if (chartData.length === 0) {
      return {
        currentEquity: 0,
        peakEquity: 0,
        maxDrawdown: 0,
        maxDrawdownPct: 0,
        totalTrades: 0,
      };
    }

    const currentEquity = chartData[chartData.length - 1]?.equity || 0;
    let peakEquity = 0;
    let maxDrawdown = 0;

    chartData.forEach((pt) => {
      if (pt.equity > peakEquity) peakEquity = pt.equity;
      if (pt.drawdown > maxDrawdown) maxDrawdown = pt.drawdown;
    });

    const maxDrawdownPct = peakEquity > 0 ? (maxDrawdown / peakEquity) * 100 : 0;

    return {
      currentEquity,
      peakEquity,
      maxDrawdown,
      maxDrawdownPct,
      totalTrades: chartData.length > 1 ? chartData.length - 1 : 0,
    };
  }, [chartData]);

  const isPositiveEquity = metrics.currentEquity >= 0;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isTradeWin = data.tradePnL >= 0;

      return (
        <div className="p-3.5 rounded-2xl bg-gray-900/95 text-white border border-gray-700/80 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[190px]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
            <span className="font-extrabold text-gray-200">{data.asset}</span>
            <span className="text-[10px] text-gray-400">{data.date}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Trade P&L:</span>
            <span className={`font-black ${isTradeWin ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isTradeWin ? '+' : ''}{currencySymbol}{data.tradePnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Cumulative Equity:</span>
            <span className={`font-black ${data.equity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.equity >= 0 ? '+' : ''}{currencySymbol}{data.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {data.drawdown > 0 && (
            <div className="flex items-center justify-between text-amber-400 font-bold text-[11px] pt-1 border-t border-gray-800/80">
              <span>Drawdown:</span>
              <span>-{currencySymbol}{data.drawdown.toLocaleString()}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm space-y-6">
      
      {/* Header & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs ${
            isPositiveEquity
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              : 'bg-red-500/10 text-red-600 border-red-500/20'
          }`}>
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Cumulative Equity Curve
            </h2>
            <p className="text-xs text-gray-400 font-bold">
              Account balance growth, peak equity, and drawdown trajectory
            </p>
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/60">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setTimeframe(tf.label)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                timeframe === tf.label
                  ? 'bg-white dark:bg-[#15171c] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* High-Level Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Current Net Equity */}
        <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
            Period Net P&L
          </span>
          <span className={`text-base sm:text-lg font-black truncate block ${
            isPositiveEquity ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isPositiveEquity ? '+' : ''}{currencySymbol}{metrics.currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Peak Equity */}
        <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
            Peak Balance
          </span>
          <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate block">
            +{currencySymbol}{metrics.peakEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Maximum Drawdown */}
        <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
            Max Drawdown
          </span>
          <span className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 truncate block">
            -{currencySymbol}{metrics.maxDrawdown.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {metrics.maxDrawdownPct > 0 && (
              <span className="text-xs font-bold ml-1 text-rose-500">
                ({metrics.maxDrawdownPct.toFixed(1)}%)
              </span>
            )}
          </span>
        </div>

        {/* Trades in period */}
        <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
            Trades Executed
          </span>
          <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate block">
            {metrics.totalTrades} Trades
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] sm:h-[320px] w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
            <Activity className="w-8 h-8 opacity-40" />
            <p className="text-xs font-bold">No trades recorded in selected timeframe</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="equityPositiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="equityNegativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#888' }} 
                tickLine={false} 
                axisLine={false}
              />
              
              <YAxis 
                tick={{ fontSize: 11, fill: '#888' }} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />

              <Tooltip content={<CustomTooltip />} />

              <ReferenceLine y={0} stroke="#888888" strokeDasharray="3 3" opacity={0.5} />

              <Area 
                type="monotone" 
                dataKey="equity" 
                stroke={isPositiveEquity ? '#10b981' : '#ef4444'} 
                strokeWidth={3}
                fill={isPositiveEquity ? 'url(#equityPositiveGradient)' : 'url(#equityNegativeGradient)'} 
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
