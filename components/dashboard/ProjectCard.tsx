'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Project } from '@/lib/types';
import dayjs from 'dayjs';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onMilestoneHover?: (milestone: any, rect: DOMRect | null) => void;
}

// Client profiles mapper to perfectly align mock data with Unsplash images and details from the mockup
const getClientDetails = (name: string) => {
  if (name.includes('Luisana')) {
    return {
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      flag: '🇲🇽',
      nationality: 'Mexican',
      language: 'Spanish',
      attorney: 'Davidson Theresa',
      paralegal: 'Veronica Manriquez',
      duration: '30 d',
      contacts: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&h=80&q=80'
      ]
    };
  }
  if (name.includes('Milagros')) {
    return {
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
      flag: '🇲🇽',
      nationality: 'Mexican',
      language: 'English',
      attorney: 'Ferrero Alexandra',
      paralegal: 'Collins Kimberly',
      duration: '4 mo 5 d',
      contacts: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80'
      ]
    };
  }
  if (name.includes('Alejandro')) {
    return {
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
      flag: '🇲🇽',
      nationality: 'Mexican',
      language: 'Spanish',
      attorney: 'Davidson Theresa',
      paralegal: 'Harris Jennifer',
      duration: '7 mo 12 d',
      contacts: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&h=80&q=80'
      ]
    };
  }
  if (name.includes('Leonardo')) {
    return {
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
      flag: '🇺🇸',
      nationality: 'American',
      language: 'English',
      attorney: 'Johnson Mary',
      paralegal: 'Collins Kimberly',
      duration: '6 d',
      contacts: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80'
      ]
    };
  }
  if (name.includes('Lorena')) {
    return {
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      flag: '🇲🇽',
      nationality: 'Mexican',
      language: 'Spanish',
      attorney: 'Ferrero Alexandra',
      paralegal: 'Wellington Elizabeth',
      duration: '24 mo 5 d',
      contacts: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80'
      ]
    };
  }
  if (name.includes('Guido')) {
    return {
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      flag: '🇲🇽',
      nationality: 'Mexican',
      language: 'Spanish',
      attorney: 'Davidson Theresa',
      paralegal: 'Harris Jennifer',
      duration: '7 d',
      contacts: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&h=80&q=80'
      ]
    };
  }
  // Default fallback details
  return {
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    flag: '🇲🇽',
    nationality: 'Mexican',
    language: 'Spanish',
    attorney: 'Davidson Theresa',
    paralegal: 'Veronica Manriquez',
    duration: '15 d',
    contacts: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80'
    ]
  };
};

export default function ProjectCard({ project, onSelect, onMilestoneHover }: ProjectCardProps) {
  const details = getClientDetails(project.name);

  // Determine if this project is starred to match mockup's starred and unstarred look
  const isStarred = project.name.includes('Luisana') || project.name.includes('Milagros') || project.name.includes('Alejandro');

  // Helper to determine the color of the status badge matching the designs
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'Request client authorization':
      case 'Blue':
        return {
          badge: 'bg-[#fef2f2] text-[#e50914] border border-[#fee2e2] dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
          dot: 'bg-[#e50914] text-white border-red-50 dark:border-red-950'
        };
      case 'Assemble Packet':
      case 'Yellow':
      case 'Orange':
        return {
          badge: 'bg-amber-50 text-[#c56000] border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
          dot: 'bg-[#c56000] text-white border-amber-50 dark:border-amber-950'
        };
      case 'Attorney review FOIA':
      case 'Red':
      case 'Urgent':
        return {
          badge: 'bg-rose-50 text-[#d93025] border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
          dot: 'bg-[#d93025] text-white border-rose-50 dark:border-rose-950'
        };
      case 'Completed':
      case 'Verified':
      case 'Approved':
      case 'Green':
        return {
          badge: 'bg-emerald-50 text-[#137333] border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
          dot: 'bg-[#137333] text-white border-emerald-50 dark:border-emerald-950'
        };
      default:
        return {
          badge: 'bg-gray-50 text-gray-500 border border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
          dot: 'bg-gray-400 text-white border-white dark:border-gray-800'
        };
    }
  };

  const displayServices = project.services && project.services.length > 0 ? project.services : [
    { name: 'I-130', startedDate: project.createdAt, status: 'Request client authorization', daysLeft: 14 }
  ];

  return (
    <div 
      onClick={() => onSelect(project)}
      className="glass-card glass-card-hover rounded-[32px] p-5 cursor-pointer relative flex flex-col justify-between h-full bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 shadow-sm overflow-hidden"
    >
      {/* Scoop Notch Corner (Top-Right) matching inverted_bouder-radius-2.html but scaled down */}
      <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-[#fdf6f6] dark:bg-[#0b0c0e] rounded-bl-[28px] z-10 transition-colors">
        <div className="inverted-radius-top"></div>
        <div className="inverted-radius-right"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className={`w-[52px] h-[52px] bg-[#ededed] dark:bg-[#24272c] hover:bg-gray-250 dark:hover:bg-gray-800 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer border border-gray-200/20 active:scale-95 ${
              isStarred ? 'text-[#f2a93b]' : 'text-gray-400 hover:text-[#f2a93b]'
            }`}
          >
            <Star className={`w-[18px] h-[18px] ${isStarred ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top section: Profile details */}
      <div className="flex items-start justify-between pr-[84px]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm shrink-0">
            <img 
              src={details.avatar} 
              alt={project.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-[14.5px] font-extrabold text-[#1a1c22] dark:text-white leading-tight">
              {project.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold text-gray-400 dark:text-gray-500">
              <span className="text-[11px] leading-none shrink-0">{details.flag}</span>
              <span className="text-gray-500 font-extrabold">{details.nationality}</span>
              <span>•</span>
              <span>{details.language}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Details Layout (Contacts, Attorney, Paralegal, Case Type, Created, Duration) */}
      <div className="grid grid-cols-2 gap-y-3.5 gap-x-3 mt-4 text-[11.5px] border-b border-gray-100/80 dark:border-gray-800/40 pb-4">
        {/* Left Column */}
        <div className="space-y-3">
          <div>
            <span className="text-gray-400 dark:text-gray-500 block font-semibold uppercase tracking-wider text-[9px]">Contacts</span>
            <div className="flex items-center mt-1 pl-1">
              {details.contacts.map((contactUrl, idx) => (
                <img 
                  key={idx}
                  src={contactUrl} 
                  alt="Contact" 
                  className="w-[22px] h-[22px] rounded-full border-2 border-white dark:border-[#16181c] -ml-1.5 first:ml-0 shadow-sm object-cover"
                />
              ))}
              <div className="w-[22px] h-[22px] rounded-full bg-[#f1f3f4] dark:bg-gray-800 border-2 border-white dark:border-[#16181c] -ml-1.5 flex items-center justify-center text-[9px] font-bold text-gray-500 dark:text-gray-400 shadow-sm">
                +2
              </div>
            </div>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-550 block font-semibold uppercase tracking-wider text-[9px]">Paralegal</span>
            <span className="text-[#1a1c22] dark:text-gray-200 font-extrabold block mt-0.5 leading-tight">{details.paralegal}</span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <div>
            <span className="text-gray-400 dark:text-gray-550 block font-semibold uppercase tracking-wider text-[9px]">Attorney</span>
            <span className="text-[#1a1c22] dark:text-gray-200 font-extrabold block mt-0.5 leading-tight">{details.attorney}</span>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-555 block font-semibold uppercase tracking-wider text-[9px]">Case type</span>
            <span className="text-[#1a1c22] dark:text-gray-200 font-extrabold block mt-0.5 truncate max-w-[130px] leading-tight" title={project.eventType}>
              {project.eventType}
            </span>
          </div>
        </div>

        {/* Bottom Metadata Row spanning columns */}
        <div className="col-span-2 flex items-center gap-6 mt-0.5 border-t border-gray-50 dark:border-gray-850/50 pt-2.5">
          <div>
            <span className="text-gray-400 dark:text-gray-500 block font-semibold uppercase tracking-wider text-[9px]">Created</span>
            <span className="text-[#1a1c22] dark:text-gray-200 font-extrabold block mt-0.5">
              {dayjs(project.createdAt).format('MMM D, YYYY')}
            </span>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500 block font-semibold uppercase tracking-wider text-[9px]">Duration</span>
            <span className="text-[#1a1c22] dark:text-gray-200 font-extrabold block mt-0.5">
              {details.duration}
            </span>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="mt-4 flex-1 flex flex-col justify-end">
        {/* Table header */}
        <div className="flex items-center justify-between text-[9px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-wider mb-2.5 px-1">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-[#fee2e2]/60 dark:bg-gray-800/40 text-[#e50914] dark:text-[#8efa1d] flex items-center justify-center text-[9px] font-extrabold">
              {displayServices.length}
            </span>
            <span>Services</span>
          </div>
          <span>Started</span>
          <span>Stages</span>
          <span>Days Left</span>
        </div>

        {/* Service Rows */}
        <div className="space-y-1.5">
          {displayServices.map((service, idx) => {
            const colors = getStatusColors(service.status);
            return (
              <div 
                key={idx} 
                onMouseEnter={(e) => {
                  if (onMilestoneHover) {
                    onMilestoneHover(service, e.currentTarget.getBoundingClientRect());
                  }
                }}
                onMouseLeave={() => {
                  if (onMilestoneHover) {
                    onMilestoneHover(null, null);
                  }
                }}
                className="flex items-center justify-between py-1.5 px-2 bg-gray-55/60 dark:bg-[#24272c] hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl border border-gray-200/20 dark:border-gray-800/10 text-[11px] cursor-help transition-all"
              >
                {/* Service Name */}
                <span className="font-extrabold text-gray-700 dark:text-gray-350 truncate max-w-[80px]" title={service.name}>
                  {service.name}
                </span>

                {/* Started Date */}
                <span className="text-gray-400 dark:text-gray-500 font-bold text-[10px] truncate max-w-[70px]">
                  {service.startedDate ? dayjs(service.startedDate).format('MMM D, YYYY') : 'Sept 3, 2024'}
                </span>
                
                {/* Stage Badge */}
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold truncate max-w-[130px] leading-none shrink-0 ${colors.badge}`}>
                  {service.status}
                </span>

                {/* Days Left Circle Badge */}
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${colors.dot}`}>
                  {service.daysLeft !== undefined ? service.daysLeft : '14'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
