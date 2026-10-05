'use client';

import React, { useEffect, useState } from 'react';
import { Payment } from '@/lib/types';
import { 
  TrendingUp, 
  ArrowUp, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Trash2, 
  Check, 
  Eye, 
  X,
  CreditCard,
  Wallet,
  Calendar,
  CalendarDays,
  CalendarCheck,
  Hourglass,
  BarChart3,
  Receipt,
  Banknote,
  ShieldCheck,
  AlertCircle,
  Flame,
  CheckCheck
} from 'lucide-react';
import dayjs from 'dayjs';
import { verifyPayment, deletePayment, getProjects, getPayments } from '@/app/actions';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import AnimatedCashAmount from '@/components/ui/AnimatedCashAmount';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [paymentToVerify, setPaymentToVerify] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const fetchPaymentsAndProjects = async () => {
    setLoading(true);
    try {
      const [paymentsData, projectsData] = await Promise.all([
        getPayments(),
        getProjects(),
      ]);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load payments or projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsAndProjects();
  }, []);

  const handleVerify = async () => {
    if (!paymentToVerify) return;
    try {
      const res = await verifyPayment(paymentToVerify, selectedProjectId || undefined);
      if (res.success) {
        toast.success('Payment verified successfully!');
        setPaymentToVerify(null);
        setSelectedProjectId('');
        fetchPaymentsAndProjects();
      } else {
        toast.error(res.error || 'Failed to verify payment');
      }
    } catch (e) {
      toast.error('An error occurred during verification');
    }
  };

  const handleDelete = async () => {
    if (!paymentToDelete) return;
    try {
      const res = await deletePayment(paymentToDelete);
      if (res && res.success) {
        toast.success('Payment deleted successfully');
        setPaymentToDelete(null);
        fetchPaymentsAndProjects();
      } else {
        toast.error((res as any)?.error || 'Failed to delete payment');
      }
    } catch (e) {
      toast.error('An error occurred while deleting payment');
    }
  };

  const isPaid = (p: Payment) => p && (p.status === 'Verified' || p.status === 'PAID');
  
  const totalReceived = Array.isArray(payments) ? payments.filter(isPaid).reduce((sum, p) => sum + (p?.amount || 0), 0) : 0;
  const pendingAmount = Array.isArray(payments) ? payments.filter(p => p && (p.status === 'PENDING' || p.status === 'Pending Verification')).reduce((sum, p) => sum + (p?.amount || 0), 0) : 0;
  const todayCollections = Array.isArray(payments) ? payments
    .filter(p => isPaid(p) && p?.date && dayjs(p.date).isValid() && dayjs(p.date).isSame(dayjs(), 'day'))
    .reduce((sum, p) => sum + (p?.amount || 0), 0) : 0;
  const currentMonthStr = dayjs().format('YYYY-MM');
  const thisMonthPaidPayments = Array.isArray(payments) ? payments.filter(p => isPaid(p) && p?.date && (typeof p.date === 'string' ? p.date.substring(0, 7) === currentMonthStr : dayjs(p.date).format('YYYY-MM') === currentMonthStr)) : [];
  const thisMonthCollections = thisMonthPaidPayments.reduce((sum, p) => sum + (p?.amount || 0), 0);
  const pendingCount = Array.isArray(payments) ? payments.filter(p => p && (p.status === 'PENDING' || p.status === 'Pending Verification')).length : 0;
  const todayPaidCount = Array.isArray(payments) ? payments.filter(p => isPaid(p) && p?.date && dayjs(p.date).isValid() && dayjs(p.date).isSame(dayjs(), 'day')).length : 0;

  // Filtered Payments list
  const filteredPayments = (Array.isArray(payments) ? payments : []).filter((p) => {
    if (!p) return false;
    if (statusFilter === 'verified' && !isPaid(p)) return false;
    if (statusFilter === 'pending' && isPaid(p)) return false;
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      (p.customerName && p.customerName.toLowerCase().includes(s)) ||
      (p.phone && p.phone.toLowerCase().includes(s)) ||
      (p.transactionId && p.transactionId.toLowerCase().includes(s)) ||
      (p.paymentMethod && p.paymentMethod.toLowerCase().includes(s)) ||
      (p.status && p.status.toLowerCase().includes(s)) ||
      (p.remarks && p.remarks.toLowerCase().includes(s)) ||
      (p.amount && p.amount.toString().includes(s))
    );
  });

  return (
    <div className="space-y-6 w-full pb-12 font-sans text-gray-800 dark:text-gray-100">
      {/* Bento Grid Statistics - Premium Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Card 1: Total Received */}
        <div 
          onClick={() => setStatusFilter('all')}
          className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-red-500/[0.07] via-white to-red-500/[0.02] dark:from-[#201418] dark:via-[#15181e] dark:to-[#101216] border border-red-500/20 dark:border-red-900/35 hover:border-[#e50914]/60 p-5 shadow-xs hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500/15 dark:bg-red-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-red-500/30 transition-all" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] animate-pulse" />
                <span className="text-[10.5px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Total Received
                </span>
              </div>
              <div className="mt-2 text-[28px] font-black text-gray-900 dark:text-white leading-none tracking-tight">
                <AnimatedCashAmount amount={totalReceived} sparkle={true} showSparkleBadge={true} />
              </div>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#e50914] to-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-3 border-t border-red-100/60 dark:border-red-950/60 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400 font-bold">
              Verified Revenue
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#e50914] bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200/60 dark:border-red-900/50">
              <CheckCheck className="w-3 h-3" />
              Active Inflow
            </span>
          </div>
        </div>

        {/* Card 2: Pending Collections */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-amber-500/[0.07] via-white to-amber-500/[0.02] dark:from-[#201b12] dark:via-[#15181e] dark:to-[#101216] border p-5 shadow-xs hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
            statusFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-500/20 dark:border-amber-900/35 hover:border-amber-500/60'
          }`}
        >
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/15 dark:bg-amber-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/30 transition-all" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10.5px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Pending Collections
                </span>
              </div>
              <div className="mt-2 text-[28px] font-black text-amber-600 dark:text-amber-400 leading-none tracking-tight">
                <AnimatedCashAmount amount={pendingAmount} />
              </div>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Hourglass className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-3 border-t border-amber-100/60 dark:border-amber-950/60 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400 font-bold">
              {pendingCount} awaiting verification
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/50">
              <AlertCircle className="w-3 h-3" />
              Unverified
            </span>
          </div>
        </div>

        {/* Card 3: Today's Collection */}
        <div 
          onClick={() => {}}
          className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-emerald-500/[0.07] via-white to-emerald-500/[0.02] dark:from-[#132018] dark:via-[#15181e] dark:to-[#101216] border border-emerald-500/20 dark:border-emerald-900/35 hover:border-emerald-500/60 p-5 shadow-xs hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/30 transition-all" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10.5px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Today's Collection
                </span>
              </div>
              <div className="mt-2 text-[28px] font-black text-emerald-600 dark:text-emerald-400 leading-none tracking-tight">
                <AnimatedCashAmount amount={todayCollections} />
              </div>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-3 border-t border-emerald-100/60 dark:border-emerald-950/60 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400 font-bold">
              {todayPaidCount} payments processed
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/50">
              <CheckCircle2 className="w-3 h-3" />
              Settled
            </span>
          </div>
        </div>

        {/* Card 4: This Month */}
        <div 
          onClick={() => {}}
          className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-blue-500/[0.07] via-white to-blue-500/[0.02] dark:from-[#141b24] dark:via-[#15181e] dark:to-[#101216] border border-blue-500/20 dark:border-blue-900/35 hover:border-blue-500/60 p-5 shadow-xs hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/15 dark:bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/30 transition-all" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10.5px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  This Month
                </span>
              </div>
              <div className="mt-2 text-[28px] font-black text-blue-600 dark:text-blue-400 leading-none tracking-tight">
                <AnimatedCashAmount amount={thisMonthCollections} />
              </div>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-3 border-t border-blue-100/60 dark:border-blue-950/60 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400 font-bold">
              100% active collection
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900/50">
              <TrendingUp className="w-3 h-3" />
              Monthly
            </span>
          </div>
        </div>

      </div>

      {/* Search & Status Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 dark:bg-[#15181e] p-4 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-xs">
        {/* Search Field */}
        <div className="flex-1 w-full sm:max-w-md flex items-center px-4 py-2.5 bg-[#fdf6f6] dark:bg-gray-800/50 rounded-2xl border border-[#fee2e2] dark:border-gray-700/60 focus-within:bg-white dark:focus-within:bg-[#15181e] focus-within:border-[#e50914]/50 transition-all shadow-xs">
          <Search className="text-gray-400 w-4 h-4 mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payments by client, method, UTR, amount..."
            className="bg-transparent border-none focus:outline-none text-[13px] font-semibold w-full placeholder:text-gray-400 text-gray-800 dark:text-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-gray-200/60 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0 cursor-pointer"
              title="Clear Search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'verified', label: 'Verified Paid' },
            { id: 'pending', label: 'Awaiting Verification' },
          ].map((s) => {
            const isActive = statusFilter === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatusFilter(s.id as any)}
                className={`px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#e50914] text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card rounded-[28px] overflow-hidden bg-white dark:bg-[#15181e] border border-gray-200/50 dark:border-gray-800 shadow-sm">
        {loading ? (
          <div className="p-8 flex justify-center text-[#e50914] font-bold">Loading transactions...</div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead className="bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-150 dark:border-gray-800">
                <tr className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Transaction Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-semibold">
                      {searchQuery ? `No transactions match "${searchQuery}"` : 'No payment records found.'}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment, pIdx) => {
                    const paymentId = payment.id || (payment as any)._id || `pmt-${pIdx}`;
                    return (
                      <tr key={paymentId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-800 dark:text-white">{payment.customerName || 'Anonymous Client'}</p>
                            <p className="text-[11px] text-gray-400 font-semibold">{payment.phone || ''}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px] font-bold">
                            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                            {payment.paymentMethod || 'UPI QR'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-gray-900 dark:text-white text-right">
                          <AnimatedCashAmount amount={payment.amount || 0} />
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">
                          {payment.date && dayjs(payment.date).isValid() ? dayjs(payment.date).format('DD MMM YYYY, hh:mm A') : 'Recently'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${isPaid(payment) ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60'}`}>
                            {payment.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {payment.screenshotUrl && (
                              <button 
                                onClick={() => setSelectedScreenshot(payment.screenshotUrl)}
                                className="p-2 text-gray-400 hover:text-[#e50914] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                                title="View Screenshot Proof"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            
                            {!isPaid(payment) && (
                              <button 
                                onClick={() => setPaymentToVerify(paymentId)}
                                className="px-3 py-1 bg-[#e50914] hover:bg-red-700 text-white text-[11px] font-bold rounded-lg shadow-sm cursor-pointer"
                              >
                                Verify
                              </button>
                            )}

                            <button 
                              onClick={() => setPaymentToDelete(paymentId)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Delete Payment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Screenshot Lightbox Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedScreenshot(null)} />
          <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col items-center">
            <button 
              onClick={() => setSelectedScreenshot(null)}
              className="absolute right-4 top-4 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-[400px] flex items-center justify-center overflow-hidden border border-gray-100 rounded-xl mt-8">
              <img src={selectedScreenshot} alt="Payment Proof" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Verify Payment Dialog */}
      {paymentToVerify && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPaymentToVerify(null)} />
          <div className="relative max-w-md w-full bg-white border border-gray-200 rounded-3xl p-6 space-y-4 shadow-2xl text-[13px]">
            <h3 className="text-base font-bold text-gray-800">Verify Payment</h3>
            <p className="text-gray-500 font-semibold">Link this payment to an active case record (Optional):</p>
            
            <select 
              value={selectedProjectId} 
              onChange={e => setSelectedProjectId(e.target.value)}
              className="w-full bg-transparent border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#e50914] cursor-pointer"
            >
              <option value="">Do not link to project</option>
              {projects.map((p, pIdx) => {
                const projId = p._id || p.id || `proj-select-${pIdx}`;
                return (
                  <option key={projId} value={projId}>
                    {p.projectNumber || 'PRJ'} - {p.name || 'Untitled Case'}
                  </option>
                );
              })}
            </select>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => { setPaymentToVerify(null); setSelectedProjectId(''); }}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-150 transition-colors cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleVerify}
                className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer font-bold shadow-md"
              >
                Confirm Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to remove this payment record from the ledger? This action cannot be undone."
        confirmText="Yes, Delete"
        isDestructive={true}
      />
    </div>
  );
}
