'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { createProject, getEventTypes, createEventType } from '@/app/actions';

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    location: '',
    eventType: '',
    eventDate: '',
    status: 'Lead',
    totalValue: 0,
    notes: ''
  });
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [isCustomEvent, setIsCustomEvent] = useState(false);

  React.useEffect(() => {
    getEventTypes().then(setEventTypes);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.eventType) {
      toast.error('Required fields: Name, Phone, Email, Event Type');
      return;
    }
    
    setLoading(true);
    try {
      let finalEventType = formData.eventType;
      if (isCustomEvent && finalEventType) {
        const newType = await createEventType(finalEventType);
        finalEventType = newType.name;
      }

      const dataToSave = {
        ...formData,
        eventType: finalEventType,
        totalValue: Number(formData.totalValue) || 0,
        eventDate: formData.eventDate ? new Date(formData.eventDate) : undefined
      };
      
      const newProject = await createProject(dataToSave);
      toast.success('Case record created successfully!');
      router.push(`/projects/${newProject._id}`);
    } catch (e) {
      toast.error('Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/40 p-4 rounded-3xl border border-white/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-200/50 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-[18px] font-bold text-gray-800">Create New Case</h2>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#e50914] text-white rounded-xl text-[13px] font-bold hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all cursor-pointer disabled:opacity-75"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Case'}
        </button>
      </div>

      {/* Main glass card Form */}
      <div className="glass-card p-8 rounded-[24px] bg-white border border-gray-200/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px]">
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Client Name *</label>
            <input 
              name="name" value={formData.name} onChange={handleChange}
              className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] transition-colors text-[16px]" 
              placeholder="e.g. John Doe" 
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Company / Agency</label>
            <input 
              name="company" value={formData.company} onChange={handleChange}
              className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] transition-colors text-[16px]" 
              placeholder="e.g. Stitch Films" 
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number *</label>
            <input 
              name="phone" value={formData.phone} onChange={handleChange}
              className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] transition-colors text-[16px]" 
              placeholder="+91 98765 43210" 
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address *</label>
            <input 
              name="email" type="email" value={formData.email} onChange={handleChange}
              className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] transition-colors text-[16px]" 
              placeholder="client@example.com" 
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Event Location *</label>
            <input 
              name="location" value={formData.location} onChange={handleChange}
              className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] transition-colors text-[16px]" 
              placeholder="e.g. Mumbai, IN" 
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Event Type *</label>
            <div className="flex items-center gap-2">
              {!isCustomEvent ? (
                <select 
                  value={formData.eventType} 
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomEvent(true);
                      setFormData(prev => ({ ...prev, eventType: '' }));
                    } else {
                      handleChange(e);
                    }
                  }}
                  name="eventType"
                  className="w-full bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] text-[16px] cursor-pointer"
                >
                  <option value="">Select event type...</option>
                  {eventTypes.map((t: any) => (
                    <option key={t._id} value={t.name}>{t.name}</option>
                  ))}
                  {eventTypes.length === 0 && (
                    <>
                      <option value="Wedding Shoot">Wedding Shoot</option>
                      <option value="Corporate Shoot">Corporate Shoot</option>
                      <option value="Commercial Session">Commercial Session</option>
                      <option value="Pre-wedding Session">Pre-wedding Session</option>
                    </>
                  )}
                  <option value="CUSTOM">+ Add New Event Type</option>
                </select>
              ) : (
                <div className="w-full flex items-center gap-2 border-b border-gray-300 py-1 focus-within:border-[#e50914]">
                  <input 
                    type="text"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="w-full bg-transparent focus:outline-none py-1 text-[16px]"
                    placeholder="Type new event type..."
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      setIsCustomEvent(false);
                      setFormData(prev => ({ ...prev, eventType: '' }));
                    }}
                    className="text-xs text-gray-500 hover:text-[#e50914]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Event Date</label>
            <input 
              type="date" name="eventDate" value={formData.eventDate} onChange={handleChange}
              className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] transition-colors text-[16px]" 
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Project Status</label>
            <select 
              name="status" value={formData.status} onChange={handleChange}
              className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] text-[16px] cursor-pointer"
            >
              <option value="Lead">Lead</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Booked">Booked</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Total Value (₹) *</label>
            <input 
              type="number"
              name="totalValue" value={formData.totalValue} onChange={handleChange}
              className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] transition-colors text-[16px]"
              placeholder="e.g. 50000"
            />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Notes / Special Requirements</label>
            <textarea 
              name="notes" value={formData.notes} onChange={handleChange} rows={3}
              className="bg-transparent border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-[#e50914] text-[15px]" 
              placeholder="Enter notes, deliverables requirements..." 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
