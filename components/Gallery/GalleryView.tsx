
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Grid2X2, Sparkles, User, Calendar, Tag, Check, Filter, 
  X, ChevronRight, Star, CheckCircle2, Image as ImageIcon, RotateCcw, Trash2, Edit2, UploadCloud, Lock, Unlock, AlertCircle, Download, Clock, Send, List, LayoutList, Users
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Photo, SelectionStatus } from '../../types';

type MainTabType = 'all' | 'selected' | 'edited';
type SubTabType = 'grid' | 'ai' | 'people' | 'events' | 'tags';
type ViewMode = 'grid' | 'feed';

interface GalleryViewProps {
  initialTab?: string;
  isPhotographer?: boolean;
  onUploadClick?: () => void;
  onUploadEditsClick?: () => void;
}

const GalleryView: React.FC<GalleryViewProps> = ({ initialTab, isPhotographer, onUploadClick, onUploadEditsClick }) => {
  const { photos, activeEvent, selectedPhotos, togglePhotoSelection, submitSelections, deletePhoto, renamePersonInEvent, updateEventWorkflow } = useData();
  
  // Two-level Tab State
  const [mainTab, setMainTab] = useState<MainTabType>('all');
  const [subTab, setSubTab] = useState<SubTabType>('grid');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [selectedFilters, setSelectedFilters] = useState<{
    people: string[];
    events: string[];
    tags: string[];
  }>({
    people: [],
    events: [],
    tags: []
  });
  const [editPersonName, setEditPersonName] = useState<{old: string, new: string} | null>(null);
  
  // Status Update Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPeopleModalOpen, setIsPeopleModalOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState<SelectionStatus>('editing');

  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'selected') {
          setMainTab('selected');
      } else if (initialTab === 'edited') {
          setMainTab('edited');
      } else {
          setMainTab('all');
          if (['ai', 'people', 'events', 'tags'].includes(initialTab)) {
              setSubTab(initialTab as SubTabType);
          } else {
              setSubTab('grid');
          }
      }
    }
  }, [initialTab]);

  useEffect(() => {
      if (activeEvent) {
          setWorkflowStatus(activeEvent.selectionStatus);
          if (activeEvent.timeline?.deliveryEstimate) {
              setDeliveryDate(new Date(activeEvent.timeline.deliveryEstimate).toISOString().split('T')[0]);
          }
      }
  }, [activeEvent]);

  const eventPhotos = useMemo(() => 
    photos.filter(p => p.eventId === activeEvent?.id),
    [photos, activeEvent]
  );

  const subEventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activeEvent?.subEvents.forEach(se => {
        counts[se.name] = eventPhotos.filter(p =>
            (p.subEventId && p.subEventId === se.id) ||
            (!p.subEventId && p.category === se.name)
        ).length;
    });
    return counts;
  }, [eventPhotos, activeEvent]);

  const filterOptions = useMemo(() => ({
    people: Array.from(new Set(eventPhotos.flatMap(p => p.people))),
    events: activeEvent?.subEvents.map(s => s.name) || [],
    tags: Array.from(new Set(eventPhotos.map(p => p.category)))
  }), [eventPhotos, activeEvent]);

  // Sort people by photo count (Descending)
  const sortedPeople = useMemo(() => {
      return [...filterOptions.people].sort((a, b) => {
          const countA = eventPhotos.filter(p => p.people.includes(a)).length;
          const countB = eventPhotos.filter(p => p.people.includes(b)).length;
          return countB - countA;
      });
  }, [filterOptions.people, eventPhotos]);

  const peopleThumbnails = useMemo(() => {
    const map: Record<string, string> = {};
    filterOptions.people.forEach(pName => {
      const pPhoto = eventPhotos.find(ph => ph.people.includes(pName));
      if (pPhoto) map[pName] = pPhoto.url;
    });
    return map;
  }, [filterOptions.people, eventPhotos]);

  const filteredPhotos = useMemo(() => {
    let result = eventPhotos;
    
    // Main Tab Logic
    if (mainTab === 'selected') {
        result = result.filter(p => p.isSelected);
    } else if (mainTab === 'edited') {
        result = result.filter(p => p.editedUrl);
    } else {
        // Main Tab: All - Apply Sub Tabs
        if (subTab === 'ai') result = result.filter(p => p.isAiPick);
        
        // Filter Logic (People, Events, Tags are applied here)
        if (selectedFilters.people.length > 0) {
            result = result.filter(p => p.people.some(person => selectedFilters.people.includes(person)));
        }
        if (selectedFilters.events.length > 0) {
            result = result.filter(p => {
               // Assuming events map to category or subEventId logic
               const subEventName = activeEvent?.subEvents.find(se => se.id === p.subEventId)?.name;
               return selectedFilters.events.includes(p.category) || (subEventName && selectedFilters.events.includes(subEventName));
            });
        }
        if (selectedFilters.tags.length > 0) {
             result = result.filter(p => selectedFilters.tags.includes(p.category));
        }
    }
    return result;
  }, [eventPhotos, mainTab, subTab, selectedFilters, activeEvent]);

  const toggleFilter = (type: 'people' | 'events' | 'tags', value: string) => {
      setSelectedFilters(prev => {
          const current = prev[type];
          const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
          return { ...prev, [type]: updated };
      });
  };
  
  const handleRenamePerson = async () => {
      if (editPersonName && activeEvent) {
          await renamePersonInEvent(activeEvent.id, editPersonName.old, editPersonName.new);
          setEditPersonName(null);
      }
  };

  const handleWorkflowUpdate = async () => {
      if (activeEvent) {
          await updateEventWorkflow(activeEvent.id, workflowStatus, deliveryDate);
          setIsStatusModalOpen(false);
      }
  };

  const handleDownload = (e: React.MouseEvent, url: string) => {
      e.stopPropagation();
      const link = document.createElement('a');
      link.href = url;
      link.download = 'PhotoSort_Download.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const isLocked = activeEvent?.selectionStatus !== 'open' && !isPhotographer;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20">
       {/* Header & Controls */}
       <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
           <div>
               <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{activeEvent?.name || 'Gallery'}</h1>
               <div className="flex items-center gap-4 mt-2">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {(['all', 'selected', 'edited'] as MainTabType[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setMainTab(tab)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    mainTab === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {tab} <span className="opacity-50 ml-1">
                                    {tab === 'all' ? eventPhotos.length : tab === 'selected' ? eventPhotos.filter(p=>p.isSelected).length : eventPhotos.filter(p=>p.editedUrl).length}
                                </span>
                            </button>
                        ))}
                    </div>
                    {isPhotographer && (
                        <button 
                            onClick={() => setIsStatusModalOpen(true)}
                            className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                        >
                            Status: {activeEvent?.selectionStatus}
                        </button>
                    )}
               </div>
           </div>

           <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                        title="Grid View"
                    >
                        <Grid2X2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode('feed')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'feed' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                        title="Linear Feed (Chronological)"
                    >
                        <LayoutList className="w-4 h-4" />
                    </button>
                </div>

               {isPhotographer ? (
                   <>
                       <button onClick={onUploadClick} className="px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black flex items-center gap-2">
                           <UploadCloud className="w-4 h-4" /> Upload Raw
                       </button>
                       <button onClick={onUploadEditsClick} className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 flex items-center gap-2">
                           <Sparkles className="w-4 h-4" /> Upload Edits
                       </button>
                   </>
               ) : (
                   !isLocked && (
                       <button onClick={submitSelections} className="px-6 py-3 bg-[#10B981] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#059669] shadow-lg shadow-[#10B981]/20 flex items-center gap-2">
                           <Send className="w-4 h-4" /> Submit Selection ({selectedPhotos.size})
                       </button>
                   )
               )}
           </div>
       </div>

       {/* Sub Tabs (Only for 'All') */}
       {mainTab === 'all' && (
           <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 sm:pb-0">
                    {[
                        { id: 'grid', icon: Grid2X2, label: 'All Photos' },
                        { id: 'ai', icon: Sparkles, label: 'AI Best Picks' },
                        { id: 'people', icon: User, label: 'People' },
                        { id: 'events', icon: Calendar, label: 'Events' },
                        { id: 'tags', icon: Tag, label: 'Tags' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSubTab(item.id as SubTabType)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all whitespace-nowrap ${
                                subTab === item.id 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                            }`}
                        >
                            <item.icon className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
                        </button>
                    ))}
               </div>

               {/* Dynamic Filter Chips based on subTab */}
               <div className="flex-1 flex flex-wrap gap-2 items-center">
                   {/* Top 4 People Display */}
                   {subTab === 'people' && (
                       <>
                           {sortedPeople.slice(0, 4).map(person => (
                               <button
                                   key={person}
                                   onClick={() => toggleFilter('people', person)}
                                   className={`flex items-center gap-2 pr-3 pl-1 py-1 rounded-full border transition-all ${
                                       selectedFilters.people.includes(person) 
                                       ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                       : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                   }`}
                               >
                                   <img src={peopleThumbnails[person] || `https://ui-avatars.com/api/?name=${person}`} className="w-6 h-6 rounded-full object-cover" alt="" />
                                   <span className="text-[10px] font-bold uppercase tracking-wider">{person}</span>
                                   {isPhotographer && (
                                       <Edit2 
                                        onClick={(e) => { e.stopPropagation(); setEditPersonName({ old: person, new: person }); }} 
                                        className="w-3 h-3 opacity-50 hover:opacity-100" 
                                       />
                                   )}
                               </button>
                           ))}
                           
                           {/* View All Button */}
                           {sortedPeople.length > 4 && (
                               <button 
                                   onClick={() => setIsPeopleModalOpen(true)}
                                   className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider transition-all"
                               >
                                   <Users className="w-3 h-3" /> View All ({sortedPeople.length})
                               </button>
                           )}
                       </>
                   )}

                   {subTab === 'events' && filterOptions.events.map(evt => (
                       <button
                           key={evt}
                           onClick={() => toggleFilter('events', evt)}
                           className={`px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                               selectedFilters.events.includes(evt)
                               ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                               : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                           }`}
                       >
                           {evt}
                       </button>
                   ))}
               </div>
           </div>
       )}

       {/* View Content */}
       {viewMode === 'grid' ? (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4">
               {filteredPhotos.map(photo => {
                   const isSelected = selectedPhotos.has(photo.id);
                   return (
                       <div key={photo.id} className={`group relative aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden transition-all ${isSelected ? 'ring-4 ring-indigo-500 shadow-xl scale-[0.98]' : 'hover:shadow-lg'}`}>
                           <img 
                                src={mainTab === 'edited' ? (photo.editedUrl || photo.url) : photo.url} 
                                loading="lazy" 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                alt="" 
                           />
                           
                           {/* Overlays */}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                               <div className="flex justify-between items-start">
                                   {photo.isAiPick && (
                                       <div className="bg-[#10B981] text-white p-1.5 rounded-lg shadow-lg">
                                           <Sparkles className="w-3 h-3" />
                                       </div>
                                   )}
                                   {isPhotographer && (
                                       <button onClick={() => deletePhoto(photo.id)} className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors">
                                           <Trash2 className="w-3 h-3" />
                                       </button>
                                   )}
                               </div>
                               
                               <div className="flex justify-between items-end">
                                    <button 
                                        onClick={(e) => handleDownload(e, mainTab === 'edited' ? (photo.editedUrl || photo.url) : photo.url)}
                                        className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>

                                   {!isLocked && (
                                       <button 
                                            onClick={() => togglePhotoSelection(photo.id)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                isSelected ? 'bg-indigo-600 text-white' : 'bg-white/20 backdrop-blur text-white hover:bg-white hover:text-indigo-600'
                                            }`}
                                       >
                                           <Check className="w-4 h-4" />
                                       </button>
                                   )}
                               </div>
                           </div>

                           {/* Persistent Selection Indicator */}
                           {isSelected && !isLocked && (
                               <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow-md z-10">
                                   <Check className="w-3 h-3 text-white" />
                               </div>
                           )}
                       </div>
                   );
               })}
           </div>
       ) : (
           <div className="max-w-3xl mx-auto space-y-12">
               {filteredPhotos.map((photo, index) => {
                   const isSelected = selectedPhotos.has(photo.id);
                   return (
                       <div key={photo.id} className={`bg-white p-4 rounded-[2.5rem] border transition-all ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-100 shadow-sm'}`}>
                            <div className="relative aspect-[4/3] sm:aspect-[3/2] rounded-[2rem] overflow-hidden mb-4 bg-slate-100">
                                <img 
                                    src={mainTab === 'edited' ? (photo.editedUrl || photo.url) : photo.url} 
                                    loading="lazy" 
                                    className="w-full h-full object-contain"
                                    alt="" 
                                />
                                {photo.isAiPick && (
                                    <div className="absolute top-4 left-4 bg-[#10B981] text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3" /> Best Pick
                                    </div>
                                )}
                            </div>
                            <div className="px-4 pb-2 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex gap-2 items-center">
                                        {photo.category && <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{photo.category}</span>}
                                        {photo.people.map(p => (
                                            <span key={p} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">{p}</span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 font-bold">IMG_{photo.id.slice(-6).toUpperCase()}.JPG</p>
                                </div>
                                <div className="flex items-center gap-3">
                                     <button 
                                        onClick={(e) => handleDownload(e, mainTab === 'edited' ? (photo.editedUrl || photo.url) : photo.url)}
                                        className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                     {!isLocked && (
                                       <button 
                                            onClick={() => togglePhotoSelection(photo.id)}
                                            className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${
                                                isSelected 
                                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                                                : 'bg-slate-900 text-white hover:bg-black shadow-lg'
                                            }`}
                                       >
                                           {isSelected ? <><Check className="w-4 h-4" /> Selected</> : 'Select Photo'}
                                       </button>
                                   )}
                                </div>
                            </div>
                       </div>
                   )
               })}
           </div>
       )}
       
       {filteredPhotos.length === 0 && (
           <div className="py-20 flex flex-col items-center justify-center text-slate-400">
               <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-sm font-bold uppercase tracking-widest">No photos found</p>
           </div>
       )}

       {/* Rename Modal */}
       {editPersonName && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
               <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
                   <h3 className="font-bold text-slate-900">Rename Person</h3>
                   <input 
                    type="text" 
                    className="w-full p-3 bg-slate-50 border rounded-xl outline-none" 
                    value={editPersonName.new} 
                    onChange={e => setEditPersonName({...editPersonName, new: e.target.value})}
                   />
                   <div className="flex gap-2">
                       <button onClick={() => setEditPersonName(null)} className="flex-1 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold">Cancel</button>
                       <button onClick={handleRenamePerson} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Save</button>
                   </div>
               </div>
           </div>
       )}

       {/* People Filter Modal */}
       {isPeopleModalOpen && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                       <div>
                           <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">People Detected</h3>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{sortedPeople.length} Unique Faces Found</p>
                       </div>
                       <button onClick={() => setIsPeopleModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                           <X className="w-6 h-6" />
                       </button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                           {sortedPeople.map(person => {
                               const count = eventPhotos.filter(p => p.people.includes(person)).length;
                               const isSelected = selectedFilters.people.includes(person);
                               return (
                                   <div 
                                       key={person}
                                       onClick={() => toggleFilter('people', person)}
                                       className={`bg-white p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 hover:shadow-md ${
                                           isSelected ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-100 hover:border-indigo-200'
                                       }`}
                                   >
                                       <img src={peopleThumbnails[person] || `https://ui-avatars.com/api/?name=${person}`} className="w-10 h-10 rounded-xl object-cover border border-slate-100" alt="" />
                                       <div className="min-w-0">
                                           <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-600' : 'text-slate-700'}`}>{person}</p>
                                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{count} Photos</p>
                                       </div>
                                       {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-auto shrink-0" />}
                                   </div>
                               );
                           })}
                       </div>
                   </div>
                   <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                       <button onClick={() => setIsPeopleModalOpen(false)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black">
                           Done
                       </button>
                   </div>
               </div>
           </div>
       )}

       {/* Status Modal */}
       {isStatusModalOpen && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-6 shadow-2xl">
                   <div className="flex justify-between items-center">
                       <h3 className="font-bold text-slate-900 text-lg">Update Project Workflow</h3>
                       <button onClick={() => setIsStatusModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                   </div>
                   
                   <div className="space-y-4">
                       <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Stage</label>
                           <select 
                            className="w-full p-3 bg-slate-50 border rounded-xl outline-none text-sm font-bold"
                            value={workflowStatus}
                            onChange={(e) => setWorkflowStatus(e.target.value as SelectionStatus)}
                           >
                               <option value="open">Selection Open</option>
                               <option value="submitted">Selection Submitted</option>
                               <option value="editing">Editing in Progress</option>
                               <option value="review">Client Review</option>
                               <option value="accepted">Project Closed</option>
                           </select>
                       </div>
                       
                       <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estimated Delivery</label>
                           <input 
                            type="date" 
                            className="w-full p-3 bg-slate-50 border rounded-xl outline-none text-sm font-bold"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                           />
                       </div>
                   </div>

                   <button onClick={handleWorkflowUpdate} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">
                       Update Status
                   </button>
               </div>
           </div>
       )}

    </div>
  );
};

export default GalleryView;
