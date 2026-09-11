'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  X, 
  Loader2, 
  Briefcase, 
  Users, 
  FileText, 
  CreditCard, 
  Sparkles, 
  FolderPlus, 
  Calendar, 
  Share2, 
  Settings, 
  ChevronRight, 
  ArrowUpRight,
  Command,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { searchUniversalAction } from '@/app/actions';
import { useUIStore } from '@/store/uiStore';

type CategoryFilter = 'all' | 'cases' | 'crew' | 'quotations' | 'payments' | 'actions';

interface UniversalSearchBarProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  variant?: 'topbar' | 'compact' | 'hero';
  onSelectResult?: () => void;
  autoFocus?: boolean;
}

export default function UniversalSearchBar({
  placeholder = 'Search cases, crew, quotes, payments...',
  className = '',
  inputClassName = '',
  variant = 'topbar',
  onSelectResult,
  autoFocus = false,
}: UniversalSearchBarProps) {
  const router = useRouter();
  const openCommandPalette = useUIStore((state) => state.openCommandPalette);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [results, setResults] = useState<any[]>([]);
  const [categoriesCount, setCategoriesCount] = useState<Record<string, number>>({
    all: 0,
    cases: 0,
    crew: 0,
    quotations: 0,
    payments: 0,
    actions: 0,
  });
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Perform search query
  const performSearch = (searchTerm: string) => {
    startTransition(async () => {
      try {
        const res = await searchUniversalAction(searchTerm);
        if (res?.success) {
          setResults(res.results || []);
          setCategoriesCount(res.categoriesCount || { all: 0, cases: 0, crew: 0, quotations: 0, payments: 0, actions: 0 });
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
    });
  };

  // Debounced input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(val);
    }, 180);
  };

  // Filtered results based on active tab
  const filteredResults = activeCategory === 'all' 
    ? results 
    : results.filter((item) => item.category === activeCategory);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation inside suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
        e.preventDefault();
        handleSelect(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // On selecting a result item
  const handleSelect = (item: any) => {
    setIsOpen(false);
    if (onSelectResult) onSelectResult();
    if (item.url) {
      router.push(item.url);
    }
  };

  // Category Icon Resolver
  const renderItemIcon = (category: string, iconName?: string) => {
    switch (category) {
      case 'cases':
        return <Briefcase className="w-4 h-4 text-[#e50914]" />;
      case 'crew':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'quotations':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'payments':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'actions':
      default:
        if (iconName === 'calendar') return <Calendar className="w-4 h-4 text-amber-500" />;
        if (iconName === 'share-2') return <Share2 className="w-4 h-4 text-rose-500" />;
        if (iconName === 'settings') return <Settings className="w-4 h-4 text-gray-500" />;
        if (iconName === 'folder-plus') return <FolderPlus className="w-4 h-4 text-[#e50914]" />;
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  // Helper to highlight matching text in title/subtitle
  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim() || !text) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="font-extrabold text-[#e50914] dark:text-red-400 underline decoration-red-400/40">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Preset categories for pill tabs
  const categoryPills: { id: CategoryFilter; label: string; countKey: string }[] = [
    { id: 'all', label: 'All', countKey: 'all' },
    { id: 'cases', label: 'Cases', countKey: 'cases' },
    { id: 'crew', label: 'Crew', countKey: 'crew' },
    { id: 'quotations', label: 'Quotes', countKey: 'quotations' },
    { id: 'payments', label: 'Payments', countKey: 'payments' },
    { id: 'actions', label: 'Actions', countKey: 'actions' },
  ];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Bar */}
      <div
        className={`flex items-center px-4 py-2.5 bg-[#fee2e2]/40 dark:bg-gray-800/40 rounded-2xl border border-gray-200/50 dark:border-gray-700/60 transition-all duration-200 shadow-xs focus-within:bg-white dark:focus-within:bg-[#15181e] focus-within:border-[#e50914]/50 focus-within:ring-2 focus-within:ring-[#e50914]/15 ${
          variant === 'hero' ? 'py-3.5 px-5 rounded-3xl text-[14px]' : 'text-[13px]'
        }`}
      >
        <Search className="text-gray-400 dark:text-gray-400 w-4.5 h-4.5 mr-2.5 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            if (results.length === 0) performSearch(query);
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={`bg-transparent border-none focus:outline-none w-full font-semibold placeholder:text-gray-400 text-gray-800 dark:text-white ${inputClassName}`}
        />

        {/* Loading Spinner */}
        {isPending && (
          <Loader2 className="w-4 h-4 text-[#e50914] animate-spin shrink-0 mr-2" />
        )}

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              performSearch('');
              inputRef.current?.focus();
            }}
            className="p-1 hover:bg-gray-200/70 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mr-1 cursor-pointer"
            title="Clear Search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Keyboard shortcut badge */}
        <div 
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-gray-200/60 dark:bg-gray-700/60 border border-gray-300/40 dark:border-gray-600/40 text-[10px] font-extrabold text-gray-500 dark:text-gray-300 shrink-0 cursor-pointer hover:bg-gray-300/70 transition-colors"
          title="Open Command Palette (⌘K)"
        >
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>

      {/* Auto-Suggestions Floating Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 dark:bg-[#15181e]/95 backdrop-blur-xl border border-[#fee2e2]/80 dark:border-gray-800 rounded-3xl shadow-2xl shadow-black/10 overflow-hidden animate-fade-in max-h-[460px] flex flex-col">
          {/* Category Filter Pills Bar */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-150 dark:border-gray-800 overflow-x-auto custom-scrollbar bg-gray-50/50 dark:bg-gray-900/30">
            {categoryPills.map((pill) => {
              const count = categoriesCount[pill.countKey] || 0;
              const isActive = activeCategory === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setActiveCategory(pill.id)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#e50914] text-white shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/60'
                  }`}
                >
                  <span>{pill.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-md font-extrabold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredResults.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Search className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 stroke-1" />
                <div className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                  {query ? `No records found for "${query}"` : 'No items found'}
                </div>
                <p className="text-[11px] text-gray-400 font-medium">
                  Try searching with client name, event type (e.g. Wedding), crew role, or location.
                </p>
              </div>
            ) : (
              filteredResults.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={`${item.category}_${item.id}_${idx}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-150 group ${
                      isSelected
                        ? 'bg-[#fef2f2] dark:bg-red-950/40 text-gray-900 dark:text-white ring-1 ring-red-400/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon Avatar Box */}
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                        {renderItemIcon(item.category, item.icon)}
                      </div>

                      {/* Title & Subtitle */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold truncate">
                            {highlightMatch(item.title, query)}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                                item.badgeColor || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-400 font-medium truncate mt-0.5">
                          {highlightMatch(item.subtitle, query)}
                        </p>
                      </div>
                    </div>

                    {/* Right Price / Arrow Action */}
                    <div className="flex items-center gap-2.5 pl-3 shrink-0">
                      {item.amount > 0 && (
                        <span className="text-[12px] font-black text-gray-900 dark:text-white">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </span>
                      )}
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-[#e50914] group-hover:bg-[#fee2e2]/60 dark:group-hover:bg-red-950/40 transition-all">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Footer Tip Bar */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-150 dark:border-gray-800/80 flex items-center justify-between text-[10.5px] text-gray-400 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[9px]">↑↓</span> to navigate
              <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[9px] ml-1">↵</span> to select
            </span>
            <span className="text-[#e50914] font-extrabold uppercase tracking-wide">
              {filteredResults.length} {filteredResults.length === 1 ? 'Result' : 'Results'} Found
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
