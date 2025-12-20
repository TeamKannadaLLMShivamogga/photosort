
import React from 'react';
import { 
  LayoutDashboard, Image as ImageIcon, CheckSquare, Settings, 
  Users, LogOut, Calendar, Camera, Info, CreditCard, X
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';
import EventSwitcher from './EventSwitcher';

interface SidebarProps {
  onNavigate: (view: string) => void;
  currentView: string;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentView, isOpen, onClose }) => {
  const { currentUser, logout, activeEvent } = useData();

  const getNavItems = () => {
    if (currentUser?.role === UserRole.USER) {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
        { id: 'selections', label: 'My Selections', icon: CheckSquare },
        { id: 'profile-settings', label: 'Settings', icon: Settings }
      ];
    } else if (currentUser?.role === UserRole.PHOTOGRAPHER) {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'events', label: 'All Events', icon: Calendar },
        { id: 'event-settings', label: 'Event Detail', icon: Info, hidden: !activeEvent },
        { id: 'photographer-settings', label: 'Settings', icon: Settings }
      ];
    } else {
      return [
        { id: 'admin-dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'admin-events', label: 'Global Events', icon: Calendar },
        { id: 'admin-users', label: 'User Governance', icon: Users },
        { id: 'admin-subscriptions', label: 'Subscriptions', icon: CreditCard },
        { id: 'admin-settings', label: 'System Config', icon: Settings }
      ];
    }
  };

  const navItems = getNavItems().filter(i => !i.hidden);

  const handleNavigation = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`w-64 bg-[#111827] flex flex-col h-screen fixed left-0 top-0 z-50 border-r border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#10B981] rounded-2xl flex items-center justify-center shadow-xl shadow-[#10B981]/20">
              <Camera className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-white text-xl tracking-tighter uppercase">PhotoSort</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {currentUser?.role === UserRole.USER && <EventSwitcher />}

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.id || (item.id === 'admin-dashboard' && currentView === 'dashboard' && currentUser?.role === UserRole.ADMIN);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-[#1F2937] text-white font-bold shadow-lg' 
                    : 'text-gray-500 hover:bg-[#1F2937]/50 hover:text-gray-300'
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-[#10B981]' : ''}`} />
                <span className={`text-[11px] uppercase tracking-widest font-black ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 p-3 bg-[#1F2937] rounded-2xl border border-gray-700/30">
            <img 
              src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name}&background=10B981&color=fff`} 
              className="w-9 h-9 rounded-2xl border border-gray-600 object-cover"
              alt="" 
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{currentUser?.name}</p>
              <p className="text-[8px] text-[#10B981] font-black uppercase tracking-widest leading-none mt-1">{currentUser?.role}</p>
            </div>
            <button onClick={logout} className="p-2 hover:bg-red-500/10 hover:text-red-400 text-gray-500 transition-all rounded-xl">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
