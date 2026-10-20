import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Puppy } from '../models/Puppy.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_PUPPIES } from '../seeds/seedData.js';

const STORE_PATH = path.join(process.cwd(), 'uploads', 'puppies_store.json');

function loadMemoryPuppies() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => {
          const cleanImages = (p.images || []).filter(
            (img) => typeof img === 'string' && !img.includes('images.unsplash.com/photo-1583511655857') && !img.includes('images.unsplash.com/photo-1601758228')
          );
          const finalImages = cleanImages.length > 0 ? cleanImages : p.images;
          return {
            ...p,
            images: finalImages,
            heroImage: finalImages && finalImages.length > 0 ? finalImages[0] : p.heroImage,
            gallery: finalImages || p.gallery,
          };
        });
      }
    }
  } catch (err) {
    console.warn('[PuppyService] Notice: Could not read local store, using default seed puppies.', err.message);
  }

  const initial = DEMO_PUPPIES.map((pup, idx) => ({
    ...pup,
    _id: `mem-${idx + 1}`,
    id: `mem-${idx + 1}`,
    heroImage: pup.images[0],
    gallery: pup.images,
    status: pup.availability,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  saveMemoryPuppies(initial);
  return initial;
}

function saveMemoryPuppies(puppies) {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(puppies, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[PuppyService] Notice: Could not persist local puppies store.', err.message);
  }
}

// In-memory fallback dataset for seamless local development when MongoDB instance is not yet running
let memoryPuppies = loadMemoryPuppies();

export const getAllPuppies = async (query = {}) => {
  const { breed, gender, availability, search, minPrice, maxPrice, sort } = query;

  if (isDBConnected()) {
    const filter = {};

    if (breed && breed !== 'All' && breed !== 'All Breeds') {
      filter.breed = { $regex: new RegExp(`^${breed.trim()}$`, 'i') };
    }

    if (gender && gender !== 'All') {
      filter.gender = gender;
    }

    if (availability && availability !== 'All') {
      filter.availability = availability;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { temperament: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    return await Puppy.find(filter).sort(sortOption);
  }

  // In-memory fallback if DB is not connected
  let results = loadMemoryPuppies();

  if (breed && breed !== 'All' && breed !== 'All Breeds') {
    const targetBreed = breed.trim().toLowerCase();
    results = results.filter((p) => p.breed && p.breed.toLowerCase() === targetBreed);
  }
  if (gender && gender !== 'All') {
    results = results.filter((p) => p.gender === gender);
  }
  if (availability && availability !== 'All') {
    results = results.filter((p) => p.availability === availability);
  }
  if (minPrice) {
    results = results.filter((p) => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    results = results.filter((p) => p.price <= Number(maxPrice));
  }
  if (search) {
    const s = search.toLowerCase();
    results = results.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(s)) ||
        (p.breed && p.breed.toLowerCase().includes(s)) ||
        (p.description && p.description.toLowerCase().includes(s))
    );
  }

  if (sort === 'price-low') results.sort((a, b) => a.price - b.price);
  if (sort === 'price-high') results.sort((a, b) => b.price - a.price);
  if (sort === 'name') results.sort((a, b) => a.name.localeCompare(b.name));

  return results;
};

export const getPuppyById = async (id) => {
  if (!id) return null;

  if (isDBConnected()) {
    try {
      let pup = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        pup = await Puppy.findById(id);
      }
      if (!pup) {
        pup = await Puppy.findOne({ _id: id });
      }
      if (pup) return pup;
    } catch {
      // ignore cast error, proceed to fallback
    }
  }

  const cleanId = String(id).toLowerCase();
  const currentPuppies = loadMemoryPuppies();
  return (
    currentPuppies.find(
      (p) =>
        String(p._id || '').toLowerCase() === cleanId ||
        String(p.id || '').toLowerCase() === cleanId ||
        String(p.id || '').toLowerCase() === `pb-${cleanId}` ||
        String(p._id || '').toLowerCase() === `mem-${cleanId}`
    ) || null
  );
};

export const createPuppy = async (puppyData) => {
  const cleanData = {
    ...puppyData,
    name: typeof puppyData.name === 'string' ? puppyData.name.trim() : puppyData.name,
    breed: typeof puppyData.breed === 'string' ? puppyData.breed.trim() : puppyData.breed,
  };

  if (isDBConnected()) {
    const puppy = new Puppy(cleanData);
    return await puppy.save();
  }

  const newId = `mem-${Date.now()}`;
  const newPup = {
    ...cleanData,
    _id: newId,
    id: newId,
    heroImage: cleanData.images[0],
    gallery: cleanData.images,
    status: cleanData.availability || 'Available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryPuppies.unshift(newPup);
  saveMemoryPuppies(memoryPuppies);
  return newPup;
};

export const updatePuppy = async (id, updateData) => {
  const cleanData = { ...updateData };
  if (typeof cleanData.name === 'string') cleanData.name = cleanData.name.trim();
  if (typeof cleanData.breed === 'string') cleanData.breed = cleanData.breed.trim();

  if (isDBConnected()) {
    return await Puppy.findByIdAndUpdate(id, cleanData, {
      new: true,
      runValidators: true,
    });
  }

  const index = memoryPuppies.findIndex((p) => p._id === id || p.id === id);
  if (index === -1) return null;

  memoryPuppies[index] = {
    ...memoryPuppies[index],
    ...cleanData,
    heroImage: cleanData.images ? cleanData.images[0] : memoryPuppies[index].heroImage,
    updatedAt: new Date().toISOString(),
  };
  saveMemoryPuppies(memoryPuppies);
  return memoryPuppies[index];
};

export const deletePuppy = async (id) => {
  if (isDBConnected()) {
    return await Puppy.findByIdAndDelete(id);
  }

  const index = memoryPuppies.findIndex((p) => p._id === id || p.id === id);
  if (index === -1) return null;

  const deleted = memoryPuppies[index];
  memoryPuppies.splice(index, 1);
  saveMemoryPuppies(memoryPuppies);
  return deleted;
};

export const updatePuppyAvailability = async (id, availability) => {
  if (isDBConnected()) {
    return await Puppy.findByIdAndUpdate(
      id,
      { availability },
      { new: true, runValidators: true }
    );
  }

  const index = memoryPuppies.findIndex((p) => p._id === id || p.id === id);
  if (index === -1) return null;

  memoryPuppies[index].availability = availability;
  memoryPuppies[index].status = availability;
  memoryPuppies[index].updatedAt = new Date().toISOString();
  saveMemoryPuppies(memoryPuppies);
  return memoryPuppies[index];
};
