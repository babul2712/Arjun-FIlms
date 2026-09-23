'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  Calendar, 
  Tag, 
  Smile, 
  FileText, 
  Edit3, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { getTrades, deleteTrade } from '@/app/actions';
import TradeCard from '@/components/journal/TradeCard';
import AddTradeDrawer from '@/components/journal/AddTradeDrawer';
import { toast } from 'sonner';

const MARKET_TABS = ['All', 'Forex', 'Crypto', 'Indian Stock', 'Binary', 'US Stock'];
const DIRECTION_TABS = ['All', 'BUY', 'SELL'];
const OUTCOME_TABS = ['All', 'Winners', 'Losers'];

export default function TradeLogPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('All');
  const [selectedDirection, setSelectedDirection] = useState('All');
  const [selectedOutcome, setSelectedOutcome] = useState('All');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'pnl_desc' | 'pnl_asc'>('date_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Drawer states
  const [tradeDrawerOpen, setTradeDrawerOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<any | null>(null);

  const loadTrades = async () => {
    try {
      const data = await getTrades();
      setTrades(data || []);
    } catch (e) {
      console.error('Failed to load trades:', e);
      toast.error('Failed to load trade log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, []);

  // Filtered & Sorted Trades
  const filteredTrades = useMemo(() => {
    return trades
      .filter((trade) => {
        // Market filter
        if (selectedMarket !== 'All' && trade.marketType !== selectedMarket) return false;

        // Direction filter
        if (selectedDirection !== 'All' && trade.tradeType !== selectedDirection) return false;

        // Outcome filter
        if (selectedOutcome === 'Winners' && (trade.profitLoss || 0) <= 0) return false;
        if (selectedOutcome === 'Losers' && (trade.profitLoss || 0) >= 0) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchAsset = (trade.assetName || '').toLowerCase().includes(q);
          const matchSetup = (trade.tradeSetup || '').toLowerCase().includes(q);
          const matchMindset = (trade.mindsetBeforeTrade || '').toLowerCase().includes(q);
          const matchNotes = (trade.journalText || '').toLowerCase().includes(q);
          if (!matchAsset && !matchSetup && !matchMindset && !matchNotes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.date || a.createdAt || 0).getTime() - new Date(b.date || b.createdAt || 0).getTime();
        }
        if (sortBy === 'pnl_desc') {
          return (Number(b.profitLoss) || 0) - (Number(a.profitLoss) || 0);
        }
        if (sortBy === 'pnl_asc') {
          return (Number(a.profitLoss) || 0) - (Number(b.profitLoss) || 0);
        }
        return 0;
      });
  }, [trades, selectedMarket, selectedDirection, selectedOutcome, searchQuery, sortBy]);

  // Aggregate stats of filtered selection
  const filteredMetrics = useMemo(() => {
    let netPnL = 0;
    let winCount = 0;
    let lossCount = 0;

    filteredTrades.forEach((t) => {
      const pnl = Number(t.profitLoss) || 0;
      netPnL += pnl;
      if (pnl > 0) winCount++;
      else if (pnl < 0) lossCount++;
    });

    const total = filteredTrades.length;
    const winRate = total > 0 ? (winCount / total) * 100 : 0;

    return {
      total,
      netPnL,
      winCount,
      lossCount,
      winRate
    };
  }, [filteredTrades]);

  const handleEdit = (trade: any) => {
    setTradeToEdit(trade);
    setTradeDrawerOpen(true);
  };

  const handleDeleted = (id: string) => {
    setTrades((prev) => prev.filter((t) => t._id !== id));
  };

  const handleDeleteTableRow = async (trade: any) => {
    if (!confirm(`Delete trade record for ${trade.assetName}?`)) return;
    try {
      await deleteTrade(trade._id);
      toast.success('Trade deleted');
      handleDeleted(trade._id);
    } catch (err) {
      toast.error('Failed to delete trade');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#15171c] border border-[#fee2e2]/80 dark:border-gray-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg bg-red-500/10 text-[#e50914] text-[11px] font-black uppercase tracking-wider border border-red-500/20">
              Execution Ledger
            </span>
            <span className="text-xs text-gray-400 font-bold">
              {trades.length} Total Trades Recorded
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Trade Execution Log
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            Complete database of executed orders with strategy tags, psychological state, and P&L results.
          </p>
        </div>

        <button
          onClick={() => {
            setTradeToEdit(null);
            setTradeDrawerOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black text-xs shadow-lg shadow-red-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log New Trade</span>
        </button>
      </div>

      {/* Filter Toolbar Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm space-y-4">
        {/* Search & Main Selectors */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker (e.g. EUR/USD, BTC), setup, notes, or mindset..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-[#e50914] text-gray-800 dark:text-gray-200"
            />
          </div>

          {/* Sort selector & View Mode Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 text-xs font-bold text-gray-700 dark:text-gray-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-hidden font-bold cursor-pointer"
              >
                <option value="date_desc">Newest Date</option>
                <option value="date_asc">Oldest Date</option>
                <option value="pnl_desc">Highest P&L</option>
                <option value="pnl_asc">Lowest P&L</option>
              </select>
            </div>

            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-[#e50914] shadow-xs' : 'text-gray-400 hover:text-gray-700 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white dark:bg-gray-700 text-[#e50914] shadow-xs' : 'text-gray-400 hover:text-gray-700 dark:hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills: Market, Direction, Outcome */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          {/* Market Types */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 mr-1">Market:</span>
            {MARKET_TABS.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMarket(m)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedMarket === m
                    ? 'bg-[#e50914] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Outcome Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 mr-1">Result:</span>
            {OUTCOME_TABS.map((o) => (
              <button
                key={o}
                onClick={() => setSelectedOutcome(o)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedOutcome === o
                    ? o === 'Winners' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : o === 'Losers' 
                      ? 'bg-red-600 text-white shadow-xs' 
                      : 'bg-gray-800 text-white dark:bg-white dark:text-gray-900 shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Summary Banner */}
      <div className="px-6 py-3.5 rounded-2xl bg-gray-50 dark:bg-[#15171c] border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-500">
            Showing <strong className="text-gray-900 dark:text-white font-black">{filteredMetrics.total}</strong> trades
          </span>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span className="font-bold text-gray-500">
            Win Rate: <strong className="text-gray-900 dark:text-white font-black">{filteredMetrics.winRate.toFixed(1)}%</strong> ({filteredMetrics.winCount}W / {filteredMetrics.lossCount}L)
          </span>
        </div>

        <div>
          <span className="font-bold text-gray-500 mr-1.5">Net Selection P&L:</span>
          <strong className={`font-black text-sm ${
            filteredMetrics.netPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {filteredMetrics.netPnL >= 0 ? '+' : ''}${filteredMetrics.netPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {/* Trades Grid or Table */}
      {filteredTrades.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-[#e50914] flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-gray-800 dark:text-white">
            No Trades Match Your Filters
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Try adjusting your search keywords, market category, or outcome filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedMarket('All');
              setSelectedDirection('All');
              setSelectedOutcome('All');
            }}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrades.map((trade) => (
            <TradeCard
              key={trade._id}
              trade={trade}
              onEdit={handleEdit}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm">
          <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-50/80 dark:bg-[#121418] border-b border-gray-200 dark:border-gray-800 text-[11px] font-black uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Asset</th>
                <th className="py-3.5 px-4">Market</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Entry / Exit</th>
                <th className="py-3.5 px-4">Setup</th>
                <th className="py-3.5 px-4">Mindset</th>
                <th className="py-3.5 px-4 text-right">Net Result</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
              {filteredTrades.map((t) => {
                const isProfit = (t.profitLoss || 0) >= 0;
                return (
                  <tr key={t._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-400">
                      {new Date(t.date || t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-black text-gray-900 dark:text-white">
                      {t.assetName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {t.marketType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                        t.tradeType === 'BUY'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-red-500/10 text-red-600'
                      }`}>
                        {t.tradeType === 'BUY' ? 'LONG' : 'SHORT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {t.entryPrice || 0} &rarr; {t.exitPrice || 0}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 truncate max-w-xs">
                      {t.tradeSetup || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                      {t.mindsetBeforeTrade || '-'}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-black text-sm whitespace-nowrap ${
                      isProfit ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {isProfit ? '+' : ''}${Number(t.profitLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1.5 text-gray-400 hover:text-[#e50914] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTableRow(t)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Drawer */}
      <AddTradeDrawer
        isOpen={tradeDrawerOpen}
        onClose={() => setTradeDrawerOpen(false)}
        tradeToEdit={tradeToEdit}
        onSuccess={() => loadTrades()}
      />
    </div>
  );
}
