
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  Calendar, Camera, Clock, Users, ArrowRight, Plus, X, 
  Image as ImageIcon, Wallet, Mail, Phone, Check, CreditCard, Ticket, ShieldCheck, Sparkles 
} from 'lucide-react';
import { EventPlan } from '../../types';

const PhotographerDashboard: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { events, photos, currentUser, setActiveEvent, addEvent } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Plan, 3: Payment
  
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
    { 
      id: EventPlan.BASIC, 
      name: 'Basic', 
      price: 499, 
      features: ['Up to 500 photos', 'Standard AI Sorting', '30 Days Storage'],
      color: 'border-slate-200' 
    },
    { 
      id: EventPlan.STANDARD, 
      name: 'Standard', 
      price: 999, 
      features: ['Up to 2000 photos', 'Advanced AI Search', '90 Days Storage'],
      color: 'border-indigo-200 bg-indigo-50/30' 
    },
    { 
      id: EventPlan.PRO, 
      name: 'Pro', 
      price: 1499, 
      features: ['Unlimited photos', 'Premium Face Recog', '1 Year Storage'],
      color: 'border-[#10B981]/30 bg-emerald-50/30' 
    }
  ];

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
      paymentStatus: 'paid' // Assuming payment is done
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
            return (
              <div 
                key={event.id} 
                onClick={() => { setActiveEvent(event); onNavigate('event-settings'); }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
              >
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col my-auto">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create New Event</h3>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${step >= i ? 'w-8 bg-[#10B981]' : 'w-4 bg-slate-100'}`} />
                  ))}
                </div>
              </div>
              <button onClick={resetModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto no-scrollbar">
              
              {/* STEP 1: EVENT DETAILS */}
              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Identity *</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#10B981]/20 outline-none text-sm font-medium text-slate-900"
                      placeholder="e.g., Sharma Wedding 2024"
                      value={newEvent.name}
                      onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Mail className="w-3 h-3" /> Client Email *</label>
                      <input 
                        type="email" 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium text-slate-900"
                        placeholder="client@example.com"
                        value={newEvent.clientEmail}
                        onChange={e => setNewEvent({...newEvent, clientEmail: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Phone className="w-3 h-3" /> Client Phone</label>
                      <input 
                        type="tel" 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium text-slate-900"
                        placeholder="+91 9876543210"
                        value={newEvent.clientPhone}
                        onChange={e => setNewEvent({...newEvent, clientPhone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Event Date *</label>
                      <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900" value={newEvent.startDate} onChange={e => setNewEvent({...newEvent, startDate: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valuation (₹)</label>
                      <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-base text-slate-900" value={newEvent.price} onChange={e => setNewEvent({...newEvent, price: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visual Cover</label>
                    <div className="grid grid-cols-3 gap-3">
                      {coverOptions.map((opt, i) => (
                        <button key={i} onClick={() => setNewEvent({...newEvent, coverImage: opt})} className={`relative aspect-video rounded-xl overflow-hidden border-4 transition-all ${newEvent.coverImage === opt ? 'border-[#10B981]' : 'border-transparent opacity-60'}`}>
                          <img src={opt} className="w-full h-full object-cover" alt="" />
                          {newEvent.coverImage === opt && <div className="absolute inset-0 bg-[#10B981]/10 flex items-center justify-center"><Check className="text-white bg-[#10B981] rounded-full p-0.5 w-5 h-5 shadow-lg" /></div>}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    disabled={!newEvent.name || !newEvent.startDate || !newEvent.clientEmail}
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-slate-900 disabled:bg-slate-200 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                  >
                    Select Plan <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: PLAN SELECTION */}
              {step === 2 && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="text-center space-y-2">
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Choose Service Plan</h4>
                    <p className="text-sm text-slate-500">Pick the processing power for this event</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => handleSelectPlan(p.id, p.price)}
                        className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer hover:shadow-xl flex flex-col group ${p.color} ${newEvent.plan === p.id ? 'ring-4 ring-[#10B981]/20 border-[#10B981]' : 'hover:border-[#10B981]/40'}`}
                      >
                        <div className="flex-1 space-y-4">
                          <h5 className="font-black text-slate-900 uppercase tracking-widest text-xs">{p.name}</h5>
                          <div className="space-y-1">
                            <span className="text-2xl font-black">₹{p.price}</span>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Per Event</span>
                          </div>
                          <ul className="space-y-3 pt-4 border-t border-slate-100">
                            {p.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-slate-500">
                                <Check className="w-3 h-3 text-[#10B981] shrink-0 mt-0.5" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button className="mt-8 w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-[#10B981] group-hover:text-white group-hover:border-[#10B981] transition-all">
                          Select
                        </button>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setStep(1)}
                    className="w-full py-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-600"
                  >
                    Back to Details
                  </button>
                </div>
              )}

              {/* STEP 3: PAYMENT */}
              {step === 3 && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Plan Summary</span>
                      <button onClick={() => setStep(2)} className="text-[10px] font-black text-[#10B981] uppercase hover:underline">Change</button>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                             <Sparkles className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{newEvent.plan} PLAN</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">AI Sorting Enabled</p>
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
                              placeholder="COUPON CODE (Try: PHOTOSORT)"
                              className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black outline-none focus:ring-2 focus:ring-[#10B981]/20 uppercase text-slate-900"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                             />
                          </div>
                          <button 
                            onClick={handleApplyCoupon}
                            className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
                          >
                             Apply
                          </button>
                       </div>
                       
                       {discountApplied && (
                         <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest animate-bounce">
                           <ShieldCheck className="w-4 h-4" /> 100% Discount Applied!
                         </div>
                       )}
                    </div>

                    <div className="pt-6 flex items-center justify-between">
                       <span className="text-sm font-black uppercase text-slate-900 tracking-widest">Total Payable</span>
                       <span className="text-3xl font-black text-[#10B981]">₹{finalAmount}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={handleFinalSubmit}
                      className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.25em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      <CreditCard className="w-5 h-5" /> Secure Checkout
                    </button>
                    <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                       <ShieldCheck className="w-3.5 h-3.5" /> Encrypted & Secure by PhotoSort Pay
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

export default PhotographerDashboard;
