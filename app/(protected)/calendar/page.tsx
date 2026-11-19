'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  MapPin,
  Users,
  Clock,
  Phone,
  Mail,
  ArrowUpRight,
  X,
  Camera,
  Film,
  CalendarDays,
  ShieldCheck,
  BadgeCheck,
  Flame,
  Award,
  Sparkles,
  LayoutGrid,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { getProjects } from '@/app/actions';
import { Project } from '@/lib/types';
import AnimatedCashAmount from '@/components/ui/AnimatedCashAmount';

dayjs.extend(isBetween);

// Premium Color Palettes for Event Types
export const getEventTypeTheme = (type?: string | { name: string }) => {
  const name = typeof type === 'string' ? type : type?.name || '';
  const lower = name.toLowerCase();

  if (lower.includes('wedding') && !lower.includes('pre') && !lower.includes('destination')) {
    return {
      name: 'Wedding Ceremony',
      label: 'Wedding Ceremony',
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25',
      pill: 'bg-rose-50/90 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-900/50 hover:border-rose-400',
      dot: 'bg-rose-500',
      glow: 'shadow-rose-500/15'
    };
  }
  if (lower.includes('pre-wedding') || lower.includes('engagement') || lower.includes('reception')) {
    return {
      name: 'Pre-wedding Session',
      label: 'Pre-wedding Session',
      badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/25',
      pill: 'bg-violet-50/90 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200/70 dark:border-violet-900/50 hover:border-violet-400',
      dot: 'bg-violet-500',
      glow: 'shadow-violet-500/15'
    };
  }
  if (lower.includes('destination')) {
    return {
      name: 'Destination Wedding',
      label: 'Destination Wedding',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25',
      pill: 'bg-amber-50/90 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-900/50 hover:border-amber-400',
      dot: 'bg-amber-500',
      glow: 'shadow-amber-500/15'
    };
  }
  if (lower.includes('corporate') || lower.includes('commercial') || lower.includes('fashion')) {
    return {
      name: 'Commercial & Fashion',
      label: 'Commercial & Fashion',
      badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25',
      pill: 'bg-sky-50/90 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-900/50 hover:border-sky-400',
      dot: 'bg-sky-500',
      glow: 'shadow-sky-500/15'
    };
  }
  return {
    name: name || 'Photo Shoot',
    label: name || 'Photo Shoot',
    badge: 'bg-red-500/10 text-[#e50914] dark:text-red-400 border border-red-500/25',
    pill: 'bg-red-50/90 dark:bg-red-950/40 text-[#e50914] dark:text-red-300 border-red-200/70 dark:border-red-900/50 hover:border-red-400',
    dot: 'bg-[#e50914]',
    glow: 'shadow-red-500/15'
  };
};

export const getStatusTheme = (status?: string) => {
  switch (status) {
    case 'Completed':
      return {
        label: 'Delivered',
        badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50',
        dot: 'bg-emerald-500'
      };
    case 'Booked':
      return {
        label: 'Confirmed',
        badge: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50',
        dot: 'bg-rose-500'
      };
    case 'Lead':
      return {
        label: 'Inquiry',
        badge: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50',
        dot: 'bg-amber-500'
      };
    default:
      return {
        label: status || 'Scheduled',
        badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
        dot: 'bg-gray-400'
      };
  }
};

export default function CalendarPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      if (data && data.length > 0) {
        setProjects(data);
      } else {
        // High fidelity demo shoots
        const now = dayjs();
        const demo: Project[] = [
          {
            id: 'af-101',
            _id: 'af-101',
            name: 'Priyanka & Siddharth Wedding',
            projectNumber: 'AF-2026-001',
            eventType: 'Wedding Ceremony',
            status: 'Booked',
            eventDate: now.add(1, 'day').format('YYYY-MM-DD'),
            location: 'Mayfair Lagoon, Bhubaneswar',
            phone: '+91 98765 43210',
            email: 'priyanka.siddharth@example.com',
            totalValue: 185000,
            payments: [],
            expenses: [],
            createdAt: now.toISOString(),
            crewBlueprint: [
              { role: 'Lead Candid Artist', charges: 25000 },
              { role: 'Cinema Director (Sony FX6 4K)', charges: 35000 },
              { role: 'Drone Operator (DJI Cine)', charges: 18000 }
            ]
          },
          {
            id: 'af-102',
            _id: 'af-102',
            name: 'Ananya & Rohan Pre-wedding',
            projectNumber: 'AF-2026-002',
            eventType: 'Pre-wedding Shoot',
            status: 'Booked',
            eventDate: now.add(4, 'day').format('YYYY-MM-DD'),
            location: 'Swosti Chilika Resort, Chilika',
            phone: '+91 98451 23456',
            email: 'ananya.rohan@example.com',
            totalValue: 75000,
            payments: [],
            expenses: [],
            createdAt: now.toISOString(),
            crewBlueprint: [
              { role: 'Pre-wedding Director', charges: 22000 },
              { role: 'Gimbal Cinematographer', charges: 20000 }
            ]
          },
          {
            id: 'af-103',
            _id: 'af-103',
            name: 'Titanium Auto Commercial Shoot',
            projectNumber: 'AF-2026-003',
            eventType: 'Commercial & Fashion Session',
            status: 'Booked',
            eventDate: now.subtract(2, 'day').format('YYYY-MM-DD'),
            location: 'Arjun Films Studio HQ (Hanspal)',
            phone: '+91 97761 99887',
            email: 'production@titaniumauto.in',
            totalValue: 120000,
            payments: [],
            expenses: [],
            createdAt: now.toISOString(),
            crewBlueprint: [
              { role: 'Commercial Lighting Master', charges: 35000 },
              { role: 'Gaffer & Grip Chief', charges: 15000 }
            ]
          },
          {
            id: 'af-104',
            _id: 'af-104',
            name: 'Udaipur Royal Destination Wedding',
            projectNumber: 'AF-2026-004',
            eventType: 'Destination Wedding',
            status: 'Booked',
            eventDate: now.add(9, 'day').format('YYYY-MM-DD'),
            location: 'Udaipur Heritage Palace & Fort',
            phone: '+91 99370 12890',
            email: 'royal@palaceevents.com',
            totalValue: 420000,
            payments: [],
            expenses: [],
            createdAt: now.toISOString(),
            crewBlueprint: [
              { role: 'Executive Cinema Crew (5 Members)', charges: 140000 },
              { role: 'Dual Cine Drone Pilots', charges: 45000 }
            ]
          },
          {
            id: 'af-105',
            _id: 'af-105',
            name: 'Kabir & Meera Gala Reception',
            projectNumber: 'AF-2026-005',
            eventType: 'Wedding Ceremony',
            status: 'Completed',
            eventDate: now.subtract(8, 'day').format('YYYY-MM-DD'),
            location: 'Welcomhotel by ITC, Bhubaneswar',
            phone: '+91 94371 44556',
            email: 'kabir.meera@outlook.com',
            totalValue: 160000,
            payments: [],
            expenses: [],
            createdAt: now.toISOString(),
            crewBlueprint: [
              { role: 'Traditional Photo Lead', charges: 18000 },
              { role: 'Candid Artist', charges: 22000 }
            ]
          }
        ];
        setProjects(demo);
      }
    } catch (err) {
      console.error('Failed to load projects for calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects by search, event type, and status
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = !q ||
        p.name?.toLowerCase().includes(q) ||
        p.projectNumber?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q);

      const typeStr = typeof p.eventType === 'string' ? p.eventType : (p.eventType as any)?.name || '';
      const typeMatch = selectedEventType === 'ALL' || typeStr.toLowerCase() === selectedEventType.toLowerCase();
      const statusMatch = selectedStatus === 'ALL' || p.status?.toLowerCase() === selectedStatus.toLowerCase();

      return nameMatch && typeMatch && statusMatch;
    });
  }, [projects, searchQuery, selectedEventType, selectedStatus]);

  // Month stats
  const currentMonthStr = currentDate.format('YYYY-MM');
  const monthProjects = useMemo(() => {
    return projects.filter((p) => {
      if (!p.eventDate) return false;
      const pDate = typeof p.eventDate === 'string' ? p.eventDate.substring(0, 7) : dayjs(p.eventDate).format('YYYY-MM');
      return pDate === currentMonthStr;
    });
  }, [projects, currentMonthStr]);

  const next7DaysProjects = useMemo(() => {
    return projects.filter((p) => {
      if (!p.eventDate) return false;
      const date = dayjs(p.eventDate);
      return date.isBetween(dayjs().subtract(1, 'day'), dayjs().add(7, 'day'), 'day', '[]');
    });
  }, [projects]);

  const monthRevenue = useMemo(() => {
    return monthProjects.reduce((sum, p) => sum + (p.totalValue || 0), 0);
  }, [monthProjects]);

  const totalCrewAssigned = useMemo(() => {
    return monthProjects.reduce((sum, p) => sum + (p.crewBlueprint?.length || 0), 0);
  }, [monthProjects]);

  // Calendar Grid Calculations
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const isCurrentMonth = day.month() === currentDate.month();
      const isToday = day.isSame(dayjs(), 'day');
      const dayStr = day.format('YYYY-MM-DD');

      const dayEvents = filteredProjects.filter((p) => {
        if (!p.eventDate) return false;
        const pDate = typeof p.eventDate === 'string' ? p.eventDate.substring(0, 10) : dayjs(p.eventDate).format('YYYY-MM-DD');
        return pDate === dayStr;
      });

      days.push(
        <div
          key={dayStr}
          className={`group relative min-h-[140px] p-3 rounded-[22px] flex flex-col justify-between transition-all duration-200 border ${!isCurrentMonth
            ? 'bg-gray-50/40 dark:bg-[#121418]/30 text-gray-400/40 dark:text-gray-600/40 border-gray-100 dark:border-gray-800/40'
            : 'bg-white dark:bg-[#161a22] text-gray-800 dark:text-gray-200 border-gray-200/80 dark:border-gray-800/80 hover:bg-gray-50/80 dark:hover:bg-[#1d232e] hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg hover:shadow-black/5'
            } ${isToday
              ? 'ring-2 ring-[#e50914] border-transparent bg-gradient-to-b from-red-50/20 via-white to-white dark:from-red-950/20 dark:via-[#161a22] dark:to-[#161a22]'
              : ''
            }`}
        >
          {/* Day Number Header */}
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5">
              {isToday ? (
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#e50914] to-red-600 text-white font-black text-[11px] flex items-center justify-center shadow-md shadow-red-500/30">
                  {day.format('D')}
                </span>
              ) : (
                <span className={`text-[12px] font-black ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-200'}`}>
                  {day.format('D')}
                </span>
              )}

              {isToday && (
                <span className="text-[9px] font-black text-[#e50914] bg-red-50 dark:bg-red-950/60 px-1.5 py-0.2 rounded-md border border-red-200/60 dark:border-red-900/50 uppercase">
                  Today
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {dayEvents.length > 0 && (
                <span className="text-[9.5px] font-black text-[#e50914] bg-red-50 dark:bg-red-950/60 border border-red-200/60 dark:border-red-900/40 px-1.5 py-0.5 rounded-full">
                  {dayEvents.length} {dayEvents.length === 1 ? 'shoot' : 'shoots'}
                </span>
              )}

              {/* Hover Quick Add */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/projects/create?date=${dayStr}`);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-[#e50914] hover:text-white text-gray-500 flex items-center justify-center cursor-pointer shadow-xs"
                title={`Schedule shoot on ${dayStr}`}
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Event Cards inside Day Cell */}
          <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[95px] custom-scrollbar pr-0.5 mt-0.5">
            {dayEvents.slice(0, 3).map((event) => {
              const theme = getEventTypeTheme(event.eventType);

              return (
                <div
                  key={event.id || event._id}
                  onClick={() => setSelectedProject(event)}
                  className={`p-1.5 px-2 rounded-xl border text-[11px] font-extrabold cursor-pointer transition-all hover:scale-[1.02] flex flex-col gap-0.5 shadow-2xs backdrop-blur-xs ${theme.pill}`}
                  title={`${event.name} (${theme.name})`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shrink-0 animate-pulse`} />
                      <span className="truncate text-[10.5px] font-black">{event.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] opacity-85 mt-0.5 font-semibold">
                    <span className="truncate max-w-[85px]">{theme.name}</span>
                    {event.totalValue ? (
                      <span className="font-black shrink-0">₹{(event.totalValue / 1000).toFixed(0)}k</span>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {dayEvents.length > 3 && (
              <div
                onClick={() => setSelectedProject(dayEvents[0])}
                className="text-[9.5px] font-black text-gray-500 hover:text-[#e50914] text-center py-0.5 cursor-pointer"
              >
                +{dayEvents.length - 3} more shoots
              </div>
            )}
          </div>
        </div>
      );
      day = day.add(1, 'day');
    }

    rows.push(
      <div className="grid grid-cols-7 gap-2.5 sm:gap-3" key={day.format('YYYY-MM-DD')}>
        {days}
      </div>
    );
    days = [];
  }

  // Navigation handlers
  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
  const goToToday = () => setCurrentDate(dayjs());

  return (
    <div className="w-full pb-20 font-sans text-gray-950 dark:text-white space-y-6">

      {/* ============================================================ */}
      {/* 1. LUXURY STUDIO HEADER                                       */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/90 dark:bg-[#16181f]/95 p-6 rounded-[28px] border border-gray-200/80 dark:border-gray-800/80 backdrop-blur-xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-[#e50914] border border-red-500/20 text-[11px] font-black uppercase tracking-widest mb-1.5">
            <Film className="w-3.5 h-3.5" />
            Arjun Films Studio Operations
          </div>
          <h1 className="text-[26px] sm:text-[30px] font-black tracking-tight text-gray-950 dark:text-white leading-tight">
            Shoot Schedule & Calendar
          </h1>
          <p className="text-[12.5px] text-gray-500 dark:text-gray-400 font-medium">
            Monitor client productions, venue bookings, cinematographer rosters, and deliverables.
          </p>
        </div>

        {/* View Toggle & Schedule Action */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* View Switcher */}
          <div className="flex bg-gray-100/90 dark:bg-[#1c202a] p-1.5 rounded-2xl border border-gray-200/60 dark:border-gray-800 shadow-inner">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-black transition-all cursor-pointer ${viewMode === 'month'
                ? 'bg-white dark:bg-gray-800 text-[#e50914] dark:text-white shadow-md shadow-black/5'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-black transition-all cursor-pointer ${viewMode === 'agenda'
                ? 'bg-white dark:bg-gray-800 text-[#e50914] dark:text-white shadow-md shadow-black/5'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Timeline List
            </button>
          </div>

          {/* Schedule Button */}
          <button
            onClick={() => router.push('/projects/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl text-[13px] font-black shadow-lg shadow-red-500/25 transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Schedule New Shoot
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. EXECUTIVE BENTO METRICS BAR                                 */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Shoots This Month */}
        <div
          onClick={() => setSelectedStatus('ALL')}
          className="group relative overflow-hidden rounded-[26px] bg-white dark:bg-[#16181f] border border-gray-200/80 dark:border-gray-800/80 p-5 shadow-xs hover:border-red-500/60 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Shoots This Month
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[32px] font-black text-gray-950 dark:text-white tracking-tight leading-none">
                  {monthProjects.length}
                </span>
                <span className="text-[11px] font-bold text-gray-400">productions</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#e50914] to-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-150 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400 font-semibold">Active Roster</span>
            <span className="text-[10px] font-black text-[#e50914] bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200/60 dark:border-red-900/40 flex items-center gap-1">
              <Flame className="w-3 h-3" /> Live
            </span>
          </div>
        </div>

        {/* Card 2: Next 7 Days Hot List */}
        <div
          className="group relative overflow-hidden rounded-[26px] bg-white dark:bg-[#16181f] border border-gray-200/80 dark:border-gray-800/80 p-5 shadow-xs hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Next 7 Days (Hot)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[32px] font-black text-amber-600 dark:text-amber-400 tracking-tight leading-none">
                  {next7DaysProjects.length}
                </span>
                <span className="text-[11px] font-bold text-gray-400">upcoming</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-150 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400 font-semibold">Immediate Call Time</span>
            <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> This Week
            </span>
          </div>
        </div>

        {/* Card 3: Crew Allocated */}
        <div
          className="group relative overflow-hidden rounded-[26px] bg-white dark:bg-[#16181f] border border-gray-200/80 dark:border-gray-800/80 p-5 shadow-xs hover:border-sky-500/60 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Production Crew
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[32px] font-black text-sky-600 dark:text-sky-400 tracking-tight leading-none">
                  {totalCrewAssigned}
                </span>
                <span className="text-[11px] font-bold text-gray-400">personnel</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-150 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400 font-semibold">Cine, Candid & Drone</span>
            <span className="text-[10px] font-black text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-200/60 dark:border-sky-900/40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Allocated
            </span>
          </div>
        </div>

        {/* Card 4: Expected Revenue with AnimatedCashAmount */}
        <div
          className="group relative overflow-hidden rounded-[26px] bg-white dark:bg-[#16181f] border border-gray-200/80 dark:border-gray-800/80 p-5 shadow-xs hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Month Pipeline Value
              </span>
              <div className="mt-1">
                <span className="text-[26px] sm:text-[28px] font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                  <AnimatedCashAmount amount={monthRevenue} />
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-150 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400 font-semibold">Confirmed Projects</span>
            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-1">
              <Award className="w-3 h-3" /> Total
            </span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. NAVIGATION BAR (MONTH SWITCHER & FILTERS)                  */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white/90 dark:bg-[#16181f]/95 p-4 sm:p-5 rounded-[26px] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-3">
          <h2 className="text-[19px] sm:text-[21px] font-black text-gray-950 dark:text-white min-w-[190px]">
            {currentDate.format('MMMM YYYY')}
          </h2>

          <div className="flex items-center gap-1 bg-gray-100/90 dark:bg-[#1c202a] p-1 rounded-2xl border border-gray-200/50 dark:border-gray-800">
            <button
              onClick={prevMonth}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-[11px] font-black text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64 flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search client, venue, case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-50/90 dark:bg-[#1c202a] border border-gray-200 dark:border-gray-800 rounded-xl text-[12px] font-semibold focus:outline-none focus:border-[#e50914] dark:text-white placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Event Type Filter */}
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="px-3 py-2 bg-gray-50/90 dark:bg-[#1c202a] border border-gray-200 dark:border-gray-800 rounded-xl text-[12px] font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#e50914] cursor-pointer"
          >
            <option value="ALL">All Shoot Categories</option>
            <option value="Wedding Ceremony">Wedding Ceremony</option>
            <option value="Pre-wedding Session">Pre-wedding Shoot</option>
            <option value="Destination Wedding">Destination Wedding</option>
            <option value="Corporate Shoot">Corporate Shoot</option>
            <option value="Commercial Session">Commercial Session</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50/90 dark:bg-[#1c202a] border border-gray-200 dark:border-gray-800 rounded-xl text-[12px] font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#e50914] cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="Booked">Confirmed (Booked)</option>
            <option value="Lead">Inquiry</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. MAIN VIEWPORT (MONTH GRID OR TIMELINE LIST)                */}
      {/* ============================================================ */}
      {loading ? (
        <div className="rounded-[28px] p-20 text-center bg-white dark:bg-[#16181f] border border-gray-200 dark:border-gray-800 animate-pulse">
          <CalendarIcon className="w-10 h-10 text-[#e50914] mx-auto mb-3 animate-spin stroke-1" />
          <p className="text-[14px] font-bold text-gray-500">Loading shoot calendar...</p>
        </div>
      ) : viewMode === 'month' ? (

        /* ---------------- MONTH GRID ---------------- */
        <div className="space-y-3">
          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-2.5 sm:gap-3 bg-gray-100/70 dark:bg-[#16181f]/60 rounded-2xl text-center py-2.5 px-3 border border-gray-200/50 dark:border-gray-800/40">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
              <div key={d} className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                <span className="hidden md:inline">{d}</span>
                <span className="md:hidden">{d.substring(0, 3)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="space-y-2.5 sm:space-y-3">
            {rows}
          </div>
        </div>

      ) : (

        /* ---------------- AGENDA LIST ---------------- */
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="rounded-[28px] p-16 text-center bg-white dark:bg-[#16181f] border border-gray-200 dark:border-gray-800">
              <CalendarIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 stroke-1" />
              <h4 className="text-[16px] font-black text-gray-800 dark:text-gray-200">No scheduled shoots match criteria</h4>
              <p className="text-[12px] text-gray-400 mt-1">Try clearing filters or schedule a new shoot.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => {
                const eventDate = project.eventDate ? dayjs(project.eventDate) : null;
                const theme = getEventTypeTheme(project.eventType);
                const statusTheme = getStatusTheme(project.status);

                return (
                  <div
                    key={project.id || project._id}
                    onClick={() => setSelectedProject(project)}
                    className="group rounded-[24px] p-5 bg-white dark:bg-[#16181f] border border-gray-200/80 dark:border-gray-800 hover:border-red-500/50 hover:shadow-xl hover:shadow-black/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <span className="text-[10px] font-black text-[#e50914] uppercase tracking-wider block">
                            {project.projectNumber}
                          </span>
                          <h3 className="text-[16px] font-black text-gray-950 dark:text-white mt-0.5 group-hover:text-[#e50914] transition-colors">
                            {project.name}
                          </h3>
                        </div>

                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${statusTheme.badge}`}>
                          {statusTheme.label}
                        </span>
                      </div>

                      {/* Shoot Category Pill */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10.5px] font-extrabold mb-3 bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300">
                        <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                        {theme.name}
                      </div>

                      {/* Details Matrix */}
                      <div className="space-y-2 text-[12px] text-gray-600 dark:text-gray-400 font-semibold pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-bold">
                          <CalendarIcon className="w-4 h-4 text-[#e50914] shrink-0" />
                          <span>{eventDate ? eventDate.format('dddd, DD MMMM YYYY') : 'Date not set'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">{project.location || 'Location TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{(project.crewBlueprint || []).length} Production crew allocated</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial & Action Footer */}
                    <div className="flex justify-between items-center pt-3 mt-4 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-[9.5px] font-black uppercase tracking-wider text-gray-400 block">Total Value</span>
                        <span className="text-[16px] font-black text-gray-950 dark:text-white">
                          ₹{(project.totalValue || 0).toLocaleString()}
                        </span>
                      </div>

                      <span className="text-[#e50914] font-extrabold text-[12px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Details <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. CINEMATIC SHOOT DETAILS MODAL                              */}
      {/* ============================================================ */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedProject(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#16181f] w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden border border-gray-200/80 dark:border-gray-800 flex flex-col animate-scale-up"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-150 dark:border-gray-800 flex justify-between items-start bg-gray-50/60 dark:bg-[#121419]/60">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#e50914] to-red-600 text-white font-black flex items-center justify-center text-[18px] shadow-lg shadow-red-500/25">
                  {selectedProject.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {selectedProject.projectNumber}
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusTheme(selectedProject.status).badge}`}>
                      {getStatusTheme(selectedProject.status).label}
                    </span>
                  </div>
                  <h3 className="text-[18px] font-black text-gray-950 dark:text-white mt-0.5">
                    {selectedProject.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar text-[13px]">

              {/* Event Timing & Venue */}
              <div className="bg-red-50/40 dark:bg-red-950/20 p-4 rounded-2xl border border-red-200/60 dark:border-red-900/40 space-y-2">
                <div className="flex items-center gap-2.5 text-gray-900 dark:text-gray-100 font-extrabold text-[14px]">
                  <CalendarIcon className="w-4.5 h-4.5 text-[#e50914]" />
                  <span>
                    {selectedProject.eventDate
                      ? dayjs(selectedProject.eventDate).format('dddd, MMMM DD, YYYY')
                      : 'Date not set'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selectedProject.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                  <Camera className="w-4 h-4 text-gray-400" />
                  <span>{typeof selectedProject.eventType === 'string' ? selectedProject.eventType : (selectedProject.eventType as any)?.name || 'Photography Session'}</span>
                </div>
              </div>

              {/* Client Contact Info */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Particulars</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.phone && (
                    <a
                      href={`tel:${selectedProject.phone}`}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#1a1e27] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-bold text-[12px] hover:bg-gray-100 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      {selectedProject.phone}
                    </a>
                  )}
                  {selectedProject.email && (
                    <a
                      href={`mailto:${selectedProject.email}`}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#1a1e27] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-bold text-[12px] hover:bg-gray-100 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-sky-500" />
                      {selectedProject.email}
                    </a>
                  )}
                </div>
              </div>

              {/* Crew Blueprint Deployment */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Production Crew Blueprint</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(selectedProject.crewBlueprint || []).map((crew: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-[#1a1e27] border border-gray-200 dark:border-gray-800 flex justify-between items-center text-[12px]">
                      <span className="font-extrabold text-gray-900 dark:text-gray-200">{crew.role}</span>
                      <span className="text-gray-500 font-bold">₹{crew.charges}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Total & Direct Action */}
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#1a1e27] rounded-2xl border border-gray-200 dark:border-gray-800 mt-2">
                <div>
                  <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-widest block">Project Pipeline Value</span>
                  <span className="text-[20px] font-black text-gray-950 dark:text-white">
                    ₹{(selectedProject.totalValue || 0).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/projects/${selectedProject.id || selectedProject._id}`)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-[12.5px] font-black shadow-md shadow-red-500/25 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Open Full Case File
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
