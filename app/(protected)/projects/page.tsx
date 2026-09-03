'use client';

import React, { useEffect, useState } from 'react';
import { getProjects, getDashboardStats, createProject } from '@/services/api';
import { Project } from '@/lib/types';
import { 
  Plus, 
  Search, 
  Grid, 
  Star,
  X,
  Calendar,
  AlertCircle,
  ExternalLink,
  Trash2,
  Link2
} from 'lucide-react';
import ProjectCard from '@/components/dashboard/ProjectCard';
import FiltersPanel from '@/components/dashboard/FiltersPanel';
import { useUIStore } from '@/store/uiStore';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { deleteProject } from '@/app/actions';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

export default function ProjectsListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'leads' | 'starred'>('active');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toggleFilterPanel } = useUIStore();
  
  // Custom states matching mockup
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<any | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const projectsData = await getProjects();
      setProjects(projectsData);
      applyFiltering(projectsData, activeTab, searchQuery);
    } catch (e) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const applyFiltering = (dataList: Project[], tab: 'active' | 'leads' | 'starred', search: string) => {
    let filtered = [...dataList];
    
    // Tab filter
    if (tab === 'active') {
      filtered = filtered.filter(p => p.status === 'Booked' || p.status === 'Completed' || p.status === 'Negotiation');
    } else if (tab === 'leads') {
      filtered = filtered.filter(p => p.status === 'Lead' || p.status === 'Qualified');
    } else if (tab === 'starred') {
      filtered = filtered.filter(p => p.isStarred);
    }

    // Search query filter
    if (search.trim() !== '') {
      const query = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.eventType.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
      );
    }

    setFilteredProjects(filtered);
  };

  const handleTabChange = (tab: 'active' | 'leads' | 'starred') => {
    setActiveTab(tab);
    applyFiltering(projects, tab, searchQuery);
    setSelectedProject(null); // Clear active card focus
  };

  const handleStarToggle = (projectId: string, isStarred: boolean) => {
    setProjects(prev => {
      const updated = prev.map(p => (p._id === projectId || p.id === projectId) ? { ...p, isStarred } : p);
      applyFiltering(updated, activeTab, searchQuery);
      return updated;
    });
    if (selectedProject && (selectedProject._id === projectId || selectedProject.id === projectId)) {
      setSelectedProject(prev => prev ? { ...prev, isStarred } : null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    applyFiltering(projects, activeTab, val);
  };

  const handleFilterChange = (filters: any) => {
    let list = [...projects];
    if (filters.nationality) {
      list = list.filter(p => p.name.toLowerCase().includes(filters.nationality.toLowerCase()) || 
                              p.location.toLowerCase().includes(filters.nationality.toLowerCase()));
    }
    applyFiltering(list, activeTab, searchQuery);
  };

  const handleMilestoneHover = (milestone: any, rect: DOMRect | null) => {
    if (milestone && rect) {
      setHoveredMilestone(milestone);
      setTooltipPos({
        top: window.scrollY + rect.top - 70, 
        left: window.scrollX + rect.left - 100
      });
    } else {
      setHoveredMilestone(null);
      setTooltipPos(null);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete);
      toast.success('Project case deleted');
      setProjectToDelete(null);
      setSelectedProject(null);
      loadData();
    } catch (e) {
      toast.error('Failed to delete case');
    }
  };

  // Helper to determine the color of the status badge matching the designs
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Request client authorization':
      case 'Blue':
        return 'bg-[#fef2f2] text-[#e50914] border border-[#fee2e2]';
      case 'Assemble Packet':
      case 'Yellow':
      case 'Orange':
        return 'bg-[#fff4e5] text-[#c56000] border border-[#ffe4cc]';
      case 'Attorney review FOIA':
      case 'Red':
      case 'Urgent':
        return 'bg-[#fce8e6] text-[#d93025] border border-[#fad2cf]';
      case 'Completed':
      case 'Verified':
      case 'Approved':
      case 'Green':
        return 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]';
      default:
        return 'bg-gray-50 text-gray-500 border border-gray-100';
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-16 relative font-sans text-gray-800 animate-fade-in">
      
      {/* Integrated Header Row matching mockup */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left Side: Tabs */}
        <div className="flex bg-[#fee2e2]/40 p-1.5 rounded-[22px] border border-[#fecaca]/40 backdrop-blur-md gap-1">
          <button 
            onClick={() => handleTabChange('active')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[18px] text-[13.5px] font-bold cursor-pointer transition-all ${
              activeTab === 'active' 
                ? 'bg-white text-[#1a1c22] shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Active cases</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#e50914]" />
          </button>
          <button 
            onClick={() => handleTabChange('leads')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[18px] text-[13.5px] font-bold cursor-pointer transition-all ${
              activeTab === 'leads' 
                ? 'bg-white text-[#1a1c22] shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>New prospects</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#e50914]" />
          </button>
          <button 
            onClick={() => handleTabChange('starred')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[18px] text-[13.5px] font-bold cursor-pointer transition-all ${
              activeTab === 'starred' 
                ? 'bg-white text-[#1a1c22] shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Star className={`w-4 h-4 ${activeTab === 'starred' ? 'fill-amber-400 text-amber-500' : 'text-amber-400'}`} />
            <span>Starred</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700 font-extrabold">
              {projects.filter(p => p.isStarred).length}
            </span>
          </button>
        </div>

        {/* Right Side: Search, Filter, Action Button */}
        <div className="flex items-center gap-3 w-full md:w-auto self-end md:self-auto">
          {/* Copy Payment Link Rounded Button */}
          <button
            type="button"
            onClick={() => {
              const url = typeof window !== 'undefined' ? `${window.location.origin}/payment` : 'https://arjun-f-ilms.vercel.app/payment';
              navigator.clipboard.writeText(url);
              toast.success('Payment portal link copied to clipboard!');
            }}
            className="flex items-center gap-2 px-4 py-3 bg-[#fee2e2]/50 hover:bg-[#fbd3d3] text-[#e50914] rounded-full border border-[#fecaca]/60 text-[12.5px] font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 group"
            title="Copy Client Payment Gateway Link"
          >
            <Link2 className="w-4 h-4 text-[#e50914] group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">Copy Payment Link</span>
          </button>

          {/* Search Field */}
          <div className="flex-1 md:flex-none flex items-center px-4 py-3 bg-[#fee2e2]/40 rounded-2xl border border-[#fecaca]/40 w-64 focus-within:bg-white focus-within:border-gray-300 transition-all">
            <Search className="text-gray-400 w-[18px] h-[18px] mr-2.5 shrink-0" />
            <input 
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-transparent border-none focus:outline-none text-[13px] font-semibold w-full placeholder:text-gray-400/80" 
              placeholder="Search for client" 
              type="text"
            />
          </div>

          {/* Filter Toggle */}
          <button 
            onClick={toggleFilterPanel}
            className="p-3 bg-[#fee2e2]/40 hover:bg-[#fee2e2] text-gray-600 rounded-2xl border border-[#fecaca]/40 transition-all cursor-pointer"
            title="Filters"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h10M4 18h7" strokeLinecap="round" />
            </svg>
          </button>

          {/* Create Button */}
          <button 
            onClick={() => router.push('/projects/create')}
            className="w-12 h-12 rounded-full bg-[#e50914] hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
            title="Create New Project"
          >
            <Plus className="w-[22px] h-[22px] stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Cases Counter Badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#fee2e2]/80 text-[#e50914] rounded-full border border-[#fecaca]/60 w-fit text-[13px] font-bold shadow-sm">
        <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>{filteredProjects.length} Cases</span>
      </div>

      {/* Grid: 3 columns default, collapses to 2 when card focused */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Grid listing */}
        <div className={`col-span-12 ${selectedProject ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300`}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-[32px] h-[340px] bg-white/50" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="glass-card rounded-[32px] p-16 text-center max-w-md mx-auto space-y-6 bg-white border border-gray-200/50">
              <Grid className="w-16 h-16 mx-auto text-gray-300 stroke-1" />
              <h3 className="text-[17px] font-extrabold text-gray-700">No projects found</h3>
              <p className="text-[13px] text-gray-400 font-medium">Create a new case to populate this directory.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 ${selectedProject ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8`}>
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.id || project._id} 
                  project={project} 
                  onSelect={(p) => setSelectedProject(p)}
                  onMilestoneHover={handleMilestoneHover}
                  onStarToggle={handleStarToggle}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Focused Card Expansion matching mockup */}
        {selectedProject && (
          <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-8 animate-slide-in">
            <div className="glass-card rounded-[32px] p-6 bg-white border border-gray-200/60 shadow-2xl relative space-y-6">
              
              {/* Close and Favorite indicators */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-100 shadow-sm shrink-0">
                    <img 
                      src={
                        selectedProject.name.includes('Luisana') ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' :
                        selectedProject.name.includes('Milagros') ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80' :
                        selectedProject.name.includes('Alejandro') ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' :
                        selectedProject.name.includes('Leonardo') ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' :
                        selectedProject.name.includes('Lorena') ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' :
                        selectedProject.name.includes('Guido') ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' :
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
                      }
                      alt={selectedProject.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-extrabold text-gray-800 leading-tight">
                      {selectedProject.name}
                    </h3>
                    <span className="text-[11px] font-extrabold text-[#e50914] uppercase tracking-wider block mt-1">
                      {selectedProject.eventType}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={async () => {
                      const projId = selectedProject._id || selectedProject.id;
                      if (!projId) return;
                      const nextStarred = !selectedProject.isStarred;
                      handleStarToggle(projId, nextStarred);
                      try {
                        const { toggleProjectStar } = await import('@/app/actions');
                        const res = await toggleProjectStar(projId);
                        if (res.success) {
                          toast.success(nextStarred ? `⭐ Bookmarked ${selectedProject.name}` : `Removed bookmark for ${selectedProject.name}`);
                        } else {
                          handleStarToggle(projId, !nextStarred);
                          toast.error('Failed to update bookmark');
                        }
                      } catch (e) {
                        handleStarToggle(projId, !nextStarred);
                        toast.error('Failed to update bookmark');
                      }
                    }}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      selectedProject.isStarred 
                        ? 'text-amber-400 bg-amber-50' 
                        : 'text-gray-400 hover:text-amber-400 hover:bg-gray-100'
                    }`}
                    title={selectedProject.isStarred ? 'Remove Bookmark' : 'Bookmark Case'}
                  >
                    <Star className={`w-5 h-5 ${selectedProject.isStarred ? 'fill-current text-amber-400' : ''}`} />
                  </button>
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Assignee Details Rows */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 border-t border-b border-gray-100 py-4 text-[12px] text-gray-500 font-semibold">
                <div>
                  <span className="text-gray-400 block font-medium">Attorney</span>
                  <span className="text-gray-800 font-extrabold block mt-0.5">Davidson Theresa</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Case Type</span>
                  <span className="text-gray-800 font-extrabold block mt-0.5">{selectedProject.eventType}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Paralegal</span>
                  <span className="text-gray-800 font-extrabold block mt-0.5">Veronica Manriquez</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Created Date</span>
                  <span className="text-gray-800 font-extrabold block mt-0.5">{dayjs(selectedProject.createdAt).format('MMM DD, YYYY')}</span>
                </div>
              </div>

              {/* Services List Table */}
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] text-gray-400 font-bold uppercase tracking-wider px-1">
                  <span>Services</span>
                  <span>Stages</span>
                  <span>Days Left</span>
                </div>

                <div className="space-y-2">
                  {(selectedProject.services && selectedProject.services.length > 0 ? selectedProject.services : [
                    { name: 'I-130', status: 'Request client authorization', daysLeft: 14 },
                    { name: 'I-485', status: 'Assemble Packet', daysLeft: 3 }
                  ]).map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50/60 rounded-xl border border-gray-100 text-[12px]">
                      <span className="font-bold text-gray-700 truncate max-w-[130px]">{service.name}</span>
                      
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold truncate max-w-[120px] ${getStatusStyle(service.status)}`}>
                        {service.status}
                      </span>

                      <span className="font-bold text-gray-800 w-6 text-right shrink-0">
                        {service.daysLeft !== undefined ? service.daysLeft : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-col gap-3">
                <button 
                  onClick={() => router.push(`/projects/${selectedProject.id}`)}
                  className="w-full flex items-center justify-center gap-1.5 py-3.5 bg-[#0a0b0d] text-white hover:bg-gray-900 rounded-xl text-[13px] font-bold shadow-md transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Full Case Dashboard
                </button>
                <button 
                  onClick={() => setProjectToDelete(selectedProject.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-3 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl text-[13px] font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Project Case
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Floating Milestone Hover Tooltip Popover */}
      {hoveredMilestone && tooltipPos && (
        <div 
          className="fixed z-[100] w-[260px] bg-white border border-gray-200/80 rounded-2xl shadow-xl p-4 text-[12px] animate-fade-in pointer-events-none"
          style={{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }}
        >
          <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2 font-bold">
            <span className="text-gray-400 uppercase text-[10px] tracking-wider">Milestone Info</span>
            <span className="text-[#d93025] bg-[#fce8e6] px-2 py-0.5 rounded text-[10px] uppercase font-extrabold">
              {hoveredMilestone.daysLeft} days left
            </span>
          </div>
          <div className="space-y-1.5 font-semibold text-gray-500">
            <p className="text-gray-800 font-extrabold text-[13px]">{hoveredMilestone.name}</p>
            <p className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              Target: {dayjs().add(hoveredMilestone.daysLeft, 'day').format('DD MMM YYYY')}
            </p>
            <p className="flex items-start gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
              <span>Ensure client approvals and delivery signatures are processed.</span>
            </p>
          </div>
        </div>
      )}

      {/* Slide-out Filters Panel overlay */}
      <FiltersPanel onFilterChange={handleFilterChange} />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Case Record"
        message="Are you sure you want to delete this case record? This will permanently wipe all internal checklists, logs, and associated blueprints. (Linked payments and quotations will lose project references)."
        confirmText="Yes, Delete"
        isDestructive={true}
      />
    </div>
  );
}
