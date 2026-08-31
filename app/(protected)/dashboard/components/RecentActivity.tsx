'use client';

import React, { useEffect, useState } from 'react';
import { getPayments } from '@/services/api';
import { Payment } from '@/lib/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function RecentActivity() {
  const [activities, setActivities] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayments().then(data => {
      // Just taking the top 5 payments as recent activity for now
      setActivities(data.slice(0, 5));
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="w-full font-sans text-gray-800">
      <h3 className="text-[17px] font-extrabold text-[#1a1c22] mb-6">Recent Payments</h3>
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-50 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-4 bg-gray-50/40 rounded-2xl border border-gray-150/40 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#eaf2ff] text-[#0263e0] border border-[#d2e4ff] flex items-center justify-center font-extrabold text-[15px] shrink-0 shadow-sm">
                  {activity.customerName.charAt(0)}
                </div>
                <div>
                  <p className="text-[13.5px] font-extrabold text-[#1a1c22]">{activity.customerName}</p>
                  <p className="text-[11.5px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">Paid via {activity.paymentMethod}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-black text-emerald-600">+₹{activity.amount.toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{dayjs(activity.date).fromNow()}</p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-[13px] text-gray-400 font-bold text-center py-6 uppercase tracking-wider">No recent payments logged.</p>
          )}
        </div>
      )}
    </div>
  );
}
