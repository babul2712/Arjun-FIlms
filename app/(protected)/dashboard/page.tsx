'use client';

import React, { useEffect, useState } from 'react';
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
  Link2 
} from 'lucide-react';
import ProjectCard from '@/components/dashboard/ProjectCard';
import FiltersPanel from '@/components/dashboard/FiltersPanel';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import CalendarView from './components/CalendarView';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import dayjs from 'dayjs';

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
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>(new Array(12).fill(0));
  const [loading, setLoading] = useState(true);

  // Toggle card states
  const [showBookings, setShowBookings] = useState(false);
  const [showFinished, setShowFinished] = useState(false);

  // Cases lists tab & details drawer state
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
      setProjects(projectsData);
      applyFiltering(projectsData, activeTab, searchQuery);

      // Group payments by month
      const monthlySums = new Array(12).fill(0);
      paymentsData.forEach((pay) => {
        if (pay.status === 'Verified' || pay.status === 'PAID') {
          const d = new Date(pay.date);
          if (!isNaN(d.getTime())) {
            const month = d.getMonth();
            monthlySums[month] += pay.amount;
          }
        }
      });
      setMonthlyRevenue(monthlySums);
    } catch (e) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

    // Search query filter
    if (search.trim() !== '') {
      const query = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.eventType.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
      );
    }

    setFilteredProjects(filtered);
  };

  const handleTabChange = (tab: 'active' | 'leads' | 'starred') => {
    setActiveTab(tab);
    applyFiltering(projects, tab, searchQuery);
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
      list = list.filter(p => p.name.toLowerCase().includes(filters.nationality.toLowerCase()) || 
                              p.location.toLowerCase().includes(filters.nationality.toLowerCase()));
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

  // Dynamic values
  const currentMonthIdx = new Date().getMonth();
  const maxRevenueVal = Math.max(...monthlyRevenue, 1000);
  const totalProjectContractsValue = stats.revenue + stats.pendingPaymentsAmount;

  return (
    <div className="min-h-screen bg-transparent text-gray-808 dark:text-white p-6 md:p-8 font-sans -m-6 md:-m-10">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left / Main Dashboard section (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header Row: Welcome Greetings & Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-[28px] md:text-[34px] font-extrabold tracking-tight text-gray-808 dark:text-white leading-tight">
                Good morning, {user?.name === 'System Admin' ? 'arjun' : (user?.name || 'Oripio')}
              </h1>
              <p className="text-[13px] text-gray-400 dark:text-gray-400 font-bold mt-1">
                Stay on top of your tasks, monitor progress, and track status.
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="flex-1 md:flex-none flex items-center px-4 py-3 bg-[#fee2e2]/40 border border-[#fecaca]/40 dark:bg-[#16181c] dark:border-gray-800/40 rounded-2xl w-64 focus-within:bg-white dark:focus-within:bg-[#16181c] focus-within:border-gray-300 dark:focus-within:border-gray-700 transition-colors shadow-sm">
                <Search className="text-gray-505 w-4.5 h-4.5 mr-3 shrink-0" />
                <input 
                  type="text" 
                  className="bg-transparent border-none focus:outline-none text-[12.5px] font-semibold text-gray-700 dark:text-white placeholder:text-gray-400 w-full"
                  placeholder="Search project"
                />
              </div>
            </div>
          </div>

          {/* Bento Grid: Smart Wallet & Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Smart Wallet Card (5 columns) */}
            <div className="md:col-span-5 bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 shadow-sm rounded-[32px] p-6 flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[14px] font-extrabold text-gray-800 dark:text-white">Smart Wallet</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Effortless saving goals.</p>
                  </div>
                  <button 
                    onClick={() => router.push('/projects/create')}
                    className="text-[11px] font-extrabold text-gray-550 dark:text-gray-400 hover:text-gray-855 dark:hover:text-white px-3 py-1.5 bg-[#fdf2f2] dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-800/30 rounded-xl cursor-pointer transition-colors"
                  >
                    Add New +
                  </button>
                </div>
                
                <div className="mt-6">
                  <h2 className="text-[30px] font-black text-[#1a1c22] dark:text-white leading-none">
                    ₹{stats.revenue.toLocaleString('en-IN')}
                  </h2>
                  <p className="text-[10px] text-gray-400 font-extrabold tracking-widest mt-2">TOTAL REVENUE</p>
                </div>
              </div>

              {/* Bottom Quick Tiles (Crew Stats Integration) */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-[#fdf2f2] dark:bg-[#24272c] rounded-2xl p-2 flex flex-col justify-center text-center transition-colors border border-gray-200/20 dark:border-gray-855/50">
                  <Users className="w-4 h-4 text-gray-550 dark:text-gray-400 mx-auto mb-1 shrink-0" />
                  <span className="text-[13px] font-black text-gray-808 dark:text-white leading-none block">{stats.totalCrew}</span>
                  <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 block mt-1 uppercase tracking-wider truncate">Total Crew</span>
                </div>
                <div className="bg-[#fdf2f2] dark:bg-[#24272c] rounded-2xl p-2 flex flex-col justify-center text-center transition-colors border border-gray-200/20 dark:border-gray-855/50">
                  <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 mx-auto mb-1 shrink-0" />
                  <span className="text-[13px] font-black text-gray-808 dark:text-white leading-none block">{stats.totalCrewAssigned}</span>
                  <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 block mt-1 uppercase tracking-wider truncate">Assigned</span>
                </div>
                <div className="bg-[#fdf2f2] dark:bg-[#24272c] rounded-2xl p-2 flex flex-col justify-center text-center transition-colors border border-gray-200/20 dark:border-gray-855/50">
                  <UserMinus className="w-4 h-4 text-[#e50914] dark:text-[#8efa1d] mx-auto mb-1 shrink-0" />
                  <span className="text-[13px] font-black text-gray-808 dark:text-white leading-none block">{stats.totalCrewNotAssigned}</span>
                  <span className="text-[8px] font-bold text-gray-400 dark:text-gray-505 block mt-1 uppercase tracking-wider truncate">Unassigned</span>
                </div>
              </div>
            </div>

            {/* Metric Cards (7 columns) */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Payments Received */}
              <div className="bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 shadow-sm rounded-[28px] p-5 flex flex-col justify-between h-[115px]">
                <div className="flex justify-between items-start">
                  <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800/40 flex items-center justify-center text-gray-555 dark:text-gray-400 border border-gray-200/20 dark:border-gray-800/20">
                    <Wallet className="w-4.5 h-4.5 text-[#e50914] dark:text-[#8efa1d]" />
                  </span>
                  <span className="text-[9px] text-emerald-500 font-extrabold uppercase bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-100/50 dark:border-emerald-500/10">Active</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-black text-[#1a1c22] dark:text-white">₹{stats.revenue.toLocaleString('en-IN')}</h3>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Payments Recv.</span>
                </div>
              </div>

              {/* Card 2: Pending Payments */}
              <div className="bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 shadow-sm rounded-[28px] p-5 flex flex-col justify-between h-[115px]">
                <div className="flex justify-between items-start">
                  <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800/40 flex items-center justify-center text-gray-555 dark:text-gray-400 border border-gray-200/20 dark:border-gray-800/20">
                    <CreditCard className="w-4.5 h-4.5 text-rose-500" />
                  </span>
                  <span className="text-[9px] text-rose-500 font-extrabold uppercase bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-100/50 dark:border-rose-500/10">Due</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-black text-[#1a1c22] dark:text-white">₹{stats.pendingPaymentsAmount.toLocaleString('en-IN')}</h3>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Pending Pay</span>
                </div>
              </div>

              {/* Card 3: Quotations / Bookings Toggle Card */}
              <div className="bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 shadow-sm rounded-[28px] p-5 flex flex-col justify-between h-[115px]">
                <div className="flex justify-between items-start w-full">
                  {/* Miniature toggle switch */}
                  <div className="flex bg-[#fdf2f2] dark:bg-[#24272c] p-0.5 rounded-lg border border-gray-200/40 dark:border-gray-800/30 text-[9px] font-bold">
                    <button 
                      onClick={() => setShowBookings(false)}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        !showBookings 
                          ? 'bg-white dark:bg-[#16181c] text-[#1a1c22] dark:text-white shadow-sm font-extrabold' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      Quotes
                    </button>
                    <button 
                      onClick={() => setShowBookings(true)}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        showBookings 
                          ? 'bg-white dark:bg-[#16181c] text-[#1a1c22] dark:text-white shadow-sm font-extrabold' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      Bookings
                    </button>
                  </div>
                  
                  {showBookings ? (
                    <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-[18px] font-black text-[#1a1c22] dark:text-white mt-1">
                    {showBookings ? stats.totalBookings : stats.totalQuotations}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">
                    {showBookings ? 'Total Bookings' : 'Total Quotations'}
                  </span>
                </div>
              </div>

              {/* Card 4: Pending / Finished Projects Toggle Card */}
              <div className="bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 shadow-sm rounded-[28px] p-5 flex flex-col justify-between h-[115px]">
                <div className="flex justify-between items-start w-full">
                  {/* Miniature toggle switch */}
                  <div className="flex bg-[#fdf2f2] dark:bg-[#24272c] p-0.5 rounded-lg border border-gray-200/40 dark:border-gray-800/30 text-[9px] font-bold">
                    <button 
                      onClick={() => setShowFinished(false)}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        !showFinished 
                          ? 'bg-white dark:bg-[#16181c] text-[#1a1c22] dark:text-white shadow-sm font-extrabold' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      Pending
                    </button>
                    <button 
                      onClick={() => setShowFinished(true)}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        showFinished 
                          ? 'bg-white dark:bg-[#16181c] text-[#1a1c22] dark:text-white shadow-sm font-extrabold' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      Finished
                    </button>
                  </div>
                  
                  {showFinished ? (
                    <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-[18px] font-black text-[#1a1c22] dark:text-white mt-1">
                    {showFinished ? stats.finishedProjects : stats.pendingProjects}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">
                    {showFinished ? 'Finished Projects' : 'Pending Projects'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Shoot Calendar View */}
          <div className="bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 shadow-sm rounded-[32px] p-6 relative">
            <CalendarView projects={projects} />
          </div>

        </div>

        {/* Right Panel section (lg:col-span-4) */}
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
                ₹{stats.revenue.toLocaleString('en-IN')}
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
                  ₹{totalProjectContractsValue.toLocaleString('en-IN')}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#fdf2f2] dark:bg-gray-800/40 border border-gray-200/65 dark:border-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300 rounded-xl">
                  Yearly
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
                style={{ bottom: '130px', left: `${3 + currentMonthIdx * 8.0}%` }}
              >
                ₹{monthlyRevenue[currentMonthIdx].toLocaleString('en-IN')}
              </div>

              {/* Monthly columns values array */}
              {[
                { m: 'Jan', val: monthlyRevenue[0] },
                { m: 'Feb', val: monthlyRevenue[1] },
                { m: 'Mar', val: monthlyRevenue[2] },
                { m: 'Apr', val: monthlyRevenue[3] },
                { m: 'May', val: monthlyRevenue[4] },
                { m: 'Jun', val: monthlyRevenue[5] },
                { m: 'Jul', val: monthlyRevenue[6] },
                { m: 'Aug', val: monthlyRevenue[7] },
                { m: 'Sep', val: monthlyRevenue[8] },
                { m: 'Oct', val: monthlyRevenue[9] },
                { m: 'Nov', val: monthlyRevenue[10] },
                { m: 'Dec', val: monthlyRevenue[11] },
              ].map((bar, i) => {
                const isActive = i === currentMonthIdx;
                const heightPercent = Math.min(90, Math.max(10, (bar.val / maxRevenueVal) * 90));
                
                return (
                  <div key={i} className="flex flex-col items-center flex-1 group">
                    <div className="w-full flex justify-center h-28 items-end">
                      <div 
                        className={`w-3.5 sm:w-4.5 rounded-t-md transition-all duration-300 ${
                          isActive 
                            ? theme === 'dark'
                              ? 'bg-gradient-to-t from-[#8efa1d]/20 to-[#8efa1d] shadow-md shadow-[#8efa1d]/20 scale-105'
                              : 'bg-gradient-to-t from-[#e50914]/20 to-[#e50914] shadow-md shadow-[#e50914]/20 scale-105' 
                            : 'bg-[#fdf2f2] dark:bg-[#24272c] hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer'
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
          
          {/* Left Tabs: Active Cases vs New prospects vs Starred */}
          <div className="flex bg-[#fee2e2]/40 dark:bg-[#16181c] p-1.5 rounded-[22px] border border-[#fecaca]/40 dark:border-gray-800/40 backdrop-blur-md gap-1">
            <button 
              onClick={() => handleTabChange('active')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[18px] text-[13.5px] font-bold cursor-pointer transition-all ${
                activeTab === 'active' 
                  ? 'bg-white dark:bg-[#24272c] text-[#1a1c22] dark:text-white shadow-sm' 
                  : 'text-gray-505 hover:text-gray-850 dark:hover:text-gray-205'
              }`}
            >
              <span>Active cases</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#e50914]" />
            </button>
            
            <button 
              onClick={() => handleTabChange('leads')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[18px] text-[13.5px] font-bold cursor-pointer transition-all ${
                activeTab === 'leads' 
                  ? 'bg-white dark:bg-[#24272c] text-[#1a1c22] dark:text-white shadow-sm' 
                  : 'text-gray-505 hover:text-gray-850 dark:hover:text-gray-205'
              }`}
            >
              <span>New prospects</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#e50914]" />
            </button>

            <button 
              onClick={() => handleTabChange('starred')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[18px] text-[13.5px] font-bold cursor-pointer transition-all ${
                activeTab === 'starred' 
                  ? 'bg-white dark:bg-[#24272c] text-[#1a1c22] dark:text-white shadow-sm' 
                  : 'text-gray-505 hover:text-gray-850 dark:hover:text-gray-205'
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
            <div className="flex-1 md:flex-none flex items-center px-4 py-3 bg-[#fee2e2]/40 dark:bg-[#16181c] rounded-2xl border border-[#fecaca]/40 dark:border-gray-800/40 w-64 focus-within:bg-white dark:focus-within:bg-[#16181c] focus-within:border-gray-300 dark:focus-within:border-gray-750 transition-all shadow-sm">
              <Search className="text-gray-455 w-[18px] h-[18px] mr-2.5 shrink-0" />
              <input 
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-transparent border-none focus:outline-none text-[13px] font-semibold w-full placeholder:text-gray-400 dark:text-white" 
                placeholder="Search for client" 
                type="text"
              />
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

        {/* Cases counter status capsule */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#fee2e2]/80 dark:bg-gray-800/40 text-[#e50914] dark:text-[#8efa1d] rounded-full border border-[#fecaca]/60 dark:border-gray-800/20 w-fit text-[13px] font-bold shadow-sm">
          <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{filteredProjects.length} Cases</span>
        </div>

        {/* Grid listing: Projects cards on left, detail drawer panel on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Case cards grid */}
          <div className={`col-span-12 ${selectedProject ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300`}>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card rounded-[32px] h-[340px] bg-white/50 dark:bg-[#16181c]/50 border border-gray-105 dark:border-gray-800" />
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="glass-card rounded-[32px] p-16 text-center max-w-md mx-auto space-y-6 bg-white dark:bg-[#16181c] border border-gray-200/50 dark:border-gray-800/40 shadow-sm">
                <Grid className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 stroke-1" />
                <h3 className="text-[17px] font-extrabold text-gray-700 dark:text-gray-300">No projects found</h3>
                <p className="text-[13px] text-gray-400 dark:text-gray-505 font-medium">Create a new project to populate this dashboard.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 ${selectedProject ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8`}>
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
                            toast.success(nextStarred ? `⭐ Bookmarked ${selectedProject.name}` : `Removed bookmark for ${selectedProject.name}`);
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
