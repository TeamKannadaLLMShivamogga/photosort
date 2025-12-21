
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Event, Photo, Notification, SubEvent, SelectionStatus, Comment } from '../types';

// CHANGED: Use relative path to utilize Vite Proxy (solves CORS)
const API_URL = '/api';

interface DataContextType {
  currentUser: User | null;
  users: User[];
  events: Event[];
  photos: Photo[];
  notifications: Notification[];
  activeEvent: Event | null;
  selectedPhotos: Set<string>;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  setActiveEvent: (event: Event | null) => void;
  togglePhotoSelection: (id: string) => void;
  submitSelections: () => void;
  addEvent: (event: Partial<Event> & { initialClients?: any[] }) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addUser: (user: Partial<User>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addSubEvent: (eventId: string, subEvent: SubEvent) => Promise<void>;
  removeSubEvent: (eventId: string, subEventId: string) => void;
  toggleUserStatus: (userId: string) => Promise<void>;
  refreshPhotos: () => Promise<void>;
  recordPayment: (eventId: string, amount: number, date?: string) => Promise<void>;
  assignUserToEvent: (eventId: string, userDetails: { name: string, email: string, phone?: string }) => Promise<void>;
  removeUserFromEvent: (eventId: string, userId: string) => Promise<void>;
  updateEventWorkflow: (eventId: string, status: SelectionStatus, deliveryEstimate?: string, note?: string) => Promise<void>;
  uploadEditedPhoto: (photoId: string, file: File) => Promise<void>;
  addPhotoComment: (photoId: string, text: string) => Promise<void>;
  updatePhotoReviewStatus: (photoId: string, status: 'approved' | 'changes_requested') => Promise<void>;
  resolveComment: (photoId: string, commentId: string) => Promise<void>;
  approveAllEdits: (eventId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeEvent, _setActiveEvent] = useState<Event | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const setActiveEvent = (event: Event | null) => {
    _setActiveEvent(event);
    if (event) {
        localStorage.setItem('photoSortActiveEventId', event.id);
    } else {
        localStorage.removeItem('photoSortActiveEventId');
    }
  };

  const normalizeData = (item: any) => {
    if (!item) return item;
    return {
      ...item,
      id: item.id || item._id, 
    };
  };

  const refreshUsers = async () => {
      try {
          const res = await fetch(`${API_URL}/users`);
          if (res.ok) {
              const rawUsers = await res.json();
              setUsers(Array.isArray(rawUsers) ? rawUsers.map(normalizeData) : []);
          }
      } catch (e) { console.error("Failed to refresh users", e); }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem('photoSortUser');
      if (storedUser) {
          try { setCurrentUser(JSON.parse(storedUser)); } catch (e) { console.error("Failed to parse stored user", e); }
      }

      try {
        const [usersRes, eventsRes] = await Promise.all([
          fetch(`${API_URL}/users`),
          fetch(`${API_URL}/events`)
        ]);
        
        const rawUsersData = await usersRes.json();
        const rawEventsData = await eventsRes.json();
        const usersData = Array.isArray(rawUsersData) ? rawUsersData.map(normalizeData) : [];
        const eventsData = Array.isArray(rawEventsData) ? rawEventsData.map(normalizeData) : [];
        
        setUsers(usersData);
        setEvents(eventsData);

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            const freshUser = usersData.find((u: User) => u.id === parsedUser.id || u.email === parsedUser.email);
            if (freshUser) {
                setCurrentUser(freshUser);
                localStorage.setItem('photoSortUser', JSON.stringify(freshUser));
            } else {
                logout();
            }
        }

        const storedEventId = localStorage.getItem('photoSortActiveEventId');
        if (storedEventId) {
            const rehydratedEvent = eventsData.find((e: Event) => e.id === storedEventId);
            if (rehydratedEvent) {
                _setActiveEvent(rehydratedEvent);
            } else {
                _setActiveEvent(null);
                localStorage.removeItem('photoSortActiveEventId');
            }
        }

      } catch (error) {
        console.error("Backend Connection Failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const loadPhotos = async (eventId: string) => {
      try {
        const res = await fetch(`${API_URL}/events/${eventId}/photos`);
        if (!res.ok) throw new Error("Backend unavailable for photos");
        const rawData = await res.json();
        const data = Array.isArray(rawData) ? rawData.map(normalizeData) : [];
        setPhotos(data);
        const selected = new Set(data.filter((p: Photo) => p.isSelected).map((p: Photo) => p.id));
        setSelectedPhotos(selected);
      } catch (err) {
        setPhotos([]); 
      }
  };

  useEffect(() => {
    if (activeEvent?.id) {
        loadPhotos(activeEvent.id);
    } else {
      setPhotos([]);
    }
  }, [activeEvent?.id]);

  const refreshPhotos = async () => {
    if (activeEvent?.id) {
        await loadPhotos(activeEvent.id);
    }
  };

  const login = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error("Login failed");
      const user = normalizeData(await res.json());
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('photoSortUser', JSON.stringify(user));
        setUsers(prev => {
            if (!prev.find(u => u.id === user.id)) return [...prev, user];
            return prev;
        });
      }
    } catch (err: any) {
      alert(`Login failed: ${err.message}`);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveEvent(null);
    setSelectedPhotos(new Set());
    localStorage.removeItem('photoSortUser');
    localStorage.removeItem('photoSortActiveEventId');
  };

  const togglePhotoSelection = async (id: string) => {
    // Check lock status
    if (activeEvent && activeEvent.selectionStatus !== 'open') {
        alert("Selections are currently locked/submitted.");
        return;
    }

    setSelectedPhotos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      await fetch(`${API_URL}/photos/${id}/selection`, { method: 'POST' });
    } catch (e) { console.error(e); }
  };

  const submitSelections = async () => {
    if (!activeEvent) return;
    await updateEventWorkflow(activeEvent.id, 'submitted');
    alert(`Successfully submitted selections for ${activeEvent.name}!`);
  };

  const addEvent = async (eventData: Partial<Event> & { initialClients?: any[] }) => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      const newEvent = normalizeData(await res.json());
      setEvents(prev => [...prev, newEvent]);
      await refreshUsers(); 
    } catch (err) { alert("Failed to create event."); }
  };

  const updateEvent = async (updated: Event) => {
    try {
      const res = await fetch(`${API_URL}/events/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const saved = normalizeData(await res.json());
      setEvents(prev => prev.map(e => e.id === saved.id ? saved : e));
      if (activeEvent?.id === saved.id) setActiveEvent(saved);
    } catch (err) { alert("Failed to update event."); }
  };

  const deleteEvent = async (id: string) => {
    await fetch(`${API_URL}/events/${id}`, { method: 'DELETE' });
    setEvents(prev => prev.filter(e => e.id !== id));
    if (activeEvent?.id === id) setActiveEvent(null);
  };

  const addUser = async (userData: Partial<User>) => {
    const res = await fetch(`${API_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
    const newUser = normalizeData(await res.json());
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (updatedUser: User) => {
    const res = await fetch(`${API_URL}/users/${updatedUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedUser) });
    const saved = normalizeData(await res.json());
    setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
    if (currentUser?.id === saved.id) {
        setCurrentUser(saved);
        localStorage.setItem('photoSortUser', JSON.stringify(saved));
    }
  };

  const deleteUser = async (id: string) => {
    await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addSubEvent = async (eventId: string, subEvent: SubEvent) => {
    try {
        const res = await fetch(`${API_URL}/events/${eventId}/subevents`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(subEvent)
        });
        const updatedEvent = normalizeData(await res.json());
        setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
        if (activeEvent?.id === eventId) setActiveEvent(updatedEvent);
    } catch(e) { console.error(e); }
  };

  const removeSubEvent = (eventId: string, subEventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      updateEvent({ ...event, subEvents: event.subEvents.filter(se => se.id !== subEventId) });
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const res = await fetch(`${API_URL}/users/${userId}/status`, { method: 'PATCH' });
    const data = normalizeData(await res.json());
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: data.isActive } : u));
  };

  const recordPayment = async (eventId: string, amount: number, date?: string) => {
    const res = await fetch(`${API_URL}/events/${eventId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, date })
    });
    const updatedEvent = normalizeData(await res.json());
    setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
    if (activeEvent?.id === eventId) setActiveEvent(updatedEvent);
  };

  const assignUserToEvent = async (eventId: string, userDetails: { name: string, email: string, phone?: string }) => {
    const res = await fetch(`${API_URL}/events/${eventId}/assign-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userDetails)
    });
    const updatedEvent = normalizeData(await res.json());
    setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
    if (activeEvent?.id === eventId) setActiveEvent(updatedEvent);
    await refreshUsers();
  };

  const removeUserFromEvent = async (eventId: string, userId: string) => {
    const res = await fetch(`${API_URL}/events/${eventId}/remove-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const updatedEvent = normalizeData(await res.json());
    setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
    if (activeEvent?.id === eventId) setActiveEvent(updatedEvent);
  };

  const updateEventWorkflow = async (eventId: string, status: SelectionStatus, deliveryEstimate?: string, note?: string) => {
      try {
          const res = await fetch(`${API_URL}/events/${eventId}/workflow`, {
              method: 'PATCH',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ status, deliveryEstimate, note })
          });
          const updatedEvent = normalizeData(await res.json());
          setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
          if (activeEvent?.id === eventId) setActiveEvent(updatedEvent);
      } catch(e) { console.error(e); }
  };

  const uploadEditedPhoto = async (photoId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/photos/${photoId}/edit`, {
          method: 'POST',
          body: formData
      });
      const updatedPhoto = normalizeData(await res.json());
      setPhotos(prev => prev.map(p => p.id === photoId ? updatedPhoto : p));
  };

  const addPhotoComment = async (photoId: string, text: string) => {
      if (!currentUser) return;
      const res = await fetch(`${API_URL}/photos/${photoId}/comment`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ author: currentUser.name, text, role: currentUser.role })
      });
      const updatedPhoto = normalizeData(await res.json());
      setPhotos(prev => prev.map(p => p.id === photoId ? updatedPhoto : p));
  };

  const updatePhotoReviewStatus = async (photoId: string, status: 'approved' | 'changes_requested') => {
      const res = await fetch(`${API_URL}/photos/${photoId}/review-status`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ status })
      });
      const updatedPhoto = normalizeData(await res.json());
      setPhotos(prev => prev.map(p => p.id === photoId ? updatedPhoto : p));
  };

  const resolveComment = async (photoId: string, commentId: string) => {
      const res = await fetch(`${API_URL}/photos/${photoId}/comments/${commentId}/resolve`, {
          method: 'POST'
      });
      const updatedPhoto = normalizeData(await res.json());
      setPhotos(prev => prev.map(p => p.id === photoId ? updatedPhoto : p));
  };

  const approveAllEdits = async (eventId: string) => {
      const res = await fetch(`${API_URL}/events/${eventId}/approve-all`, {
          method: 'POST'
      });
      if(res.ok) {
          await loadPhotos(eventId);
          const updatedEventRes = await fetch(`${API_URL}/events`);
          const rawEventsData = await updatedEventRes.json();
          const eventsData = Array.isArray(rawEventsData) ? rawEventsData.map(normalizeData) : [];
          setEvents(eventsData);
          if (activeEvent) {
              const fresh = eventsData.find(e => e.id === activeEvent.id);
              if (fresh) setActiveEvent(fresh);
          }
      }
  };

  return (
    <DataContext.Provider value={{
      currentUser, users, events, photos, notifications, activeEvent, selectedPhotos, isLoading,
      login, logout, setActiveEvent, togglePhotoSelection, submitSelections,
      addEvent, updateEvent, deleteEvent, addUser, updateUser, deleteUser, addSubEvent, removeSubEvent,
      toggleUserStatus, refreshPhotos, recordPayment, assignUserToEvent, removeUserFromEvent,
      updateEventWorkflow, uploadEditedPhoto, addPhotoComment, updatePhotoReviewStatus, resolveComment, approveAllEdits
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
