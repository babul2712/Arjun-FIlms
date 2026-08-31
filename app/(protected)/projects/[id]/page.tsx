'use client';

import React, { useEffect, useState, use } from 'react';
import { getProjectById, updateProject, addProjectExpense, addProjectCrew, getCrew, deleteProject } from '@/app/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Users, MapPin, Plus, Receipt, Trash2, 
  Phone, Mail, Calendar, Sparkles, CheckCircle2, FileText, 
  Clock, DollarSign, Edit3 
} from 'lucide-react';
import dayjs from 'dayjs';
import { toast } from 'sonner';

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contacts' | 'ledger' | 'documents' | 'history'>('contacts');

  // Modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ date: dayjs().format('YYYY-MM-DD'), description: '', amount: '' });
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
  
  const totalReceived = payments.filter((p: any) => p.status === 'PAID' || p.status === 'Verified').reduce((acc: number, p: any) => acc + p.amount, 0);
  const pendingAmount = Math.max(0, project.totalValue - totalReceived);
  const totalExpenses = expenses.reduce((acc: number, e: any) => acc + e.amount, 0);

  // Financial Ledger calculations
  const ledgerItems = [
    ...payments.filter((p: any) => p.status === 'PAID' || p.status === 'Verified').map((p: any) => ({
      type: 'IN',
      date: dayjs(p.date),
      description: `Client Payment via ${p.paymentMethod}`,
      amount: p.amount
    })),
    ...expenses.map((e: any) => ({
      type: 'OUT',
      date: dayjs(e.date),
      description: e.description,
      amount: e.amount
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

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount) {
      toast.error('All fields are required');
      return;
    }
    try {
      await addProjectExpense(project._id, {
        date: new Date(expenseForm.date).toISOString(),
        description: expenseForm.description,
        amount: Number(expenseForm.amount)
      });
      toast.success('Expense logged successfully');
      setShowExpenseModal(false);
      setExpenseForm({ date: dayjs().format('YYYY-MM-DD'), description: '', amount: '' });
      fetchDetails();
    } catch (e) {
      toast.error('Failed to log expense');
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
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 p-4 rounded-3xl border border-white/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-200/50">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h3 className="text-[20px] font-bold text-gray-800 flex items-center gap-2">
              {project.projectNumber}
              <span className="text-[12px] bg-[#fef2f2] text-[#e50914] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
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
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-[12px] font-bold text-gray-800 focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="Lead">Lead</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Booked">Booked</option>
            <option value="Completed">Completed</option>
          </select>
          
          <button 
            onClick={handleDelete}
            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 hover:bg-rose-100 hover:shadow-md transition-all cursor-pointer"
            title="Delete Project"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid: Left tab details & Right info card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left main tabs section */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Tabs bar */}
          <div className="flex bg-white/60 p-1.5 rounded-2xl border border-white/40 backdrop-blur-md overflow-x-auto custom-scrollbar shrink-0 gap-1.5">
            {[
              { id: 'contacts', name: 'Contacts & Crew' },
              { id: 'ledger', name: 'Services & Fees' },
              { id: 'documents', name: 'Uploaded Documents' },
              { id: 'history', name: 'History Logs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#e50914] text-white shadow-md shadow-red-500/20' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab content area */}
          <div className="glass-card rounded-[24px] p-6 bg-white border border-gray-200/50">
            
            {/* Contacts tab (Matches Image 2 contact cards grid) */}
            {activeTab === 'contacts' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <h4 className="text-[16px] font-bold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#e50914]" />
                    Assigned Project Crew
                  </h4>
                  <button 
                    onClick={() => setShowCrewModal(true)}
                    className="flex items-center gap-1 px-4 py-2 bg-[#e50914] hover:bg-red-700 text-white rounded-xl text-[12px] font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Allocate Crew
                  </button>
                </div>

                {(project.crewBlueprint || []).length === 0 ? (
                  <div className="text-center py-12 text-gray-400 font-semibold space-y-2">
                    <Users className="w-12 h-12 mx-auto stroke-1" />
                    <p className="text-[14px]">No crew blueprint allocated yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.crewBlueprint.map((crew: any, idx: number) => {
                      const details = availableCrew.find(c => c._id === crew.assignedCrewId);
                      return (
                        <div key={idx} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 flex items-start justify-between relative shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#fef2f2] text-[#e50914] font-bold flex items-center justify-center text-[18px]">
                              {(details?.name || 'C').charAt(0)}
                            </div>
                            <div>
                              <h5 className="text-[14px] font-bold text-gray-800">
                                {details?.name || 'Unassigned Crew'}
                              </h5>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                <span className="bg-[#fef2f2] text-[#e50914] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                                  {crew.role}
                                </span>
                                <span className="bg-gray-100 text-gray-500 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                                  Charges: ₹{crew.charges}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <button className="text-gray-400 hover:text-[#e50914] p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Financial Ledger tab (Replaces standard view with high-fidelity rows) */}
            {activeTab === 'ledger' && (
              <div className="space-y-6">
                <div className="flex justify-between items-start flex-wrap gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="text-[16px] font-bold text-gray-800 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-[#e50914]" />
                      Financial Ledger Statement
                    </h4>
                    <p className="text-[13px] text-gray-400 font-semibold mt-1">Project Total: <strong className="text-gray-900">₹{project.totalValue.toLocaleString()}</strong></p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Pending Client Payments</span>
                      <span className="text-[18px] font-extrabold text-[#e50914]">₹{pendingAmount.toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => setShowExpenseModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[12px] font-bold hover:bg-rose-100 border border-rose-100 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Expense
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Transaction</th>
                        <th className="px-4 py-3 text-right">Income (IN)</th>
                        <th className="px-4 py-3 text-right">Expenses (OUT)</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ledgerRows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-400 font-semibold">
                            No ledger entries found for this case.
                          </td>
                        </tr>
                      ) : (
                        ledgerRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3.5 font-semibold text-gray-500">{row.date.format('DD MMM YYYY')}</td>
                            <td className="px-4 py-3.5 font-bold text-gray-700">{row.description}</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${row.type === 'IN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                {row.type === 'IN' ? 'CREDIT' : 'DEBIT'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-emerald-600 text-right">
                              {row.type === 'IN' ? `₹${row.amount.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-4 py-3.5 font-bold text-rose-600 text-right">
                              {row.type === 'OUT' ? `₹${row.amount.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-4 py-3.5 font-extrabold text-gray-900 text-right">
                              ₹{row.runningBalance.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Documents tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <h4 className="text-[16px] font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
                  <FileText className="w-5 h-5 text-[#e50914]" />
                  Uploaded Agreements & Invoice Receipts
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {payments.map((p: any, idx: number) => {
                    if (!p.screenshotUrl) return null;
                    return (
                      <div key={idx} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold shrink-0">
                            IMG
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-gray-700 truncate max-w-[150px]">Payment Screenshot</p>
                            <p className="text-[11px] text-gray-400 font-semibold">Amount: ₹{p.amount.toLocaleString()}</p>
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
                <h4 className="text-[16px] font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
                  <Clock className="w-5 h-5 text-[#e50914]" />
                  Case Activity History Log
                </h4>
                <div className="relative pl-6 border-l-2 border-[#e50914]/20 space-y-6 py-2 ml-4">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#e50914] border-4 border-white" />
                    <p className="text-[13px] font-bold text-gray-800">Project record created</p>
                    <p className="text-[11px] text-gray-400 font-semibold mt-0.5">{dayjs(project.createdAt).format('DD MMM YYYY, hh:mm A')}</p>
                  </div>
                  {project.expenses?.map((e: any, idx: number) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-rose-500 border-4 border-white" />
                      <p className="text-[13px] font-bold text-gray-800">Logged Expense: {e.description} (₹{e.amount})</p>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">{dayjs(e.date).format('DD MMM YYYY, hh:mm A')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right client metadata info panel (Matches Image 2 right column) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-[24px] p-6 bg-white border border-gray-200/50 space-y-6 shadow-sm">
            {/* User Profile Header */}
            <div className="text-center pb-6 border-b border-gray-100">
              <div className="w-18 h-18 rounded-full bg-[#fef2f2] text-[#e50914] font-bold flex items-center justify-center text-[28px] mx-auto shadow-sm">
                {project.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <h4 className="text-[16px] font-extrabold text-gray-800 mt-3">{project.name}</h4>
              <p className="text-[11px] text-[#e50914] font-bold uppercase tracking-wider mt-1">{project.eventType}</p>
              
              {/* Call/Mail buttons */}
              <div className="flex justify-center gap-3 mt-4">
                <a 
                  href={`tel:${project.phone}`}
                  className="p-2.5 bg-gray-50 border border-gray-200/50 hover:bg-gray-100 text-gray-600 rounded-full transition-colors shadow-sm"
                  title="Call Client"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a 
                  href={`mailto:${project.email}`}
                  className="p-2.5 bg-gray-50 border border-gray-200/50 hover:bg-gray-100 text-gray-600 rounded-full transition-colors shadow-sm"
                  title="Send Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Profile Grid values */}
            <div className="space-y-4 text-[13px]">
              <div>
                <span className="text-gray-400 block font-medium">Location</span>
                <span className="text-gray-700 font-bold flex items-center gap-1 mt-0.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  {project.location}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Event Date</span>
                <span className="text-gray-700 font-bold flex items-center gap-1 mt-0.5">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  {project.eventDate ? dayjs(project.eventDate).format('MMM DD, YYYY') : 'Not scheduled'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Case Owner</span>
                <span className="text-gray-700 font-bold mt-0.5">Arjun Owner</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Language Preference</span>
                <span className="text-gray-700 font-bold mt-0.5">English, Spanish</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Client Type</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-50 text-amber-600 border border-amber-100 mt-1">
                  Returning
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Lead Source</span>
                <span className="text-gray-700 font-bold mt-0.5">Referral</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Personal Notes</span>
                <p className="text-gray-500 font-semibold leading-relaxed mt-1 text-[12px] bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  {project.notes || 'No notes added for this case record.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowExpenseModal(false)} />
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Log Project Expense</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Date</label>
                <input 
                  type="date" 
                  value={expenseForm.date} 
                  onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                  className="w-full bg-transparent border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#e50914]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Description</label>
                <input 
                  type="text" 
                  value={expenseForm.description} 
                  onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                  className="w-full bg-transparent border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#e50914]"
                  placeholder="e.g. Camera lenses rental"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  value={expenseForm.amount} 
                  onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                  className="w-full bg-transparent border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#e50914]"
                  placeholder="e.g. 5000"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 text-[13px] font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddExpense}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-bold shadow-md cursor-pointer"
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Crew Modal */}
      {showCrewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCrewModal(false)} />
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Allocate Crew to Project</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Select Crew Member</label>
                <select 
                  value={crewForm.assignedCrewId} 
                  onChange={e => {
                    const selected = availableCrew.find(c => c._id === e.target.value);
                    setCrewForm({
                      ...crewForm,
                      assignedCrewId: e.target.value,
                      role: selected?.role || '',
                      charges: selected?.charges?.toString() || ''
                    });
                  }}
                  className="w-full bg-transparent border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#e50914]"
                >
                  <option value="">Select crew member...</option>
                  {availableCrew.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Role Blueprint</label>
                <input 
                  type="text" 
                  value={crewForm.role} 
                  onChange={e => setCrewForm({...crewForm, role: e.target.value})}
                  className="w-full bg-transparent border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#e50914]"
                  placeholder="e.g. Lead Shooter"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Charges (₹)</label>
                <input 
                  type="number" 
                  value={crewForm.charges} 
                  onChange={e => setCrewForm({...crewForm, charges: e.target.value})}
                  className="w-full bg-transparent border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#e50914]"
                  placeholder="e.g. 15000"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowCrewModal(false)}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 text-[13px] font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCrew}
                className="px-5 py-2 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-[13px] font-bold shadow-md shadow-red-500/20 cursor-pointer"
              >
                Assign Crew
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
