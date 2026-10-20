import express from 'express';
import {
  createInquiryHandler,
  getAllInquiriesHandler,
  getInquiryByIdHandler,
  updateInquiryStatusHandler,
  deleteInquiryHandler,
  resendInquiryWhatsAppHandler,
  getWhatsAppDiagnosticsHandler,
} from '../controllers/inquiryController.js';
import {
  validateInquiryPayload,
  validateInquiryStatus,
} from '../middleware/validateInquiry.js';
import { protect } from '../middleware/authMiddleware.js';
import { inquiryLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// WhatsApp API diagnostics endpoint (Admin)
router.get('/whatsapp/status', protect, getWhatsAppDiagnosticsHandler);

// Public: Customer submits puppy adoption enquiry
// Protected: Admin retrieves, updates status, or deletes enquiries
router
  .route('/')
  .post(inquiryLimiter, validateInquiryPayload, createInquiryHandler)
  .get(protect, getAllInquiriesHandler);

router
  .route('/:id')
  .get(protect, getInquiryByIdHandler)
  .delete(protect, deleteInquiryHandler);

router
  .route('/:id/status')
  .patch(protect, validateInquiryStatus, updateInquiryStatusHandler)
  .put(protect, validateInquiryStatus, updateInquiryStatusHandler);

// Admin: Resend WhatsApp thank-you confirmation
router.post('/:id/resend-whatsapp', protect, resendInquiryWhatsAppHandler);

export default router;
