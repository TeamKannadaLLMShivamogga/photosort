
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

export enum EventPlan {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PRO = 'PRO'
}

export type OptimizationType = 'none' | 'balanced' | 'performance' | 'high-quality';
export type SelectionStatus = 'open' | 'submitted' | 'editing' | 'review' | 'accepted';
export type PhotoReviewStatus = 'pending' | 'approved' | 'changes_requested';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  referencePhoto?: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
  role: UserRole;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  familyMembers?: FamilyMember[];
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
  editedUrl?: string; // For the edited version
  eventId: string;
  subEventId?: string;
  tags: string[];
  people: string[];
  isAiPick: boolean;
  quality: 'high' | 'medium' | 'low';
  category: string;
  isSelected?: boolean;
  originalSize?: number;
  optimizedSize?: number;
  reviewStatus?: PhotoReviewStatus;
  comments?: Comment[];
}

export interface SubEvent {
  id: string;
  name: string;
  date: string; // Used as display date or start date
  endDate?: string;
}

export interface EventTimeline {
  selectionDeadline?: string;
  selectionSubmittedAt?: string;
  editingStartedAt?: string;
  deliveryEstimate?: string;
  reviewStartedAt?: string;
  finalizedAt?: string;
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
  selectionStatus: SelectionStatus; // Workflow State
  timeline?: EventTimeline;
  price?: number;
  paidAmount?: number;
  paymentStatus?: 'pending' | 'partial' | 'paid';
  deadline?: string;
  optimizationSetting?: OptimizationType;
  clientEmail?: string;
  clientPhone?: string;
  plan?: EventPlan;
  serviceFee?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}
