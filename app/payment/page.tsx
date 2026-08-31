'use client';

import React, { useState } from 'react';
import { 
  QrCode, 
  AtSign, 
  Landmark, 
  Copy,
  CheckCircle2,
  AlertCircle,
  Camera,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { UploadButton } from '@/utils/uploadthing';
import { createPayment } from '@/app/actions';

export default function PaymentPage() {
  const [method, setMethod] = useState<'qr' | 'id' | 'bank'>('qr');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    amount: ''
  });
  const [screenshotUrl, setScreenshotUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotUrl) {
      toast.error('Please upload a payment screenshot first');
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
      toast.success('Payment submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit payment details');
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
        filename: 'Arjun_Photography_Invoice_and_Agreement.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).save();
      
      element.style.display = 'none';
      toast.success('PDF Downloaded Successfully');
    } catch (e) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#e4e4ff] to-[#fef0f7] font-sans text-[#1e2229] relative overflow-hidden">
        {/* Blurred background glow circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#ffd7f2]/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#e0e0fb]/30 rounded-full blur-3xl" />
        </div>

        <main className="relative z-10 w-full max-w-[500px]">
          <div className="bg-white/70 backdrop-blur-xl border border-white/45 shadow-[0_25px_50px_-12px_rgba(0,102,254,0.08)] rounded-[32px] p-8 md:p-10 flex flex-col items-center">
            
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            
            <h2 className="text-[22px] font-extrabold text-[#1a1c22] mb-2 tracking-tight">Invoice Generated</h2>
            <p className="text-gray-400 font-semibold mb-6 text-[13px] text-center">Your payment details have been received and a pending invoice has been generated.</p>
            
            <div className="w-full bg-white/50 border border-gray-250/20 p-5 rounded-2xl text-[13px] space-y-3 mb-6 shadow-sm">
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="text-gray-400 font-semibold">Client Name</span>
                <span className="font-extrabold text-[#1a1c22]">{formData.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="text-gray-400 font-semibold">Amount Received</span>
                <span className="font-extrabold text-[#1a1c22]">₹{formData.amount}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="text-gray-400 font-semibold">Invoice Status</span>
                <span className="bg-yellow-100 text-yellow-750 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase">PENDING VERIFICATION</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-400 font-semibold">Transaction Date</span>
                <span className="font-extrabold text-[#1a1c22]">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-full bg-[#0066fe] text-white py-4 rounded-xl text-[13.5px] font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all disabled:opacity-70 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? 'Generating PDF...' : 'Download Invoice & Agreement'}
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-white/60 text-gray-600 hover:text-gray-800 py-3.5 rounded-xl text-[13px] font-bold border border-gray-200/40 hover:bg-gray-100/60 transition-colors cursor-pointer"
              >
                Submit Another Payment
              </button>
            </div>
          </div>
        </main>

        {/* Hidden PDF Template */}
        <div id="pdf-agreement-container" style={{ display: 'none', width: '800px', padding: '40px', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif' }}>
          {/* Page 1: Invoice */}
          <div style={{ minHeight: '1050px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>PAYMENT RECEIPT</h1>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Client Name:</strong> {formData.customerName}</p>
            <p><strong>Phone:</strong> {formData.phone}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Amount Paid:</strong> ₹{formData.amount}</p>
            <p><strong>Payment Method:</strong> {method === 'qr' ? 'UPI QR' : method === 'id' ? 'UPI ID' : 'Bank Transfer'}</p>
            
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Payment Proof:</h3>
              {screenshotUrl && (
                <img src={screenshotUrl} alt="Payment Screenshot" style={{ maxWidth: '400px', border: '1px solid #ccc' }} />
              )}
            </div>
          </div>
          
          <div className="html2pdf__page-break"></div>

          {/* Page 2: Agreement */}
          <div style={{ minHeight: '1050px', paddingTop: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0' }}>ARJUN PHOTOGRAPHY</h2>
              <h3 style={{ fontSize: '18px', margin: '5px 0 0 0' }}>PHOTOGRAPHY & VIDEOGRAPHY AGREEMENT</h3>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '5px' }}>1. CLIENT & EVENT DETAILS</h4>
              <p><strong>Client Name(s):</strong> {formData.customerName}</p>
              <p><strong>Event Date & Time:</strong> TBD</p>
              <p><strong>Event Location:</strong> TBD</p>
              <p><strong>Services (Photo/Video):</strong> TBD</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '5px' }}>2. PAYMENT TERMS</h4>
              <p><strong>Total Contract Fee:</strong> TBD</p>
              <p><strong>Amount Paid:</strong> ₹{formData.amount}</p>
              <p><strong>Balance Due Date:</strong> TBD</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '5px' }}>3. TERMS & CONDITIONS</h4>
              <p style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Scope of Work:</strong> Arjun Photography agrees to provide photography and/or videography services as outlined in Section 1. Final edited deliverables will be provided to the Client within 4-6 weeks of the event date.
              </p>
              <p style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Cancellations & Rescheduling:</strong> If the Client cancels this agreement, the retainer fee is strictly non-refundable. Rescheduling is subject to studio availability; if the studio cannot accommodate the new date, the retainer is forfeited.
              </p>
              <p style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Copyright & Usage:</strong> Arjun Photography retains the legal copyright to all captured images and video footage. The Client is granted a personal use license to print and share the media. The Client may not apply additional filters or re-edit the final deliverables.
              </p>
            </div>

            <div style={{ marginTop: '50px' }}>
              <p style={{ fontSize: '14px' }}>By completing the payment online, the Client electronically agrees to these terms and conditions.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <div style={{ borderTop: '1px solid #000', width: '200px', paddingTop: '5px' }}>
                  <p style={{ margin: '0', fontSize: '14px' }}>Client Signature: <em>{formData.customerName}</em></p>
                  <p style={{ margin: '0', fontSize: '12px' }}>Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div style={{ borderTop: '1px solid #000', width: '200px', paddingTop: '5px' }}>
                  <p style={{ margin: '0', fontSize: '14px' }}>Arjun Photography</p>
                  <p style={{ margin: '0', fontSize: '12px' }}>Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gradient-to-br from-[#e4e4ff] to-[#fef0f7] font-sans text-[#1e2229] relative overflow-hidden">
      {/* Blurred background glow circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#ffd7f2]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#e0e0fb]/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-64 h-64 bg-[#daeaa1]/20 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 w-full max-w-[550px] px-2 py-8">
        
        {/* Header Section */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0066fe] flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <Camera className="text-white w-7 h-7" />
          </div>
          <h1 className="text-[26px] font-extrabold text-[#1a1c22] tracking-tight">Arjun Photography</h1>
          <p className="text-gray-400 font-semibold text-[13px] mt-0.5">Secure Studio Client Payment Gateway</p>
        </div>

        {/* The Main Glass Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/45 shadow-[0_25px_50px_-12px_rgba(0,102,254,0.08)] rounded-[32px] p-6 md:p-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Customer Details Section */}
            <div className="space-y-4">
              <h2 className="text-[11.5px] font-bold text-[#0066fe] uppercase tracking-widest border-b border-gray-200/50 dark:border-gray-800/10 pb-1.5">Client Particulars</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[9.5px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input 
                    value={formData.customerName} 
                    onChange={e => setFormData({...formData, customerName: e.target.value})} 
                    className="w-full bg-transparent border-b border-gray-300 py-2.5 focus:outline-none focus:border-[#0066fe] transition-all text-[14.5px] font-medium" 
                    placeholder="e.g. Johnathan Doe" 
                    required 
                    type="text"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[9.5px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <input 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    className="w-full bg-transparent border-b border-gray-300 py-2.5 focus:outline-none focus:border-[#0066fe] transition-all text-[14.5px] font-medium" 
                    placeholder="e.g. +91 98765 43210" 
                    required 
                    type="tel"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-[9.5px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <input 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="w-full bg-transparent border-b border-gray-300 py-2.5 focus:outline-none focus:border-[#0066fe] transition-all text-[14.5px] font-medium" 
                  placeholder="e.g. hello@example.com" 
                  required 
                  type="email"
                />
              </div>
            </div>

            {/* Amount Section */}
            <div className="bg-[#0066fe]/5 rounded-2xl p-5 border border-[#0066fe]/15">
              <div className="flex flex-col">
                <label className="text-[11.5px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Enter amount to be paid</label>
                <input 
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: e.target.value})} 
                  className="w-full bg-transparent border-b-2 border-[#0066fe]/30 py-1.5 focus:outline-none focus:border-[#0066fe] transition-colors text-[26px] font-semibold text-gray-900" 
                  placeholder="₹ 0" 
                  required 
                  type="number" 
                  min="1"
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h2 className="text-[11.5px] font-bold text-[#0066fe] uppercase tracking-widest border-b border-gray-200/50 pb-1.5">Select Payment Method</h2>
              
              <div className="grid grid-cols-3 gap-2.5">
                {/* UPI QR */}
                <button 
                  type="button"
                  onClick={() => setMethod('qr')}
                  className={`flex flex-col items-center justify-center p-3.5 border rounded-2xl gap-1.5 transition-all cursor-pointer ${
                    method === 'qr' 
                      ? 'border-[#0066fe] bg-[#0066fe]/10 text-[#0066fe] shadow-sm' 
                      : 'border-gray-200/60 bg-white/40 hover:bg-white/80 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <QrCode className="w-5.5 h-5.5 shrink-0" />
                  <span className="text-[11.5px] font-bold">UPI QR</span>
                </button>
                {/* UPI ID */}
                <button 
                  type="button"
                  onClick={() => setMethod('id')}
                  className={`flex flex-col items-center justify-center p-3.5 border rounded-2xl gap-1.5 transition-all cursor-pointer ${
                    method === 'id' 
                      ? 'border-[#0066fe] bg-[#0066fe]/10 text-[#0066fe] shadow-sm' 
                      : 'border-gray-200/60 bg-white/40 hover:bg-white/80 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <AtSign className="w-5.5 h-5.5 shrink-0" />
                  <span className="text-[11.5px] font-bold">UPI ID</span>
                </button>
                {/* Bank Transfer */}
                <button 
                  type="button"
                  onClick={() => setMethod('bank')}
                  className={`flex flex-col items-center justify-center p-3.5 border rounded-2xl gap-1.5 transition-all cursor-pointer ${
                    method === 'bank' 
                      ? 'border-[#0066fe] bg-[#0066fe]/10 text-[#0066fe] shadow-sm' 
                      : 'border-gray-200/60 bg-white/40 hover:bg-white/80 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Landmark className="w-5.5 h-5.5 shrink-0" />
                  <span className="text-[11.5px] font-bold">Bank Transfer</span>
                </button>
              </div>

              {/* Dynamic Payment Context */}
              <div className="mt-4 py-6 flex flex-col items-center bg-white/40 rounded-2xl border border-gray-250/20 min-h-[230px] justify-center shadow-inner">
                {method === 'qr' && (
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-40 bg-white p-2 rounded-2xl shadow-md mb-4 flex items-center justify-center border border-gray-200 overflow-hidden">
                      <img src="https://tr2q7weus9.ufs.sh/f/hShRC6YS0vczpfnwFYsg5QThwSZY2ybePavjuxtz03Vdk6Hm" alt="QR Code" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 text-center px-6">Scan this QR code using GPay, PhonePe, or Paytm</p>
                  </div>
                )}
                
                {method === 'id' && (
                  <div className="w-full px-6">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1 block">PhonePe/GooglePay Number</label>
                    <div className="flex items-center gap-2 mb-3">
                      <input className="w-full bg-transparent border-b border-gray-300 py-1.5 focus:outline-none focus:border-[#0066fe] transition-colors text-[22px] font-semibold text-gray-900" readOnly value="9938992712" type="text"/>
                      <button type="button" onClick={() => { navigator.clipboard.writeText('9938992712'); toast.success('Number copied!'); }} className="p-2 text-[#0066fe] hover:bg-[#0066fe]/10 rounded-xl transition-colors cursor-pointer shrink-0">
                        <Copy className="w-4.5 h-4.5" />
                      </button>
                    </div>
                    <p className="mt-2 text-[11.5px] text-gray-400 italic text-center flex items-center justify-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      Please transfer the amount to this number
                    </p>
                  </div>
                )}

                {method === 'bank' && (
                  <div className="w-full px-6 space-y-2.5">
                    <div className="w-full flex items-center justify-between border-b border-gray-200/50 pb-2.5">
                      <span className="text-[13px] text-gray-700 font-extrabold">Babul Samal</span>
                      <span className="text-[9px] font-black text-green-700 bg-green-50 border border-green-150 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified Account</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-150/40 py-1.5 group cursor-pointer hover:bg-white/40 transition-colors px-1 -mx-1 rounded" onClick={() => { navigator.clipboard.writeText('SBI'); toast.success('Bank name copied!'); }}>
                      <span className="text-[11px] font-bold text-gray-400 uppercase">Bank Name</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-gray-700 font-extrabold">SBI</span>
                        <Copy className="w-4 h-4 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-150/40 py-1.5 group cursor-pointer hover:bg-white/40 transition-colors px-1 -mx-1 rounded" onClick={() => { navigator.clipboard.writeText('39149567096'); toast.success('Account number copied!'); }}>
                      <span className="text-[11px] font-bold text-gray-400 uppercase">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-gray-700 font-extrabold">39149567096</span>
                        <Copy className="w-4 h-4 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-150/40 py-1.5 group cursor-pointer hover:bg-white/40 transition-colors px-1 -mx-1 rounded" onClick={() => { navigator.clipboard.writeText('SBIN0000068'); toast.success('IFSC copied!'); }}>
                      <span className="text-[11px] font-bold text-gray-400 uppercase">IFSC Code</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-gray-700 font-extrabold">SBIN0000068</span>
                        <Copy className="w-4 h-4 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Screenshot upload */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Upload Payment Screenshot</label>
              {screenshotUrl ? (
                <div className="flex items-center gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-250">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-[12.5px] font-bold text-emerald-850">Receipt proof uploaded successfully!</span>
                </div>
              ) : (
                <div className="w-full p-4 border-2 border-dashed border-gray-200/60 rounded-2xl bg-white/40 hover:bg-white/70 transition-colors flex justify-center">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        setScreenshotUrl(res[0].url);
                        toast.success("Screenshot uploaded");
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`Error uploading file: ${error.message}`);
                    }}
                    appearance={{
                      button: "bg-[#0066fe] hover:bg-blue-600 text-white text-[12px] font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm",
                      allowedContent: "hidden"
                    }}
                  />
                </div>
              )}
            </div>

            {/* Checklist terms */}
            <div className="bg-white/40 p-4 rounded-2xl border border-gray-250/20 space-y-1.5 text-[11.5px]">
              <h4 className="text-[10px] font-extrabold text-gray-800 uppercase tracking-widest">Retainer Terms</h4>
              <ul className="text-gray-450 font-semibold space-y-1 list-disc pl-4">
                <li>Booking Retainer Fee is strictly <strong>non-refundable</strong>.</li>
                <li>Agreement details and dates are electronically saved.</li>
              </ul>
            </div>

            {/* Confirm button */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0066fe] hover:bg-blue-600 text-white text-[14.5px] font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? 'Confirming Transaction...' : 'Submit Payment Proof'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
