'use client';

import React from 'react';
import { Star, MapPin, Calendar, ArrowUpRight, Eye, Layers } from 'lucide-react';
import { Project } from '@/lib/types';
import dayjs from 'dayjs';
import { toggleProjectStar } from '@/app/actions';
import { toast } from 'sonner';
import AnimatedCashAmount from '@/components/ui/AnimatedCashAmount';
import { useRouter } from 'next/navigation';

interface ProjectListViewProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelect: (project: Project) => void;
  onMilestoneHover?: (milestone: any, rect: DOMRect | null) => void;
  onStarToggle?: (projectId: string, isStarred: boolean) => void;
}

export default function ProjectListView({
  projects,
  selectedProject,
  onSelect,
  onMilestoneHover,
  onStarToggle,
}: ProjectListViewProps) {
  const router = useRouter();

  // Helper for status badge colors
  const getStatusColors = (status?: string) => {
    switch (status) {
      case 'Booked':
      case 'Completed':
      case 'Verified':
      case 'Approved':
      case 'Green':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40';
      case 'In Progress':
      case 'Assemble Packet':
      case 'Yellow':
      case 'Orange':
        return 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40';
      case 'Lead':
      case 'Qualified':
      case 'Blue':
        return 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40';
      case 'Urgent':
      case 'Red':
        return 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const handleStar = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const projId = project._id || project.id;
    if (!projId) return;
    const nextState = !project.isStarred;
    try {
      const res = await toggleProjectStar(projId);
      if (res.success) {
        toast.success(nextState ? `Bookmarked ${project.name}` : `Removed bookmark for ${project.name}`);
        if (onStarToggle) {
          onStarToggle(projId, nextState);
        }
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  return (
    <div className="w-full space-y-3 font-sans">
      {/* Table-like Header for desktop */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-2.5 bg-white/40 dark:bg-[#16181c]/40 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-800/40 text-[10.5px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        <div className="col-span-4 flex items-center gap-2">
          <span>Client & Case</span>
        </div>
        <div className="col-span-2">Event & Date</div>
        <div className="col-span-2">Venue</div>
        <div className="col-span-2">Contract Value</div>
        <div className="col-span-2 text-right">Status & Actions</div>
      </div>

      {/* Row items */}
      <div className="space-y-2.5">
        {projects.map((project) => {
          const isSelected = selectedProject?.id === project.id || (project._id && selectedProject?._id === project._id);
          const clientAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(project.name || 'Client')}&background=e50914&color=fff&bold=true&size=128`;
          const displayImage = project.coverImage || clientAvatar;
          const displayServices = project.services || [];
          const statusColors = getStatusColors(project.status);

          return (
            <div
              key={project.id || project._id}
              onClick={() => onSelect(project)}
              className={`w-full rounded-2xl p-4 transition-all duration-200 border cursor-pointer group flex flex-col lg:grid lg:grid-cols-12 gap-4 items-start lg:items-center ${
                isSelected
                  ? 'bg-gradient-to-r from-red-50/80 via-white to-red-50/40 dark:from-red-950/40 dark:via-[#1c2027] dark:to-red-950/20 border-[#e50914] ring-2 ring-red-400/20'
                  : 'bg-white/85 dark:bg-[#16181c]/80 hover:bg-white dark:hover:bg-[#1c2027] border-gray-200/70 dark:border-gray-800/60 hover:border-[#e50914]/40 hover:-translate-y-0.5'
              }`}
            >
              {/* Col 1: Avatar, Star & Case Info (span 4) */}
              <div className="col-span-12 lg:col-span-4 flex items-center gap-3.5 min-w-0 w-full">
                <button
                  type="button"
                  onClick={(e) => handleStar(e, project)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-300 hover:text-amber-400 shrink-0 cursor-pointer"
                  title={project.isStarred ? 'Bookmarked' : 'Bookmark case'}
                >
                  <Star
                    className={`w-4 h-4 ${
                      project.isStarred ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>

                <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 bg-gray-100 dark:bg-gray-800 shrink-0">
                  <img src={displayImage} alt={project.name} className="w-full h-full object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-[14px] text-gray-900 dark:text-white truncate group-hover:text-[#e50914] transition-colors">
                      {project.name}
                    </h4>
                    {project.projectNumber && (
                      <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/80 px-1.5 py-0.2 rounded-md">
                        {project.projectNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400 dark:text-gray-500 font-semibold">
                    <span className="text-[#e50914] font-bold">{project.eventType || 'Photography'}</span>
                    {project.phone && (
                      <>
                        <span>•</span>
                        <span className="truncate">{project.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Col 2: Event & Date (span 2) */}
              <div className="col-span-6 lg:col-span-2 flex flex-col justify-center text-[12px]">
                <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-200">
                  <Calendar className="w-3.5 h-3.5 text-[#e50914] shrink-0" />
                  <span>
                    {project.eventDate
                      ? dayjs(project.eventDate).format('MMM D, YYYY')
                      : dayjs(project.createdAt).format('MMM D, YYYY')}
                  </span>
                </div>
                {displayServices.length > 0 && (
                  <span className="text-[10.5px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-gray-400" />
                    {displayServices.length} deliverable{displayServices.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Col 3: Venue (span 2) */}
              <div className="col-span-6 lg:col-span-2 flex items-center gap-1.5 text-[12px] font-semibold text-gray-600 dark:text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{project.location || 'Studio Location'}</span>
              </div>

              {/* Col 4: Contract Value (span 2) */}
              <div className="col-span-6 lg:col-span-2 flex flex-col justify-center">
                <span className="text-[14px] font-black text-[#e50914] dark:text-[#8efa1d]">
                  <AnimatedCashAmount amount={Number(project.totalValue || 0)} />
                </span>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Total Contract
                </span>
              </div>

              {/* Col 5: Status & Quick Action (span 2) */}
              <div className="col-span-6 lg:col-span-2 flex items-center justify-between lg:justify-end gap-2.5 w-full">
                <span
                  className={`px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border leading-none shrink-0 ${statusColors}`}
                >
                  {project.status || 'Booked'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(project);
                    }}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-[#e50914]/10 dark:bg-gray-800 text-gray-600 hover:text-[#e50914] dark:text-gray-300 transition-colors cursor-pointer"
                    title="Quick Inspect"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/projects/${project.id || project._id}`);
                    }}
                    className="p-2 rounded-xl bg-[#e50914]/10 hover:bg-[#e50914] text-[#e50914] hover:text-white transition-colors cursor-pointer group/btn"
                    title="Open Case File"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
