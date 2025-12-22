import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { ArrowLeft, Upload, Users, Calendar, Settings, Image as ImageIcon, CheckCircle, Clock, AlertTriangle, ChevronRight, Lock, Unlock, RefreshCw } from 'lucide-react';
import { SelectionStatus } from '../../types';

interface EventDetailProps {
  onNavigate: (view: string) => void;
  initialTab?: string;
}

const PhotographerEventDetail: React.FC<EventDetailProps> = ({ onNavigate, initialTab = 'overview' }) => {
  const { activeEvent, photos, updateEventWorkflow, updateEvent, uploadBulkEditedPhotos, setActiveEvent } = useData();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!activeEvent) return <div className="p-10 text-center">Event not found</div>;

  const eventPhotos = photos.filter(p => p.eventId === activeEvent.id);
  const selectedPhotos = eventPhotos.filter(p => p.isSelected);
  const approvedCount = eventPhotos.filter(p => p.reviewStatus === 'approved').length;
  const changesRequestedCount = eventPhotos.filter(p => p.reviewStatus === 'changes_requested').length;
  
  const totalPaid = activeEvent.paidAmount || 0;
  const balance = (activeEvent.price || 0) - totalPaid;

  const handleRealUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
        // We use the context function which handles bulk upload
        await uploadBulkEditedPhotos(activeEvent.id, files);
        alert("Upload complete!");
    } catch (e) {
        console.error(e);
        alert("Upload failed.");
    } finally {
        setIsUploading(false);
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleRealUpload(e.target.files);
    }
  };

  const triggerFolderUpload = () => {
    fileInputRef.current?.click();
  };

  const advanceWorkflow = (status: SelectionStatus) => {
      if (confirm(`Advance workflow status to ${status}?`)) {
          updateEventWorkflow(activeEvent.id, status);
      }
  };

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
                  onClick={() => onNavigate('gallery')}
                  className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-100 transition-colors"
                >
                    View Gallery
                </button>
                <button 
                  onClick={triggerFolderUpload}
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {isUploading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} 
                    Upload Edits
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFolderSelect} 
                />
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
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Changes Req</p>
                      <p className="text-2xl font-black text-amber-500 mt-1">{changesRequestedCount}</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm col-span-2 sm:col-span-2">
                      <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financials</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-2xl font-black text-slate-900">₹{totalPaid.toLocaleString()}</span>
                                <span className="text-xs font-bold text-slate-400">/ ₹{activeEvent.price?.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance</p>
                             <p className={`text-sm font-black ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>₹{balance.toLocaleString()}</p>
                        </div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="space-y-8">
              {/* Client Info */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="font-bold text-slate-900">Client Details</h3>
                  <div className="space-y-4">
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                              {activeEvent.clientEmail ? activeEvent.clientEmail.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                              <p className="text-xs font-bold text-slate-900">{activeEvent.clientEmail}</p>
                              <p className="text-[10px] text-slate-400">{activeEvent.clientPhone || 'No Phone'}</p>
                          </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-50 space-y-2">
                         <div className="flex justify-between text-xs">
                             <span className="text-slate-500 font-medium">Event Plan</span>
                             <span className="font-bold text-slate-900">{activeEvent.plan}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                             <span className="text-slate-500 font-medium">Optimization</span>
                             <span className="font-bold text-slate-900">{activeEvent.optimizationSetting || 'Standard'}</span>
                         </div>
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