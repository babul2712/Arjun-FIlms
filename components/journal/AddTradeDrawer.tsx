'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Tag, 
  Smile, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  Calculator,
  AlertCircle
} from 'lucide-react';
import AutoSearchInput from '@/components/ui/AutoSearchInput';
import { createTrade, updateTrade } from '@/app/actions';
import { toast } from 'sonner';

const POPULAR_ASSETS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'GBP/JPY', 'EUR/JPY', 'XAU/USD (Gold)', 'USOIL (Crude)',
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'DOGE/USDT',
  'NIFTY 50', 'BANK NIFTY', 'FIN NIFTY', 'RELIANCE', 'HDFC BANK', 'ICICI BANK', 'INFOSYS', 'TATA MOTORS',
  'AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'SPY', 'QQQ',
  'EUR/USD (Binary OTC)', 'GBP/USD (Binary OTC)', 'USD/JPY (Binary OTC)'
];

const MARKET_TYPES = [
  { value: 'Forex', label: 'Forex (FX)', badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800' },
  { value: 'Crypto', label: 'Crypto (Web3)', badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800' },
  { value: 'Indian Stock', label: 'Indian Stocks & F&O', badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800' },
  { value: 'Binary', label: 'Binary Options', badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-800' },
  { value: 'US Stock', label: 'US Equities', badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800' },
];

const SETUPS = [
  'Breakout / Breakdown',
  'Support & Resistance Bounce',
  'SMC / Order Block',
  'Trend Continuation',
  'Liquidity Sweep / Fakeout',
  'EMA / Moving Avg Crossover',
  'Fibonacci Golden Zone',
  'Chart Pattern (Flag/Double Top)',
  'Range Scalp',
  'News Catalyst'
];

const MINDSETS = [
  { name: 'Calm & Focused', mood: 'positive' },
  { name: 'Disciplined Plan', mood: 'positive' },
  { name: 'Patient (Waited for Setup)', mood: 'positive' },
  { name: 'Confident', mood: 'positive' },
  { name: 'Anxious / Hesitant', mood: 'warning' },
  { name: 'FOMO (Chased Market)', mood: 'danger' },
  { name: 'Revenge Trading', mood: 'danger' },
  { name: 'Greedy (Oversized)', mood: 'danger' },
  { name: 'Boredom Trade', mood: 'danger' }
];

interface AddTradeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tradeToEdit?: any | null;
  onSuccess?: (savedTrade: any) => void;
}

export default function AddTradeDrawer({
  isOpen,
  onClose,
  tradeToEdit,
  onSuccess,
}: AddTradeDrawerProps) {
  const [loading, setLoading] = useState(false);

  // Form states
  const [assetName, setAssetName] = useState('');
  const [marketType, setMarketType] = useState('Forex');
  const [currency, setCurrency] = useState('USD');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [profitLoss, setProfitLoss] = useState<string>('');
  const [tradeSetup, setTradeSetup] = useState<string>('');
  const [mindsetBeforeTrade, setMindsetBeforeTrade] = useState<string>('Disciplined Plan');
  const [journalText, setJournalText] = useState<string>('');
  const [screenshot, setScreenshot] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 16));

  // Populate fields when editing
  useEffect(() => {
    if (tradeToEdit) {
      setAssetName(tradeToEdit.assetName || '');
      setMarketType(tradeToEdit.marketType || 'Forex');
      setCurrency(tradeToEdit.currency || 'USD');
      setTradeType(tradeToEdit.tradeType === 'SELL' ? 'SELL' : 'BUY');
      setEntryPrice(tradeToEdit.entryPrice !== undefined ? String(tradeToEdit.entryPrice) : '');
      setExitPrice(tradeToEdit.exitPrice !== undefined ? String(tradeToEdit.exitPrice) : '');
      setQuantity(tradeToEdit.quantity !== undefined ? String(tradeToEdit.quantity) : '1');
      setProfitLoss(tradeToEdit.profitLoss !== undefined ? String(tradeToEdit.profitLoss) : '');
      setTradeSetup(tradeToEdit.tradeSetup || '');
      setMindsetBeforeTrade(tradeToEdit.mindsetBeforeTrade || 'Disciplined Plan');
      setJournalText(tradeToEdit.journalText || '');
      setScreenshot(tradeToEdit.screenshot || '');
      if (tradeToEdit.date) {
        try {
          setDate(new Date(tradeToEdit.date).toISOString().slice(0, 16));
        } catch (e) {
          setDate(new Date().toISOString().slice(0, 16));
        }
      }
    } else {
      // Reset form
      setAssetName('');
      setMarketType('Forex');
      setCurrency('USD');
      setTradeType('BUY');
      setEntryPrice('');
      setExitPrice('');
      setQuantity('1');
      setProfitLoss('');
      setTradeSetup('');
      setMindsetBeforeTrade('Disciplined Plan');
      setJournalText('');
      setScreenshot('');
      setDate(new Date().toISOString().slice(0, 16));
    }
  }, [tradeToEdit, isOpen]);

  if (!isOpen) return null;

  // Auto calculate P&L button helper
  const handleAutoCalcPL = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const qty = parseFloat(quantity) || 1;

    if (!isNaN(entry) && !isNaN(exit)) {
      let pnl = 0;
      if (tradeType === 'BUY') {
        pnl = (exit - entry) * qty;
      } else {
        pnl = (entry - exit) * qty;
      }
      setProfitLoss(pnl.toFixed(2));
      toast.success(`Calculated P&L: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ${currency}`);
    } else {
      toast.error('Please enter valid Entry and Exit prices first');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) {
      toast.error('Please enter an Asset Name or Symbol');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        assetName: assetName.trim().toUpperCase(),
        marketType,
        currency,
        tradeType,
        entryPrice: parseFloat(entryPrice) || 0,
        exitPrice: parseFloat(exitPrice) || 0,
        quantity: parseFloat(quantity) || 1,
        profitLoss: parseFloat(profitLoss) || 0,
        tradeSetup: tradeSetup.trim(),
        mindsetBeforeTrade,
        journalText: journalText.trim(),
        screenshot: screenshot.trim(),
        date: new Date(date).toISOString(),
      };

      let saved;
      if (tradeToEdit?._id) {
        saved = await updateTrade(tradeToEdit._id, payload);
        toast.success(`Trade for ${payload.assetName} updated successfully!`);
      } else {
        saved = await createTrade(payload);
        toast.success(`Trade for ${payload.assetName} logged successfully!`);
      }

      if (onSuccess) onSuccess(saved);
      onClose();
    } catch (err: any) {
      console.error('Submit trade error:', err);
      toast.error('Failed to save trade. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl h-full bg-white dark:bg-[#15171c] shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121418]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              tradeType === 'BUY' 
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                : 'bg-red-500/10 text-red-600 border border-red-500/20'
            }`}>
              {tradeType === 'BUY' ? <TrendingUp className="w-5 h-5 stroke-[2.5]" /> : <TrendingDown className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {tradeToEdit ? 'Edit Trade Record' : 'Log New Trade'}
              </h2>
              <p className="text-xs text-gray-400 font-semibold">
                Record execution details, setup, psychology & reflection
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 text-gray-800 dark:text-gray-200">
          
          {/* Trade Direction & Market Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Long / Short Switcher */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Trade Direction *
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/60">
                <button
                  type="button"
                  onClick={() => setTradeType('BUY')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    tradeType === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>BUY / LONG</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTradeType('SELL')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    tradeType === 'SELL'
                      ? 'bg-[#e50914] text-white shadow-md shadow-red-600/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>SELL / SHORT</span>
                </button>
              </div>
            </div>

            {/* Currency Choice */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Currency Base *
              </label>
              <div className="flex gap-2">
                {['USD', 'INR', 'USDT', 'EUR'].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                      currency === curr
                        ? 'bg-red-500/10 border-[#e50914] text-[#e50914] shadow-xs'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Market Selection Tabs */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Market Category *
            </label>
            <div className="flex flex-wrap gap-2">
              {MARKET_TYPES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMarketType(m.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    marketType === m.value
                      ? `${m.badgeColor} ring-2 ring-red-500/30 font-black`
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Asset / Ticker Name AutoSearch */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Asset Symbol / Ticker *
            </label>
            <AutoSearchInput
              value={assetName}
              onChange={(val) => setAssetName(val)}
              options={POPULAR_ASSETS}
              placeholder="e.g. EUR/USD, BTC/USDT, NIFTY 50, TSLA..."
              className="w-full"
            />
          </div>

          {/* Entry, Exit, Quantity & Calculated P&L Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                Entry Price
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#e50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                Exit Price
              </label>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#e50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                Quantity / Lots
              </label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#e50914]"
              />
            </div>
          </div>

          {/* Profit & Loss Input with Auto-Calc Button */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100/60 dark:from-[#181a20] dark:to-[#14161b] border border-gray-200 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Net Profit / Loss ({currency}) *
              </label>
              <button
                type="button"
                onClick={handleAutoCalcPL}
                className="flex items-center gap-1 text-[11px] font-bold text-[#e50914] hover:underline cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Auto Calculate</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="number"
                step="any"
                value={profitLoss}
                onChange={(e) => setProfitLoss(e.target.value)}
                placeholder="+500.00 or -200.00"
                className={`w-full px-4 py-2.5 rounded-xl border text-base font-extrabold focus:outline-hidden transition-all ${
                  parseFloat(profitLoss) > 0
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : parseFloat(profitLoss) < 0
                    ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
                required
              />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Positive values indicate profit, negative values indicate loss.
            </p>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Execution Date & Time *
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#e50914]"
                required
              />
            </div>
          </div>

          {/* Trade Setup Tag Pills */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Trade Strategy / Setup
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SETUPS.map((setup) => (
                <button
                  key={setup}
                  type="button"
                  onClick={() => setTradeSetup(setup)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    tradeSetup === setup
                      ? 'bg-[#e50914] text-white border-[#e50914] shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {setup}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={tradeSetup}
              onChange={(e) => setTradeSetup(e.target.value)}
              placeholder="Or type custom setup name..."
              className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#e50914]"
            />
          </div>

          {/* Mindset / Psychology Pills */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Psychological Mindset Before Entry
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MINDSETS.map((m) => {
                const isSelected = mindsetBeforeTrade === m.name;
                const colorClass = 
                  m.mood === 'positive' 
                    ? isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 bg-emerald-500/5'
                    : m.mood === 'warning'
                    ? isSelected ? 'bg-amber-600 text-white border-amber-600' : 'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 bg-amber-500/5'
                    : isSelected ? 'bg-red-600 text-white border-red-600' : 'text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/60 bg-red-500/5';

                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setMindsetBeforeTrade(m.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${colorClass}`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Screenshot / Chart URL */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              TradingView / Chart Screenshot Link
            </label>
            <div className="relative">
              <input
                type="url"
                value={screenshot}
                onChange={(e) => setScreenshot(e.target.value)}
                placeholder="https://www.tradingview.com/x/... or image URL"
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#e50914]"
              />
            </div>
          </div>

          {/* Journal Reflection Notes */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Post-Trade Reflection & Execution Lessons
            </label>
            <textarea
              rows={3}
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="What went well? Did you follow your risk rules? What can be improved on the next execution?"
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#e50914] resize-none"
            />
          </div>

          {/* Bottom Actions */}
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
              <span>{loading ? 'Saving Trade...' : tradeToEdit ? 'Update Trade' : 'Save to Journal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
