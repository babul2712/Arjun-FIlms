'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar as CalendarIcon, 
  LineChart, 
  Layers, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  ArrowUpRight, 
  DollarSign, 
  RefreshCw, 
  Filter, 
  ListFilter,
  BarChart3,
  Percent
} from 'lucide-react';
import { getTrades, getInvestments } from '@/app/actions';
import MonthlyCalendar from '@/components/journal/MonthlyCalendar';
import TradeCard from '@/components/journal/TradeCard';
import AddTradeDrawer from '@/components/journal/AddTradeDrawer';
import AddInvestmentDrawer from '@/components/journal/AddInvestmentDrawer';
import EquityCurveChart from '@/components/journal/EquityCurveChart';
import Link from 'next/link';
import { toast } from 'sonner';

export default function JournalDashboardPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usdRate, setUsdRate] = useState<number>(86.5); // Fallback USD/INR rate
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'INR'>('USD');

  // Drawers
  const [tradeDrawerOpen, setTradeDrawerOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<any | null>(null);
  const [investmentDrawerOpen, setInvestmentDrawerOpen] = useState(false);

  // Load Data
  const loadData = async () => {
    try {
      const [tradesData, investmentsData] = await Promise.all([
        getTrades(),
        getInvestments()
      ]);
      setTrades(tradesData || []);
      setInvestments(investmentsData || []);
    } catch (err) {
      console.error('Failed to load journal data:', err);
      toast.error('Failed to load journal data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch live exchange rate
  useEffect(() => {
    loadData();

    const fetchRate = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data?.rates?.INR) {
          setUsdRate(data.rates.INR);
        }
      } catch (e) {
        // use fallback 86.5
      }
    };
    fetchRate();
  }, []);

  // Compute Overall Analytics
  const analytics = useMemo(() => {
    let totalPnL = 0;
    let totalTradesCount = trades.length;
    let winCount = 0;
    let lossCount = 0;
    let totalGains = 0;
    let totalLosses = 0;
    let bestTradePnL = 0;
    let worstTradePnL = 0;

    const marketBreakdown: Record<string, { pnl: number; count: number }> = {
      Forex: { pnl: 0, count: 0 },
      Crypto: { pnl: 0, count: 0 },
      'Indian Stock': { pnl: 0, count: 0 },
      Binary: { pnl: 0, count: 0 },
      'US Stock': { pnl: 0, count: 0 },
    };

    trades.forEach((t) => {
      const pnl = Number(t.profitLoss) || 0;
      totalPnL += pnl;

      if (pnl > 0) {
        winCount++;
        totalGains += pnl;
        if (pnl > bestTradePnL) bestTradePnL = pnl;
      } else if (pnl < 0) {
        lossCount++;
        totalLosses += Math.abs(pnl);
        if (pnl < worstTradePnL) worstTradePnL = pnl;
      }

      const m = t.marketType || 'Forex';
      if (marketBreakdown[m]) {
        marketBreakdown[m].pnl += pnl;
        marketBreakdown[m].count++;
      }
    });

    const winRate = totalTradesCount > 0 ? (winCount / totalTradesCount) * 100 : 0;
    const profitFactor = totalLosses > 0 ? totalGains / totalLosses : totalGains > 0 ? totalGains : 0;
    const avgTrade = totalTradesCount > 0 ? totalPnL / totalTradesCount : 0;

    // Portfolio net worth
    let totalPortfolioValuation = 0;
    let totalPortfolioInvested = 0;
    investments.forEach((inv) => {
      totalPortfolioValuation += Number(inv.currentValue || 0);
      totalPortfolioInvested += Number(inv.investmentValue || 0);
    });
    const portfolioPnL = totalPortfolioValuation - totalPortfolioInvested;

    return {
      totalPnL,
      totalTradesCount,
      winCount,
      lossCount,
      winRate,
      profitFactor,
      avgTrade,
      bestTradePnL,
      worstTradePnL,
      marketBreakdown,
      totalPortfolioValuation,
      totalPortfolioInvested,
      portfolioPnL
    };
  }, [trades, investments]);

  // Currency Formatter Helper
  const formatCurrency = (valInUSD: number) => {
    if (currencyMode === 'INR') {
      const inrVal = valInUSD * usdRate;
      return `₹${inrVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    }
    return `$${valInUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleOpenNewTrade = (dateString?: string) => {
    setTradeToEdit(dateString ? { date: `${dateString}T12:00:00.000Z` } : null);
    setTradeDrawerOpen(true);
  };

  const handleEditTrade = (trade: any) => {
    setTradeToEdit(trade);
    setTradeDrawerOpen(true);
  };

  const handleTradeSaved = (savedTrade: any) => {
    loadData();
  };

  const handleTradeDeleted = (id: string) => {
    setTrades((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Quick Action Row */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#15171c] border border-[#fee2e2]/80 dark:border-gray-800/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-lg bg-red-500/10 text-[#e50914] text-[11px] font-black uppercase tracking-wider border border-red-500/20">
              Zen Mode Active
            </span>
            <span className="text-xs text-gray-400 font-bold">
              USD/INR: ₹{usdRate.toFixed(2)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Trading Journal & Performance Hub
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            Review your statistical edge, daily P&L heatmaps, execution psychology, and portfolio holdings.
          </p>
        </div>

        {/* Currency Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Currency Toggle */}
          <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/60">
            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                currencyMode === 'USD'
                  ? 'bg-white dark:bg-[#15171c] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrencyMode('INR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                currencyMode === 'INR'
                  ? 'bg-[#e50914] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              INR (₹)
            </button>
          </div>

          <button
            onClick={() => handleOpenNewTrade()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black text-xs shadow-lg shadow-red-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Trade</span>
          </button>

          <button
            onClick={() => setInvestmentDrawerOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs transition-all cursor-pointer border border-gray-200 dark:border-gray-700"
          >
            <Layers className="w-4 h-4 text-[#e50914]" />
            <span>+ Holding</span>
          </button>
        </div>
      </div>

      {/* Top High-Impact Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Card 1: All-Time Net P&L */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              Total Net P&L
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              analytics.totalPnL >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
            }`}>
              {analytics.totalPnL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${
              analytics.totalPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {analytics.totalPnL >= 0 ? '+' : ''}{formatCurrency(analytics.totalPnL)}
            </h3>
            <p className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
              <span>Avg trade:</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {formatCurrency(analytics.avgTrade)}
              </span>
            </p>
          </div>
        </div>

        {/* Card 2: Win Rate % */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              Win Rate %
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {analytics.winRate.toFixed(1)}%
            </h3>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-emerald-600">{analytics.winCount} Wins</span>
              <span className="text-gray-400">&bull;</span>
              <span className="text-red-600">{analytics.lossCount} Losses</span>
            </div>
          </div>
        </div>

        {/* Card 3: Profit Factor */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              Profit Factor
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {analytics.profitFactor.toFixed(2)}x
            </h3>
            <p className="text-xs text-gray-400 font-semibold">
              Best trade: <span className="font-bold text-emerald-600">+{formatCurrency(analytics.bestTradePnL)}</span>
            </p>
          </div>
        </div>

        {/* Card 4: Portfolio Holdings Valuation */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              Portfolio Assets
            </span>
            <Link href="/journal/assets" className="text-xs font-bold text-[#e50914] hover:underline flex items-center gap-0.5">
              <span>View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {investments.length} Assets
            </h3>
            <p className="text-xs text-gray-400 font-semibold">
              Valuation: <span className="font-bold text-gray-700 dark:text-gray-200">{formatCurrency(analytics.totalPortfolioValuation)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Equity Curve, Heatmap Calendar & Zen Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Equity Curve & Monthly Calendar (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Live Cumulative Equity Growth Curve */}
          <EquityCurveChart
            trades={trades}
            currencyMode={currencyMode}
            usdRate={usdRate}
          />

          {/* Daily P&L Heatmap Calendar */}
          <MonthlyCalendar
            trades={trades}
            onAddTradeForDate={handleOpenNewTrade}
            onEditTrade={handleEditTrade}
            onTradeDeleted={handleTradeDeleted}
          />
        </div>

        {/* Right Column: Quantitative Overview & Market Breakdown (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quantitative Analytics Summary Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                Edge & Performance
              </h3>
              <Link href="/journal/analytics" className="text-xs font-bold text-[#e50914] hover:underline flex items-center gap-0.5">
                <span>Deep Analytics</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#121418]/60 border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Profit Factor</span>
                <span className="font-black text-gray-900 dark:text-white text-sm">
                  {analytics.profitFactor.toFixed(2)}x
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#121418]/60 border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Win / Loss Ratio</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {analytics.winCount}W / {analytics.lossCount}L ({analytics.winRate.toFixed(1)}%)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#121418]/60 border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Best Trade P&L</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  +{formatCurrency(analytics.bestTradePnL)}
                </span>
              </div>
            </div>

            <Link
              href="/journal/analytics"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-[#fee2e2]/60 dark:hover:bg-red-950/40 text-gray-800 dark:text-gray-200 hover:text-[#e50914] text-xs font-bold transition-all cursor-pointer border border-gray-200 dark:border-gray-700/60"
            >
              <BarChart3 className="w-4 h-4 text-[#e50914]" />
              <span>View Strategy Matrix & Sessions</span>
            </Link>
          </div>

          {/* Market Performance Breakdown Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                Market Breakdown
              </h3>
              <Link href="/journal/trades" className="text-xs font-bold text-[#e50914] hover:underline">
                See All
              </Link>
            </div>

            <div className="space-y-3">
              {Object.entries(analytics.marketBreakdown).map(([market, data]) => {
                const isProfitable = data.pnl >= 0;
                return (
                  <div key={market} className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#121418]/60 border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200 block">
                        {market}
                      </span>
                      <span className="text-[11px] text-gray-400 font-semibold">
                        {data.count} {data.count === 1 ? 'trade' : 'trades'}
                      </span>
                    </div>

                    <span className={`text-sm font-black ${
                      isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isProfitable ? '+' : ''}{formatCurrency(data.pnl)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trades Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Recent Executions
            </h2>
            <p className="text-xs text-gray-400 font-semibold">
              Latest trades logged in your trading journal
            </p>
          </div>

          <Link
            href="/journal/trades"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800/80 hover:bg-[#fee2e2]/60 text-gray-700 dark:text-gray-300 hover:text-[#e50914] text-xs font-bold transition-all"
          >
            <span>View All Trades</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {trades.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200 dark:border-gray-800 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-[#e50914] flex items-center justify-center mx-auto">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-gray-800 dark:text-white">
              No Trades Logged Yet
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Start building your trading journal today. Track Forex, Crypto, Indian Stocks, and Options with full psychological reflection.
            </p>
            <button
              onClick={() => handleOpenNewTrade()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#e50914] text-white text-xs font-black shadow-lg shadow-red-500/25 hover:bg-red-700 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Your First Trade</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trades.slice(0, 6).map((t) => (
              <TradeCard
                key={t._id}
                trade={t}
                onEdit={handleEditTrade}
                onDeleted={handleTradeDeleted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Trade Drawer */}
      <AddTradeDrawer
        isOpen={tradeDrawerOpen}
        onClose={() => setTradeDrawerOpen(false)}
        tradeToEdit={tradeToEdit}
        onSuccess={handleTradeSaved}
      />

      {/* Add Investment Drawer */}
      <AddInvestmentDrawer
        isOpen={investmentDrawerOpen}
        onClose={() => setInvestmentDrawerOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
