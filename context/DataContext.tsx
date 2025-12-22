
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Event, Photo, SelectionStatus, Service, Portfolio, AddonStatus, SubEvent } from '../types';

const API_URL = '/api';

interface DataContextType {
  currentUser: User | null;
  users: User[];
  events: Event[];
  activeEvent: Event | null;
  photos: Photo[];
  selectedPhotos: Set<string>;
  isLoading: boolean;
  setActiveEvent: (event: Event | null) => void;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => Promise<void>;
  addEvent: (event: Partial<Event> & { initialClients?: any[] }) => Promise<void>;
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
  refreshPhotos: (eventId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage to prevent flash of login screen or data loss on refresh
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('photoSortUser');
    return stored ? JSON.parse(stored) : null;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  
  const [activeEvent, _setActiveEvent] = useState<Event | null>(() => {
     // We can't fully restore the object without fetching, but we can store ID. 
     // For now, we'll rely on fetching events first then restoring if needed, 
     // or just let the user select again. But robust apps persist ID.
     return null;
  });

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Helper to ensure MongoDB _id is mapped to id
  const normalizeData = (item: any) => {
    if (!item) return item;
    const normalized = {
      ...item,
      id: item.id || item._id, 
    };
    // If _id exists, remove it to clean up? Optional.
    // delete normalized._id; 
    return normalized;
  };

  const setActiveEvent = (event: Event | null) => {
    _setActiveEvent(event);
    if (event) {
        localStorage.setItem('photoSortActiveEventId', event.id);
    } else {
        localStorage.removeItem('photoSortActiveEventId');
    }
  };

  const refreshData = async () => {
      setIsLoading(true);
      try {
        const [usersRes, eventsRes] = await Promise.all([
          fetch(`${API_URL}/users`),
          fetch(`${API_URL}/events`)
        ]);
        
        if (usersRes.ok) {
            const rawUsers = await usersRes.json();
            setUsers(Array.isArray(rawUsers) ? rawUsers.map(normalizeData) : []);
        }
        
        if (eventsRes.ok) {
            const rawEvents = await eventsRes.json();
            const normalizedEvents = Array.isArray(rawEvents) ? rawEvents.map(normalizeData) : [];
            setEvents(normalizedEvents);

            // Restore active event if persisted
            const storedEventId = localStorage.getItem('photoSortActiveEventId');
            if (storedEventId && !activeEvent) {
                const found = normalizedEvents.find((e: Event) => e.id === storedEventId);
                if (found) _setActiveEvent(found);
            }
        }
      } catch (e) { 
          console.error("Failed to fetch data", e); 
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (activeEvent) {
      loadPhotos(activeEvent.id);
    } else {
      setPhotos([]);
      setSelectedPhotos(new Set());
    }
  }, [activeEvent?.id]); // Only reload if ID changes

  const loadPhotos = async (eventId: string) => {
    try {
      const res = await fetch(`${API_URL}/events/${eventId}/photos?t=${Date.now()}`); // Cache bust
      if (res.ok) {
        const rawData = await res.json();
        const data: Photo[] = Array.isArray(rawData) ? rawData.map(normalizeData) : [];
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
        const rawUser = await res.json();
        const user = normalizeData(rawUser);
        setCurrentUser(user);
        localStorage.setItem('photoSortUser', JSON.stringify(user));
        await refreshData(); 
      } else {
        alert("Login failed. Please check backend connection.");
      }
    } catch (e) {
      console.error(e);
      alert("Login error. Is the backend running?");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveEvent(null);
    localStorage.removeItem('photoSortUser');
    localStorage.removeItem('photoSortActiveEventId');
  };

  const updateUser = async (user: User) => {
    try {
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (res.ok) {
        const updated = normalizeData(await res.json());
        setUsers(users.map(u => u.id === updated.id ? updated : u));
        if (currentUser?.id === updated.id) {
            setCurrentUser(updated);
            localStorage.setItem('photoSortUser', JSON.stringify(updated));
        }
      }
    } catch (e) { console.error(e); }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
        const res = await fetch(`${API_URL}/users/${userId}/status`, { method: 'PATCH' });
        if(res.ok) {
            const updated = normalizeData(await res.json());
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
        const newEvent = normalizeData(await res.json());
        setEvents([...events, newEvent]);
        setActiveEvent(newEvent);
        // If users were created/updated during event creation, refresh users
        const usersRes = await fetch(`${API_URL}/users`);
        if(usersRes.ok) setUsers(Array.isArray(await usersRes.json()) ? (await usersRes.json()).map(normalizeData) : []);
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
        const updated = normalizeData(await res.json());
        setEvents(events.map(e => e.id === updated.id ? updated : e));
        if (activeEvent?.id === updated.id) _setActiveEvent(updated);
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
    try {
        await fetch(`${API_URL}/photos/${photoId}`, { method: 'DELETE' });
        setPhotos(photos.filter(p => p.id !== photoId));
    } catch (e) { console.error(e); }
  };

  const togglePhotoSelection = async (photoId: string) => {
    try {
        const res = await fetch(`${API_URL}/photos/${photoId}/selection`, { method: 'POST' });
        if (res.ok) {
            const updated = normalizeData(await res.json());
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
      // Backend implementation required for robust renaming, doing optimistic update here
      const updatedPhotos = photos.map(p => {
          if (p.people.includes(oldName)) {
              return { ...p, people: p.people.map(name => name === oldName ? newName : name) };
          }
          return p;
      });
      setPhotos(updatedPhotos);
      // In real app: POST /api/events/:id/rename-person
  };

  const uploadAsset = async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData
      });
      if (!res.ok) throw new Error("Asset upload failed");
      const data = await res.json();
      return data.url;
  };

  const uploadEventPhoto = async (eventId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/events/${eventId}/upload`, {
          method: 'POST',
          body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      return await res.json(); // Returns { url: string, originalFilename: string }
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
      // For now, simple mock or just logging
      console.log(`Uploaded ${files.length} edits for event ${eventId}`);
      // In a real implementation: Match filenames to photos, upload to /edit endpoint
      alert("Bulk edit upload feature pending backend implementation.");
  };

  const resetDatabase = async () => {
      // Admin only function
      // In real app: POST /api/admin/reset
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
     // Optimistic update
     const updatedPhotos = photos.map(p => {
         if (p.id === photoId) {
             const comments = p.comments || [];
             return { ...p, comments: [...comments, { id: Date.now().toString(), author: currentUser.name, text, date: new Date().toISOString(), role: currentUser.role }]};
         }
         return p;
     });
     setPhotos(updatedPhotos);
     // Real backend sync: POST /api/photos/:id/comment
  };

  const updatePhotoReviewStatus = async (photoId: string, status: 'approved' | 'changes_requested' | 'pending') => {
      const updatedPhotos = photos.map(p => p.id === photoId ? { ...p, reviewStatus: status } : p);
      setPhotos(updatedPhotos);
      // Real backend sync: PATCH /api/photos/:id
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

  const refreshPhotos = async (eventId: string) => {
      await loadPhotos(eventId);
  };

  return (
    <DataContext.Provider value={{
      currentUser, users, events, activeEvent, photos, selectedPhotos, isLoading,
      setActiveEvent, login, logout, updateUser, addEvent, updateEvent, updateEventWorkflow,
      deletePhoto, togglePhotoSelection, submitSelections, renamePersonInEvent,
      uploadAsset, uploadRawPhotos, uploadBulkEditedPhotos, resetDatabase,
      requestAddon, addPhotoComment, updatePhotoReviewStatus, approveAllEdits,
      updateUserServices, updateUserPortfolio, toggleUserStatus, refreshPhotos
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
