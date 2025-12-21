import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Event, Photo, Notification, SubEvent } from '../types';

const API_URL = 'http://localhost:8000/api';

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
  addEvent: (event: Partial<Event>) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addUser: (user: Partial<User>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addSubEvent: (eventId: string, subEvent: SubEvent) => void;
  removeSubEvent: (eventId: string, subEventId: string) => void;
  toggleUserStatus: (userId: string) => Promise<void>;
  refreshPhotos: () => Promise<void>;
  recordPayment: (eventId: string, amount: number, date?: string) => Promise<void>;
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

  // Wrapper to persist active event
  const setActiveEvent = (event: Event | null) => {
    _setActiveEvent(event);
    if (event) {
        localStorage.setItem('photoSortActiveEventId', event.id);
    } else {
        localStorage.removeItem('photoSortActiveEventId');
    }
  };

  // Helper to normalize ID from _id if necessary
  const normalizeData = (item: any) => {
    if (!item) return item;
    return {
      ...item,
      id: item.id || item._id, // Handle both MongoDB _id and API id
    };
  };

  // Initialize and Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // 1. Optimistic Restore of User Session (just to prevent UI flicker, validated later)
      const storedUser = localStorage.getItem('photoSortUser');
      if (storedUser) {
          try { setCurrentUser(JSON.parse(storedUser)); } catch (e) { console.error("Failed to parse stored user", e); }
      }

      try {
        const [usersRes, eventsRes] = await Promise.all([
          fetch(`${API_URL}/users`),
          fetch(`${API_URL}/events`)
        ]);
        
        if (!usersRes.ok) throw new Error(`Users API Error: ${usersRes.statusText}`);
        if (!eventsRes.ok) throw new Error(`Events API Error: ${eventsRes.statusText}`);

        const rawUsersData = await usersRes.json();
        const rawEventsData = await eventsRes.json();
        
        // Normalize Data (Ensure 'id' exists)
        const usersData = Array.isArray(rawUsersData) ? rawUsersData.map(normalizeData) : [];
        const eventsData = Array.isArray(rawEventsData) ? rawEventsData.map(normalizeData) : [];

        console.log(`%c[DB Connected] Loaded ${usersData.length} Users and ${eventsData.length} Events`, 'color: #10B981; font-weight: bold;');
        
        setUsers(usersData);
        setEvents(eventsData);

        // 2. Sync Session with fresh data
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Match by ID or Email
            const freshUser = usersData.find((u: User) => u.id === parsedUser.id || u.email === parsedUser.email);
            if (freshUser) {
                setCurrentUser(freshUser);
                localStorage.setItem('photoSortUser', JSON.stringify(freshUser));
            } else {
                // User from local storage no longer exists in DB
                logout();
            }
        }

        // 3. Restore Active Event
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
        // Do not set mock data. Leave arrays empty so user sees connection error state or empty state.
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
        
        console.log(`%c[DB Connected] Loaded ${data.length} Photos for Event ${eventId}`, 'color: #10B981; font-weight: bold;');
        
        setPhotos(data);
        const selected = new Set(data.filter((p: Photo) => p.isSelected).map((p: Photo) => p.id));
        setSelectedPhotos(selected);
      } catch (err) {
        console.error("Failed to load photos from DB:", err);
        setPhotos([]); // Ensure no stale data
      }
  };

  // Fetch photos when active event changes
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
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }

      const rawUser = await res.json();
      const user = normalizeData(rawUser);

      if (user) {
        if (user.isActive === false && user.role === UserRole.PHOTOGRAPHER) {
          alert("Your account has been disabled by the administrator.");
          return;
        }
        setCurrentUser(user);
        localStorage.setItem('photoSortUser', JSON.stringify(user));
        
        // Add to users list if not present
        setUsers(prev => {
            if (!prev.find(u => u.id === user.id)) return [...prev, user];
            return prev;
        });
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      alert(`Login failed: ${err.message || "Could not connect to server"}`);
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
    // Optimistic UI update
    setSelectedPhotos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      await fetch(`${API_URL}/photos/${id}/selection`, { method: 'POST' });
    } catch (e) {
      console.error("Failed to sync selection with backend", e);
      // We don't revert optimistic update here to keep UI snappy, but in a real app you might want to show a toast
    }
  };

  const submitSelections = async () => {
    if (!activeEvent) return;
    try {
        const res = await fetch(`${API_URL}/events/${activeEvent.id}/submit-selections`, { method: 'POST' });
        if (!res.ok) throw new Error("Failed to submit");
        alert(`Successfully submitted selections for ${activeEvent.name}!`);
        setSelectedPhotos(new Set());
    } catch (e) {
        console.error("Submission failed", e);
        alert("Failed to submit selections. Please check your connection.");
    }
  };

  const addEvent = async (eventData: Partial<Event>) => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      if (!res.ok) throw new Error("Failed to add event");
      const newEvent = normalizeData(await res.json());
      setEvents(prev => [...prev, newEvent]);
    } catch (err) {
      console.error("Add Event Failed:", err);
      alert("Failed to create event. Server may be unreachable.");
    }
  };

  const updateEvent = async (updated: Event) => {
    try {
      const res = await fetch(`${API_URL}/events/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error("Failed to update event");
      const saved = normalizeData(await res.json());
      setEvents(prev => prev.map(e => e.id === saved.id ? saved : e));
      if (activeEvent?.id === saved.id) setActiveEvent(saved);
    } catch (err) { 
        console.error("Update Event Failed:", err);
        alert("Failed to update event details.");
    }
  };

  const deleteEvent = async (id: string) => {
    try {
        const res = await fetch(`${API_URL}/events/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Failed to delete");
        
        setEvents(prev => prev.filter(e => e.id !== id));
        if (activeEvent?.id === id) setActiveEvent(null);
    } catch (e) { 
        console.error("Delete Event Failed:", e);
        alert("Failed to delete event.");
    }
  };

  const addUser = async (userData: Partial<User>) => {
    try {
        const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
        });
        if(!res.ok) throw new Error("Failed");
        const newUser = normalizeData(await res.json());
        setUsers(prev => [...prev, newUser]);
    } catch (e) {
        console.error("Add User Failed:", e);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
        const res = await fetch(`${API_URL}/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
        });
        if(!res.ok) throw new Error("Failed");
        const saved = normalizeData(await res.json());
        setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
        if (currentUser?.id === saved.id) {
            setCurrentUser(saved);
            localStorage.setItem('photoSortUser', JSON.stringify(saved));
        }
    } catch(e) {
        console.error("Update User Failed:", e);
        alert("Failed to update user profile.");
    }
  };

  const deleteUser = async (id: string) => {
    try {
        await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
        setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) { 
        console.error("Delete User Failed:", e); 
    }
  };

  const addSubEvent = (eventId: string, subEvent: SubEvent) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      updateEvent({ ...event, subEvents: [...event.subEvents, subEvent] });
    }
  };

  const removeSubEvent = (eventId: string, subEventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      updateEvent({ ...event, subEvents: event.subEvents.filter(se => se.id !== subEventId) });
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
        const res = await fetch(`${API_URL}/users/${userId}/status`, { method: 'PATCH' });
        if(!res.ok) throw new Error("Failed");
        const data = normalizeData(await res.json());
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: data.isActive } : u));
    } catch (e) {
        console.error("Toggle Status Failed:", e);
    }
  };

  const recordPayment = async (eventId: string, amount: number, date?: string) => {
    try {
        const res = await fetch(`${API_URL}/events/${eventId}/payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, date })
        });
        if (!res.ok) throw new Error("Payment record failed");
        const updatedEvent = normalizeData(await res.json());
        setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
        if (activeEvent?.id === eventId) setActiveEvent(updatedEvent);
    } catch (e) {
        console.error("Record Payment Failed:", e);
        alert("Failed to record payment.");
    }
  };

  return (
    <DataContext.Provider value={{
      currentUser, users, events, photos, notifications, activeEvent, selectedPhotos, isLoading,
      login, logout, setActiveEvent, togglePhotoSelection, submitSelections,
      addEvent, updateEvent, deleteEvent, addUser, updateUser, deleteUser, addSubEvent, removeSubEvent,
      toggleUserStatus, refreshPhotos, recordPayment
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
