'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Plus, Check, Trash2, X, Search, Building2, Navigation, Hotel, Palmtree } from 'lucide-react';
import { getVenues, createVenue, deleteVenue } from '@/app/actions';
import { toast } from 'sonner';
import AutoSearchInput, { AutoSearchOption } from '@/components/ui/AutoSearchInput';

export interface VenueLocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  label?: string;
  placeholder?: string;
  showManageButton?: boolean;
}

const DEFAULT_VENUES: AutoSearchOption[] = [
  { label: 'Mayfair Lagoon, Bhubaneswar', value: 'Mayfair Lagoon, Bhubaneswar', sublabel: 'Luxury Resort & Lagoon Lawns, Jaydev Vihar', badge: 'Resort', badgeColor: 'red' },
  { label: 'Welcomhotel by ITC Hotels, Bhubaneswar', value: 'Welcomhotel by ITC Hotels, Bhubaneswar', sublabel: '5-Star Luxury, Dumduma', badge: 'Hotel', badgeColor: 'amber' },
  { label: 'Swosti Chilika Resort', value: 'Swosti Chilika Resort', sublabel: 'Scenic Lakefront Destination, Rambha', badge: 'Destination', badgeColor: 'emerald' },
  { label: 'Puri Heritage Beachfront Resort', value: 'Puri Heritage Beachfront Resort', sublabel: 'Beachside Golden Sands, Puri', badge: 'Beach', badgeColor: 'blue' },
  { label: 'Swosti Premium, Jaydev Vihar', value: 'Swosti Premium, Jaydev Vihar', sublabel: 'Grand Ballrooms & Banquet, Twin City', badge: 'Hotel', badgeColor: 'amber' },
  { label: 'Vivanta by Taj, DN Square, Bhubaneswar', value: 'Vivanta by Taj, DN Square, Bhubaneswar', sublabel: 'Contemporary Luxury & Terrace Lawn', badge: 'Hotel', badgeColor: 'purple' },
  { label: 'The Crown Hotel, Nayapalli', value: 'The Crown Hotel, Nayapalli', sublabel: 'Premium City Center Banquets', badge: 'Banquet', badgeColor: 'gray' },
  { label: 'Pal Heights Mantra, Pahala', value: 'Pal Heights Mantra, Pahala', sublabel: 'Lush Green Wedding Lawns & Poolside', badge: 'Resort', badgeColor: 'emerald' },
  { label: 'Arjun Films Studio HQ (Hanspal)', value: 'Arjun Films Studio HQ (Hanspal)', sublabel: 'Indoor Cyclorama & Audio Studio', badge: 'Studio HQ', badgeColor: 'red' },
  { label: 'Cuttack Heritage & Riverfront (Barabati)', value: 'Cuttack Heritage & Riverfront (Barabati)', sublabel: 'Historic Mahanadi Riverfront Venue', badge: 'Heritage', badgeColor: 'blue' },
  { label: 'Udaipur Heritage Palace & Fort', value: 'Udaipur Heritage Palace & Fort', sublabel: 'Royal Palace Destination, Rajasthan', badge: 'Royal', badgeColor: 'purple' },
  { label: 'Goa Luxury Beachside Villa & Resort', value: 'Goa Luxury Beachside Villa & Resort', sublabel: 'Tropical Sunset Coastal Destination', badge: 'Beach', badgeColor: 'emerald' },
  { label: 'Bhubaneswar, Odisha', value: 'Bhubaneswar, Odisha', sublabel: 'Temple City General Locations', badge: 'City', badgeColor: 'gray' },
  { label: 'Cuttack, Odisha', value: 'Cuttack, Odisha', sublabel: 'Silver City Historic General', badge: 'City', badgeColor: 'gray' },
];

const VENUE_CATEGORIES = [
  'Resort',
  'Hotel',
  'Destination',
  'Beach',
  'Heritage',
  'Studio HQ',
  'Lawn / Garden',
  'Banquet Hall',
  'City',
];

export default function VenueLocationSelect({
  value,
  onChange,
  className = '',
  required = false,
  label = 'Shoot Location / Venue',
  placeholder = 'Search venue, resort or enter city (e.g. Mayfair, Puri)...',
  showManageButton = true,
}: VenueLocationSelectProps) {
  const [dbVenues, setDbVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  
  // New venue form state
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueCity, setNewVenueCity] = useState('');
  const [newVenueCategory, setNewVenueCategory] = useState('Resort');
  const [isCreating, setIsCreating] = useState(false);

  // Search filter inside modal
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const venues = await getVenues();
      if (Array.isArray(venues)) {
        setDbVenues(venues);
      }
    } catch (err) {
      console.error('Failed to load venues', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (cat: string) => {
    switch ((cat || '').toLowerCase()) {
      case 'resort':
      case 'royal':
        return 'red';
      case 'hotel':
      case 'banquet':
        return 'amber';
      case 'destination':
      case 'beach':
      case 'lawn / garden':
        return 'emerald';
      case 'heritage':
        return 'purple';
      case 'studio hq':
        return 'red';
      default:
        return 'blue';
    }
  };

  // Combine default venues with DB venues
  const mergedOptions: AutoSearchOption[] = useMemo(() => {
    const list: AutoSearchOption[] = [...DEFAULT_VENUES];
    const seen = new Set(list.map((o) => o.value.toLowerCase()));

    dbVenues.forEach((v) => {
      const name = v.name || '';
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({
          value: name,
          label: name,
          sublabel: v.city || v.address || 'Custom Managed Venue',
          badge: v.category || 'Venue',
          badgeColor: getBadgeColor(v.category) as any,
          data: v,
        });
      }
    });

    // If current value is not present in options, add it as selected
    if (value && !seen.has(value.toLowerCase())) {
      list.unshift({
        value,
        label: value,
        sublabel: 'Selected Shoot Location',
        badge: 'Selected',
        badgeColor: 'emerald',
      });
    }

    return list;
  }, [dbVenues, value]);

  const handleCreateVenue = async (venueData: { name: string; city?: string; category?: string }) => {
    const trimmed = venueData.name.trim();
    if (!trimmed) return;

    setIsCreating(true);
    try {
      const created = await createVenue({
        name: trimmed,
        city: venueData.city || '',
        category: venueData.category || 'Venue',
      });

      const createdName = created?.name || trimmed;

      setDbVenues((prev) => {
        if (prev.some((v) => (v.name || '').toLowerCase() === createdName.toLowerCase())) {
          return prev;
        }
        return [...prev, created || { _id: Date.now().toString(), name: createdName, city: venueData.city, category: venueData.category }];
      });

      onChange(createdName);
      setNewVenueName('');
      setNewVenueCity('');
      toast.success(`Venue "${createdName}" saved & selected!`);
    } catch (error: any) {
      console.error('Error adding venue:', error);
      onChange(trimmed);
      toast.success(`Location "${trimmed}" selected!`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteVenue = async (id: string, name: string) => {
    if (!id) return;
    try {
      await deleteVenue(id);
      setDbVenues((prev) => prev.filter((v) => (v._id || v.id) !== id));
      if (value === name) {
        onChange('');
      }
      toast.success(`Venue "${name}" deleted`);
    } catch (e) {
      console.error('Failed to delete venue', e);
      toast.error('Failed to delete venue');
    }
  };

  const filteredVenues = useMemo(() => {
    if (!filterQuery.trim()) return mergedOptions;
    const q = filterQuery.toLowerCase();
    return mergedOptions.filter(
      (v) =>
        v.label.toLowerCase().includes(q) ||
        (v.sublabel && v.sublabel.toLowerCase().includes(q)) ||
        (v.badge && v.badge.toLowerCase().includes(q))
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
        icon={<MapPin className="w-4 h-4 text-[#e50914]" />}
        placeholder={placeholder}
        required={required}
        allowCustom={true}
        onCreateOption={(name) => handleCreateVenue({ name, category: 'Venue' })}
        createOptionLabel="Add & save new venue"
      />

      {/* Manage Venues Modal */}
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
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Manage Shoot Locations & Venues
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    Add new resorts, destination hotels, or select venue for form
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
            <div className="pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 space-y-2.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Add New Shoot Location / Venue
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newVenueName.trim()) {
                    handleCreateVenue({
                      name: newVenueName,
                      city: newVenueCity,
                      category: newVenueCategory,
                    });
                  }
                }}
                className="space-y-2.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={newVenueName}
                      onChange={(e) => setNewVenueName(e.target.value)}
                      placeholder="Venue Name (e.g. Mayfair Palm Beach)"
                      required
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={newVenueCity}
                      onChange={(e) => setNewVenueCity(e.target.value)}
                      placeholder="City / State"
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={newVenueCategory}
                      onChange={(e) => setNewVenueCategory(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914] cursor-pointer"
                    >
                      {VENUE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newVenueName.trim() || isCreating}
                    className="px-4 py-2 bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isCreating ? 'Saving Venue...' : 'Save & Select Venue'}
                  </button>
                </div>
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
                  placeholder="Search venue by name, city, resort or type..."
                  className="w-full bg-gray-50/70 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#e50914]"
                />
              </div>
            </div>

            {/* List of Venues */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[220px]">
              {filteredVenues.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">
                  No venues match &quot;{filterQuery}&quot;. Use the add form above to create it.
                </div>
              ) : (
                filteredVenues.map((venue) => {
                  const isSelected = value === venue.value;
                  const isCustom = dbVenues.some(
                    (v) => (v.name || '').toLowerCase() === venue.value.toLowerCase()
                  );
                  const dbRecord = dbVenues.find(
                    (v) => (v.name || '').toLowerCase() === venue.value.toLowerCase()
                  );

                  return (
                    <div
                      key={venue.value}
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
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                              {venue.label}
                            </span>
                            {venue.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">
                                {venue.badge}
                              </span>
                            )}
                          </div>
                          {venue.sublabel && (
                            <p className="text-[11px] text-gray-500 truncate mt-0.5 flex items-center gap-1">
                              <Navigation className="w-3 h-3 text-gray-400 shrink-0" />
                              {venue.sublabel}
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
                              onChange(venue.value);
                              setIsManageModalOpen(false);
                              toast.success(`Selected "${venue.label}"`);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                          >
                            Select
                          </button>
                        )}

                        {isCustom && dbRecord?._id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteVenue(dbRecord._id, venue.value)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Delete custom venue"
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
              <span>{mergedOptions.length} venues available</span>
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
