import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Event, Photo, Notification, SubEvent, SubscriptionTier } from '../types';

const API_URL = 'http://localhost:8000/api';

interface DataContextType {
  currentUser: User | null;
  users: User[];
  events: Event[];
  photos: Photo[];
  notifications: Notification[];
  activeEvent: Event | null;
  selectedPhotos: Set<string>;
  login: (email: string) => void;
  logout: () => void;
  setActiveEvent: (event: Event | null) => void;
  togglePhotoSelection: (id: string) => void;
  submitSelections: () => void;
  addEvent: (event: Partial<Event>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  addUser: (user: Partial<User>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addSubEvent: (eventId: string, subEvent: SubEvent) => void;
  removeSubEvent: (eventId: string, subEventId: string) => void;
  toggleUserStatus: (userId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, eventsRes] = await Promise.all([
          fetch(`${API_URL}/users`),
          fetch(`${API_URL}/events`)
        ]);
        const usersData = await usersRes.json();
        const eventsData = await eventsRes.json();
        setUsers(usersData);
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to fetch backend data. Ensure backend is running.", error);
      }
    };
    fetchData();
  }, []);

  // Fetch photos when active event changes
  useEffect(() => {
    if (activeEvent?.id) {
      fetch(`${API_URL}/events/${activeEvent.id}/photos`)
        .then(res => res.json())
        .then((data: Photo[]) => {
          setPhotos(data);
          // Sync selected photos
          const selected = new Set(data.filter((p) => p.isSelected).map((p) => p.id));
          setSelectedPhotos(selected);
        })
        .catch(err => console.error("Failed to load photos", err));
    } else {
      setPhotos([]);
    }
  }, [activeEvent?.id]);

  const login = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const user = await res.json();
      if (user) {
        if (user.isActive === false && user.role === UserRole.PHOTOGRAPHER) {
          alert("Your account has been disabled by the administrator.");
          return;
        }
        setCurrentUser(user);
      }
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveEvent(null);
    setSelectedPhotos(new Set());
  };

  const togglePhotoSelection = async (id: string) => {
    // Optimistic UI update
    setSelectedPhotos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    // Backend call
    await fetch(`${API_URL}/photos/${id}/selection`, { method: 'POST' });
  };

  const submitSelections = async () => {
    if (!activeEvent) return;
    await fetch(`${API_URL}/events/${activeEvent.id}/submit-selections`, { method: 'POST' });
    alert(`Successfully submitted selections for ${activeEvent.name}!`);
    setSelectedPhotos(new Set());
  };

  const addEvent = async (eventData: Partial<Event>) => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      const newEvent = await res.json();
      setEvents(prev => [...prev, newEvent]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateEvent = async (updated: Event) => {
    try {
      const res = await fetch(`${API_URL}/events/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const saved = await res.json();
      setEvents(prev => prev.map(e => e.id === saved.id ? saved : e));
      if (activeEvent?.id === saved.id) setActiveEvent(saved);
    } catch (err) { console.error(err); }
  };

  const deleteEvent = async (id: string) => {
    await fetch(`${API_URL}/events/${id}`, { method: 'DELETE' });
    setEvents(prev => prev.filter(e => e.id !== id));
    if (activeEvent?.id === id) setActiveEvent(null);
  };

  const addUser = async (userData: Partial<User>) => {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const newUser = await res.json();
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (updatedUser: User) => {
    const res = await fetch(`${API_URL}/users/${updatedUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    });
    const saved = await res.json();
    setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
    if (currentUser?.id === saved.id) setCurrentUser(saved);
  };

  const deleteUser = (id: string) => {
    // Implement delete logic if needed in backend
    setUsers(prev => prev.filter(u => u.id !== id));
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
    const res = await fetch(`${API_URL}/users/${userId}/status`, { method: 'PATCH' });
    const data = await res.json();
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: data.isActive } : u));
  };

  return (
    <DataContext.Provider value={{
      currentUser, users, events, photos, notifications, activeEvent, selectedPhotos,
      login, logout, setActiveEvent, togglePhotoSelection, submitSelections,
      addEvent, updateEvent, deleteEvent, addUser, updateUser, deleteUser, addSubEvent, removeSubEvent,
      toggleUserStatus
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