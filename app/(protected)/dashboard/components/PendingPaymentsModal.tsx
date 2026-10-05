'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  CreditCard, 
  Phone, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Sparkles, 
  Filter, 
  SlidersHorizontal,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { Project } from '@/lib/types';
import AnimatedCashAmount from '@/components/ui/AnimatedCashAmount';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import dayjs from 'dayjs';

interface PendingPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  projectPaidMap: Record<string, number>;
  rawPayments?: any[];
  onSelectProject?: (p: Project) => void;
}

export default function PendingPaymentsModal({
  isOpen,
  onClose,
  projects,
  projectPaidMap,
  rawPayments = [],
  onSelectProject
}: PendingPaymentsModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Booked' | 'In Progress' | 'Lead'>('all');
  const [sortBy, setSortBy] = useState<'due_desc' | 'due_asc' | 'date_asc' | 'name_asc'>('due_desc');

  // Compute all projects with pending dues
  const pendingData = useMemo(() => {
    return projects
      .map(p => {
        const pId = String(p._id || p.id || '');
        const paidAmount = projectPaidMap[pId] || 0;
        const totalValue = Number(p.totalValue || (p as any).budget || (p as any).amount || 0);
        const dueAmount = Math.max(0, totalValue - paidAmount);
        const percentagePaid = totalValue > 0 ? Math.min(100, Math.round((paidAmount / totalValue) * 100)) : 0;
        
        const clientPhone = p.phone || (p as any).clientPhone || (p as any).client?.phone || '';
        const clientEmail = p.email || (p as any).clientEmail || (p as any).client?.email || '';
        const eventDateStr = p.eventDate || (p as any).date || p.createdAt;

        return {
          project: p,
          id: pId,
          projectNumber: p.projectNumber || 'CASE',
          name: p.name || 'Untitled Case',
          clientName: (p as any).clientName || p.name || 'Client',
          phone: clientPhone,
          email: clientEmail,
          location: p.location || 'Studio',
          eventType: p.eventType || 'Photography',
          status: p.status || 'Active',
          eventDate: eventDateStr,
          totalValue,
          paidAmount,
          dueAmount,
          percentagePaid
        };
      })
      .filter(item => item.dueAmount > 0);
  }, [projects, projectPaidMap]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalDue = pendingData.reduce((acc, curr) => acc + curr.dueAmount, 0);
    const totalContract = pendingData.reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalPaid = pendingData.reduce((acc, curr) => acc + curr.paidAmount, 0);
    const overallPercentage = totalContract > 0 ? Math.round((totalPaid / totalContract) * 100) : 0;
    return {
      totalDue,
      totalContract,
      totalPaid,
      overallPercentage,
      totalClientsWithDue: pendingData.length
    };
  }, [pendingData]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return pendingData
      .filter(item => {
        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'In Progress' && item.status !== 'In Production' && item.status !== 'In Progress') return false;
          if (statusFilter === 'Booked' && item.status !== 'Booked') return false;
          if (statusFilter === 'Lead' && item.status !== 'Lead' && item.status !== 'Qualified') return false;
        }

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.clientName.toLowerCase().includes(q) ||
          item.projectNumber.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.eventType.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'due_desc') return b.dueAmount - a.dueAmount;
        if (sortBy === 'due_asc') return a.dueAmount - b.dueAmount;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'date_asc') {
          const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
          const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
          return dateA - dateB;
        }
        return 0;
      });
  }, [pendingData, searchQuery, statusFilter, sortBy]);

  if (!isOpen) return null;

  const handleCopyPaymentLink = (item: any) => {
    if (typeof window !== 'undefined') {
      const link = `${window.location.origin}/payment`;
      navigator.clipboard.writeText(link);
      toast.success(`Payment link copied for ${item.name}!`);
    }
  };

  const handleSendWhatsAppReminder = (item: any) => {
    const rawPhone = item.phone.replace(/[^0-9]/g, '');
    if (!rawPhone) {
      toast.error('No valid phone number found for this client.');
      return;
    }
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const message = encodeURIComponent(
      `Hello ${item.name},\n\nGreetings from ARJUN FILMS!\n\nThis is a gentle reminder regarding your upcoming shoot for *${item.eventType}* (${item.projectNumber}).\n\n📌 *Total Package:* ₹${item.totalValue.toLocaleString('en-IN')}\n✅ *Amount Received:* ₹${item.paidAmount.toLocaleString('en-IN')}\n⏳ *Remaining Due Balance:* ₹${item.dueAmount.toLocaleString('en-IN')}\n\nYou can easily complete your payment through UPI / Bank Transfer.\nThank you!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#15181e] border border-gray-200 dark:border-gray-800 rounded-[32px] p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow styling */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800/80 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/50 flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[19px] font-black text-gray-900 dark:text-white">
                  Pending Payments & Dues Breakdown
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-rose-500 text-white shadow-xs">
                  {summaryStats.totalClientsWithDue} Clients
                </span>
              </div>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                Overview of outstanding client balances, event dates, and quick reminder actions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KPI Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 relative z-10">
          <div className="bg-gradient-to-br from-rose-50 via-white to-rose-50/40 dark:from-rose-950/30 dark:via-[#1a1e26] dark:to-rose-950/15 p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              Total Pending Due
            </span>
            <div className="mt-1">
              <span className="text-[22px] font-black text-rose-600 dark:text-rose-400">
                ₹{summaryStats.totalDue.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-gray-400 font-medium block mt-0.5">
                Across {summaryStats.totalClientsWithDue} active shoot contracts
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1e26] p-4 rounded-2xl border border-gray-200/70 dark:border-gray-800 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Contract Value
            </span>
            <div className="mt-1">
              <span className="text-[22px] font-black text-gray-900 dark:text-white">
                ₹{summaryStats.totalContract.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-gray-400 font-medium block mt-0.5">
                Total contracted project book value
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:via-[#1a1e26] dark:to-emerald-950/15 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Collected So Far
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                {summaryStats.overallPercentage}% Paid
              </span>
            </div>
            <div className="mt-1">
              <span className="text-[22px] font-black text-emerald-600 dark:text-emerald-400">
                ₹{summaryStats.totalPaid.toLocaleString('en-IN')}
              </span>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${summaryStats.overallPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 relative z-10">
          {/* Search Box */}
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, case ID, phone, venue..."
              className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-[#1a1e26] border border-gray-200/80 dark:border-gray-800 rounded-xl text-[12.5px] font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-[#16181c] transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter & Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status pills */}
            <div className="flex bg-gray-100 dark:bg-[#1a1e26] p-0.5 rounded-xl border border-gray-200/60 dark:border-gray-800 text-[11px] font-bold">
              {(['all', 'Booked', 'In Progress', 'Lead'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-xs font-extrabold'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  {tab === 'all' ? 'All Dues' : tab}
                </button>
              ))}
            </div>

            {/* Sort selection */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-gray-50 dark:bg-[#1a1e26] border border-gray-200/80 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-[11.5px] font-bold py-1.5 px-3 rounded-xl focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="due_desc">Highest Due First</option>
              <option value="due_asc">Lowest Due First</option>
              <option value="date_asc">Nearest Event Date</option>
              <option value="name_asc">Client Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Scrollable Client Dues List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 custom-scrollbar relative z-10">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-[#1a1e26]/40">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">
                {searchQuery ? 'No matching pending dues found' : 'All Dues Cleared!'}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {searchQuery ? 'Try clearing your search terms or filter.' : 'All client projects have been fully paid.'}
              </p>
            </div>
          ) : (
            filteredItems.map(item => {
              const formattedDate = item.eventDate 
                ? dayjs(item.eventDate).format('DD MMM YYYY') 
                : 'Date TBD';

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#181a20] border border-gray-200/80 dark:border-gray-800 hover:border-rose-300 dark:hover:border-rose-800/80 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md group"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    
                    {/* Left: Client & Event Information */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-900/40">
                          {item.projectNumber}
                        </span>
                        <h3 className="text-[15px] font-extrabold text-gray-900 dark:text-white truncate">
                          {item.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {item.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11.5px] text-gray-500 dark:text-gray-400 font-semibold flex-wrap">
                        <span className="text-[#e50914] font-bold">{item.eventType}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {formattedDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate max-w-[180px]">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </span>
                        {item.phone && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                              {item.phone}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Middle: Financial & Progress breakdown */}
                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-100 dark:border-gray-800/80 pt-3 md:pt-0">
                      
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                          Pending Balance
                        </span>
                        <span className="text-[17px] font-black text-rose-600 dark:text-rose-400 block leading-tight">
                          ₹{item.dueAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10.5px] text-gray-400 font-medium block">
                          Paid: ₹{item.paidAmount.toLocaleString('en-IN')} / ₹{item.totalValue.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Progress circle or pill */}
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-gray-800/60">
                          <div 
                            className={`absolute inset-0 opacity-20 ${
                              item.percentagePaid >= 50 ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ height: `${item.percentagePaid}%` }}
                          />
                          <span className="text-[11px] font-black text-gray-800 dark:text-gray-100 relative z-10">
                            {item.percentagePaid}%
                          </span>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Bottom Action strip */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      {item.phone && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppReminder(item)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200/60 transition-all cursor-pointer"
                            title="Send prefilled WhatsApp balance reminder"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp Reminder</span>
                          </button>

                          <a
                            href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-all"
                            title="Call Client"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyPaymentLink(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 px-2 py-1 rounded-lg transition-all cursor-pointer"
                        title="Copy payment portal link"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          router.push(`/projects/${item.id}`);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e50914] hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 px-3 py-1 rounded-lg border border-red-200/60 dark:border-red-900/40 transition-all cursor-pointer"
                      >
                        <span>Open Case</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          router.push(`/payments`);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#e50914] hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Record Pay</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80 pt-3 mt-3 text-xs text-gray-500 relative z-10">
          <span className="font-semibold text-[11.5px]">
            Showing {filteredItems.length} of {pendingData.length} pending client records
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/payments');
              }}
              className="text-[#e50914] font-bold hover:underline cursor-pointer flex items-center gap-1 text-[12px]"
            >
              <span>Manage all transactions</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
