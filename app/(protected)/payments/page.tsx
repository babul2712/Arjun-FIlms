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
  CreditCard 
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-gray-800 dark:text-gray-100">
      {/* Bento Grid Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Received */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-36 bg-white dark:bg-[#15181e] border border-gray-200/50 dark:border-gray-800 shadow-sm">
          <div>
            <span className="text-gray-400 text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              Total Received
              <TrendingUp className="text-[#e50914] w-4 h-4" />
            </span>
            <div className="mt-2 text-[26px] font-extrabold text-gray-900 dark:text-white tracking-tight">
              <AnimatedCashAmount amount={totalReceived} sparkle={true} showSparkleBadge={true} />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-36 bg-white dark:bg-[#15181e] border border-gray-200/50 dark:border-gray-800 shadow-sm">
          <div>
            <span className="text-gray-400 text-[12px] font-bold uppercase tracking-wider block">Pending Collections</span>
            <div className="mt-2 text-[26px] font-extrabold text-gray-900 dark:text-white tracking-tight">
              <AnimatedCashAmount amount={pendingAmount} />
            </div>
          </div>
          <div className="text-[11px] text-gray-400 font-semibold">
            {Array.isArray(payments) ? payments.filter(p => p && (p.status === 'PENDING' || p.status === 'Pending Verification')).length : 0} awaiting verification
          </div>
        </div>

        {/* Today */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-36 bg-white dark:bg-[#15181e] border border-gray-200/50 dark:border-gray-800 shadow-sm">
          <div>
            <span className="text-gray-400 text-[12px] font-bold uppercase tracking-wider">Today's Collection</span>
            <div className="mt-2 text-[26px] font-extrabold text-gray-900 dark:text-white tracking-tight">
              <AnimatedCashAmount amount={todayCollections} />
            </div>
          </div>
          <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            {Array.isArray(payments) ? payments.filter(p => isPaid(p) && p?.date && dayjs(p.date).isValid() && dayjs(p.date).isSame(dayjs(), 'day')).length : 0} payments processed
          </div>
        </div>

        {/* Month */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-36 bg-white dark:bg-[#15181e] border border-gray-200/50 dark:border-gray-800 shadow-sm">
          <div>
            <span className="text-gray-400 text-[12px] font-bold uppercase tracking-wider">This Month</span>
            <div className="mt-2 text-[26px] font-extrabold text-gray-900 dark:text-white tracking-tight">
              <AnimatedCashAmount amount={totalReceived} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600 text-[11px] font-bold uppercase">
            <ArrowUp className="w-3.5 h-3.5" />
            100% active collection
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
