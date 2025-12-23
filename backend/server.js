
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { User, Event, Photo } from './models.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
// Updated Port to 8010
const PORT = process.env.PORT || 8010;
// Updated AI Service Port to 8011
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8011';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for bulk data

// Database Connection
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/photosort')
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedDatabase();
  })
  .catch((err) => {
      console.error('MongoDB connection error. Server will start but API routes may fail if DB is required.');
      console.error(err.message);
  });

// Root Route
app.get('/', (req, res) => {
  res.send('PhotoSort Backend is Running');
});

// --- API Routes ---

const router = express.Router();

// Auth
router.post('/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: email.split('@')[0],
        role: 'USER',
        avatar: `https://ui-avatars.com/api/?name=${email}&background=random`
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    // Optional: Cleanup events/photos owned by this user if necessary
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/events', async (req, res) => {
  try {
    const event = await Event.create(req.body);
    if (!event.subEvents || event.subEvents.length === 0) {
        event.subEvents = [
            { id: `se-${Date.now()}-1`, name: "Main Event", date: event.date }
        ];
        await event.save();
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    await Photo.deleteMany({ eventId: req.params.id });
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Event Photos
router.get('/events/:id/photos', async (req, res) => {
  try {
    const photos = await Photo.find({ eventId: req.params.id });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/events/:id/photos', async (req, res) => {
  try {
    const { photos } = req.body; // Expects array of photo objects
    const eventId = req.params.id;
    
    if (!Array.isArray(photos)) {
        return res.status(400).json({ error: "Expected an array of photos" });
    }

    // Add eventId to all photos and set isAiProcessed to false
    const photosWithEvent = photos.map(p => ({ 
      ...p, 
      eventId,
      isAiProcessed: false // Ensure AI service picks this up
    }));
    
    const created = await Photo.insertMany(photosWithEvent);
    
    // Update event photo count
    const count = await Photo.countDocuments({ eventId });
    await Event.findByIdAndUpdate(eventId, { photoCount: count });
    
    // Trigger Python AI Service (Fire and forget)
    // In production, use a message queue like RabbitMQ or Redis
    fetch(`${AI_SERVICE_URL}/process-event/${eventId}`, {
      method: 'POST'
    }).catch(err => console.error("Failed to trigger AI service:", err.message));

    res.json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/events/:id/submit-selections', async (req, res) => {
  try {
    // In a real app, this would trigger emails or update workflow status
    res.json({ message: "Selections submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Photos
router.post('/photos/:id/selection', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: "Photo not found" });
    
    photo.isSelected = !photo.isSelected;
    await photo.save();
    res.json(photo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mount router under /api
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Node.js Backend running on http://localhost:${PORT}`);
});
