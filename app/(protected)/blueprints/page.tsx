'use client';

import React, { useState, useEffect } from 'react';
import { getCrew, createCrew, updateCrew, deleteCrew } from '@/app/actions';
import { Plus, MapPin, Phone, Briefcase, Edit2, Trash2, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function BlueprintPage() {
  const [crewData, setCrewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    location: '',
    phone: '',
    address: '',
    charges: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCrew();
      setCrewData(data);
    } catch (e) {
      toast.error('Failed to load crew members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setFormData({ name: '', role: '', location: '', phone: '', address: '', charges: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (crew: any) => {
    setFormData({
      name: crew.name,
      role: crew.role,
      location: crew.location,
      phone: crew.phone,
      address: crew.address,
      charges: crew.charges.toString()
    });
    setEditingId(crew._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this crew member?')) return;
    try {
      await deleteCrew(id);
      toast.success('Crew member removed');
      fetchData();
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      charges: parseInt(formData.charges) || 0
    };

    try {
      if (editingId) {
        await updateCrew(editingId, payload);
        toast.success('Updated successfully');
      } else {
        await createCrew(payload);
        toast.success('Added to Blueprint successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-16 animate-fade-in text-gray-800">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#fee2e2]/40 p-5 rounded-[32px] border border-[#fecaca]/40 backdrop-blur-md">
        <div>
          <h2 className="text-[20px] font-extrabold text-gray-800 flex items-center gap-2.5">
            <Briefcase className="w-5.5 h-5.5 text-[#e50914]" />
            Crew Blueprint Database
          </h2>
          <p className="text-[12px] text-gray-400 font-bold mt-1 uppercase tracking-wider">Manage details and daily rates of photographers, editors, and shoot operators.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-6 py-3 bg-[#0a0b0d] hover:bg-gray-900 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-black/10 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Crew Member
        </button>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-[45px] h-[220px] bg-white/50" />
          ))}
        </div>
      ) : crewData.length === 0 ? (
        <div className="glass-card rounded-[45px] p-16 text-center max-w-md mx-auto space-y-6 bg-white border border-gray-200/50">
          <Briefcase className="w-16 h-16 mx-auto text-gray-300 stroke-1" />
          <h3 className="text-[17px] font-extrabold text-gray-700">No crew records found</h3>
          <p className="text-[13px] text-gray-400 font-medium">Add crew members to register them inside the studio blueprints.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {crewData.map((crew) => {
            const avatarUrl = crew.name.includes('Davidson') ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80' :
                             crew.name.includes('Veronica') ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80' :
                             crew.name.includes('Harris') ? 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80' :
                             'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80';

            return (
              <div 
                key={crew._id} 
                className="glass-card rounded-[45px] p-8 bg-white border border-gray-100/50 shadow-sm flex flex-col justify-between h-full relative overflow-hidden transition-all hover:shadow-md"
              >
                {/* Scoop Notch Corner (Top-Right) matching ProjectCard */}
                <div className="absolute top-0 right-0 w-[112px] h-[112px] bg-[#fdf6f6] rounded-bl-[45px] z-10">
                  <div className="inverted-radius-top"></div>
                  <div className="inverted-radius-right"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      onClick={() => openEditModal(crew)}
                      className="w-[85px] h-[85px] bg-[#ededed] hover:bg-gray-200 text-[#e50914] rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer border border-gray-200/20 active:scale-95"
                      title="Edit Record"
                    >
                      <Edit2 className="w-[22px] h-[22px] stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Card Info Section */}
                <div>
                  <div className="flex items-start justify-between pr-[116px]">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-100 shadow-sm shrink-0">
                        <img 
                          src={avatarUrl} 
                          alt={crew.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-[16px] font-extrabold text-[#1a1c22] leading-tight">{crew.name}</h4>
                        <span className="inline-block bg-[#fef2f2] text-[#e50914] border border-[#fee2e2] text-[9.5px] font-extrabold uppercase px-2.5 py-1 rounded-[10px] mt-2.5 leading-none">
                          {crew.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attributes Section */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4 mt-6 text-[12px] border-t border-b border-gray-100/80 py-5 text-gray-500 font-semibold">
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">Location</span>
                      <span className="text-[#1a1c22] font-extrabold block mt-1.5 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                        {crew.location}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">Charges</span>
                      <span className="text-[#1a1c22] font-black block mt-1.5 text-[14px]">
                        ₹{crew.charges.toLocaleString('en-IN')} <span className="text-[10px] text-gray-400 font-bold">/ day</span>
                      </span>
                    </div>
                    <div className="col-span-2 mt-1">
                      <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">Contact Phone</span>
                      <span className="text-[#1a1c22] font-extrabold block mt-1.5 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                        {crew.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions section */}
                <div className="flex justify-between items-center mt-5 pt-1">
                  <span className="text-[11px] text-gray-400 font-extrabold uppercase tracking-widest">Active Blueprint</span>
                  <button 
                    onClick={() => handleDelete(crew._id)}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-100"
                    title="Remove Record"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <form 
            onSubmit={handleSubmit}
            className="relative w-full max-w-md bg-white border border-gray-200 rounded-[32px] shadow-2xl p-6 space-y-4 animate-fade-in text-[13px]"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <h3 className="text-[16px] font-extrabold text-gray-800">
                {editingId ? 'Edit Crew Member Details' : 'Register Crew Member'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-2">
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-400/80 uppercase tracking-widest mb-1.5">Full Name</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="bg-transparent border-b border-gray-200 py-2 focus:outline-none focus:border-[#e50914] text-[15px] font-semibold" 
                  placeholder="e.g. Rahul Sen" 
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-400/80 uppercase tracking-widest mb-1.5">Role / Specialization</label>
                <input 
                  type="text" required value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="bg-transparent border-b border-gray-200 py-2 focus:outline-none focus:border-[#e50914] text-[15px] font-semibold" 
                  placeholder="e.g. Lead Photographer" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-gray-400/80 uppercase tracking-widest mb-1.5">Charges (₹ / day)</label>
                  <input 
                    type="number" required value={formData.charges}
                    onChange={e => setFormData({...formData, charges: e.target.value})}
                    className="bg-transparent border-b border-gray-200 py-2 focus:outline-none focus:border-[#e50914] text-[15px] font-semibold" 
                    placeholder="e.g. 10000" 
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-gray-400/80 uppercase tracking-widest mb-1.5">Location</label>
                  <input 
                    type="text" required value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="bg-transparent border-b border-gray-200 py-2 focus:outline-none focus:border-[#e50914] text-[15px] font-semibold" 
                    placeholder="e.g. Mumbai" 
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-400/80 uppercase tracking-widest mb-1.5">Phone Number</label>
                <input 
                  type="tel" required value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="bg-transparent border-b border-gray-200 py-2 focus:outline-none focus:border-[#e50914] text-[15px] font-semibold" 
                  placeholder="+91 99887 76655" 
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-400/80 uppercase tracking-widest mb-1.5">Mailing Address</label>
                <input 
                  type="text" required value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="bg-transparent border-b border-gray-200 py-2 focus:outline-none focus:border-[#e50914] text-[15px] font-semibold" 
                  placeholder="Street and Lane details..." 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
              <button 
                type="button" onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-50 text-[13px] font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0a0b0d] text-white hover:bg-gray-900 text-[13px] font-bold shadow-md cursor-pointer transition-colors"
              >
                {editingId ? 'Save Changes' : 'Register Crew'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
