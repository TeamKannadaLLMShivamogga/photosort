
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Settings, Upload, Image as ImageIcon, CheckSquare, 
  Share2, X, Clock, Download, FileJson, Calendar, ChevronLeft, Loader2,
  Edit2, Zap, ShieldCheck, FileType, Sparkles, Wand2, CreditCard, ChevronDown, FolderOpen,
  Database, Activity, Plus, Users, Trash2, GitPullRequest, Lock, Unlock, Send, MessageCircle, AlertCircle, CheckCircle, UploadCloud, ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import GalleryView from '../../components/Gallery/GalleryView';
import { SubEvent, Event, OptimizationType, Photo, UserRole, SelectionStatus } from '../../types';
import { optimizeImage } from '../../utils/imageOptimizer';

// CHANGED: Relative API URL to use Vite Proxy
const API_URL = '/api';

const PhotographerEventDetail: React.FC<{ onNavigate: (view: string) => void, initialTab?: string }> = ({ onNavigate, initialTab }) => {
  const { 
    activeEvent, updateEvent, photos, users, setActiveEvent, refreshPhotos, 
    recordPayment, assignUserToEvent, removeUserFromEvent, addSubEvent, updateEventWorkflow,
    uploadEditedPhoto, uploadBulkEditedPhotos, addPhotoComment, resolveComment
  } = useData();
  
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'settings');
  
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Event>>({});
  const [newClientForm, setNewClientForm] = useState({ name: '', email: '', phone: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editUploadRef = useRef<HTMLInputElement>(null);
  const bulkEditUploadRef = useRef<HTMLInputElement>(null);
  const [activePhotoForEdit, setActivePhotoForEdit] = useState<string | null>(null);
  const [activePhotoForComments, setActivePhotoForComments] = useState<string | null>(null);

  // Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Upload State (Raw)
  const [selectedSubEvent, setSelectedSubEvent] = useState<string>('');
  const [isRawUploadModalOpen, setIsRawUploadModalOpen] = useState(false);
  const [isSubEventModalOpen, setIsSubEventModalOpen] = useState(false);
  const [newSubEvent, setNewSubEvent] = useState({ name: '', date: '', endDate: '' });

  // Optimization State
  const [useOptimization, setUseOptimization] = useState(true);
  const [optLevel, setOptLevel] = useState<OptimizationType>(activeEvent?.optimizationSetting || 'balanced');

  // Upload Feedback States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'analyzing' | 'optimizing' | 'uploading' | 'indexing'>('analyzing');
  const [currentFileName, setCurrentFileName] = useState('');
  const [stats, setStats] = useState({ savedSize: 0, processedCount: 0, totalCount: 0 });

  // Workflow State
  const [deliveryDate, setDeliveryDate] = useState('');

  useEffect(() => {
    if (activeEvent) {
      setEditForm(activeEvent);
      setOptLevel(activeEvent.optimizationSetting || 'balanced');
      if (activeEvent.subEvents.length > 0) {
          setSelectedSubEvent(activeEvent.subEvents[0].id);
      }
    }
  }, [activeEvent]);

  if (!activeEvent) return null;

  const handleUpdateDetails = () => {
    if (activeEvent && editForm.name) {
      updateEvent({ ...activeEvent, ...editForm } as Event);
      setIsEditDetailsOpen(false);
    }
  };

  const handleAddClient = async () => {
    if (newClientForm.name && newClientForm.email) {
      await assignUserToEvent(activeEvent.id, newClientForm);
      setNewClientForm({ name: '', email: '', phone: '' });
    }
  };

  const handleRemoveClient = async (userId: string) => {
    if (confirm("Revoke access for this user?")) {
        await removeUserFromEvent(activeEvent.id, userId);
    }
  };

  const handleRecordPayment = async () => {
      const amount = parseFloat(paymentAmount);
      if (amount > 0) {
          await recordPayment(activeEvent.id, amount, paymentDate);
          setIsPaymentModalOpen(false);
          setPaymentAmount('');
          setPaymentDate(new Date().toISOString().split('T')[0]);
      }
  };

  const handleCreateSubEvent = async () => {
      if(newSubEvent.name && newSubEvent.date) {
          await addSubEvent(activeEvent.id, {
              id: '',
              ...newSubEvent
          });
          setIsSubEventModalOpen(false);
          setNewSubEvent({ name: '', date: '', endDate: '' });
      }
  };

  const handleWorkflowChange = async (status: SelectionStatus) => {
      await updateEventWorkflow(activeEvent.id, status, deliveryDate || undefined);
  };

  const handleEditUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && activePhotoForEdit) {
          await uploadEditedPhoto(activePhotoForEdit, file);
          setActivePhotoForEdit(null);
      }
  };

  const handleBulkEditUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setIsUploading(true);
          setUploadStage('uploading');
          setUploadProgress(10);
          await uploadBulkEditedPhotos(activeEvent.id, e.target.files);
          setUploadProgress(100);
          setTimeout(() => setIsUploading(false), 1000);
      }
  };

  const tabs = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'workflow', label: 'Workflow', icon: GitPullRequest },
    { id: 'sorted', label: 'Gallery', icon: ImageIcon }, // Replaces Raw Upload
    { id: 'selections', label: 'Selections', icon: CheckSquare }, // Contains Edit Upload
  ];

  const handleRealUpload = async (files: FileList) => {
    if (!selectedSubEvent) {
        alert("Please select a sub-event first.");
        return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setStats({ savedSize: 0, processedCount: 0, totalCount: 0 });
    
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    const totalFiles = fileArray.length;
    
    if (totalFiles === 0) {
        setIsUploading(false);
        return;
    }
    
    setStats(s => ({ ...s, totalCount: totalFiles }));

    const formData = new FormData();
    formData.append('subEventId', selectedSubEvent); 

    setUploadStage('optimizing');
    let totalSavedBytes = 0;

    for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setCurrentFileName(file.name);
        
        if (useOptimization) {
           formData.append('files', file); 
           await new Promise(r => setTimeout(r, 20)); 
        } else {
           formData.append('files', file);
        }
        
        setStats(s => ({ ...s, processedCount: i + 1, savedSize: totalSavedBytes }));
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 50)); 
    }

    setUploadStage('uploading');
    setCurrentFileName('Sending data to server...');
    
    try {
        const response = await fetch(`${API_URL}/events/${activeEvent.id}/photos`, {
            method: 'POST',
            body: formData, 
        });

        if (!response.ok) throw new Error("Upload failed");
        
        setUploadProgress(80);
        setUploadStage('indexing');
        setCurrentFileName('Waiting for AI Analysis...');
        await new Promise(r => setTimeout(r, 1500));
        setUploadProgress(100);
        
        await refreshPhotos();
        
        setIsUploading(false);
        setUploadProgress(0);
        setCurrentFileName('');
        setIsRawUploadModalOpen(false); // Close modal on success

    } catch (e) {
        console.error("Upload error", e);
        setIsUploading(false);
        alert("Upload failed. Please check connection.");
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

  const totalPaid = (activeEvent as any).paidAmount || (activeEvent.price || 0) / 2;
  const balance = (activeEvent.price || 0) - totalPaid;

  const optStrategies = [
    { id: 'balanced', label: 'BALANCED (WEBP V2)', reduction: '85%', icon: Wand2 },
    { id: 'performance', label: 'SPEED (WEBP 1080P)', reduction: '92%', icon: Zap },
    { id: 'high-quality', label: 'PREMIUM (4K WEBP)', reduction: '40%', icon: ShieldCheck },
    { id: 'none', label: 'ORIGINAL FORMAT', reduction: '0%', icon: FileType },
  ];

  const selectedPhotos = photos.filter(p => p.eventId === activeEvent.id && (p.isSelected || p.reviewStatus !== 'pending'));
  const approvedCount = selectedPhotos.filter(p => p.reviewStatus === 'approved').length;
  const reworkCount = selectedPhotos.filter(p => p.reviewStatus === 'changes_requested').length;

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'open': return 'bg-blue-50 text-blue-700 border-blue-100';
          case 'submitted': return 'bg-amber-50 text-amber-700 border-amber-100';
          case 'editing': return 'bg-purple-50 text-purple-700 border-purple-100';
          case 'review': return 'bg-orange-50 text-orange-700 border-orange-100';
          case 'accepted': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
          default: return 'bg-slate-50 text-slate-700';
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 -m-8 animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="bg-white px-8 py-3 border-b border-slate-100 space-y-3 shadow-sm z-20 relative">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setActiveEvent(null); onNavigate('events'); }}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm border border-slate-100">
              <img src={activeEvent.coverImage} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">{activeEvent.name}</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{activeEvent.photoCount} photos</p>
            </div>
          </div>
          
          {/* Status Card (User Story 19) */}
          <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-xl border ${getStatusColor(activeEvent.selectionStatus)} shadow-sm ml-auto mr-4`}>
             <div className="relative">
                <div className="w-2.5 h-2.5 bg-current rounded-full animate-ping absolute opacity-75"></div>
                <div className="w-2.5 h-2.5 bg-current rounded-full relative"></div>
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest">{activeEvent.selectionStatus}</span>
          </div>
        </div>

        <div className="flex gap-1 bg-slate-50 p-1 rounded-xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-white text-[#10B981] shadow-sm' 
                  : 'text-slate-400 hover:text-slate-800'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-[#10B981]' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start max-w-7xl mx-auto">
            {/* ... Content same as previously generated ... */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-slate-50 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#10B981]">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Project Summary</h3>
                  </div>
                  <button onClick={() => setIsEditDetailsOpen(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all">
                    <Edit2 className="w-3.5 h-3.5" /> Modify Details
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Project Name</p>
                    <p className="text-sm font-bold text-slate-800">{activeEvent.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Main Date</p>
                    <p className="text-sm font-bold text-slate-800">{new Date(activeEvent.date).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Deliverables</p>
                    <p className="text-sm font-bold text-slate-800">{activeEvent.photoCount} High-Res Frames</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Event Timeline / Sub-Events</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeEvent.subEvents.map(se => (
                      <div key={se.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-indigo-400" />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{se.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">
                                {new Date(se.date).toLocaleDateString()}
                                {se.endDate ? ` - ${new Date(se.endDate).toLocaleDateString()}` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#10B981] rounded-2xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tight">Financials</h3>
                    </div>
                    <button onClick={() => setIsPaymentModalOpen(true)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                </div>
                <div className="space-y-6">
                   <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Valuation</p>
                      <p className="text-3xl font-black">₹{activeEvent.price?.toLocaleString()}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                      <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">Received</p>
                        <p className="text-lg font-bold text-[#10B981]">₹{totalPaid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">Balance</p>
                        <p className="text-lg font-bold text-amber-500">₹{balance.toLocaleString()}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WORKFLOW TAB */}
        {activeTab === 'workflow' && (
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Production Workflow</h3>
                            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Current Stage: {activeEvent.selectionStatus}</p>
                        </div>
                    </div>

                    {/* Timeline Visual */}
                    <div className="relative pt-6 pb-2">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
                        <div className="relative z-10 flex justify-between">
                            {['open', 'submitted', 'editing', 'review', 'accepted'].map((step, idx) => {
                                const currentIdx = ['open', 'submitted', 'editing', 'review', 'accepted'].indexOf(activeEvent.selectionStatus);
                                const isCompleted = idx <= currentIdx;
                                return (
                                    <div key={step} className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all ${
                                            isCompleted ? 'bg-[#10B981] border-[#10B981] text-white' : 'bg-white border-slate-200 text-slate-300'
                                        }`}>
                                            {isCompleted && <CheckSquare className="w-4 h-4" />}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-slate-900' : 'text-slate-300'}`}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions based on Status */}
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                        {activeEvent.selectionStatus === 'submitted' && (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <h4 className="font-bold text-slate-900">Client Selection Submitted</h4>
                                    <p className="text-xs text-slate-500">Selections are locked. Review them or start editing.</p>
                                </div>
                                <div className="flex items-end gap-3">
                                    <button 
                                        onClick={() => handleWorkflowChange('open')}
                                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:border-red-200 hover:text-red-500 flex items-center gap-2 transition-all"
                                    >
                                        <Unlock className="w-4 h-4" /> Unlock Selection
                                    </button>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Target Delivery Date</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="date" 
                                                className="px-4 py-2 rounded-xl border border-slate-200 text-xs outline-none" 
                                                onChange={(e) => setDeliveryDate(e.target.value)}
                                            />
                                            <button 
                                                onClick={() => handleWorkflowChange('editing')}
                                                disabled={!deliveryDate}
                                                className="px-6 py-3 bg-[#10B981] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                Start Editing
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeEvent.selectionStatus === 'editing' && (
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-900">Editing In Progress</h4>
                                    <p className="text-xs text-slate-500">Estimated Delivery: {activeEvent.timeline?.deliveryEstimate ? new Date(activeEvent.timeline.deliveryEstimate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <button 
                                    onClick={() => handleWorkflowChange('review')}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 flex items-center gap-2 transition-all"
                                >
                                    <Send className="w-4 h-4" /> Submit for Review
                                </button>
                            </div>
                        )}

                        {activeEvent.selectionStatus === 'review' && (
                            <div className="flex gap-4 items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-900">In Review</h4>
                                    <p className="text-xs text-slate-500">Waiting for client feedback or approval.</p>
                                </div>
                            </div>
                        )}
                        
                        {activeEvent.selectionStatus === 'open' && (
                            <div className="text-center py-8">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waiting for client submission...</p>
                                <button 
                                    onClick={() => handleWorkflowChange('submitted')}
                                    className="mt-4 px-6 py-2 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-200"
                                >
                                    Force Submit (Manual Override)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* GALLERY TAB (Raw Images) */}
        {activeTab === 'sorted' && (
            <div className="max-w-7xl mx-auto h-full flex flex-col relative">
                {/* Embed Upload Button in Header */}
                <div className="absolute top-[-52px] right-0 z-30">
                    <button 
                        onClick={() => setIsRawUploadModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-xl shadow-lg hover:bg-[#059669] transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
                    >
                        <UploadCloud className="w-4 h-4" /> Upload Raw Images
                    </button>
                </div>
                <GalleryView isPhotographer={true} />
            </div>
        )}
        
        {/* SELECTIONS TAB (Edited Images) */}
        {activeTab === 'selections' && (
          <div className="max-w-7xl mx-auto space-y-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Client Selections</h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-medium">
                      <span>{selectedPhotos.length} Selected</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-green-600">{approvedCount} Approved</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-amber-600">{reworkCount} Rework Requested</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <input 
                    type="file" 
                    ref={bulkEditUploadRef} 
                    className="hidden" 
                    multiple 
                    accept="image/*" 
                    onChange={handleBulkEditUpload}
                  />
                  <button 
                    onClick={() => bulkEditUploadRef.current?.click()}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] shadow-xl hover:bg-black transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" /> Upload Edited Photos
                  </button>
                  <button onClick={() => alert('Exporting sidecars...')} className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 font-black uppercase tracking-widest rounded-2xl text-[10px]">
                    <FileJson className="w-4 h-4" /> Export XMP
                  </button>
                </div>
             </div>
             
             {isUploading && uploadStage === 'uploading' && (
                 <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-center gap-4 animate-pulse">
                     <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                     <span className="text-xs font-bold text-indigo-700">Uploading edits... matching filenames...</span>
                 </div>
             )}

             <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
               <input 
                 type="file" 
                 ref={editUploadRef} 
                 className="hidden" 
                 accept="image/*" 
                 onChange={handleEditUpload}
               />
               {selectedPhotos.map(p => (
                 <div key={p.id} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border-4 border-white group">
                   <img src={p.editedUrl || p.url} className="w-full h-full object-cover" alt="" />
                   
                   {/* Status Overlays */}
                   <div className="absolute top-2 right-2 flex gap-1">
                        {p.reviewStatus === 'approved' && <div className="bg-green-500 text-white p-1 rounded-full shadow-md"><CheckCircle className="w-3 h-3" /></div>}
                        {p.reviewStatus === 'changes_requested' && <div className="bg-amber-500 text-white p-1 rounded-full shadow-md"><AlertCircle className="w-3 h-3" /></div>}
                        {p.comments && p.comments.some(c => !c.resolved) && <div className="bg-red-500 text-white p-1 rounded-full shadow-md animate-pulse"><MessageCircle className="w-3 h-3" /></div>}
                   </div>

                   {/* Hover Actions */}
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-2">
                       <button 
                         onClick={() => { setActivePhotoForEdit(p.id); editUploadRef.current?.click(); }}
                         className="flex items-center gap-2 px-3 py-2 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#10B981] hover:text-white transition-colors"
                       >
                           <UploadCloud className="w-3 h-3" /> Upload Edit
                       </button>
                       <button 
                         onClick={() => setActivePhotoForComments(p.id)}
                         className="flex items-center gap-2 px-3 py-2 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors"
                       >
                           <MessageCircle className="w-3 h-3" /> {p.comments?.length || 0} Comments
                       </button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* RAW UPLOAD MODAL */}
      {isRawUploadModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-black text-slate-900 uppercase tracking-tight">Upload Raw Images</h3>
                      <button onClick={() => setIsRawUploadModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  
                  <div className="p-8 space-y-6 overflow-y-auto">
                      {/* Sub Event Selector */}
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Assign to Sub-Event</label>
                                <div className="flex gap-2">
                                    <select 
                                        value={selectedSubEvent} 
                                        onChange={(e) => {
                                            if(e.target.value === 'new') setIsSubEventModalOpen(true);
                                            else setSelectedSubEvent(e.target.value);
                                        }}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#10B981]"
                                    >
                                        <option value="" disabled>Select Sub-Event</option>
                                        {activeEvent.subEvents.map(se => (
                                            <option key={se.id} value={se.id}>{se.name}</option>
                                        ))}
                                        <option value="new">+ Create New Sub-Event</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Optimizer & Upload Box */}
                        <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-8 text-center transition-all hover:border-[#10B981]/40 overflow-hidden">
                        {isUploading ? (
                            <div className="w-full max-w-xl space-y-10 py-4 animate-in fade-in duration-300">
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative group">
                                <div className="absolute inset-0 bg-[#10B981] rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity animate-pulse" />
                                <div className="relative w-24 h-24 bg-slate-900 text-[#10B981] rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                                    {uploadStage === 'analyzing' && <Database className="w-10 h-10 animate-bounce" />}
                                    {uploadStage === 'optimizing' && <Sparkles className="w-10 h-10 animate-pulse" />}
                                    {uploadStage === 'uploading' && <Upload className="w-10 h-10 animate-bounce" />}
                                    {uploadStage === 'indexing' && <Activity className="w-10 h-10 animate-spin" />}
                                </div>
                                </div>
                                
                                <div className="space-y-2">
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{uploadStage} Assets...</h4>
                                <p className="text-[10px] text-[#10B981] font-black uppercase tracking-[0.3em] h-4">
                                    {currentFileName}
                                </p>
                                </div>
                            </div>
                            <div className="relative px-8">
                                <div className="flex items-center justify-between mb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Deployment Pipeline</span>
                                <span>{uploadProgress}% Complete</span>
                                </div>
                                <div className="overflow-hidden h-3 flex rounded-full bg-slate-50 border border-slate-100 p-0.5">
                                <div 
                                    style={{ width: `${uploadProgress}%` }} 
                                    className="shadow-inner flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#10B981] transition-all duration-300 rounded-full"
                                />
                                </div>
                            </div>
                            </div>
                        ) : (
                            <>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFolderSelect}
                                className="hidden"
                                multiple
                                {...({ webkitdirectory: "", directory: "" } as any)}
                            />
                            <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl relative group-hover:scale-110 transition-transform cursor-pointer" onClick={triggerFolderUpload}>
                                <FolderOpen className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">SOURCE INGESTION</h4>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em] max-w-xs mx-auto">Upload Event Folder for AI-Processing</p>
                            </div>
                            <div className="flex gap-4 w-full max-w-sm">
                                <button 
                                onClick={triggerFolderUpload}
                                disabled={!selectedSubEvent}
                                className="w-full bg-[#10B981] hover:bg-slate-900 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#10B981]/20 active:scale-95 text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                <Zap className="w-4 h-4" /> Open Folder
                                </button>
                            </div>
                            </>
                        )}
                        </div>
                  </div>
              </div>
          </div>
      )}

      {/* Edit Details Modal */}
      {isEditDetailsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-tight">Configuration</h3>
              <button onClick={() => setIsEditDetailsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto no-scrollbar">
              {/* ... Same modal content ... */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Name</label>
                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none text-slate-900" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Users className="w-3 h-3" /> Assigned Clients
                </label>
                
                {/* Invite New Client Form */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                   <div className="flex items-center gap-2">
                      <input 
                        type="text" placeholder="Name" 
                        className="flex-1 p-2 bg-white rounded-lg text-xs font-bold outline-none border border-transparent focus:border-[#10B981]" 
                        value={newClientForm.name} onChange={e => setNewClientForm({...newClientForm, name: e.target.value})}
                      />
                      <input 
                        type="email" placeholder="Email" 
                        className="flex-1 p-2 bg-white rounded-lg text-xs font-bold outline-none border border-transparent focus:border-[#10B981]" 
                        value={newClientForm.email} onChange={e => setNewClientForm({...newClientForm, email: e.target.value})}
                      />
                   </div>
                   <div className="flex items-center gap-2">
                      <input 
                        type="tel" placeholder="Phone" 
                        className="flex-1 p-2 bg-white rounded-lg text-xs font-bold outline-none border border-transparent focus:border-[#10B981]" 
                        value={newClientForm.phone} onChange={e => setNewClientForm({...newClientForm, phone: e.target.value})}
                      />
                      <button 
                        onClick={handleAddClient}
                        disabled={!newClientForm.name || !newClientForm.email}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase disabled:opacity-50"
                      >
                        Add Access
                      </button>
                   </div>
                </div>

                {/* Existing Clients List */}
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {users.filter(u => activeEvent.assignedUsers?.includes(u.id)).length > 0 ? (
                    users.filter(u => activeEvent.assignedUsers?.includes(u.id)).map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">{user.name}</span>
                            <span className="text-[10px] text-slate-400">{user.email} {user.phone ? `• ${user.phone}` : ''}</span>
                        </div>
                        <button 
                          onClick={() => handleRemoveClient(user.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-slate-400 py-4 italic">No active clients assigned</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4 mt-auto">
              <button onClick={() => setIsEditDetailsOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Cancel</button>
              <button onClick={handleUpdateDetails} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* New Sub Event Modal */}
      {isSubEventModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm space-y-4">
                  <h3 className="font-black text-lg">Add Sub-Event</h3>
                  <input type="text" placeholder="Name (e.g. Reception)" className="w-full p-3 border rounded-xl" value={newSubEvent.name} onChange={e => setNewSubEvent({...newSubEvent, name: e.target.value})} />
                  <input type="date" className="w-full p-3 border rounded-xl" value={newSubEvent.date} onChange={e => setNewSubEvent({...newSubEvent, date: e.target.value})} />
                  <input type="date" placeholder="End Date (Optional)" className="w-full p-3 border rounded-xl" value={newSubEvent.endDate} onChange={e => setNewSubEvent({...newSubEvent, endDate: e.target.value})} />
                  <div className="flex gap-2">
                      <button onClick={() => setIsSubEventModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                      <button onClick={handleCreateSubEvent} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold">Create</button>
                  </div>
              </div>
          </div>
      )}

      {/* Record Payment Modal (Keep existing) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-tight">Record Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount Received (₹)</label>
                <input 
                    type="number" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold outline-none text-slate-900" 
                    value={paymentAmount} 
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Date</label>
                <input 
                    type="date" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none text-slate-900" 
                    value={paymentDate} 
                    onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Cancel</button>
              <button onClick={handleRecordPayment} className="flex-1 py-4 bg-[#10B981] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Resolver Modal */}
      {activePhotoForComments && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Resolve Feedback</h3>
                      <button onClick={() => setActivePhotoForComments(null)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <div className="p-6 overflow-y-auto space-y-4 bg-slate-50 flex-1">
                      {photos.find(p => p.id === activePhotoForComments)?.comments?.map(c => (
                          <div key={c.id} className={`p-4 rounded-xl border ${c.resolved ? 'bg-green-50 border-green-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                              <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{c.author}</span>
                                  <span className="text-[9px] text-slate-400">{new Date(c.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm font-medium text-slate-800">{c.text}</p>
                              {!c.resolved && (
                                  <button 
                                    onClick={() => resolveComment(activePhotoForComments, c.id)}
                                    className="mt-3 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                                  >
                                      Mark Resolved
                                  </button>
                              )}
                              {c.resolved && (
                                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                                      <CheckCircle className="w-3 h-3" /> Resolved
                                  </div>
                              )}
                          </div>
                      ))}
                      {(!photos.find(p => p.id === activePhotoForComments)?.comments?.length) && (
                          <p className="text-center text-slate-400 text-sm italic">No comments on this photo.</p>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PhotographerEventDetail;
