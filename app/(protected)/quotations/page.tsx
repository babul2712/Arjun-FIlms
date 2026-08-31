'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, FileText, Edit2, Trash2, Calendar, MapPin, Sparkles } from 'lucide-react';
import { getQuotations, deleteQuotation } from '@/app/actions';
import { Quotation } from '@/lib/types';
import dayjs from 'dayjs';
import Link from 'next/link';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { useRouter } from 'next/navigation';
import QuotationTemplateDrawer from './components/QuotationTemplateDrawer';

export default function QuotationsDashboardPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(null);
  const [showTemplateDrawer, setShowTemplateDrawer] = useState(false);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const data = await getQuotations();
      setQuotations(data);
    } catch (e) {
      console.error('Failed to fetch quotations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleDelete = async () => {
    if (!quotationToDelete) return;
    try {
      await deleteQuotation(quotationToDelete);
      toast.success('Quotation deleted successfully!');
      setQuotationToDelete(null);
      fetchQuotations();
    } catch (e) {
      toast.error('Failed to delete quotation');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-gray-800">
      {/* Header section */}
      <div className="flex justify-between items-center bg-white/40 p-4 rounded-3xl border border-white/40 backdrop-blur-md">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0066fe]" />
            Quotations
          </h2>
          <p className="text-[12px] text-gray-400 font-semibold mt-0.5">Manage and view all your generated client proposals and packages.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowTemplateDrawer(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-[#16181c] text-gray-700 dark:text-gray-200 border border-gray-250/60 dark:border-gray-800 rounded-xl text-[13px] font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-[#0066fe]" />
            Customize Template
          </button>
          <button 
            onClick={() => router.push('/quotations/create')}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0066fe] text-white rounded-xl text-[13px] font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Quotation
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-[24px] h-[200px] bg-white/50" />
          ))}
        </div>
      ) : quotations.length === 0 ? (
        <div className="glass-card rounded-[24px] p-12 text-center max-w-md mx-auto space-y-4">
          <FileText className="w-12 h-12 mx-auto text-gray-300 stroke-1" />
          <h3 className="text-[16px] font-bold text-gray-700">No quotations found</h3>
          <p className="text-[13px] text-gray-400 font-medium">Create client proposals to record and track project quotes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotations.map((quotation) => (
            <div key={quotation._id || quotation.id} className="glass-card rounded-[24px] p-6 bg-white border border-gray-200/50 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[15px] font-extrabold text-gray-800 leading-none">{quotation.customerName}</h4>
                    <p className="text-[11px] text-gray-400 font-semibold mt-1.5">{quotation.email}</p>
                  </div>
                  <span className="text-[15px] font-extrabold text-gray-900">
                    ₹{(quotation.grandTotal || 0).toLocaleString()}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-[12px] text-gray-500 font-semibold border-t border-gray-50 pt-4">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    {quotation.bookingDate ? dayjs(quotation.bookingDate).format('DD MMM YYYY') : dayjs(quotation.createdAt).format('DD MMM YYYY')}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    {quotation.location}
                  </p>
                  <p className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide bg-[#eaf2ff] text-[#0263e0] mt-2">
                    {quotation.eventType}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-50 pt-4 mt-4">
                <button 
                  onClick={() => router.push(`/quotations/edit/${quotation._id || quotation.id}`)}
                  className="p-2 text-gray-400 hover:text-[#0066fe] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Proposal"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setQuotationToDelete(quotation._id || quotation.id || '')}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove Proposal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!quotationToDelete}
        onClose={() => setQuotationToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Proposal"
        message="Are you sure you want to delete this quotation? This action cannot be undone."
        confirmText="Yes, Delete"
        isDestructive={true}
      />

      {/* Quotation Template Customization Drawer */}
      <QuotationTemplateDrawer
        isOpen={showTemplateDrawer}
        onClose={() => setShowTemplateDrawer(false)}
      />
    </div>
  );
}
