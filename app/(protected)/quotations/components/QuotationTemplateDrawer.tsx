'use client';

import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2, RotateCcw, Save, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateConfig {
  studioName: string;
  phone: string;
  email: string;
  address: string;
  accentColor: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  terms: string[];
  sectionsOrder: string[];
  pageBgColor: string;
  headerBgColor: string;
  footerBgColor: string;
  watermarkUrl: string;
  watermarkOpacity: number;
}

const DEFAULT_TEMPLATE: TemplateConfig = {
  studioName: "ARJUN PHOTOGRAPHY",
  phone: "+91 7788992712",
  email: "arjunphotographyyy@gmail.com",
  address: "Bhubaneswar, Odisha - 751030",
  accentColor: "#0066fe",
  bankName: "BABUL SAMAL",
  bankAccount: "39149567096",
  bankIfsc: "SBIN0000068",
  terms: [
    "50% advance retainer is required to lock dates.",
    "30% payment is due during the event execution.",
    "Remaining 20% must be paid before final photo delivery.",
    "Booking retainer is non-refundable."
  ],
  sectionsOrder: ['header', 'client', 'services', 'payment', 'terms', 'footer'],
  pageBgColor: "#f0f4fa",
  headerBgColor: "#eef4fc",
  footerBgColor: "#0066fe",
  watermarkUrl: "https://cdn-icons-png.flaticon.com/512/685/685655.png",
  watermarkOpacity: 0.05
};

interface QuotationTemplateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuotationTemplateDrawer({ isOpen, onClose }: QuotationTemplateDrawerProps) {
  const [config, setConfig] = useState<TemplateConfig>(DEFAULT_TEMPLATE);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arjun-quotation-template');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          
          // Fallbacks for backwards compatibility
          if (!parsed.sectionsOrder) parsed.sectionsOrder = DEFAULT_TEMPLATE.sectionsOrder;
          if (!parsed.pageBgColor) parsed.pageBgColor = DEFAULT_TEMPLATE.pageBgColor;
          if (!parsed.headerBgColor) parsed.headerBgColor = DEFAULT_TEMPLATE.headerBgColor;
          if (!parsed.footerBgColor) parsed.footerBgColor = DEFAULT_TEMPLATE.footerBgColor;
          if (parsed.watermarkUrl === undefined) parsed.watermarkUrl = DEFAULT_TEMPLATE.watermarkUrl;
          if (parsed.watermarkOpacity === undefined) parsed.watermarkOpacity = DEFAULT_TEMPLATE.watermarkOpacity;

          setConfig(parsed);
        } catch (e) {
          console.error('Failed to parse quotation template config', e);
        }
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('arjun-quotation-template', JSON.stringify(config));
    toast.success('Quotation layout template saved successfully!');
    onClose();
  };

  const handleReset = () => {
    setConfig(DEFAULT_TEMPLATE);
    toast.info('Reset to default studio layout.');
  };

  const handleTermChange = (index: number, value: string) => {
    const updatedTerms = [...config.terms];
    updatedTerms[index] = value;
    setConfig({ ...config, terms: updatedTerms });
  };

  const handleAddTerm = () => {
    setConfig({ ...config, terms: [...config.terms, ""] });
  };

  const handleRemoveTerm = (index: number) => {
    const updatedTerms = config.terms.filter((_, i) => i !== index);
    setConfig({ ...config, terms: updatedTerms });
  };

  // HTML5 Drag and Drop events
  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const list = [...config.sectionsOrder];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setConfig({ ...config, sectionsOrder: list });
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
  };

  if (!isOpen) return null;

  const colorPresets = [
    { name: 'Royal Blue (Theme)', hex: '#0066fe' },
    { name: 'Dark Slate', hex: '#2d3748' },
    { name: 'Studio Purple', hex: '#5c0656' },
    { name: 'Emerald Green', hex: '#137333' },
    { name: 'Coral Pink', hex: '#ff5a79' },
  ];

  const sectionLabels: Record<string, string> = {
    header: "Studio Brand Header",
    client: "Client Particulars Card",
    services: "Services & Pricing Table",
    payment: "Payment Schedule & Account Info",
    terms: "Terms & Conditions",
    footer: "Thank You Footer Notes"
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#16181c] shadow-2xl flex flex-col h-full border-l border-gray-150 dark:border-gray-800 transition-all duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-150 dark:border-gray-850 flex justify-between items-center bg-[#eef4fc]/60 dark:bg-gray-900/30">
            <div>
              <h2 className="text-[17px] font-extrabold text-gray-900 dark:text-white">PDF Quotation Settings</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">Drag-and-drop order & branding parameters.</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-[13px]">
            
            {/* Drag and Drop Sections Order */}
            <div className="space-y-3">
              <h3 className="text-[12px] font-bold text-[#0066fe] dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">Drag & Drop Section Layout</h3>
              <p className="text-[11px] text-gray-400 font-semibold mb-3">Grab handles to rearrange the vertical sequence of sections on the generated PDF.</p>
              
              <div className="space-y-2">
                {config.sectionsOrder.map((sectionId, idx) => (
                  <div
                    key={sectionId}
                    draggable
                    onDragStart={(e) => onDragStart(e, idx)}
                    onDragOver={(e) => onDragOver(e, idx)}
                    onDragEnd={onDragEnd}
                    className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1c1f24] hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl border border-gray-200/40 dark:border-gray-800/60 cursor-grab active:cursor-grabbing transition-all select-none ${
                      draggedIndex === idx ? 'opacity-40 border-[#0066fe]/50 bg-[#eef4fc]/40 shadow-inner' : ''
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-tight">Section {idx + 1}</span>
                      <span className="font-bold text-gray-700 dark:text-gray-200 text-[12.5px]">{sectionLabels[sectionId]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-850">
              <h3 className="text-[12px] font-bold text-[#0066fe] dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">Studio Details</h3>
              
              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Studio / Brand Name</label>
                <input 
                  type="text" 
                  value={config.studioName}
                  onChange={(e) => setConfig({ ...config, studioName: e.target.value })}
                  className="bg-gray-50 dark:bg-[#1c1f24] border border-gray-250/60 dark:border-gray-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0066fe] dark:text-white text-[13.5px] font-medium" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={config.phone}
                    onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    className="bg-gray-50 dark:bg-[#1c1f24] border border-gray-250/60 dark:border-gray-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0066fe] dark:text-white text-[13.5px] font-medium" 
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className="bg-gray-50 dark:bg-[#1c1f24] border border-gray-250/60 dark:border-gray-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0066fe] dark:text-white text-[13.5px] font-medium" 
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Address Location</label>
                <input 
                  type="text" 
                  value={config.address}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  className="bg-gray-50 dark:bg-[#1c1f24] border border-gray-250/60 dark:border-gray-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0066fe] dark:text-white text-[13.5px] font-medium" 
                />
              </div>
            </div>

            {/* Accent Color Theme */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-850">
              <h3 className="text-[12px] font-bold text-[#0066fe] dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">Accent Color Theme</h3>
              
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setConfig({ ...config, accentColor: preset.hex })}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      config.accentColor === preset.hex
                        ? 'bg-gray-100 dark:bg-gray-800 border-[#0066fe] text-[#0066fe] dark:text-white shadow-sm'
                        : 'bg-white dark:bg-[#1c1f24] border-gray-200/60 dark:border-gray-800 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.hex }} />
                    {preset.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-2 bg-gray-50 dark:bg-[#1c1f24] p-3 rounded-xl border border-gray-200/40 dark:border-gray-800">
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent shrink-0"
                />
                <div>
                  <span className="text-[10px] font-extrabold text-gray-400 block uppercase">Selected Custom Color</span>
                  <span className="font-mono text-[13px] uppercase dark:text-white">{config.accentColor}</span>
                </div>
              </div>
            </div>

            {/* Document Styles */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-850">
              <h3 className="text-[12px] font-bold text-[#0066fe] dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">Document Styles</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Page Background</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={config.pageBgColor}
                      onChange={(e) => setConfig({ ...config, pageBgColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent shrink-0" 
                    />
                    <span className="font-mono text-[11px] uppercase dark:text-white">{config.pageBgColor}</span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Header Background</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={config.headerBgColor}
                      onChange={(e) => setConfig({ ...config, headerBgColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent shrink-0" 
                    />
                    <span className="font-mono text-[11px] uppercase dark:text-white">{config.headerBgColor}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Footer Background</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={config.footerBgColor}
                      onChange={(e) => setConfig({ ...config, footerBgColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent shrink-0" 
                    />
                    <span className="font-mono text-[11px] uppercase dark:text-white">{config.footerBgColor}</span>
                  </div>
                </div>
              </div>

              {/* Watermark logo URL */}
              <div className="flex flex-col pt-2">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Watermark Image URL</label>
                <input 
                  type="text" 
                  value={config.watermarkUrl}
                  onChange={(e) => setConfig({ ...config, watermarkUrl: e.target.value })}
                  placeholder="e.g. https://domain.com/logo.png"
                  className="bg-gray-50 dark:bg-[#1c1f24] border border-gray-250/60 dark:border-gray-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0066fe] dark:text-white text-[13px] font-medium" 
                />
              </div>

              {/* Watermark opacity */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Watermark Opacity</label>
                  <span className="font-mono text-[11.5px] font-bold text-gray-500 dark:text-gray-400">{Math.round(config.watermarkOpacity * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.01" 
                  max="0.30" 
                  step="0.01"
                  value={config.watermarkOpacity}
                  onChange={(e) => setConfig({ ...config, watermarkOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#0066fe]" 
                />
              </div>
            </div>

            {/* Bank Info */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-850">
              <h3 className="text-[12px] font-bold text-[#0066fe] dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">Payment Details</h3>
              
              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Account Holder Name</label>
                <input 
                  type="text" 
                  value={config.bankName}
                  onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
                  className="bg-gray-50 dark:bg-[#1c1f24] border border-gray-250/60 dark:border-gray-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0066fe] dark:text-white text-[13.5px] font-medium" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Account Number</label>
                  <input 
                    type="text" 
                    value={config.bankAccount}
                    onChange={(e) => setConfig({ ...config, bankAccount: e.target.value })}
                    className="bg-gray-50 dark:bg-[#1c1f24] border border-gray-250/60 dark:border-gray-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0066fe] dark:text-white text-[13.5px] font-medium" 
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Bank IFSC Code</label>
                  <input 
                    type="text" 
                    value={config.bankIfsc}
                    onChange={(e) => setConfig({ ...config, bankIfsc: e.target.value })}
                    className="bg-gray-50 dark:bg-[#1c1f24] border border-gray-250/60 dark:border-gray-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0066fe] dark:text-white text-[13.5px] font-medium" 
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-850">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-[12px] font-bold text-[#0066fe] dark:text-white uppercase tracking-wider">Terms & Conditions</h3>
                <button
                  type="button"
                  onClick={handleAddTerm}
                  className="flex items-center gap-1 text-[#0066fe] dark:text-blue-400 hover:bg-[#0066fe]/10 px-2 py-1 rounded-lg transition-colors font-bold text-[11px] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Term
                </button>
              </div>

              <div className="space-y-3">
                {config.terms.map((term, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="w-6 h-8 flex items-center justify-center font-bold text-[#0066fe] dark:text-gray-400 text-[13px]">{index + 1}.</span>
                    <textarea
                      rows={2}
                      value={term}
                      onChange={(e) => handleTermChange(index, e.target.value)}
                      placeholder="Enter legal terms or payment milestones..."
                      className="flex-1 bg-gray-50 dark:bg-[#1c1f24] border border-gray-250/60 dark:border-gray-800 p-2.5 rounded-xl focus:outline-none focus:border-[#0066fe] dark:text-white text-[12.5px] font-medium resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTerm(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer self-center"
                      title="Remove term line"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-5 border-t border-gray-150 dark:border-gray-850 flex gap-3 bg-gray-50/50 dark:bg-gray-900/30">
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 px-4 py-3 bg-white dark:bg-[#1c1f24] border border-gray-250/60 dark:border-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-[13px] font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex-1 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Defaults
            </button>
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[#0066fe] text-white rounded-xl text-[13px] font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all flex-1 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Config
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
