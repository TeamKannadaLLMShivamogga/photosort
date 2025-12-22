
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  Plus, Calendar, Search, LayoutGrid, List, Eye, MapPin, Image as ImageIcon
} from 'lucide-react';
import CreateEventModal from '../../components/CreateEventModal';

interface EventsListProps {
  onNavigate?: (view: string) => void;
}

const PhotographerEventsList: React.FC<EventsListProps> = ({ onNavigate }) => {
  const { events, currentUser, setActiveEvent } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewType, setViewType] = useState<'card' | 'list'>('card');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const myEvents = events
    .filter(e => e.photographerId === currentUser?.id)
    .filter(e => statusFilter === 'all' || e.status === statusFilter)
    .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(e => !fromDate || new Date(e.date) >= new Date(fromDate))
    .filter(e => !toDate || new Date(e.date) <= new Date(toDate));

  const handleEventClick = (event: any) => {
    setActiveEvent(event);
    if (onNavigate) onNavigate('event-settings');
  };

  const getAlertCount = (event: any) => {
      let count = 0;
      if (event.selectionStatus === 'submitted') count++;
      if (event.addonRequests) {
          count += event.addonRequests.filter((r: any) => r.status === 'pending').length;
      }
      return count;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Project Portfolio</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Manage all your photography events and client deliveries</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#10B981] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#10B981]/20 hover:bg-[#059669] transition-all text-[11px] active:scale-95"
        >
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-2.5 px-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-56 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] focus:ring-4 focus:ring-[#10B981]/5 outline-none font-bold text-slate-900 transition-all"
          />
        </div>
        <div className="flex items-center gap-1">
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-bold text-slate-900 outline-none w-28" />
          <span className="text-slate-300 text-[10px] font-bold">~</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-bold text-slate-900 outline-none w-28" />
        </div>
        <div className="flex bg-slate-50 p-0.5 rounded-xl ml-auto">
          <button onClick={() => setViewType('card')} className={`p-1.5 rounded-lg transition-all ${viewType === 'card' ? 'bg-white shadow-sm text-[#10B981]' : 'text-slate-400'}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setViewType('list')} className={`p-1.5 rounded-lg transition-all ${viewType === 'list' ? 'bg-white shadow-sm text-[#10B981]' : 'text-slate-400'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {myEvents.length > 0 ? (
        viewType === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {myEvents.map(event => {
                const alertCount = getAlertCount(event);
                return (
                  <div 
                    key={event.id} 
                    onClick={() => handleEventClick(event)} 
                    className={`group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border flex flex-col cursor-pointer animate-in fade-in zoom-in-95 duration-300 relative ${alertCount > 0 ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-100'}`}
                  >
                    {alertCount > 0 && (
                        <div className="absolute top-4 left-4 z-20">
                            <span className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg border-2 border-white animate-bounce">
                                {alertCount}
                            </span>
                        </div>
                    )}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={event.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${event.status === 'active' ? 'bg-[#10B981]/90 text-white' : 'bg-slate-900/90 text-white'}`}>
                        {event.status}
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{event.name}</h3>
                        <div className="flex flex-col gap-1 mt-1.5">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}
                            </p>
                            {event.location && (
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 truncate">
                                    <MapPin className="w-3 h-3" /> {event.location}
                                </p>
                            )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-black uppercase tracking-widest">{event.plan || 'BASIC'}</span>
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-900"><ImageIcon className="w-3 h-3 text-slate-300" />{event.photoCount}</div>
                      </div>
                    </div>
                  </div>
                );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Revenue</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myEvents.map(event => (
                  <tr key={event.id} onClick={() => handleEventClick(event)} className="hover:bg-slate-50/50 cursor-pointer">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img src={event.coverImage} className="w-10 h-10 rounded-xl object-cover" alt="" />
                        <div>
                          <p className="font-black text-sm text-slate-900">{event.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                        <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${event.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{event.status}</span>
                    </td>
                    <td className="p-6 text-center text-xs font-bold">₹{event.price?.toLocaleString()}</td>
                    <td className="p-6 text-right"><Eye className="w-5 h-5 text-slate-400" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-20 text-slate-400">No events found.</div>
      )}

      {/* Shared Create Event Modal */}
      <CreateEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default PhotographerEventsList;
