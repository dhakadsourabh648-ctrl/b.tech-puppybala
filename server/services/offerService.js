import { Offer } from '../models/Offer.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_OFFERS } from '../seeds/seedData.js';

// In-memory fallback dataset for offline development
let memoryOffers = DEMO_OFFERS.map((off, idx) => ({
  ...off,
  _id: `mem-offer-${idx + 1}`,
  id: `mem-offer-${idx + 1}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

/**
 * Filter active offers that are within their validity dates
 */
const isOfferCurrentlyActive = (offer) => {
  if (!offer.active) return false;
  const now = new Date();

  if (offer.startDate && new Date(offer.startDate) > now) {
    return false;
  }
  if (offer.endDate && new Date(offer.endDate) < now) {
    return false;
  }

  return true;
};

/**
 * Get all active offers for public customer website
 */
export const getActiveOffers = async () => {
  if (isDBConnected()) {
    const now = new Date();
    return await Offer.find({
      active: true,
      $and: [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ],
    }).sort({ createdAt: -1 });
  }

  return memoryOffers.filter(isOfferCurrentlyActive);
};

/**
 * Get all offers for Admin Panel (Active, Inactive, Expired)
 */
export const getAllOffersAdmin = async () => {
  if (isDBConnected()) {
    const dbOffers = await Offer.find().sort({ createdAt: -1 });
    if (dbOffers.length === 0) {
      // Auto seed first offer if empty
      const seeded = await Offer.create(DEMO_OFFERS[0]);
      return [seeded];
    }
    return dbOffers;
  }

  return memoryOffers;
};

/**
 * Get single offer by ID
 */
export const getOfferById = async (id) => {
  if (isDBConnected()) {
    return await Offer.findById(id);
  }
  return memoryOffers.find((o) => o._id === id || o.id === id);
};

/**
 * Create a new offer
 */
export const createOffer = async (offerData) => {
  const payload = {
    title: offerData.title,
    description: offerData.description || offerData.subtitle || '',
    subtitle: offerData.subtitle || offerData.description || '',
    items: offerData.items || [],
    image: offerData.image || '',
    icon: offerData.icon || 'Gift',
    badge: offerData.badge || 'Limited Period Special',
    highlightText: offerData.highlightText || '',
    terms: offerData.terms || '',
    active: offerData.active !== undefined ? Boolean(offerData.active) : true,
    startDate: offerData.startDate ? new Date(offerData.startDate) : new Date(),
    endDate: offerData.endDate ? new Date(offerData.endDate) : null,
  };

  if (isDBConnected()) {
    const newOffer = new Offer(payload);
    return await newOffer.save();
  }

  const memoryRecord = {
    ...payload,
    _id: `mem-offer-${Date.now()}`,
    id: `mem-offer-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryOffers.unshift(memoryRecord);
  return memoryRecord;
};

/**
 * Update an existing offer
 */
export const updateOffer = async (id, updateData) => {
  const payload = { ...updateData };
  if (payload.startDate) payload.startDate = new Date(payload.startDate);
  if (payload.endDate === '' || payload.endDate === null) payload.endDate = null;
  else if (payload.endDate) payload.endDate = new Date(payload.endDate);

  if (isDBConnected()) {
    return await Offer.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
  }

  const index = memoryOffers.findIndex((o) => o._id === id || o.id === id);
  if (index === -1) return null;

  memoryOffers[index] = {
    ...memoryOffers[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  return memoryOffers[index];
};

/**
 * Toggle Active status
 */
export const toggleOfferStatus = async (id, active) => {
  return await updateOffer(id, { active: Boolean(active) });
};

/**
 * Delete an offer
 */
export const deleteOffer = async (id) => {
  if (isDBConnected()) {
    return await Offer.findByIdAndDelete(id);
  }

  const index = memoryOffers.findIndex((o) => o._id === id || o.id === id);
  if (index === -1) return null;

  const deleted = memoryOffers[index];
  memoryOffers.splice(index, 1);
  return deleted;
};
