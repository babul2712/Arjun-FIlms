'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Users, 
  Phone, 
  MessageSquare, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Filter, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Film
} from 'lucide-react';
import { Project } from '@/lib/types';
import AnimatedCashAmount from '@/components/ui/AnimatedCashAmount';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import dayjs from 'dayjs';

interface PendingProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  projectPaidMap?: Record<string, number>;
  initialTab?: 'pending' | 'finished' | 'all';
  onSelectProject?: (p: Project) => void;
}

export default function PendingProjectsModal({
  isOpen,
  onClose,
  projects,
  projectPaidMap = {},
  initialTab = 'pending',
  onSelectProject
}: PendingProjectsModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'pending' | 'Booked' | 'In Production' | 'Lead' | 'Completed'>('pending');
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc' | 'value_desc' | 'name_asc'>('date_asc');

  // Compute processed project list
  const processedProjects = useMemo(() => {
    return projects.map(p => {
      const pId = String(p._id || p.id || '');
      const paid = projectPaidMap[pId] || 0;
      const total = Number(p.totalValue || (p as any).budget || (p as any).amount || 0);
      const due = Math.max(0, total - paid);
      const isCompleted = p.status === 'Completed';
      const isPending = !isCompleted;
      
      const eventDateStr = p.eventDate || (p as any).date || p.createdAt;
      const crewCount = (p.crewBlueprint || (p as any).crew || []).filter((c: any) => c.assignedCrewId || c.name || c.id).length;
      
      // Calculate days until event
      let daysUntil = null;
      if (eventDateStr) {
        const diff = dayjs(eventDateStr).startOf('day').diff(dayjs().startOf('day'), 'day');
        daysUntil = diff;
      }

      return {
        project: p,
        id: pId,
        projectNumber: p.projectNumber || 'CASE',
        name: p.name || 'Untitled Case',
        clientName: (p as any).clientName || p.name || 'Client',
        phone: p.phone || (p as any).clientPhone || (p as any).client?.phone || '',
        email: p.email || (p as any).clientEmail || (p as any).client?.email || '',
        location: p.location || 'Studio',
        eventType: p.eventType || 'Photography',
        status: p.status || 'Active',
        eventDate: eventDateStr,
        daysUntil,
        totalValue: total,
        paidAmount: paid,
        dueAmount: due,
        crewCount,
        services: p.services || [],
        isCompleted,
        isPending
      };
    });
  }, [projects, projectPaidMap]);

  // Summary KPI statistics
  const summary = useMemo(() => {
    const pendingList = processedProjects.filter(p => p.isPending);
    const finishedList = processedProjects.filter(p => p.isCompleted);
    const bookedList = processedProjects.filter(p => p.status === 'Booked');
    const inProdList = processedProjects.filter(p => p.status === 'In Production' || p.status === 'In Progress');
    const totalPendingValue = pendingList.reduce((acc, curr) => acc + curr.totalValue, 0);

    return {
      totalPendingCount: pendingList.length,
      totalFinishedCount: finishedList.length,
      bookedCount: bookedList.length,
      inProdCount: inProdList.length,
      totalPendingValue
    };
  }, [processedProjects]);

  // Filtered and sorted list
  const filteredList = useMemo(() => {
    return processedProjects
      .filter(item => {
        // Tab Filter
        if (statusTab === 'pending' && item.isCompleted) return false;
        if (statusTab === 'Completed' && !item.isCompleted) return false;
        if (statusTab === 'Booked' && item.status !== 'Booked') return false;
        if (statusTab === 'In Production' && item.status !== 'In Production' && item.status !== 'In Progress') return false;
        if (statusTab === 'Lead' && item.status !== 'Lead' && item.status !== 'Qualified' && item.status !== 'Negotiation') return false;

        // Search Filter
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
        if (sortBy === 'value_desc') return b.totalValue - a.totalValue;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'date_asc') {
          const dateA = a.eventDate ? new Date(a.eventDate).getTime() : Infinity;
          const dateB = b.eventDate ? new Date(b.eventDate).getTime() : Infinity;
          return dateA - dateB;
        }
        if (sortBy === 'date_desc') {
          const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
          const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
          return dateB - dateA;
        }
        return 0;
      });
  }, [processedProjects, statusTab, searchQuery, sortBy]);

  if (!isOpen) return null;

  const handleSendWhatsApp = (item: any) => {
    const rawPhone = item.phone.replace(/[^0-9]/g, '');
    if (!rawPhone) {
      toast.error('No phone number on record for this client.');
      return;
    }
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const msg = encodeURIComponent(
      `Hello ${item.name},\n\nGreetings from ARJUN FILMS!\n\nRegarding your upcoming *${item.eventType}* project (${item.projectNumber}):\n📅 Shoot Date: ${item.eventDate ? dayjs(item.eventDate).format('DD MMM YYYY') : 'TBD'}\n📍 Venue: ${item.location}\n\nPlease let us know if you have any questions or ritual timing updates.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md animate-fade-in font-sans text-gray-800 dark:text-gray-100"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4.5xl bg-white dark:bg-[#15181e] border border-gray-200 dark:border-gray-800 rounded-[32px] p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow styling */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800/80 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#e50914] dark:text-red-400 border border-red-200/80 dark:border-red-900/50 flex items-center justify-center shadow-xs">
              <Briefcase className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[19px] font-black text-gray-900 dark:text-white">
                  Pending & Active Projects Breakdown
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#e50914] text-white shadow-xs">
                  {summary.totalPendingCount} Active Cases
                </span>
              </div>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                Real-time tracking of ongoing shoot bookings, crew assignments, timelines & delivery stages
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

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 relative z-10">
          <div className="bg-gradient-to-br from-red-50 via-white to-red-50/40 dark:from-red-950/30 dark:via-[#1a1e26] dark:to-red-950/15 p-3.5 rounded-2xl border border-red-200/80 dark:border-red-900/40 shadow-xs flex flex-col justify-between">
            <span className="text-[10.5px] font-bold text-[#e50914] dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Pending Projects
            </span>
            <div className="mt-1">
              <span className="text-[20px] font-black text-[#e50914] dark:text-red-400">
                {summary.totalPendingCount}
              </span>
              <span className="text-[10.5px] text-gray-400 font-medium block">
                In-progress shoot pipeline
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1e26] p-3.5 rounded-2xl border border-gray-200/70 dark:border-gray-800 shadow-xs flex flex-col justify-between">
            <span className="text-[10.5px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Booked Shoots
            </span>
            <div className="mt-1">
              <span className="text-[20px] font-black text-amber-600 dark:text-amber-400">
                {summary.bookedCount}
              </span>
              <span className="text-[10.5px] text-gray-400 font-medium block">
                Confirmed upcoming dates
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1e26] p-3.5 rounded-2xl border border-gray-200/70 dark:border-gray-800 shadow-xs flex flex-col justify-between">
            <span className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              In Production
            </span>
            <div className="mt-1">
              <span className="text-[20px] font-black text-blue-600 dark:text-blue-400">
                {summary.inProdCount}
              </span>
              <span className="text-[10.5px] text-gray-400 font-medium block">
                Editing & color grading
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:via-[#1a1e26] dark:to-emerald-950/15 p-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 shadow-xs flex flex-col justify-between">
            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pipeline Value
            </span>
            <div className="mt-1">
              <span className="text-[20px] font-black text-emerald-600 dark:text-emerald-400">
                ₹{summary.totalPendingValue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10.5px] text-gray-400 font-medium block">
                Total active project contracts
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 relative z-10">
          {/* Search Box */}
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, case ID, ritual, venue..."
              className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-[#1a1e26] border border-gray-200/80 dark:border-gray-800 rounded-xl text-[12.5px] font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-red-500 focus:bg-white dark:focus:bg-[#16181c] transition-all placeholder:text-gray-400"
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

          {/* Quick Tabs & Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status tabs */}
            <div className="flex bg-gray-100 dark:bg-[#1a1e26] p-0.5 rounded-xl border border-gray-200/60 dark:border-gray-800 text-[11px] font-bold">
              {[
                { id: 'pending', label: 'All Pending' },
                { id: 'Booked', label: 'Booked' },
                { id: 'In Production', label: 'In Production' },
                { id: 'Lead', label: 'Leads' },
                { id: 'Completed', label: 'Completed' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    statusTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-[#e50914] dark:text-red-400 shadow-xs font-extrabold'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort selection */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-gray-50 dark:bg-[#1a1e26] border border-gray-200/80 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-[11.5px] font-bold py-1.5 px-3 rounded-xl focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="date_asc">Nearest Event Date</option>
              <option value="date_desc">Latest Event Date</option>
              <option value="value_desc">Highest Value First</option>
              <option value="name_asc">Client Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Scrollable Projects List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 custom-scrollbar relative z-10">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-[#1a1e26]/40">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">
                {searchQuery ? 'No matching projects found' : 'No projects found in this status'}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {searchQuery ? 'Try clearing your search terms or filter.' : 'All projects are updated.'}
              </p>
            </div>
          ) : (
            filteredList.map(item => {
              const formattedDate = item.eventDate 
                ? dayjs(item.eventDate).format('DD MMM YYYY') 
                : 'Date TBD';

              const statusBadgeColor = 
                item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40' :
                item.status === 'Booked' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40' :
                item.status === 'In Production' || item.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40' :
                'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/40';

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#181a20] border border-gray-200/80 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-800/80 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md group"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    
                    {/* Left: Case Info, Client, Venue & Dates */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-[#e50914] dark:text-red-400 border border-red-200/70 dark:border-red-900/40">
                          {item.projectNumber}
                        </span>
                        <h3 className="text-[15px] font-extrabold text-gray-900 dark:text-white truncate">
                          {item.name}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadgeColor}`}>
                          {item.status}
                        </span>

                        {item.daysUntil !== null && !item.isCompleted && (
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            item.daysUntil === 0 
                              ? 'bg-red-500 text-white animate-pulse'
                              : item.daysUntil > 0 && item.daysUntil <= 7
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : item.daysUntil < 0
                              ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          }`}>
                            {item.daysUntil === 0 ? 'Today Shoot' : item.daysUntil > 0 ? `In ${item.daysUntil} days` : `${Math.abs(item.daysUntil)} days ago`}
                          </span>
                        )}
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
                        {item.crewCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                              <Users className="w-3.5 h-3.5" />
                              {item.crewCount} Crew Assigned
                            </span>
                          </>
                        )}
                      </div>

                      {/* Milestone Stages preview if any */}
                      {item.services && item.services.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                          {item.services.slice(0, 4).map((stage, idx) => (
                            <span 
                              key={idx} 
                              className={`text-[9.5px] px-2 py-0.5 rounded-md font-semibold ${
                                stage.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : stage.status === 'In Progress'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 animate-pulse'
                                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              {stage.name}
                            </span>
                          ))}
                          {item.services.length > 4 && (
                            <span className="text-[9.5px] text-gray-400 font-bold">
                              +{item.services.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Financial Info & Balance */}
                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-100 dark:border-gray-800/80 pt-3 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                          Contract Value
                        </span>
                        <span className="text-[17px] font-black text-gray-900 dark:text-white block leading-tight">
                          ₹{item.totalValue.toLocaleString('en-IN')}
                        </span>
                        <span className={`text-[10.5px] font-bold block ${
                          item.dueAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {item.dueAmount > 0 ? `₹${item.dueAmount.toLocaleString('en-IN')} Due` : 'Fully Paid'}
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            router.push(`/projects/${item.id}`);
                          }}
                          className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-[#e50914] hover:text-white text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                          title="Open Case"
                        >
                          <ArrowUpRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      {item.phone && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(item)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200/60 transition-all cursor-pointer"
                            title="Chat with client on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
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
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          router.push(`/projects/${item.id}`);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-[#e50914] hover:bg-red-700 px-3 py-1 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <span>View Project Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
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
            Showing {filteredList.length} of {processedProjects.length} project cases
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/projects');
            }}
            className="text-[#e50914] font-bold hover:underline cursor-pointer flex items-center gap-1 text-[12px]"
          >
            <span>Go to all Projects & Cases</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
