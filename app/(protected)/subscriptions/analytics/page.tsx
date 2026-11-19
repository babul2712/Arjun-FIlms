'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, TrendingUp, IndianRupee, Camera, Users,
  BarChart3, CheckCircle2, AlertCircle, Building2,
  RefreshCcw, Calendar, Star
} from 'lucide-react';
import { getSubscriptionAnalytics } from '@/app/subscription-actions';
import SubscriptionLoader from '@/components/subscriptions/SubscriptionLoader';

interface Analytics {
  clientRevenue: {
    clientName: string;
    status: string;
    monthlyFee: number;
    collected: number;
    pending: number;
    totalShoots: number;
    completedShoots: number;
    completionRate: number;
  }[];
  monthlyTrend: {
    month: string;
    revenue: number;
    collected: number;
    shoots: number;
  }[];
  totalRevenue: number;
  totalShoots: number;
  completedShoots: number;
  activeClients: number;
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex-1 flex flex-col justify-end h-24 relative group">
      <div className="flex flex-col items-center gap-1">
        <span className="text-[9px] font-black text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          ₹{value > 999 ? `${(value / 1000).toFixed(0)}K` : value}
        </span>
        <div
          className="w-full rounded-t-xl transition-all"
          style={{ height: `${Math.max(pct, 4)}%`, background: color, minHeight: '4px' }}
        />
      </div>
    </div>
  );
}

export default function SubscriptionAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getSubscriptionAnalytics();
    setData(res as Analytics);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <SubscriptionLoader title="Subscription Analytics" subtitle="Analyzing financial trends & shoot delivery..." showSkeletonPreview={false} />;
  }

  const maxRevenue = data?.monthlyTrend
    ? Math.max(...data.monthlyTrend.map((t) => Math.max(t.revenue, t.collected)), 1)
    : 1;

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/subscriptions')}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#16181c] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:border-[#e50914]/40 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1.5 h-5 bg-[#e50914] rounded-full" />
              <span className="text-[11px] font-black text-[#e50914] uppercase tracking-[0.15em]">Subscription Analytics</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Business Performance</h1>
          </div>
          <div className="ml-auto">
            <button
              onClick={load}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-[#16181c] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:border-[#e50914]/40 transition-all cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Top Stats */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: 'Total Collected',
                value: `₹${(data.totalRevenue / 100000).toFixed(1)}L`,
                sub: 'All time',
                gradient: 'from-emerald-500 to-green-600',
                icon: <IndianRupee className="w-5 h-5 text-white" />,
              },
              {
                label: 'Active Clients',
                value: data.activeClients.toString(),
                sub: `${data.clientRevenue.length} total`,
                gradient: 'from-[#e50914] to-rose-600',
                icon: <Users className="w-5 h-5 text-white" />,
              },
              {
                label: 'Total Shoots',
                value: data.totalShoots.toString(),
                sub: 'Scheduled all time',
                gradient: 'from-purple-500 to-violet-600',
                icon: <Camera className="w-5 h-5 text-white" />,
              },
              {
                label: 'Completion Rate',
                value: data.totalShoots > 0
                  ? `${Math.round((data.completedShoots / data.totalShoots) * 100)}%`
                  : '—',
                sub: `${data.completedShoots} completed`,
                gradient: 'from-blue-500 to-indigo-600',
                icon: <CheckCircle2 className="w-5 h-5 text-white" />,
              },
            ].map((card) => (
              <div key={card.label} className="bg-white dark:bg-[#16181c] rounded-[22px] border border-gray-100 dark:border-gray-800/70 p-5 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{card.value}</p>
                  <p className="text-[11px] text-gray-400">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Revenue Chart */}
        {data && data.monthlyTrend.length > 0 && (
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-gray-900 dark:text-white">Revenue Trend</h3>
                <p className="text-xs text-gray-400 mt-0.5">Last 12 months — expected vs collected</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <span className="text-xs text-gray-400 font-bold">Expected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-gray-400 font-bold">Collected</span>
                </div>
              </div>
            </div>
            <div className="flex items-end gap-2 h-32">
              {data.monthlyTrend.map((t, i) => (
                <div key={i} className="flex-1 flex items-end gap-0.5 h-full">
                  <div className="flex flex-col items-center gap-1 w-full">
                    <div className="flex items-end gap-0.5 w-full h-24">
                      <Bar value={t.revenue} max={maxRevenue} color="#e5091430" />
                      <Bar value={t.collected} max={maxRevenue} color="#22c55e" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 text-center">{t.month}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Client Revenue Table */}
        {data && data.clientRevenue.length > 0 && (
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-black text-gray-900 dark:text-white">Client-wise Revenue</h3>
              <p className="text-xs text-gray-400 mt-0.5">Performance breakdown per client</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#1c1f24]">
                    {['Client', 'Monthly Fee', 'Collected', 'Pending', 'Shoots', 'Completion', 'Status'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.clientRevenue.sort((a, b) => b.monthlyFee - a.monthlyFee).map((client, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#1c1f24] transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e50914] to-rose-600 flex items-center justify-center font-black text-white text-xs shrink-0">
                            {client.clientName.charAt(0)}
                          </div>
                          <span className="font-black text-gray-900 dark:text-white text-sm">{client.clientName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-black text-gray-900 dark:text-white text-sm">
                          ₹{client.monthlyFee.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{client.collected.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`font-bold text-sm ${client.pending > 0 ? 'text-amber-500' : 'text-gray-300 dark:text-gray-700'}`}>
                          {client.pending > 0 ? `₹${client.pending.toLocaleString('en-IN')}` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {client.completedShoots}/{client.totalShoots}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#e50914] to-rose-500"
                              style={{ width: `${client.completionRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-gray-500">{client.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                          client.status === 'Active'
                            ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                            : client.status === 'Paused'
                            ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {data && data.clientRevenue.length === 0 && (
          <div className="bg-white dark:bg-[#16181c] rounded-[24px] border border-gray-100 dark:border-gray-800/70 p-16 text-center">
            <BarChart3 className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No analytics data yet</h3>
            <p className="text-gray-400 text-sm">Add subscriptions and record payments to see analytics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
