
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  Plus, Calendar, Search, ArrowRight, MoreVertical, X, 
  Image as ImageIcon, Filter, LayoutGrid, List, ChevronRight, Mail, Phone
} from 'lucide-react';

interface EventsListProps {
  onNavigate?: (view: string) => void;
}

const PhotographerEventsList: React.FC<EventsListProps> = ({ onNavigate }) => {
  const { events, currentUser, setActiveEvent, addEvent } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewType, setViewType] = useState<'card' | 'list'>('card');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [newEvent, setNewEvent] = useState({ 
    name: '', 
    startDate: '', 
    endDate: '', 
    price: 0,
    clientEmail: '',
    clientPhone: '',
    coverImage: 'https://picsum.photos/seed/wedding1/800/400'
  });

  const myEvents = events
    .filter(e => e.photographerId === currentUser?.id)
    .filter(e => statusFilter === 'all' || e.status === statusFilter)
    .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(e => !fromDate || new Date(e.date) >= new Date(fromDate))
    .filter(e => !toDate || new Date(e.date) <= new Date(toDate));

  const handleCreate = () => {
    if (!newEvent.name || !newEvent.startDate || !newEvent.clientEmail) {
      alert("Please fill in the event name, start date, and client email.");
      return;
    }
    addEvent({ ...newEvent, date: newEvent.startDate, photographerId: currentUser?.id });
    setIsModalOpen(false);
    setNewEvent({ name: '', startDate: '', endDate: '', price: 0, clientEmail: '', clientPhone: '', coverImage: 'https://picsum.photos/seed/wedding1/800/400' });
  };

  const handleEventClick = (event: any) => {
    setActiveEvent(event);
    if (onNavigate) onNavigate('event-settings');
  };

  const coverOptions = [
    'https://picsum.photos/seed/wedding1/800/400',
    'https://picsum.photos/seed/wedding2/800/400',
    'https://picsum.photos/seed/wedding3/800/400',
    'https://picsum.photos/seed/baby/800/400',
    'https://picsum.photos/seed/party/800/400',
    'https://picsum.photos/seed/corp/800/400',
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">All Events</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white font-bold rounded-xl shadow-md shadow-[#10B981]/10 hover:bg-[#059669] transition-all text-sm"
        >
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {/* Optimized Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] focus:ring-2 focus:ring-[#10B981]/10 outline-none font-medium"
          />
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-1.5">
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold text-slate-600 outline-none w-[100px] cursor-pointer"
            />
            <span className="text-slate-300 text-[10px]">—</span>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold text-slate-600 outline-none w-[100px] cursor-pointer"
            />
          </div>
          {(fromDate || toDate) && (
            <button 
              onClick={() => { setFromDate(''); setToDate(''); }}
              className="p-1 hover:bg-white rounded-md transition-colors"
            >
              <X className="w-3 h-3 text-red-400" />
            </button>
          )}
        </div>

        {/* Status */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg">
          {['all', 'active', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${
                statusFilter === status 
                  ? 'bg-white shadow-sm text-[#10B981]' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg">
          <button 
            onClick={() => setViewType('card')} 
            className={`p-1.5 rounded-md transition-all ${viewType === 'card' ? 'bg-white shadow-sm text-[#10B981]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setViewType('list')} 
            className={`p-1.5 rounded-md transition-all ${viewType === 'list' ? 'bg-white shadow-sm text-[#10B981]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {viewType === 'card' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {myEvents.map(event => {
            const balancePercent = event.price ? Math.round(((event.price - (event.paidAmount || 0)) / event.price) * 100) : 0;
            return (
              <div 
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col cursor-pointer hover:border-[#10B981]/50"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={event.coverImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                  <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[7px] font-bold uppercase tracking-wider shadow-md ${
                    event.status === 'active' ? 'bg-[#10B981] text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {event.status}
                  </div>
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-white/90 backdrop-blur rounded-lg text-[7px] font-black text-amber-600 uppercase shadow-sm">
                    {balancePercent}% BAL
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#10B981] transition-colors">{event.name}</h3>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {new Date(event.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><ImageIcon className="w-2.5 h-2.5" /> {event.photoCount}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${balancePercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Photos</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Balance %</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myEvents.map(event => {
                const balancePercent = event.price ? Math.round(((event.price - (event.paidAmount || 0)) / event.price) * 100) : 0;
                return (
                  <tr 
                    key={event.id} 
                    onClick={() => handleEventClick(event)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <img src={event.coverImage} className="w-8 h-8 rounded-lg object-cover" alt="" />
                        <span className="text-[11px] font-bold text-slate-800">{event.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-[10px] text-slate-500">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-[10px] text-slate-500 text-center">{event.photoCount}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                         <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-amber-500" style={{ width: `${balancePercent}%` }} />
                         </div>
                         <span className="text-[8px] font-black text-amber-600">{balancePercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                        event.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Create New Event</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto no-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Name *</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                  placeholder="e.g., Smith Wedding"
                  value={newEvent.name}
                  onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Mail className="w-3 h-3" /> Client Email *</label>
                  <input 
                    type="email" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                    placeholder="client@example.com"
                    value={newEvent.clientEmail}
                    onChange={e => setNewEvent({...newEvent, clientEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Phone className="w-3 h-3" /> Client Phone</label>
                  <input 
                    type="tel" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                    placeholder="+91 9876543210"
                    value={newEvent.clientPhone}
                    onChange={e => setNewEvent({...newEvent, clientPhone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date *</label>
                  <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={newEvent.startDate} onChange={e => setNewEvent({...newEvent, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Date</label>
                  <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={newEvent.endDate} onChange={e => setNewEvent({...newEvent, endDate: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount (₹)</label>
                <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={newEvent.price} onChange={e => setNewEvent({...newEvent, price: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cover Image</label>
                <div className="grid grid-cols-3 gap-2">
                  {coverOptions.map((opt, i) => (
                    <button key={i} onClick={() => setNewEvent({...newEvent, coverImage: opt})} className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${newEvent.coverImage === opt ? 'border-[#10B981]' : 'border-transparent opacity-60'}`}>
                      <img src={opt} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:text-slate-800">Cancel</button>
              <button onClick={handleCreate} className="flex-1 py-3 bg-[#10B981] text-white rounded-xl font-bold">Create Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotographerEventsList;
