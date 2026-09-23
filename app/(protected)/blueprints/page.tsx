'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  Check,
  RotateCcw,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import CrewDetailDrawer from '@/components/blueprints/CrewDetailDrawer';
import AutoSearchInput, { AutoSearchOption } from '@/components/ui/AutoSearchInput';

type SortOption = 'default' | 'name-asc' | 'name-desc' | 'rate-asc' | 'rate-desc' | 'role' | 'location';
type RateRange = 'all' | 'under-3k' | '3k-6k' | 'above-6k';

export default function BlueprintPage() {
  const [crewData, setCrewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [rateRange, setRateRange] = useState<RateRange>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Dropdown menus open/close state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filterMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  
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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  // 1. Extract ALL unique, distinct roles stored in the Database with real-time member counts
  const distinctDbRoles = useMemo(() => {
    const roleCountMap: Record<string, number> = {};
    crewData.forEach(c => {
      const r = (c.role || '').trim();
      if (r) {
        roleCountMap[r] = (roleCountMap[r] || 0) + 1;
      }
    });
    return Object.entries(roleCountMap)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count);
  }, [crewData]);

  // Distinct list of role names
  const availableRolesList = useMemo(() => {
    return distinctDbRoles.map(d => d.role);
  }, [distinctDbRoles]);

  // Distinct cities list for filter dropdown
  const distinctCities = useMemo(() => {
    const set = new Set<string>();
    crewData.forEach(c => {
      if (c.location && c.location.trim()) {
        set.add(c.location.trim());
      }
    });
    return Array.from(set).sort();
  }, [crewData]);

  // Auto-Search Options for the search dropdown component
  const crewSearchOptions: AutoSearchOption[] = useMemo(() => {
    return crewData.map(c => {
      const lower = (c.role || '').toLowerCase();
      let badgeColor: 'red' | 'blue' | 'emerald' | 'amber' | 'purple' | 'gray' = 'gray';
      if (lower.includes('photo')) badgeColor = 'red';
      else if (lower.includes('video') || lower.includes('cinema')) badgeColor = 'blue';
      else if (lower.includes('drone')) badgeColor = 'blue';
      else if (lower.includes('edit') || lower.includes('album')) badgeColor = 'purple';

      return {
        value: c.name,
        label: c.name,
        sublabel: `${c.role} • ${c.location} • ₹${(Number(c.charges) || 0).toLocaleString('en-IN')}/day`,
        badge: c.role,
        badgeColor,
        avatar: c.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'Crew')}&background=e50914&color=fff&bold=true&size=64`,
        data: c
      };
    });
  }, [crewData]);

  // Quick statistics
  const stats = useMemo(() => {
    const total = crewData.length;
    const photoCount = crewData.filter(c => (c.role || '').toLowerCase().includes('photo')).length;
    const videoCount = crewData.filter(c => (c.role || '').toLowerCase().includes('video') || (c.role || '').toLowerCase().includes('cinema')).length;
    const droneCount = crewData.filter(c => (c.role || '').toLowerCase().includes('drone')).length;
    const editorCount = crewData.filter(c => (c.role || '').toLowerCase().includes('edit') || (c.role || '').toLowerCase().includes('album')).length;
    
    const validCharges = crewData.map(c => Number(c.charges) || 0).filter(c => c > 0);
    const avgRate = validCharges.length > 0 ? Math.round(validCharges.reduce((a, b) => a + b, 0) / validCharges.length) : 0;

    return { total, photoCount, videoCount, droneCount, editorCount, avgRate };
  }, [crewData]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (roleFilter !== 'all') count++;
    if (cityFilter !== 'all') count++;
    if (rateRange !== 'all') count++;
    return count;
  }, [roleFilter, cityFilter, rateRange]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setCityFilter('all');
    setRateRange('all');
    setSortBy('default');
  };

  // Auto-Search, Filter & Sort Data Processing
  const filteredAndSortedCrew = useMemo(() => {
    // 1. Filter
    const filtered = crewData.filter((c) => {
      const r = (c.role || '').trim();
      const rLower = r.toLowerCase();
      const loc = (c.location || '').toLowerCase();
      const charges = Number(c.charges) || 0;

      // Exact or Category Role check
      if (roleFilter !== 'all') {
        // Match exact role from database or case-insensitive match
        if (r.toLowerCase() !== roleFilter.toLowerCase()) {
          return false;
        }
      }

      // City check
      if (cityFilter !== 'all' && loc !== cityFilter.toLowerCase()) {
        return false;
      }

      // Rate range check
      if (rateRange === 'under-3k' && charges >= 3000) return false;
      if (rateRange === '3k-6k' && (charges < 3000 || charges > 6000)) return false;
      if (rateRange === 'above-6k' && charges <= 6000) return false;

      // Auto search query check
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.role && c.role.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.charges && c.charges.toString().includes(q))
      );
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      if (sortBy === 'rate-asc') {
        return (Number(a.charges) || 0) - (Number(b.charges) || 0);
      }
      if (sortBy === 'rate-desc') {
        return (Number(b.charges) || 0) - (Number(a.charges) || 0);
      }
      if (sortBy === 'role') {
        return (a.role || '').localeCompare(b.role || '');
      }
      if (sortBy === 'location') {
        return (a.location || '').localeCompare(b.location || '');
      }
      return 0; // Default
    });
  }, [crewData, roleFilter, cityFilter, rateRange, searchQuery, sortBy]);

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
    if (r.includes('photo')) {
      return {
        icon: Camera,
        bgClass: 'bg-red-50 dark:bg-red-950/40 text-[#e50914] dark:text-red-400 border-red-200/60 dark:border-red-900/50',
        glowClass: 'from-red-500/20 to-transparent'
      };
    }
    return {
      icon: Sparkles,
      bgClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/50',
      glowClass: 'from-amber-500/20 to-transparent'
    };
  };

  const sortLabels: Record<SortOption, string> = {
    default: 'Default Order',
    'name-asc': 'Name (A → Z)',
    'name-desc': 'Name (Z → A)',
    'rate-desc': 'Rate: High to Low (₹ ↓)',
    'rate-asc': 'Rate: Low to High (₹ ↑)',
    role: 'Role Specialty',
    location: 'Location (A → Z)'
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
            <div className="text-[20px] font-black text-purple-600 dark:text-purple-400 mt-0.5">{stats.editorCount + stats.droneCount}</div>
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

      {/* Modern Filter, Sort & Auto-Search Controls */}
      <div className="bg-white dark:bg-[#15181e] p-4 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3.5">
        
        {/* Top Control Strip */}
        <div className="flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center justify-between">
          
          {/* Auto Search Dropdown Input Component */}
          <div className="relative flex-1">
            <AutoSearchInput
              value={searchQuery}
              onChange={(val, selected) => {
                setSearchQuery(val);
                if (selected?.data) {
                  openViewDrawer(selected.data);
                }
              }}
              options={crewSearchOptions}
              placeholder="Auto-search by name, role, city, phone (e.g. Chinmay, Editor, Bhubaneswar)..."
              icon={<Search className="w-4 h-4 text-gray-400" />}
              allowCustom={true}
              inputClassName="py-2.5 bg-gray-50 dark:bg-gray-800/60 text-[13px]"
            />
          </div>

          {/* Action Buttons: Filter, Sort, View Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            
            {/* 1. FILTER BUTTON & DROPDOWN */}
            <div className="relative" ref={filterMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  setIsSortOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-[12px] font-extrabold transition-all cursor-pointer border ${
                  activeFiltersCount > 0 || isFilterOpen
                    ? 'bg-[#fef2f2] dark:bg-red-950/40 text-[#e50914] border-[#e50914]/40 shadow-xs'
                    : 'bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 border-gray-200/80 dark:border-gray-700/80 hover:border-gray-300'
                }`}
              >
                <Filter className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#e50914] text-white text-[10px] font-black flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Filter Floating Popover Menu */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#181a22] border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-5 z-50 animate-scale-up space-y-4 text-gray-800 dark:text-gray-100">
                  <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3">
                    <div className="flex items-center gap-2 font-black text-[13px]">
                      <SlidersHorizontal className="w-4 h-4 text-[#e50914]" />
                      <span>Roster Filters</span>
                    </div>
                    {activeFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={resetAllFilters}
                        className="text-[11px] font-bold text-[#e50914] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Role Category Selection from stored DB Roles */}
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-extrabold text-gray-400 uppercase tracking-wider block">
                      Database Stored Roles ({distinctDbRoles.length})
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 rounded-xl text-[12px] font-bold text-gray-800 dark:text-white focus:outline-none focus:border-[#e50914]"
                    >
                      <option value="all">All Roles ({stats.total})</option>
                      {distinctDbRoles.map((d) => (
                        <option key={d.role} value={d.role}>
                          {d.role} ({d.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City / Base Location from DB */}
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-extrabold text-gray-400 uppercase tracking-wider block">
                      Operating Base City ({distinctCities.length})
                    </label>
                    <select
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 rounded-xl text-[12px] font-bold text-gray-800 dark:text-white focus:outline-none focus:border-[#e50914]"
                    >
                      <option value="all">All Locations ({distinctCities.length})</option>
                      {distinctCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Day Rate Range */}
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-extrabold text-gray-400 uppercase tracking-wider block">
                      Commercial Day Rate
                    </label>
                    <select
                      value={rateRange}
                      onChange={(e) => setRateRange(e.target.value as RateRange)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 rounded-xl text-[12px] font-bold text-gray-800 dark:text-white focus:outline-none focus:border-[#e50914]"
                    >
                      <option value="all">All Rate Ranges</option>
                      <option value="under-3k">Under ₹3,000 / day</option>
                      <option value="3k-6k">₹3,000 - ₹6,000 / day</option>
                      <option value="above-6k">Above ₹6,000 / day</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full py-2 bg-[#0a0b0d] hover:bg-black dark:bg-[#e50914] dark:hover:bg-red-700 text-white rounded-xl text-[12px] font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              )}
            </div>

            {/* 2. SORT BUTTON & DROPDOWN */}
            <div className="relative" ref={sortMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsFilterOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-[12px] font-extrabold transition-all cursor-pointer border ${
                  sortBy !== 'default' || isSortOpen
                    ? 'bg-[#fef2f2] dark:bg-red-950/40 text-[#e50914] border-[#e50914]/40 shadow-xs'
                    : 'bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 border-gray-200/80 dark:border-gray-700/80 hover:border-gray-300'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Sort:</span>
                <span className="font-black text-[#e50914] truncate max-w-[110px]">
                  {sortLabels[sortBy].split(' ')[0]}
                </span>
              </button>

              {/* Sort Floating Popover Menu */}
              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#181a22] border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-3 z-50 animate-scale-up space-y-1 text-gray-800 dark:text-gray-100">
                  <div className="px-3 py-2 border-b border-gray-150 dark:border-gray-800 font-extrabold text-[11px] text-gray-400 uppercase tracking-wider">
                    Sort Roster By
                  </div>

                  {(Object.keys(sortLabels) as SortOption[]).map((optionKey) => {
                    const isSelected = sortBy === optionKey;
                    return (
                      <button
                        key={optionKey}
                        type="button"
                        onClick={() => {
                          setSortBy(optionKey);
                          setIsSortOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-bold text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#fef2f2] dark:bg-red-950/50 text-[#e50914]'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{sortLabels[optionKey]}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#e50914]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. VIEW MODE TOGGLE */}
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

        {/* Active Filters & Match Count Bar */}
        {(searchQuery || roleFilter !== 'all' || cityFilter !== 'all' || rateRange !== 'all' || sortBy !== 'default') && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-150/70 dark:border-gray-800/60 text-[11.5px]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-gray-400 font-bold">Active filters:</span>
              
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-[#e50914] rounded-lg font-bold">
                  Search: &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')} className="hover:text-red-700 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}

              {roleFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-[#e50914] rounded-lg font-bold">
                  Role: {roleFilter}
                  <button onClick={() => setRoleFilter('all')} className="hover:text-red-700 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}

              {cityFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg font-bold">
                  City: {cityFilter}
                  <button onClick={() => setCityFilter('all')} className="hover:text-blue-800 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}

              {rateRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg font-bold">
                  Rate: {rateRange === 'under-3k' ? '< ₹3k' : rateRange === '3k-6k' ? '₹3k - ₹6k' : '> ₹6k'}
                  <button onClick={() => setRateRange('all')} className="hover:text-emerald-800 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}

              {sortBy !== 'default' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-lg font-bold">
                  Sorted: {sortLabels[sortBy]}
                  <button onClick={() => setSortBy('default')} className="hover:text-purple-800 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}

              <button
                onClick={resetAllFilters}
                className="text-[11px] font-extrabold text-gray-500 hover:text-[#e50914] underline pl-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>

            <div className="text-gray-400 font-extrabold">
              Showing <span className="text-gray-900 dark:text-white font-black">{filteredAndSortedCrew.length}</span> of {crewData.length} crew
            </div>
          </div>
        )}

      </div>

      {/* Main Roster Records (Grid or List View) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-3xl h-[240px] bg-white dark:bg-[#15181e] border border-gray-200/80 dark:border-gray-800" />
          ))}
        </div>
      ) : filteredAndSortedCrew.length === 0 ? (
        <div className="rounded-[32px] p-16 text-center max-w-md mx-auto space-y-4 bg-white dark:bg-[#15181e] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/40 text-[#e50914] flex items-center justify-center mx-auto border border-red-200/60 dark:border-red-900/50">
            <Briefcase className="w-7 h-7 stroke-[2]" />
          </div>
          <h3 className="text-[17px] font-black text-gray-900 dark:text-white">
            {searchQuery ? `No crew found matching "${searchQuery}"` : 'No crew members found with active filters'}
          </h3>
          <p className="text-[12.5px] text-gray-400 font-medium leading-relaxed">
            {searchQuery ? 'Try clearing your auto-search query or resetting the filter options.' : 'Click "Reset Filters" to view all crew records.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[12px] font-bold rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={openAddDrawer}
              className="px-4 py-2 bg-[#e50914] hover:bg-red-700 text-white text-[12px] font-bold rounded-xl cursor-pointer"
            >
              Register Crew Member
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAndSortedCrew.map((crew) => {
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
                    className="flex items-center gap-1 text-[11px] font-extrabold text-gray-500 group-hover:text-[#e50914] transition-colors cursor-pointer"
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
                {filteredAndSortedCrew.map((crew) => {
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
        availableRoles={availableRolesList}
        availableCities={distinctCities}
        onDelete={(id) => handleDelete(id)}
        onSuccess={fetchData}
      />
    </div>
  );
}
