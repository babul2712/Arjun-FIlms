'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Plus, Check, Camera, Heart, Calendar, Trash2, X, Search, Settings2, SlidersHorizontal } from 'lucide-react';
import { getEventTypes, createEventType, deleteEventType } from '@/app/actions';
import { toast } from 'sonner';
import AutoSearchInput, { AutoSearchOption } from '@/components/ui/AutoSearchInput';

export interface EventTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  selectClassName?: string;
  required?: boolean;
  label?: string;
  placeholder?: string;
  showManageButton?: boolean;
}

const DEFAULT_CEREMONIES: AutoSearchOption[] = [
  { label: 'Wedding Ceremony (Vivaha)', value: 'Wedding Ceremony (Vivaha)', sublabel: 'Main sacred rituals & pheras', badge: 'Wedding', badgeColor: 'red' },
  { label: 'Haldi & Snana Ceremony', value: 'Haldi & Snana Ceremony', sublabel: 'Turmeric ritual, joyous splashes', badge: 'Ceremony', badgeColor: 'amber' },
  { label: 'Mehendi & Sangeet Night', value: 'Mehendi & Sangeet Night', sublabel: 'Henna, dance & music fiesta', badge: 'Pre-Wedding', badgeColor: 'purple' },
  { label: 'Ring Ceremony & Engagement', value: 'Ring Ceremony & Engagement', sublabel: 'Official ring exchange & toast', badge: 'Engagement', badgeColor: 'blue' },
  { label: 'Reception & Gala Dinner', value: 'Reception & Gala Dinner', sublabel: 'Post-wedding grand reception', badge: 'Reception', badgeColor: 'emerald' },
  { label: 'Godh Bharai (Baby Shower)', value: 'Godh Bharai (Baby Shower)', sublabel: 'Traditional maternity blessings', badge: 'Tradition', badgeColor: 'amber' },
  { label: 'Thread Ceremony (Bratopayan / Upanayana)', value: 'Thread Ceremony (Bratopayan / Upanayana)', sublabel: 'Sacred thread ritual', badge: 'Sacred', badgeColor: 'purple' },
  { label: 'Pre-Wedding Cinematic Story Shoot', value: 'Pre-Wedding Cinematic Story Shoot', sublabel: 'Outdoor narrative & concept film', badge: 'Pre-Wedding', badgeColor: 'purple' },
  { label: 'Post-Wedding & Honeymoon Shoot', value: 'Post-Wedding & Honeymoon Shoot', sublabel: 'Creative post-marriage portraits', badge: 'Wedding', badgeColor: 'red' },
  { label: 'Maternity & Newborn Portraiture', value: 'Maternity & Newborn Portraiture', sublabel: 'Gentle family & newborn captures', badge: 'Portrait', badgeColor: 'emerald' },
  { label: 'Birthday & Milestone Party', value: 'Birthday & Milestone Party', sublabel: 'Birthday bash & celebration', badge: 'Party', badgeColor: 'blue' },
  { label: 'Anniversary Celebration', value: 'Anniversary Celebration', sublabel: 'Silver / Golden milestone gala', badge: 'Party', badgeColor: 'blue' },
  { label: 'Griha Pravesh (Housewarming)', value: 'Griha Pravesh (Housewarming)', sublabel: 'New home entry puja & feast', badge: 'Puja', badgeColor: 'amber' },
  { label: 'Namkaran (Naming Ceremony)', value: 'Namkaran (Naming Ceremony)', sublabel: 'Baby naming blessing ceremony', badge: 'Tradition', badgeColor: 'emerald' },
  { label: 'Corporate Summit & Brand Launch', value: 'Corporate Summit & Brand Launch', sublabel: 'Business conference & exhibition', badge: 'Corporate', badgeColor: 'gray' },
  { label: 'Fashion & Commercial Portfolio', value: 'Fashion & Commercial Portfolio', sublabel: 'Studio & editorial lookbook', badge: 'Fashion', badgeColor: 'purple' },
];

export default function EventTypeSelect({
  value,
  onChange,
  className = '',
  required = false,
  label = 'Event Ceremony / Type',
  placeholder = 'Search ceremony or add new (e.g. Haldi, Vivaha)...',
  showManageButton = true,
}: EventTypeSelectProps) {
  const [dbEventTypes, setDbEventTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newCeremonyInput, setNewCeremonyInput] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const types = await getEventTypes();
      if (Array.isArray(types)) {
        setDbEventTypes(types);
      }
    } catch (err) {
      console.error('Failed to load event types', err);
    } finally {
      setLoading(false);
    }
  };

  // Combine default ceremonies with any dynamic ceremonies saved in DB
  const mergedOptions: AutoSearchOption[] = useMemo(() => {
    const list: AutoSearchOption[] = [...DEFAULT_CEREMONIES];
    const seen = new Set(list.map((o) => o.value.toLowerCase()));

    dbEventTypes.forEach((t) => {
      const name = t.name || '';
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({
          value: name,
          label: name,
          sublabel: 'Custom Studio Ceremony',
          badge: 'Custom',
          badgeColor: 'red',
          data: t,
        });
      }
    });

    // If current value is not present in options, add it as selected
    if (value && !seen.has(value.toLowerCase())) {
      list.unshift({
        value,
        label: value,
        sublabel: 'Selected Ceremony',
        badge: 'Selected',
        badgeColor: 'emerald',
      });
    }

    return list;
  }, [dbEventTypes, value]);

  const handleCreateNewCeremony = async (newCeremonyName: string) => {
    const trimmed = newCeremonyName.trim();
    if (!trimmed) return;

    setIsCreating(true);
    try {
      const created = await createEventType(trimmed);
      const createdName = created?.name || trimmed;

      setDbEventTypes((prev) => {
        if (prev.some((t) => (t.name || '').toLowerCase() === createdName.toLowerCase())) {
          return prev;
        }
        return [...prev, created || { _id: Date.now().toString(), name: createdName }];
      });

      onChange(createdName);
      setNewCeremonyInput('');
      toast.success(`Ceremony "${createdName}" saved & selected!`);
    } catch (error: any) {
      console.error('Error adding ceremony:', error);
      onChange(trimmed);
      toast.success(`Ceremony "${trimmed}" selected!`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCeremony = async (id: string, name: string) => {
    if (!id) return;
    try {
      await deleteEventType(id);
      setDbEventTypes((prev) => prev.filter((t) => (t._id || t.id) !== id));
      if (value === name) {
        onChange('');
      }
      toast.success(`Ceremony "${name}" deleted`);
    } catch (e) {
      console.error('Failed to delete ceremony', e);
      toast.error('Failed to delete ceremony');
    }
  };

  const filteredCeremonies = useMemo(() => {
    if (!filterQuery.trim()) return mergedOptions;
    const q = filterQuery.toLowerCase();
    return mergedOptions.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        (c.sublabel && c.sublabel.toLowerCase().includes(q)) ||
        (c.badge && c.badge.toLowerCase().includes(q))
    );
  }, [mergedOptions, filterQuery]);

  return (
    <div className={`w-full ${className}`}>
      {/* Label and Manage Header */}
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            {label}
            {required && <span className="text-[#e50914]">*</span>}
          </label>
          {showManageButton && (
            <button
              type="button"
              onClick={() => setIsManageModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e50914] hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-2.5 py-0.5 rounded-md transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3 h-3" />
              <span>Manage / Add</span>
            </button>
          )}
        </div>
      )}

      {/* Main Autosearch Input */}
      <AutoSearchInput
        value={value}
        onChange={(val) => onChange(val)}
        options={mergedOptions}
        icon={<Sparkles className="w-4 h-4 text-[#e50914]" />}
        placeholder={placeholder}
        required={required}
        allowCustom={true}
        onCreateOption={handleCreateNewCeremony}
        createOptionLabel="Add & save new ceremony"
      />

      {/* Manage Ceremonies Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-xl bg-white dark:bg-[#181a20] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 text-[#e50914] flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Manage Event Types & Ceremonies
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    Add new rituals, explore catalog, or select for current form
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Add Section */}
            <div className="pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Add New Ceremony / Event Type
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newCeremonyInput.trim()) {
                    handleCreateNewCeremony(newCeremonyInput);
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={newCeremonyInput}
                  onChange={(e) => setNewCeremonyInput(e.target.value)}
                  placeholder="e.g. Ring Ceremony & Cocktail Night"
                  className="flex-1 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                />
                <button
                  type="submit"
                  disabled={!newCeremonyInput.trim() || isCreating}
                  className="px-4 py-2.5 bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isCreating ? 'Adding...' : 'Add Ceremony'}
                </button>
              </form>
            </div>

            {/* Search Filter in Modal */}
            <div className="py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter ceremonies by ritual, category or name..."
                  className="w-full bg-gray-50/70 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#e50914]"
                />
              </div>
            </div>

            {/* List of ceremonies */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[220px]">
              {filteredCeremonies.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">
                  No ceremonies match &quot;{filterQuery}&quot;. Click &quot;Add Ceremony&quot; to create it.
                </div>
              ) : (
                filteredCeremonies.map((ceremony) => {
                  const isSelected = value === ceremony.value;
                  const isCustom = dbEventTypes.some(
                    (t) => (t.name || '').toLowerCase() === ceremony.value.toLowerCase()
                  );
                  const dbRecord = dbEventTypes.find(
                    (t) => (t.name || '').toLowerCase() === ceremony.value.toLowerCase()
                  );

                  return (
                    <div
                      key={ceremony.value}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-[#e50914] bg-red-50/60 dark:bg-red-950/20 shadow-xs'
                          : 'border-gray-100 dark:border-gray-800/80 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#e50914] text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                              {ceremony.label}
                            </span>
                            {ceremony.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">
                                {ceremony.badge}
                              </span>
                            )}
                          </div>
                          {ceremony.sublabel && (
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {ceremony.sublabel}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e50914] bg-red-100/80 px-2.5 py-1 rounded-lg">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onChange(ceremony.value);
                              setIsManageModalOpen(false);
                              toast.success(`Selected "${ceremony.label}"`);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                          >
                            Select
                          </button>
                        )}

                        {isCustom && dbRecord?._id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCeremony(dbRecord._id, ceremony.value)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Delete custom ceremony"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500">
              <span>{mergedOptions.length} ceremonies available</span>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-xs hover:opacity-90 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
