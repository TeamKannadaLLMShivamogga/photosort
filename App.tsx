
import React, { useState, useEffect, useRef } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { UserRole, FamilyMember } from './types';
import Sidebar from './components/Sidebar';
import EventSelector from './views/User/EventSelector';
import UserDashboard from './views/User/Dashboard';
import GalleryView from './components/Gallery/GalleryView';
import UserSelections from './views/User/Selections';
import UserAddons from './views/User/Addons';
import UserAlbum from './views/User/Album';
import PhotographerDashboard from './views/Photographer/Dashboard';
import PhotographerEventsList from './views/Photographer/EventsList';
import PhotographerEventDetail from './views/Photographer/EventDetail';
import PhotographerPortfolio from './views/Photographer/Portfolio';
import AdminDashboard from './views/Admin/Dashboard';
import { 
  LogIn, Camera, Bell, Search, Settings, User as UserIcon, Save, 
  Image as ImageIcon, Plus, Trash2, Upload, Heart, UserPlus, Info, Users, Menu,
  CreditCard, Landmark, Globe, Smartphone, Mail, ShieldCheck, Zap, ChevronRight, Lock, Loader2, ArrowRight, UploadCloud
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, activeEvent, login, signup, updateUser, uploadAsset, uploadRawPhotos, uploadBulkEditedPhotos } = useData();
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewParams, setViewParams] = useState<any>(null); // State for navigation parameters
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [signupData, setSignupData] = useState({ name: '', email: '', phone: '' });

  // Profile Edit States
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingFamily, setIsUploadingFamily] = useState(false);
  const [isUploadingRaw, setIsUploadingRaw] = useState(false);
  const [isUploadingEdits, setIsUploadingEdits] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const familyMemberInputRef = useRef<HTMLInputElement>(null);
  const rawUploadInputRef = useRef<HTMLInputElement>(null);
  const editUploadInputRef = useRef<HTMLInputElement>(null);
  const [currentFamilyMemberId, setCurrentFamilyMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditAvatar(currentUser.avatar || '');
      setFamilyMembers(currentUser.familyMembers || []);
    }
  }, [currentUser]);

  const handleNavigate = (view: string, params?: any) => {
    setCurrentView(view);
    if (params) {
      setViewParams(params);
    } else {
      setViewParams(null);
    }
  };

  const handleUpdateProfile = () => {
    if (currentUser) {
      updateUser({
        ...currentUser,
        name: editName,
        avatar: editAvatar,
        familyMembers: familyMembers
      });
      alert('Profile successfully updated!');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      try {
        const url = await uploadAsset(file);
        setEditAvatar(url);
      } catch (e) {
        console.error("Avatar upload failed", e);
        alert("Failed to upload avatar image.");
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleRawUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0 && activeEvent) {
          setIsUploadingRaw(true);
          try {
              await uploadRawPhotos(activeEvent.id, e.target.files);
              alert('Upload successful!');
          } catch(err) {
              alert('Failed to upload photos.');
          } finally {
              setIsUploadingRaw(false);
              if (rawUploadInputRef.current) rawUploadInputRef.current.value = '';
          }
      }
  };

  const handleEditUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0 && activeEvent) {
          setIsUploadingEdits(true);
          try {
              await uploadBulkEditedPhotos(activeEvent.id, e.target.files);
              alert('Edits uploaded successfully!');
          } catch(err) {
              alert('Failed to upload edits.');
          } finally {
              setIsUploadingEdits(false);
              if (editUploadInputRef.current) editUploadInputRef.current.value = '';
          }
      }
  };

  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: `fm-${Date.now()}`,
      name: '',
      relation: '',
    };
    setFamilyMembers([...familyMembers, newMember]);
  };

  const updateFamilyMember = (id: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers(familyMembers.map(fm => fm.id === id ? { ...fm, ...updates } : fm));
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter(fm => fm.id !== id));
  };

  const triggerFamilyPhotoUpload = (id: string) => {
    setCurrentFamilyMemberId(id);
    familyMemberInputRef.current?.click();
  };

  const handleFamilyPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentFamilyMemberId) {
      setIsUploadingFamily(true);
      try {
        const url = await uploadAsset(file);
        updateFamilyMember(currentFamilyMemberId, { referencePhoto: url });
      } catch (e) {
        console.error("Family photo upload failed", e);
        alert("Failed to upload reference photo.");
      } finally {
        setIsUploadingFamily(false);
        setCurrentFamilyMemberId(null);
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          
          <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1554048612-387768052bf7?auto=format&fit=crop&q=80')] bg-cover opacity-20"></div>
             <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center border border-white/20 mb-4 shadow-xl">
                    <Camera className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">PhotoSort Pro</h1>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">The Ultimate Delivery Platform</p>
             </div>
          </div>

          <div className="p-8">
             {/* Auth Toggle */}
             <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8">
                 <button 
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        authMode === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'
                    }`}
                 >
                    Login
                 </button>
                 <button 
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        authMode === 'signup' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                 >
                    Partner Signup
                 </button>
             </div>

             {authMode === 'login' ? (
                 <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="email" 
                                placeholder="you@example.com"
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all text-sm font-bold text-slate-900"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={() => login(loginEmail)}
                        className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95"
                    >
                        Access Account <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
             ) : (
                 <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Studio / Full Name</label>
                        <div className="relative">
                            <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="e.g. Dream Lens Studio"
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all text-sm font-bold text-slate-900"
                                value={signupData.name}
                                onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="email" 
                                placeholder="studio@example.com"
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all text-sm font-bold text-slate-900"
                                value={signupData.email}
                                onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative">
                            <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="tel" 
                                placeholder="+91 98765 43210"
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all text-sm font-bold text-slate-900"
                                value={signupData.phone}
                                onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={() => signup(signupData.name, signupData.email, signupData.phone)}
                        className="w-full bg-indigo-600 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95 mt-2"
                    >
                        Create Partner Account
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-medium">
                        By registering, you agree to our Terms of Service. <br/> Client accounts are created automatically via Event invites.
                    </p>
                 </div>
             )}
          </div>
          
          {/* Quick Access (Demo Only) */}
          <div className="px-8 pb-8 pt-0 opacity-40 hover:opacity-100 transition-opacity">
             <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-3">——— DEMO ACCESS ———</p>
             <div className="flex gap-2 justify-center">
                 <button onClick={() => { setAuthMode('login'); setLoginEmail('admin@photosort.com'); login('admin@photosort.com'); }} className="px-3 py-1 bg-slate-100 rounded text-[9px] font-bold text-slate-500">Admin</button>
                 <button onClick={() => { setAuthMode('login'); setLoginEmail('photographer@photosort.com'); login('photographer@photosort.com'); }} className="px-3 py-1 bg-slate-100 rounded text-[9px] font-bold text-slate-500">Photog</button>
                 <button onClick={() => { setAuthMode('login'); setLoginEmail('user@photosort.com'); login('user@photosort.com'); }} className="px-3 py-1 bg-slate-100 rounded text-[9px] font-bold text-slate-500">Client</button>
             </div>
          </div>

        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': 
      case 'admin-dashboard':
        if (currentUser.role === UserRole.ADMIN) return <AdminDashboard view="overview" onNavigate={handleNavigate} />;
        return currentUser.role === UserRole.PHOTOGRAPHER 
          ? <PhotographerDashboard onNavigate={handleNavigate} /> 
          : <UserDashboard onNavigate={handleNavigate} />;
      case 'gallery': return <GalleryView initialTab={viewParams?.tab} />;
      case 'event-gallery': 
        return (
            <>
                <GalleryView 
                    initialTab={viewParams?.tab} 
                    isPhotographer={true} 
                    onUploadClick={() => rawUploadInputRef.current?.click()} 
                    onUploadEditsClick={() => editUploadInputRef.current?.click()}
                />
                <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    ref={rawUploadInputRef} 
                    className="hidden" 
                    onChange={handleRawUpload} 
                />
                <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    ref={editUploadInputRef} 
                    className="hidden" 
                    onChange={handleEditUpload} 
                />
                {(isUploadingRaw || isUploadingEdits) && (
                    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] border border-slate-700">
                            <div className="bg-white/10 p-2 rounded-xl">
                                <UploadCloud className="w-5 h-5 text-indigo-400 animate-pulse" />
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    <span>{isUploadingRaw ? 'Uploading Raw Photos' : 'Uploading Edits'}</span>
                                    <span className="text-white">Processing...</span>
                                </div>
                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden w-full relative">
                                    <div className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full w-1/3 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
      case 'selections': return <UserSelections />;
      case 'addons': return <UserAddons />;
      case 'album': return <UserAlbum />;
      case 'studio-profile': 
        // Render Read-Only Portfolio for the active event's photographer
        return <PhotographerPortfolio targetUserId={activeEvent?.photographerId} readOnly={true} />;
      case 'event-settings': return <PhotographerEventDetail onNavigate={handleNavigate} initialTab="settings" />;
      case 'portfolio': return <PhotographerPortfolio />;
      case 'admin-events': return <AdminDashboard view="events" onNavigate={handleNavigate} />;
      case 'admin-users': return <AdminDashboard view="users" onNavigate={handleNavigate} />;
      case 'admin-subscriptions': return <AdminDashboard view="subscriptions" onNavigate={handleNavigate} />;
      case 'admin-settings': return <AdminDashboard view="settings" onNavigate={handleNavigate} />;
      case 'profile-settings': 
        return (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            {/* ... Profile JSX remains unchanged ... */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Identity & Family</h1>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Configure your personal profile and family detection</p>
              </div>
              <button 
                onClick={handleUpdateProfile}
                disabled={isUploadingAvatar || isUploadingFamily}
                className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-[0.15em] transition-all shadow-xl shadow-[#10B981]/20 text-[11px] flex items-center justify-center gap-2 active:scale-95"
              >
                <Save className="w-4 h-4" /> Finalize Changes
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Profile Card */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 sticky top-24">
                <div className="flex flex-col items-center gap-8">
                  <div className="relative group">
                    <img 
                      src={editAvatar || `https://ui-avatars.com/api/?name=${editName || currentUser.name}&background=10B981&color=fff&size=256`} 
                      className="w-44 h-44 rounded-[3.5rem] border-8 border-slate-50 shadow-2xl object-cover transition-all group-hover:brightness-90"
                      alt="Profile"
                    />
                    {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black/30 rounded-[3.5rem] flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                        </div>
                    )}
                    <button 
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-2 right-2 w-12 h-12 bg-[#10B981] text-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-slate-900 transition-all active:scale-90 disabled:opacity-50"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{editName || currentUser.name}</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{currentUser.email}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Primary Display Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-[#10B981]/5 transition-all text-slate-900"
                        placeholder="e.g. Rohan Sharma"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Members Section */}
              <div className="lg:col-span-7 space-y-8">
                <div className="bg-white p-6 sm:p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
                        <Heart className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Family Map</h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Add reference photos</p>
                      </div>
                    </div>
                    <button 
                      onClick={addFamilyMember}
                      className="p-3 bg-slate-50 hover:bg-[#10B981] hover:text-white text-slate-400 rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input type="file" ref={familyMemberInputRef} className="hidden" accept="image/*" onChange={handleFamilyPhotoUpload} />
                    {familyMembers.length > 0 ? (
                      familyMembers.map((member) => (
                        <div key={member.id} className="p-4 sm:p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col sm:flex-row items-center gap-6 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all text-slate-900">
                          <div className="relative">
                            {member.referencePhoto ? (
                              <img 
                                src={member.referencePhoto} 
                                className="w-16 h-16 rounded-2xl object-cover shadow-lg border-4 border-white"
                                alt={member.name}
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-2xl bg-white border-4 border-slate-100 flex items-center justify-center text-slate-300">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                            {isUploadingFamily && currentFamilyMemberId === member.id && (
                                <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                </div>
                            )}
                            <button 
                              onClick={() => triggerFamilyPhotoUpload(member.id)}
                              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#10B981] text-white rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <input 
                              type="text" 
                              placeholder="Name" 
                              value={member.name}
                              onChange={(e) => updateFamilyMember(member.id, { name: e.target.value })}
                              className="bg-transparent border-b border-slate-200 py-1 text-sm font-bold focus:border-[#10B981] outline-none transition-all placeholder:text-slate-300 text-slate-900"
                            />
                            <input 
                              type="text" 
                              placeholder="Relation" 
                              value={member.relation}
                              onChange={(e) => updateFamilyMember(member.id, { relation: e.target.value })}
                              className="bg-transparent border-b border-slate-200 py-1 text-sm font-bold focus:border-[#10B981] outline-none transition-all placeholder:text-slate-300 text-slate-900"
                            />
                          </div>
                          <button 
                            onClick={() => removeFamilyMember(member.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                          <Users className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">No family mapped</p>
                          <p className="text-[10px] text-slate-400 font-medium">Add members to help our AI find their photos faster.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-indigo-50/50 p-6 rounded-[2.5rem] border border-indigo-100 flex items-start gap-5">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50 shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">AI Tip</p>
                    <p className="text-[11px] text-indigo-600 font-medium leading-relaxed">
                      Reference photos are used exclusively for your event's Face Detection engine. They are deleted immediately after the event is closed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'photographer-settings': return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Partner Configuration</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Manage studio profile, payouts, and platform preferences</p>
            </div>
            <button 
              className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-[0.15em] transition-all shadow-xl shadow-[#10B981]/20 text-[11px] flex items-center justify-center gap-2 active:scale-95"
              onClick={() => alert('Settings updated!')}
            >
              <Save className="w-4 h-4" /> Save Preferences
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
             <div className="lg:col-span-5 space-y-8">
               <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                 <div className="flex flex-col items-center text-center space-y-4">
                   <div className="relative group">
                     <img 
                       src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=10B981&color=fff&size=256`} 
                       className="w-32 h-32 rounded-[2.5rem] border-8 border-slate-50 shadow-2xl object-cover transition-all"
                       alt="Studio"
                     />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{currentUser.name}</h3>
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">PRO PARTNER SINCE 2023</p>
                   </div>
                 </div>
               </div>
             </div>
             <div className="lg:col-span-7 space-y-8">
             </div>
          </div>
        </div>
      );
      case 'events': return <PhotographerEventsList onNavigate={handleNavigate} />;
      default: return <div className="p-8">View Not Found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        onNavigate={handleNavigate} 
        currentView={currentView} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-300">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-10 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <span className="opacity-50">Home</span>
              <span className="text-slate-200">/</span>
              <span className="text-slate-900">{currentView.replace(/admin-|photographer-|profile-|governance/g, '').replace(/-/g, ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
             <div className="relative hidden md:block">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search platform..." 
                 className="bg-slate-50 border border-slate-100 rounded-full py-2 pl-10 pr-6 text-xs font-bold focus:ring-2 focus:ring-[#10B981]/10 w-32 lg:w-48 outline-none transition-all text-slate-900" 
               />
             </div>
             <button className="p-2 text-slate-400 hover:text-[#10B981] transition-colors relative bg-slate-50 rounded-full">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#10B981] rounded-full border-2 border-white"></span>
             </button>
             <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-100 pl-4 sm:pl-8 cursor-pointer group" onClick={() => setCurrentView('profile-settings')}>
                <div className="text-right hidden xs:block">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none group-hover:text-[#10B981] transition-colors">{currentUser.name}</p>
                  <p className="text-[8px] text-[#10B981] font-black uppercase tracking-widest mt-0.5">{currentUser.role}</p>
                </div>
                <img 
                  src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name}&background=10B981&color=fff`} 
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl border-2 border-slate-50 shadow-sm object-cover group-hover:border-[#10B981] transition-colors"
                  alt="" 
                />
             </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-10 overflow-y-auto no-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
