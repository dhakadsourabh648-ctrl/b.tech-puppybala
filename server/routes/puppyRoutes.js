import express from 'express';
import {
  getAllPuppiesHandler,
  getPuppyByIdHandler,
  createPuppyHandler,
  updatePuppyHandler,
  deletePuppyHandler,
  updateAvailabilityHandler,
} from '../controllers/puppyController.js';
import {
  validatePuppyPayload,
  validateAvailabilityPayload,
} from '../middleware/validateMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Browse all puppies or single puppy
// Protected: Create, Update, Delete, Toggle Availability (Admin only)
router
  .route('/')
  .get(getAllPuppiesHandler)
  .post(protect, validatePuppyPayload, createPuppyHandler);

router
  .route('/:id')
  .get(getPuppyByIdHandler)
  .put(protect, validatePuppyPayload, updatePuppyHandler)
  .delete(protect, deletePuppyHandler);

router
  .route('/:id/availability')
  .patch(protect, validateAvailabilityPayload, updateAvailabilityHandler);

export default router;
