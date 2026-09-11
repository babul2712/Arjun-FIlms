'use client';

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  CreditCard, 
  ShieldCheck, 
  Save, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  QrCode, 
  FileText, 
  Image as ImageIcon, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Palette, 
  Eye, 
  Lock, 
  KeyRound, 
  RotateCcw,
  MessageCircle,
  Award,
  CheckCircle2,
  Share2,
  Type
} from 'lucide-react';
import { getBioProfileAdmin, updateBioProfile, getStudioStatsAction } from '@/app/actions';
import CloudinaryUpload from '@/components/ui/CloudinaryUpload';
import { useAuthStore } from '@/store/authStore';
import { useUIStore, SITE_FONTS, SiteFontId, THEME_COLORS, ThemeColorId } from '@/store/uiStore';
import { toast } from 'sonner';

type TabType = 'identity' | 'contact' | 'billing' | 'security' | 'appearance';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Auth & UI Store
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme, siteFont, setSiteFont, themeColor, setThemeColor } = useUIStore();

  // Studio Profile Form State
  const [formData, setFormData] = useState({
    studioName: 'Arjun Films & Photography',
    ownerName: 'Arjun Samal',
    tagline: 'Cinematic Weddings • Luxury Portfolios • Commercials',
    bio: 'Award-winning visual storytellers capturing heartfelt emotion across India & destination locations worldwide.',
    avatar: '/logo.jpeg',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    watermarkUrl: '',
    phone: '+91 77889 92712',
    whatsapp: '917788992712',
    email: 'arjunphotographyyy@gmail.com',
    location: 'Bhubaneswar, Odisha, India',
    website: 'https://arjunfilms.com',
    gstin: '',
    panNumber: '',
    upiId: '7788992712@upi',
    upiQrCode: '',
    bankName: 'State Bank of India',
    bankAccountNumber: '',
    bankIfsc: '',
    bankAccountName: 'Arjun Photography',
    defaultPaymentTerms: '1. 50% advance payment required for date reservation.\n2. 30% payment on the event shoot date.\n3. 20% final balance upon raw previews delivery.',
    slug: 'arjunfilms',
    verified: true,
    fontFamily: siteFont || 'montserrat',
    themeColor: themeColor || 'crimson',
  });

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    username: user?.username || 'admin',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // KPI Statistics
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalQuotations: 0,
    totalCrew: 0,
    totalCollected: 0,
    bioViews: 0,
    bioClicks: 0,
  });

  // Load profile data from MongoDB
  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        getBioProfileAdmin('arjunfilms'),
        getStudioStatsAction(),
      ]);

      if (profileRes) {
        const loadedFont = (profileRes.fontFamily || siteFont || 'montserrat') as SiteFontId;
        const loadedThemeColor = (profileRes.themeColor || themeColor || 'crimson') as ThemeColorId;
        setFormData({
          studioName: profileRes.studioName || 'Arjun Films & Photography',
          ownerName: profileRes.ownerName || 'Arjun Samal',
          tagline: profileRes.tagline || 'Cinematic Weddings • Luxury Portfolios • Commercials',
          bio: profileRes.bio || 'Award-winning visual storytellers capturing heartfelt emotion across India & destination locations worldwide.',
          avatar: profileRes.avatar || '/logo.jpeg',
          coverImage: profileRes.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
          watermarkUrl: profileRes.watermarkUrl || '',
          phone: profileRes.phone || '+91 77889 92712',
          whatsapp: profileRes.whatsapp || '917788992712',
          email: profileRes.email || 'arjunphotographyyy@gmail.com',
          location: profileRes.location || 'Bhubaneswar, Odisha, India',
          website: profileRes.website || 'https://arjunfilms.com',
          gstin: profileRes.gstin || '',
          panNumber: profileRes.panNumber || '',
          upiId: profileRes.upiId || '7788992712@upi',
          upiQrCode: profileRes.upiQrCode || '',
          bankName: profileRes.bankName || 'State Bank of India',
          bankAccountNumber: profileRes.bankAccountNumber || '',
          bankIfsc: profileRes.bankIfsc || '',
          bankAccountName: profileRes.bankAccountName || 'Arjun Photography',
          defaultPaymentTerms: profileRes.defaultPaymentTerms || '1. 50% advance payment required for date reservation.\n2. 30% payment on the event shoot date.\n3. 20% final balance upon raw previews delivery.',
          slug: profileRes.slug || 'arjunfilms',
          verified: profileRes.verified !== false,
          fontFamily: loadedFont,
          themeColor: loadedThemeColor,
        });

        if (profileRes.fontFamily) {
          setSiteFont(loadedFont);
        }
        if (profileRes.themeColor) {
          setThemeColor(loadedThemeColor);
        }
      }

      if (statsRes?.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to load profile', err);
      toast.error('Failed to load studio profile data');
    } finally {
      setLoading(false);
      setIsDirty(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await updateBioProfile(formData, 'arjunfilms');
      if (res.success) {
        if (formData.fontFamily) {
          setSiteFont(formData.fontFamily as SiteFontId);
        }
        if (formData.themeColor) {
          setThemeColor(formData.themeColor as ThemeColorId);
        }
        toast.success('Studio Profile & Settings updated successfully!');
        setIsDirty(false);
      } else {
        toast.error(res.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error while saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyPublicLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/links`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Public Bio Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const tabs: { id: TabType; label: string; icon: any; badge?: string }[] = [
    { id: 'identity', label: 'Studio Identity', icon: Building2 },
    { id: 'contact', label: 'Contact & Location', icon: MapPin },
    { id: 'billing', label: 'Billing & Invoicing', icon: CreditCard },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck },
    { id: 'appearance', label: 'Theme & Defaults', icon: Palette },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-28 animate-fade-in text-gray-800 dark:text-gray-100">
      {/* Hero Studio Banner & Profile Header */}
      <div className="relative rounded-[40px] overflow-hidden bg-white dark:bg-[#15181e] border border-[#fee2e2]/70 dark:border-gray-800 shadow-xl shadow-red-500/5 transition-all">
        {/* Cover Image */}
        <div className="relative h-60 md:h-72 w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 overflow-hidden group">
          <img
            src={formData.coverImage}
            alt="Studio Cover"
            className="w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Quick Cover Edit Trigger */}
          <div className="absolute top-5 right-5 z-20">
            <button 
              type="button"
              onClick={() => setActiveTab('identity')}
              className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-2xl text-[12px] font-bold border border-white/20 shadow-lg cursor-pointer transition-all active:scale-95"
            >
              <Camera className="w-4 h-4 text-[#e50914]" />
              Change Cover
            </button>
          </div>

          {/* Studio Watermark Preview in Corner */}
          {formData.watermarkUrl && (
            <div className="absolute top-5 left-5 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/15">
              <img src={formData.watermarkUrl} alt="Watermark" className="h-6 w-auto object-contain opacity-80" />
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">Watermark Active</span>
            </div>
          )}
        </div>

        {/* Profile Details Container */}
        <div className="px-6 md:px-10 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-16 md:-mt-20 z-10 relative">
            {/* Avatar & Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Studio Avatar */}
              <div className="relative group">
                <div className="w-28 h-28 md:w-34 md:h-34 rounded-3xl overflow-hidden border-4 border-white dark:border-[#15181e] bg-white dark:bg-gray-800 shadow-2xl shrink-0 p-1">
                  <img
                    src={formData.avatar}
                    alt={formData.studioName}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('identity')}
                  className="absolute bottom-1 right-1 p-2 bg-[#0a0b0d] hover:bg-[#e50914] text-white rounded-xl shadow-lg cursor-pointer transition-all active:scale-95"
                  title="Update Logo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-1.5 pt-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {formData.studioName}
                  </h1>
                  {formData.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-[#e50914] border border-red-500/20 text-[11px] font-extrabold uppercase tracking-wide">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified HQ
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px] font-bold">
                    Owner: {formData.ownerName}
                  </span>
                </div>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium max-w-2xl line-clamp-2">
                  {formData.tagline}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto pt-2 md:pt-0">
              <button
                type="button"
                onClick={handleCopyPublicLink}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[12px] font-bold transition-all cursor-pointer"
                title="Copy Public Bio Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                <span>{copied ? 'Copied URL!' : 'Share Bio'}</span>
              </button>

              <a
                href="/links"
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a0b0d] hover:bg-black text-white text-[12px] font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Live Bio Page</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-8 pt-6 border-t border-gray-150 dark:border-gray-800/80 text-[13px]">
            <div className="bg-[#fef2f2]/60 dark:bg-red-950/20 border border-[#fee2e2] dark:border-red-950/40 rounded-2xl p-3.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#e50914]" />
                Total Cases
              </span>
              <div className="text-[20px] font-black text-gray-900 dark:text-white mt-1">
                {stats.totalProjects}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                Crew Blueprints
              </span>
              <div className="text-[20px] font-black text-gray-900 dark:text-white mt-1">
                {stats.totalCrew}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-500" />
                Quotations
              </span>
              <div className="text-[20px] font-black text-gray-900 dark:text-white mt-1">
                {stats.totalQuotations}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Revenue Collections
              </span>
              <div className="text-[20px] font-black text-gray-900 dark:text-white mt-1 truncate">
                ₹{stats.totalCollected.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                Bio Page Views
              </span>
              <div className="text-[20px] font-black text-gray-900 dark:text-white mt-1">
                {stats.bioViews}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar border-b border-gray-200 dark:border-gray-800 text-[13px] font-bold">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#e50914] text-white shadow-md shadow-red-500/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#e50914] hover:bg-[#fef2f2] dark:hover:bg-red-950/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Card */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: STUDIO IDENTITY & BRANDING */}
        {activeTab === 'identity' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card bg-white dark:bg-[#15181e] border border-gray-200/70 dark:border-gray-800 rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-gray-150 dark:border-gray-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#e50914]" />
                    Studio Visual Branding
                  </h3>
                  <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                    Upload official logos, cover photography, and configure public studio identifiers.
                  </p>
                </div>
              </div>

              {/* Uploads Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Logo / Avatar */}
                <div className="bg-[#fdf6f6]/60 dark:bg-gray-900/40 border border-[#fee2e2] dark:border-gray-800 rounded-3xl p-5 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Studio Logo / Icon
                  </span>
                  <CloudinaryUpload
                    value={formData.avatar}
                    onChange={(url) => handleChange('avatar', url)}
                    variant="avatar"
                    folder="branding"
                    label="Studio Logo"
                  />
                  <p className="text-[11px] text-gray-400 font-semibold mt-4">
                    Square 1:1 image recommended (PNG or JPG).
                  </p>
                </div>

                {/* Banner / Cover */}
                <div className="bg-[#fdf6f6]/60 dark:bg-gray-900/40 border border-[#fee2e2] dark:border-gray-800 rounded-3xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Hero Banner Photo
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-3">
                      Displayed on public bio link `/links` and client portals.
                    </p>
                  </div>
                  <CloudinaryUpload
                    value={formData.coverImage}
                    onChange={(url) => handleChange('coverImage', url)}
                    variant="compact"
                    folder="branding"
                    label="Header Banner"
                  />
                </div>

                {/* Watermark */}
                <div className="bg-[#fdf6f6]/60 dark:bg-gray-900/40 border border-[#fee2e2] dark:border-gray-800 rounded-3xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Quotation Watermark / Stamp
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-3">
                      Transparent PNG logo stamped across generated PDF invoices.
                    </p>
                  </div>
                  <CloudinaryUpload
                    value={formData.watermarkUrl}
                    onChange={(url) => handleChange('watermarkUrl', url)}
                    variant="compact"
                    folder="quotations"
                    label="Watermark PNG"
                  />
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Official Studio Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studioName}
                    onChange={(e) => handleChange('studioName', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
                    placeholder="e.g. Arjun Films & Photography"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Studio Owner / Founder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
                    placeholder="e.g. Arjun Samal"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Studio Tagline & Specialties
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
                    placeholder="e.g. Cinematic Weddings • Luxury Portfolios • Commercials"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Studio Biography & Story
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-[13px] font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
                    placeholder="Introduce your visual storytelling philosophy, gear, awards, and experience..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACT & OFFICIAL LOCATION */}
        {activeTab === 'contact' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card bg-white dark:bg-[#15181e] border border-gray-200/70 dark:border-gray-800 rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-gray-150 dark:border-gray-800 pb-4">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#e50914]" />
                  Direct Contact & Studio HQ Location
                </h3>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                  These details populate PDF quotation headers, customer payment receipts, and public inquiry triggers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    Primary Studio Hotline
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                    placeholder="+91 77889 92712"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    WhatsApp Business Number (without + or dashes)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                    placeholder="917788992712"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    Official Client Inquiries Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                    placeholder="arjunphotographyyy@gmail.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                    placeholder="https://arjunfilms.com"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    Studio Physical Address & Base City
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                    placeholder="Bhubaneswar, Odisha, India"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BILLING, INVOICING & BANKING */}
        {activeTab === 'billing' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card bg-white dark:bg-[#15181e] border border-gray-200/70 dark:border-gray-800 rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-gray-150 dark:border-gray-800 pb-4">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#e50914]" />
                  Invoicing, Banking & UPI Checkout Setup
                </h3>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                  Configure default payment collection channels, bank account details, and quotation payment clauses.
                </p>
              </div>

              {/* UPI QR & ID Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#fdf6f6]/60 dark:bg-gray-900/40 border border-[#fee2e2] dark:border-gray-800 rounded-3xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-[#e50914]" />
                      Payment QR Code Image
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-3">
                      Shown to clients on `/payment` page for instant UPI scanning.
                    </p>
                  </div>
                  <CloudinaryUpload
                    value={formData.upiQrCode}
                    onChange={(url) => handleChange('upiQrCode', url)}
                    variant="compact"
                    folder="payments"
                    label="Payment QR Code"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Primary UPI VPA ID
                    </label>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => handleChange('upiId', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                      placeholder="e.g. 7788992712@upi or arjunphotography@okaxis"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        GSTIN Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.gstin}
                        onChange={(e) => handleChange('gstin', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                        placeholder="21AAAAA0000A1Z5"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        PAN Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.panNumber}
                        onChange={(e) => handleChange('panNumber', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Account Details */}
              <div className="border-t border-gray-150 dark:border-gray-800 pt-6 space-y-4">
                <h4 className="text-[14px] font-extrabold text-gray-800 dark:text-white">
                  Studio Bank Account for NEFT / RTGS / IMPS
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Beneficiary Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccountName}
                      onChange={(e) => handleChange('bankAccountName', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                      placeholder="Arjun Photography"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => handleChange('bankName', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                      placeholder="State Bank of India"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber}
                      onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                      placeholder="9876543210123"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={formData.bankIfsc}
                      onChange={(e) => handleChange('bankIfsc', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                      placeholder="SBIN0001234"
                    />
                  </div>
                </div>
              </div>

              {/* Quotation Default Terms */}
              <div className="border-t border-gray-150 dark:border-gray-800 pt-6 space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Default Invoicing & Quotation Payment Terms
                </label>
                <textarea
                  rows={3}
                  value={formData.defaultPaymentTerms}
                  onChange={(e) => handleChange('defaultPaymentTerms', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-[13px] font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                  placeholder="Enter payment stages, advance % requirement, and delivery policies..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & ACCESS CREDENTIALS */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card bg-white dark:bg-[#15181e] border border-gray-200/70 dark:border-gray-800 rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-gray-150 dark:border-gray-800 pb-4">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#e50914]" />
                  Administrator Security & Login Access
                </h3>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                  Two-factor authentication with Resend Email OTP verification is active on this system.
                </p>
              </div>

              {/* Security Status Box */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-3xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-extrabold text-emerald-950 dark:text-emerald-200">
                      Two-Factor Email OTP Authentication Active
                    </h4>
                    <p className="text-[12px] text-emerald-700 dark:text-emerald-400 font-medium">
                      One-time login codes are automatically sent to <span className="font-bold">{formData.email}</span>.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500 text-white text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                  Protected
                </span>
              </div>

              {/* Admin Username & Notification Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    Admin Login Identifier
                  </label>
                  <input
                    type="text"
                    disabled
                    value={securityForm.username}
                    className="w-full bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-[13px] font-bold text-gray-600 dark:text-gray-300 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-gray-400 block">Configured via environment security profile.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    OTP Delivery Inbox
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                  />
                  <span className="text-[10px] text-gray-400 block">OTPs and booking alerts are dispatched here.</span>
                </div>
              </div>

              {/* Security Audit Information */}
              <div className="border-t border-gray-150 dark:border-gray-800 pt-6 space-y-3 text-[12px]">
                <h4 className="font-extrabold text-gray-800 dark:text-white text-[13px]">
                  Recent Security Activity
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-150 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <span className="font-bold text-gray-800 dark:text-gray-200 block">Current Active Session (Admin)</span>
                        <span className="text-gray-400 text-[11px]">Next.js Turbopack Session • Mac OS</span>
                      </div>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">Active Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: APPEARANCE, THEME & SYSTEM DEFAULTS */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card bg-white dark:bg-[#15181e] border border-gray-200/70 dark:border-gray-800 rounded-[32px] p-6 md:p-8 space-y-8 shadow-sm">
              <div className="border-b border-gray-150 dark:border-gray-800 pb-4">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#e50914]" />
                  Theme, Typography & System Defaults
                </h3>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                  Customize the CRM color mode, full-site font family, and quotation generator templates.
                </p>
              </div>

              {/* Section 1: Website Global Typography & Font Family (6 Options) */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-gray-900 dark:text-white text-[15px] flex items-center gap-2">
                      <Type className="w-4 h-4 text-[#e50914]" />
                      Full Website Font Family (6 Presets)
                    </h4>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      Select any font below to instantly update typography across the full website, dashboard, and public pages.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto px-3 py-1 bg-red-500/10 border border-red-500/20 text-[#e50914] text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                    Instant Live Switch
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {SITE_FONTS.map((font) => {
                    const isSelected = (siteFont || 'montserrat') === font.id;
                    return (
                      <div
                        key={font.id}
                        onClick={() => {
                          setSiteFont(font.id as SiteFontId);
                          handleChange('fontFamily', font.id);
                          toast.success(`Website font switched to ${font.name}!`);
                        }}
                        className={`relative p-5 rounded-3xl border transition-all duration-200 cursor-pointer text-left flex flex-col justify-between group ${
                          isSelected
                            ? 'border-[#e50914] bg-[#fef2f2]/80 dark:bg-red-950/20 shadow-lg shadow-red-500/10 ring-2 ring-red-500/30'
                            : 'border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900/30 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span
                              className="text-[17px] font-black tracking-tight text-gray-900 dark:text-white"
                              style={{ fontFamily: font.family }}
                            >
                              {font.name}
                            </span>
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-700 group-hover:border-gray-400" />
                            )}
                          </div>

                          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300">
                            {font.badge}
                          </span>

                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            {font.description}
                          </p>
                        </div>

                        {/* Live Font Sample Preview Card */}
                        <div
                          className="mt-4 pt-3 border-t border-gray-150 dark:border-gray-800/80 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 p-3"
                          style={{ fontFamily: font.family }}
                        >
                          <div className="text-[14px] font-bold text-gray-900 dark:text-white truncate">
                            {font.sampleText}
                          </div>
                          <div className="text-[11px] text-gray-400 font-medium tracking-wider mt-0.5">
                            Aa Bb Gg 123 • Cinema & Case HQ
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: CRM Accent Theme Color (7 Presets) */}
              <div className="border-t border-gray-150 dark:border-gray-800 pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-gray-900 dark:text-white text-[15px] flex items-center gap-2">
                      <Palette className="w-4 h-4 text-[#e50914]" />
                      CRM Accent Color Theme (7 Presets)
                    </h4>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      Vibrant studio highlights that dynamically adapt in both Light Mode and Cinematic Dark Mode.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto px-3 py-1 bg-red-500/10 border border-red-500/20 text-[#e50914] text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                    Live Dynamic Color
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-1">
                  {THEME_COLORS.map((col) => {
                    const isSelected = (themeColor || 'crimson') === col.id;
                    return (
                      <div
                        key={col.id}
                        onClick={() => {
                          setThemeColor(col.id);
                          handleChange('themeColor', col.id);
                          toast.success(`Theme accent switched to ${col.name}!`);
                        }}
                        className={`relative p-5 rounded-3xl border transition-all duration-200 cursor-pointer text-left flex flex-col justify-between group ${
                          isSelected
                            ? 'border-gray-900 dark:border-white bg-gray-50/90 dark:bg-gray-800/80 shadow-lg ring-2 ring-gray-900/20 dark:ring-white/20'
                            : 'border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900/30 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Color Swatch Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-2xl shadow-md border-2 border-white dark:border-gray-700 shrink-0"
                                style={{ background: col.previewGradient }}
                              />
                              <span className="text-[14px] font-black tracking-tight text-gray-900 dark:text-white">
                                {col.name}
                              </span>
                            </div>
                            {isSelected ? (
                              <div
                                className="w-5 h-5 rounded-full text-white flex items-center justify-center shadow-xs"
                                style={{ backgroundColor: col.primary }}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-700 group-hover:border-gray-400" />
                            )}
                          </div>

                          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300">
                            {col.badge}
                          </span>

                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            {col.description}
                          </p>
                        </div>

                        {/* Color Preview Bar */}
                        <div className="mt-4 pt-3 border-t border-gray-150 dark:border-gray-800/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: col.primary }} />
                            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: col.hover }} />
                            <div className="w-3.5 h-3.5 rounded-full border border-gray-200 dark:border-gray-700" style={{ backgroundColor: col.surfaceVariantLight }} />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                            {col.primary}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Theme Mode Selector */}
              <div className="border-t border-gray-150 dark:border-gray-800 pt-6 space-y-3">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  CRM Theme Mode
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => { if (theme === 'dark') toggleTheme(); }}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-[#e50914] bg-[#fef2f2] text-[#e50914] shadow-md ring-2 ring-red-400/20'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                    </div>
                    <span className="text-[12px] font-bold">Neat Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { if (theme === 'light') toggleTheme(); }}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-[#e50914] bg-red-950/30 text-[#e50914] shadow-md ring-2 ring-red-400/20'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center shadow-xs">
                      <div className="w-3 h-3 rounded-full bg-indigo-400" />
                    </div>
                    <span className="text-[12px] font-bold">Cinematic Dark</span>
                  </button>
                </div>
              </div>

              {/* Section 4: Quotation Template Info */}
              <div className="border-t border-gray-150 dark:border-gray-800 pt-6 space-y-4">
                <div>
                  <h4 className="font-extrabold text-gray-800 dark:text-white text-[14px]">
                    Quotation Engine Presets
                  </h4>
                  <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                    Template 1 (Neat Minimal Studio) is active with red invoice headers and phone/email stacking.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-150 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e50914]/10 text-[#e50914] flex items-center justify-center font-black text-[13px]">
                      T1
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 dark:text-gray-200 block text-[13px]">Template 1: Neat Minimal Studio</span>
                      <span className="text-[11px] text-gray-400">Default invoice layout for wedding packages & commercial billing</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-bold rounded-lg">
                    Default Engine
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Bottom Sticky Save Bar */}
        <div className="sticky bottom-6 z-30 bg-white/90 dark:bg-[#15181e]/90 backdrop-blur-xl border border-[#fee2e2] dark:border-gray-800 p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isDirty ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="text-[12px] font-bold text-gray-600 dark:text-gray-300">
              {isDirty ? 'Unsaved profile changes detected' : 'All studio profile settings synchronized'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadProfile}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#0a0b0d] hover:bg-black dark:bg-[#e50914] dark:hover:bg-red-700 text-white text-[13px] font-bold shadow-lg shadow-black/10 transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#e50914] dark:text-white" />
                  <span>Save Studio Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
