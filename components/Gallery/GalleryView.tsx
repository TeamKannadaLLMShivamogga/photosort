
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Grid2X2, Sparkles, User, Calendar, Tag, Check, Filter, 
  X, ChevronRight, Star, CheckCircle2, Image as ImageIcon, RotateCcw, Trash2, Edit2, UploadCloud, Lock, Unlock, AlertCircle, Download, Clock, Send
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Photo, SelectionStatus } from '../../types';

type MainTabType = 'all' | 'selected' | 'edited';
type SubTabType = 'grid' | 'ai' | 'people' | 'events' | 'tags';

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

  const [selectedFilters, setSelectedFilters] = useState<{
    people: string[];
    events: string[];
    tags: string[];
  }>({
    people: [],
    events: [],
    tags: []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPersonName, setEditPersonName] = useState<{old: string, new: string} | null>(null);
  
  // Status Update Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
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
                const subEvent = activeEvent?.subEvents.find(s => selectedFilters.events.includes(s.name));
                return (p.subEventId && subEvent && p.subEventId === subEvent.id) || (p.category && selectedFilters.events.includes(p.category));
            });
        }
        if (selectedFilters.tags.length > 0) {
            result = result.filter(p => selectedFilters.tags.includes(p.category));
        }
    }

    return result;
  }, [eventPhotos, mainTab, subTab, selectedFilters, activeEvent]);

  const toggleFilter = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const handleRenamePerson = async () => {
      if (editPersonName && activeEvent) {
          await renamePersonInEvent(activeEvent.id, editPersonName.old, editPersonName.new);
          setEditPersonName(null);
      }
  };

  const handleUpdateStatus = async () => {
      if (activeEvent) {
          await updateEventWorkflow(activeEvent.id, workflowStatus, deliveryDate ? new Date(deliveryDate).toISOString() : undefined);
          setIsStatusModalOpen(false);
      }
  };

  const handleDownloadAll = () => {
      if (filteredPhotos.length === 0) return;
      alert(`Starting download for ${filteredPhotos.length} photos... (Demo Only)`);
      // In a real app, this would trigger a ZIP generation on backend or multi-file download
  };

  const mainTabs = [
      { id: 'all', label: 'All Photos', icon: Grid2X2 },
      { id: 'selected', label: 'Selected', icon: CheckCircle2, count: eventPhotos.filter(p => p.isSelected).length },
      { id: 'edited', label: 'Edited', icon: Edit2, count: eventPhotos.filter(p => p.editedUrl).length }
  ];

  const subTabs = [
      { id: 'grid', label: 'Grid', icon: Grid2X2 },
      { id: 'ai', label: 'AI Picks', icon: Sparkles },
      { id: 'people', label: 'People', icon: User },
      { id: 'events', label: 'Events', icon: Calendar }, 
      { id: 'tags', label: 'Tags', icon: Tag },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-300">
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex flex-col gap-3 sticky top-0 z-20 shadow-sm">
        {/* Main Tab Bar */}
        <div className="flex items-center justify-between">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {mainTabs.map(tab => {
              // Hide selected/edited tabs for Users if empty to reduce clutter, or keep them
              if (!isPhotographer && tab.id === 'edited' && tab.count === 0) return null;
              
              const isActive = mainTab === tab.id;
              return (
                <button
                    key={tab.id}
                    onClick={() => setMainTab(tab.id as MainTabType)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                        isActive 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.count !== undefined && <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>{tab.count}</span>}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Photographer Actions for Edited Tab */}
            {isPhotographer && mainTab === 'edited' && (
                <div className="flex items-center gap-2 mr-2">
                    {activeEvent?.selectionStatus !== 'open' && (
                        <button 
                            onClick={() => {
                                if(confirm('Unlock selection for client? This will change status to OPEN.')) {
                                    updateEventWorkflow(activeEvent!.id, 'open');
                                }
                            }}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                            title="Unlock Selection"
                        >
                            <Unlock className="w-4 h-4" />
                        </button>
                    )}
                    <button 
                        onClick={() => setIsStatusModalOpen(true)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                        title="Update Status & Delivery"
                    >
                        <Clock className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handleDownloadAll}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                        title="Download All Edited"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Upload Buttons */}
            {isPhotographer && mainTab === 'all' && onUploadClick && (
                <button 
                    onClick={onUploadClick}
                    className="flex items-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all whitespace-nowrap"
                >
                    <UploadCloud className="w-4 h-4" /> <span className="hidden sm:inline">Upload Raw</span>
                </button>
            )}
            {isPhotographer && mainTab === 'edited' && onUploadEditsClick && (
                <button 
                    onClick={onUploadEditsClick}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all whitespace-nowrap"
                >
                    <UploadCloud className="w-4 h-4" /> <span className="hidden sm:inline">Upload Edits</span>
                </button>
            )}
          </div>
        </div>

        {/* Sub Tabs (Only for All Photos) */}
        {mainTab === 'all' && (
            <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {subTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id as SubTabType)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                                subTab === tab.id
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <tab.icon className="w-3 h-3" /> {tab.label}
                        </button>
                    ))}
                </div>
                
                {/* Specific Filters for People/Events/Tags */}
                {['people', 'events', 'tags'].includes(subTab) && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar ml-4 flex-1 justify-end">
                        {filterOptions[subTab as keyof typeof filterOptions].slice(0, 5).map(val => (
                            <div key={val} className="relative group/chip">
                                <button
                                    onClick={() => toggleFilter(subTab as keyof typeof selectedFilters, val)}
                                    className={`flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full text-[10px] transition-all border whitespace-nowrap shrink-0 ${
                                    selectedFilters[subTab as keyof typeof selectedFilters].includes(val)
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                                        : 'bg-white border-slate-100 text-slate-600 shadow-sm'
                                    }`}
                                >
                                    {subTab === 'people' ? (
                                    <img 
                                        src={peopleThumbnails[val]} 
                                        className="w-5 h-5 rounded-full object-cover border border-white"
                                        alt=""
                                    />
                                    ) : (
                                    <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-[7px] font-bold text-slate-400 border border-slate-100">
                                        {val.charAt(0)}
                                    </div>
                                    )}
                                    <span>{val}</span>
                                    {selectedFilters[subTab as keyof typeof selectedFilters].includes(val) && <X className="w-2.5 h-2.5" />}
                                </button>
                                {/* Face Edit Button */}
                                {!isPhotographer && subTab === 'people' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setEditPersonName({ old: val, new: val }); }}
                                        className="absolute -top-1 -right-1 bg-white text-slate-500 hover:text-indigo-600 p-1 rounded-full shadow-md border border-slate-100 opacity-0 group-hover/chip:opacity-100 transition-opacity"
                                    >
                                        <Edit2 className="w-2 h-2" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] text-indigo-600 font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap"
                        >
                            View All <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                    </div>
                )}
                
                {/* Count Badge */}
                {['grid', 'ai'].includes(subTab) && (
                    <div className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        {filteredPhotos.length} Photos
                    </div>
                )}
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        {filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1.5">
            {filteredPhotos.map(photo => (
              <div 
                key={photo.id}
                onClick={() => togglePhotoSelection(photo.id)}
                className={`relative aspect-square rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 ${
                  selectedPhotos.has(photo.id) ? 'ring-4 ring-indigo-500 ring-offset-1 shadow-2xl z-10 scale-[0.98]' : 'hover:scale-[1.02]'
                }`}
              >
                <img 
                  src={mainTab === 'edited' && photo.editedUrl ? photo.editedUrl : photo.url} 
                  className={`w-full h-full object-cover transition-transform duration-500 ${selectedPhotos.has(photo.id) ? 'opacity-80' : ''}`} 
                  alt="" 
                  loading="lazy"
                />
                
                {/* AI Pick Indicator */}
                {photo.isAiPick && subTab !== 'ai' && (
                  <div className="absolute top-1.5 left-1.5 p-0.5 bg-indigo-600/80 text-white rounded shadow-sm backdrop-blur-sm">
                    <Star className="w-2.5 h-2.5 fill-current" />
                  </div>
                )}

                {/* Selection Checkmark */}
                <div className={`absolute top-1.5 right-1.5 p-1 rounded-full transition-all duration-300 ${
                  selectedPhotos.has(photo.id) ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-black/20 text-white opacity-0 group-hover:opacity-100'
                }`}>
                  <Check className="w-3 h-3" />
                </div>

                {/* Photographer Specific Overlays */}
                {isPhotographer && (
                    <>
                        {/* Selected Tab: Lock Status */}
                        {mainTab === 'selected' && (
                            <div className="absolute bottom-1.5 left-1.5">
                                {activeEvent?.selectionStatus === 'open' ? (
                                    <div className="bg-green-500/90 text-white p-1 rounded-full shadow-lg" title="Unlocked">
                                        <Unlock className="w-3 h-3" />
                                    </div>
                                ) : (
                                    <div className="bg-amber-500/90 text-white p-1 rounded-full shadow-lg" title="Locked">
                                        <Lock className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Edited Tab: Review Status */}
                        {mainTab === 'edited' && (
                            <div className="absolute bottom-1.5 right-1.5">
                                {photo.reviewStatus === 'approved' ? (
                                    <div className="bg-green-500/90 text-white px-2 py-0.5 rounded-full shadow-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Finalised
                                    </div>
                                ) : (
                                    <div className="bg-indigo-500/90 text-white px-2 py-0.5 rounded-full shadow-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <AlertCircle className="w-2.5 h-2.5" /> In Review
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Delete Action (Except in read-only AI tab) */}
                        {subTab !== 'ai' && mainTab !== 'selected' && mainTab !== 'edited' && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (photo.isSelected) return; // Prevent deleting selected photos accidentally
                                    if (confirm("Delete this photo permanently?")) deletePhoto(photo.id);
                                }}
                                className="absolute bottom-1.5 right-1.5 p-1.5 bg-white text-rose-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-rose-50 transition-all z-20 active:scale-90"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
            <ImageIcon className="w-8 h-8 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-center">No matching items</p>
          </div>
        )}
      </div>

      {selectedPhotos.size > 0 && activeEvent?.selectionStatus === 'open' && !isPhotographer && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-3 bg-slate-900 text-white rounded-[1.5rem] sm:rounded-3xl shadow-2xl flex items-center gap-4 sm:gap-8 z-40 animate-in fade-in slide-in-from-bottom-6 duration-300 w-[90%] sm:w-auto justify-between">
          <div className="flex flex-col sm:border-r border-slate-700 sm:pr-8">
            <span className="text-[11px] sm:text-[12px] font-black tracking-tight">{selectedPhotos.size} SELECTED</span>
          </div>
          <button 
            onClick={() => submitSelections()}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-[#10B981] hover:bg-[#059669] rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#10B981]/20 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 hidden xs:block" /> Submit
          </button>
        </div>
      )}

      {/* Filter Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Select {subTab}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto no-scrollbar flex-1 bg-slate-50/50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {filterOptions[subTab as keyof typeof filterOptions].map(val => {
                  const isSelected = selectedFilters[subTab as keyof typeof selectedFilters].includes(val);
                  return (
                    <button
                      key={val}
                      onClick={() => toggleFilter(subTab as keyof typeof selectedFilters, val)}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all bg-white ${
                        isSelected ? 'border-indigo-600 shadow-lg' : 'border-transparent shadow-sm'
                      }`}
                    >
                      <div className="relative">
                        {subTab === 'people' ? (
                          <img src={peopleThumbnails[val]} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm" alt="" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400 border-2 border-white">{val.charAt(0)}</div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-center truncate w-full">{val}</span>
                      {subTab === 'events' && (
                        <span className="text-[9px] font-bold text-slate-400">({subEventCounts[val] || 0})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-95 transition-all">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Name Modal */}
      {editPersonName && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 w-full max-w-sm space-y-6">
                  <h3 className="font-bold text-lg">Rename Person</h3>
                  <input 
                    autoFocus
                    type="text" 
                    className="w-full p-3 border rounded-xl font-bold"
                    value={editPersonName.new}
                    onChange={(e) => setEditPersonName({...editPersonName, new: e.target.value})}
                  />
                  <div className="flex gap-2">
                      <button onClick={() => setEditPersonName(null)} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl text-slate-500">Cancel</button>
                      <button onClick={handleRenamePerson} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl">Save</button>
                  </div>
              </div>
          </div>
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-lg">Update Workflow</h3>
                      <button onClick={() => setIsStatusModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                          <X className="w-5 h-5 text-slate-400" />
                      </button>
                  </div>
                  <div className="p-8 space-y-6">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Phase</label>
                          <select 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                              value={workflowStatus}
                              onChange={(e) => setWorkflowStatus(e.target.value as SelectionStatus)}
                          >
                              <option value="open">Open (Selection)</option>
                              <option value="submitted">Submitted</option>
                              <option value="editing">Editing</option>
                              <option value="review">In Review</option>
                              <option value="accepted">Accepted / Final</option>
                          </select>
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Delivery Date</label>
                          <input 
                              type="date" 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                              value={deliveryDate}
                              onChange={(e) => setDeliveryDate(e.target.value)}
                          />
                      </div>
                  </div>
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                      <button onClick={() => setIsStatusModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100">Cancel</button>
                      <button onClick={handleUpdateStatus} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-lg">Update Status</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default GalleryView;
