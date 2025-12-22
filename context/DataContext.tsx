import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Event, Photo, SelectionStatus, Service, Portfolio } from '../types';

const API_URL = '/api';

interface DataContextType {
  currentUser: User | null;
  users: User[];
  events: Event[];
  activeEvent: Event | null;
  photos: Photo[];
  selectedPhotos: Set<string>;
  setActiveEvent: (event: Event | null) => void;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => Promise<void>;
  addEvent: (event: Partial<Event>) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  updateEventWorkflow: (eventId: string, status: SelectionStatus, deliveryDate?: string) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  togglePhotoSelection: (photoId: string) => Promise<void>;
  submitSelections: () => Promise<void>;
  renamePersonInEvent: (eventId: string, oldName: string, newName: string) => Promise<void>;
  uploadAsset: (file: File) => Promise<string>;
  uploadRawPhotos: (eventId: string, files: FileList) => Promise<void>;
  uploadBulkEditedPhotos: (eventId: string, files: FileList) => Promise<void>;
  resetDatabase: () => Promise<void>;
  requestAddon: (eventId: string, serviceId: string) => Promise<void>;
  addPhotoComment: (photoId: string, text: string) => Promise<void>;
  updatePhotoReviewStatus: (photoId: string, status: 'approved' | 'changes_requested' | 'pending') => Promise<void>;
  approveAllEdits: (eventId: string) => Promise<void>;
  updateUserServices: (userId: string, services: Service[]) => Promise<void>;
  updateUserPortfolio: (userId: string, portfolio: Portfolio) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsers();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (activeEvent) {
      loadPhotos(activeEvent.id);
    } else {
      setPhotos([]);
      setSelectedPhotos(new Set());
    }
  }, [activeEvent]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error("Failed to fetch users", e); }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`);
      if (res.ok) setEvents(await res.json());
    } catch (e) { console.error("Failed to fetch events", e); }
  };

  const loadPhotos = async (eventId: string) => {
    try {
      const res = await fetch(`${API_URL}/events/${eventId}/photos`);
      if (res.ok) {
        const data: Photo[] = await res.json();
        setPhotos(data);
        const selected = new Set(data.filter(p => p.isSelected).map(p => p.id));
        setSelectedPhotos(selected);
      }
    } catch (e) { console.error("Failed to load photos", e); }
  };

  const login = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        await fetchUsers(); 
        await fetchEvents();
      } else {
        alert("Login failed");
      }
    } catch (e) {
      console.error(e);
      alert("Login error");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveEvent(null);
  };

  const updateUser = async (user: User) => {
    try {
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u.id === updated.id ? updated : u));
        if (currentUser?.id === updated.id) setCurrentUser(updated);
      }
    } catch (e) { console.error(e); }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
        const res = await fetch(`${API_URL}/users/${userId}/status`, { method: 'PATCH' });
        if(res.ok) {
            const updated = await res.json();
            setUsers(users.map(u => u.id === updated.id ? updated : u));
        }
    } catch (e) { console.error(e); }
  };

  const addEvent = async (event: Partial<Event>) => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      if (res.ok) {
        const newEvent = await res.json();
        setEvents([...events, newEvent]);
        setActiveEvent(newEvent);
      }
    } catch (e) { console.error(e); }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    try {
      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setEvents(events.map(e => e.id === updated.id ? updated : e));
        if (activeEvent?.id === updated.id) setActiveEvent(updated);
      }
    } catch (e) { console.error(e); }
  };

  const updateEventWorkflow = async (eventId: string, status: SelectionStatus, deliveryDate?: string) => {
    const updates: any = { selectionStatus: status };
    if (deliveryDate) {
        updates.timeline = { ...activeEvent?.timeline, deliveryEstimate: deliveryDate };
    }
    await updateEvent(eventId, updates);
  };

  const deletePhoto = async (photoId: string) => {
    setPhotos(photos.filter(p => p.id !== photoId));
    // Implementation for backend delete would go here
  };

  const togglePhotoSelection = async (photoId: string) => {
    try {
        const res = await fetch(`${API_URL}/photos/${photoId}/selection`, { method: 'POST' });
        if (res.ok) {
            const updated = await res.json();
            setPhotos(photos.map(p => p.id === updated.id ? updated : p));
            
            const newSelected = new Set(selectedPhotos);
            if (updated.isSelected) newSelected.add(updated.id);
            else newSelected.delete(updated.id);
            setSelectedPhotos(newSelected);
        }
    } catch (e) { console.error(e); }
  };

  const submitSelections = async () => {
    if (activeEvent) {
        await updateEventWorkflow(activeEvent.id, 'submitted');
        try {
            await fetch(`${API_URL}/events/${activeEvent.id}/submit-selections`, { method: 'POST' });
        } catch (e) { console.error(e); }
    }
  };

  const renamePersonInEvent = async (eventId: string, oldName: string, newName: string) => {
      const updatedPhotos = photos.map(p => {
          if (p.people.includes(oldName)) {
              return { ...p, people: p.people.map(name => name === oldName ? newName : name) };
          }
          return p;
      });
      setPhotos(updatedPhotos);
      // Backend sync needed here in real app
  };

  const uploadAsset = async (file: File) => {
      return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
      });
  };

  const uploadEventPhoto = async (eventId: string, file: File) => {
      const url = await uploadAsset(file);
      return { url, originalFilename: file.name };
  };

  const uploadRawPhotos = async (eventId: string, files: FileList) => {
      try {
          const fileArray = Array.from(files);
          const uploadPromises = fileArray.map(file => uploadEventPhoto(eventId, file));
          const uploadedFiles = await Promise.all(uploadPromises);

          const photosPayload = uploadedFiles.map((fileData) => ({
              url: fileData.url,
              eventId,
              tags: [],
              people: [],
              isAiPick: false,
              quality: 'high',
              category: 'Unsorted',
              isSelected: false,
              originalFilename: fileData.originalFilename 
          }));

          const res = await fetch(`${API_URL}/events/${eventId}/photos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ photos: photosPayload })
          });

          if (!res.ok) throw new Error("Failed to save photos");
          await loadPhotos(eventId);
      } catch (error) {
          console.error("Upload raw photos failed", error);
          throw error;
      }
  };

  const uploadBulkEditedPhotos = async (eventId: string, files: FileList) => {
      // Logic for matching edits to originals would be here
      console.log(`Uploaded ${files.length} edits for event ${eventId}`);
  };

  const resetDatabase = async () => {
      console.log("Resetting database...");
  };

  const requestAddon = async (eventId: string, serviceId: string) => {
      if (activeEvent) {
          const newRequest = { id: `req-${Date.now()}`, serviceId, date: new Date().toISOString(), status: 'pending' as const };
          const updatedRequests = [...(activeEvent.addonRequests || []), newRequest];
          await updateEvent(eventId, { addonRequests: updatedRequests });
      }
  };

  const addPhotoComment = async (photoId: string, text: string) => {
     if(!currentUser) return;
     const updatedPhotos = photos.map(p => {
         if (p.id === photoId) {
             const comments = p.comments || [];
             return { ...p, comments: [...comments, { id: Date.now().toString(), author: currentUser.name, text, date: new Date().toISOString(), role: currentUser.role }]};
         }
         return p;
     });
     setPhotos(updatedPhotos);
  };

  const updatePhotoReviewStatus = async (photoId: string, status: 'approved' | 'changes_requested' | 'pending') => {
      const updatedPhotos = photos.map(p => p.id === photoId ? { ...p, reviewStatus: status } : p);
      setPhotos(updatedPhotos);
  };

  const approveAllEdits = async (eventId: string) => {
      const updatedPhotos = photos.map(p => p.editedUrl ? { ...p, reviewStatus: 'approved' as const } : p);
      setPhotos(updatedPhotos);
      await updateEventWorkflow(eventId, 'accepted');
  };

  const updateUserServices = async (userId: string, services: Service[]) => {
      const user = users.find(u => u.id === userId);
      if (user) {
          await updateUser({ ...user, services });
      }
  };

  const updateUserPortfolio = async (userId: string, portfolio: Portfolio) => {
      const user = users.find(u => u.id === userId);
      if (user) {
          await updateUser({ ...user, portfolio });
      }
  };

  return (
    <DataContext.Provider value={{
      currentUser, users, events, activeEvent, photos, selectedPhotos,
      setActiveEvent, login, logout, updateUser, addEvent, updateEvent, updateEventWorkflow,
      deletePhoto, togglePhotoSelection, submitSelections, renamePersonInEvent,
      uploadAsset, uploadRawPhotos, uploadBulkEditedPhotos, resetDatabase,
      requestAddon, addPhotoComment, updatePhotoReviewStatus, approveAllEdits,
      updateUserServices, updateUserPortfolio, toggleUserStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};