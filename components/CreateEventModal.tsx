
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  X, Plus, MapPin, Clock, Trash2, Sparkles, CreditCard, 
  Ticket, Check, Calendar, Mail, Phone, Image as ImageIcon, ShieldCheck, User 
} from 'lucide-react';
import { EventPlan, Service, SubEvent } from '../types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, addEvent } = useData();
  const [step, setStep] = useState(1);
  
  // Form State
  const [newEvent, setNewEvent] = useState({ 
    name: '', 
    startDate: '', 
    endDate: '', 
    location: '',
    price: 0,
    coverImage: 'https://picsum.photos/seed/wedding1/800/400',
    plan: EventPlan.BASIC,
    serviceFee: 499,
    selectedServices: [] as Service[],
    subEvents: [] as SubEvent[]
  });

  // UI State
  const [tempSubEvent, setTempSubEvent] = useState({ name: '', date: '', location: '' });
  const [clientList, setClientList] = useState<{name: string, email: string, phone: string}[]>([]);
  const [tempClient, setTempClient] = useState({ name: '', email: '', phone: '' });
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [finalAmount, setFinalAmount] = useState(499);

  // Available Services
  const availableServices = currentUser?.services?.filter(s => s.type === 'service' || s.type === 'addon') || [];

  // Constants
  const plans = [
    { id: EventPlan.BASIC, name: 'Basic', price: 499, features: ['Up to 500 photos', 'Standard AI Sorting'], color: 'border-slate-200' },
    { id: EventPlan.STANDARD, name: 'Standard', price: 999, features: ['Up to 2000 photos', 'Advanced AI Search'], color: 'border-indigo-200 bg-indigo-50/30' },
    { id: EventPlan.PRO, name: 'Pro', price: 1499, features: ['Unlimited photos', 'Premium Face Recog'], color: 'border-[#10B981]/30 bg-emerald-50/30' }
  ];

  const coverOptions = [
    'https://picsum.photos/seed/wedding1/800/400',
    'https://picsum.photos/seed/wedding2/800/400',
    'https://picsum.photos/seed/wedding3/800/400',
    'https://picsum.photos/seed/baby/800/400',
    'https://picsum.photos/seed/party/800/400',
    'https://picsum.photos/seed/corp/800/400',
  ];

  // Effects
  useEffect(() => {
    if (newEvent.location && !tempSubEvent.location) {
        setTempSubEvent(prev => ({ ...prev, location: newEvent.location }));
    }
  }, [newEvent.location]);

  useEffect(() => {
      if (isOpen) {
          // Reset when opening
          setStep(1);
          setNewEvent({ 
            name: '', startDate: '', endDate: '', location: '', price: 0, 
            coverImage: 'https://picsum.photos/seed/wedding1/800/400', plan: EventPlan.BASIC, serviceFee: 499,
            selectedServices: [], subEvents: []
          });
          setClientList([]);
          setDiscountApplied(false);
          setCouponCode('');
          setTempClient({ name: '', email: '', phone: '' });
          setTempSubEvent({ name: '', date: '', location: '' });
      }
  }, [isOpen]);

  // Handlers
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

  const handleAddSubEvent = () => {
      if (tempSubEvent.name && tempSubEvent.date) {
          const newSub: SubEvent = {
              id: `se-${Date.now()}`,
              name: tempSubEvent.name,
              date: tempSubEvent.date,
              location: tempSubEvent.location || newEvent.location
          };
          setNewEvent({ ...newEvent, subEvents: [...newEvent.subEvents, newSub] });
          setTempSubEvent({ name: '', date: '', location: newEvent.location });
      } else {
          alert("Sub-event name and date are required.");
      }
  };

  const toggleService = (service: Service) => {
    const exists = newEvent.selectedServices.find(s => s.id === service.id);
    if (exists) {
      setNewEvent({ ...newEvent, selectedServices: newEvent.selectedServices.filter(s => s.id !== service.id) });
    } else {
      setNewEvent({ ...newEvent, selectedServices: [...newEvent.selectedServices, service] });
    }
  };

  const handleFinalSubmit = async () => {
    if (!newEvent.name || !newEvent.startDate) {
        alert("Please fill in required fields: Event Name and Start Date.");
        return;
    }

    try {
        await addEvent({ 
            ...newEvent, 
            date: newEvent.startDate,
            endDate: newEvent.endDate || undefined,
            location: newEvent.location,
            photographerId: currentUser?.id,
            paymentStatus: 'pending', 
            paidAmount: 0, 
            initialClients: clientList,
            clientEmail: clientList.length > 0 ? clientList[0].email : '', 
            clientPhone: clientList.length > 0 ? clientList[0].phone : '', 
            subEvents: newEvent.subEvents.length > 0 ? newEvent.subEvents : undefined,
            price: Number(newEvent.price)
        });
        onClose();
    } catch (error) {
        console.error("Creation failed", error);
        alert("Failed to create event. Please check details.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-auto border border-slate-100 max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
           <div>
             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Workflow Setup</h3>
             <div className="flex gap-1 mt-2">
                 {[1,2,3].map(i => (
                     <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-[#10B981]' : 'w-4 bg-slate-100'}`} />
                 ))}
             </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        
        <div className="p-10 overflow-y-auto no-scrollbar">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Branding Name *</label>
                <input type="text" placeholder="e.g. Kapoor-Sharma Wedding" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold" value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date *</label>
                    <input type="date" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" value={newEvent.startDate} onChange={e => setNewEvent({...newEvent, startDate: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                    <input type="date" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" value={newEvent.endDate} onChange={e => setNewEvent({...newEvent, endDate: e.target.value})} />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Main Venue Location *</label>
                <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="e.g. Taj Lands End, Mumbai" 
                        className="w-full pl-12 pr-5 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold" 
                        value={newEvent.location} 
                        onChange={e => setNewEvent({...newEvent, location: e.target.value})} 
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Quote (₹)</label>
                <input type="number" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black" value={newEvent.price} onChange={e => setNewEvent({...newEvent, price: parseInt(e.target.value) || 0})} />
              </div>

              {/* Cover Image Picker */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Image</label>
                <div className="grid grid-cols-3 gap-3">
                  {coverOptions.map((opt, i) => (
                    <button key={i} onClick={() => setNewEvent({...newEvent, coverImage: opt})} className={`relative aspect-video rounded-xl overflow-hidden border-4 transition-all ${newEvent.coverImage === opt ? 'border-[#10B981]' : 'border-transparent opacity-60'}`}>
                      <img src={opt} className="w-full h-full object-cover" alt="" />
                      {newEvent.coverImage === opt && <div className="absolute inset-0 bg-[#10B981]/10 flex items-center justify-center"><Check className="text-white bg-[#10B981] rounded-full p-0.5 w-5 h-5 shadow-lg" /></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-Events Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Schedule & Venues</label>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input type="text" placeholder="Name (e.g. Haldi)" className="p-3 bg-white rounded-xl text-xs font-bold outline-none" value={tempSubEvent.name} onChange={e => setTempSubEvent({...tempSubEvent, name: e.target.value})} />
                          <input type="date" className="p-3 bg-white rounded-xl text-xs font-bold outline-none" value={tempSubEvent.date} onChange={e => setTempSubEvent({...tempSubEvent, date: e.target.value})} />
                          <div className="flex gap-2">
                              <input type="text" placeholder="Venue" className="flex-1 p-3 bg-white rounded-xl text-xs font-bold outline-none" value={tempSubEvent.location} onChange={e => setTempSubEvent({...tempSubEvent, location: e.target.value})} />
                              <button onClick={handleAddSubEvent} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black"><Plus className="w-4 h-4" /></button>
                          </div>
                      </div>
                      
                      {newEvent.subEvents.map((sub, i) => (
                          <div key={sub.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-3">
                                  <Clock className="w-4 h-4 text-indigo-500" />
                                  <div>
                                      <p className="text-xs font-bold text-slate-900">{sub.name}</p>
                                      <div className="flex gap-2 text-[10px] text-slate-400 font-bold uppercase">
                                          <span>{new Date(sub.date).toLocaleDateString()}</span>
                                          <span>•</span>
                                          <span>{sub.location || newEvent.location || 'Main Venue'}</span>
                                      </div>
                                  </div>
                              </div>
                              <button onClick={() => setNewEvent({...newEvent, subEvents: newEvent.subEvents.filter(s => s.id !== sub.id)})} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Access List</label>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input type="text" placeholder="Name" className="p-3 bg-white rounded-xl text-xs font-bold outline-none" value={tempClient.name} onChange={e => setTempClient({...tempClient, name: e.target.value})} />
                    <input type="email" placeholder="Email" className="p-3 bg-white rounded-xl text-xs font-bold outline-none" value={tempClient.email} onChange={e => setTempClient({...tempClient, email: e.target.value})} />
                    <div className="flex gap-2">
                        <input type="tel" placeholder="Phone" className="flex-1 p-3 bg-white rounded-xl text-xs font-bold outline-none" value={tempClient.phone} onChange={e => setTempClient({...tempClient, phone: e.target.value})} />
                        <button onClick={handleAddClient} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {clientList.map((c, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">{c.name.charAt(0)}</div>
                              <div>
                                  <p className="text-xs font-bold text-slate-900">{c.name}</p>
                                  <p className="text-[10px] text-slate-400">{c.email}</p>
                              </div>
                          </div>
                          <button onClick={() => setClientList(clientList.filter((_, idx) => idx !== i))} className="text-red-500"><X className="w-4 h-4" /></button>
                      </div>
                  ))}
                </div>
              </div>
              
              {/* Service Selection */}
              {availableServices.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Included Services</label>
                      <div className="grid grid-cols-2 gap-2">
                          {availableServices.map(service => (
                              <div 
                                key={service.id} 
                                onClick={() => toggleService(service)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${newEvent.selectedServices.find(s => s.id === service.id) ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}
                              >
                                  <p className="text-xs font-bold flex items-center gap-1">
                                      {service.name} 
                                      {service.type === 'addon' && <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded">ADDON</span>}
                                  </p>
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
                        <ul className="space-y-2">
                            {p.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                    <Check className="w-3 h-3 text-[#10B981]" /> {f}
                                </li>
                            ))}
                        </ul>
                     </div>
                     <button className="mt-8 w-full py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-[#10B981] group-hover:text-white transition-all">Select</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="w-full py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Back</button>
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
                  
                  <div className="pt-6 border-t border-slate-200 space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="relative flex-1">
                             <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                             <input 
                              type="text" 
                              placeholder="COUPON CODE"
                              className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black outline-none uppercase text-slate-900"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                             />
                          </div>
                          <button onClick={handleApplyCoupon} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Apply</button>
                       </div>
                       {discountApplied && (
                         <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest animate-bounce">
                           <ShieldCheck className="w-4 h-4" /> Discount Applied!
                         </div>
                       )}
                  </div>

                  <div className="pt-6 border-t border-slate-200 space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Total Contract Value</span>
                        <span className="text-3xl font-black text-[#10B981]">₹{finalAmount}</span>
                     </div>
                  </div>
               </div>
               <div className="flex gap-4">
                   <button onClick={() => setStep(2)} className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px]">Back</button>
                   <button onClick={handleFinalSubmit} className="flex-[2] py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all text-[11px] flex items-center justify-center gap-3"><CreditCard className="w-5 h-5" /> Complete Deployment</button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
