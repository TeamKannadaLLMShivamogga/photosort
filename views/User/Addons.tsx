
import React from 'react';
import { useData } from '../../context/DataContext';
import { ShoppingBag, Clock, CheckCircle, XCircle, Plus, AlertCircle } from 'lucide-react';

const UserAddons: React.FC = () => {
  const { activeEvent, currentUser, users, requestAddon } = useData();
  
  if (!activeEvent || !currentUser) return null;

  // Find photographer to get global services
  const photographer = users.find(u => u.id === activeEvent.photographerId);
  const availableAddons = photographer?.services?.filter(s => s.type === 'addon') || [];

  const handleRequest = (serviceId: string) => {
    if (confirm("Request this add-on service? The photographer will be notified.")) {
      requestAddon(activeEvent.id, serviceId);
    }
  };

  const getStatus = (serviceId: string) => {
    const req = activeEvent.addonRequests?.find(r => r.serviceId === serviceId);
    return req ? req.status : null;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black uppercase tracking-tight">Upgrade Your Experience</h1>
          <p className="text-indigo-100 font-medium mt-2 max-w-lg">Enhance your memories with premium albums, cinematic edits, and extra coverage.</p>
        </div>
        <ShoppingBag className="absolute -right-6 -bottom-6 w-48 h-48 text-white opacity-10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {availableAddons.map(addon => {
          const status = getStatus(addon.id);
          const isRequested = !!status;

          return (
            <div key={addon.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{addon.name}</h3>
                  <span className="text-lg font-black text-[#10B981]">₹{addon.price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-500">{addon.description || "Premium add-on service for your event."}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50">
                {isRequested ? (
                  <div className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest ${
                    status === 'approved' ? 'bg-green-50 text-green-600' :
                    status === 'rejected' ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {status === 'approved' && <CheckCircle className="w-4 h-4" />}
                    {status === 'rejected' && <XCircle className="w-4 h-4" />}
                    {status === 'pending' && <Clock className="w-4 h-4" />}
                    Request {status}
                  </div>
                ) : (
                  <button 
                    onClick={() => handleRequest(addon.id)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Request Add-on
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {availableAddons.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No add-ons available from the photographer at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAddons;
