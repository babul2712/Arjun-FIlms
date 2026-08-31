'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#f0f4fa] text-[#1e2229] font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#0066fe] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1c22]">Arjun Photography CRM</h1>
        <p className="text-[14px] text-gray-400 font-semibold uppercase tracking-wider">Redirecting you to dashboard...</p>
      </div>
    </div>
  );
}
