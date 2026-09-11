'use client';

import React, { useState } from 'react';
import { X, Send, Calendar, User, Phone, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuickInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
  studioName?: string;
}

export default function QuickInquiryModal({
  isOpen,
  onClose,
  whatsappNumber = '919876543210',
  studioName = 'Arjun Films & Photography',
}: QuickInquiryModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('Wedding Photography & Film');
  const [eventDate, setEventDate] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error('Please enter your name and phone number');
      return;
    }

    const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const message = `✨ *New Inquiry via Bio Links Page*\n\n` +
      `👤 *Name:* ${name.trim()}\n` +
      `📞 *Phone:* ${phone.trim()}\n` +
      `💍 *Event Type:* ${eventType}\n` +
      `📅 *Date:* ${eventDate || 'To be decided'}\n` +
      `📍 *Location / City:* ${city || 'Not specified'}\n` +
      `📝 *Notes:* ${notes || 'Interested in package options & date check.'}\n\n` +
      `_Sent from ${studioName} Bio Hub_`;

    const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(message)}`;
    
    setIsSubmitted(true);
    toast.success('Redirecting to WhatsApp with your details...');
    
    setTimeout(() => {
      window.open(waUrl, '_blank');
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#14161a] border border-red-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-52 h-52 bg-red-600/10 blur-[50px] pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[#e50914] text-[11px] font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Booking Inquiry</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Connect with {studioName}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Fill in your event details below to connect directly with our creative director on WhatsApp.
          </p>
        </div>

        {isSubmitted ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-white">Opening WhatsApp Chat...</h4>
            <p className="text-xs text-gray-400 max-w-xs">
              Thank you! You are being connected directly to our booking team.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-[#1e2229] border border-gray-700/70 focus:border-[#e50914] rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Phone / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#1e2229] border border-gray-700/70 focus:border-[#e50914] rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Event Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-[#1e2229] border border-gray-700/70 focus:border-[#e50914] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                >
                  <option value="Wedding Photography & Film">Wedding Photography & Film</option>
                  <option value="Pre-Wedding Shoot">Pre-Wedding Shoot</option>
                  <option value="Destination Wedding">Destination Wedding</option>
                  <option value="Engagement / Reception">Engagement / Reception</option>
                  <option value="Commercial / Fashion Shoot">Commercial / Fashion Shoot</option>
                  <option value="Birthday / Anniversary Event">Birthday / Anniversary Event</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Event Date (Approx)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-[#1e2229] border border-gray-700/70 focus:border-[#e50914] rounded-xl py-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Event City / Venue
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Udaipur, Bhubaneswar, Goa"
                className="w-full bg-[#1e2229] border border-gray-700/70 focus:border-[#e50914] rounded-xl py-2.5 px-3 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#e50914]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us about your wedding vision, drone requirements, or album preferences..."
                className="w-full bg-[#1e2229] border border-gray-700/70 focus:border-[#e50914] rounded-xl py-2.5 px-3 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#e50914] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#22bf5b] hover:to-[#0f7a6d] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer mt-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Inquiry to Studio via WhatsApp</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
