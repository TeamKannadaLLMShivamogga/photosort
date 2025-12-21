
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Star, Users, CheckCircle2, 
  Calendar, Camera, Clock, ArrowRight, Image as ImageIcon, Sparkles, Smile, Users as GroupIcon, Heart, CreditCard
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import EventSelector from './EventSelector';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const UserDashboard: React.FC = () => {
  const { activeEvent, photos, selectedPhotos } = useData();

  if (!activeEvent) {
    return <EventSelector embedded />;
  }

  const eventPhotos = photos.filter(p => p.eventId === activeEvent.id);
  const aiPicks = eventPhotos.filter(p => p.isAiPick);
  const highQuality = eventPhotos.filter(p => p.quality === 'high');
  const peopleCount = new Set(eventPhotos.flatMap(p => p.people)).size;

  // Mocked AI Insights derived from photo data
  const insights = [
    { label: 'Dancing moments', value: Math.floor(eventPhotos.length * 0.15), icon: '💃' },
    { label: 'Smiling faces', value: Math.floor(eventPhotos.length * 0.4), icon: '😊' },
    { label: 'Ceremony highlights', value: Math.floor(eventPhotos.length * 0.25), icon: '🎉' },
    { label: 'Group photos', value: Math.floor(eventPhotos.length * 0.1), icon: '👨‍👩‍👧‍👦' },
  ];

  const subEventStats = activeEvent.subEvents.map(se => ({
    name: se.name,
    count: eventPhotos.filter(p => p.subEventId === se.id).length
  }));

  const totalPaid = (activeEvent as any).paidAmount || (activeEvent.price || 0) / 2;
  const balance = (activeEvent.price || 0) - totalPaid;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
          <img src={activeEvent.coverImage} className="w-full h-full object-cover" alt="" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{activeEvent.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-slate-400 font-bold text-sm">
            <span>{new Date(activeEvent.date).toLocaleDateString()}</span>
            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
            <span>{activeEvent.photoCount} photos</span>
          </div>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Photos', value: eventPhotos.length, icon: ImageIcon, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
          { label: 'AI Picks', value: aiPicks.length, icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50/50' },
          { label: 'High Quality', value: highQuality.length, icon: Star, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
          { label: 'People Detected', value: peopleCount, icon: GroupIcon, color: 'text-blue-600', bg: 'bg-blue-50/50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-4xl font-black text-slate-900">{stat.value}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-7 h-7" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* AI Insights & Payment Section */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-slate-900">AI Insights</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {insights.map((insight, i) => (
                <div key={i} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-3 hover:bg-white hover:shadow-sm transition-all">
                  <span className="text-3xl">{insight.icon}</span>
                  <div>
                    <p className="text-3xl font-black text-slate-900">{insight.value}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{insight.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-amber-600" />
                <h3 className="text-xl font-bold text-slate-900">Payment Status</h3>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                balance === 0 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {balance === 0 ? 'Fully Paid' : 'Payment Pending'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50/50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Price</p>
                <p className="text-xl font-black text-slate-900 mt-1">₹{(activeEvent.price || 0).toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-slate-50/50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid Amount</p>
                <p className="text-xl font-black text-green-600 mt-1">₹{totalPaid.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-slate-50/50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remaining</p>
                <p className="text-xl font-black text-amber-600 mt-1">₹{balance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quality & Timeline Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-xl font-bold text-slate-900">Quality Distribution</h3>
            <div className="space-y-6">
              {[
                { label: 'High Quality', color: 'bg-emerald-500', percent: 33 },
                { label: 'Medium Quality', color: 'bg-amber-500', percent: 33 },
                { label: 'Low Quality', color: 'bg-slate-400', percent: 33 },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <span>{item.label}</span>
                    <span className="text-slate-400">{item.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-slate-50 space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Photos by Day</h3>
              <div className="space-y-4">
                {subEventStats.map((se, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">{se.name}</span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">{se.count} photos</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <h4 className="text-2xl font-bold leading-tight">Ready to curate your album?</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Your selection process is 100% synchronized with your photographer's workflow.</p>
              <button className="bg-[#10B981] text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-[#059669] transition-all flex items-center gap-2 group-hover:scale-105">
                Go to Gallery <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:rotate-12 transition-transform">
               <ImageIcon className="w-48 h-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
