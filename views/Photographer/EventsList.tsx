
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  Plus, Calendar, Search, ArrowRight, MoreVertical, X, 
  Image as ImageIcon, Filter, LayoutGrid, List, ChevronRight, Mail, Phone, Check, CreditCard, Ticket, Sparkles, ShieldCheck, Eye, Trash2, User, AlertCircle
} from 'lucide-react';
import { EventPlan, Service } from '../../types';

interface EventsListProps {
  onNavigate?: (view: string) => void;
}

const PhotographerEventsList: React.FC<EventsListProps> = ({ onNavigate }) => {
  const { events, currentUser, setActiveEvent, addEvent, users } = useData();
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
    coverImage: 'https://picsum.photos/seed/wedding1/800/400',
    plan: EventPlan.BASIC,
    serviceFee: 499,
    selectedServices: [] as Service[]
  });

  const [clientList, setClientList] = useState<{name: string, email: string, phone: string}[]>([]);
  const [tempClient, setTempClient] = useState({ name: '', email: '', phone: '' });
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [finalAmount, setFinalAmount] = useState(499);

  const availableServices = currentUser?.services?.filter(s => s.type === 'service') || [];

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

  const handleAddClient = () => {
    if (tempClient.name && tempClient.email) {
      setClientList([...clientList, tempClient]);
      setTempClient({ name: '', email: '', phone: '' });
    }
  };

  const removeClient = (index: number) => {
    setClientList(clientList.filter((_, i) => i !== index));
  };

  const toggleService = (service: Service) => {
    const exists = newEvent.selectedServices.find(s => s.id === service.id);
    if (exists) {
      setNewEvent({ ...newEvent, selectedServices: newEvent.selectedServices.filter(s => s.id !== service.id) });
    } else {
      setNewEvent({ ...newEvent, selectedServices: [...newEvent.selectedServices, service] });
    }
  };

  const handleFinalSubmit = () => {
    addEvent({ 
      ...newEvent, 
      date: newEvent.startDate, 
      photographerId: currentUser?.id,
      paymentStatus: 'paid',
      initialClients: clientList,
      clientEmail: clientList.length > 0 ? clientList[0].email : '', 
      clientPhone: clientList.length > 0 ? clientList[0].phone : '', 
    });
    resetModal();
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setStep(1);
    setDiscountApplied(false);
    setCouponCode('');
    setNewEvent({ 
      name: '', startDate: '', endDate: '', price: 0, 
      coverImage: 'https://picsum.photos/seed/wedding1/800/400', plan: EventPlan.BASIC, serviceFee: 499,
      selectedServices: []
    });
    setClientList([]);
    setTempClient({ name: '', email: '', phone: '' });
  };

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
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(event.date).toLocaleDateString()}</p>
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

      {/* Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-auto border border-slate-100 max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
               <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Workflow Setup</h3>
               </div>
               <button onClick={resetModal} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-10 overflow-y-auto no-scrollbar">
              {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Branding Name *</label>
                    <input type="text" placeholder="e.g. Kapoor-Sharma Wedding" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold" value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Access List</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                      <div className="flex gap-2">
                        <input type="text" placeholder="Name" className="flex-1 p-3 bg-white rounded-xl text-xs font-bold outline-none" value={tempClient.name} onChange={e => setTempClient({...tempClient, name: e.target.value})} />
                        <input type="email" placeholder="Email" className="flex-1 p-3 bg-white rounded-xl text-xs font-bold outline-none" value={tempClient.email} onChange={e => setTempClient({...tempClient, email: e.target.value})} />
                        <button onClick={handleAddClient} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black"><Plus className="w-4 h-4" /></button>
                      </div>
                      {clientList.map((c, i) => (
                          <div key={i} className="flex justify-between p-2 bg-white rounded-lg border text-xs font-bold"><span>{c.name}</span><button onClick={() => removeClient(i)} className="text-red-500"><X className="w-3 h-3" /></button></div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Date</label>
                        <input type="date" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" value={newEvent.startDate} onChange={e => setNewEvent({...newEvent, startDate: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Quote (₹)</label>
                        <input type="number" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black" value={newEvent.price} onChange={e => setNewEvent({...newEvent, price: parseInt(e.target.value) || 0})} />
                     </div>
                  </div>
                  
                  {/* Service Selection (User Story 27) */}
                  {availableServices.length > 0 && (
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Included Services</label>
                          <div className="grid grid-cols-2 gap-2">
                              {availableServices.map(service => (
                                  <div 
                                    key={service.id} 
                                    onClick={() => toggleService(service)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all ${newEvent.selectedServices.find(s => s.id === service.id) ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}
                                  >
                                      <p className="text-xs font-bold">{service.name}</p>
                                      <p className="text-[9px]">₹{service.price}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  <button disabled={!newEvent.name || !newEvent.startDate} onClick={() => setStep(2)} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.25em] disabled:opacity-20 transition-all shadow-2xl active:scale-95 text-[11px]">Continue to Plans</button>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(p => (
                      <div key={p.id} onClick={() => handleSelectPlan(p.id, p.price)} className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all hover:shadow-xl flex flex-col justify-between h-full group ${p.color} ${newEvent.plan === p.id ? 'border-[#10B981] ring-4 ring-[#10B981]/10' : 'hover:border-[#10B981]/40'}`}>
                         <div>
                            <h5 className="font-black text-slate-900 text-[10px] uppercase mb-4 tracking-widest">{p.name}</h5>
                            <p className="text-3xl font-black mb-6">₹{p.price}</p>
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
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TIER SELECTION</p>
                               <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{newEvent.plan} PACKAGE</p>
                            </div>
                         </div>
                         <span className="text-lg font-black text-slate-900">₹{newEvent.serviceFee}</span>
                      </div>
                      <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                         <span className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Payable Amount</span>
                         <span className="text-3xl font-black text-[#10B981]">₹{finalAmount}</span>
                      </div>
                   </div>
                   <button onClick={handleFinalSubmit} className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all text-[11px] flex items-center justify-center gap-3"><CreditCard className="w-5 h-5" /> Complete Deployment</button>
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
