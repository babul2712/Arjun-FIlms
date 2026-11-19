'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Building2, User, Phone, Mail, MapPin, Package,
  IndianRupee, Calendar, Hash, FileText, ChevronRight, CheckCircle2,
  Sparkles, Camera
} from 'lucide-react';
import { createSubscription } from '@/app/subscription-actions';

const COLOR_TAGS = [
  '#e50914', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#6366f1', '#a855f7', '#ec4899',
];

const BUSINESS_TYPES = ['Cafe', 'Restaurant', 'Bakery', 'Bar & Grill', 'Food Court', 'Cloud Kitchen', 'Hotel', 'Other'];
const PLAN_TEMPLATES = [
  { name: 'Starter Plan', days: 2, monthlyDays: 8, fee: 10000 },
  { name: 'Growth Plan', days: 3, monthlyDays: 12, fee: 15000 },
  { name: 'Premium Plan', days: 4, monthlyDays: 16, fee: 20000 },
  { name: 'Elite Plan', days: 5, monthlyDays: 20, fee: 25000 },
  { name: 'Custom Plan', days: 0, monthlyDays: 0, fee: 0 },
];

interface FormData {
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
  endDate: string;
  renewalDate: string;
  notes: string;
  colorTag: string;
}

const steps = ['Client Info', 'Plan Details', 'Schedule', 'Review'];

function InputField({ label, icon, ...props }: { label: string; icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        <input
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e50914]/30 focus:border-[#e50914]/50 transition-all"
          {...props}
        />
      </div>
    </div>
  );
}

export default function CreateSubscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];

  const [form, setForm] = useState<FormData>({
    clientName: '',
    businessType: 'Cafe',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerAddress: '',
    subscriptionPlan: 'Premium Plan',
    monthlyFee: 20000,
    workingDaysPerWeek: 4,
    totalMonthlyDays: 16,
    startDate: today,
    endDate: '',
    renewalDate: nextMonth,
    notes: '',
    colorTag: '#e50914',
  });

  const set = (key: keyof FormData, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const applyTemplate = (tpl: typeof PLAN_TEMPLATES[0]) => {
    if (tpl.name !== 'Custom Plan') {
      set('subscriptionPlan', tpl.name);
      set('workingDaysPerWeek', tpl.days);
      set('totalMonthlyDays', tpl.monthlyDays);
      set('monthlyFee', tpl.fee);
    } else {
      set('subscriptionPlan', 'Custom Plan');
    }
  };

  const perDayValue = form.totalMonthlyDays > 0
    ? Math.round(form.monthlyFee / form.totalMonthlyDays)
    : 0;

  const validateStep = () => {
    if (step === 0) {
      if (!form.clientName.trim()) return 'Client name is required';
      if (!form.ownerName.trim()) return 'Owner name is required';
      if (!form.ownerPhone.trim()) return 'Phone number is required';
    }
    if (step === 1) {
      if (!form.subscriptionPlan.trim()) return 'Plan name is required';
      if (form.monthlyFee <= 0) return 'Monthly fee must be greater than 0';
      if (form.workingDaysPerWeek <= 0) return 'Working days per week is required';
      if (form.totalMonthlyDays <= 0) return 'Total monthly days is required';
    }
    if (step === 2) {
      if (!form.startDate) return 'Start date is required';
    }
    return '';
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const result = await createSubscription(form);
    setLoading(false);
    if (result.success) {
      router.push(`/subscriptions/${result.id}`);
    } else {
      setError(result.error || 'Failed to create subscription');
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#16181c] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:border-[#e50914]/40 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">New Subscription Client</h1>
            <p className="text-sm text-gray-400">Step {step + 1} of {steps.length} — {steps[step]}</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 flex-1 ${i < steps.length - 1 ? '' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shrink-0 ${
                  i < step ? 'bg-emerald-500 text-white' :
                  i === step ? 'bg-[#e50914] text-white shadow-md shadow-red-500/30' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-bold hidden sm:block ${i === step ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 rounded-full transition-all ${i < step ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 text-sm font-bold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ── STEP 0: Client Info ── */}
        {step === 0 && (
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-[#e50914]" />
              <h2 className="font-black text-gray-900 dark:text-white">Client Information</h2>
            </div>

            {/* Color Tag Picker */}
            <div>
              <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Brand Color</label>
              <div className="flex items-center gap-2">
                {COLOR_TAGS.map((c) => (
                  <button
                    key={c}
                    onClick={() => set('colorTag', c)}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all ${form.colorTag === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-300 dark:ring-gray-700' : 'hover:scale-110'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            <InputField
              label="Restaurant / Cafe Name *"
              icon={<Building2 className="w-4 h-4" />}
              placeholder="e.g. FTD Cafe"
              value={form.clientName}
              onChange={(e) => set('clientName', e.target.value)}
            />

            <div>
              <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Business Type</label>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_TYPES.map((bt) => (
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

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Owner / Manager Name *"
                icon={<User className="w-4 h-4" />}
                placeholder="Owner name"
                value={form.ownerName}
                onChange={(e) => set('ownerName', e.target.value)}
              />
              <InputField
                label="Phone Number *"
                icon={<Phone className="w-4 h-4" />}
                placeholder="9876543210"
                value={form.ownerPhone}
                onChange={(e) => set('ownerPhone', e.target.value)}
              />
            </div>

            <InputField
              label="Email"
              icon={<Mail className="w-4 h-4" />}
              placeholder="owner@cafe.com"
              type="email"
              value={form.ownerEmail}
              onChange={(e) => set('ownerEmail', e.target.value)}
            />
            <InputField
              label="Address"
              icon={<MapPin className="w-4 h-4" />}
              placeholder="Restaurant address"
              value={form.ownerAddress}
              onChange={(e) => set('ownerAddress', e.target.value)}
            />
          </div>
        )}

        {/* ── STEP 1: Plan Details ── */}
        {step === 1 && (
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-[#e50914]" />
              <h2 className="font-black text-gray-900 dark:text-white">Subscription Plan</h2>
            </div>

            {/* Plan Templates */}
            <div>
              <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 block">Quick Templates</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PLAN_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => applyTemplate(tpl)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      form.subscriptionPlan === tpl.name
                        ? 'border-[#e50914] bg-[#fef2f2] dark:bg-red-950/20 text-[#e50914]'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <p className="text-xs font-black">{tpl.name}</p>
                    {tpl.fee > 0 && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        ₹{tpl.fee.toLocaleString()} · {tpl.days}d/wk
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <InputField
              label="Plan Name *"
              icon={<Package className="w-4 h-4" />}
              placeholder="e.g. Premium Plan"
              value={form.subscriptionPlan}
              onChange={(e) => set('subscriptionPlan', e.target.value)}
            />

            <InputField
              label="Monthly Fee (₹) *"
              icon={<IndianRupee className="w-4 h-4" />}
              placeholder="20000"
              type="number"
              value={form.monthlyFee || ''}
              onChange={(e) => set('monthlyFee', parseFloat(e.target.value) || 0)}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Working Days / Week *"
                icon={<Calendar className="w-4 h-4" />}
                placeholder="4"
                type="number"
                min={1}
                max={7}
                value={form.workingDaysPerWeek || ''}
                onChange={(e) => set('workingDaysPerWeek', parseInt(e.target.value) || 0)}
              />
              <InputField
                label="Total Monthly Days *"
                icon={<Hash className="w-4 h-4" />}
                placeholder="16"
                type="number"
                min={1}
                value={form.totalMonthlyDays || ''}
                onChange={(e) => set('totalMonthlyDays', parseInt(e.target.value) || 0)}
              />
            </div>

            {/* Value Preview */}
            {form.monthlyFee > 0 && form.totalMonthlyDays > 0 && (
              <div className="bg-gradient-to-r from-[#fef2f2] to-rose-50 dark:from-red-950/20 dark:to-red-950/10 rounded-2xl p-4 border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#e50914]" />
                  <span className="text-xs font-black text-[#e50914] uppercase tracking-wider">Plan Summary</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">Monthly Fee</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white">₹{form.monthlyFee.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">Shoot Days</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white">{form.totalMonthlyDays}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">Per Day Value</p>
                    <p className="text-lg font-black text-[#e50914]">₹{perDayValue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Notes</label>
              <textarea
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e50914]/30 focus:border-[#e50914]/50 transition-all resize-none"
                rows={3}
                placeholder="Any special notes about this plan..."
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: Schedule ── */}
        {step === 2 && (
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-[#e50914]" />
              <h2 className="font-black text-gray-900 dark:text-white">Schedule Setup</h2>
            </div>

            <InputField
              label="Subscription Start Date *"
              icon={<Calendar className="w-4 h-4" />}
              type="date"
              value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)}
            />
            <InputField
              label="Renewal Date"
              icon={<Calendar className="w-4 h-4" />}
              type="date"
              value={form.renewalDate}
              onChange={(e) => set('renewalDate', e.target.value)}
            />
            <InputField
              label="End Date (optional)"
              icon={<Calendar className="w-4 h-4" />}
              type="date"
              value={form.endDate}
              onChange={(e) => set('endDate', e.target.value)}
            />

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                💡 You can schedule individual shoot dates from the client's detail page after creating the subscription.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h2 className="font-black text-gray-900 dark:text-white">Review & Confirm</h2>
              </div>

              {/* Client preview card */}
              <div
                className="rounded-2xl p-5 text-white mb-4"
                style={{ background: `linear-gradient(135deg, ${form.colorTag}, ${form.colorTag}99)` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black">
                    {form.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-lg">{form.clientName}</p>
                    <p className="text-white/70 text-sm">{form.businessType} · {form.subscriptionPlan}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/15 rounded-xl p-3">
                    <p className="text-white/60 text-[10px] font-bold">Monthly Fee</p>
                    <p className="text-white font-black text-lg">₹{form.monthlyFee.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3">
                    <p className="text-white/60 text-[10px] font-bold">Shoot Days</p>
                    <p className="text-white font-black text-lg">{form.totalMonthlyDays}/mo</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3">
                    <p className="text-white/60 text-[10px] font-bold">Per Day</p>
                    <p className="text-white font-black text-lg">₹{perDayValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'Owner', value: form.ownerName },
                  { label: 'Phone', value: form.ownerPhone },
                  { label: 'Email', value: form.ownerEmail || '—' },
                  { label: 'Address', value: form.ownerAddress || '—' },
                  { label: 'Start Date', value: form.startDate },
                  { label: 'Renewal Date', value: form.renewalDate || '—' },
                  { label: 'Working Days/Week', value: `${form.workingDaysPerWeek} days` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-sm text-gray-400 font-bold">{label}</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 font-black text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={nextStep}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 text-white font-black shadow-lg shadow-red-500/25 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 text-white font-black shadow-lg shadow-red-500/25 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Subscription
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
