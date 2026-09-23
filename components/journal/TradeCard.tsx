'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Tag, 
  Smile, 
  FileText, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Image as ImageIcon,
  DollarSign
} from 'lucide-react';
import { deleteTrade } from '@/app/actions';
import { toast } from 'sonner';

interface TradeCardProps {
  trade: any;
  onEdit: (trade: any) => void;
  onDeleted?: (tradeId: string) => void;
}

const MARKET_COLORS: Record<string, { badge: string; text: string }> = {
  Forex: { badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20', text: 'Forex' },
  Crypto: { badge: 'bg-purple-500/10 text-purple-600 border-purple-500/20', text: 'Crypto' },
  'Indian Stock': { badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', text: 'NSE / BSE' },
  Binary: { badge: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', text: 'Binary' },
  'US Stock': { badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20', text: 'US Equities' },
};

export default function TradeCard({ trade, onEdit, onDeleted }: TradeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const isProfit = (trade.profitLoss || 0) >= 0;
  const marketInfo = MARKET_COLORS[trade.marketType] || { badge: 'bg-gray-500/10 text-gray-600 border-gray-500/20', text: trade.marketType || 'Trade' };

  const formattedDate = trade.date 
    ? new Date(trade.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Recent';

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete the trade record for ${trade.assetName}?`)) {
      return;
    }

    setDeleting(true);
    try {
      await deleteTrade(trade._id);
      toast.success('Trade deleted successfully');
      if (onDeleted) onDeleted(trade._id);
    } catch (err) {
      console.error('Delete trade error:', err);
      toast.error('Failed to delete trade');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
      isProfit
        ? 'bg-white dark:bg-[#15171c] border-gray-200/90 dark:border-gray-800/80 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/10'
        : 'bg-white dark:bg-[#15171c] border-gray-200/90 dark:border-gray-800/80 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-950/10'
    }`}>
      {/* Top Header Row */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Ticker & Badges */}
        <div className="flex items-start sm:items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
            trade.tradeType === 'BUY'
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-600 border border-red-500/20'
          }`}>
            {trade.tradeType === 'BUY' ? (
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <TrendingDown className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                {trade.assetName}
              </span>

              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${marketInfo.badge}`}>
                {marketInfo.text}
              </span>

              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider ${
                trade.tradeType === 'BUY'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-700 dark:text-red-400'
              }`}>
                {trade.tradeType === 'BUY' ? 'LONG' : 'SHORT'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              {trade.quantity && (
                <span>&bull; Size: {trade.quantity}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Profit / Loss Pill & Quick Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="text-right">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Net Result
            </span>
            <span className={`text-base sm:text-lg font-black tracking-tight ${
              isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isProfit ? '+' : ''}{trade.currency || 'USD'} {Number(trade.profitLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-gray-100 dark:border-gray-800">
            <button
              onClick={() => onEdit(trade)}
              className="p-2 text-gray-400 hover:text-[#e50914] hover:bg-[#fef2f2] dark:hover:bg-red-950/40 rounded-xl transition-all cursor-pointer active:scale-95"
              title="Edit Trade"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Delete Trade"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl transition-all cursor-pointer"
              title={expanded ? "Show less" : "Show details"}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Middle Pills: Setup & Mindset */}
      <div className="px-4 sm:px-5 pb-3 flex flex-wrap items-center gap-2">
        {trade.tradeSetup && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700/60">
            <Tag className="w-3 h-3 text-[#e50914]" />
            <span>{trade.tradeSetup}</span>
          </div>
        )}

        {trade.mindsetBeforeTrade && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
            trade.mindsetBeforeTrade.includes('FOMO') || trade.mindsetBeforeTrade.includes('Revenge') || trade.mindsetBeforeTrade.includes('Greedy')
              ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
          }`}>
            <Smile className="w-3 h-3" />
            <span>Mindset: {trade.mindsetBeforeTrade}</span>
          </div>
        )}

        {trade.screenshot && (
          <button
            onClick={() => setShowImageModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3 h-3" />
            <span>View Chart</span>
          </button>
        )}
      </div>

      {/* Expandable Section: Execution Specs & Journal Reflection Notes */}
      {expanded && (
        <div className="px-4 sm:px-5 py-4 bg-gray-50/70 dark:bg-[#121418]/60 border-t border-gray-100 dark:border-gray-800/80 space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/60">
              <span className="text-gray-400 font-semibold block text-[10px] uppercase">Entry Price</span>
              <span className="font-extrabold text-gray-800 dark:text-white">
                {trade.currency || 'USD'} {Number(trade.entryPrice || 0).toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/60">
              <span className="text-gray-400 font-semibold block text-[10px] uppercase">Exit Price</span>
              <span className="font-extrabold text-gray-800 dark:text-white">
                {trade.currency || 'USD'} {Number(trade.exitPrice || 0).toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/60">
              <span className="text-gray-400 font-semibold block text-[10px] uppercase">Volume / Lots</span>
              <span className="font-extrabold text-gray-800 dark:text-white">
                {trade.quantity || 1}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/60">
              <span className="text-gray-400 font-semibold block text-[10px] uppercase">Execution Strategy</span>
              <span className="font-extrabold text-gray-800 dark:text-white truncate block">
                {trade.tradeSetup || 'Discretionary'}
              </span>
            </div>
          </div>

          {trade.journalText && (
            <div className="p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                <FileText className="w-3.5 h-3.5 text-[#e50914]" />
                <span>Journal Reflection & Key Takeaways</span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic whitespace-pre-wrap">
                &ldquo;{trade.journalText}&rdquo;
              </p>
            </div>
          )}

          {trade.screenshot && (
            <div className="pt-1">
              <a
                href={trade.screenshot}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e50914] hover:underline"
              >
                <span>Open TradingView Chart link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Screenshot Lightbox Modal */}
      {showImageModal && trade.screenshot && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-[#121418] rounded-3xl p-4 border border-gray-800 shadow-2xl overflow-hidden flex flex-col items-center">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full z-10 cursor-pointer"
            >
              ✕
            </button>
            <img
              src={trade.screenshot}
              alt={`${trade.assetName} chart`}
              className="max-h-[75vh] w-auto object-contain rounded-2xl"
              onError={(e) => {
                toast.error('Could not load screenshot preview');
                setShowImageModal(false);
              }}
            />
            <p className="text-xs text-gray-400 font-bold mt-3">
              {trade.assetName} &bull; {trade.tradeType} &bull; {formattedDate}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
