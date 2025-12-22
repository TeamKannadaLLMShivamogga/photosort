
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Save, Plus, Trash2, Video, Image as ImageIcon, Link, FileText, Briefcase, UploadCloud, X, User, Play, Loader2, Edit2, Maximize2, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { Service, Portfolio, ServiceType } from '../../types';

interface PortfolioProps {
  targetUserId?: string;
  readOnly?: boolean;
}

const PhotographerPortfolio: React.FC<PortfolioProps> = ({ targetUserId, readOnly = false }) => {
  const { currentUser: loggedInUser, users, updateUserServices, updateUserPortfolio, uploadAsset, updateUser } = useData();
  
  // Determine which user's portfolio to show
  const displayUser = targetUserId 
    ? users.find(u => u.id === targetUserId) 
    : loggedInUser;

  const [bio, setBio] = useState('');
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [newVideo, setNewVideo] = useState('');
  
  // UI States
  const [isUploading, setIsUploading] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  
  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxType, setLightboxType] = useState<'video' | 'image' | null>(null);
  
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // State tracking for preservation
  const lastLoadedId = useRef<string | null>(null);
  
  // New Service State
  const [newService, setNewService] = useState({ name: '', price: 0, description: '', type: 'service' as ServiceType });

  // Sync services (live data)
  useEffect(() => {
    if (displayUser) {
      setServices(displayUser.services || []);
    }
  }, [displayUser]);

  // Sync Draft Fields (Bio, Gallery, Videos)
  useEffect(() => {
    if (!displayUser) return;

    // If read-only, always sync with backend data
    if (readOnly) {
        setBio(displayUser.portfolio?.bio || '');
        setVideoLinks(displayUser.portfolio?.videoLinks || []);
        setGalleryImages(displayUser.portfolio?.galleryImages || []);
    } else {
        // If editing, only initialize when switching users to preserve unsaved drafts
        if (lastLoadedId.current !== displayUser.id) {
            setBio(displayUser.portfolio?.bio || '');
            setVideoLinks(displayUser.portfolio?.videoLinks || []);
            setGalleryImages(displayUser.portfolio?.galleryImages || []);
            lastLoadedId.current = displayUser.id;
        }
    }
  }, [displayUser, readOnly]);

  const handleSavePortfolio = () => {
    if (!displayUser || readOnly) return;
    updateUserPortfolio(displayUser.id, {
        bio,
        videoLinks,
        galleryImages
    });
    alert('Portfolio updated!');
  };

  // --- Avatar Upload ---
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && displayUser) {
        setIsUploading(true);
        try {
            const url = await uploadAsset(e.target.files[0]);
            // Update the user object directly
            await updateUser({ ...displayUser, avatar: url });
        } catch (error) {
            console.error("Avatar upload failed", error);
            alert("Failed to upload avatar");
        } finally {
            setIsUploading(false);
        }
    }
  };

  // --- Video Logic ---
  const handleAddVideo = () => {
    if (newVideo) {
      setVideoLinks([...videoLinks, newVideo]);
      setNewVideo('');
    }
  };

  const removeVideo = (idx: number) => {
    setVideoLinks(videoLinks.filter((_, i) => i !== idx));
  };

  // --- Image Logic ---
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setIsUploading(true);
        try {
            const files = Array.from(e.target.files);
            const uploadPromises = files.map(file => uploadAsset(file));
            const urls = await Promise.all(uploadPromises);
            setGalleryImages(prev => [...prev, ...urls]);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload one or more images");
        } finally {
            setIsUploading(false);
            if (galleryInputRef.current) galleryInputRef.current.value = '';
        }
    }
  };

  const removeGalleryImage = (idx: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== idx));
  };

  // --- Service Logic ---
  const handleAddOrUpdateService = () => {
    if (newService.name && newService.price > 0) {
      if (editingServiceId) {
        // Update existing
        const updated = services.map(s => s.id === editingServiceId ? { ...s, ...newService, id: s.id } : s);
        setServices(updated);
        if (displayUser) updateUserServices(displayUser.id, updated);
        setEditingServiceId(null);
      } else {
        // Create new
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
      }
      setNewService({ name: '', price: 0, description: '', type: 'service' as ServiceType });
    }
  };

  const handleEditService = (service: Service) => {
      setNewService({
          name: service.name,
          price: service.price,
          description: service.description || '',
          type: service.type
      });
      setEditingServiceId(service.id);
  };

  const removeService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    if (displayUser) updateUserServices(displayUser.id, updated);
  };

  // --- Lightbox Logic ---
  const openLightbox = (type: 'video' | 'image', index: number) => {
      setLightboxType(type);
      setLightboxIndex(index);
  };

  const closeLightbox = () => {
      setLightboxIndex(null);
      setLightboxType(null);
  };

  const nextMedia = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (lightboxIndex === null || !lightboxType) return;
      const total = lightboxType === 'video' ? videoLinks.length : galleryImages.length;
      setLightboxIndex((lightboxIndex + 1) % total);
  };

  const prevMedia = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (lightboxIndex === null || !lightboxType) return;
      const total = lightboxType === 'video' ? videoLinks.length : galleryImages.length;
      setLightboxIndex((lightboxIndex - 1 + total) % total);
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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
            className="bg-[#10B981] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#059669] transition-colors shadow-xl active:scale-95"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        )}
      </div>

      {/* Photographer Profile Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
                <img 
                    src={displayUser.avatar || `https://ui-avatars.com/api/?name=${displayUser.name}`} 
                    className="w-32 h-32 rounded-[2.5rem] object-cover border-8 border-slate-50 shadow-xl"
                    alt="" 
                />
                {!readOnly && (
                    <>
                        <button 
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        >
                            <Camera className="w-8 h-8" />
                        </button>
                        <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </>
                )}
            </div>
            <div className="space-y-2 text-center md:text-left">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{displayUser.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                        Professional Photographer
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3 h-3" /> {displayUser.email}
                    </span>
                </div>
            </div>
      </div>

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
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-slate-900 text-lg">Featured Videos</h3>
            </div>
            {readOnly && videoLinks.length > 0 && (
                <button onClick={() => openLightbox('video', 0)} className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1">
                    View All <Maximize2 className="w-3 h-3" />
                </button>
            )}
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

          {/* Video Carousel */}
          {readOnly ? (
             <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                {videoLinks.map((link, i) => {
                    const ytid = getYouTubeId(link);
                    return (
                        <button 
                            key={i} 
                            onClick={() => openLightbox('video', i)}
                            className="relative shrink-0 w-64 aspect-video rounded-xl overflow-hidden group shadow-md border border-slate-200 hover:shadow-xl transition-all snap-start"
                        >
                            <img 
                                src={ytid ? `https://img.youtube.com/vi/${ytid}/mqdefault.jpg` : 'https://via.placeholder.com/300x200?text=Video'} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                alt="Video Thumbnail" 
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play className="w-4 h-4 text-slate-900 ml-0.5" />
                                </div>
                            </div>
                        </button>
                    );
                })}
                {videoLinks.length === 0 && <p className="text-xs text-slate-400 italic">No videos featured.</p>}
             </div>
          ) : (
            <div className="space-y-3">
                {videoLinks.map((link, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                    <Link className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs truncate text-slate-600">{link}</span>
                    </div>
                    <button onClick={() => removeVideo(i)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                ))}
                {videoLinks.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No videos added</p>}
            </div>
          )}
        </div>

        {/* IMAGE GALLERY */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-slate-900 text-lg">Sample Gallery</h3>
                </div>
                {!readOnly ? (
                    <>
                        <button 
                            disabled={isUploading}
                            onClick={() => galleryInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} Upload Photos
                        </button>
                        <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} />
                    </>
                ) : (
                    galleryImages.length > 0 && (
                        <button onClick={() => openLightbox('image', 0)} className="text-[10px] font-bold text-purple-600 hover:underline flex items-center gap-1">
                            View All <Maximize2 className="w-3 h-3" />
                        </button>
                    )
                )}
            </div>
            
            {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {galleryImages.slice(0, readOnly ? 6 : undefined).map((img, idx) => (
                        <div key={idx} onClick={() => readOnly && openLightbox('image', idx)} className={`relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm transition-transform ${readOnly ? 'cursor-pointer hover:scale-105' : ''}`}>
                            <img src={img} className="w-full h-full object-cover" alt="" />
                            {readOnly ? (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => removeGalleryImage(idx)} className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {readOnly && galleryImages.length > 6 && (
                        <button onClick={() => openLightbox('image', 6)} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                            <span className="text-xl font-black">+{galleryImages.length - 6}</span>
                            <span className="text-[10px] font-bold uppercase">More</span>
                        </button>
                    )}
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
                onClick={handleAddOrUpdateService}
                className="w-full md:w-auto p-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg min-w-[100px]"
                >
                {editingServiceId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                {editingServiceId ? 'Update' : 'Add'}
                </button>
                {editingServiceId && (
                    <button 
                        onClick={() => { setEditingServiceId(null); setNewService({name:'', price:0, description:'', type:'service' as ServiceType}); }}
                        className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:text-slate-800"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
          )}

          {/* List Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => (
              <div key={service.id} className={`p-5 bg-white border rounded-2xl shadow-sm flex justify-between items-center group transition-colors ${editingServiceId === service.id ? 'border-[#10B981] ring-2 ring-[#10B981]/20' : 'border-slate-100 hover:border-indigo-100'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${service.type === 'addon' ? 'bg-amber-400' : 'bg-indigo-500'}`} />
                    <h4 className="font-bold text-slate-800">{service.name}</h4>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mt-1">₹{service.price.toLocaleString()}</p>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2 block">{service.type}</span>
                </div>
                {!readOnly && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditService(service)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeService(service.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
              </div>
            ))}
            {services.length === 0 && <p className="text-center text-slate-400 text-sm py-10 col-span-2">No services listed yet.</p>}
          </div>
        </div>
      </div>

      {/* FULL SCREEN LIGHTBOX */}
      {lightboxIndex !== null && lightboxType && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
              <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 z-50 bg-black/50 rounded-full">
                  <X className="w-8 h-8" />
              </button>

              <button onClick={prevMedia} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all z-50">
                  <ChevronLeft className="w-10 h-10" />
              </button>

              <div className="w-full h-full p-4 md:p-12 flex items-center justify-center">
                  {lightboxType === 'video' ? (
                      <div className="w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                          <iframe 
                            key={videoLinks[lightboxIndex]}
                            src={`https://www.youtube.com/embed/${getYouTubeId(videoLinks[lightboxIndex])}?autoplay=1&rel=0`} 
                            className="w-full h-full" 
                            title="YouTube Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen 
                        />
                      </div>
                  ) : (
                      <img 
                        src={galleryImages[lightboxIndex]} 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                        alt="Gallery" 
                      />
                  )}
              </div>

              <button onClick={nextMedia} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all z-50">
                  <ChevronRight className="w-10 h-10" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm font-bold tracking-widest">
                  {lightboxIndex + 1} / {lightboxType === 'video' ? videoLinks.length : galleryImages.length}
              </div>
          </div>
      )}
    </div>
  );
};

export default PhotographerPortfolio;
