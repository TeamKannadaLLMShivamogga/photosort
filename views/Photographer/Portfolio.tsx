
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Save, Plus, Trash2, Video, Image as ImageIcon, Link, FileText, Check, Briefcase, UploadCloud, X, User } from 'lucide-react';
import { Service, Portfolio } from '../../types';

interface PortfolioProps {
  targetUserId?: string;
  readOnly?: boolean;
}

const PhotographerPortfolio: React.FC<PortfolioProps> = ({ targetUserId, readOnly = false }) => {
  const { currentUser: loggedInUser, users, updateUserServices, updateUserPortfolio } = useData();
  
  // Determine which user's portfolio to show
  const displayUser = targetUserId 
    ? users.find(u => u.id === targetUserId) 
    : loggedInUser;

  const [bio, setBio] = useState('');
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [newVideo, setNewVideo] = useState('');
  
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  // New Service State
  const [newService, setNewService] = useState({ name: '', price: 0, description: '', type: 'service' as const });

  useEffect(() => {
    if (displayUser) {
      setBio(displayUser.portfolio?.bio || '');
      setVideoLinks(displayUser.portfolio?.videoLinks || []);
      setGalleryImages(displayUser.portfolio?.galleryImages || []);
      setServices(displayUser.services || []);
    }
  }, [displayUser]);

  const handleSavePortfolio = () => {
    if (!displayUser || readOnly) return;
    updateUserPortfolio(displayUser.id, {
        bio,
        videoLinks,
        galleryImages
    });
    alert('Portfolio updated!');
  };

  const handleAddVideo = () => {
    if (newVideo) {
      setVideoLinks([...videoLinks, newVideo]);
      setNewVideo('');
    }
  };

  const removeVideo = (idx: number) => {
    setVideoLinks(videoLinks.filter((_, i) => i !== idx));
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const url = URL.createObjectURL(e.target.files[0]);
        setGalleryImages([...galleryImages, url]);
    }
  };

  const removeGalleryImage = (idx: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== idx));
  };

  const handleAddService = () => {
    if (newService.name && newService.price > 0) {
      const s: Service = {
        id: `srv-${Date.now()}`,
        name: newService.name,
        price: newService.price,
        description: newService.description,
        type: newService.type
      };
      const updatedServices = [...services, s];
      setServices(updatedServices);
      if (displayUser) updateUserServices(displayUser.id, updatedServices);
      setNewService({ name: '', price: 0, description: '', type: 'service' });
    }
  };

  const removeService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    if (displayUser) updateUserServices(displayUser.id, updated);
  };

  if (!displayUser) return <div className="p-10 text-center text-slate-400">Loading Portfolio...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
            {readOnly ? 'About the Studio' : 'Studio Portfolio'}
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            {readOnly ? `Profile for ${displayUser.name}` : 'Showcase your brand and offerings'}
          </p>
        </div>
        {!readOnly && (
          <button 
            onClick={handleSavePortfolio}
            className="bg-[#10B981] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#059669] transition-colors shadow-xl"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        )}
      </div>

      {/* Photographer Profile Header (Read Only Mode) */}
      {readOnly && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <img 
                src={displayUser.avatar || `https://ui-avatars.com/api/?name=${displayUser.name}`} 
                className="w-24 h-24 rounded-3xl object-cover border-4 border-slate-50 shadow-lg"
                alt="" 
            />
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">{displayUser.name}</h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                        Professional Photographer
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3 h-3" /> {displayUser.email}
                    </span>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BIO SECTION */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-lg">Studio Bio</h3>
          </div>
          {readOnly ? (
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {bio || "No bio information provided."}
            </p>
          ) : (
            <textarea 
                className="w-full h-40 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-200 transition-all resize-none"
                placeholder="Tell your clients about your style and experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
            />
          )}
        </div>

        {/* VIDEOS SECTION */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <Video className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-slate-900 text-lg">Featured Videos</h3>
          </div>
          
          {!readOnly && (
            <div className="flex gap-2">
                <input 
                type="text" 
                placeholder="YouTube URL..." 
                className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
                value={newVideo}
                onChange={(e) => setNewVideo(e.target.value)}
                />
                <button onClick={handleAddVideo} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black">
                <Plus className="w-4 h-4" />
                </button>
            </div>
          )}

          <div className="space-y-3">
            {videoLinks.map((link, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Link className="w-4 h-4 text-slate-400 shrink-0" />
                  {readOnly ? (
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs truncate text-indigo-600 hover:underline font-bold">
                          {link}
                      </a>
                  ) : (
                      <span className="text-xs truncate text-slate-600">{link}</span>
                  )}
                </div>
                {!readOnly && (
                    <button onClick={() => removeVideo(i)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    </button>
                )}
              </div>
            ))}
            {videoLinks.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No videos added</p>}
          </div>
        </div>

        {/* IMAGE GALLERY */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-slate-900 text-lg">Sample Gallery</h3>
                </div>
                {!readOnly && (
                    <>
                        <button 
                            onClick={() => galleryInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black"
                        >
                            <UploadCloud className="w-4 h-4" /> Upload Photos
                        </button>
                        <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                    </>
                )}
            </div>
            
            {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {galleryImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm transition-transform hover:scale-105">
                            <img src={img} className="w-full h-full object-cover" alt="" />
                            {!readOnly && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => removeGalleryImage(idx)} className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-2">
                    <ImageIcon className="w-10 h-10 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No images in portfolio</p>
                </div>
            )}
        </div>

        {/* SERVICES MANAGEMENT */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-[#10B981]" />
              <h3 className="font-bold text-slate-900 text-lg">Service Menu</h3>
            </div>
          </div>

          {!readOnly && (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Service Name</label>
                <input 
                    type="text" 
                    placeholder="e.g. Wedding Album" 
                    className="w-full p-3 bg-white rounded-xl text-sm border border-slate-200 outline-none"
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                />
                </div>
                <div className="w-full md:w-32 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Price (₹)</label>
                <input 
                    type="number" 
                    placeholder="0" 
                    className="w-full p-3 bg-white rounded-xl text-sm border border-slate-200 outline-none"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value)})}
                />
                </div>
                <div className="w-full md:w-40 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Type</label>
                <select 
                    className="w-full p-3 bg-white rounded-xl text-sm border border-slate-200 outline-none"
                    value={newService.type}
                    onChange={(e) => setNewService({...newService, type: e.target.value as any})}
                >
                    <option value="service">Core Service</option>
                    <option value="addon">Add-on</option>
                </select>
                </div>
                <button 
                onClick={handleAddService}
                className="w-full md:w-auto p-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg"
                >
                <Plus className="w-4 h-4" /> Add
                </button>
            </div>
          )}

          {/* List Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => (
              <div key={service.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex justify-between items-center group hover:border-indigo-100 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${service.type === 'addon' ? 'bg-amber-400' : 'bg-indigo-500'}`} />
                    <h4 className="font-bold text-slate-800">{service.name}</h4>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mt-1">₹{service.price.toLocaleString()}</p>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2 block">{service.type}</span>
                </div>
                {!readOnly && (
                    <button onClick={() => removeService(service.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                    </button>
                )}
              </div>
            ))}
            {services.length === 0 && <p className="text-center text-slate-400 text-sm py-10 col-span-2">No services listed yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotographerPortfolio;
