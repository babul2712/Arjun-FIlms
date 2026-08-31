import React, { useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, MapPin, Camera } from 'lucide-react';
import { Project } from '@/lib/types';

export default function CalendarView({ projects }: { projects: Project[] }) {
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
          className={`min-h-[85px] p-2.5 flex flex-col justify-between transition-colors border-r border-b border-gray-100 ${
            !isCurrentMonth 
              ? 'text-gray-300 bg-gray-50/40' 
              : 'bg-white text-gray-800'
          } ${hasProjects ? 'cursor-pointer hover:bg-blue-50/30' : ''}`}
        >
          <span className={`text-[12px] font-bold self-end ${hasProjects ? 'text-[#0066fe]' : ''}`}>{formattedDate}</span>
          <div className="mt-1.5 flex flex-col gap-1 overflow-y-auto max-h-[50px] no-scrollbar">
            {dayProjects.map((p, idx) => {
              const pDate = typeof p.eventDate === 'string' ? p.eventDate.substring(0, 10) : dayjs(p.eventDate).format('YYYY-MM-DD');
              const isPast = dayjs(pDate).isBefore(dayjs().startOf('day'));
              return (
                <div 
                  key={idx} 
                  className={`text-[9px] font-bold truncate px-1.5 py-0.5 rounded-md ${
                    isPast 
                      ? 'bg-gray-100 text-gray-500' 
                      : 'bg-[#eaf2ff] text-[#0263e0] border border-[#d2e4ff]/40'
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
    <div className="w-full h-full flex flex-col relative font-sans text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[17px] font-extrabold text-[#1a1c22]">{currentDate.format('MMMM YYYY')} Bookings</h3>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600"/>
          </button>
          <button 
            onClick={nextMonth} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-gray-600"/>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-3 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-xs font-bold text-gray-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="flex-1 flex flex-col border border-gray-100/80 rounded-2xl overflow-hidden shadow-sm">
        {rows}
      </div>

      {/* Date Details Modal */}
      {selectedDateData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedDateData(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg max-h-[80vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-gray-200/50 animate-slide-in"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-[#0066fe] rounded-xl border border-blue-100/30">
                  <CalendarIcon className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h2 className="text-[17px] font-extrabold text-gray-800 leading-tight">
                    {dayjs(selectedDateData.date).format('MMMM D, YYYY')}
                  </h2>
                  <p className="text-[12px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                    {selectedDateData.projects.length} case{selectedDateData.projects.length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDateData(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {selectedDateData.projects.map((project, idx) => {
                const isPast = dayjs(selectedDateData.date).isBefore(dayjs().startOf('day'));
                return (
                  <div key={idx} className="bg-white border border-gray-150 rounded-[24px] p-5 hover:border-blue-400/50 transition-all group">
                    <div className="flex justify-between items-start mb-3.5">
                      <h3 className="font-extrabold text-[15px] text-[#1a1c22] group-hover:text-[#0066fe] transition-colors">{project.name}</h3>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-[10px] uppercase tracking-wider ${
                        isPast 
                          ? 'bg-gray-100 text-gray-500 border border-gray-200' 
                          : 'bg-[#eaf2ff] text-[#0263e0] border border-[#d2e4ff]'
                      }`}>
                        {isPast ? 'Completed' : 'Upcoming'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-[12.5px] font-semibold text-gray-500">
                      <div className="flex items-start gap-2">
                        <Camera className="w-4 h-4 shrink-0 text-[#0066fe]/70 mt-0.5" />
                        <span className="text-[#1a1c22] font-bold">Client: <span className="text-gray-500 font-semibold">{project.name}</span></span>
                      </div>
                      {project.eventType && (
                        <div className="flex items-start gap-2">
                          <CalendarIcon className="w-4 h-4 shrink-0 text-[#0066fe]/70 mt-0.5" />
                          <span className="text-[#1a1c22] font-bold">Case Type: <span className="text-gray-500 font-semibold">{typeof project.eventType === 'string' ? project.eventType : (project.eventType as any).name || 'Unknown'}</span></span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 shrink-0 text-[#0066fe]/70 mt-0.5" />
                        <span className="text-[#1a1c22] font-bold">Venue: <span className="text-gray-500 font-semibold">{project.location || 'Not specified'}</span></span>
                      </div>
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
