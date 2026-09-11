'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { getEventTypes, createEventType } from '@/app/actions';
import { toast } from 'sonner';

interface EventTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  selectClassName?: string;
  required?: boolean;
}

export default function EventTypeSelect({
  value,
  onChange,
  className = '',
  selectClassName = '',
  required = false,
}: EventTypeSelectProps) {
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const types = await getEventTypes();
      if (Array.isArray(types)) {
        setEventTypes(types);
      }
    } catch (err) {
      console.error('Failed to load event types', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === 'ADD_NEW_EVENT_TYPE') {
      setIsAddingNew(true);
      setNewTypeName('');
    } else {
      onChange(selected);
    }
  };

  const handleSaveNewType = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTypeName.trim();
    if (!trimmed) {
      toast.error('Please enter an event type name');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createEventType(trimmed);
      const createdName = created?.name || trimmed;

      // Add to list if not already present
      setEventTypes((prev) => {
        if (prev.some((t) => (t.name || '').toLowerCase() === createdName.toLowerCase())) {
          return prev;
        }
        return [...prev, created || { _id: Date.now().toString(), name: createdName }].sort(
          (a, b) => a.name.localeCompare(b.name)
        );
      });

      onChange(createdName);
      setIsAddingNew(false);
      setNewTypeName('');
      toast.success(`Event Type "${createdName}" added and selected!`);
    } catch (error: any) {
      console.error('Error adding event type', error);
      toast.error(error?.message || 'Failed to add event type');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAddingNew) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative flex-1">
          <input
            type="text"
            autoFocus
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveNewType();
              }
              if (e.key === 'Escape') {
                setIsAddingNew(false);
              }
            }}
            placeholder="Type new event name (e.g. Haldi Ceremony)..."
            className="w-full bg-transparent border-b-2 border-[#e50914] py-1.5 px-1 text-[15px] text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400"
          />
        </div>

        <button
          type="button"
          onClick={() => handleSaveNewType()}
          disabled={isSubmitting || !newTypeName.trim()}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#e50914] hover:bg-[#c70812] text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          title="Save & Select New Event Type"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          <span>Save</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAddingNew(false)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Ensure current value is included in options even if it was custom
  const hasCurrentValueInList = eventTypes.some(
    (t) => (t.name || '').toLowerCase() === (value || '').toLowerCase()
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select
        required={required}
        value={value}
        onChange={handleSelectChange}
        className={`flex-1 bg-transparent border-b border-gray-300 dark:border-gray-700 py-2 focus:outline-none focus:border-[#e50914] text-[15px] text-gray-900 dark:text-white cursor-pointer ${selectClassName}`}
      >
        {!value && <option value="" className="bg-white dark:bg-[#1a1d24] text-gray-400">Select Event Type...</option>}
        {value && !hasCurrentValueInList && (
          <option value={value} className="bg-white dark:bg-[#1a1d24] text-gray-900 dark:text-white">{value}</option>
        )}
        {eventTypes.map((type) => (
          <option key={type._id || type.name} value={type.name} className="bg-white dark:bg-[#1a1d24] text-gray-900 dark:text-white">
            {type.name}
          </option>
        ))}
        <option disabled className="bg-white dark:bg-[#1a1d24] text-gray-400">──────────</option>
        <option value="ADD_NEW_EVENT_TYPE" className="bg-white dark:bg-[#1a1d24] font-bold text-[#e50914]">
          ✨ + Add New Event Type...
        </option>
      </select>

      <button
        type="button"
        onClick={() => {
          setIsAddingNew(true);
          setNewTypeName('');
        }}
        className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-950/40 text-gray-600 dark:text-gray-300 hover:text-[#e50914] transition-all cursor-pointer shrink-0 active:scale-95"
        title="Add New Custom Event Type"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
