
import React, { useState } from 'react';
import { 
  Users, Calendar, Database, TrendingUp, 
  CheckCircle, Mail, Settings, Trash2, Edit2, Zap, CreditCard,
  Search, Filter, LayoutGrid, List, ChevronRight, X, Eye, Wallet,
  ShieldCheck, ShieldAlert, ToggleLeft, ToggleRight, Camera, User as UserIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';

interface AdminDashboardProps {
  view?: 'overview' | 'events' | 'users' | 'settings' | 'subscriptions';
  onNavigate?: (view: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ view = 'overview', onNavigate }) => {
  const { events, users, setActiveEvent, toggleUserStatus } = useData();
  const [eventViewType, setEventViewType] = useState<'card' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedPhotographer, setSelectedPhotographer] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const photographers = users.filter(u => u.role === UserRole.PHOTOGRAPHER);
  const totalPhotos = events.reduce((acc, e) => acc + e.photoCount, 0);
  const totalRevenue = events.reduce((acc, e) => acc + (e.price || 0), 0);
  const totalCollected = events.reduce((acc, e) => acc + (e.paidAmount || 0), 0);
  const platformBalance = totalRevenue - totalCollected;
  
  const storageUsed = (totalPhotos * 4.5) / 1024; 
  const storageLimit = 2000; 

  const revenueData = [
    { name: 'Jan', value: 345000 },
    { name: 'Feb', value: 452000 },
    { name: 'Mar', value: 348000 },
    { name: 'Apr', value: 561000 },
    { name: 'May', value: 455000 },
    { name: 'Jun', value: 667000 },
  ];

  const filteredEvents = events
    .filter(e => selectedPhotographer === 'all' || e.photographerId === selectedPhotographer)
    .filter(e => statusFilter === 'all' || e.status === statusFilter)
    .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(e => !fromDate || new Date(e.date) >= new Date(fromDate))
    .filter(e => !toDate || new Date(e.date) <= new Date(toDate));

  const handleViewEvent = (event: any) => {
    setActiveEvent(event);
    if (onNavigate) onNavigate('event-settings');
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Platform Revenue</p>
            <p className="text-3xl font-black text-slate-900 mt-2">₹{totalRevenue.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-4 text-green-600 text-xs font-bold">
              <TrendingUp className="w-3 h-3" /> +18.4% growth
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform flex items-center justify-center">
            <CreditCard className="w-10 h-10 text-indigo-600 opacity-20" />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Platform Balance</p>
            <p className="text-3xl font-black text-white mt-2">₹{platformBalance.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-4 text-amber-400 text-xs font-bold">
              <Wallet className="w-3 h-3" /> To be collected
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full group-hover:scale-110 transition-transform flex items-center justify-center">
            <Wallet className="w-10 h-10 text-white opacity-10" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Cloud Storage</p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-3xl font-black text-slate-900">{storageUsed.toFixed(1)} GB</p>
            <p className="text-slate-400 text-xs font-bold mb-1">/ {storageLimit} GB</p>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{width: `${(storageUsed/storageLimit)*100}%`}} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Global Uptime</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-3xl font-black text-[#10B981]">99.9%</p>
          </div>
          <div className="flex gap-1.5 mt-4">
            <div className="flex-1 h-1.5 bg-[#10B981] rounded-full" />
            <div className="flex-1 h-1.5 bg-[#10B981] rounded-full opacity-60" />
            <div className="flex-1 h-1.5 bg-[#10B981] rounded-full opacity-30" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight">Revenue Analytics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Top Partners</h3>
          <div className="space-y-6">
            {photographers.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <img src={p.avatar || `https://ui-avatars.com/api/?name=${p.name}&background=10B981&color=fff`} className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" alt="" />
                  <div>
                    <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{p.subscriptionTier || 'Gold'} Tier Partner</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 text-sm">₹{(1250000 / (i + 1)).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubscriptions = () => {
    const filteredPhotographers = photographers.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by studio name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 rounded-2xl border border-indigo-100">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{photographers.length} ACTIVE PARTNERS</span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Photographer / Studio</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Start Date</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tier</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stats (E / P / U)</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Subscription Till</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPhotographers.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={p.avatar || `https://ui-avatars.com/api/?name=${p.name}&background=10B981&color=fff`} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm" alt="" />
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${p.isActive ? 'bg-[#10B981]' : 'bg-red-500'}`} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm tracking-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center text-xs font-bold text-slate-500 uppercase">
                    {p.joinDate ? new Date(p.joinDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      p.subscriptionTier === 'STUDIO' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {p.subscriptionTier || 'PRO'}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <div className="px-2 py-1 bg-slate-100 rounded-lg flex items-center gap-1.5" title="Events">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-600">{p.totalEventsCount || 0}</span>
                       </div>
                       <div className="px-2 py-1 bg-slate-100 rounded-lg flex items-center gap-1.5" title="Photos">
                          <Camera className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-600">{(p.totalPhotosCount || 0) > 1000 ? `${((p.totalPhotosCount || 0)/1000).toFixed(1)}k` : p.totalPhotosCount}</span>
                       </div>
                       <div className="px-2 py-1 bg-slate-100 rounded-lg flex items-center gap-1.5" title="Users">
                          <UserIcon className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-600">{p.totalUsersCount || 0}</span>
                       </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-[11px] font-black ${new Date(p.subscriptionExpiry || '') < new Date() ? 'text-red-500' : 'text-slate-900'}`}>
                        {p.subscriptionExpiry ? new Date(p.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                      </span>
                      {p.subscriptionExpiry && new Date(p.subscriptionExpiry) < new Date() && (
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter mt-0.5 animate-pulse">EXPIRED</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      p.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {p.isActive ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {p.isActive ? 'ENABLED' : 'DISABLED'}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => toggleUserStatus(p.id)}
                      className={`p-2 rounded-xl transition-all ${
                        p.isActive 
                          ? 'text-[#10B981] bg-emerald-50 hover:bg-emerald-100' 
                          : 'text-red-500 bg-red-50 hover:bg-red-100'
                      }`}
                    >
                      {p.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderEvents = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search across all platform events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Photographer Select */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
          <Users className="w-4 h-4 text-slate-400" />
          <select 
            value={selectedPhotographer}
            onChange={(e) => setSelectedPhotographer(e.target.value)}
            className="bg-transparent border-none text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Partners</option>
            {photographers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-2">
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="bg-transparent border-none text-[10px] font-bold text-slate-600 outline-none w-28 cursor-pointer" />
            <span className="text-slate-300">—</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="bg-transparent border-none text-[10px] font-bold text-slate-600 outline-none w-28 cursor-pointer" />
          </div>
          {(fromDate || toDate) && <button onClick={() => {setFromDate(''); setToDate('');}}><X className="w-3.5 h-3.5 text-red-400" /></button>}
        </div>

        {/* Status Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['all', 'active', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                statusFilter === status 
                  ? 'bg-white shadow-sm text-indigo-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setEventViewType('card')} className={`p-2 rounded-lg ${eventViewType === 'card' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setEventViewType('list')} className={`p-2 rounded-lg ${eventViewType === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {eventViewType === 'list' ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Partner</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Revenue</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Balance %</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map(e => {
                const balancePercent = e.price ? Math.round(((e.price - (e.paidAmount || 0)) / e.price) * 100) : 0;
                return (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img src={e.coverImage} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm" alt="" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{e.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(e.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center text-xs font-bold text-slate-600 uppercase tracking-tight">
                      {users.find(u => u.id === e.photographerId)?.name}
                    </td>
                    <td className="p-6 text-center text-xs font-black text-slate-900">₹{e.price?.toLocaleString()}</td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${balancePercent}%` }} />
                        </div>
                        <span className="text-[9px] font-black text-amber-600 uppercase">{balancePercent}% Remaining</span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => handleViewEvent(e)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Project
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map(e => {
            const balancePercent = e.price ? Math.round(((e.price - (e.paidAmount || 0)) / e.price) * 100) : 0;
            return (
              <div 
                key={e.id} 
                onClick={() => handleViewEvent(e)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm group hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img src={e.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">View Project <ChevronRight className="w-3 h-3" /></span>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-bold text-slate-900 uppercase tracking-widest shadow-lg">
                    {balancePercent}% BAL
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm truncate">{e.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{users.find(u => u.id === e.photographerId)?.name}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 pt-4 border-t border-slate-50">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase">
                      <span className="text-slate-400">Project Value</span>
                      <span className="text-indigo-600">₹{e.price?.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${balancePercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[500px] text-center space-y-8 animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center">
        <Users className="w-12 h-12" />
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Identity Hub</h3>
        <p className="text-slate-500 mt-2 max-w-sm font-medium">Manage photographers, partner studios and client access globally.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
           <p className="text-3xl font-black text-slate-900">{users.length}</p>
           <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Global Users</p>
        </div>
        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
           <p className="text-3xl font-black text-indigo-600">{photographers.length}</p>
           <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Active Partners</p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
          <Mail className="w-7 h-7 text-indigo-600" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Communications Engine</h3>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem]">
            <div className="space-y-1">
              <p className="font-black text-slate-800 uppercase tracking-tight text-sm">Escalation Reminders</p>
              <p className="text-xs text-slate-500 font-medium">Auto-ping photographers when projects stall.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem]">
            <div className="space-y-1">
              <p className="font-black text-slate-800 uppercase tracking-tight text-sm">Payment Auto-Audit</p>
              <p className="text-xs text-slate-500 font-medium">Mark projects closed once 100% balance is verified.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const getTitle = () => {
    switch(view) {
      case 'events': return 'Global Project Directory';
      case 'users': return 'Identity & Governance';
      case 'settings': return 'System Configuration';
      case 'subscriptions': return 'Partner Subscriptions';
      default: return 'Platform Analytics';
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{getTitle()}</h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] opacity-80">Super Admin Console • Global View</p>
      </div>

      {view === 'overview' && renderOverview()}
      {view === 'events' && renderEvents()}
      {view === 'users' && renderUsers()}
      {view === 'settings' && renderSettings()}
      {view === 'subscriptions' && renderSubscriptions()}
    </div>
  );
};

export default AdminDashboard;
