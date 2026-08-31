'use client';

import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  Eye,
  Printer,
  Link as LinkIcon,
  LayoutTemplate,
  CheckCircle2,
  Sparkles,
  FileText
} from 'lucide-react';
import { createQuotation, updateQuotation, getEventTypes, createEventType, getProjects } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AVAILABLE_TEMPLATES, generateQuotationHTML } from '@/lib/quotationTemplates';

export default function QuotationForm({ initialData, quotationId, projectId }: { initialData?: any, quotationId?: string, projectId?: string }) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialData?.templateId || 'invoice1');
  const [formData, setFormData] = useState({
    customerName: initialData?.customerName || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    location: initialData?.location || '',
    bookingDate: initialData?.bookingDate ? new Date(initialData.bookingDate).toISOString().split('T')[0] : '',
    eventType: initialData?.eventType || 'Wedding Ceremony',
    discount: initialData?.discount || 0,
    paymentTerms: initialData?.paymentTerms || '50% Advance, 50% on Delivery',
    termsConditions: initialData?.termsConditions || 'Standard terms apply.'
  });
  const [services, setServices] = useState(
    initialData?.services 
      ? initialData.services.map((s: any) => ({ ...s, id: s._id || s.id || Math.random().toString() }))
      : [{ id: '1', name: '', description: '', quantity: 1, price: 0 }]
  );
  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [isCustomEvent, setIsCustomEvent] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || initialData?.projectId || '');
  const [templateConfig, setTemplateConfig] = useState<any>({
    studioName: "ARJUN FILMS",
    phone: "+91 7788992712",
    email: "arjunphotographyyy@gmail.com",
    address: "Bhubaneswar, Odisha - 751030",
    accentColor: "#e50914",
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
    pageBgColor: "#fdf6f6",
    headerBgColor: "#fef2f2",
    footerBgColor: "#e50914",
    watermarkUrl: "/logo.jpeg",
    watermarkOpacity: 0.08
  });

  React.useEffect(() => {
    getEventTypes().then(setEventTypes);
    getProjects().then(setProjects);

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arjun-quotation-template');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          
          if (!parsed.sectionsOrder) parsed.sectionsOrder = ['header', 'client', 'services', 'payment', 'terms', 'footer'];
          if (!parsed.pageBgColor) parsed.pageBgColor = "#fdf6f6";
          if (!parsed.headerBgColor) parsed.headerBgColor = "#fef2f2";
          if (!parsed.footerBgColor) parsed.footerBgColor = parsed.accentColor || "#e50914";
          if (!parsed.watermarkUrl || parsed.watermarkUrl.includes('flaticon.com') || parsed.watermarkUrl.includes('685655')) {
            parsed.watermarkUrl = "/logo.jpeg";
          }
          if (parsed.watermarkOpacity === undefined) parsed.watermarkOpacity = 0.08;

          setTemplateConfig(parsed);
        } catch (e) {
          console.error('Failed to parse template config', e);
        }
      }
    }
  }, []);

  const subTotal = services.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const grandTotal = subTotal - formData.discount;

  const handleAddService = () => {
    setServices([...services, { id: Date.now().toString(), name: '', description: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s: any) => s.id !== id));
  };

  const handleServiceChange = (id: string, field: string, value: string | number) => {
    setServices(services.map((s: any) => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const saveToDatabase = async () => {
    try {
      let finalEventType = formData.eventType;
      if (isCustomEvent && finalEventType) {
        const newType = await createEventType(finalEventType);
        finalEventType = newType.name;
      }

      if (quotationId) {
        await updateQuotation(quotationId, { ...formData, eventType: finalEventType, services, subTotal, grandTotal, projectId: selectedProjectId || undefined, templateId: selectedTemplate });
      } else {
        await createQuotation({ ...formData, eventType: finalEventType, services, subTotal, grandTotal, projectId: selectedProjectId || undefined, templateId: selectedTemplate });
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const validateForm = () => {
    if (!formData.customerName || !formData.customerName.trim()) {
      toast.error('Customer Name is required.');
      return false;
    }
    if (!formData.phone || !formData.phone.trim()) {
      toast.error('Phone Number is required.');
      return false;
    }
    if (!formData.email || !formData.email.trim()) {
      toast.error('Email Address is required.');
      return false;
    }
    if (!formData.location || !formData.location.trim()) {
      toast.error('Location is required.');
      return false;
    }
    if (!formData.bookingDate) {
      toast.error('Booking Date is required.');
      return false;
    }
    if (!services || services.length === 0) {
      toast.error('At least one service line item is required.');
      return false;
    }
    for (let i = 0; i < services.length; i++) {
      const s = services[i];
      if (!s.name || !s.name.trim()) {
        toast.error(`Service item #${i + 1} Name is required.`);
        return false;
      }
      if (!s.price || Number(s.price) <= 0) {
        toast.error(`Service item #${i + 1} Price must be greater than 0.`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const success = await saveToDatabase();
    if (success) {
      toast.success(quotationId ? 'Quotation updated successfully' : 'Quotation generated successfully');
      await handleGeneratePDF();
      router.push('/quotations');
    } else {
      toast.error('Failed to save quotation');
    }
    setLoading(false);
  };

  const handleCopyPaymentLink = () => {
    const link = `${window.location.origin}/payment`;
    navigator.clipboard.writeText(link);
    toast.success('Payment link copied to clipboard!');
  };

  const generateHTML = () => {
    const activeProject = projects.find(p => p._id === selectedProjectId);
    return generateQuotationHTML({
      quotationId,
      customerName: formData.customerName,
      phone: formData.phone,
      email: formData.email,
      location: formData.location,
      bookingDate: formData.bookingDate,
      eventType: formData.eventType,
      discount: formData.discount,
      paymentTerms: formData.paymentTerms,
      termsConditions: formData.termsConditions,
      projectNumber: activeProject?.projectNumber,
      services,
      subTotal,
      grandTotal,
      templateConfig
    }, selectedTemplate);
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    const html = generateHTML();
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    } else {
      toast.error('Pop-up blocked. Please enable pop-ups to view preview.');
    }
    saveToDatabase();
  };

  const handleGeneratePDFButton = async () => {
    if (!validateForm()) return;
    const success = await saveToDatabase();
    if (success) {
      await handleGeneratePDF();
    }
  };

  const handleGeneratePDF = async () => {
    const html = generateHTML();
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.createElement('div');
      element.innerHTML = html;
      element.style.width = '800px';
      element.style.position = 'absolute';
      element.style.visibility = 'hidden';
      document.body.appendChild(element);
      
      const height = element.offsetHeight + 60;
      
      element.style.position = 'static';
      element.style.visibility = 'visible';
      document.body.removeChild(element);
      
      const opt: any = {
        margin:       0,
        filename:     `Quotation_${formData.customerName || 'Client'}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, windowWidth: 800 },
        jsPDF:        { unit: 'px', format: [800, height], orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
      toast.success('PDF Proposal generated!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto pb-12 font-sans text-[13px] text-gray-800">
      {/* Form Area */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Template Style Selector */}
        <div className="glass-card p-5 bg-white border border-[#fee2e2] rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <LayoutTemplate className="w-4.5 h-4.5 text-[#e50914]" />
              Select PDF Invoice / Quotation Template
            </h3>
            <span className="text-[11px] font-bold text-[#e50914] bg-[#fee2e2]/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {selectedTemplate === 'invoice1' ? 'Template 1 (Neat Minimal)' : 'Template 2 (Modern Bento)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {AVAILABLE_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    setSelectedTemplate(tmpl.id);
                    toast.success(`Switched to ${tmpl.name}`);
                  }}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected 
                      ? 'border-[#e50914] bg-[#fef2f2]/60 shadow-xs' 
                      : 'border-gray-200/70 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="font-extrabold text-[13px] text-gray-900 block">{tmpl.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${
                        isSelected ? 'bg-[#e50914] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tmpl.badge}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#e50914] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-snug">
                    {tmpl.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Client details card */}
        <div className="glass-card p-6 bg-white border border-gray-200/50 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <User className="w-5 h-5 text-[#e50914]" />
            Client Particulars
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
              <input 
                className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] text-[15px]" 
                placeholder="e.g. Alexandra Vane" 
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                type="text"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
              <input 
                className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] text-[15px]" 
                placeholder="+91 90000 00000" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                type="tel"
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Email Address</label>
              <input 
                className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] text-[15px]" 
                placeholder="alex@example.com" 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                type="email"
              />
            </div>
          </div>
        </div>

        {/* Shoot details */}
        <div className="glass-card p-6 bg-white border border-gray-200/50 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Calendar className="w-5 h-5 text-[#e50914]" />
            Shoot Particulars
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Event Type</label>
              <select 
                className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] text-[15px] cursor-pointer"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              >
                <option value="Wedding Ceremony">Wedding Ceremony</option>
                <option value="Corporate Shoot">Corporate Shoot</option>
                <option value="Commercial Session">Commercial Session</option>
                <option value="Pre-wedding Session">Pre-wedding Session</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Event Date</label>
              <input 
                className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] text-[15px]" 
                type="date"
                value={formData.bookingDate}
                onChange={e => setFormData({ ...formData, bookingDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Shoot Location</label>
              <div className="relative">
                <MapPin className="absolute left-0 top-3 text-gray-400 w-4 h-4" />
                <input 
                  className="w-full bg-transparent border-b border-gray-300 py-2 pl-6 focus:outline-none focus:border-[#e50914] text-[15px]" 
                  placeholder="e.g. Studio A or hotel venue name" 
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  type="text"
                />
              </div>
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Link to Project Case</label>
              <select 
                className="bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-[#e50914] text-[15px] cursor-pointer"
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
              >
                <option value="">No Project Linked</option>
                {projects.map((p, idx) => (
                  <option key={p.id || p._id || `proj-opt-${idx}`} value={p.id || p._id}>{p.projectNumber} - {p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Deliverables pricing items */}
        <div className="glass-card p-6 bg-white border border-gray-200/50 rounded-2xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="text-base font-bold text-gray-800">Line Items Pricing</h3>
            <button 
              onClick={handleAddService}
              className="flex items-center gap-1 text-[#e50914] hover:bg-[#e50914]/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold text-[12px]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {services.map((service: any) => (
              <div key={service.id} className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/60 relative space-y-3 transition-all hover:border-gray-300">
                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-12 md:col-span-5 flex flex-col">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Service Title</label>
                    <input 
                      className="bg-transparent border-b border-gray-300 py-1.5 focus:outline-none focus:border-[#e50914] text-[14px] font-semibold text-gray-900" 
                      placeholder="e.g. Cinematic Wedding Film" 
                      value={service.name}
                      onChange={e => handleServiceChange(service.id, 'name', e.target.value)}
                      type="text"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 flex flex-col">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Qty</label>
                    <input 
                      className="bg-transparent border-b border-gray-300 py-1.5 focus:outline-none focus:border-[#e50914] text-[14px] font-medium" 
                      value={service.quantity}
                      onChange={e => handleServiceChange(service.id, 'quantity', parseInt(e.target.value) || 0)}
                      type="number"
                      min="1"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3 flex flex-col">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Price (₹)</label>
                    <input 
                      className="bg-transparent border-b border-gray-300 py-1.5 focus:outline-none focus:border-[#e50914] text-[14px] font-bold text-gray-900" 
                      value={service.price}
                      onChange={e => handleServiceChange(service.id, 'price', parseInt(e.target.value) || 0)}
                      type="number"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <button 
                      onClick={() => handleRemoveService(service.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Feature Description / Deliverables */}
                <div className="flex flex-col pt-2 border-t border-gray-200/50">
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-[#e50914]" />
                    Feature Description / Deliverables (Appears under title on invoice)
                  </label>
                  <textarea 
                    rows={2}
                    className="w-full bg-white border border-gray-250/70 rounded-lg p-2 text-[12px] focus:outline-none focus:border-[#e50914] placeholder:text-gray-400 resize-none font-normal leading-relaxed text-gray-700"
                    placeholder="e.g. • 4K multi-cam coverage&#10;• Drone aerial footage&#10;• Color-graded teaser & raw archives"
                    value={service.description || ''}
                    onChange={e => handleServiceChange(service.id, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end pt-4 border-t border-gray-100">
            <div className="w-full md:w-1/2 space-y-3 font-bold">
              <div className="flex justify-between items-center text-gray-400 text-[12px] uppercase tracking-wider">
                <span>Subtotal</span>
                <span className="text-gray-700">₹{subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400 text-[12px] uppercase tracking-wider">
                <span>Retainer Discount</span>
                <input 
                  className="w-24 bg-transparent border-b border-gray-300 text-right focus:outline-none focus:border-[#e50914] text-[13px] font-extrabold"
                  value={formData.discount}
                  onChange={e => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                  type="number"
                />
              </div>
              <div className="flex justify-between items-center text-[18px] text-gray-900 pt-3 border-t border-gray-100">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Actions sidebox */}
      <div className="lg:col-span-4">
        <div className="glass-card p-6 bg-white border border-gray-200/50 rounded-2xl space-y-4 shadow-sm sticky top-28">
          <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">Proposal Actions</h3>
          
          <div className="space-y-3">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="w-full flex items-center justify-center bg-[#e50914] hover:bg-red-700 text-white py-3.5 rounded-xl transition-all font-bold text-[14px] shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : quotationId ? 'Save Changes' : 'Generate Quotation'}
            </button>
            
            <button 
              onClick={handlePreview}
              className="w-full flex items-center justify-center gap-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 py-3 rounded-xl transition-all font-bold text-[13px] cursor-pointer shadow-sm"
            >
              <Eye className="w-4.5 h-4.5 text-gray-400" />
              Preview Quotation
            </button>

            <button 
              onClick={handleGeneratePDFButton}
              className="w-full flex items-center justify-center gap-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 py-3 rounded-xl transition-all font-bold text-[13px] cursor-pointer shadow-sm"
            >
              <Printer className="w-4.5 h-4.5 text-gray-400" />
              Download PDF Proposal
            </button>

            <button 
              onClick={handleCopyPaymentLink}
              className="w-full flex items-center justify-center gap-1 bg-white border border-gray-200 hover:bg-gray-50 text-[#e50914] py-3 rounded-xl transition-all font-bold text-[13px] cursor-pointer shadow-sm"
            >
              <LinkIcon className="w-4.5 h-4.5 text-[#e50914]" />
              Copy Payment Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
