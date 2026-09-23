'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X, 
  CheckCircle2, 
  XCircle, 
  Percent, 
  Award, 
  Flame,
  Layers
} from 'lucide-react';
import TradeCard from './TradeCard';

interface MonthlyCalendarProps {
  trades: any[];
  currencyMode?: 'USD' | 'INR';
  usdRate?: number;
  onAddTradeForDate?: (dateString: string) => void;
  onEditTrade?: (trade: any) => void;
  onTradeDeleted?: (tradeId: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthlyCalendar({
  trades,
  currencyMode = 'USD',
  usdRate = 86.5,
  onAddTradeForDate,
  onEditTrade,
  onTradeDeleted
}: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState<{ dayStr: string; trades: any[] } | null>(null);

  const currencySymbol = currencyMode === 'INR' ? '₹' : '$';

  const convertVal = (valInUSD: number) => {
    if (currencyMode === 'INR') return valInUSD * usdRate;
    return valInUSD;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Group trades by date string YYYY-MM-DD
  const tradesByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    trades.forEach((trade) => {
      if (!trade.date) return;
      try {
        const d = new Date(trade.date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${day}`;

        if (!map[key]) map[key] = [];
        map[key].push(trade);
      } catch (e) {
        // ignore invalid date
      }
    });
    return map;
  }, [trades]);

  // Generate calendar grid for current year & month
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{
      dayNumber: number | null;
      dateKey: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      trades: any[];
      dailyPnL: number;
      winCount: number;
      lossCount: number;
    }> = [];

    // Preceding empty/padding slots
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({
        dayNumber: null,
        dateKey: `pad-${i}`,
        isCurrentMonth: false,
        isToday: false,
        trades: [],
        dailyPnL: 0,
        winCount: 0,
        lossCount: 0,
      });
    }

    const todayStr = (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    })();

    // Actual days of the month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTrades = tradesByDate[dayStr] || [];
      
      let pnl = 0;
      let wins = 0;
      let losses = 0;

      dayTrades.forEach((t) => {
        const rawPnl = Number(t.profitLoss) || 0;
        const val = convertVal(rawPnl);
        pnl += val;
        if (val > 0) wins++;
        else if (val < 0) losses++;
      });

      cells.push({
        dayNumber: d,
        dateKey: dayStr,
        isCurrentMonth: true,
        isToday: dayStr === todayStr,
        trades: dayTrades,
        dailyPnL: pnl,
        winCount: wins,
        lossCount: losses,
      });
    }

    return cells;
  }, [year, month, tradesByDate, currencyMode, usdRate]);

  // Current Month Performance Stats
  const monthStats = useMemo(() => {
    let totalPnL = 0;
    let totalTradesCount = 0;
    let winCount = 0;
    let lossCount = 0;
    let totalGains = 0;
    let totalLosses = 0;
    let greenDays = 0;
    let redDays = 0;
    let bestDayPnL = 0;
    let worstDayPnL = 0;

    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTrades = tradesByDate[dayStr] || [];

      if (dayTrades.length > 0) {
        let dayPnL = 0;
        dayTrades.forEach((t) => {
          const rawPnl = Number(t.profitLoss) || 0;
          const val = convertVal(rawPnl);
          dayPnL += val;
          totalTradesCount++;
          if (val > 0) {
            winCount++;
            totalGains += val;
          } else if (val < 0) {
            lossCount++;
            totalLosses += Math.abs(val);
          }
        });

        totalPnL += dayPnL;
        if (dayPnL > 0) {
          greenDays++;
          if (dayPnL > bestDayPnL) bestDayPnL = dayPnL;
        } else if (dayPnL < 0) {
          redDays++;
          if (dayPnL < worstDayPnL) worstDayPnL = dayPnL;
        }
      }
    }

    const winRate = totalTradesCount > 0 ? (winCount / totalTradesCount) * 100 : 0;
    const profitFactor = totalLosses > 0 ? totalGains / totalLosses : totalGains > 0 ? totalGains : 0;

    return {
      totalPnL,
      totalTradesCount,
      winCount,
      lossCount,
      winRate,
      profitFactor,
      greenDays,
      redDays,
      bestDayPnL,
      worstDayPnL,
    };
  }, [year, month, tradesByDate, currencyMode, usdRate]);

  const handleCellClick = (cell: any) => {
    if (!cell.isCurrentMonth) return;
    setSelectedDayTrades({
      dayStr: cell.dateKey,
      trades: cell.trades,
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Controls Bar & Month KPI summary */}
      <div className="w-full p-5 md:p-6 rounded-3xl bg-white dark:bg-[#15171c] border border-gray-200/90 dark:border-gray-800/90 shadow-sm space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-[#e50914] flex items-center justify-center border border-red-500/20 shadow-xs">
              <CalendarIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {MONTH_NAMES[month]} {year}
              </h2>
              <p className="text-xs text-gray-400 font-bold">
                Daily P&L Performance & Heatmap Calendar
              </p>
            </div>
          </div>

          {/* Month Switcher Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            >
              Current Month
            </button>
            <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 rounded-xl p-1 border border-gray-200 dark:border-gray-700/60">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Month High-Level KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {/* Total P&L */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
              Monthly Net P&L
            </span>
            <span className={`text-sm sm:text-base font-black truncate block ${
              monthStats.totalPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {monthStats.totalPnL >= 0 ? '+' : ''}{currencySymbol}{monthStats.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Win Rate */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
              Win Rate %
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                {monthStats.winRate.toFixed(1)}%
              </span>
              <span className="text-[10px] font-bold text-gray-400">
                ({monthStats.winCount}W/{monthStats.lossCount}L)
              </span>
            </div>
          </div>

          {/* Profit Factor */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
              Profit Factor
            </span>
            <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
              {monthStats.profitFactor.toFixed(2)}x
            </span>
          </div>

          {/* Green vs Red Days */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
              Green / Red Days
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-600">
                {monthStats.greenDays}G
              </span>
              <span className="text-xs font-black text-red-600">
                {monthStats.redDays}R
              </span>
            </div>
          </div>

          {/* Best Day */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
              Best Day
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-600 truncate block">
              +{currencySymbol}{monthStats.bestDayPnL.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Total Trades Logged */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121418]/80 border border-gray-200/70 dark:border-gray-800/70">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
              Trades Taken
            </span>
            <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
              {monthStats.totalTradesCount} Trades
            </span>
          </div>
        </div>

        {/* Heatmap Grid with Responsive Scroll Container */}
        <div className="w-full overflow-x-auto custom-scrollbar pb-1">
          <div className="w-full min-w-[500px] sm:min-w-0">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-2.5 mb-2 text-center text-xs font-black uppercase tracking-wider text-gray-400">
              {WEEK_DAYS.map((w, idx) => (
                <div key={w} className={`py-1 ${idx === 0 || idx === 6 ? 'text-gray-300 dark:text-gray-600' : ''}`}>
                  {w}
                </div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-2.5">
              {calendarCells.map((cell) => {
                if (!cell.dayNumber) {
                  return (
                    <div
                      key={cell.dateKey}
                      className="min-h-[80px] sm:min-h-[95px] md:min-h-[105px] rounded-2xl bg-gray-50/30 dark:bg-gray-900/20 border border-dashed border-gray-200/40 dark:border-gray-800/40 opacity-40 pointer-events-none"
                    />
                  );
                }

                const hasTrades = cell.trades.length > 0;
                const isProfit = cell.dailyPnL > 0;
                const isLoss = cell.dailyPnL < 0;

                return (
                  <div
                    key={cell.dateKey}
                    onClick={() => handleCellClick(cell)}
                    className={`min-h-[85px] sm:min-h-[100px] md:min-h-[115px] rounded-2xl p-2 sm:p-2.5 md:p-3 flex flex-col justify-between transition-all cursor-pointer relative group border ${
                      cell.isToday ? 'ring-2 ring-[#e50914] shadow-md shadow-red-500/15' : ''
                    } ${
                      hasTrades
                        ? isProfit
                          ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-500 hover:shadow-md hover:scale-[1.01]'
                          : isLoss
                          ? 'bg-red-500/10 dark:bg-red-950/30 border-red-500/30 hover:border-red-500 hover:shadow-md hover:scale-[1.01]'
                          : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                        : 'bg-gray-50/60 dark:bg-[#121418]/60 border-gray-200/60 dark:border-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-[#181a20]'
                    }`}
                  >
                    {/* Top corner: Day Number & Today indicator */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${
                        cell.isToday
                          ? 'bg-[#e50914] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {cell.dayNumber}
                      </span>

                      {hasTrades && (
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">
                          {cell.trades.length} {cell.trades.length === 1 ? 'trade' : 'trades'}
                        </span>
                      )}
                    </div>

                    {/* Center / Bottom: Daily P&L Badge */}
                    {hasTrades ? (
                      <div className="my-auto text-center py-1">
                        <span className={`text-xs sm:text-sm font-black tracking-tight block ${
                          isProfit 
                            ? 'text-emerald-700 dark:text-emerald-400' 
                            : isLoss 
                            ? 'text-red-700 dark:text-red-400' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {isProfit ? '+' : ''}{currencySymbol}{cell.dailyPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-gray-400 mt-0.5">
                          <span className="text-emerald-600">{cell.winCount}W</span>
                          <span>/</span>
                          <span className="text-red-600">{cell.lossCount}L</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-[10px] text-gray-400/60 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Click to view</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Day Execution Details Modal */}
      {selectedDayTrades && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedDayTrades(null)}
        >
          <div 
            className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#15171c] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#121418]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-[#e50914] flex items-center justify-center border border-red-500/20">
                  <CalendarIcon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {new Date(selectedDayTrades.dayStr).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold">
                    {selectedDayTrades.trades.length} {selectedDayTrades.trades.length === 1 ? 'Trade Recorded' : 'Trades Recorded'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onAddTradeForDate && (
                  <button
                    onClick={() => {
                      const dateStr = selectedDayTrades.dayStr;
                      setSelectedDayTrades(null);
                      onAddTradeForDate(dateStr);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#e50914] to-red-600 text-white text-xs font-black shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Log Trade</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedDayTrades(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {selectedDayTrades.trades.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    No trades recorded for this day
                  </p>
                  <p className="text-xs text-gray-400">
                    Resting and waiting for high-probability setups is part of the discipline.
                  </p>
                  {onAddTradeForDate && (
                    <button
                      onClick={() => {
                        const dateStr = selectedDayTrades.dayStr;
                        setSelectedDayTrades(null);
                        onAddTradeForDate(dateStr);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e50914] text-white text-xs font-black shadow-md cursor-pointer hover:bg-red-700 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Log Trade for this Date</span>
                    </button>
                  )}
                </div>
              ) : (
                selectedDayTrades.trades.map((t) => (
                  <TradeCard
                    key={t._id}
                    trade={t}
                    onEdit={(trade) => {
                      setSelectedDayTrades(null);
                      if (onEditTrade) onEditTrade(trade);
                    }}
                    onDeleted={(id) => {
                      setSelectedDayTrades((prev) => prev ? {
                        ...prev,
                        trades: prev.trades.filter((x) => x._id !== id)
                      } : null);
                      if (onTradeDeleted) onTradeDeleted(id);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
