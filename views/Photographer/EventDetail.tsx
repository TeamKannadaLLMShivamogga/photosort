
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Settings, Upload, Image as ImageIcon, CheckSquare, 
  Share2, X, Clock, Download, FileJson, Calendar, ChevronLeft, Loader2,
  Edit2, Zap, ShieldCheck, FileType, Sparkles, Wand2, CreditCard, ChevronDown, FolderOpen
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import GalleryView from '../../components/Gallery/GalleryView';
import { SubEvent, Event, OptimizationType } from '../../types';
import { optimizeImage } from '../../utils/imageOptimizer';

const PhotographerEventDetail: React.FC<{ onNavigate: (view: string) => void, initialTab?: string }> = ({ onNavigate, initialTab }) => {
  const { activeEvent, updateEvent, photos, users, setActiveEvent } = useData();
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'settings');
  
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Event>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Optimization State
  const [useOptimization, setUseOptimization] = useState(true);
  const [optLevel, setOptLevel] = useState<OptimizationType>(activeEvent?.optimizationSetting || 'balanced');

  useEffect(() => {
    if (activeEvent) {
      setEditForm(activeEvent);
      setOptLevel(activeEvent.optimizationSetting || 'balanced');
    }
  }, [activeEvent]);

  if (!activeEvent) return null;

  const tabs = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'upload', label: 'Upload & View', icon: Upload },
    { id: 'sorted', label: 'Sorted Photos', icon: ImageIcon },
    { id: 'selections', label: 'Selections', icon: CheckSquare },
    { id: 'share', label: 'Share & Close', icon: Share2 },
  ];

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'optimizing' | 'uploading' | 'processing'>('optimizing');

  const handleUpdateDetails = () => {
    updateEvent({ ...activeEvent, ...editForm } as Event);
    setIsEditDetailsOpen(false);
  };

  const handleDownloadXMP = () => {
    alert('Generating Lightroom XMP sidecar files for the selected photos.');
  };

  const simulateUpload = async (files?: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const fileArray = files ? Array.from(files).filter(f => f.type.startsWith('image/')) : [];
    const totalFiles = fileArray.length || 10; // Fallback for simulation
    
    if (useOptimization && fileArray.length > 0) {
      setUploadStage('optimizing');
      let completed = 0;
      for (const file of fileArray) {
        await optimizeImage(file, optLevel);
        completed++;
        setUploadProgress(Math.round((completed / totalFiles) * 100));
      }
    } else {
      // Basic simulation if no files or optimization off
      setUploadStage('optimizing');
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(r => setTimeout(r, 50));
      }
    }

    setUploadStage('uploading');
    setUploadProgress(0);
    for (let i = 0; i <= 100; i += 5) {
      setUploadProgress(i);
      await new Promise(r => setTimeout(r, 80));
    }

    setUploadStage('processing');
    setUploadProgress(0);
    for (let i = 0; i <= 100; i += 20) {
      setUploadProgress(i);
      await new Promise(r => setTimeout(r, 150));
    }

    setIsUploading(false);
    setUploadProgress(0);
    alert('Successfully optimized and uploaded all photos!');
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateUpload(e.target.files);
    }
  };

  const triggerFolderUpload = () => {
    fileInputRef.current?.click();
  };

  const totalPaid = (activeEvent as any).paidAmount || (activeEvent.price || 0) / 2;
  const balance = (activeEvent.price || 0) - totalPaid;

  const optStrategies = [
    { id: 'balanced', label: 'BALANCED (WEBP V2 CHROMA-SMART)', reduction: '85%', icon: Wand2 },
    { id: 'performance', label: 'SPEED (WEBP 1080P IQ)', reduction: '92%', icon: Zap },
    { id: 'high-quality', label: 'PREMIUM (4K WEBP LOSSLESS)', reduction: '40%', icon: ShieldCheck },
    { id: 'none', label: 'ORIGINAL FORMAT', reduction: '0%', icon: FileType },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 -m-8 animate-in fade-in duration-500">
      {/* Header with Navigation and Tabs */}
      <div className="bg-white px-8 py-3 border-b border-slate-100 space-y-3 shadow-sm">
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
              <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2 mt-1">
                <span className="uppercase tracking-wider">{new Date(activeEvent.date).toLocaleDateString()}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span className="uppercase tracking-wider">{activeEvent.photoCount} photos</span>
              </p>
            </div>
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
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start max-w-7xl mx-auto">
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-slate-50 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#10B981]">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Project Summary</h3>
                  </div>
                  <button 
                    onClick={() => setIsEditDetailsOpen(true)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all"
                  >
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
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(se.date).toLocaleDateString()}</p>
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
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#10B981] rounded-2xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Financials</h3>
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
                   <button className="w-full py-4 bg-[#1F2937] hover:bg-[#374151] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                      Log Transaction
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-300">
            {/* CONDENSED OPTIMIZATION ROW */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-6">
               <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2.5 rounded-2xl ${useOptimization ? 'bg-emerald-50 text-[#10B981]' : 'bg-slate-50 text-slate-400'}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-fit">
                    <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">Expert Image Optimizer</h4>
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">Source Metadata Analysis</p>
                  </div>
                  
                  {/* Strategy Dropdown */}
                  <div className="relative flex-1 max-w-sm ml-4">
                    <select 
                      value={optLevel}
                      onChange={(e) => setOptLevel(e.target.value as OptimizationType)}
                      disabled={!useOptimization}
                      className={`w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border-2 text-[11px] font-bold outline-none transition-all ${
                        useOptimization 
                          ? 'bg-white border-slate-100 text-slate-900 focus:border-[#10B981]' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {optStrategies.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.label} ({s.reduction} Reduction)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
               </div>

               <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">AI OPTIMIZER</span>
                  <label className="relative inline-flex items-center cursor-pointer scale-90">
                    <input type="checkbox" className="sr-only peer" checked={useOptimization} onChange={() => setUseOptimization(!useOptimization)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                  </label>
               </div>
            </div>

             <div className="bg-white p-16 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-8 text-center transition-all hover:border-[#10B981]/40">
              {isUploading ? (
                <div className="w-full max-w-sm space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-emerald-50 text-[#10B981] rounded-[2rem] flex items-center justify-center mx-auto relative z-10 shadow-lg shadow-emerald-500/10">
                      <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase">{uploadStage}...</h4>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest px-4">
                      {uploadStage === 'optimizing' && `Analyzing frame metadata...`}
                      {uploadStage === 'uploading' && `Deploying to high-performance edge...`}
                      {uploadStage === 'processing' && `Indexing people & AI clustering...`}
                    </p>
                  </div>
                  <div className="relative pt-1 px-8">
                    <div className="overflow-hidden h-2.5 flex rounded-full bg-emerald-50 border border-emerald-100">
                      <div 
                        style={{ width: `${uploadProgress}%` }} 
                        className="shadow-md flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#10B981] transition-all duration-300 rounded-full"
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
                      className="w-full bg-[#10B981] hover:bg-slate-900 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#10B981]/20 active:scale-95 text-[11px]"
                    >
                      <Zap className="w-4 h-4" /> Open Folder
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Other tabs */}
        {activeTab === 'sorted' && <div className="max-w-7xl mx-auto h-full"><GalleryView /></div>}
        {activeTab === 'selections' && (
          <div className="max-w-7xl mx-auto space-y-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Deliverables Stack</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Photos curated by the user for the final album.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleDownloadXMP} className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 font-black uppercase tracking-widest rounded-2xl text-[10px]">
                    <FileJson className="w-4 h-4" /> Export XMP
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] shadow-xl">
                    <Download className="w-4 h-4" /> Download Batch
                  </button>
                </div>
             </div>
             <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
               {photos.filter(p => p.eventId === activeEvent.id && p.quality === 'high').slice(0, 24).map(p => (
                 <div key={p.id} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border-4 border-white">
                   <img src={p.url} className="w-full h-full object-cover" alt="" />
                 </div>
               ))}
             </div>
          </div>
        )}
        {activeTab === 'share' && (
          <div className="max-w-2xl mx-auto space-y-8 pt-12 animate-in slide-in-from-bottom-8 duration-500 text-center">
            <h3 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Ready to Close?</h3>
            <p className="text-slate-500 font-medium text-lg">Send the final gallery links and invoices.</p>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8 text-left">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Dues</p>
                <p className="text-3xl font-black text-amber-600 tracking-tight">₹{balance.toLocaleString()}</p>
              </div>
              <button className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl transition-all">
                Publish Final Portal
              </button>
            </div>
          </div>
        )}
      </div>

      {isEditDetailsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-tight">Configuration</h3>
              <button onClick={() => setIsEditDetailsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Name</label>
                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" value={editForm.name || ''} onChange={setEditForm as any} />
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button onClick={() => setIsEditDetailsOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Cancel</button>
              <button onClick={handleUpdateDetails} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotographerEventDetail;
