'use client';

import React, { useState, useEffect } from 'react';
import { Star, MapPin, Phone, Calendar, IndianRupee, Layers } from 'lucide-react';
import { Project } from '@/lib/types';
import dayjs from 'dayjs';
import { toggleProjectStar } from '@/app/actions';
import { toast } from 'sonner';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onMilestoneHover?: (milestone: any, rect: DOMRect | null) => void;
  onStarToggle?: (projectId: string, isStarred: boolean) => void;
}

export default function ProjectCard({ project, onSelect, onMilestoneHover, onStarToggle }: ProjectCardProps) {
  const [starred, setStarred] = useState<boolean>(Boolean(project.isStarred));

  useEffect(() => {
    setStarred(Boolean(project.isStarred));
  }, [project.isStarred]);

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const projId = project._id || project.id;
    if (!projId) return;

    const nextStarred = !starred;
    setStarred(nextStarred); // Optimistic UI update

    try {
      const res = await toggleProjectStar(projId);
      if (res.success) {
        toast.success(nextStarred ? `⭐ Bookmarked ${project.name}` : `Removed bookmark for ${project.name}`);
        if (onStarToggle) {
          onStarToggle(projId, nextStarred);
        }
      } else {
        setStarred(!nextStarred); // Rollback on failure
        toast.error('Failed to update bookmark');
      }
    } catch (err) {
      setStarred(!nextStarred);
      toast.error('Failed to update bookmark');
    }
  };

  // Helper to determine the color of the status badge matching the designs
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'Booked':
      case 'Completed':
      case 'Verified':
      case 'Approved':
      case 'Green':
        return {
          badge: 'bg-emerald-50 text-[#137333] border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
          dot: 'bg-[#137333] text-white border-emerald-50 dark:border-emerald-950'
        };
      case 'In Progress':
      case 'Assemble Packet':
      case 'Yellow':
      case 'Orange':
        return {
          badge: 'bg-amber-50 text-[#c56000] border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
          dot: 'bg-[#c56000] text-white border-amber-50 dark:border-amber-950'
        };
      case 'Lead':
      case 'Qualified':
      case 'Request client authorization':
      case 'Blue':
        return {
          badge: 'bg-[#fef2f2] text-[#e50914] border border-[#fee2e2] dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
          dot: 'bg-[#e50914] text-white border-red-50 dark:border-red-950'
        };
      case 'Urgent':
      case 'Negotiation':
      case 'Red':
        return {
          badge: 'bg-rose-50 text-[#d93025] border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
          dot: 'bg-[#d93025] text-white border-rose-50 dark:border-rose-950'
        };
      default:
        return {
          badge: 'bg-gray-50 text-gray-500 border border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
          dot: 'bg-gray-400 text-white border-white dark:border-gray-800'
        };
    }
  };

  const displayServices = project.services && project.services.length > 0 ? project.services : [
    { name: project.eventType || 'Photography', startedDate: project.createdAt, status: project.status || 'Booked', daysLeft: 7 }
  ];

  const clientAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(project.name || 'Client')}&background=e50914&color=fff&bold=true&size=128`;

  return (
    <div 
      onClick={() => onSelect(project)}
      className="glass-card glass-card-hover rounded-[32px] p-5 cursor-pointer relative flex flex-col justify-between h-full bg-white dark:bg-[#16181c] border border-gray-100/50 dark:border-gray-800/40 shadow-sm overflow-hidden"
    >
      {/* Scoop Notch Corner (Top-Right) */}
      <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-[#fdf6f6] dark:bg-[#0b0c0e] rounded-bl-[28px] z-10 transition-colors">
        <div className="inverted-radius-top"></div>
        <div className="inverted-radius-right"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            onClick={handleToggleStar}
            className={`w-[52px] h-[52px] bg-[#ededed] dark:bg-[#24272c] hover:bg-gray-250 dark:hover:bg-gray-800 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer border border-gray-200/20 active:scale-90 group/star ${
              starred ? 'text-[#f2a93b] shadow-amber-500/20' : 'text-gray-400 hover:text-[#f2a93b]'
            }`}
            title={starred ? 'Remove Bookmark' : 'Bookmark Case'}
          >
            <Star className={`w-[18px] h-[18px] transition-transform group-hover/star:scale-110 ${starred ? 'fill-current text-[#f2a93b]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top section: Profile details */}
      <div className="flex items-start justify-between pr-[84px]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm shrink-0">
            <img 
              src={clientAvatar} 
              alt={project.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-[14.5px] font-extrabold text-[#1a1c22] dark:text-white leading-tight">
              {project.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] font-bold text-gray-400 dark:text-gray-500">
              <span className="text-[#e50914] font-extrabold">{project.eventType}</span>
              {project.location && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[110px]">{project.location}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Structured Details Layout (Location, Contact, Shoot Date, Total Contract) */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-3 mt-4 text-[11.5px] border-b border-gray-100/80 dark:border-gray-800/40 pb-3.5">
        {/* Left Column */}
        <div className="space-y-2.5">
          <div>
            <span className="text-gray-400 dark:text-gray-500 block font-semibold uppercase tracking-wider text-[9px]">Location</span>
            <span className="text-[#1a1c22] dark:text-gray-200 font-extrabold block mt-0.5 truncate max-w-[130px]" title={project.location || 'Studio'}>
              {project.location || 'Studio Location'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500 block font-semibold uppercase tracking-wider text-[9px]">Contact</span>
            <span className="text-[#1a1c22] dark:text-gray-200 font-extrabold block mt-0.5 truncate max-w-[130px]">
              {project.phone || 'N/A'}
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-2.5">
          <div>
            <span className="text-gray-400 dark:text-gray-500 block font-semibold uppercase tracking-wider text-[9px]">Event / Shoot Date</span>
            <span className="text-[#1a1c22] dark:text-gray-200 font-extrabold block mt-0.5">
              {project.eventDate ? dayjs(project.eventDate).format('MMM D, YYYY') : dayjs(project.createdAt).format('MMM D, YYYY')}
            </span>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500 block font-semibold uppercase tracking-wider text-[9px]">Total Contract</span>
            <span className="text-[#e50914] dark:text-[#8efa1d] font-black block mt-0.5">
              ₹{Number(project.totalValue || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Services / Deliverables Section */}
      <div className="mt-3.5 flex-1 flex flex-col justify-end">
        {/* Table header */}
        <div className="flex items-center justify-between text-[9px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-wider mb-2 px-1">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-[#fee2e2]/60 dark:bg-gray-800/40 text-[#e50914] dark:text-[#8efa1d] flex items-center justify-center text-[9px] font-extrabold">
              {displayServices.length}
            </span>
            <span>Deliverables</span>
          </div>
          <span>Started</span>
          <span>Status</span>
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
                <span className="font-extrabold text-gray-700 dark:text-gray-350 truncate max-w-[85px]" title={service.name}>
                  {service.name}
                </span>

                {/* Started Date */}
                <span className="text-gray-400 dark:text-gray-500 font-bold text-[10px] truncate max-w-[70px]">
                  {service.startedDate ? dayjs(service.startedDate).format('MMM D, YYYY') : dayjs(project.createdAt).format('MMM D, YYYY')}
                </span>
                
                {/* Stage Badge */}
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold truncate max-w-[120px] leading-none shrink-0 ${colors.badge}`}>
                  {service.status}
                </span>

                {/* Days Left Circle Badge */}
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${colors.dot}`}>
                  {service.daysLeft !== undefined ? service.daysLeft : '7'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
