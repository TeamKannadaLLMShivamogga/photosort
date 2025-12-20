
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  Plus, Calendar, Search, ArrowRight, MoreVertical, X, 
  Image as ImageIcon, Filter, LayoutGrid, List, ChevronRight, Mail, Phone, Check, CreditCard, Ticket, Sparkles, ShieldCheck, Eye
} from 'lucide-react';
import { EventPlan } from '../../types';

interface EventsListProps {
  onNavigate?: (view: string) => void;
}

const PhotographerEventsList: React.FC<EventsListProps> = ({ onNavigate }) => {
  const { events, currentUser, setActiveEvent, addEvent } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
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
    coverImage: 'https://picsum.photos/seed/wedding1/800/400',
    plan: EventPlan.BASIC,
    serviceFee: 499
  });

  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [finalAmount, setFinalAmount] = useState(499);

  const plans = [
    { id: EventPlan.BASIC, name: 'Basic', price: 499, features: ['Up to 500 photos', 'Standard AI Sorting'], color: 'border-slate-200' },
    { id: EventPlan.STANDARD, name: 'Standard', price: 999, features: ['Up to 2000 photos', 'Advanced AI Search'], color: 'border-indigo-200 bg-indigo-50/30' },
    { id: EventPlan.PRO, name: 'Pro', price: 1499, features: ['Unlimited photos', 'Premium Face Recog'], color: 'border-[#10B981]/30 bg-emerald-50/30' }
  ];

  const myEvents = events
    .filter(e => e.photographerId === currentUser?.id)
    .filter(e => statusFilter === 'all' || e.status === statusFilter)
    .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(e => !fromDate || new Date(e.date) >= new Date(fromDate))
    .filter(e => !toDate || new Date(e.date) <= new Date(toDate));

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'FREE100' || couponCode.toUpperCase() === 'PHOTOSORT') {
      setDiscountApplied(true);
      setFinalAmount(0);
    } else {
      alert('Invalid Coupon Code');
    }
  };

  const handleSelectPlan = (planId: EventPlan, price: number) => {
    setNewEvent({ ...newEvent, plan: planId, serviceFee: price });
    setFinalAmount(price);
    setDiscountApplied(false);
    setCouponCode('');
    setStep(3);
  };

  const handleFinalSubmit = () => {
    addEvent({ 
      ...newEvent, 
      date: newEvent.startDate, 
      photographerId: currentUser?.id,
      paymentStatus: 'paid'
    });
    resetModal();
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setStep(1);
    setDiscountApplied(false);
    setCouponCode('');
    setNewEvent({ 
      name: '', startDate: '', endDate: '', price: 0, clientEmail: '', clientPhone: '', 
      coverImage: 'https://picsum.photos/seed/wedding1/800/400', plan: EventPlan.BASIC, serviceFee: 499 
    });
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

      {/* Advanced Filter Bar - Single Line Optimization */}
      <div className="bg-white p-2.5 px-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search - Reduced width */}
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

        {/* Compact Date Range */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="pl-7 pr-1 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-bold text-slate-900 outline-none w-28"
            />
          </div>
          <span className="text-slate-300 text-[10px] font-bold">~</span>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="pl-7 pr-1 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-bold text-slate-900 outline-none w-28"
            />
          </div>
        </div>

        {/* Status Tabs - Compact */}
        <div className="flex bg-slate-50 p-0.5 rounded-xl">
          {['all', 'active', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                statusFilter === status 
                  ? 'bg-white shadow-sm text-[#10B981]' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex-1 hidden md:block" />

        {/* View Toggles */}
        <div className="flex bg-slate-50 p-0.5 rounded-xl ml-auto">
          <button 
            onClick={() => setViewType('card')} 
            className={`p-1.5 rounded-lg transition-all ${viewType === 'card' ? 'bg-white shadow-sm text-[#10B981]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewType('list')} 
            className={`p-1.5 rounded-lg transition-all ${viewType === 'list' ? 'bg-white shadow-sm text-[#10B981]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {myEvents.length > 0 ? (
        viewType === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {myEvents.map(event => (
              <div 
                key={event.id} 
                onClick={() => handleEventClick(event)} 
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-slate-100 flex flex-col cursor-pointer animate-in fade-in zoom-in-95 duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={event.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${
                    event.status === 'active' ? 'bg-[#10B981]/90 text-white' : 'bg-slate-900/90 text-white'
                  }`}>
                    {event.status}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{event.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-black uppercase tracking-widest">
                        {event.plan || 'BASIC'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-900">
                      <ImageIcon className="w-3 h-3 text-slate-300" />
                      {event.photoCount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Plan</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Photos</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Revenue</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myEvents.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => handleEventClick(event)}>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img src={event.coverImage} className="w-12 h-10 rounded-xl object-cover border-2 border-white shadow-sm" alt="" />
                        <div>
                          <p className="font-black text-slate-900 text-sm tracking-tight">{event.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {event.plan || 'BASIC'}
                      </span>
                    </td>
                    <td className="p-6 text-center text-[11px] font-bold text-slate-600">
                      {event.photoCount.toLocaleString()}
                    </td>
                    <td className="p-6 text-center text-[11px] font-black text-slate-900">
                      ₹{event.price?.toLocaleString()}
                    </td>
                    <td className="p-6 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        event.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {event.status}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
            <ImageIcon className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Matching Events</h4>
            <p className="text-slate-400 max-w-xs mx-auto font-bold text-[10px] uppercase tracking-widest">Try adjusting your filters or create a new project to get started.</p>
          </div>
          <button 
            onClick={() => { setStatusFilter('all'); setSearchQuery(''); setFromDate(''); setToDate(''); }}
            className="text-[#10B981] font-black uppercase text-[10px] tracking-[0.2em] hover:underline"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col my-auto border border-slate-100">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
               <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Workflow Setup</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Deploy a high-performance event gallery</p>
               </div>
               <button onClick={resetModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <div className="p-10 overflow-y-auto no-scrollbar">
              {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Branding Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Kapoor-Sharma Wedding"
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-[#10B981]/5 transition-all" 
                      value={newEvent.name} 
                      onChange={e => setNewEvent({...newEvent, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Notification Email *</label>
                    <input 
                      type="email" 
                      placeholder="client@gmail.com"
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-[#10B981]/5 transition-all" 
                      value={newEvent.clientEmail} 
                      onChange={e => setNewEvent({...newEvent, clientEmail: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Engagement Date</label>
                        <input 
                          type="date" 
                          className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-[#10B981]/5 transition-all" 
                          value={newEvent.startDate} 
                          onChange={e => setNewEvent({...newEvent, startDate: e.target.value})} 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Quote (₹)</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-[#10B981]/5 transition-all" 
                          value={newEvent.price} 
                          onChange={e => setNewEvent({...newEvent, price: parseInt(e.target.value) || 0})} 
                        />
                     </div>
                  </div>
                  <button 
                    disabled={!newEvent.name || !newEvent.startDate} 
                    onClick={() => setStep(2)} 
                    className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.25em] disabled:opacity-20 transition-all shadow-2xl active:scale-95 text-[11px]"
                  >
                    Continue to Plans
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="text-center space-y-2">
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Select Processing Power</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Choose the AI tier for this project</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => handleSelectPlan(p.id, p.price)} 
                        className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all hover:shadow-xl flex flex-col justify-between h-full group ${p.color} ${newEvent.plan === p.id ? 'border-[#10B981] ring-4 ring-[#10B981]/10' : 'hover:border-[#10B981]/40'}`}
                      >
                         <div>
                            <h5 className="font-black text-slate-900 text-[10px] uppercase mb-4 tracking-widest">{p.name}</h5>
                            <p className="text-3xl font-black mb-6">₹{p.price}</p>
                            <ul className="space-y-3">
                              {p.features.map((f, i) => (
                                <li key={i} className="text-[9px] text-slate-500 font-bold flex gap-2">
                                  <Check className="w-3 h-3 text-[#10B981] shrink-0" /> {f}
                                </li>
                              ))}
                            </ul>
                         </div>
                         <button className="mt-8 w-full py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-[#10B981] group-hover:text-white transition-all">Select</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                   <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                               <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TIER SELECTION</p>
                               <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{newEvent.plan} PACKAGE</p>
                            </div>
                         </div>
                         <span className="text-lg font-black text-slate-900">₹{newEvent.serviceFee}</span>
                      </div>
                      <div className="flex gap-3">
                         <input 
                           type="text" 
                           placeholder="COUPON (PHOTOSORT)" 
                           className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-900 uppercase tracking-widest outline-none focus:border-[#10B981]" 
                           value={couponCode} 
                           onChange={e => setCouponCode(e.target.value)} 
                         />
                         <button onClick={handleApplyCoupon} className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Apply</button>
                      </div>
                      <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                         <span className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Payable Amount</span>
                         <span className="text-3xl font-black text-[#10B981]">₹{finalAmount}</span>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <button 
                        onClick={handleFinalSubmit} 
                        className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all text-[11px] flex items-center justify-center gap-3"
                      >
                         <CreditCard className="w-5 h-5" /> Complete Deployment
                      </button>
                      <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                         <ShieldCheck className="w-4 h-4" /> SSL Encrypted Transaction
                      </p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotographerEventsList;
