'use client';

import React, { useState } from 'react';
import { X, Download, Copy, Check, ExternalLink, Sparkles, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  studioName?: string;
  avatarUrl?: string;
}

export default function QrCodeModal({
  isOpen,
  onClose,
  url,
  studioName = 'Arjun Films & Photography',
  avatarUrl = '/logo.jpeg',
}: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=15&format=png&data=${encodeURIComponent(
    url
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Public bio link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${studioName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_qr_code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('QR Code image downloaded successfully!');
    } catch (e) {
      toast.error('Failed to download QR code');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[#16181c] border border-red-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-red-600/15 blur-[60px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#e50914] to-red-950 p-0.5 shadow-lg shadow-red-500/20">
            <div className="w-full h-full bg-[#121418] rounded-2xl flex items-center justify-center overflow-hidden">
              <img
                src={avatarUrl}
                alt="Studio Logo"
                className="w-full h-full object-contain p-1"
                onError={(e: any) => {
                  e.target.src = '/logo.jpeg';
                }}
              />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">{studioName}</h3>
          <p className="text-xs text-gray-400 max-w-xs">
            Scan to instantly access all social media links, wedding portfolio & booking options
          </p>
        </div>

        {/* QR Code Container */}
        <div className="relative mx-auto w-64 h-64 bg-white p-3.5 rounded-2xl shadow-xl shadow-black/50 border-4 border-white/10 flex items-center justify-center group mb-6">
          <img
            src={qrImageUrl}
            alt="Bio Links QR Code"
            className="w-full h-full object-contain rounded-lg"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-2xl pointer-events-none" />
        </div>

        {/* URL Pill */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0e1013] border border-gray-800 rounded-xl mb-5 text-left">
          <span className="text-xs font-mono text-gray-300 truncate max-w-[260px]">{url}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs font-semibold text-[#e50914] hover:text-red-400 transition-colors shrink-0 ml-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#e50914] to-[#b80710] hover:from-[#f40d1a] hover:to-[#c70812] text-white text-xs font-bold shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Saving...' : 'Download QR'}</span>
          </button>

          <button
            onClick={() => window.open(url, '_blank')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Link</span>
          </button>
        </div>
      </div>
    </div>
  );
}
