import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Event, Photo, SelectionStatus, Service, Portfolio, AddonRequest, UserRole } from '../types';

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
  signup: (name: string, email: string, phone: string) => Promise<void>;
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
  }, [activeEvent?.id]);

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

  const signup = async (name: string, email: string, phone: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });
      if (res.ok) {
        const rawUser = await res.json();
        const user = normalizeData(rawUser);
        setCurrentUser(user);
        localStorage.setItem('photoSortUser', JSON.stringify(user));
        await refreshData(); 
      } else {
        alert("Signup failed. Email might already be in use.");
      }
    } catch (e) {
      console.error(e);
      alert("Signup error. Is the backend running?");
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
            setCurrentUser(updated);
            setUsers(users.map(u => u.id === updated.id ? updated : u));
        }
      } catch (e) { console.error(e); }
  };

  const addEvent = async (event: Partial<Event> & { initialClients?: any[] }) => {
    try {
        const res = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });
        if (res.ok) {
            await refreshData();
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
              setEvents(events.map(e => e.id === eventId ? updated : e));
              if (activeEvent?.id === eventId) setActiveEvent(updated);
          }
      } catch (e) { console.error(e); }
  };

  const updateEventWorkflow = async (eventId: string, status: SelectionStatus, deliveryDate?: string) => {
      const updates: any = { selectionStatus: status };
      if (deliveryDate) {
          const event = events.find(e => e.id === eventId);
          if (event) {
              updates.timeline = { ...event.timeline, deliveryEstimate: deliveryDate };
          }
      }
      await updateEvent(eventId, updates);
  };

  const deletePhoto = async (photoId: string) => {
      try {
          await fetch(`${API_URL}/photos/${photoId}`, { method: 'DELETE' });
          setPhotos(photos.filter(p => p.id !== photoId));
      } catch(e) { console.error(e); }
  };

  const togglePhotoSelection = async (photoId: string) => {
      const newSelected = new Set(selectedPhotos);
      if (newSelected.has(photoId)) newSelected.delete(photoId);
      else newSelected.add(photoId);
      setSelectedPhotos(newSelected);

      try {
          await fetch(`${API_URL}/photos/${photoId}/selection`, { method: 'POST' });
          setPhotos(photos.map(p => p.id === photoId ? { ...p, isSelected: newSelected.has(photoId) } : p));
      } catch (e) { console.error(e); }
  };

  const submitSelections = async () => {
      if (activeEvent) {
          await updateEventWorkflow(activeEvent.id, 'submitted');
          await fetch(`${API_URL}/events/${activeEvent.id}/submit-selections`, { method: 'POST' });
          alert("Selections submitted successfully!");
      }
  };

  const renamePersonInEvent = async (eventId: string, oldName: string, newName: string) => {
      setPhotos(photos.map(p => ({
          ...p,
          people: p.people.map(person => person === oldName ? newName : person)
      })));
  };

  // --- Real Upload Logic ---

  const uploadAsset = async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
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
      if (!res.ok) throw new Error("Photo upload failed");
      return await res.json(); // { url, originalFilename }
  };

  const uploadRawPhotos = async (eventId: string, files: FileList) => {
      try {
          const fileArray = Array.from(files);
          // Upload files physically first
          const uploadedFiles = await Promise.all(fileArray.map(f => uploadEventPhoto(eventId, f)));

          // Prepare metadata payload
          const photosPayload = uploadedFiles.map((fileData) => ({
              url: fileData.url,
              originalFilename: fileData.originalFilename,
              eventId,
              people: [],
              tags: [],
              isAiPick: false,
              quality: 'medium',
              category: 'Uploads',
              isSelected: false
          }));

          // Save metadata to DB
          const res = await fetch(`${API_URL}/events/${eventId}/photos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ photos: photosPayload })
          });

          if (res.ok) {
              await loadPhotos(eventId);
          } else {
              alert("Failed to save photo metadata.");
          }
      } catch (e) { 
          console.error("Batch upload failed", e); 
          alert("Upload failed. Please check server connection.");
      }
  };

  const uploadBulkEditedPhotos = async (eventId: string, files: FileList) => {
      // Logic would be similar: upload files, match with existing originals by filename, update record.
      alert(`Bulk edit upload not fully implemented yet. Use 'Upload Raw' for now.`);
  };

  const resetDatabase = async () => {
      // Needs admin endpoint
      localStorage.clear();
      window.location.reload();
  };

  const requestAddon = async (eventId: string, serviceId: string) => {
      // Logic stub
      alert("Addon request sent.");
  };

  const addPhotoComment = async (photoId: string, text: string) => {
      // Optimistic
      setPhotos(photos.map(p => {
          if (p.id === photoId) {
             const comments = p.comments || [];
             return { ...p, comments: [...comments, { id: Date.now().toString(), author: currentUser?.name || 'User', text, date: new Date().toISOString(), role: currentUser?.role || UserRole.USER }] };
          }
          return p;
      }));
  };

  const updatePhotoReviewStatus = async (photoId: string, status: 'approved' | 'changes_requested' | 'pending') => {
      setPhotos(photos.map(p => p.id === photoId ? { ...p, reviewStatus: status } : p));
  };

  const approveAllEdits = async (eventId: string) => {
      setPhotos(photos.map(p => p.eventId === eventId && p.editedUrl ? { ...p, reviewStatus: 'approved' as const } : p));
      await updateEventWorkflow(eventId, 'accepted');
  };

  const updateUserServices = async (userId: string, services: Service[]) => {
      if(currentUser) await updateUser({ ...currentUser, id: userId, services });
  };

  const updateUserPortfolio = async (userId: string, portfolio: Portfolio) => {
      if(currentUser) await updateUser({ ...currentUser, id: userId, portfolio });
  };

  const toggleUserStatus = async (userId: string) => {
      try {
          const res = await fetch(`${API_URL}/users/${userId}/status`, { method: 'PATCH' });
          if (res.ok) {
              const updatedUser = normalizeData(await res.json());
              setUsers(users.map(u => u.id === userId ? updatedUser : u));
          }
      } catch(e) { console.error(e); }
  };
  
  const refreshPhotos = async (eventId: string) => {
      await loadPhotos(eventId);
  };

  return (
    <DataContext.Provider value={{
      currentUser, users, events, activeEvent, photos, selectedPhotos, isLoading, setActiveEvent,
      login, signup, logout, updateUser, addEvent, updateEvent, updateEventWorkflow,
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