
import React, { useState } from 'react';
import { ChevronDown, Check, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';

const EventSwitcher: React.FC = () => {
  const { events, currentUser, activeEvent, setActiveEvent } = useData();
  const [isOpen, setIsOpen] = useState(false);

  const myEvents = events.filter(e => e.assignedUsers.includes(currentUser?.id || ''));

  if (!activeEvent || myEvents.length <= 1) return null;

  return (
    <div className="relative px-3 mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-2 bg-[#1F2937] hover:bg-[#374151] rounded-xl transition-all border border-gray-700/50 group"
      >
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-600 shrink-0">
          <img src={activeEvent.coverImage} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[11px] font-bold text-white truncate">{activeEvent.name}</p>
          <p className="text-[9px] text-gray-500 font-medium truncate">{activeEvent.photoCount} photos</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-3 right-3 mt-2 bg-[#1F2937] border border-gray-700 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
            <p className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your Projects</p>
            <div className="max-h-60 overflow-y-auto no-scrollbar">
              {myEvents.map(event => (
                <button
                  key={event.id}
                  onClick={() => {
                    setActiveEvent(event);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#374151] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-700 group-hover:border-gray-500 transition-colors">
                    <img src={event.coverImage} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-[11px] font-bold truncate ${activeEvent.id === event.id ? 'text-[#10B981]' : 'text-gray-300'}`}>
                      {event.name}
                    </p>
                    <p className="text-[9px] text-gray-500 truncate">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                  {activeEvent.id === event.id && <Check className="w-3.5 h-3.5 text-[#10B981]" />}
                </button>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700 px-4">
              <button 
                onClick={() => setActiveEvent(null)}
                className="w-full text-left text-[10px] font-bold text-[#10B981] hover:underline"
              >
                View all projects
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventSwitcher;
