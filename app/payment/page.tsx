'use client';

import React, { useState } from 'react';
import { 
  QrCode, 
  AtSign, 
  Landmark, 
  Copy,
  Check,
  CheckCircle2, 
  AlertCircle, 
  Download,
  ShieldCheck,
  UploadCloud,
  FileCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  User,
  Phone,
  Mail,
  IndianRupee,
  Lock,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { UploadButton } from '@/utils/uploadthing';
import { createPayment } from '@/app/actions';

export default function PaymentPage() {
  const [method, setMethod] = useState<'qr' | 'id' | 'bank'>('qr');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    amount: ''
  });
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [previewLocalUrl, setPreviewLocalUrl] = useState('');

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleQuickAmount = (val: number) => {
    setFormData(prev => ({ ...prev, amount: val.toString() }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setScreenshotUrl(result);
      setPreviewLocalUrl(result);
      toast.success('Payment receipt attached!');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotUrl) {
      toast.error('Please attach your payment receipt / screenshot');
      return;
    }
    
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPayment({
        ...formData,
        amount: Number(formData.amount),
        paymentMethod: method === 'qr' ? 'UPI QR' : method === 'id' ? 'UPI ID' : 'Bank Transfer',
        screenshotUrl,
        status: 'PENDING'
      });
      setIsSuccess(true);
      toast.success('Payment receipt submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit payment details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('pdf-agreement-container');
      if (!element) return;
      
      element.style.display = 'block';
      
      await html2pdf().from(element).set({
        margin: [15, 15],
        filename: `Arjun_Films_Receipt_${formData.customerName.replace(/\s+/g, '_') || 'Client'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).save();
      
      element.style.display = 'none';
      toast.success('Official Receipt Downloaded!');
    } catch (e) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#fdf6f6] text-[#1e2229] font-sans relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-[#e50914]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <main className="relative z-10 w-full max-w-xl animate-fade-in">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_25px_60px_-15px_rgba(0,102,254,0.12)] rounded-[36px] p-6 sm:p-10 flex flex-col items-center">
            
            {/* Success Emblem */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/25">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
            
            <span className="text-[11px] font-extrabold text-[#e50914] uppercase tracking-widest bg-[#fef2f2] px-3 py-1 rounded-full mb-2">
              Payment Recorded
            </span>
            <h2 className="text-[26px] font-black text-[#0a0b0d] tracking-tight text-center">
              Receipt & Invoice Generated
            </h2>
            <p className="text-gray-500 font-medium text-[13.5px] text-center mt-1.5 max-w-md">
              Thank you, <strong>{formData.customerName}</strong>! Your payment submission has been queued for instant verification by our studio manager.
            </p>
            
            {/* Summary Details Card */}
            <div className="w-full bg-[#f8fbff] border border-gray-200/70 p-5 sm:p-6 rounded-3xl text-[13px] space-y-3.5 my-6 shadow-xs">
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-3">
                <span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider">Client Name</span>
                <span className="font-extrabold text-[#0a0b0d] text-[14px]">{formData.customerName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-3">
                <span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider">Amount Paid</span>
                <span className="font-black text-[#e50914] text-[18px]">
                  ₹{Number(formData.amount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-3">
                <span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider">Payment Mode</span>
                <span className="font-bold text-gray-800">
                  {method === 'qr' ? 'UPI QR Code' : method === 'id' ? 'UPI Direct ID' : 'Bank Transfer (NEFT/IMPS)'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-3">
                <span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider">Verification Status</span>
                <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  PENDING VERIFICATION
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 text-[12px]">
                <span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider">Submission Date</span>
                <span className="font-bold text-gray-700">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3">
              <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-full bg-[#e50914] hover:bg-red-700 active:scale-98 text-white py-4 rounded-2xl text-[14px] font-bold shadow-lg shadow-red-500/25 transition-all disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4.5 h-4.5" />
                {isDownloading ? 'Generating Official PDF...' : 'Download Invoice & Agreement'}
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-white hover:bg-gray-50 active:scale-98 text-gray-700 py-3.5 rounded-2xl text-[13px] font-bold border border-gray-200 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-gray-400" />
                Submit Another Transaction
              </button>
            </div>

            <div className="flex items-center gap-2 mt-6 text-[11.5px] font-bold text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Arjun Films Official 256-bit Secure Gateway</span>
            </div>

          </div>
        </main>

        {/* Hidden PDF Template */}
        <div id="pdf-agreement-container" style={{ display: 'none', width: '800px', padding: '40px', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif' }}>
          {/* Page 1: Invoice */}
          <div style={{ minHeight: '1050px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e50914', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#0a0b0d', margin: 0 }}>ARJUN FILMS</h1>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '13px' }}>Professional Cinema & Photography Studio</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ backgroundColor: '#eaf2ff', color: '#e50914', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  PAYMENT RECEIPT
                </span>
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#666' }}>Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', color: '#666' }}>Client Name</td>
                  <td style={{ padding: '10px 0', fontWeight: 'bold', textAlign: 'right' }}>{formData.customerName}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', color: '#666' }}>Contact Phone</td>
                  <td style={{ padding: '10px 0', fontWeight: 'bold', textAlign: 'right' }}>{formData.phone}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', color: '#666' }}>Email Address</td>
                  <td style={{ padding: '10px 0', fontWeight: 'bold', textAlign: 'right' }}>{formData.email}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', color: '#666' }}>Amount Paid</td>
                  <td style={{ padding: '10px 0', fontWeight: 'bold', fontSize: '18px', color: '#e50914', textAlign: 'right' }}>₹{Number(formData.amount).toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', color: '#666' }}>Payment Method</td>
                  <td style={{ padding: '10px 0', fontWeight: 'bold', textAlign: 'right' }}>{method === 'qr' ? 'UPI QR Code' : method === 'id' ? 'UPI ID' : 'Bank Transfer'}</td>
                </tr>
              </tbody>
            </table>
            
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Payment Proof Screenshot:</h3>
              {screenshotUrl && (
                <img src={screenshotUrl} alt="Payment Proof" style={{ maxWidth: '380px', maxHeight: '450px', objectFit: 'contain', borderRadius: '12px', border: '1px solid #ddd' }} />
              )}
            </div>
          </div>
          
          <div className="html2pdf__page-break"></div>

          {/* Page 2: Agreement */}
          <div style={{ minHeight: '1050px', paddingTop: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0', color: '#0a0b0d' }}>ARJUN FILMS</h2>
              <h3 style={{ fontSize: '15px', margin: '5px 0 0 0', color: '#e50914' }}>PHOTOGRAPHY & CINEMATOGRAPHY SERVICE AGREEMENT</h3>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '5px' }}>1. CLIENT & EVENT DETAILS</h4>
              <p><strong>Client Name(s):</strong> {formData.customerName}</p>
              <p><strong>Contact:</strong> {formData.phone} | {formData.email}</p>
              <p><strong>Amount Remitted:</strong> ₹{Number(formData.amount).toLocaleString('en-IN')}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '5px' }}>2. TERMS & CONDITIONS</h4>
              <p style={{ marginBottom: '10px', fontSize: '13px', lineHeight: '1.6', color: '#444' }}>
                <strong>Retainer Policy:</strong> Advance booking retainer fee is strictly non-refundable and reserves production crew dates exclusively.
              </p>
              <p style={{ marginBottom: '10px', fontSize: '13px', lineHeight: '1.6', color: '#444' }}>
                <strong>Payment Schedule:</strong> 50% advance retainer to confirm dates, 30% during shoot execution, and remaining 20% prior to high-resolution final deliverables.
              </p>
              <p style={{ marginBottom: '10px', fontSize: '13px', lineHeight: '1.6', color: '#444' }}>
                <strong>Copyright:</strong> Arjun Films retains legal artistic copyright. The client is granted personal usage rights for private distribution and printing.
              </p>
            </div>

            <div style={{ marginTop: '50px' }}>
              <p style={{ fontSize: '13px', color: '#555' }}>By completing this online transaction, the client electronically executes and accepts this agreement.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <div style={{ borderTop: '1px solid #999', width: '220px', paddingTop: '8px' }}>
                  <p style={{ margin: '0', fontSize: '13px', fontWeight: 'bold' }}>Client: {formData.customerName}</p>
                  <p style={{ margin: '0', fontSize: '11px', color: '#666' }}>Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div style={{ borderTop: '1px solid #999', width: '220px', paddingTop: '8px' }}>
                  <p style={{ margin: '0', fontSize: '13px', fontWeight: 'bold' }}>Arjun Films</p>
                  <p style={{ margin: '0', fontSize: '11px', color: '#666' }}>Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-[#fdf6f6] font-sans text-[#1e2229] relative overflow-hidden">
      
      {/* Background Decorative Mesh / Blurred Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#e50914]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-[#fef2f2] rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] bg-[#e50914]/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 w-full max-w-5xl py-6">
        
        {/* Top Header Section */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative mb-3.5">
            <div className="w-20 h-20 rounded-3xl bg-white p-2.5 flex items-center justify-center shadow-xl shadow-red-500/10 border border-white/80 overflow-hidden">
              <img 
                src="/logo.jpeg" 
                alt="Arjun Films" 
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-md border-2 border-white" title="Verified Studio Gateway">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[28px] sm:text-[32px] font-black text-[#0a0b0d] tracking-tight">
              Arjun Films
            </h1>
            <span className="bg-[#fef2f2] text-[#e50914] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#fee2e2]">
              Verified Portal
            </span>
          </div>
          <p className="text-gray-500 font-semibold text-[13.5px] max-w-md">
            Secure client retainer & production shoot payment gateway.
          </p>
        </div>

        {/* The 2-Column Bento Card */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_30px_70px_-20px_rgba(0,102,254,0.12)] rounded-[36px] p-6 sm:p-8 lg:p-10">
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Left Column: Client Details & Amount & Upload (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Section 1: Client Particulars */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                  <h2 className="text-[11px] font-extrabold text-[#e50914] uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    1. Client Particulars
                  </h2>
                  <span className="text-[11px] text-gray-400 font-semibold">Required</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        value={formData.customerName} 
                        onChange={e => setFormData({...formData, customerName: e.target.value})} 
                        className="w-full bg-[#f8fbff] border border-gray-250/70 rounded-2xl pl-10 pr-3.5 py-3 focus:outline-none focus:border-[#e50914] focus:bg-white transition-all text-[14px] font-semibold text-gray-900" 
                        placeholder="e.g. Rahul Sharma" 
                        required 
                        type="text"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        className="w-full bg-[#f8fbff] border border-gray-250/70 rounded-2xl pl-10 pr-3.5 py-3 focus:outline-none focus:border-[#e50914] focus:bg-white transition-all text-[14px] font-semibold text-gray-900" 
                        placeholder="+91 98765 43210" 
                        required 
                        type="tel"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      className="w-full bg-[#f8fbff] border border-gray-250/70 rounded-2xl pl-10 pr-3.5 py-3 focus:outline-none focus:border-[#e50914] focus:bg-white transition-all text-[14px] font-semibold text-gray-900" 
                      placeholder="e.g. client@example.com" 
                      required 
                      type="email"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Amount to Pay */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                  <h2 className="text-[11px] font-extrabold text-[#e50914] uppercase tracking-widest flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    2. Payment Amount
                  </h2>
                  <span className="text-[11px] text-gray-400 font-semibold">INR (₹)</span>
                </div>

                <div className="bg-gradient-to-br from-[#eaf2ff] to-[#f3f7fd] rounded-3xl p-5 border border-[#fee2e2]/80 relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="text-[11px] font-extrabold text-[#e50914] uppercase tracking-wider block mb-1">
                      Enter Retainer or Total Amount
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[28px] font-black text-gray-400">₹</span>
                      <input 
                        value={formData.amount} 
                        onChange={e => setFormData({...formData, amount: e.target.value})} 
                        className="w-full bg-transparent text-[30px] font-black text-[#0a0b0d] focus:outline-none placeholder-gray-300 tracking-tight" 
                        placeholder="0" 
                        required 
                        type="number" 
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Quick Amount Chips */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#fee2e2]/70 relative z-10">
                    {[5000, 10000, 25000, 50000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleQuickAmount(val)}
                        className="px-3 py-1.5 rounded-xl bg-white text-gray-700 hover:bg-[#e50914] hover:text-white border border-[#fee2e2] text-[11.5px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        + ₹{val.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Upload Screenshot Proof */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                  <h2 className="text-[11px] font-extrabold text-[#e50914] uppercase tracking-widest flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" />
                    3. Attach Payment Screenshot
                  </h2>
                  <span className="text-[11px] text-gray-400 font-semibold">JPG / PNG / WebP</span>
                </div>

                {screenshotUrl ? (
                  <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl p-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="text-[13.5px] font-extrabold text-emerald-950">Payment Proof Attached!</h4>
                        <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">Ready to verify transaction</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setScreenshotUrl(''); setPreviewLocalUrl(''); }}
                      className="text-[11.5px] font-bold text-rose-600 hover:underline px-3 py-1.5 bg-white rounded-xl border border-rose-200 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 hover:border-[#e50914] transition-colors rounded-3xl p-6 bg-[#f8fbff] flex flex-col items-center justify-center text-center group cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 text-[#e50914] flex items-center justify-center shadow-md mb-3 group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <h4 className="text-[13.5px] font-extrabold text-gray-800">
                      Click to upload transaction screenshot
                    </h4>
                    <p className="text-[11.5px] text-gray-400 font-semibold mt-1">
                      Drag and drop or browse from gallery (GPay, PhonePe, or Netbanking receipt)
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Interactive Payment Station (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              
              <div>
                {/* Method Tabs Header */}
                <div className="flex items-center justify-between border-b border-gray-150 pb-2 mb-4">
                  <h2 className="text-[11px] font-extrabold text-[#e50914] uppercase tracking-widest flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5" />
                    Payment Channel
                  </h2>
                  <span className="text-[11px] text-emerald-600 font-extrabold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Instant UPI Live
                  </span>
                </div>

                {/* 3 Payment Mode Buttons */}
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#fee2e2]/40 rounded-2xl border border-gray-250/60 mb-5">
                  <button 
                    type="button"
                    onClick={() => setMethod('qr')}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      method === 'qr' 
                        ? 'bg-white text-[#e50914] shadow-md shadow-black/5 scale-[1.02]' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <QrCode className="w-4.5 h-4.5 mb-1" />
                    <span>UPI QR</span>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setMethod('id')}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      method === 'id' 
                        ? 'bg-white text-[#e50914] shadow-md shadow-black/5 scale-[1.02]' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <AtSign className="w-4.5 h-4.5 mb-1" />
                    <span>UPI ID</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setMethod('bank')}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      method === 'bank' 
                        ? 'bg-white text-[#e50914] shadow-md shadow-black/5 scale-[1.02]' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Landmark className="w-4.5 h-4.5 mb-1" />
                    <span>Bank IMPS</span>
                  </button>
                </div>

                {/* Dynamic Payment Context Card */}
                <div className="bg-[#f8fbff] rounded-3xl border border-gray-200/70 p-6 flex flex-col items-center text-center shadow-xs">
                  
                  {/* Mode 1: QR Code */}
                  {method === 'qr' && (
                    <div className="flex flex-col items-center w-full animate-fade-in">
                      <div className="relative p-3 bg-white rounded-3xl shadow-lg border border-gray-200 mb-4">
                        <div className="w-44 h-44 rounded-2xl overflow-hidden flex items-center justify-center">
                          <img 
                            src="https://tr2q7weus9.ufs.sh/f/hShRC6YS0vczpfnwFYsg5QThwSZY2ybePavjuxtz03Vdk6Hm" 
                            alt="Arjun Films QR" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <span className="text-[12px] font-black text-gray-900 tracking-tight">
                        ARJUN FILMS • BABUL SAMAL
                      </span>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5 mb-3">
                        Scan using Google Pay, PhonePe, Paytm, or BHIM
                      </p>

                      <div className="flex items-center gap-2 w-full bg-white p-2.5 rounded-2xl border border-gray-200">
                        <span className="text-[11.5px] font-mono font-bold text-gray-700 truncate pl-1 flex-1 text-left">
                          9938992712@ybl
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('9938992712@ybl', 'upi-qr', 'UPI ID')}
                          className="px-3 py-1.5 bg-[#e50914] text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
                        >
                          {copiedKey === 'upi-qr' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedKey === 'upi-qr' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: UPI ID */}
                  {method === 'id' && (
                    <div className="w-full text-left space-y-4 animate-fade-in">
                      <div>
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                          PhonePe / GPay Registered Number
                        </span>
                        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-200">
                          <span className="text-[16px] font-black text-gray-900 font-mono">
                            9938992712
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('9938992712', 'phone-num', 'Phone Number')}
                            className="px-3 py-1.5 bg-[#e50914] text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
                          >
                            {copiedKey === 'phone-num' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedKey === 'phone-num' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                          Direct VPA / UPI ID
                        </span>
                        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-200">
                          <span className="text-[14px] font-bold text-gray-900 font-mono">
                            9938992712@ybl
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('9938992712@ybl', 'upi-vpa', 'UPI ID')}
                            className="px-3 py-1.5 bg-[#e50914] text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
                          >
                            {copiedKey === 'upi-vpa' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedKey === 'upi-vpa' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/70 text-[11.5px] font-semibold text-amber-900 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Beneficiary Name: <strong>Babul Samal (Arjun Films)</strong>. Please upload proof after sending.</span>
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Bank Transfer */}
                  {method === 'bank' && (
                    <div className="w-full text-left space-y-3 animate-fade-in text-[12.5px]">
                      
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-400 font-bold text-[11px] uppercase">Account Holder</span>
                        <span className="font-extrabold text-gray-900">BABUL SAMAL</span>
                      </div>

                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-400 font-bold text-[11px] uppercase">Bank Name</span>
                        <span className="font-extrabold text-gray-900">State Bank of India (SBI)</span>
                      </div>

                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <div>
                          <span className="text-gray-400 font-bold text-[10px] uppercase block">Account Number</span>
                          <span className="font-mono font-black text-[14px] text-gray-900">39149567096</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('39149567096', 'bank-acc', 'Account Number')}
                          className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-[#e50914] rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedKey === 'bank-acc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedKey === 'bank-acc' ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <div>
                          <span className="text-gray-400 font-bold text-[10px] uppercase block">IFSC Code</span>
                          <span className="font-mono font-black text-[14px] text-[#e50914]">SBIN0000068</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('SBIN0000068', 'bank-ifsc', 'IFSC Code')}
                          className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-[#e50914] rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedKey === 'bank-ifsc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedKey === 'bank-ifsc' ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-gray-400 font-bold text-[11px] uppercase">Branch</span>
                        <span className="font-bold text-gray-700">Bhubaneswar Main Branch</span>
                      </div>

                    </div>
                  )}

                </div>
              </div>

              {/* Submit Payment Proof Button */}
              <div className="space-y-3 pt-2">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#e50914] hover:bg-red-700 active:scale-98 text-white text-[15px] font-bold py-4 rounded-2xl shadow-xl shadow-red-500/25 transition-all disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>{isSubmitting ? 'Recording Transaction...' : 'Submit Payment Proof'}</span>
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[11.5px] font-semibold text-gray-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit SSL Encrypted Studio Verification</span>
                </div>
              </div>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}
