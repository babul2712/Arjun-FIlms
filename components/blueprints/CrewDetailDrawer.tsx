'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Check, 
  Copy, 
  Calendar, 
  Award, 
  Sparkles, 
  Camera, 
  Video, 
  Clock,
  Layers,
  ChevronRight,
  UserCheck,
  Compass,
  Radio,
  Zap,
  Heart,
  Scissors,
  Palette,
  User,
  Building,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { createCrew, updateCrew } from '@/app/actions';
import CloudinaryUpload from '@/components/ui/CloudinaryUpload';
import AutoSearchInput, { AutoSearchOption } from '@/components/ui/AutoSearchInput';

interface CrewDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  crew: any | null;
  onDelete: (id: string) => void;
  onSuccess?: () => void;
  initialMode?: 'view' | 'edit' | 'create';
  availableRoles?: string[];
  availableCities?: string[];
}

export default function CrewDetailDrawer({
  isOpen,
  onClose,
  crew,
  onDelete,
  onSuccess,
  initialMode = 'view',
  availableRoles = [],
  availableCities = []
}: CrewDetailDrawerProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>(initialMode);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Lead Photographer',
    location: 'Bhubaneswar',
    phone: '',
    address: '',
    charges: '5000',
    avatarUrl: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync mode and form state whenever crew or initialMode changes
  useEffect(() => {
    if (initialMode === 'create' || !crew) {
      setMode('create');
      setFormData({
        name: '',
        role: availableRoles[0] || 'Lead Photographer',
        location: availableCities[0] || 'Bhubaneswar',
        phone: '',
        address: '',
        charges: '5000',
        avatarUrl: ''
      });
    } else {
      setMode(initialMode || 'view');
      setFormData({
        name: crew.name || '',
        role: crew.role || availableRoles[0] || 'Lead Photographer',
        location: crew.location || availableCities[0] || 'Bhubaneswar',
        phone: crew.phone || '',
        address: crew.address || '',
        charges: crew.charges ? crew.charges.toString() : '5000',
        avatarUrl: crew.avatarUrl || ''
      });
    }
  }, [crew, initialMode, isOpen, availableRoles, availableCities]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Convert available roles and cities into AutoSearchOptions
  const roleSearchOptions: AutoSearchOption[] = useMemo(() => {
    const defaultRoles = [
      'Videography',
      'Photography',
      'Video Editor',
      'Album Designer',
      'Drone PIlot',
      'Album Print Store',
      'Lead Photographer',
      'Cinematographer',
      'Candid Photographer',
      'Traditional Videographer'
    ];
    const combined = Array.from(new Set([...availableRoles, ...defaultRoles])).filter(Boolean);
    return combined.map(r => {
      const lower = r.toLowerCase();
      let badgeColor: 'red' | 'blue' | 'emerald' | 'amber' | 'purple' | 'gray' = 'gray';
      if (lower.includes('photo')) badgeColor = 'red';
      else if (lower.includes('video') || lower.includes('cinema')) badgeColor = 'blue';
      else if (lower.includes('drone')) badgeColor = 'blue';
      else if (lower.includes('edit') || lower.includes('album')) badgeColor = 'purple';
      
      return {
        value: r,
        label: r,
        sublabel: 'Database Specialty Role',
        badge: r,
        badgeColor
      };
    });
  }, [availableRoles]);

  const citySearchOptions: AutoSearchOption[] = useMemo(() => {
    const defaultCities = ['Bhubaneswar', 'Cuttack', 'Puri', 'Kolkata', 'West Bengal', 'Berhampur', 'Sambalpur', 'Rourkela'];
    const combined = Array.from(new Set([...availableCities, ...defaultCities])).filter(Boolean);
    return combined.map(c => ({
      value: c,
      label: c,
      sublabel: 'Operating City',
      badge: 'Base',
      badgeColor: 'emerald' as const
    }));
  }, [availableCities]);

  if (!mounted || !isOpen) return null;

  const avatarUrl = formData.avatarUrl || (crew?.avatarUrl) || (
    (crew?.name || formData.name || '').includes('Davidson') ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80' :
    (crew?.name || formData.name || '').includes('Veronica') ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&h=300&q=80' :
    (crew?.name || formData.name || '').includes('Harris') ? 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&h=300&q=80' :
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80'
  );

  const cleanPhone = ((mode === 'view' ? crew?.phone : formData.phone) || '').replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  const handleCopyPhone = () => {
    const phoneToCopy = mode === 'view' ? crew?.phone : formData.phone;
    navigator.clipboard.writeText(phoneToCopy || '');
    setCopiedPhone(true);
    toast.success('Phone number copied to clipboard');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const currentCharges = mode === 'view' ? (crew?.charges || 0) : (parseInt(formData.charges, 10) || 0);
  const halfDayRate = Math.round(currentCharges * 0.6);
  const twoDayRate = currentCharges * 2;
  const overtimeRate = Math.round(currentCharges * 0.15);

  const isVideo = ((mode === 'view' ? crew?.role : formData.role) || '').toLowerCase().includes('video') || 
                  ((mode === 'view' ? crew?.role : formData.role) || '').toLowerCase().includes('cinema') || 
                  ((mode === 'view' ? crew?.role : formData.role) || '').toLowerCase().includes('drone');
  const isPhoto = ((mode === 'view' ? crew?.role : formData.role) || '').toLowerCase().includes('photo') || 
                  ((mode === 'view' ? crew?.role : formData.role) || '').toLowerCase().includes('candid') || 
                  ((mode === 'view' ? crew?.role : formData.role) || '').toLowerCase().includes('lead');
  const isEditor = ((mode === 'view' ? crew?.role : formData.role) || '').toLowerCase().includes('edit') ||
                   ((mode === 'view' ? crew?.role : formData.role) || '').toLowerCase().includes('album');

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
    if (!formData.role.trim()) {
      toast.error('Please enter or select a role');
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      name: formData.name.trim(),
      role: formData.role.trim(),
      location: formData.location.trim() || 'Bhubaneswar',
      charges: parseInt(formData.charges, 10) || 0
    };

    try {
      if (mode === 'edit' && crew?._id) {
        await updateCrew(crew._id, payload);
        toast.success(`Updated ${formData.name}'s profile directly from sidebar`);
      } else {
        await createCrew(payload);
        toast.success(`Registered ${formData.name} in Blueprints`);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error('Failed to save crew record');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over Right/Side Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-[#15181e] border-l border-[#fee2e2] dark:border-gray-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in-right text-gray-800 dark:text-gray-100">
          
          {/* Top Header Bar */}
          <div className="p-4 sm:p-5 border-b border-gray-150 dark:border-gray-800/80 flex items-center justify-between bg-gradient-to-r from-[#fdf6f6] to-white dark:from-gray-900/60 dark:to-[#15181e] shrink-0">
            <div className="flex items-center gap-2.5">
              {mode !== 'view' && crew && (
                <button
                  type="button"
                  onClick={() => setMode('view')}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors cursor-pointer"
                  title="Back to View Mode"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <span className={`w-2.5 h-2.5 rounded-full ${mode === 'view' ? 'bg-emerald-500 animate-pulse' : 'bg-[#e50914]'}`} />
              <div>
                <h3 className="text-[14px] font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  {mode === 'create' ? 'Register New Crew Member' : mode === 'edit' ? 'Edit Crew Blueprint' : 'Crew Blueprint Profile'}
                </h3>
                <p className="text-[10.5px] text-gray-400 font-bold">
                  {mode === 'create' ? 'Sidebar Instant Registration' : mode === 'edit' ? 'In-Sidebar Live Editor' : 'Sidebar Quick Overview'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {mode === 'view' && crew && (
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fef2f2] dark:bg-red-950/40 hover:bg-[#fee2e2] text-[#e50914] dark:text-red-300 border border-[#fee2e2] dark:border-red-900/50 rounded-xl text-[11px] font-black transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title="Edit directly inside this sidebar"
                >
                  <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Edit in Sidebar</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                title="Close Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* VIEW MODE                                                         */}
          {/* ================================================================= */}
          {mode === 'view' && crew && (
            <>
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {/* Hero Profile Block */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-3xl bg-gradient-to-br from-[#fef2f2] to-white dark:from-red-950/20 dark:to-gray-900/40 border border-[#fee2e2] dark:border-red-950/40">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-white dark:border-gray-800 shadow-lg shrink-0 bg-gray-100">
                      <img 
                        src={avatarUrl} 
                        alt={crew.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-[#0a0b0d] text-white p-1.5 rounded-xl shadow-md border border-white dark:border-gray-800">
                      {isVideo ? <Video className="w-3.5 h-3.5 text-[#e50914]" /> : <Camera className="w-3.5 h-3.5 text-[#e50914]" />}
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-[19px] font-black text-gray-900 dark:text-white leading-tight">
                        {crew.name}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                        <UserCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </div>

                    <div className="inline-block bg-[#fef2f2] dark:bg-red-950/40 text-[#e50914] dark:text-red-300 border border-[#fee2e2] dark:border-red-900/50 text-[10.5px] font-black uppercase px-3 py-1 rounded-xl">
                      {crew.role}
                    </div>

                    <p className="text-[12px] text-gray-500 dark:text-gray-400 font-semibold flex items-center justify-center sm:justify-start gap-1 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {crew.location}
                    </p>
                  </div>
                </div>

                {/* Quick Action Triggers */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${crew.phone}`}
                    className="flex items-center justify-center gap-2 p-3 bg-gray-900 hover:bg-black text-white rounded-2xl text-[12px] font-extrabold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Phone className="w-4 h-4 text-[#e50914]" />
                    Call Direct
                  </a>

                  <a
                    href={`https://wa.me/${waNumber}?text=Hi%20${encodeURIComponent(crew.name)},%20reaching%20out%20from%20Arjun%20Films%20Studio`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[12px] font-extrabold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>

                {/* Rate Card Section */}
                <div className="space-y-3">
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block">
                    Standard Commercial Rate Card
                  </span>

                  <div className="grid grid-cols-2 gap-3 text-[12px]">
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-xs space-y-1">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Full Day Shoot (8 hrs)</span>
                      <div className="text-[18px] font-black text-gray-900 dark:text-white">
                        ₹{currentCharges.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Standard Base Rate</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-xs space-y-1">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Half Day (4 hrs)</span>
                      <div className="text-[18px] font-black text-gray-900 dark:text-white">
                        ₹{halfDayRate.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold">60% day charge</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-xs space-y-1">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">2-Day Wedding Package</span>
                      <div className="text-[18px] font-black text-gray-900 dark:text-white">
                        ₹{twoDayRate.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold">Consecutive dates</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-xs space-y-1">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Overtime Rate</span>
                      <div className="text-[18px] font-black text-gray-900 dark:text-white">
                        ₹{overtimeRate.toLocaleString('en-IN')} <span className="text-[11px] text-gray-400 font-bold">/ hr</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold">Beyond 8 hours</span>
                    </div>
                  </div>
                </div>

                {/* Contact & Address Breakdown */}
                <div className="space-y-3">
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block">
                    Contact & Address Details
                  </span>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800 space-y-3.5 text-[12px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="text-gray-400 text-[10px] font-bold block uppercase">Phone Number</span>
                          <span className="font-extrabold text-gray-800 dark:text-gray-200">{crew.phone}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyPhone}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors cursor-pointer"
                        title="Copy Phone"
                      >
                        {copiedPhone ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="border-t border-gray-200/40 dark:border-gray-800 pt-3 flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-gray-400 text-[10px] font-bold block uppercase">Operating Base & City</span>
                        <span className="font-extrabold text-gray-800 dark:text-gray-200">{crew.location}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200/40 dark:border-gray-800 pt-3 flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#e50914] mt-0.5 shrink-0" />
                      <div>
                        <span className="text-gray-400 text-[10px] font-bold block uppercase">Mailing Address</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300 leading-relaxed">{crew.address || 'Standard Studio Roster HQ'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specialization Badges */}
                <div className="space-y-3">
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block">
                    Technical Badges & Gear Roster
                  </span>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#e50914]" />
                      {crew.role}
                    </span>
                    {isVideo && (
                      <>
                        <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px] flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-blue-500" />
                          Sony FX3 / A7SIII 4K
                        </span>
                        <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px] flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-indigo-500" />
                          DJI RS3 Pro Gimbal
                        </span>
                        <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px] flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-sky-500" />
                          4K Drone Certified
                        </span>
                      </>
                    )}
                    {isPhoto && (
                      <>
                        <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px] flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-amber-500" />
                          Sony A7IV + GM Lenses
                        </span>
                        <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px] flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          Profoto / Godox Lighting
                        </span>
                      </>
                    )}
                    {isEditor && (
                      <>
                        <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px] flex items-center gap-1.5">
                          <Scissors className="w-3.5 h-3.5 text-purple-500" />
                          DaVinci Resolve Studio
                        </span>
                      </>
                    )}
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Background Verified
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Action Footer */}
              <div className="p-4 sm:p-5 border-t border-gray-150 dark:border-gray-800 bg-[#fdf6f6]/60 dark:bg-gray-900/60 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onDelete(crew._id);
                    onClose();
                  }}
                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-2xl transition-all cursor-pointer"
                  title="Remove from Blueprints"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-[12px] font-bold transition-all cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('edit')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0b0d] hover:bg-black dark:bg-[#e50914] dark:hover:bg-red-700 text-white rounded-xl text-[12px] font-bold shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <Edit2 className="w-4 h-4 text-[#e50914] dark:text-white" />
                    Edit in Sidebar
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ================================================================= */}
          {/* EDIT / CREATE IN-SIDEBAR FORM                                     */}
          {/* ================================================================= */}
          {(mode === 'edit' || mode === 'create') && (
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
                
                {/* Photo Upload Card */}
                <div className="p-4 rounded-3xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60 flex flex-col items-center justify-center text-center">
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

                {/* Role & Specialization using AutoSearchInput */}
                <div className="space-y-2">
                  <AutoSearchInput
                    label="Role & Specialization"
                    required
                    value={formData.role}
                    onChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
                    options={roleSearchOptions}
                    placeholder="Search or select database role (or type new)..."
                    allowCustom={true}
                    createOptionLabel="Add custom role"
                    icon={<Briefcase className="w-4 h-4 text-gray-400" />}
                  />
                  
                  {/* Quick Role Selector Chips from actual database roles */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {availableRoles.slice(0, 6).map((roleOption) => (
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
                        Half-day: ₹{Math.round((parseInt(formData.charges, 10) || 0) * 0.6).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Base City / Location using AutoSearchInput */}
                  <div className="space-y-1.5">
                    <AutoSearchInput
                      label="Base City / Location"
                      required
                      value={formData.location}
                      onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
                      options={citySearchOptions}
                      placeholder="Search or select city..."
                      allowCustom={true}
                      createOptionLabel="Add custom city"
                      icon={<MapPin className="w-4 h-4 text-gray-400" />}
                    />
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

              {/* Form Footer */}
              <div className="p-4 sm:p-5 border-t border-gray-150 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60 flex items-center justify-between gap-3 shrink-0">
                {mode === 'edit' && crew ? (
                  <button
                    type="button"
                    onClick={() => setMode('view')}
                    className="px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 text-[12px] font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 text-[12px] font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white text-[12.5px] font-black shadow-md shadow-red-500/20 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{mode === 'edit' ? 'Save Sidebar Changes' : 'Register Crew Member'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
