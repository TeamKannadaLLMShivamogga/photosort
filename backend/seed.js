import { User, Event, Photo } from './models.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already seeded.');
      return;
    }

    console.log('Seeding database...');

    // 1. Create Users
    const admin = await User.create({
      name: "Admin User",
      email: "admin@photosort.com",
      role: "ADMIN",
      avatar: "https://ui-avatars.com/api/?name=Admin&background=000&color=fff",
      isActive: true
    });

    const photographer = await User.create({
      name: "John Doe Studio",
      email: "photographer@photosort.com",
      role: "PHOTOGRAPHER",
      avatar: "https://ui-avatars.com/api/?name=John+Doe&background=10B981&color=fff",
      subscriptionTier: "PRO",
      subscriptionExpiry: new Date("2025-12-31"),
      totalEventsCount: 1,
      totalPhotosCount: 12,
      totalUsersCount: 1,
      isActive: true
    });

    const client = await User.create({
      name: "Rohan & Priya",
      email: "user@photosort.com",
      role: "USER",
      avatar: "https://ui-avatars.com/api/?name=Rohan+Priya&background=random",
      isActive: true
    });

    // 2. Create Event
    const eventDate = new Date();
    const event = await Event.create({
      name: "Rohan Weds Priya - The Royal Wedding",
      date: eventDate,
      photographerId: photographer._id,
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
      photoCount: 12,
      assignedUsers: [client._id.toString()],
      status: 'active',
      price: 150000,
      paidAmount: 75000,
      paymentStatus: 'partial',
      plan: 'PRO',
      subEvents: [
        { id: "se-1", name: "Haldi", date: new Date(eventDate.getTime() - 86400000) },
        { id: "se-2", name: "Wedding", date: eventDate },
        { id: "se-3", name: "Reception", date: new Date(eventDate.getTime() + 86400000) }
      ]
    });

    // 3. Create Photos
    const photoUrls = [
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
    ];

    const photos = photoUrls.map((url, index) => ({
      url,
      eventId: event._id,
      tags: index % 2 === 0 ? ["wedding", "happy"] : ["candid", "ceremony"],
      people: index % 3 === 0 ? ["Rohan"] : ["Priya"],
      isAiPick: index % 4 === 0,
      quality: 'high',
      category: index % 2 === 0 ? "Wedding" : "Haldi",
      isSelected: false
    }));

    await Photo.insertMany(photos);

    console.log("Database seeded successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
