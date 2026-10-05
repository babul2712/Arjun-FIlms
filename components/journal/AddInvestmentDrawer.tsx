'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layers, 
  DollarSign, 
  Check, 
  Coins, 
  TrendingUp, 
  Calendar, 
  Briefcase 
} from 'lucide-react';
import AutoSearchInput from '@/components/ui/AutoSearchInput';
import { createInvestment, updateInvestment } from '@/app/actions';
import { toast } from 'sonner';

const ASSET_SUGGESTIONS = [
  'Bitcoin (BTC)', 'Ethereum (ETH)', 'Solana (SOL)', 'Cardano (ADA)', 'Ripple (XRP)',
  'NIFTY 50 Index Fund', 'Tata Consultancy Services (TCS)', 'Reliance Industries', 'HDFC Bank', 'Infosys',
  'Apple Inc (AAPL)', 'NVIDIA (NVDA)', 'Tesla (TSLA)', 'Microsoft (MSFT)', 'Amazon (AMZN)',
  'Sovereign Gold Bond (SGB)', 'Physical Gold (24K)', 'US Treasury Bills'
];

const ASSET_TYPES = [
  'Crypto',
  'Indian Stocks',
  'US Equities',
  'Mutual Funds',
  'Gold / Commodities',
  'Cash & Fixed Deposit'
];

interface AddInvestmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  investmentToEdit?: any | null;
  onSuccess?: (saved: any) => void;
}

export default function AddInvestmentDrawer({
  isOpen,
  onClose,
  investmentToEdit,
  onSuccess,
}: AddInvestmentDrawerProps) {
  const [loading, setLoading] = useState(false);

  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('Crypto');
  const [currency, setCurrency] = useState('INR');
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [notes, setNotes] = useState<string>('');
  const [dateAdded, setDateAdded] = useState<string>(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (investmentToEdit) {
      setAssetName(investmentToEdit.assetName || '');
      setAssetType(investmentToEdit.assetType || 'Crypto');
      setCurrency(investmentToEdit.currency || 'INR');
      setBuyPrice(investmentToEdit.buyPrice !== undefined ? String(investmentToEdit.buyPrice) : '');
      setCurrentPrice(investmentToEdit.currentPrice !== undefined ? String(investmentToEdit.currentPrice) : '');
      setQuantity(investmentToEdit.quantity !== undefined ? String(investmentToEdit.quantity) : '1');
      setNotes(investmentToEdit.notes || '');
      if (investmentToEdit.dateAdded) {
        try {
          setDateAdded(new Date(investmentToEdit.dateAdded).toISOString().slice(0, 10));
        } catch (e) {
          setDateAdded(new Date().toISOString().slice(0, 10));
        }
      }
    } else {
      setAssetName('');
      setAssetType('Crypto');
      setCurrency('INR');
      setBuyPrice('');
      setCurrentPrice('');
      setQuantity('1');
      setNotes('');
      setDateAdded(new Date().toISOString().slice(0, 10));
    }
  }, [investmentToEdit, isOpen]);

  if (!isOpen) return null;

  // Live preview metrics
  const bPrice = parseFloat(buyPrice) || 0;
  const cPrice = parseFloat(currentPrice) || bPrice;
  const qty = parseFloat(quantity) || 1;
  const totalInvested = bPrice * qty;
  const currentTotal = cPrice * qty;
  const netPnL = currentTotal - totalInvested;
  const returnPercentage = totalInvested > 0 ? (netPnL / totalInvested) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) {
      toast.error('Please enter asset name or symbol');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        assetName: assetName.trim(),
        assetType,
        currency,
        buyPrice: bPrice,
        currentPrice: cPrice,
        quantity: qty,
        notes: notes.trim(),
        dateAdded: new Date(dateAdded).toISOString(),
      };

      let saved;
      if (investmentToEdit?._id) {
        saved = await updateInvestment(investmentToEdit._id, payload);
        toast.success(`Holding for ${payload.assetName} updated!`);
      } else {
        saved = await createInvestment(payload);
        toast.success(`Holding for ${payload.assetName} added!`);
      }

      if (onSuccess) onSuccess(saved);
      onClose();
    } catch (err: any) {
      console.error('Save investment error:', err);
      toast.error('Failed to save investment holding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg h-full bg-white dark:bg-[#15171c] shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121418]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e50914]/10 text-[#e50914] flex items-center justify-center border border-red-500/20">
              <Layers className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {investmentToEdit ? 'Edit Asset Holding' : 'Add Portfolio Holding'}
              </h2>
              <p className="text-xs text-gray-400 font-semibold">
                Track crypto, stocks, index funds, and commodity allocations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5 text-gray-800 dark:text-gray-200">
          {/* Asset Category */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Asset Category *
            </label>
            <div className="flex flex-wrap gap-2">
              {ASSET_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAssetType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    assetType === type
                      ? 'bg-red-500/10 border-[#e50914] text-[#e50914] font-black shadow-xs ring-1 ring-red-500/30'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Name with Auto-search */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Asset Name / Symbol *
            </label>
            <AutoSearchInput
              value={assetName}
              onChange={(val) => setAssetName(val)}
              options={ASSET_SUGGESTIONS}
              placeholder="e.g. Bitcoin, NIFTY 50 ETF, Apple..."
              className="w-full"
            />
          </div>

          {/* Currency selection */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Currency Base *
            </label>
            <div className="flex gap-2">
              {['INR', 'USD', 'USDT', 'EUR'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`flex-1 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                    currency === c
                      ? 'bg-[#e50914] text-white border-[#e50914]'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Buy Price, Current Price & Quantity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                Buy Price ({currency}) *
              </label>
              <input
                type="number"
                step="any"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#e50914]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                Current Market Price
              </label>
              <input
                type="number"
                step="any"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder={buyPrice || '0.00'}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#e50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                Holding Quantity *
              </label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#e50914]"
                required
              />
            </div>
          </div>

          {/* Live Valuation Card Preview */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 space-y-2.5">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">
              Holding Valuation Summary
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Total Invested:</span>
                <p className="font-black text-gray-800 dark:text-white text-sm">
                  {currency} {totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Current Valuation:</span>
                <p className="font-black text-gray-800 dark:text-white text-sm">
                  {currency} {currentTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Unrealized P&L:</span>
              <span className={`text-sm font-black ${netPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {netPnL >= 0 ? '+' : ''}{currency} {netPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Date Added */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Acquisition Date
            </label>
            <input
              type="date"
              value={dateAdded}
              onChange={(e) => setDateAdded(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#e50914]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Investment Thesis & Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Investment goals, target exit price, staking rewards, allocation strategy..."
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#e50914] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Saving Holding...' : investmentToEdit ? 'Update Asset' : 'Add to Portfolio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
