'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getCrew, deleteCrew } from '@/app/actions';
import { 
  Plus, 
  MapPin, 
  Phone, 
  Briefcase, 
  Edit2, 
  Trash2, 
  X, 
  ChevronRight, 
  Search, 
  LayoutGrid, 
  List, 
  Camera, 
  Video, 
  Scissors, 
  Radio, 
  Palette, 
  MessageCircle, 
  UserCheck, 
  DollarSign,
  User,
  Building,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import CrewDetailDrawer from '@/components/blueprints/CrewDetailDrawer';

export default function BlueprintPage() {
  const [crewData, setCrewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Slide-over Sidebar Drawer State (Supports 'view', 'edit', and 'create' modes)
  const [selectedCrewForDetail, setSelectedCrewForDetail] = useState<any | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCrew();
      setCrewData(data || []);
    } catch (e) {
      toast.error('Failed to load crew members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddDrawer = () => {
    setSelectedCrewForDetail(null);
    setDrawerMode('create');
    setIsDetailDrawerOpen(true);
  };

  const openEditDrawer = (crew: any) => {
    setSelectedCrewForDetail(crew);
    setDrawerMode('edit');
    setIsDetailDrawerOpen(true);
  };

  const openViewDrawer = (crew: any) => {
    setSelectedCrewForDetail(crew);
    setDrawerMode('view');
    setIsDetailDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this crew member from blueprints?')) return;
    try {
      await deleteCrew(id);
      toast.success('Crew record removed successfully');
      fetchData();
    } catch (e) {
      toast.error('Failed to remove crew record');
    }
  };

  // Quick statistics
  const stats = useMemo(() => {
    const total = crewData.length;
    const photoCount = crewData.filter(c => (c.role || '').toLowerCase().includes('photo')).length;
    const videoCount = crewData.filter(c => (c.role || '').toLowerCase().includes('video') || (c.role || '').toLowerCase().includes('cinema')).length;
    const editorCount = crewData.filter(c => (c.role || '').toLowerCase().includes('edit') || (c.role || '').toLowerCase().includes('drone') || (c.role || '').toLowerCase().includes('album')).length;
    
    const validCharges = crewData.map(c => Number(c.charges) || 0).filter(c => c > 0);
    const avgRate = validCharges.length > 0 ? Math.round(validCharges.reduce((a, b) => a + b, 0) / validCharges.length) : 0;

    return { total, photoCount, videoCount, editorCount, avgRate };
  }, [crewData]);

  // Filtered Crew records
  const filteredCrew = useMemo(() => {
    return crewData.filter((c) => {
      const matchesRole = roleFilter === 'all' || (c.role && c.role.toLowerCase().includes(roleFilter.toLowerCase()));
      if (!matchesRole) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.role && c.role.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    });
  }, [crewData, roleFilter, searchQuery]);

  const getRoleIconAndColor = (roleStr: string) => {
    const r = (roleStr || '').toLowerCase();
    if (r.includes('drone')) {
      return {
        icon: Radio,
        bgClass: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200/60 dark:border-sky-900/50',
        glowClass: 'from-sky-500/20 to-transparent'
      };
    }
    if (r.includes('edit') || r.includes('album')) {
      return {
        icon: Scissors,
        bgClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-900/50',
        glowClass: 'from-purple-500/20 to-transparent'
      };
    }
    if (r.includes('video') || r.includes('cinema')) {
      return {
        icon: Video,
        bgClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/50',
        glowClass: 'from-blue-500/20 to-transparent'
      };
    }
    return {
      icon: Camera,
      bgClass: 'bg-red-50 dark:bg-red-950/40 text-[#e50914] dark:text-red-400 border-red-200/60 dark:border-red-900/50',
      glowClass: 'from-red-500/20 to-transparent'
    };
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      {/* Executive Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-red-50/90 via-white to-gray-50/80 dark:from-[#181a20] dark:via-[#14161a] dark:to-[#111317] p-6 rounded-[28px] border border-red-200/60 dark:border-gray-800/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e50914]/5 dark:bg-[#e50914]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#e50914]/10 text-[#e50914] flex items-center justify-center border border-[#e50914]/20 shadow-xs">
              <Briefcase className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <h1 className="text-[22px] md:text-[26px] font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                Crew Blueprint Directory
              </h1>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">
                Manage commercial rates, gear specializations, and direct booking contacts.
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={openAddDrawer}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl text-[13px] font-black shadow-md shadow-red-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Register Crew Member</span>
        </button>
      </div>

      {/* Bento Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-[#15181e] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Total Roster</span>
            <div className="text-[20px] font-black text-gray-900 dark:text-white mt-0.5">{stats.total}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold">
            <UserCheck className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#15181e] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider block">Photographers</span>
            <div className="text-[20px] font-black text-red-600 dark:text-red-400 mt-0.5">{stats.photoCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e50914] flex items-center justify-center font-bold border border-red-200/50 dark:border-red-900/50">
            <Camera className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#15181e] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Cinematographers</span>
            <div className="text-[20px] font-black text-blue-600 dark:text-blue-400 mt-0.5">{stats.videoCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-200/50 dark:border-blue-900/50">
            <Video className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#15181e] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Editors & Drone</span>
            <div className="text-[20px] font-black text-purple-600 dark:text-purple-400 mt-0.5">{stats.editorCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold border border-purple-200/50 dark:border-purple-900/50">
            <Scissors className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="col-span-2 sm:col-span-2 lg:col-span-1 p-4 rounded-2xl bg-white dark:bg-[#15181e] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Avg Day Rate</span>
            <div className="text-[20px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              ₹{stats.avgRate.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-200/50 dark:border-emerald-900/50">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
        </div>

      </div>

      {/* Modern Filter & Search Controls */}
      <div className="bg-white dark:bg-[#15181e] p-4 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, city (e.g. Rahul, Editor, Bhubaneswar)..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl text-[13px] font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e50914] focus:ring-2 focus:ring-red-500/10 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Pills and View Mode Toggle */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-800/60 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-700/60">
            {[
              { id: 'all', label: 'All Roles' },
              { id: 'photo', label: 'Photographers' },
              { id: 'video', label: 'Cinematography' },
              { id: 'drone', label: 'Drone' },
              { id: 'edit', label: 'Editors' },
            ].map((r) => {
              const isActive = roleFilter === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoleFilter(r.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-[#1f2229] text-[#e50914] shadow-xs font-black'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/60 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#1f2229] text-[#e50914] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#1f2229] text-[#e50914] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              title="Compact Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Roster Records (Grid or List View) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-3xl h-[240px] bg-white dark:bg-[#15181e] border border-gray-200/80 dark:border-gray-800" />
          ))}
        </div>
      ) : filteredCrew.length === 0 ? (
        <div className="rounded-[32px] p-16 text-center max-w-md mx-auto space-y-4 bg-white dark:bg-[#15181e] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/40 text-[#e50914] flex items-center justify-center mx-auto border border-red-200/60 dark:border-red-900/50">
            <Briefcase className="w-7 h-7 stroke-[2]" />
          </div>
          <h3 className="text-[17px] font-black text-gray-900 dark:text-white">
            {searchQuery ? `No crew found matching "${searchQuery}"` : 'No crew members found'}
          </h3>
          <p className="text-[12.5px] text-gray-400 font-medium leading-relaxed">
            {searchQuery ? 'Try clearing your search query or switching the category filter.' : 'Click "Register Crew Member" to open the sidebar editor.'}
          </p>
          <button
            type="button"
            onClick={openAddDrawer}
            className="px-5 py-2.5 bg-[#e50914] hover:bg-red-700 text-white text-[12px] font-bold rounded-xl cursor-pointer"
          >
            Register First Crew Member
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCrew.map((crew) => {
            const avatarUrl = crew.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(crew.name || 'Crew')}&background=e50914&color=fff&bold=true&size=128`;
            const roleStyle = getRoleIconAndColor(crew.role);
            const cleanPhone = (crew.phone || '').replace(/[^0-9]/g, '');
            const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

            return (
              <div 
                key={crew._id} 
                onClick={() => openViewDrawer(crew)}
                className="bg-white dark:bg-[#15181e] border border-gray-200/80 dark:border-gray-800/80 hover:border-[#e50914]/50 rounded-[28px] p-5 flex flex-col justify-between h-full relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group shadow-xs"
              >
                {/* Background Ambient Glow */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${roleStyle.glowClass} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform`} />

                <div>
                  {/* Top Bar: Avatar, Name, Edit / Delete Action Buttons */}
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-700 shadow-sm shrink-0 bg-gray-100 group-hover:scale-105 transition-transform relative">
                        <img 
                          src={avatarUrl} 
                          alt={crew.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-black text-gray-900 dark:text-white truncate group-hover:text-[#e50914] transition-colors leading-tight">
                          {crew.name}
                        </h3>
                        <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{crew.location || 'Studio HQ'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Top Action Pills (Edit in Sidebar & Delete) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDrawer(crew);
                        }}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-[#e50914] rounded-lg transition-colors cursor-pointer"
                        title="Edit in Sidebar Drawer"
                      >
                        <Edit2 className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(crew._id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>

                  {/* Role Pill */}
                  <div className="mt-4 relative z-10 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase border ${roleStyle.bgClass}`}>
                      <roleStyle.icon className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[170px]">{crew.role || 'Crew Member'}</span>
                    </span>

                    {/* Verified indicator */}
                    <span className="text-[10.5px] font-bold text-gray-400 dark:text-gray-500">
                      Active
                    </span>
                  </div>

                  {/* Commercial Charges Box */}
                  <div className="mt-4 p-3 rounded-2xl bg-[#fcf8f8] dark:bg-gray-900/50 border border-gray-150 dark:border-gray-800/60 relative z-10 flex items-center justify-between">
                    <div>
                      <span className="text-[9.5px] font-extrabold text-gray-400 uppercase tracking-wider block">Day Rate</span>
                      <span className="text-[16px] font-black text-gray-900 dark:text-white">
                        ₹{(Number(crew.charges) || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold ml-1">/ day</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9.5px] font-extrabold text-gray-400 uppercase tracking-wider block">Half-Day</span>
                      <span className="text-[12.5px] font-bold text-gray-600 dark:text-gray-300">
                        ₹{Math.round((Number(crew.charges) || 0) * 0.6).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Quick Actions */}
                <div className="mt-4 pt-3.5 border-t border-gray-150 dark:border-gray-800/70 flex items-center justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${crew.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                      title={`Call ${crew.phone}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-[#e50914]" />
                    </a>

                    <a
                      href={`https://wa.me/${waNumber}?text=Hi%20${encodeURIComponent(crew.name)},%20reaching%20out%20from%20Arjun%20Films%20Studio`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                      title="WhatsApp Chat"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDrawer(crew);
                    }}
                    className="flex items-center gap-1 text-[11px] font-extrabold text-gray-500 group-hover:text-[#e50914] transition-colors"
                  >
                    <span>Edit Profile</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Compact Table List View */
        <div className="bg-white dark:bg-[#15181e] rounded-3xl border border-gray-200/80 dark:border-gray-800/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 text-[10.5px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Specialist</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4 text-right">Daily Commercial Rate</th>
                  <th className="py-3.5 px-5 text-right">Sidebar Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-gray-800/60 font-semibold">
                {filteredCrew.map((crew) => {
                  const avatarUrl = crew.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(crew.name || 'Crew')}&background=e50914&color=fff&bold=true&size=128`;
                  const roleStyle = getRoleIconAndColor(crew.role);
                  const cleanPhone = (crew.phone || '').replace(/[^0-9]/g, '');
                  const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

                  return (
                    <tr 
                      key={crew._id}
                      onClick={() => openViewDrawer(crew)}
                      className="hover:bg-red-50/40 dark:hover:bg-red-950/20 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-700 bg-gray-100 shrink-0">
                            <img src={avatarUrl} alt={crew.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="font-extrabold text-gray-900 dark:text-white group-hover:text-[#e50914] transition-colors block">
                              {crew.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10.5px] font-extrabold uppercase border ${roleStyle.bgClass}`}>
                          <roleStyle.icon className="w-3 h-3" />
                          {crew.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{crew.location}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{crew.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-gray-900 dark:text-white text-[13.5px]">
                          ₹{(Number(crew.charges) || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9.5px] text-gray-400 block">per day</span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`https://wa.me/${waNumber}?text=Hi%20${encodeURIComponent(crew.name)},%20reaching%20out%20from%20Arjun%20Films%20Studio`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 rounded-lg transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => openEditDrawer(crew)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-[#e50914] rounded-lg transition-colors cursor-pointer"
                            title="Edit in Sidebar Drawer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(crew._id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 SLIDE-OVER SIDEBAR DRAWER (VIEW, IN-SIDEBAR EDIT & CREATE MODES)       */}
      {/* ========================================================================= */}
      <CrewDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        crew={selectedCrewForDetail}
        initialMode={drawerMode}
        onDelete={(id) => handleDelete(id)}
        onSuccess={fetchData}
      />
    </div>
  );
}
