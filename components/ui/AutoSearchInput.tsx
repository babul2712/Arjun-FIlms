'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { Search, X, Check, Plus, Loader2, ChevronDown } from 'lucide-react';

export interface AutoSearchOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: 'red' | 'emerald' | 'blue' | 'amber' | 'purple' | 'gray';
  icon?: React.ReactNode;
  avatar?: string;
  data?: any;
}

export interface AutoSearchInputProps {
  value: string;
  onChange: (value: string, selectedOption?: AutoSearchOption) => void;
  options?: (string | AutoSearchOption)[];
  fetchOptions?: (query: string) => Promise<(string | AutoSearchOption)[]>;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  allowCustom?: boolean; // If true, user can type values not present in options
  onCreateOption?: (newVal: string) => void | Promise<void>;
  createOptionLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  helperText?: string;
  error?: string;
  clearable?: boolean;
  maxDropdownHeight?: string;
  minSearchLength?: number;
}

export default function AutoSearchInput({
  value,
  onChange,
  options = [],
  fetchOptions,
  placeholder = 'Search or select...',
  label,
  required = false,
  disabled = false,
  allowCustom = true,
  onCreateOption,
  createOptionLabel = 'Create new option',
  icon,
  className = '',
  inputClassName = '',
  dropdownClassName = '',
  autoFocus = false,
  name,
  id,
  helperText,
  error,
  clearable = true,
  maxDropdownHeight = 'max-h-60',
  minSearchLength = 0,
}: AutoSearchInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [asyncOptions, setAsyncOptions] = useState<AutoSearchOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Sync external value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Convert raw options (string or AutoSearchOption) to uniform format
  const normalizedOptions: AutoSearchOption[] = React.useMemo(() => {
    const list = fetchOptions ? asyncOptions : options;
    return list.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options, asyncOptions, fetchOptions]);

  // Filter static options based on current input text
  const filteredOptions: AutoSearchOption[] = React.useMemo(() => {
    if (fetchOptions) return normalizedOptions; // Async already handled

    const query = inputValue.trim().toLowerCase();
    if (!query) return normalizedOptions;

    return normalizedOptions.filter((opt) => {
      const labelMatch = opt.label.toLowerCase().includes(query);
      const valMatch = opt.value.toLowerCase().includes(query);
      const subMatch = opt.sublabel?.toLowerCase().includes(query);
      const badgeMatch = opt.badge?.toLowerCase().includes(query);
      return labelMatch || valMatch || subMatch || badgeMatch;
    });
  }, [normalizedOptions, inputValue, fetchOptions]);

  // Handle Async Search with Debounce
  useEffect(() => {
    if (!fetchOptions) return;
    if (inputValue.length < minSearchLength) {
      setAsyncOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetchOptions(inputValue);
        const formatted = res.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt));
        setAsyncOptions(formatted);
      } catch (err) {
        console.error('AutoSearchInput fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [inputValue, fetchOptions, minSearchLength]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        if (!allowCustom && value) {
          // Reset to last valid value if custom text is not allowed
          setInputValue(value);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [allowCustom, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    setIsOpen(true);
    setHighlightedIndex(-1);

    if (allowCustom) {
      onChange(text);
    }
  };

  const handleSelectOption = (option: AutoSearchOption) => {
    setInputValue(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(option.value, option);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue('');
    onChange('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    const hasOptions = filteredOptions.length > 0;
    const isCreateVisible = onCreateOption && inputValue.trim().length > 0 && !filteredOptions.some(o => o.label.toLowerCase() === inputValue.trim().toLowerCase());
    const totalItems = filteredOptions.length + (isCreateVisible ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0) {
        e.preventDefault();
        if (highlightedIndex < filteredOptions.length) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        } else if (isCreateVisible && onCreateOption) {
          onCreateOption(inputValue.trim());
          setIsOpen(false);
        }
      } else if (isOpen && hasOptions) {
        // Default to first match if enter is pressed
        e.preventDefault();
        handleSelectOption(filteredOptions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Badge color helpers
  const getBadgeClass = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60';
      case 'red':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60';
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200/60 dark:border-gray-700/60';
    }
  };

  // Helper to highlight search query within label
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <strong key={i} className="text-[#e50914] dark:text-red-400 font-black">
              {part}
            </strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const isExactMatch = filteredOptions.some(
    (opt) => opt.label.toLowerCase() === inputValue.trim().toLowerCase()
  );
  const showCreateOption = onCreateOption && inputValue.trim().length > 0 && !isExactMatch;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Optional Form Field Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5"
        >
          {label} {required && <span className="text-[#e50914]">*</span>}
        </label>
      )}

      {/* Input Field Container */}
      <div className="relative flex items-center">
        {/* Left Icon (Search or Custom) */}
        <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#e50914]" />
          ) : icon ? (
            icon
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          autoComplete="off"
          className={`w-full pl-10 pr-16 py-3 bg-gray-50/80 dark:bg-gray-850/80 hover:bg-white dark:hover:bg-gray-850 focus:bg-white dark:focus:bg-[#16181c] border ${
            error
              ? 'border-rose-500'
              : 'border-gray-200/80 dark:border-gray-700/80 focus:border-[#e50914] dark:focus:border-[#e50914]'
          } rounded-2xl text-[13px] font-semibold text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none transition-all duration-200 shadow-xs ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${inputClassName}`}
        />

        {/* Right Controls: Clear button & Dropdown toggle arrow */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {clearable && inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              if (!disabled) {
                setIsOpen(!isOpen);
                inputRef.current?.focus();
              }
            }}
            className={`p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-transform duration-200 cursor-pointer ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Helper text or error message */}
      {error ? (
        <p className="text-[11px] font-bold text-rose-500 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] font-medium text-gray-400 mt-1">{helperText}</p>
      ) : null}

      {/* Autocomplete Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 mt-2 bg-white/95 dark:bg-[#16181c]/95 border border-gray-200/90 dark:border-gray-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-fade-in ${maxDropdownHeight} overflow-y-auto custom-scrollbar ${dropdownClassName}`}
        >
          {filteredOptions.length === 0 && !showCreateOption ? (
            <div className="p-4 text-center text-[12px] font-semibold text-gray-400 dark:text-gray-500">
              {isLoading ? 'Searching...' : 'No matching suggestions found'}
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {/* Render Matching Suggestions */}
              {filteredOptions.map((opt, idx) => {
                const isSelected = value === opt.value || inputValue === opt.label;
                const isHighlighted = highlightedIndex === idx;

                return (
                  <div
                    key={`${opt.value}-${idx}`}
                    onClick={() => handleSelectOption(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-[12.5px] cursor-pointer transition-all ${
                      isHighlighted || isSelected
                        ? 'bg-red-50/70 dark:bg-red-950/30 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Avatar or Icon */}
                      {opt.avatar ? (
                        <img
                          src={opt.avatar}
                          alt={opt.label}
                          className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                        />
                      ) : opt.icon ? (
                        <span className="text-gray-400 dark:text-gray-500 shrink-0">{opt.icon}</span>
                      ) : null}

                      <div className="min-w-0 flex-1">
                        <p className="font-bold truncate leading-tight">
                          {highlightMatch(opt.label, inputValue)}
                        </p>
                        {opt.sublabel && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                            {opt.sublabel}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Badge and Active Checkmark */}
                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span
                          className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getBadgeClass(
                            opt.badgeColor
                          )}`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-[#e50914] stroke-[2.5]" />}
                    </div>
                  </div>
                );
              })}

              {/* "+ Create New Option" Row if permitted */}
              {showCreateOption && (
                <div
                  onClick={() => {
                    if (onCreateOption) {
                      onCreateOption(inputValue.trim());
                      setIsOpen(false);
                    }
                  }}
                  onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 mt-1 border-t border-gray-150 dark:border-gray-800 rounded-xl text-[12.5px] font-bold text-[#e50914] cursor-pointer transition-all ${
                    highlightedIndex === filteredOptions.length
                      ? 'bg-red-50 dark:bg-red-950/40'
                      : 'hover:bg-red-50/60 dark:hover:bg-red-950/20'
                  }`}
                >
                  <div className="p-1 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#e50914]">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>
                    {createOptionLabel}: <strong className="underline">"{inputValue.trim()}"</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
