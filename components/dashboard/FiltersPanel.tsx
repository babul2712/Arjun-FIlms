'use client';

import React, { useState } from 'react';
import { X, Filter, RefreshCw, Camera, MapPin, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

interface FiltersPanelProps {
  onFilterChange: (filters: any) => void;
}

export default function FiltersPanel({ onFilterChange }: FiltersPanelProps) {
  const { filterPanelOpen, setFilterPanelOpen } = useUIStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  if (!filterPanelOpen) return null;

  const handleClearAll = () => {
    setSelectedStatus('');
    setSelectedEventType('');
    setSelectedLocation('');
    onFilterChange({ status: '', eventType: '', location: '' });
  };

  const handleStatusSelect = (status: string) => {
    const nextStatus = selectedStatus === status ? '' : status;
    setSelectedStatus(nextStatus);
    onFilterChange({ status: nextStatus, eventType: selectedEventType, location: selectedLocation });
  };

  const handleEventTypeSelect = (type: string) => {
    const nextType = selectedEventType === type ? '' : type;
    setSelectedEventType(nextType);
    onFilterChange({ status: selectedStatus, eventType: nextType, location: selectedLocation });
  };

  const handleLocationChange = (loc: string) => {
    setSelectedLocation(loc);
    onFilterChange({ status: selectedStatus, eventType: selectedEventType, location: loc });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-84 bg-white dark:bg-[#16181c] border-l border-gray-200/80 dark:border-gray-800/80 shadow-2xl flex flex-col p-6 overflow-y-auto custom-scrollbar animate-fade-in text-gray-800 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
        <h3 className="text-[17px] font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#e50914]" />
          Project Filters
        </h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleClearAll}
            className="text-[12px] font-bold text-gray-400 hover:text-[#e50914] cursor-pointer flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button 
            onClick={() => setFilterPanelOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Project Status Section */}
      <div className="space-y-3 mb-6">
        <h4 className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Project Status</h4>
        <div className="grid grid-cols-2 gap-2">
          {['Lead', 'Booked', 'In Progress', 'Completed', 'Negotiation'].map((status) => {
            const isSel = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => handleStatusSelect(status)}
                className={`px-3 py-2 text-[12px] font-bold rounded-xl border text-center cursor-pointer transition-all ${
                  isSel 
                    ? 'bg-[#e50914] text-white border-[#e50914] shadow-sm' 
                    : 'bg-gray-50/60 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-800 hover:border-[#e50914]'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Event / Package Type Section */}
      <div className="space-y-3 mb-6">
        <h4 className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" />
          Event & Package Type
        </h4>
        <div className="flex flex-col gap-2">
          {['Wedding', 'Pre-Wedding Shoot', 'Cinematography', 'Reception', 'Commercial & Fashion', 'Birthday / Event'].map((type) => {
            const isSel = selectedEventType === type;
            return (
              <button
                key={type}
                onClick={() => handleEventTypeSelect(type)}
                className={`w-full px-4 py-2.5 text-left text-[12px] font-bold rounded-xl border cursor-pointer transition-all ${
                  isSel 
                    ? 'bg-[#e50914] text-white border-[#e50914] shadow-sm' 
                    : 'bg-gray-50/60 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-800 hover:border-[#e50914]'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location / Venue Section */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-extrabold text-gray-400 dark:text-gray-505 uppercase tracking-widest flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Shoot Location / Venue
        </h4>
        <input 
          type="text" 
          value={selectedLocation}
          onChange={(e) => handleLocationChange(e.target.value)}
          className="w-full bg-gray-50/60 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-800 rounded-xl p-3 text-[12.5px] font-semibold focus:outline-none focus:border-[#e50914] placeholder:text-gray-400 dark:text-white transition-all"
          placeholder="e.g. Bhubaneswar, Puri, Cuttack..."
        />
      </div>
    </div>
  );
}
