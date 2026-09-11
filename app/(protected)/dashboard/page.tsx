'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getProjects, getDashboardStats, getPayments } from '@/services/api';
import { Project } from '@/lib/types';
import { 
  Search, 
  Plus, 
  CreditCard, 
  Shield, 
  Wallet, 
  ArrowUpRight, 
  ExternalLink, 
  X, 
  Star, 
  Calendar, 
  AlertCircle, 
  Grid, 
  Users, 
  FileText, 
  UserCheck, 
  UserMinus, 
  Briefcase, 
  Link2,
  LayoutGrid,
  List,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import ProjectCard from '@/components/dashboard/ProjectCard';
import ProjectListView from '@/components/dashboard/ProjectListView';
import FiltersPanel from '@/components/dashboard/FiltersPanel';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import CalendarView from './components/CalendarView';
import UniversalSearchBar from '@/components/search/UniversalSearchBar';
import AnimatedCashAmount from '@/components/ui/AnimatedCashAmount';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import dayjs from 'dayjs';

const MONTH_OPTIONS = [
  { value: 'all', label: 'All Months' },
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' }
];

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggleFilterPanel } = useUIStore();
  const { user } = useAuthStore();
  
  // Database stats & collections
  const [stats, setStats] = useState({
    totalQuotations: 0,
    totalBookings: 0,
    pendingPaymentsAmount: 0,
    revenue: 0,
    totalProjects: 0,
    finishedProjects: 0,
    pendingProjects: 0,
    totalCrew: 0,
    totalCrewAssigned: 0,
    totalCrewNotAssigned: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [rawPayments, setRawPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Month & Year Filter State
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [showTimeFilter, setShowTimeFilter] = useState(false);

  // Toggle card states
  const [showBookings, setShowBookings] = useState(false);
  const [showFinished, setShowFinished] = useState(false);

  // Cases lists tab & details drawer state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'active' | 'leads' | 'starred'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<any | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const loadData = async () => {
    try {
      const [statsData, projectsData, paymentsData] = await Promise.all([
        getDashboardStats(),
        getProjects(),
        getPayments()
      ]);
      setStats(statsData);
      setProjects(projectsData || []);
      setRawPayments(paymentsData || []);
    } catch (e) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Safe Date parsing helper to prevent timezone shifts across UTC/Local
  const getEntryDateInfo = (dateVal: any) => {
    if (!dateVal) return null;
    if (typeof dateVal === 'string' && dateVal.includes('-')) {
      const cleanStr = dateVal.split('T')[0];
      const parts = cleanStr.split('-');
      if (parts.length >= 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1; // 0-indexed month
        if (!isNaN(y) && !isNaN(m)) {
          return { year: y, month: m };
        }
      }
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    return { year: d.getFullYear(), month: d.getMonth() };
  };

  // Compute available unique years from projects and payments
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    const currentYear = new Date().getFullYear();
    yearsSet.add(String(currentYear));
    projects.forEach(p => {
      const d = p.eventDate || (p as any).date || p.createdAt;
      if (d) {
        const info = getEntryDateInfo(d);
        if (info && !isNaN(info.year)) yearsSet.add(String(info.year));
      }
    });
    rawPayments.forEach(pay => {
      const d = pay.date || pay.createdAt;
      if (d) {
        const info = getEntryDateInfo(d);
        if (info && !isNaN(info.year)) yearsSet.add(String(info.year));
      }
    });
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [projects, rawPayments]);

  // Filter projects by selected Month & Year
  const filteredProjectsByDate = useMemo(() => {
    return projects.filter(p => {
      if (selectedMonth === 'all' && selectedYear === 'all') return true;
      const targetDate = p.eventDate || (p as any).date || p.createdAt;
      if (!targetDate) return true;
      const info = getEntryDateInfo(targetDate);
      if (!info) return true;

      const matchMonth = selectedMonth === 'all' || info.month === parseInt(selectedMonth, 10);
      const matchYear = selectedYear === 'all' || String(info.year) === selectedYear;
      return matchMonth && matchYear;
    });
  }, [projects, selectedMonth, selectedYear]);

  // Filter payments by selected Month & Year
  const filteredPaymentsByDate = useMemo(() => {
    return rawPayments.filter(pay => {
      if (selectedMonth === 'all' && selectedYear === 'all') return true;
      const targetDate = pay.date || pay.createdAt;
      if (!targetDate) return true;
      const info = getEntryDateInfo(targetDate);
      if (!info) return true;

      const matchMonth = selectedMonth === 'all' || info.month === parseInt(selectedMonth, 10);
      const matchYear = selectedYear === 'all' || String(info.year) === selectedYear;
      return matchMonth && matchYear;
    });
  }, [rawPayments, selectedMonth, selectedYear]);

  // Dynamically compute filtered Dashboard Stats
  const displayStats = useMemo(() => {
    if (selectedMonth === 'all' && selectedYear === 'all') {
      return stats;
    }

    const filteredRevenue = filteredPaymentsByDate
      .filter(p => p.status === 'Verified' || p.status === 'PAID')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const filteredPending = filteredProjectsByDate.reduce((sum, p) => {
      const total = Number(p.totalValue || (p as any).budget || (p as any).amount || 0);
      const paid = Number((p as any).paidAmount || (p as any).receivedAmount || 0);
      return sum + Math.max(0, total - paid);
    }, 0);

    const totalProjects = filteredProjectsByDate.length;
    const finishedProjects = filteredProjectsByDate.filter(p => p.status === 'Completed').length;
    const pendingProjects = filteredProjectsByDate.filter(p => p.status !== 'Completed').length;
    const totalBookings = filteredProjectsByDate.filter(p => p.status === 'Booked' || p.status === 'Completed').length;
    const totalQuotations = filteredProjectsByDate.filter(p => p.status === 'Lead' || p.status === 'Qualified' || p.status === 'Negotiation').length;

    const assignedCrewSet = new Set<string>();
    filteredProjectsByDate.forEach(p => {
      (p.crewBlueprint || (p as any).crew || []).forEach((c: any) => {
        if (c.assignedCrewId || c.memberId || c.id || c.name) {
          assignedCrewSet.add(c.assignedCrewId || c.memberId || c.id || c.name);
        }
      });
    });

    return {
      ...stats,
      revenue: filteredRevenue,
      pendingPaymentsAmount: filteredPending,
      totalProjects,
      finishedProjects,
      pendingProjects,
      totalBookings,
      totalQuotations,
      totalCrewAssigned: assignedCrewSet.size,
      totalCrewNotAssigned: Math.max(0, stats.totalCrew - assignedCrewSet.size)
    };
  }, [stats, filteredProjectsByDate, filteredPaymentsByDate, selectedMonth, selectedYear]);

  // Compute 12-month revenue curve based on selected year (or current year)
  const displayMonthlyRevenue = useMemo(() => {
    const targetYear = selectedYear !== 'all' ? parseInt(selectedYear, 10) : new Date().getFullYear();
    const monthlySums = new Array(12).fill(0);
    rawPayments.forEach(pay => {
      if (pay.status === 'Verified' || pay.status === 'PAID') {
        const info = getEntryDateInfo(pay.date || pay.createdAt);
        if (info && (selectedYear === 'all' || info.year === targetYear)) {
          monthlySums[info.month] += Number(pay.amount) || 0;
        }
      }
    });
    return monthlySums;
  }, [rawPayments, selectedYear]);

  // Filter functionality
  const applyFiltering = (dataList: Project[], tab: 'active' | 'leads' | 'starred', search: string) => {
    let filtered = [...dataList];
    
    // Tab filter
    if (tab === 'active') {
      filtered = filtered.filter(p => p.status === 'Booked' || p.status === 'Completed' || p.status === 'Negotiation');
    } else if (tab === 'leads') {
      filtered = filtered.filter(p => p.status === 'Lead' || p.status === 'Qualified');
    } else if (tab === 'starred') {
      filtered = filtered.filter(p => p.isStarred);
    }

    // Search query filter with multi-field matching
    if (search.trim() !== '') {
      const query = search.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(query)) || 
        (p.eventType && p.eventType.toLowerCase().includes(query)) ||
        (p.location && p.location.toLowerCase().includes(query)) ||
        (p.phone && p.phone.toLowerCase().includes(query)) ||
        (p.email && p.email.toLowerCase().includes(query)) ||
        (p.company && p.company.toLowerCase().includes(query)) ||
        (p.status && p.status.toLowerCase().includes(query)) ||
        (p.notes && p.notes.toLowerCase().includes(query))
      );
    }

    setFilteredProjects(filtered);
  };

  // Sync filtered projects whenever date filter, tab, or search query changes
  useEffect(() => {
    applyFiltering(filteredProjectsByDate, activeTab, searchQuery);
  }, [filteredProjectsByDate, activeTab, searchQuery]);

  const handleTabChange = (tab: 'active' | 'leads' | 'starred') => {
    setActiveTab(tab);
    setSelectedProject(null); // Clear drawer focus
  };

  const handleStarToggle = (projectId: string, isStarred: boolean) => {
    setProjects(prev => {
      const updated = prev.map(p => (p._id === projectId || p.id === projectId) ? { ...p, isStarred } : p);
      applyFiltering(updated, activeTab, searchQuery);
      return updated;
    });
    if (selectedProject && (selectedProject._id === projectId || selectedProject.id === projectId)) {
      setSelectedProject(prev => prev ? { ...prev, isStarred } : null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    applyFiltering(projects, activeTab, val);
  };

  const handleFilterChange = (filters: any) => {
    let list = [...projects];
    if (filters.nationality) {
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(filters.nationality.toLowerCase())) || 
        (p.location && p.location.toLowerCase().includes(filters.nationality.toLowerCase()))
      );
    }
    applyFiltering(list, activeTab, searchQuery);
  };

  const handleMilestoneHover = (milestone: any, rect: DOMRect | null) => {
    if (milestone && rect) {
      setHoveredMilestone(milestone);
      setTooltipPos({
        top: window.scrollY + rect.top - 70, 
        left: window.scrollX + rect.left - 100
      });
    } else {
      setHoveredMilestone(null);
      setTooltipPos(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Request client authorization':
      case 'Blue':
        return 'bg-[#fef2f2] text-[#e50914] border border-[#fee2e2] dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      case 'Assemble Packet':
      case 'Yellow':
      case 'Orange':
        return 'bg-[#fff4e5] text-[#c56000] border border-[#ffe4cc] dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-905/30';
      case 'Attorney review FOIA':
      case 'Red':
      case 'Urgent':
        return 'bg-[#fce8e6] text-[#d93025] border border-[#fad2cf] dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-905/30';
      case 'Completed':
      case 'Verified':
      case 'Approved':
      case 'Green':
        return 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6] dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-905/30';
      default:
        return 'bg-gray-50 text-gray-500 border border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Dynamic values based on selected period
  const selectedMonthNum = selectedMonth !== 'all' ? parseInt(selectedMonth, 10) : new Date().getMonth();
  const maxRevenueVal = Math.max(...displayMonthlyRevenue, 1000);
  const totalProjectContractsValue = displayStats.revenue + displayStats.pendingPaymentsAmount;

  return (
    <div className="min-h-screen bg-transparent text-gray-808 dark:text-white p-6 md:p-8 font-sans -m-6 md:-m-10">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left / Main Dashboard section (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Row: Welcome Greetings & Search + Time Filter Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-[28px] md:text-[34px] font-extrabold tracking-tight text-gray-800 dark:text-white leading-tight">
                Good morning, {user?.name === 'System Admin' ? 'arjun' : (user?.name || 'Oripio')}
              </h1>
              <p className="text-[13px] text-gray-400 dark:text-gray-400 font-bold mt-1">
                Stay on top of your tasks, monitor progress, and track status.
              </p>
            </div>
            
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="w-full md:w-80">
                <UniversalSearchBar placeholder="Search cases, crew, quotes..." />
              </div>

              {/* Time Filter Button on the Right Side of Search Bar */}
              <button
                type="button"
                onClick={() => setShowTimeFilter(prev => !prev)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border shrink-0 ${
                  showTimeFilter || selectedMonth !== 'all' || selectedYear !== 'all'
                    ? 'bg-gradient-to-r from-[#e50914] to-red-600 text-white border-[#e50914] shadow-md shadow-red-500/20'
                    : 'bg-white dark:bg-[#16181f] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-xs'
                }`}
                title="Toggle Date Filter"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {selectedMonth === 'all' && selectedYear === 'all'
                    ? 'Time Filter'
                    : `${selectedMonth !== 'all' ? MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label : 'All'} ${selectedYear !== 'all' ? selectedYear : ''}`}
                </span>
                {(selectedMonth !== 'all' || selectedYear !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showTimeFilter ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 📅 TOP MONTH & YEAR FILTER TOOLBAR (Toggled by button)      */}
          {/* ========================================================= */}
          {showTimeFilter && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200 flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 bg-white/90 dark:bg-[#16181f]/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-800/80 rounded-[26px] shadow-sm">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Filter Label */}
                <div className="flex items-center gap-1.5 text-xs font-black text-gray-800 dark:text-gray-100 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#e50914] flex items-center justify-center shadow-2xs">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span>Time Filter:</span>
                </div>

                {/* Month Dropdown */}
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="appearance-none bg-gray-50 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-gray-800 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer transition-all shadow-2xs"
                  >
                    {MONTH_OPTIONS.map(m => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="appearance-none bg-gray-50 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-gray-800 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer transition-all shadow-2xs"
                  >
                    <option value="all">All Years</option>
                    {availableYears.map(yr => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Quick Filter Presets */}
                <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => { setSelectedMonth('all'); setSelectedYear('all'); }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      selectedMonth === 'all' && selectedYear === 'all'
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-2xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    All Time
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      setSelectedMonth(String(now.getMonth()));
                      setSelectedYear(String(now.getFullYear()));
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      selectedMonth === String(new Date().getMonth()) && selectedYear === String(new Date().getFullYear())
                        ? 'bg-[#e50914] text-white shadow-2xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    This Month
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      setSelectedMonth('all');
                      setSelectedYear(String(now.getFullYear()));
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      selectedMonth === 'all' && selectedYear === String(new Date().getFullYear())
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    This Year
                  </button>
                </div>
              </div>

              {/* Filter Summary Badge & Close */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  Active Period:
                </span>
                <span className="font-extrabold text-[#e50914] bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-xl border border-red-200/80 dark:border-red-900/60 flex items-center gap-1.5 shadow-2xs">
                  <span>
                    {selectedMonth === 'all' && selectedYear === 'all' 
                      ? 'All Time' 
                      : `${selectedMonth !== 'all' ? MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label : 'All Months'} ${selectedYear !== 'all' ? selectedYear : ''}`}
                  </span>
                  <span className="text-[10px] bg-[#e50914] text-white px-1.5 py-0.2 rounded-full font-black">
                    {filteredProjectsByDate.length} cases
                  </span>
                </span>

                {(selectedMonth !== 'all' || selectedYear !== 'all') && (
                  <button
                    type="button"
                    onClick={() => { setSelectedMonth('all'); setSelectedYear('all'); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    title="Reset Period Filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowTimeFilter(false)}
                  className="ml-1 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Hide Time Filter"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Bento Grid: Smart Wallet & Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Smart Wallet Card (5 columns) */}
            <div className="md:col-span-5 bg-gradient-to-br from-[#fdfbfb] via-white to-red-50/25 dark:from-[#16181f] dark:via-[#121418] dark:to-[#0d0e12] border border-gray-200/80 dark:border-gray-800/80 shadow-md rounded-[32px] p-6 flex flex-col justify-between min-h-[240px] relative overflow-hidden group hover:border-[#e50914]/40 transition-all duration-300">
              {/* Ambient Top-Right Corner Glow */}
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-[#e50914]/10 dark:bg-[#e50914]/15 rounded-full blur-2xl pointer-events-none group-hover:bg-[#e50914]/20 transition-all" />

              <div className="relative z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#e50914]/15 to-red-500/5 text-[#e50914] dark:text-[#8efa1d] border border-[#e50914]/20 flex items-center justify-center shadow-sm">
                      <Wallet className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[15px] font-black text-gray-900 dark:text-white leading-tight">Smart Wallet</h4>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                        {selectedMonth !== 'all' || selectedYear !== 'all' ? 'Filtered Period Revenue' : 'Live Studio Revenue'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push('/projects/create')}
                    className="text-[11px] font-extrabold text-gray-700 dark:text-gray-300 hover:text-white hover:bg-[#e50914] px-3.5 py-1.5 bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Case</span>
                  </button>
                </div>
                
                <div className="mt-5">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black tracking-widest uppercase block mb-1">
                    {selectedMonth !== 'all' || selectedYear !== 'all' ? 'Period Received Revenue' : 'Total Studio Revenue'}
                  </span>
                  <div className="text-[30px] font-black text-[#1a1c22] dark:text-white leading-none tracking-tight">
                    <AnimatedCashAmount amount={displayStats.revenue} sparkle={true} showSparkleBadge={true} />
                  </div>
                </div>
              </div>

              {/* Bottom Quick Tiles (Crew Roster Stats) */}
              <div className="grid grid-cols-3 gap-2.5 mt-4 relative z-10">
                <div className="bg-blue-50/70 dark:bg-blue-950/25 border border-blue-100/80 dark:border-blue-900/40 rounded-2xl p-2.5 flex flex-col justify-center text-center transition-all hover:scale-[1.02]">
                  <div className="w-6 h-6 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 mx-auto mb-1 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-[14px] font-black text-blue-950 dark:text-blue-200 leading-none block">{displayStats.totalCrew}</span>
                  <span className="text-[8.5px] font-extrabold text-blue-700/80 dark:text-blue-400/80 block mt-1 uppercase tracking-wider truncate">Total Crew</span>
                </div>
                <div className="bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl p-2.5 flex flex-col justify-center text-center transition-all hover:scale-[1.02]">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto mb-1 flex items-center justify-center">
                    <UserCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-[14px] font-black text-emerald-950 dark:text-emerald-200 leading-none block">{displayStats.totalCrewAssigned}</span>
                  <span className="text-[8.5px] font-extrabold text-emerald-700/80 dark:text-emerald-400/80 block mt-1 uppercase tracking-wider truncate">Assigned</span>
                </div>
                <div className="bg-rose-50/70 dark:bg-rose-950/25 border border-rose-100/80 dark:border-rose-900/40 rounded-2xl p-2.5 flex flex-col justify-center text-center transition-all hover:scale-[1.02]">
                  <div className="w-6 h-6 rounded-full bg-rose-500/15 text-[#e50914] dark:text-rose-400 mx-auto mb-1 flex items-center justify-center">
                    <UserMinus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-[14px] font-black text-rose-950 dark:text-rose-200 leading-none block">{displayStats.totalCrewNotAssigned}</span>
                  <span className="text-[8.5px] font-extrabold text-rose-700/80 dark:text-rose-400/80 block mt-1 uppercase tracking-wider truncate">Unassigned</span>
                </div>
              </div>
            </div>

            {/* Metric Cards (7 columns) */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Payments Received */}
              <div className="bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 dark:from-emerald-950/20 dark:via-[#16181c] dark:to-emerald-950/10 border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm shadow-emerald-500/5 rounded-[28px] p-5 flex flex-col justify-between h-[115px] relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-sm shadow-emerald-500/10">
                    <Wallet className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-[18px] font-black text-emerald-600 dark:text-emerald-400">
                    <AnimatedCashAmount amount={displayStats.revenue} />
                  </h3>
                  <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-bold uppercase tracking-wider block mt-0.5">Payments Recv.</span>
                </div>
              </div>

              {/* Card 2: Pending Payments */}
              <div className="bg-gradient-to-br from-rose-50/70 via-white to-rose-50/30 dark:from-rose-950/20 dark:via-[#16181c] dark:to-rose-950/10 border border-rose-200/60 dark:border-rose-900/40 shadow-sm shadow-rose-500/5 rounded-[28px] p-5 flex flex-col justify-between h-[115px] relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-rose-500/15 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-sm shadow-rose-500/10">
                    <CreditCard className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[9px] text-rose-600 dark:text-rose-400 font-extrabold uppercase bg-rose-500/10 dark:bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/20">
                    Due
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-[18px] font-black text-rose-600 dark:text-rose-400">
                    <AnimatedCashAmount amount={displayStats.pendingPaymentsAmount} />
                  </h3>
                  <span className="text-[10px] text-rose-700/80 dark:text-rose-400/80 font-bold uppercase tracking-wider block mt-0.5">Pending Pay</span>
                </div>
              </div>

              {/* Card 3: Quotations / Bookings Toggle Card */}
              <div 
                className={`border shadow-sm rounded-[28px] p-5 flex flex-col justify-between h-[115px] relative overflow-hidden transition-all duration-300 ${
                  showBookings
                    ? 'bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 dark:from-amber-950/30 dark:via-[#16181c] dark:to-amber-950/20 border-amber-200/80 dark:border-amber-900/50 shadow-amber-500/5'
                    : 'bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 dark:from-blue-950/30 dark:via-[#16181c] dark:to-blue-950/20 border-blue-200/80 dark:border-blue-900/50 shadow-blue-500/5'
                }`}
              >
                {/* Decorative Half-Circle Corner Display / Glow */}
                <div 
                  className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-xl pointer-events-none transition-all ${
                    showBookings ? 'bg-amber-500/20' : 'bg-blue-500/20'
                  }`} 
                />

                <div className="flex justify-between items-start w-full relative z-10">
                  {/* Miniature toggle switch */}
                  <div className="flex bg-white/90 dark:bg-[#24272c] p-0.5 rounded-lg border border-gray-200/60 dark:border-gray-800/60 text-[9px] font-bold shadow-xs">
                    <button 
                      type="button"
                      onClick={() => setShowBookings(false)}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        !showBookings 
                          ? 'bg-blue-600 text-white shadow-sm font-extrabold' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      Quotes
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowBookings(true)}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        showBookings 
                          ? 'bg-amber-500 text-white shadow-sm font-extrabold' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      Bookings
                    </button>
                  </div>
                  
                  {/* Rounded Corner Half-Circle Display Icon Badge */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 border ${
                      showBookings 
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-sm shadow-amber-500/15' 
                        : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 shadow-sm shadow-blue-500/15'
                    }`}
                  >
                    {showBookings ? (
                      <Calendar className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <FileText className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>
                </div>
                
                <div className="relative z-10">
                  <h3 
                    className={`text-[18px] font-black mt-1 transition-colors ${
                      showBookings 
                        ? 'text-amber-600 dark:text-amber-400' 
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {showBookings ? displayStats.totalBookings : displayStats.totalQuotations}
                  </h3>
                  <span 
                    className={`text-[10px] font-extrabold uppercase tracking-wider block mt-0.5 transition-colors ${
                      showBookings 
                        ? 'text-amber-700/80 dark:text-amber-400/80' 
                        : 'text-blue-700/80 dark:text-blue-400/80'
                    }`}
                  >
                    {showBookings ? 'Total Bookings' : 'Total Quotations'}
                  </span>
                </div>
              </div>

              {/* Card 4: Pending / Finished Projects Toggle Card */}
              <div 
                className={`border shadow-sm rounded-[28px] p-5 flex flex-col justify-between h-[115px] relative overflow-hidden transition-all duration-300 ${
                  showFinished
                    ? 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 dark:from-emerald-950/30 dark:via-[#16181c] dark:to-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/50 shadow-emerald-500/5'
                    : 'bg-gradient-to-br from-red-50/90 via-white to-red-50/40 dark:from-red-950/30 dark:via-[#16181c] dark:to-red-950/20 border-red-200/80 dark:border-red-900/50 shadow-red-500/5'
                }`}
              >
                {/* Decorative Half-Circle Corner Display / Glow */}
                <div 
                  className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-xl pointer-events-none transition-all ${
                    showFinished ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`} 
                />

                <div className="flex justify-between items-start w-full relative z-10">
                  {/* Miniature toggle switch */}
                  <div className="flex bg-white/90 dark:bg-[#24272c] p-0.5 rounded-lg border border-gray-200/60 dark:border-gray-800/60 text-[9px] font-bold shadow-xs">
                    <button 
                      type="button"
                      onClick={() => setShowFinished(false)}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        !showFinished 
                          ? 'bg-[#e50914] text-white shadow-sm font-extrabold' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      Pending
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowFinished(true)}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        showFinished 
                          ? 'bg-emerald-600 text-white shadow-sm font-extrabold' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      Finished
                    </button>
                  </div>
                  
                  {/* Rounded Corner Half-Circle Display Icon Badge */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 border ${
                      showFinished 
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/15' 
                        : 'bg-red-500/15 text-[#e50914] dark:text-red-400 border-red-500/30 shadow-sm shadow-red-500/15'
                    }`}
                  >
                    {showFinished ? (
                      <Shield className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Briefcase className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>
                </div>
                
                <div className="relative z-10">
                  <h3 
                    className={`text-[18px] font-black mt-1 transition-colors ${
                      showFinished 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-[#e50914] dark:text-red-400'
                    }`}
                  >
                    {showFinished ? displayStats.finishedProjects : displayStats.pendingProjects}
                  </h3>
                  <span 
                    className={`text-[10px] font-extrabold uppercase tracking-wider block mt-0.5 transition-colors ${
                      showFinished 
                        ? 'text-emerald-700/80 dark:text-emerald-400/80' 
                        : 'text-red-700/80 dark:text-red-400/80'
                    }`}
                  >
                    {showFinished ? 'Finished Projects' : 'Pending Projects'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Shoot Calendar View (Glassmorphic) */}
          <div className="bg-white/75 dark:bg-[#16181c]/75 backdrop-blur-2xl border border-white/80 dark:border-gray-800/80 rounded-[32px] p-6 sm:p-7 relative overflow-hidden transition-all group">
            {/* Ambient Background Glow Accents */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-red-500/10 dark:bg-red-600/15 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/15 transition-all" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <CalendarView projects={projects} />
            </div>
          </div>

        </div>

        {/* Right Panel section (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Minimalist Studio Cash / Treasury Card */}
          <div className="bg-gradient-to-br from-[#16181f] via-[#111317] to-[#0a0b0d] border border-gray-800/80 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[175px] group hover:border-[#e50914]/40 transition-all duration-300">
            {/* Ambient Red Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e50914]/10 rounded-full blur-2xl group-hover:bg-[#e50914]/15 transition-all pointer-events-none" />

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">Studio Cash Flow</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                Live Treasury
              </span>
            </div>
            
            <div className="my-3">
              <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block">Total Received Balance</span>
              <div className="text-[26px] font-black tracking-tight text-white mt-1 flex items-baseline gap-2">
                <AnimatedCashAmount amount={displayStats.revenue} colorScheme="white" sparkle={true} />
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  Verified
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-800/60 pt-3 text-[11px]">
              <span className="text-gray-400 font-medium truncate max-w-[170px]">
                SBI •••• 7096
              </span>
              <button 
                onClick={() => router.push('/payments')}
                className="text-[11px] font-extrabold text-[#e50914] hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                Payments <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cash Flow Bar Chart Under Visa Card */}
          <div className="bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 shadow-sm rounded-[32px] p-6 relative">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-[14px] font-extrabold text-gray-800 dark:text-white">Cash Flow</h4>
                <h2 className="text-[22px] font-black text-[#1a1c22] dark:text-white mt-1">
                  <AnimatedCashAmount amount={totalProjectContractsValue} />
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#fdf2f2] dark:bg-gray-800/40 border border-gray-200/65 dark:border-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300 rounded-xl">
                  {selectedYear !== 'all' ? selectedYear : 'Yearly'}
                </span>
              </div>
            </div>

            {/* Legend indicators */}
            <div className="flex items-center gap-3 mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800/40 pb-3">
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-[#8efa1d]' : 'bg-[#e50914]'}`} />
                Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600" />
                Expense
              </span>
            </div>

            {/* Columns chart canvas */}
            <div className="h-40 flex items-end justify-between pt-8 px-1 relative mt-2">
              {/* Tooltip over active month bar */}
              <div 
                className="absolute bg-[#0a0b0d] border border-gray-800 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-lg shadow-2xl z-20 pointer-events-none transition-all duration-300"
                style={{ bottom: '130px', left: `${3 + selectedMonthNum * 8.0}%` }}
              >
                <AnimatedCashAmount amount={displayMonthlyRevenue[selectedMonthNum]} colorScheme="white" />
              </div>

              {/* Monthly columns values array */}
              {[
                { m: 'Jan', val: displayMonthlyRevenue[0] },
                { m: 'Feb', val: displayMonthlyRevenue[1] },
                { m: 'Mar', val: displayMonthlyRevenue[2] },
                { m: 'Apr', val: displayMonthlyRevenue[3] },
                { m: 'May', val: displayMonthlyRevenue[4] },
                { m: 'Jun', val: displayMonthlyRevenue[5] },
                { m: 'Jul', val: displayMonthlyRevenue[6] },
                { m: 'Aug', val: displayMonthlyRevenue[7] },
                { m: 'Sep', val: displayMonthlyRevenue[8] },
                { m: 'Oct', val: displayMonthlyRevenue[9] },
                { m: 'Nov', val: displayMonthlyRevenue[10] },
                { m: 'Dec', val: displayMonthlyRevenue[11] },
              ].map((bar, i) => {
                const isActive = i === selectedMonthNum;
                const heightPercent = Math.min(90, Math.max(10, (bar.val / maxRevenueVal) * 90));
                
                return (
                  <div 
                    key={i} 
                    onClick={() => setSelectedMonth(String(i))}
                    className="flex flex-col items-center flex-1 group cursor-pointer"
                  >
                    <div className="w-full flex justify-center h-28 items-end">
                      <div 
                        className={`w-3.5 sm:w-4.5 rounded-t-md transition-all duration-300 ${
                          isActive 
                            ? theme === 'dark'
                              ? 'bg-gradient-to-t from-[#8efa1d]/20 to-[#8efa1d] shadow-md shadow-[#8efa1d]/20 scale-105'
                              : 'bg-gradient-to-t from-[#e50914]/20 to-[#e50914] shadow-md shadow-[#e50914]/20 scale-105' 
                            : 'bg-[#fdf2f2] dark:bg-[#24272c] hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                        title={`${bar.m}: ₹${bar.val.toLocaleString('en-IN')}`}
                      />
                    </div>
                    <span className={`text-[9px] mt-2 font-bold ${isActive ? 'text-[#e50914] dark:text-[#8efa1d]' : 'text-gray-400 dark:text-gray-600'}`}>
                      {bar.m}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Section: Active Cases & Prospects Directory */}
      <div className="border-t border-gray-200/40 dark:border-gray-800/20 pt-8 mt-8 space-y-6">
        
        {/* Section Sub-header & Action controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Left Tabs: Active Cases vs Starred */}
          <div className="flex bg-[#fee2e2]/40 dark:bg-[#16181c] p-1.5 rounded-[22px] border border-[#fecaca]/40 dark:border-gray-800/40 backdrop-blur-md gap-1">
            <button 
              onClick={() => handleTabChange('active')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[18px] text-[13.5px] font-bold cursor-pointer transition-all ${
                activeTab === 'active' 
                  ? 'bg-white dark:bg-[#24272c] text-[#1a1c22] dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <span>Active cases</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#e50914]" />
            </button>

            <button 
              onClick={() => handleTabChange('starred')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[18px] text-[13.5px] font-bold cursor-pointer transition-all ${
                activeTab === 'starred' 
                  ? 'bg-white dark:bg-[#24272c] text-[#1a1c22] dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Star className={`w-4 h-4 ${activeTab === 'starred' ? 'fill-amber-400 text-amber-500' : 'text-amber-400'}`} />
              <span>Starred</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-extrabold">
                {projects.filter(p => p.isStarred).length}
              </span>
            </button>
          </div>

          {/* Right Controls: Search, Filters drawer trigger, create project */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Copy Payment Link Rounded Button */}
            <button
              type="button"
              onClick={() => {
                const url = typeof window !== 'undefined' ? `${window.location.origin}/payment` : 'https://arjun-f-ilms.vercel.app/payment';
                navigator.clipboard.writeText(url);
                toast.success('Payment portal link copied to clipboard!');
              }}
              className="flex items-center gap-2 px-4 py-3 bg-[#fee2e2]/50 hover:bg-[#fbd3d3] dark:bg-[#16181c] dark:hover:bg-gray-800 text-[#e50914] dark:text-[#8efa1d] rounded-full border border-[#fecaca]/60 dark:border-gray-800/60 text-[12.5px] font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 group"
              title="Copy Client Payment Gateway Link"
            >
              <Link2 className="w-4 h-4 text-[#e50914] dark:text-[#8efa1d] group-hover:rotate-45 transition-transform" />
              <span className="hidden sm:inline">Copy Payment Link</span>
            </button>

            {/* Search clients */}
            <div className="flex-1 md:flex-none flex items-center px-4 py-2.5 bg-[#fee2e2]/40 dark:bg-[#16181c] rounded-2xl border border-[#fecaca]/40 dark:border-gray-800/40 w-64 md:w-72 focus-within:bg-white dark:focus-within:bg-[#16181c] focus-within:border-gray-300 dark:focus-within:border-gray-700 transition-all shadow-xs">
              <Search className="text-gray-400 w-4 h-4 mr-2.5 shrink-0" />
              <input 
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-transparent border-none focus:outline-none text-[13px] font-semibold w-full placeholder:text-gray-400 text-gray-800 dark:text-white" 
                placeholder="Filter clients & events..." 
                type="text"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    applyFiltering(projects, activeTab, '');
                  }}
                  className="p-1 hover:bg-gray-200/60 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0 cursor-pointer"
                  title="Clear Filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter drawer toggle */}
            <button 
              onClick={toggleFilterPanel}
              className="p-3 bg-[#fee2e2]/40 hover:bg-[#fee2e2] dark:bg-[#16181c] dark:hover:bg-gray-805 text-gray-655 dark:text-gray-405 rounded-2xl border border-[#fecaca]/40 dark:border-gray-800/40 transition-all cursor-pointer shadow-sm"
              title="Filters"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h10M4 18h7" strokeLinecap="round" />
              </svg>
            </button>

            {/* Create new case button */}
            <button 
              onClick={() => router.push('/projects/create')}
              className="w-12 h-12 rounded-full bg-[#e50914] hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
              title="Create New Case"
            >
              <Plus className="w-[22px] h-[22px] stroke-[2.5]" />
            </button>
          </div>

        </div>

        {/* Controls row: Cases counter status capsule & View Mode Switcher */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#fee2e2]/80 dark:bg-gray-800/40 text-[#e50914] dark:text-[#8efa1d] rounded-full border border-[#fecaca]/60 dark:border-gray-800/20 w-fit text-[13px] font-bold shadow-sm">
            <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{filteredProjects.length} Cases</span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#fee2e2]/40 dark:bg-[#16181c] p-1 rounded-2xl border border-[#fecaca]/40 dark:border-gray-800/40 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-extrabold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#24272c] text-[#e50914] dark:text-[#8efa1d] shadow-sm'
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
                  ? 'bg-white dark:bg-[#24272c] text-[#e50914] dark:text-[#8efa1d] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              title="Compact List / Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>

        {/* Grid listing: Projects cards on left, detail drawer panel on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Case cards grid */}
          <div className={`col-span-12 ${selectedProject ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300`}>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="glass-card rounded-[32px] p-5 h-[375px] bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 flex flex-col justify-between overflow-hidden relative animate-pulse">
                    {/* Top notch button placeholder */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gray-100/70 dark:bg-gray-850/70 rounded-bl-[24px] flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800" />
                    </div>

                    {/* Profile details */}
                    <div className="flex items-start justify-between pr-16">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded-md" />
                          <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800/60 rounded-md" />
                        </div>
                      </div>
                    </div>

                    {/* 2x2 grid (Location, Contact, Date, Contract) */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 dark:border-gray-800/60 my-1">
                      <div className="space-y-1">
                        <div className="h-2.5 w-12 bg-gray-100 dark:bg-gray-800/60 rounded" />
                        <div className="h-3.5 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-2.5 w-12 bg-gray-100 dark:bg-gray-800/60 rounded" />
                        <div className="h-3.5 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-2.5 w-14 bg-gray-100 dark:bg-gray-800/60 rounded" />
                        <div className="h-3.5 w-18 bg-gray-200 dark:bg-gray-800 rounded" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-2.5 w-14 bg-gray-100 dark:bg-gray-800/60 rounded" />
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                      </div>
                    </div>

                    {/* Deliverables section */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="h-2.5 w-20 bg-gray-100 dark:bg-gray-800/60 rounded" />
                        <div className="h-2.5 w-12 bg-gray-100 dark:bg-gray-800/60 rounded" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-6 w-full bg-gray-100 dark:bg-gray-800/40 rounded-xl" />
                        <div className="h-6 w-full bg-gray-100 dark:bg-gray-800/40 rounded-xl" />
                      </div>
                    </div>

                    {/* Bottom CTA Button */}
                    <div className="h-10 w-full bg-gray-100 dark:bg-gray-800/70 rounded-2xl mt-1" />
                  </div>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="glass-card rounded-[32px] p-16 text-center max-w-md mx-auto space-y-6 bg-white dark:bg-[#16181c] border border-gray-200/50 dark:border-gray-800/40 shadow-sm">
                <Grid className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 stroke-1" />
                <h3 className="text-[17px] font-extrabold text-gray-700 dark:text-gray-300">No projects found</h3>
                <p className="text-[13px] text-gray-400 dark:text-gray-505 font-medium">Create a new project to populate this dashboard.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${selectedProject ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
                {filteredProjects.map((project) => (
                  <ProjectCard 
                    key={project.id || project._id} 
                    project={project} 
                    onSelect={(p) => setSelectedProject(p)}
                    onMilestoneHover={handleMilestoneHover}
                    onStarToggle={handleStarToggle}
                  />
                ))}
              </div>
            ) : (
              <ProjectListView
                projects={filteredProjects}
                selectedProject={selectedProject}
                onSelect={(p) => setSelectedProject(p)}
                onMilestoneHover={handleMilestoneHover}
                onStarToggle={handleStarToggle}
              />
            )}
          </div>

          {/* Right side Detail Drawer Panel */}
          {selectedProject && (
            <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-8 animate-slide-in">
              <div className="glass-card rounded-[32px] p-6 bg-white dark:bg-[#16181c] border border-gray-200/60 dark:border-gray-800/40 shadow-2xl relative space-y-6 text-gray-800 dark:text-white">
                
                {/* Close & favorites controls */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm shrink-0">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedProject.name)}&background=e50914&color=fff&bold=true&size=128`}
                        alt={selectedProject.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-extrabold text-gray-808 dark:text-white leading-tight">
                        {selectedProject.name}
                      </h3>
                      <span className="text-[11px] font-extrabold text-[#e50914] dark:text-[#8efa1d] uppercase tracking-wider block mt-1">
                        {selectedProject.eventType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={async () => {
                        const projId = selectedProject._id || selectedProject.id;
                        if (!projId) return;
                        const nextStarred = !selectedProject.isStarred;
                        handleStarToggle(projId, nextStarred);
                        try {
                          const { toggleProjectStar } = await import('@/app/actions');
                          const res = await toggleProjectStar(projId);
                          if (res.success) {
                            toast.success(nextStarred ? `Bookmarked ${selectedProject.name}` : `Removed bookmark for ${selectedProject.name}`);
                          } else {
                            handleStarToggle(projId, !nextStarred);
                            toast.error('Failed to update bookmark');
                          }
                        } catch (e) {
                          handleStarToggle(projId, !nextStarred);
                          toast.error('Failed to update bookmark');
                        }
                      }}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        selectedProject.isStarred 
                          ? 'text-amber-400 bg-amber-50 dark:bg-amber-950/40' 
                          : 'text-gray-400 hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title={selectedProject.isStarred ? 'Remove Bookmark' : 'Bookmark Case'}
                    >
                      <Star className={`w-5 h-5 ${selectedProject.isStarred ? 'fill-current text-amber-400' : ''}`} />
                    </button>
                    <button 
                      onClick={() => setSelectedProject(null)}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Assignee / Contact Details Rows */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 border-t border-b border-gray-100 dark:border-gray-800 py-4 text-[12px] text-gray-505 dark:text-gray-404 font-semibold">
                  <div>
                    <span className="text-gray-400 dark:text-gray-550 block font-medium">Contact Phone</span>
                    <span className="text-gray-805 dark:text-gray-200 font-extrabold block mt-0.5 truncate">{selectedProject.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-555 block font-medium">Event Type</span>
                    <span className="text-gray-805 dark:text-gray-200 font-extrabold block mt-0.5">{selectedProject.eventType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-555 block font-medium">Location / Venue</span>
                    <span className="text-gray-855 dark:text-gray-200 font-extrabold block mt-0.5 truncate">{selectedProject.location || 'Studio'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-555 block font-medium">Event Date</span>
                    <span className="text-gray-855 dark:text-gray-200 font-extrabold block mt-0.5">
                      {selectedProject.eventDate ? dayjs(selectedProject.eventDate).format('MMM DD, YYYY') : dayjs(selectedProject.createdAt).format('MMM DD, YYYY')}
                    </span>
                  </div>
                </div>

                {/* Services List Table */}
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] text-gray-400 dark:text-gray-505 font-bold uppercase tracking-wider px-1">
                    <span>Deliverables</span>
                    <span>Status</span>
                    <span>Days Left</span>
                  </div>

                  <div className="space-y-2">
                    {(selectedProject.services && selectedProject.services.length > 0 ? selectedProject.services : [
                      { name: selectedProject.eventType || 'Full Shoot Coverage', status: selectedProject.status || 'Booked', daysLeft: 7 }
                    ]).map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-55/60 dark:bg-[#24272c] rounded-xl border border-gray-100 dark:border-gray-800/35 text-[12px]">
                        <span className="font-bold text-gray-700 dark:text-gray-300 truncate max-w-[130px]">{service.name}</span>
                        
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold truncate max-w-[120px] ${getStatusStyle(service.status)}`}>
                          {service.status}
                        </span>

                        <span className="font-bold text-gray-808 dark:text-gray-200 w-6 text-right shrink-0">
                          {service.daysLeft !== undefined ? service.daysLeft : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-2">
                  <button 
                    onClick={() => router.push(`/projects/${selectedProject.id || selectedProject._id}`)}
                    className="w-full flex items-center justify-center gap-1.5 py-3.5 bg-[#0a0b0d] dark:bg-[#8efa1d] text-white dark:text-[#0b0c0e] hover:bg-gray-900 dark:hover:bg-[#a5f841] rounded-xl text-[13px] font-bold shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4 text-white dark:text-[#0b0c0e]" />
                    Open Project Details
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* Floating Milestone Hover Tooltip Popover */}
      {hoveredMilestone && tooltipPos && (
        <div 
          className="fixed z-[100] w-[260px] bg-white dark:bg-[#16181c] border border-gray-200/80 dark:border-gray-800/40 rounded-2xl shadow-xl p-4 text-[12px] animate-fade-in pointer-events-none text-gray-650 dark:text-gray-400"
          style={{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }}
        >
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-852 pb-2 mb-2 font-bold">
            <span className="text-gray-400 dark:text-gray-550 uppercase text-[10px] tracking-wider">Milestone Info</span>
            <span className="text-[#d93025] bg-[#fce8e6] dark:bg-rose-950/20 dark:text-rose-400 px-2 py-0.5 rounded text-[10px] uppercase font-extrabold">
              {hoveredMilestone.daysLeft} days left
            </span>
          </div>
          <div className="space-y-1.5 font-semibold">
            <p className="text-gray-808 dark:text-white font-extrabold text-[13px]">{hoveredMilestone.name}</p>
            <p className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-505 shrink-0" />
              Target: {dayjs().add(hoveredMilestone.daysLeft, 'day').format('DD MMM YYYY')}
            </p>
            <p className="flex items-start gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-505 shrink-0 mt-0.5" />
              <span>Ensure client approvals and delivery signatures are processed.</span>
            </p>
          </div>
        </div>
      )}

      {/* Slide-out Filters Panel overlay */}
      <FiltersPanel onFilterChange={handleFilterChange} />
    </div>
  );
}

// Small helper icon component
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
