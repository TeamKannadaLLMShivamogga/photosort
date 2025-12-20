
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

  // Map people to a thumbnail
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
    { id: 'all', label: 'All', icon: Grid2X2 },
    { id: 'ai', label: 'AI', icon: Sparkles },
    { id: 'people', label: 'People', icon: User },
    { id: 'ceremony', label: 'Ceremony', icon: Calendar },
    { id: 'activity', label: 'Activity', icon: Tag },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-300">
      <div className="bg-white border-b border-slate-100 px-4 py-1.5 flex flex-col gap-1.5 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Gallery
            <span className="text-[10px] font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              {filteredPhotos.length}
            </span>
          </h2>
        </div>

        {/* Tabs - Space efficient horizontal scroll */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5 -mx-4 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
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
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 border-t border-slate-50 mt-0.5 -mx-4 px-4">
            {filterOptions[activeTab as keyof typeof filterOptions].slice(0, 8).map(val => (
              <button
                key={val}
                onClick={() => toggleFilter(activeTab as keyof typeof selectedFilters, val)}
                className={`flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full text-[10px] transition-all border whitespace-nowrap shrink-0 ${
                  selectedFilters[activeTab as keyof typeof selectedFilters].includes(val)
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                    : 'bg-white border-slate-100 text-slate-600 shadow-sm'
                }`}
              >
                {activeTab === 'people' ? (
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
                {selectedFilters[activeTab as keyof typeof selectedFilters].includes(val) && <X className="w-2.5 h-2.5" />}
              </button>
            ))}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] text-indigo-600 font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap"
            >
              View All <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* Reactive High Density Grid */}
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
                  src={photo.url} 
                  className={`w-full h-full object-cover transition-transform duration-500 ${selectedPhotos.has(photo.id) ? 'opacity-80' : ''}`} 
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

      {/* Floating Action Bar - Optimized for mobile */}
      {selectedPhotos.size > 0 && (
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
                <h3 className="font-bold text-slate-900 text-lg">Select {activeTab}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto no-scrollbar flex-1 bg-slate-50/50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {filterOptions[activeTab as keyof typeof filterOptions].map(val => {
                  const isSelected = selectedFilters[activeTab as keyof typeof selectedFilters].includes(val);
                  return (
                    <button
                      key={val}
                      onClick={() => toggleFilter(activeTab as keyof typeof selectedFilters, val)}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all bg-white ${
                        isSelected ? 'border-indigo-600 shadow-lg' : 'border-transparent shadow-sm'
                      }`}
                    >
                      <div className="relative">
                        {activeTab === 'people' ? (
                          <img src={peopleThumbnails[val]} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm" alt="" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400 border-2 border-white">{val.charAt(0)}</div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-center truncate w-full">{val}</span>
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
    </div>
  );
};

export default GalleryView;
