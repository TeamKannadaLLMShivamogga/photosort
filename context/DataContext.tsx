
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Event, Photo, Notification, SubEvent, SubscriptionTier } from '../types';

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

  useEffect(() => {
    const mockUsers: User[] = [
      { id: 'a1', email: 'admin@photosort.com', name: 'System Admin', role: UserRole.ADMIN, isActive: true },
      { 
        id: 'p1', 
        email: 'photographer@photosort.com', 
        name: 'John Doe Photography', 
        role: UserRole.PHOTOGRAPHER, 
        isActive: true,
        subscriptionTier: SubscriptionTier.PRO,
        subscriptionExpiry: '2025-12-31',
        joinDate: '2023-01-15',
        totalEventsCount: 42,
        totalPhotosCount: 15400,
        totalUsersCount: 120
      },
      { 
        id: 'p2', 
        email: 'studio@lens.com', 
        name: 'Creative Lens Studio', 
        role: UserRole.PHOTOGRAPHER, 
        isActive: false,
        subscriptionTier: SubscriptionTier.STUDIO,
        subscriptionExpiry: '2024-05-20',
        joinDate: '2023-06-10',
        totalEventsCount: 89,
        totalPhotosCount: 45000,
        totalUsersCount: 340
      },
      { id: 'u1', email: 'user@photosort.com', name: 'Rohan Sharma', role: UserRole.USER, isActive: true },
      { id: 'u2', email: 'priya@example.com', name: 'Priya Kapoor', role: UserRole.USER, isActive: true },
    ];

    const mockEvents: Event[] = [
      {
        id: 'e1',
        name: 'Sharma & Kapoor Wedding',
        date: '2024-05-15',
        photographerId: 'p1',
        coverImage: 'https://picsum.photos/seed/wedding1/800/400',
        photoCount: 1250,
        assignedUsers: ['u1', 'u2'],
        status: 'active',
        subEvents: [
          { id: 'se1', name: 'Mehendi', date: '2024-05-13' },
          { id: 'se2', name: 'Sangeet', date: '2024-05-14' },
          { id: 'se3', name: 'Wedding Ceremony', date: '2024-05-15' }
        ],
        price: 250000,
        paidAmount: 150000,
        paymentStatus: 'partial',
        deadline: '2024-06-01',
        optimizationSetting: 'balanced'
      },
      {
        id: 'e2',
        name: 'Aaryan Birthday Bash',
        date: '2024-06-10',
        photographerId: 'p1',
        coverImage: 'https://picsum.photos/seed/birthday/800/400',
        photoCount: 450,
        assignedUsers: ['u1'],
        status: 'active',
        subEvents: [{ id: 'se4', name: 'Main Party', date: '2024-06-10' }],
        price: 75000,
        paidAmount: 75000,
        paymentStatus: 'paid'
      }
    ];

    const mockPhotos: Photo[] = Array.from({ length: 100 }).map((_, i) => ({
      id: `ph${i}`,
      url: `https://picsum.photos/seed/photo${i}/600/600`,
      eventId: i < 70 ? 'e1' : 'e2',
      tags: i % 3 === 0 ? ['Ceremony', 'Portraits'] : ['Candid', 'Family'],
      people: i % 4 === 0 ? ['Emma', 'James'] : i % 2 === 0 ? ['Sarah'] : ['John', 'Priya'],
      isAiPick: i % 10 === 0,
      quality: i % 5 === 0 ? 'high' : i % 3 === 0 ? 'medium' : 'low',
      category: i % 3 === 0 ? 'Decoration' : i % 2 === 0 ? 'Guests' : 'Action',
      subEventId: i < 20 ? 'se1' : i < 40 ? 'se2' : i < 70 ? 'se3' : 'se4'
    }));

    setUsers(mockUsers);
    setEvents(mockEvents);
    setPhotos(mockPhotos);
  }, []);

  const login = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      if (user.isActive === false && user.role === UserRole.PHOTOGRAPHER) {
        alert("Your account has been disabled by the administrator. Please contact support.");
        return;
      }
      setCurrentUser(user);
    } else {
      const newUser: User = { 
        id: Date.now().toString(), 
        email, 
        name: email.split('@')[0], 
        role: UserRole.USER, 
        isActive: true,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveEvent(null);
    setSelectedPhotos(new Set());
  };

  const togglePhotoSelection = (id: string) => {
    setSelectedPhotos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitSelections = () => {
    if (selectedPhotos.size === 0) return;
    alert(`Successfully submitted ${selectedPhotos.size} photos for editing!`);
    setSelectedPhotos(new Set());
  };

  const addEvent = (eventData: Partial<Event>) => {
    const newEvent: Event = {
      id: `e${Date.now()}`,
      name: eventData.name || 'Untitled Event',
      date: eventData.date || new Date().toISOString(),
      photographerId: currentUser?.id || 'p1',
      coverImage: eventData.coverImage || 'https://picsum.photos/seed/new/800/400',
      photoCount: 0,
      assignedUsers: [],
      subEvents: [],
      status: 'active',
      price: eventData.price || 0,
      paidAmount: 0,
      paymentStatus: 'pending',
      optimizationSetting: 'balanced',
      ...eventData
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (updated: Event) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    if (activeEvent?.id === updated.id) setActiveEvent(updated);
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    if (activeEvent?.id === id) setActiveEvent(null);
  };

  const addUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: `u${Date.now()}`,
      email: userData.email || '',
      name: userData.name || '',
      role: userData.role || UserRole.USER,
      isActive: true,
      joinDate: new Date().toISOString().split('T')[0],
      ...userData
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

  const addSubEvent = (eventId: string, subEvent: SubEvent) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, subEvents: [...e.subEvents, subEvent] } : e));
  };

  const removeSubEvent = (eventId: string, subEventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, subEvents: e.subEvents.filter(se => se.id !== subEventId) } : e));
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
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
