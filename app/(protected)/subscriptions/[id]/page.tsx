'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Camera, IndianRupee, Calendar, CheckCircle2, Clock,
  XCircle, Phone, Mail, MapPin, Edit3, Trash2, Plus, RotateCcw,
  AlertCircle, Building2, Package, Hash,
  MessageSquare, RefreshCcw, Banknote, History, Save, X,
  User, FileText, TrendingUp, ChevronRight
} from 'lucide-react';
import {
  getSubscriptionById,
  updateSubscription,
  updateSubscriptionWithHistory,
  deleteSubscription,
  createSubscriptionShoot,
  updateSubscriptionShoot,
  deleteSubscriptionShoot,
  createSubscriptionPayment,
  updateSubscriptionPayment,
  bulkScheduleShoots,
  getSubscriptionHistory,
} from '@/app/subscription-actions';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Shoot {
  _id: string;
  scheduledDate: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  deliverables?: string;
  notes?: string;
  shootType?: string;
  location?: string;
  completedAt?: string;
  cancelledAt?: string;
}

interface Payment {
  _id: string;
  month: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paidDate?: string;
  invoiceNumber: string;
  transactionId?: string;
  paymentMethod?: string;
}

interface HistoryEntry {
  _id: string;
  changedAt: string;
  changedBy: string;
  changes: { field: string; label: string; oldValue: string; newValue: string }[];
  notes?: string;
}

interface Sub {
  _id: string;
  clientName: string;
  businessType: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAddress: string;
  subscriptionPlan: string;
  monthlyFee: number;
  workingDaysPerWeek: number;
  totalMonthlyDays: number;
  startDate: string;
  endDate?: string;
  renewalDate: string;
  status: 'Active' | 'Inactive' | 'Paused' | 'Cancelled';
  colorTag: string;
  notes: string;
  shoots: Shoot[];
  payments: Payment[];
  stats: {
    completedThisMonth: number;
    totalThisMonth: number;
    remaining: number;
    perDayValue: number;
  };
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const COLOR_TAGS = [
  '#e50914', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#6366f1', '#a855f7', '#ec4899',
];

const BUSINESS_TYPES = ['Cafe', 'Restaurant', 'Bakery', 'Bar & Grill', 'Food Court', 'Cloud Kitchen', 'Hotel', 'Other'];

const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const statusConfig = {
  Active: { bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-900/50' },
  Inactive: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', dot: 'bg-gray-400', border: 'border-gray-200 dark:border-gray-700' },
  Paused: { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-900/50' },
  Cancelled: { bg: 'bg-red-100 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500', border: 'border-red-200 dark:border-red-900/50' },
};

const shootStatusConfig = {
  Scheduled: { bg: 'bg-blue-100 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', icon: Clock },
  Completed: { bg: 'bg-emerald-100 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
  Cancelled: { bg: 'bg-red-100 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', icon: XCircle },
  Rescheduled: { bg: 'bg-amber-100 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', icon: RotateCcw },
};

const paymentStatusConfig = {
  Paid: { bg: 'bg-emerald-100 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400' },
  Pending: { bg: 'bg-amber-100 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400' },
  Overdue: { bg: 'bg-red-100 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400' },
};

function formatDate(d: string | Date) {
  if (!d) return '—';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split('-').map(Number);
    const dt = new Date(y, m - 1, day, 12, 0, 0);
    return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '—';
  return dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShort(d: string | Date) {
  if (!d) return '—';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split('-').map(Number);
    const dt = new Date(y, m - 1, day, 12, 0, 0);
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '—';
  return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatBulkPreviewChip(dateStr: string) {
  if (!dateStr) return '—';
  const [yyyy, mm, dd] = dateStr.split('-').map(Number);
  const dt = new Date(yyyy, mm - 1, dd, 12, 0, 0);
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getDay()];
  const monthName = MONTHS_FULL[mm - 1]?.slice(0, 3) || '';
  return `${weekday}, ${dd} ${monthName}`;
}

function formatTimeAgo(d: string) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

function isoDate(d: string) {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
}

function currentMonthStr() {
  const d = new Date();
  return `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

function InputField({
  label, icon, value, onChange, type = 'text', placeholder = '', readOnly = false
}: {
  label: string; icon: React.ReactNode; value: string | number;
  onChange: (v: string) => void; type?: string; placeholder?: string; readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e50914]/30 focus:border-[#e50914]/50 transition-all ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
      </div>
    </div>
  );
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────

function EditModal({ sub, onClose, onSaved }: {
  sub: Sub; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    clientName: sub.clientName,
    businessType: sub.businessType,
    ownerName: sub.ownerName,
    ownerPhone: sub.ownerPhone,
    ownerEmail: sub.ownerEmail || '',
    ownerAddress: sub.ownerAddress || '',
    subscriptionPlan: sub.subscriptionPlan,
    monthlyFee: sub.monthlyFee,
    workingDaysPerWeek: sub.workingDaysPerWeek,
    totalMonthlyDays: sub.totalMonthlyDays,
    startDate: isoDate(sub.startDate),
    endDate: sub.endDate ? isoDate(sub.endDate) : '',
    renewalDate: sub.renewalDate ? isoDate(sub.renewalDate) : '',
    status: sub.status,
    colorTag: sub.colorTag,
    notes: sub.notes || '',
  });
  const [historyNote, setHistoryNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'client' | 'plan' | 'schedule'>('client');

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const perDayValue = form.totalMonthlyDays > 0
    ? Math.round(form.monthlyFee / form.totalMonthlyDays)
    : 0;

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.ownerPhone.trim()) {
      setError('Client name and phone are required');
      return;
    }
    if (form.monthlyFee <= 0 || form.totalMonthlyDays <= 0) {
      setError('Monthly fee and shoot days must be valid');
      return;
    }
    setLoading(true);
    setError('');

    // Pass current sub data as "old" so we can diff
    const result = await updateSubscriptionWithHistory(
      sub._id,
      {
        clientName: sub.clientName,
        businessType: sub.businessType,
        ownerName: sub.ownerName,
        ownerPhone: sub.ownerPhone,
        ownerEmail: sub.ownerEmail,
        subscriptionPlan: sub.subscriptionPlan,
        monthlyFee: sub.monthlyFee,
        workingDaysPerWeek: sub.workingDaysPerWeek,
        totalMonthlyDays: sub.totalMonthlyDays,
        startDate: isoDate(sub.startDate),
        endDate: sub.endDate ? isoDate(sub.endDate) : '',
        renewalDate: sub.renewalDate ? isoDate(sub.renewalDate) : '',
        status: sub.status,
      },
      form,
      'Admin',
      historyNote
    );

    setLoading(false);
    if (result.success) {
      onSaved();
      onClose();
    } else {
      setError(result.error || 'Failed to save changes');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#16181c] rounded-[32px] border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Edit Client</h2>
            <p className="text-xs text-gray-400 mt-0.5">{sub.clientName} · Changes will be recorded in history</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 px-6 pt-4 shrink-0">
          {([
            { id: 'client', label: 'Client Info', icon: Building2 },
            { id: 'plan', label: 'Plan & Pricing', icon: Package },
            { id: 'schedule', label: 'Dates & Status', icon: Calendar },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSection === id
                  ? 'bg-[#e50914] text-white shadow-md shadow-red-500/25'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {/* ── Client Info ── */}
          {activeSection === 'client' && (
            <>
              {/* Color Tag */}
              <div>
                <label className="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Brand Color</label>
                <div className="flex items-center gap-2.5">
                  {COLOR_TAGS.map(c => (
                    <button
                      key={c}
                      onClick={() => set('colorTag', c)}
                      className={`w-8 h-8 rounded-full cursor-pointer transition-all ${form.colorTag === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-300 dark:ring-gray-600' : 'hover:scale-110'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              <InputField
                label="Restaurant / Cafe Name *"
                icon={<Building2 className="w-4 h-4" />}
                value={form.clientName}
                onChange={v => set('clientName', v)}
                placeholder="FTD Cafe"
              />

              {/* Business Type chips */}
              <div>
                <label className="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Business Type</label>
                <div className="flex flex-wrap gap-2">
                  {BUSINESS_TYPES.map(bt => (
                    <button
                      key={bt}
                      onClick={() => set('businessType', bt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        form.businessType === bt
                          ? 'bg-[#e50914] text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Owner / Manager *"
                  icon={<User className="w-4 h-4" />}
                  value={form.ownerName}
                  onChange={v => set('ownerName', v)}
                  placeholder="Owner name"
                />
                <InputField
                  label="Phone *"
                  icon={<Phone className="w-4 h-4" />}
                  value={form.ownerPhone}
                  onChange={v => set('ownerPhone', v)}
                  placeholder="9876543210"
                />
              </div>

              <InputField
                label="Email"
                icon={<Mail className="w-4 h-4" />}
                value={form.ownerEmail}
                onChange={v => set('ownerEmail', v)}
                type="email"
                placeholder="owner@cafe.com"
              />

              <InputField
                label="Address"
                icon={<MapPin className="w-4 h-4" />}
                value={form.ownerAddress}
                onChange={v => set('ownerAddress', v)}
                placeholder="Restaurant address"
              />

              <div>
                <label className="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e50914]/30 resize-none"
                  placeholder="Notes about this client..."
                />
              </div>
            </>
          )}

          {/* ── Plan & Pricing ── */}
          {activeSection === 'plan' && (
            <>
              <InputField
                label="Plan Name *"
                icon={<Package className="w-4 h-4" />}
                value={form.subscriptionPlan}
                onChange={v => set('subscriptionPlan', v)}
                placeholder="Premium Plan"
              />

              <InputField
                label="Monthly Fee (₹) *"
                icon={<IndianRupee className="w-4 h-4" />}
                value={form.monthlyFee}
                onChange={v => set('monthlyFee', parseFloat(v) || 0)}
                type="number"
                placeholder="20000"
              />

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Working Days / Week *"
                  icon={<Calendar className="w-4 h-4" />}
                  value={form.workingDaysPerWeek}
                  onChange={v => set('workingDaysPerWeek', parseInt(v) || 0)}
                  type="number"
                  placeholder="4"
                />
                <InputField
                  label="Total Monthly Days *"
                  icon={<Hash className="w-4 h-4" />}
                  value={form.totalMonthlyDays}
                  onChange={v => set('totalMonthlyDays', parseInt(v) || 0)}
                  type="number"
                  placeholder="16"
                />
              </div>

              {/* Live preview */}
              {form.monthlyFee > 0 && form.totalMonthlyDays > 0 && (
                <div className="rounded-2xl p-4 border" style={{ background: `${form.colorTag}15`, borderColor: `${form.colorTag}40` }}>
                  <p className="text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: form.colorTag }}>Plan Preview</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Monthly Fee', value: `₹${Number(form.monthlyFee).toLocaleString('en-IN')}` },
                      { label: 'Shoot Days', value: `${form.totalMonthlyDays}/mo` },
                      { label: 'Per Day', value: `₹${perDayValue.toLocaleString('en-IN')}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/60 dark:bg-black/20 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500 font-bold">{label}</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                  {sub.monthlyFee !== form.monthlyFee && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold">
                      <span className="line-through text-gray-400">₹{sub.monthlyFee.toLocaleString('en-IN')}/mo</span>
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                      <span style={{ color: form.colorTag }}>₹{Number(form.monthlyFee).toLocaleString('en-IN')}/mo</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── Dates & Status ── */}
          {activeSection === 'schedule' && (
            <>
              {/* Status */}
              <div>
                <label className="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Subscription Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Active', 'Paused', 'Inactive', 'Cancelled'] as const).map(s => {
                    const sc = statusConfig[s];
                    return (
                      <button
                        key={s}
                        onClick={() => set('status', s)}
                        className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-sm font-black transition-all cursor-pointer ${
                          form.status === s
                            ? `${sc.bg} ${sc.text} ${sc.border}`
                            : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${form.status === s ? sc.dot : 'bg-gray-300'}`} />
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <InputField
                label="Start Date"
                icon={<Calendar className="w-4 h-4" />}
                value={form.startDate}
                onChange={v => set('startDate', v)}
                type="date"
              />

              <InputField
                label="Renewal Date"
                icon={<RefreshCcw className="w-4 h-4" />}
                value={form.renewalDate}
                onChange={v => set('renewalDate', v)}
                type="date"
              />

              <InputField
                label="End Date (optional)"
                icon={<X className="w-4 h-4" />}
                value={form.endDate}
                onChange={v => set('endDate', v)}
                type="date"
              />
            </>
          )}

          {/* Change note — always visible */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <label className="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Reason for Change <span className="normal-case font-normal">(optional — appears in history)</span>
            </label>
            <input
              value={historyNote}
              onChange={e => setHistoryNote(e.target.value)}
              placeholder="e.g. Rate revision for Q4, Plan upgrade requested by client..."
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e50914]/30"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0 flex gap-3">
          {error && <p className="text-sm text-red-500 font-bold flex-1">{error}</p>}
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 font-black text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 text-white font-black text-sm shadow-lg shadow-red-500/25 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SHOOT SCHEDULER MODAL ───────────────────────────────────────────────────

function ShootSchedulerModal({ sub, onClose, onSave }: {
  sub: Sub; onClose: () => void; onSave: () => void;
}) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [singleDate, setSingleDate] = useState('');
  const [shootType, setShootType] = useState('Photography & Videography');
  const [location, setLocation] = useState(sub.ownerAddress || '');
  const [notes, setNotes] = useState('');
  const [bulkDates, setBulkDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth());
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const generateBulkDates = useCallback(() => {
    if (selectedWeekdays.length === 0) { setBulkDates([]); return; }
    const dates: string[] = [];
    const daysInMonth = new Date(bulkYear, bulkMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      // Create local date at noon (12:00:00) so getDay() matches local calendar day
      const date = new Date(bulkYear, bulkMonth, d, 12, 0, 0);
      if (selectedWeekdays.includes(date.getDay())) {
        const yyyy = bulkYear;
        const mm = String(bulkMonth + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
      }
    }
    setBulkDates(dates);
  }, [selectedWeekdays, bulkMonth, bulkYear]);

  useEffect(() => { generateBulkDates(); }, [generateBulkDates]);

  const handleSave = async () => {
    setLoading(true); setError('');
    if (mode === 'single') {
      if (!singleDate) { setError('Please select a date'); setLoading(false); return; }
      await createSubscriptionShoot({ subscriptionId: sub._id, clientName: sub.clientName, scheduledDate: singleDate, shootType, location, notes });
    } else {
      if (bulkDates.length === 0) { setError('No dates generated'); setLoading(false); return; }
      await bulkScheduleShoots(sub._id, sub.clientName, bulkDates, shootType, location);
    }
    setLoading(false); onSave(); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#16181c] rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-900 dark:text-white text-lg">Schedule Shoot</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            {(['single', 'bulk'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer capitalize ${mode === m ? 'bg-white dark:bg-[#1c1f24] text-gray-900 dark:text-white shadow-sm' : 'text-gray-400'}`}>
                {m === 'single' ? 'Single Date' : 'Bulk Schedule'}
              </button>
            ))}
          </div>
          {mode === 'single' ? (
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Shoot Date</label>
              <input type="date" value={singleDate} onChange={e => setSingleDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e50914]/30" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Month</label>
                  <select value={bulkMonth} onChange={e => setBulkMonth(parseInt(e.target.value))} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none">
                    {MONTHS_FULL.map((m, i) => <option key={m} value={i}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Year</label>
                  <input type="number" value={bulkYear} onChange={e => setBulkYear(parseInt(e.target.value))} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2 block">Select Working Days</label>
                <div className="flex gap-1.5">
                  {weekdayNames.map((d, i) => (
                    <button key={d} onClick={() => setSelectedWeekdays(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${selectedWeekdays.includes(i) ? 'bg-[#e50914] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>{d}</button>
                  ))}
                </div>
              </div>
              {bulkDates.length > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                      {bulkDates.length} Shoot Days Selected for {MONTHS_FULL[bulkMonth]} {bulkYear}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80">
                      ~{Math.round(bulkDates.length / 4)} shoots/wk
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {bulkDates.map(d => (
                      <span
                        key={d}
                        className="text-[11px] bg-white dark:bg-[#16181c] border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-2.5 py-1 rounded-xl font-bold shadow-sm"
                      >
                        {formatBulkPreviewChip(d)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Shoot Type</label>
            <input value={shootType} onChange={e => setShootType(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none" placeholder="Shoot location" />
          </div>
          {error && <p className="text-sm text-red-500 font-bold">{error}</p>}
          <button onClick={handleSave} disabled={loading} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 text-white font-black shadow-lg shadow-red-500/25 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60">
            {loading ? 'Scheduling...' : mode === 'single' ? 'Schedule Shoot' : `Schedule ${bulkDates.length} Shoots`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAYMENT MODAL ───────────────────────────────────────────────────────────

function PaymentModal({ sub, onClose, onSave }: {
  sub: Sub; onClose: () => void; onSave: () => void;
}) {
  const [month, setMonth] = useState(currentMonthStr());
  const [amount, setAmount] = useState(sub.monthlyFee);
  const [status, setStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Paid');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await createSubscriptionPayment({ subscriptionId: sub._id, clientName: sub.clientName, month, amount, status, paidDate: status === 'Paid' ? paidDate : undefined, transactionId, paymentMethod });
    setLoading(false); onSave(); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#16181c] rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-900 dark:text-white text-lg">Record Payment</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer"><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Month</label>
            <select value={month} onChange={e => setMonth(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none">
              {Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - 2 + i); const str = `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`; return <option key={str} value={str}>{str}</option>; })}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Amount (₹)</label>
            <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
            <div className="flex gap-2">
              {(['Paid', 'Pending', 'Overdue'] as const).map(s => (
                <button key={s} onClick={() => setStatus(s)} className={`flex-1 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${status === s ? (s === 'Paid' ? 'bg-emerald-500 text-white' : s === 'Pending' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white') : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>{s}</button>
              ))}
            </div>
          </div>
          {status === 'Paid' && (
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Payment Date</label>
              <input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none" />
            </div>
          )}
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Payment Method</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none">
              {['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Online'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Transaction ID</label>
            <input value={transactionId} onChange={e => setTransactionId(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none" placeholder="Optional" />
          </div>
          <button onClick={handleSave} disabled={loading} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 text-white font-black shadow-lg shadow-red-500/25 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60">
            {loading ? 'Saving...' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HISTORY ENTRY CARD ───────────────────────────────────────────────────────

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-3.5 hover:bg-gray-50 dark:hover:bg-[#1c1f24] transition-colors cursor-pointer text-left"
      >
        <div className="w-8 h-8 rounded-xl bg-[#fef2f2] dark:bg-red-950/30 flex items-center justify-center shrink-0">
          <History className="w-4 h-4 text-[#e50914]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-gray-900 dark:text-white">
            {entry.changes.length} change{entry.changes.length !== 1 ? 's' : ''} made
          </p>
          <p className="text-[11px] text-gray-400">
            {entry.changedBy} · {formatTimeAgo(entry.changedAt)}
          </p>
        </div>
        <div className={`text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-3.5 space-y-2 bg-gray-50/50 dark:bg-[#1c1f24]/50">
          {entry.notes && (
            <div className="flex items-start gap-2 mb-3">
              <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{entry.notes}"</p>
            </div>
          )}
          {entry.changes.map((c, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider w-28 shrink-0 mt-0.5">{c.label}</span>
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                {c.oldValue && (
                  <span className="text-[11px] bg-red-100 dark:bg-red-950/40 text-red-500 dark:text-red-400 px-2 py-0.5 rounded-lg font-bold line-through">
                    {c.oldValue || '—'}
                  </span>
                )}
                <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
                <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg font-bold">
                  {c.newValue}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [sub, setSub] = useState<Sub | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShootModal, setShowShootModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'shoots' | 'payments' | 'history'>('shoots');

  const load = useCallback(async () => {
    setLoading(true);
    const [data, hist] = await Promise.all([
      getSubscriptionById(id),
      getSubscriptionHistory(id),
    ]);
    setSub(data as Sub | null);
    setHistory(hist as HistoryEntry[]);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleMarkShoot = async (shootId: string, status: string) => {
    const update: any = { status };
    if (status === 'Completed') update.completedAt = new Date().toISOString();
    if (status === 'Cancelled') update.cancelledAt = new Date().toISOString();
    await updateSubscriptionShoot(shootId, update);
    load();
  };

  const handleDeleteShoot = async (shootId: string) => {
    if (!confirm('Delete this shoot?')) return;
    await deleteSubscriptionShoot(shootId, id);
    load();
  };

  const handleDelete = async () => {
    if (!confirm(`Delete all data for ${sub?.clientName}? This cannot be undone.`)) return;
    await deleteSubscription(id);
    router.push('/subscriptions');
  };

  const handleWhatsApp = () => {
    if (!sub) return;
    const msg = encodeURIComponent(
      `Hi ${sub.ownerName},\n\nThis is a reminder that your monthly subscription payment of ₹${sub.monthlyFee.toLocaleString('en-IN')} for ${currentMonthStr()} is due.\n\nSubscription: ${sub.subscriptionPlan}\nClient: ${sub.clientName}\n\nPlease arrange the payment at the earliest.\n\nThanks,\nArjun Films`
    );
    window.open(`https://wa.me/91${sub.ownerPhone}?text=${msg}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#e50914]/20 border-t-[#e50914] animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Loading client...</p>
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Client not found</h2>
          <button onClick={() => router.push('/subscriptions')} className="text-[#e50914] font-bold">← Back to subscriptions</button>
        </div>
      </div>
    );
  }

  const sc = statusConfig[sub.status] || statusConfig.Inactive;
  const progress = sub.totalMonthlyDays > 0
    ? Math.round((sub.stats.completedThisMonth / sub.totalMonthlyDays) * 100)
    : 0;

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => router.push('/subscriptions')}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#16181c] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:border-[#e50914]/40 transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white truncate">{sub.clientName}</h1>
            <p className="text-sm text-gray-400">{sub.businessType} · {sub.subscriptionPlan}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* ✏️ EDIT BUTTON */}
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-[#e50914]/30 bg-[#fef2f2] dark:bg-red-950/20 text-[#e50914] text-xs font-black hover:border-[#e50914] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Client
            </button>
            <button onClick={handleWhatsApp} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-black hover:-translate-y-0.5 transition-all cursor-pointer">
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp
            </button>
            <button onClick={() => setShowPaymentModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 text-white text-xs font-black hover:-translate-y-0.5 transition-all cursor-pointer">
              <Banknote className="w-3.5 h-3.5" />
              Payment
            </button>
            <button
              onClick={() => setShowShootModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#e50914] to-red-600 text-white text-xs font-black shadow-md shadow-red-500/25 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              Schedule Shoot
            </button>
          </div>
        </div>

        {/* ── Hero Card ── */}
        <div
          className="rounded-[28px] p-6 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${sub.colorTag}, ${sub.colorTag}bb, ${sub.colorTag}88)` }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-black/10 translate-y-1/2" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white/90 text-[10px] font-black mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {sub.status}
                </div>
                <h2 className="text-3xl font-black">{sub.clientName}</h2>
                <p className="text-white/70 text-sm mt-1">{sub.ownerName} · {sub.ownerPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs font-bold">Monthly Fee</p>
                <p className="text-4xl font-black">₹{sub.monthlyFee.toLocaleString('en-IN')}</p>
                <p className="text-white/60 text-xs">₹{sub.stats.perDayValue.toLocaleString()}/day</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-white/70 text-xs font-bold uppercase tracking-wider">This Month's Progress</span>
                <span className="text-white font-black text-sm">{sub.stats.completedThisMonth}/{sub.totalMonthlyDays} shoots</span>
              </div>
              <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-white/60 text-[10px] font-bold">{sub.stats.completedThisMonth} completed</span>
                <span className="text-white/60 text-[10px] font-bold">{sub.stats.remaining} remaining</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Days/Week', value: sub.workingDaysPerWeek },
                { label: 'Days/Month', value: sub.totalMonthlyDays },
                { label: 'Completed', value: sub.stats.completedThisMonth },
                { label: 'Remaining', value: sub.stats.remaining },
              ].map(({ label, value }) => (
                <div key={label} className="bg-black/20 backdrop-blur rounded-2xl p-3">
                  <p className="text-white/60 text-[10px] font-bold">{label}</p>
                  <p className="text-white font-black text-xl">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Two-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Client Info Card */}
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#e50914]" />
                <h3 className="font-black text-gray-900 dark:text-white text-sm">Client Details</h3>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="w-7 h-7 rounded-xl bg-[#fef2f2] dark:bg-red-950/30 flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
                title="Edit client"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#e50914]" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { icon: <Building2 className="w-3.5 h-3.5" />, label: 'Business', value: sub.businessType },
                { icon: <Package className="w-3.5 h-3.5" />, label: 'Plan', value: sub.subscriptionPlan },
                { icon: <Phone className="w-3.5 h-3.5" />, label: 'Phone', value: sub.ownerPhone },
                { icon: <Mail className="w-3.5 h-3.5" />, label: 'Email', value: sub.ownerEmail || '—' },
                { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Address', value: sub.ownerAddress || '—' },
                { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Started', value: formatDate(sub.startDate) },
                { icon: <RefreshCcw className="w-3.5 h-3.5" />, label: 'Renewal', value: formatDate(sub.renewalDate) },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <div className="mt-0.5 text-gray-400">{icon}</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400">{label}</p>
                    <p className="text-xs font-black text-gray-900 dark:text-white truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {sub.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-bold text-gray-400 mb-1">Notes</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{sub.notes}</p>
              </div>
            )}

            {/* History badge */}
            {history.length > 0 && (
              <button
                onClick={() => setActiveTab('history')}
                className="mt-4 w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-100 dark:border-gray-800 hover:border-[#e50914]/30 transition-all cursor-pointer"
              >
                <History className="w-4 h-4 text-[#e50914]" />
                <span className="text-xs font-black text-gray-600 dark:text-gray-300">
                  {history.length} change{history.length !== 1 ? 's' : ''} in history
                </span>
              </button>
            )}

            <button
              onClick={handleDelete}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 text-xs font-black hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Client
            </button>
          </div>

          {/* Tabs Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 overflow-hidden">
            {/* Tab Header */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              {([
                { id: 'shoots', label: 'Shoots', count: sub.shoots.length },
                { id: 'payments', label: 'Payments', count: sub.payments.length },
                { id: 'history', label: 'History', count: history.length },
              ] as const).map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 py-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer relative ${
                    activeTab === id
                      ? 'text-[#e50914]'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      activeTab === id ? 'bg-[#e50914] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>{count}</span>
                  )}
                  {activeTab === id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e50914]" />}
                </button>
              ))}
            </div>

            <div className="p-5">

              {/* ── Shoots Tab ── */}
              {activeTab === 'shoots' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">All Scheduled Shoots</p>
                    <button onClick={() => setShowShootModal(true)} className="flex items-center gap-1.5 text-xs font-black text-[#e50914] cursor-pointer hover:underline">
                      <Plus className="w-3.5 h-3.5" /> Add Shoot
                    </button>
                  </div>
                  {sub.shoots.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Camera className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-bold">No shoots scheduled yet</p>
                      <button onClick={() => setShowShootModal(true)} className="mt-2 text-[#e50914] text-xs font-black cursor-pointer">Schedule first shoot</button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {sub.shoots.map(shoot => {
                        const ssc = shootStatusConfig[shoot.status] || shootStatusConfig.Scheduled;
                        const StatusIcon = ssc.icon;
                        return (
                          <div key={shoot._id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] group hover:bg-gray-100 dark:hover:bg-[#20232a] transition-colors">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${ssc.bg}`}>
                              <StatusIcon className={`w-4 h-4 ${ssc.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-gray-900 dark:text-white">{formatDate(shoot.scheduledDate)}</p>
                              <p className="text-[11px] text-gray-400">{shoot.shootType || 'Photography'}{shoot.location ? ` · ${shoot.location}` : ''}</p>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${ssc.bg} ${ssc.text}`}>{shoot.status}</span>
                            {shoot.status === 'Scheduled' && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleMarkShoot(shoot._id, 'Completed')} className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 cursor-pointer hover:scale-110 transition-transform" title="Complete"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleMarkShoot(shoot._id, 'Cancelled')} className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-500 cursor-pointer hover:scale-110 transition-transform" title="Cancel"><XCircle className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteShoot(shoot._id)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-pointer hover:scale-110 transition-transform" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Payments Tab ── */}
              {activeTab === 'payments' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Payment History</p>
                    <button onClick={() => setShowPaymentModal(true)} className="flex items-center gap-1.5 text-xs font-black text-[#e50914] cursor-pointer hover:underline">
                      <Plus className="w-3.5 h-3.5" /> Record Payment
                    </button>
                  </div>
                  {sub.payments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Banknote className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-bold">No payments recorded</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {sub.payments.map(payment => {
                        const pc = paymentStatusConfig[payment.status];
                        return (
                          <div key={payment._id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24]">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${pc.bg}`}>
                              <IndianRupee className={`w-4 h-4 ${pc.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-gray-900 dark:text-white">{payment.month}</p>
                              <p className="text-[11px] text-gray-400">{payment.invoiceNumber}{payment.transactionId ? ` · ${payment.transactionId}` : ''}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-gray-900 dark:text-white">₹{payment.amount.toLocaleString('en-IN')}</p>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>{payment.status}</span>
                            </div>
                            {payment.status === 'Pending' && (
                              <button
                                onClick={() => updateSubscriptionPayment(payment._id, { status: 'Paid', paidDate: new Date().toISOString() }).then(load)}
                                className="ml-1 p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 cursor-pointer hover:scale-110 transition-transform" title="Mark Paid"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── History Tab ── */}
              {activeTab === 'history' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Change History</p>
                    <p className="text-[11px] text-gray-400">{history.length} record{history.length !== 1 ? 's' : ''}</p>
                  </div>
                  {history.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-bold">No changes recorded yet</p>
                      <p className="text-xs mt-1 text-gray-300 dark:text-gray-600">Click "Edit Client" to make changes — they'll be tracked here</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {history.map(entry => (
                        <HistoryCard key={entry._id} entry={entry} />
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showEditModal && (
        <EditModal
          sub={sub}
          onClose={() => setShowEditModal(false)}
          onSaved={load}
        />
      )}
      {showShootModal && (
        <ShootSchedulerModal sub={sub} onClose={() => setShowShootModal(false)} onSave={load} />
      )}
      {showPaymentModal && (
        <PaymentModal sub={sub} onClose={() => setShowPaymentModal(false)} onSave={load} />
      )}
    </div>
  );
}
