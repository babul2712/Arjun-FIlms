'use client';

import React, { useEffect, useState, use } from 'react';
import { 
  getProjectById, 
  updateProject, 
  addProjectExpense, 
  updateProjectExpense, 
  deleteProjectExpense, 
  addProjectPayment, 
  updateProjectPayment, 
  deletePayment, 
  addProjectCrew, 
  getCrew, 
  deleteProject 
} from '@/app/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Users, MapPin, Plus, Receipt, Trash2, 
  Phone, Mail, Calendar, Sparkles, CheckCircle2, FileText, 
  Clock, DollarSign, Edit2, Edit3, Image as ImageIcon, Camera, Eye, Download, X, Wallet, TrendingUp, TrendingDown
} from 'lucide-react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import CloudinaryUpload from '@/components/ui/CloudinaryUpload';
import AnimatedCashAmount from '@/components/ui/AnimatedCashAmount';
import AutoSearchInput from '@/components/ui/AutoSearchInput';

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ledger' | 'photos' | 'documents' | 'history'>('ledger');
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

  // Expense Modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpenseIndex, setEditingExpenseIndex] = useState<number | null>(null);
  const [expenseForm, setExpenseForm] = useState({ 
    date: dayjs().format('YYYY-MM-DD'), 
    description: '', 
    amount: '' 
  });

  // Payment Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    amount: '',
    paymentMethod: 'UPI QR',
    remarks: ''
  });

  // Crew Modal states
  const [showCrewModal, setShowCrewModal] = useState(false);
  const [crewForm, setCrewForm] = useState({ role: '', charges: '', assignedCrewId: '' });
  const [availableCrew, setAvailableCrew] = useState<any[]>([]);

  const fetchDetails = async () => {
    try {
      const pData = await getProjectById(resolvedParams.id);
      const cData = await getCrew();
      setProject(pData);
      setAvailableCrew(cData);
    } catch (e) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [resolvedParams.id]);

  if (loading) return <div className="p-10 flex justify-center text-[#e50914] font-bold">Loading case dashboard...</div>;
  if (!project) return <div className="p-10 text-center text-gray-500 font-semibold">Case record not found</div>;

  const payments = project.paymentsList || [];
  const expenses = project.expenses || [];
  
  const totalReceived = payments.filter((p: any) => p.status === 'PAID' || p.status === 'Verified').reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
  const pendingAmount = Math.max(0, (project.totalValue || 0) - totalReceived);
  const totalExpenses = expenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);

  // Financial Ledger calculations
  const ledgerItems = [
    ...payments.filter((p: any) => p.status === 'PAID' || p.status === 'Verified').map((p: any) => ({
      id: p._id,
      itemType: 'PAYMENT' as const,
      paymentMethod: p.paymentMethod || 'UPI QR',
      remarks: p.remarks || '',
      type: 'IN' as const,
      date: dayjs(p.date),
      rawDate: p.date,
      description: `Client Payment via ${p.paymentMethod || 'UPI QR'}${p.remarks ? ` (${p.remarks})` : ''}`,
      amount: p.amount || 0
    })),
    ...expenses.map((e: any, idx: number) => ({
      id: e._id || `exp-${idx}`,
      expenseIndex: idx,
      itemType: 'EXPENSE' as const,
      type: 'OUT' as const,
      date: dayjs(e.date),
      rawDate: e.date,
      description: e.description || 'Expense',
      amount: e.amount || 0
    }))
  ].sort((a, b) => a.date.valueOf() - b.date.valueOf());

  let runningBalance = 0;
  const ledgerRows = ledgerItems.map(item => {
    if (item.type === 'IN') runningBalance += item.amount;
    else runningBalance -= item.amount;
    return { ...item, runningBalance };
  });

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateProject(project._id, { status: newStatus });
      toast.success('Project status updated');
      fetchDetails();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  // Expense Handlers
  const handleOpenAddExpense = () => {
    setEditingExpenseIndex(null);
    setExpenseForm({
      date: dayjs().format('YYYY-MM-DD'),
      description: '',
      amount: ''
    });
    setShowExpenseModal(true);
  };

  const handleOpenEditExpense = (idx: number, expense: any) => {
    setEditingExpenseIndex(idx);
    setExpenseForm({
      date: dayjs(expense.rawDate || expense.date).format('YYYY-MM-DD'),
      description: expense.description || '',
      amount: String(expense.amount || '')
    });
    setShowExpenseModal(true);
  };

  const handleSaveExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount) {
      toast.error('Description and amount are required');
      return;
    }
    try {
      if (editingExpenseIndex !== null) {
        await updateProjectExpense(project._id, editingExpenseIndex, {
          date: new Date(expenseForm.date).toISOString(),
          description: expenseForm.description,
          amount: Number(expenseForm.amount)
        });
        toast.success('Expense updated successfully');
      } else {
        await addProjectExpense(project._id, {
          date: new Date(expenseForm.date).toISOString(),
          description: expenseForm.description,
          amount: Number(expenseForm.amount)
        });
        toast.success('Expense logged successfully');
      }
      setShowExpenseModal(false);
      setEditingExpenseIndex(null);
      setExpenseForm({ date: dayjs().format('YYYY-MM-DD'), description: '', amount: '' });
      fetchDetails();
    } catch (e) {
      toast.error(editingExpenseIndex !== null ? 'Failed to update expense' : 'Failed to log expense');
    }
  };

  const handleDeleteExpense = async (idx: number) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await deleteProjectExpense(project._id, idx);
      toast.success('Expense record deleted');
      fetchDetails();
    } catch (e) {
      toast.error('Failed to delete expense');
    }
  };

  // Payment Handlers
  const handleOpenAddPayment = () => {
    setEditingPaymentId(null);
    setPaymentForm({
      date: dayjs().format('YYYY-MM-DD'),
      amount: '',
      paymentMethod: 'UPI QR',
      remarks: ''
    });
    setShowPaymentModal(true);
  };

  const handleOpenEditPayment = (payment: any) => {
    setEditingPaymentId(payment.id);
    setPaymentForm({
      date: dayjs(payment.rawDate || payment.date).format('YYYY-MM-DD'),
      amount: String(payment.amount || ''),
      paymentMethod: payment.paymentMethod || 'UPI QR',
      remarks: payment.remarks || ''
    });
    setShowPaymentModal(true);
  };

  const handleSavePayment = async () => {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error('Valid payment amount is required');
      return;
    }
    try {
      if (editingPaymentId) {
        await updateProjectPayment(editingPaymentId, {
          amount: Number(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          date: paymentForm.date,
          remarks: paymentForm.remarks
        });
        toast.success('Payment updated successfully');
      } else {
        await addProjectPayment(project._id, {
          amount: Number(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          date: paymentForm.date,
          remarks: paymentForm.remarks
        });
        toast.success('Payment recorded successfully');
      }
      setShowPaymentModal(false);
      setEditingPaymentId(null);
      setPaymentForm({ date: dayjs().format('YYYY-MM-DD'), amount: '', paymentMethod: 'UPI QR', remarks: '' });
      fetchDetails();
    } catch (e) {
      toast.error(editingPaymentId ? 'Failed to update payment' : 'Failed to record payment');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    try {
      await deletePayment(paymentId);
      toast.success('Payment record deleted');
      fetchDetails();
    } catch (e) {
      toast.error('Failed to delete payment');
    }
  };

  const handleAddCrew = async () => {
    if (!crewForm.role || !crewForm.charges) {
      toast.error('Role and charges are required');
      return;
    }
    try {
      await addProjectCrew(project._id, {
        role: crewForm.role,
        charges: Number(crewForm.charges),
        assignedCrewId: crewForm.assignedCrewId || undefined
      });
      toast.success('Crew assigned successfully');
      setShowCrewModal(false);
      setCrewForm({ role: '', charges: '', assignedCrewId: '' });
      fetchDetails();
    } catch (e) {
      toast.error('Failed to allocate crew');
    }
  };

  const handleRemoveCrew = async (idxToRemove: number) => {
    if (!confirm('Are you sure you want to remove this crew member?')) return;
    const currentCrew = project.crewBlueprint || [];
    const updatedCrew = currentCrew.filter((_: any, idx: number) => idx !== idxToRemove);
    try {
      await updateProject(project._id, { crewBlueprint: updatedCrew });
      toast.success('Crew allocation removed');
      fetchDetails();
    } catch (e) {
      toast.error('Failed to remove crew allocation');
    }
  };

  const handleUpdateCoverImage = async (url: string) => {
    try {
      await updateProject(project._id, { coverImage: url });
      setProject((prev: any) => ({ ...prev, coverImage: url }));
      toast.success('Project cover photo updated');
    } catch (e) {
      toast.error('Failed to update cover photo');
    }
  };

  const handleAddGalleryImage = async (url: string) => {
    if (!url) return;
    const currentGallery = project.gallery || [];
    const updatedGallery = [...currentGallery, url];
    try {
      await updateProject(project._id, { gallery: updatedGallery });
      setProject((prev: any) => ({ ...prev, gallery: updatedGallery }));
      toast.success('Photo added to project deliverables gallery');
    } catch (e) {
      toast.error('Failed to update gallery');
    }
  };

  const handleRemoveGalleryImage = async (urlToRemove: string) => {
    const currentGallery = project.gallery || [];
    const updatedGallery = currentGallery.filter((u: string) => u !== urlToRemove);
    try {
      await updateProject(project._id, { gallery: updatedGallery });
      setProject((prev: any) => ({ ...prev, gallery: updatedGallery }));
      toast.success('Photo removed from deliverables gallery');
    } catch (e) {
      toast.error('Failed to remove photo');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this case?')) return;
    try {
      await deleteProject(project._id);
      toast.success('Project record deleted');
      router.push('/dashboard');
    } catch (e) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6 w-full pb-20 font-sans text-gray-800 dark:text-gray-100">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 dark:bg-[#16181c]/70 p-4 rounded-[28px] border border-gray-200/60 dark:border-gray-800/80 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </Link>
          <div>
            <h3 className="text-[20px] font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              {project.projectNumber}
              <span className="text-[11.5px] bg-[#fef2f2] text-[#e50914] dark:bg-red-950/40 dark:text-red-300 border border-[#fee2e2] dark:border-red-900/40 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                {project.status}
              </span>
            </h3>
            <p className="text-[12px] text-gray-400 font-semibold mt-0.5">{project.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={project.status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-[12px] font-bold text-gray-800 dark:text-gray-200 focus:outline-none shadow-xs cursor-pointer"
          >
            <option value="Lead">Lead</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Booked">Booked</option>
            <option value="Completed">Completed</option>
          </select>
          
          <button 
            onClick={handleDelete}
            className="p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Delete Project"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* 3-Column Grid Layout: Column 1 (Left: Assigned Crew), Column 2 (Center: Tabs/Ledger/Photos/Docs), Column 3 (Right: Client Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1 (Left - 4 cols): Assigned Project Crew (Always displayed) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-[28px] p-5 sm:p-6 bg-white dark:bg-[#16181c] border border-gray-200/60 dark:border-gray-800/80 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-[#e50914] rounded-2xl border border-red-100/50 dark:border-red-900/40">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[15px] font-extrabold text-gray-900 dark:text-white leading-tight">
                    Project Crew
                  </h4>
                  <span className="text-[11px] text-gray-400 font-bold">
                    {(project.crewBlueprint || []).length} Member{(project.crewBlueprint || []).length !== 1 ? 's' : ''} Assigned
                  </span>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setShowCrewModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#e50914] hover:bg-red-700 text-white rounded-xl text-[11.5px] font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                Allocate
              </button>
            </div>

            {/* Crew List */}
            {(project.crewBlueprint || []).length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-semibold space-y-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-6">
                <Users className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 stroke-1" />
                <div>
                  <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300">No crew allocated yet</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Allocate crew members for cameras, lighting & editing.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCrewModal(true)}
                  className="inline-flex items-center gap-1 text-[12px] font-extrabold text-[#e50914] hover:underline cursor-pointer pt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Allocate Crew
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {project.crewBlueprint.map((crew: any, idx: number) => {
                  const details = availableCrew.find(c => c._id === crew.assignedCrewId);
                  const avatarUrl = details?.avatarUrl;
                  const crewName = details?.name || 'Unassigned Crew';

                  return (
                    <div
                      key={idx}
                      className="bg-gray-50/60 dark:bg-[#1f2229]/60 hover:bg-white dark:hover:bg-[#222730] border border-gray-150 dark:border-gray-800/80 rounded-2xl p-4 transition-all duration-200 shadow-xs group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-red-50 dark:bg-red-950/40 text-[#e50914] font-extrabold flex items-center justify-center text-[14px] shrink-0 border border-red-100/50 dark:border-red-900/40">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={crewName} className="w-full h-full object-cover" />
                            ) : (
                              crewName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-[13.5px] font-extrabold text-gray-900 dark:text-white truncate group-hover:text-[#e50914] transition-colors">
                              {crewName}
                            </h5>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="bg-[#fef2f2] text-[#e50914] dark:bg-red-950/50 dark:text-red-300 border border-[#fee2e2] dark:border-red-900/50 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md leading-none">
                                {crew.role}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-[13px] font-black text-gray-900 dark:text-white block">
                              ₹{Number(crew.charges || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">
                              Fee
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCrew(idx)}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Remove Crew Allocation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Contact row if available */}
                      {(details?.phone || details?.location) && (
                        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-gray-150/70 dark:border-gray-800/80 text-[11px] text-gray-500 dark:text-gray-400">
                          {details.location && (
                            <span className="flex items-center gap-1 truncate max-w-[120px]" title={details.location}>
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate">{details.location}</span>
                            </span>
                          )}
                          {details.phone && (
                            <a
                              href={`tel:${details.phone}`}
                              className="flex items-center gap-1 text-[#e50914] hover:underline font-bold shrink-0 ml-auto"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{details.phone}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Column 2 (Center - 5 cols): Main Tabs (Ledger / Photos / Documents / History) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Tabs bar */}
          <div className="flex bg-white/70 dark:bg-[#16181c]/70 p-1.5 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 backdrop-blur-md overflow-x-auto custom-scrollbar shrink-0 gap-1.5 shadow-xs">
            {[
              { id: 'ledger', name: 'Services & Fees' },
              { id: 'photos', name: 'Photos & Deliverables' },
              { id: 'documents', name: 'Agreements & Invoices' },
              { id: 'history', name: 'Activity Log' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-[12px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#e50914] text-white shadow-md shadow-red-500/20' 
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/[0.04]'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab content area */}
          <div className="glass-card rounded-[28px] p-5 sm:p-6 bg-white dark:bg-[#16181c] border border-gray-200/60 dark:border-gray-800/80 shadow-sm">
            
            {/* Financial Ledger tab */}
            {activeTab === 'ledger' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="min-w-0">
                    <h4 className="text-[15.5px] font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                      <Receipt className="w-4.5 h-4.5 text-[#e50914] shrink-0" />
                      Financial Ledger Statement
                    </h4>
                    <p className="text-[11.5px] text-gray-400 font-semibold mt-0.5">
                      Income credits & expense debits transaction trail
                    </p>
                  </div>
                  
                  {/* Action buttons: Record Payment (Credit) & Add Expense (Debit) strictly in one row */}
                  <div className="flex items-center gap-2 flex-nowrap shrink-0 w-full sm:w-auto">
                    <button 
                      type="button"
                      onClick={handleOpenAddPayment}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11.5px] font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                      title="Record client payment credit"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                      Record Payment (Credit)
                    </button>
                    
                    <button 
                      type="button"
                      onClick={handleOpenAddExpense}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl text-[11.5px] font-extrabold border border-rose-200/80 dark:border-rose-900/50 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                      title="Log expense debit"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                      Add Expense (Debit)
                    </button>
                  </div>
                </div>

                {/* Summary KPI Cards inside Ledger */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-gray-50/70 dark:bg-gray-850/50 rounded-2xl border border-gray-150 dark:border-gray-800">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Contract Value</span>
                    <span className="text-[14px] font-black text-gray-900 dark:text-white mt-0.5 block">
                      <AnimatedCashAmount amount={Number(project.totalValue || 0)} sparkle={false} />
                    </span>
                  </div>
                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-150 dark:border-emerald-900/30">
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Total Received</span>
                    <span className="text-[14px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      <AnimatedCashAmount amount={totalReceived} colorScheme="emerald" sparkle={false} />
                    </span>
                  </div>
                  <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-150 dark:border-rose-900/30">
                    <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Total Expenses</span>
                    <span className="text-[14px] font-black text-rose-600 dark:text-rose-400 mt-0.5 block">
                      <AnimatedCashAmount amount={totalExpenses} colorScheme="crimson" sparkle={false} />
                    </span>
                  </div>
                  <div className="p-3.5 bg-gray-50/70 dark:bg-gray-850/50 rounded-2xl border border-gray-150 dark:border-gray-800">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Pending Due</span>
                    <span className="text-[14px] font-black text-[#e50914] mt-0.5 block">
                      <AnimatedCashAmount amount={pendingAmount} colorScheme="crimson" sparkle={false} />
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#15181e]">
                  <table className="w-full text-left border-collapse text-[12.5px]">
                    <thead>
                      <tr className="bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-150 dark:border-gray-800 font-extrabold text-gray-400 uppercase tracking-wider text-[10px]">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-right">Income</th>
                        <th className="px-4 py-3 text-right">Expense</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                      {ledgerRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-gray-400 font-semibold">
                            No financial ledger entries found for this project case.
                          </td>
                        </tr>
                      ) : (
                        ledgerRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors group">
                            <td className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {row.date.format('DD MMM YYYY')}
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">
                              {row.description}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase tracking-wide ${
                                row.type === 'IN' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60' 
                                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/60'
                              }`}>
                                {row.type === 'IN' ? 'CREDIT' : 'DEBIT'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 text-right whitespace-nowrap">
                              {row.type === 'IN' ? <AnimatedCashAmount amount={row.amount} colorScheme="emerald" sparkle={false} /> : '-'}
                            </td>
                            <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400 text-right whitespace-nowrap">
                              {row.type === 'OUT' ? <AnimatedCashAmount amount={row.amount} colorScheme="crimson" sparkle={false} /> : '-'}
                            </td>
                            <td className="px-4 py-3 font-extrabold text-gray-900 dark:text-white text-right whitespace-nowrap">
                              <AnimatedCashAmount amount={row.runningBalance} sparkle={false} />
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (row.itemType === 'EXPENSE') {
                                      handleOpenEditExpense(row.expenseIndex, row);
                                    } else {
                                      handleOpenEditPayment(row);
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                                  title={row.itemType === 'EXPENSE' ? 'Edit Expense' : 'Edit Payment'}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (row.itemType === 'EXPENSE') {
                                      handleDeleteExpense(row.expenseIndex);
                                    } else {
                                      handleDeletePayment(row.id);
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                                  title={row.itemType === 'EXPENSE' ? 'Delete Expense' : 'Delete Payment'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Photos & Deliverables Tab */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div>
                    <h4 className="text-[15.5px] font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-[#e50914]" />
                      Deliverables Gallery
                    </h4>
                    <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                      Upload moodboards, shoot previews, and client deliverable photos.
                    </p>
                  </div>
                  <div className="w-full sm:w-auto">
                    <CloudinaryUpload
                      variant="compact"
                      folder="projects"
                      label="+ Upload Photo"
                      onChange={(url) => {
                        if (url) handleAddGalleryImage(url);
                      }}
                    />
                  </div>
                </div>

                {/* Gallery Grid */}
                {(project.gallery || []).length === 0 ? (
                  <div className="text-center py-16 text-gray-400 font-semibold space-y-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-8">
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 stroke-1" />
                    <p className="text-[14px]">No deliverables or photo previews uploaded yet.</p>
                    <p className="text-[12px] text-gray-400">Use the upload button above to add shoot photos.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {(project.gallery || []).map((imgUrl: string, idx: number) => (
                      <div key={idx} className="relative group rounded-2xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 shadow-xs aspect-square bg-gray-100 dark:bg-gray-800">
                        <img src={imgUrl} alt={`Deliverable ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        
                        {/* Overlay buttons */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <button
                            onClick={() => setSelectedGalleryImage(imgUrl)}
                            className="p-2 bg-white/90 hover:bg-white text-gray-800 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                            title="View Fullscreen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={imgUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-white/90 hover:bg-white text-gray-800 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                            title="Open in new tab"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleRemoveGalleryImage(imgUrl)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Documents tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <h4 className="text-[15.5px] font-extrabold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <FileText className="w-5 h-5 text-[#e50914]" />
                  Uploaded Agreements & Invoice Receipts
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {payments.map((p: any, idx: number) => {
                    if (!p.screenshotUrl) return null;
                    return (
                      <div key={idx} className="border border-gray-150 dark:border-gray-800 rounded-2xl p-4 bg-gray-50/50 dark:bg-gray-850/50 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500 font-bold shrink-0">
                            IMG
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 truncate max-w-[150px]">Payment Screenshot</p>
                            <p className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">Amount: <AnimatedCashAmount amount={p.amount} sparkle={false} /></p>
                          </div>
                        </div>
                        <a 
                          href={p.screenshotUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[12px] font-bold text-[#e50914] hover:underline"
                        >
                          View File
                        </a>
                      </div>
                    );
                  })}
                  {payments.filter((p: any) => p.screenshotUrl).length === 0 && (
                    <div className="col-span-2 text-center py-12 text-gray-400 font-semibold">
                      No documents or screenshots uploaded yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* History logs */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <h4 className="text-[15.5px] font-extrabold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <Clock className="w-5 h-5 text-[#e50914]" />
                  Case Activity History Log
                </h4>
                <div className="relative pl-6 border-l-2 border-[#e50914]/20 space-y-6 py-2 ml-4">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#e50914] border-4 border-white dark:border-[#16181c]" />
                    <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200">Project record created</p>
                    <p className="text-[11px] text-gray-400 font-semibold mt-0.5">{dayjs(project.createdAt).format('DD MMM YYYY, hh:mm A')}</p>
                  </div>
                  {project.expenses?.map((e: any, idx: number) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-rose-500 border-4 border-white dark:border-[#16181c]" />
                      <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200">Logged Expense: {e.description} (₹{e.amount})</p>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">{dayjs(e.date).format('DD MMM YYYY, hh:mm A')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Column 3 (Right - 3 cols): Client Metadata & Overview Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card rounded-[28px] p-5 sm:p-6 bg-white dark:bg-[#16181c] border border-gray-200/60 dark:border-gray-800/80 space-y-5 shadow-sm">
            {/* User Profile Header */}
            <div className="text-center pb-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex justify-center pb-2">
                <CloudinaryUpload
                  value={project.coverImage || ''}
                  onChange={handleUpdateCoverImage}
                  variant="avatar"
                  folder="projects"
                  label="Project Photo"
                />
              </div>
              <h4 className="text-[16px] font-extrabold text-gray-900 dark:text-white mt-2">{project.name}</h4>
              <p className="text-[11px] text-[#e50914] font-extrabold uppercase tracking-wider mt-0.5">{project.eventType}</p>
              
              {/* Call/Mail buttons */}
              <div className="flex justify-center gap-3 mt-4">
                <a 
                  href={`tel:${project.phone}`}
                  className="p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700 hover:bg-gray-100 text-gray-600 dark:text-gray-300 rounded-full transition-colors shadow-xs"
                  title="Call Client"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a 
                  href={`mailto:${project.email}`}
                  className="p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700 hover:bg-gray-100 text-gray-600 dark:text-gray-300 rounded-full transition-colors shadow-xs"
                  title="Send Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Profile Grid values */}
            <div className="space-y-4 text-[12.5px]">
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase tracking-wider">Location / Venue</span>
                <span className="text-gray-800 dark:text-gray-200 font-bold flex items-center gap-1 mt-0.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  {project.location || 'Studio Location'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase tracking-wider">Event / Shoot Date</span>
                <span className="text-gray-800 dark:text-gray-200 font-bold flex items-center gap-1 mt-0.5">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  {project.eventDate ? dayjs(project.eventDate).format('MMM DD, YYYY') : 'Not scheduled'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase tracking-wider">Total Contract</span>
                <span className="text-gray-900 dark:text-white font-black text-[15px] block mt-0.5">
                  <AnimatedCashAmount amount={Number(project.totalValue || 0)} />
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase tracking-wider">Case Owner</span>
                <span className="text-gray-800 dark:text-gray-200 font-bold mt-0.5 block">Arjun Owner</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase tracking-wider">Client Type</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 mt-1">
                  Returning Client
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase tracking-wider">Personal Notes</span>
                <p className="text-gray-600 dark:text-gray-400 font-semibold leading-relaxed mt-1 text-[11.5px] bg-gray-50/70 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-150 dark:border-gray-800">
                  {project.notes || 'No notes added for this case record.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Add Expense Modal */}
      {/* Add / Edit Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExpenseModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#16181c] border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-2xl p-6 animate-fade-in z-10 text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-500" />
                {editingExpenseIndex !== null ? 'Edit Project Expense' : 'Log Project Expense (Debit)'}
              </h3>
              <button 
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Date</label>
                <input 
                  type="date" 
                  value={expenseForm.date} 
                  onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                  className="w-full bg-gray-50/80 dark:bg-gray-850/80 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-3 text-[13px] text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#e50914]"
                />
              </div>

              <div>
                <AutoSearchInput
                  label="Description / Expense Category"
                  required
                  value={expenseForm.description}
                  onChange={(val) => setExpenseForm({ ...expenseForm, description: val })}
                  options={[
                    { label: 'Camera Lenses & Rig Rental', value: 'Camera Lenses & Rig Rental', badge: 'Equipment', badgeColor: 'blue' },
                    { label: 'Drone 4K Pilot Fee', value: 'Drone 4K Pilot Fee', badge: 'Crew', badgeColor: 'purple' },
                    { label: 'Lead Cinematographer Fee', value: 'Lead Cinematographer Fee', badge: 'Crew', badgeColor: 'purple' },
                    { label: 'Lighting Assistant Charges', value: 'Lighting Assistant Charges', badge: 'Crew', badgeColor: 'purple' },
                    { label: 'Traditional Video Operator', value: 'Traditional Video Operator', badge: 'Crew', badgeColor: 'purple' },
                    { label: 'Transportation & Fuel Logistics', value: 'Transportation & Fuel Logistics', badge: 'Logistics', badgeColor: 'amber' },
                    { label: 'Album Printing & Binding', value: 'Album Printing & Binding', badge: 'Post-Prod', badgeColor: 'emerald' },
                    { label: 'Post-production & Color Grading', value: 'Post-production & Color Grading', badge: 'Post-Prod', badgeColor: 'emerald' },
                    { label: 'Audio Master & Studio Dubbing', value: 'Audio Master & Studio Dubbing', badge: 'Studio', badgeColor: 'gray' },
                    { label: 'Catering & Crew Refreshments', value: 'Catering & Crew Refreshments', badge: 'Hospitality', badgeColor: 'red' },
                  ]}
                  placeholder="Type or select expense category..."
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Amount (₹)</label>
                <input 
                  type="number" 
                  value={expenseForm.amount} 
                  onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                  className="w-full bg-gray-50/80 dark:bg-gray-850/80 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-3 text-[13px] text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#e50914]"
                  placeholder="e.g. 5000"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button 
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-[13px] font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveExpense}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-bold shadow-md shadow-rose-600/20 cursor-pointer transition-all active:scale-95"
              >
                {editingExpenseIndex !== null ? 'Update Expense' : 'Save Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#16181c] border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-2xl p-6 animate-fade-in z-10 text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-500" />
                {editingPaymentId ? 'Edit Payment Record' : 'Record Client Payment (Credit)'}
              </h3>
              <button 
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Payment Date</label>
                <input 
                  type="date" 
                  value={paymentForm.date} 
                  onChange={e => setPaymentForm({...paymentForm, date: e.target.value})}
                  className="w-full bg-gray-50/80 dark:bg-gray-850/80 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-3 text-[13px] text-gray-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Payment Amount (₹)</label>
                <input 
                  type="number" 
                  value={paymentForm.amount} 
                  onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full bg-gray-50/80 dark:bg-gray-850/80 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-3 text-[13px] text-gray-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 25000"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Payment Method</label>
                <select 
                  value={paymentForm.paymentMethod} 
                  onChange={e => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                  className="w-full bg-gray-50/80 dark:bg-gray-850/80 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-3 text-[13px] text-gray-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="UPI QR">UPI QR</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS/RTGS)</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="Credit/Debit Card">Credit/Debit Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <AutoSearchInput
                  label="Remarks / Transaction Note (Optional)"
                  value={paymentForm.remarks}
                  onChange={(val) => setPaymentForm({ ...paymentForm, remarks: val })}
                  options={[
                    { label: '50% Advance Booking Retainer', value: '50% Advance Booking Retainer', badge: 'Deposit', badgeColor: 'emerald' },
                    { label: 'Shoot Execution Stage Installment', value: 'Shoot Execution Stage Installment', badge: 'Progress', badgeColor: 'blue' },
                    { label: 'Final Settlement Before Delivery', value: 'Final Settlement Before Delivery', badge: 'Final', badgeColor: 'purple' },
                    { label: 'Additional Hours Overtime Payment', value: 'Additional Hours Overtime Payment', badge: 'Extra', badgeColor: 'amber' },
                    { label: 'Drone Coverage Add-on Settlement', value: 'Drone Coverage Add-on Settlement', badge: 'Add-on', badgeColor: 'gray' },
                  ]}
                  placeholder="Type or select payment note..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button 
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-[13px] font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSavePayment}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-95"
              >
                {editingPaymentId ? 'Update Payment' : 'Save Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Crew Modal */}
      {showCrewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCrewModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#16181c] border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-2xl p-6 animate-fade-in z-10 text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#e50914]" />
                Allocate Crew to Project
              </h3>
              <button 
                type="button"
                onClick={() => setShowCrewModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <AutoSearchInput
                  label="Search & Select Crew Member"
                  required
                  value={crewForm.assignedCrewId ? (availableCrew.find(c => c._id === crewForm.assignedCrewId)?.name || '') : ''}
                  onChange={(val, opt) => {
                    if (opt?.data) {
                      setCrewForm({
                        ...crewForm,
                        assignedCrewId: opt.data._id,
                        role: opt.data.role || '',
                        charges: opt.data.charges ? String(opt.data.charges) : ''
                      });
                    } else {
                      const matched = availableCrew.find(c => c._id === val || c.name.toLowerCase() === val.toLowerCase());
                      if (matched) {
                        setCrewForm({
                          ...crewForm,
                          assignedCrewId: matched._id,
                          role: matched.role || '',
                          charges: matched.charges ? String(matched.charges) : ''
                        });
                      }
                    }
                  }}
                  options={availableCrew.map(c => ({
                    value: c._id,
                    label: c.name,
                    sublabel: `${c.role} • ${c.location || 'Studio'}`,
                    badge: `₹${Number(c.charges || 0).toLocaleString('en-IN')}`,
                    badgeColor: 'emerald',
                    avatar: c.avatarUrl,
                    data: c
                  }))}
                  placeholder="Type crew name, skill, or location..."
                  allowCustom={false}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Role Blueprint</label>
                <input 
                  type="text" 
                  value={crewForm.role} 
                  onChange={e => setCrewForm({...crewForm, role: e.target.value})}
                  className="w-full bg-gray-50/80 dark:bg-gray-850/80 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-3 text-[13px] text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#e50914]"
                  placeholder="e.g. Lead Shooter / Drone Specialist"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Charges (₹)</label>
                <input 
                  type="number" 
                  value={crewForm.charges} 
                  onChange={e => setCrewForm({...crewForm, charges: e.target.value})}
                  className="w-full bg-gray-50/80 dark:bg-gray-850/80 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-3 text-[13px] text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#e50914]"
                  placeholder="e.g. 15000"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button 
                type="button"
                onClick={() => setShowCrewModal(false)}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-[13px] font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleAddCrew}
                className="px-5 py-2 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-[13px] font-bold shadow-md shadow-red-500/20 cursor-pointer transition-all active:scale-95"
              >
                Assign Crew
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      {selectedGalleryImage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedGalleryImage(null)} />
          <div className="relative max-w-4xl w-full bg-white dark:bg-[#15181e] rounded-3xl overflow-hidden shadow-2xl p-4 flex flex-col items-center">
            <button 
              onClick={() => setSelectedGalleryImage(null)}
              className="absolute right-4 top-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full z-10 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl mt-8 bg-black/5">
              <img src={selectedGalleryImage} alt="Project Deliverable Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl" />
            </div>
            <div className="flex items-center justify-between w-full pt-4 px-2">
              <span className="text-[12px] font-bold text-gray-400">Project Deliverable</span>
              <a
                href={selectedGalleryImage}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0a0b0d] hover:bg-black text-white text-[12px] font-bold rounded-xl shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download Original
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
