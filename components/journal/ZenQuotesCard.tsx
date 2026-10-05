'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Quote, ShieldAlert, Compass } from 'lucide-react';

export const ZEN_TRADING_QUOTES = [
  {
    quote: "The goal of a successful trader is to make the best trades. Money is secondary.",
    author: "Alexander Elder",
    tag: "Mindset"
  },
  {
    quote: "If you can learn to accept the risk, you will not feel emotional about any single outcome.",
    author: "Mark Douglas (Trading in the Zone)",
    tag: "Risk Acceptance"
  },
  {
    quote: "It's not whether you're right or wrong that's important, but how much money you make when you're right and how much you lose when you're wrong.",
    author: "George Soros",
    tag: "Risk/Reward"
  },
  {
    quote: "Plan your trade and trade your plan. The market does not care about your feelings.",
    author: "Zen Trading Rule #1",
    tag: "Discipline"
  },
  {
    quote: "Never average losing positions. Decrease your trading volume when trading poorly; increase it when trading well.",
    author: "Paul Tudor Jones",
    tag: "Risk Management"
  },
  {
    quote: "The market is a device for transferring money from the impatient to the patient.",
    author: "Warren Buffett",
    tag: "Patience"
  },
  {
    quote: "Losses are the cost of doing business in trading. The only unforgivable mistake is letting a small loss become a catastrophe.",
    author: "Marty Schwartz",
    tag: "Capital Preservation"
  },
  {
    quote: "When you trade out of FOMO, you are handing your capital to someone who waited for their setup.",
    author: "Zen Trading Wisdom",
    tag: "Emotional Control"
  },
  {
    quote: "Your edge is not in predicting the future; your edge is in managing the probabilities when the setup occurs.",
    author: "Mark Douglas",
    tag: "Probabilities"
  },
  {
    quote: "A single undisciplined trade can destroy weeks of disciplined execution. Protect your capital with your life.",
    author: "Jesse Livermore",
    tag: "Discipline"
  }
];

export default function ZenQuotesCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // Pick a quote based on current day of month on load
    const day = new Date().getDate();
    setCurrentIndex(day % ZEN_TRADING_QUOTES.length);
  }, []);

  const handleNextQuote = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % ZEN_TRADING_QUOTES.length);
      setFade(true);
    }, 200);
  };

  const item = ZEN_TRADING_QUOTES[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-[#181215] to-[#121418] p-6 text-white border border-red-500/20 shadow-xl shadow-red-950/20">
      {/* Decorative Glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#e50914]/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        {/* Top badge & refresh button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-[#e50914] flex items-center justify-center border border-red-500/30">
              <Quote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-red-400">Zen Discipline</p>
              <p className="text-[10px] text-gray-400 font-semibold">{item.tag}</p>
            </div>
          </div>

          <button
            onClick={handleNextQuote}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95 border border-white/10"
            title="Next trading quote"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quote text */}
        <div className={`transition-opacity duration-300 min-h-[72px] flex flex-col justify-center ${fade ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-sm md:text-[15px] font-semibold text-gray-100 italic leading-relaxed">
            &ldquo;{item.quote}&rdquo;
          </p>
          <p className="text-xs font-bold text-red-400 mt-2 text-right">
            — {item.author}
          </p>
        </div>

        {/* Bottom Rule checklist */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            Stick to the Edge
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Fixed Stop Losses
          </span>
          <span className="flex items-center gap-1.5 text-red-400 font-bold">
            Zero Revenge
          </span>
        </div>
      </div>
    </div>
  );
}
