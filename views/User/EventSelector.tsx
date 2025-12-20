
import React from 'react';
import { Calendar, Camera, ChevronRight, Search } from 'lucide-react';
import { useData } from '../../context/DataContext';

const EventSelector: React.FC = () => {
  const { events, currentUser, setActiveEvent } = useData();
  const [searchTerm, setSearchTerm] = React.useState('');

  const myEvents = events.filter(e => e.assignedUsers.includes(currentUser?.id || ''));

  const filteredEvents = myEvents.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-8 items-center justify-center">
      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-200">
            <Camera className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800">Welcome, {currentUser?.name}</h1>
          <p className="text-lg text-slate-500">Please select an event to get started</p>
        </div>

        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search events..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <button
              key={event.id}
              onClick={() => setActiveEvent(event)}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 text-left border border-slate-100 flex flex-col transform hover:-translate-y-2"
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img 
                  src={event.coverImage} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={event.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(event.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-xl font-bold leading-tight">{event.name}</h3>
                </div>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">{event.photoCount} Photos</p>
                  <p className="text-xs text-slate-500">Sorted by AI Intelligence</p>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {filteredEvents.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-xl">No events found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSelector;
