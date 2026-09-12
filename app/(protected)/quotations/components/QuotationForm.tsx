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
  FileText, 
  X, 
  Briefcase, 
  Building,
  Check
} from 'lucide-react';
import { createQuotation, updateQuotation, getEventTypes, createEventType, getProjects, createProject } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AVAILABLE_TEMPLATES, generateQuotationHTML } from '@/lib/quotationTemplates';
import EventTypeSelect from '@/components/ui/EventTypeSelect';
import VenueLocationSelect from '@/components/ui/VenueLocationSelect';
import AutoSearchInput from '@/components/ui/AutoSearchInput';

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
  
  // Quick Create Project Case Modal State
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [projectModalName, setProjectModalName] = useState('');
  const [projectModalPhone, setProjectModalPhone] = useState('');
  const [projectModalEmail, setProjectModalEmail] = useState('');
  const [projectModalCompany, setProjectModalCompany] = useState('');
  const [projectModalLocation, setProjectModalLocation] = useState('');
  const [projectModalEventType, setProjectModalEventType] = useState('Wedding Ceremony');
  const [projectModalEventDate, setProjectModalEventDate] = useState('');
  const [projectModalTotalValue, setProjectModalTotalValue] = useState<number>(50000);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

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

  const openQuickCreateCaseModal = () => {
    setProjectModalName(formData.customerName || '');
    setProjectModalPhone(formData.phone || '');
    setProjectModalEmail(formData.email || '');
    setProjectModalLocation(formData.location || '');
    setProjectModalEventType(formData.eventType || 'Wedding Ceremony');
    setProjectModalEventDate(formData.bookingDate || '');
    setProjectModalTotalValue(grandTotal > 0 ? grandTotal : 50000);
    setIsCreateProjectModalOpen(true);
  };

  const handleQuickCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectModalName.trim() || !projectModalPhone.trim() || !projectModalEventType) {
      toast.error('Client Name, Phone, and Event Ceremony are required');
      return;
    }

    setIsCreatingProject(true);
    try {
      const newProj = await createProject({
        name: projectModalName.trim(),
        company: projectModalCompany.trim(),
        phone: projectModalPhone.trim(),
        email: projectModalEmail.trim(),
        location: projectModalLocation.trim(),
        eventType: projectModalEventType,
        eventDate: projectModalEventDate ? new Date(projectModalEventDate) : undefined,
        totalValue: Number(projectModalTotalValue) || 0,
        status: 'Lead',
      });

      setProjects((prev) => [newProj, ...prev]);
      setSelectedProjectId(newProj._id || newProj.id);

      // Sync formData with newly created project fields
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || newProj.name,
        phone: prev.phone || newProj.phone,
        email: prev.email || newProj.email,
        location: prev.location || newProj.location,
        eventType: prev.eventType || newProj.eventType,
        bookingDate: prev.bookingDate || (newProj.eventDate ? new Date(newProj.eventDate).toISOString().split('T')[0] : prev.bookingDate),
      }));

      setIsCreateProjectModalOpen(false);
      toast.success(`Project Case #${newProj.projectNumber || 'NEW'} created & linked!`);
    } catch (err) {
      console.error('Failed to create project case:', err);
      toast.error('Failed to create project case');
    } finally {
      setIsCreatingProject(false);
    }
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
    const activeProject = projects.find(p => (p._id || p.id) === selectedProjectId);
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

  const linkedProject = projects.find(p => (p._id || p.id) === selectedProjectId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full pb-12 font-sans text-[13px] text-gray-800 dark:text-gray-100">
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
              {AVAILABLE_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Template 1'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
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
              <EventTypeSelect 
                label="Event Ceremony / Type"
                value={formData.eventType}
                onChange={(val) => setFormData({ ...formData, eventType: val })}
                showManageButton={true}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Event Date</label>
              <input 
                className="w-full bg-gray-50/80 border border-gray-200/80 rounded-2xl py-3 px-3.5 focus:outline-none focus:border-[#e50914] text-[13px] font-semibold" 
                type="date"
                value={formData.bookingDate}
                onChange={e => setFormData({ ...formData, bookingDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <VenueLocationSelect
                label="Shoot Location / Venue"
                value={formData.location}
                onChange={(val) => setFormData({ ...formData, location: val })}
                showManageButton={true}
              />
            </div>

            {/* Link to Existing Project Case with Quick Create Option */}
            <div className="flex flex-col md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#e50914]" />
                  Link to Existing Project Case (Optional)
                </label>
                <div className="flex items-center gap-2">
                  {selectedProjectId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectId('');
                        toast.success('Unlinked from project case');
                      }}
                      className="text-[11px] font-bold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Unlink
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={openQuickCreateCaseModal}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e50914] hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-2.5 py-0.5 rounded-md transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Quick Create Case</span>
                  </button>
                </div>
              </div>

              {linkedProject && (
                <div className="mb-2 p-2.5 rounded-xl bg-red-50/70 border border-red-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                    <span className="font-bold text-xs text-gray-900">
                      Linked: {linkedProject.projectNumber || 'CASE'} - {linkedProject.name}
                    </span>
                    <span className="text-[10px] bg-red-100 text-[#e50914] font-bold px-2 py-0.5 rounded-md">
                      {linkedProject.status || 'Active'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-600">
                    ₹{Number(linkedProject.totalValue || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <AutoSearchInput
                value={selectedProjectId ? `${linkedProject?.projectNumber || ''} - ${linkedProject?.name || ''}` : ''}
                onChange={(val, opt) => {
                  if (opt?.data) {
                    const p = opt.data;
                    setSelectedProjectId(p.id || p._id);
                    // Auto-fill client details if empty
                    setFormData(prev => ({
                      ...prev,
                      customerName: prev.customerName || p.name || '',
                      phone: prev.phone || p.phone || '',
                      email: prev.email || p.email || '',
                      location: prev.location || p.location || '',
                      eventType: prev.eventType || p.eventType || 'Wedding Ceremony'
                    }));
                  } else if (!val) {
                    setSelectedProjectId('');
                  }
                }}
                options={projects.map(p => ({
                  value: p.id || p._id,
                  label: `${p.projectNumber || 'CASE'} - ${p.name}`,
                  sublabel: `${p.eventType} • ${p.location || 'Studio'} • ₹${Number(p.totalValue || 0).toLocaleString('en-IN')}`,
                  badge: p.status || 'Active',
                  badgeColor: p.status === 'Completed' ? 'emerald' : p.status === 'Booked' ? 'blue' : 'amber',
                  data: p
                }))}
                placeholder="Search case by Case ID, client name, or ritual..."
                allowCustom={false}
              />
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
                    <AutoSearchInput
                      label="Service Title"
                      value={service.name}
                      onChange={(val) => handleServiceChange(service.id, 'name', val)}
                      options={[
                        { label: 'Cinematic 4K Wedding Highlight Film', value: 'Cinematic 4K Wedding Highlight Film', badge: 'Cinema', badgeColor: 'red' },
                        { label: 'Traditional 4K Multi-cam Video Coverage', value: 'Traditional 4K Multi-cam Video Coverage', badge: 'Video', badgeColor: 'blue' },
                        { label: 'Candid & Artistic Couple Portraiture', value: 'Candid & Artistic Couple Portraiture', badge: 'Photo', badgeColor: 'purple' },
                        { label: 'Aerial 4K Drone Cinematic Package', value: 'Aerial 4K Drone Cinematic Package', badge: 'Drone', badgeColor: 'emerald' },
                        { label: 'Pre-Wedding Love Story Shoot (1 Full Day)', value: 'Pre-Wedding Love Story Shoot (1 Full Day)', badge: 'Package', badgeColor: 'amber' },
                        { label: 'Designer Leather Photobook Album (40 Pages)', value: 'Designer Leather Photobook Album (40 Pages)', badge: 'Album', badgeColor: 'purple' },
                        { label: 'Live LED Wall Streaming Setup', value: 'Live LED Wall Streaming Setup', badge: 'Live', badgeColor: 'gray' },
                        { label: 'Instagram Teaser Reel (60 Sec 9:16)', value: 'Instagram Teaser Reel (60 Sec 9:16)', badge: 'Social', badgeColor: 'red' },
                      ]}
                      placeholder="Type or select service item..."
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 flex flex-col">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Qty</label>
                    <input 
                      className="w-full bg-gray-50/80 border border-gray-200/80 rounded-2xl py-3 px-3.5 focus:outline-none focus:border-[#e50914] text-[13px] font-semibold" 
                      type="number"
                      min="1"
                      value={service.quantity}
                      onChange={e => handleServiceChange(service.id, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-8 md:col-span-4 flex flex-col">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Rate (₹)</label>
                    <input 
                      className="w-full bg-gray-50/80 border border-gray-200/80 rounded-2xl py-3 px-3.5 focus:outline-none focus:border-[#e50914] text-[13px] font-semibold" 
                      type="number"
                      value={service.price}
                      onChange={e => handleServiceChange(service.id, 'price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-1 flex justify-end pb-1.5">
                    <button 
                      onClick={() => handleRemoveService(service.id)}
                      disabled={services.length === 1}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col mt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                      Scope of Work / Deliverables Details
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Supports multiple lines & bullet lists (Press Enter for new line)
                    </span>
                  </div>
                  <textarea 
                    className="w-full bg-white dark:bg-[#16181c] border border-gray-200/90 dark:border-gray-700/80 rounded-xl p-3 focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-red-500/20 text-[12.5px] text-gray-700 dark:text-gray-200 transition-all resize-y min-h-[72px] font-normal leading-relaxed placeholder:text-gray-400/70 shadow-2xs" 
                    placeholder="e.g.&#10;• 1 Traditional Video 4K Ultra HD&#10;• 1 Cinematic Highlight Teaser (3-5 mins)&#10;• Full Raw Footage delivered on Cloud Drive&#10;• 2 Candid Photographers + 2 Cinematographers" 
                    value={service.description || ''}
                    onChange={e => handleServiceChange(service.id, 'description', e.target.value)}
                    rows={3}
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

      {/* Quick Create Project Case Modal */}
      {isCreateProjectModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-xl bg-white dark:bg-[#181a20] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 text-[#e50914] flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Quick Create Project Case
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    Create case record and link directly with this quotation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateProjectModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleQuickCreateProject} className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectModalName}
                    onChange={(e) => setProjectModalName(e.target.value)}
                    placeholder="e.g. Sambit Kumar"
                    className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={projectModalCompany}
                    onChange={(e) => setProjectModalCompany(e.target.value)}
                    placeholder="Optional agency / brand"
                    className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={projectModalPhone}
                    onChange={(e) => setProjectModalPhone(e.target.value)}
                    placeholder="+91 70089 12345"
                    className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={projectModalEmail}
                    onChange={(e) => setProjectModalEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>
              </div>

              <div>
                <EventTypeSelect
                  label="Ceremony / Event Type *"
                  value={projectModalEventType}
                  onChange={(val) => setProjectModalEventType(val)}
                  required
                />
              </div>

              <div>
                <VenueLocationSelect
                  label="Shoot Location / Venue *"
                  value={projectModalLocation}
                  onChange={(val) => setProjectModalLocation(val)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={projectModalEventDate}
                    onChange={(e) => setProjectModalEventDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Estimated Total Value (₹)
                  </label>
                  <input
                    type="number"
                    value={projectModalTotalValue}
                    onChange={(e) => setProjectModalTotalValue(parseFloat(e.target.value) || 0)}
                    placeholder="50000"
                    className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateProjectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProject}
                  className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                  {isCreatingProject ? 'Creating Case...' : 'Create & Link Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
