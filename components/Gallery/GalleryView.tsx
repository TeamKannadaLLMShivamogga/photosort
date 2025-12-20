
import React, { useState, useMemo } from 'react';
import { 
  Grid2X2, Sparkles, User, Calendar, Tag, Check, Filter, 
  X, ChevronRight, Star, CheckCircle2, Image as ImageIcon, RotateCcw
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Photo } from '../../types';

type TabType = 'all' | 'ai' | 'people' | 'ceremony' | 'activity';

const GalleryView: React.FC = () => {
  const { photos, activeEvent, selectedPhotos, togglePhotoSelection, submitSelections } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedFilters, setSelectedFilters] = useState<{
    people: string[];
    ceremony: string[];
    activity: string[];
  }>({
    people: [],
    ceremony: [],
    activity: []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const eventPhotos = useMemo(() => 
    photos.filter(p => p.eventId === activeEvent?.id),
    [photos, activeEvent]
  );

  const filterOptions = useMemo(() => ({
    people: Array.from(new Set(eventPhotos.flatMap(p => p.people))),
    ceremony: activeEvent?.subEvents.map(s => s.name) || [],
    activity: Array.from(new Set(eventPhotos.map(p => p.category)))
  }), [eventPhotos, activeEvent]);

  // Map people to a thumbnail (just using first photo they appear in for mock)
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
    if (activeTab === 'ai') result = result.filter(p => p.isAiPick);
    
    if (selectedFilters.people.length > 0) {
      result = result.filter(p => p.people.some(person => selectedFilters.people.includes(person)));
    }
    if (selectedFilters.ceremony.length > 0) {
      result = result.filter(p => activeEvent?.subEvents.find(s => s.name === p.category && selectedFilters.ceremony.includes(s.name)));
    }
    if (selectedFilters.activity.length > 0) {
      result = result.filter(p => selectedFilters.activity.includes(p.category));
    }

    return result;
  }, [eventPhotos, activeTab, selectedFilters, activeEvent]);

  const toggleFilter = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const tabs: {id: TabType, label: string, icon: any}[] = [
    { id: 'all', label: 'All Photos', icon: Grid2X2 },
    { id: 'ai', label: 'AI Picks', icon: Sparkles },
    { id: 'people', label: 'People', icon: User },
    { id: 'ceremony', label: 'Ceremony', icon: Calendar },
    { id: 'activity', label: 'Activity', icon: Tag },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Density Optimized Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-1.5 flex flex-col gap-1.5 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Gallery
            <span className="text-[10px] font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              {filteredPhotos.length} items
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs - Space efficient */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Improved Filter Chips with Thumbnails */}
        {activeTab !== 'all' && activeTab !== 'ai' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 border-t border-slate-50 mt-0.5">
            {filterOptions[activeTab as keyof typeof filterOptions].slice(0, 8).map(val => (
              <button
                key={val}
                onClick={() => toggleFilter(activeTab as keyof typeof selectedFilters, val)}
                className={`flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full text-[10px] transition-all border ${
                  selectedFilters[activeTab as keyof typeof selectedFilters].includes(val)
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 shadow-sm'
                }`}
              >
                {activeTab === 'people' ? (
                  <img 
                    src={peopleThumbnails[val]} 
                    className="w-5 h-5 rounded-full object-cover border border-white shadow-sm"
                    alt=""
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-[7px] font-bold text-slate-400 uppercase border border-slate-100">
                    {val.charAt(0)}
                  </div>
                )}
                <span className="truncate max-w-[80px]">{val}</span>
                {selectedFilters[activeTab as keyof typeof selectedFilters].includes(val) && <X className="w-2.5 h-2.5" />}
              </button>
            ))}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] text-indigo-600 font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap border border-transparent"
            >
              View All <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* High Density Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1.5">
            {filteredPhotos.map(photo => (
              <div 
                key={photo.id}
                onClick={() => togglePhotoSelection(photo.id)}
                className={`relative aspect-square rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 ${
                  selectedPhotos.has(photo.id) ? 'ring-4 ring-indigo-500 ring-offset-1 shadow-2xl' : ''
                }`}
              >
                <img 
                  src={photo.url} 
                  className={`w-full h-full object-cover transition-transform duration-500 ${selectedPhotos.has(photo.id) ? 'scale-90 opacity-80' : 'group-hover:scale-105'}`} 
                  alt="" 
                  loading="lazy"
                />
                
                {photo.isAiPick && (
                  <div className="absolute top-1.5 left-1.5 p-0.5 bg-indigo-600/80 text-white rounded shadow-sm backdrop-blur-sm">
                    <Star className="w-2.5 h-2.5 fill-current" />
                  </div>
                )}

                <div className={`absolute top-1.5 right-1.5 p-1 rounded-full transition-all duration-300 ${
                  selectedPhotos.has(photo.id) ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-black/20 text-white opacity-0 group-hover:opacity-100'
                }`}>
                  <Check className="w-3 h-3" />
                </div>

                {selectedPhotos.has(photo.id) && (
                  <div className="absolute inset-0 bg-indigo-600/10 pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
            <ImageIcon className="w-8 h-8 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No matching items</p>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      {selectedPhotos.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-900 text-white rounded-3xl shadow-2xl flex items-center gap-8 z-40 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="flex flex-col border-r border-slate-700 pr-8">
            <span className="text-[12px] font-black tracking-tight">{selectedPhotos.size} PHOTOS</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">In Selection</span>
          </div>
          <button 
            onClick={() => submitSelections()}
            className="flex items-center gap-2 px-6 py-2 bg-[#10B981] hover:bg-[#059669] rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#10B981]/20 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" /> Submit for Editing
          </button>
        </div>
      )}

      {/* Filter Selection Modal - Enhanced */}
      {isModalOpen && (activeTab === 'people' || activeTab === 'activity') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  {activeTab === 'people' ? <User className="w-5 h-5 text-indigo-600" /> : <Tag className="w-5 h-5 text-emerald-600" />}
                  Select {activeTab}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Multi-select available</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto no-scrollbar flex-1 bg-slate-50/50">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filterOptions[activeTab as keyof typeof filterOptions].map(val => {
                  const isSelected = selectedFilters[activeTab as keyof typeof selectedFilters].includes(val);
                  return (
                    <button
                      key={val}
                      onClick={() => toggleFilter(activeTab as keyof typeof selectedFilters, val)}
                      className={`relative flex flex-col items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                        isSelected 
                          ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100' 
                          : 'bg-white border-transparent hover:border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="relative">
                        {activeTab === 'people' ? (
                          <img 
                            src={peopleThumbnails[val]} 
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                            alt=""
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400 border-2 border-white shadow-md">
                            {val.charAt(0)}
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm scale-110 animate-in zoom-in duration-200">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <span className={`text-[11px] font-bold text-center truncate w-full ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>
                        {val}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => setSelectedFilters(prev => ({...prev, [activeTab]: []}))}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100 shadow-sm active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryView;
