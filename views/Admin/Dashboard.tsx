
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-600/50 transition-colors">
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
        <div className="lg:col-span-8 bg-white p-4 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight">Revenue Analytics</h3>
          <div className="h-64 sm:h-80 w-full">
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

        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Top Partners</h3>
          <div className="space-y-6">
            {photographers.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-2xl transition-colors">
                <div className="flex items-center gap-4">
                  <img src={p.avatar || `https://ui-avatars.com/api/?name=${p.name}&background=10B981&color=fff`} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" alt="" />
                  <div>
                    <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors truncate max-w-[120px]">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{p.subscriptionTier || 'Gold'}</p>
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
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search studio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 rounded-2xl border border-indigo-100 w-full sm:w-auto justify-center">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{photographers.length} ACTIVE</span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Studio</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tier</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stats (E/P/U)</th>
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
                        <img src={p.avatar || `https://ui-avatars.com/api/?name=${p.name}&background=10B981&color=fff`} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" alt="" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm tracking-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{p.email}</p>
                      </div>
                    </div>
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
                       <span className="text-[10px] font-black text-slate-600 px-2 py-1 bg-slate-100 rounded-lg">{p.totalEventsCount || 0}/{p.totalPhotosCount || 0}/{p.totalUsersCount || 0}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center text-[11px] font-black">
                    {p.subscriptionExpiry ? new Date(p.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      p.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {p.isActive ? 'ENABLED' : 'DISABLED'}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => toggleUserStatus(p.id)}
                      className={`p-2 rounded-xl transition-all ${
                        p.isActive 
                          ? 'text-[#10B981] bg-emerald-50' 
                          : 'text-red-500 bg-red-50'
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
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search all events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-100 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl flex-1">
            {['all', 'active', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`flex-1 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === status 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setEventViewType('card')} className={`p-2 rounded-lg ${eventViewType === 'card' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setEventViewType('list')} className={`p-2 rounded-lg ${eventViewType === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
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
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={e.coverImage} className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-sm" alt="" />
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
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => handleViewEvent(e)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map(e => (
            <div 
              key={e.id} 
              onClick={() => handleViewEvent(e)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm group hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="aspect-[16/10] relative overflow-hidden">
                <img src={e.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-bold text-slate-900 uppercase tracking-widest shadow-lg">
                  {e.status}
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm truncate">{e.name}</h4>
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-indigo-600 pt-2 border-t border-slate-50">
                  <span>Project Value</span>
                  <span>₹{e.price?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 w-full sm:w-auto justify-center">
            <Users className="w-4 h-4 text-slate-600" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{users.length} USERS</span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Role</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Joined</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=10B981&color=fff`} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" alt="" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm tracking-tight">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 
                      u.role === 'PHOTOGRAPHER' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-6 text-center text-[11px] font-black">
                    {u.joinDate ? new Date(u.joinDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => toggleUserStatus(u.id)}
                      className={`p-2 rounded-xl transition-all ${
                        u.isActive 
                          ? 'text-[#10B981] bg-emerald-50' 
                          : 'text-red-500 bg-red-50'
                      }`}
                      title={u.isActive ? 'Suspend User' : 'Activate User'}
                    >
                      {u.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
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

  const renderSettings = () => (
    <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
          <Mail className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Engine</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Auto Escalations', desc: 'Notify photographers of stalling projects.' },
            { label: 'Auto-Audit', desc: 'Verify balances before project close.' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 sm:p-8 bg-slate-50 rounded-[2rem] gap-4">
              <div className="space-y-1">
                <p className="font-black text-slate-800 uppercase tracking-tight text-sm">{item.label}</p>
                <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const getTitle = () => {
    switch(view) {
      case 'events': return 'Projects';
      case 'users': return 'Governance';
      case 'settings': return 'Config';
      case 'subscriptions': return 'Subscriptions';
      default: return 'Analytics';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter">{getTitle()}</h1>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Super Admin Console</p>
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
