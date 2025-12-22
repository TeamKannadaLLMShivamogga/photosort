
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  Calendar, Camera, Clock, Plus, Wallet, AlertCircle
} from 'lucide-react';
import CreateEventModal from '../../components/CreateEventModal';

const PhotographerDashboard: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { events, currentUser, setActiveEvent } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const myEvents = events.filter(e => e.photographerId === currentUser?.id);
  const totalPhotos = myEvents.reduce((acc, e) => acc + e.photoCount, 0);
  const activeEventsCount = myEvents.filter(e => e.status === 'active').length;
  
  const totalMyRevenue = myEvents.reduce((acc, e) => acc + (e.price || 0), 0);
  const totalMyCollected = myEvents.reduce((acc, e) => acc + (e.paidAmount || 0), 0);
  const myCollectionBalance = totalMyRevenue - totalMyCollected;

  const stats = [
    { label: 'Total Events', value: myEvents.length, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Events', value: activeEventsCount, icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Photos', value: totalPhotos.toLocaleString(), icon: Camera, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Balance to Collect', value: `₹${myCollectionBalance.toLocaleString()}`, icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const checkActionRequired = (event: any) => {
      if (event.selectionStatus === 'submitted') return 'Start Editing';
      if (event.selectionStatus === 'editing') return 'Upload Edits';
      return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-[#10B981]/10 text-sm"
        >
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md ${stat.bg === 'bg-amber-50' ? 'bg-slate-900 border-slate-800 ring-2 ring-amber-500/20' : 'bg-white'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${stat.bg === 'bg-amber-50' ? 'text-slate-400' : 'text-slate-400'}`}>{stat.label}</p>
              <p className={`text-xl font-bold leading-none mt-1 ${stat.bg === 'bg-amber-50' ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Recent Events</h2>
          <button onClick={() => onNavigate('events')} className="text-xs font-bold text-[#10B981] hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {myEvents.slice(0, 3).map(event => {
            const balancePercent = event.price ? Math.round(((event.price - (event.paidAmount || 0)) / event.price) * 100) : 0;
            const actionText = checkActionRequired(event);
            const isAlert = !!actionText;

            return (
              <div 
                key={event.id} 
                onClick={() => { setActiveEvent(event); onNavigate('event-settings'); }}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden group hover:shadow-lg transition-all cursor-pointer ${isAlert ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-100'}`}
              >
                {isAlert && (
                    <div className="bg-amber-400 text-white text-[8px] font-black uppercase tracking-widest text-center py-1 flex items-center justify-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {actionText}
                    </div>
                )}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img src={event.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider backdrop-blur-md ${
                    event.status === 'active' ? 'bg-[#10B981]/90 text-white' : 'bg-slate-900/90 text-white'
                  }`}>
                    {event.status}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 backdrop-blur shadow-sm rounded-lg text-[8px] font-black text-amber-600 uppercase">
                    {balancePercent}% BAL
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#10B981] transition-colors">{event.name}</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Camera className="w-3 h-3" /> {event.photoCount}</span>
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
      </div>

      {/* Shared Create Event Modal */}
      <CreateEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default PhotographerDashboard;
