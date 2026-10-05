'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Coins, 
  Search, 
  Edit3, 
  Trash2, 
  PieChart, 
  Briefcase, 
  Calendar, 
  FileText,
  Percent,
  Check
} from 'lucide-react';
import { getInvestments, deleteInvestment, updateInvestment } from '@/app/actions';
import AddInvestmentDrawer from '@/components/journal/AddInvestmentDrawer';
import { toast } from 'sonner';

const ASSET_CATEGORIES = ['All', 'Crypto', 'Indian Stocks', 'US Equities', 'Mutual Funds', 'Gold / Commodities', 'Cash & Fixed Deposit'];

export default function AssetPortfolioPage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Drawer & Editing
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any | null>(null);

  // Quick Price Update modal
  const [quickPriceModal, setQuickPriceModal] = useState<{ id: string; name: string; price: number; currency: string } | null>(null);
  const [newMarketPrice, setNewMarketPrice] = useState('');
  const [updatingPrice, setUpdatingPrice] = useState(false);

  const loadData = async () => {
    try {
      const data = await getInvestments();
      setInvestments(data || []);
    } catch (e) {
      console.error('Failed to load investments:', e);
      toast.error('Failed to load portfolio holdings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Portfolio Totals & Allocation
  const portfolioMetrics = useMemo(() => {
    let totalInvested = 0;
    let totalCurrentValuation = 0;
    const categoryTotals: Record<string, number> = {};

    investments.forEach((inv) => {
      const buyPrice = Number(inv.buyPrice) || 0;
      const currentPrice = Number(inv.currentPrice) || buyPrice;
      const qty = Number(inv.quantity) || 1;
      const invested = buyPrice * qty;
      const currentVal = currentPrice * qty;

      totalInvested += invested;
      totalCurrentValuation += currentVal;

      const cat = inv.assetType || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + currentVal;
    });

    const netPnL = totalCurrentValuation - totalInvested;
    const roiPercentage = totalInvested > 0 ? (netPnL / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalCurrentValuation,
      netPnL,
      roiPercentage,
      categoryTotals
    };
  }, [investments]);

  // Filtered Holdings
  const filteredHoldings = useMemo(() => {
    return investments.filter((inv) => {
      if (selectedCategory !== 'All' && inv.assetType !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (inv.assetName || '').toLowerCase().includes(q);
        const matchNotes = (inv.notes || '').toLowerCase().includes(q);
        if (!matchName && !matchNotes) return false;
      }
      return true;
    });
  }, [investments, selectedCategory, searchQuery]);

  const handleDelete = async (inv: any) => {
    if (!confirm(`Remove ${inv.assetName} from your portfolio?`)) return;
    try {
      await deleteInvestment(inv._id);
      toast.success('Asset holding removed');
      setInvestments((prev) => prev.filter((x) => x._id !== inv._id));
    } catch (err) {
      toast.error('Failed to remove asset');
    }
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPriceModal) return;
    const priceNum = parseFloat(newMarketPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setUpdatingPrice(true);
    try {
      await updateInvestment(quickPriceModal.id, { currentPrice: priceNum });
      toast.success(`Market price for ${quickPriceModal.name} updated!`);
      setQuickPriceModal(null);
      loadData();
    } catch (err) {
      toast.error('Failed to update market price');
    } finally {
      setUpdatingPrice(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#15171c] border border-[#fee2e2]/80 dark:border-gray-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg bg-red-500/10 text-[#e50914] text-[11px] font-black uppercase tracking-wider border border-red-500/20">
              Wealth & Portfolio
            </span>
            <span className="text-xs text-gray-400 font-bold">
              {investments.length} Active Holdings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Asset Portfolio & Holdings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            Track multi-asset allocations across Crypto, Indian Stocks, US Equities, Index Funds, and Commodities.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingInvestment(null);
            setDrawerOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black text-xs shadow-lg shadow-red-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Holding</span>
        </button>
      </div>

      {/* Portfolio High-Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Total Valuation */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm relative overflow-hidden">
          <span className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">
            Total Current Value
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            ₹{portfolioMetrics.totalCurrentValuation.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            Across {investments.length} holdings
          </p>
        </div>

        {/* Total Capital Invested */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm relative overflow-hidden">
          <span className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">
            Capital Invested
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            ₹{portfolioMetrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            Net cash allocated
          </p>
        </div>

        {/* Unrealized P&L */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm relative overflow-hidden">
          <span className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">
            Unrealized P&L
          </span>
          <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${
            portfolioMetrics.netPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {portfolioMetrics.netPnL >= 0 ? '+' : ''}₹{portfolioMetrics.netPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            Paper profit / loss
          </p>
        </div>

        {/* Overall Return ROI % */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm relative overflow-hidden">
          <span className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">
            Overall ROI %
          </span>
          <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${
            portfolioMetrics.roiPercentage >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {portfolioMetrics.roiPercentage >= 0 ? '+' : ''}{portfolioMetrics.roiPercentage.toFixed(2)}%
          </h3>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            Portfolio return rate
          </p>
        </div>
      </div>

      {/* Asset Allocation Breakdown Bar */}
      {portfolioMetrics.totalCurrentValuation > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
              Asset Class Allocation
            </h3>
            <span className="text-xs text-gray-400 font-bold">
              100% Portfolio Distribution
            </span>
          </div>

          {/* Stacked Progress Bar */}
          <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex shadow-inner">
            {Object.entries(portfolioMetrics.categoryTotals).map(([cat, val], idx) => {
              const pct = (val / portfolioMetrics.totalCurrentValuation) * 100;
              const colors = ['bg-[#e50914]', 'bg-purple-600', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-500', 'bg-cyan-600'];
              const color = colors[idx % colors.length];

              return (
                <div
                  key={cat}
                  style={{ width: `${pct}%` }}
                  className={`${color} h-full transition-all`}
                  title={`${cat}: ${pct.toFixed(1)}% (₹${val.toLocaleString()})`}
                />
              );
            })}
          </div>

          {/* Legend Items */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold">
            {Object.entries(portfolioMetrics.categoryTotals).map(([cat, val], idx) => {
              const pct = (val / portfolioMetrics.totalCurrentValuation) * 100;
              const colors = ['bg-[#e50914]', 'bg-purple-600', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-500', 'bg-cyan-600'];
              const color = colors[idx % colors.length];

              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-gray-700 dark:text-gray-300 font-bold">{cat}:</span>
                  <span className="text-gray-500">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search asset name, ticker, or notes..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-[#e50914] text-gray-800 dark:text-gray-200"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {ASSET_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#e50914] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings Table & Cards */}
      {filteredHoldings.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-[#e50914] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-gray-800 dark:text-white">
            No Portfolio Holdings Found
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Add your crypto, stocks, or index fund holdings to track portfolio valuation and profit/loss in real-time.
          </p>
          <button
            onClick={() => {
              setEditingInvestment(null);
              setDrawerOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#e50914] text-white text-xs font-black shadow-lg shadow-red-500/25 hover:bg-red-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Holding</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm">
          <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-50/80 dark:bg-[#121418] border-b border-gray-200 dark:border-gray-800 text-[11px] font-black uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-3.5 px-4">Asset Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Holding Quantity</th>
                <th className="py-3.5 px-4">Buy Price</th>
                <th className="py-3.5 px-4">Market Price</th>
                <th className="py-3.5 px-4">Invested Value</th>
                <th className="py-3.5 px-4">Current Valuation</th>
                <th className="py-3.5 px-4 text-right">Unrealized P&L</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
              {filteredHoldings.map((inv) => {
                const buyP = Number(inv.buyPrice) || 0;
                const curP = Number(inv.currentPrice) || buyP;
                const qty = Number(inv.quantity) || 1;
                const investedVal = buyP * qty;
                const currentVal = curP * qty;
                const pnl = currentVal - investedVal;
                const pnlPct = investedVal > 0 ? (pnl / investedVal) * 100 : 0;
                const isProfitable = pnl >= 0;

                return (
                  <tr key={inv._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-black text-gray-900 dark:text-white">
                      <div>
                        <span className="text-sm">{inv.assetName}</span>
                        {inv.notes && (
                          <p className="text-[10px] text-gray-400 font-normal truncate max-w-xs">{inv.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {inv.assetType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-800 dark:text-gray-200">
                      {qty.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {inv.currency || 'INR'} {buyP.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          setQuickPriceModal({
                            id: inv._id,
                            name: inv.assetName,
                            price: curP,
                            currency: inv.currency || 'INR'
                          });
                          setNewMarketPrice(String(curP));
                        }}
                        className="flex items-center gap-1 font-bold text-gray-800 dark:text-gray-200 hover:text-[#e50914] cursor-pointer group"
                        title="Click to update market price"
                      >
                        <span>{inv.currency || 'INR'} {curP.toLocaleString()}</span>
                        <Edit3 className="w-3 h-3 text-gray-400 group-hover:text-[#e50914]" />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {inv.currency || 'INR'} {investedVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-gray-900 dark:text-white">
                      {inv.currency || 'INR'} {currentVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-black text-sm whitespace-nowrap ${
                      isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isProfitable ? '+' : ''}{inv.currency || 'INR'} {pnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      <span className="block text-[10px] font-bold">
                        ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingInvestment(inv);
                            setDrawerOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-[#e50914] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          title="Edit Holding"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          title="Remove Holding"
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

      {/* Quick Price Update Modal */}
      {quickPriceModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setQuickPriceModal(null)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#15171c] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-black text-gray-900 dark:text-white">
              Update Current Price for {quickPriceModal.name}
            </h3>
            <form onSubmit={handleUpdatePrice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  New Current Market Price ({quickPriceModal.currency})
                </label>
                <input
                  type="number"
                  step="any"
                  value={newMarketPrice}
                  onChange={(e) => setNewMarketPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:outline-hidden focus:border-[#e50914]"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickPriceModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPrice}
                  className="px-5 py-2 rounded-xl bg-[#e50914] text-white text-xs font-black hover:bg-red-700 cursor-pointer disabled:opacity-50"
                >
                  {updatingPrice ? 'Updating...' : 'Save Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Drawer */}
      <AddInvestmentDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        investmentToEdit={editingInvestment}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
