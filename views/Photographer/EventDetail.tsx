
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  ArrowLeft, Upload, Users, Calendar, Settings, Image as ImageIcon, 
  CheckCircle, Clock, AlertTriangle, ChevronRight, Lock, Unlock, 
  RefreshCw, Plus, Trash2, Mail, Phone, MapPin, Save, CreditCard, ChevronDown, ChevronUp, Check, Copy, Share2, FileText, Download, Printer, UserPlus, Shield
} from 'lucide-react';
import { SelectionStatus, SubEvent, EventTeamRole } from '../../types';

interface EventDetailProps {
  onNavigate: (view: string) => void;
  initialTab?: string;
}

const PhotographerEventDetail: React.FC<EventDetailProps> = ({ onNavigate, initialTab = 'overview' }) => {
  const { activeEvent, photos, updateEventWorkflow, updateEvent, users, recordPayment, deleteEvent: contextDeleteEvent, getEventRole, addTeamMember, removeTeamMember } = useData();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Management States
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });
  const [newTeamMember, setNewTeamMember] = useState({ email: '', role: 'MEMBER' as EventTeamRole });
  const [newSubEvent, setNewSubEvent] = useState({ name: '', date: '', location: '' });
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isAddingClientOpen, setIsAddingClientOpen] = useState(false);
  const [isAddingTeamOpen, setIsAddingTeamOpen] = useState(false);

  // Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(true); // Default open for better visibility
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: 0, date: new Date().toISOString().split('T')[0], method: 'UPI', note: '' });

  if (!activeEvent) return <div className="p-10 text-center">Event not found</div>;

  const currentRole = getEventRole(activeEvent);
  const canManageFinancials = currentRole === 'OWNER' || currentRole === 'CO_ADMIN';
  const canEditEvent = currentRole === 'OWNER' || currentRole === 'CO_ADMIN';
  const canManageTeam = currentRole === 'OWNER' || currentRole === 'CO_ADMIN';
  const isOwner = currentRole === 'OWNER';

  const eventPhotos = photos.filter(p => p.eventId === activeEvent.id);
  const selectedPhotos = eventPhotos.filter(p => p.isSelected);
  const approvedCount = eventPhotos.filter(p => p.reviewStatus === 'approved').length;
  
  const totalPaid = activeEvent.paidAmount || 0;
  const price = activeEvent.price || 0;
  const balance = price - totalPaid;
  const paidPercentage = price > 0 ? Math.min(100, Math.round((totalPaid / price) * 100)) : 0;

  const advanceWorkflow = (status: SelectionStatus) => {
      if (!canEditEvent) return alert("You don't have permission to update workflow status.");
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
        setIsAddingClientOpen(false);
      }
    } catch (e) {
      alert("Failed to add client. Please try again.");
    } finally {
      setIsAddingClient(false);
    }
  };

  const handleRemoveClient = async (userId: string) => {
      if (!canEditEvent) return;
      if (confirm("Remove this user from the event?")) {
          const updated = activeEvent.assignedUsers.filter(id => id !== userId);
          await updateEvent(activeEvent.id, { assignedUsers: updated });
      }
  };

  // --- Team Management ---
  const handleAddTeamMember = async () => {
      if (!newTeamMember.email) return alert("Email is required");
      await addTeamMember(activeEvent.id, newTeamMember.email, newTeamMember.role);
      setNewTeamMember({ email: '', role: 'MEMBER' });
      setIsAddingTeamOpen(false);
  };

  // --- SubEvent Management ---
  const handleAddSubEvent = async () => {
      if (!canEditEvent) return;
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
      if (!canEditEvent) return;
      if (confirm("Delete this sub-event?")) {
          const updated = activeEvent.subEvents.filter(se => se.id !== subEventId);
          await updateEvent(activeEvent.id, { subEvents: updated });
      }
  };

  // --- Payment Management ---
  const handleRecordPayment = async () => {
      if (paymentForm.amount <= 0) return alert("Amount must be greater than 0");
      await recordPayment(activeEvent.id, paymentForm.amount, paymentForm.date, paymentForm.method, paymentForm.note);
      setIsPaymentModalOpen(false);
      setPaymentForm({ amount: 0, date: new Date().toISOString().split('T')[0], method: 'UPI', note: '' });
  };

  const handleDeletePayment = async (paymentId: string, amount: number) => {
      if (!confirm("Are you sure you want to delete this payment record? This will adjust the balance due.")) return;
      
      const updatedHistory = activeEvent.paymentHistory?.filter(p => p.id !== paymentId) || [];
      const newPaidAmount = (activeEvent.paidAmount || 0) - amount;
      
      await updateEvent(activeEvent.id, {
          paymentHistory: updatedHistory,
          paidAmount: newPaidAmount < 0 ? 0 : newPaidAmount,
          paymentStatus: newPaidAmount >= (activeEvent.price || 0) ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending'
      });
  };

  const handleDownloadReceipt = (paymentId: string) => {
      alert(`Downloading receipt for transaction ${paymentId}...`);
  };

  const handleDeleteEvent = async () => {
      if (!isOwner) return;
      if(confirm("DANGER: This will permanently delete the event and all photos. Are you sure?")) {
          try {
             await fetch(`/api/events/${activeEvent.id}`, { method: 'DELETE' });
             onNavigate('events');
          } catch(e) {
              alert("Failed to delete event");
          }
      }
  };

  const copyInviteText = (email: string) => {
      const text = `Hi! Your photos for ${activeEvent.name} are ready. \nLogin here: ${window.location.origin} \nEmail: ${email}`;
      navigator.clipboard.writeText(text);
      alert("Invite details copied to clipboard!");
  };

  const assignedUserObjects = users.filter(u => activeEvent.assignedUsers.includes(u.id));
  const teamMemberObjects = activeEvent.team?.map(tm => {
      const user = users.find(u => u.id === tm.userId);
      return { ...tm, user };
  }) || [];

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
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 uppercase">
                      ROLE: {currentRole}
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
              
              {/* Financials Card - Visible only to OWNER and CO_ADMIN */}
              {canManageFinancials && (
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                      <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-indigo-600" /> Financials & Payments
                          </h3>
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${balance <= 0 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                              {balance <= 0 ? 'Paid in Full' : 'Pending Balance'}
                          </span>
                      </div>

                      <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 pb-2">
                              <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Contract</p>
                                  <p className="text-2xl font-black text-slate-900 mt-1">₹{(activeEvent.price || 0).toLocaleString()}</p>
                              </div>
                              <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Received</p>
                                  <p className="text-2xl font-black text-green-600 mt-1">₹{totalPaid.toLocaleString()}</p>
                              </div>
                              <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance Due</p>
                                  <p className="text-2xl font-black text-amber-500 mt-1">₹{balance.toLocaleString()}</p>
                              </div>
                          </div>
                          
                          <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  <span>Payment Progress</span>
                                  <span>{paidPercentage}%</span>
                              </div>
                              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out" style={{ width: `${paidPercentage}%` }} />
                              </div>
                          </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-50 pt-6">
                          <button 
                            onClick={() => setIsPaymentHistoryOpen(!isPaymentHistoryOpen)}
                            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                          >
                              {isPaymentHistoryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} Transaction History
                          </button>
                          <button 
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black flex items-center gap-2 shadow-lg"
                          >
                              <Plus className="w-4 h-4" /> Record Payment
                          </button>
                      </div>

                      {isPaymentHistoryOpen && (
                          <div className="animate-in slide-in-from-top-2">
                              <div className="overflow-x-auto">
                                  <table className="w-full text-left">
                                      <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                                          <tr>
                                              <th className="p-3 rounded-l-xl">Date</th>
                                              <th className="p-3">Method</th>
                                              <th className="p-3">Note</th>
                                              <th className="p-3 text-right">Amount</th>
                                              <th className="p-3 rounded-r-xl text-center">Actions</th>
                                          </tr>
                                      </thead>
                                      <tbody className="text-xs font-bold text-slate-700">
                                          {activeEvent.paymentHistory?.map((pay, i) => (
                                              <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                                                  <td className="p-3">{new Date(pay.date).toLocaleDateString()}</td>
                                                  <td className="p-3"><span className="bg-white border border-slate-200 px-2 py-1 rounded text-[10px]">{pay.method}</span></td>
                                                  <td className="p-3 text-slate-400 italic max-w-[150px] truncate">{pay.note || '-'}</td>
                                                  <td className="p-3 text-right text-emerald-600 font-black">+ ₹{pay.amount.toLocaleString()}</td>
                                                  <td className="p-3 text-center">
                                                      <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                          <button 
                                                            onClick={() => handleDownloadReceipt(pay.id)}
                                                            className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" 
                                                            title="Download Receipt"
                                                          >
                                                              <Printer className="w-3.5 h-3.5" />
                                                          </button>
                                                          <button 
                                                            onClick={() => handleDeletePayment(pay.id, pay.amount)}
                                                            className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" 
                                                            title="Delete Record"
                                                          >
                                                              <Trash2 className="w-3.5 h-3.5" />
                                                          </button>
                                                      </div>
                                                  </td>
                                              </tr>
                                          ))}
                                          {(!activeEvent.paymentHistory || activeEvent.paymentHistory.length === 0) && (
                                              <tr><td colSpan={5} className="p-6 text-center text-slate-400 italic bg-slate-50/30 rounded-xl mt-2">No payments recorded yet.</td></tr>
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      )}
                  </div>
              )}

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

                  {canEditEvent && (
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
                  )}
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
              {/* Team Access Management - Only OWNER and CO_ADMIN */}
              {canManageTeam && (
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="font-bold text-slate-900">Photography Team</h3>
                         <button 
                            onClick={() => setIsAddingTeamOpen(!isAddingTeamOpen)}
                            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                         >
                             {isAddingTeamOpen ? 'Close' : '+ Add Member'}
                         </button>
                      </div>

                      <div className="space-y-4">
                          {teamMemberObjects.map(tm => (
                              <div key={tm.userId} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <img src={tm.user?.avatar || `https://ui-avatars.com/api/?name=${tm.user?.name || 'User'}`} className="w-8 h-8 rounded-full bg-white shadow-sm" alt="" />
                                      <div>
                                          <p className="text-xs font-bold text-slate-900">{tm.user?.name || 'Photographer'}</p>
                                          <p className="text-[8px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5 text-slate-500 uppercase">{tm.role}</p>
                                      </div>
                                  </div>
                                  <button onClick={() => removeTeamMember(activeEvent.id, tm.userId)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                      <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                              </div>
                          ))}
                          {teamMemberObjects.length === 0 && (
                              <p className="text-center text-xs text-slate-400 italic py-2">No team members added. Just you.</p>
                          )}
                      </div>

                      {isAddingTeamOpen && (
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Member Info</p>
                              <input 
                                 type="email" placeholder="Photographer Email" 
                                 className="w-full p-3 bg-white rounded-xl text-xs font-bold outline-none"
                                 value={newTeamMember.email} onChange={e => setNewTeamMember({...newTeamMember, email: e.target.value})}
                              />
                              <div className="flex gap-2">
                                  <select 
                                    className="flex-1 p-3 bg-white rounded-xl text-xs font-bold outline-none"
                                    value={newTeamMember.role}
                                    onChange={e => setNewTeamMember({...newTeamMember, role: e.target.value as EventTeamRole})}
                                  >
                                      <option value="MEMBER">Member (Photos Only)</option>
                                      <option value="CO_ADMIN">Co-Admin (Full Manage)</option>
                                  </select>
                                  <button onClick={handleAddTeamMember} className="px-4 bg-[#10B981] text-white rounded-xl font-bold hover:bg-[#059669] transition-colors">
                                      <Plus className="w-4 h-4" />
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {/* Client Access Management */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="font-bold text-slate-900">Client Access</h3>
                     {canEditEvent && (
                         <button 
                            onClick={() => setIsAddingClientOpen(!isAddingClientOpen)}
                            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                         >
                             {isAddingClientOpen ? 'Close' : '+ Add Client'}
                         </button>
                     )}
                  </div>

                  <div className="space-y-4">
                      {assignedUserObjects.map(user => (
                          <div key={user.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                              <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                      <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-8 h-8 rounded-full bg-white shadow-sm" alt="" />
                                      <div className="min-w-0">
                                          <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                                          <p className="text-[9px] text-slate-400 truncate">{user.email}</p>
                                      </div>
                                  </div>
                                  {canEditEvent && (
                                      <button onClick={() => handleRemoveClient(user.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="Remove Access">
                                          <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                  )}
                              </div>
                              <button 
                                onClick={() => copyInviteText(user.email)}
                                className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center gap-2"
                              >
                                  <Copy className="w-3 h-3" /> Copy Invite Link
                              </button>
                          </div>
                      ))}
                      {assignedUserObjects.length === 0 && (
                          <p className="text-center text-xs text-slate-400 italic py-2">No clients assigned yet.</p>
                      )}
                  </div>

                  {isAddingClientOpen && canEditEvent && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Client Info</p>
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
                  )}
              </div>

              {/* Sub-Events Management */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                 <div className="flex items-center justify-between">
                     <h3 className="font-bold text-slate-900">Event Schedule</h3>
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
                                     </div>
                                 </div>
                             </div>
                             {canEditEvent && (
                                 <button onClick={() => handleRemoveSubEvent(sub.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all">
                                     <Trash2 className="w-4 h-4" />
                                 </button>
                             )}
                         </div>
                     ))}
                 </div>

                 {canEditEvent && (
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
                         <input 
                            type="text" placeholder="Event Name (e.g. Sangeet)" 
                            className="w-full p-3 bg-white rounded-xl text-xs font-bold outline-none"
                            value={newSubEvent.name} onChange={e => setNewSubEvent({...newSubEvent, name: e.target.value})}
                         />
                         <div className="flex gap-2">
                            <input 
                                type="date" 
                                className="flex-1 p-3 bg-white rounded-xl text-xs font-bold outline-none"
                                value={newSubEvent.date} onChange={e => setNewSubEvent({...newSubEvent, date: e.target.value})}
                            />
                            <button onClick={handleAddSubEvent} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                         </div>
                     </div>
                 )}
              </div>

              {/* Quick Actions (Owner/Co-Admin Only) */}
               {canManageFinancials && (
                   <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl space-y-4">
                       <h3 className="font-bold text-white flex items-center gap-2">
                           <Settings className="w-4 h-4" /> Quick Actions
                       </h3>
                       <div className="space-y-2">
                           <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors text-left px-4">
                               Send Selection Reminder
                           </button>
                           <button 
                            onClick={() => setIsInvoiceModalOpen(true)}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors text-left px-4"
                           >
                               Generate Invoice
                           </button>
                           {isOwner && (
                               <button 
                                onClick={handleDeleteEvent}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors text-left px-4 text-red-300 hover:text-red-200"
                               >
                                   Delete Event
                               </button>
                           )}
                       </div>
                   </div>
               )}
          </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md space-y-6 shadow-2xl">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Record Payment</h3>
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                          <input 
                            type="number" 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black outline-none"
                            value={paymentForm.amount}
                            onChange={e => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value)})}
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                          <input 
                            type="date" 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                            value={paymentForm.date}
                            onChange={e => setPaymentForm({...paymentForm, date: e.target.value})}
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Method</label>
                          <select 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                            value={paymentForm.method}
                            onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}
                          >
                              <option value="UPI">UPI</option>
                              <option value="Cash">Cash</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="Cheque">Cheque</option>
                          </select>
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note (Optional)</label>
                          <input 
                            type="text" 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                            value={paymentForm.note}
                            onChange={e => setPaymentForm({...paymentForm, note: e.target.value})}
                          />
                      </div>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-xs rounded-2xl">Cancel</button>
                      <button onClick={handleRecordPayment} className="flex-1 py-4 bg-[#10B981] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-[#059669]">Save Record</button>
                  </div>
              </div>
          </div>
      )}

      {/* Invoice Preview Modal (Simulation) */}
      {isInvoiceModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl">
                  <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                      <div>
                          <h3 className="text-lg font-black uppercase tracking-widest">Invoice Preview</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">INV-{activeEvent.id.slice(-6).toUpperCase()}</p>
                      </div>
                      <button onClick={() => setIsInvoiceModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><div className="w-5 h-5 flex items-center justify-center text-white">✕</div></button>
                  </div>
                  <div className="p-8 space-y-6">
                      <div className="flex justify-between border-b border-slate-100 pb-4">
                          <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill To</p>
                              <p className="font-bold text-slate-900 text-sm mt-1">{assignedUserObjects[0]?.name || 'Client'}</p>
                              <p className="text-xs text-slate-500">{assignedUserObjects[0]?.email}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Due</p>
                              <p className="font-black text-2xl text-slate-900 mt-1">₹{balance.toLocaleString()}</p>
                          </div>
                      </div>
                      <div className="space-y-2">
                          <div className="flex justify-between text-sm font-bold text-slate-700">
                              <span>Photography Services</span>
                              <span>₹{(activeEvent.price || 0).toLocaleString()}</span>
                          </div>
                          {totalPaid > 0 && (
                              <div className="flex justify-between text-sm font-bold text-green-600">
                                  <span>Paid</span>
                                  <span>- ₹{totalPaid.toLocaleString()}</span>
                              </div>
                          )}
                      </div>
                      <button onClick={() => {alert("Invoice sent to client email."); setIsInvoiceModalOpen(false);}} className="w-full py-4 bg-[#10B981] text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#059669] flex items-center justify-center gap-2">
                          <Mail className="w-4 h-4" /> Send Invoice
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PhotographerEventDetail;
