'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';

interface AnimatedCashAmountProps {
  amount: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  sparkle?: boolean;
  currencyClassName?: string;
  showSparkleBadge?: boolean;
  animateOnMount?: boolean;
  colorScheme?: 'default' | 'emerald' | 'crimson' | 'gold' | 'white';
}

export default function AnimatedCashAmount({
  amount,
  prefix = '₹',
  suffix = '',
  duration = 1000,
  className = '',
  sparkle = true,
  currencyClassName = '',
  showSparkleBadge = false,
  animateOnMount = true,
  colorScheme = 'default',
}: AnimatedCashAmountProps) {
  const [displayValue, setDisplayValue] = useState<number>(animateOnMount ? 0 : amount);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const previousAmountRef = useRef<number>(animateOnMount ? 0 : amount);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = previousAmountRef.current;
    const endValue = Number(amount) || 0;
    const startTime = performance.now();

    setIsAnimating(true);

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-Out Exponential curve
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.round(startValue + (endValue - startValue) * easeOutExpo);

      setDisplayValue(currentVal);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
        previousAmountRef.current = endValue;
      }
    };

    animFrameRef.current = requestAnimationFrame(updateCounter);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [amount, duration]);

  // Color schemes
  const colorStyles = {
    default: 'text-inherit',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    crimson: 'text-[#e50914] dark:text-[#ff4d58]',
    gold: 'text-amber-500 dark:text-amber-400',
    white: 'text-white',
  }[colorScheme];

  const formattedValue = displayValue.toLocaleString('en-IN');

  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`inline-flex items-center gap-0.5 relative group select-none font-sans ${colorStyles} ${className}`}
    >
      {/* Currency Symbol with gentle cash shimmer & bounce */}
      {prefix && (
        <span
          className={`font-black opacity-90 transition-transform duration-300 group-hover:scale-110 inline-block ${currencyClassName}`}
        >
          {prefix}
        </span>
      )}

      {/* Main Rolling Cash Digits with Cash Glow */}
      <span className="tabular-nums tracking-tight font-black transition-all">
        {formattedValue}
      </span>

      {suffix && (
        <span className="text-[0.75em] opacity-80 ml-0.5 font-bold uppercase">
          {suffix}
        </span>
      )}

      {/* Sparkle Cash Coin Flare on Hover or Animating */}
      {sparkle && (
        <span
          className={`inline-flex items-center transition-all duration-300 ml-1 ${
            isAnimating || isHovered
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-50 pointer-events-none'
          }`}
          title="Verified Live Treasury"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
        </span>
      )}

      {/* Floating Sparkle Micro-Badge */}
      {showSparkleBadge && (
        <span className="absolute -top-3 -right-6 px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black rounded-full uppercase tracking-widest scale-75 animate-pulse">
          INR
        </span>
      )}
    </span>
  );
}
