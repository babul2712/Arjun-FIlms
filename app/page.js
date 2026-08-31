'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#f0f4fa] text-[#1e2229] font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-3xl bg-white p-2 flex items-center justify-center shadow-xl border border-gray-200/60 animate-bounce">
          <img src="/logo.jpeg" alt="Arjun Films" className="w-full h-full object-contain rounded-2xl" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1c22]">Arjun Films CRM</h1>
        <p className="text-[13px] text-gray-400 font-bold uppercase tracking-wider">Redirecting you to dashboard...</p>
      </div>
    </div>
  );
}
