'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Camera, IndianRupee, Calendar, CheckCircle2, Clock,
  XCircle, Phone, Mail, MapPin, Edit3, Trash2, Plus, RotateCcw,
  TrendingUp, AlertCircle, Building2, Package, Hash, Star,
  ChevronDown, ChevronUp, Download, MessageSquare, Zap, RefreshCcw,
  CircleDot, CalendarCheck, Banknote
} from 'lucide-react';
import {
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  createSubscriptionShoot,
  updateSubscriptionShoot,
  deleteSubscriptionShoot,
  createSubscriptionPayment,
  updateSubscriptionPayment,
  bulkScheduleShoots,
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

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const statusConfig = {
  Active: { bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Inactive: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', dot: 'bg-gray-400' },
  Paused: { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  Cancelled: { bg: 'bg-red-100 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
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

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShort(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function currentMonthStr() {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
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

  // Bulk: generate dates for selected weekdays in a month
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth());
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const generateBulkDates = () => {
    const dates: string[] = [];
    const daysInMonth = new Date(bulkYear, bulkMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(bulkYear, bulkMonth, d);
      if (selectedWeekdays.includes(date.getDay())) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    setBulkDates(dates);
  };

  useEffect(() => { if (selectedWeekdays.length > 0) generateBulkDates(); }, [selectedWeekdays, bulkMonth, bulkYear]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    if (mode === 'single') {
      if (!singleDate) { setError('Please select a date'); setLoading(false); return; }
      await createSubscriptionShoot({
        subscriptionId: sub._id,
        clientName: sub.clientName,
        scheduledDate: singleDate,
        shootType,
        location,
        notes,
      });
    } else {
      if (bulkDates.length === 0) { setError('No dates generated'); setLoading(false); return; }
      await bulkScheduleShoots(sub._id, sub.clientName, bulkDates, shootType, location);
    }
    setLoading(false);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#16181c] rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-900 dark:text-white text-lg">Schedule Shoot</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer">
              <XCircle className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            {(['single', 'bulk'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer capitalize ${
                  mode === m ? 'bg-white dark:bg-[#1c1f24] text-gray-900 dark:text-white shadow-sm' : 'text-gray-400'
                }`}
              >
                {m === 'single' ? 'Single Date' : 'Bulk Schedule'}
              </button>
            ))}
          </div>

          {mode === 'single' ? (
            <>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Shoot Date</label>
                <input
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e50914]/30"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Month</label>
                  <select
                    value={bulkMonth}
                    onChange={(e) => setBulkMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none"
                  >
                    {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Year</label>
                  <input
                    type="number"
                    value={bulkYear}
                    onChange={(e) => setBulkYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2 block">Select Working Days</label>
                <div className="flex gap-2">
                  {weekdayNames.map((d, i) => (
                    <button
                      key={d}
                      onClick={() => setSelectedWeekdays((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i])}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        selectedWeekdays.includes(i)
                          ? 'bg-[#e50914] text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              {bulkDates.length > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-3">
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-2">
                    {bulkDates.length} dates selected:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {bulkDates.map((d) => (
                      <span key={d} className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        {formatDateShort(d)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Shoot Type</label>
            <input
              value={shootType}
              onChange={(e) => setShootType(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none"
              placeholder="Photography & Videography"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none"
              placeholder="Shoot location"
            />
          </div>

          {error && <p className="text-sm text-red-500 font-bold">{error}</p>}

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 text-white font-black shadow-lg shadow-red-500/25 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
          >
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
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await createSubscriptionPayment({
      subscriptionId: sub._id,
      clientName: sub.clientName,
      month,
      amount,
      status,
      paidDate: status === 'Paid' ? paidDate : undefined,
      transactionId,
      paymentMethod,
      notes,
    });
    setLoading(false);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#16181c] rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-900 dark:text-white text-lg">Record Payment</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer">
              <XCircle className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - 2 + i);
                const str = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
                return <option key={str} value={str}>{str}</option>;
              })}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
            <div className="flex gap-2">
              {(['Paid', 'Pending', 'Overdue'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                    status === s
                      ? s === 'Paid' ? 'bg-emerald-500 text-white' :
                        s === 'Pending' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {status === 'Paid' && (
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Payment Date</label>
              <input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none"
            >
              {['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Online'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Transaction ID</label>
            <input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none"
              placeholder="Optional"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 text-white font-black shadow-lg shadow-red-500/25 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShootModal, setShowShootModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'shoots' | 'payments'>('shoots');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getSubscriptionById(id);
    setSub(data as Sub | null);
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

  const thisMonthShoots = sub.shoots.filter((s) => {
    const d = new Date(s.scheduledDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const upcomingShoots = sub.shoots.filter((s) => {
    return s.status === 'Scheduled' && new Date(s.scheduledDate) >= new Date();
  }).slice(0, 5);

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-black hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 text-white text-xs font-black hover:-translate-y-0.5 transition-all cursor-pointer"
            >
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

        {/* Hero Card */}
        <div
          className="rounded-[28px] p-6 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${sub.colorTag}, ${sub.colorTag}bb, ${sub.colorTag}88)` }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-black/10 translate-y-1/2" />

          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
              <div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white/90 text-[10px] font-black mb-3`}>
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

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-white/70 text-xs font-bold uppercase tracking-wider">This Month's Progress</span>
                <span className="text-white font-black text-sm">{sub.stats.completedThisMonth}/{sub.totalMonthlyDays} shoots</span>
              </div>
              <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-white/60 text-[10px] font-bold">{sub.stats.completedThisMonth} completed</span>
                <span className="text-white/60 text-[10px] font-bold">{sub.stats.remaining} remaining</span>
              </div>
            </div>

            {/* Stats Row */}
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

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Client Info */}
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-[#e50914]" />
              <h3 className="font-black text-gray-900 dark:text-white text-sm">Client Details</h3>
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

            {/* Status Control */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Change Status</p>
              <div className="flex flex-wrap gap-1.5">
                {(['Active', 'Paused', 'Inactive', 'Cancelled'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateSubscription(id, { status: s }).then(load)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black cursor-pointer transition-all ${
                      sub.status === s
                        ? 'bg-[#e50914] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleDelete}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 text-xs font-black hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Client
            </button>
          </div>

          {/* Shoots + Payments Tabs */}
          <div className="lg:col-span-2 bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 overflow-hidden">
            {/* Tab Header */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              {(['shoots', 'payments'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer capitalize ${
                    activeTab === tab
                      ? 'text-[#e50914] border-b-2 border-[#e50914]'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {tab} ({tab === 'shoots' ? sub.shoots.length : sub.payments.length})
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Shoots Tab */}
              {activeTab === 'shoots' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">All Scheduled Shoots</p>
                    <button
                      onClick={() => setShowShootModal(true)}
                      className="flex items-center gap-1.5 text-xs font-black text-[#e50914] cursor-pointer hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Shoot
                    </button>
                  </div>
                  {sub.shoots.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Camera className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-bold">No shoots scheduled yet</p>
                      <button
                        onClick={() => setShowShootModal(true)}
                        className="mt-2 text-[#e50914] text-xs font-black cursor-pointer"
                      >
                        Schedule first shoot
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {sub.shoots.map((shoot) => {
                        const ssc = shootStatusConfig[shoot.status] || shootStatusConfig.Scheduled;
                        const StatusIcon = ssc.icon;
                        return (
                          <div
                            key={shoot._id}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] group hover:bg-gray-100 dark:hover:bg-[#20232a] transition-colors"
                          >
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
                                <button
                                  onClick={() => handleMarkShoot(shoot._id, 'Completed')}
                                  className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 cursor-pointer hover:scale-110 transition-transform"
                                  title="Mark Completed"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMarkShoot(shoot._id, 'Cancelled')}
                                  className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-500 cursor-pointer hover:scale-110 transition-transform"
                                  title="Cancel"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteShoot(shoot._id)}
                                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-pointer hover:scale-110 transition-transform"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Payment History</p>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex items-center gap-1.5 text-xs font-black text-[#e50914] cursor-pointer hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Record Payment
                    </button>
                  </div>
                  {sub.payments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Banknote className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-bold">No payments recorded</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {sub.payments.map((payment) => {
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
                                onClick={() => updateSubscriptionPayment(payment._id, {
                                  status: 'Paid',
                                  paidDate: new Date().toISOString(),
                                }).then(load)}
                                className="ml-1 p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 cursor-pointer hover:scale-110 transition-transform"
                                title="Mark Paid"
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
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showShootModal && (
        <ShootSchedulerModal sub={sub} onClose={() => setShowShootModal(false)} onSave={load} />
      )}
      {showPaymentModal && (
        <PaymentModal sub={sub} onClose={() => setShowPaymentModal(false)} onSave={load} />
      )}
    </div>
  );
}
