import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, MapPin, Camera, ArrowUpRight } from 'lucide-react';
import { Project } from '@/lib/types';

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
          className={`min-h-[85px] p-2 flex flex-col justify-between transition-colors border-r border-b border-gray-100 dark:border-gray-800/60 ${
            !isCurrentMonth 
              ? 'text-gray-300 dark:text-gray-600 bg-gray-50/40 dark:bg-gray-900/20' 
              : 'bg-white dark:bg-[#16181c] text-gray-800 dark:text-gray-200'
          } ${hasProjects ? 'cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-950/30' : ''} ${
            isToday ? 'ring-1.5 ring-inset ring-[#0066fe]/40' : ''
          }`}
        >
          <div className="flex justify-between items-center">
            {isToday ? (
              <span className="w-5 h-5 rounded-full bg-[#0066fe] text-white text-[10px] font-bold flex items-center justify-center">
                {formattedDate}
              </span>
            ) : (
              <span className={`text-[11px] font-bold ${hasProjects ? 'text-[#0066fe]' : !isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
                {formattedDate}
              </span>
            )}
            {hasProjects && (
              <span className="text-[9px] font-extrabold text-[#0066fe] bg-[#eaf2ff] dark:bg-blue-950/40 px-1 rounded">
                {dayProjects.length}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-col gap-1 overflow-y-auto max-h-[50px] custom-scrollbar">
            {dayProjects.map((p, idx) => {
              const pDate = typeof p.eventDate === 'string' ? p.eventDate.substring(0, 10) : dayjs(p.eventDate).format('YYYY-MM-DD');
              const isPast = dayjs(pDate).isBefore(dayjs().startOf('day'));
              return (
                <div 
                  key={idx} 
                  className={`text-[9px] font-bold truncate px-1.5 py-0.5 rounded-md ${
                    isPast 
                      ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' 
                      : 'bg-[#eaf2ff] text-[#0263e0] border border-[#d2e4ff]/40 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/40'
                  }`}
                  title={p.name}
                >
                  {p.name}
                </div>
              );
            })}
          </div>
        </div>
      );
      day = day.add(1, 'day');
    }
    rows.push(
      <div className="grid grid-cols-7 gap-px" key={day.format('YYYY-MM-DD')}>
        {days}
      </div>
    );
    days = [];
  }

  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));

  return (
    <div className="w-full flex flex-col relative font-sans text-gray-800 dark:text-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-[15px] font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#0066fe]" />
            Shoot Calendar
          </h4>
          <h3 className="text-[20px] font-black text-[#1a1c22] dark:text-white mt-0.5">
            {currentDate.format('MMMM YYYY')}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl">
          <button 
            onClick={prevMonth} 
            className="p-1.5 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4"/>
          </button>
          <button
            onClick={() => setCurrentDate(dayjs())}
            className="px-2.5 py-1 text-[11px] font-bold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>
          <button 
            onClick={nextMonth} 
            className="p-1.5 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4"/>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2 text-center bg-gray-50/70 dark:bg-[#1c1f24] py-1.5 rounded-xl">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      <div className="flex-1 flex flex-col border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-[#16181c]">
        {rows}
      </div>

      {/* Date Details Modal */}
      {selectedDateData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedDateData(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#16181c] w-full max-w-lg max-h-[80vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-gray-200/60 dark:border-gray-800 animate-slide-in"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-[#0066fe] rounded-2xl border border-blue-100/30 dark:border-blue-900/30">
                  <CalendarIcon className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h2 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight">
                    {dayjs(selectedDateData.date).format('MMMM D, YYYY')}
                  </h2>
                  <p className="text-[11px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">
                    {selectedDateData.projects.length} case{selectedDateData.projects.length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDateData(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {selectedDateData.projects.map((project, idx) => {
                const isPast = dayjs(selectedDateData.date).isBefore(dayjs().startOf('day'));
                return (
                  <div key={idx} className="bg-white dark:bg-[#1c1f24] border border-gray-150 dark:border-gray-800 rounded-2xl p-4.5 hover:border-[#0066fe]/50 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-extrabold text-[15px] text-[#1a1c22] dark:text-white group-hover:text-[#0066fe] transition-colors">{project.name}</h3>
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                        isPast 
                          ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700' 
                          : 'bg-[#eaf2ff] text-[#0263e0] dark:bg-blue-950/40 dark:text-blue-300 border border-[#d2e4ff] dark:border-blue-900/40'
                      }`}>
                        {isPast ? 'Completed' : 'Upcoming'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-[12px] font-semibold text-gray-500 dark:text-gray-400">
                      <div className="flex items-start gap-2">
                        <Camera className="w-4 h-4 shrink-0 text-[#0066fe]/80 mt-0.5" />
                        <span className="text-[#1a1c22] dark:text-gray-200 font-bold">Client: <span className="text-gray-500 dark:text-gray-400 font-normal">{project.name}</span></span>
                      </div>
                      {project.eventType && (
                        <div className="flex items-start gap-2">
                          <CalendarIcon className="w-4 h-4 shrink-0 text-[#0066fe]/80 mt-0.5" />
                          <span className="text-[#1a1c22] dark:text-gray-200 font-bold">Case Type: <span className="text-gray-500 dark:text-gray-400 font-normal">{typeof project.eventType === 'string' ? project.eventType : (project.eventType as any).name || 'Unknown'}</span></span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 shrink-0 text-[#0066fe]/80 mt-0.5" />
                        <span className="text-[#1a1c22] dark:text-gray-200 font-bold">Venue: <span className="text-gray-500 dark:text-gray-400 font-normal">{project.location || 'Not specified'}</span></span>
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <span className="text-[13px] font-extrabold text-gray-900 dark:text-white">
                        ₹{(project.totalValue || 0).toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedDateData(null);
                          router.push(`/projects/${project.id || (project as any)._id}`);
                        }}
                        className="text-[12px] font-bold text-[#0066fe] hover:underline flex items-center gap-1 cursor-pointer"
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
