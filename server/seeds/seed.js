import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Puppy } from '../models/Puppy.js';
import { Admin } from '../models/Admin.js';
import { Offer } from '../models/Offer.js';
import { DEMO_PUPPIES, DEMO_ADMIN, DEMO_OFFER } from './seedData.js';

export const seedDatabase = async () => {
  console.log('[Seeder] Starting database seeding...');
  
  // 1. Seed Puppies
  const existingPuppyCount = await Puppy.countDocuments();
  if (existingPuppyCount === 0) {
    await Puppy.insertMany(DEMO_PUPPIES);
    console.log(`[Seeder] Successfully seeded ${DEMO_PUPPIES.length} demo puppies into MongoDB.`);
  } else {
    console.log(`[Seeder] Puppies collection already has ${existingPuppyCount} records. Skipping puppy seed.`);
  }

  // 2. Seed Admin
  const existingAdmin = await Admin.findOne({ email: DEMO_ADMIN.email });
  if (!existingAdmin) {
    const admin = new Admin(DEMO_ADMIN);
    await admin.save();
    console.log(`[Seeder] Initial admin user created: ${DEMO_ADMIN.email}`);
  } else {
    console.log(`[Seeder] Admin user already exists: ${existingAdmin.email}`);
  }

  // 3. Seed Offers
  const existingOfferCount = await Offer.countDocuments();
  if (existingOfferCount === 0) {
    await Offer.create(DEMO_OFFER);
    console.log('[Seeder] Dynamic Welcome Kit offer seeded.');
  }

  console.log('[Seeder] Database seeding finished.');
};

// If run directly via `npm run seed`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  (async () => {
    try {
      const conn = await connectDB();
      if (!conn) {
        console.error('[Seeder] Could not connect to database. Aborting seed.');
        process.exit(1);
      }
      
      // If --force flag is passed, clear existing
      if (process.argv.includes('--force')) {
        console.log('[Seeder] Force flag detected. Dropping old puppy and offer data...');
        await Puppy.deleteMany({});
        await Offer.deleteMany({});
      }

      await seedDatabase();
      console.log('[Seeder] Completed successfully.');
      process.exit(0);
    } catch (err) {
      console.error('[Seeder] Error during seed:', err);
      process.exit(1);
    }
  })();
}
