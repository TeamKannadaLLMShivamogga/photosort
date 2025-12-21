import mongoose from 'mongoose';

const { Schema } = mongoose;

// --- Enums ---
const UserRole = ['ADMIN', 'PHOTOGRAPHER', 'USER'];
const SubscriptionTier = ['FREE', 'PRO', 'STUDIO'];
const EventPlan = ['BASIC', 'STANDARD', 'PRO'];
const EventStatus = ['active', 'completed', 'closed'];

// --- Schemas ---

const FamilyMemberSchema = new Schema({
  id: String,
  name: String,
  relation: String,
  referencePhoto: String
}, { _id: false });

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: UserRole, default: 'USER' },
  avatar: String,
  familyMembers: [FamilyMemberSchema],
  subscriptionTier: { type: String, enum: SubscriptionTier, default: 'FREE' },
  subscriptionExpiry: Date,
  joinDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  // Aggregated fields can be calculated on the fly or stored
  totalEventsCount: { type: Number, default: 0 },
  totalPhotosCount: { type: Number, default: 0 },
  totalUsersCount: { type: Number, default: 0 }
});

// Transform _id to id
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

const SubEventSchema = new Schema({
  id: String,
  name: String,
  date: Date
}, { _id: false });

const EventSchema = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  photographerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coverImage: String,
  photoCount: { type: Number, default: 0 },
  assignedUsers: [{ type: String }], // Array of User IDs (strings for flexibility)
  subEvents: [SubEventSchema],
  status: { type: String, enum: EventStatus, default: 'active' },
  price: Number,
  paidAmount: Number,
  paymentStatus: String,
  deadline: Date,
  optimizationSetting: String,
  clientEmail: String,
  clientPhone: String,
  plan: { type: String, enum: EventPlan, default: 'BASIC' },
  serviceFee: Number
});

EventSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { 
    delete ret._id;
    // Ensure date is ISO string
    if (ret.date) ret.date = ret.date.toISOString();
  }
});

const PhotoSchema = new Schema({
  url: { type: String, required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  tags: [String],
  people: [String],
  isAiPick: { type: Boolean, default: false },
  quality: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  category: String,
  subEventId: String,
  isSelected: { type: Boolean, default: false },
  originalSize: Number,
  optimizedSize: Number,
  isAiProcessed: { type: Boolean, default: false }
});

PhotoSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

export const User = mongoose.model('User', UserSchema);
export const Event = mongoose.model('Event', EventSchema);
export const Photo = mongoose.model('Photo', PhotoSchema);