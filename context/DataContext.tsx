import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Event, Photo, Notification, SubEvent, SubscriptionTier } from '../types';

const API_URL = 'http://localhost:8000/api';

// --- MOCK DATA FOR OFFLINE FALLBACK ---
const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Admin User",
    email: "admin@photosort.com",
    role: UserRole.ADMIN,
    avatar: "https://ui-avatars.com/api/?name=Admin&background=000&color=fff",
    isActive: true
  },
  {
    id: "u2",
    name: "John Doe Studio",
    email: "photographer@photosort.com",
    role: UserRole.PHOTOGRAPHER,
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=10B981&color=fff",
    subscriptionTier: SubscriptionTier.PRO,
    subscriptionExpiry: "2025-12-31",
    totalEventsCount: 1,
    totalPhotosCount: 12,
    totalUsersCount: 1,
    isActive: true
  },
  {
    id: "u3",
    name: "Rohan & Priya",
    email: "user@photosort.com",
    role: UserRole.USER,
    avatar: "https://ui-avatars.com/api/?name=Rohan+Priya&background=random",
    isActive: true
  }
];

const MOCK_EVENTS: Event[] = [
  {
    id: "e1",
    name: "Rohan Weds Priya - The Royal Wedding",
    date: new Date().toISOString(),
    photographerId: "u2",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
    photoCount: 12,
    assignedUsers: ["u3"],
    status: 'active',
    price: 150000,
    paidAmount: 75000,
    paymentStatus: 'partial',
    plan: 'PRO' as any,
    subEvents: [
      { id: "se-1", name: "Haldi", date: new Date(Date.now() - 86400000).toISOString() },
      { id: "se-2", name: "Wedding", date: new Date().toISOString() },
      { id: "se-3", name: "Reception", date: new Date(Date.now() + 86400000).toISOString() }
    ]
  }
];

const MOCK_PHOTOS: Photo[] = [
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070",
  "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=2070",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070",
  "https://images.unsplash.com/photo-1520854221256-17451cc330e7?q=80&w=2070",
  "https://images.unsplash.com/photo-1621621667797-e06afc217fb0?q=80&w=2070",
  "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=2070",
  "https://images.unsplash.com/photo-1522673607200-1645062cd958?q=80&w=2070",
  "https://images.unsplash.com/photo-1529636721647-781d6605c91c?q=80&w=2070",
  "https://images.unsplash.com/photo-1507915977619-6cc164e394b9?q=80&w=2070",
  "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=2070",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=2070",
  "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070"
].map((url, index) => ({
  id: `p-${index}`,
  url,
  eventId: "e1",
  tags: index % 2 === 0 ? ["wedding", "happy"] : ["candid", "ceremony"],
  people: index % 3 === 0 ? ["Rohan"] : ["Priya"],
  isAiPick: index % 4 === 0,
  quality: 'high',
  category: index % 2 === 0 ? "Wedding" : "Haldi",
  isSelected: false
}));

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
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  // Initialize and Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, eventsRes] = await Promise.all([
          fetch(`${API_URL}/users`),
          fetch(`${API_URL}/events`)
        ]);
        
        if (!usersRes.ok || !eventsRes.ok) throw new Error("Backend unavailable");

        const usersData = await usersRes.json();
        const eventsData = await eventsRes.json();
        setUsers(usersData);
        setEvents(eventsData);

        // Restore Session if available
        const storedUser = localStorage.getItem('photoSortUser');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Verify if user still exists in the fetched data (optional but safer)
            const freshUser = usersData.find((u: User) => u.email === parsedUser.email);
            if (freshUser) {
                setCurrentUser(freshUser);
            }
        }

      } catch (error) {
        console.warn("Failed to fetch backend data. Switching to OFFLINE MODE.", error);
        // Fallback to mock data
        setUsers(MOCK_USERS);
        setEvents(MOCK_EVENTS);
      }
    };
    fetchData();
  }, []);

  const loadPhotos = async (eventId: string) => {
      try {
        const res = await fetch(`${API_URL}/events/${eventId}/photos`);
        if (!res.ok) throw new Error("Backend unavailable");
        const data = await res.json() as Photo[]; // Explicit casting
        setPhotos(data);
        const selected = new Set(data.filter((p) => p.isSelected).map((p) => p.id));
        setSelectedPhotos(selected);
      } catch (err) {
        console.warn("Failed to load photos. Using offline photos if matching ID found.", err);
        // Only fallback to mock if the Event ID matches the Mock Event ID to avoid confusing data
        if (eventId === "e1") {
            const mockPhotos = MOCK_PHOTOS.filter(p => p.eventId === eventId);
            setPhotos(mockPhotos);
            const selected = new Set(mockPhotos.filter((p) => p.isSelected).map((p) => p.id));
            setSelectedPhotos(selected);
        } else {
            setPhotos([]); // Clear photos if backend fails and it's a real event
        }
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
      if (!res.ok) throw new Error("Login failed");
      const user = await res.json();
      if (user) {
        if (user.isActive === false && user.role === UserRole.PHOTOGRAPHER) {
          alert("Your account has been disabled by the administrator.");
          return;
        }
        setCurrentUser(user);
        localStorage.setItem('photoSortUser', JSON.stringify(user));
      }
    } catch (err) {
      console.warn("Backend Login failed. Trying offline login.", err);
      const user = users.find(u => u.email === email);
      if (user) {
        if (user.isActive === false && user.role === UserRole.PHOTOGRAPHER) {
            alert("Your account has been disabled by the administrator.");
            return;
        }
        setCurrentUser(user);
        localStorage.setItem('photoSortUser', JSON.stringify(user));
      } else {
          // Create dummy user for offline mode
          const newUser: User = {
              id: `u-${Date.now()}`,
              email,
              name: email.split('@')[0],
              role: UserRole.USER,
              avatar: `https://ui-avatars.com/api/?name=${email}&background=random`
          };
          setCurrentUser(newUser);
          setUsers(prev => [...prev, newUser]);
          localStorage.setItem('photoSortUser', JSON.stringify(newUser));
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveEvent(null);
    setSelectedPhotos(new Set());
    localStorage.removeItem('photoSortUser');
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
      console.warn("Backend unavailable, selection saved locally.");
    }
  };

  const submitSelections = async () => {
    if (!activeEvent) return;
    try {
        await fetch(`${API_URL}/events/${activeEvent.id}/submit-selections`, { method: 'POST' });
    } catch (e) {
        console.warn("Backend unavailable, selections considered submitted locally.");
    }
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
      if (!res.ok) throw new Error("Failed to add event");
      const newEvent = await res.json();
      setEvents(prev => [...prev, newEvent]);
    } catch (err) {
      console.warn("Backend unavailable. Adding event locally.");
      const newEvent: Event = {
          ...eventData,
          id: `e-${Date.now()}`,
          photoCount: 0,
          assignedUsers: [],
          subEvents: eventData.subEvents || [{ id: `se-${Date.now()}`, name: "Main Event", date: eventData.date || new Date().toISOString() }],
          status: 'active'
      } as Event;
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const updateEvent = async (updated: Event) => {
    try {
      const res = await fetch(`${API_URL}/events/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error("Failed");
      const saved = await res.json();
      setEvents(prev => prev.map(e => e.id === saved.id ? saved : e));
      if (activeEvent?.id === saved.id) setActiveEvent(saved);
    } catch (err) { 
        console.warn("Backend unavailable. Updating event locally.");
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
        if (activeEvent?.id === updated.id) setActiveEvent(updated);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
        await fetch(`${API_URL}/events/${id}`, { method: 'DELETE' });
    } catch (e) { console.warn("Backend unavailable. Deleting locally."); }
    
    setEvents(prev => prev.filter(e => e.id !== id));
    if (activeEvent?.id === id) setActiveEvent(null);
  };

  const addUser = async (userData: Partial<User>) => {
    try {
        const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
        });
        if(!res.ok) throw new Error("Failed");
        const newUser = await res.json();
        setUsers(prev => [...prev, newUser]);
    } catch (e) {
        console.warn("Backend unavailable. Adding user locally.");
        const newUser = { ...userData, id: `u-${Date.now()}`, isActive: true } as User;
        setUsers(prev => [...prev, newUser]);
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
        const saved = await res.json();
        setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
        if (currentUser?.id === saved.id) {
            setCurrentUser(saved);
            localStorage.setItem('photoSortUser', JSON.stringify(saved));
        }
    } catch(e) {
        console.warn("Backend unavailable. Updating user locally.");
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (currentUser?.id === updatedUser.id) {
            setCurrentUser(updatedUser);
            localStorage.setItem('photoSortUser', JSON.stringify(updatedUser));
        }
    }
  };

  const deleteUser = async (id: string) => {
    try {
        await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
    } catch (e) { console.warn("Backend unavailable. Deleting user locally."); }
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
    try {
        const res = await fetch(`${API_URL}/users/${userId}/status`, { method: 'PATCH' });
        if(!res.ok) throw new Error("Failed");
        const data = await res.json();
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: data.isActive } : u));
    } catch (e) {
        console.warn("Backend unavailable. Toggling status locally.");
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
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
        const updatedEvent = await res.json();
        setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
        if (activeEvent?.id === eventId) setActiveEvent(updatedEvent);
    } catch (e) {
        console.warn("Backend unavailable. Updating payment locally.", e);
        const event = events.find(e => e.id === eventId);
        if (event) {
            const newPaid = (event.paidAmount || 0) + amount;
            const updated: Event = { 
                ...event, 
                paidAmount: newPaid, 
                paymentStatus: newPaid >= (event.price || 0) ? 'paid' : 'partial' 
            };
            setEvents(prev => prev.map(e => e.id === eventId ? updated : e));
            if (activeEvent?.id === eventId) setActiveEvent(updated);
        }
    }
  };

  return (
    <DataContext.Provider value={{
      currentUser, users, events, photos, notifications, activeEvent, selectedPhotos,
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
