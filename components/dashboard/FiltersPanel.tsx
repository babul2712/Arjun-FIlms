'use client';

import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

interface FiltersPanelProps {
  onFilterChange: (filters: any) => void;
}

export default function FiltersPanel({ onFilterChange }: FiltersPanelProps) {
  const { filterPanelOpen, setFilterPanelOpen } = useUIStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('This month');
  const [selectedNationality, setSelectedNationality] = useState<string>('');

  if (!filterPanelOpen) return null;

  const handleClearAll = () => {
    setSelectedStatus('');
    setSelectedStage('');
    setSelectedDateRange('This month');
    setSelectedNationality('');
    onFilterChange({ status: '', stage: '', dateRange: '', nationality: '' });
  };

  const handleStatusSelect = (status: string) => {
    const nextStatus = selectedStatus === status ? '' : status;
    setSelectedStatus(nextStatus);
    onFilterChange({ status: nextStatus, stage: selectedStage, dateRange: selectedDateRange, nationality: selectedNationality });
  };

  const handleStageSelect = (stage: string) => {
    const nextStage = selectedStage === stage ? '' : stage;
    setSelectedStage(nextStage);
    onFilterChange({ status: selectedStatus, stage: nextStage, dateRange: selectedDateRange, nationality: selectedNationality });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-gray-200 shadow-2xl flex flex-col p-6 overflow-y-auto custom-scrollbar animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
        <h3 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#0066fe]" />
          Filters
        </h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleClearAll}
            className="text-[12px] font-bold text-gray-400 hover:text-[#0066fe] cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Clear all
          </button>
          <button 
            onClick={() => setFilterPanelOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Consultation Status Section */}
      <div className="space-y-3 mb-6">
        <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Consultation Status</h4>
        <div className="grid grid-cols-2 gap-2">
          {['Not scheduled', 'Missed', 'Not required', 'Invitation sent', 'Scheduled', 'Completed'].map((status) => {
            const isSel = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => handleStatusSelect(status)}
                className={`px-3 py-2 text-[12px] font-bold rounded-xl border text-center cursor-pointer transition-all ${
                  isSel 
                    ? 'bg-[#0066fe] text-white border-[#0066fe] shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200/60 hover:border-[#0066fe]'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Stages Section */}
      <div className="space-y-3 mb-6">
        <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Services Stages</h4>
        <div className="flex flex-col gap-2">
          {['Less than 2 days left', 'Service not started', 'Hard deadline'].map((stage) => {
            const isSel = selectedStage === stage;
            return (
              <button
                key={stage}
                onClick={() => handleStageSelect(stage)}
                className={`w-full px-4 py-2.5 text-left text-[12px] font-bold rounded-xl border cursor-pointer transition-all ${
                  isSel 
                    ? 'bg-[#0066fe] text-white border-[#0066fe]' 
                    : 'bg-white text-gray-600 border-gray-200/60 hover:border-[#0066fe]'
                }`}
              >
                {stage}
              </button>
            );
          })}
        </div>
      </div>

      {/* Created Date Section with Simulated Calendar */}
      <div className="space-y-3 mb-6">
        <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Created Date</h4>
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {['Today', 'Yesterday', 'This week', 'This month'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedDateRange(range)}
              className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border text-center cursor-pointer transition-all ${
                selectedDateRange === range 
                  ? 'bg-gray-100 border-gray-300 text-gray-800' 
                  : 'bg-white border-gray-200/60 text-gray-500 hover:border-[#0066fe]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* September 2024 Grid matching mockup */}
        <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/50">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 mb-2">
            <span>September 2024</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
              <span key={d} className="font-bold text-gray-400">{d}</span>
            ))}
            {/* Days padding */}
            {[...Array(4)].map((_, i) => <span key={`pad-${i}`} />)}
            {/* Days list */}
            {[...Array(30)].map((_, i) => {
              const day = i + 1;
              const isSelected = day === 10 || day === 14;
              return (
                <span 
                  key={day} 
                  className={`py-1 font-bold rounded-md ${
                    isSelected ? 'bg-[#0066fe] text-white font-extrabold shadow-sm' : 'text-gray-600'
                  }`}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nationality Filter Section */}
      <div className="space-y-3">
        <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Nationality</h4>
        <input 
          type="text" 
          value={selectedNationality}
          onChange={(e) => {
            setSelectedNationality(e.target.value);
            onFilterChange({ status: selectedStatus, stage: selectedStage, dateRange: selectedDateRange, nationality: e.target.value });
          }}
          className="w-full bg-transparent border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#0066fe]"
          placeholder="Start typing nationality..."
        />
      </div>
    </div>
  );
}
