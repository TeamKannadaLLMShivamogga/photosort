
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Event, Photo, SelectionStatus, PhotoReviewStatus, Service, Portfolio, UserRole, AddonRequest } from '../types';

interface DataContextType {
  currentUser: User | null;
  activeEvent: Event | null;
  events: Event[];
  photos: Photo[];
  users: User[];
  selectedPhotos: Set<string>;
  login: (email: string) => Promise<void>;
  signup: (name: string, email: string, phone: string) => Promise<void>;
  logout: () => void;
  setActiveEvent: (event: Event | null) => void;
  refreshPhotos: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  togglePhotoSelection: (photoId: string) => void;
  submitSelections: () => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  updateEventWorkflow: (eventId: string, status: SelectionStatus, deliveryDate?: string) => Promise<void>;
  recordPayment: (eventId: string, amount: number, date: string, method: string, note?: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  addEvent: (event: any) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  updateUserServices: (userId: string, services: Service[]) => Promise<void>;
  updateUserPortfolio: (userId: string, portfolio: Portfolio) => Promise<void>;
  uploadAsset: (file: File) => Promise<string>;
  uploadRawPhotos: (eventId: string, files: FileList) => Promise<void>;
  uploadBulkEditedPhotos: (eventId: string, files: FileList) => Promise<void>;
  renamePersonInEvent: (eventId: string, oldName: string, newName: string) => Promise<void>;
  requestAddon: (eventId: string, serviceId: string) => Promise<void>;
  addPhotoComment: (photoId: string, text: string) => Promise<void>;
  updatePhotoReviewStatus: (photoId: string, status: PhotoReviewStatus) => Promise<void>;
  approveAllEdits: (eventId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Helper to ensure 'id' exists (mapping from _id if necessary)
const fixId = (item: any) => {
    if (!item) return item;
    if (item._id && !item.id) {
        return { ...item, id: item._id };
    }
    return item;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  const API_URL = '/api';

  useEffect(() => {
    fetchUsers();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (activeEvent) {
        fetchPhotos(activeEvent.id);
    }
  }, [activeEvent]);

  // Sync selectedPhotos set with photos from DB
  useEffect(() => {
      const selected = new Set(photos.filter(p => p.isSelected).map(p => p.id));
      setSelectedPhotos(selected);
  }, [photos]);

  const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/users`);
        const data = await res.json();
        setUsers(data.map(fixId));
      } catch (e) { console.error("Fetch Users Error:", e); }
  };

  const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/events`);
        const data = await res.json();
        setEvents(data.map(fixId));
      } catch (e) { console.error("Fetch Events Error:", e); }
  };

  const fetchPhotos = async (eventId: string) => {
      try {
        const res = await fetch(`${API_URL}/events/${eventId}/photos`);
        const data = await res.json();
        setPhotos(data.map(fixId));
      } catch (e) { console.error("Fetch Photos Error:", e); }
  };

  const login = async (email: string) => {
      try {
          const res = await fetch(`${API_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
          });
          const user = await res.json();
          setCurrentUser(fixId(user));
          // Refresh events to ensure we have the latest access rights
          fetchEvents(); 
      } catch (e) { console.error("Login Error:", e); }
  };

  const signup = async (name: string, email: string, phone: string) => {
      try {
          const res = await fetch(`${API_URL}/users`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, phone, role: 'PHOTOGRAPHER' })
          });
          const user = await res.json();
          setCurrentUser(fixId(user));
          fetchEvents();
      } catch (e) { console.error(e); }
  };

  const logout = () => {
      setCurrentUser(null);
      setActiveEvent(null);
      setPhotos([]);
  };

  const refreshPhotos = async () => {
      if (activeEvent) await fetchPhotos(activeEvent.id);
  };

  const refreshEvents = async () => {
      await fetchEvents();
  };

  const togglePhotoSelection = async (photoId: string) => {
      try {
          // Optimistic update
          const isSelected = selectedPhotos.has(photoId);
          const newSet = new Set(selectedPhotos);
          if (isSelected) newSet.delete(photoId);
          else newSet.add(photoId);
          setSelectedPhotos(newSet);

          await fetch(`${API_URL}/photos/${photoId}/selection`, { method: 'POST' });
          
          setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, isSelected: !isSelected } : p));
      } catch (e) { 
          console.error(e); 
      }
  };

  const submitSelections = async () => {
      if (!activeEvent) return;
      try {
          await updateEventWorkflow(activeEvent.id, 'submitted');
      } catch (e) { console.error(e); }
  };

  const deletePhoto = async (photoId: string) => {
      try {
          await fetch(`${API_URL}/photos/${photoId}`, { method: 'DELETE' });
          setPhotos(prev => prev.filter(p => p.id !== photoId));
      } catch(e) { console.error(e); }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
      try {
          const res = await fetch(`${API_URL}/events/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates)
          });
          const updated = await res.json();
          const fixed = fixId(updated);
          setEvents(prev => prev.map(e => e.id === id ? fixed : e));
          if (activeEvent?.id === id) setActiveEvent(fixed);
      } catch (e) { console.error(e); }
  };

  const updateEventWorkflow = async (eventId: string, status: SelectionStatus, deliveryDate?: string) => {
      const updates: any = { selectionStatus: status };
      if (deliveryDate) {
          updates.timeline = { ...activeEvent?.timeline, deliveryEstimate: deliveryDate };
      }
      await updateEvent(eventId, updates);
  };

  const recordPayment = async (eventId: string, amount: number, date: string, method: string, note?: string) => {
      const event = events.find(e => e.id === eventId);
      if (!event) return;
      
      const newPayment = { id: `pay-${Date.now()}`, date, amount, method, note };
      const updatedHistory = [...(event.paymentHistory || []), newPayment];
      const newPaidAmount = (event.paidAmount || 0) + amount;
      const paymentStatus = newPaidAmount >= (event.price || 0) ? 'paid' : 'partial';
      
      await updateEvent(eventId, { 
          paymentHistory: updatedHistory, 
          paidAmount: newPaidAmount, 
          paymentStatus 
      });
  };

  const deleteEvent = async (eventId: string) => {
      try {
          await fetch(`${API_URL}/events/${eventId}`, { method: 'DELETE' });
          setEvents(prev => prev.filter(e => e.id !== eventId));
          if (activeEvent?.id === eventId) setActiveEvent(null);
      } catch (e) { console.error(e); }
  };

  const addEvent = async (eventData: any) => {
      try {
          const res = await fetch(`${API_URL}/events`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(eventData)
          });
          const newEvent = await res.json();
          setEvents(prev => [...prev, fixId(newEvent)]);
      } catch (e) { console.error(e); }
  };

  const toggleUserStatus = async (userId: string) => {
      try {
          const res = await fetch(`${API_URL}/users/${userId}/status`, { method: 'PATCH' });
          const updated = await res.json();
          const fixed = fixId(updated);
          setUsers(prev => prev.map(u => u.id === userId ? fixed : u));
      } catch (e) { console.error(e); }
  };

  const resetDatabase = async () => {
      console.log("Reset database requested");
  };

  const updateUser = async (user: User) => {
      try {
          const res = await fetch(`${API_URL}/users/${user.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(user)
          });
          const updated = await res.json();
          const fixed = fixId(updated);
          setUsers(prev => prev.map(u => u.id === user.id ? fixed : u));
          if (currentUser?.id === user.id) setCurrentUser(fixed);
      } catch (e) { console.error(e); }
  };

  const updateUserServices = async (userId: string, services: Service[]) => {
      const user = users.find(u => u.id === userId);
      if (user) await updateUser({ ...user, services });
  };

  const updateUserPortfolio = async (userId: string, portfolio: Portfolio) => {
      const user = users.find(u => u.id === userId);
      if (user) await updateUser({ ...user, portfolio });
  };

  const uploadAsset = async (file: File): Promise<string> => {
      // In a real app, this would upload to S3/Cloudinary or the backend /upload endpoint
      // Here we assume the backend handles multipart upload
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData
      });
      const data = await res.json();
      return data.url;
  };

  const uploadRawPhotos = async (eventId: string, files: FileList) => {
      // Create photos array from uploads
      const photoObjects = [];
      // Use uploadAsset sequentially or parallel
      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // We assume a dedicated endpoint or reuse generic one
          // For bulk efficiency, usually we upload files and backend creates records
          // Here we follow the existing pattern: upload file -> get URL -> create record
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch(`${API_URL}/events/${eventId}/upload`, { method: 'POST', body: formData });
          const data = await res.json();
          
          photoObjects.push({
              url: data.url,
              tags: [],
              people: [],
              category: 'General',
              originalSize: file.size,
              quality: 'high',
              originalFilename: data.originalFilename
          });
      }
      
      await fetch(`${API_URL}/events/${eventId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photos: photoObjects })
      });
      await fetchPhotos(eventId);
  };

  const uploadBulkEditedPhotos = async (eventId: string, files: FileList) => {
      // Implementation for edits would involve matching filenames
      // Similar to uploadRawPhotos but updating 'editedUrl'
      console.log("Bulk edit upload not fully implemented in mock.");
  };

  const renamePersonInEvent = async (eventId: string, oldName: string, newName: string) => {
      setPhotos(prev => prev.map(p => {
          if (p.eventId === eventId && p.people.includes(oldName)) {
              return { ...p, people: p.people.map(person => person === oldName ? newName : person) };
          }
          return p;
      }));
  };

  const requestAddon = async (eventId: string, serviceId: string) => {
     console.log(`Requested addon ${serviceId} for event ${eventId}`);
  };

  const addPhotoComment = async (photoId: string, text: string) => {
      setPhotos(prev => prev.map(p => {
          if (p.id === photoId) {
              const comments = p.comments || [];
              return { ...p, comments: [...comments, { id: Date.now().toString(), author: currentUser?.name || 'User', text, date: new Date().toISOString(), role: currentUser?.role || UserRole.USER }] };
          }
          return p;
      }));
  };

  const updatePhotoReviewStatus = async (photoId: string, status: PhotoReviewStatus) => {
      setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, reviewStatus: status } : p));
  };

  const approveAllEdits = async (eventId: string) => {
      setPhotos(prev => prev.map(p => p.eventId === eventId && p.editedUrl ? { ...p, reviewStatus: 'approved' } : p));
      await updateEventWorkflow(eventId, 'accepted');
  };

  const value = {
      currentUser,
      activeEvent,
      events,
      photos,
      users,
      selectedPhotos,
      login,
      signup,
      logout,
      setActiveEvent,
      refreshPhotos,
      refreshEvents,
      togglePhotoSelection,
      submitSelections,
      deletePhoto,
      updateEvent,
      updateEventWorkflow,
      recordPayment,
      deleteEvent,
      addEvent,
      toggleUserStatus,
      resetDatabase,
      updateUser,
      updateUserServices,
      updateUserPortfolio,
      uploadAsset,
      uploadRawPhotos,
      uploadBulkEditedPhotos,
      renamePersonInEvent,
      requestAddon,
      addPhotoComment,
      updatePhotoReviewStatus,
      approveAllEdits
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
