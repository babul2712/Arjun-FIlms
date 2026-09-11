'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Sparkles,
  QrCode,
  Save,
  RotateCcw,
  Globe,
  Sliders,
  TrendingUp,
  Layers,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  Flame,
  Zap,
} from 'lucide-react';
import DynamicBioIcon from '@/components/ui/DynamicBioIcon';
import PublicBioLinksView from '@/components/public/PublicBioLinksView';
import QrCodeModal from '@/components/ui/QrCodeModal';
import {
  getBioProfileAdmin,
  updateBioProfile,
  saveSocialLinks,
  saveCustomLinks,
  resetBioProfileToDefault,
} from '@/app/actions';
import { SOCIAL_PLATFORMS, AVAILABLE_ICONS, DEFAULT_BIO_DATA } from '@/lib/bioConstants';
import { toast } from 'sonner';

export default function SocialLinksManagerPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'socials' | 'custom' | 'profile' | 'analytics'>('socials');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Social Link Modal State
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [editingSocialLink, setEditingSocialLink] = useState<any>(null);
  const [socialForm, setSocialForm] = useState({
    platform: 'instagram',
    label: 'Instagram',
    url: '',
    username: '',
    color: '#E4405F',
    icon: 'instagram',
    isActive: true,
  });

  // Custom Link Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingCustomLink, setEditingCustomLink] = useState<any>(null);
  const [customForm, setCustomForm] = useState({
    title: '',
    subtitle: '',
    url: '',
    icon: 'sparkles',
    thumbnail: '',
    badge: '',
    isHighlighted: false,
    isActive: true,
  });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    studioName: '',
    tagline: '',
    bio: '',
    avatar: '',
    coverImage: '',
    verified: true,
    phone: '',
    whatsapp: '',
    email: '',
    location: '',
    website: '',
  });

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/links`
    : `https://arjunfilms.com/links`;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getBioProfileAdmin('arjunfilms');
      if (data) {
        setProfile(data);
        setProfileForm({
          studioName: data.studioName || '',
          tagline: data.tagline || '',
          bio: data.bio || '',
          avatar: data.avatar || '/logo.jpeg',
          coverImage: data.coverImage || '',
          verified: data.verified !== false,
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          location: data.location || '',
          website: data.website || '',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bio profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedUrl(true);
      toast.success('Public bio link copied!');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleSaveProfileInfo = async () => {
    setSaving(true);
    try {
      const res = await updateBioProfile(profileForm, 'arjunfilms');
      if (res.success) {
        setProfile((prev: any) => ({ ...prev, ...profileForm }));
        toast.success('Studio Profile details saved successfully!');
      } else {
        toast.error(res.error || 'Failed to update profile');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  // --- SOCIAL LINKS ACTIONS ---
  const handleOpenAddSocial = () => {
    setEditingSocialLink(null);
    const defaultPlatform = SOCIAL_PLATFORMS[0];
    setSocialForm({
      platform: defaultPlatform.platform,
      label: defaultPlatform.label,
      url: '',
      username: '',
      color: defaultPlatform.color,
      icon: defaultPlatform.iconName,
      isActive: true,
    });
    setIsSocialModalOpen(true);
  };

  const handleOpenEditSocial = (link: any) => {
    setEditingSocialLink(link);
    setSocialForm({
      platform: link.platform || 'custom',
      label: link.label || '',
      url: link.url || '',
      username: link.username || '',
      color: link.color || '#e50914',
      icon: link.icon || link.platform || 'link',
      isActive: link.isActive !== false,
    });
    setIsSocialModalOpen(true);
  };

  const handlePlatformChange = (platformKey: string) => {
    const preset = SOCIAL_PLATFORMS.find((p) => p.platform === platformKey);
    if (preset) {
      setSocialForm((prev) => ({
        ...prev,
        platform: preset.platform,
        label: preset.label,
        icon: preset.iconName,
        color: preset.color,
      }));
    }
  };

  const handleSaveSocialLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialForm.url.trim()) {
      toast.error('Please enter a valid link URL');
      return;
    }

    let updatedLinks = [...(profile?.socialLinks || [])];

    if (editingSocialLink) {
      updatedLinks = updatedLinks.map((l) =>
        l.id === editingSocialLink.id ? { ...l, ...socialForm } : l
      );
    } else {
      const newLink = {
        id: 'soc_' + Date.now().toString(36),
        ...socialForm,
        order: updatedLinks.length + 1,
        clickCount: 0,
      };
      updatedLinks.push(newLink);
    }

    setSaving(true);
    try {
      const res = await saveSocialLinks(updatedLinks, 'arjunfilms');
      if (res.success) {
        setProfile((prev: any) => ({ ...prev, socialLinks: updatedLinks }));
        setIsSocialModalOpen(false);
        toast.success(editingSocialLink ? 'Social link updated!' : 'New social link added!');
      } else {
        toast.error('Failed to save social links');
      }
    } catch {
      toast.error('Error saving link');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSocialLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social link?')) return;
    const updatedLinks = (profile?.socialLinks || []).filter((l: any) => l.id !== id);

    setSaving(true);
    try {
      const res = await saveSocialLinks(updatedLinks, 'arjunfilms');
      if (res.success) {
        setProfile((prev: any) => ({ ...prev, socialLinks: updatedLinks }));
        toast.success('Social link deleted');
      }
    } catch {
      toast.error('Failed to delete social link');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSocialActive = async (id: string) => {
    const updatedLinks = (profile?.socialLinks || []).map((l: any) =>
      l.id === id ? { ...l, isActive: !l.isActive } : l
    );

    setProfile((prev: any) => ({ ...prev, socialLinks: updatedLinks }));
    await saveSocialLinks(updatedLinks, 'arjunfilms');
    toast.success('Link visibility updated');
  };

  const handleMoveSocial = async (index: number, direction: 'up' | 'down') => {
    const links = [...(profile?.socialLinks || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const temp = links[index];
    links[index] = links[targetIndex];
    links[targetIndex] = temp;

    // update order numbers
    const reordered = links.map((l, i) => ({ ...l, order: i + 1 }));
    setProfile((prev: any) => ({ ...prev, socialLinks: reordered }));
    await saveSocialLinks(reordered, 'arjunfilms');
  };

  // --- CUSTOM LINKS ACTIONS ---
  const handleOpenAddCustom = () => {
    setEditingCustomLink(null);
    setCustomForm({
      title: '',
      subtitle: '',
      url: '',
      icon: 'sparkles',
      thumbnail: '',
      badge: '',
      isHighlighted: false,
      isActive: true,
    });
    setIsCustomModalOpen(true);
  };

  const handleOpenEditCustom = (card: any) => {
    setEditingCustomLink(card);
    setCustomForm({
      title: card.title || '',
      subtitle: card.subtitle || '',
      url: card.url || '',
      icon: card.icon || 'sparkles',
      thumbnail: card.thumbnail || '',
      badge: card.badge || '',
      isHighlighted: !!card.isHighlighted,
      isActive: card.isActive !== false,
    });
    setIsCustomModalOpen(true);
  };

  const handleSaveCustomLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.title.trim() || !customForm.url.trim()) {
      toast.error('Please enter a title and target URL');
      return;
    }

    let updatedCards = [...(profile?.customLinks || [])];

    if (editingCustomLink) {
      updatedCards = updatedCards.map((c) =>
        c.id === editingCustomLink.id ? { ...c, ...customForm } : c
      );
    } else {
      const newCard = {
        id: 'cus_' + Date.now().toString(36),
        ...customForm,
        order: updatedCards.length + 1,
        clickCount: 0,
      };
      updatedCards.push(newCard);
    }

    setSaving(true);
    try {
      const res = await saveCustomLinks(updatedCards, 'arjunfilms');
      if (res.success) {
        setProfile((prev: any) => ({ ...prev, customLinks: updatedCards }));
        setIsCustomModalOpen(false);
        toast.success(editingCustomLink ? 'Custom link updated!' : 'New custom link added!');
      } else {
        toast.error('Failed to save custom links');
      }
    } catch {
      toast.error('Error saving custom link');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom showcase link?')) return;
    const updatedCards = (profile?.customLinks || []).filter((c: any) => c.id !== id);

    setSaving(true);
    try {
      const res = await saveCustomLinks(updatedCards, 'arjunfilms');
      if (res.success) {
        setProfile((prev: any) => ({ ...prev, customLinks: updatedCards }));
        toast.success('Custom showcase link deleted');
      }
    } catch {
      toast.error('Failed to delete link');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCustomActive = async (id: string) => {
    const updatedCards = (profile?.customLinks || []).map((c: any) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );

    setProfile((prev: any) => ({ ...prev, customLinks: updatedCards }));
    await saveCustomLinks(updatedCards, 'arjunfilms');
    toast.success('Visibility toggled');
  };

  const handleMoveCustom = async (index: number, direction: 'up' | 'down') => {
    const cards = [...(profile?.customLinks || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const temp = cards[index];
    cards[index] = cards[targetIndex];
    cards[targetIndex] = temp;

    const reordered = cards.map((c, i) => ({ ...c, order: i + 1 }));
    setProfile((prev: any) => ({ ...prev, customLinks: reordered }));
    await saveCustomLinks(reordered, 'arjunfilms');
  };

  const handleResetDefaults = async () => {
    if (!confirm('Are you sure you want to reset all social and custom links to default demo presets?')) {
      return;
    }
    setSaving(true);
    try {
      const res = await resetBioProfileToDefault('arjunfilms');
      if (res.success) {
        setProfile(res.profile);
        setProfileForm({
          studioName: res.profile.studioName,
          tagline: res.profile.tagline,
          bio: res.profile.bio,
          avatar: res.profile.avatar,
          coverImage: res.profile.coverImage,
          verified: res.profile.verified,
          phone: res.profile.phone,
          whatsapp: res.profile.whatsapp,
          email: res.profile.email,
          location: res.profile.location,
          website: res.profile.website,
        });
        toast.success('Restored default social media & custom links!');
      }
    } catch {
      toast.error('Failed to reset');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
          Loading Bio Links Manager...
        </p>
      </div>
    );
  }

  const liveProfilePreview = {
    ...profile,
    ...profileForm,
    socialLinks: profile?.socialLinks || [],
    customLinks: profile?.customLinks || [],
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white dark:bg-[#14161a] border border-[#fee2e2] dark:border-gray-800/80 rounded-3xl shadow-xl shadow-red-500/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#e50914] to-red-950 p-1 flex items-center justify-center text-white shadow-lg shadow-red-500/20 shrink-0">
            <Share2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Bio & Social Links Manager
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Public Live
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Public Link: <span className="font-mono text-[#e50914]">{publicUrl}</span> (Always open for everyone)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedUrl ? 'Copied!' : 'Copy Public URL'}</span>
          </button>

          <button
            onClick={() => setIsQrOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </button>

          <a
            href="/links"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e50914] to-[#b80710] hover:from-[#f40d1a] hover:to-[#c70812] text-white text-xs font-bold shadow-lg shadow-red-600/25 transition-all active:scale-95 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Public Page</span>
          </a>
        </div>
      </div>

      {/* Main Split Grid: Left Editor (2 Cols), Right Mobile Preview (1 Col on Desktop) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor Tabs & Content (7 Cols on XL) */}
        <div className="xl:col-span-7 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#14161a] border border-[#fee2e2] dark:border-gray-800/80 rounded-2xl overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab('socials')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'socials'
                  ? 'bg-[#e50914] text-white shadow-md shadow-red-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Social Links ({profile?.socialLinks?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('custom')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-[#e50914] text-white shadow-md shadow-red-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Showcase Cards ({profile?.customLinks?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#e50914] text-white shadow-md shadow-red-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Studio Profile & Contacts</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#e50914] text-white shadow-md shadow-red-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analytics & Metrics</span>
            </button>
          </div>

          {/* TAB 1: SOCIAL LINKS MANAGER */}
          {activeTab === 'socials' && (
            <div className="bg-white dark:bg-[#14161a] border border-[#fee2e2] dark:border-gray-800/80 rounded-3xl p-6 shadow-xl shadow-red-500/5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Social Media Channels
                  </h2>
                  <p className="text-xs text-gray-400">
                    Add Instagram, YouTube, Facebook, WhatsApp, X, and other channels.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddSocial}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e50914] hover:bg-[#c70812] text-white text-xs font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Social Link</span>
                </button>
              </div>

              {/* List of social links */}
              <div className="space-y-3">
                {(profile?.socialLinks || []).length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <Share2 className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-xs font-bold text-gray-500">No social media links added yet.</p>
                    <button
                      onClick={handleOpenAddSocial}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-[#e50914] text-white text-xs font-bold cursor-pointer"
                    >
                      Add First Link
                    </button>
                  </div>
                ) : (
                  profile.socialLinks.map((link: any, index: number) => (
                    <div
                      key={link.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        link.isActive !== false
                          ? 'bg-gray-50/60 dark:bg-[#1a1d24]/60 border-gray-200/80 dark:border-gray-800'
                          : 'bg-gray-100/40 dark:bg-gray-900/40 border-dashed border-gray-300 dark:border-gray-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {/* Icon Badge */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                          style={{
                            backgroundColor: link.color ? `${link.color}20` : '#fee2e2',
                            color: link.color || '#e50914',
                          }}
                        >
                          <DynamicBioIcon name={link.icon || link.platform} className="w-5 h-5" />
                        </div>

                        {/* Title & URL */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900 dark:text-white capitalize truncate">
                              {link.label || link.platform}
                            </span>
                            {link.username && (
                              <span className="text-[10px] text-gray-400 font-mono">
                                ({link.username})
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-xs font-mono">
                            {link.url}
                          </p>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="hidden sm:inline text-[10px] font-bold text-gray-400 px-2 py-1 bg-black/5 dark:bg-white/5 rounded-lg">
                          {link.clickCount || 0} clicks
                        </span>

                        {/* Move Up/Down */}
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveSocial(index, 'up')}
                          className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={index === profile.socialLinks.length - 1}
                          onClick={() => handleMoveSocial(index, 'down')}
                          className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        {/* Visibility Toggle */}
                        <button
                          onClick={() => handleToggleSocialActive(link.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            link.isActive !== false
                              ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                              : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                          }`}
                          title={link.isActive !== false ? 'Hide Link' : 'Show Link'}
                        >
                          {link.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditSocial(link)}
                          className="p-1.5 text-gray-400 hover:text-[#e50914] rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Edit Link"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteSocialLink(link.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Delete Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM SHOWCASE CARDS */}
          {activeTab === 'custom' && (
            <div className="bg-white dark:bg-[#14161a] border border-[#fee2e2] dark:border-gray-800/80 rounded-3xl p-6 shadow-xl shadow-red-500/5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Showcase & Action Cards
                  </h2>
                  <p className="text-xs text-gray-400">
                    Create prominent buttons for wedding portfolios, quotation calculators, payments, & reviews.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddCustom}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e50914] hover:bg-[#c70812] text-white text-xs font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Showcase Card</span>
                </button>
              </div>

              {/* List of custom cards */}
              <div className="space-y-3">
                {(profile?.customLinks || []).length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <Sparkles className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-xs font-bold text-gray-500">No showcase cards added yet.</p>
                    <button
                      onClick={handleOpenAddCustom}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-[#e50914] text-white text-xs font-bold cursor-pointer"
                    >
                      Add First Showcase Card
                    </button>
                  </div>
                ) : (
                  profile.customLinks.map((card: any, index: number) => (
                    <div
                      key={card.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        card.isHighlighted
                          ? 'border-red-500/40 bg-red-50/20 dark:bg-red-950/10'
                          : 'border-gray-200/80 dark:border-gray-800 bg-gray-50/60 dark:bg-[#1a1d24]/60'
                      } ${card.isActive === false ? 'opacity-60 border-dashed' : ''}`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        {/* Thumbnail or Icon */}
                        {card.thumbnail ? (
                          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                            <img src={card.thumbnail} alt={card.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-red-500/10 text-[#e50914] flex items-center justify-center shrink-0">
                            <DynamicBioIcon name={card.icon || 'sparkles'} className="w-5 h-5" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {card.title}
                            </h3>
                            {card.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#e50914] text-white">
                                {card.badge}
                              </span>
                            )}
                            {card.isHighlighted && (
                              <span className="text-[9px] font-extrabold text-amber-500 flex items-center gap-0.5">
                                <Flame className="w-3 h-3" /> Featured
                              </span>
                            )}
                          </div>
                          {card.subtitle && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                              {card.subtitle}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-400 font-mono truncate">{card.url}</p>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="hidden sm:inline text-[10px] font-bold text-gray-400 px-2 py-1 bg-black/5 dark:bg-white/5 rounded-lg">
                          {card.clickCount || 0} clicks
                        </span>

                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveCustom(index, 'up')}
                          className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={index === profile.customLinks.length - 1}
                          onClick={() => handleMoveCustom(index, 'down')}
                          className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleCustomActive(card.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            card.isActive !== false ? 'text-emerald-500' : 'text-gray-400'
                          }`}
                        >
                          {card.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleOpenEditCustom(card)}
                          className="p-1.5 text-gray-400 hover:text-[#e50914] rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteCustomLink(card.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STUDIO PROFILE & BRANDING */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-[#14161a] border border-[#fee2e2] dark:border-gray-800/80 rounded-3xl p-6 shadow-xl shadow-red-500/5 space-y-5">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Studio Branding & Contact Settings
                </h2>
                <p className="text-xs text-gray-400">
                  Configure brand name, bio tagline, WhatsApp quick-chat number, and contact info displayed on your public page.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Studio / Brand Name *
                  </label>
                  <input
                    type="text"
                    value={profileForm.studioName}
                    onChange={(e) => setProfileForm({ ...profileForm, studioName: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Avatar / Logo Image URL
                  </label>
                  <input
                    type="text"
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Tagline (Headline)
                  </label>
                  <input
                    type="text"
                    value={profileForm.tagline}
                    onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Bio Description
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e50914] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    WhatsApp Chat Number (with country code)
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <input
                      type="text"
                      value={profileForm.whatsapp}
                      onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                      placeholder="919876543210"
                      className="w-full bg-gray-50 dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Direct Call Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e50914]" />
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-gray-50 dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Studio Location / Cities
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      placeholder="Bhubaneswar & Mumbai, India"
                      className="w-full bg-gray-50 dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="contact@arjunfilms.com"
                      className="w-full bg-gray-50 dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Demo Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveProfileInfo}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#c70812] text-white text-xs font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS & QR ENGINE */}
          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-[#14161a] border border-[#fee2e2] dark:border-gray-800/80 rounded-3xl p-6 shadow-xl shadow-red-500/5 space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Bio Page Traffic & Link Analytics
                </h2>
                <p className="text-xs text-gray-400">
                  Real-time metrics of visitors clicking your public link across social media campaigns.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400">
                    Total Page Views
                  </span>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {(profile?.viewsCount || 0).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-emerald-500 font-semibold mt-1 inline-block">
                    ↑ Auto-tracked live
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400">
                    Total Link Clicks
                  </span>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {(profile?.totalClicks || 0).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-amber-500 font-semibold mt-1 inline-block">
                    Across all channels
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400">
                    Active Links
                  </span>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {(profile?.socialLinks?.filter((l: any) => l.isActive !== false).length || 0) +
                      (profile?.customLinks?.filter((c: any) => c.isActive !== false).length || 0)}
                  </p>
                  <span className="text-[10px] text-blue-500 font-semibold mt-1 inline-block">
                    Visible to public
                  </span>
                </div>
              </div>

              {/* Top Links Breakdown */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Top Clicked Links Breakdown
                </h3>
                <div className="space-y-2">
                  {[...(profile?.customLinks || []), ...(profile?.socialLinks || [])]
                    .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
                    .slice(0, 6)
                    .map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#1a1d24] text-xs font-medium"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                          <span className="font-bold text-gray-900 dark:text-white truncate">
                            {item.title || item.label || item.platform}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-[#e50914] shrink-0">
                          {item.clickCount || 0} clicks
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Mobile Mockup Preview (5 Cols on XL) */}
        <div className="xl:col-span-5 sticky top-24">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#e50914]" />
              <span>Live Mobile Simulator</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Real-time sync
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="relative mx-auto w-full max-w-[390px] h-[780px] bg-black rounded-[48px] p-3 shadow-2xl shadow-black/60 border-4 border-gray-800">
            {/* Dynamic Island / Speaker Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-900 border border-gray-800 mr-2" />
              <div className="w-8 h-1 bg-gray-800 rounded-full" />
            </div>

            {/* Inner Phone Screen Screen */}
            <div className="w-full h-full rounded-[38px] overflow-hidden bg-[#090a0d] overflow-y-auto custom-scrollbar pt-6">
              <PublicBioLinksView profile={liveProfilePreview} isEmbedPreview={true} />
            </div>
          </div>
        </div>
      </div>

      {/* --- ADD / EDIT SOCIAL LINK MODAL --- */}
      {isSocialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md bg-[#16181c] border border-red-500/20 rounded-3xl p-6 shadow-2xl text-white overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">
              {editingSocialLink ? 'Edit Social Link' : 'Add Social Media Channel'}
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              Select the platform to auto-apply standard branding, icons and formatting.
            </p>

            <form onSubmit={handleSaveSocialLink} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5">
                  Platform
                </label>
                <select
                  value={socialForm.platform}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  className="w-full bg-[#1e2229] border border-gray-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                >
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option key={p.platform} value={p.platform}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5">
                  Display Label *
                </label>
                <input
                  type="text"
                  required
                  value={socialForm.label}
                  onChange={(e) => setSocialForm({ ...socialForm, label: e.target.value })}
                  className="w-full bg-[#1e2229] border border-gray-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5">
                  Target Link URL *
                </label>
                <input
                  type="text"
                  required
                  value={socialForm.url}
                  onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                  placeholder="https://instagram.com/arjunfilms"
                  className="w-full bg-[#1e2229] border border-gray-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5">
                  Handle / Username (Optional)
                </label>
                <input
                  type="text"
                  value={socialForm.username}
                  onChange={(e) => setSocialForm({ ...socialForm, username: e.target.value })}
                  placeholder="@arjunfilms"
                  className="w-full bg-[#1e2229] border border-gray-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="soc_active"
                  checked={socialForm.isActive}
                  onChange={(e) => setSocialForm({ ...socialForm, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#e50914] rounded cursor-pointer"
                />
                <label htmlFor="soc_active" className="text-xs text-gray-300 cursor-pointer">
                  Display on public bio page
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsSocialModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#c70812] text-white text-xs font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  {saving ? 'Saving...' : editingSocialLink ? 'Update Link' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT CUSTOM SHOWCASE CARD MODAL --- */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg bg-[#16181c] border border-red-500/20 rounded-3xl p-6 shadow-2xl text-white overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">
              {editingCustomLink ? 'Edit Showcase Card' : 'Add Showcase Action Card'}
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              Highlight key services, portfolios, quotation generators, or payment portals.
            </p>

            <form onSubmit={handleSaveCustomLink} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5">
                  Card Title *
                </label>
                <input
                  type="text"
                  required
                  value={customForm.title}
                  onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                  placeholder="🎬 2025 Wedding Cinema Showreel"
                  className="w-full bg-[#1e2229] border border-gray-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={customForm.subtitle}
                  onChange={(e) => setCustomForm({ ...customForm, subtitle: e.target.value })}
                  placeholder="Watch our 4K cinematic films, teasers and bridal edits"
                  className="w-full bg-[#1e2229] border border-gray-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5">
                  Target Destination URL *
                </label>
                <input
                  type="text"
                  required
                  value={customForm.url}
                  onChange={(e) => setCustomForm({ ...customForm, url: e.target.value })}
                  placeholder="/quotations or https://youtube.com/@arjunfilms"
                  className="w-full bg-[#1e2229] border border-gray-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5">
                    Icon Symbol
                  </label>
                  <select
                    value={customForm.icon}
                    onChange={(e) => setCustomForm({ ...customForm, icon: e.target.value })}
                    className="w-full bg-[#1e2229] border border-gray-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                  >
                    {AVAILABLE_ICONS.map((i) => (
                      <option key={i.name} value={i.name}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5">
                    Badge Tag (e.g. Popular, New)
                  </label>
                  <input
                    type="text"
                    value={customForm.badge}
                    onChange={(e) => setCustomForm({ ...customForm, badge: e.target.value })}
                    placeholder="🔥 Featured"
                    className="w-full bg-[#1e2229] border border-gray-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5">
                  Thumbnail Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={customForm.thumbnail}
                  onChange={(e) => setCustomForm({ ...customForm, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-[#1e2229] border border-gray-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="card_highlight"
                    checked={customForm.isHighlighted}
                    onChange={(e) =>
                      setCustomForm({ ...customForm, isHighlighted: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#e50914] rounded cursor-pointer"
                  />
                  <label htmlFor="card_highlight" className="text-xs text-gray-300 cursor-pointer">
                    Feature with glowing animation highlight
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="card_active"
                    checked={customForm.isActive}
                    onChange={(e) => setCustomForm({ ...customForm, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#e50914] rounded cursor-pointer"
                  />
                  <label htmlFor="card_active" className="text-xs text-gray-300 cursor-pointer">
                    Display on public bio page
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#c70812] text-white text-xs font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  {saving ? 'Saving...' : editingCustomLink ? 'Update Card' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={publicUrl}
        studioName={profile?.studioName || 'Arjun Films'}
        avatarUrl={profile?.avatar || '/logo.jpeg'}
      />
    </div>
  );
}
