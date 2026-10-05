'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
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
  CheckCircle2, 
  Phone, 
  Mail, 
  ArrowUpRight, 
  X, 
  Sparkles,
  Camera,
  CalendarDays,
  CalendarClock,
  LayoutGrid,
  ShieldCheck,
  BadgeCheck,
  Flame,
  TrendingUp,
  Award,
  CheckCheck
} from 'lucide-react';
import { getProjects } from '@/app/actions';
import { Project } from '@/lib/types';

dayjs.extend(isBetween);

export default function CalendarPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<Project | null>(null);
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
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects for calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search query, event type, and status
  const filteredProjects = projects.filter((p) => {
    const nameMatch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const typeStr = typeof p.eventType === 'string' ? p.eventType : (p.eventType as any)?.name || '';
    const typeMatch = selectedEventType === 'ALL' || typeStr.toLowerCase() === selectedEventType.toLowerCase();
    const statusMatch = selectedStatus === 'ALL' || p.status?.toLowerCase() === selectedStatus.toLowerCase();

    return nameMatch && typeMatch && statusMatch;
  });

  // Monthly stats
  const currentMonthStr = currentDate.format('YYYY-MM');
  const monthProjects = projects.filter((p) => {
    if (!p.eventDate) return false;
    const pDate = typeof p.eventDate === 'string' ? p.eventDate.substring(0, 7) : dayjs(p.eventDate).format('YYYY-MM');
    return pDate === currentMonthStr;
  });

  const next7DaysProjects = projects.filter((p) => {
    if (!p.eventDate) return false;
    const date = dayjs(p.eventDate);
    return date.isBetween(dayjs().subtract(1, 'day'), dayjs().add(7, 'day'));
  });

  const completedMonthProjects = monthProjects.filter(p => p.status === 'Completed');
  const bookedMonthProjects = monthProjects.filter(p => p.status === 'Booked');

  // Calendar Grid Calculation
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
          className={`min-h-[125px] p-3 rounded-2xl flex flex-col justify-between transition-all border ${
            !isCurrentMonth
              ? 'bg-gray-50/40 dark:bg-gray-900/30 text-gray-400/50 dark:text-gray-600 border-gray-150/40 dark:border-gray-800/30'
              : 'bg-white dark:bg-[#1c1f26] text-gray-800 dark:text-gray-200 border-gray-200/80 dark:border-gray-800 hover:border-[#e50914]/40'
          } ${dayEvents.length > 0 ? 'ring-1 ring-red-500/20 bg-gradient-to-b from-white to-red-50/15 dark:from-[#1c1f26] dark:to-red-950/15' : ''} ${
            isToday ? 'ring-2 ring-[#e50914] border-transparent' : ''
          }`}
        >
          {/* Day Number Header */}
          <div className="flex justify-between items-center mb-1">
            {isToday ? (
              <span className="w-6 h-6 rounded-full bg-[#e50914] text-white font-extrabold text-[11px] flex items-center justify-center">
                {day.format('D')}
              </span>
            ) : (
              <span className={`text-[12px] font-bold ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
                {day.format('D')}
              </span>
            )}
            {dayEvents.length > 0 && (
              <span className="text-[10px] font-extrabold text-[#e50914] bg-[#eaf2ff] dark:bg-blue-950/40 px-1.5 py-0.2 rounded-md">
                {dayEvents.length}
              </span>
            )}
          </div>

          {/* Events Pill List */}
          <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[85px] custom-scrollbar pr-0.5">
            {dayEvents.map((event) => {
              return (
                <div
                  key={event.id || event._id}
                  onClick={() => setSelectedEvent(event)}
                  className={`p-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all hover:scale-[1.02] flex flex-col gap-0.5 ${
                    event.status === 'Completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                      : event.status === 'Booked'
                      ? 'bg-[#fef2f2] dark:bg-red-950/40 border-[#fee2e2] dark:border-red-900/40 text-[#e50914] dark:text-red-300'
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-300'
                  }`}
                  title={`${event.name} (${event.eventType || 'Event'}) - ₹${(event.totalValue || 0).toLocaleString()}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate">{event.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] opacity-80">
                    <span className="truncate">{typeof event.eventType === 'string' ? event.eventType : (event.eventType as any)?.name || 'Event'}</span>
                    {event.location && <span className="truncate max-w-[50px] font-normal">{event.location}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
      day = day.add(1, 'day');
    }

    rows.push(
      <div className="grid grid-cols-7 gap-2 sm:gap-3" key={day.format('YYYY-MM-DD')}>
        {days}
      </div>
    );
    days = [];
  }

  // Next & Previous Handlers
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const goToToday = () => setCurrentDate(dayjs());

  return (
    <div className="space-y-6 w-full pb-16 font-sans text-gray-800 dark:text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 dark:bg-[#16181c]/60 p-5 rounded-3xl border border-white/50 dark:border-gray-800/60 backdrop-blur-md shadow-xs">
        <div>
          <h2 className="text-[20px] font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e50914] text-white flex items-center justify-center shadow-md shadow-red-500/20">
              <CalendarIcon className="w-4.5 h-4.5" />
            </div>
            Shoot Schedule & Calendar
          </h2>
          <p className="text-[12.5px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
            Track upcoming client shoots, venue schedules, and production bookings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-[#1c1f24] p-1 rounded-xl border border-gray-200/50 dark:border-gray-800">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-800 text-[#e50914] dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Month
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-gray-800 text-[#e50914] dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Timeline
            </button>
          </div>

          <button
            onClick={() => router.push('/projects/create')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#e50914] hover:bg-red-700 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-red-500/20 transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Schedule New Shoot
          </button>
        </div>
      </div>

      {/* Metrics Row - Premium Bento Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Card 1: Shoots This Month */}
        <div 
          onClick={() => setSelectedStatus('ALL')}
          className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-red-500/[0.07] via-white to-red-500/[0.02] dark:from-[#201418] dark:via-[#16181f] dark:to-[#121418] border border-red-500/20 dark:border-red-900/35 hover:border-[#e50914]/60 p-5 shadow-xs hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          {/* Ambient Corner Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500/15 dark:bg-red-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-red-500/30 transition-all" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] animate-pulse" />
                <span className="text-[10.5px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Shoots This Month
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[32px] font-black text-gray-900 dark:text-white leading-none tracking-tight">
                  {monthProjects.length}
                </span>
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
                  shoots
                </span>
              </div>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#e50914] to-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-3 border-t border-red-100/60 dark:border-red-950/60 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400 font-bold">
              Active Schedule
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#e50914] bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200/60 dark:border-red-900/50">
              <Flame className="w-3 h-3" />
              Calendar Live
            </span>
          </div>
        </div>

        {/* Card 2: Next 7 Days */}
        <div 
          onClick={() => {}}
          className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-amber-500/[0.07] via-white to-amber-500/[0.02] dark:from-[#201b12] dark:via-[#16181f] dark:to-[#121418] border border-amber-500/20 dark:border-amber-900/35 hover:border-amber-500/60 p-5 shadow-xs hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          {/* Ambient Corner Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/15 dark:bg-amber-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/30 transition-all" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10.5px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Next 7 Days
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[32px] font-black text-amber-600 dark:text-amber-400 leading-none tracking-tight">
                  {next7DaysProjects.length}
                </span>
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
                  upcoming
                </span>
              </div>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <CalendarClock className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-3 border-t border-amber-100/60 dark:border-amber-950/60 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400 font-bold">
              Immediate Attention
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/50">
              <Clock className="w-3 h-3" />
              This Week
            </span>
          </div>
        </div>

        {/* Card 3: Confirmed Booked */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'Booked' ? 'ALL' : 'Booked')}
          className={`group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-emerald-500/[0.07] via-white to-emerald-500/[0.02] dark:from-[#132018] dark:via-[#16181f] dark:to-[#121418] border p-5 shadow-xs hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'Booked' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-emerald-500/20 dark:border-emerald-900/35 hover:border-emerald-500/60'
          }`}
        >
          {/* Ambient Corner Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/30 transition-all" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10.5px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Confirmed Booked
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[32px] font-black text-emerald-600 dark:text-emerald-400 leading-none tracking-tight">
                  {bookedMonthProjects.length}
                </span>
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
                  locked
                </span>
              </div>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <BadgeCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-3 border-t border-emerald-100/60 dark:border-emerald-950/60 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400 font-bold">
              Deposit & Crew Ready
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/50">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          </div>
        </div>

        {/* Card 4: Completed */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'Completed' ? 'ALL' : 'Completed')}
          className={`group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-blue-500/[0.07] via-white to-blue-500/[0.02] dark:from-[#141b24] dark:via-[#15181e] dark:to-[#101216] border p-5 shadow-xs hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'Completed' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-blue-500/20 dark:border-blue-900/35 hover:border-blue-500/60'
          }`}
        >
          {/* Ambient Corner Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/15 dark:bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/30 transition-all" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10.5px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Completed
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[32px] font-black text-blue-600 dark:text-blue-400 leading-none tracking-tight">
                  {completedMonthProjects.length}
                </span>
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
                  delivered
                </span>
              </div>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <CheckCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-3 border-t border-blue-100/60 dark:border-blue-950/60 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400 font-bold">
              Delivered & Archived
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900/50">
              <Award className="w-3 h-3" />
              100% Done
            </span>
          </div>
        </div>

      </div>

      {/* Filter & Month Navigation Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white dark:bg-[#16181c] p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800 shadow-xs">
        
        {/* Month Selector Buttons */}
        <div className="flex items-center gap-3">
          <h3 className="text-[18px] font-extrabold text-gray-900 dark:text-white min-w-[180px]">
            {currentDate.format('MMMM YYYY')}
          </h3>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl">
            <button
              onClick={prevMonth}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-[11px] font-bold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60 flex items-center">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search client or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-[#1c1f24] border border-gray-250/60 dark:border-gray-800 rounded-xl text-[12.5px] font-medium focus:outline-none focus:border-[#e50914] dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Event Type Filter */}
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-[#1c1f24] border border-gray-250/60 dark:border-gray-800 rounded-xl text-[12px] font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#e50914] cursor-pointer"
          >
            <option value="ALL">All Shoot Types</option>
            <option value="Wedding Ceremony">Wedding Ceremony</option>
            <option value="Pre-wedding Session">Pre-wedding Session</option>
            <option value="Corporate Shoot">Corporate Shoot</option>
            <option value="Commercial Session">Commercial Session</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-[#1c1f24] border border-gray-250/60 dark:border-gray-800 rounded-xl text-[12px] font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#e50914] cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="Booked">Booked</option>
            <option value="Lead">Lead</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Main View: Calendar Month or Timeline Agenda */}
      {loading ? (
        <div className="glass-card rounded-[28px] p-16 text-center bg-white dark:bg-[#16181c] border border-gray-200/50 dark:border-gray-800 shadow-sm animate-pulse">
          <CalendarIcon className="w-12 h-12 text-[#e50914] mx-auto mb-3 animate-spin stroke-1" />
          <p className="text-[14px] font-bold text-gray-500">Loading shoot calendar...</p>
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="space-y-3">
          {/* Day Names Bar */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 bg-gray-50/70 dark:bg-gray-800/30 rounded-2xl text-center py-2.5 px-2">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
              <div key={d} className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
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
        /* Timeline Agenda View */
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="glass-card rounded-[28px] p-12 text-center bg-white dark:bg-[#16181c] border border-gray-200/50 dark:border-gray-800">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2 stroke-1" />
              <h4 className="text-[15px] font-bold text-gray-700 dark:text-gray-300">No scheduled shoots match your criteria</h4>
              <p className="text-[12px] text-gray-400 mt-1">Try clearing your filters or schedule a new shoot.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map((project) => {
                const eventDate = project.eventDate ? dayjs(project.eventDate) : null;

                return (
                  <div
                    key={project.id || project._id}
                    onClick={() => setSelectedEvent(project)}
                    className="glass-card p-5 rounded-2xl bg-white dark:bg-[#16181c] border border-gray-200/60 dark:border-gray-800 hover:border-[#e50914]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#e50914] uppercase tracking-wider block">
                            {project.projectNumber}
                          </span>
                          <h4 className="text-[15px] font-extrabold text-gray-900 dark:text-white mt-0.5">
                            {project.name}
                          </h4>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          project.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : project.status === 'Booked'
                            ? 'bg-[#fef2f2] text-[#e50914] border border-[#fee2e2]'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {project.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-[12px] text-gray-500 dark:text-gray-400 font-semibold mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CalendarIcon className="w-4 h-4 text-[#e50914] shrink-0" />
                          <span>{eventDate ? eventDate.format('dddd, DD MMMM YYYY') : 'Not scheduled'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">{project.location || 'Location TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{(project.crewBlueprint || []).length} Crew allocated</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 text-[12px]">
                      <span className="font-extrabold text-gray-900 dark:text-white">
                        ₹{(project.totalValue || 0).toLocaleString()}
                      </span>
                      <span className="text-[#e50914] font-bold flex items-center gap-1 group-hover:underline">
                        Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Shoot Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#16181c] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-200/60 dark:border-gray-800 animate-slide-in flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-150 dark:border-gray-800 flex justify-between items-start bg-gray-50/50 dark:bg-gray-900/30">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#e50914] text-white font-bold flex items-center justify-center text-[18px] shadow-md shadow-red-500/20">
                  {selectedEvent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                      {selectedEvent.projectNumber}
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      selectedEvent.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : selectedEvent.status === 'Booked'
                        ? 'bg-[#fef2f2] text-[#e50914] border border-[#fee2e2]'
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-extrabold text-gray-900 dark:text-white mt-0.5">
                    {selectedEvent.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar text-[13px]">
              
              {/* Event Date & Location Block */}
              <div className="bg-[#eaf2ff]/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-[#d2e4ff]/60 dark:border-blue-900/40 space-y-2">
                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-bold">
                  <CalendarIcon className="w-4.5 h-4.5 text-[#e50914]" />
                  <span>
                    {selectedEvent.eventDate
                      ? dayjs(selectedEvent.eventDate).format('dddd, MMMM DD, YYYY')
                      : 'Date not scheduled'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium text-[12.5px]">
                  <MapPin className="w-4.5 h-4.5 text-gray-400" />
                  <span>{selectedEvent.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium text-[12.5px]">
                  <Camera className="w-4.5 h-4.5 text-gray-400" />
                  <span>{typeof selectedEvent.eventType === 'string' ? selectedEvent.eventType : (selectedEvent.eventType as any)?.name || 'Photography Session'}</span>
                </div>
              </div>

              {/* Client Contact Info */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Client Particulars</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.phone && (
                    <a
                      href={`tel:${selectedEvent.phone}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200/60 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[12px] hover:bg-gray-100 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {selectedEvent.phone}
                    </a>
                  )}
                  {selectedEvent.email && (
                    <a
                      href={`mailto:${selectedEvent.email}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-200/60 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[12px] hover:bg-gray-100 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {selectedEvent.email}
                    </a>
                  )}
                </div>
              </div>

              {/* Crew Allocated */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Production Crew Allocation</h4>
                {(selectedEvent.crewBlueprint || []).length === 0 ? (
                  <p className="text-gray-400 text-[12px] italic">No crew blueprint members assigned yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedEvent.crewBlueprint.map((crew: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#1c1f24] border border-gray-150 dark:border-gray-800 flex justify-between items-center text-[12px]">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{crew.role}</span>
                        <span className="text-gray-500 font-semibold">₹{crew.charges}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Financial Total */}
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#1c1f24] rounded-2xl border border-gray-200/60 dark:border-gray-800 mt-2">
                <div>
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Project Value</span>
                  <span className="text-[18px] font-extrabold text-gray-900 dark:text-white">
                    ₹{(selectedEvent.totalValue || 0).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/projects/${selectedEvent.id || selectedEvent._id}`)}
                  className="px-4 py-2.5 bg-[#e50914] hover:bg-red-700 text-white rounded-xl text-[12.5px] font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Open Case File
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
