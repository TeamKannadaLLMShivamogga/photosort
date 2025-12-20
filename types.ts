
export enum UserRole {
  ADMIN = 'ADMIN',
  PHOTOGRAPHER = 'PHOTOGRAPHER',
  USER = 'USER'
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  STUDIO = 'STUDIO'
}

export type OptimizationType = 'none' | 'balanced' | 'performance' | 'high-quality';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  referencePhoto?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  familyMembers?: FamilyMember[];
  // Subscription Management Fields
  subscriptionTier?: SubscriptionTier;
  subscriptionExpiry?: string;
  joinDate?: string;
  isActive?: boolean;
  totalEventsCount?: number;
  totalPhotosCount?: number;
  totalUsersCount?: number;
}

export interface Photo {
  id: string;
  url: string;
  eventId: string;
  tags: string[];
  people: string[];
  isAiPick: boolean;
  quality: 'high' | 'medium' | 'low';
  category: string;
  subEventId?: string;
  isSelected?: boolean;
  originalSize?: number;
  optimizedSize?: number;
}

export interface SubEvent {
  id: string;
  name: string;
  date: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  photographerId: string;
  coverImage: string;
  photoCount: number;
  assignedUsers: string[];
  subEvents: SubEvent[];
  status: 'active' | 'completed' | 'closed';
  price?: number;
  paidAmount?: number;
  paymentStatus?: 'pending' | 'partial' | 'paid';
  deadline?: string;
  optimizationSetting?: OptimizationType;
  clientEmail?: string;
  clientPhone?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}
