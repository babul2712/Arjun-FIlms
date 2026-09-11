'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, FileText, Edit2, Trash2, Calendar, MapPin, Sparkles, X, LayoutGrid, List } from 'lucide-react';
import { getQuotations, deleteQuotation } from '@/app/actions';
import { Quotation } from '@/lib/types';
import dayjs from 'dayjs';
import Link from 'next/link';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { useRouter } from 'next/navigation';
import QuotationTemplateDrawer from './components/QuotationTemplateDrawer';
import AnimatedCashAmount from '@/components/ui/AnimatedCashAmount';

export default function QuotationsDashboardPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  // Filtered quotations
  const filteredQuotations = quotations.filter((q) => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      (q.customerName && q.customerName.toLowerCase().includes(s)) ||
      (q.email && q.email.toLowerCase().includes(s)) ||
      (q.phone && q.phone.toLowerCase().includes(s)) ||
      (q.location && q.location.toLowerCase().includes(s)) ||
      (q.eventType && q.eventType.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 w-full pb-12 font-sans text-gray-800 dark:text-gray-100">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 dark:bg-[#15181e] p-5 rounded-[32px] border border-gray-200/60 dark:border-gray-800 backdrop-blur-md shadow-xs">
        <div>
          <h2 className="text-[19px] font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#e50914]" />
            Quotations & Estimates
          </h2>
          <p className="text-[12px] text-gray-400 font-semibold mt-0.5">Manage and view all your generated client proposals and packages.</p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="flex-1 md:flex-none flex items-center px-4 py-2.5 bg-[#fdf6f6] dark:bg-gray-800/50 rounded-2xl border border-[#fee2e2] dark:border-gray-700/60 w-full sm:w-64 focus-within:bg-white dark:focus-within:bg-[#15181e] focus-within:border-[#e50914]/50 transition-all shadow-xs">
            <Search className="text-gray-400 w-4 h-4 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotes, clients..."
              className="bg-transparent border-none focus:outline-none text-[13px] font-semibold w-full placeholder:text-gray-400 text-gray-800 dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-gray-200/60 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 transition-colors shrink-0 cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#fdf6f6] dark:bg-gray-800/50 p-1 rounded-2xl border border-[#fee2e2] dark:border-gray-700/60 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-extrabold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-[#e50914] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-extrabold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-[#e50914] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              title="Compact List / Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button 
            onClick={() => setShowTemplateDrawer(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl text-[13px] font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-[#e50914]" />
            Templates
          </button>
          <button 
            onClick={() => router.push('/quotations/create')}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#e50914] text-white rounded-xl text-[13px] font-bold hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Quotation
          </button>
        </div>
      </div>

      {/* Main Content (Grid or List View) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card rounded-[24px] h-[200px] bg-white/50 dark:bg-gray-800/40" />
          ))}
        </div>
      ) : filteredQuotations.length === 0 ? (
        <div className="glass-card rounded-[28px] p-12 text-center max-w-md mx-auto space-y-4 bg-white dark:bg-[#15181e] border border-gray-200/50 dark:border-gray-800 shadow-sm">
          <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 stroke-1" />
          <h3 className="text-[16px] font-bold text-gray-700 dark:text-gray-200">
            {searchQuery ? `No quotations found for "${searchQuery}"` : 'No quotations found'}
          </h3>
          <p className="text-[13px] text-gray-400 font-medium">
            {searchQuery ? 'Try searching by a different name, event type or email.' : 'Create client proposals to record and track project quotes.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredQuotations.map((quotation) => (
            <div key={quotation._id || quotation.id} className="glass-card rounded-[24px] p-6 bg-white dark:bg-[#15181e] border border-gray-200/50 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[15px] font-extrabold text-gray-800 dark:text-white leading-none">{quotation.customerName}</h4>
                    <p className="text-[11px] text-gray-400 font-semibold mt-1.5">{quotation.email}</p>
                  </div>
                  <span className="text-[15px] font-extrabold text-gray-900 dark:text-white">
                    <AnimatedCashAmount amount={Number(quotation.grandTotal || 0)} />
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-[12px] text-gray-500 dark:text-gray-400 font-semibold border-t border-gray-50 dark:border-gray-800/60 pt-4">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    {quotation.bookingDate ? dayjs(quotation.bookingDate).format('DD MMM YYYY') : dayjs(quotation.createdAt).format('DD MMM YYYY')}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    {quotation.location}
                  </p>
                  <p className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide bg-[#fef2f2] dark:bg-red-950/40 text-[#e50914] dark:text-red-400 mt-2">
                    {quotation.eventType}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-50 dark:border-gray-800/60 pt-4 mt-4">
                <button 
                  onClick={() => router.push(`/quotations/edit/${quotation._id || quotation.id}`)}
                  className="p-2 text-gray-400 hover:text-[#e50914] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  title="Edit Proposal"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setQuotationToDelete(quotation._id || quotation.id || '')}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                  title="Remove Proposal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredQuotations.map((quotation) => (
            <div
              key={quotation._id || quotation.id}
              className="w-full bg-white/85 dark:bg-[#15181e] border border-gray-200/70 dark:border-gray-800/70 hover:border-[#e50914]/40 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-white dark:hover:bg-[#1a1e24]"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e50914] border border-red-100 dark:border-red-900/40 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[14.5px] font-extrabold text-gray-900 dark:text-white truncate">{quotation.customerName}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5 font-semibold">
                    <span className="text-[#e50914] font-bold">{quotation.eventType || 'Photography'}</span>
                    <span>•</span>
                    <span className="truncate">{quotation.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600 dark:text-gray-300 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{quotation.bookingDate ? dayjs(quotation.bookingDate).format('DD MMM YYYY') : dayjs(quotation.createdAt).format('DD MMM YYYY')}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 dark:text-gray-400 max-w-[150px] truncate shrink-0">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{quotation.location || 'Studio'}</span>
              </div>

              <div className="flex flex-col items-start md:items-end shrink-0">
                <span className="text-[14px] font-black text-[#e50914] dark:text-[#8efa1d]">
                  <AnimatedCashAmount amount={Number(quotation.grandTotal || 0)} />
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Proposal Total</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => router.push(`/quotations/edit/${quotation._id || quotation.id}`)}
                  className="p-2 text-gray-400 hover:text-[#e50914] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                  title="Edit Proposal"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setQuotationToDelete(quotation._id || quotation.id || '')}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
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
