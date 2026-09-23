'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getCrew, createCrew, updateCrew, deleteCrew } from '@/app/actions';
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
  Check,
  User,
  Building
} from 'lucide-react';
import { toast } from 'sonner';
import CloudinaryUpload from '@/components/ui/CloudinaryUpload';
import CrewDetailDrawer from '@/components/blueprints/CrewDetailDrawer';

const QUICK_ROLES = [
  'Lead Photographer',
  'Cinematographer',
  'Candid Photographer',
  'Traditional Videographer',
  'Drone Pilot',
  'Video Editor',
  'Album Designer',
  'Photography',
  'Videography'
];

const QUICK_CITIES = [
  'Bhubaneswar',
  'Cuttack',
  'Puri',
  'Kolkata',
  'West Bengal',
  'Dhenkanal',
  'Berhampur'
];

export default function BlueprintPage() {
  const [crewData, setCrewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Right sidebar details drawer state
  const [selectedCrewForDetail, setSelectedCrewForDetail] = useState<any | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    location: '',
    phone: '',
    address: '',
    charges: '',
    avatarUrl: ''
  });

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

  const openAddModal = () => {
    setFormData({ 
      name: '', 
      role: 'Lead Photographer', 
      location: 'Bhubaneswar', 
      phone: '', 
      address: '', 
      charges: '5000', 
      avatarUrl: '' 
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (crew: any) => {
    setFormData({
      name: crew.name || '',
      role: crew.role || '',
      location: crew.location || '',
      phone: crew.phone || '',
      address: crew.address || '',
      charges: crew.charges ? crew.charges.toString() : '',
      avatarUrl: crew.avatarUrl || ''
    });
    setEditingId(crew._id);
    setIsModalOpen(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter the crew member name');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter the contact phone number');
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      name: formData.name.trim(),
      charges: parseInt(formData.charges, 10) || 0
    };

    try {
      if (editingId) {
        await updateCrew(editingId, payload);
        toast.success(`Updated ${formData.name}'s profile`);
      } else {
        await createCrew(payload);
        toast.success(`Registered ${formData.name} in Blueprints`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save crew record');
    } finally {
      setSubmitting(false);
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
        icon: <Radio className="w-3.5 h-3.5" />,
        badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/50',
        glowClass: 'from-amber-500/10 to-orange-500/5'
      };
    }
    if (r.includes('video') || r.includes('cinema')) {
      return {
        icon: <Video className="w-3.5 h-3.5" />,
        badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-900/50',
        glowClass: 'from-blue-500/10 to-indigo-500/5'
      };
    }
    if (r.includes('edit')) {
      return {
        icon: <Scissors className="w-3.5 h-3.5" />,
        badgeClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-900/50',
        glowClass: 'from-purple-500/10 to-pink-500/5'
      };
    }
    if (r.includes('album')) {
      return {
        icon: <Palette className="w-3.5 h-3.5" />,
        badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/50',
        glowClass: 'from-rose-500/10 to-red-500/5'
      };
    }
    return {
      icon: <Camera className="w-3.5 h-3.5" />,
      badgeClass: 'bg-red-50 dark:bg-red-950/40 text-[#e50914] dark:text-red-300 border-red-200/80 dark:border-red-900/50',
      glowClass: 'from-red-500/10 to-rose-500/5'
    };
  };

  return (
    <div className="space-y-6 w-full pb-16 animate-fade-in text-gray-800 dark:text-gray-100 font-sans">
      
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
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl text-[13px] font-black shadow-md shadow-red-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Crew Member</span>
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

        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/30 dark:to-gray-900 border border-emerald-500/20 dark:border-emerald-900/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Avg Day Rate</span>
            <div className="text-[20px] font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
              ₹{stats.avgRate.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-4.5 h-4.5 stroke-[2.5]" />
          </div>
        </div>

      </div>

      {/* Search & Role Quick Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 bg-white/70 dark:bg-[#15181e]/80 p-3 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 backdrop-blur-md shadow-xs">
        {/* Search Bar */}
        <div className="flex-1 w-full sm:max-w-md flex items-center px-3.5 py-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#e50914] focus-within:ring-2 focus-within:ring-red-500/15 transition-all">
          <Search className="text-gray-400 w-4 h-4 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, city, or phone..."
            className="bg-transparent border-none focus:outline-none text-[13px] font-semibold w-full placeholder:text-gray-400 text-gray-800 dark:text-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0 cursor-pointer"
              title="Clear Search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Buttons & View Mode */}
        <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-800/60 p-1 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
            {[
              { id: 'all', label: 'All Roster' },
              { id: 'photo', label: 'Photo' },
              { id: 'video', label: 'Cinema / Video' },
              { id: 'drone', label: 'Drone' },
              { id: 'edit', label: 'Editors' },
            ].map((r) => {
              const isActive = roleFilter === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoleFilter(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
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
          <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/60 p-1 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer ${
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
            {searchQuery ? 'Try clearing your search query or switching the category filter.' : 'Click "Add Crew Member" to register your shoot operators.'}
          </p>
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
                onClick={() => {
                  setSelectedCrewForDetail(crew);
                  setIsDetailDrawerOpen(true);
                }}
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

                    {/* Top Action Pills (Edit & Delete) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(crew);
                        }}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-[#e50914] rounded-lg transition-colors cursor-pointer"
                        title="Edit Record"
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

                  {/* Role Badge */}
                  <div className="mt-4 relative z-10">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${roleStyle.badgeClass}`}>
                      {roleStyle.icon}
                      <span className="truncate max-w-[180px]">{crew.role || 'Specialist'}</span>
                    </span>
                  </div>

                  {/* Daily Rate & Phone Section */}
                  <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[12px] relative z-10">
                    <div>
                      <span className="text-gray-400 text-[9.5px] font-bold uppercase tracking-wider block">Commercial Rate</span>
                      <div className="text-[16px] font-black text-gray-900 dark:text-white mt-0.5">
                        ₹{(Number(crew.charges) || 0).toLocaleString('en-IN')} <span className="text-[10px] text-gray-400 font-bold">/ day</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-gray-400 text-[9.5px] font-bold uppercase tracking-wider block">Half Day</span>
                      <div className="text-[13px] font-extrabold text-gray-700 dark:text-gray-300 mt-0.5">
                        ₹{Math.round((Number(crew.charges) || 0) * 0.6).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Direct Connect Actions (Call & WhatsApp) */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2 relative z-10">
                  <a
                    href={`tel:${crew.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#e50914]" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`https://wa.me/${waNumber}?text=Hi%20${encodeURIComponent(crew.name)},%20reaching%20out%20from%20Arjun%20Films%20Studio`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-[11px] font-bold border border-emerald-200/50 dark:border-emerald-900/40 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCrewForDetail(crew);
                      setIsDetailDrawerOpen(true);
                    }}
                    className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 rounded-xl transition-colors"
                    title="View Rate Card"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Compact Table List View */
        <div className="bg-white dark:bg-[#15181e] border border-gray-200/80 dark:border-gray-800/80 rounded-[28px] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead className="bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200/80 dark:border-gray-700/80 text-[10.5px] font-black uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="py-3.5 px-5">Crew Member</th>
                  <th className="py-3.5 px-4">Specialization</th>
                  <th className="py-3.5 px-4">Base City</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4 text-right">Daily Rate</th>
                  <th className="py-3.5 px-5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70 font-semibold">
                {filteredCrew.map((crew) => {
                  const avatarUrl = crew.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(crew.name || 'Crew')}&background=e50914&color=fff&bold=true&size=128`;
                  const roleStyle = getRoleIconAndColor(crew.role);
                  const cleanPhone = (crew.phone || '').replace(/[^0-9]/g, '');
                  const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

                  return (
                    <tr 
                      key={crew._id}
                      onClick={() => {
                        setSelectedCrewForDetail(crew);
                        setIsDetailDrawerOpen(true);
                      }}
                      className="hover:bg-red-50/30 dark:hover:bg-gray-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200/80 dark:border-gray-700">
                            <img src={avatarUrl} alt={crew.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900 dark:text-white group-hover:text-[#e50914] transition-colors text-[13.5px]">
                              {crew.name}
                            </div>
                            <span className="text-[10.5px] text-gray-400 font-medium">Verified Roster</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${roleStyle.badgeClass}`}>
                          {roleStyle.icon}
                          <span>{crew.role}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{crew.location || 'Studio HQ'}</span>
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
                            onClick={() => openEditModal(crew)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-[#e50914] rounded-lg transition-colors cursor-pointer"
                            title="Edit Record"
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
      {/* 🌟 PROFESSIONAL EDIT / REGISTER CREW MODAL                              */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => setIsModalOpen(false)} 
          />

          {/* Modal Container */}
          <form 
            onSubmit={handleSubmit}
            className="relative w-full max-w-lg bg-white dark:bg-[#16181f] border border-gray-200/90 dark:border-gray-800 rounded-[32px] shadow-2xl overflow-hidden animate-scale-up text-gray-800 dark:text-gray-100 z-10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-150 dark:border-gray-800/80 bg-gradient-to-r from-red-50/50 via-white to-transparent dark:from-red-950/20 dark:via-[#16181f] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#e50914]/10 text-[#e50914] flex items-center justify-center border border-[#e50914]/20 shadow-xs">
                  {editingId ? <Edit2 className="w-5 h-5 stroke-[2.2]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
                </div>
                <div>
                  <h3 className="text-[17px] font-black text-gray-900 dark:text-white leading-tight">
                    {editingId ? 'Edit Crew Profile & Rate Card' : 'Register New Crew Member'}
                  </h3>
                  <p className="text-[11.5px] text-gray-400 font-bold mt-0.5">
                    {editingId ? 'Update contact numbers, role specialization, and daily commercial rates.' : 'Add a photographer or shoot operator to the studio blueprint.'}
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              
              {/* Photo Upload Card */}
              <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60 flex flex-col items-center justify-center text-center">
                <CloudinaryUpload
                  value={formData.avatarUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
                  variant="avatar"
                  folder="crew"
                  label="Crew Member Profile Picture"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Full Name *
                </label>
                <div className="flex items-center px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#e50914] focus-within:ring-2 focus-within:ring-red-500/15 transition-all">
                  <User className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="bg-transparent border-none focus:outline-none text-[13.5px] font-bold w-full text-gray-900 dark:text-white placeholder:text-gray-400" 
                    placeholder="e.g. Rahul Tudu" 
                  />
                </div>
              </div>

              {/* Role & Specialization */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Role & Specialization *
                </label>
                <div className="flex items-center px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#e50914] focus-within:ring-2 focus-within:ring-red-500/15 transition-all">
                  <Briefcase className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                  <input 
                    type="text" 
                    required 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="bg-transparent border-none focus:outline-none text-[13.5px] font-bold w-full text-gray-900 dark:text-white placeholder:text-gray-400" 
                    placeholder="Type or select a role below..." 
                  />
                </div>
                {/* Quick Role Selector Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_ROLES.map((roleOption) => (
                    <button
                      key={roleOption}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: roleOption })}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer border ${
                        formData.role === roleOption
                          ? 'bg-[#e50914] text-white border-[#e50914] shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border-gray-200/60 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {roleOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commercial Charges (₹ / Day) & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Charges */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Daily Rate (₹ / Day) *
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#e50914] focus-within:ring-2 focus-within:ring-red-500/15 transition-all">
                    <span className="text-[14px] font-black text-[#e50914] mr-2">₹</span>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      value={formData.charges}
                      onChange={e => setFormData({...formData, charges: e.target.value})}
                      className="bg-transparent border-none focus:outline-none text-[13.5px] font-black w-full text-gray-900 dark:text-white placeholder:text-gray-400" 
                      placeholder="e.g. 6000" 
                    />
                  </div>
                  {formData.charges && (
                    <span className="text-[10px] text-gray-400 font-bold block pl-1">
                      Half-day: ₹{Math.round((parseInt(formData.charges) || 0) * 0.6).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Base City / Location */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Base City / Location *
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#e50914] focus-within:ring-2 focus-within:ring-red-500/15 transition-all">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                    <input 
                      type="text" 
                      required 
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="bg-transparent border-none focus:outline-none text-[13.5px] font-bold w-full text-gray-900 dark:text-white placeholder:text-gray-400" 
                      placeholder="e.g. Bhubaneswar" 
                    />
                  </div>
                  {/* Quick City Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {QUICK_CITIES.slice(0, 4).map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setFormData({ ...formData, location: city })}
                        className="text-[9.5px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Contact Phone Number *
                </label>
                <div className="flex items-center px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#e50914] focus-within:ring-2 focus-within:ring-red-500/15 transition-all">
                  <Phone className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                  <input 
                    type="tel" 
                    required 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="bg-transparent border-none focus:outline-none text-[13.5px] font-bold w-full text-gray-900 dark:text-white placeholder:text-gray-400" 
                    placeholder="e.g. 79780 69297" 
                  />
                </div>
              </div>

              {/* Studio / Residential Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Studio / Residential Address
                </label>
                <div className="flex items-start px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/80 dark:border-gray-700/80 focus-within:border-[#e50914] focus-within:ring-2 focus-within:ring-red-500/15 transition-all">
                  <Building className="w-4 h-4 text-gray-400 mr-2.5 mt-0.5 shrink-0" />
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="bg-transparent border-none focus:outline-none text-[13px] font-medium w-full text-gray-900 dark:text-white placeholder:text-gray-400" 
                    placeholder="e.g. Kolothia, Bhubaneswar, Odisha" 
                  />
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-5 border-t border-gray-150 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 text-[12.5px] font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white text-[13px] font-black shadow-md shadow-red-500/20 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{editingId ? 'Save Profile Changes' : 'Register Crew Member'}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Crew Details Right Sidebar Slide-Over Drawer */}
      <CrewDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        crew={selectedCrewForDetail}
        onEdit={(crew) => openEditModal(crew)}
        onDelete={(id) => handleDelete(id)}
      />
    </div>
  );
}
