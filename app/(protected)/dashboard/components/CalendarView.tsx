import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, MapPin, Camera, ArrowUpRight, Plus, Film } from 'lucide-react';
import { Project } from '@/lib/types';
import AnimatedCashAmount from '@/components/ui/AnimatedCashAmount';
import { getEventTypeTheme } from '@/app/(protected)/calendar/page';

export default function CalendarView({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDateData, setSelectedDateData] = useState<{date: string, projects: Project[]} | null>(null);

  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  const dateFormat = "D";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = day.format(dateFormat);
      const isCurrentMonth = day.month() === currentDate.month();
      const isToday = day.isSame(dayjs(), 'day');
      
      const dayStr = day.format('YYYY-MM-DD');
      const dayProjects = projects.filter(p => {
        if (!p.eventDate) return false;
        const pDate = typeof p.eventDate === 'string' ? p.eventDate.substring(0, 10) : dayjs(p.eventDate).format('YYYY-MM-DD');
        return pDate === dayStr;
      });
      
      const hasProjects = dayProjects.length > 0;
      
      days.push(
        <div 
          key={dayStr} 
          onClick={() => hasProjects && setSelectedDateData({ date: dayStr, projects: dayProjects })}
          className={`min-h-[96px] p-2.5 rounded-2xl flex flex-col justify-between transition-all duration-150 border ${
            !isCurrentMonth 
              ? 'text-gray-400/40 dark:text-gray-600/40 bg-white/20 dark:bg-white/[0.01] border-gray-100 dark:border-gray-800/40' 
              : 'bg-white/90 dark:bg-[#161a22]/85 backdrop-blur-md text-gray-800 dark:text-gray-200 border-gray-200/70 dark:border-gray-800/80 hover:bg-white dark:hover:bg-[#1c222d] hover:border-red-400/60 hover:shadow-md hover:-translate-y-0.5'
          } ${hasProjects ? 'cursor-pointer ring-1 ring-red-500/25 bg-gradient-to-b from-white to-red-50/20 dark:from-[#161a22] dark:to-red-950/20' : ''} ${
            isToday ? 'ring-2 ring-[#e50914] border-transparent' : ''
          }`}
        >
          <div className="flex justify-between items-center">
            {isToday ? (
              <span className="w-5.5 h-5.5 rounded-full bg-gradient-to-r from-[#e50914] to-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-md shadow-red-500/25">
                {formattedDate}
              </span>
            ) : (
              <span className={`text-[11.5px] font-black ${hasProjects ? 'text-[#e50914] dark:text-red-400' : !isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'}`}>
                {formattedDate}
              </span>
            )}
            {hasProjects && (
              <span className="text-[8.5px] font-black text-[#e50914] bg-red-50 dark:bg-red-950/60 border border-red-200/60 dark:border-red-900/40 px-1.5 py-0.2 rounded-md">
                {dayProjects.length}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-col gap-1 overflow-y-auto max-h-[52px] custom-scrollbar">
            {dayProjects.map((p, idx) => {
              const theme = getEventTypeTheme(p.eventType);
              return (
                <div 
                  key={idx} 
                  className={`text-[9px] font-black truncate px-1.5 py-0.5 rounded-md transition-all border flex items-center gap-1 ${theme.pill}`}
                  title={`${p.name} (${typeof p.eventType === 'string' ? p.eventType : (p.eventType as any)?.name || 'Event'})`}
                >
                  <span className={`w-1 h-1 rounded-full ${theme.dot} shrink-0`} />
                  <span className="truncate">{p.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
      day = day.add(1, 'day');
    }
    rows.push(
      <div className="grid grid-cols-7 gap-2 sm:gap-2.5" key={day.format('YYYY-MM-DD')}>
        {days}
      </div>
    );
    days = [];
  }

  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));

  return (
    <div className="w-full flex flex-col relative font-sans text-gray-800 dark:text-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h4 className="text-[12px] font-black text-[#e50914] uppercase tracking-wider flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            Shoot Calendar
          </h4>
          <h3 className="text-[20px] font-black text-gray-950 dark:text-white mt-0.5">
            {currentDate.format('MMMM YYYY')}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/calendar')}
            className="text-[11.5px] font-black text-gray-500 hover:text-[#e50914] px-2.5 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
          >
            Full Calendar <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1 bg-white/80 dark:bg-[#1a1e27] border border-gray-200/60 dark:border-gray-800 p-1 rounded-xl shadow-xs">
            <button 
              onClick={prevMonth} 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4"/>
            </button>
            <button
              onClick={() => setCurrentDate(dayjs())}
              className="px-2.5 py-1 text-[11px] font-black text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              Today
            </button>
            <button 
              onClick={nextMonth} 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-2.5 mb-2.5 text-center bg-gray-100/60 dark:bg-[#161a22]/60 py-2 px-1 rounded-2xl border border-gray-200/50 dark:border-gray-800/40">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      <div className="flex-1 flex flex-col gap-2 sm:gap-2.5">
        {rows}
      </div>

      {/* Date Details Modal */}
      {selectedDateData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedDateData(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#15181f] w-full max-w-lg max-h-[80vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-gray-200/80 dark:border-gray-800 animate-slide-in"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-150 dark:border-gray-800 bg-gray-50/70 dark:bg-[#121419]/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-[#e50914] rounded-2xl border border-red-200/60 dark:border-red-900/40 shadow-xs">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[18px] font-black text-gray-950 dark:text-white leading-tight">
                    {dayjs(selectedDateData.date).format('MMMM D, YYYY')}
                  </h2>
                  <p className="text-[11px] text-gray-400 font-black mt-0.5 uppercase tracking-wider">
                    {selectedDateData.projects.length} shoot{selectedDateData.projects.length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDateData(null)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-3.5">
              {selectedDateData.projects.map((project, idx) => {
                const isPast = dayjs(selectedDateData.date).isBefore(dayjs().startOf('day'));
                const theme = getEventTypeTheme(project.eventType);

                return (
                  <div key={idx} className="bg-white dark:bg-[#1a1e27] border border-gray-200 dark:border-gray-800 rounded-2xl p-4.5 hover:border-red-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-2.5">
                      <div>
                        <span className="text-[9.5px] font-black text-[#e50914] uppercase tracking-wider block">
                          {project.projectNumber}
                        </span>
                        <h3 className="font-black text-[15px] text-gray-950 dark:text-white group-hover:text-[#e50914] transition-colors">
                          {project.name}
                        </h3>
                      </div>
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isPast 
                          ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700' 
                          : 'bg-red-50 text-[#e50914] dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/40'
                      }`}>
                        {isPast ? 'Delivered' : project.status || 'Booked'}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 text-[12px] font-semibold text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 shrink-0 text-[#e50914]" />
                        <span className="text-gray-700 dark:text-gray-300">{theme.name}</span>
                      </div>
                      {project.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                          <span>{project.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <span className="text-[14px] font-black text-gray-950 dark:text-white">
                        <AnimatedCashAmount amount={Number(project.totalValue || 0)} />
                      </span>
                      <button
                        onClick={() => {
                          setSelectedDateData(null);
                          router.push(`/projects/${project.id || (project as any)._id}`);
                        }}
                        className="text-[12px] font-black text-[#e50914] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Open Case File
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
