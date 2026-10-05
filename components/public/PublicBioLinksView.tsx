'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Share2,
  QrCode,
  CheckCircle2,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  ExternalLink,
  ArrowRight,
  Sun,
  Moon,
  ShieldCheck,
  Send,
  Heart,
  Eye,
  MousePointerClick,
  Copy,
  Check,
} from 'lucide-react';
import DynamicBioIcon from '@/components/ui/DynamicBioIcon';
import QrCodeModal from '@/components/ui/QrCodeModal';
import QuickInquiryModal from '@/components/ui/QuickInquiryModal';
import { trackBioLinkClick } from '@/app/actions';
import { toast } from 'sonner';

interface PublicBioLinksViewProps {
  profile: any;
  isEmbedPreview?: boolean;
}

export default function PublicBioLinksView({
  profile,
  isEmbedPreview = false,
}: PublicBioLinksViewProps) {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const studioName = profile?.studioName || 'Arjun Films & Photography';
  const tagline = profile?.tagline || 'Cinematic Weddings • Luxury Portfolios • Commercials';
  const bio = profile?.bio || 'Capturing life’s greatest love stories & timeless cinema across India & worldwide.';
  const avatar = profile?.avatar || '/logo.jpeg';
  const coverImage = profile?.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';
  const location = profile?.location || 'Bhubaneswar & Mumbai, India';
  const phone = profile?.phone || '+91 98765 43210';
  const whatsapp = profile?.whatsapp || '919876543210';
  const email = profile?.email || 'contact@arjunfilms.com';
  const website = profile?.website || 'https://arjunfilms.com';
  const verified = profile?.verified !== false;
  const slug = profile?.slug || 'arjunfilms';

  const socialLinks = (profile?.socialLinks || []).filter((l: any) => l.isActive !== false);
  const customLinks = (profile?.customLinks || []).filter((l: any) => l.isActive !== false);

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/links`
    : `https://arjunfilms.com/links`;

  const handleLinkClick = (link: any, type: 'social' | 'custom') => {
    // Asynchronously log click
    if (!isEmbedPreview) {
      trackBioLinkClick(link.id, type, slug).catch((e) => console.error(e));
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${studioName} - Official Links & Portfolio`,
          text: `Check out ${studioName} - Official Social Links, 4K Cinema Portfolio & Booking:`,
          url: publicUrl,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        // User cancelled or fallback
        setIsQrOpen(true);
      }
    } else {
      setIsQrOpen(true);
    }
  };

  const handleCopyPageUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      toast.success('Page link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div
      data-site-font={profile?.fontFamily || 'montserrat'}
      data-theme-color={profile?.themeColor || 'crimson'}
      className={`relative min-h-screen w-full transition-colors duration-300 font-sans ${
        isDark ? 'bg-[#090a0d] text-white' : 'bg-[#f8f9fb] text-gray-900'
      } ${isEmbedPreview ? 'rounded-[36px] overflow-hidden' : ''}`}
    >
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[400px] rounded-full blur-[110px] ${
            isDark ? 'bg-red-600/15' : 'bg-red-500/10'
          }`}
        />
        <div
          className={`absolute top-96 -left-20 w-[450px] h-[450px] rounded-full blur-[120px] ${
            isDark ? 'bg-purple-900/10' : 'bg-rose-200/40'
          }`}
        />
        <div
          className={`absolute bottom-20 -right-20 w-[400px] h-[400px] rounded-full blur-[100px] ${
            isDark ? 'bg-amber-600/10' : 'bg-amber-100/50'
          }`}
        />
        {/* Subtle grid pattern overlay */}
        <div
          className={`absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] ${
            isDark ? 'opacity-40' : 'opacity-20'
          }`}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
        {/* Top Floating Control Bar */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2.5 rounded-full transition-all cursor-pointer backdrop-blur-md ${
              isDark
                ? 'bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10'
                : 'bg-white/80 hover:bg-white text-gray-700 hover:text-black border border-gray-200 shadow-sm'
            }`}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrOpen(true)}
              className={`p-2.5 rounded-full transition-all cursor-pointer backdrop-blur-md ${
                isDark
                  ? 'bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10'
                  : 'bg-white/80 hover:bg-white text-gray-700 hover:text-black border border-gray-200 shadow-sm'
              }`}
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer backdrop-blur-md active:scale-95 ${
                isDark
                  ? 'bg-gradient-to-r from-[#e50914] to-[#b80710] hover:from-[#f40d1a] hover:to-[#c70812] text-white shadow-lg shadow-red-600/30'
                  : 'bg-[#e50914] hover:bg-[#c70812] text-white shadow-md shadow-red-500/20'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Studio Profile Card */}
        <div className="w-full flex flex-col items-center text-center mt-2 mb-7">
          {/* Avatar with Glow Ring */}
          <div className="relative group cursor-pointer mb-4">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 via-[#e50914] to-amber-500 opacity-75 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-[#121418] border-2 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
              <img
                src={avatar}
                alt={studioName}
                className="w-full h-full object-contain rounded-full bg-black/40 p-1 scale-105"
                onError={(e: any) => {
                  e.target.src = '/logo.jpeg';
                }}
              />
            </div>
            {verified && (
              <div
                className="absolute bottom-1 right-1 bg-gradient-to-tr from-[#e50914] to-rose-400 p-1.5 rounded-full text-white shadow-lg shadow-red-500/40 ring-2 ring-[#090a0d]"
                title="Verified Official Studio"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
            )}
          </div>

          {/* Studio Name & Badge */}
          <div className="flex items-center justify-center gap-2 mb-1.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {studioName}
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#e50914] dark:text-red-400 uppercase mb-2.5">
            {tagline}
          </p>

          {/* Bio Description */}
          <p
            className={`text-xs sm:text-sm max-w-md leading-relaxed mb-4 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {bio}
          </p>

          {/* Location & Verified Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-gray-300'
                  : 'bg-white border border-gray-200 text-gray-700 shadow-sm'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#e50914]" />
              <span>{location}</span>
            </div>

            <div
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
                isDark
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Open for 2025–26 Shoots</span>
            </div>
          </div>

          {/* Quick Contact Buttons Row */}
          <div className="w-full flex items-center justify-center gap-2.5 flex-wrap">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hi ${studioName}, I found your bio page and would like to inquire about wedding/shoot booking.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick({ id: 'quick_wa' }, 'social')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#22bf5b] hover:to-[#0f7a6d] text-white text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp Chat</span>
              </a>
            )}

            <button
              onClick={() => setIsInquiryOpen(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer backdrop-blur-md ${
                isDark
                  ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-[#e50914]" />
              <span>Book / Inquire</span>
            </button>

            {phone && (
              <a
                href={`tel:${phone}`}
                className={`p-2.5 rounded-2xl transition-all active:scale-95 cursor-pointer backdrop-blur-md ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
                }`}
                title="Direct Phone Call"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className={`p-2.5 rounded-2xl transition-all active:scale-95 cursor-pointer backdrop-blur-md ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
                }`}
                title="Send Email"
              >
                <Mail className="w-4 h-4 text-amber-400" />
              </a>
            )}
          </div>
        </div>

        {/* Social Media Horizontal Icon Grid */}
        {socialLinks.length > 0 && (
          <div className="w-full mb-7">
            <div
              className={`p-3.5 rounded-3xl backdrop-blur-xl border transition-all ${
                isDark
                  ? 'bg-[#121418]/80 border-white/10 shadow-2xl shadow-black/40'
                  : 'bg-white/90 border-gray-200/80 shadow-lg shadow-gray-200/50'
              }`}
            >
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {socialLinks.map((link: any) => {
                  return (
                    <a
                      key={link.id || link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleLinkClick(link, 'social')}
                      title={`${link.label || link.platform} (${link.username || link.url})`}
                      className={`group relative p-3 rounded-2xl transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95 ${
                        isDark
                          ? 'bg-[#1a1d24] hover:bg-[#222731] text-gray-300 hover:text-white border border-white/5 hover:border-red-500/30'
                          : 'bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-[#e50914] border border-gray-100 hover:border-red-200'
                      }`}
                      style={{
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div className="transition-transform group-hover:scale-115">
                        <DynamicBioIcon
                          name={link.icon || link.platform}
                          className="w-5 h-5"
                          style={{ color: link.color || undefined }}
                        />
                      </div>
                      {/* Hover Tooltip */}
                      <span className="absolute -bottom-8 bg-[#181a1f] border border-white/10 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-30">
                        {link.label || link.platform}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Section Heading: Featured Links */}
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#e50914]" />
            <span>Showcase & Quick Actions</span>
          </span>
          <span className="text-[11px] font-semibold text-gray-400">
            {customLinks.length} items
          </span>
        </div>

        {/* Custom Showcase Action Cards */}
        <div className="w-full space-y-3.5 mb-10">
          {customLinks.map((card: any) => {
            const isHighlight = card.isHighlighted;

            return (
              <a
                key={card.id}
                href={card.url}
                target={card.url.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(card, 'custom')}
                className={`group relative w-full flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                  isHighlight
                    ? isDark
                      ? 'bg-gradient-to-r from-[#1b1c22] via-[#201c22] to-[#1a1b20] border border-red-500/30 hover:border-red-500 shadow-lg shadow-red-950/20 hover:shadow-red-500/20'
                      : 'bg-gradient-to-r from-white via-red-50/40 to-white border border-red-200 hover:border-[#e50914] shadow-md shadow-red-500/5'
                    : isDark
                    ? 'bg-[#121418]/90 hover:bg-[#181a20] border border-white/10 hover:border-white/20 shadow-md shadow-black/20'
                    : 'bg-white hover:bg-gray-50/80 border border-gray-200/80 hover:border-gray-300 shadow-sm'
                }`}
              >
                {/* Glowing edge effect if highlighted */}
                {isHighlight && (
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-red-600/30 to-amber-600/30 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none" />
                )}

                {/* Left Thumbnail or Icon */}
                <div className="relative shrink-0">
                  {card.thumbnail ? (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-white/10 shadow-md">
                      <img
                        src={card.thumbnail}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all ${
                        isHighlight
                          ? 'bg-gradient-to-tr from-[#e50914] to-red-700 text-white shadow-md shadow-red-500/30 group-hover:scale-105'
                          : isDark
                          ? 'bg-[#1e222a] text-red-400 group-hover:bg-[#252a35]'
                          : 'bg-red-50 text-[#e50914] group-hover:bg-red-100'
                      }`}
                    >
                      <DynamicBioIcon
                        name={card.icon || 'sparkles'}
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      />
                    </div>
                  )}
                </div>

                {/* Middle Content */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="text-xs sm:text-sm font-bold tracking-tight truncate group-hover:text-[#e50914] transition-colors">
                      {card.title}
                    </h3>
                    {card.badge && (
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${
                          isHighlight
                            ? 'bg-[#e50914] text-white shadow-sm shadow-red-500/30'
                            : isDark
                            ? 'bg-white/10 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {card.badge}
                      </span>
                    )}
                  </div>

                  {card.subtitle && (
                    <p
                      className={`text-[11px] sm:text-xs truncate font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Right Arrow Button */}
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isHighlight
                      ? 'bg-red-500/20 text-[#e50914] group-hover:bg-[#e50914] group-hover:text-white group-hover:translate-x-1'
                      : isDark
                      ? 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10 group-hover:translate-x-1'
                      : 'bg-gray-100 text-gray-500 group-hover:text-black group-hover:bg-gray-200 group-hover:translate-x-1'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </div>
              </a>
            );
          })}
        </div>

        {/* Bottom Booking / Action Floating Card */}
        <div
          className={`w-full p-5 rounded-3xl backdrop-blur-xl border text-center relative overflow-hidden mb-8 ${
            isDark
              ? 'bg-gradient-to-b from-[#15171e] to-[#0e1014] border-red-500/20 shadow-2xl shadow-red-950/20'
              : 'bg-gradient-to-b from-white to-red-50/30 border-red-200 shadow-xl shadow-red-500/5'
          }`}
        >
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#e50914]/15 rounded-full blur-2xl pointer-events-none" />
          <h4 className="text-base font-extrabold mb-1">Planning a Wedding or Commercial Film?</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            Connect directly with our master cinematographers & check customized package availability in real time.
          </p>

          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsInquiryOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#c70812] text-white text-xs font-bold shadow-lg shadow-red-500/25 active:scale-95 transition-all cursor-pointer"
            >
              Send Direct Inquiry
            </button>
            <button
              onClick={handleCopyPageUrl}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                isDark
                  ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                  : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 shadow-sm'
              }`}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Page Link'}</span>
            </button>
          </div>
        </div>

        {/* Studio Footer */}
        <footer className="w-full flex flex-col items-center text-center gap-2 pt-4 pb-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight opacity-80">
            <img src="/logo.jpeg" alt="Logo" className="w-4 h-4 rounded-full object-contain inline-block" />
            <span>{studioName}</span>
          </div>
          <p className="text-[11px] text-gray-500">
            © {new Date().getFullYear()} {studioName}. All rights reserved.
          </p>
        </footer>
      </div>

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={publicUrl}
        studioName={studioName}
        avatarUrl={avatar}
      />

      {/* Quick Inquiry Modal */}
      <QuickInquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        whatsappNumber={whatsapp}
        studioName={studioName}
      />
    </div>
  );
}
