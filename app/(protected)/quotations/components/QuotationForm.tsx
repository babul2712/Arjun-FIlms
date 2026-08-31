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
  Link as LinkIcon
} from 'lucide-react';
import { createQuotation, updateQuotation, getEventTypes, createEventType, getProjects } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function QuotationForm({ initialData, quotationId, projectId }: { initialData?: any, quotationId?: string, projectId?: string }) {
  const router = useRouter();
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
          
          // Backwards compatibility fallbacks
          if (!parsed.sectionsOrder) parsed.sectionsOrder = ['header', 'client', 'services', 'payment', 'terms', 'footer'];
          if (!parsed.pageBgColor) parsed.pageBgColor = "#fdf6f6";
          if (!parsed.headerBgColor) parsed.headerBgColor = "#fef2f2";
          if (!parsed.footerBgColor) parsed.footerBgColor = parsed.accentColor || "#e50914";
          if (parsed.watermarkUrl === undefined) parsed.watermarkUrl = "https://cdn-icons-png.flaticon.com/512/685/685655.png";
          if (parsed.watermarkOpacity === undefined) parsed.watermarkOpacity = 0.05;

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
        await updateQuotation(quotationId, { ...formData, eventType: finalEventType, services, subTotal, grandTotal, projectId: selectedProjectId || undefined });
      } else {
        await createQuotation({ ...formData, eventType: finalEventType, services, subTotal, grandTotal, projectId: selectedProjectId || undefined });
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
    const servicesHtml = services.map((s: any) => {
      const details = (s.description || '')
        .split(/\r\n|\n|\r/)
        .filter((line: string) => line.trim())
        .map((line: string) => `<div style="font-size:11px; color:#555; margin-top:2px;">${line.trim()}</div>`)
        .join('');
      return `
      <tr>
        <td class="package" style="padding: 12px; border-bottom: 1px solid #eee;">
          <h4 style="margin:0 0 4px; font-size:15px; color:${templateConfig.accentColor};">${s.name || 'Service Item'}</h4>
          ${details}
        </td>
        <td style="text-align:center; padding:12px; font-size:14px; border-bottom: 1px solid #eee;">${s.quantity}</td>
        <td style="text-align:right; padding:12px; font-size:14px; border-bottom: 1px solid #eee;">₹${s.price.toLocaleString()}</td>
      </tr>
      `;
    }).join('');

    const termsHtml = (templateConfig.terms || []).map((term: string) => `
      <li>${term}</li>
    `).join('');

    // HTML Sections definitions
    const headerHtml = `
      <div class="header">
      <div>
      <h1>${templateConfig.studioName}</h1>
      <p>Ph: ${templateConfig.phone}</p>
      <p>Mail: ${templateConfig.email}</p>
      <p>${templateConfig.address}</p>
      </div>
      <div style="text-align:right">
      <p style="color:${templateConfig.accentColor};"><b>Quotation No:</b> ${quotationId ? quotationId.slice(-4) : Date.now().toString().slice(-4)}</p>
      <p style="color:${templateConfig.accentColor};"><b>Invoice Date:</b> ${new Date().toLocaleDateString()}</p>
      <p style="color:${templateConfig.accentColor};"><b>Booking Date:</b> ${formData.bookingDate ? new Date(formData.bookingDate).toLocaleDateString() : 'TBD'}</p>
      </div>
      </div>
    `;

    const clientHtml = `
      <div class="card">
      <h3>Quotation For</h3>
      <p style="margin:0;line-height:1.5;"><b>${formData.customerName || 'Client Name'}</b><br>Phone: ${formData.phone || '__________'}<br>Mail: ${formData.email || '__________'}<br>Address: ${formData.location || '__________'}</p>
      </div>
    `;

    const servicesTableHtml = `
      <table style="width:100%; border-collapse:collapse; margin-top:20px;">
      <thead>
      <tr style="background:#faf5ff; border-bottom: 2px solid ${templateConfig.accentColor};">
        <th style="padding:10px; color:${templateConfig.accentColor}; text-align:left;">Description</th>
        <th class="rate" style="padding:10px; color:${templateConfig.accentColor}; text-align:center;">Qty</th>
        <th class="subtotal" style="padding:10px; color:${templateConfig.accentColor}; text-align:right;">Subtotal</th>
      </tr>
      </thead>
      <tbody>
      ${servicesHtml}
      </tbody>
      </table>
      
      <table class="summary">
      <tr><td>Subtotal</td><td align="right">₹${subTotal.toLocaleString()}</td></tr>
      <tr><td>Discount</td><td align="right">₹${formData.discount || 0}</td></tr>
      <tr class="total"><td style="padding:10px;">Grand Total</td><td align="right" style="padding:10px;">₹${grandTotal.toLocaleString()}</td></tr>
      </table>
    `;

    const paymentScheduleHtml = `
      <div class="payment" style="margin-top:24px;">
      <h3>Payment Schedule & Account Info</h3>
      <p style="margin-bottom:12px; font-size:13px; line-height: 1.5; color:#555;"><b>Bank Details:</b><br/>Name: <b>${templateConfig.bankName}</b><br/>A/C No: <b>${templateConfig.bankAccount}</b><br/>IFSC: <b>${templateConfig.bankIfsc}</b></p>
      <div class="steps">
      <div class="step"><div class="pct" style="color:${templateConfig.accentColor};">50%</div><p><b>Booking</b></p><p>Advance Retainer</p></div>
      <div class="step"><div class="pct" style="color:${templateConfig.accentColor};">30%</div><p><b>Event Day</b></p><p>During Shoot</p></div>
      <div class="step"><div class="pct" style="color:${templateConfig.accentColor};">20%</div><p><b>Delivery</b></p><p>Before Final Handover</p></div>
      </div>
      </div>
    `;

    const termsConditionsHtml = `
      <div class="terms">
      <h3>Terms & Conditions</h3>
      <ol>
      ${termsHtml}
      </ol>
      </div>
    `;

    const footerHtml = `
      <div class="footer" style="background:${templateConfig.accentColor};">
      <div><b>Thank you for choosing ${templateConfig.studioName}!</b></div>
      <div style="text-align:right">📞 ${templateConfig.phone}</div>
      </div>
    `;

    const sectionsMap: Record<string, string> = {
      header: headerHtml,
      client: clientHtml,
      services: servicesTableHtml,
      payment: paymentScheduleHtml,
      terms: termsConditionsHtml,
      footer: footerHtml
    };

    const activeOrder = templateConfig.sectionsOrder && templateConfig.sectionsOrder.length > 0
      ? templateConfig.sectionsOrder
      : ['header', 'client', 'services', 'payment', 'terms', 'footer'];

    const headerContent = activeOrder.includes('header') ? headerHtml : '';
    const footerContent = activeOrder.includes('footer') ? footerHtml : '';
    const bodyContent = activeOrder
      .filter((sectionId: string) => sectionId !== 'header' && sectionId !== 'footer')
      .map((sectionId: string) => sectionsMap[sectionId])
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <title>Quotation - ${templateConfig.studioName}</title>
      <style>
      @page{size:A4;margin:10mm}
      *{box-sizing:border-box}
      body{margin:0;background:${templateConfig.pageBgColor || '#fdf6f6'};font-family:Arial,Helvetica,sans-serif;color:#333;padding:20px}
      .container{max-width:800px;margin:auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.05);border:1px solid #eee;display:flex;flex-direction:column;justify-content:space-between;min-height:98vh;position:relative;}
      .watermark{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:320px;height:320px;opacity:${templateConfig.watermarkOpacity !== undefined ? templateConfig.watermarkOpacity : 0.05};background-image:url('${templateConfig.watermarkUrl || ''}');background-repeat:no-repeat;background-position:center;background-size:contain;pointer-events:none;z-index:0;}
      .header{background:${templateConfig.headerBgColor || '#fdf2f8'};color:${templateConfig.accentColor};padding:24px;display:flex;justify-content:space-between;position:relative;z-index:1;}
      .header h1{margin:0;font-size:26px;font-weight:bold;}
      .header p{margin:4px 0;font-size:13px;color:#555;}
      .section{padding:20px;flex:1;position:relative;z-index:1;}
      .card{background:#faf5ff;border-left:5px solid ${templateConfig.accentColor};border-radius:10px;padding:14px; margin-bottom:16px;}
      .card h3{margin:0 0 8px;color:${templateConfig.accentColor};font-size:15px;}
      table{width:100%;border-collapse:collapse}
      th{background:#faf5ff;color:${templateConfig.accentColor};padding:10px;text-align:left}
      th.rate{text-align:center;width:100px;}
      th.subtotal{text-align:right;width:120px;}
      td{padding:12px;vertical-align:top}
      .summary{width:280px;margin-left:auto;margin-top:12px}
      .summary td{padding:8px}
      .total{background:${templateConfig.accentColor};color:#fff;font-weight:bold}
      .payment h3,.terms h3{color:${templateConfig.accentColor};margin:16px 0 10px}
      .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
      .step{background:#faf5ff;border:1px solid #ebd9fc;border-radius:10px;padding:10px;text-align:center}
      .step .pct{font-size:22px;font-weight:bold;color:${templateConfig.accentColor}}
      .step p{margin:4px 0;font-size:12px}
      .terms{background:#fdf8ff;border-left:5px solid ${templateConfig.accentColor};border-radius:10px;padding:12px;margin-top:15px}
      .terms ol{margin:0;padding-left:18px;font-size:12px;line-height:1.45;color:#555;}
      .footer{background:${templateConfig.footerBgColor || templateConfig.accentColor};color:#fff;padding:16px;display:flex;justify-content:space-between;font-size:12px;position:relative;z-index:1;}
      </style>
      </head>
      <body>
      <div class="container">
        ${templateConfig.watermarkUrl ? `<div class="watermark"></div>` : ''}
        ${headerContent}
        <div class="section">
          ${bodyContent}
        </div>
        ${footerContent}
      </div>
      </body>
      </html>
    `;
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
              <div key={service.id} className="grid grid-cols-12 gap-4 items-end bg-gray-50/50 p-4 rounded-xl border border-gray-100 relative">
                <div className="col-span-12 md:col-span-5 flex flex-col">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Service Title</label>
                  <input 
                    className="bg-transparent border-b border-gray-300 py-1.5 focus:outline-none focus:border-[#e50914] text-[14px]" 
                    placeholder="e.g. Cinematic Video Editing" 
                    value={service.name}
                    onChange={e => handleServiceChange(service.id, 'name', e.target.value)}
                    type="text"
                  />
                </div>
                <div className="col-span-4 md:col-span-2 flex flex-col">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Qty</label>
                  <input 
                    className="bg-transparent border-b border-gray-300 py-1.5 focus:outline-none focus:border-[#e50914] text-[14px]" 
                    value={service.quantity}
                    onChange={e => handleServiceChange(service.id, 'quantity', parseInt(e.target.value) || 0)}
                    type="number"
                    min="1"
                  />
                </div>
                <div className="col-span-6 md:col-span-3 flex flex-col">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Price (₹)</label>
                  <input 
                    className="bg-transparent border-b border-gray-300 py-1.5 focus:outline-none focus:border-[#e50914] text-[14px]" 
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
