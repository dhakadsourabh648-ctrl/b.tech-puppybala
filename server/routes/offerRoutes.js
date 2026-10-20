import express from 'express';
import {
  getOffersHandler,
  getAllOffersAdminHandler,
  getOfferByIdHandler,
  createOfferHandler,
  updateOfferHandler,
  toggleOfferStatusHandler,
  deleteOfferHandler,
} from '../controllers/offerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Get all active offers (Within valid dates)
router.get('/', getOffersHandler);

// Protected: Get all offers for Admin Panel (Active, Inactive, Expired)
router.get('/admin', protect, getAllOffersAdminHandler);

// Protected: Create new offer & legacy PUT /
router.post('/', protect, createOfferHandler);
router.put('/', protect, updateOfferHandler);

// Single offer endpoints
router
  .route('/:id')
  .get(getOfferByIdHandler)
  .put(protect, updateOfferHandler)
  .delete(protect, deleteOfferHandler);

// Toggle active/inactive status
router.patch('/:id/status', protect, toggleOfferStatusHandler);

export default router;
