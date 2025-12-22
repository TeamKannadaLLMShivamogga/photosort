
import React from 'react';
import { useData } from '../../context/DataContext';
import { Clock, Image as ImageIcon, Wallet, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import EventSelector from './EventSelector';

interface UserDashboardProps {
  onNavigate: (view: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { activeEvent, photos } = useData();

  // If no event selected, show selector immediately
  if (!activeEvent) {
      return <EventSelector />;
  }

  const eventPhotos = photos.filter(p => p.eventId === activeEvent.id);

  const subEventStats = activeEvent.subEvents.map(se => ({
    name: se.name,
    count: eventPhotos.filter(p => (p.subEventId === se.id) || (p.category === se.name)).length
  }));

  const totalPaid = activeEvent.paidAmount || 0;
  const balance = (activeEvent.price || 0) - totalPaid;

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'open': return 'bg-blue-50 text-blue-700 border-blue-100';
          case 'submitted': return 'bg-amber-50 text-amber-700 border-amber-100';
          case 'editing': return 'bg-purple-50 text-purple-700 border-purple-100';
          case 'review': return 'bg-pink-50 text-pink-700 border-pink-100';
          case 'accepted': return 'bg-green-50 text-green-700 border-green-100';
          default: return 'bg-slate-50 text-slate-700';
      }
  };

  const selectedCount = eventPhotos.filter(p => p.isSelected).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{activeEvent.name}</h1>
           <div className="flex gap-2 mt-2">
               <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(activeEvent.selectionStatus)}`}>
                   Status: {activeEvent.selectionStatus}
               </span>
               <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                   {new Date(activeEvent.date).toLocaleDateString()}
               </span>
           </div>
        </div>
        
        <div className="flex gap-3">
             {/* Allow switching even from dashboard */}
             <button 
                onClick={() => window.location.reload()} // Quick hack to reset state or could use setActiveEvent(null)
                className="px-4 py-3 bg-white text-slate-500 border border-slate-200 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
             >
                 Switch Event
             </button>
             {activeEvent.selectionStatus === 'open' && (
                <button 
                    onClick={() => onNavigate('gallery')}
                    className="px-6 py-3 bg-[#10B981] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#10B981]/20 hover:bg-[#059669] transition-all active:scale-95 flex items-center gap-2"
                >
                    Select Photos <ArrowRight className="w-4 h-4" />
                </button>
             )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Photos</p>
                  <p className="text-2xl font-black text-slate-900">{activeEvent.photoCount}</p>
              </div>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected</p>
                  <p className="text-2xl font-black text-slate-900">{selectedCount}</p>
              </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6" />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline</p>
                  <p className="text-xl font-black text-slate-900">{activeEvent.timeline?.selectionDeadline ? new Date(activeEvent.timeline.selectionDeadline).toLocaleDateString() : 'TBD'}</p>
              </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance</p>
                  <p className="text-2xl font-black text-slate-900">₹{balance.toLocaleString()}</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 text-lg">Event Coverage</h3>
              <div className="space-y-4">
                  {subEventStats.map((stat, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="font-bold text-slate-700 text-sm">{stat.name}</span>
                          <span className="font-black text-slate-900">{stat.count} Photos</span>
                      </div>
                  ))}
                  {subEventStats.length === 0 && <p className="text-slate-400 text-sm">No sub-events defined.</p>}
              </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col justify-between relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                       <AlertCircle className="w-6 h-6 text-white" />
                   </div>
                   <div>
                       <h3 className="text-xl font-black uppercase tracking-tight">Need Help?</h3>
                       <p className="text-slate-400 text-sm font-medium mt-1">Contact your photographer for any queries regarding selection or payments.</p>
                   </div>
                   <button className="py-3 px-6 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-colors">
                       Contact Studio
                   </button>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>
      </div>
    </div>
  );
};

export default UserDashboard;
