'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid, List, Plus, Search, TrendingUp, Users, AlertCircle,
  Camera, IndianRupee, Calendar, ChevronRight, Star, Clock, CheckCircle2,
  Repeat, BarChart3, Filter, RefreshCcw, Building2, Phone, Zap, ArrowUpRight
} from 'lucide-react';
import {
  getSubscriptions,
  getSubscriptionDashboardStats,
  deleteSubscription,
} from '@/app/subscription-actions';

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface Subscription {
  _id: string;
  clientName: string;
  businessType: string;
  ownerName: string;
  ownerPhone: string;
  subscriptionPlan: string;
  monthlyFee: number;
  workingDaysPerWeek: number;
  totalMonthlyDays: number;
  status: 'Active' | 'Inactive' | 'Paused' | 'Cancelled';
  colorTag: string;
  startDate: string;
  completedShoots: number;
  scheduledShoots: number;
  totalShootsThisMonth: number;
  remainingShoots: number;
  perDayValue: number;
  latestPaymentStatus: string | null;
}

interface Stats {
  totalSubscribers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  paidThisMonth: number;
  pendingAmount: number;
  completedShootsThisMonth: number;
  upcomingShootsThisMonth: number;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const statusConfig = {
  Active: { label: 'Active', bg: 'bg-emerald-500/15 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Inactive: { label: 'Inactive', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
  Paused: { label: 'Paused', bg: 'bg-amber-500/15 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  Cancelled: { label: 'Cancelled', bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
};

const paymentConfig = {
  Paid: { label: 'Paid', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  Pending: { label: 'Pending', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  Overdue: { label: 'Overdue', bg: 'bg-red-500/10', text: 'text-red-500' },
};

function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, gradient, trend }: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
  gradient: string; trend?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#16181c] rounded-[22px] border border-gray-100 dark:border-gray-800/70 p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-black/5 transition-all group">
      <div className={`w-13 h-13 rounded-2xl ${gradient} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">{label}</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <div className="shrink-0 flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
  );
}

// ─── SUBSCRIPTION CARD ───────────────────────────────────────────────────────

function SubscriptionCard({ sub, onDelete, router }: {
  sub: Subscription; onDelete: (id: string) => void; router: ReturnType<typeof useRouter>;
}) {
  const sc = statusConfig[sub.status] || statusConfig.Inactive;
  const pc = sub.latestPaymentStatus
    ? paymentConfig[sub.latestPaymentStatus as keyof typeof paymentConfig]
    : null;
  const progress = sub.totalMonthlyDays > 0
    ? Math.round((sub.completedShoots / sub.totalMonthlyDays) * 100)
    : 0;

  return (
    <div
      className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 hover:shadow-xl hover:shadow-black/8 hover:-translate-y-0.5 transition-all group overflow-hidden cursor-pointer"
      onClick={() => router.push(`/subscriptions/${sub._id}`)}
    >
      {/* Top color accent */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, ${sub.colorTag}, ${sub.colorTag}88)` }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-white text-lg"
              style={{ background: `linear-gradient(135deg, ${sub.colorTag}, ${sub.colorTag}bb)` }}
            >
              {sub.clientName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-gray-900 dark:text-white text-[15px] leading-tight truncate">{sub.clientName}</h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{sub.businessType} · {sub.subscriptionPlan}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {sc.label}
          </div>
        </div>

        {/* Fee & Per-Day */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-gray-50 dark:bg-[#1c1f24] rounded-2xl p-3">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Monthly Fee</p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">₹{sub.monthlyFee.toLocaleString('en-IN')}</p>
          </div>
          <div className="flex-1 bg-gray-50 dark:bg-[#1c1f24] rounded-2xl p-3">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Per Day Value</p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">₹{sub.perDayValue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Shoot Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shoot Progress</span>
            <span className="text-[11px] font-black text-gray-900 dark:text-white">
              {sub.completedShoots}/{sub.totalMonthlyDays} days
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(to right, ${sub.colorTag}, ${sub.colorTag}bb)`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">{sub.completedShoots} done</span>
            <span className="text-[10px] text-gray-400">{sub.remainingShoots} left</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-bold">{sub.workingDaysPerWeek}d/wk</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Phone className="w-3.5 h-3.5" />
              <span className="font-bold">{sub.ownerPhone}</span>
            </div>
          </div>
          {pc && (
            <div className={`text-[10px] font-black px-2.5 py-1 rounded-full ${pc.bg} ${pc.text}`}>
              {pc.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    const [subsData, statsData] = await Promise.all([
      getSubscriptions(),
      getSubscriptionDashboardStats(),
    ]);
    setSubs(subsData);
    setStats(statsData as Stats);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = subs.filter((s) => {
    const matchSearch =
      s.clientName.toLowerCase().includes(search.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      s.subscriptionPlan.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#e50914]/20 border-t-[#e50914] animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-bold">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-5 bg-[#e50914] rounded-full" />
              <span className="text-[11px] font-black text-[#e50914] uppercase tracking-[0.15em]">Subscription Management</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Client Subscriptions</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {stats?.activeSubscribers || 0} active · {subs.length} total clients
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={refreshing}
              className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
            >
              <RefreshCcw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => router.push('/subscriptions/analytics')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => router.push('/subscriptions/create')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 text-white font-black text-sm shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Client
            </button>
          </div>
        </div>

        {/* ── Stats Bento ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={<Users className="w-6 h-6 text-white" />}
              label="Active Clients"
              value={stats.activeSubscribers.toString()}
              sub={`${stats.totalSubscribers} total`}
              gradient="bg-gradient-to-br from-[#e50914] to-rose-600"
              trend="+2"
            />
            <StatCard
              icon={<IndianRupee className="w-6 h-6 text-white" />}
              label="Monthly Revenue"
              value={formatCurrency(stats.monthlyRevenue)}
              sub="Expected this month"
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            />
            <StatCard
              icon={<CheckCircle2 className="w-6 h-6 text-white" />}
              label="Collected"
              value={formatCurrency(stats.paidThisMonth)}
              sub={stats.pendingAmount > 0 ? `₹${stats.pendingAmount.toLocaleString('en-IN')} pending` : 'All paid!'}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <StatCard
              icon={<Camera className="w-6 h-6 text-white" />}
              label="Shoots This Month"
              value={stats.completedShootsThisMonth.toString()}
              sub={`${stats.upcomingShootsThisMonth} upcoming`}
              gradient="bg-gradient-to-br from-purple-500 to-violet-600"
            />
          </div>
        )}

        {/* ── Filters & Search ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients, plans..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#16181c] border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e50914]/30 focus:border-[#e50914]/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            {['All', 'Active', 'Paused', 'Inactive', 'Cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-[#e50914] text-white shadow-md shadow-red-500/25'
                    : 'bg-white dark:bg-[#16181c] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-[#e50914]/40'
                }`}
              >
                {s}
              </button>
            ))}
            <div className="flex items-center bg-white dark:bg-[#16181c] border border-gray-200 dark:border-gray-800 rounded-2xl p-1 gap-1">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${view === 'grid' ? 'bg-[#e50914] text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${view === 'list' ? 'bg-[#e50914] text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Empty State ── */}
        {filtered.length === 0 && (
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#fef2f2] dark:bg-red-950/30 flex items-center justify-center mb-4">
              <Repeat className="w-10 h-10 text-[#e50914]" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
              {search ? 'No clients found' : 'No subscriptions yet'}
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
              {search ? 'Try a different search term.' : 'Add your first cafe or restaurant client to get started.'}
            </p>
            {!search && (
              <button
                onClick={() => router.push('/subscriptions/create')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#e50914] to-red-600 text-white font-black shadow-lg shadow-red-500/25 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add First Client
              </button>
            )}
          </div>
        )}

        {/* ── Grid View ── */}
        {filtered.length > 0 && view === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((sub) => (
              <SubscriptionCard key={sub._id} sub={sub} onDelete={() => {}} router={router} />
            ))}
          </div>
        )}

        {/* ── List View ── */}
        {filtered.length > 0 && view === 'list' && (
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="text-left p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Monthly Fee</th>
                  <th className="text-left p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Progress</th>
                  <th className="text-left p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => {
                  const sc = statusConfig[sub.status] || statusConfig.Inactive;
                  const pc = sub.latestPaymentStatus
                    ? paymentConfig[sub.latestPaymentStatus as keyof typeof paymentConfig]
                    : null;
                  const progress = sub.totalMonthlyDays > 0
                    ? Math.round((sub.completedShoots / sub.totalMonthlyDays) * 100)
                    : 0;
                  return (
                    <tr
                      key={sub._id}
                      onClick={() => router.push(`/subscriptions/${sub._id}`)}
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#1c1f24] cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm"
                            style={{ background: `linear-gradient(135deg, ${sub.colorTag}, ${sub.colorTag}bb)` }}
                          >
                            {sub.clientName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 dark:text-white text-sm">{sub.clientName}</p>
                            <p className="text-xs text-gray-400">{sub.subscriptionPlan}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-black text-gray-900 dark:text-white">₹{sub.monthlyFee.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-400">₹{sub.perDayValue}/day</p>
                      </td>
                      <td className="p-4 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${progress}%`, background: sub.colorTag }}
                            />
                          </div>
                          <span className="text-xs font-black text-gray-500">{sub.completedShoots}/{sub.totalMonthlyDays}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
                      </td>
                      <td className="p-4">
                        {pc ? (
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${pc.bg} ${pc.text}`}>{pc.label}</span>
                        ) : (
                          <span className="text-xs text-gray-300 dark:text-gray-700">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-700" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
