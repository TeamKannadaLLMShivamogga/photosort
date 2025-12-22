
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  ArrowLeft, Upload, Users, Calendar, Settings, Image as ImageIcon, 
  CheckCircle, Clock, AlertTriangle, ChevronRight, Lock, Unlock, 
  RefreshCw, Plus, Trash2, Mail, Phone, MapPin, Save
} from 'lucide-react';
import { SelectionStatus, SubEvent } from '../../types';

interface EventDetailProps {
  onNavigate: (view: string) => void;
  initialTab?: string;
}

const PhotographerEventDetail: React.FC<EventDetailProps> = ({ onNavigate, initialTab = 'overview' }) => {
  const { activeEvent, photos, updateEventWorkflow, updateEvent, users, setActiveEvent } = useData();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Management States
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });
  const [newSubEvent, setNewSubEvent] = useState({ name: '', date: '', location: '' });
  const [isAddingClient, setIsAddingClient] = useState(false);

  if (!activeEvent) return <div className="p-10 text-center">Event not found</div>;

  const eventPhotos = photos.filter(p => p.eventId === activeEvent.id);
  const selectedPhotos = eventPhotos.filter(p => p.isSelected);
  const approvedCount = eventPhotos.filter(p => p.reviewStatus === 'approved').length;
  const changesRequestedCount = eventPhotos.filter(p => p.reviewStatus === 'changes_requested').length;
  
  const totalPaid = activeEvent.paidAmount || 0;
  const balance = (activeEvent.price || 0) - totalPaid;

  const advanceWorkflow = (status: SelectionStatus) => {
      if (confirm(`Advance workflow status to ${status}?`)) {
          updateEventWorkflow(activeEvent.id, status);
      }
  };

  // --- Client Management ---
  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      alert("Name and Email are required");
      return;
    }
    
    setIsAddingClient(true);
    try {
      // 1. Check if user exists or create
      let targetUserId = '';
      const existingUser = users.find(u => u.email === newClient.email);
      
      if (existingUser) {
        targetUserId = existingUser.id;
      } else {
        // Create new user via API
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newClient.name,
                email: newClient.email,
                phone: newClient.phone,
                role: 'USER',
                avatar: `https://ui-avatars.com/api/?name=${newClient.name}&background=random`
            })
        });
        if (res.ok) {
            const created = await res.json();
            targetUserId = created.id || created._id;
        } else {
            throw new Error("Failed to create user");
        }
      }
      
      // 2. Add to event
      if (targetUserId) {
        const currentAssigned = activeEvent.assignedUsers || [];
        if (!currentAssigned.includes(targetUserId)) {
             await updateEvent(activeEvent.id, { assignedUsers: [...currentAssigned, targetUserId] });
        }
        setNewClient({ name: '', email: '', phone: '' });
      }
    } catch (e) {
      alert("Failed to add client. Please try again.");
    } finally {
      setIsAddingClient(false);
    }
  };

  const handleRemoveClient = async (userId: string) => {
      if (confirm("Remove this user from the event?")) {
          const updated = activeEvent.assignedUsers.filter(id => id !== userId);
          await updateEvent(activeEvent.id, { assignedUsers: updated });
      }
  };

  // --- SubEvent Management ---
  const handleAddSubEvent = async () => {
      if (!newSubEvent.name || !newSubEvent.date) return;
      
      const newSub: SubEvent = {
          id: `se-${Date.now()}`,
          name: newSubEvent.name,
          date: newSubEvent.date,
          location: newSubEvent.location
      };
      
      const updated = [...(activeEvent.subEvents || []), newSub];
      await updateEvent(activeEvent.id, { subEvents: updated });
      setNewSubEvent({ name: '', date: '', location: '' });
  };

  const handleRemoveSubEvent = async (subEventId: string) => {
      if (confirm("Delete this sub-event?")) {
          const updated = activeEvent.subEvents.filter(se => se.id !== subEventId);
          await updateEvent(activeEvent.id, { subEvents: updated });
      }
  };

  const assignedUserObjects = users.filter(u => activeEvent.assignedUsers.includes(u.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
      <button onClick={() => onNavigate('events')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-[10px]">
        <ArrowLeft className="w-3 h-3" /> Back to Events
      </button>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-center gap-6">
           <img src={activeEvent.coverImage} className="w-24 h-24 rounded-[2rem] object-cover shadow-lg" alt="" />
           <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{activeEvent.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                      <Calendar className="w-3 h-3" /> {new Date(activeEvent.date).toLocaleDateString()}
                  </span>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${
                      activeEvent.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 border-slate-100'
                  }`}>
                      <div className={`w-2 h-2 rounded-full ${activeEvent.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`} />
                      {activeEvent.status.toUpperCase()}
                  </span>
              </div>
           </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => onNavigate('event-gallery')}
                  className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-100 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <ImageIcon className="w-4 h-4" /> Manage Photos
                </button>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                ID: {activeEvent.id.slice(-6)}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
              {/* Workflow Status */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Workflow Status</h3>
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                          {activeEvent.selectionStatus}
                      </span>
                  </div>
                  
                  <div className="relative pt-2">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2" />
                      <div className="flex justify-between relative z-10">
                          {['open', 'submitted', 'editing', 'review', 'accepted'].map((step, i) => {
                              const isActive = activeEvent.selectionStatus === step;
                              const isPast = ['open', 'submitted', 'editing', 'review', 'accepted'].indexOf(activeEvent.selectionStatus) >= i;
                              return (
                                  <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                                      <div className={`w-3 h-3 rounded-full border-2 ${isActive ? 'bg-indigo-600 border-indigo-600 scale-125' : isPast ? 'bg-green-500 border-green-500' : 'bg-white border-slate-200'}`} />
                                      <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-600' : isPast ? 'text-green-600' : 'text-slate-300'}`}>{step}</span>
                                  </div>
                              );
                          })}
                      </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                      {activeEvent.selectionStatus === 'submitted' && (
                          <button onClick={() => advanceWorkflow('editing')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-indigo-700">
                              Start Editing Phase
                          </button>
                      )}
                      {activeEvent.selectionStatus === 'editing' && (
                          <button onClick={() => advanceWorkflow('review')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-indigo-700">
                              Submit for Review
                          </button>
                      )}
                      {activeEvent.selectionStatus === 'open' ? (
                           <button onClick={() => advanceWorkflow('submitted')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 flex items-center gap-2">
                               <Lock className="w-3 h-3" /> Force Lock Selection
                           </button>
                      ) : (
                          <button onClick={() => advanceWorkflow('open')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 flex items-center gap-2">
                              <Unlock className="w-3 h-3" /> Re-open Selection
                          </button>
                      )}
                  </div>
              </div>

              {/* Sub-Events Management */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                 <div className="flex items-center justify-between">
                     <h3 className="font-bold text-slate-900">Event Schedule & Sub-Events</h3>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeEvent.subEvents.length} Events</span>
                 </div>

                 <div className="space-y-3">
                     {activeEvent.subEvents.map(sub => (
                         <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                     <Calendar className="w-5 h-5" />
                                 </div>
                                 <div>
                                     <p className="text-sm font-bold text-slate-900">{sub.name}</p>
                                     <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                         <span>{new Date(sub.date).toLocaleDateString()}</span>
                                         {sub.location && <span>• {sub.location}</span>}
                                     </div>
                                 </div>
                             </div>
                             <button onClick={() => handleRemoveSubEvent(sub.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all">
                                 <Trash2 className="w-4 h-4" />
                             </button>
                         </div>
                     ))}
                 </div>

                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3">
                     <input 
                        type="text" placeholder="Event Name (e.g. Sangeet)" 
                        className="flex-1 p-3 bg-white rounded-xl text-xs font-bold outline-none"
                        value={newSubEvent.name} onChange={e => setNewSubEvent({...newSubEvent, name: e.target.value})}
                     />
                     <input 
                        type="date" 
                        className="p-3 bg-white rounded-xl text-xs font-bold outline-none"
                        value={newSubEvent.date} onChange={e => setNewSubEvent({...newSubEvent, date: e.target.value})}
                     />
                     <input 
                        type="text" placeholder="Location"
                        className="flex-1 p-3 bg-white rounded-xl text-xs font-bold outline-none"
                        value={newSubEvent.location} onChange={e => setNewSubEvent({...newSubEvent, location: e.target.value})}
                     />
                     <button onClick={handleAddSubEvent} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-colors">
                         <Plus className="w-4 h-4" />
                     </button>
                 </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Photos</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">{eventPhotos.length}</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selections</p>
                      <p className="text-2xl font-black text-indigo-600 mt-1">{selectedPhotos.length}</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved</p>
                      <p className="text-2xl font-black text-green-600 mt-1">{approvedCount}</p>
                  </div>
              </div>
          </div>

          <div className="space-y-8">
              {/* Client Access Management */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="font-bold text-slate-900">Assigned Clients</h3>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{assignedUserObjects.length} Access</span>
                  </div>

                  <div className="space-y-4">
                      {assignedUserObjects.map(user => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-8 h-8 rounded-full bg-white shadow-sm" alt="" />
                                  <div className="min-w-0">
                                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                                      <p className="text-[9px] text-slate-400 truncate">{user.email}</p>
                                  </div>
                              </div>
                              <button onClick={() => handleRemoveClient(user.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                              </button>
                          </div>
                      ))}
                      {assignedUserObjects.length === 0 && (
                          <p className="text-center text-xs text-slate-400 italic py-2">No users assigned yet.</p>
                      )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Add New Client</p>
                      <input 
                         type="text" placeholder="Full Name" 
                         className="w-full p-3 bg-white rounded-xl text-xs font-bold outline-none"
                         value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})}
                      />
                      <input 
                         type="email" placeholder="Email Address" 
                         className="w-full p-3 bg-white rounded-xl text-xs font-bold outline-none"
                         value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})}
                      />
                      <div className="flex gap-2">
                        <input 
                           type="tel" placeholder="Phone" 
                           className="flex-1 p-3 bg-white rounded-xl text-xs font-bold outline-none"
                           value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})}
                        />
                        <button disabled={isAddingClient} onClick={handleAddClient} className="px-4 bg-[#10B981] text-white rounded-xl font-bold hover:bg-[#059669] transition-colors disabled:opacity-50">
                            <Plus className="w-4 h-4" />
                        </button>
                      </div>
                  </div>
              </div>

              {/* Quick Actions */}
               <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl space-y-4">
                   <h3 className="font-bold text-white flex items-center gap-2">
                       <Settings className="w-4 h-4" /> Quick Actions
                   </h3>
                   <div className="space-y-2">
                       <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors text-left px-4">
                           Send Selection Reminder
                       </button>
                       <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors text-left px-4">
                           Generate Invoice
                       </button>
                       <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors text-left px-4 text-red-300 hover:text-red-200">
                           Delete Event
                       </button>
                   </div>
               </div>
          </div>
      </div>
    </div>
  );
};

export default PhotographerEventDetail;
