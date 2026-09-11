'use client';

import React, { useState, useEffect } from 'react';
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
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface CrewDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  crew: any | null;
  onEdit: (crew: any) => void;
  onDelete: (id: string) => void;
}

export default function CrewDetailDrawer({
  isOpen,
  onClose,
  crew,
  onEdit,
  onDelete,
}: CrewDetailDrawerProps) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || !isOpen || !crew) return null;

  const avatarUrl = crew.avatarUrl || (
    crew.name.includes('Davidson') ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80' :
    crew.name.includes('Veronica') ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&h=300&q=80' :
    crew.name.includes('Harris') ? 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&h=300&q=80' :
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80'
  );

  const cleanPhone = (crew.phone || '').replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(crew.phone || '');
    setCopiedPhone(true);
    toast.success('Phone number copied to clipboard');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const charges = crew.charges || 0;
  const halfDayRate = Math.round(charges * 0.6);
  const twoDayRate = charges * 2;
  const overtimeRate = Math.round(charges * 0.15);

  // Skill tags based on role
  const isVideo = (crew.role || '').toLowerCase().includes('video') || (crew.role || '').toLowerCase().includes('cinema') || (crew.role || '').toLowerCase().includes('drone');
  const isPhoto = (crew.role || '').toLowerCase().includes('photo') || (crew.role || '').toLowerCase().includes('candid') || (crew.role || '').toLowerCase().includes('lead');
  const isEditor = (crew.role || '').toLowerCase().includes('edit');

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over Right Sidebar Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-[#15181e] border-l border-[#fee2e2] dark:border-gray-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in-right text-gray-800 dark:text-gray-100">
          
          {/* Top Header & Close Bar */}
          <div className="p-5 sm:p-6 border-b border-gray-150 dark:border-gray-800/80 flex items-center justify-between bg-[#fdf6f6]/60 dark:bg-gray-900/40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-[14px] font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                Crew Blueprint Profile
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Main Content */}
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
                    ₹{charges.toLocaleString('en-IN')}
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

            {/* Specialization & Gear Checklist */}
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
                    <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px]">
                      🎥 Sony FX3 / A7SIII 4K
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px]">
                      🕹️ DJI RS3 Pro Gimbal
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px]">
                      🚁 4K Drone Certified
                    </span>
                  </>
                )}
                {isPhoto && (
                  <>
                    <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px]">
                      📸 Sony A7IV + GM Lenses
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px]">
                      ⚡ Profoto / Godox Lighting
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px]">
                      💍 Candid Wedding Specialist
                    </span>
                  </>
                )}
                {isEditor && (
                  <>
                    <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px]">
                      ✂️ DaVinci Resolve Studio
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px]">
                      🎨 Film Emulation & Grading
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
          <div className="p-5 border-t border-gray-150 dark:border-gray-800 bg-[#fdf6f6]/60 dark:bg-gray-900/60 flex items-center justify-between gap-3">
            <button
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
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-[12px] font-bold transition-all cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  onEdit(crew);
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0b0d] hover:bg-black dark:bg-[#e50914] dark:hover:bg-red-700 text-white rounded-xl text-[12px] font-bold shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Edit2 className="w-4 h-4 text-[#e50914] dark:text-white" />
                Edit Record
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
