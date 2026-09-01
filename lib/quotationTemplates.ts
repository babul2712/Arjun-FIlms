export interface TemplateOption {
  id: string;
  name: string;
  badge: string;
  description: string;
}

export const AVAILABLE_TEMPLATES: TemplateOption[] = [
  {
    id: 'invoice1',
    name: 'Template 1 (Neat Minimal Studio)',
    badge: 'Neat & Clean (Reference 1)',
    description: 'Modern editorial layout with bold title, circular studio logo, lined pricing table, handwritten signature & cursive Thank You.'
  },
  {
    id: 'invoice3',
    name: 'Template 3 (Corporate Modern Crimson)',
    badge: 'Liceria & Co. Style (Reference 2)',
    description: 'High-contrast corporate design with bold red INVOICE title, dark-header striped table, 3-badge contact footer, and curved crimson wave.'
  },
  {
    id: 'classic',
    name: 'Template 2 (Modern Bento Cards)',
    badge: 'Studio Bento',
    description: 'Segmented bento card boxes with 50%/30%/20% payment milestone schedule badges.'
  }
];

export interface QuotationData {
  quotationId?: string;
  customerName: string;
  phone: string;
  email: string;
  location: string;
  bookingDate: string;
  eventType: string;
  discount: number;
  paymentTerms?: string;
  termsConditions?: string;
  projectNumber?: string;
  services: Array<{
    id?: string;
    name: string;
    description?: string;
    quantity: number;
    price: number;
  }>;
  subTotal: number;
  grandTotal: number;
  templateConfig?: {
    studioName?: string;
    phone?: string;
    email?: string;
    address?: string;
    accentColor?: string;
    bankName?: string;
    bankAccount?: string;
    bankIfsc?: string;
    terms?: string[];
    sectionsOrder?: string[];
    pageBgColor?: string;
    headerBgColor?: string;
    footerBgColor?: string;
    watermarkUrl?: string;
    watermarkOpacity?: number;
  };
}

/**
 * Generate Invoice 1 (Pixel-perfect replica of invoice-template-in-neat-750px.png)
 */
export function generateInvoice1HTML(data: QuotationData): string {
  const cfg = data.templateConfig || {};
  const accentColor = cfg.accentColor || '#e50914';
  const studioName = cfg.studioName || 'ARJUN FILMS';
  const studioPhone = cfg.phone || '+91 7788992712';
  const studioEmail = cfg.email || 'arjunphotographyyy@gmail.com';
  const studioAddress = cfg.address || 'Bhubaneswar, Odisha - 751030';
  const bankName = cfg.bankName || 'State Bank of India';
  const bankAccount = cfg.bankAccount || '39149567096';
  const bankIfsc = cfg.bankIfsc || 'SBIN0000068';
  
  let resolvedLogo = cfg.watermarkUrl;
  if (!resolvedLogo || resolvedLogo.includes('flaticon.com') || resolvedLogo.includes('685655')) {
    resolvedLogo = '/logo.jpeg';
  }
  if (typeof window !== 'undefined' && resolvedLogo.startsWith('/')) {
    resolvedLogo = window.location.origin + resolvedLogo;
  }
  const logoUrl = resolvedLogo;

  const invoiceNo = data.quotationId ? data.quotationId.slice(-4).toUpperCase() : Math.floor(1000 + Math.random() * 9000).toString();
  const invoiceDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const eventDate = data.bookingDate 
    ? new Date(data.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'TBD';

  const dueDate = data.bookingDate
    ? new Date(data.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const poNumber = data.projectNumber || `ARJ-${invoiceNo}`;

  const rowsHtml = data.services.map((item, idx) => {
    const qty = item.quantity || 1;
    const unitPrice = Number(item.price) || 0;
    const amount = qty * unitPrice;
    const descriptionSubLines = (item.description || '')
      .split(/\r\n|\n|\r/)
      .filter(l => l.trim())
      .map(l => `<div style="font-size: 11.5px; color: #666; font-weight: normal; margin-top: 2px;">${l.trim()}</div>`)
      .join('');

    return `
      <tr>
        <td style="padding: 13px 8px; text-align: center; font-size: 13px; font-weight: 700; color: #222; vertical-align: top;">${qty}</td>
        <td style="padding: 13px 12px; font-size: 13px; font-weight: 700; color: #111; vertical-align: top;">
          ${item.name || 'Service Item'}
          ${descriptionSubLines}
        </td>
        <td style="padding: 13px 8px; text-align: right; font-size: 13px; font-weight: 600; color: #333; vertical-align: top;">
          ${unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td style="padding: 13px 8px; text-align: right; font-size: 13px; font-weight: 700; color: #111; vertical-align: top;">
          ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    `;
  }).join('');

  const termsListHtml = (cfg.terms && cfg.terms.length > 0 ? cfg.terms : [
    "Payment is due within 15 days of invoice date.",
    "50% advance retainer is required to lock booking dates.",
    "Remaining balance must be cleared before final delivery."
  ]).map(t => `<div style="margin-bottom: 4px; font-size: 12px; color: #444; line-height: 1.45;">• ${t}</div>`).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${data.customerName || 'Client'}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #111827;
      padding: 30px;
      -webkit-print-color-adjust: exact;
    }
    .invoice-container {
      max-width: 780px;
      margin: 0 auto;
      background: #ffffff;
      padding: 20px 10px;
    }
    .header-table {
      width: 100%;
      margin-bottom: 28px;
    }
    .main-title {
      font-size: 46px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #1a253c;
      line-height: 1;
      font-family: -apple-system, BlinkMacSystemFont, "Arial Black", sans-serif;
    }
    .studio-meta {
      margin-top: 14px;
      font-size: 13px;
      line-height: 1.55;
      color: #374151;
    }
    .studio-name {
      font-weight: 800;
      color: #111827;
      font-size: 14px;
    }
    .logo-circle {
      width: 92px;
      height: 92px;
      border-radius: 50%;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      margin-left: auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .logo-circle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    .meta-grid {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 28px;
      padding-top: 6px;
    }
    .meta-col {
      flex: 1;
      font-size: 12.5px;
      line-height: 1.45;
    }
    .meta-label {
      font-size: 12.5px;
      font-weight: 900;
      color: #1a253c;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .meta-value {
      font-weight: 700;
      color: #111827;
    }
    .meta-sub {
      color: #4b5563;
      margin-top: 2px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    .items-table th {
      padding: 10px 8px;
      font-size: 12.5px;
      font-weight: 900;
      color: #1a253c;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border-top: 2px solid ${accentColor};
      border-bottom: 2px solid ${accentColor};
    }
    .totals-wrap {
      width: 280px;
      margin-left: auto;
      margin-top: 16px;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    .totals-wrap td {
      padding: 6px 8px;
    }
    .totals-total {
      font-size: 18px;
      font-weight: 900;
      color: #1a253c;
      padding-top: 10px !important;
    }
    .signature-wrap {
      margin-top: 36px;
      margin-bottom: 20px;
      text-align: right;
      padding-right: 20px;
    }
    .signature-script {
      font-family: 'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive;
      font-size: 38px;
      color: #1a253c;
      transform: rotate(-3deg);
      display: inline-block;
    }
    .footer-grid {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 30px;
      padding-top: 18px;
    }
    .thankyou-text {
      font-family: 'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive;
      font-size: 54px;
      font-weight: bold;
      color: #1a253c;
      line-height: 1;
    }
    .terms-box {
      border-left: 3px solid ${accentColor};
      padding-left: 14px;
      max-width: 380px;
      font-size: 12px;
    }
    .terms-title {
      font-size: 12.5px;
      font-weight: 900;
      color: ${accentColor};
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .bank-info {
      margin-top: 10px;
      color: #374151;
      line-height: 1.5;
    }
    .bank-info strong {
      color: #111827;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    
    <!-- Top Header -->
    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <h1 class="main-title">INVOICE</h1>
          <div class="studio-meta">
            <div class="studio-name">${studioName}</div>
            <div>${studioAddress}</div>
            <div>Ph: ${studioPhone} • ${studioEmail}</div>
          </div>
        </td>
        <td style="vertical-align: top; text-align: right; width: 120px;">
          <div class="logo-circle">
            <img src="${logoUrl}" alt="${studioName}" />
          </div>
        </td>
      </tr>
    </table>

    <!-- 4-Column Metadata Block -->
    <div class="meta-grid">
      <!-- Bill To -->
      <div class="meta-col">
        <div class="meta-label">BILL TO</div>
        <div class="meta-value">${data.customerName || 'Client Name'}</div>
        <div class="meta-sub">${data.location || 'Client Address'}</div>
        <div class="meta-sub">${data.phone || ''}</div>
      </div>

      <!-- Ship To / Event -->
      <div class="meta-col">
        <div class="meta-label">EVENT / SHOOT</div>
        <div class="meta-value">${data.eventType || 'Event Shoot'}</div>
        <div class="meta-sub">Date: ${eventDate}</div>
        <div class="meta-sub">Venue: ${data.location || 'Studio'}</div>
      </div>

      <!-- Invoice Details Column 1 -->
      <div class="meta-col" style="text-align: right;">
        <div class="meta-label">INVOICE #</div>
        <div class="meta-value">IN-${invoiceNo}</div>
        
        <div class="meta-label" style="margin-top: 10px;">INVOICE DATE</div>
        <div class="meta-value">${invoiceDate}</div>
      </div>

      <!-- Invoice Details Column 2 -->
      <div class="meta-col" style="text-align: right;">
        <div class="meta-label">P.O.#</div>
        <div class="meta-value">${poNumber}</div>
        
        <div class="meta-label" style="margin-top: 10px;">DUE DATE</div>
        <div class="meta-value">${dueDate}</div>
      </div>
    </div>

    <!-- Line Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50px; text-align: center;">QTY</th>
          <th style="text-align: left;">DESCRIPTION</th>
          <th style="width: 140px; text-align: right;">UNIT PRICE</th>
          <th style="width: 140px; text-align: right;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <!-- Totals Table -->
    <table class="totals-wrap">
      <tr>
        <td style="font-weight: 600; color: #4b5563;">Subtotal</td>
        <td style="text-align: right; font-weight: 700; color: #111;">
          ₹${data.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
      ${data.discount > 0 ? `
      <tr>
        <td style="font-weight: 600; color: #4b5563;">Discount</td>
        <td style="text-align: right; font-weight: 700; color: ${accentColor};">
          -₹${data.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
      ` : ''}
      <tr style="border-top: 1px solid #e5e7eb;">
        <td class="totals-total">TOTAL</td>
        <td class="totals-total" style="text-align: right;">
          ₹${data.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    </table>

    <!-- Handwritten Signature -->
    <div class="signature-wrap">
      <div class="signature-script">
        ${studioName.includes('ARJUN') ? 'Babul Samal' : studioName}
      </div>
      <div style="font-size: 11px; color: #6b7280; font-weight: 600; margin-top: 2px;">Authorized Signature</div>
    </div>

    <!-- Bottom Thank You & Terms Bar -->
    <div class="footer-grid">
      <!-- Cursive Thank You -->
      <div class="thankyou-text">
        Thank you
      </div>

      <!-- Terms & Bank Details -->
      <div class="terms-box">
        <div class="terms-title">TERMS & CONDITIONS</div>
        ${termsListHtml}
        <div class="bank-info">
          <div><strong>${bankName}</strong></div>
          <div>Account Number: <strong>${bankAccount}</strong></div>
          <div>IFSC / Routing: <strong>${bankIfsc}</strong></div>
        </div>
      </div>
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Generate Template 2 (Classic Modern Bento Card layout)
 */
export function generateClassicHTML(data: QuotationData): string {
  const cfg = data.templateConfig || {};
  const accentColor = cfg.accentColor || '#e50914';
  const studioName = cfg.studioName || 'ARJUN FILMS';
  const studioPhone = cfg.phone || '+91 7788992712';
  const studioEmail = cfg.email || 'arjunphotographyyy@gmail.com';
  const studioAddress = cfg.address || 'Bhubaneswar, Odisha - 751030';
  const bankName = cfg.bankName || 'BABUL SAMAL';
  const bankAccount = cfg.bankAccount || '39149567096';
  const bankIfsc = cfg.bankIfsc || 'SBIN0000068';

  const servicesHtml = data.services.map((s: any) => {
    const details = (s.description || '')
      .split(/\r\n|\n|\r/)
      .filter((line: string) => line.trim())
      .map((line: string) => `<div style="font-size:11px; color:#555; margin-top:2px;">${line.trim()}</div>`)
      .join('');
    return `
    <tr>
      <td class="package" style="padding: 12px; border-bottom: 1px solid #eee;">
        <h4 style="margin:0 0 4px; font-size:15px; color:${accentColor};">${s.name || 'Service Item'}</h4>
        ${details}
      </td>
      <td style="text-align:center; padding:12px; font-size:14px; border-bottom: 1px solid #eee;">${s.quantity}</td>
      <td style="text-align:right; padding:12px; font-size:14px; border-bottom: 1px solid #eee;">₹${(s.price || 0).toLocaleString()}</td>
    </tr>
    `;
  }).join('');

  const termsHtml = (cfg.terms || [
    "50% advance retainer is required to lock dates.",
    "30% payment is due during the event execution.",
    "Remaining 20% must be paid before final photo delivery.",
    "Booking retainer is non-refundable."
  ]).map((term: string) => `<li>${term}</li>`).join('');

  const headerHtml = `
    <div class="header">
      <div>
        <h1>${studioName}</h1>
        <p>Ph: ${studioPhone}</p>
        <p>Mail: ${studioEmail}</p>
        <p>${studioAddress}</p>
      </div>
      <div style="text-align:right">
        <p style="color:${accentColor};"><b>Quotation No:</b> ${data.quotationId ? data.quotationId.slice(-4) : 'NEW'}</p>
        <p style="color:${accentColor};"><b>Invoice Date:</b> ${new Date().toLocaleDateString()}</p>
        <p style="color:${accentColor};"><b>Booking Date:</b> ${data.bookingDate ? new Date(data.bookingDate).toLocaleDateString() : 'TBD'}</p>
      </div>
    </div>
  `;

  const clientHtml = `
    <div class="card">
      <h3>Quotation For</h3>
      <p style="margin:0;line-height:1.5;"><b>${data.customerName || 'Client Name'}</b><br>Phone: ${data.phone || '__________'}<br>Mail: ${data.email || '__________'}<br>Address: ${data.location || '__________'}</p>
    </div>
  `;

  const servicesTableHtml = `
    <table style="width:100%; border-collapse:collapse; margin-top:20px;">
      <thead>
        <tr style="background:#faf5ff; border-bottom: 2px solid ${accentColor};">
          <th style="padding:10px; color:${accentColor}; text-align:left;">Description</th>
          <th class="rate" style="padding:10px; color:${accentColor}; text-align:center;">Qty</th>
          <th class="subtotal" style="padding:10px; color:${accentColor}; text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${servicesHtml}
      </tbody>
    </table>
    
    <table class="summary">
      <tr><td>Subtotal</td><td align="right">₹${data.subTotal.toLocaleString()}</td></tr>
      <tr><td>Discount</td><td align="right">₹${data.discount || 0}</td></tr>
      <tr class="total"><td style="padding:10px;">Grand Total</td><td align="right" style="padding:10px;">₹${data.grandTotal.toLocaleString()}</td></tr>
    </table>
  `;

  const paymentScheduleHtml = `
    <div class="payment" style="margin-top:24px;">
      <h3>Payment Schedule & Account Info</h3>
      <p style="margin-bottom:12px; font-size:13px; line-height: 1.5; color:#555;"><b>Bank Details:</b><br/>Name: <b>${bankName}</b><br/>A/C No: <b>${bankAccount}</b><br/>IFSC: <b>${bankIfsc}</b></p>
      <div class="steps">
        <div class="step"><div class="pct" style="color:${accentColor};">50%</div><p><b>Booking</b></p><p>Advance Retainer</p></div>
        <div class="step"><div class="pct" style="color:${accentColor};">30%</div><p><b>Event Day</b></p><p>During Shoot</p></div>
        <div class="step"><div class="pct" style="color:${accentColor};">20%</div><p><b>Delivery</b></p><p>Before Final Handover</p></div>
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
    <div class="footer" style="background:${cfg.footerBgColor || accentColor};">
      <div><b>Thank you for choosing ${studioName}!</b></div>
      <div style="text-align:right">📞 ${studioPhone}</div>
    </div>
  `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quotation - ${studioName}</title>
  <style>
    @page{size:A4;margin:10mm}
    *{box-sizing:border-box}
    body{margin:0;background:${cfg.pageBgColor || '#fdf6f6'};font-family:Arial,Helvetica,sans-serif;color:#333;padding:20px}
    .container{max-width:800px;margin:auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.05);border:1px solid #eee;display:flex;flex-direction:column;justify-content:space-between;min-height:98vh;position:relative;}
    .watermark{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:320px;height:320px;opacity:${cfg.watermarkOpacity !== undefined ? cfg.watermarkOpacity : 0.05};background-image:url('${cfg.watermarkUrl || '/logo.jpeg'}');background-repeat:no-repeat;background-position:center;background-size:contain;pointer-events:none;z-index:0;}
    .header{background:${cfg.headerBgColor || '#fef2f2'};color:${accentColor};padding:24px;display:flex;justify-content:space-between;position:relative;z-index:1;}
    .header h1{margin:0;font-size:26px;font-weight:bold;}
    .header p{margin:4px 0;font-size:13px;color:#555;}
    .section{padding:20px;flex:1;position:relative;z-index:1;}
    .card{background:#faf5ff;border-left:5px solid ${accentColor};border-radius:10px;padding:14px; margin-bottom:16px;}
    .card h3{margin:0 0 8px;color:${accentColor};font-size:15px;}
    table{width:100%;border-collapse:collapse}
    th{background:#faf5ff;color:${accentColor};padding:10px;text-align:left}
    th.rate{text-align:center;width:100px;}
    th.subtotal{text-align:right;width:120px;}
    td{padding:12px;vertical-align:top}
    .summary{width:280px;margin-left:auto;margin-top:12px}
    .summary td{padding:8px}
    .total{background:${accentColor};color:#fff;font-weight:bold}
    .payment h3,.terms h3{color:${accentColor};margin:16px 0 10px}
    .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    .step{background:#faf5ff;border:1px solid #ebd9fc;border-radius:10px;padding:10px;text-align:center}
    .step .pct{font-size:22px;font-weight:bold;color:${accentColor}}
    .step p{margin:4px 0;font-size:12px}
    .terms{background:#fdf8ff;border-left:5px solid ${accentColor};border-radius:10px;padding:12px;margin-top:15px}
    .terms ol{margin:0;padding-left:18px;font-size:12px;line-height:1.45;color:#555;}
    .footer{background:${cfg.footerBgColor || accentColor};color:#fff;padding:16px;display:flex;justify-content:space-between;font-size:12px;position:relative;z-index:1;}
  </style>
</head>
<body>
  <div class="container">
    ${cfg.watermarkUrl ? `<div class="watermark"></div>` : ''}
    ${headerHtml}
    <div class="section">
      ${clientHtml}
      ${servicesTableHtml}
      ${paymentScheduleHtml}
      ${termsConditionsHtml}
    </div>
    ${footerHtml}
  </div>
</body>
</html>
  `;
}

/**
 * Generate Invoice 3 (Corporate Modern Crimson - Liceria & Co. Replica)
 * Pixel-perfect match to Screenshot 2026-09-02 at 12.03.32 AM.png
 */
export function generateInvoice3HTML(data: QuotationData): string {
  const cfg = data.templateConfig || {};
  const studioName = cfg.studioName || 'ARJUN FILMS';
  const studioPhone = cfg.phone || '+91 7788992712';
  const studioEmail = cfg.email || 'arjunphotographyyy@gmail.com';
  const studioAddress = cfg.address || 'Bhubaneswar, Odisha - 751030';
  const bankName = cfg.bankName || 'State Bank of India';
  const bankAccount = cfg.bankAccount || '39149567096';
  const bankIfsc = cfg.bankIfsc || 'SBIN0000068';
  
  let resolvedLogo = cfg.watermarkUrl;
  if (!resolvedLogo || resolvedLogo.includes('flaticon.com') || resolvedLogo.includes('685655')) {
    resolvedLogo = '/logo.jpeg';
  }
  if (typeof window !== 'undefined' && resolvedLogo.startsWith('/')) {
    resolvedLogo = window.location.origin + resolvedLogo;
  }

  const invoiceRaw = data.quotationId ? data.quotationId.slice(-4).replace(/\D/g, '') : '2712';
  const invoiceFormatted = `0000${invoiceRaw.padStart(4, '0')}`.slice(-7);
  
  const invoiceDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const eventDate = data.bookingDate 
    ? new Date(data.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : invoiceDate;

  // Table rows HTML with alternating zebra striping
  const rowsHtml = data.services.map((item, idx) => {
    const qty = item.quantity || 1;
    const unitPrice = Number(item.price) || 0;
    const total = qty * unitPrice;
    const isEven = idx % 2 === 0;
    const rowBg = isEven ? '#f1f3f5' : '#ffffff';

    const descLines = item.description 
      ? item.description.split('\n').map(l => l.trim()).filter(Boolean)
      : [];

    return `
      <tr style="background-color: ${rowBg}; border-bottom: 1px solid #e9ecef;">
        <td style="padding: 13px 18px; vertical-align: top;">
          <div style="font-weight: 700; color: #1e293b; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.3px;">
            ${item.name || 'SERVICE LINE ITEM'}
          </div>
          ${descLines.length > 0 ? `
            <div style="margin-top: 4px; font-size: 11px; color: #64748b; line-height: 1.45;">
              ${descLines.map(d => `<div>• ${d.replace(/^[•\-\*]\s*/, '')}</div>`).join('')}
            </div>
          ` : ''}
        </td>
        <td style="padding: 13px 18px; text-align: right; vertical-align: top; font-size: 12.5px; color: #334155; font-weight: 500;">
          ₹${unitPrice.toLocaleString('en-IN')}
        </td>
        <td style="padding: 13px 18px; text-align: center; vertical-align: top; font-size: 12.5px; color: #334155; font-weight: 600;">
          ${qty}
        </td>
        <td style="padding: 13px 18px; text-align: right; vertical-align: top; font-size: 12.5px; color: #1e293b; font-weight: 700;">
          ₹${total.toLocaleString('en-IN')}
        </td>
      </tr>
    `;
  }).join('');

  const subTotal = Number(data.subTotal) || 0;
  const discount = Number(data.discount) || 0;
  const grandTotal = Number(data.grandTotal) || (subTotal - discount);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${studioName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 24px 0;
      display: flex;
      justify-content: center;
    }
    .invoice-card {
      width: 780px;
      min-height: 1100px;
      background: #ffffff;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .main-body {
      padding: 48px 50px 24px 50px;
      flex: 1;
    }
  </style>
</head>
<body>

<div class="invoice-card">
  <div class="main-body">
    
    <!-- Top Header: Logo/Studio (Left) & Giant Red INVOICE (Right) -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 24px;">
      
      <!-- Left: Brand Logo & Title -->
      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="width: 46px; height: 46px; border-radius: 8px; overflow: hidden; background: #e50914; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(229,9,20,0.25);">
          <img src="${resolvedLogo}" alt="Studio Logo" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
        </div>
        <div>
          <h1 style="font-size: 20px; font-weight: 900; color: #1e293b; letter-spacing: 0.5px; text-transform: uppercase; margin: 0; font-family: 'Arial Black', Arial, sans-serif;">
            ${studioName}
          </h1>
          <p style="font-size: 11.5px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">
            Photography & Cinema
          </p>
        </div>
      </div>

      <!-- Right: Bold Red INVOICE Title -->
      <div>
        <h2 style="font-size: 42px; font-weight: 900; color: #e50914; letter-spacing: 1px; margin: 0; text-transform: uppercase; line-height: 1; font-family: 'Arial Black', Arial, sans-serif;">
          INVOICE
        </h2>
      </div>
    </div>

    <!-- Client Info (Left) & Invoice Meta (Right) -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 28px;">
      <!-- Left Client Meta -->
      <div style="line-height: 1.45;">
        <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">
          ${data.customerName || 'Client Name'}
        </h3>
        <p style="font-size: 12px; color: #64748b; font-weight: 500;">
          Event Date: <span style="color: #334155; font-weight: 700;">${eventDate}</span>
        </p>
        <p style="font-size: 12px; color: #64748b; font-weight: 500; margin-top: 2px;">
          ${data.location || 'Bhubaneswar, Odisha'}
        </p>
        <p style="font-size: 12px; color: #64748b; font-weight: 500; margin-top: 2px;">
          ${data.email || studioEmail}
        </p>
        <p style="font-size: 12px; color: #64748b; font-weight: 500; margin-top: 2px;">
          ${data.phone || '+91 7788992712'}
        </p>
      </div>

      <!-- Right Invoice Number -->
      <div style="text-align: right;">
        <div style="font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase;">
          INVOICE
        </div>
        <div style="font-size: 26px; font-weight: 700; color: #1e293b; letter-spacing: 2px; font-family: 'Courier New', Courier, monospace; margin-top: 2px;">
          ${invoiceFormatted}
        </div>
        <div style="font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 3px;">
          Issued: ${invoiceDate}
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div style="margin-top: 26px; border-radius: 4px; overflow: hidden; border: 1px solid #e2e8f0;">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: #1e2229; color: #ffffff;">
            <th style="padding: 12px 18px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px;">
              PRODUCT / SERVICES
            </th>
            <th style="padding: 12px 18px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; text-align: right; width: 110px;">
              PRICE
            </th>
            <th style="padding: 12px 18px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; text-align: center; width: 75px;">
              QTY
            </th>
            <th style="padding: 12px 18px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; text-align: right; width: 120px;">
              TOTAL
            </th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <!-- Payment Data (Left) & Totals (Right) -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 32px;">
      
      <!-- Left: Payment Data -->
      <div style="width: 55%; line-height: 1.6; font-size: 11.5px;">
        <div style="font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-size: 12px;">
          PAYMENT DATA:
        </div>
        <div style="color: #475569;">
          <span style="font-weight: 700; color: #1e293b;">ACCOUNT NO:</span> ${bankAccount}
        </div>
        <div style="color: #475569;">
          <span style="font-weight: 700; color: #1e293b;">NAME:</span> ${studioName}
        </div>
        <div style="color: #475569;">
          <span style="font-weight: 700; color: #1e293b;">BANK & IFSC:</span> ${bankName} (${bankIfsc})
        </div>
        <div style="color: #475569;">
          <span style="font-weight: 700; color: #1e293b;">PAYMENT METHOD:</span> UPI / QR / NET BANKING / CASH
        </div>
      </div>

      <!-- Right: Subtotal & Grand Total -->
      <div style="width: 40%; text-align: right;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #334155; margin-bottom: 6px; font-weight: 700;">
          <span style="text-transform: uppercase; color: #64748b;">SUBTOTAL</span>
          <span>₹${subTotal.toLocaleString('en-IN')}</span>
        </div>

        ${discount > 0 ? `
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #16a34a; margin-bottom: 6px; font-weight: 700;">
            <span style="text-transform: uppercase;">DISCOUNT</span>
            <span>- ₹${discount.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}

        <div style="border-top: 1.5px solid #cbd5e1; margin: 10px 0 8px 0;"></div>

        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <span style="font-size: 15px; font-weight: 900; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px;">TOTAL</span>
          <span style="font-size: 22px; font-weight: 900; color: #0f172a;">₹${grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <!-- Terms and Conditions -->
    <div style="margin-top: 32px; border-top: 1.5px solid #0f172a; padding-top: 16px;">
      <h4 style="font-size: 12.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
        TERMS AND CONDITIONS
      </h4>
      <p style="font-size: 10.5px; color: #64748b; line-height: 1.6; text-align: justify;">
        ${data.termsConditions || '50% advance booking deposit is required to confirm reservation. Final high-resolution edited photo gallery and 4K cinematic film deliverables are provided within 25 working days. Client cancellations within 14 days of shoot date are non-refundable. High-speed raw cloud storage is archived for 60 days following handover.'}
      </p>
    </div>

    <!-- Contact Info (3 Red Badges) -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 28px; gap: 14px;">
      
      <!-- Phone Badge -->
      <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
        <div style="width: 32px; height: 32px; background: #e50914; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 14px; shrink: 0;">
          📞
        </div>
        <div style="font-size: 10.5px; color: #334155; line-height: 1.35; font-weight: 600;">
          <div>${studioPhone}</div>
          <div>+91 9437000000</div>
        </div>
      </div>

      <!-- Email / Web Badge -->
      <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
        <div style="width: 32px; height: 32px; background: #e50914; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 14px; shrink: 0;">
          🌐
        </div>
        <div style="font-size: 10.5px; color: #334155; line-height: 1.35; font-weight: 600;">
          <div>${studioEmail}</div>
          <div>www.arjunfilms.com</div>
        </div>
      </div>

      <!-- Location Badge -->
      <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
        <div style="width: 32px; height: 32px; background: #e50914; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 14px; shrink: 0;">
          📍
        </div>
        <div style="font-size: 10.5px; color: #334155; line-height: 1.35; font-weight: 600;">
          <div>${studioAddress}</div>
        </div>
      </div>

    </div>

  </div>

  <!-- Dual-Layer Bottom Geometric Wave (Red) & Base Bar (Navy/Charcoal) -->
  <div style="width: 100%; margin-top: auto; overflow: hidden; line-height: 0;">
    <svg viewBox="0 0 780 50" style="display: block; width: 100%; height: 38px;" preserveAspectRatio="none">
      <defs>
        <linearGradient id="redWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ff001e" />
          <stop offset="50%" stop-color="#e50914" />
          <stop offset="100%" stop-color="#b8050e" />
        </linearGradient>
      </defs>
      <path d="M 0,38 Q 220,0 400,38 T 780,38 L 780,50 L 0,50 Z" fill="url(#redWaveGrad)" />
    </svg>
    <div style="background: #1e2229; height: 36px; width: 100%;"></div>
  </div>

</div>

</body>
</html>
  `;
}

/**
 * Universal Switcher
 */
export function generateQuotationHTML(data: QuotationData, templateId: string = 'invoice1'): string {
  if (templateId === 'invoice1') {
    return generateInvoice1HTML(data);
  }
  if (templateId === 'invoice3') {
    return generateInvoice3HTML(data);
  }
  return generateClassicHTML(data);
}

