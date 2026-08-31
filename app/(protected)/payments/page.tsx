'use client';

import React, { useEffect, useState } from 'react';
import { getPayments } from '@/services/api';
import { Payment } from '@/lib/types';
import { 
  Search, 
  ChevronDown,
  TrendingUp,
  CheckCircle2,
  ArrowUp,
  Eye,
  X,
  Trash2
} from 'lucide-react';
import dayjs from 'dayjs';
import { verifyPayment, deletePayment, getProjects } from '@/app/actions';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
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
        getProjects()
      ]);
      setPayments(paymentsData);
      setProjects(projectsData);
    } catch (e) {
      toast.error('Failed to load payments data');
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
      await verifyPayment(paymentToVerify, selectedProjectId || undefined);
      toast.success('Payment verified successfully!');
      setPaymentToVerify(null);
      setSelectedProjectId('');
      fetchPaymentsAndProjects();
    } catch (e) {
      toast.error('Failed to verify payment');
    }
  };

  const handleDelete = async () => {
    if (!paymentToDelete) return;
    try {
      await deletePayment(paymentToDelete);
      toast.success('Payment deleted successfully!');
      setPaymentToDelete(null);
      fetchPaymentsAndProjects();
    } catch (e) {
      toast.error('Failed to delete payment');
    }
  };

  const isPaid = (p: Payment) => p && (p.status === 'PAID' || p.status === 'Verified');
  
  const totalReceived = Array.isArray(payments) ? payments.filter(isPaid).reduce((sum, p) => sum + (p?.amount || 0), 0) : 0;
  const pendingAmount = Array.isArray(payments) ? payments.filter(p => p && (p.status === 'PENDING' || p.status === 'Pending Verification')).reduce((sum, p) => sum + (p?.amount || 0), 0) : 0;
  const todayCollections = Array.isArray(payments) ? payments
    .filter(p => isPaid(p) && p?.date && dayjs(p.date).isValid() && dayjs(p.date).isSame(dayjs(), 'day'))
    .reduce((sum, p) => sum + (p?.amount || 0), 0) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-gray-800">
      {/* Bento Grid Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Received */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36 bg-white border border-gray-200/50 shadow-sm">
          <div>
            <span className="text-gray-400 text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              Total Received
              <TrendingUp className="text-[#e50914] w-4 h-4" />
            </span>
            <div className="mt-2 text-[26px] font-extrabold text-gray-900 tracking-tight">₹{totalReceived.toLocaleString()}</div>
          </div>
        </div>

        {/* Pending */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36 bg-white border border-gray-200/50 shadow-sm">
          <div>
            <span className="text-gray-400 text-[12px] font-bold uppercase tracking-wider block">Pending Collections</span>
            <div className="mt-2 text-[26px] font-extrabold text-gray-900 tracking-tight">₹{pendingAmount.toLocaleString()}</div>
          </div>
          <div className="text-[11px] text-gray-400 font-semibold">
            {Array.isArray(payments) ? payments.filter(p => p && (p.status === 'PENDING' || p.status === 'Pending Verification')).length : 0} awaiting verification
          </div>
        </div>

        {/* Today */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36 bg-white border border-gray-200/50 shadow-sm">
          <div>
            <span className="text-gray-400 text-[12px] font-bold uppercase tracking-wider">Today's Collection</span>
            <div className="mt-2 text-[26px] font-extrabold text-gray-900 tracking-tight">₹{todayCollections.toLocaleString()}</div>
          </div>
          <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            {Array.isArray(payments) ? payments.filter(p => isPaid(p) && p?.date && dayjs(p.date).isValid() && dayjs(p.date).isSame(dayjs(), 'day')).length : 0} payments processed
          </div>
        </div>

        {/* Month */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36 bg-white border border-gray-200/50 shadow-sm">
          <div>
            <span className="text-gray-400 text-[12px] font-bold uppercase tracking-wider">This Month</span>
            <div className="mt-2 text-[26px] font-extrabold text-gray-900 tracking-tight">₹{totalReceived.toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-1 text-green-600 text-[11px] font-bold uppercase">
            <ArrowUp className="w-3.5 h-3.5" />
            100% active collection
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card rounded-[24px] overflow-hidden bg-white border border-gray-200/50">
        {loading ? (
          <div className="p-8 flex justify-center text-[#e50914] font-bold">Loading transactions...</div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Transaction Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.isArray(payments) && payments.map((payment, pIdx) => {
                  const paymentId = payment.id || (payment as any)._id || `pmt-${pIdx}`;
                  return (
                    <tr key={paymentId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-800">{payment.customerName || 'Anonymous Client'}</p>
                          <p className="text-[11px] text-gray-400 font-semibold">{payment.phone || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-600">{payment.paymentMethod || 'UPI QR'}</td>
                      <td className="px-6 py-4 font-extrabold text-gray-900 text-right">₹{(payment.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold text-gray-500">
                        {payment.date && dayjs(payment.date).isValid() ? dayjs(payment.date).format('DD MMM YYYY, hh:mm A') : 'Recently'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${isPaid(payment) ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                          {payment.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {payment.screenshotUrl && (
                            <button 
                              onClick={() => setSelectedScreenshot(payment.screenshotUrl)}
                              className="p-2 text-gray-400 hover:text-[#e50914] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Payment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-semibold">
                      No payment records found.
                    </td>
                  </tr>
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
