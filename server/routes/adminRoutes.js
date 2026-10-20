import express from 'express';
import {
  loginAdminHandler,
  getAdminProfileHandler,
  getDashboardStatsHandler,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', loginLimiter, loginAdminHandler);
router.get('/me', protect, getAdminProfileHandler);
router.get('/dashboard', protect, getDashboardStatsHandler);

export default router;
