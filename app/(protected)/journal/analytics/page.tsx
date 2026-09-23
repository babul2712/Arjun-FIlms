'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Activity, 
  Target, 
  Clock, 
  Filter, 
  RefreshCw, 
  Plus, 
  DollarSign, 
  ArrowUpRight 
} from 'lucide-react';
import { getTrades } from '@/app/actions';
import EquityCurveChart from '@/components/journal/EquityCurveChart';
import StrategyPerformanceChart from '@/components/journal/StrategyPerformanceChart';
import TimeAnalyticsHeatmap from '@/components/journal/TimeAnalyticsHeatmap';
import ExpectancyRiskMatrix from '@/components/journal/ExpectancyRiskMatrix';
import AddTradeDrawer from '@/components/journal/AddTradeDrawer';
import Link from 'next/link';
import { toast } from 'sonner';

const MARKET_FILTERS = ['All', 'Forex', 'Crypto', 'Indian Stock', 'Binary', 'US Stock'];

export default function JournalAnalyticsPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState('All');
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'INR'>('USD');
  const [usdRate, setUsdRate] = useState<number>(86.5);

  // Drawer
  const [tradeDrawerOpen, setTradeDrawerOpen] = useState(false);

  const loadData = async () => {
    try {
      const data = await getTrades();
      setTrades(data || []);
    } catch (e) {
      console.error('Failed to load trades for analytics:', e);
      toast.error('Failed to load trade data');
    } finally {
      setLoading(false);
    }
  };

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
        // fallback
      }
    };
    fetchRate();
  }, []);

  // Filter trades by selected market
  const filteredTrades = useMemo(() => {
    if (selectedMarket === 'All') return trades;
    return trades.filter((t) => t.marketType === selectedMarket);
  }, [trades, selectedMarket]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#15171c] border border-[#fee2e2]/80 dark:border-gray-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg bg-red-500/10 text-[#e50914] text-[11px] font-black uppercase tracking-wider border border-red-500/20">
              Quantitative Edge Hub
            </span>
            <span className="text-xs text-gray-400 font-bold">
              {filteredTrades.length} Trades Analyzed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Trading Analytics & Equity Curve
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            Mathematical expectancy, drawdown curves, strategy rankings, and session performance.
          </p>
        </div>

        {/* Currency Switcher & Market Filter */}
        <div className="flex flex-wrap items-center gap-3">
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
            onClick={() => setTradeDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black text-xs shadow-lg shadow-red-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Trade</span>
          </button>
        </div>
      </div>

      {/* Market Category Pills Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-white dark:bg-[#15171c] rounded-2xl border border-gray-200/90 dark:border-gray-800/90 overflow-x-auto custom-scrollbar">
        <span className="text-xs font-black uppercase tracking-wider text-gray-400 pl-2 pr-1 shrink-0">
          Filter Market:
        </span>
        {MARKET_FILTERS.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMarket(m)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedMarket === m
                ? 'bg-[#e50914] text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Section 1: Cumulative Equity Curve Chart */}
      <EquityCurveChart
        trades={filteredTrades}
        currencyMode={currencyMode}
        usdRate={usdRate}
      />

      {/* Section 2: Expectancy & Risk Matrix */}
      <ExpectancyRiskMatrix
        trades={filteredTrades}
        currencyMode={currencyMode}
        usdRate={usdRate}
      />

      {/* Section 3: Strategy & Setup Performance Ranking */}
      <StrategyPerformanceChart
        trades={filteredTrades}
        currencyMode={currencyMode}
        usdRate={usdRate}
      />

      {/* Section 4: Day of Week & Session Timing Heatmap */}
      <TimeAnalyticsHeatmap
        trades={filteredTrades}
        currencyMode={currencyMode}
        usdRate={usdRate}
      />

      {/* Add Trade Drawer */}
      <AddTradeDrawer
        isOpen={tradeDrawerOpen}
        onClose={() => setTradeDrawerOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
